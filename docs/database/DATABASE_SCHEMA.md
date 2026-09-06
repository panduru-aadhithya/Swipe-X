# Database Schema & Data Models

Swipe X utilizes an in-memory high-throughput repository pattern coupled with debounced atomic JSON persistence (`/data/db_store.json`) and automated CSV ingestion (`/data/clean_jobs.csv`).

---

## 📊 Entity Relationship Diagram

```
┌─────────────────┐       1:1       ┌─────────────────────┐
│      User       ├─────────────────┤  CandidateProfile   │
│ (Auth Account)  │                 │ (Preferences, Skills│
└────────┬────────┘                 └──────────┬──────────┘
         │                                     │
         │ 1:N                                 │ 1:N
         ▼                                     ├────────────────────────┐
┌─────────────────┐                            │                        │
│     Resume      │                            ▼                        ▼
│  (Uploaded Doc) │                    ┌──────────────┐         ┌───────────────┐
└────────┬────────┘                    │  SwipeRecord │         │   SavedJob    │
         │ 1:1                         │ (LEFT/RIGHT) │         │ (Bookmarked)  │
         ▼                             └──────────────┘         └───────────────┘
┌─────────────────┐                            │                        │
│   ResumeData    │                            │                        │
│ (Parsed Skills) │                            │                        │
└────────┬────────┘                            │                        │
         │                                     │                        │
         │ 1:N                                 ▼                        ▼
         │                             ┌────────────────────────────────────────┐
         └────────────────────────────►│                  Job                   │
                                       │        (1,048 Verified Roles)          │
                                       └──────────────────┬─────────────────────┘
                                                          │ 1:N
                                                          ▼
                                               ┌────────────────────┐
                                               │    Application     │
                                               │ (Status & Pipeline)│
                                               └────────────────────┘
```

---

## 🗄️ Collection Schemas

### 1. `User` Collection (`db.users`)
Stores core authentication accounts.

```typescript
interface User {
  id: string;              // Primary key, e.g. "usr_1740889200000"
  email: string;           // Unique email address
  passwordHash: string;    // BCrypt salted password hash
  name: string;            // Candidate display name
  role: 'CANDIDATE' | 'ADMIN';
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
}
```

### 2. `CandidateProfile` Collection (`db.candidates`)
Contains user matching preferences, technical competency tags, and career goals.

```typescript
interface CandidateProfile {
  id: string;                      // Primary key, e.g. "cand_1740889200000"
  userId: string;                  // Foreign key -> User.id
  name: string;
  email: string;
  phone?: string;
  location?: string;
  preferredRole: string;           // Target role title (e.g. "Senior Full Stack Engineer")
  preferredWorkType: 'Remote' | 'Hybrid' | 'On-site' | 'Any';
  targetSalary: number;            // Annual USD target
  skills: string[];                // Active technical skills array
  experienceYears: number;
  summary?: string;
  profileCompletionScore: number;  // 0 - 100 percentage
  createdAt: string;
  updatedAt: string;
}
```

### 3. `Resume` & `ResumeData` Collections (`db.resumes`, `db.resumeData`)
Stores raw document metadata and structured AI-extracted entities.

```typescript
interface Resume {
  id: string;                      // Primary key
  userId: string;
  candidateProfileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  rawText?: string;
  parsingStatus: 'PENDING' | 'PARSED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

interface ResumeData {
  id: string;
  resumeId: string;                // Foreign key -> Resume.id
  candidateProfileId: string;      // Foreign key -> CandidateProfile.id
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    degree: string;
    fieldOfStudy: string;
    institution: string;
    graduationYear?: number;
  }>;
  projects?: Array<{
    title: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications?: string[];
  atsReadinessScore: number;       // 0 - 100
  strengths: string[];
  areasForImprovement: string[];
  createdAt: string;
  updatedAt: string;
}
```

### 4. `Job` Collection (`db.jobs`)
Stores production-verified jobs ingested from `/data/clean_jobs.csv`.

```typescript
interface Job {
  id: string;                      // Primary key (e.g. "job_1")
  title: string;                   // Job title (e.g. "Senior React Engineer")
  company: string;                 // Hiring company (e.g. "Stripe")
  location: string;                // Location string (e.g. "San Francisco, CA")
  workType: 'Remote' | 'Hybrid' | 'On-site';
  salaryMin: number;               // Annual base minimum in USD
  salaryMax: number;               // Annual base maximum in USD
  salaryFormatted: string;         // e.g. "$160k - $210k"
  requiredSkills: string[];        // Extracted technical requirements
  experienceRequiredYears?: number;
  educationLevel?: string;
  description: string;
  source: string;                  // Source portal (LinkedIn, Greenhouse, Lever)
  url: string;                     // Application / Posting URL
  postedDate: string;
  createdAt: string;
}
```

### 5. `ATSReport` Collection (`db.atsReports`)
Stores generated multi-factor ATS audit reports.

```typescript
interface ATSReport {
  id: string;                      // Primary key
  candidateProfileId: string;
  resumeId: string;
  jobId: string;
  atsScore: number;                // 0 - 100 composite score
  skillScore: number;              // 0 - 100
  keywordScore: number;            // 0 - 100
  experienceScore: number;         // 0 - 100
  educationScore: number;          // 0 - 100
  titleScore: number;              // 0 - 100
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  createdAt: string;
}
```

### 6. `SwipeRecord`, `SavedJob`, and `Application` Collections
```typescript
interface SwipeRecord {
  id: string;
  candidateProfileId: string;
  jobId: string;
  decision: 'LEFT' | 'RIGHT' | 'SAVE';
  createdAt: string;
}

interface SavedJob {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: Job;
  savedAt: string;
}

interface Application {
  id: string;
  candidateProfileId: string;
  jobId: string;
  job: Job;
  resumeId: string;
  atsReportId?: string;
  atsScore?: number;
  note?: string;
  status: 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
  appliedDate: string;
  updatedDate: string;
  statusHistory: Array<{
    status: 'APPLIED' | 'REVIEWING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';
    timestamp: string;
    note?: string;
  }>;
}
```
