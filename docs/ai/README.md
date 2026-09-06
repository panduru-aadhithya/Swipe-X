# AI Subsystem & Algorithmic Engines

Swipe X features a multi-tiered AI architecture designed to provide accurate resume extraction, realistic ATS applicant scoring, and adaptive job recommendations.

---

## 🧠 Architectural Components

```
                    ┌─────────────────────────┐
                    │    Gemini AI Client     │
                    │  (gemini-3.7-flash SDK) │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐   ┌───────────────────┐   ┌──────────────────┐
│  Resume Parser   │   │   ATS Analyzer    │   │  Recommendation  │
│     Service      │   │      Service      │   │      Engine      │
└──────────────────┘   └───────────────────┘   └──────────────────┘
```

---

## 1. Google Gemini AI Integration

### Client Setup (`backend/src/ai/geminiClient.ts`)
* Utilizes the official `@google/genai` TypeScript SDK:
  ```typescript
  import { GoogleGenAI } from '@google/genai';
  import { config } from '../config/env';

  export function getGeminiClient(): GoogleGenAI | null {
    if (!config.geminiApiKey) return null;
    return new GoogleGenAI({ apiKey: config.geminiApiKey });
  }
  ```
* **Model Alias**: `gemini-3.7-flash` is used for high-speed, cost-effective inference and native JSON schema extraction.
* **Server-Side Protection**: The API key is stored strictly in server-side environment variables and is never transmitted to the browser client.

---

## 2. Resume Parsing Engine (`backend/src/ai/resumeParser/resumeParserService.ts`)

### Primary Mode (Gemini AI Extraction)
When `GEMINI_API_KEY` is present, the service prompts `gemini-3.7-flash` using a strict JSON output constraint:

```
You are an expert Technical Recruiter and ATS parser. 
Analyze the provided resume document and return a strictly structured JSON response matching the following schema:
- name: string
- email: string
- phone: string
- location: string
- summary: string
- skills: string[] (normalized technical and domain skills)
- experience: Array<{ title, company, location, startDate, endDate, current, description, achievements }>
- education: Array<{ degree, fieldOfStudy, institution, graduationYear }>
- certifications: string[]
- atsReadinessScore: number (0-100 initial score based on formatting and quantifiable achievements)
- strengths: string[]
- areasForImprovement: string[]
```

### Heuristic Fallback Mode
If offline or without an API key, an intelligent regex & NLP tokenization parser extracts:
* Technology vocabulary from a dictionary of 150+ software, AI, and DevOps terms (React, Node.js, Python, TypeScript, Docker, Kubernetes, AWS, PostgreSQL, etc.).
* Dates and durations using date-pattern recognition.
* Email and phone patterns with standard RFC regular expressions.
* Calculates ATS Readiness based on presence of action verbs (e.g. *architected*, *reduced*, *optimized*, *built*) and numerical achievements (*%*, *$*, *ms*).

---

## 3. Multi-Factor ATS Compatibility Engine (`backend/src/ai/atsAnalyzer/atsAnalyzerService.ts`)

To simulate enterprise Applicant Tracking Systems (Workday, Greenhouse, Taleo, Lever), Swipe X computes a weighted multi-factor score:

### Mathematical Scoring Formula

$$\text{ATS Score} = (0.35 \times S) + (0.25 \times K) + (0.20 \times E) + (0.10 \times D) + (0.10 \times T)$$

Where:

| Parameter | Metric | Weight | Description |
| :---: | :--- | :---: | :--- |
| **$S$** | **Skills Matrix Score** | **35%** | Jaccard similarity and exact substring matching between candidate skills and job required skills: $$S = \frac{|\text{CandidateSkills} \cap \text{JobSkills}|}{|\text{JobSkills}|} \times 100$$ |
| **$K$** | **Keyword Density Score** | **25%** | Presence of technical terms extracted from the job description found within the candidate's resume summary and experience bullets. |
| **$E$** | **Experience Score** | **20%** | Compares candidate years of experience to role requirements ($E = 100$ if candidate years $\ge$ required years; scaled proportionally otherwise). |
| **$D$** | **Education Score** | **10%** | Verifies presence of requested degree level (Bachelor's, Master's, PhD, or equivalent work experience). |
| **$T$** | **Title Alignment Score** | **10%** | Semantic similarity between candidate's preferred/historical titles and target job title. |

### Generated Report Structure
The resulting `ATSReport` contains:
* **`atsScore`** (0–100 overall composite percentage)
* **`skillScore`**, **`keywordScore`**, **`experienceScore`**, **`educationScore`**, **`titleScore`**
* **`matchedSkills`**: Array of overlapping skills (e.g. `["TypeScript", "React", "Docker"]`)
* **`missingSkills`**: Critical requirements absent in candidate profile (e.g. `["Kubernetes", "GraphQL"]`)
* **`recommendations`**: Bulleted recommendations on how to rephrase or optimize the resume for this specific opening.

---

## 4. Vector / Cosine Job Matcher (`backend/src/ai/jobMatcher/jobMatcherService.ts`)

Calculates instant compatibility between a candidate profile and any job posting:
* Builds token vectors representing candidate skills + experience versus job requirements.
* Computes cosine similarity:
  $$\text{Cosine}(\vec{u}, \vec{v}) = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}$$
* Produces the instant match percentage displayed on Swipe Cards and Job Badges (e.g. `94% Match`).

---

## 5. Behavioral Recommendation Engine (`backend/src/ai/recommendationEngine/recommendationEngineService.ts`)

Provides the feed for the swipe deck with dynamic preference weighting:

1. **Filtering**: Automatically excludes jobs that the candidate has already swiped right, swiped left, or applied to.
2. **Preference Scoring**:
   - Matches candidate's preferred work mode (Remote, Hybrid, Onsite).
   - Matches candidate's target salary against job salary range.
   - Calculates technical skill overlap.
3. **Behavioral Feedback Weighting**:
   - If candidate frequently swipes right on certain skills (e.g. *Golang*, *FastAPI*), the engine applies an affinity multiplier $+15\%$ to subsequent jobs with those tags.
   - If candidate consistently swipes left on specific attributes, a $-10\%$ penalty is applied to de-prioritize similar listings.
4. **Ranking**: Returns sorted array of top jobs with explanation bullets for why each job was recommended.
