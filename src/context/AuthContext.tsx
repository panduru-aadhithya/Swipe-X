import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CandidateProfile } from '../types';
import { authApi, profileApi } from '../api';

interface AuthContextType {
  user: User | null;
  profile: CandidateProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasActiveResume: boolean;
  setHasActiveResume: (has: boolean) => void;
  activeRole: 'CANDIDATE' | 'RECRUITER';
  switchRole: (role: 'CANDIDATE' | 'RECRUITER') => void;
  login: (credentials: { email: string; password: string } | string, maybePassword?: string) => Promise<{ hasActiveResume: boolean }>;
  register: (data: { email: string; password: string; name: string; preferredRole?: string }) => Promise<{ hasActiveResume: boolean }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (updated: CandidateProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [hasActiveResume, setHasActiveResume] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('swipe_x_token'));
  const [activeRole, setActiveRole] = useState<'CANDIDATE' | 'RECRUITER'>(() => {
    const saved = localStorage.getItem('swipe_x_active_role');
    return saved === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE';
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadCurrentUser() {
      const storedToken = localStorage.getItem('swipe_x_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await authApi.getMe();
        if (data.user?.email === 'candidate.demo@swipe-x.ai' || data.user?.id === 'user_demo_candidate_01') {
          localStorage.removeItem('swipe_x_token');
          setToken(null);
          setUser(null);
          setProfile(null);
          setHasActiveResume(false);
          setIsLoading(false);
          return;
        }

        setUser(data.user);
        setProfile(data.profile);
        setHasActiveResume(Boolean(data.hasActiveResume));
        if (data.user?.role) {
          const savedRole = localStorage.getItem('swipe_x_active_role');
          const finalRole = savedRole === 'RECRUITER' || data.user.role === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE';
          setActiveRole(finalRole);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('swipe_x_token');
        setToken(null);
        setUser(null);
        setProfile(null);
        setHasActiveResume(false);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const switchRole = (role: 'CANDIDATE' | 'RECRUITER') => {
    setActiveRole(role);
    localStorage.setItem('swipe_x_active_role', role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  const login = async (
    credentials: { email: string; password: string } | string,
    maybePassword?: string
  ): Promise<{ hasActiveResume: boolean }> => {
    setIsLoading(true);
    try {
      const payload = typeof credentials === 'string'
        ? { email: credentials, password: maybePassword || '' }
        : credentials;
      const res = await authApi.login(payload);
      localStorage.setItem('swipe_x_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      const hasResume = Boolean(res.hasActiveResume);
      setHasActiveResume(hasResume);
      return { hasActiveResume: hasResume };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string; preferredRole?: string }): Promise<{ hasActiveResume: boolean }> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('swipe_x_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
      const hasResume = Boolean(res.hasActiveResume);
      setHasActiveResume(hasResume);
      return { hasActiveResume: hasResume };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('swipe_x_token');
    setToken(null);
    setUser(null);
    setProfile(null);
    setHasActiveResume(false);
  };

  const refreshProfile = async () => {
    try {
      const p = await profileApi.getProfile();
      setProfile(p);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  const updateProfileState = (updated: CandidateProfile) => {
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isAuthenticated: !!user,
        isLoading,
        hasActiveResume,
        setHasActiveResume,
        activeRole,
        switchRole,
        login,
        register,
        logout,
        refreshProfile,
        updateProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
