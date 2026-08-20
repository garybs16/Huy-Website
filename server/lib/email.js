import { readFile } from "node:fs/promises";

const DEFAULT_TIMEOUT_MS = 15000;
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const localAttachmentCache = new Map();
const GUIDE_EMAIL_ATTACHMENTS = [
  {
    filename: "CNA Career Starter Guide.pdf",
    fileUrl: new URL("../assets/guides/cna-career-starter-guide.pdf", import.meta.url),
  },
  {
    filename: "OC Nursing School Pathway Guide.pdf",
    fileUrl: new URL("../assets/guides/oc-nursing-school-pathway-guide.pdf", import.meta.url),
  },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMoney(cents) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(cents ?? 0) / 100);
}

function linesToHtml(lines) {
  return lines
    .filter((line) => line !== undefined && line !== null && line !== "")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("\n");
}

function buildEmailHtml(title, lines) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f8fb;color:#132033;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:28px 18px;">
      <div style="background:#ffffff;border:1px solid #dbe3ec;border-radius:10px;padding:24px;">
        <h1 style="margin:0 0 16px;color:#071f41;font-size:24px;line-height:1.2;">${escapeHtml(title)}</h1>
        <div style="font-size:15px;line-height:1.6;color:#39495f;">
          ${linesToHtml(lines)}
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildGuideEmailHtml(firstName, referenceId) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f3f6fb;color:#132033;font-family:Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:30px 18px;">
      <div style="overflow:hidden;border:1px solid #d7e1ee;border-radius:16px;background:#ffffff;box-shadow:0 16px 40px rgba(7,31,65,0.08);">
        <div style="padding:26px 28px;background:linear-gradient(135deg,#071f41,#2457c5);color:#ffffff;">
          <p style="margin:0 0 10px;color:#ffd36c;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;">Your free guides</p>
          <h1 style="margin:0;font-size:28px;line-height:1.18;">Thank you for taking the first step.</h1>
        </div>
        <div style="padding:28px;color:#39495f;font-size:15px;line-height:1.65;">
          <p style="margin:0 0 16px;">Hi ${escapeHtml(firstName)},</p>
          <p style="margin:0 0 18px;">Your two free nursing guides are attached and ready to explore:</p>
          <div style="margin:0 0 20px;padding:16px 18px;border:1px solid #dbe5f2;border-radius:12px;background:#f7faff;">
            <p style="margin:0 0 8px;color:#071f41;font-weight:800;">CNA Career Starter Guide</p>
            <p style="margin:0;color:#071f41;font-weight:800;">OC Nursing School Pathway Guide</p>
          </div>
          <p style="margin:0 0 18px;">Use them to understand your options, plan your next move, and move forward with confidence.</p>
          <p style="margin:0 0 22px;color:#071f41;font-size:17px;font-weight:800;line-height:1.5;">Every meaningful healthcare career begins with one clear step - and you have already taken it.</p>
          <p style="margin:0 0 22px;">Questions? Reply to this email. Our admissions team is happy to help.</p>
          <p style="margin:0;color:#071f41;font-weight:800;">With encouragement,<br>First Step Healthcare Academy</p>
          <p style="margin:22px 0 0;color:#718096;font-size:12px;">Request reference: ${escapeHtml(referenceId)}</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

async function prepareAttachments(attachments = []) {
  return Promise.all(
    attachments.map(async ({ fileUrl, ...attachment }) => {
      if (!fileUrl) {
        return attachment;
      }

      const cacheKey = fileUrl.href ?? String(fileUrl);
      let content = localAttachmentCache.get(cacheKey);
      if (!content) {
        content = await readFile(fileUrl, { encoding: "base64" });
        localAttachmentCache.set(cacheKey, content);
      }

      return { ...attachment, content };
    })
  );
}

async function sendResendEmail({ apiKey, from, replyTo, timeoutMs, to, subject, text, html, attachments }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const preparedAttachments = await prepareAttachments(attachments);
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        text,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
        ...(preparedAttachments.length ? { attachments: preparedAttachments } : {}),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Email provider returned ${response.status}${body ? `: ${body}` : ""}`);
    }

    return true;
  } finally {
    clearTimeout(timeout);
  }
}

export function createEmailer({
  resendApiKey,
  from,
  replyTo,
  adminEmail,
  timeoutMs = DEFAULT_TIMEOUT_MS,
} = {}) {
  const enabled = Boolean(resendApiKey && from);

  async function send(message) {
    if (!enabled || !message?.to) {
      return false;
    }

    return sendResendEmail({
      apiKey: resendApiKey,
      from,
      replyTo,
      timeoutMs,
      ...message,
    });
  }

  return {
    enabled,
    adminEmail,
    send,
  };
}

async function safeSend(emailer, message) {
  if (!emailer?.enabled || !message?.to) {
    return false;
  }

  try {
    await emailer.send(message);
    return true;
  } catch (error) {
    console.error(`Email notification failed: ${error.message}`);
    return false;
  }
}

export function sendEnrollmentEmails(emailer, { enrollment, program, cohort, paymentRequired, checkoutUrl }) {
  const amountDue = formatMoney(enrollment.paymentAmountCents);
  const balanceDue = formatMoney(enrollment.balanceDueCents);
  const programTitle = program?.title ?? enrollment.programId ?? "CNA program";
  const cohortTitle = cohort?.title ?? enrollment.cohortId ?? "selected cohort";
  const schedule = cohort?.meetingPattern ? `Schedule: ${cohort.meetingPattern}` : "";
  const paymentLine = paymentRequired
    ? `Next step: complete your payment checkout for ${amountDue}.`
    : `Admissions will contact you about payment. Amount due now: ${amountDue}.`;

  // The code is useless if the student never learns they have one, and this email is
  // the thing they keep. The credit line only appears when a code was actually used.
  const referralCreditLine =
    Number(enrollment.referralCreditCents ?? 0) > 0
      ? `Referral credit applied: ${formatMoney(enrollment.referralCreditCents)} off your program total.`
      : "";
  const referralCodeLines = enrollment.referralCode
    ? [
        `Your referral code: ${enrollment.referralCode}`,
        "Share it with anyone considering CNA training. They get $100 off their program total, and you receive a $100 check once both of you fully attend your designated first week of theory.",
      ]
    : [];

  const studentLines = [
    `Hi ${enrollment.studentFullName},`,
    "We received your registration for First Step Healthcare Academy.",
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    schedule,
    paymentLine,
    referralCreditLine,
    enrollment.balanceDueCents > 0 ? `Remaining tuition balance after registration: ${balanceDue}.` : "",
    checkoutUrl ? `Payment link: ${checkoutUrl}` : "",
    ...referralCodeLines,
    "Admissions will review your submission and follow up with next steps.",
  ];

  safeSend(emailer, {
    to: enrollment.email,
    subject: "Registration received - First Step Healthcare Academy",
    text: studentLines.filter(Boolean).join("\n"),
    html: buildEmailHtml("Registration received", studentLines),
  });

  const adminLines = [
    "A new registration was submitted.",
    `Student: ${enrollment.studentFullName}`,
    `Email: ${enrollment.email}`,
    `Phone: ${enrollment.phone || "Not provided"}`,
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    schedule,
    `Payment status: ${enrollment.paymentStatus}`,
    `Amount due now: ${amountDue}`,
    enrollment.balanceDueCents > 0 ? `Remaining balance: ${balanceDue}` : "",
    enrollment.referredByCode ? `Referred by code: ${enrollment.referredByCode}` : "",
    referralCreditLine,
  ];

  safeSend(emailer, {
    to: emailer?.adminEmail,
    subject: `New registration: ${enrollment.studentFullName}`,
    text: adminLines.filter(Boolean).join("\n"),
    html: buildEmailHtml("New registration", adminLines),
  });
}

export async function sendInquiryEmails(emailer, { record }) {
  const isGuideRequest = ["home-free-handouts", "rewards-free-handouts"].includes(record.source);
  const firstName = record.fullName.trim().split(/\s+/)[0] || "there";
  const guideLines = [
    `Hi ${firstName},`,
    "Thank you for taking the first step toward your nursing future.",
    "Your two free guides are attached:",
    "- CNA Career Starter Guide",
    "- OC Nursing School Pathway Guide",
    "Use them to understand your options, plan your next move, and move forward with confidence.",
    "Every meaningful healthcare career begins with one clear step - and you have already taken it.",
    "Questions? Reply to this email. Our admissions team is happy to help.",
    "With encouragement,",
    "First Step Healthcare Academy",
    `Request reference: ${record.id}`,
  ];
  const studentLines = [
    `Hi ${record.fullName},`,
    "We received your inquiry for First Step Healthcare Academy.",
    "Admissions will review your message and follow up as soon as possible.",
    `Reference ID: ${record.id}`,
  ];

  const studentSent = await safeSend(emailer, {
    to: record.email,
    subject: isGuideRequest ? "Your free nursing guides are here" : "Inquiry received - First Step Healthcare Academy",
    text: (isGuideRequest ? guideLines : studentLines).join("\n"),
    html: isGuideRequest
      ? buildGuideEmailHtml(firstName, record.id)
      : buildEmailHtml("Inquiry received", studentLines),
    ...(isGuideRequest ? { attachments: GUIDE_EMAIL_ATTACHMENTS } : {}),
  });

  const adminLines = [
    "A new inquiry was submitted.",
    `Name: ${record.fullName}`,
    `Email: ${record.email}`,
    `Phone: ${record.phone || "Not provided"}`,
    `Program: ${record.program}`,
    `Source: ${record.source || "contact form"}`,
    `Message: ${record.message}`,
  ];

  safeSend(emailer, {
    to: emailer?.adminEmail,
    subject: `New inquiry: ${record.fullName}`,
    text: adminLines.join("\n"),
    html: buildEmailHtml("New inquiry", adminLines),
  });

  return { studentSent };
}

export function sendWaitlistEmails(emailer, { record }) {
  const studentLines = [
    `Hi ${record.fullName},`,
    "We received your waitlist request for First Step Healthcare Academy.",
    "Admissions will contact you when relevant cohort or schedule information is available.",
    `Reference ID: ${record.id}`,
  ];

  safeSend(emailer, {
    to: record.email,
    subject: "Waitlist request received - First Step Healthcare Academy",
    text: studentLines.join("\n"),
    html: buildEmailHtml("Waitlist request received", studentLines),
  });

  const adminLines = [
    "A new waitlist request was submitted.",
    `Name: ${record.fullName}`,
    `Email: ${record.email}`,
    `Phone: ${record.phone || "Not provided"}`,
    `Track preference: ${record.trackPreference || "Not specified"}`,
    `Notes: ${record.notes || "None"}`,
  ];

  safeSend(emailer, {
    to: emailer?.adminEmail,
    subject: `New waitlist request: ${record.fullName}`,
    text: adminLines.join("\n"),
    html: buildEmailHtml("New waitlist request", adminLines),
  });
}

export function sendPaymentCompletedEmails(emailer, { enrollment, program, cohort, amountPaidCents, invoiceUrl }) {
  const amountPaid = formatMoney(
    amountPaidCents ?? (
      enrollment.stripeCheckoutPurpose === "balance" ? enrollment.balanceDueCents : enrollment.paymentAmountCents
    )
  );
  const programTitle = program?.title ?? enrollment.programId ?? "CNA program";
  const cohortTitle = cohort?.title ?? enrollment.cohortId ?? "selected cohort";

  const studentLines = [
    `Hi ${enrollment.studentFullName},`,
    "Your payment was received.",
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    `Payment received: ${amountPaid}`,
    enrollment.paymentInstallmentsTotal > 1
      ? `Payment ${enrollment.paymentInstallmentsPaid} of ${enrollment.paymentInstallmentsTotal} is complete.`
      : "",
    enrollment.balanceDueCents > 0 ? `Remaining tuition balance: ${formatMoney(enrollment.balanceDueCents)}.` : "Paid in full.",
    enrollment.nextPaymentDueAt ? `Next automatic payment: ${new Date(enrollment.nextPaymentDueAt).toLocaleDateString("en-US")}.` : "",
    invoiceUrl ? `Stripe invoice and receipt: ${invoiceUrl}` : "",
    "Admissions will follow up with any remaining class readiness steps.",
  ];

  safeSend(emailer, {
    to: enrollment.email,
    subject: "Payment received - First Step Healthcare Academy",
    text: studentLines.join("\n"),
    html: buildEmailHtml("Payment received", studentLines),
  });

  const adminLines = [
    "A student payment was completed.",
    `Student: ${enrollment.studentFullName}`,
    `Email: ${enrollment.email}`,
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    `Payment status: ${enrollment.paymentStatus}`,
    `Payment received: ${amountPaid}`,
    enrollment.paymentInstallmentsTotal > 1
      ? `Installments: ${enrollment.paymentInstallmentsPaid} of ${enrollment.paymentInstallmentsTotal}`
      : "",
    `Remaining balance: ${formatMoney(enrollment.balanceDueCents)}`,
    `Paid at: ${enrollment.paidAt || "Recorded by Stripe webhook"}`,
  ];

  safeSend(emailer, {
    to: emailer?.adminEmail,
    subject: `Payment received: ${enrollment.studentFullName}`,
    text: adminLines.join("\n"),
    html: buildEmailHtml("Payment received", adminLines),
  });
}

export function sendPaymentFailedEmails(emailer, { enrollment, program, cohort, amountDueCents, invoiceUrl }) {
  const amountDue = formatMoney(amountDueCents ?? enrollment.paymentAmountCents);
  const programTitle = program?.title ?? enrollment.programId ?? "CNA program";
  const cohortTitle = cohort?.title ?? enrollment.cohortId ?? "selected cohort";
  const studentLines = [
    `Hi ${enrollment.studentFullName},`,
    `Stripe could not collect your scheduled ${amountDue} weekly payment.`,
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    `Remaining tuition balance: ${formatMoney(enrollment.balanceDueCents)}.`,
    invoiceUrl ? `Review or pay the Stripe invoice: ${invoiceUrl}` : "",
    "Please update your payment method in Stripe or contact admissions for help.",
  ];

  safeSend(emailer, {
    to: enrollment.email,
    subject: "Weekly payment needs attention - First Step Healthcare Academy",
    text: studentLines.filter(Boolean).join("\n"),
    html: buildEmailHtml("Weekly payment needs attention", studentLines),
  });

  const adminLines = [
    "A scheduled tuition payment failed.",
    `Student: ${enrollment.studentFullName}`,
    `Email: ${enrollment.email}`,
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    `Attempted amount: ${amountDue}`,
    `Remaining balance: ${formatMoney(enrollment.balanceDueCents)}`,
  ];

  safeSend(emailer, {
    to: emailer?.adminEmail,
    subject: `Payment failed: ${enrollment.studentFullName}`,
    text: adminLines.join("\n"),
    html: buildEmailHtml("Scheduled payment failed", adminLines),
  });
}
