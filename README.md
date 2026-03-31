# Healthcare Academy Website (React + Node API)

This project now includes:

- A React/Vite frontend
- A Node/Express backend API for inquiries and waitlist submissions

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
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
- `STATIC_DIR`: built frontend directory to serve in production (default `dist`)
- `SERVE_STATIC_APP`: serve the built frontend from Express (`true` in production by default)
- `TRUST_PROXY`: trust upstream proxy headers (`true` in production by default)
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
- `GET /api/inquiries`: admin-only inquiry list (requires `x-api-key`)
- `GET /api/waitlist`: admin-only waitlist list (requires `x-api-key`)

## Data persistence

Submissions are stored in:

- `server/data/inquiries.json`
- `server/data/waitlist.json`

These files are generated at runtime and ignored by git.

Important:

- The app will run in production with JSON-backed storage, but long-term lead retention is safer with persistent disk or a database.
- If a JSON file becomes corrupted, the server now quarantines it and returns a temporary `503` instead of silently wiping records.

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

This repo now includes [render.yaml](C:/Users/Admin/Documents/Huy_website/render.yaml) for a single-service deploy.

- Create a Render `Web Service`, not a `Static Site`
- Connect the repo and keep the root directory blank
- Render can detect the build/start commands from `render.yaml`
- Add persistent storage or move to a database if you need durable submission storage
