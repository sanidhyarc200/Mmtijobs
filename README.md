# MMT Jobs

Job portal for Bhopal-area hiring: job listings, applications, company
registration, HR/admin dashboards, and a resume builder.

## Architecture

- **Frontend** — React 19 + Vite (this folder's `src/`). Pages read/write
  localStorage collections (`jobs`, `users`, `jobApplications`, …).
- **Backend** — Django 5.2 + DRF in [`backend/`](backend/). Stores every
  collection in a real database and serves them over a REST API.
- **Sync layer** — [`src/data/apiStore.js`](src/data/apiStore.js) hydrates
  localStorage from `GET /api/bootstrap/` on boot, then transparently pushes
  any localStorage write to `PUT /api/collections/<key>/`. If the API is
  unreachable, the app falls back to plain localStorage (offline mode).

### API endpoints

| Endpoint | Purpose |
|---|---|
| `GET /api/health/` | Liveness check |
| `GET /api/bootstrap/` | All collections in one call (app boot) |
| `GET/PUT /api/collections/<key>/` | Read/replace one collection |
| `GET /api/jobs/`, `/users/`, `/companies/`, `/applications/` | Browsable REST views |
| `/admin/` | Django admin |

Synced keys: `users`, `jobs`, `jobApplications`, `registeredCompanies`,
`registeredCompany`, `savedJobs`, `applicants`, `customJobTitles`,
`customQualifications`. Device-local (never synced): `currentUser`, `theme`,
`seedVersion`, `pendingSignupType`.

## Local development

Backend (Python 3.12):

```bash
cd backend
python3 -m venv .venv          # first time only
.venv/bin/pip install -r requirements.txt
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver 127.0.0.1:8000
```

Frontend (Node 20+ — `nvm use 22`):

```bash
npm install
npm run dev                    # http://localhost:5173
```

The dev frontend targets `http://127.0.0.1:8000` automatically. Override
with `VITE_API_URL` (see `.env.example`).

Create an admin user for `/admin/`:

```bash
cd backend && .venv/bin/python manage.py createsuperuser
```

## Deployment (free tier)

1. **Database — Neon (free, persistent):** create a project at
   https://neon.tech and copy the Postgres connection string.
2. **API — Render:** dashboard → *New +* → *Blueprint* → select this repo
   ([`render.yaml`](render.yaml) drives it). Paste the Neon string as
   `DATABASE_URL`. Note the service URL, e.g.
   `https://mmtjobs-api.onrender.com`.
3. **Frontend — Vercel:** project settings → *Environment Variables* → add
   `VITE_API_URL=https://mmtjobs-api.onrender.com`, then redeploy.
4. Back in Render, set `FRONTEND_ORIGINS=https://<your-app>.vercel.app`
   (CORS allow-list).

Both platforms serve HTTPS out of the box. Render's free instance sleeps
after ~15 min idle; the first request afterwards takes ~30–60 s, during
which the frontend simply starts in offline mode.

## Known limitations

- **Auth is still client-side.** Passwords live inside the synced `users` /
  `registeredCompanies` records in plain text — same model the frontend has
  always used, now stored server-side. Do not reuse real passwords. Moving
  to hashed server-side auth (DRF tokens) is the natural next step.
- The sync API is unauthenticated: anyone who finds the API URL can read or
  write collections. Acceptable for a demo/portfolio deployment; not for
  real user data.
- Collection PUTs replace the whole collection (last write wins).
