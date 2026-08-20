import assert from "node:assert/strict";
import test from "node:test";
import { createEmailer, sendInquiryEmails, sendPaymentCompletedEmails, sendPaymentFailedEmails } from "../server/lib/email.js";

test("guide requests produce an encouraging email with both PDF attachments", async () => {
  const messages = [];
  const emailer = {
    enabled: true,
    adminEmail: "",
    async send(message) {
      messages.push(message);
      return true;
    },
  };

  const result = await sendInquiryEmails(emailer, {
    record: {
      id: "guide-request-123",
      fullName: "Jordan Student",
      email: "jordan@example.com",
      phone: "949-555-0100",
      program: "cna",
      source: "home-free-handouts",
      message: "Please send both guides.",
    },
  });

  assert.equal(result.studentSent, true);
  assert.equal(messages.length, 1);
  assert.equal(messages[0].subject, "Your free nursing guides are here");
  assert.match(messages[0].text, /Thank you for taking the first step/);
  assert.match(messages[0].text, /you have already taken it/);
  assert.deepEqual(
    messages[0].attachments.map(({ filename }) => filename),
    ["CNA Career Starter Guide.pdf", "OC Nursing School Pathway Guide.pdf"]
  );
});

test("Resend payload contains valid Base64 PDF attachments", async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({ id: "email-123" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const emailer = createEmailer({
      resendApiKey: "re_test_key",
      from: "First Step <admissions@example.com>",
    });

    await emailer.send({
      to: "student@example.com",
      subject: "Guide",
      text: "Attached",
      html: "<p>Attached</p>",
      attachments: [
        {
          filename: "CNA Career Starter Guide.pdf",
          fileUrl: new URL("../server/assets/guides/cna-career-starter-guide.pdf", import.meta.url),
        },
        {
          filename: "OC Nursing School Pathway Guide.pdf",
          fileUrl: new URL("../server/assets/guides/oc-nursing-school-pathway-guide.pdf", import.meta.url),
        },
      ],
    });
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(requestBody.attachments.length, 2);
  for (const attachment of requestBody.attachments) {
    assert.match(attachment.content, /^[A-Za-z0-9+/]+=*$/);
    assert.equal(Buffer.from(attachment.content, "base64").subarray(0, 4).toString("ascii"), "%PDF");
  }
});

test("a failed biweekly installment tells the student biweekly, not weekly", async () => {
  const messages = [];
  const emailer = {
    enabled: true,
    adminEmail: "admissions@example.com",
    async send(message) {
      messages.push(message);
      return true;
    },
  };

  await sendPaymentFailedEmails(emailer, {
    enrollment: {
      id: "enrollment-biweekly-1",
      studentFullName: "Jordan Student",
      email: "jordan@example.com",
      paymentOption: "biweekly",
      paymentAmountCents: 29_166,
      balanceDueCents: 145_830,
    },
    program: { title: "CNA Program" },
    cohort: { title: "Weekday Cohort" },
    amountDueCents: 29_166,
    invoiceUrl: null,
  });

  const studentEmail = messages.find((message) => message.to === "jordan@example.com");
  assert.match(studentEmail.text, /\$291\.66 biweekly payment/);
  assert.doesNotMatch(studentEmail.text, /[^i]weekly payment/);
});

test("a failed weekly installment still says weekly", async () => {
  const messages = [];
  const emailer = {
    enabled: true,
    adminEmail: "admissions@example.com",
    async send(message) {
      messages.push(message);
      return true;
    },
  };

  await sendPaymentFailedEmails(emailer, {
    enrollment: {
      id: "enrollment-weekly-1",
      studentFullName: "Jordan Student",
      email: "jordan@example.com",
      paymentOption: "weekly",
      paymentAmountCents: 14_583,
      balanceDueCents: 87_498,
    },
    program: { title: "CNA Program" },
    cohort: { title: "Weekday Cohort" },
    amountDueCents: 14_583,
    invoiceUrl: null,
  });

  const studentEmail = messages.find((message) => message.to === "jordan@example.com");
  assert.match(studentEmail.text, /\$145\.83 weekly payment/);
});

test("a student's first payment confirms their registration and hands them their referral code", async () => {
  const messages = [];
  const emailer = {
    enabled: true,
    adminEmail: "admissions@example.com",
    async send(message) {
      messages.push(message);
      return true;
    },
  };

  await sendPaymentCompletedEmails(emailer, {
    enrollment: {
      id: "enrollment-first-payment",
      studentFullName: "Jon Diaz",
      email: "jon@example.com",
      paymentOption: "weekly",
      paymentInstallmentsTotal: 12,
      paymentInstallmentsPaid: 0,
      balanceDueCents: 175_000,
      referralCode: "FSHA-7K2MA",
    },
    program: { title: "Certified Nurse Assistant" },
    cohort: { title: "Weekday Cohort", meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM" },
    amountPaidCents: 25_000,
    isFirstPayment: true,
  });

  const studentEmail = messages.find((message) => message.to === "jon@example.com");
  assert.equal(studentEmail.subject, "Registration confirmed - First Step Healthcare Academy");
  assert.match(studentEmail.text, /Schedule: Monday to Friday/);
  assert.match(studentEmail.text, /Your referral code: FSHA-7K2MA/);
  assert.match(studentEmail.text, /\$100 check once both of you fully attend/);
});

test("a later installment is a plain receipt with no schedule or referral code repeated", async () => {
  const messages = [];
  const emailer = {
    enabled: true,
    adminEmail: "admissions@example.com",
    async send(message) {
      messages.push(message);
      return true;
    },
  };

  await sendPaymentCompletedEmails(emailer, {
    enrollment: {
      id: "enrollment-later-installment",
      studentFullName: "Jon Diaz",
      email: "jon@example.com",
      paymentOption: "weekly",
      paymentInstallmentsTotal: 12,
      paymentInstallmentsPaid: 3,
      balanceDueCents: 130_000,
      referralCode: "FSHA-7K2MA",
    },
    program: { title: "Certified Nurse Assistant" },
    cohort: { title: "Weekday Cohort", meetingPattern: "Monday to Friday | 9:00 AM to 1:00 PM" },
    amountPaidCents: 14_583,
    isFirstPayment: false,
  });

  const studentEmail = messages.find((message) => message.to === "jon@example.com");
  assert.equal(studentEmail.subject, "Payment received - First Step Healthcare Academy");
  assert.doesNotMatch(studentEmail.text, /Schedule:/);
  assert.doesNotMatch(studentEmail.text, /referral code/);
});
