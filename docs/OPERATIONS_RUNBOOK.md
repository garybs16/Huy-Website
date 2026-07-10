# Operations Runbook

This runbook documents the minimum production monitoring and response process for the deployed First Step Healthcare Academy website.

## Production URLs

- Public site: https://firststepha.com/
- Health endpoint: https://firststepha.com/api/health
- Admin dashboard: https://firststepha.com/admin

## Health Check

The app exposes `GET /api/health` for uptime checks. A healthy response includes:

- `status: "ok"`
- `services.database: "ok"`
- `services.admin` set to `session`, `api-key`, or `hybrid`
- `services.payments` set to `configured` when Stripe is fully enabled, or `manual` when admissions follow-up is required
- `services.notifications` set to `configured` when the admissions webhook is configured

Run a manual check:

```bash
HEALTHCHECK_URL=https://firststepha.com/api/health npm run check:health
```

## Recommended Alerts

Configure an external uptime monitor such as Better Stack, UptimeRobot, Render health checks, AWS CloudWatch Synthetics, or a host-native HTTP check.

Recommended alert rules:

- Page if `GET /api/health` is not HTTP 200 for 2 consecutive checks.
- Page if `status` is not `ok`.
- Page if `services.database` is not `ok`.
- Notify, but do not page, if `services.payments` changes from `configured` to `manual`.
- Notify, but do not page, if `services.notifications` changes from `configured` to `manual`.

Recommended cadence:

- Check every 1 to 5 minutes.
- Alert after 2 failed checks.
- Re-notify every 30 to 60 minutes until resolved.

## Backup Checks

SQLite production deployments must use persistent storage. Before major changes:

1. Open the admin dashboard.
2. Create a database backup from the admin backup action.
3. Download or copy the backup off the server.
4. Confirm the backup file is not empty.

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
