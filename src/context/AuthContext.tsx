import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, CandidateProfile } from '../types';
import { authApi, profileApi } from '../api';

interface AuthContextType {
  user: User | null;
  profile: CandidateProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeRole: 'CANDIDATE' | 'RECRUITER' | 'ADMIN';
  switchRole: (role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN') => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name: string; preferredRole?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfileState: (updated: CandidateProfile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('swipe_x_token'));
  const [activeRole, setActiveRole] = useState<'CANDIDATE' | 'RECRUITER' | 'ADMIN'>(() => {
    return (localStorage.getItem('swipe_x_active_role') as any) || 'CANDIDATE';
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
        setUser(data.user);
        setProfile(data.profile);
        if (data.user?.role) {
          const savedRole = localStorage.getItem('swipe_x_active_role');
          setActiveRole((savedRole as any) || data.user.role);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        localStorage.removeItem('swipe_x_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, []);

  const switchRole = (role: 'CANDIDATE' | 'RECRUITER' | 'ADMIN') => {
    setActiveRole(role);
    localStorage.setItem('swipe_x_active_role', role);
    if (user) {
      setUser({ ...user, role });
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      localStorage.setItem('swipe_x_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; name: string; preferredRole?: string }) => {
    setIsLoading(true);
    try {
      const res = await authApi.register(data);
      localStorage.setItem('swipe_x_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await authApi.demoLogin();
      localStorage.setItem('swipe_x_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setProfile(res.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('swipe_x_token');
    setToken(null);
    setUser(null);
    setProfile(null);
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
        activeRole,
        switchRole,
        login,
        register,
        demoLogin,
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
