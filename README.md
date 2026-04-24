# Healthcare Academy Website (React + Node API)

This project now includes:

- A React/Vite frontend
- A Node/Express backend API for admissions, registration, and operations
- SQLite-backed storage for cohorts, enrollments, inquiries, and waitlist
- Stripe Checkout support for online tuition payment
- Cohort-level payment-plan support with deposit-now / balance-later tracking
- An admin dashboard section in the frontend backed by protected APIs
- Admin CRUD for programs and cohorts backed by SQLite
- Session-based admin login with signed cookies, audit logging, and API-key fallback

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
Copy-Item .env.example .env
```

3. Run frontend + backend together:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173` and API runs on `http://localhost:4000`.

## Environment variables

- `PORT`: API port (default `4000`)
- `CORS_ORIGINS`: allowed origins, comma-separated
- `API_ADMIN_KEY`: optional fallback admin credential for scripts, smoke tests, or emergency access
- `ADMIN_USERNAME`: admin login username for browser session auth
- `ADMIN_PASSWORD`: optional plain admin password that will be hashed at runtime if `ADMIN_PASSWORD_HASH` is not set
- `ADMIN_PASSWORD_HASH`: PBKDF2 password hash for admin login
- `ADMIN_SESSION_SECRET`: HMAC secret used to sign admin session cookies
- `ADMIN_SESSION_COOKIE_SAME_SITE`: cookie SameSite policy for admin sessions (`lax` by default, use `none` for separate frontend/API origins over HTTPS)
- `ADMIN_SESSION_TTL_HOURS`: admin session lifetime in hours (default `12`)
- `DATA_DIR`: mounted directory for persistent app storage
- `DATABASE_URL`: SQLite database file for cohorts, enrollments, inquiries, and waitlist
- `STATIC_DIR`: built frontend directory to serve in production (default `dist`)
- `SERVE_STATIC_APP`: serve the built frontend from Express (`true` in production by default)
- `TRUST_PROXY`: trust upstream proxy headers (`true` in production by default)
- `PUBLIC_APP_URL`: absolute public app URL used for Stripe Checkout redirects
- `STRIPE_SECRET_KEY`: Stripe secret key for Checkout session creation
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret for payment confirmation
- `NOTIFICATION_WEBHOOK_URL`: optional admissions notification webhook for inquiries, waitlist, enrollments, and payment events
- `NOTIFICATION_WEBHOOK_SECRET`: optional HMAC secret sent as `x-first-step-signature` for webhook verification
- `VITE_DEV_API_TARGET`: Vite proxy target in development
- `VITE_API_BASE_URL`: optional absolute API base URL for production frontend
- `VITE_PUBLIC_BASE_PATH`: frontend base path used at build time (`/` for app hosting, `/Huy-Website/` for GitHub Pages)

## Scripts

- `npm run dev`: run API + frontend in parallel
- `npm run dev:server`: run API only (nodemon)
- `npm run dev:client`: run frontend only (Vite)
- `npm run start`: run API server in production mode
- `npm run admin:hash -- "YourPasswordHere"`: generate a secure admin password hash for `.env`
- `npm run check:harmony`: smoke test API contract compatibility
- `npm run check:production`: smoke test the built frontend + Express API together in production mode
- `npm run check:readiness`: verify seat-hold capacity protection, expired hold cleanup, operational export, and SQLite backup creation
- `npm run verify`: run build, dependency audit, readiness check, API smoke test, and production smoke test
- `npm run build`: build frontend
- `npm run preview`: preview frontend build

## API endpoints

- `GET /api/health`: server health check
- `GET /api/programs`: program list
- `POST /api/inquiries`: submit contact inquiry
- `POST /api/waitlist`: submit waitlist request
- `GET /api/cohorts`: live cohort availability with remaining seats
- `POST /api/enrollments`: create enrollment with `paymentOption: "full" | "deposit"` and return Stripe Checkout URL when configured
- `GET /api/enrollments/:id/status`: enrollment payment/status verification after checkout
- `GET /api/admin/overview`: admin metrics and cohort capacity summary
- `GET /api/admin/export`: admin-only operational JSON export
- `POST /api/admin/backups`: admin-only SQLite backup creation
- `GET /api/admin/session`: return current admin session state
- `POST /api/admin/login`: start admin browser session
- `POST /api/admin/logout`: clear admin browser session
- `GET /api/admin/programs`: admin-only program list
- `POST /api/admin/programs`: admin-only program create
- `PATCH /api/admin/programs/:id`: admin-only program update
- `DELETE /api/admin/programs/:id`: admin-only program delete
- `GET /api/admin/cohorts`: admin-only cohort list
- `POST /api/admin/cohorts`: admin-only cohort create
- `PATCH /api/admin/cohorts/:id`: admin-only cohort update
- `DELETE /api/admin/cohorts/:id`: admin-only cohort delete
- `GET /api/inquiries`: admin-only inquiry list (requires `x-api-key`)
- `GET /api/waitlist`: admin-only waitlist list (requires `x-api-key`)
- `GET /api/enrollments`: admin-only enrollment list (requires `x-api-key`)
- `POST /api/payments/stripe/webhook`: Stripe webhook endpoint for payment completion

## Data persistence

Admissions data is stored in a single SQLite database:

- `server/data/enrollment.db`

This database now includes:

- cohorts
- enrollments
- inquiries
- waitlist submissions

Payment-plan data is also persisted:

- cohorts can enable `allow_payment_plan` and store `payment_plan_deposit_cents`
- enrollments store `payment_option`, `payment_amount_cents`, `tuition_total_cents`, and `balance_due_cents`

Important:

- Durable production operation still requires persistent disk.
- Payment confirmation depends on Stripe webhook delivery.
- The admin dashboard can use signed browser sessions or `API_ADMIN_KEY` fallback access.
- Expired Stripe seat holds are now released automatically by the backend even if the webhook expiry event is delayed.
- Seeded programs and cohorts are inserted only when missing, so admin edits persist across restarts.

## Production readiness

- Production startup requires at least one protected admin access path.
- Stripe Checkout only starts when `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_APP_URL` are all configured together.
- If Stripe is not configured, enrollments still work in manual payment mode and admissions can follow up directly.
- `GET /api/health` now reports database readiness plus whether payments are configured or manual.
- In production, configure either full session auth (`ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD`, plus `ADMIN_SESSION_SECRET`) or `API_ADMIN_KEY`. Hybrid mode supports both.

## Admin auth

- Preferred setup: browser login with `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `ADMIN_SESSION_SECRET`
- Faster deployment setup: `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`
- Generate `ADMIN_PASSWORD_HASH` with:

```bash
npm run admin:hash -- "YourStrongAdminPassword"
```

- The frontend admin page uses signed `HttpOnly` cookies when session auth is configured.
- `API_ADMIN_KEY` remains available as a fallback for smoke tests, scripts, or emergency access.
- Same-origin deployment is the most reliable setup for browser session auth.
- If the frontend and API run on different origins, set `CORS_ORIGINS` to the frontend origin, build the frontend with `VITE_API_BASE_URL`, and set `ADMIN_SESSION_COOKIE_SAME_SITE=none` for HTTPS deployments.
- Some browsers apply stricter third-party cookie rules, so `API_ADMIN_KEY` remains the safest fallback for separate-origin admin access.
- If you use `ADMIN_PASSWORD`, the server hashes it at startup so browser login still uses the same verification path.

## Payment flow

- Each cohort can be configured for full payment only, or full payment plus a deposit plan.
- A deposit plan charges only the configured deposit amount through Stripe Checkout.
- The remaining balance stays attached to the enrollment record and is surfaced in admin for follow-up.
- The current implementation is a school-friendly MVP payment plan, not automatic recurring billing.

## Deployment note

You now have two deployment modes:

1. Single-service production deploy (recommended)

- Run `npm run build`
- Run `npm run start`
- In production, Express will serve both the built frontend and the API from the same origin
- This avoids the GitHub Pages + separate API mismatch entirely
- Run `npm run verify` before shipping any production build
- Configure `NOTIFICATION_WEBHOOK_URL` if admissions staff need immediate alerts outside the dashboard

2. GitHub Pages frontend + separate API

- GitHub Pages can host the frontend build only
- The backend must be deployed separately (Render, Railway, Fly.io, VPS, etc.)
- In that mode, set `VITE_API_BASE_URL` to the deployed API host before building the frontend
- For browser session login across different origins, also set `CORS_ORIGINS` and `ADMIN_SESSION_COOKIE_SAME_SITE=none`
- If cross-origin cookies are blocked in the admin browser, use `API_ADMIN_KEY` fallback access on `/admin`

## CI note

- The GitHub Actions workflow now validates the full stack by running:
  - `npm run build`
  - `npm run check:harmony`
  - `npm run check:production`
- It no longer publishes a frontend-only GitHub Pages deploy by default, because that deploy mode does not include the backend

## Render deploy

This repo now includes `render.yaml` for a single-service deploy.

- Create a Render `Web Service`, not a `Static Site`
- Connect the repo and keep the root directory blank
- Render can detect the build/start commands from `render.yaml`
- The Blueprint is configured for a persistent disk mounted at `/var/data`
- The Blueprint now provisions `API_ADMIN_KEY`, `ADMIN_SESSION_SECRET`, and a default `ADMIN_USERNAME`
- Set `ADMIN_PASSWORD` in Render to enable browser admin login immediately after deploy
- Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_APP_URL`
- Point the Stripe webhook at `/api/payments/stripe/webhook`
- Use the frontend `/admin` page to sign in with session auth after deploy, or keep `API_ADMIN_KEY` for fallback script access
