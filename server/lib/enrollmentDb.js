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

function backupTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
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
    this.db.pragma("busy_timeout = 5000");
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
        amount_paid_cents INTEGER NOT NULL DEFAULT 0,
        payment_installments_total INTEGER NOT NULL DEFAULT 1,
        payment_installments_paid INTEGER NOT NULL DEFAULT 0,
        payment_interval TEXT,
        stripe_checkout_session_id TEXT,
        stripe_checkout_purpose TEXT,
        stripe_customer_id TEXT,
        stripe_subscription_id TEXT,
        stripe_subscription_schedule_id TEXT,
        seat_hold_expires_at TEXT,
        next_payment_due_at TEXT,
        last_payment_at TEXT,
        last_payment_failure_at TEXT,
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

      CREATE TABLE IF NOT EXISTS admin_sessions (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_audit_log (
        id TEXT PRIMARY KEY,
        actor TEXT NOT NULL,
        action TEXT NOT NULL,
        detail TEXT,
        ip_address TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS enrollment_payments (
        stripe_invoice_id TEXT PRIMARY KEY,
        enrollment_id TEXT NOT NULL,
        stripe_subscription_id TEXT,
        amount_cents INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT 'usd',
        status TEXT NOT NULL,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        paid_at TEXT,
        failed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (enrollment_id) REFERENCES enrollments(id)
      );

      CREATE INDEX IF NOT EXISTS idx_enrollments_cohort_id ON enrollments(cohort_id);
      CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
      CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_checkout_session_id
        ON enrollments(stripe_checkout_session_id)
        WHERE stripe_checkout_session_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS idx_enrollment_payments_enrollment_id
        ON enrollment_payments(enrollment_id);
      CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at);
      CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
      CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created_at ON admin_audit_log(created_at);
    `);

    addColumnIfMissing(this.db, "cohorts", "allow_payment_plan", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "cohorts", "payment_plan_deposit_cents", "INTEGER");
    addColumnIfMissing(this.db, "enrollments", "payment_option", "TEXT NOT NULL DEFAULT 'full'");
    addColumnIfMissing(this.db, "enrollments", "tuition_total_cents", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "enrollments", "balance_due_cents", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "enrollments", "stripe_checkout_purpose", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "amount_paid_cents", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "enrollments", "payment_installments_total", "INTEGER NOT NULL DEFAULT 1");
    addColumnIfMissing(this.db, "enrollments", "payment_installments_paid", "INTEGER NOT NULL DEFAULT 0");
    addColumnIfMissing(this.db, "enrollments", "payment_interval", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "stripe_customer_id", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "stripe_subscription_id", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "stripe_subscription_schedule_id", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "next_payment_due_at", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "last_payment_at", "TEXT");
    addColumnIfMissing(this.db, "enrollments", "last_payment_failure_at", "TEXT");

    this.db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_enrollments_subscription_id
        ON enrollments(stripe_subscription_id)
        WHERE stripe_subscription_id IS NOT NULL;
    `);

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

      UPDATE enrollments
      SET amount_paid_cents = CASE
        WHEN payment_status = 'paid' THEN tuition_total_cents
        WHEN payment_status = 'deposit_paid' THEN payment_amount_cents
        ELSE 0
      END
      WHERE amount_paid_cents IS NULL OR amount_paid_cents = 0;

      UPDATE enrollments
      SET payment_installments_paid = CASE
        WHEN payment_status IN ('paid', 'deposit_paid') THEN 1
        ELSE 0
      END
      WHERE payment_installments_paid IS NULL OR payment_installments_paid = 0;

      UPDATE enrollments
      SET
        payment_installments_total = 8,
        payment_interval = 'week'
      WHERE payment_option = 'deposit'
        AND payment_status NOT IN ('paid', 'deposit_paid')
        AND (payment_installments_total IS NULL OR payment_installments_total <= 1);

      UPDATE cohorts
      SET
        tuition_cents = 200000,
        allow_payment_plan = 1,
        payment_plan_deposit_cents = 25000,
        updated_at = '${nowIso()}'
      WHERE id IN ('cna-weekday-apr-2026', 'cna-weekend-apr-2026', 'cna-evening-may-2026')
        AND (
          tuition_cents = 196000
          OR payment_plan_deposit_cents = 65000
          OR payment_plan_deposit_cents IS NULL
          OR allow_payment_plan = 0
        );

      UPDATE programs
      SET
        summary = 'Structured classroom, lab, and supervised clinical training built for direct patient-care roles.',
        duration = '160 approved program hours',
        schedule = 'Approved weekday schedule with online theory and in-person clinical training listed separately',
        updated_at = '${nowIso()}'
      WHERE id = 'cna'
        AND (
          duration IN ('4-6 weeks', '6-12 weeks')
          OR schedule LIKE '%weekend%'
          OR schedule LIKE '%Weekend%'
        );

      UPDATE cohorts
      SET
        is_active = 0,
        updated_at = '${nowIso()}'
      WHERE id = 'cna-weekend-apr-2026';
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
        WHERE payment_status IN ('payment_setup', 'checkout_pending')
          AND seat_hold_expires_at IS NOT NULL
          AND seat_hold_expires_at <= @now
      `)
      .run({
        now,
        updatedAt: now,
      });

    return result.changes;
  }

  deleteExpiredAdminSessions() {
    return this.db
      .prepare(`DELETE FROM admin_sessions WHERE expires_at <= @now`)
      .run({ now: nowIso() }).changes;
  }

  createAdminSession({ id, username, ipAddress, userAgent, expiresAt }) {
    this.deleteExpiredAdminSessions();
    const timestamp = nowIso();

    this.db
      .prepare(`
        INSERT INTO admin_sessions (
          id,
          username,
          ip_address,
          user_agent,
          expires_at,
          created_at,
          last_seen_at
        ) VALUES (
          @id,
          @username,
          @ipAddress,
          @userAgent,
          @expiresAt,
          @createdAt,
          @lastSeenAt
        )
      `)
      .run({
        id,
        username,
        ipAddress: ipAddress ?? null,
        userAgent: userAgent ?? null,
        expiresAt,
        createdAt: timestamp,
        lastSeenAt: timestamp,
      });

    return this.getAdminSessionById(id);
  }

  getAdminSessionById(id) {
    this.deleteExpiredAdminSessions();

    return this.db
      .prepare(`
        SELECT
          id,
          username,
          ip_address AS ipAddress,
          user_agent AS userAgent,
          expires_at AS expiresAt,
          created_at AS createdAt,
          last_seen_at AS lastSeenAt
        FROM admin_sessions
        WHERE id = ?
      `)
      .get(id);
  }

  touchAdminSession(id) {
    this.db
      .prepare(`
        UPDATE admin_sessions
        SET last_seen_at = @lastSeenAt
        WHERE id = @id
      `)
      .run({
        id,
        lastSeenAt: nowIso(),
      });
  }

  deleteAdminSession(id) {
    this.db.prepare(`DELETE FROM admin_sessions WHERE id = ?`).run(id);
  }

  insertAdminAuditEvent({ id, actor, action, detail, ipAddress, createdAt }) {
    this.db
      .prepare(`
        INSERT INTO admin_audit_log (
          id,
          actor,
          action,
          detail,
          ip_address,
          created_at
        ) VALUES (
          @id,
          @actor,
          @action,
          @detail,
          @ipAddress,
          @createdAt
        )
      `)
      .run({
        id,
        actor,
        action,
        detail: detail ?? null,
        ipAddress: ipAddress ?? null,
        createdAt,
      });
  }

  listRecentAdminAuditEvents(limit = 8) {
    return this.db
      .prepare(`
        SELECT
          id,
          actor,
          action,
          detail,
          ip_address AS ipAddress,
          created_at AS createdAt
        FROM admin_audit_log
        ORDER BY created_at DESC
        LIMIT @limit
      `)
      .all({ limit });
  }

  exportOperationalData() {
    return {
      generatedAt: nowIso(),
      programs: this.listPrograms({ includeInactive: true }),
      cohorts: this.listCohortsForAdmin(),
      enrollments: this.db
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
            amount_paid_cents AS amountPaidCents,
            payment_installments_total AS paymentInstallmentsTotal,
            payment_installments_paid AS paymentInstallmentsPaid,
            payment_interval AS paymentInterval,
            stripe_checkout_session_id AS stripeCheckoutSessionId,
            stripe_checkout_purpose AS stripeCheckoutPurpose,
            stripe_customer_id AS stripeCustomerId,
            stripe_subscription_id AS stripeSubscriptionId,
            stripe_subscription_schedule_id AS stripeSubscriptionScheduleId,
            seat_hold_expires_at AS seatHoldExpiresAt,
            next_payment_due_at AS nextPaymentDueAt,
            last_payment_at AS lastPaymentAt,
            last_payment_failure_at AS lastPaymentFailureAt,
            paid_at AS paidAt,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM enrollments
          ORDER BY created_at DESC
        `)
        .all(),
      payments: this.db
        .prepare(`
          SELECT
            stripe_invoice_id AS stripeInvoiceId,
            enrollment_id AS enrollmentId,
            stripe_subscription_id AS stripeSubscriptionId,
            amount_cents AS amountCents,
            currency,
            status,
            attempt_count AS attemptCount,
            paid_at AS paidAt,
            failed_at AS failedAt,
            created_at AS createdAt,
            updated_at AS updatedAt
          FROM enrollment_payments
          ORDER BY created_at DESC
        `)
        .all(),
      inquiries: this.db
        .prepare(`
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
          ORDER BY created_at DESC
        `)
        .all(),
      waitlist: this.db
        .prepare(`
          SELECT
            id,
            full_name AS fullName,
            email,
            phone,
            notes,
            source,
            created_at AS createdAt
          FROM waitlist
          ORDER BY created_at DESC
        `)
        .all(),
      recentAdminActivity: this.listRecentAdminAuditEvents(50),
    };
  }

  async createBackup({ directory } = {}) {
    const backupDirectory = directory ?? path.join(path.dirname(this.filePath), "backups");
    fs.mkdirSync(backupDirectory, { recursive: true });

    const filename = `enrollment-${backupTimestamp()}.db`;
    const backupPath = path.join(backupDirectory, filename);

    await this.db.backup(backupPath);

    return {
      filename,
      path: backupPath,
      createdAt: nowIso(),
    };
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
          c.is_active AS isActive,
          c.sort_order AS sortOrder,
          p.title AS programTitle,
          p.summary AS programSummary,
          COUNT(
            CASE
              WHEN e.payment_status = 'paid' THEN 1
              WHEN e.payment_status = 'deposit_paid' THEN 1
              WHEN e.payment_status = 'payment_plan_active' THEN 1
              WHEN e.payment_status = 'installment_failed' THEN 1
              WHEN e.payment_status = 'manual_pending' THEN 1
              WHEN e.payment_status = 'payment_setup' AND e.seat_hold_expires_at > @now THEN 1
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
              WHEN e.payment_status = 'payment_setup' AND e.seat_hold_expires_at > @now THEN 1
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
    const insertWithCapacityCheck = this.db.transaction((enrollmentInput) => {
      const cohort = this.getCohortById(enrollmentInput.cohortId);

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
              OR payment_status = 'payment_plan_active'
              OR payment_status = 'installment_failed'
              OR payment_status = 'manual_pending'
              OR (payment_status = 'payment_setup' AND seat_hold_expires_at > @now)
              OR (payment_status = 'checkout_pending' AND seat_hold_expires_at > @now)
            )
        `)
        .get({ cohortId: enrollmentInput.cohortId, now: nowIso() }).count;

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
            amount_paid_cents,
            payment_installments_total,
            payment_installments_paid,
            payment_interval,
            stripe_checkout_session_id,
            stripe_checkout_purpose,
            stripe_customer_id,
            stripe_subscription_id,
            stripe_subscription_schedule_id,
            seat_hold_expires_at,
            next_payment_due_at,
            last_payment_at,
            last_payment_failure_at,
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
            @amountPaidCents,
            @paymentInstallmentsTotal,
            @paymentInstallmentsPaid,
            @paymentInterval,
            NULL,
            NULL,
            NULL,
            NULL,
            NULL,
            @seatHoldExpiresAt,
            NULL,
            NULL,
            NULL,
            NULL,
            @createdAt,
            @updatedAt
          )
        `)
        .run({
          ...enrollmentInput,
          amountPaidCents: enrollmentInput.amountPaidCents ?? 0,
          paymentInstallmentsTotal: enrollmentInput.paymentInstallmentsTotal ?? 1,
          paymentInstallmentsPaid: enrollmentInput.paymentInstallmentsPaid ?? 0,
          paymentInterval: enrollmentInput.paymentInterval ?? null,
          seatHoldExpiresAt: enrollmentInput.seatHoldExpiresAt ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
    });

    insertWithCapacityCheck.immediate(input);

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
          amount_paid_cents AS amountPaidCents,
          payment_installments_total AS paymentInstallmentsTotal,
          payment_installments_paid AS paymentInstallmentsPaid,
          payment_interval AS paymentInterval,
          stripe_checkout_session_id AS stripeCheckoutSessionId,
          stripe_checkout_purpose AS stripeCheckoutPurpose,
          stripe_customer_id AS stripeCustomerId,
          stripe_subscription_id AS stripeSubscriptionId,
          stripe_subscription_schedule_id AS stripeSubscriptionScheduleId,
          seat_hold_expires_at AS seatHoldExpiresAt,
          next_payment_due_at AS nextPaymentDueAt,
          last_payment_at AS lastPaymentAt,
          last_payment_failure_at AS lastPaymentFailureAt,
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
          seat_hold_expires_at = NULL,
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

  markCheckoutPending({ enrollmentId, sessionId, expiresAt, purpose }) {
    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = 'payment_pending',
          payment_status = 'checkout_pending',
          stripe_checkout_session_id = @sessionId,
          stripe_checkout_purpose = @purpose,
          seat_hold_expires_at = @expiresAt,
          updated_at = @updatedAt
        WHERE id = @enrollmentId
      `)
      .run({
        enrollmentId,
        sessionId,
        purpose: purpose ?? null,
        expiresAt: toIsoOrNull(expiresAt),
        updatedAt: nowIso(),
      });

    return this.getEnrollmentById(enrollmentId);
  }

  attachStripeSubscription({
    enrollmentId,
    customerId,
    subscriptionId,
    scheduleId,
    nextPaymentDueAt,
    installmentsTotal = 8,
    interval = "week",
  }) {
    this.db
      .prepare(`
        UPDATE enrollments
        SET
          stripe_customer_id = @customerId,
          stripe_subscription_id = @subscriptionId,
          stripe_subscription_schedule_id = @scheduleId,
          payment_installments_total = @installmentsTotal,
          payment_interval = @interval,
          next_payment_due_at = @nextPaymentDueAt,
          updated_at = @updatedAt
        WHERE id = @enrollmentId
      `)
      .run({
        enrollmentId,
        customerId: customerId ?? null,
        subscriptionId,
        scheduleId,
        installmentsTotal,
        interval,
        nextPaymentDueAt: toIsoOrNull(nextPaymentDueAt),
        updatedAt: nowIso(),
      });

    return this.getEnrollmentById(enrollmentId);
  }

  getEnrollmentByStripeSubscriptionId(subscriptionId) {
    const record = this.db
      .prepare(`SELECT id FROM enrollments WHERE stripe_subscription_id = ?`)
      .get(subscriptionId);

    return record ? this.getEnrollmentById(record.id) : null;
  }

  recordSubscriptionPayment({
    enrollmentId,
    invoiceId,
    subscriptionId,
    amountCents,
    currency = "usd",
    paidAt,
    nextPaymentDueAt,
  }) {
    const applyPayment = this.db.transaction((input) => {
      const enrollment = this.db
        .prepare(`
          SELECT
            id,
            tuition_total_cents AS tuitionTotalCents,
            amount_paid_cents AS amountPaidCents,
            stripe_subscription_id AS stripeSubscriptionId
          FROM enrollments
          WHERE id = @enrollmentId
        `)
        .get({ enrollmentId: input.enrollmentId });

      if (!enrollment) {
        throw new Error("Enrollment not found for Stripe invoice.");
      }

      if (enrollment.stripeSubscriptionId && enrollment.stripeSubscriptionId !== input.subscriptionId) {
        throw new Error("Stripe invoice subscription did not match enrollment.");
      }

      const normalizedCurrency = String(input.currency ?? "").toLowerCase();
      const normalizedAmount = Number(input.amountCents ?? 0);

      if (normalizedCurrency !== "usd" || !Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error("Stripe invoice payment amount or currency was invalid.");
      }

      const existingPayment = this.db
        .prepare(`SELECT status FROM enrollment_payments WHERE stripe_invoice_id = ?`)
        .get(input.invoiceId);

      if (existingPayment?.status === "paid") {
        return { applied: false, enrollmentId: enrollment.id };
      }

      const currentAmountPaid = Number(enrollment.amountPaidCents ?? 0);
      const tuitionTotalCents = Number(enrollment.tuitionTotalCents ?? 0);

      if (currentAmountPaid + normalizedAmount > tuitionTotalCents) {
        throw new Error("Stripe invoice payment exceeded the enrollment tuition total.");
      }

      const timestamp = toIsoOrNull(input.paidAt) ?? nowIso();
      this.db
        .prepare(`
          INSERT INTO enrollment_payments (
            stripe_invoice_id,
            enrollment_id,
            stripe_subscription_id,
            amount_cents,
            currency,
            status,
            attempt_count,
            paid_at,
            failed_at,
            created_at,
            updated_at
          ) VALUES (
            @invoiceId,
            @enrollmentId,
            @subscriptionId,
            @amountCents,
            @currency,
            'paid',
            1,
            @paidAt,
            NULL,
            @createdAt,
            @updatedAt
          )
          ON CONFLICT(stripe_invoice_id) DO UPDATE SET
            stripe_subscription_id = excluded.stripe_subscription_id,
            amount_cents = excluded.amount_cents,
            currency = excluded.currency,
            status = 'paid',
            paid_at = excluded.paid_at,
            updated_at = excluded.updated_at
        `)
        .run({
          invoiceId: input.invoiceId,
          enrollmentId: input.enrollmentId,
          subscriptionId: input.subscriptionId,
          amountCents: normalizedAmount,
          currency: normalizedCurrency,
          paidAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

      const paymentSummary = this.db
        .prepare(`
          SELECT
            COUNT(*) AS installmentsPaid,
            COALESCE(SUM(amount_cents), 0) AS amountPaidCents
          FROM enrollment_payments
          WHERE enrollment_id = @enrollmentId
            AND status = 'paid'
        `)
        .get({ enrollmentId: input.enrollmentId });
      const amountPaidCents = Number(paymentSummary.amountPaidCents ?? 0);
      const installmentsPaid = Number(paymentSummary.installmentsPaid ?? 0);
      const balanceDueCents = Math.max(tuitionTotalCents - amountPaidCents, 0);
      const paidInFull = balanceDueCents === 0;

      this.db
        .prepare(`
          UPDATE enrollments
          SET
            status = @status,
            payment_status = @paymentStatus,
            amount_paid_cents = @amountPaidCents,
            balance_due_cents = @balanceDueCents,
            payment_installments_paid = @installmentsPaid,
            stripe_subscription_id = COALESCE(stripe_subscription_id, @subscriptionId),
            seat_hold_expires_at = NULL,
            next_payment_due_at = @nextPaymentDueAt,
            last_payment_at = @lastPaymentAt,
            last_payment_failure_at = NULL,
            paid_at = CASE WHEN @paidInFull = 1 THEN @lastPaymentAt ELSE paid_at END,
            updated_at = @updatedAt
          WHERE id = @enrollmentId
        `)
        .run({
          enrollmentId: input.enrollmentId,
          subscriptionId: input.subscriptionId,
          status: paidInFull ? "registered" : "payment_plan_active",
          paymentStatus: paidInFull ? "paid" : "payment_plan_active",
          amountPaidCents,
          balanceDueCents,
          installmentsPaid,
          paidInFull: paidInFull ? 1 : 0,
          nextPaymentDueAt: paidInFull ? null : toIsoOrNull(input.nextPaymentDueAt),
          lastPaymentAt: timestamp,
          updatedAt: timestamp,
        });

      return { applied: true, enrollmentId: enrollment.id };
    });

    const result = applyPayment.immediate({
      enrollmentId,
      invoiceId,
      subscriptionId,
      amountCents,
      currency,
      paidAt,
      nextPaymentDueAt,
    });

    return {
      applied: result.applied,
      enrollment: this.getEnrollmentById(result.enrollmentId),
    };
  }

  recordSubscriptionPaymentFailed({
    enrollmentId,
    invoiceId,
    subscriptionId,
    amountCents = 0,
    currency = "usd",
    attemptCount = 1,
    failedAt,
  }) {
    const applyFailure = this.db.transaction((input) => {
      const enrollment = this.db
        .prepare(`
          SELECT
            id,
            stripe_subscription_id AS stripeSubscriptionId,
            payment_installments_paid AS paymentInstallmentsPaid
          FROM enrollments
          WHERE id = @enrollmentId
        `)
        .get({ enrollmentId: input.enrollmentId });

      if (!enrollment) {
        throw new Error("Enrollment not found for failed Stripe invoice.");
      }

      if (enrollment.stripeSubscriptionId && enrollment.stripeSubscriptionId !== input.subscriptionId) {
        throw new Error("Failed Stripe invoice subscription did not match enrollment.");
      }

      const existingPayment = this.db
        .prepare(`SELECT status FROM enrollment_payments WHERE stripe_invoice_id = ?`)
        .get(input.invoiceId);

      if (existingPayment?.status === "paid") {
        return { applied: false, enrollmentId: enrollment.id };
      }

      const timestamp = toIsoOrNull(input.failedAt) ?? nowIso();
      this.db
        .prepare(`
          INSERT INTO enrollment_payments (
            stripe_invoice_id,
            enrollment_id,
            stripe_subscription_id,
            amount_cents,
            currency,
            status,
            attempt_count,
            paid_at,
            failed_at,
            created_at,
            updated_at
          ) VALUES (
            @invoiceId,
            @enrollmentId,
            @subscriptionId,
            @amountCents,
            @currency,
            'failed',
            @attemptCount,
            NULL,
            @failedAt,
            @createdAt,
            @updatedAt
          )
          ON CONFLICT(stripe_invoice_id) DO UPDATE SET
            status = 'failed',
            attempt_count = excluded.attempt_count,
            failed_at = excluded.failed_at,
            updated_at = excluded.updated_at
        `)
        .run({
          invoiceId: input.invoiceId,
          enrollmentId: input.enrollmentId,
          subscriptionId: input.subscriptionId,
          amountCents: Number(input.amountCents ?? 0),
          currency: String(input.currency ?? "usd").toLowerCase(),
          attemptCount: Number(input.attemptCount ?? 1),
          failedAt: timestamp,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

      this.db
        .prepare(`
          UPDATE enrollments
          SET
            status = @status,
            payment_status = @paymentStatus,
            stripe_subscription_id = COALESCE(stripe_subscription_id, @subscriptionId),
            seat_hold_expires_at = @seatHoldExpiresAt,
            last_payment_failure_at = @failedAt,
            updated_at = @updatedAt
          WHERE id = @enrollmentId
            AND balance_due_cents > 0
        `)
        .run({
          enrollmentId: input.enrollmentId,
          subscriptionId: input.subscriptionId,
          status: Number(enrollment.paymentInstallmentsPaid ?? 0) > 0
            ? "payment_plan_attention"
            : "payment_setup_failed",
          paymentStatus: Number(enrollment.paymentInstallmentsPaid ?? 0) > 0
            ? "installment_failed"
            : "payment_failed",
          seatHoldExpiresAt: null,
          failedAt: timestamp,
          updatedAt: timestamp,
        });

      return { applied: true, enrollmentId: enrollment.id };
    });

    const result = applyFailure.immediate({
      enrollmentId,
      invoiceId,
      subscriptionId,
      amountCents,
      currency,
      attemptCount,
      failedAt,
    });

    return {
      applied: result.applied,
      enrollment: this.getEnrollmentById(result.enrollmentId),
    };
  }

  listEnrollmentPayments(enrollmentId) {
    return this.db
      .prepare(`
        SELECT
          stripe_invoice_id AS stripeInvoiceId,
          stripe_subscription_id AS stripeSubscriptionId,
          amount_cents AS amountCents,
          currency,
          status,
          attempt_count AS attemptCount,
          paid_at AS paidAt,
          failed_at AS failedAt,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM enrollment_payments
        WHERE enrollment_id = ?
        ORDER BY created_at ASC
      `)
      .all(enrollmentId);
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
        SELECT
          id,
          payment_option AS paymentOption,
          payment_amount_cents AS paymentAmountCents,
          tuition_total_cents AS tuitionTotalCents,
          balance_due_cents AS balanceDueCents,
          stripe_checkout_purpose AS stripeCheckoutPurpose
        FROM enrollments
        WHERE stripe_checkout_session_id = ?
      `)
      .get(sessionId);

    if (!record) {
      return null;
    }

    const paidAt = nowIso();
    const isBalancePayment = record.stripeCheckoutPurpose === "balance";
    const isDepositPayment =
      record.stripeCheckoutPurpose === "deposit" ||
      (record.paymentOption === "deposit" && Number(record.balanceDueCents ?? 0) > 0 && !isBalancePayment);

    this.db
      .prepare(`
        UPDATE enrollments
        SET
          status = @status,
          payment_status = @paymentStatus,
          balance_due_cents = @balanceDueCents,
          amount_paid_cents = @amountPaidCents,
          payment_installments_paid = 1,
          seat_hold_expires_at = NULL,
          last_payment_at = @paidAt,
          paid_at = @paidAt,
          updated_at = @updatedAt
        WHERE stripe_checkout_session_id = @sessionId
      `)
      .run({
        sessionId,
        status: isDepositPayment ? "payment_plan_active" : "registered",
        paymentStatus: isDepositPayment ? "deposit_paid" : "paid",
        balanceDueCents: isDepositPayment ? Number(record.balanceDueCents ?? 0) : 0,
        amountPaidCents: isDepositPayment
          ? Number(record.paymentAmountCents ?? 0)
          : Number(record.tuitionTotalCents ?? 0),
        paidAt,
        updatedAt: paidAt,
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
          e.amount_paid_cents AS amountPaidCents,
          e.payment_installments_total AS paymentInstallmentsTotal,
          e.payment_installments_paid AS paymentInstallmentsPaid,
          e.payment_interval AS paymentInterval,
          e.next_payment_due_at AS nextPaymentDueAt,
          e.last_payment_at AS lastPaymentAt,
          e.last_payment_failure_at AS lastPaymentFailureAt,
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
        amountPaidLabel: formatMoney(item.amountPaidCents),
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
    this.deleteExpiredAdminSessions();
    const now = nowIso();
    const metrics = this.db
      .prepare(`
        SELECT
          (SELECT COUNT(*) FROM cohorts WHERE is_active = 1) AS activeCohorts,
          (SELECT COUNT(*) FROM enrollments) AS enrollments,
          (SELECT COUNT(*) FROM enrollments WHERE payment_status = 'paid') AS paidEnrollments,
          (
            SELECT COUNT(*)
            FROM enrollments
            WHERE payment_status IN ('deposit_paid', 'payment_plan_active', 'installment_failed')
          ) AS activePaymentPlans,
          (SELECT COUNT(*) FROM admin_sessions WHERE expires_at > @now) AS activeAdminSessions,
          (
            SELECT COUNT(*)
            FROM enrollments
            WHERE payment_status IN ('payment_setup', 'checkout_pending')
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
          e.amount_paid_cents AS amountPaidCents,
          e.payment_installments_total AS paymentInstallmentsTotal,
          e.payment_installments_paid AS paymentInstallmentsPaid,
          e.next_payment_due_at AS nextPaymentDueAt,
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
      recentAdminActivity: this.listRecentAdminAuditEvents(),
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
