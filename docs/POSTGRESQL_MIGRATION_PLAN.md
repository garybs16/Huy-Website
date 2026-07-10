# PostgreSQL Migration Plan

The current app uses SQLite through `better-sqlite3` at `DATABASE_URL=server/data/enrollment.db` locally and `/var/data/enrollment.db` in production examples. SQLite is reliable for the current app shape, but PostgreSQL is the stronger resume and scaling story once the site has real operational traffic.

## Recommended Timing

Move to PostgreSQL after confirming:

- The deployed host can provide a managed PostgreSQL database or can securely connect to one.
- A current SQLite backup has been downloaded and verified.
- There is a maintenance window for switching the production environment.
- The app has a rollback plan using the previous SQLite database file.

## Target Architecture

- Managed PostgreSQL database, such as Render PostgreSQL, Neon, Supabase, Railway PostgreSQL, AWS RDS, or DigitalOcean Managed PostgreSQL.
- `DATABASE_URL` becomes a PostgreSQL connection string.
- App migrations run before each production release.
- Backups are handled by the managed database provider plus app-level operational exports.

## Data Migration Steps

1. Create the PostgreSQL database and restrict access to the app service.
2. Export SQLite data from the existing admin export endpoint or directly from the SQLite file.
3. Create PostgreSQL schema for:
   - `programs`
   - `cohorts`
   - `enrollments`
   - `inquiries`
   - `waitlist`
   - `admin_sessions`
   - `admin_audit_log`
4. Import records while preserving IDs and timestamps.
5. Run smoke tests against a staging app pointed at PostgreSQL.
6. Switch production `DATABASE_URL` to PostgreSQL.
7. Run `npm run verify` and live `/api/health` checks.
8. Keep the old SQLite backup until several production days have passed.

## Code Work Required

The current database layer is intentionally centralized in `server/lib/enrollmentDb.js`, which makes the migration feasible. The main implementation work is to introduce a PostgreSQL-backed data class with the same public methods as `EnrollmentDatabase`, then choose the adapter based on the `DATABASE_URL` scheme.

Suggested implementation sequence:

1. Add `pg` dependency.
2. Extract shared row-mapping helpers from `server/lib/enrollmentDb.js`.
3. Add `server/lib/postgresEnrollmentDb.js`.
4. Add a `createEnrollmentDatabase(config.databasePath)` factory.
5. Update `server/index.js` to use the factory instead of directly constructing `EnrollmentDatabase`.
6. Add migration scripts and staging smoke tests.

## What Is Needed From Production

- Current hosting provider.
- Whether the app is deployed from GitHub, Render Blueprint, Docker, or another workflow.
- A secure PostgreSQL connection string.
- A recent SQLite backup or admin export.
- Permission to schedule a short deployment window.
