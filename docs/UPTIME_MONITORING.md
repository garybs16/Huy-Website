# Production uptime monitoring

GitHub Actions runs **Monitor Production Uptime** every 15 minutes and can also be run manually from the Actions tab. It checks:

- `https://firststepha.com/api/health` returns a healthy response over HTTPS.
- The public homepage still sends the HSTS, Content-Security-Policy, and `X-Content-Type-Options: nosniff` security headers.

A failed run is visible in the repository's **Actions** tab. Repository owners should enable GitHub notifications for failed workflow runs so the operational team is alerted.

This is an automated availability check, not a replacement for a third-party monitoring service with SMS or phone-call escalation. Add one later if immediate after-hours paging is required.
