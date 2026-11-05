# Podcast Management System (PMS V2)

Welcome to the **Podcast Management System V2** backend repository. This project is a robust, multi-tenant, scalable backend API for managing podcast channels, guests, interviews, studios, media, and related metadata.

## 🚀 Overview

PMS V2 is built with modern Node.js/TypeScript best practices. It is a **multi-tenant** system where each tenant is a **Channel** (podcast brand). All tenanted data is scoped automatically via a Sequelize global scope and an `AsyncLocalStorage`-based tenant context — no manual `WHERE channel_id = ?` clauses are needed in business logic.

The API provides:
- **Authentication** — JWT access + refresh tokens, OTP flows, session management
- **Multi-tenancy** — per-channel data isolation via `resolveTenant` middleware
- **Role-Based Access Control (RBAC)** — Roles, Permissions, and per-user permission overrides
- **Guest Pipeline** — guest creation → approval → re-approval → interview scheduling
- **Interview Management** — scheduling, studio assignment, status tracking, cron-driven notifications
- **Media Management** — Multer-powered file uploads (images, audio), stored under `/uploads`
- **Email Notifications** — React Email templates rendered server-side, sent via Nodemailer/AWS SES
- **Activity Logs** — full audit trail of changes per channel
- **Platform Admin** — super-admin layer for managing channels and subscription plans
- **Health Check** — `GET /health` endpoint

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Language | TypeScript 5 |
| Web Framework | Express.js 5 |
| Database ORM | Sequelize 6 |
| Database | PostgreSQL (`pg`) |
| Package Manager | pnpm 10 |
| Validation | Zod 4 |
| Authentication | JWT (`jsonwebtoken`) + `bcryptjs` |
| File Uploads | Multer 2 |
| Task Scheduling | `node-cron` 4 |
| Email | Nodemailer + AWS SES + `@react-email` |
| Date/Time | Luxon |
| HTTP Client | Axios |

## 📁 Project Structure

```
PMS-V2-Api/
├── src/
│   ├── app.ts                      # Express app setup (middleware, routes, cron boot)
│   ├── server.ts                   # HTTP server entry point
│   ├── config/
│   │   ├── config.js               # Sequelize CLI config (reads .env)
│   │   └── db.ts                   # Sequelize instance + connection setup
│   ├── constants/
│   │   └── interviewStatus.ts      # Interview status enum constants
│   ├── context/
│   │   └── tenant-context.ts       # AsyncLocalStorage-based tenant (channel) context
│   ├── cron/
│   │   └── interviewNotification.cron.ts  # Cron job for interview reminder emails
│   ├── emails/
│   │   └── templates/              # React Email TSX templates (approval, interview, OTP, etc.)
│   ├── events/
│   │   ├── eventBus.ts             # Node.js EventEmitter-based event bus
│   │   ├── events.constants.ts     # Event name constants
│   │   └── listeners/
│   │       └── email.listener.ts   # Listens for domain events and dispatches emails
│   ├── middleware/
│   │   ├── authenticate.middleware.ts        # JWT verification, attaches req.user
│   │   ├── authorize.middleware.ts           # Permission-based route guard
│   │   ├── authorizePlatformAdmin.middleware.ts  # Platform-admin-only guard
│   │   ├── cors.middleware.ts                # Dynamic CORS from FRONTEND_ORIGINS env var
│   │   ├── resolveTenant.middleware.ts       # Reads channel slug, sets tenant context
│   │   ├── upload.logo.middleware.ts         # Multer config for logo uploads
│   │   ├── upload.media.middleware.ts        # Multer config for media uploads
│   │   ├── validate.middleware.ts            # Zod schema request validation
│   │   └── error-handlers/
│   │       ├── ApiError.ts                   # Custom ApiError class
│   │       └── sendError.ts                  # Express global error handler
│   ├── modules/
│   │   ├── index.ts                # Root router — mounts all sub-routers
│   │   ├── associations.ts         # All Sequelize model associations in one place
│   │   ├── tenant-scoping.ts       # Global Sequelize scope injecting channel_id
│   │   ├── admin/                  # Platform-admin modules (channel, subscription plan, platform_admin)
│   │   ├── auth/                   # Authentication (login, register, OTP, refresh token)
│   │   ├── channel_profile/        # Channel public profile
│   │   ├── guest/                  # Guest CRUD, approval workflow
│   │   ├── guest_note/             # Notes attached to a guest record
│   │   ├── guest_reapproval_request/ # Guest re-approval request workflow
│   │   ├── interview/              # Interview scheduling & management
│   │   ├── log/                    # Activity / audit logs
│   │   ├── media/                  # File upload and retrieval
│   │   ├── permissions/            # Permission CRUD
│   │   ├── role_permissions/       # Role ↔ Permission join table
│   │   ├── roles/                  # Role CRUD
│   │   ├── settings/               # Channel-level settings
│   │   ├── studio/                 # Studio (recording room) management
│   │   ├── tags/                   # Tag management
│   │   ├── user_permissions/       # Direct user ↔ permission overrides
│   │   ├── user_roles/             # User ↔ Role join table
│   │   ├── user_session/           # Active session tracking
│   │   └── users/                  # User CRUD and profile management
│   ├── services/
│   │   ├── email.service.tsx       # Email sending service (Nodemailer + AWS SES)
│   │   └── sms.service.ts          # SMS service stub
│   ├── types/
│   │   └── sequelize.d.ts          # Sequelize option type augmentations
│   └── utils/
│       ├── slugify.ts              # String → URL slug helper
│       └── tenant-scope.ts         # Utility for applying tenant scope in queries
├── database/
│   ├── migrations/                 # Sequelize migration files (chronological)
│   └── seeders/                    # Sequelize seeder files
├── uploads/                        # Locally stored uploaded files (media, logos)
├── .env.sample                     # Sample environment variable file
├── .sequelizerc                    # Sequelize CLI path configuration
├── tsconfig.json                   # TypeScript compiler options
└── package.json
```

## 🌐 API Routes

| Prefix | Module | Description |
|---|---|---|
| `GET /health` | — | Health check |
| `/auth` | Auth | Login, register, OTP, token refresh |
| `/users` | Users | User CRUD, profile |
| `/roles` | Roles | Role management |
| `/permissions` | Permissions | Permission management |
| `/guests` | Guests | Guest pipeline (create → approve → re-approve) |
| `/guest_notes` | Guest Notes | Notes per guest |
| `/guest-reapproval-requests` | Re-approval | Re-approval request workflow |
| `/interviews` | Interviews | Interview scheduling, status updates |
| `/studios` | Studios | Recording studio management |
| `/tags` | Tags | Tag CRUD |
| `/media` | Media | File upload and retrieval |
| `/logs` | Logs | Audit log access |
| `/channel` | Channel Profile | Public channel profile |
| `/admin` | Admin | Platform admin: channels, plans, admins |

Static assets are served at `/uploads/*`.

## 🏗️ Architecture: Multi-Tenancy

Every request to a tenanted route goes through:

1. **`authenticate`** — Verifies the JWT and attaches `req.user`.
2. **`resolveTenant`** — Reads the channel identifier from the request, then sets the `channelId` in `AsyncLocalStorage` via `tenantContext.run(...)`.
3. **Sequelize global scope** (`tenant-scoping.ts`) — Automatically appends `WHERE channel_id = <channelId>` to all queries for tenanted models.

This means **all business logic is channel-scoped by default** without explicit filtering.

## 🔐 Authentication & Authorization

- **JWT Access Token** — Short-lived, verified by the `authenticate` middleware on every protected route.
- **JWT Refresh Token** — Long-lived, used to issue a new access token via the refresh endpoint.
- **RBAC** — The `authorize` middleware checks `req.user.roles` and `req.user.permissions` before allowing access.
- **Platform Admin** — A separate `authorizePlatformAdmin` middleware protects super-admin-only routes under `/admin`.
- **Passwords** — Always hashed with `bcryptjs` before persistence.

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [pnpm](https://pnpm.io/) v10+ (specified in `package.json`)
- [PostgreSQL](https://www.postgresql.org/)

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <repository-url>
cd PMS-V2-Api
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Copy the sample env file and fill in your values:
```bash
cp .env.sample .env
```

| Variable | Description |
|---|---|
| `DB_HOST` | PostgreSQL host (default: `localhost`) |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | PostgreSQL port (default: `5432`) |
| `DB_DIALECT` | Always `postgres` |
| `JWT_SECRET_KEY` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `GMAIL_USER` | Gmail address (for Nodemailer) |
| `GMAIL_PASS` | Gmail app password |
| `PORT` | Server port (default: `4000`) |
| `FRONTEND_ORIGINS` | Comma-separated allowed CORS origins |

### 4. Database Setup
```bash
# Run all pending migrations
pnpm run migrate

# (Optional) Seed the database with initial data
pnpm run seed
```

### 5. Run the Application

**Development** (hot-reload via `ts-node-dev`):
```bash
pnpm run dev
```

**Production:**
```bash
pnpm run build
pnpm run start
```

## 📜 Available Scripts

| Script | Description |
|---|---|
| `pnpm run dev` | Start dev server with hot-reload |
| `pnpm run build` | Compile TypeScript → `dist/` |
| `pnpm run start` | Start compiled production server |
| `pnpm run migrate` | Run all pending DB migrations |
| `pnpm run migrate:undo` | Revert all DB migrations |
| `pnpm run seed` | Run all DB seeders |
| `pnpm run seed:undo` | Revert all DB seeders |

## 🤖 Context for AI Assistants

Key architectural decisions to follow when contributing to this codebase:

- **Module pattern:** Each feature lives in `src/modules/<name>/` with files for `model`, `controller`, `service`, `routes`, `validation`, and `interface`.
- **Validation:** All incoming request payloads (body, query, params) **must** be validated with a **Zod** schema via the `validate` middleware.
- **Authentication:** Protected routes use the `authenticate` middleware. Passwords are always hashed with `bcryptjs` before saving.
- **Multi-tenancy:** All tenanted models automatically scope queries to the active `channel_id` via the global Sequelize scope. Never add manual `channel_id` filters in service logic.
- **Associations:** All Sequelize associations are centralized in `src/modules/associations.ts`. Do not define associations inside individual model files.
- **Migrations:** Every model/schema change requires a corresponding migration file in `database/migrations/`.
- **Events:** Side effects (e.g., sending emails) are triggered via the internal event bus (`src/events/eventBus.ts`), not called inline.
- **Error handling:** Throw `ApiError` instances from controllers/services; the global `sendError` handler formats and returns the response.
- **File uploads:** Use the `upload.media.middleware` or `upload.logo.middleware` Multer configs for file upload routes.

## 📄 License

This project is licensed under the ISC License.
