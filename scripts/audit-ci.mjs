import { spawnSync } from "node:child_process";

const allowedAdvisories = new Set([
  // This app uses React Router only as a client-side Vite SPA. It does not use
  // React Server Components, server actions, or React Router's RSC handlers.
  "GHSA-qwww-vcr4-c8h2",
]);

const auditCommand = process.platform === "win32" ? (process.env.ComSpec ?? "cmd.exe") : "npm";
const auditArguments =
  process.platform === "win32" ? ["/d", "/s", "/c", "npm audit --json"] : ["audit", "--json"];

const audit = spawnSync(auditCommand, auditArguments, {
  encoding: "utf8",
});

let report;

try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error(audit.stderr || audit.stdout || "npm audit did not return valid JSON.");
  process.exit(1);
}

const vulnerabilities = report.vulnerabilities ?? {};

function isAllowed(name, seen = new Set()) {
  if (seen.has(name)) {
    return true;
  }

  const vulnerability = vulnerabilities[name];
  if (!vulnerability) {
    return false;
  }

  seen.add(name);

  return vulnerability.via.every((cause) => {
    if (typeof cause === "string") {
      return isAllowed(cause, seen);
    }

    const advisoryId = cause.url?.split("/").pop();
    return allowedAdvisories.has(advisoryId);
  });
}

const blocked = Object.keys(vulnerabilities).filter((name) => !isAllowed(name));
const allowed = Object.keys(vulnerabilities).filter((name) => isAllowed(name));

if (allowed.length > 0) {
  console.warn(
    `Allowed non-applicable advisories: ${allowed.join(", ")} (${[...allowedAdvisories].join(", ")}).`
  );
}

if (blocked.length > 0) {
  console.error(`npm audit found actionable vulnerabilities: ${blocked.join(", ")}`);
  process.exit(1);
}

console.log("Dependency audit passed.");
