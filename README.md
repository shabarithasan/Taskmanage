# TaskFlow — Full-Stack Starter

A production-ready full-stack web application starter featuring JWT authentication, a REST API with full CRUD, and a React frontend. Clone it, seed it, and you have a working app in under five minutes.

---

## Features

### Backend
- **Node.js + Express** REST API with structured error handling
- **JWT authentication** — register, login, `GET /auth/me`
- **CRUD resource** — Tasks with status, priority, due-date, and filtering
- **SQLite via better-sqlite3** — zero-config, WAL mode, foreign keys enforced
- **Input validation** via `express-validator` on every mutating endpoint
- **Rate limiting** on auth routes (20 req / 15 min window)
- **Security headers** via `helmet`, CORS configuration
- **Pagination** — `?page=&limit=` query params on list endpoint
- **Jest + Supertest** integration tests with in-memory database

### Frontend
- **React 18 + Vite** — fast HMR development server, optimised production build
- **React Router v6** — protected routes, redirect on unauthenticated access
- **Custom hooks** — `useAuth` (context-based), `useTasks` (reducer + API)
- **CSS Modules** — scoped styles, no CSS-in-JS dependency
- **Task board** — create, edit, delete, cycle status, filter by status/priority
- **Responsive** — sidebar collapses on narrow viewports

### DevOps
- **GitHub Actions CI** — separate jobs for backend (test + coverage) and frontend (lint + build)
- **Artifact uploads** — coverage report and built frontend dist are saved per run

---

## Project Structure

```
fullstack-starter/
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI
├── backend/
│   ├── __tests__/
│   │   └── api.test.js       # Integration tests (auth + tasks)
│   ├── migrations/
│   │   └── run.js            # Schema creation (idempotent)
│   ├── seeds/
│   │   └── run.js            # Demo users and tasks
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js   # SQLite connection + pragmas
│   │   ├── controllers/
│   │   │   ├── auth.js       # register / login / me
│   │   │   └── tasks.js      # list / create / get / update / delete
│   │   ├── middleware/
│   │   │   ├── auth.js       # JWT verify middleware
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js   # express-validator result handler
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   └── task.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── tasks.js
│   │   └── index.js          # Express app + server
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js     # Fetch wrapper (auth header, error handling)
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TaskCard.jsx + .module.css
│   │   │   └── TaskModal.jsx + .module.css
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx   # AuthContext + provider
│   │   │   └── useTasks.js   # CRUD state with useReducer
│   │   ├── pages/
│   │   │   ├── Auth.jsx + .module.css
│   │   │   └── Dashboard.jsx + .module.css
│   │   ├── App.jsx
│   │   ├── index.css         # Global tokens + resets
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm 9 or later

### 1 — Clone and install

```bash
git clone https://github.com/your-org/fullstack-starter.git
cd fullstack-starter

# Install backend deps
cd backend && npm install && cd ..

# Install frontend deps
cd frontend && npm install && cd ..
```

### 2 — Configure environment

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and set a strong `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3 — Seed the database

```bash
cd backend
npm run seed
```

This creates the schema and inserts two demo users. Credentials:

| Email | Password | Notes |
|---|---|---|
| alice@example.com | Password123! | Has 4 example tasks |
| bob@example.com   | Password123! | Empty task list |

### 4 — Start the API

```bash
# backend/
npm run dev
# → http://localhost:3001
```

### 5 — Start the frontend

```bash
# frontend/
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173` in your browser. The Vite dev server proxies `/api/*` to `localhost:3001`.

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Create account. Body: `name`, `email`, `password` |
| `POST` | `/auth/login`    | — | Sign in. Body: `email`, `password`. Returns `{ user, token }` |
| `GET`  | `/auth/me`       | ✓ | Return current user from token |

### Tasks

All task endpoints require `Authorization: Bearer <token>`.

| Method   | Path         | Description |
|----------|--------------|-------------|
| `GET`    | `/tasks`     | List tasks. Query: `status`, `priority`, `page`, `limit` |
| `POST`   | `/tasks`     | Create task. Body: `title` (req), `description`, `status`, `priority`, `due_date` |
| `GET`    | `/tasks/:id` | Get single task |
| `PATCH`  | `/tasks/:id` | Partial update |
| `DELETE` | `/tasks/:id` | Delete task (204 No Content) |

#### Status values
`todo` · `in_progress` · `done`

#### Priority values
`low` · `medium` · `high`

#### List response envelope
```json
{
  "data": [ /* task objects */ ],
  "meta": { "total": 4, "page": 1, "limit": 20, "pages": 1 }
}
```

---

## Database Schema

```sql
CREATE TABLE users (
  id         TEXT PRIMARY KEY,            -- UUID v4
  name       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,               -- bcrypt hash
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT DEFAULT 'todo'         -- todo | in_progress | done
                CHECK(status IN ('todo','in_progress','done')),
  priority    TEXT DEFAULT 'medium'       -- low | medium | high
                CHECK(priority IN ('low','medium','high')),
  due_date    TEXT,                       -- ISO 8601 date string
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
```

Migrations are idempotent (`CREATE TABLE IF NOT EXISTS`) and run automatically on server start.

---

## Running Tests

```bash
cd backend
npm test
```

Tests run against an in-memory SQLite database and cover:

- User registration (success, duplicate email)
- Login (success, wrong password)
- `GET /auth/me` with valid token
- Full task CRUD cycle
- Unauthenticated access rejection

Generate a coverage report:

```bash
npm test -- --coverage
# Output: backend/coverage/lcov-report/index.html
```

---

## CI / CD

Push to `main` or open a pull request to trigger the GitHub Actions workflow (`.github/workflows/ci.yml`).

**Backend job:** installs deps → runs Jest with coverage → uploads coverage artifact  
**Frontend job:** installs deps → ESLint → Vite build → uploads dist artifact

No secrets are needed for CI beyond the auto-provided `GITHUB_TOKEN`; the test suite injects its own `JWT_SECRET`.

---

## Extending the Starter

Some common next steps:

- **Swap SQLite for PostgreSQL** — replace `better-sqlite3` with `pg` or Drizzle ORM; migrations already use plain SQL
- **Add refresh tokens** — store a `refresh_tokens` table and implement `/auth/refresh`
- **File uploads** — add `multer` middleware and an `attachments` table
- **Email verification** — integrate Nodemailer or Resend on registration
- **End-to-end tests** — add Playwright tests under `e2e/` targeting the dev servers
- **Docker Compose** — wrap both services and optionally add Nginx as a reverse proxy
- **Deploy** — the frontend `dist/` folder can be served from any CDN; the API runs as a standard Node process

---

## License

MIT — do whatever you like with it.
