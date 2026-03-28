import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const tempDataDir = await mkdtemp(path.join(os.tmpdir(), "pcahi-harmony-"));
  process.env.DATA_DIR = tempDataDir;
  const { startServer } = await import("../server/index.js");
  const port = 4020;
  const { server } = startServer(port);

  try {
    const programsRes = await fetch(`http://localhost:${port}/api/programs`);
    assert(programsRes.ok, "Failed to load programs from API");
    const programsBody = await programsRes.json();
    assert(Array.isArray(programsBody.items), "Programs payload must contain items array");
    assert(programsBody.items.length > 0, "Programs array cannot be empty");

    const firstProgramId = programsBody.items[0].id;

    const inquiryRes = await fetch(`http://localhost:${port}/api/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Harmony Check",
        email: "harmony-check@example.com",
        program: firstProgramId,
        message: "Backend and frontend contract smoke check.",
      }),
    });
    assert(inquiryRes.status === 201, "Inquiry submission failed contract check");

    const waitlistRes = await fetch(`http://localhost:${port}/api/waitlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Waitlist Harmony",
        email: "waitlist-harmony@example.com",
      }),
    });
    assert(waitlistRes.status === 201, "Waitlist submission failed contract check");

    console.log("Harmony check passed.");
  } finally {
    await new Promise((resolve) => server.close(resolve));
    await rm(tempDataDir, { recursive: true, force: true });
  }
}

run().catch((error) => {
  console.error(`Harmony check failed: ${error.message}`);
  process.exit(1);
});
