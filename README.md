# MailFlow Pages — Public Landing Pages

A standalone Next.js app that hosts public landing pages for MailFlow
templates. Deployed as a **separate Vercel project** so the public URLs
are isolated from the main dashboard app.

## What it does

Every MailFlow template gets a unique public URL like:

```
https://mailflow-pages.vercel.app/lp/{templateId}
```

When someone visits this URL:

1. The Pages project fetches the template from the MailFlow backend
   (`GET /api/templates/{id}/public`) — no auth required.
2. The backend returns the template's HTML with merge tags replaced by
   sample data (`Jane`, `jane@example.com`) so the page renders cleanly.
3. The Pages project wraps the HTML in a clean shell and renders it.
4. It calls `POST /api/templates/{id}/visit` to record a pageview.

## Why a separate project?

- **Email deliverability** — landing-page URLs can be on a domain with
  clean reputation, separate from your dashboard.
- **Isolation** — a deploy issue with your main app doesn't take down
  landing pages.
- **Custom domain** — you can put landing pages on a custom domain
  like `lp.yourcompany.com` without touching the main app.
- **Analytics** — easy to give landing pages their own subdomain for
  click-tracking.

## Deploy

### Option A: Deploy to Vercel (recommended)

1. Push this folder to a GitHub repo (or use `vercel deploy` directly).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. **Environment variables** — add:
   - `BACKEND_URL` = your deployed backend URL
     (e.g. `https://email-saas-backend.vercel.app`)
4. Deploy. Vercel will give you a URL like
   `https://mailflow-pages.vercel.app`.

### Option B: Custom domain

After deploying, in Vercel → Project → Settings → Domains, add a
custom domain like `lp.yourcompany.com`. Update DNS as Vercel
instructs.

Then update your MailFlow backend's `FRONTEND_URL` (or add a new env
var like `LANDING_PAGE_URL`) so the user can copy the right URL from
the templates page.

## Local development

```bash
cp .env.example .env.local   # set BACKEND_URL=http://localhost:3001
npm install
npm run dev                  # http://localhost:3001
```

Then visit `http://localhost:3001/lp/{some-template-id}` (use a real
template ID from your local DB).

## Architecture

```
                          ┌────────────────────┐
Email recipient → click →  │  MailFlow Pages   │  (this project)
                          │   /lp/[templateId] │
                          └─────────┬──────────┘
                                    │
            1. GET /api/templates/:id/public     ←─ backend returns
            2. POST /api/templates/:id/visit      →─ backend records pageview
                                    │
                          ┌─────────▼──────────┐
                          │  MailFlow Backend  │
                          │  (NestJS API)      │
                          └────────────────────┘
```

The Pages project is intentionally minimal — it has zero database
access, zero auth, and a single dependency (`next`). All data lives in
the backend.
