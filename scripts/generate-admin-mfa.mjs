import * as OTPAuth from "otpauth";

const username = (process.argv[2] ?? "admin").trim() || "admin";
const secret = new OTPAuth.Secret({ size: 20 });
const totp = new OTPAuth.TOTP({
  issuer: "First Step Healthcare Academy",
  label: username,
  algorithm: "SHA1",
  digits: 6,
  period: 30,
  secret,
});

console.log("Add a new setup key in your authenticator app, then store this value only in the server environment:");
console.log(`ADMIN_TOTP_SECRET=${secret.base32}`);
console.log("Authenticator URI (treat this as a secret too):");
console.log(totp.toString());
