# Veylo — Modern SaaS Administration & Operational Intelligence

> **Important Notice:** Veylo is a **frontend-only, browser-based interactive demonstration application**. All business data, authentication, customer accounts, and administrative operations execute locally inside the user's browser using `localStorage`. There is no runtime backend server, database, or external network dependency. Changes made within the application persist in the local browser and do not affect any real accounts or external services.

---

## 🚀 Overview

**Veylo** is a modern SaaS administration and operational intelligence dashboard engineered with **React 18, TypeScript, Vite, and Tailwind CSS**. Designed for multi-tenant software operations, Veylo provides end-to-end administrative management across tenant lifecycles, team role governance, subscription catalog management, and product analytics.

### Key Highlights

- **100% Client-Side Architecture:** Zero server dependencies. Suitable for static hosting on Vercel, Netlify, Cloudflare Pages, or GitHub Pages.
- **Unified Local Data Layer:** Centralized service architecture (`customerService`, `teamService`, `planService`, `activityService`, `analyticsService`) with schema versioning and corrupted-data self-healing.
- **Deterministic Seed Dataset:** Includes 38 customer organizations, 10 team members with departmental assignments, 4 subscription tiers, and audit history.
- **Interactive Demo Authentication:** Pre-configured shared Demo Admin session with one-click access and persistent credentials panel.
- **Comprehensive CRUD Operations:** Create, read, update, delete, search, sort, and filter across customers, team members, and subscription plans.
- **Safe Reset Capabilities:** Instant one-click "Reset Demo Data" restores the initial factory seed state without clearing unrelated domain data.

---

## 🔑 Shared Demo Credentials

The application provides a persistent simulated authentication mechanism. Use these credentials on the sign-in page:

| Role | Email | Password | Console Access |
| :--- | :--- | :--- | :--- |
| **Demo Administrator** | `admin@veylo.demo` | `VeyloDemo123` | Full access across all modules |

> **Tip:** The login page features a **One-Click Login** button and a **Fill Form** button for immediate access.

---

## ✨ Features & Functional Modules

### 1. Public Landing Page (`/`)
- Modern product presentation with value proposition, platform highlights, and representative UI preview.
- Direct **"Open Demo Dashboard"** and **"Sign In"** entry points.
- Theme switcher and live demo indicator.

### 2. Platform Overview Dashboard (`/app`)
- Key performance metrics: Total Customers, Monthly Recurring Revenue (MRR), Annual Run Rate (ARR), Managed Seats, and Daily/Weekly Active Users (DAU/WAU).
- Interactive user growth curve (Line chart).
- Subscription tier distribution (Doughnut chart).
- Recent customer registrations table with plan badges and status pills.
- Recent audit activities feed.

### 3. Customer Organization Governance (`/app/customers`)
- Complete CRUD: Onboard new organizations, edit details, and remove records with confirmation dialogs.
- Detailed customer inspect modal with seat counts, contract values, primary contact info, and industry tags.
- Search by organization name, contact person, email, or industry.
- Multi-dimensional filters: Filter by subscription tier (Free, Pro, Business, Enterprise) and account status (active, inactive, pending).
- Sorting by Name, Seats, Created Date, or Last Active.
- Client-side CSV data export.

### 4. Subscription Plans & Tiers (`/app/plans`)
- Tier management for **Free**, **Pro**, **Business**, and **Enterprise**.
- Interactive Monthly / Annual billing interval preview with savings indicators.
- Quota configuration: Seat boundaries, active project limits, cloud storage allocations, and API volume thresholds.
- Dynamic feature checklist management.
- Safety protection: Active subscribed plans cannot be deleted while customer accounts are linked to them.
- "Restore Defaults" button to reinitialize baseline tier definitions.

### 5. Team & Role Governance (`/app/team`)
- Complete team CRUD: Invite members, modify profile info, and assign Admin or Staff roles.
- Departmental classification (Operations, Engineering, Customer Success, Platform Reliability, etc.).
- Account status toggling (Active / Inactive) with visual indicators.
- Member deletion with security confirmation modal.
- Search and role/status filtering.

### 6. Product & Telemetry Analytics (`/app/insights` or `/app/analytics`)
- Time window selection: **7 days**, **30 days**, **90 days**, and **1 year**.
- Segment filtering: Filter metrics across specific subscription tiers.
- Mathematical usage telemetry derived directly from customer seat counts (guaranteeing deterministic consistency across visits).
- Toggleable chart views: Line view (active user DAU curves) and Bar view (API requests, automated workflows, and telemetry exports).
- Clearly identified as synthetic demo analytics.

### 7. Administrative Audit Journal (`/app/activity`)
- Chronological audit logging of customer operations, team updates, tier changes, sign-ins, and data resets.
- Categorized by `customer`, `team`, `plan`, `auth`, and `system`.
- Keyword search and category filtering.
- Local audit history clearing option.

### 8. Application Preferences & State (`/app/settings`)
- Organization metadata configuration (entity name, support email, currency, timezone).
- Interface appearance preference (Light / Dark theme toggle).
- Storage footprint indicator (displaying active `localStorage` consumption in KB).
- State backup & restore: Download complete browser state as a `.json` file or import an existing snapshot.
- Factory reset demo data modal.

### 9. Global Directory Search (`/app/search`)
- Unified index across customers, team members, and subscription plans with direct deep-links.

---

## 🛠️ Technology Stack

- **Framework:** React 18 (`react`, `react-dom`)
- **Language:** TypeScript 5.9 (Strict mode enabled)
- **Routing:** React Router v6 (`react-router-dom`)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/postcss`, `autoprefixer`)
- **Icons:** Lucide React (`lucide-react`)
- **Visualizations:** Chart.js 4 & React ChartJS 2 (`chart.js`, `react-chartjs-2`)
- **Build Tool:** Vite 4 (`vite`, `@vitejs/plugin-react`)
- **Linting & Code Quality:** ESLint 8 (`@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`)
- **Test Runner:** Node.js / `tsx` automated verification harness

---

## 🏗️ Architecture & Folder Structure

```text
├── index.html                  # HTML entry point with Veylo branding and SVG favicon
├── package.json                # Project dependencies and script commands
├── tailwind.config.js          # Tailwind CSS styling configuration
├── tsconfig.json               # TypeScript compiler options (strict checking)
├── vite.config.ts              # Vite bundling configuration
├── public/
│   └── favicon.svg             # Veylo geometric vector favicon
├── scripts/
│   └── verify-veylo.js         # Automated data layer verification suite (41 tests)
└── src/
    ├── main.tsx                # Application bootstrap & Chart.js component registration
    ├── App.tsx                 # Route definitions (Public landing, Login, Protected /app)
    ├── index.css               # Global Tailwind CSS imports
    ├── types.ts                # Strict TypeScript domain interfaces
    ├── data/
    │   └── seedData.ts         # Deterministic seed records (Customers, Team, Plans, Activity)
    ├── services/
    │   ├── storage.ts          # Safe localStorage manager, schema versioning, corrupt recovery
    │   ├── dataService.ts      # Core CRUD business logic, analytics calculations, events
    │   ├── authService.ts      # Simulated authentication, session state, credentials
    │   └── mockApi.ts          # Backwards-compatible service adapter
    ├── contexts/
    │   ├── AuthContext.tsx     # Session management and quick demo login
    │   └── ThemeContext.tsx    # Light/Dark visual theme state and persistence
    ├── components/
    │   ├── VeyloLogo.tsx       # Vector SVG logo & branding wordmark
    │   ├── DemoBanner.tsx      # Persistent top demo advisory banner
    │   ├── ResetModal.tsx      # Double-confirmation demo reset dialog
    │   ├── Header.tsx          # App header with global search, notifications, theme toggle
    │   ├── Sidebar.tsx         # Navigation sidebar with credentials panel and profile footer
    │   ├── Modal.tsx           # Accessible modal container with keyboard Escape handler
    │   ├── ToastProvider.tsx   # Contextual feedback toast notifications
    │   └── ProtectedRoute.tsx  # Route guard redirecting unauthenticated users to /login
    ├── layouts/
    │   └── MainLayout.tsx      # Admin viewport layout (Banner + Sidebar + Header + Content)
    └── pages/
        ├── Landing.tsx         # Public landing page with demo launch CTA
        ├── Login.tsx           # Authentication page with one-click demo credentials
        ├── Dashboard.tsx       # Platform overview, KPIs, and visual charts
        ├── Customers.tsx       # Customer organization directory with CRUD & CSV export
        ├── Pricing.tsx         # Subscription tiers, quota configuration & plan CRUD
        ├── Staff.tsx           # Team member management with roles & status toggles
        ├── Insights.tsx        # Telemetry analytics, date range filters & feature usage
        ├── Activity.tsx        # Administrative audit log with category filters
        ├── Settings.tsx        # Preferences, theme selection, state backup & reset
        └── Search.tsx          # Global directory search index
```

---

## 💾 LocalStorage Persistence Architecture

All data operations are centralized in `src/services/storage.ts` and `src/services/dataService.ts`. Direct access to `localStorage` from UI components is prohibited.

### Storage Keys

Every key is strictly prefixed with `veylo:` to prevent collisions with other applications on the same origin:

| Storage Key | Content | Purpose |
| :--- | :--- | :--- |
| `veylo:schema_version` | `1` | Schema version indicator for automatic migration/reseeding |
| `veylo:auth` | `AuthSession` | Active session metadata (Email, Name, Role, Login timestamp) |
| `veylo:customers` | `Customer[]` | Array of customer organization records |
| `veylo:team` | `User[]` | Array of team members and console operators |
| `veylo:plans` | `PlanDef[]` | Array of subscription tier definitions and quotas |
| `veylo:activity` | `ActivityItem[]` | Rolling log of recent administrative actions (up to 100 entries) |
| `veylo:settings` | `AppSettings` | Organization metadata, currency, timezone preferences |
| `veylo:theme` | `'light' \| 'dark'` | Persisted visual theme preference |

### Self-Healing & Corrupt Data Recovery

If any key in `localStorage` contains invalid or malformed JSON, `storage.getItem` intercepts the `SyntaxError`, logs a diagnostic warning, and returns the appropriate fallback or seed dataset without breaking the application.

### Resetting Demo Data

To reset the application to its original seed dataset:
1. Click **Reset Demo Data** in the top demo banner, the sidebar card, or the Settings page.
2. Confirm the reset in the modal dialog.
3. The application purges `veylo:` keys, reseeds 38 customers, 10 team members, 4 plans, and standard settings, preserves your active demo session, and emits a `veylo:data-changed` event to update all visible views instantly without a full page reload.

---

## 💻 Local Setup & Development

### Prerequisites

- Node.js 18.x or later
- npm 9.x or later (or Yarn / pnpm)

### Installation

```bash
# Clone the repository
git clone https://github.com/callmeniyu/veylo.git
cd veylo

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Vite will start the local development server (typically at `http://localhost:5173/`).

### Type Checking & Production Build

```bash
# Type check and build static production bundle
npm run build
```

Production build artifacts will be output to the `dist/` directory.

### Code Quality & Linting

```bash
# Run ESLint across TypeScript source files
npm run lint
```

### Automated Verification Tests

```bash
# Execute the automated verification suite
npm test
```

The test runner validates all 41 test cases covering data initialization, CRUD operations, plan deletion safety, schema migrations, corrupt recovery, and authentication flows.

---

## 🚢 Static Deployment

Because Veylo is completely frontend-based with no backend server requirement, it can be deployed to any static host.

### Production Build Verification

```bash
npm run build
npm run preview
```

### Deployment Configuration (SPA Fallback)

When deploying to a static host, ensure that all routes fallback to `index.html` to support React Router:

- **Netlify:** Include a `_redirects` file in `public/`:
  ```text
  /*    /index.html   200
  ```
- **Vercel:** Include a `vercel.json` rewrite:
  ```json
  {
    "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
  }
  ```
- **GitHub Pages:** Use a 404.html redirect or HashRouter if server-level rewrites are unavailable.

---

## ⚠️ Demo Scope & Limitations

1. **Client-Side Simulation:** Authentication and role enforcement are simulated for demonstration purposes. Do not enter sensitive corporate credentials or confidential customer data.
2. **Ephemeral Storage:** Data is persisted in the current browser's `localStorage`. Clearing browser cookies and site data will reset the application to its seed state.
3. **Synthetic Telemetry:** Daily active user counts, API event volumes, and workflow counts are derived mathematical models designed to showcase dashboard responsiveness.
4. **No External Integrations:** Billing payments, emails, and webhooks are simulated locally and do not dispatch external network requests.

---

## 📄 Attribution & Third-Party Dependencies

This project is a design and frontend prototype built using open-source libraries:
- React (MIT License)
- Vite (MIT License)
- Tailwind CSS (MIT License)
- Lucide React (ISC License)
- Chart.js (MIT License)
- Headless UI (MIT License)

Original project scaffolding based on design prototypes from the repository history. All product branding, naming, design system components, vector icons, local browser data architecture, and demo content are developed as **Veylo**.
