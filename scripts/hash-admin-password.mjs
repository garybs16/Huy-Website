import { createPasswordHash } from "../server/lib/adminSecurity.js";

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run admin:hash -- \"your-admin-password\"");
  process.exit(1);
}

console.log(createPasswordHash(password));
