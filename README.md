<div align="center">

<img src="frontend/public/logo.svg" alt="HireRise logo" width="96" />

# HireRise

**An internal HR management system. Track employee status, attendance, leave and tasks in one place.**

Built for a company's HR team, with a separate, simpler view for employees.

![Vue](https://img.shields.io/badge/Vue_3-35495e?logo=vuedotjs&logoColor=4fc08d)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-ffd859?logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-d71f00?logoColor=white)

[Features](#features) · [Roles](#roles) · [Run it locally](SETUP.md) · [Roadmap](#roadmap)

</div>

---

## Screenshot

<p align="center">
  <img src="docs\screenshots\HireRise-Screenshot.png" alt="HireRise HR dashboard" width="800" />
</p>

## Features

**For HR and admins**
- Dashboard with headcount, who is present or on leave today, pending requests and work due soon
- Approve or reject leave requests straight from the dashboard
- Employee directory with search and status and department filters, plus an add-employee form
- Team attendance for today
- Task board (To do, In progress, Done) with assignee filter and overdue markers

**For employees**
- Personal dashboard (hours, leave balance, open tasks)
- Clock in and clock out (late after 09:15)
- Request leave with validation, and see the status of past requests
- See only the tasks assigned to them

**Account and security**
- Real login against the FastAPI backend (JWT, bcrypt)
- Role-based routes: an employee opening `/employees` is sent back to the dashboard
- The role is read from the database on every request, so deactivating a user takes effect immediately

## Roles

| Role | Dashboard | Employees | Attendance | Leave | Tasks |
|---|---|---|---|---|---|
| admin | company-wide | yes | everyone | approve and reject | all tasks |
| hr | company-wide | yes | everyone | approve and reject | all tasks |
| employee | personal | no | own only | own requests | own tasks |

## Current status

| Part | State |
|---|---|
| Login, roles, route guards | Real (backend) |
| Employees, attendance, leave, tasks, dashboard | **Sample data in the browser** (`frontend/src/stores/hr.js`), replaced by API calls one module at a time |

Reloading the page resets the sample data. The database models for all of these already exist in `backend/app/models.py`.

## How it works

```
Vue 3 app (Vite) ──Axios /api──▶ FastAPI ──SQLAlchemy──▶ SQLite (local) / Postgres (production)
      │
      └── Pinia: auth store (real) · hr store (sample data for now)
```

### Engineering decisions worth knowing about

1. **One store, one swap point.** Every page reads from `stores/hr.js`. Replacing a store action with an API call changes no page.
2. **Filters are `computed()` values.** Search and dropdowns are bound with `v-model`, and the visible list re-runs by itself.
3. **Route guards read `meta`.** `requiresAuth`, `guestOnly` and `roles` in the router decide who can open what.
4. **No fallback secret.** The backend refuses to start without `SECRET_KEY`.
5. **Timing-equalized login.** A dummy bcrypt check runs for unknown emails so response time does not reveal which emails exist.
6. **First admin on first start only.** Created from `.env` when the users table is empty.

## Run it locally

Short version: start the backend on port 8000, run `npm install` and `npm run dev` in `frontend/`, open http://localhost:5173. Full steps are in **[SETUP.md](SETUP.md)**.

## Roadmap

- [ ] Employees API (create, edit, deactivate; also creates the login)
- [ ] Attendance, leave, tasks and dashboard endpoints, then wire `stores/hr.js` to them
- [ ] Password reset by HR, and a change-password page
- [ ] Rate limiting on login
- [ ] Automated tests (pytest for the API, Vitest and Playwright for the UI)
- [ ] Deploy (frontend on Vercel or Netlify, backend on a host with Postgres)
