# Deployment Guide

This app is a single-service React + Node/Express application. In production, Express serves both the built frontend and the API from one origin.

## Hosting Rule

Use a host that can run a Node process and provide persistent storage for SQLite.

Good fits:

- Docker hosts: AWS ECS, Fly.io, Railway, Render Docker, DigitalOcean App Platform, VPS
- VM hosts: AWS EC2, Lightsail, Azure VM, Google Compute Engine
- Node PaaS hosts with persistent disk support: Render Web Service, Railway with volume, Fly.io with volume

Avoid frontend-only hosting for the full app:

- S3 static website only
- GitHub Pages only
- Netlify/Vercel static-only setup

Those can host the frontend, but the API, admin dashboard, SQLite data, backups, and Stripe webhook still need a backend service.

## Required Production Variables

```env
NODE_ENV=production
PORT=4000
SERVE_STATIC_APP=true
TRUST_PROXY=true
DATA_DIR=/var/data
DATABASE_URL=/var/data/enrollment.db
STATIC_DIR=dist

ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
API_ADMIN_KEY=replace-with-a-long-random-key

PUBLIC_APP_URL=https://your-domain.com
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NOTIFICATION_WEBHOOK_URL=
NOTIFICATION_WEBHOOK_SECRET=
```

Stripe is optional. If Stripe variables are empty, enrollment works in manual-payment mode.

## Standard Node Host

Use this on EC2, Lightsail, a VPS, or any host that runs Node directly.

```bash
npm ci
npm run verify
npm run build
npm run start
```

The service must preserve `DATA_DIR` across restarts and deploys.

## Docker Host

Build:

```bash
docker build -t first-step-academy .
```

Run:

```bash
docker run -p 4000:4000 \
  -v first-step-data:/var/data \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD='replace-with-a-strong-password' \
  -e ADMIN_SESSION_SECRET='replace-with-a-long-random-secret' \
  -e API_ADMIN_KEY='replace-with-a-long-random-key' \
  -e PUBLIC_APP_URL='https://your-domain.com' \
  first-step-academy
```

Or copy the example compose file:

```bash
cp docker-compose.example.yml docker-compose.yml
docker compose up -d --build
```

Set the required secrets in your shell or `.env` before using Compose.

## AWS EC2 or Lightsail

Recommended shape:

- Ubuntu instance
- Node 22.12+ or Node 20.19+
- Nginx reverse proxy
- PM2 or systemd for process supervision
- Persistent attached disk or instance volume for `/var/data`
- HTTPS certificate through Let’s Encrypt, AWS ACM behind a load balancer, or Lightsail certificate tooling

Nginx proxy:

```nginx
server {
  server_name your-domain.com www.your-domain.com;

  location / {
    proxy_pass http://127.0.0.1:4000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

PM2:

```bash
npm install -g pm2
pm2 start server/index.js --name first-step-academy
pm2 save
pm2 startup
```

## PaaS Hosts

For hosts that detect Node apps:

- Build command: `npm ci && npm run build`
- Start command: `npm run start`
- Health check path: `/api/health`
- Persistent disk mount: `/var/data`
- Set `DATA_DIR=/var/data`
- Set `DATABASE_URL=/var/data/enrollment.db`

The included `Procfile` supports platforms that use Procfile process declarations.

## Stripe Webhook

When Stripe is enabled, set the webhook URL to:

```text
https://your-domain.com/api/payments/stripe/webhook
```

Then set `STRIPE_WEBHOOK_SECRET` from the Stripe webhook signing secret.

## Final Checks

Before shipping:

```bash
npm run verify
```

After deploy:

```bash
curl https://your-domain.com/api/health
```

Confirm:

- `services.database` is `ok`
- `services.admin` is `session`, `api-key`, or `hybrid`
- `services.payments` is `configured` if Stripe is live
