import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Mic, 
  MicOff, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  TrendingUp, 
  ChevronRight, 
  ChevronLeft, 
  Lightbulb, 
  Volume2, 
  RotateCcw,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { MockInterviewQuestion, MockInterviewSession } from '../types';
import { getQuestionsForRole, evaluateAnswer, addXp } from '../api/mockInterviewService';

interface MockInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  roleTitle?: string;
  companyName?: string;
  jobId?: string;
  onSessionComplete?: (session: MockInterviewSession) => void;
}

export const MockInterviewModal: React.FC<MockInterviewModalProps> = ({
  isOpen,
  onClose,
  roleTitle = 'Senior Full Stack Engineer',
  companyName = 'Tech Innovations Inc',
  jobId,
  onSessionComplete
}) => {
  const [questions, setQuestions] = useState<MockInterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showStarGuidance, setShowStarGuidance] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Initialize questions
  useEffect(() => {
    if (isOpen) {
      const qList = getQuestionsForRole(roleTitle, companyName);
      setQuestions(qList);
      setCurrentIndex(0);
      setCurrentResponse('');
      setCompleted(false);
      setEarnedXp(0);
      setSeconds(0);
      setTimerActive(true);
    }
  }, [isOpen, roleTitle, companyName]);

  // Timer counter
  useEffect(() => {
    let interval: any = null;
    if (timerActive && !completed) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, completed]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVoiceInputMock = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate live voice transcript
      setTimeout(() => {
        setCurrentResponse((prev) => 
          (prev ? prev + ' ' : '') + 
          "In my previous project, we observed high latency spikes during batch ingestion. I established a Redis caching strategy coupled with BullMQ worker queues, which reduced P99 latency by 54%."
        );
        setIsListening(false);
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentResponse.trim() || !currentQ) return;

    setIsEvaluating(true);
    try {
      const feedback = await evaluateAnswer(currentQ, currentResponse);
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...currentQ,
        userResponse: currentResponse,
        feedback
      };
      setQuestions(updatedQuestions);

      // Check if this was the last question
      if (currentIndex === questions.length - 1) {
        // Calculate totals
        const avgOverall = Math.round(
          updatedQuestions.reduce((acc, q) => acc + (q.feedback?.overallScore || 80), 0) / updatedQuestions.length
        );
        const avgClarity = Math.round(
          updatedQuestions.reduce((acc, q) => acc + (q.feedback?.clarityScore || 80), 0) / updatedQuestions.length
        );
        const avgDepth = Math.round(
          updatedQuestions.reduce((acc, q) => acc + (q.feedback?.depthScore || 80), 0) / updatedQuestions.length
        );
        const avgImpact = Math.round(
          updatedQuestions.reduce((acc, q) => acc + (q.feedback?.impactScore || 80), 0) / updatedQuestions.length
        );

        const xp = 150 + Math.floor(avgOverall * 0.5);
        addXp(xp, `Completed Mock Interview: ${roleTitle}`);
        setEarnedXp(xp);
        setCompleted(true);
        setTimerActive(false);

        if (onSessionComplete) {
          onSessionComplete({
            id: 'session_' + Date.now(),
            roleTitle,
            companyName,
            jobId,
            category: 'ROLE_SPECIFIC',
            questions: updatedQuestions,
            currentQuestionIndex: currentIndex,
            overallScore: avgOverall,
            clarityScore: avgClarity,
            depthScore: avgDepth,
            impactScore: avgImpact,
            xpEarned: xp,
            status: 'COMPLETED',
            completedAt: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentResponse(questions[currentIndex + 1]?.userResponse || '');
      setShowHint(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentResponse(questions[currentIndex - 1]?.userResponse || '');
      setShowHint(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/50 dark:from-indigo-950/20 dark:via-[#0B1120] dark:to-purple-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base sm:text-lg text-slate-900 dark:text-white">
                  Swipe X — Interview Flow
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  Live Simulator
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tailored for <strong className="text-slate-700 dark:text-slate-200">{roleTitle}</strong> at <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{companyName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{formatTimer(seconds)}</span>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {!completed ? (
            <>
              {/* Question Progress & Category */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-serif">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 font-semibold text-[10px] border border-purple-200 dark:border-purple-800">
                    {currentQ?.category || 'TECHNICAL'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 font-semibold text-[10px] border border-amber-200 dark:border-amber-800">
                    {currentQ?.difficulty || 'Medium'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-28 sm:w-40 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 space-y-3">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-serif leading-relaxed">
                  "{currentQ?.question}"
                </h3>

                {/* STAR Guidance Pill */}
                {currentQ?.starGuidance && showStarGuidance && (
                  <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold block mb-0.5">STAR Framework Recommendation:</strong>
                      <span>{currentQ.starGuidance}</span>
                    </div>
                  </div>
                )}

                {/* Hints toggle */}
                {currentQ?.hints && currentQ.hints.length > 0 && (
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowHint(!showHint)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {showHint ? 'Hide Hints' : 'Show AI Key Concept Hints'}
                    </button>
                    {showHint && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {currentQ.hints.map((hint, hIdx) => (
                          <span
                            key={hIdx}
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-700 dark:text-slate-300"
                          >
                            💡 {hint}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Answer Input or Feedback View */}
              {!currentQ?.feedback ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 font-serif flex items-center gap-2">
                      <span>Your Response</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Speak aloud or type your answer)
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleVoiceInputMock}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {isListening ? 'Listening (AI Speech)...' : 'Voice Input'}
                    </button>
                  </div>

                  <textarea
                    rows={5}
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    placeholder="Structure your answer clearly. E.g. 'In my recent role, our system faced a challenge where... I led the initiative to... As a result, we improved...'"
                    className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder-slate-400"
                  />

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      {currentIndex > 0 && (
                        <button
                          type="button"
                          onClick={handlePrev}
                          className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSubmitResponse}
                      disabled={isEvaluating || !currentResponse.trim()}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 disabled:opacity-50 transition-all hover:scale-105"
                    >
                      {isEvaluating ? (
                        <>
                          <Sparkles className="w-4 h-4 animate-spin" /> Evaluating with Swipe X AI...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" /> Evaluate Answer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* Feedback View for current question */
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                          {currentQ.feedback.overallScore}%
                        </div>
                        <div>
                          <span className="font-serif font-black text-sm text-emerald-900 dark:text-emerald-200">
                            AI Answer Evaluation
                          </span>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Scored across clarity, technical depth, and business impact.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 text-xs">
                        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                          Clarity: {currentQ.feedback.clarityScore}%
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold">
                          Depth: {currentQ.feedback.depthScore}%
                        </span>
                      </div>
                    </div>

                    {/* Key Strengths */}
                    <div className="space-y-1.5">
                      <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 font-serif">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths Identified
                      </h5>
                      <ul className="space-y-1">
                        {currentQ.feedback.keyStrengths.map((st, sIdx) => (
                          <li key={sIdx} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                            <span>•</span>
                            <span>{st}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Improvement suggestions */}
                    {currentQ.feedback.improvementSuggestions.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-emerald-500/20">
                        <h5 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 font-serif">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> Suggestions for Real Interview
                        </h5>
                        <ul className="space-y-1">
                          {currentQ.feedback.improvementSuggestions.map((sug, suIdx) => (
                            <li key={suIdx} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
                              <span>💡</span>
                              <span>{sug}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Navigation controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = [...questions];
                        updated[currentIndex].feedback = undefined;
                        setQuestions(updated);
                      }}
                      className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Re-record / Edit Response
                    </button>

                    {currentIndex < questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                      >
                        Next Question <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCompleted(true)}
                        className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
                      >
                        Complete Session <Award className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Session Completed Summary View */
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center mx-auto shadow-lg text-2xl font-black">
                🏆
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                  Mock Interview Completed!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  You successfully practiced key questions for <strong className="text-slate-800 dark:text-slate-200">{roleTitle}</strong> at <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{companyName}</span>.
                </p>
              </div>

              {/* XP Award Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 max-w-md mx-auto flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 block font-serif">
                      + {earnedXp} Career XP Awarded!
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400">
                      Your AI Market Readiness index increased to 95%.
                    </span>
                  </div>
                </div>
                <span className="text-lg font-black text-amber-600">⚡ +{earnedXp}</span>
              </div>

              {/* Performance Radar Cards */}
              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Clarity</span>
                  <span className="text-lg font-black text-indigo-600 font-serif">92%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tech Depth</span>
                  <span className="text-lg font-black text-purple-600 font-serif">89%</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">STAR Fit</span>
                  <span className="text-lg font-black text-emerald-600 font-serif">94%</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                >
                  Return to Job Market Flow
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
