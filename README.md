# Healthcare Academy Website (React + Node API)

This project now includes:

- A React/Vite frontend
- A Node/Express backend API for admissions, registration, and operations
- SQLite-backed storage for cohorts, enrollments, inquiries, and waitlist
- Stripe Checkout support for online tuition payment
- An admin dashboard section in the frontend backed by protected APIs
- Admin CRUD for programs and cohorts backed by SQLite

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
- `API_ADMIN_KEY`: required for admin dashboard and protected admin endpoints
- `DATA_DIR`: mounted directory for persistent app storage
- `DATABASE_URL`: SQLite database file for cohorts, enrollments, inquiries, and waitlist
- `STATIC_DIR`: built frontend directory to serve in production (default `dist`)
- `SERVE_STATIC_APP`: serve the built frontend from Express (`true` in production by default)
- `TRUST_PROXY`: trust upstream proxy headers (`true` in production by default)
- `PUBLIC_APP_URL`: absolute public app URL used for Stripe Checkout redirects
- `STRIPE_SECRET_KEY`: Stripe secret key for Checkout session creation
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret for payment confirmation
- `VITE_DEV_API_TARGET`: Vite proxy target in development
- `VITE_API_BASE_URL`: optional absolute API base URL for production frontend
- `VITE_PUBLIC_BASE_PATH`: frontend base path used at build time (`/` for app hosting, `/Huy-Website/` for GitHub Pages)

## Scripts

- `npm run dev`: run API + frontend in parallel
- `npm run dev:server`: run API only (nodemon)
- `npm run dev:client`: run frontend only (Vite)
- `npm run start`: run API server in production mode
- `npm run check:harmony`: smoke test API contract compatibility
- `npm run check:production`: smoke test the built frontend + Express API together in production mode
- `npm run verify`: run build, API smoke test, and production smoke test
- `npm run build`: build frontend
- `npm run preview`: preview frontend build

## API endpoints

- `GET /api/health`: server health check
- `GET /api/programs`: program list
- `POST /api/inquiries`: submit contact inquiry
- `POST /api/waitlist`: submit waitlist request
- `GET /api/cohorts`: live cohort availability with remaining seats
- `POST /api/enrollments`: create enrollment and return Stripe Checkout URL when configured
- `GET /api/enrollments/:id/status`: enrollment payment/status verification after checkout
- `GET /api/admin/overview`: admin metrics and cohort capacity summary
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

Important:

- Durable production operation still requires persistent disk.
- Payment confirmation depends on Stripe webhook delivery.
- The admin dashboard depends on `API_ADMIN_KEY`.
- Expired Stripe seat holds are now released automatically by the backend even if the webhook expiry event is delayed.
- Seeded programs and cohorts are inserted only when missing, so admin edits persist across restarts.

## Production readiness

- `API_ADMIN_KEY` is required in production startup.
- Stripe Checkout only starts when `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_APP_URL` are all configured together.
- If Stripe is not configured, enrollments still work in manual payment mode and admissions can follow up directly.
- `GET /api/health` now reports database readiness plus whether payments are configured or manual.

## Deployment note

You now have two deployment modes:

1. Single-service production deploy (recommended)

- Run `npm run build`
- Run `npm run start`
- In production, Express will serve both the built frontend and the API from the same origin
- This avoids the GitHub Pages + separate API mismatch entirely
- Run `npm run verify` before shipping any production build

2. GitHub Pages frontend + separate API

- GitHub Pages can host the frontend build only
- The backend must be deployed separately (Render, Railway, Fly.io, VPS, etc.)
- In that mode, set `VITE_API_BASE_URL` to the deployed API host before building the frontend

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
- Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and `PUBLIC_APP_URL`
- Point the Stripe webhook at `/api/payments/stripe/webhook`
- Use the frontend `#admin` section with your `API_ADMIN_KEY` to load operations data after deploy
