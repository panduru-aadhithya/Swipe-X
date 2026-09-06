# Backend Architecture & Code Documentation

This document provides a file-by-file technical reference for the Swipe X backend subsystem.

---

## 📁 Backend Directory Layout

```
backend/
├── src/
│   ├── ai/                          # AI Subsystems & Engine services
│   │   ├── atsAnalyzer/             # ATS scoring service
│   │   ├── geminiClient.ts          # Google GenAI SDK Client
│   │   ├── jobMatcher/              # Vector / cosine matching algorithms
│   │   ├── recommendationEngine/    # Behavioral recommendation loop
│   │   └── resumeParser/            # Resume extraction & parsing service
│   ├── config/
│   │   └── env.ts                   # Environment variable loader & constants
│   ├── controllers/
│   │   ├── atsController.ts         # Handles /api/ats endpoints
│   │   ├── authController.ts        # Handles authentication & demo login
│   │   ├── candidateController.ts   # Handles profile & dashboard summaries
│   │   ├── jobController.ts         # Handles job search & recommendations
│   │   ├── resumeController.ts      # Handles resume uploads & parsing
│   │   └── swipeController.ts       # Handles swipes, bookmarks & applications
│   ├── database/
│   │   └── db.ts                    # In-memory database with JSON disk persistence
│   ├── middleware/
│   │   ├── authMiddleware.ts        # JWT token verification & route protection
│   │   └── errorMiddleware.ts       # Global HTTP error handler
│   ├── repositories/
│   │   ├── jobRepository.ts         # Data access for jobs, ATS, swipes, applications
│   │   ├── resumeRepository.ts      # Data access for resumes and parsed data
│   │   └── userRepository.ts        # Data access for users and candidate profiles
│   ├── routes/
│   │   └── index.ts                 # Express router declarations & multer config
│   ├── services/
│   │   └── dataImporter.ts          # CSV dataset ingestion (1,048 jobs)
│   ├── types/
│   │   └── index.ts                 # Backend TypeScript interfaces & types
│   ├── utils/
│   │   └── auth.ts                  # Password hashing & JWT signing helpers
│   └── app.ts                       # Express application configuration & setup
└── tests/
    └── testCandidateWorkflow.ts     # Automated end-to-end integration test suite
```

---

## 🛠️ File-by-File Documentation

### 1. `server.ts`
* **Purpose**: Primary server entry point integrating the Express backend with Vite frontend.
* **Key Functions**:
  - `startServer()`: Initializes Express on `0.0.0.0:3000`.
  - Development Mode: Uses `createViteServer` with `middlewareMode: true` to handle hot reloading and asset serving without a separate frontend process.
  - Production Mode: Serves static compiled files from `dist/` with SPA fallback for client-side routing.

### 2. `backend/src/app.ts`
* **Purpose**: Configures Express middlewares, route mounting, and automatic dataset seeding.
* **Middlewares**:
  - `cors()`: Cross-Origin Resource Sharing enablement.
  - `express.json({ limit: '15mb' })`: Handles large JSON payloads (such as raw resume text).
  - `express.urlencoded({ extended: true, limit: '15mb' })`.
* **Dataset Initialization**: Checks if `db.jobs` is empty; if so, triggers `importJobsFromCSV()` to seed 1,048 verified tech jobs from `/data/clean_jobs.csv`.
* **Health Check**: `GET /api/health` returns server health and total jobs loaded.

### 3. `backend/src/config/env.ts`
* **Purpose**: Centralized environment configuration with safe fallbacks.
* **Exports**:
  - `config.port`: Server port (default: `3000`).
  - `config.nodeEnv`: Application mode (`development` or `production`).
  - `config.jwtSecret`: Secret key for JWT signing and verification.
  - `config.geminiApiKey`: API key for Google Gemini models.
  - `config.aiMode`: `'gemini'` when key is provided, `'mock'`/heuristic fallback otherwise.
  - `config.uploadLimitMb`: Maximum resume upload size (default: 10MB).

### 4. `backend/src/database/db.ts`
* **Purpose**: In-memory database with debounced, atomic JSON file synchronization.
* **Data Collections**:
  - `users`: User authentication accounts with hashed passwords.
  - `candidates`: Candidate profiles containing skills, preferences, and completion metrics.
  - `resumes`: Metadata for uploaded resume files.
  - `resumeData`: Structured parsed resume entities.
  - `jobs`: Verified job postings with extracted requirements and salary data.
  - `atsReports`: Generated ATS compatibility audit records.
  - `swipes`: Candidate swipe decisions (`LEFT`, `RIGHT`, `SAVE`).
  - `savedJobs`: Bookmarked job postings.
  - `applications`: Submitted 1-click candidate applications with status logs.
* **Persistence Mechanism**: Uses `fs.writeFileSync` to write to `/data/db_store.json` debounced by 200ms to guarantee data durability without blocking I/O.

### 5. `backend/src/controllers/`

#### `authController.ts`
- `register(req, res)`: Creates user account, hashes password with `bcryptjs`, initializes empty candidate profile, and signs JWT.
- `login(req, res)`: Authenticates user credentials and returns active JWT token.
- `demoLogin(req, res)`: Authenticates or auto-creates the pre-configured *Alex Morgan* demo profile with full resume and ATS scores.
- `getMe(req, res)`: Returns authenticated user profile and candidate details.

#### `candidateController.ts`
- `getProfile(req, res)`: Retrieves candidate's preferences, target salary, and skills.
- `updateProfile(req, res)`: Updates personal details, location, preferred work mode, target salary, and skill tags.
- `getDashboardSummary(req, res)`: Aggregates total swipes, right-swipes, saved jobs count, active applications count, average ATS score, and recent activity feed.

#### `resumeController.ts`
- `uploadResume(req, res)`: Handles multipart/form-data upload, invokes `resumeParserService`, saves structured entity, and synchronizes candidate profile skills.
- `getActiveResume(req, res)`: Fetches candidate's most recent parsed resume.
- `loadDemoResume(req, res)`: Automatically attaches pre-parsed Senior Full Stack resume to current profile.

#### `atsController.ts`
- `analyzeJobATS(req, res)`: Takes `jobId`, retrieves candidate active resume, executes `atsAnalyzerService`, saves and returns detailed ATS report.
- `getReports(req, res)`: Returns history of all ATS audit reports for candidate.
- `getReportById(req, res)`: Retrieves specific audit report by ID.

#### `jobController.ts`
- `getJobs(req, res)`: Supports search query, pagination, work mode filter, salary range filter, and sorting.
- `getJobById(req, res)`: Returns full job posting with company info and extracted skills.
- `getJobStats(req, res)`: Returns aggregate stats across all 1,048 jobs (e.g. top in-demand skills, salary distributions).
- `getRecommendations(req, res)`: Invokes `recommendationEngineService` to provide ranked, AI-compatible jobs.

#### `swipeController.ts`
- `recordSwipe(req, res)`: Records swipe decision (`LEFT`, `RIGHT`, `SAVE`).
- `getSwipeHistory(req, res)`: Returns previous candidate swipes.
- `saveJob(req, res)` / `removeSavedJob(req, res)`: Manages saved bookmarks.
- `submitApplication(req, res)`: Submits 1-click application bundle, verifies ATS scan, and attaches status history.
- `getApplications(req, res)`: Returns submitted applications with tracking statuses (`APPLIED`, `REVIEWING`, `INTERVIEW`, `OFFER`, `REJECTED`).
- `updateApplicationStatus(req, res)`: Updates application pipeline status.

### 6. `backend/src/middleware/`
- `authMiddleware.ts`:
  - `requireAuth`: Verifies `Authorization: Bearer <token>` header, decodes user payload, and attaches `req.user`. Returns `401 Unauthorized` if invalid or missing.
  - `optionalAuth`: Soft-verifies token if present without rejecting unauthenticated calls.
- `errorMiddleware.ts`:
  - `errorHandler`: Catches uncaught exceptions and sends uniform `{ error: string, statusCode: number }` responses.

### 7. `backend/src/services/dataImporter.ts`
- `importJobsFromCSV()`: Reads `/data/clean_jobs.csv` with 1,048 real tech jobs.
- Parses CSV rows, cleans whitespace, extracts salary min/max numbers, identifies skills (TypeScript, React, Python, AWS, Docker, Kubernetes, etc.), normalizes work types (Remote, Hybrid, On-site), and writes to `db.jobs`.

### 8. `backend/src/utils/auth.ts`
- `hashPassword(password)`: Hashes plaintext with BCrypt (10 salt rounds).
- `comparePassword(plain, hash)`: Compares plaintext against stored hash.
- `generateToken(payload)`: Signs JWT with 7-day expiration.
- `verifyToken(token)`: Validates JWT signature.
