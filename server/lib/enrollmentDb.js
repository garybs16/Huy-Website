import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { cohorts as cohortSeeds } from "../constants/cohorts.js";
import { programs } from "../constants/programs.js";

function nowIso() {
  return new Date().toISOString();
}

function toIsoOrNull(value) {
  return value ? new Date(value).toISOString() : null;
}

function normalizeBoolean(value) {
  return value ? 1 : 0;
}

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export class EnrollmentDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new Database(filePath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.migrate();
    this.seedCohorts();
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cohorts (
        id TEXT PRIMARY KEY,
        program_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        schedule_label TEXT NOT NULL,
        meeting_pattern TEXT NOT NULL,
        tuition_cents INTEGER NOT NULL,
        capacity INTEGER NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS enrollments (
        id TEXT PRIMARY KEY,
        student_full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        date_of_birth TEXT NOT NULL,
        address_line1 TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        emergency_contact_name TEXT NOT NULL,
        emergency_contact_phone TEXT NOT NULL,
        program_id TEXT NOT NULL,
        cohort_id TEXT NOT NULL,
        notes TEXT,
        status TEXT NOT NULL,
        payment_status TEXT NOT NULL,
        payment_amount_cents INTEGER NOT NULL,
        stripe_checkout_session_id TEXT,
        seat_hold_expires_at TEXT,
        paid_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (cohort_id) REFERENCES cohorts(id)
      );

      CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id ON enrollments(cohort_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
      CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
    `);
  }

  seedCohorts() {
    const insert = this.db.prepare(`
      INSERT INTO cohorts (
        id,
        program_id,
        title,
        start_date,
        end_date,
        schedule_label,
        meeting_pattern,
        tuition_cents,
        capacity,
        is_active,
        sort_order,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @programId,
        @title,
        @startDate,
        @endDate,
        @scheduleLabel,
        @meetingPattern,
        @tuitionCents,
        @capacity,
        @isActive,
        @sortOrder,
        @createdAt,
        @updatedAt
      )
      ON CONFLICT(id) DO UPDATE SET
        program_id = excluded.program_id,
        title = excluded.title,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        schedule_label = excluded.schedule_label,
        meeting_pattern = excluded.meeting_pattern,
        tuition_cents = excluded.tuition_cents,
        capacity = excluded.capacity,
        is_active = excluded.is_active,
        sort_order = excluded.sort_order,
        updated_at = excluded.updated_at
    `);
    const timestamp = nowIso();

    const transaction = this.db.transaction(() => {
      for (const cohort of cohortSeeds) {
        insert.run({
          ...cohort,
          isActive: normalizeBoolean(cohort.isActive),
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    });

    transaction();
  }

  getCohortById(id) {
    return this.db
      .prepare(`
        SELECT
          c.id,
          c.program_id AS programId,
          c.title,
          c.start_date AS startDate,
          c.end_date AS endDate,
          c.schedule_label AS scheduleLabel,
          c.meeting_pattern AS meetingPattern,
          c.tuition_cents AS tuitionCents,
          c.capacity,
          c.is_active AS isActive,
          c.sort_order AS sortOrder
        FROM cohorts c
        WHERE c.id = ?
      `)
      .get(id);
  }

  listActiveCohorts() {
    const now = nowIso();
    const rows = this.db
      .prepare(`
        SELECT
          c.id,
          c.program_id AS programId,
          c.title,
          c.start_date AS startDate,
          c.end_date AS endDate,
          c.schedule_label AS scheduleLabel,
          c.meeting_pattern AS meetingPattern,
          c.tuition_cents AS tuitionCents,
          c.capacity,
          c.sort_order AS sortOrder,
          COUNT(
            CASE
              WHEN e.payment_status = 'paid' THEN 1
              WHEN e.payment_status = 'manual_pending' THEN 1
              WHEN e.payment_status = 'checkout_pending' AND e.seat_hold_expires_at > @now THEN 1
            END
          ) AS reservedSeats
        FROM cohorts c
        LEFT JOIN enrollments e ON e.cohort_id = c.id
        WHERE c.is_active = 1
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.start_date ASC
      `)
      .all({ now });

    return rows.map((row) => {
      const program = programs.find((item) => item.id === row.programId);
      const reservedSeats = Number(row.reservedSeats ?? 0);

      return {
        ...row,
        programTitle: program?.title ?? row.programId,
        summary: program?.summary ?? "",
        tuitionLabel: formatMoney(row.tuitionCents),
        reservedSeats,
        remainingSeats: Math.max(row.capacity - reservedSeats, 0),
      };
    });
  }

  createEnrollment(input) {
    const cohort = this.getCohortById(input.cohortId);

    if (!cohort || !cohort.isActive) {
      throw new Error("Selected cohort is not available.");
    }

    const activeReservationCount = this.db
      .prepare(`
        SELECT COUNT(*) AS count
        FROM enrollments
        WHERE cohort_id = @cohortId
          AND (
            payment_status = 'paid'
            OR payment_status = 'manual_pending'
            OR (payment_status = 'checkout_pending' AND seat_hold_expires_at > @now)
          )
      `)
      .get({ cohortId: input.cohortId, now: nowIso() }).count;

    if (activeReservationCount >= cohort.capacity) {
      throw new Error("This cohort is full. Please choose another class date.");
    }

    const timestamp = nowIso();

    this.db
      .prepare(`
        INSERT INTO enrollments (
          id,
          student_full_name,
          email,
          phone,
          date_of_birth,
          address_line1,
          city,
          state,
          postal_code,
          emergency_contact_name,
          emergency_contact_phone,
          program_id,
          cohort_id,
          notes,
          status,
          payment_status,
          payment_amount_cents,
          stripe_checkout_session_id,
          seat_hold_expires_at,
          paid_at,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @studentFullName,
          @email,
          @phone,
          @dateOfBirth,
          @addressLine1,
          @city,
          @state,
          @postalCode,
          @emergencyContactName,
          @emergencyContactPhone,
          @programId,
          @cohortId,
          @notes,
          @status,
          @paymentStatus,
          @paymentAmountCents,
          NULL,
          NULL,
          NULL,
          @createdAt,
          @updatedAt
        )
      `)
      .run({
        ...input,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

    return this.getEnrollmentById(input.id);
  }

  getEnrollmentById(id) {
    return this.db
      .prepare(`
        SELECT
          id,
          student_full_name AS studentFullName,
          email,
          phone,
          date_of_birth AS dateOfBirth,
          address_line1 AS addressLine1,
          city,
          state,
          postal_code AS postalCode,
          emergency_contact_name AS emergencyContactName,
          emergency_contact_phone AS emergencyContactPhone,
          program_id AS programId,
          cohort_id AS cohortId,
          notes,
          status,
          payment_status AS paymentStatus,
          payment_amount_cents AS paymentAmountCents,
          stripe_checkout_session_id AS stripeCheckoutSessionId,
          seat_hold_expires_at AS seatHoldExpiresAt,
          paid_at AS paidAt,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM enrollments
        WHERE id = ?
      `)
      .get(id);
  }

  markCheckoutPending({ enrollmentId, sessionId, expiresAt }) {
    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'payment_pending',
          payment_status = 'checkout_pending',
          stripe_checkout_session_id = @sessionId,
          seat_hold_expires_at = @expiresAt,
          updated_at = @updatedAt
        WHERE id = @enrollmentId
      `)
      .run({
        enrollmentId,
        sessionId,
        expiresAt: toIsoOrNull(expiresAt),
        updatedAt: nowIso(),
      });

    return this.getEnrollmentById(enrollmentId);
  }

  markManualPending(enrollmentId) {
    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'submitted',
          payment_status = 'manual_pending',
          updated_at = @updatedAt
        WHERE id = @enrollmentId
      `)
      .run({
        enrollmentId,
        updatedAt: nowIso(),
      });

    return this.getEnrollmentById(enrollmentId);
  }

  markPaidByCheckoutSession(sessionId) {
    const record = this.db
      .prepare(`
        SELECT id
        FROM enrollments
        WHERE stripe_checkout_session_id = ?
      `)
      .get(sessionId);

    if (!record) {
      return null;
    }

    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'registered',
          payment_status = 'paid',
          seat_hold_expires_at = NULL,
          paid_at = @paidAt,
          updated_at = @updatedAt
        WHERE stripe_checkout_session_id = @sessionId
      `)
      .run({
        sessionId,
        paidAt: nowIso(),
        updatedAt: nowIso(),
      });

    return this.getEnrollmentById(record.id);
  }

  markCheckoutExpired(sessionId) {
    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'payment_expired',
          payment_status = 'checkout_expired',
          seat_hold_expires_at = NULL,
          updated_at = @updatedAt
        WHERE stripe_checkout_session_id = @sessionId
          AND payment_status = 'checkout_pending'
      `)
      .run({
        sessionId,
        updatedAt: nowIso(),
      });
  }

  listEnrollments({ page = 1, pageSize = 20 } = {}) {
    const offset = (page - 1) * pageSize;
    const items = this.db
      .prepare(`
        SELECT
          e.id,
          e.student_full_name AS studentFullName,
          e.email,
          e.phone,
          e.program_id AS programId,
          e.cohort_id AS cohortId,
          e.status,
          e.payment_status AS paymentStatus,
          e.payment_amount_cents AS paymentAmountCents,
          e.created_at AS createdAt,
          c.title AS cohortTitle,
          c.start_date AS startDate,
          c.schedule_label AS scheduleLabel
        FROM enrollments e
        JOIN cohorts c ON c.id = e.cohort_id
        ORDER BY e.created_at DESC
        LIMIT @pageSize OFFSET @offset
      `)
      .all({ pageSize, offset });
    const total = this.db.prepare(`SELECT COUNT(*) AS count FROM enrollments`).get().count;

    return {
      items,
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }

  close() {
    this.db.close();
  }
}
