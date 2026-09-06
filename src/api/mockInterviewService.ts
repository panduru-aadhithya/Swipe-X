import { MockInterviewSession, MockInterviewQuestion, UserGamification } from '../types';

const STORAGE_KEY_XP = 'mock_ai_gamification_state';
const STORAGE_KEY_SESSIONS = 'mock_ai_interview_sessions';

const DEFAULT_GAMIFICATION: UserGamification = {
  level: 4,
  levelTitle: 'Senior Full Stack Candidate',
  xp: 1850,
  nextLevelXp: 2500,
  streakDays: 5,
  mockInterviewsCompleted: 6,
  resumesScanned: 12,
  rolesApplied: 9,
  marketReadinessIndex: 94,
  badges: [
    {
      id: 'b1',
      name: 'First ATS 90+',
      icon: '🛡️',
      description: 'Achieved 90%+ ATS resume score on top market roles',
      unlockedAt: '2 days ago'
    },
    {
      id: 'b2',
      name: 'STAR Storyteller',
      icon: '🎙️',
      description: 'Mastered 5 STAR behavioral interview scenarios with AI feedback',
      unlockedAt: '1 day ago'
    },
    {
      id: 'b3',
      name: 'Fast-Track Applicant',
      icon: '⚡',
      description: 'Applied to 3 early-open roles in under 24 hours',
      unlockedAt: 'Today'
    },
    {
      id: 'b4',
      name: 'System Architect',
      icon: '🏗️',
      description: 'Scored 95% on high-scale distributed architecture interview',
      unlockedAt: '3 days ago'
    }
  ]
};

export const getGamificationState = (): UserGamification => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_XP);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return DEFAULT_GAMIFICATION;
};

export const addXp = (amount: number, reason?: string): UserGamification => {
  const current = getGamificationState();
  const newXp = current.xp + amount;
  let newLevel = current.level;
  let newLevelTitle = current.levelTitle;
  let newNextLevelXp = current.nextLevelXp;

  if (newXp >= current.nextLevelXp) {
    newLevel += 1;
    newNextLevelXp = Math.floor(current.nextLevelXp * 1.4);
    if (newLevel === 5) newLevelTitle = 'Principal Candidate';
    if (newLevel >= 6) newLevelTitle = 'Staff Lead Candidate';
  }

  const updated: UserGamification = {
    ...current,
    xp: newXp,
    level: newLevel,
    levelTitle: newLevelTitle,
    nextLevelXp: newNextLevelXp,
    marketReadinessIndex: Math.min(99, current.marketReadinessIndex + 1)
  };

  try {
    localStorage.setItem(STORAGE_KEY_XP, JSON.stringify(updated));
  } catch (e) {}

  return updated;
};

// Preset high-yield role questions for Swipe X Job Market Flow
export const getQuestionsForRole = (roleTitle: string, company?: string): MockInterviewQuestion[] => {
  const isAi = /ai|ml|machine learning|data scientist|llm/i.test(roleTitle);
  const isFrontend = /frontend|react|ui|web|full stack/i.test(roleTitle);
  const isBackend = /backend|node|go|cloud|system|distributed/i.test(roleTitle);

  if (isAi) {
    return [
      {
        id: 'q1',
        question: `How would you architect a production RAG (Retrieval-Augmented Generation) pipeline for ${company || 'our enterprise'} with strict latency (<200ms) and low hallucination bounds?`,
        category: 'SYSTEM_DESIGN',
        difficulty: 'Hard',
        starGuidance: 'Discuss vector embedding model selection, hybrid keyword/dense search reranking, cache warming, and guardrail evaluation.',
        hints: ['Mention chunking strategies', 'Discuss reranker models like Cohere or BGE', 'Cover confidence scoring before generation'],
        expectedKeyPoints: ['Chunking & overlap strategies', 'Vector index indexing (HNSW/IVF)', 'Cross-encoder reranking', 'Ground truth guardrails']
      },
      {
        id: 'q2',
        question: 'Tell me about a time when an ML model or AI integration behaved unpredictably in production. How did you diagnose and mitigate the failure?',
        category: 'BEHAVIORAL',
        difficulty: 'Medium',
        starGuidance: 'Use the STAR format: Situation, Task, Action (monitoring, telemetry, fallback strategy), and Result (uptime restored, latency dropped).',
        hints: ['Focus on telemetry logs & tracing', 'Highlight graceful fallback or circuit breaker', 'Quantify recovery impact']
      },
      {
        id: 'q3',
        question: 'How do you optimize LLM inference token throughput and control API billing costs for high-volume consumer traffic?',
        category: 'TECHNICAL',
        difficulty: 'Medium',
        starGuidance: 'Cover semantic prompt caching, smaller specialized models (Flash/Distil), token compression, and streaming responses.',
        hints: ['Discuss semantic cache (Redis)', 'Model tiering (flash vs pro)', 'Asynchronous batching']
      }
    ];
  }

  if (isFrontend) {
    return [
      {
        id: 'q1',
        question: `How do you structure and optimize a complex, real-time React application at ${company || 'a high-scale product company'} to prevent unnecessary re-renders and maintain 60fps interaction?`,
        category: 'TECHNICAL',
        difficulty: 'Medium',
        starGuidance: 'Address component memoization boundaries, virtualization of large lists, Web Worker offloading, and state colocation.',
        hints: ['Mention React DevTools profiler', 'Windowing/Virtualization (TanStack Virtual)', 'Selective subscription with Zustand/Jotai'],
        expectedKeyPoints: ['State colocation', 'Virtual scrolling for infinite feeds', 'Memoization & stable callbacks', 'Bundle code-splitting']
      },
      {
        id: 'q2',
        question: 'Describe a challenging UI/UX performance or accessibility issue you encountered and how you solved it.',
        category: 'BEHAVIORAL',
        difficulty: 'Medium',
        starGuidance: 'Use STAR: Outline the slow page/feature, your audit metrics (Lighthouse, INP, FCP), your refactoring actions, and the measurable outcome.',
        hints: ['Quantify improvement (e.g. INP dropped from 350ms to 45ms)', 'Mention screen-reader keyboard accessibility']
      },
      {
        id: 'q3',
        question: 'How would you architect an offline-first state synchronization engine with optimistic UI updates and conflict resolution?',
        category: 'SYSTEM_DESIGN',
        difficulty: 'Hard',
        starGuidance: 'Discuss IndexedDB local storage, mutation queue, rollback mechanisms for failed network requests, and CRDT / timestamp versioning.',
        hints: ['Optimistic mutation rollbacks', 'Exponential backoff retry', 'Local persistence layer']
      }
    ];
  }

  // Default Full-Stack / Backend
  return [
    {
      id: 'q1',
      question: `Walk me through how you would design a high-throughput job application ingestion and real-time candidate ranking system for ${company || 'Swipe X'}.`,
      category: 'SYSTEM_DESIGN',
      difficulty: 'Hard',
      starGuidance: 'Break down API Gateway, message queues (Kafka/RabbitMQ), async worker pools for ATS parsing, vector embeddings for job matching, and Redis caching.',
      hints: ['Separate ingestion from background parsing', 'Handle spike traffic with queues', 'Cache hot job postings in Redis']
    },
    {
      id: 'q2',
      question: 'Tell me about a complex technical disagreement you had with a teammate or stakeholder. How did you navigate the conversation to an optimal outcome?',
      category: 'BEHAVIORAL',
      difficulty: 'Medium',
      starGuidance: 'Structure with STAR: Focus on data-driven benchmarking, empathetic active listening, prototyping alternatives, and shared alignment on business goals.',
      hints: ['Never blame the other party', 'Show humility & empirical testing', 'Emphasize the business result']
    },
    {
      id: 'q3',
      question: 'How do you handle database concurrency, idempotency, and transactional consistency in a distributed microservices environment?',
      category: 'TECHNICAL',
      difficulty: 'Hard',
      starGuidance: 'Explain idempotent request keys, optimistic locking with version columns, distributed transactions (Saga pattern), and event-driven architectures.',
      hints: ['Idempotency keys on POST requests', 'Optimistic vs pessimistic locking', 'Saga pattern vs 2PC']
    }
  ];
};

export const evaluateAnswer = async (
  question: MockInterviewQuestion,
  answer: string
): Promise<NonNullable<MockInterviewQuestion['feedback']>> => {
  const wordCount = answer.trim().split(/\s+/).length;
  
  // Intelligent evaluation algorithm
  const hasStarStructure = /situation|task|action|result|when i|we needed|i implemented|as a result|increased|reduced|achieved|improved/i.test(answer);
  const hasMetrics = /\d+%|\$\d+|\d+x|\d+ms|saved|scaled|optimized|decreased|accelerated/i.test(answer);
  const mentionsTech = /react|node|typescript|database|api|cache|latency|architecture|queue|pipeline|llm|performance|test|docker|system/i.test(answer);

  let clarity = 75;
  let depth = 70;
  let impact = 68;

  if (wordCount > 60) clarity += 10;
  if (wordCount > 120) depth += 12;
  if (hasStarStructure) {
    clarity += 8;
    impact += 12;
  }
  if (hasMetrics) impact += 15;
  if (mentionsTech) depth += 14;

  clarity = Math.min(98, clarity);
  depth = Math.min(96, depth);
  impact = Math.min(97, impact);
  const overall = Math.round((clarity * 0.3) + (depth * 0.4) + (impact * 0.3));

  const strengths: string[] = [];
  if (hasStarStructure) strengths.push('Excellent contextual narrative following structured problem-solving');
  if (hasMetrics) strengths.push('High-impact articulation with quantifiable outcomes');
  if (mentionsTech) strengths.push('Strong domain-specific technical depth and terminology');
  if (strengths.length === 0) strengths.push('Clear and direct communication of core ideas');

  const suggestions: string[] = [];
  if (!hasMetrics) suggestions.push('Incorporate specific metrics or business KPIs (e.g. "% latency reduced" or "$ cost saved")');
  if (!hasStarStructure) suggestions.push('Structure your answer cleanly using the Situation -> Task -> Action -> Result (STAR) framework');
  if (wordCount < 50) suggestions.push('Elaborate further on trade-offs and alternative solutions you evaluated');

  return {
    clarityScore: clarity,
    depthScore: depth,
    impactScore: impact,
    overallScore: overall,
    keyStrengths: strengths,
    improvementSuggestions: suggestions,
    sampleStarAnswer: `Situation: In our previous production environment, we needed to handle high concurrency during market peaks.
Task: As lead engineer, I was responsible for cutting P99 latency while maintaining high precision.
Action: I implemented Redis semantic caching with async worker queues and decoupled compute-heavy extraction tasks.
Result: Reduced API response latency by 68% (from 420ms to 134ms) and handled 10x traffic spikes with zero downtime.`
  };
};
