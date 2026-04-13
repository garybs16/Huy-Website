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

function hasColumn(db, tableName, columnName) {
  return db
    .prepare(`PRAGMA table_info(${tableName})`)
    .all()
    .some((column) => column.name === columnName);
}

function addColumnIfMissing(db, tableName, columnName, definition) {
  if (!hasColumn(db, tableName, columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function mapCohortRecord(row) {
  if (!row) {
    return null;
  }

  const tuitionCents = Number(row.tuitionCents ?? 0);
  const capacity = Number(row.capacity ?? 0);
  const isActive = Boolean(row.isActive);
  const allowPaymentPlan = Boolean(row.allowPaymentPlan);
  const paymentPlanDepositCents = allowPaymentPlan ? Number(row.paymentPlanDepositCents ?? 0) : null;
  const paymentPlanRemainingCents =
    allowPaymentPlan && paymentPlanDepositCents !== null ? Math.max(tuitionCents - paymentPlanDepositCents, 0) : null;

  return {
    ...row,
    tuitionCents,
    capacity,
    isActive,
    allowPaymentPlan,
    paymentPlanDepositCents,
    paymentPlanDepositLabel: paymentPlanDepositCents !== null ? formatMoney(paymentPlanDepositCents) : null,
    paymentPlanRemainingCents,
    paymentPlanRemainingLabel: paymentPlanRemainingCents !== null ? formatMoney(paymentPlanRemainingCents) : null,
    tuitionLabel: formatMoney(tuitionCents),
  };
}

export class EnrollmentDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.db = new Database(filePath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.migrate();
    this.seedPrograms();
    this.seedCohorts();
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS programs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        summary TEXT NOT NULL,
        duration TEXT NOT NULL,
        schedule TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS cohorts (
        id TEXT PRIMARY KEY,
        program_id TEXT NOT NULL,
        title TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        schedule_label TEXT NOT NULL,
        meeting_pattern TEXT NOT NULL,
        tuition_cents INTEGER NOT NULL,
        allow_payment_plan INTEGER NOT NULL DEFAULT 0,
        payment_plan_deposit_cents INTEGER,
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
        payment_option TEXT NOT NULL DEFAULT 'full',
        payment_amount_cents INTEGER NOT NULL,
        tuition_total_cents INTEGER NOT NULL DEFAULT 0,
        balance_due_cents INTEGER NOT NULL DEFAULT 0,
        stripe_checkout_session_id TEXT,
        seat_hold_expires_at TEXT,
        paid_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (cohort_id) REFERENCES cohorts(id)
      );

      CREATE TABLE IF NOT EXISTS inquiries (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        program TEXT NOT NULL,
        message TEXT NOT NULL,
        source TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS waitlist (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        notes TEXT,
        source TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id ON enrollments(cohort_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
      CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_checkout_session_id
        ON enrollments(stripe_checkout_session_id)
        WHERE stripe_checkout_session_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
      CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
    `);

    addColumnIfMissing(this.db, "cohorts", "allow_payment_plan", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "cohorts", "payment_plan_deposit_cents", "INTEGER");
    addColumnIfMissing(this.db, "enrollments", "payment_option", "TEXT NOT NULL DEFAULT 'full'");
    addColumnIfMissing(this.db, "enrollments", "tuition_total_cents", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "enrollments", "balance_due_cents", "INTEGER NOT NULL DEFAULT 0");

    this.db.exec(`
      UPDATE cohorts
      SET allow_payment_plan = 0
      WHERE allow_payment_plan IS NULL;

      UPDATE enrollments
      SET payment_option = 'full'
      WHERE payment_option IS NULL OR payment_option = '';

      UPDATE enrollments
      SET tuition_total_cents = payment_amount_cents
      WHERE tuition_total_cents IS NULL OR tuition_total_cents = 0;

      UPDATE enrollments
      SET balance_due_cents = 0
      WHERE balance_due_cents IS NULL;
    `);
  }

  seedPrograms() {
    const insert = this.db.prepare(`
      INSERT INTO programs (
        id,
        title,
        summary,
        duration,
        schedule,
        is_active,
        sort_order,
        created_at,
        updated_at
      ) VALUES (
        @id,
        @title,
        @summary,
        @duration,
        @schedule,
        @isActive,
        @sortOrder,
        @createdAt,
        @updatedAt
      )
      ON CONFLICT(id) DO NOTHING
    `);
    const timestamp = nowIso();

    const transaction = this.db.transaction(() => {
      for (const [index, program] of programs.entries()) {
        insert.run({
          ...program,
          isActive: 1,
          sortOrder: (index + 1) * 10,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    });

    transaction();
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
        allow_payment_plan,
        payment_plan_deposit_cents,
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
        @allowPaymentPlan,
        @paymentPlanDepositCents,
        @capacity,
        @isActive,
        @sortOrder,
        @createdAt,
        @updatedAt
      )
      ON CONFLICT(id) DO NOTHING
    `);
    const timestamp = nowIso();

    const transaction = this.db.transaction(() => {
      for (const cohort of cohortSeeds) {
        insert.run({
          ...cohort,
          allowPaymentPlan: normalizeBoolean(cohort.allowPaymentPlan),
          paymentPlanDepositCents: cohort.paymentPlanDepositCents ?? null,
          isActive: normalizeBoolean(cohort.isActive),
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
    });

    transaction();
  }

  getCohortById(id) {
    const row = this.db
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
          c.allow_payment_plan AS allowPaymentPlan,
          c.payment_plan_deposit_cents AS paymentPlanDepositCents,
          c.capacity,
          c.is_active AS isActive,
          c.sort_order AS sortOrder,
          p.title AS programTitle,
          p.is_active AS programIsActive
        FROM cohorts c
        LEFT JOIN programs p ON p.id = c.program_id
        WHERE c.id = ?
      `)
      .get(id);

    return mapCohortRecord(row);
  }

  getProgramById(id, { includeInactive = false } = {}) {
    return this.db
      .prepare(`
        SELECT
          id,
          title,
          summary,
          duration,
          schedule,
          is_active AS isActive,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM programs
        WHERE id = @id
          ${includeInactive ? "" : "AND is_active = 1"}
      `)
      .get({ id });
  }

  ping() {
    this.db.prepare("SELECT 1 AS ok").get();
    return true;
  }

  releaseExpiredSeatHolds() {
    const now = nowIso();

    const result = this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'payment_expired',
          payment_status = 'checkout_expired',
          seat_hold_expires_at = NULL,
          updated_at = @updatedAt
        WHERE payment_status = 'checkout_pending'
          AND seat_hold_expires_at IS NOT NULL
          AND seat_hold_expires_at <= @now
      `)
      .run({
        now,
        updatedAt: now,
      });

    return result.changes;
  }

  listActiveCohorts() {
    this.releaseExpiredSeatHolds();
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
          c.allow_payment_plan AS allowPaymentPlan,
          c.payment_plan_deposit_cents AS paymentPlanDepositCents,
          c.capacity,
          c.sort_order AS sortOrder,
          p.title AS programTitle,
          p.summary AS programSummary,
          COUNT(
            CASE
              WHEN e.payment_status = 'paid' THEN 1
              WHEN e.payment_status = 'deposit_paid' THEN 1
              WHEN e.payment_status = 'manual_pending' THEN 1
              WHEN e.payment_status = 'checkout_pending' AND e.seat_hold_expires_at > @now THEN 1
            END
          ) AS reservedSeats
        FROM cohorts c
        JOIN programs p ON p.id = c.program_id
        LEFT JOIN enrollments e ON e.cohort_id = c.id
        WHERE c.is_active = 1
          AND p.is_active = 1
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.start_date ASC
      `)
      .all({ now });

    return rows.map((row) => {
      const reservedSeats = Number(row.reservedSeats ?? 0);
      const cohort = mapCohortRecord(row);

      return {
        ...cohort,
        programTitle: row.programTitle ?? row.programId,
        summary: row.programSummary ?? "",
        reservedSeats,
        remainingSeats: Math.max(cohort.capacity - reservedSeats, 0),
      };
    });
  }

  listPrograms({ includeInactive = false } = {}) {
    return this.db
      .prepare(`
        SELECT
          id,
          title,
          summary,
          duration,
          schedule,
          is_active AS isActive,
          sort_order AS sortOrder,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM programs
        ${includeInactive ? "" : "WHERE is_active = 1"}
        ORDER BY sort_order ASC, title ASC
      `)
      .all();
  }

  createProgram(input) {
    const existing = this.getProgramById(input.id, { includeInactive: true });

    if (existing) {
      throw new Error("A program with that id already exists.");
    }

    const timestamp = nowIso();

    this.db
      .prepare(`
        INSERT INTO programs (
          id,
          title,
          summary,
          duration,
          schedule,
          is_active,
          sort_order,
          created_at,
          updated_at
        ) VALUES (
          @id,
          @title,
          @summary,
          @duration,
          @schedule,
          @isActive,
          @sortOrder,
          @createdAt,
          @updatedAt
        )
      `)
      .run({
        ...input,
        isActive: normalizeBoolean(input.isActive),
        createdAt: timestamp,
        updatedAt: timestamp,
      });

    return this.getProgramById(input.id, { includeInactive: true });
  }

  updateProgram(id, input) {
    const existing = this.getProgramById(id, { includeInactive: true });

    if (!existing) {
      throw new Error("Program not found.");
    }

    this.db
      .prepare(`
        UPDATE programs
        SET
          title = @title,
          summary = @summary,
          duration = @duration,
          schedule = @schedule,
          is_active = @isActive,
          sort_order = @sortOrder,
          updated_at = @updatedAt
        WHERE id = @id
      `)
      .run({
        ...input,
        id,
        isActive: normalizeBoolean(input.isActive),
        updatedAt: nowIso(),
      });

    return this.getProgramById(id, { includeInactive: true });
  }

  deleteProgram(id) {
    const existing = this.getProgramById(id, { includeInactive: true });

    if (!existing) {
      throw new Error("Program not found.");
    }

    const cohortCount = this.db.prepare(`SELECT COUNT(*) AS count FROM cohorts WHERE program_id = ?`).get(id).count;
    const enrollmentCount = this.db
      .prepare(`SELECT COUNT(*) AS count FROM enrollments WHERE program_id = ?`)
      .get(id).count;

    if (cohortCount > 0 || enrollmentCount > 0) {
      throw new Error("Remove dependent cohorts before deleting this program.");
    }

    this.db.prepare(`DELETE FROM programs WHERE id = ?`).run(id);
  }

  listCohortsForAdmin() {
    this.releaseExpiredSeatHolds();
    const now = nowIso();

    return this.db
      .prepare(`
        SELECT
          c.id,
          c.program_id AS programId,
          p.title AS programTitle,
          c.title,
          c.start_date AS startDate,
          c.end_date AS endDate,
          c.schedule_label AS scheduleLabel,
          c.meeting_pattern AS meetingPattern,
          c.tuition_cents AS tuitionCents,
          c.allow_payment_plan AS allowPaymentPlan,
          c.payment_plan_deposit_cents AS paymentPlanDepositCents,
          c.capacity,
          c.is_active AS isActive,
          c.sort_order AS sortOrder,
          COUNT(
            CASE
              WHEN e.payment_status = 'paid' THEN 1
              WHEN e.payment_status = 'deposit_paid' THEN 1
              WHEN e.payment_status = 'manual_pending' THEN 1
              WHEN e.payment_status = 'checkout_pending' AND e.seat_hold_expires_at > @now THEN 1
            END
          ) AS reservedSeats
        FROM cohorts c
        LEFT JOIN programs p ON p.id = c.program_id
        LEFT JOIN enrollments e ON e.cohort_id = c.id
        GROUP BY c.id
        ORDER BY c.sort_order ASC, c.start_date ASC
      `)
      .all({ now })
      .map((row) => ({
        ...mapCohortRecord(row),
        reservedSeats: Number(row.reservedSeats ?? 0),
        remainingSeats: Math.max(Number(row.capacity ?? 0) - Number(row.reservedSeats ?? 0), 0),
      }));
  }

  createCohort(input) {
    const existing = this.getCohortById(input.id);

    if (existing) {
      throw new Error("A cohort with that id already exists.");
    }

    const program = this.getProgramById(input.programId, { includeInactive: true });

    if (!program) {
      throw new Error("Selected program was not found.");
    }

    const timestamp = nowIso();

    this.db
      .prepare(`
        INSERT INTO cohorts (
          id,
          program_id,
          title,
          start_date,
          end_date,
          schedule_label,
          meeting_pattern,
          tuition_cents,
          allow_payment_plan,
          payment_plan_deposit_cents,
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
          @allowPaymentPlan,
          @paymentPlanDepositCents,
          @capacity,
          @isActive,
          @sortOrder,
          @createdAt,
          @updatedAt
        )
      `)
      .run({
        ...input,
        allowPaymentPlan: normalizeBoolean(input.allowPaymentPlan),
        paymentPlanDepositCents: input.paymentPlanDepositCents ?? null,
        isActive: normalizeBoolean(input.isActive),
        createdAt: timestamp,
        updatedAt: timestamp,
      });

    return this.getCohortById(input.id);
  }

  updateCohort(id, input) {
    const existing = this.getCohortById(id);

    if (!existing) {
      throw new Error("Cohort not found.");
    }

    const program = this.getProgramById(input.programId, { includeInactive: true });

    if (!program) {
      throw new Error("Selected program was not found.");
    }

    this.db
      .prepare(`
        UPDATE cohorts
        SET
          program_id = @programId,
          title = @title,
          start_date = @startDate,
          end_date = @endDate,
          schedule_label = @scheduleLabel,
          meeting_pattern = @meetingPattern,
          tuition_cents = @tuitionCents,
          allow_payment_plan = @allowPaymentPlan,
          payment_plan_deposit_cents = @paymentPlanDepositCents,
          capacity = @capacity,
          is_active = @isActive,
          sort_order = @sortOrder,
          updated_at = @updatedAt
        WHERE id = @id
      `)
      .run({
        ...input,
        id,
        allowPaymentPlan: normalizeBoolean(input.allowPaymentPlan),
        paymentPlanDepositCents: input.paymentPlanDepositCents ?? null,
        isActive: normalizeBoolean(input.isActive),
        updatedAt: nowIso(),
      });

    return this.getCohortById(id);
  }

  deleteCohort(id) {
    const existing = this.getCohortById(id);

    if (!existing) {
      throw new Error("Cohort not found.");
    }

    const enrollmentCount = this.db
      .prepare(`SELECT COUNT(*) AS count FROM enrollments WHERE cohort_id = ?`)
      .get(id).count;

    if (enrollmentCount > 0) {
      throw new Error("Existing enrollments are attached to this cohort.");
    }

    this.db.prepare(`DELETE FROM cohorts WHERE id = ?`).run(id);
  }

  createEnrollment(input) {
    this.releaseExpiredSeatHolds();
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
            OR payment_status = 'deposit_paid'
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
          payment_option,
          payment_amount_cents,
          tuition_total_cents,
          balance_due_cents,
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
          @paymentOption,
          @paymentAmountCents,
          @tuitionTotalCents,
          @balanceDueCents,
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
    this.releaseExpiredSeatHolds();
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
          payment_option AS paymentOption,
          payment_amount_cents AS paymentAmountCents,
          tuition_total_cents AS tuitionTotalCents,
          balance_due_cents AS balanceDueCents,
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

  markPaymentSetupFailed(enrollmentId, reason) {
    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'payment_setup_failed',
          payment_status = 'payment_failed',
          notes = CASE
            WHEN @reason IS NULL OR @reason = '' THEN notes
            WHEN notes IS NULL OR notes = '' THEN @reason
            ELSE notes || ' | ' || @reason
          END,
          updated_at = @updatedAt
        WHERE id = @enrollmentId
      `)
      .run({
        enrollmentId,
        reason: reason ?? null,
        updatedAt: nowIso(),
      });

    return this.getEnrollmentById(enrollmentId);
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
          status = CASE
            WHEN payment_option = 'deposit' AND balance_due_cents > 0 THEN 'payment_plan_pending'
            ELSE 'submitted'
          END,
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
          status = CASE
            WHEN payment_option = 'deposit' AND balance_due_cents > 0 THEN 'payment_plan_active'
            ELSE 'registered'
          END,
          payment_status = CASE
            WHEN payment_option = 'deposit' AND balance_due_cents > 0 THEN 'deposit_paid'
            ELSE 'paid'
          END,
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
    this.releaseExpiredSeatHolds();
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
          e.payment_option AS paymentOption,
          e.payment_amount_cents AS paymentAmountCents,
          e.tuition_total_cents AS tuitionTotalCents,
          e.balance_due_cents AS balanceDueCents,
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
      items: items.map((item) => ({
        ...item,
        paymentAmountLabel: formatMoney(item.paymentAmountCents),
        tuitionTotalLabel: formatMoney(item.tuitionTotalCents),
        balanceDueLabel: formatMoney(item.balanceDueCents),
      })),
      page,
      pageSize,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / pageSize),
    };
  }

  insertInquiry(record) {
    this.db
      .prepare(`
        INSERT INTO inquiries (
          id,
          full_name,
          email,
          phone,
          program,
          message,
          source,
          created_at
        ) VALUES (
          @id,
          @fullName,
          @email,
          @phone,
          @program,
          @message,
          @source,
          @createdAt
        )
      `)
      .run({
        id: record.id,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone ?? null,
        program: record.program,
        message: record.message,
        source: record.source ?? null,
        createdAt: record.createdAt,
      });

    return record;
  }

  listInquiries({ page = 1, pageSize = 20 } = {}) {
    return this.paginateCollection({
      tableName: "inquiries",
      page,
      pageSize,
      selectSql: `
        SELECT
          id,
          full_name AS fullName,
          email,
          phone,
          program,
          message,
          source,
          created_at AS createdAt
        FROM inquiries
      `,
    });
  }

  insertWaitlist(record) {
    this.db
      .prepare(`
        INSERT INTO waitlist (
          id,
          full_name,
          email,
          phone,
          notes,
          source,
          created_at
        ) VALUES (
          @id,
          @fullName,
          @email,
          @phone,
          @notes,
          @source,
          @createdAt
        )
      `)
      .run({
        id: record.id,
        fullName: record.fullName,
        email: record.email,
        phone: record.phone ?? null,
        notes: record.notes ?? null,
        source: record.source ?? null,
        createdAt: record.createdAt,
      });

    return record;
  }

  listWaitlist({ page = 1, pageSize = 20 } = {}) {
    return this.paginateCollection({
      tableName: "waitlist",
      page,
      pageSize,
      selectSql: `
        SELECT
          id,
          full_name AS fullName,
          email,
          phone,
          notes,
          source,
          created_at AS createdAt
        FROM waitlist
      `,
    });
  }

  getAdminOverview() {
    this.releaseExpiredSeatHolds();
    const now = nowIso();
    const metrics = this.db
      .prepare(`
        SELECT
          (SELECT COUNT(*) FROM cohorts WHERE is_active = 1) AS activeCohorts,
          (SELECT COUNT(*) FROM enrollments) AS enrollments,
          (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'paid') AS paidEnrollments,
          (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'deposit_paid') AS activePaymentPlans,
          (
            SELECT COUNT(*)
            FROM enrollments
            WHERE payment_status = 'checkout_pending'
              AND seat_hold_expires_at > @now
          ) AS pendingPayments,
          (SELECT COUNT(*) FROM inquiries) AS inquiries,
          (SELECT COUNT(*) FROM waitlist) AS waitlist
      `)
      .get({ now });

    const recentEnrollments = this.db
      .prepare(`
        SELECT
          e.id,
          e.student_full_name AS studentFullName,
          e.email,
          e.status,
          e.payment_status AS paymentStatus,
          e.payment_option AS paymentOption,
          e.balance_due_cents AS balanceDueCents,
          e.created_at AS createdAt,
          c.title AS cohortTitle
        FROM enrollments e
        JOIN cohorts c ON c.id = e.cohort_id
        ORDER BY e.created_at DESC
        LIMIT 5
      `)
      .all();

    return {
      metrics,
      recentEnrollments,
      cohorts: this.listActiveCohorts(),
    };
  }

  paginateCollection({ tableName, page, pageSize, selectSql }) {
    const offset = (page - 1) * pageSize;
    const items = this.db
      .prepare(`
        ${selectSql}
        ORDER BY created_at DESC
        LIMIT @pageSize OFFSET @offset
      `)
      .all({ pageSize, offset });
    const total = this.db.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count;

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
