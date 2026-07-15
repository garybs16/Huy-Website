# Operations Runbook

This runbook documents the minimum production monitoring and response process for the deployed First Step Healthcare Academy website.

## Production URLs

- Public site: https://firststepha.com/
- Health endpoint: https://firststepha.com/api/health
- Admin dashboard: https://firststepha.com/admin

## Health Check

The app exposes `GET /api/health` for uptime checks. A healthy production response intentionally contains only:

- `status: "ok"`
- `timestamp` with the server check time

Detailed service configuration stays out of the public response. Review startup logs and the protected admin dashboard for operational details.

Run a manual check:

```bash
HEALTHCHECK_URL=https://firststepha.com/api/health npm run check:health
```

## Recommended Alerts

Configure an external uptime monitor such as Better Stack, UptimeRobot, Render health checks, AWS CloudWatch Synthetics, or a host-native HTTP check.

Recommended alert rules:

- Page if `GET /api/health` is not HTTP 200 for 2 consecutive checks.
- Page if `status` is not `ok`.

Recommended cadence:

- Check every 1 to 5 minutes.
- Alert after 2 failed checks.
- Re-notify every 30 to 60 minutes until resolved.

## Backup Checks

The production SQLite database is encrypted and copied off the server every day by the `Encrypted Production Database Backup` GitHub Actions workflow. Each backup:

- uses AES-256-GCM authenticated encryption with a repository-independent secret;
- is retained as a GitHub Actions artifact for 90 days;
- is downloaded onto a clean runner after upload;
- must decrypt successfully, pass `PRAGMA integrity_check`, and contain the required application tables.

Review the scheduled workflow regularly and investigate any failed run immediately. Before major changes:

1. Open the admin dashboard.
2. Create a database backup from the admin backup action.
3. Run the encrypted backup workflow manually.
4. Confirm both the backup job and clean-run recovery test pass.

To verify a downloaded encrypted backup without restoring production:

```bash
BACKUP_ENCRYPTION_KEY="..." npm run backup:encrypted -- verify --input=/safe/path/backup.fshabk
```

To decrypt into a new file for an authorized recovery operation:

```bash
BACKUP_ENCRYPTION_KEY="..." npm run backup:encrypted -- restore \
  --input=/safe/path/backup.fshabk \
  --output=/safe/new/path/restored-enrollment.db
```

The restore command refuses to overwrite an existing file. Validate the restored database before scheduling a controlled production replacement.

For PostgreSQL, use managed provider backups plus a periodic app-level export from `/api/admin/export`.

## Deployment Checklist

Before deploying:

```bash
npm run verify
```

After deploying:

```bash
HEALTHCHECK_URL=https://firststepha.com/api/health npm run check:health
```

Also verify:

- Public home page loads.
- Registration page loads cohorts.
- Admin login works.
- Stripe webhook endpoint is still configured in Stripe if payments are enabled.

## Incident Response

For database errors:

1. Check host disk availability and persistent volume mount.
2. Check `DATABASE_URL`.
3. Restart the app process once.
4. If the database file is corrupted or missing, restore from the newest verified backup.

For payment errors:

1. Confirm `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_APP_URL` are set together.
2. Confirm the Stripe webhook destination points to `/api/payments/stripe/webhook`.
3. Review recent Stripe webhook delivery attempts.
4. Use admin enrollment records to reconcile manual follow-up while payments are degraded.

For admin login errors:

1. Confirm `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` are configured together.
2. Confirm browser cookies are allowed for the deployed origin.
3. Use `API_ADMIN_KEY` fallback only when necessary.
