# ACRM — Automated Campus Research Management

## Enterprise-Grade Academic Research, Project & IPR Management Platform

ACRM (Automated Campus Research Management) is a centralized, production-oriented academic platform designed for higher-education and university environments. It connects:

**Students ↔ Faculty ↔ Research ↔ Projects ↔ IPR & Innovation ↔ Administration**

---

## 1. System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Routing**: React Router v6
- **Server State & Cache**: TanStack Query (React Query)
- **Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Design System**: Institutional Academic Design Tokens (Vanilla CSS + CSS Custom Properties, Light/Dark theme switching, zero generic neon/glassmorphism, highly accessible)
- **i18n**: Extensible dictionary-based internationalization architecture

### Backend
- **Framework**: Node.js + Express.js + TypeScript
- **Layered Pattern**: `Routes → Middleware → Controllers → Services → Repositories/Data Access → MongoDB Models`
- **Database**: MongoDB + Mongoose with schema validation and compound text indexes
- **Security & Auth**:
  - Argon2id state-of-the-art password hashing (with backward compatibility for bcrypt)
  - Short-lived JWT access tokens (15m) + rotating refresh tokens (7d)
  - Refresh tokens stored in `HttpOnly`, `SameSite=Lax`, secure cookies
  - Role-Based Access Control (`STUDENT`, `FACULTY`, `ADMIN`)
  - Strict resource-level authorization (student ownership, assigned faculty mentor, admin)
  - Centralized error handler with standardized envelopes: `{ success: false, error: { code, message, details } }`
  - Automated audit logging for security and operational transactions
- **IPR & Innovation Module**:
  - AI-Assisted Preliminary Novelty Screening prior to IPR disclosure
  - Interactive "ACRM IPR Research Assistant" chatbot
  - Institutional IPR Disclosure and Review workflows (Patent, Copyright, Trademark, Invention)
  - Source transparency and legal disclaimers ensuring no false legal claims

---

## 2. Directory Layout

```
e:\ACRM/
├── package.json                   # Root orchestrator (concurrently dev & build)
├── README.md                      # Comprehensive system documentation
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts           # Vitest integration test config
│   ├── .env.example
│   ├── .env                       # Local environment variables
│   ├── src/
│   │   ├── config/                # env.ts, db.ts, constants.ts
│   │   ├── types/                 # Express augmentation, DTOs
│   │   ├── errors/                # AppError, BadRequest, Unauthorized, Forbidden
│   │   ├── middleware/            # auth.ts, rbac.ts, validate.ts, rateLimiter.ts, errorHandler.ts
│   │   ├── models/                # 19 Mongoose models (User, Project, Milestone, Review, etc.)
│   │   ├── repositories/          # Type-safe MongoDB data access queries
│   │   ├── services/              # Business logic (Auth, Projects, Research, Recommendations)
│   │   ├── controllers/           # HTTP Request handlers
│   │   ├── validators/            # Zod validation schemas
│   │   ├── routes/                # Express sub-routers under /api/v1
│   │   ├── utils/                 # password.ts, tokens.ts, logger.ts
│   │   ├── seeds/                 # seed.ts (Full development database population)
│   │   ├── app.ts                 # Express application factory
│   │   └── server.ts              # Server bootstrap and graceful shutdown
│   └── tests/
│       └── api.test.ts            # Integration test suite (Supertest + Vitest)
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts             # Vite config with backend API proxy
    ├── index.html                 # Institutional HTML with Google Fonts Inter
    └── src/
        ├── app/                   # App.tsx, router.tsx
        ├── components/
        │   ├── ui/                # Button, Input, Modal, Badge, Tabs, Skeleton, Breadcrumbs, EmptyState
        │   └── layout/            # Navbar, Sidebar, DashboardLayout, GlobalSearchModal
        ├── features/
        │   ├── landing/           # University Research Portal Homepage
        │   ├── auth/              # SignInPage, SignUpPage, ForgotPassword, ResetPassword
        │   ├── student/           # StudentDashboard
        │   ├── faculty/           # FacultyDashboard, FacultyDirectoryPage
        │   ├── admin/             # AdminDashboard, UserManagement, ResearchTaxonomy, AuditLogs
        │   ├── research/          # TopicsCatalog, PapersCatalog, Recommendations, SavedResearch
        │   ├── projectIdeas/      # ProjectIdeasCatalog
        │   ├── projects/          # CreateProjectWizard (9 steps), ProjectsListPage, ProjectWorkspace (8 tabs)
        │   ├── support/           # SupportCenterPage
        │   └── settings/          # Profile, Appearance (Theme), Language (i18n), Security
        ├── services/
        │   ├── api/               # apiClient.ts, authApi, projectApi, researchApi, otherApis
        │   └── i18n/              # I18nContext, translations
        ├── hooks/                 # useAuth, useTheme, useToast
        └── styles/                # index.css (Institutional design system tokens)
```

---

## 3. Pre-Configured Seed Accounts

Run `npm run seed` to populate the database with realistic academic records:

| Role | Email | Password | Designation / Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@university.edu` | `AdminSecret123!` | System Administrator & Research Dean |
| **Faculty** | `faculty@university.edu` | `Password123!` | **Dr. Eleanor Vance** (Associate Professor, CSE) |
| **Student** | `student@university.edu` | `Password123!` | **Alex Rivera** (Final Year CS, ID: `ACR-2024-CS-042`) |

*(Quick-fill buttons are also available on the Sign In page for seamless testing).*

---

## 4. Setup & Running Locally

### Prerequisites
- Node.js >= v20
- MongoDB server running on `127.0.0.1:27017`

### 1. Install Dependencies
```bash
# Root orchestrator
npm install

# Backend
npm install --prefix backend

# Frontend
npm install --prefix frontend
```

### 2. Configure Environment
Backend `.env`:
```ini
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/acr_platform
CORS_ORIGIN=http://localhost:3000
JWT_ACCESS_SECRET=acr_academic_access_token_secret_super_secure_key_2025_prod_random_key_64bit
JWT_REFRESH_SECRET=acr_academic_refresh_token_secret_super_secure_key_2025_prod_random_key_64bit
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
COOKIE_SECURE=false
UPLOAD_DIR=uploads
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Run Development Servers
```bash
# Concurrently starts backend on :5000 and frontend on :3000
npm run dev
```
- **Frontend Portal**: `http://localhost:3000/`
- **Backend API**: `http://localhost:5000/api/v1/`
- **Health Check**: `http://localhost:5000/api/v1/health`

### 5. Run Automated Tests
```bash
npm run test
```
Executes the Vitest & Supertest integration suite verifying auth, RBAC, project lifecycle, and deterministic recommendations.

---

## 5. Key System Capabilities

### 1. Public Institutional Portal
- Institutional visual language designed for universities.
- Dynamic showcase of 18+ research domains, recent publications with verified DOIs, and institutional capabilities.

### 2. Authentication & Role-Based Security
- Student registration collects academic details (Student ID, Department, Program, Year, Research Interests).
- Faculty registration captures Employee ID, Designation (Associate Professor, Professor, etc.), Experience, and Areas of Guidance.
- Rotating refresh tokens in `HttpOnly` cookies.
- Password recovery with time-limited single-use cryptographic tokens.

### 3. Research Discovery & Deterministic Recommendation Engine
- Full-text search and filtering across 18 research domains and peer-reviewed papers.
- Transparent, deterministic academic recommendation matcher combining:
  - Department Alignment (+30 pts)
  - Student Declared Research Interests Overlap (+20 pts/keyword)
  - Active Project Domain Overlap (+25 pts)
  - Citation Impact Factor (+10 pts)

### 4. Multi-Step Project Proposal Wizard
- 9 validated steps: Project Info → Domain → Problem Statement → Objectives → Technologies → Team Members → Faculty Guide Selection → Review → Submission.
- Full draft autosaving support.

### 5. Project Workspace & Strict Lifecycle State Machine
- Controlled transitions: `DRAFT → SUBMITTED → UNDER_REVIEW → CHANGES_REQUESTED → APPROVED → IN_PROGRESS → FINAL_REVIEW → COMPLETED`.
- 8 dedicated workspace tabs: Overview, Milestones, Documents, Faculty Feedback, Rubric Reviews, Team, Project Channel, and Activity.
- Exact progress calculation based on completed milestone weights.

### 6. Faculty Guidance & Rubric Reviews
- Associate Professor guidance request / accept / decline workflow respecting mentorship capacity limits.
- Rubric-based grading with criteria scores, qualitative remarks, recommendations, and status decisions.
- Threaded faculty feedback with status tracking (`OPEN` / `RESOLVED`).

### 7. Administrative Governance & Audit Logging
- Operational analytics: active students, faculty, projects by status, domain distributions.
- User management: account activation/deactivation with confirmation dialogs, faculty designation updates.
- Dynamic taxonomy management: add domains, topics, and papers without editing code.
- Full security audit log explorer.
