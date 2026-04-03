# Healthcare Academy Website (React + Node API)

This project now includes:

- A React/Vite frontend
- A Node/Express backend API for inquiries and waitlist submissions
- SQLite-backed cohort and enrollment storage
- Stripe Checkout support for online tuition payment

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
- `API_ADMIN_KEY`: required for admin listing endpoints
- `DATA_DIR`: directory for JSON data storage
- `DATABASE_URL`: SQLite database file for cohorts and enrollments
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
- `GET /api/inquiries`: admin-only inquiry list (requires `x-api-key`)
- `GET /api/waitlist`: admin-only waitlist list (requires `x-api-key`)
- `GET /api/enrollments`: admin-only enrollment list (requires `x-api-key`)
- `POST /api/payments/stripe/webhook`: Stripe webhook endpoint for payment completion

## Data persistence

Inquiries and waitlist submissions are stored in:

- `server/data/inquiries.json`
- `server/data/waitlist.json`

Enrollment and cohort data are stored in:

- `server/data/enrollment.db`

Important:

- Inquiry and waitlist data still use JSON files, so durable production storage still requires persistent disk or a later database migration for those tables too.
- If a JSON file becomes corrupted, the server now quarantines it and returns a temporary `503` instead of silently wiping records.
- Class registration now uses SQLite so cohort inventory and payment state are not tied to in-memory state.

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
- Add persistent storage so both `server/data/*.json` and `server/data/enrollment.db` survive redeploys
- Configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and optionally `PUBLIC_APP_URL`
- Point the Stripe webhook at `/api/payments/stripe/webhook`
