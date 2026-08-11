import assert from "node:assert/strict";
import test from "node:test";
import { createEmailer, sendInquiryEmails } from "../server/lib/email.js";

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
