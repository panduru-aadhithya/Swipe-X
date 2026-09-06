import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  Save, 
  Sparkles, 
  Plus, 
  X, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfileState } = useAuth();
  
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [summary, setSummary] = useState(profile?.summary || '');
  const [preferredRole, setPreferredRole] = useState(profile?.preferredRole || 'Full Stack Engineer');
  const [preferredWorkType, setPreferredWorkType] = useState(profile?.preferredWorkType || 'Remote');
  const [experienceLevel, setExperienceLevel] = useState(profile?.experienceLevel || 'Senior');
  const [targetSalary, setTargetSalary] = useState(profile?.targetSalary || 160000);
  const [experienceYears, setExperienceYears] = useState(profile?.experienceYears || 5);
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setSummary(profile.summary || '');
      setPreferredRole(profile.preferredRole || 'Full Stack Engineer');
      setPreferredWorkType(profile.preferredWorkType || 'Remote');
      setExperienceLevel(profile.experienceLevel || 'Senior');
      setTargetSalary(profile.targetSalary || 160000);
      setExperienceYears(profile.experienceYears || 5);
      setSkills(profile.skills || []);
    }
  }, [profile]);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const updated = await profileApi.updateProfile({
        name,
        phone,
        location,
        summary,
        preferredRole,
        preferredWorkType,
        experienceLevel,
        targetSalary: Number(targetSalary),
        experienceYears: Number(experienceYears),
        skills
      });
      updateProfileState(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update candidate profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#DCD7C9] dark:border-[#2E362E]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif flex items-center gap-2">
            <User className="w-7 h-7 text-[#5B6D5B]" />
            Candidate Profile & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-[#8C867A] mt-0.5">
            Configure your technical background, target salary, and job discovery criteria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs text-[#5B6D5B] dark:text-[#8FA68F] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Personal Details Card */}
        <div className="bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={profile?.email || ''}
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/20 dark:bg-[#1E251E]/50 text-[#8C867A] text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA or Remote"
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
              Professional Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
            />
          </div>
        </div>

        {/* Preferences & Targets Card */}
        <div className="bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
            Career Target & Compensation
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Target Role Title
              </label>
              <input
                type="text"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Work Mode Preference
              </label>
              <select
                value={preferredWorkType}
                onChange={(e) => setPreferredWorkType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] dark:text-[#F2F0E9] uppercase tracking-wider mb-1.5 font-serif">
                Target Salary (USD/yr)
              </label>
              <input
                type="number"
                step="5000"
                value={targetSalary}
                onChange={(e) => setTargetSalary(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Skills Tag Management Card */}
        <div className="bg-white dark:bg-[#252C25] rounded-3xl border border-[#DCD7C9] dark:border-[#2E362E] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#2D2926] dark:text-[#F2F0E9] font-serif">
                Profile Skills & Competencies ({skills.length})
              </h3>
              <p className="text-xs text-[#8C867A]">
                These skills directly fuel the Gemini recommendation algorithm.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. Next.js, PyTorch, Docker)..."
              className="flex-1 p-2.5 rounded-xl border border-[#DCD7C9] dark:border-[#2E362E] bg-[#E9E4D9]/40 dark:bg-[#1E251E] text-[#2D2926] dark:text-[#F2F0E9] text-sm focus:ring-2 focus:ring-[#5B6D5B] focus:outline-none placeholder:text-[#8C867A]/60"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 rounded-full bg-[#5B6D5B] hover:bg-[#465546] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-[#5B6D5B]/15 text-[#5B6D5B] dark:text-[#8FA68F] font-semibold border border-[#5B6D5B]/30"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-[#8C867A] hover:text-[#B86B64] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};
