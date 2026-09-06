# Swipe X — AI-Powered Job Discovery & Next-Gen ATS Scoring Platform

> **Modern job matching meets transparent ATS compatibility audits.** Upload your resume, receive instant AI candidate analysis, swipe through verified roles, and apply with real-time scoring breakdowns.

---

## 📖 Table of Contents
1. [Overview & Core Value Proposition](#overview--core-value-proposition)
2. [Key Capabilities & Highlights](#key-capabilities--highlights)
3. [End-to-End System Architecture](#end-to-end-system-architecture)
4. [Technology Stack](#technology-stack)
5. [Project Directory Structure](#project-directory-structure)
6. [AI Engines & Mathematical Algorithms](#ai-engines--mathematical-algorithms)
   - [Gemini AI Resume Parsing Engine](#gemini-ai-resume-parsing-engine)
   - [Multi-Factor ATS Compatibility Matrix](#multi-factor-ats-compatibility-matrix)
   - [Behavioral Recommendation Loop](#behavioral-recommendation-loop)
7. [Installation & Getting Started](#installation--getting-started)
8. [Available Scripts & Testing](#available-scripts--testing)
9. [REST API Endpoint Summary](#rest-api-endpoint-summary)
10. [Frontend Design System & Aesthetics](#frontend-design-system--aesthetics)
11. [Documentation Library](#documentation-library)

---

## 🌟 Overview & Core Value Proposition

Traditional job searching forces candidates to fill out repetitive multi-page forms into "black-box" Applicant Tracking Systems (ATS) where up to **75% of resumes** are filtered out before reaching human recruiters.

**Swipe X** revolutionizes this process:
* **Upload Once**: Candidate resumes (PDF, DOCX, TXT) are parsed in real time using Google DeepMind's **Gemini AI** (`gemini-3.7-flash`), automatically extracting technical skills, experience trajectories, quantifiable achievements, and education.
* **Smart Swipe Discovery**: A mobile-responsive Tinder-style swipe interface matches candidates with real, verified engineering, product, and data positions from top companies.
* **Pre-Flight ATS Audits**: Before applying, candidates receive an algorithmic 0–100% ATS score breaking down exact matched skills, keyword gaps, experience alignment, and tailored recommendations.
* **1-Click Application Hub**: One swipe right packages the candidate's profile, resume, tailored notes, and ATS score directly into the application pipeline with live status tracking.

---

## 🚀 Key Capabilities & Highlights

| Feature | Description |
| :--- | :--- |
| **Interactive Swipe Deck** | Physics-based swipe cards with keyboard shortcuts (`Left Arrow`, `Right Arrow`, `Up/Bookmark`), swipe-back undo, and filter controls. |
| **1,048 Verified Roles** | Production-ready dataset ingested from real hiring pipelines (LinkedIn, Greenhouse, Lever, Indeed) with extracted skills and salary data. |
| **Real-Time ATS Breakdown** | Detailed scoring gauge and sub-metrics (Skills Matrix 35%, Domain Keywords 25%, Experience 20%, Education 10%, Title 10%). |
| **Behavioral Learning** | Swipe decisions update dynamic candidate preference weights (skills, location, salary), constantly refining future recommendations. |
| **Comprehensive Dashboard** | Visual metrics tracking total swipes, match rates, active applications, ATS health scores, and saved roles. |
| **1-Click Demo Profile** | Pre-configured candidate account (*Alex Morgan*, Senior Full Stack & AI Engineer) to test the entire ecosystem instantly. |
| **Natural Tones Design** | High-contrast warm aesthetic using linen backgrounds (`#F2F0E9`), moss accents (`#5B6D5B`), ochre highlights (`#C29352`), and serif typography. |

---

## 🏛️ End-to-End System Architecture

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT BROWSER (Vite + React 19)                      │
│  ┌────────────────────┬────────────────────┬──────────────────┬─────────────────┐ │
│  │   SwipePage        │   DashboardPage    │  ATSAnalysisPage │ Profile & Resume│ │
│  │   (Gesture Cards)  │   (Analytics)      │  (Gauge & Audit) │ (Skill Matrix)  │ │
│  └─────────┬──────────┴─────────┬──────────┴────────┬─────────┴────────┬────────┘ │
│            │                    │                   │                  │          │
│            ▼                    ▼                   ▼                  ▼          │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │               AuthContext • ThemeContext • API Client (Axios-like)           │ │
│  └──────────────────────────────────────┬───────────────────────────────────────┘ │
└─────────────────────────────────────────┼─────────────────────────────────────────┘
                                          │ HTTP / JSON API (Bearer Token)
┌─────────────────────────────────────────┼─────────────────────────────────────────┐
│                                         ▼                                         │
│                         EXPRESS FULL-STACK SERVER (server.ts)                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐ │
│  │ Middleware: CORS • Express JSON (15MB) • JWT Authentication • Error Handlers │ │
│  └──────────────────────────────────────┬───────────────────────────────────────┘ │
│                                         │                                         │
│     ┌───────────────────┬───────────────┴───────────────┬───────────────────┐     │
│     ▼                   ▼                               ▼                   ▼     │
│ ┌──────────────┐ ┌──────────────┐             ┌───────────────────┐ ┌───────────┐ │
│ │ Auth & User  │ │ Job Service  │             │   AI Subsystem    │ │ Application││
│ │ Controllers  │ │ & Importer   │             │ (Gemini + ATS)    │ │ Controller│ │
│ └──────┬───────┘ └──────┬───────┘             └─────────┬─────────┘ └─────┬─────┘ │
│        │                │                               │                 │       │
│        ▼                ▼                               ▼                 ▼       │
│ ┌───────────────────────────────────────────────────────────────────────────────┐ │
│ │               In-Memory / File-Persisted Database Layer (db_store.json)       │ │
│ └───────────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`) with TypeScript
- **Bundler & Dev Server**: Vite 6
- **Routing**: React Router DOM v7 (`BrowserRouter`, `Routes`, `Route`, `Navigate`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom Natural Tones design tokens
- **Animations & Gestures**: `motion` (`motion/react`) for swipe physics, exit transitions, and tab animations
- **Icons**: Lucide React (`lucide-react`)
- **Effects**: Canvas Confetti (`canvas-confetti`) for application milestones

### Backend
- **Runtime**: Node.js v22 with TypeScript (`tsx` runtime engine)
- **Web Server**: Express.js v4
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), BCrypt (`bcryptjs`)
- **File Upload**: Multer (`multer`) with memory storage and size controls
- **Bundling**: ESBuild for production CJS bundle compilation
- **Persistence**: File-persisted atomic JSON storage (`/data/db_store.json`) with auto-seeding from `/data/clean_jobs.csv`

### AI & Intelligence
- **Google GenAI SDK**: `@google/genai` v2.4.0
- **Model**: `gemini-3.7-flash` with JSON schema structuring and fallback heuristic extraction

---

## 📁 Project Directory Structure

```
.
├── backend/                        # Backend architecture & logic
│   ├── src/
│   │   ├── ai/                     # AI & Algorithmic Engines
│   │   │   ├── atsAnalyzer/        # Multi-factor ATS scoring engine
│   │   │   ├── geminiClient.ts     # Google GenAI SDK wrapper
│   │   │   ├── jobMatcher/         # Vector / keyword matching engine
│   │   │   ├── recommendationEngine/ # Behavioral recommendation pipeline
│   │   │   └── resumeParser/       # Gemini AI resume extraction service
│   │   ├── config/                 # Environment and server configuration
│   │   ├── controllers/            # HTTP request controllers (Auth, ATS, Jobs, etc.)
│   │   ├── database/               # Database initialization & JSON store
│   │   ├── middleware/             # Auth token verification & error middleware
│   │   ├── repositories/           # Data access layer repositories
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # CSV Data Importer & background helpers
│   │   ├── types/                  # Backend TypeScript interfaces & types
│   │   └── utils/                  # Password hashing & JWT helpers
│   └── tests/                      # Integration & automated workflow tests
│
├── data/                           # Ingested datasets & persisted JSON DB
│   ├── clean_jobs.csv              # Production dataset (1,048 verified tech jobs)
│   └── db_store.json               # Auto-persisted local database
│
├── docs/                           # Complete technical documentation suite
│   ├── ai/                         # AI models, scoring math, prompts
│   ├── api/                        # REST API endpoint specification
│   ├── backend/                    # Backend services, controllers, DB guides
│   ├── database/                   # Schema definitions & entity diagrams
│   ├── frontend/                   # Components, views, styling guidelines
│   ├── workflows/                  # Sequence diagrams & candidate journeys
│   └── ARCHITECTURE.md             # System architecture deep dive
│
├── src/                            # Frontend source code (React 19 + TypeScript)
│   ├── api/                        # Typed client-side API layer
│   ├── components/                 # Reusable UI widgets (JobCard, ATSGauge, etc.)
│   ├── context/                    # AuthContext & ThemeContext providers
│   ├── pages/                      # Page views (Swipe, Dashboard, ATS, Profile, etc.)
│   ├── index.css                   # Global styles & Tailwind theme definitions
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Top-level routes & layout wrapper
│   └── types.ts                    # Frontend shared TypeScript declarations
│
├── .env.example                    # Environment variable template
├── metadata.json                   # AI Studio application metadata
├── package.json                    # Dependencies and npm scripts
├── server.ts                       # Full-stack server entry point (Express + Vite)
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build and Tailwind plugin setup
```

---

## 🧠 AI Engines & Mathematical Algorithms

### 1. Gemini AI Resume Parsing Engine
* **File**: `backend/src/ai/resumeParser/resumeParserService.ts`
* **Technology**: `@google/genai` with `gemini-3.7-flash` model.
* **Input**: Raw text or uploaded resume file (PDF / DOCX).
* **Extraction Schema**:
  - Technical & soft skills matrix (normalized array of strings)
  - Work history (role, company, start/end dates, bullet points)
  - Education (degree, field of study, institution, graduation year)
  - Quantifiable metrics & achievements
  - Initial ATS Readiness audit (0–100 score + key strengths & improvement suggestions)

### 2. Multi-Factor ATS Compatibility Matrix
* **File**: `backend/src/ai/atsAnalyzer/atsAnalyzerService.ts`
* **Formula**:
$$\text{Overall ATS Score} = (0.35 \times S) + (0.25 \times K) + (0.20 \times E) + (0.10 \times D) + (0.10 \times T)$$
* **Weights**:
  - $S$ (Skills Match, 35%): Direct Jaccard & substring overlap between candidate skills and role required skills.
  - $K$ (Keyword Density, 25%): Exact match of high-value technical keywords in job description vs. resume experience bullets.
  - $E$ (Experience Alignment, 20%): Candidate years of experience compared to the job's minimum requirement.
  - $D$ (Education Alignment, 10%): Degree level verification (Bachelor's / Master's / Equivalent).
  - $T$ (Title / Domain Relevance, 10%): Cosine/Levenshtein similarity between candidate preferred title and target job title.

### 3. Behavioral Recommendation Loop
* **File**: `backend/src/ai/recommendationEngine/recommendationEngineService.ts`
* **Mechanism**:
  - Each `RIGHT` swipe increases the candidate's affinity weights for the job's skills, industry, and work type.
  - Each `LEFT` swipe introduces a slight penalty to avoid serving repetitive unappealing roles.
  - Generates ranked recommendations with individualized match percentages.

---

## 🛠️ Installation & Getting Started

### Prerequisites
- **Node.js** >= 18.0.0 (Node 20 or 22 recommended)
- **npm** >= 9.0.0

### Quick Setup

1. **Clone and Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   NODE_ENV=development
   ```
   *Note: Swipe X includes high-precision fallback heuristic parsers and scorers, allowing full offline testing even without an API key.*

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **1-Click Demo Login**:
   Click **"Launch Live Swipe Hub (Demo)"** on the landing page to load the complete demo candidate profile (*Alex Morgan*) with 1,048 pre-loaded jobs!

---

## 🧪 Available Scripts & Testing

| Command | Description |
| :--- | :--- |
| `npm run dev` | Boots the full-stack server using `tsx` with integrated Vite middleware on port 3000. |
| `npm run build` | Bundles the frontend with Vite into `dist/` and compiles `server.ts` into a self-contained CJS bundle `dist/server.cjs` with `esbuild`. |
| `npm start` | Runs the production-compiled server `node dist/server.cjs`. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) to verify zero syntax/type errors. |
| `npm test` | Executes the complete end-to-end backend integration & AI workflow test suite. |

---

## 📡 REST API Endpoint Summary

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new candidate account | No |
| `POST` | `/api/auth/login` | Login with email & password | No |
| `POST` | `/api/auth/demo-login` | Instant demo login (Alex Morgan) | No |
| `GET` | `/api/auth/me` | Retrieve current authenticated user | Yes |
| `GET` | `/api/candidates/dashboard` | Candidate dashboard metrics & summary | Yes |
| `GET` | `/api/profile` | Retrieve candidate profile & preferences | Yes |
| `PUT` | `/api/profile` | Update profile information & skills | Yes |
| `POST` | `/api/resumes/upload` | Upload and parse resume file (PDF/DOCX) | Yes |
| `POST` | `/api/resumes/demo-load` | Load pre-parsed demo candidate resume | Yes |
| `GET` | `/api/resumes/active` | Get candidate's active parsed resume | Yes |
| `GET` | `/api/jobs` | Search & filter jobs (with optional pagination) | Optional |
| `GET` | `/api/jobs/:id` | Get job details by ID | Optional |
| `GET` | `/api/recommendations` | Get personalized AI job recommendations | Yes |
| `POST` | `/api/swipes` | Record a swipe decision (`LEFT`, `RIGHT`, `SAVE`) | Yes |
| `GET` | `/api/swipes/history` | Get candidate's swipe decision history | Yes |
| `POST` | `/api/ats/analyze` | Run deep ATS compatibility audit on target job | Yes |
| `GET` | `/api/ats/reports` | Get past ATS audit reports | Yes |
| `POST` | `/api/applications` | Submit 1-click candidate application | Yes |
| `GET` | `/api/applications` | Get candidate's submitted applications | Yes |
| `PATCH`| `/api/applications/:id/status`| Update application status | Yes |
| `GET` | `/api/saved-jobs` | Get candidate's bookmarked roles | Yes |

*See [`/docs/api/API_SPECIFICATION.md`](docs/api/API_SPECIFICATION.md) for full request/response schemas.*

---

## 🎨 Frontend Design System & Aesthetics

Swipe X features a tailored **Natural Tones** visual design:

* **Earthy Neutrals**:
  - Background Canvas: Warm Linen (`#F2F0E9`) / Dark Moss (`#1C231C`)
  - Elevated Cards: Pure White (`#FFFFFF`) / Card Dark (`#252C25`)
  - Border Accents: Soft Sandstone (`#DCD7C9`) / Border Dark (`#2E362E`)
  - Primary Text: Deep Charcoal (`#2D2926`) / Light Cream (`#F2F0E9`)
  - Secondary Text: Warm Gray (`#8C867A`)
* **Semantic Accents**:
  - Primary Action / Positive: Sage Moss Green (`#5B6D5B`)
  - Score Metrics / Highlights: Warm Ochre Gold (`#C29352`)
  - Danger / Rejection: Terracotta Rose (`#B86B64`)
* **Typography**:
  - Headers & Display: Elegant Serif font family
  - Body & UI Controls: Clean, legible sans-serif with strict 1.5+ line-height

---

## 📚 Documentation Library

Explore the comprehensive documentation in the [`/docs`](docs/) directory:

1. [**System Architecture (`/docs/ARCHITECTURE.md`)**](docs/ARCHITECTURE.md) — Comprehensive technical architecture, runtime model, state synchronization, and data lifecycle.
2. [**Backend Code Documentation (`/docs/backend/README.md`)**](docs/backend/README.md) — File-by-file breakdown of all controllers, routes, models, services, and database persistence.
3. [**AI & ATS Engines (`/docs/ai/README.md`)**](docs/ai/README.md) — Mathematical formulas, Gemini prompts, vector matching, and behavioral learning algorithms.
4. [**Frontend Components & Views (`/docs/frontend/README.md`)**](docs/frontend/README.md) — Documentation for every React view, component, hook, and layout pattern.
5. [**REST API Specification (`/docs/api/API_SPECIFICATION.md`)**](docs/api/API_SPECIFICATION.md) — Exhaustive API reference with input payloads, output responses, and error codes.
6. [**Database Schema (`/docs/database/DATABASE_SCHEMA.md`)**](docs/database/DATABASE_SCHEMA.md) — Data entity relationships, storage contracts, and indexing strategy.
7. [**Workflows & Journeys (`/docs/workflows/WORKFLOWS.md`)**](docs/workflows/WORKFLOWS.md) — Step-by-step workflow diagrams for onboarding, resume parsing, ATS auditing, and application submission.

---

## 📄 License & Attribution

Swipe X is built with Google AI Studio and powered by Gemini 3.7. All rights reserved.
