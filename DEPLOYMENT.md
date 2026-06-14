# Deployment

The app is a Bun monorepo with two deployables:

- **Backend** (`apps/backend`) — a Bun HTTP server (Hono + better-auth + Drizzle/Postgres).
- **Frontend** (`apps/frontend`) — a static Vite/React SPA.

## 1. Database (Postgres)

Any Postgres works; [Neon](https://neon.tech) is convenient (serverless, free tier). Create a database and grab its connection string.

Apply the schema once (and after any schema change):

```bash
cd apps/backend
DATABASE_URL=... bun run db:push        # quick, for first deploys
# or, for versioned migrations:
DATABASE_URL=... bun run db:generate && DATABASE_URL=... bun run db:migrate
```

## 2. Backend

Runs anywhere Bun runs (Fly.io, Railway, Render, a VM…). It listens on `PORT` (default `3001`).

**Environment variables:**

| Var | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Postgres connection string |
| `BETTER_AUTH_SECRET` | ✅ | `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | ✅ | Public URL of the backend, e.g. `https://api.example.com` |
| `TRUSTED_ORIGINS` | ✅ | Comma-separated frontend origins, e.g. `https://example.com` |
| `PORT` | – | Injected by most hosts |
| `RESEND_API_KEY` | – | Enables real password-reset emails |
| `EMAIL_FROM` | – | e.g. `ESPHome Learn <noreply@example.com>` (required with Resend) |

**Build & run:**

```bash
cd apps/backend
bun install --production
bun run start          # or: bun run build && bun run dist/index.js
```

## 3. Frontend

Static build — deploy `apps/frontend/dist` to Vercel, Netlify, Cloudflare Pages, or any static host.

```bash
cd apps/frontend
VITE_API_URL=https://api.example.com bun run build
```

- `VITE_API_URL` is read at **build time** — set it in the host's build env.
- Configure an **SPA fallback** so unknown paths serve `index.html` (React Router handles routing). On Netlify: `/* /index.html 200`. On Vercel/Cloudflare Pages this is the default for SPAs.

## ⚠️ Cross-domain cookies (important)

better-auth uses a session **cookie** with `SameSite=Lax`. A Lax cookie is **not sent** on cross-site requests, so the frontend and backend must be **same-site**:

- ✅ Recommended: host them on one registrable domain — frontend at `example.com`, backend at `api.example.com`. Lax cookies flow and `credentials: "include"` works as-is.
- ❌ Different domains (e.g. `app.vercel.app` ↔ `api.fly.dev`): the session cookie won't be sent. To support this you must configure better-auth advanced cookies (`sameSite: "none"`, `secure: true`) and keep CORS `credentials: true` with the exact origin — see the better-auth docs. Simpler to just use a shared parent domain.

Make sure `TRUSTED_ORIGINS` (backend) exactly matches the frontend origin, including scheme.

## 4. CI

`.github/workflows/ci.yml` runs on every push/PR: install → `bun test` → frontend typecheck+build → backend typecheck. No database is needed for CI (tests are pure/unit).
