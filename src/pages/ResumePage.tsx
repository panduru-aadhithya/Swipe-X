import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  FileText, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Loader2, 
  Plus, 
  X,
  FileCheck,
  ShieldCheck,
  Layers,
  Globe,
  Github,
  Linkedin,
  ExternalLink,
  Check,
  Save,
  ArrowRight,
  Target
} from 'lucide-react';
import { resumeApi, profileApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Resume, ResumeData, ResumeVersion, PortfolioLinks } from '../types';

export const ResumePage: React.FC = () => {
  const { profile, refreshProfile, setHasActiveResume } = useAuth();
  const [searchParams] = useSearchParams();
  const isPromptUpload = searchParams.get('promptUpload') === 'true';

  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadMode, setUploadMode] = useState<'upload' | 'paste' | 'versions'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Portfolio Links state - strictly based on candidate's real profile
  const [links, setLinks] = useState<PortfolioLinks>({
    github: profile?.portfolioLinks?.github || '',
    linkedin: profile?.portfolioLinks?.linkedin || '',
    portfolio: profile?.portfolioLinks?.portfolio || '',
    kaggle: profile?.portfolioLinks?.kaggle || '',
    dribbble: profile?.portfolioLinks?.dribbble || ''
  });
  const [savingLinks, setSavingLinks] = useState(false);

  const loadResumeInfo = async () => {
    setIsLoading(true);
    try {
      const [res, versionsRes] = await Promise.all([
        resumeApi.getActiveResume(),
        resumeApi.getVersions()
      ]);
      if (res && res.resume) {
        setActiveResume(res.resume);
        setResumeData(res.resumeData);
        setHasActiveResume(true);
      } else {
        setHasActiveResume(false);
      }
      setVersions(versionsRes.versions);
    } catch (err) {
      console.error('Failed to load resume info:', err);
      setHasActiveResume(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadResumeInfo();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await resumeApi.uploadFile(file);
      setActiveResume(res.resume);
      setResumeData(res.resumeData);
      setHasActiveResume(true);
      setStatusMessage({ type: 'success', text: `Resume "${file.name}" uploaded and parsed successfully!` });
      await refreshProfile();
      const vRes = await resumeApi.getVersions();
      setVersions(vRes.versions);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to upload and parse resume.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText || pastedText.trim().length < 30) {
      setStatusMessage({ type: 'error', text: 'Please paste sufficient resume text for parsing.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await resumeApi.uploadText(pastedText, 'Pasted_Resume.txt');
      setActiveResume(res.resume);
      setResumeData(res.resumeData);
      setHasActiveResume(true);
      setStatusMessage({ type: 'success', text: 'Resume text parsed and candidate profile updated!' });
      setPastedText('');
      await refreshProfile();
      const vRes = await resumeApi.getVersions();
      setVersions(vRes.versions);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to parse resume text.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchVersion = async (versionId: string) => {
    try {
      setIsProcessing(true);
      await resumeApi.setActiveVersion(versionId);
      await loadResumeInfo();
      await refreshProfile();
      setStatusMessage({ type: 'success', text: 'Active resume version switched successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to switch version' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveLinks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingLinks(true);
      await profileApi.updateProfile({ portfolioLinks: links });
      await refreshProfile();
      setStatusMessage({ type: 'success', text: 'Portfolio and professional links updated!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Failed to update links.' });
    } finally {
      setSavingLinks(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2 tracking-tight">
          <FileText className="w-7 h-7 text-violet-600 dark:text-violet-400" />
          Resume Management & AI Skill Parser
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your resume document, parse technical skills, and unlock real ATS compatibility scoring.
        </p>
      </div>

      {/* Mandatory Resume Upload Prompt Banner (Shown after sign in or if no resume exists) */}
      {(isPromptUpload || !activeResume) && !isLoading && (
        <div className="p-6 rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 backdrop-blur-xs rounded-2xl">
              <UploadCloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full">
                Required Step
              </span>
              <h2 className="text-xl font-bold mt-1">Upload Your Resume to Activate ATS Scoring</h2>
            </div>
          </div>
          <p className="text-sm text-blue-50 max-w-2xl leading-relaxed">
            Welcome to SwipeX! To calculate genuine ATS compatibility scores and match you with tailored jobs, upload your resume below or paste its content. We never use fabricated data.
          </p>
        </div>
      )}

      {/* Post-Upload Next Steps Banner */}
      {activeResume && (
        <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Active Resume: {activeResume.fileName}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Real resume loaded. You are ready to scan jobs for ATS compatibility.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to="/candidate/ats"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Target className="w-3.5 h-3.5" />
              Scan ATS Score
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/candidate/explore"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Explore Jobs
            </Link>
          </div>
        </div>
      )}

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-500/30'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Multiple Versions Section */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
                Resume Versions ({versions.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Switch active version to tailor your AI match algorithm for specific job domains
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {versions.map((ver) => (
            <div
              key={ver.id}
              onClick={() => !ver.isActive && handleSwitchVersion(ver.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                ver.isActive
                  ? 'border-violet-600 dark:border-violet-500 bg-violet-50/40 dark:bg-violet-950/30 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                  {ver.name}
                </span>
                {ver.isActive ? (
                  <span className="px-2 py-0.5 rounded-full bg-violet-600 text-white text-[9px] font-black uppercase font-display">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold hover:underline font-display">
                    Make Active
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {ver.targetRole}
              </p>

              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
                <span>{ver.skillsCount} skills parsed</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{ver.atsReadiness}% ATS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Box / Input Tabs */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setUploadMode('upload')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-colors font-display cursor-pointer ${
                uploadMode === 'upload'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Upload Document (PDF/TXT)
            </button>
            <button
              onClick={() => setUploadMode('paste')}
              className={`px-4 py-2 text-xs font-bold rounded-full transition-colors font-display cursor-pointer ${
                uploadMode === 'paste'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              Paste Raw Resume Text
            </button>
          </div>

          {activeResume && (
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Active File: <strong className="text-slate-800 dark:text-slate-200">{activeResume.fileName}</strong>
            </span>
          )}
        </div>

        {uploadMode === 'upload' ? (
          <label className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-violet-500 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-50/50 dark:bg-slate-900/40 transition-colors group">
            <input
              type="file"
              accept=".pdf,.txt,.docx,.md"
              onChange={handleFileUpload}
              disabled={isProcessing}
              className="sr-only"
            />
            {isProcessing ? (
              <div className="flex flex-col items-center gap-2 text-violet-600 dark:text-violet-400">
                <Loader2 className="w-10 h-10 animate-spin" />
                <span className="text-sm font-bold font-display">AI is extracting competencies, experiences, and computing ATS score...</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white font-display">
                    Click to browse or drop your resume document here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports PDF, TXT, DOCX, and Markdown (up to 10MB)
                  </p>
                </div>
              </>
            )}
          </label>
        ) : (
          <div className="space-y-4">
            <textarea
              rows={6}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste your plain text resume here (including work history, skills, education)..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={isProcessing || !pastedText.trim()}
              className="px-6 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 font-display cursor-pointer"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-orange-300" />}
              Parse Resume Text with AI
            </button>
          </div>
        )}
      </div>

      {/* Portfolio & External Profiles */}
      <div className="bg-white dark:bg-[#151D2A] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
              Portfolio & Candidate Profiles (Verified Signals)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-display">Included in applications sent to recruiters</span>
        </div>

        <form onSubmit={handleSaveLinks} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 font-display">
              <Github className="w-3.5 h-3.5" /> GitHub Profile
            </label>
            <input
              type="url"
              value={links.github || ''}
              onChange={(e) => setLinks({ ...links, github: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 font-display">
              <Linkedin className="w-3.5 h-3.5 text-blue-500" /> LinkedIn Profile
            </label>
            <input
              type="url"
              value={links.linkedin || ''}
              onChange={(e) => setLinks({ ...links, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1 font-display">
              <ExternalLink className="w-3.5 h-3.5 text-violet-500" /> Portfolio Website
            </label>
            <input
              type="url"
              value={links.portfolio || ''}
              onChange={(e) => setLinks({ ...links, portfolio: e.target.value })}
              placeholder="https://mywebsite.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={savingLinks}
              className="px-5 py-2 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 font-display cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> {savingLinks ? 'Saving...' : 'Save Portfolio Links'}
            </button>
          </div>
        </form>
      </div>

      {/* Structured Resume Analysis Visualizer */}
      {resumeData && (
        <div className="space-y-6">
          {/* ATS Readiness Banner */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center text-2xl font-black font-display shadow-2xs">
                {resumeData.atsReadinessScore || 85}%
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  Baseline ATS Readiness
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated against formatting standards, quantifiable impact, and keyword density.
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300 block font-display">
                {(resumeData.skills || []).length} Technical Competencies Extracted
              </span>
            </div>
          </div>

          {/* Extracted Skills Cloud */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  Extracted Skills & Competencies ({resumeData.skills.length})
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill: any, idx: number) => {
                  const name = typeof skill === 'string' ? skill : skill?.name || 'Skill';
                  const cat = typeof skill === 'object' && skill?.category ? skill.category : null;
                  return (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border border-slate-200/80 dark:border-slate-700"
                    >
                      {name}
                      {cat && (
                        <span className="text-[10px] opacity-70 font-normal">({cat})</span>
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experience Breakdown */}
          {resumeData.experience && resumeData.experience.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Work History & Career Trajectory
              </h3>

              <div className="space-y-4">
                {resumeData.experience.map((exp: any, idx: number) => {
                  const bullets: string[] = exp?.responsibilities || exp?.highlights || exp?.achievements || [];
                  const expTechnologies: string[] = exp?.technologies || [];

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm font-display">
                          {exp?.title || 'Engineer'} • <span className="text-violet-600 dark:text-violet-400">{exp?.company || 'Company'}</span>
                        </span>
                        <span className="text-xs text-slate-400 font-medium font-mono">{exp?.startDate || ''} – {exp?.endDate || 'Present'}</span>
                      </div>

                      {bullets.length > 0 && (
                        <ul className="space-y-1 pt-1">
                          {bullets.map((item: string, hIdx: number) => (
                            <li key={hIdx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                              <span className="text-violet-600 dark:text-violet-400 font-bold">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {expTechnologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {expTechnologies.map((tech: string, tIdx: number) => (
                            <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Education & Credentials */}
          {resumeData.education && resumeData.education.length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                Education & Academics
              </h3>

              <div className="space-y-3">
                {resumeData.education.map((edu: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-bold text-sm text-slate-900 dark:text-white font-display">
                        {edu?.degree} {edu?.field ? `in ${edu.field}` : ''}
                      </span>
                      <p className="text-xs text-violet-600 dark:text-violet-400 font-medium">
                        {edu?.institution}
                      </p>
                    </div>
                    {(edu?.startDate || edu?.endDate) && (
                      <span className="text-xs text-slate-400 font-mono">
                        {edu.startDate ? `${edu.startDate} – ` : ''}{edu.endDate || ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumeData.strengths && resumeData.strengths.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Identified Resume Strengths
                </h4>
                <ul className="space-y-2">
                  {resumeData.strengths.map((s: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/20">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resumeData.areasForImprovement && resumeData.areasForImprovement.length > 0 && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#151D2A] border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  AI Optimization Suggestions
                </h4>
                <ul className="space-y-2">
                  {resumeData.areasForImprovement.map((imp: string, idx: number) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 bg-orange-50/60 dark:bg-orange-950/20 p-3 rounded-2xl border border-orange-500/20">
                      <span className="text-orange-600 font-bold">💡</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
