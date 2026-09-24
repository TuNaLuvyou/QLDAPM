# AGENTS.md — HRM Enterprise (On-Premises SOA Architecture & AI Agent Guidelines)

> **PURPOSE OF THIS DOCUMENT**  
> This file is the primary Single Source of Truth (SSOT) and Architecture Constitution for all developers and AI Agents (Claude, GPT, Gemini, Cursor, Copilot, Antigravity) working in this monorepo. Every rule, pattern, and file structure documented here is MANDATORY. AI Agents MUST read, understand, and strictly follow these rules to ensure seamless multi-agent collaborative coding ("vibe coding") without breaking code, creating conflicts, or drifting from project standards.

---

## 1. System Overview & Core Invariants

1. **Architecture Style**: Monorepo with 3 distinct tiers:
   - `frontend/`: Web Management Portal (Next.js 16 App Router, React 19, Tailwind CSS v4).
   - `mobile/`: Employee & Manager Mobile Application (Flutter 3.x, Material 3).
   - `backend/`: Multi-service Service-Oriented Architecture (Node.js, Express, Clean / Hexagonal Architecture).
2. **Single-Tenant Enterprise**:
   - This is an internal enterprise on-premises system.
   - **STRICT PROHIBITION**: NEVER add `tenantId`, `tenantSlug`, or any multi-tenancy concept to any database schema, URL route, request payload, or business logic.
3. **Primary Brand Colors & UI**:
   - Primary brand color: `#8E1B2F` (Deep Burgundy / Đỏ đô).
   - **Language Requirement**: All user-facing UI labels, messages, placeholder texts, and alert notifications in Web and Mobile MUST be in **Vietnamese**.
4. **Active Branches & Remotes**:
   - Standard working branch: `dev`.
   - Production branch: `main`.
   - Remote configured: `QLDAPM`.

---

## 2. Backend Architecture (`backend/`, Clean Architecture per Service)

The backend is composed of multiple independent services. Each service is encapsulated inside its own isolated folder under `backend/<service-name>/`.

### 2.1. Standard Directory Structure per Service (MANDATORY)

Every backend service created by any AI Agent or developer MUST adhere 100% to this standardized layout:

```text
backend/<service-name>/
├── config/                     # Environment configuration & infrastructure initialization
│   ├── index.js                # Parses and validates process.env with fallback defaults
│   └── database.js             # DB connection pool (PostgreSQL / MongoDB) or In-memory store
│
├── src/
│   ├── api/                    # Delivery / Presentation Layer (HTTP & Transports)
│   │   ├── controllers/        # HTTP Request / Response handlers (pure delegation to Use Cases)
│   │   ├── middlewares/        # Authentication, Authorization, Validation, Error Handling
│   │   ├── routes/             # Express route definitions mapping URLs to controllers
│   │   ├── validators/         # Input schema validation (Joi or Zod schemas)
│   │   └── grpc/               # gRPC service implementations (if applicable)
│   │
│   ├── domain/                 # Core Business Rules (Pure JS/TS, zero external framework dependencies)
│   │   ├── entities/           # Business Objects & Domain Models (Employee, Payout, Shift, etc.)
│   │   ├── errors/             # Domain Custom Error classes (NotFoundError, ValidationError)
│   │   └── value-objects/      # Immutable Domain Values (Money, Email, Address, Status)
│   │
│   ├── services/               # Application Layer / Use Cases (Business workflows)
│   │   ├── CreateXxxUseCase.js # Individual Use Case handling a specific business action
│   │   └── ProcessYyyUseCase.js
│   │
│   ├── infrastructure/         # Adapters & External Interfaces
│   │   ├── database/
│   │   │   ├── models/         # ORM / ODM Schemas (Prisma, TypeORM, Mongoose, or In-memory)
│   │   │   └── repositories/   # Concrete repository implementations (DB reads & writes)
│   │   ├── messaging/          # Event Producers & Consumers (RabbitMQ, Kafka, or EventBus)
│   │   ├── external-clients/   # HTTP / gRPC client adapters for calling other services
│   │   └── logging/            # Centralized logger instance (Winston or Pino)
│   │
│   ├── utils/                  # Pure utility functions & helpers (date formatting, crypto)
│   └── app.js                  # Express app initialization, CORS, parsers & route mounting
│
├── tests/                      # Automated test suites
│   ├── unit/                   # Unit tests for Domain Entities and Use Cases
│   └── integration/            # API endpoint integration tests
│
├── .env.example                # Sample environment variables template (MANDATORY)
├── Dockerfile                  # Container build instructions for this service (MANDATORY)
├── docker-compose.yml          # Local orchestration for service and its dependencies (MANDATORY)
├── package.json                # Isolated dependencies and scripts for this service (MANDATORY)
└── server.js                   # Entry point: loads env, connects DB, listens to Port (MANDATORY)
```

---

### 2.2. Detailed Responsibilities of Each Layer

#### 1. Independent Node Environment (`package.json` & `node_modules`)
- Every service MUST be an autonomous Node.js package.
- All commands are executed within the service directory: `cd backend/<service-name> && npm install && npm run dev`.
- **PROHIBITION**: Never reference or import packages from sibling services via relative parent paths (`../../service-b/node_modules`).
- Every service MUST contain a `.env.example` documenting all required variables:
  ```env
  PORT=4001
  NODE_ENV=development
  SERVICE_NAME=employee-service
  DB_URI=memory://hrm-db
  JWT_SECRET=enterprise_jwt_secret_key
  ```

#### 2. Entry Point (`server.js`) & Express Initialization (`src/app.js`)
- `server.js` is located at the ROOT of the service (same level as `src/`).
- Responsibilities of `server.js`:
  ```javascript
  require("dotenv").config();
  const app = require("./src/app");
  const config = require("./config");
  const database = require("./config/database");

  const PORT = config.port || 4001;

  async function startServer() {
    try {
      await database.connect();
      if (require.main === module) {
        app.listen(PORT, () => {
          console.log(`[${config.serviceName}] running at http://localhost:${PORT}`);
        });
      }
    } catch (error) {
      console.error(`[${config.serviceName}] Failed to start:`, error);
      process.exit(1);
    }
  }

  startServer();
  module.exports = app; // Export app for supertest integration testing
  ```
- `src/app.js` configures Express, global middlewares, health check, and mounts routes:
  - Bắt buộc luôn có route `GET /health` responding with:
    ```json
    {
      "status": "ok",
      "service": "<service-name>",
      "time": "2026-09-17T08:00:00.000Z"
    }
    ```

#### 3. Presentation / API Layer (`src/api/`)
- **`controllers/`**:
  - Receive `(req, res, next)`.
  - Extract parameters and payload from request.
  - Instantiate or invoke the corresponding Use Case from `src/services/`.
  - Return standardized JSON format.
  - **STRICT RULE**: Controllers MUST NOT contain business rules, SQL queries, or data mutations directly.
- **`middlewares/`**:
  - `auth.js`: Validates bearer token or session cookie (`hrm-session`), attaches `req.user`.
  - `validation.js`: Validates `req.body`, `req.query`, or `req.params` against schemas in `validators/`.
  - `errorHandler.js`: Centralized error catching middleware. Maps domain errors to HTTP status codes (400, 401, 403, 404, 422, 500).
- **`routes/`**: Defines Express routers and binds HTTP verbs (`router.post("/", controller.create)`).

#### 4. Domain Layer (`src/domain/`)
- The Domain layer represents the core business logic of the enterprise.
- **ZERO DEPENDENCIES**: Must not import Express, database drivers, ORM modules, or HTTP libraries.
- **`entities/`**: Plain JavaScript/TypeScript classes or factory functions encapsulating state and business invariants.
- **`value-objects/`**: Immutable objects representing domain attributes (e.g., `Money`, `Address`, `WorkShiftStatus`).
- **`errors/`**: Custom domain error classes extending `Error` (e.g., `InsufficientBalanceError`, `EmployeeNotFoundError`).

#### 5. Application / Use Cases Layer (`src/services/`)
- Orchestrates business workflows by coordinating domain entities and infrastructure repositories.
- Each use case corresponds to a single business action (e.g., `CreatePayoutUseCase`, `ApproveRequestUseCase`).
- Use cases interact with persistence solely through Repository interfaces injected into their constructor or parameters.

#### 6. Infrastructure Layer (`src/infrastructure/`)
- Implements external concerns:
  - `database/repositories/`: Implements the repository interface using concrete technologies (Prisma, Mongoose, PostgreSQL client, or In-memory store).
  - `external-clients/`: Client classes that send HTTP/gRPC requests to other services or third-party APIs (e.g., Bank SOAP gateway, Payment gateway) with explicit timeouts (max 5000ms) and retry policies.
  - `logging/`: Unified logging configuration with Winston or Pino.

---

### 2.3. Port Allocation & Service Registry (Preventing Port Collisions)

The development team decomposes services according to business requirements. To ensure that multiple services can run simultaneously on a local machine without port collisions:

#### 1. Port Allocation Rules
- `3000`: Dedicated to Frontend Web Portal (`frontend/`).
- `4000`: Dedicated to API Gateway (if implemented).
- `4001 - 4099`: Dedicated to individual Backend Services (`backend/<service-name>/`).

#### 2. Registration Protocol
- When an AI Agent or developer creates a new service, they MUST select an unassigned port in the `4001+` range.
- The selected port MUST be defined in the service's `.env.example`.
- **MANDATORY**: The AI Agent MUST register the new service in the **Service Registry Table** below.

#### Service Registry Table

| Service Name | Directory | Default Port | Primary Responsibility |
|---|---|---|---|
| **Frontend Web** | `frontend/` | `3000` | Next.js 16 Web Portal (chủ sở hữu: A) |
| **API Gateway** | `backend/api-gateway/` | `4000` | Proxy tập trung về 4001–4005, CORS credentials, timeout 5000ms (chủ sở hữu: A) |
| **Identity Service** | `backend/identity-service/` | `4001` | JWT + cookie hrm-session, RBAC admin/manager/staff (chủ sở hữu: A) |
| **Organization Service** | `backend/organization-service/` | `4002` | Danh mục tổ chức, chi nhánh, phòng ban và nhân sự (chủ sở hữu: B) |
| **Work Service** | `backend/work-service/` | `4003` | Ca kíp, phân ca, chấm công, tác vụ (chủ sở hữu: C) |
| **Payroll Service** | `backend/payroll-service/` | `4004` | Tài khoản công ty, lương, lệnh chi idempotent, phiếu lương (chủ sở hữu: B) |
| **Integration Service** | `backend/integration-service/` | `4005` | SOAP ngân hàng, yêu cầu, thông báo, bảng tin, nội quy, Wi-Fi (chủ sở hữu: C) |

---

### 2.4. Standard HTTP Response & Error Envelopes

All controllers across ALL backend services MUST return responses using this unified JSON envelope:

#### 1. Success Response (HTTP 200 OK, 201 Created)
```json
{
  "data": {
    "id": "e-1001",
    "name": "Nguyễn Văn A",
    "role": "staff"
  },
  "message": "Thao tác thành công"
}
```

#### 2. Error Response (HTTP 400, 401, 403, 404, 422, 500)
```json
{
  "error": {
    "code": "EMPLOYEE_NOT_FOUND",
    "message": "Không tìm thấy thông tin nhân sự trên hệ thống",
    "details": null
  }
}
```

#### Standard Error Codes:
- `VALIDATION_ERROR` (400): Request payload failed schema validation.
- `UNAUTHORIZED` (401): Missing or invalid authentication token/session.
- `FORBIDDEN` (403): User lacks permission to perform the action.
- `NOT_FOUND` (404): Resource does not exist.
- `INSUFFICIENT_FUNDS` (422): Debit account balance is insufficient for payout.
- `DUPLICATE_RESOURCE` (409): Resource already exists (e.g., duplicated email or idempotency key).
- `INTERNAL_SERVER_ERROR` (500): Unexpected unhandled server failure.

---

### 2.5. Inter-Service Communication Guidelines

1. **Decoupled Networking**:
   - Cross-service communication MUST occur via HTTP REST or gRPC through adapters placed in `src/infrastructure/external-clients/`.
   - **TIMEOUT RULE**: All HTTP requests between services MUST have a timeout configured (maximum 5000ms).
2. **STRICT PROHIBITION**:
   - Never import code or files from another service directly:
     ```javascript
     // ❌ STRICTLY FORBIDDEN
     const { calculateTax } = require("../../payroll-service/src/services/tax");
     
     // ✅ CORRECT APPROACH
     const payrollClient = require("../infrastructure/external-clients/PayrollClient");
     const taxResult = await payrollClient.getTaxCalculation(payload);
     ```

---

### 2.6. Common Enterprise Business Rules

1. **Fixed Monthly Salary & Checkout Penalties**:
   - Core staff receive a fixed monthly base salary (`baseSalary`).
   - Work shift checkout does not add/subtract hourly wages. Checkout only records penalty deductions if attendance violations occur (late arrival, unauthorized leave).
   - Monthly Net Salary formula: `netSalary = baseSalary + bonus - totalPenalties + allowances`.
2. **Payroll Payouts & Idempotency**:
   - All payout operations MUST enforce idempotency using an `idempotencyKey`.
   - If a payout request is received with an existing `idempotencyKey`, the system MUST return the previously processed payout record with `{ "deduped": true }` instead of executing a second deduction.
   - Payout transactions generate IDs with prefixes: `TXN-*` (internal transaction) and `BANK-*` (bank reference code).
3. **Data Schema Synchronization**:
   - Core business entities (Employee, Branch, Shift, BankAccount, Payslip, Request) MUST remain strictly synchronized with:
     - Frontend Web: `frontend/src/mock-data/portal.ts`
     - Mobile: `mobile/lib/src/core/models/`

---

## 3. Frontend Architecture (`frontend/`, Next.js 16 App Router)

- **Tech Stack**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Font Awesome.
- **Source Directory**: All source code is under `src/`, with path alias `@/*` mapped to `./src/*`.
- **App Router Standard**:
  - `src/app/` handles routes and standard files: `loading.tsx`, `error.tsx`, `not-found.tsx`, `layout.tsx`.
  - Route tree: `/` → `/login`; `/dashboard/*` (employees, departments, branches, shifts, tasks, requests, payslips, bank, news, regulations, wifi).
- **Feature Structure**:
  - Flat feature modules located under `src/features/<domain>/` (e.g., `src/features/employees/`, `src/features/payroll/`). Do not deeply nest under `hr/`.
  - Shared UI components located under `src/components/ui/` and layout components in `src/components/layout/`.
- **State & Client Components**:
  - Any component managing interactive state, hooks, or browser events MUST have `"use client"` at the very top.
- **Authentication & Authorization**:
  - Managed via `AuthContext` and session cookie `hrm-session`.
  - Protected routes guarded by `src/middleware.ts`.
  - Never expose `role` or `branchSlug` in URL routes.
  - Dynamic navigation menu is generated via `buildMenuItems(role)` in `src/lib/permissions.tsx`.
- **Currency & Formatting**:
  - Currency formatting MUST use `formatVND()` from `src/lib/utils.ts`.
- **Quality Checks**:
  - `npx tsc --noEmit` MUST pass with 0 errors.
  - `npm run build` MUST complete successfully.

---

## 4. Mobile Architecture (`mobile/`, Flutter 3.x)

- **Tech Stack**: Flutter 3.x, Dart 3.x, `go_router`, Material 3.
- **Directory Layout**:
  ```text
  lib/src/
  ├── app.dart                        # HRMApp entry point using MaterialApp.router
  ├── core/                           # Core constants, theme, models, utils, widgets, router
  │   ├── constants/                  # App constants & asset paths
  │   ├── models/                     # Shared data models (UserModel, ShiftModel, etc.)
  │   ├── router/router.dart          # Central go_router definition (Single Source of Truth)
  │   ├── theme/                      # AppColors (#8E1B2F), AppTheme, AppTypography (Public Sans)
  │   └── utils/                      # Date/currency formatters
  └── features/<feature_name>/        # Feature modules
      ├── data/                       # Repositories & API / mock datasources
      └── presentation/               # Screens & UI widgets
  ```
- **Navigation**:
  - `core/router/router.dart` is the sole router configuration (`/`, `/login`, `/main` with `extra: UserModel`).
  - Always navigate using `context.go()` or `context.pushReplacement()`. NEVER invoke `Navigator` directly.
- **Theme & Styling**:
  - Brand color `AppColors.primary` is `#8E1B2F`.
  - Typography: Public Sans via `AppTypography`.
  - Color alpha transparency: NEVER use `.withOpacity()`; always use `.withValues(alpha: ...)`.
  - Never hardcode color hex codes in widgets; always reference `AppColors`.
- **Quality Checks**:
  - `flutter analyze` MUST pass with 0 issues.
  - `flutter test` MUST pass.

---

## 5. AI Agent Vibe Coding Rules (Conflict Prevention Protocol)

When multiple human developers and autonomous AI Agents work concurrently in this monorepo, strict isolation rules are essential to prevent overlapping edits, git conflicts, and unintended bugs.

### 5.1. Work Isolation Principles

1. **Strict Directory Boundary**:
   - When an AI Agent is assigned a task for a specific backend service, the Agent MUST ONLY create or modify files inside `backend/<service-name>/`.
   - The Agent MUST NOT modify sibling backend services, `frontend/`, or `mobile/` unless explicitly instructed in the user prompt.
2. **Git Branching Rules**:
   - NEVER commit directly to `main` or `dev`.
   - Always branch off `dev` using the convention: `feat/<service-name>-<developer-name>` or `fix/<service-name>-<issue-name>`.
   - Before completing work, run `git pull origin dev` to reconcile and test against the latest changes.
3. **Never Commit Secrets or Real Environment Files**:
   - Real `.env` files MUST remain gitignored.
   - Only `.env.example` with sanitized placeholder values is permitted in Git.

### 5.2. Mandatory AGENTS.md Handover Protocol

To keep all subsequent AI Agents informed of the system's evolving landscape, the following protocol is **MANDATORY**:

#### WHEN an AI Agent MUST update `AGENTS.md`:
1. **New Service Created**: The Agent MUST append the new service name, directory path, and assigned default port to the **Service Registry Table (Section 2.3)**.
2. **Major Shared Contract Introduced**: If an Agent alters a shared data model (e.g., adds fields to `Employee` or `Shift`), it MUST document the schema modification in Section 2.6.

#### WHEN an AI Agent MUST NOT update `AGENTS.md`:
- Do NOT write personal task lists, scratchpad notes, commit logs, or ephemeral debug steps into `AGENTS.md`.
- `AGENTS.md` is strictly reserved for **Permanent System Architecture and Universal Constraints**.

### 5.3. Pre-Completion Acceptance Checklist for AI Agents

Before marking any backend development task as finished, the AI Agent MUST verify:

- [ ] **Independent Execution**: Service starts cleanly inside its folder (`cd backend/<service-name> && npm install && npm run dev`).
- [ ] **Health Endpoint Operational**: `GET /health` responds with `{ "status": "ok", "service": "<service-name>", "time": "..." }`.
- [ ] **100% Clean Architecture Compliance**: Correct directory layout (`config/`, `src/api/`, `src/domain/`, `src/services/`, `src/infrastructure/`, `tests/`).
- [ ] **Error Handling Uniformity**: Returns standard `{ "data": ... }` on success and `{ "error": { "code": ..., "message": ... } }` on failure.
- [ ] **Environment Template Present**: `.env.example` is committed with all required variable keys.
- [ ] **Service Registry Updated**: If a new service was introduced, its port and responsibility are registered in `AGENTS.md`.
