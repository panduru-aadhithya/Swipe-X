# Swipe X — Complete Master Documentation & Codebase Reference

> **Comprehensive Technical Specification & File-by-File Reference for Swipe X: AI-Powered Centralized Job Opportunities Platform**  
> *Login Portal:* [https://swipe-x.ai.studio/login](https://swipe-x.ai.studio/login)  
> *Published Live URL:* [https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app](https://ais-pre-h7d73eibojhl3hvqe2vmxf-769991582025.asia-southeast1.run.app)  
> *Target Runtime:* Node.js 20+ (Express.js) & React 19 (Vite) | Google Gemini 3.7 Flash AI Engine

---

## 📑 Table of Contents

1. [Executive Summary & Architectural Paradigm](#1-executive-summary--architectural-paradigm)
2. [Exhaustive Feature Directory & Specifications](#2-exhaustive-feature-directory--specifications)
   - [Feature 1: Interactive Swipe Discovery Deck & Gesture Engine](#feature-1-interactive-swipe-discovery-deck--gesture-engine)
   - [Feature 2: Centralized Verified Job Opportunities Ingestion (1,048 Roles)](#feature-2-centralized-verified-job-opportunities-ingestion-1048-roles)
   - [Feature 3: Pre-Flight Multi-Factor ATS Compatibility Engine](#feature-3-pre-flight-multi-factor-ats-compatibility-engine)
   - [Feature 4: AI STAR Mock Interview Simulator & Voice Assistant](#feature-4-ai-star-mock-interview-simulator--voice-assistant)
   - [Feature 5: Candidate Resume Intelligence & Skill Extraction](#feature-5-candidate-resume-intelligence--skill-extraction)
   - [Feature 6: Applications Tracking Pipeline & Lifecycle State Machine](#feature-6-applications-tracking-pipeline--lifecycle-state-machine)
   - [Feature 7: Recruiter Hub & Talent Management Portal](#feature-7-recruiter-hub--talent-management-portal)
   - [Feature 8: Admin Command Center, Telemetry & Audit Engine](#feature-8-admin-command-center-telemetry--audit-engine)
   - [Feature 9: 1-Click Instant Demo Experience & Role Impersonation](#feature-9-1-click-instant-demo-experience--role-impersonation)
   - [Feature 10: Dual-Engine Data Persistence (MongoDB Atlas + Local JSON)](#feature-10-dual-engine-data-persistence-mongodb-atlas--local-json)
   - [Feature 11: Behavioral Preference Learning & Dynamic Re-ranking Loop](#feature-11-behavioral-preference-learning--dynamic-re-ranking-loop)
   - [Feature 12: Widescreen Natural Tones UI & Responsive Navigation Shell](#feature-12-widescreen-natural-tones-ui--responsive-navigation-shell)
3. [File-by-File Technical Reference: Frontend (`/src`)](#3-file-by-file-technical-reference-frontend-src)
   - [Client Core & Routing (`App.tsx`, `main.tsx`, `types.ts`, `index.css`)](#client-core--routing)
   - [State Providers (`AuthContext.tsx`, `ThemeContext.tsx`)](#state-providers)
   - [API Client Layer (`client.ts`, `index.ts`, `mockInterviewService.ts`)](#api-client-layer)
   - [Reusable UI Components (`/src/components/*`)](#reusable-ui-components)
   - [Page Views (`/src/pages/*`)](#page-views)
4. [File-by-File Technical Reference: Backend (`/backend`)](#4-file-by-file-technical-reference-backend-backend)
   - [Server Entry & Initialization (`server.ts`, `app.ts`, `config/env.ts`)](#server-entry--initialization)
   - [AI Subsystem (`/backend/src/ai/*`)](#ai-subsystem)
   - [Database Layer (`db.ts`, `mongoDb.ts`, `/models/*`)](#database-layer)
   - [Controllers (`/backend/src/controllers/*`)](#controllers)
   - [Repositories (`/backend/src/repositories/*`)](#repositories)
   - [Routes & Middleware (`routes/index.ts`, `middleware/*`)](#routes--middleware)
   - [Data Ingestion & Scripts (`services/dataImporter.ts`, `scripts/*`)](#data-ingestion--scripts)
   - [Utilities & Types (`utils/auth.ts`, `types/index.ts`)](#utilities--types)
   - [Automated Tests (`tests/testCandidateWorkflow.ts`)](#automated-tests)
5. [File-by-File Technical Reference: Root & Configuration](#5-file-by-file-technical-reference-root--configuration)
6. [Data Assets Reference (`/data`)](#6-data-assets-reference-data)
7. [Security & Zero-Secrets Isolation Policy](#7-security--zero-secrets-isolation-policy)

---

## 1. Executive Summary & Architectural Paradigm

Swipe X is a full-stack, enterprise-grade job opportunities platform designed to dismantle the opaque barriers of traditional job boards and corporate Applicant Tracking Systems (ATS).

### The Problem It Solves
- **Opaque Candidate Rejection**: Upwards of 75% of qualified resumes are filtered out automatically before human recruiters inspect them. Job seekers have zero pre-submission visibility into how an ATS parses their background against job requirements.
- **Job Board Fatigue**: Job seekers face endless pages of repetitive, unranked listings with ghost postings and outdated requisitions.
- **Interview Unreadiness**: Candidates apply without knowing whether their experience articulates well to technical interview questions formatted around the STAR method (Situation, Task, Action, Result).

### The Solution Architecture
Swipe X combines:
1. **Interactive Physics-Driven Swiping**: A modern card-stack interface powered by `motion/react` with velocity-sensitive gestures, keyboard shortcuts, and undo capability.
2. **Deterministic Pre-Flight ATS Auditing**: A 5-factor mathematical analysis providing exact 0–100% scores, missing keywords, and actionable resume bullet recommendations.
3. **Automated Behavioral Learning**: An algorithmic loop that adapts future job recommendations based on candidate swipe preferences.
4. **Interactive STAR Mock Interviews**: Voice-enabled and text-based interview simulators powered by Gemini 3.7 Flash, scoring answers across Clarity, Technical Depth, and STAR Impact.
5. **Zero Secret Exposure Architecture**: Server-side isolation for all AI tokens and database credentials, complemented by seamless offline/heuristic fallbacks.

---

## 2. Exhaustive Feature Directory & Specifications

### Feature 1: Interactive Swipe Discovery Deck & Gesture Engine
- **User Facing Goal**: Provide an engaging, tactile method for exploring hundreds of job postings without scroll fatigue.
- **Interactions**:
  - **Swipe Right**: Match with role, record affinity (+0.1 weight), trigger match animation with confetti, and open ATS Apply modal.
  - **Swipe Left**: Pass role, apply subtle penalty (-0.05 weight) to demote similar roles in subsequent recommendations.
  - **Swipe Up / Bookmark**: Save role to candidate's private `SavedJobs` drawer without advancing application status.
  - **Undo (`Z` or Button)**: Pops previous decision off history stack and restores card to the top of the deck.
  - **Keyboard Shortcuts**: Arrow keys (`←`, `→`, `↑`) enable rapid keyboard-driven discovery.
- **Visual Mechanics**: `motion/react` card dragging with elastic constraints, card tilt based on horizontal drag offset ($rotation = x \times 0.08^\circ$), stamp badges ("MATCH", "PASS") fading in with drag velocity, and a 3-card layered background stack providing optical depth.
- **Frontend Code**: `src/pages/SwipePage.tsx`, `src/components/JobCard.tsx`.
- **Backend Endpoints**: `POST /api/swipes`, `GET /api/recommendations`, `GET /api/swipes/history`.

### Feature 2: Centralized Verified Job Opportunities Ingestion (1,048 Roles)
- **User Facing Goal**: Ensure candidates browse authentic, curated tech postings with verified source URLs and salary transparency.
- **Ingestion Pipeline**: Reads `/data/clean_jobs.csv` containing 1,048 enterprise and startup tech listings across Frontend, Backend, Full Stack, AI/ML, DevOps, Data Science, and Product Management.
- **Data Enrichment**: Parses work type (`Remote`, `Hybrid`, `On-site`), employment type (`Full-time`, `Contract`), salary ranges, and executes automated regex/NLP technical skill extraction (e.g. `React`, `TypeScript`, `Node.js`, `Python`, `AWS`, `Docker`, `PostgreSQL`).
- **Early Applicant Indicators**: Automatically tags roles posted within the last 24–48 hours to highlight high-callback opportunities.
- **Frontend Code**: `src/pages/ExploreJobsPage.tsx`, `src/pages/JobDetailPage.tsx`, `src/components/JobDetailDrawer.tsx`.
- **Backend Code**: `backend/src/services/dataImporter.ts`, `backend/src/controllers/jobController.ts`, `backend/src/repositories/jobRepository.ts`.

### Feature 3: Pre-Flight Multi-Factor ATS Compatibility Engine
- **User Facing Goal**: Give candidates an exact audit of how an automated ATS will score their resume *before* applying.
- **Mathematical Formula**:
  $$\text{ATS Score} = (0.35 \times S) + (0.25 \times K) + (0.20 \times E) + (0.10 \times D) + (0.10 \times T)$$
  - $S$ = Skills Matrix Match (35%): Direct overlap between candidate verified skills and job requirements.
  - $K$ = Keyword Density & Coverage (25%): Occurrence of domain-specific terminology in experience bullets.
  - $E$ = Experience Alignment (20%): Normalized years of relevant experience vs. required minimum.
  - $D$ = Education / Degree Alignment (10%): Academic credentials verification or equivalent experience.
  - $T$ = Title / Domain Relevance (10%): Cosine and Levenshtein similarity to target role title.
- **Audit Outputs**:
  - Radial score gauge with semantic tiers (90–100%: Exceptional, 75–89%: Strong Match, 60–74%: Moderate, <60%: Needs Alignment).
  - Green matching keywords vs. amber missing keywords.
  - Actionable resume bullet rewrites tailored to bridge the missing keyword gaps.
- **Frontend Code**: `src/pages/ATSAnalysisPage.tsx`, `src/components/ATSScoreGauge.tsx`, `src/components/ApplyModal.tsx`.
- **Backend Code**: `backend/src/ai/atsAnalyzer/atsAnalyzerService.ts`, `backend/src/controllers/atsController.ts`.

### Feature 4: AI STAR Mock Interview Simulator & Voice Assistant
- **User Facing Goal**: Provide realistic technical and behavioral interview preparation tailored specifically to the target job description.
- **Core Functionality**:
  - **Dynamic Role-Specific Questions**: Generates 3–5 targeted questions balancing technical system design, architectural tradeoffs, and behavioral conflict resolution.
  - **Voice-to-Text Input**: Integrates the browser's Web Speech API (`webkitSpeechRecognition`) for hands-free answer dictation.
  - **Timed Pressure Simulation**: On-screen visual timer tracking response duration.
  - **Multi-Dimensional AI Evaluation**:
    - Clarity Score (0–100): Verbal articulation, coherence, and structure.
    - Technical Depth (0–100): Correctness, complexity awareness, and concrete engineering decisions.
    - STAR Impact (0–100): Rigorous adherence to Situation, Task, Action, and Result framing.
    - Model Response: Exemplary STAR answer demonstrating ideal response composition.
- **Frontend Code**: `src/pages/MockInterviewPage.tsx`, `src/components/MockInterviewModal.tsx`, `src/api/mockInterviewService.ts`.
- **Backend Integration**: Server-side Gemini 3.7 Flash evaluation with deterministic heuristic fallback.

### Feature 5: Candidate Resume Intelligence & Skill Extraction
- **User Facing Goal**: Enable candidates to upload or inspect their resume, extract structured skills, identify career gaps, and visualize their technical stack.
- **Core Features**:
  - Multi-format ingestion (PDF, DOCX, Plain Text, or 1-Click Demo Alex Morgan profile).
  - Automated extraction into structured JSON: skills, experience timeline, education, certifications, and portfolio links.
  - AI Strengths vs. Areas of Improvement breakdown.
- **Frontend Code**: `src/pages/ResumePage.tsx`, `src/pages/ProfilePage.tsx`.
- **Backend Code**: `backend/src/ai/resumeParser/resumeParserService.ts`, `backend/src/controllers/resumeController.ts`, `backend/src/repositories/resumeRepository.ts`.

### Feature 6: Applications Tracking Pipeline & Lifecycle State Machine
- **User Facing Goal**: Eliminate spreadsheet job tracking by consolidating all applications into an automated state machine.
- **Application Statuses**:
  1. `APPLIED`: Application submitted with resume snapshot and pre-flight ATS score.
  2. `REVIEWING`: Recruiter has opened the submission.
  3. `INTERVIEWING`: Candidate scheduled for phone screen or technical interview.
  4. `OFFERED`: Formal compensation offer extended.
  5. `REJECTED`: Polite notification with feedback.
- **Visual Formats**: Dual view modes: Interactive Kanban Board with drag-and-drop or categorized list view with sorting and search.
- **Frontend Code**: `src/pages/ApplicationsPage.tsx`.
- **Backend Code**: `backend/src/controllers/swipeController.ts`, `backend/src/repositories/jobRepository.ts`.

### Feature 7: Recruiter Hub & Talent Management Portal
- **User Facing Goal**: Allow hiring managers to publish verified jobs and screen applicant pools ranked by pre-flight ATS scores.
- **Capabilities**:
  - Direct job creation form (Title, Company, Location, Work Type, Salary Range, Description, Required Skills).
  - Applicant review table displaying candidate contact, active resume, ATS match score, and current stage.
  - One-click applicant stage transitions with automatic audit logging.
- **Frontend Code**: `src/pages/RecruiterDashboardPage.tsx`.
- **Backend Code**: `backend/src/controllers/recruiterController.ts`.

### Feature 8: Admin Command Center, Telemetry & Audit Engine
- **User Facing Goal**: Provide complete platform observability for administrators, system health monitoring, and security audit logs.
- **Capabilities**:
  - System Telemetry: Live AI model latency benchmarks, database connection status, memory consumption, and uptime.
  - User Role Orchestration: View and manage user accounts across `candidate`, `recruiter`, and `admin` roles.
  - Global Activity Stream: Chronological stream of all swipes, ATS audits, applications, and job updates across the network.
- **Frontend Code**: `src/pages/AdminDashboardPage.tsx`.
- **Backend Code**: `backend/src/controllers/adminController.ts`.

### Feature 9: 1-Click Instant Demo Experience & Role Impersonation
- **User Facing Goal**: Zero-friction evaluation for reviewers, evaluators, and recruiters without signing up or uploading documents.
- **Capabilities**:
  - Instantly logs into *Alex Morgan* (Senior Full Stack & AI Systems Engineer, 6+ years experience, 24 verified skills, pre-loaded resume).
  - Automatically loads candidate recommendations, sample applications in diverse stages, and historic ATS reports.
  - Allows quick role switching between Candidate, Recruiter, and Admin directly from navigation or settings.
- **Frontend Code**: `src/pages/LandingPage.tsx`, `src/pages/LoginPage.tsx`, `src/context/AuthContext.tsx`.
- **Backend Code**: `backend/src/controllers/authController.ts`.

### Feature 10: Dual-Engine Data Persistence (MongoDB Atlas + Local JSON)
- **User Facing Goal**: High availability in cloud environments (Cloud Run) with zero dependencies for offline local execution.
- **Architecture**:
  - Primary: MongoDB Atlas when `MONGODB_URI` is configured in environment variables.
  - Secondary: High-performance atomic JSON store at `/data/db_store.json` using in-memory cached collections with periodic disk flushes.
  - Automatic migration script (`backend/src/scripts/migrateJsonToMongo.ts`) to transfer JSON store into MongoDB Atlas collections.
- **Backend Code**: `backend/src/database/db.ts`, `backend/src/database/mongoDb.ts`, `backend/src/models/*`.

### Feature 11: Behavioral Preference Learning & Dynamic Re-ranking Loop
- **User Facing Goal**: Over time, job recommendations become hyper-personalized based on what the candidate swipes right or left on.
- **Algorithm**:
  - Vector of skill and attribute weights initialized from candidate resume.
  - Swiping right boosts weights for associated skills, company scale, and work type.
  - Swiping left applies demotion factors to reduce noise.
  - Recommendation engine re-ranks candidate deck via weighted dot-product similarity.
- **Backend Code**: `backend/src/ai/recommendationEngine/recommendationEngineService.ts`, `backend/src/ai/jobMatcher/jobMatcherService.ts`.

### Feature 12: Widescreen Natural Tones UI & Responsive Navigation Shell
- **User Facing Goal**: Deliver a calming, distraction-free, professional interface that utilizes modern high-resolution displays up to 1720px width.
- **Design Foundations**:
  - Earthy, high-contrast Natural Tones palette: Deep Olive Greens (`#5B6D5B`, `#8FA68F`), Warm Sand (`#DCD7C9`, `#E9E4D9`), Charcoal (`#2D2926`), and Amber Gold (`#C29352`).
  - Strict compliance with WCAG AA contrast standards.
  - Adaptive responsive layout: Desktop expanded sidebar (`w-72 xl:w-80`), top bar (`h-20`), mobile bottom touch navigation (`min-h-[48px]`), and responsive card containers.
- **Frontend Code**: `src/components/Layout.tsx`, `src/components/Navbar.tsx`, `src/components/Sidebar.tsx`, `src/components/MobileBottomNav.tsx`, `src/index.css`.

---

## 3. File-by-File Technical Reference: Frontend (`/src`)

### Client Core & Routing

#### `src/main.tsx`
- **Purpose**: Client application entry point.
- **Responsibilities**: Mounts the React component tree to the DOM element with `id="root"`. Initializes `React.StrictMode` and wraps the app with `ThemeProvider` and `AuthProvider`.
- **Imports**: `React`, `ReactDOM`, `App.tsx`, `AuthContext.tsx`, `ThemeContext.tsx`, `index.css`.
- **Exports**: None (entry file).

#### `src/App.tsx`
- **Purpose**: Primary routing table and application frame.
- **Responsibilities**: Declares React Router v7 routes (`/`, `/swipe`, `/explore`, `/jobs/:id`, `/ats-analysis`, `/mock-interview`, `/applications`, `/resume`, `/dashboard`, `/saved`, `/profile`, `/recruiter`, `/admin`, `/login`, `/register`, `/settings`). Protects authenticated routes by inspecting `AuthContext.user` and redirects unauthenticated visitors to `/login`. Configures `Layout` wrapper for all dashboard routes.
- **Imports**: `react-router-dom`, `AuthContext`, all page components from `src/pages/*`, `Layout` component.
- **Exports**: `default App`.

#### `src/types.ts`
- **Purpose**: Global client-side TypeScript definitions and data contracts.
- **Exports**:
  - `Job`: Full job schema (id, title, company, location, workType, employmentType, salaryMin, salaryMax, description, extractedSkills, source, sourceUrl, datePosted).
  - `User`: Authenticated user profile (id, email, name, role, avatarUrl).
  - `CandidateProfile`: Candidate skill matrix, target role, preferences, bio, experienceYears.
  - `ResumeData`: Parsed resume content (skills, workHistory, education, summary, certifications).
  - `ATSAnalysisResult`: 5-factor breakdown (overallScore, skillsScore, keywordScore, experienceScore, educationScore, matchingKeywords, missingKeywords, recommendations).
  - `SwipeDecision`: Direction (`LEFT`, `RIGHT`, `SAVE`), timestamp, jobId, candidateId.
  - `Application`: Id, jobId, candidateId, status, appliedDate, atsScore, notes.
  - `MockInterviewQuestion`, `MockInterviewEvaluation`: Questions, user answers, clarity/tech/STAR scores, model response.

#### `src/index.css`
- **Purpose**: Global stylesheet configuring Tailwind CSS v4 and typography tokens.
- **Responsibilities**: Injects `@import "tailwindcss";`, custom color utility classes, scrollbar smoothing, and custom keyframe animations (`pulse-subtle`, `float`, `shimmer`).

---

### State Providers

#### `src/context/AuthContext.tsx`
- **Purpose**: Centralized authentication, session persistence, and role management.
- **State Managed**:
  - `user`: Currently authenticated user object (`null` if unauthenticated).
  - `token`: Short-lived JWT bearer token string.
  - `candidateProfile`: Active candidate profile details and preferences.
  - `isLoading`: Boolean indicating whether session is hydrating from `localStorage`.
- **Key Functions**:
  - `login(email, password)`: Calls `POST /api/auth/login`, persists token and user to `localStorage`, sets state.
  - `register(userData)`: Calls `POST /api/auth/register`, sets state.
  - `logout()`: Clears `localStorage` and resets state to `null`.
  - `loginAsDemo(role)`: Calls `POST /api/auth/demo-login` to instantly impersonate Candidate (*Alex Morgan*), Recruiter (*Sarah Jenkins*), or Admin (*David Vance*).
  - `refreshProfile()`: Re-fetches candidate profile from `GET /api/candidate/profile`.
- **Exports**: `AuthContext`, `AuthProvider`, `useAuth()`.

#### `src/context/ThemeContext.tsx`
- **Purpose**: Manages light, dark, and system color theme preferences.
- **State Managed**: `theme` ('light' | 'dark' | 'system'), `resolvedTheme` ('light' | 'dark').
- **Key Functions**:
  - `setTheme(mode)`: Updates preference in `localStorage` and updates the `dark` class on `document.documentElement`.
- **Exports**: `ThemeContext`, `ThemeProvider`, `useTheme()`.

---

### API Client Layer

#### `src/api/client.ts`
- **Purpose**: Type-safe HTTP request wrapper around native `fetch`.
- **Responsibilities**: Automatically intercepts outgoing requests, prefixes `/api`, injects `Authorization: Bearer <token>` from `localStorage`, checks for non-2xx status codes, and parses response JSON with standard error schemas.
- **Exports**: `apiClient.get()`, `apiClient.post()`, `apiClient.put()`, `apiClient.patch()`, `apiClient.delete()`.

#### `src/api/index.ts`
- **Purpose**: Categorized catalog of all client API calls.
- **Exported Modules**:
  - `authApi`: `login`, `register`, `demoLogin`, `getMe`.
  - `jobsApi`: `getJobs(filters)`, `getJobById(id)`, `getRecommendations()`.
  - `swipesApi`: `recordSwipe(jobId, direction)`, `getSwipeHistory()`.
  - `savedJobsApi`: `getSavedJobs()`, `saveJob(jobId)`, `removeSavedJob(id)`.
  - `atsApi`: `analyzeJob(jobId, resumeId)`, `getReports()`.
  - `resumesApi`: `uploadResume(file)`, `getActiveResume()`, `loadDemoResume()`.
  - `applicationsApi`: `createApplication(jobId, notes)`, `getApplications()`, `updateStatus(id, status)`.
  - `recruiterApi`: `getPipeline()`, `createJob(jobData)`.
  - `adminApi`: `getStats()`, `getSystemHealth()`, `getActivity()`.

#### `src/api/mockInterviewService.ts`
- **Purpose**: Service client for the AI Mock Interview Simulator.
- **Responsibilities**: Communicates with interview simulation endpoints or local heuristic evaluators when in offline mode. Formulates structured prompts, generates STAR questions, and calculates Clarity, Technical Depth, and STAR Impact scores.
- **Exports**: `generateMockInterviewQuestions(job)`, `evaluateInterviewAnswer(question, answer, job)`.

---

### Reusable UI Components (`/src/components/*`)

#### `src/components/Layout.tsx`
- **Purpose**: Master layout wrapper for authenticated routes.
- **Responsibilities**: Houses the top `Navbar`, expandable left `Sidebar`, mobile bottom `MobileBottomNav`, and renders children in a responsive container (`max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-10`).
- **Exports**: `default Layout`.

#### `src/components/Navbar.tsx`
- **Purpose**: Top navigation and utility header (`h-20`).
- **Features**: Swipe X branding logo, global search shortcut, theme toggle button (Sun/Moon), notification bell trigger opening `NotificationsModal`, and user profile avatar dropdown with 1-click role switcher.
- **Exports**: `default Navbar`.

#### `src/components/Sidebar.tsx`
- **Purpose**: Primary desktop navigation rail (`w-72 xl:w-80`).
- **Features**: NavLinks with active indicator pills, navigation items (`Swipe Deck`, `Explore Jobs`, `ATS Scanner`, `Mock Interview`, `Applications`, `Resume Hub`, `Analytics Dashboard`, `Saved Roles`), Recruiter/Admin link sections, and quick logout button.
- **Exports**: `default Sidebar`.

#### `src/components/MobileBottomNav.tsx`
- **Purpose**: Bottom navigation dock for mobile viewports (`< 1024px`).
- **Features**: Fixed position bottom bar with high-contrast icons for Swipe, Explore, ATS, Interview, and Dashboard with touch targets $\ge 48\text{px}$.
- **Exports**: `default MobileBottomNav`.

#### `src/components/JobCard.tsx`
- **Purpose**: The interactive gesture card for the swipe deck.
- **Features**: Draggable card with `motion/react`, dynamic rotation on $X$ axis, "MATCH" / "PASS" stamps with velocity-based opacity, role title, company badge, salary pill, work type tag, extracted skills chips, and flip trigger for full description.
- **Exports**: `default JobCard`.

#### `src/components/ATSScoreGauge.tsx`
- **Purpose**: Visual presentation of pre-flight ATS compatibility score.
- **Features**: Animated SVG circular progress ring, color coding (Emerald $\ge 85$, Amber $70-84$, Rose $< 70$), percentage readout, and sub-score progress bars for Skills, Keywords, Experience, and Education.
- **Exports**: `default ATSScoreGauge`.

#### `src/components/MatchBadge.tsx`
- **Purpose**: Compact compatibility score badge.
- **Features**: Small pill displaying match percentage with an automated icon (Sparkles or Flame) indicating high-priority affinity.
- **Exports**: `default MatchBadge`.

#### `src/components/ApplyModal.tsx`
- **Purpose**: Dialog triggered upon right-swipe or manual apply.
- **Features**: Shows target role summary, candidate's pre-flight ATS score, cover letter / notes textarea, resume confirmation, and submit button that transitions status to `APPLIED`.
- **Exports**: `default ApplyModal`.

#### `src/components/JobDetailDrawer.tsx`
- **Purpose**: Sliding side drawer for deep job inspection from Explore or Deck views.
- **Features**: Smooth right-to-left entry, full job description, verified source URL preservation, company metadata, required skills, and direct "Apply with ATS Scan" CTA.
- **Exports**: `default JobDetailDrawer`.

#### `src/components/MockInterviewModal.tsx`
- **Purpose**: Quick interview preparation popup directly from a job card.
- **Features**: Role overview, sample question prompt, audio/text answer interface, and immediate STAR evaluation.
- **Exports**: `default MockInterviewModal`.

#### `src/components/NotificationsModal.tsx`
- **Purpose**: Notification center drawer.
- **Features**: Displays application status changes, new verified jobs matching candidate skills, and ATS recommendation alerts.
- **Exports**: `default NotificationsModal`.

#### `src/components/SwipeXLogo.tsx` & `src/components/OrionLogo.tsx`
- **Purpose**: Scalable SVG vector branding marks.
- **Features**: Dynamic stroke and fill responding to active light/dark themes.
- **Exports**: `SwipeXLogo`, `OrionLogo`.

---

### Page Views (`/src/pages/*`)

#### `src/pages/LandingPage.tsx`
- **Purpose**: Public visitor homepage.
- **Features**: High-impact hero section, 1-Click Launch Demo button, interactive feature preview cards, statistics banner (1,000+ jobs, 94% ATS accuracy), algorithm breakdown, and candidate testimonials.

#### `src/pages/SwipePage.tsx`
- **Purpose**: The core swipe discovery experience.
- **Features**: Renders `JobCard` stack, handles card ejection animations, manages undo history, shows empty-state celebration when deck is cleared, and binds keyboard arrow listeners (`←`, `→`, `↑`, `Z`).

#### `src/pages/ExploreJobsPage.tsx`
- **Purpose**: Searchable, filterable directory of all 1,048 verified jobs.
- **Features**: Real-time keyword filter, faceted pills for Work Type (`Remote`, `Hybrid`, `On-site`), Employment Type, Salary tiers, sort by date/salary/match score, and opens `JobDetailDrawer`.

#### `src/pages/JobDetailPage.tsx`
- **Purpose**: Dedicated permalink page for individual job postings (`/jobs/:id`).
- **Features**: Breadcrumb navigation, verified source link preservation, ATS compatibility overview box, extracted technical requirements matrix, and full role description.

#### `src/pages/ATSAnalysisPage.tsx`
- **Purpose**: Dedicated pre-flight resume-to-job audit workspace.
- **Features**: Select target job from dropdown, runs live 5-factor mathematical analysis, renders `ATSScoreGauge`, keyword gap breakdown (green matching vs red missing), and generates copyable bullet point improvements.

#### `src/pages/MockInterviewPage.tsx`
- **Purpose**: Dedicated AI STAR Mock Interview Simulator.
- **Features**: Role selector, dynamic question generation, voice dictation via Web Speech API, countdown timer, text editor, and multi-factor STAR evaluation report.

#### `src/pages/ApplicationsPage.tsx`
- **Purpose**: Candidate application lifecycle tracker.
- **Features**: Tabbed pipeline view (`Applied`, `Reviewing`, `Interviewing`, `Offered`, `Rejected`), status badge indicators, ATS score audit, and direct link to job details.

#### `src/pages/ResumePage.tsx`
- **Purpose**: Resume management and AI parsing hub.
- **Features**: Drag-and-drop resume upload zone, demo resume loader, structured skill breakdown, experience timeline visualizer, and AI suggested enhancements.

#### `src/pages/DashboardPage.tsx`
- **Purpose**: Central candidate analytics command center.
- **Features**: High-level stat cards (Total Swipes, Match Rate, Active Applications, Average ATS Score), recent activity stream, quick-swipe recommendations, and application status breakdown chart.

#### `src/pages/SavedJobsPage.tsx`
- **Purpose**: Bookmarked jobs gallery.
- **Features**: Grid of saved roles, quick un-save action, and direct apply trigger with ATS scan.

#### `src/pages/SwipeHistoryPage.tsx`
- **Purpose**: Telemetry log of all candidate swipe decisions.
- **Features**: Filter by Right (Matches), Left (Passes), or Up (Saved), with timestamps and option to reconsider passed roles.

#### `src/pages/ProfilePage.tsx`
- **Purpose**: Candidate career profile and preferences.
- **Features**: Target job title, minimum desired salary slider, preferred locations, work type toggles, and editable skill tags.

#### `src/pages/RecruiterDashboardPage.tsx`
- **Purpose**: Hiring manager talent screening portal.
- **Features**: Job posting form, applicant review list sorted by ATS score, candidate status advancement buttons, and requisition metrics.

#### `src/pages/AdminDashboardPage.tsx`
- **Purpose**: Platform administrator telemetry console.
- **Features**: Real-time latency benchmarks, database health indicator, user role management table, and audit trail of platform activity.

#### `src/pages/LoginPage.tsx` & `src/pages/RegisterPage.tsx`
- **Purpose**: Authentication entry points.
- **Features**: Clean form inputs, validation error alerts, and 1-Click Demo Login buttons for Candidate, Recruiter, and Admin roles.

#### `src/pages/SettingsPage.tsx`
- **Purpose**: Application preferences and developer controls.
- **Features**: Theme selection (Light, Dark, System), notifications toggles, and AI evaluation mode indicator.

#### `src/pages/GrowthJourneyPage.tsx`
- **Purpose**: Career progression roadmap.
- **Features**: Skill gap visualizer showing skills required to advance from junior to senior/lead roles.

---

## 4. File-by-File Technical Reference: Backend (`/backend`)

### Server Entry & Initialization

#### `server.ts`
- **Path**: `/server.ts`
- **Role**: Primary full-stack execution entry point.
- **Key Functions**:
  - `startServer()`: Initializes Express app on `0.0.0.0:3000`.
  - Development Mode (`NODE_ENV !== 'production'`): Mounts Vite via `createViteServer({ server: { middlewareMode: true }, appType: 'spa' })`.
  - Production Mode: Serves static files from `/dist` and serves `/dist/index.html` for all non-API routes.

#### `backend/src/app.ts`
- **Path**: `/backend/src/app.ts`
- **Role**: Express application factory and middleware configuration.
- **Responsibilities**:
  - Sets up CORS headers allowing cross-origin requests.
  - Registers JSON and URL-encoded body parsers with a 15MB payload limit.
  - Mounts API router on `/api`.
  - Injects database initialization on startup (`initDatabase()`, `importJobsFromCSV()`).
  - Registers global error middleware `errorHandler`.

#### `backend/src/config/env.ts`
- **Path**: `/backend/src/config/env.ts`
- **Role**: Environment variable abstraction and configuration defaults.
- **Variables**: `PORT` (default 3000), `NODE_ENV`, `GEMINI_API_KEY`, `MONGODB_URI`, `JWT_SECRET`, `AI_MODE` ('gemini' | 'mock').

---

### AI Subsystem (`/backend/src/ai/*`)

#### `backend/src/ai/geminiClient.ts`
- **Path**: `/backend/src/ai/geminiClient.ts`
- **Role**: Official `@google/genai` TypeScript SDK initialization and wrapper.
- **Responsibilities**: Lazily instantiates `GoogleGenAI` using `process.env.GEMINI_API_KEY`. Exports `getGeminiClient()` and provides model constant `GEMINI_MODEL = 'gemini-3.7-flash'`. Handles missing API key gracefully without crashing server startup.

#### `backend/src/ai/atsAnalyzer/atsAnalyzerService.ts`
- **Path**: `/backend/src/ai/atsAnalyzer/atsAnalyzerService.ts`
- **Role**: Core 5-factor mathematical ATS scoring algorithm.
- **Key Functions**:
  - `analyzeATSCompatibility(resume, job)`: Computes skills overlap, keyword density, experience delta, education alignment, and title relevance. Produces overall 0–100 score, lists matching/missing keywords, and generates targeted resume bullet improvements.
  - If `GEMINI_API_KEY` is present, enriches recommendations via LLM; otherwise uses deterministic algorithmic heuristics.

#### `backend/src/ai/resumeParser/resumeParserService.ts`
- **Path**: `/backend/src/ai/resumeParser/resumeParserService.ts`
- **Role**: Extracts structured data from raw resume text or file buffers.
- **Key Functions**:
  - `parseResumeText(text)`: Extracts candidate name, email, phone, list of technical skills, work history timeline, and education credentials.
  - Provides fallback regex parser for offline environments.

#### `backend/src/ai/jobMatcher/jobMatcherService.ts`
- **Path**: `/backend/src/ai/jobMatcher/jobMatcherService.ts`
- **Role**: Computes vector similarity and skill overlap between candidates and job listings.
- **Key Functions**:
  - `calculateMatchScore(candidate, job)`: Computes normalized compatibility percentage based on matching skills, preferred work types, and target salary bounds.

#### `backend/src/ai/recommendationEngine/recommendationEngineService.ts`
- **Path**: `/backend/src/ai/recommendationEngine/recommendationEngineService.ts`
- **Role**: Behavioral recommendation loop adjusting deck order dynamically.
- **Key Functions**:
  - `getPersonalizedRecommendations(candidateId, limit)`: Fetches jobs, excludes previously swiped jobs, computes baseline match scores, applies candidate preference weight adjustments (derived from swipe history), and returns sorted recommendations.
  - `updateCandidatePreferences(candidateId, jobId, direction)`: Modifies affinity vector based on right (+0.1) or left (-0.05) swipe decisions.

---

### Database Layer (`db.ts`, `mongoDb.ts`, `/models/*`)

#### `backend/src/database/db.ts`
- **Path**: `/backend/src/database/db.ts`
- **Role**: In-memory database with atomic JSON disk persistence (`/data/db_store.json`).
- **Collections Managed**: `users`, `candidateProfiles`, `resumes`, `jobs`, `atsReports`, `swipes`, `savedJobs`, `applications`, `auditLogs`.
- **Key Functions**:
  - `initDatabase()`: Loads `/data/db_store.json` if present; otherwise initializes empty collections and loads seed jobs.
  - `persistToDisk()`: Writes current in-memory collections to disk atomically using temporary files to prevent corruption.

#### `backend/src/database/mongoDb.ts`
- **Path**: `/backend/src/database/mongoDb.ts`
- **Role**: MongoDB Atlas Mongoose connection manager.
- **Key Functions**:
  - `connectMongoDB()`: Connects to MongoDB Atlas when `MONGODB_URI` is provided with reconnect logic and connection pooling.
  - `isMongoConnected()`: Returns boolean status for telemetry.

#### Mongoose Schemas (`/backend/src/models/*`)
- `User.model.ts`: User authentication credentials, role (`candidate`, `recruiter`, `admin`), profile metadata.
- `CandidateProfile.model.ts`: Skills array, preferences, target title, salary expectations.
- `Resume.model.ts` & `ResumeData.model.ts`: Uploaded file metadata, raw text, and parsed structured JSON.
- `Job.model.ts`: Job listing schema with verified source URL, description, and extracted requirements.
- `ATSReport.model.ts`: Historical pre-flight ATS audit reports with 5-factor breakdown.
- `SwipeDecision.model.ts`: Candidate swipe records (`LEFT`, `RIGHT`, `SAVE`).
- `SavedJob.model.ts`: Bookmarked roles.
- `Application.model.ts`: Submitted job applications with stage state machine (`APPLIED`, `REVIEWING`, `INTERVIEWING`, `OFFERED`, `REJECTED`).
- `JobRecommendation.model.ts`: Pre-computed candidate recommendation scores.

---

### Controllers (`/backend/src/controllers/*`)

#### `backend/src/controllers/authController.ts`
- **Role**: Handles `/api/auth` endpoints.
- **Key Functions**:
  - `register`: Validates user inputs, hashes password with BCrypt, creates user and initial candidate profile.
  - `login`: Compares BCrypt password hash, generates signed JWT token.
  - `demoLogin`: Automatically authenticates demo candidate, recruiter, or admin without requiring credentials.
  - `getMe`: Returns authenticated user profile and candidate settings.

#### `backend/src/controllers/jobController.ts`
- **Role**: Handles `/api/jobs` and `/api/recommendations` endpoints.
- **Key Functions**:
  - `getJobs`: Paginated search with filters for keyword, workType, employmentType, and salary range.
  - `getJobById`: Returns full job record by ID.
  - `getRecommendations`: Returns personalized deck for active candidate.

#### `backend/src/controllers/atsController.ts`
- **Role**: Handles `/api/ats` endpoints.
- **Key Functions**:
  - `analyzeJob`: Runs 5-factor ATS audit between active candidate resume and specified job, records audit report, and returns breakdown.
  - `getReports`: Retrieves past ATS reports for candidate.

#### `backend/src/controllers/swipeController.ts`
- **Role**: Handles `/api/swipes`, `/api/saved-jobs`, and `/api/applications`.
- **Key Functions**:
  - `recordSwipe`: Logs swipe decision, updates behavioral preference weights.
  - `getSwipeHistory`: Retrieves candidate swipe timeline.
  - `saveJob` / `removeSavedJob`: Manages bookmarked roles.
  - `createApplication` / `getApplications`: Submits application and returns application pipeline.

#### `backend/src/controllers/resumeController.ts`
- **Role**: Handles `/api/resumes` endpoints.
- **Key Functions**:
  - `uploadResume`: Accepts file upload via Multer buffer, parses text, extracts skills, and saves active resume.
  - `getActiveResume`: Returns currently active parsed resume.
  - `loadDemoResume`: Injects Alex Morgan senior engineer resume into candidate profile.

#### `backend/src/controllers/recruiterController.ts`
- **Role**: Handles `/api/recruiter` endpoints.
- **Key Functions**:
  - `getPipeline`: Returns list of all candidate applications for recruiter's posted jobs, with ATS scores.
  - `updateApplicationStage`: Transitions application status (`REVIEWING`, `INTERVIEWING`, `OFFERED`, `REJECTED`).
  - `createJob`: Publishes a new verified job posting to the system.

#### `backend/src/controllers/adminController.ts`
- **Role**: Handles `/api/admin` endpoints.
- **Key Functions**:
  - `getStats`: Returns platform-wide statistics (total users, jobs, applications, average ATS score).
  - `getSystemHealth`: Runs latency benchmarks, checks database connection, returns uptime.
  - `getActivity`: Returns live audit stream of system events.

#### `backend/src/controllers/candidateController.ts`
- **Role**: Handles `/api/candidate` endpoints.
- **Key Functions**:
  - `getProfile` / `updateProfile`: Reads and modifies candidate preferences, skills, and target roles.
  - `getDashboardSummary`: Computes candidate-specific statistics for the analytics dashboard.

#### `backend/src/controllers/notificationController.ts`
- **Role**: Handles `/api/notifications` endpoints.
- **Key Functions**:
  - `getNotifications`: Returns candidate notification alerts.
  - `markAsRead`: Marks notifications as viewed.

---

### Repositories (`/backend/src/repositories/*`)

- `jobRepository.ts`: CRUD data access operations for jobs, applications, saved jobs, swipes, and ATS reports.
- `userRepository.ts`: CRUD data access operations for users and candidate profiles.
- `resumeRepository.ts`: CRUD data access operations for uploaded resumes and parsed resume data.

---

### Routes & Middleware

#### `backend/src/routes/index.ts`
- **Path**: `/backend/src/routes/index.ts`
- **Role**: Express router aggregation. Mounts all sub-routers (`auth`, `jobs`, `resumes`, `ats`, `swipes`, `saved-jobs`, `applications`, `candidate`, `recruiter`, `admin`, `notifications`).

#### `backend/src/middleware/authMiddleware.ts`
- **Path**: `/backend/src/middleware/authMiddleware.ts`
- **Role**: JWT Bearer token authentication and role authorization.
- **Key Functions**:
  - `requireAuth`: Verifies `Authorization: Bearer <token>`, decodes payload, attaches `req.user`. Returns 401 if missing or invalid.
  - `requireRole(roles)`: Ensures authenticated user matches required role (`admin` or `recruiter`). Returns 403 if forbidden.

#### `backend/src/middleware/errorMiddleware.ts`
- **Path**: `/backend/src/middleware/errorMiddleware.ts`
- **Role**: Global express error handling middleware catching uncaught exceptions and returning structured JSON responses (`{ error: { code, message } }`).

---

### Data Ingestion & Scripts

#### `backend/src/services/dataImporter.ts`
- **Path**: `/backend/src/services/dataImporter.ts`
- **Role**: Ingests `/data/clean_jobs.csv` containing 1,048 real tech jobs, parses columns, cleans whitespace, extracts technical skills, and seeds the repository.

#### `backend/src/scripts/generateDataset.ts`
- **Path**: `/backend/src/scripts/generateDataset.ts`
- **Role**: Utility script to expand or synthesize additional job listings and candidate profiles for automated testing.

#### `backend/src/scripts/migrateJsonToMongo.ts`
- **Path**: `/backend/src/scripts/migrateJsonToMongo.ts`
- **Role**: Standalone migration tool that transfers all records from `/data/db_store.json` directly into MongoDB Atlas collections.

---

### Utilities, Types & Tests

- `backend/src/utils/auth.ts`: Password hashing (`bcryptjs.hashSync`, `bcryptjs.compareSync`) and JWT signing (`jwt.sign`, `jwt.verify`).
- `backend/src/types/index.ts`: Shared backend interfaces, DTOs, and enum definitions.
- `backend/tests/testCandidateWorkflow.ts`: End-to-end integration test exercising registration, demo login, resume upload, ATS scoring, swipe recording, and application submission.

---

## 5. File-by-File Technical Reference: Root & Configuration

- `package.json`: Project manifest declaring all dependencies (`react`, `react-router-dom`, `motion`, `lucide-react`, `express`, `@google/genai`, `jsonwebtoken`, `bcryptjs`, `multer`, `mongoose`) and build scripts (`dev`, `build`, `start`, `lint`, `test`).
- `tsconfig.json`: TypeScript configuration enforcing strict type checking, ES2022 module resolution, and React JSX transforms.
- `vite.config.ts`: Vite build configuration integrating Tailwind CSS plugin and path aliases.
- `.env.example`: Safe environment configuration template with zero exposed secrets.
- `metadata.json`: Google AI Studio applet manifest declaring name, description, frame permissions, and major capabilities.
- `.gitignore`: Configured to exclude `node_modules/`, `dist/`, `.env*`, and build logs.

---

## 6. Data Assets Reference (`/data`)

- `data/clean_jobs.csv`: Primary dataset containing 1,048 verified tech job postings with titles, company names, locations, salaries, source URLs, and requirements.
- `data/db_store.json`: Local JSON database storage file holding persisted users, candidate profiles, active applications, ATS reports, and swipes.

---

## 7. Security & Zero-Secrets Isolation Policy

Swipe X adheres to strict zero-secret exposure policies:
1. **Server-Side Isolation**: `GEMINI_API_KEY`, `JWT_SECRET`, and `MONGODB_URI` are exclusively referenced on the Node.js server runtime.
2. **No Bundled Keys**: No client-side files (`/src/*`) contain API keys or `VITE_` prefixed environment variables.
3. **Password Security**: Passwords are saved exclusively as salted BCrypt hashes and are omitted from all API serialization payloads.
4. **Resilient Fallback**: If external API keys are omitted, Swipe X automatically falls back to internal algorithmic scoring without degrading functionality.
