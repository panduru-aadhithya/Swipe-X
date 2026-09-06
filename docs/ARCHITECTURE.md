# Swipe X — System Architecture Deep Dive

## 1. Architectural Overview

Swipe X is architected as a modern, full-stack, single-binary hybrid web application combining an **Express.js (Node.js)** backend service with a **React 19 (Vite)** single-page frontend. In production, the entire application compiles to a self-contained runtime served behind a reverse proxy on port 3000.

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT APPLICATION                                 │
│  React 19 SPA (Vite) + Tailwind CSS v4 + React Router v7 + Motion Physics Cards   │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │ HTTP REST (JSON / Multipart)
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                   BACKEND API                                     │
│  Express.js Server (server.ts)                                                    │
│  ├── Middleware: CORS, JSON parser (15MB), JWT Auth, Global Error Handler         │
│  ├── Routes: /api/auth, /api/resumes, /api/ats, /api/jobs, /api/swipes, etc.      │
│  ├── AI Layer: Google GenAI SDK (@google/genai) + Heuristic Fallback Engines      │
│  └── Repositories: User, Candidate, Resume, Job, ATS, Swipe, Application          │
└────────────────────────────────────────┬──────────────────────────────────────────┘
                                         │ Atomic Disk & In-Memory Sync
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                                PERSISTENCE LAYER                                  │
│  File-Backed Database (/data/db_store.json) + Auto-Ingestion (/data/clean_jobs.csv)│
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layer-by-Layer Breakdown

### 2.1 Presentation Layer (Frontend)
- **Framework**: React 19 utilizing functional components with hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `useContext`).
- **Routing**: Client-side declarative routing with React Router DOM v7. Includes public routes (`LandingPage`, `LoginPage`, `RegisterPage`), authenticated candidate dashboard routes, and route protection guards.
- **State Management**:
  - `AuthContext`: Manages active user authentication tokens, current candidate profile, login/logout, and demo session switches with `localStorage` persistence.
  - `ThemeContext`: Handles light/dark/system appearance with `document.documentElement` class synchronization.
- **Gesture Engine**: `motion` (`motion/react`) handles physics-driven swipe drag gestures (`drag="x"`, `dragConstraints`, dynamic rotation based on `xOffset`, opacity velocity triggers).

### 2.2 Server & Routing Layer (Backend)
- **Entry Point (`server.ts`)**:
  - Mounts the Express application instance (`backend/src/app.ts`).
  - In development mode (`NODE_ENV !== 'production'`), integrates Vite as a middleware via `createViteServer({ server: { middlewareMode: true }, appType: 'spa' })`.
  - In production mode, serves compiled static assets from `/dist` and serves `/dist/index.html` for all non-API SPA routes.
  - Listens on `0.0.0.0:3000`.
- **API Router Structure (`backend/src/routes/index.ts`)**:
  - Modular routers mounted under `/api/*`.
  - Multer configuration with in-memory buffering for 10MB document uploads.
  - JWT Authentication middleware enforcing user authorization headers (`Authorization: Bearer <token>`).

### 2.3 AI & Intelligence Subsystem
- **Gemini Client (`backend/src/ai/geminiClient.ts`)**:
  - Uses `@google/genai` with `GoogleGenAI` class and `gemini-3.7-flash` model.
  - Configures JSON schema validation for structured extraction.
- **Resume Extraction Engine (`backend/src/ai/resumeParser/resumeParserService.ts`)**:
  - Parses uploaded text/PDF buffers.
  - Extracts technical skills, experience timeline, education, metrics, strengths, and areas for improvement.
- **Multi-Factor ATS Compatibility Engine (`backend/src/ai/atsAnalyzer/atsAnalyzerService.ts`)**:
  - Compares candidate resume data against targeted job requirements across 5 weighted dimensions.
  - Generates actionable feedback, missing keyword lists, and matching highlights.
- **Recommendation & Behavioral Engine (`backend/src/ai/recommendationEngine/recommendationEngineService.ts`)**:
  - Computes candidate-to-job match scores using multi-attribute cosine and weighted scoring.
  - Adjusts scores dynamically based on candidate swipe history.

### 2.4 Data & Persistence Layer
- **In-Memory Cache & JSON Store (`backend/src/database/db.ts`)**:
  - Maintains fast in-memory array collections (`users`, `candidates`, `resumes`, `resumeData`, `jobs`, `atsReports`, `swipes`, `savedJobs`, `applications`).
  - Debounced atomic disk synchronization saves to `/data/db_store.json`.
- **Dataset Ingestion Service (`backend/src/services/dataImporter.ts`)**:
  - On startup, if `db.jobs` is empty, auto-ingests and normalizes 1,048 verified job records from `/data/clean_jobs.csv`.
  - Extracts salary ranges, tech skills, location, work types (Remote/Hybrid/Onsite), and clean descriptions.

---

## 3. Data Flow Pipelines

### 3.1 Candidate Registration & Onboarding Flow
1. User registers or clicks **Demo Login**.
2. Password is encrypted using `bcryptjs`.
3. Candidate profile is created with baseline technical skills and preferences.
4. JWT token is signed and returned, stored in client `localStorage`.

### 3.2 Resume Ingestion & AI Parsing Flow
1. User uploads resume file (or triggers demo resume load).
2. Multer buffers the payload in memory.
3. Server invokes `resumeParserService`:
   - If `GEMINI_API_KEY` is present: sends structured extraction prompt to `gemini-3.7-flash`.
   - If in offline/fallback mode: regex & NLP heuristic parser extracts technical tokens and timeline.
4. Parsed JSON is saved in `db.resumeData` and linked to candidate profile.
5. Candidate skills are auto-updated with extracted technologies.

### 3.3 Smart Swipe & Behavioral Feedback Loop
1. Client requests `/api/recommendations`.
2. Recommendation engine filters out previously swiped/applied jobs.
3. Calculates composite match score for remaining jobs:
   - Base skill overlap: 40%
   - Title / Role semantic match: 25%
   - Work mode preference: 15%
   - Salary alignment: 10%
   - Behavioral affinity adjustments (from previous right/left swipes): 10%
4. Candidate swipes right (`APPLY` / `MATCH`) or left (`PASS`).
5. Swipe decision is recorded; candidate preference weights are updated.

### 3.4 ATS Audit & 1-Click Application Flow
1. Candidate views a job or clicks **"Apply with ATS Scan"**.
2. `atsAnalyzerService` executes a multi-factor comparison between active resume and job spec.
3. Returns granular ATS report (0–100 score, missing keywords, strengths, formatting recommendations).
4. Candidate submits application with 1 click.
5. Application record is created in `db.applications` with status `APPLIED`, linked ATS report ID, and timestamped audit history.
