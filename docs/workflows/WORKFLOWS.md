# End-to-End Candidate Workflows & Interaction Sequences

This document illustrates the candidate user journeys and system interactions across Swipe X.

---

## 🧭 Workflow 1: Instant Onboarding & Demo Activation

```
Candidate Browser                       Express Backend API                     Local DB / Store
       │                                         │                                      │
       │─── Click "Launch Live Swipe Hub" ──────►│                                      │
       │    POST /api/auth/demo-login            │                                      │
       │                                         │─── Check if demo user exists ───────►│
       │                                         │◄── Returns demo user & profile ──────│
       │                                         │                                      │
       │                                         │─── Auto-attaches parsed resume ─────►│
       │                                         │                                      │
       │◄── Returns JWT Token + User Object ─────│                                      │
       │                                         │                                      │
       │─── Stores Token in localStorage ────────│                                      │
       │─── Redirects to /swipe ────────────────►│                                      │
```

---

## 📄 Workflow 2: Resume Ingestion & AI Extraction

```
Candidate Browser                       Express Backend API                     Gemini AI SDK
       │                                         │                                     │
       │─── Uploads PDF/DOCX (or Demo Load) ────►│                                     │
       │    POST /api/resumes/upload             │                                     │
       │                                         │─── Checks for GEMINI_API_KEY ───────│
       │                                         │                                     │
       │                                         │─── (If Key Present) ───────────────►│
       │                                         │    Prompt gemini-3.7-flash          │
       │                                         │    with strict JSON Schema          │
       │                                         │                                     │
       │                                         │◄── Returns structured JSON ─────────│
       │                                         │    (Skills, Exp, Edu, Strengths)    │
       │                                         │                                     │
       │                                         │─── (If Offline Fallback) ───────────│
       │                                         │    Execute regex/NLP tokenization   │
       │                                         │                                     │
       │                                         │─── Persist to db.resumeData ────────►
       │                                         │─── Sync skills to candidateProfile ─►
       │                                         │                                     │
       │◄── Returns Parsed Resume Data ──────────│                                     │
       │─── Displays Skills & Timeline on UI ────│                                     │
```

---

## ⚡ Workflow 3: Swipe Matching & Behavioral Feedback Loop

```
Candidate Browser                       Express Backend API             Recommendation Engine
       │                                         │                                     │
       │─── GET /api/recommendations ───────────►│                                     │
       │                                         │─── Fetch unswiped jobs ────────────►│
       │                                         │─── Apply Cosine Match Formula ─────►│
       │                                         │─── Apply Behavioral Multipliers ───►│
       │                                         │                                     │
       │◄── Returns Top 10 Ranked Job Cards ─────│                                     │
       │                                         │                                     │
       │─── Candidate Drags Card Right (MATCH) ─►│                                     │
       │    POST /api/swipes {"decision":"RIGHT"}│                                     │
       │                                         │─── Record swipe in db.swipes ───────►
       │                                         │─── Boost skill affinity weights ────►
       │                                         │                                     │
       │─── Card Animates Off Screen ────────────│                                     │
       │─── Next Card Elevates Smoothly ─────────│                                     │
```

---

## 🎯 Workflow 4: Pre-Flight ATS Audit & 1-Click Application

```
Candidate Browser                       Express Backend API               ATS Analyzer Engine
       │                                         │                                     │
       │─── Clicks "Apply with ATS Scan" ───────►│                                     │
       │    POST /api/ats/analyze {jobId}        │                                     │
       │                                         │─── Load candidate active resume ───►│
       │                                         │─── Run 5-Factor Weighted Formula ──►│
       │                                         │    (Skills 35%, Keywords 25%,       │
       │                                         │     Exp 20%, Edu 10%, Title 10%)    │
       │                                         │                                     │
       │◄── Returns 0-100% Score & Report ───────│                                     │
       │                                         │                                     │
       │─── Candidate Inspects Breakdown & Tips ─│                                     │
       │─── Clicks "Confirm & Submit App" ──────►│                                     │
       │    POST /api/applications               │                                     │
       │                                         │─── Creates Application Record ─────►│
       │                                         │    with Status "APPLIED" & Score    │
       │                                         │                                     │
       │◄── Returns 201 Created Application ─────│                                     │
       │─── Triggers Confetti Celebration! ──────│                                     │
       │─── Live Pipeline Tracker Updated ───────│                                     │
```
