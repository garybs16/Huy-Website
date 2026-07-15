const DEFAULT_TIMEOUT_MS = 8000;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

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

async function sendResendEmail({ apiKey, from, replyTo, timeoutMs, to, subject, text, html }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
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

function safeSend(emailer, message) {
  if (!emailer?.enabled || !message?.to) {
    return;
  }

  emailer.send(message).catch((error) => {
    console.error(`Email notification failed: ${error.message}`);
  });
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

  const studentLines = [
    `Hi ${enrollment.studentFullName},`,
    "We received your registration for First Step Healthcare Academy.",
    `Enrollment ID: ${enrollment.id}`,
    `Program: ${programTitle}`,
    `Cohort: ${cohortTitle}`,
    schedule,
    paymentLine,
    enrollment.balanceDueCents > 0 ? `Remaining balance after deposit: ${balanceDue}.` : "",
    checkoutUrl ? `Payment link: ${checkoutUrl}` : "",
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
  ];

  safeSend(emailer, {
    to: emailer?.adminEmail,
    subject: `New registration: ${enrollment.studentFullName}`,
    text: adminLines.filter(Boolean).join("\n"),
    html: buildEmailHtml("New registration", adminLines),
  });
}

export function sendInquiryEmails(emailer, { record }) {
  const studentLines = [
    `Hi ${record.fullName},`,
    "We received your inquiry for First Step Healthcare Academy.",
    "Admissions will review your message and follow up as soon as possible.",
    `Reference ID: ${record.id}`,
  ];

  safeSend(emailer, {
    to: record.email,
    subject: "Inquiry received - First Step Healthcare Academy",
    text: studentLines.join("\n"),
    html: buildEmailHtml("Inquiry received", studentLines),
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
