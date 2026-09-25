# Swipe X — AI-Powered Centralized Job Opportunities Platform

[![Login Portal](https://img.shields.io/badge/Login%20Portal-swipe--x.ai.studio%2Flogin-10B981?style=for-the-badge&logo=auth0&logoColor=white)](https://swipe-x.ai.studio/login)
[![Published App](https://img.shields.io/badge/Live%20App-Published%20Preview-6366F1?style=for-the-badge&logo=google-chrome&logoColor=white)](https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app)
[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-3.7%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

> **Modern job matching meets transparent ATS compatibility audits.** Upload your resume, receive instant AI candidate analysis, swipe through 1,000+ verified roles, simulate live technical interviews with STAR feedback, and track your applications in real time.

---

## 🌐 Live Application Links

| Environment / Service | URL | Status |
| :--- | :--- | :--- |
| **🔑 Direct Login Portal** | [**https://swipe-x.ai.studio/login**](https://swipe-x.ai.studio/login) | **Direct Authentication & Access** |
| **🚀 Published App (Live Preview)** | [**https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app**](https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app) | **Live & Operational** |
| **🛠️ Development App** | [**https://ais-dev-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app**](https://ais-dev-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app) | **Active Development** |

---

## 🔒 Backend Security & Zero Secrets Exposure Guarantee

Swipe X is built with strict enterprise security boundaries to guarantee that sensitive credentials and internal infrastructure details are **never** exposed to client-side bundles, browser network payloads, or public logs:

1. **Server-Side Secret Isolation**:
   - `GEMINI_API_KEY`, `JWT_SECRET`, and `MONGODB_URI` are exclusively accessed on the Node.js Express server (`server.ts`, `backend/src/config/env.ts`).
   - No API keys are prefixed with `VITE_` or bundled into client JavaScript.
2. **Zero Client-Side Leaks**:
   - The React client communicates with the backend exclusively via clean `/api/*` REST endpoints using short-lived Bearer tokens.
   - Passwords and password hashes are strictly filtered out of user serialization objects before returning JSON responses.
   - Database connection strings and credentials are never returned in health checks or telemetry responses; health checks only report anonymized boolean statuses.
3. **Graceful Fallback / Zero-Secret Operation**:
   - If external API keys (e.g., `GEMINI_API_KEY`) or database URIs are omitted, Swipe X seamlessly activates its internal algorithmic fallbacks (TF-IDF keyword matching, heuristic ATS matrix scoring, and local JSON persistence) without throwing runtime errors or disrupting the user experience.

---

## 📖 Table of Contents

1. [Live Application Links](#-live-application-links)
2. [Backend Security & Zero Secrets Exposure Guarantee](#-backend-security--zero-secrets-exposure-guarantee)
3. [Product Overview & Value Proposition](#-product-overview--value-proposition)
4. [Complete Feature Showcase](#-complete-feature-showcase)
   - [1. Centralized Verified Job Opportunities](#1-centralized-verified-job-opportunities)
   - [2. Interactive Swipe Discovery Deck](#2-interactive-swipe-discovery-deck)
   - [3. Pre-Flight ATS Compatibility Audit Engine](#3-pre-flight-ats-compatibility-audit-engine)
   - [4. Live AI Mock Interview Simulator (STAR Method)](#4-live-ai-mock-interview-simulator-star-method)
   - [5. Candidate Analytics & Applications Pipeline](#5-candidate-analytics--applications-pipeline)
   - [6. Recruiter & Hiring Manager Hub](#6-recruiter--hiring-manager-hub)
   - [7. Platform Command Center & Telemetry](#7-platform-command-center--telemetry)
   - [8. 1-Click Instant Demo Experience](#8-1-click-instant-demo-experience)
5. [End-to-End System Architecture](#-end-to-end-system-architecture)
6. [Technology Stack](#-technology-stack)
7. [Mathematical Algorithms & AI Engines](#-mathematical-algorithms--ai-engines)
   - [Multi-Factor ATS Compatibility Matrix](#multi-factor-ats-compatibility-matrix)
   - [Behavioral Preference Learning Loop](#behavioral-preference-learning-loop)
   - [STAR Interview Scoring Model](#star-interview-scoring-model)
8. [Installation & Getting Started (Step-by-Step)](#-installation--getting-started-step-by-step)
9. [Available Scripts & Verification](#-available-scripts--verification)
10. [REST API Endpoint Directory](#-rest-api-endpoint-directory)
11. [Project Directory Layout](#-project-directory-layout)
12. [License & Attribution](#-license--attribution)

---

## 🌟 Product Overview & Value Proposition

Traditional job hunting is broken: job seekers submit hundreds of resumes into opaque Applicant Tracking Systems (ATS) where up to **75% of submissions are silently rejected** by automated keyword filters before human recruiters ever see them.

**Swipe X** transforms this workflow into an interactive, transparent, and intelligent experience:
* **Centralized Verified Listings**: Explore over 1,000 production-ingested tech opportunities from industry leaders (Google, Stripe, Microsoft, OpenAI) and high-growth startups with zero ghost postings.
* **Pre-Flight ATS Audits**: Review exact 0–100% compatibility scores, keyword gaps, and bullet recommendations *before* submitting.
* **Tinder-Style Discovery**: Swipe right to save or apply, swipe left to pass, or bookmark for later. Future job recommendations dynamically adapt based on behavioral affinity.
* **Interview Readiness**: Simulate realistic technical and behavioral interviews with instant AI feedback scored across Clarity, Technical Depth, and STAR Impact.

---

## 🚀 Complete Feature Showcase

### 1. Centralized Verified Job Opportunities
* **Comprehensive Ingestion**: Over 1,048 real tech jobs ingested across engineering, AI/ML, product, data, and devops.
* **Early Applicant Indicators**: Real-time tags highlighting postings added in the last 24 hours with low competition.
* **Multi-Facet Search & Filtering**: Instant search by keyword, title, company, work type (`Remote`, `Hybrid`, `On-site`), employment type (`Full-time`, `Contract`), and salary tier.
* **Deep Role Inspection**: Dedicated job detail views with verified source URL preservation, extracted requirements, and company tier metrics.

### 2. Interactive Swipe Discovery Deck
* **Fluid Physics & Gestures**: Smooth draggable card interactions powered by `motion/react`.
* **Keyboard-Accessible Navigation**:
  - `←` Left Arrow: Pass role
  - `→` Right Arrow: Match & instant apply modal
  - `↑` Up Arrow: Bookmark / Save role
  - `Z` Key / Undo Button: Revert last swipe action
* **Live Match Percentage**: Real-time compatibility score computed on the fly against candidate resume skills.
* **Subtle Stack Depth**: 3D layered background cards showing upcoming deck opportunities.

### 3. Pre-Flight ATS Compatibility Audit Engine
* **0–100% Multi-Factor Score**: Transparent weighted score gauge with color-coded feedback (Exceptional, High, Moderate, Needs Alignment).
* **Keyword Gap Scanner**: Visual pill chips showing exact matches (green) and missing job keywords (amber/red).
* **Experience & Education Alignment**: Automated years-of-experience cross-check and degree verification.
* **Targeted Recommendations**: Tailored, actionable bullet point enhancements to maximize candidate callback rates.

### 4. Live AI Mock Interview Simulator (STAR Method)
* **Tailored Question Sets**: Dynamically generated technical and behavioral questions specific to the target role.
* **Dual Input Modes**: Speech-to-text voice dictation (via Web Speech API) and structured rich-text entry.
* **Real-Time Timer**: Visual session clock to help candidates pace responses under interview conditions.
* **Multi-Dimensional AI Evaluation**:
  - **Clarity Score (0–100)**: Articulation and structure.
  - **Technical Depth (0–100)**: Accuracy and depth of technical concepts.
  - **STAR Impact (0–100)**: Situation, Task, Action, and Result framing.
  - **Actionable Takeaways**: Concrete tips for immediate improvement.

### 5. Candidate Analytics & Applications Pipeline
* **Telemetry Dashboard**: High-level visual metrics tracking total swipes, match rates, active applications, ATS health scores, and saved roles.
* **Applications Kanban / List**: Status workflow tracking (`Applied`, `Reviewing`, `Interviewing`, `Offered`, `Rejected`) with timestamped audit logs.
* **Resume & Profile Hub**: Skill matrix management, career preferences, target salary settings, and resume upload.

### 6. Recruiter & Hiring Manager Hub
* **Talent Pipeline Management**: Screen applicants across open roles with ATS match filtering.
* **Candidate Review**: View detailed candidate skills, ATS score breakdown, applied date, and application notes.
* **Status Updates**: Advance candidates through hiring stages with one click.
* **Direct Job Publishing**: Create and publish verified job postings directly to the candidate swipe deck.

### 7. Platform Command Center & Telemetry
* **System Health Dashboard**: Real-time monitoring of AI scoring latency, database status, and uptime.
* **User Management**: Role inspection across candidates, recruiters, and administrators.
* **Security & Activity Stream**: Live audit log of swipe actions, ATS audits, job publications, and applications.

### 8. User Authentication & Onboarding
* **Secure Candidate & Recruiter Registration**: Register with email and password with instant profile initialization.
* **Streamlined Onboarding**: Discover tailored opportunities, run ATS resume scans, and track application workflows in real-time.

---

## 🏛️ End-to-End System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT BROWSER (Vite + React 19)                        │
│  ┌───────────────────────┬──────────────────────┬────────────────────────────────────┐ │
│  │   SwipePage (Deck)    │ ATSAnalysisPage      │ MockInterviewPage (STAR AI)        │ │
│  ├───────────────────────┼──────────────────────┼────────────────────────────────────┤ │
│  │   DashboardPage       │ RecruiterHubPage     │ AdminCommandCenter                 │ │
│  └───────────┬───────────┴──────────┬───────────┴─────────────────┬──────────────────┘ │
│              │                      │                             │                    │
│              ▼                      ▼                             ▼                    │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                  AuthContext • ThemeContext • Typed API Client Layer             │  │
│  └──────────────────────────────────────────┬───────────────────────────────────────┘  │
└─────────────────────────────────────────────┼──────────────────────────────────────────┘
                                              │ HTTP/JSON API (Bearer JWT Authorization)
┌─────────────────────────────────────────────┼──────────────────────────────────────────┐
│                                             ▼                                          │
│                             EXPRESS FULL-STACK SERVER (server.ts)                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ CORS • Body Parser (15MB) • JWT Verification Middleware • Request Error Handlers │  │
│  └──────────────────────────────────────────┬───────────────────────────────────────┘  │
│                                             │                                          │
│         ┌───────────────────┬───────────────┴───────────────┬───────────────────┐      │
│         ▼                   ▼                               ▼                   ▼      │
│  ┌──────────────┐    ┌──────────────┐             ┌───────────────────┐  ┌───────────┐ │
│  │ Auth & User  │    │ Job Service  │             │   AI Subsystem    │  │App Pipeline││
│  │ Controllers  │    │ & Importer   │             │ (Gemini 3.7 + ATS)│  │Controller │ │
│  └──────┬───────┘    └──────┬───────┘             └─────────┬─────────┘  └─────┬─────┘ │
│         │                   │                               │                  │       │
│         ▼                   ▼                               ▼                  ▼       │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │      Database Abstraction Layer (db.ts) with Dual MongoDB Atlas & JSON Store     │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19 (`react`, `react-dom`) with TypeScript
- **Build Tool**: Vite 6
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS v4 with custom responsive design tokens (up to 1720px widescreen support)
- **Gestures & Motion**: `motion` (`motion/react`)
- **Icons**: Lucide React (`lucide-react`)
- **Visuals & Effects**: Canvas Confetti (`canvas-confetti`)

### Backend
- **Runtime**: Node.js v20+ with TypeScript execution via `tsx`
- **HTTP Server**: Express.js v4
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) with BCrypt password hashing (`bcryptjs`)
- **File Ingestion**: Multer (`multer`) with memory buffers
- **Production Bundler**: ESBuild for bundled CommonJS output (`dist/server.cjs`)
- **Persistence**: Dual-layer architecture: MongoDB Atlas integration with automatic fallback to atomic local JSON storage (`/data/db_store.json`)

### AI & Intelligent Services
- **SDK**: `@google/genai` v2.4.0
- **Model**: `gemini-3.7-flash` (server-side only)
- **Heuristic Engine**: Integrated TF-IDF keyword extraction and deterministic ATS matrix scoring

---

## 🧠 Mathematical Algorithms & AI Engines

### Multi-Factor ATS Compatibility Matrix
The ATS compatibility score between a candidate's resume and a target job is computed using a 5-dimension weighted matrix:

$$\text{Overall ATS Score} = (0.35 \times S) + (0.25 \times K) + (0.20 \times E) + (0.10 \times D) + (0.10 \times T)$$

* **$S$ (Skills Match, 35%)**: Direct Jaccard and substring overlap between the candidate's verified skill stack and role requirements.
* **$K$ (Keyword Density, 25%)**: Exact occurrence of critical domain and technical terms within experience descriptions.
* **$E$ (Experience Alignment, 20%)**: Normalized candidate years of experience against the role's baseline requirement.
* **$D$ (Education Alignment, 10%)**: Degree level evaluation (Bachelor's, Master's, PhD, or equivalent experience).
* **$T$ (Title / Domain Relevance, 10%)**: Levenshtein / Cosine similarity between target title and candidate history.

### Behavioral Preference Learning Loop
Candidate preference weights are dynamically updated with every swipe action:
* **Right Swipe (+ Affinity)**: Increases affinity weights for the job's extracted skills, industry sector, and work type (`Remote`/`Hybrid`).
* **Left Swipe (- Penalty)**: Applies a subtle negative weight to prevent repetitive unappealing postings.
* **Dynamic Re-ranking**: Subsequent recommendation batches prioritize opportunities matching elevated affinity dimensions.

### STAR Interview Scoring Model
The Mock Interview Simulator evaluates answers according to the STAR methodology:
* **Situation & Task**: Context setting, problem definition, and initial constraints.
* **Action**: Specific technical interventions, architectural choices, and personal leadership.
* **Result**: Quantifiable outcomes, performance improvements, and lessons learned.

---

## 🛠️ Installation & Getting Started (Step-by-Step)

Follow these simple steps to run Swipe X locally on your machine:

### 1. Prerequisites
Ensure you have the following installed on your workstation:
- **Node.js**: Version `18.0.0` or higher (`20.x` or `22.x` recommended)
- **npm**: Version `9.0.0` or higher (bundled with Node.js)
- **Git**: For cloning the repository

Verify your local versions:
```bash
node -v
npm -v
```

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/swipe-x.git
cd swipe-x
```

### 3. Install Project Dependencies
Install all required frontend and backend packages:
```bash
npm install
```

### 4. Configure Environment Variables
Create your local `.env` configuration file from the template:
```bash
cp .env.example .env
```

Open `.env` in your code editor and review the parameters:
```env
# Google Gemini API Key (Required for live Gemini LLM parsing & STAR evaluations)
# If left empty, Swipe X automatically runs its high-precision heuristic algorithms
GEMINI_API_KEY=

# MongoDB Atlas Connection URI (Optional)
# If left empty, Swipe X stores data locally in /data/db_store.json
MONGODB_URI=

# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_custom_jwt_secret_here
```

> **Security Note**: Never commit your `.env` file to version control. The `.gitignore` file is pre-configured to ignore `.env*` files.

### 5. Launch the Development Server
Start the unified full-stack server (Vite frontend + Express backend):
```bash
npm run dev
```

Once booted, open your browser and navigate to:
```
http://localhost:3000
```

### 6. Explore Opportunities & Apply
Register an account or sign in with your credentials to explore 1,000+ verified tech roles, swipe on matching positions, evaluate your resume with the ATS scanner, and submit verified applications.

---

## 🧪 Available Scripts & Verification

| Command | Purpose | Output |
| :--- | :--- | :--- |
| `npm run dev` | Boots full-stack server using `tsx` on port 3000 with Vite middleware | Hot-reloaded development environment |
| `npm run build` | Compiles Vite client into `dist/` and bundles `server.ts` into `dist/server.cjs` via `esbuild` | Production-ready standalone build |
| `npm start` | Executes compiled production server `node dist/server.cjs` | Standalone production runtime |
| `npm run lint` | Runs TypeScript compiler type-checking (`tsc --noEmit`) | Verifies zero syntax or type errors |
| `npm test` | Executes end-to-end integration and algorithmic test suites | Automated test pass verification |

---

## 📡 REST API Endpoint Directory

All endpoints are served under `/api` and return standardized JSON responses.

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/register` | Register a new candidate or recruiter account | No |
| `POST` | `/api/auth/login` | Authenticate with email and password | No |
| `POST` | `/api/auth/demo-login` | Instant 1-click authentication with demo profile | No |
| `GET` | `/api/auth/me` | Retrieve authenticated user profile and session data | Yes |

### Jobs & Discovery (`/api/jobs`, `/api/recommendations`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/jobs` | Search, filter, and paginate job listings | Optional |
| `GET` | `/api/jobs/:id` | Retrieve detailed job information and requirements | Optional |
| `GET` | `/api/recommendations` | Get personalized, ranked recommendations based on candidate profile | Yes |

### Swipes & Saved Roles (`/api/swipes`, `/api/saved-jobs`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/swipes` | Record a swipe decision (`LEFT`, `RIGHT`, `SAVE`) | Yes |
| `GET` | `/api/swipes/history` | Retrieve candidate swipe history and telemetry | Yes |
| `GET` | `/api/saved-jobs` | Retrieve candidate's bookmarked roles | Yes |
| `DELETE` | `/api/saved-jobs/:id` | Remove a role from saved bookmarks | Yes |

### ATS Audits & Resumes (`/api/ats`, `/api/resumes`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ats/analyze` | Run multi-factor ATS compatibility audit against target job | Yes |
| `GET` | `/api/ats/reports` | Retrieve historical ATS analysis reports | Yes |
| `POST` | `/api/resumes/upload` | Upload resume (PDF/DOCX) for AI parsing | Yes |
| `POST` | `/api/resumes/demo-load` | Load pre-parsed demo candidate resume | Yes |
| `GET` | `/api/resumes/active` | Get candidate's active parsed resume and skill stack | Yes |

### Applications & Recruiter Hub (`/api/applications`, `/api/recruiter`, `/api/admin`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/applications` | Submit application with resume and ATS audit score | Yes |
| `GET` | `/api/applications` | List candidate's submitted applications | Yes |
| `GET` | `/api/recruiter/pipeline` | Recruiter view of applicants across active postings | Yes (Recruiter) |
| `POST` | `/api/recruiter/jobs` | Publish a new verified job posting | Yes (Recruiter) |
| `GET` | `/api/admin/stats` | Platform-wide analytics, user count, and telemetry | Yes (Admin) |
| `GET` | `/api/admin/system` | Engine health check, latency benchmarks, and uptime | Yes (Admin) |

---

## 📁 Project Directory Layout

```
.
├── backend/                        # Express backend architecture
│   ├── src/
│   │   ├── ai/                     # Gemini AI SDK & ATS scoring algorithms
│   │   │   ├── atsAnalyzer/        # Multi-factor ATS compatibility matrix
│   │   │   ├── geminiClient.ts     # Google GenAI SDK wrapper (server-side only)
│   │   │   ├── jobMatcher/         # Vector / keyword matching engine
│   │   │   ├── recommendationEngine/ # Behavioral affinity learning pipeline
│   │   │   └── resumeParser/       # Resume extraction & normalization
│   │   ├── config/                 # Environment variables & server settings
│   │   ├── controllers/            # REST API route handlers
│   │   ├── database/               # Database manager (MongoDB Atlas + JSON fallback)
│   │   ├── middleware/             # JWT auth & error handling middleware
│   │   ├── models/                 # Mongoose schemas & TypeScript models
│   │   ├── repositories/           # Data access layer
│   │   ├── routes/                 # Express route definitions
│   │   ├── services/               # CSV job data importer & enrichment
│   │   └── utils/                  # Cryptographic hashing & JWT utilities
│   └── tests/                      # Automated test suite
│
├── data/                           # Verified dataset storage
│   ├── clean_jobs.csv              # 1,048 verified tech job opportunities
│   └── db_store.json               # Auto-persisted local JSON store
│
├── docs/                           # Exhaustive technical documentation
│   ├── ai/                         # Scoring formulas, Gemini prompts, vector math
│   ├── api/                        # Complete REST API payload specifications
│   ├── backend/                    # Backend architecture & database contracts
│   ├── frontend/                   # React components, views, styling guidelines
│   ├── workflows/                  # Sequence diagrams & user journey maps
│   └── ARCHITECTURE.md             # High-level system design document
│
├── src/                            # Frontend source code (React 19 + TypeScript)
│   ├── api/                        # Typed client-side REST API service
│   ├── components/                 # Reusable UI widgets (JobCard, ATSGauge, Modals)
│   ├── context/                    # AuthContext and ThemeContext providers
│   ├── pages/                      # Page views (Swipe, Dashboard, ATS, Interview, etc.)
│   ├── index.css                   # Global Tailwind CSS theme definitions
│   ├── main.tsx                    # Client entry point
│   ├── App.tsx                     # Top-level routing & layout shell
│   └── types.ts                    # Shared TypeScript declarations
│
├── .env.example                    # Environment variable template (no secrets)
├── metadata.json                   # AI Studio applet metadata & permissions
├── package.json                    # Project scripts & npm dependencies
├── server.ts                       # Full-stack server entry point (Express + Vite)
├── tsconfig.json                   # TypeScript compiler configuration
└── vite.config.ts                  # Vite build & Tailwind configuration
```

---

## 📄 License & Attribution

Swipe X is built with Google AI Studio and powered by Gemini 3.7.  
* **Login Portal**: [https://swipe-x.ai.studio/login](https://swipe-x.ai.studio/login)  
* **Live App**: [https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app](https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app)
