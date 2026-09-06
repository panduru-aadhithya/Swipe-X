# Swipe X — REST API Specification

**Base URL**: `http://localhost:3000/api`  
**Authentication**: Bearer Token via HTTP Header `Authorization: Bearer <jwt_token>`

---

## 📑 Table of Endpoints

1. [Authentication (`/api/auth`)](#1-authentication)
2. [Candidate & Profile (`/api/candidates`, `/api/profile`)](#2-candidate--profile)
3. [Resume Services (`/api/resumes`)](#3-resume-services)
4. [ATS Auditing (`/api/ats`)](#4-ats-auditing)
5. [Jobs & Search (`/api/jobs`)](#5-jobs--search)
6. [Recommendations (`/api/recommendations`)](#6-recommendations)
7. [Swipes & Decisions (`/api/swipes`)](#7-swipes--decisions)
8. [Saved Jobs (`/api/saved-jobs`)](#8-saved-jobs)
9. [Applications (`/api/applications`)](#9-applications)

---

## 1. Authentication

### `POST /api/auth/register`
Creates a new candidate account.
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "candidate@example.com",
    "password": "SecurePassword123",
    "name": "Alex Morgan",
    "preferredRole": "Senior Full Stack Engineer"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_99812",
      "email": "candidate@example.com",
      "name": "Alex Morgan",
      "role": "CANDIDATE"
    },
    "candidate": {
      "id": "cand_12345",
      "userId": "usr_99812",
      "name": "Alex Morgan",
      "email": "candidate@example.com",
      "preferredRole": "Senior Full Stack Engineer",
      "skills": []
    }
  }
  ```

### `POST /api/auth/login`
Authenticates existing credentials.
* **Auth**: None
* **Request Body**:
  ```json
  {
    "email": "candidate@example.com",
    "password": "SecurePassword123"
  }
  ```
* **Response `200 OK`**: (Same structure as Register).

### `POST /api/auth/demo-login`
Instant login for pre-configured demo account (*Alex Morgan*).
* **Auth**: None
* **Response `200 OK`**: Returns token and full candidate data.

### `GET /api/auth/me`
Retrieves authenticated user details.
* **Auth**: Bearer Token required
* **Response `200 OK`**: Returns user entity.

---

## 2. Candidate & Profile

### `GET /api/profile` (or `GET /api/candidates`)
Returns candidate profile, skills, and target compensation.
* **Auth**: Bearer Token required
* **Response `200 OK`**:
  ```json
  {
    "id": "cand_12345",
    "userId": "usr_99812",
    "name": "Alex Morgan",
    "email": "alex.morgan@swipe-x.ai",
    "phone": "(555) 234-5678",
    "location": "San Francisco, CA (Remote)",
    "preferredRole": "Senior Full Stack & AI Engineer",
    "preferredWorkType": "Remote",
    "targetSalary": 165000,
    "skills": ["TypeScript", "React", "Node.js", "Python", "Docker", "AWS", "PostgreSQL"],
    "experienceYears": 5,
    "summary": "Experienced Full Stack Engineer specializing in TypeScript, React, and generative AI systems."
  }
  ```

### `PUT /api/profile`
Updates profile parameters.
* **Auth**: Bearer Token required
* **Request Body**: Partial or full candidate profile fields.
* **Response `200 OK`**: Updated candidate object.

### `GET /api/candidates/dashboard`
Returns aggregated candidate metrics.
* **Auth**: Bearer Token required
* **Response `200 OK`**:
  ```json
  {
    "totalSwipes": 42,
    "rightSwipes": 15,
    "savedJobsCount": 8,
    "activeApplicationsCount": 4,
    "averageAtsScore": 88,
    "profileCompletionScore": 95,
    "recentActivity": [
      {
        "type": "APPLICATION",
        "title": "Applied to Senior React Engineer at Stripe",
        "timestamp": "2026-08-30T03:45:00.000Z"
      }
    ]
  }
  ```

---

## 3. Resume Services

### `POST /api/resumes/upload`
Uploads and parses a candidate resume file.
* **Auth**: Bearer Token required
* **Content-Type**: `multipart/form-data`
* **Form Field**: `file` (PDF, DOCX, TXT $\le$ 10MB)
* **Response `200 OK`**:
  ```json
  {
    "resume": {
      "id": "res_8761",
      "fileName": "Alex_Morgan_Resume.pdf",
      "parsingStatus": "PARSED"
    },
    "resumeData": {
      "skills": ["React", "TypeScript", "Node.js", "Python", "Docker", "PostgreSQL"],
      "experience": [
        {
          "title": "Senior Software Engineer",
          "company": "Tech Innovations Inc",
          "startDate": "2022-01",
          "endDate": "Present",
          "achievements": ["Architected microservices handling 50k req/sec"]
        }
      ],
      "education": [
        {
          "degree": "B.S. in Computer Science",
          "institution": "University of California, Berkeley",
          "graduationYear": 2021
        }
      ],
      "atsReadinessScore": 92,
      "strengths": ["Clear quantifiable metrics", "Comprehensive modern tech stack"],
      "areasForImprovement": ["Add cloud certification details"]
    }
  }
  ```

### `POST /api/resumes/demo-load`
Attaches pre-parsed demo resume to the active candidate profile.
* **Auth**: Bearer Token required
* **Response `200 OK`**: Returns parsed demo resume data.

### `GET /api/resumes/active`
Retrieves active parsed resume entity.
* **Auth**: Bearer Token required

---

## 4. ATS Auditing

### `POST /api/ats/analyze`
Executes deep ATS compatibility analysis for a given job.
* **Auth**: Bearer Token required
* **Request Body**:
  ```json
  {
    "jobId": "job_341"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "id": "ats_rep_9912",
    "jobId": "job_341",
    "atsScore": 89,
    "skillScore": 92,
    "keywordScore": 85,
    "experienceScore": 95,
    "educationScore": 90,
    "titleScore": 85,
    "matchedSkills": ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
    "missingSkills": ["GraphQL", "Terraform"],
    "recommendations": [
      "Explicitly mention experience with GraphQL schema design in your summary.",
      "Highlight infrastructure provisioning experience to boost keyword density."
    ],
    "createdAt": "2026-08-30T04:00:00.000Z"
  }
  ```

### `GET /api/ats/reports`
Returns all historical ATS reports for candidate.
* **Auth**: Bearer Token required

---

## 5. Jobs & Search

### `GET /api/jobs`
Search and filter verified job database (1,048 records).
* **Query Parameters**:
  - `q`: Search keyword (title, company, description)
  - `workType`: `Remote`, `Hybrid`, `On-site`
  - `minSalary`: Minimum annual salary (e.g. `120000`)
  - `page`: Page number (default: `1`)
  - `limit`: Results per page (default: `20`)
  - `sortBy`: `match` (requires Auth), `salary`, `newest`
* **Response `200 OK`**:
  ```json
  {
    "jobs": [
      {
        "id": "job_1",
        "title": "Senior Frontend Engineer",
        "company": "Vercel",
        "location": "San Francisco, CA (Remote)",
        "workType": "Remote",
        "salaryMin": 150000,
        "salaryMax": 195000,
        "requiredSkills": ["React", "TypeScript", "Next.js", "Tailwind CSS"],
        "description": "We are seeking a talented Senior Frontend Engineer...",
        "source": "Greenhouse",
        "url": "https://vercel.com/careers"
      }
    ],
    "total": 1048,
    "page": 1,
    "totalPages": 53
  }
  ```

### `GET /api/jobs/:id`
Retrieves single job posting details.

---

## 6. Recommendations

### `GET /api/recommendations`
Fetches personalized AI swipe feed.
* **Auth**: Bearer Token required
* **Query Parameters**: `limit` (default: `10`)
* **Response `200 OK`**:
  ```json
  {
    "recommendations": [
      {
        "job": { "id": "job_88", "title": "Staff Full Stack Engineer", ... },
        "matchScore": 94,
        "matchReasons": [
          "92% skill overlap (TypeScript, React, Node.js)",
          "Matches your Remote work preference",
          "Salary ($170k - $210k) exceeds your target ($165k)"
        ]
      }
    ]
  }
  ```

---

## 7. Swipes & Decisions

### `POST /api/swipes`
Records candidate swipe action.
* **Auth**: Bearer Token required
* **Request Body**:
  ```json
  {
    "jobId": "job_88",
    "decision": "RIGHT" // "LEFT" | "RIGHT" | "SAVE"
  }
  ```
* **Response `200 OK`**:
  ```json
  {
    "success": true,
    "swipeId": "sw_4910",
    "decision": "RIGHT"
  }
  ```

---

## 8. Saved Jobs

### `GET /api/saved-jobs`
Returns list of candidate bookmarked roles.
* **Auth**: Bearer Token required

### `POST /api/saved-jobs`
Bookmarks a job (`{ "jobId": "job_88" }`).

### `DELETE /api/saved-jobs/:jobId`
Removes bookmark.

---

## 9. Applications

### `POST /api/applications`
Submits 1-click candidate application.
* **Auth**: Bearer Token required
* **Request Body**:
  ```json
  {
    "jobId": "job_88",
    "note": "Excited about this opportunity!"
  }
  ```
* **Response `201 Created`**:
  ```json
  {
    "id": "app_5541",
    "candidateProfileId": "cand_12345",
    "jobId": "job_88",
    "status": "APPLIED",
    "atsScore": 91,
    "appliedDate": "2026-08-30T04:05:00.000Z",
    "statusHistory": [
      { "status": "APPLIED", "timestamp": "2026-08-30T04:05:00.000Z", "note": "Application submitted via 1-click apply." }
    ]
  }
  ```

### `PATCH /api/applications/:id/status`
Updates candidate application pipeline status.
* **Auth**: Bearer Token required
* **Request Body**:
  ```json
  {
    "status": "INTERVIEW", // "APPLIED" | "REVIEWING" | "INTERVIEW" | "OFFER" | "REJECTED"
    "note": "Technical screening scheduled for Friday"
  }
  ```
