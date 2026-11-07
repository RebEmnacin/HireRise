# HireRise: Setup and Comeback Guide

The "I'm coming back to this project after a while" file. Overview: [README.md](README.md).

## 1. Requirements

| Tool | Version | Why |
|---|---|---|
| Node.js | 20.19+ or 22.12+ | Vite 7 refuses older Node |
| Python | 3.11+ | FastAPI backend |
| Git | any | Clone the repo |

## 2. First-time setup

**Backend** (terminal 1)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows. On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
copy .env.example .env         # Mac/Linux: cp .env.example .env
```

Edit `backend/.env`: set `SECRET_KEY`, `FIRST_ADMIN_EMAIL` and `FIRST_ADMIN_PASSWORD`. Generate a key with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Then start it:

```bash
uvicorn app.main:app --reload --port 8000
```

On the first start (empty users table) the admin from `.env` is created. Check http://localhost:8000/api/health.

**Frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 and sign in with the admin email and password from `.env`.

## 3. Every time after that

Run both: `uvicorn app.main:app --reload --port 8000` in `backend/` (venv active) and `npm run dev` in `frontend/`.

## 4. Environment variables

**backend/.env**

| Variable | Notes |
|---|---|
| `SECRET_KEY` | Required, no fallback. Never commit it. Changing it logs everyone out |
| `DATABASE_URL` | Empty = local SQLite file. For Postgres: `postgresql+psycopg://user:pass@host/db` |
| `FIRST_ADMIN_EMAIL`, `FIRST_ADMIN_PASSWORD` | Used only when the users table is empty |
| `CORS_ORIGINS` | Frontend origins allowed to call the API |

**frontend** (production only): `VITE_API_URL`, for example `https://your-backend.example.com/api`. In development the Vite proxy sends `/api` to port 8000. Never put secrets in a `VITE_` variable.

## 5. Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| "Cannot reach the server. Is the backend running?" | Start uvicorn on port 8000 |
| Blank page | Run `npm run dev` from inside `frontend/`, not the repo root |
| Backend says `SECRET_KEY` is missing | Create `backend/.env` from `.env.example` |
| "Incorrect email or password" for the admin | The admin is only created when the users table is empty. Delete the local `.db` file and restart, or use the account already stored |
| Sent back to /login after signing in | Token rejected (401). Check the backend is the same one that issued it and `SECRET_KEY` has not changed |
| Vite says Node is unsupported | Upgrade Node to 20.19+ or 22.12+ |
| Port 5173 in use | `npm run dev -- --port 5174` (and add that origin to `CORS_ORIGINS`) |
| `git mv` "Permission denied" on Windows | Stop the dev server and close the editor, then retry |
| Page refresh 404 in production | Host needs a rewrite of all paths to `/index.html` |

## 6. Where things live

| I want to change... | Go to |
|---|---|
| Colors, sizes, sidebar width | `frontend/src/assets/style.css` (`:root` block) |
| Sample employees, leave, tasks, attendance | `frontend/src/stores/hr.js` |
| Who can open which page | `frontend/src/router/index.js` (`meta.roles`) |
| Sidebar links | `frontend/src/components/AppLayout.vue` |
| Login and token handling | `frontend/src/stores/auth.js`, `frontend/src/api/` |
| Late-after time, departments, leave types | top of `stores/hr.js` |
| Database tables | `backend/app/models.py` |
| Login endpoint, password rules | `backend/app/routers/auth.py` |

## 7. Known issues and loose ends

- [ ] Employees, attendance, leave, tasks and dashboard use sample data and reset on reload
- [ ] No password-reset flow (HR must do it for now)
- [ ] No rate limiting on login
- [ ] No automated tests
- [ ] The font loads from Google Fonts

## 8. Learn-later checklist

- [ ] `ref()` vs `reactive()`, `computed()`, `watch()`
- [ ] Pinia stores: state, getters, actions (`stores/hr.js`)
- [ ] Router guards with `meta` (`router/index.js`)
- [ ] Axios interceptors (`api/client.js`)
- [ ] FastAPI dependencies and `require_roles` (`app/security.py`)
- [ ] JWT vs sessions, and why bcrypt is slow on purpose
- [ ] SQLAlchemy models and relationships (`app/models.py`)

## 9. Tech stack

| Layer | Tech | Why |
|---|---|---|
| UI | Vue 3 + Vite | Templates close to HTML, fast dev server |
| State | Pinia | Small, official store for Vue |
| HTTP | Axios | Interceptors attach the token and handle 401 once |
| API | FastAPI | Typed, automatic validation and docs |
| DB | SQLAlchemy + SQLite / Postgres | SQLite to start, Postgres via one env var |
| Auth | JWT + bcrypt | Stateless login, hashed passwords |

## 10. Project structure

```
HireRise/
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/            # main, database, security, models, schemas, seed, routers/auth
├── frontend/
│   ├── index.html, package.json, vite.config.js
│   ├── public/logo.svg
│   └── src/
│       ├── api/        # client.js, endpoints.js
│       ├── stores/     # auth.js, hr.js
│       ├── router/     # index.js
│       ├── views/      # Login, Dashboard, Employees, Attendance, Leave, Tasks
│       ├── components/ # AppLayout, PageHeader, StatusBadge, NavIcon, LineIcon, CountUp
│       ├── lib/        # format.js
│       └── assets/     # style.css
└── docs/screenshots/
```

## 11. Roadmap

- [ ] Employees API, then attendance, leave, tasks, dashboard
- [ ] Wire `stores/hr.js` to the API
- [ ] Password reset, rate limiting, tests, deploy
