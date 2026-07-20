# First Step Healthcare Academy Website

Live site: https://firststepha.com/

## Resume Summary

Full-stack production website for a healthcare training academy, built with React, Vite, Node.js, Express, and SQLite. The application supports public program discovery, admissions inquiries, waitlist requests, enrollment submission, payment-plan tracking, Stripe Checkout integration, and a protected admin dashboard for operational data.

## Suggested Resume Bullet

- Built and deployed a full-stack admissions and enrollment platform for First Step Healthcare Academy using React, Express, SQLite, and Stripe, including protected admin workflows, cohort capacity tracking, payment-plan records, production health checks, and deployment automation.

## Technical Highlights

- React/Vite single-page frontend with public pages for programs, admissions, schedule, registration, contact, and payment status.
- Express API serving enrollment, inquiry, waitlist, cohort, program, admin, payment, and health endpoints.
- SQLite persistence through `better-sqlite3` for cohorts, enrollments, inquiries, waitlist submissions, admin sessions, audit logs, and operational backups.
- Admin authentication with signed `HttpOnly` cookies, PBKDF2 password hashes, CSRF protection, API-key fallback, and audit logging.
- Stripe Checkout support for full tuition and finite weekly or biweekly payment plans, with webhook-based payment confirmation.
- Production readiness scripts for build verification, API contract checks, content regression checks, database readiness, backup creation, and health checks.
- GitHub Actions workflow that runs the full verification gate before deployment.
- Operations runbook for health checks, alert rules, backup checks, deployment checks, and incident response.

## Quality Signals

- `npm test`: Node test suite for authentication security helpers and database capacity behavior.
- `npm run check:readiness`: validates enrollment capacity holds, expired hold release, operational export, and SQLite backup creation.
- `npm run check:harmony`: validates public API, admin login/session flow, CRUD operations, and frontend/backend contract assumptions.
- `npm run check:production`: validates the built production frontend and API served from one Express service.
- `npm run verify`: runs build, dependency audit, automated tests, content regression, readiness, harmony, and production checks.
- README includes live-site screenshots and a CI status badge.

## Honest Production Note

The current deployed architecture uses SQLite with persistent storage. That is a real production database for a small operational site, but a future scaling milestone would be a managed PostgreSQL database with scheduled backups, migration tooling, and observability.

## Upgrade Path Toward 9/10

- Add managed PostgreSQL for higher concurrency and managed backup workflows.
- Wire the documented uptime alert rules into the production host or an external monitoring service.
- Add short demo clips if the portfolio needs more visual proof than screenshots.
- Add CI status badges after GitHub Actions is confirmed on the deployed repository.
