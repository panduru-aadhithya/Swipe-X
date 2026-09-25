# Frontend Architecture & Component Reference

This document details the frontend architecture, page views, UI components, state management, and styling patterns of Swipe X.

---

## 📁 Frontend Directory Layout

```
src/
├── api/                             # Typed API Client layer
│   ├── client.ts                    # Fetch wrapper with Auth header injection
│   └── index.ts                     # API endpoints catalog
├── components/                      # Reusable UI components
│   ├── ATSScoreGauge.tsx            # Radial/progress ATS breakdown widget
│   ├── ApplyModal.tsx               # 1-Click application submission dialog
│   ├── JobCard.tsx                  # Physics-driven swipe card component
│   ├── Layout.tsx                   # Main navigation & shell layout wrapper
│   ├── MatchBadge.tsx               # Semantic match score pill
│   ├── Navbar.tsx                   # Top navigation bar
│   └── Sidebar.tsx                  # Collapsible desktop/mobile sidebar
├── context/                         # React Context State Providers
│   ├── AuthContext.tsx              # Authentication and user session state
│   └── ThemeContext.tsx             # Dark/Light/System theme provider
├── pages/                           # Primary application views
│   ├── ATSAnalysisPage.tsx          # Real-time ATS auditing interface
│   ├── ApplicationsPage.tsx         # Application tracking pipeline
│   ├── DashboardPage.tsx            # Candidate analytics & metric cards
│   ├── ExploreJobsPage.tsx          # Searchable, filterable job listings
│   ├── JobDetailPage.tsx            # Deep-dive role view & requirements
│   ├── LandingPage.tsx              # Public hero landing page & feature demo
│   ├── LoginPage.tsx                # Candidate authentication & demo login
│   ├── ProfilePage.tsx              # Candidate settings, salary & skill matrix
│   ├── RegisterPage.tsx             # Account creation view
│   ├── ResumePage.tsx               # Resume upload, viewer & AI suggestions
│   ├── SavedJobsPage.tsx            # Bookmarked jobs gallery
│   ├── SettingsPage.tsx             # Appearance & model configuration
│   └── SwipePage.tsx                # Core swipe deck & card gestures
├── App.tsx                          # Route definitions & router configuration
├── index.css                        # Tailwind v4 theme & typography styles
├── main.tsx                         # React entry point
└── types.ts                         # Frontend shared TypeScript interfaces
```

---

## 🎨 Design System & Natural Tones Palette

Swipe X implements an earthy, high-contrast **Natural Tones** visual identity:

| Token Name | Light Mode | Dark Mode | Usage |
| :--- | :---: | :---: | :--- |
| **Canvas Background** | `#F2F0E9` | `#1C231C` | App background, page canvas |
| **Surface / Card** | `#FFFFFF` / `#E9E4D9` | `#252C25` | Elevated cards, dialogs, drawers |
| **Border / Divider** | `#DCD7C9` | `#2E362E` | Card borders, table dividers |
| **Primary Text** | `#2D2926` | `#F2F0E9` | Headings, high-contrast labels |
| **Muted Text** | `#8C867A` | `#A6A092` | Metadata, timestamps, subtitles |
| **Accent Primary** | `#5B6D5B` | `#8FA68F` | Active buttons, swipe right, match tags |
| **Accent Secondary** | `#C29352` | `#D9AC6C` | ATS scores, bookmarks, warnings |
| **Accent Destructive** | `#B86B64` | `#D2857E` | Swipe left (pass), delete buttons |

---

## 📄 Page-by-Page Documentation

### 1. `LandingPage.tsx`
* **Route**: `/`
* **Purpose**: Public marketing page introducing the core value proposition.
* **Features**:
  - Interactive hero preview with live interactive card swipe simulation.
  - "Launch Live Swipe Hub (Demo)" 1-click button to immediately test the platform.
  - 4-Pillar visual walkthrough: Smart Resume Extraction, Verified Job Matching, Real-Time ATS Audit, 1-Click Application.
  - ATS Scoring weight explanation card.

### 2. `SwipePage.tsx`
* **Route**: `/swipe`
* **Purpose**: Core matching interface presenting recommended roles as interactive swipe cards.
* **Features**:
  - Drag gestures powered by `motion/react` with rotation angle reflecting drag offset.
  - Decision buttons: `Pass` (Left / ❌), `Bookmark` (Up / 🔖), `Match / Apply` (Right / 💚).
  - Keyboard shortcuts: `Left Arrow` (Pass), `Right Arrow` (Match), `Up Arrow` (Save).
  - Undo previous swipe capability.
  - Quick filter bar: Work Type (Remote, Hybrid, All), Minimum Salary slider.
  - Empty state with 1-click feed reload.

### 3. `DashboardPage.tsx`
* **Route**: `/dashboard`
* **Purpose**: Executive overview of candidate activity and job search analytics.
* **Features**:
  - Key metrics: Total Swipes, Active Applications, Average ATS Score, Saved Roles.
  - Application pipeline status tracker (Applied → Reviewing → Interview → Offer).
  - Top matched skills radar/bar metrics.
  - Quick actions to resume scan, profile update, or continue swiping.

### 4. `ExploreJobsPage.tsx`
* **Route**: `/jobs`
* **Purpose**: Traditional search and filter directory over all 1,048 jobs.
* **Features**:
  - Keyword search across job titles, company names, and descriptions.
  - Filters: Work Type (Remote, Hybrid, Onsite), Location, Minimum Salary.
  - Sort by: Best AI Match %, Highest Salary, Newest.
  - Instant ATS score preview badge on each card.

### 5. `JobDetailPage.tsx`
* **Route**: `/jobs/:id`
* **Purpose**: Comprehensive view of a single job opportunity.
* **Features**:
  - Role header with verified source link (LinkedIn, Lever, Greenhouse).
  - AI Compatibility analysis highlighting matching points.
  - Extracted technical requirements tags.
  - Full job description text.
  - Bookmark toggle and "Apply with ATS Scan" CTA opening the `ApplyModal`.

### 6. `ATSAnalysisPage.tsx`
* **Route**: `/ats`
* **Purpose**: Dedicated ATS auditing workshop.
* **Features**:
  - Select any saved or applied job to trigger an instant deep audit.
  - Interactive `ATSScoreGauge` displaying overall score and weighted sub-scores (Skills, Keywords, Experience, Education, Title).
  - Matched skills badges vs. Missing keywords tags.
  - AI-generated resume optimization recommendations.
  - Historical audit log with past scan results.

### 7. `ApplicationsPage.tsx`
* **Route**: `/applications`
* **Purpose**: Centralized application tracking hub.
* **Features**:
  - List of all submitted 1-click applications.
  - Interactive status changer (`APPLIED` → `REVIEWING` → `INTERVIEW` → `OFFER` → `REJECTED`).
  - View attached ATS score and submission timestamp.
  - Status history timeline log.

### 8. `SavedJobsPage.tsx`
* **Route**: `/saved`
* **Purpose**: Gallery of bookmarked roles saved during swipe or explore sessions.
* **Features**:
  - Filter and remove saved items.
  - Quick actions to trigger ATS scan or launch 1-click application.

### 9. `ResumePage.tsx`
* **Route**: `/resume`
* **Purpose**: Resume upload and AI extraction manager.
* **Features**:
  - Drag-and-drop / file selector for PDF/DOCX resumes.
  - 1-click "Load Pre-Configured Demo Resume" for instant testing.
  - Extracted skills list with competency chips.
  - Work experience timeline with quantifiable achievement bullets.
  - Education and certifications overview.
  - Initial ATS Readiness score with strengths and suggestions.

### 10. `ProfilePage.tsx`
* **Route**: `/profile`
* **Purpose**: Candidate personal details and matching preferences.
* **Features**:
  - Name, location, phone, professional summary.
  - Preferred job title, target salary (USD), and work mode (Remote/Hybrid/Onsite).
  - Dynamic skill tag manager (add/remove skills that directly influence the recommendation engine).

### 11. `MockInterviewPage.tsx`
* **Route**: `/mock-interview`
* **Purpose**: Dedicated AI STAR Mock Interview Simulator.
* **Features**:
  - Target role selection from saved, applied, or all 1,048 jobs.
  - Dynamically generated behavioral and technical questions customized to the selected role.
  - Web Speech API integration for hands-free audio transcription and structured text answer box.
  - Live session timer for practicing time management.
  - Multi-dimensional evaluation: Clarity Score (0-100), Technical Depth Score (0-100), and STAR Impact Score (0-100), accompanied by constructive feedback and model STAR response.

### 12. `RecruiterDashboardPage.tsx`
* **Route**: `/recruiter`
* **Purpose**: Hiring manager candidate review pipeline and job publishing hub.
* **Features**:
  - Direct job creation modal for publishing new verified opportunities.
  - Pipeline table displaying applicant names, applied roles, pre-flight ATS compatibility scores, and active status.
  - Single-click stage transitions (`REVIEWING`, `INTERVIEWING`, `OFFERED`, `REJECTED`).

### 13. `AdminDashboardPage.tsx`
* **Route**: `/admin`
* **Purpose**: System-wide telemetry command center and user administration.
* **Features**:
  - Live AI latency benchmarks, database health check, and system uptime.
  - User role inspector and accounts directory.
  - Chronological platform audit stream of all swipes, ATS audits, and applications.

### 14. `SwipeHistoryPage.tsx`
* **Route**: `/swipe-history`
* **Purpose**: Audit log of all candidate swipe actions.
* **Features**: Filter by Right (Matches), Left (Passes), or Up (Saved), with timestamps and option to reconsider passed roles.

### 15. `GrowthJourneyPage.tsx`
* **Route**: `/growth-journey`
* **Purpose**: Visual career advancement roadmap.
* **Features**: Visualizes technical skills gaps between junior, mid-level, senior, and lead engineering roles with suggested focus areas.

### 16. `LoginPage.tsx` & `RegisterPage.tsx`
* **Routes**: `/login`, `/register`
* **Features**: Email/password authentication, error alerts, and 1-click demo account loader (Candidate, Recruiter, Admin).

### 17. `SettingsPage.tsx`
* **Route**: `/settings`
* **Features**: Theme switcher (Light / Dark / System), AI Model status indicator, and persistence storage info.

---

## 🧩 UI Component Reference

### `JobCard.tsx`
* **Props**: `job: Job`, `matchScore: number`, `onSwipe: (dir: 'left'|'right'|'save') => void`, `isTopCard: boolean`.
* **Behavior**: Handles touch and mouse drag gestures with `motion.div`, updating rotation angle $\theta = \frac{x}{20}^\circ$ and displaying translucent "MATCH" or "PASS" stamp overlays as drag threshold is approached.

### `ATSScoreGauge.tsx`
* **Props**: `report: ATSReport`.
* **Behavior**: Renders a circular percentage gauge with color coding (Green $\ge 80\%$, Amber $\ge 60\%$, Terracotta $<60\%$) and 5 progress bars for sub-factor scores.

### `ApplyModal.tsx`
* **Props**: `job: Job`, `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void`.
* **Behavior**: Displays ATS compatibility summary, candidate profile snapshot, and optional cover note input. Fires `canvas-confetti` celebration upon submission.

### `JobDetailDrawer.tsx`
* **Props**: `jobId: string | null`, `isOpen: boolean`, `onClose: () => void`.
* **Behavior**: Slide-over drawer offering a quick comprehensive view of any job from Explore or Deck views without navigating away.

### `MockInterviewModal.tsx`
* **Props**: `job: Job`, `isOpen: boolean`, `onClose: () => void`.
* **Behavior**: On-demand mock interview modal triggered directly from a job card or listing.

### `NotificationsModal.tsx`
* **Props**: `isOpen: boolean`, `onClose: () => void`.
* **Behavior**: Displays recent alerts, application status transitions, and newly matched tech roles.

### `MatchBadge.tsx`
* **Props**: `score: number`, `size?: 'sm'|'md'|'lg'`.
* **Behavior**: Renders formatted percentage badge with sparkle icon and contextual color tone.

### `MobileBottomNav.tsx`
* **Behavior**: Fixed bottom navigation for viewports under 1024px with high-contrast active route pills and $\ge 48\text{px}$ touch targets.

### `Layout.tsx`, `Navbar.tsx`, `Sidebar.tsx`
* **Behavior**: Provides responsive widescreen layout framing (up to 1720px), desktop sidebar with 80px top nav, and profile quick switcher.
