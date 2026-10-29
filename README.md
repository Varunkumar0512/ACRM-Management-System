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

Backend `.env` (`backend/.env`):
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

# Google OAuth 2.0 Identity Services Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
# Optional: comma-separated list of allowed domains (e.g., university.edu,campus.ac.in)
GOOGLE_ALLOWED_DOMAINS=
```

Frontend `.env` (`frontend/.env`):
```ini
# Google Identity Services Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 5. Google Authentication — Sign in with Google Setup Guide

ACRM integrates **Google Identity Services (GIS)** to provide enterprise-grade Single Sign-On (SSO) with official Google branding and multi-layered server-side verification.

### Google Cloud Console Configuration Steps

1. **Create or Select a Google Cloud Project**:
   - Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
   - Click the project dropdown in the top bar and select **New Project**.
   - Enter a project name (e.g. `ACRM-Institutional-Auth`) and click **Create**.

2. **Configure the OAuth Consent Screen**:
   - Go to **APIs & Services > OAuth consent screen**.
   - User Type: Select **External** (or **Internal** if using Google Workspace for your educational institution).
   - App Name: `Automated Campus Research Management (ACRM)`.
   - User support email: Select your administrator email.
   - Authorized domains: Add your production domain (e.g. `your-university.edu`).
   - Developer contact information: Enter administrative contact email.
   - Scopes: Request minimal standard identity scopes only: `openid`, `.../auth/userinfo.email`, and `.../auth/userinfo.profile`. Basic sign-in requests only the essential identity claims.
   - Test users (if in External "Testing" mode): Add the email addresses of faculty and student Google accounts that will be testing the application.

3. **Create a Web Application OAuth Client ID**:
   - Navigate to **APIs & Services > Credentials**.
   - Click **+ CREATE CREDENTIALS** and select **OAuth client ID**.
   - Application type: **Web application**.
   - Name: `ACRM Web Client`.
   - **Authorized JavaScript origins**:
     - Local development:
       - `http://localhost:3000`
       - `http://127.0.0.1:3000`
     - Production:
       - `https://acrm.your-institution.edu`
   - **Authorized redirect URIs**:
     - Google Identity Services (credential token flow) primarily uses JavaScript origins. If using redirect flows or server callback fallbacks, configure:
       - `http://localhost:3000/sign-in`
       - `http://localhost:5000/api/v1/auth/google/callback`
   - Click **Create**. Copy the generated **Client ID** (e.g., `1234567890-abcdefg.apps.googleusercontent.com`).
   - *Security Note*: Never expose the Google Client Secret in the frontend. The frontend only needs `VITE_GOOGLE_CLIENT_ID`.

4. **Configure Environment Variables**:
   - Set `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`.
   - Set `GOOGLE_CLIENT_ID` in `backend/.env`.
   - (Optional) Configure `GOOGLE_ALLOWED_DOMAINS=university.edu,campus.edu` in `backend/.env` to restrict authentication strictly to institutional domains.

5. **Testing Institutional Accounts**:
   - **New Student Google Account**: Click "Continue with Google" on Sign In or Sign Up. A new student profile is automatically provisioned with role `STUDENT` without requiring manual form entry.
   - **Existing Account Linking**: If an institutional researcher already has a password-based account (e.g. `faculty@university.edu`), signing in with that Google account prompts for their existing password to verify ownership. Once verified, the Google identity (`googleId`) is linked to their profile, preserving all assigned projects, research papers, faculty reviews, and IPR records.
   - **Unauthorized Domain Test**: If `GOOGLE_ALLOWED_DOMAINS` is set, accounts from outside authorized domains receive an explicit HTTP 403 institutional restriction error.
   - **Disabled Account Rejection**: Deactivated student or faculty accounts cannot authenticate via Google or password.

---

## 6. Seed Database & Local Execution

### 1. Seed Database
```bash
npm run seed
```

### 2. Run Development Servers
```bash
npm run dev
```
- **Frontend Portal**: `http://localhost:3000/`
- **Backend API**: `http://localhost:5000/api/v1/`
- **Health Check**: `http://localhost:5000/api/v1/health`

### 3. Run Automated Tests
```bash
# Run all backend tests (35 integration tests across security, auth, IPR, projects)
npm test --prefix backend
```
Executes the comprehensive Vitest suite covering:
- Valid and invalid Google ID token verification (signature, issuer, expiration, audience).
- Google user auto-registration and default `STUDENT` role assignment.
- Secure account linking requiring existing password confirmation (HTTP 409 `ACCOUNT_LINKING_REQUIRED`).
- Prevention of duplicate Google ID binding across multiple institutional users.
- Disabled account sign-in rejection.
- Password change via real backend API (`POST /api/v1/auth/change-password`).
- Session revocation and HttpOnly cookie clearance on logout.
- Strict resource-level authorization across project milestones, comments, documents, novelty screenings, and IPR workflows.

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
