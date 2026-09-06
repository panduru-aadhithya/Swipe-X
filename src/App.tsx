import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SwipePage } from './pages/SwipePage';
import { SwipeHistoryPage } from './pages/SwipeHistoryPage';
import { ExploreJobsPage } from './pages/ExploreJobsPage';
import { ResumePage } from './pages/ResumePage';
import { ATSAnalysisPage } from './pages/ATSAnalysisPage';
import { SavedJobsPage } from './pages/SavedJobsPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { MockInterviewPage } from './pages/MockInterviewPage';
import { GrowthJourneyPage } from './pages/GrowthJourneyPage';
import { RecruiterDashboardPage } from './pages/RecruiterDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public / Standard Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<LandingPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              
              {/* Candidate Protected Routes */}
              <Route
                path="candidate/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/swipe"
                element={
                  <ProtectedRoute>
                    <SwipePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/swipe-history"
                element={
                  <ProtectedRoute>
                    <SwipeHistoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/explore"
                element={
                  <ProtectedRoute>
                    <ExploreJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/interview"
                element={
                  <ProtectedRoute>
                    <MockInterviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/growth"
                element={
                  <ProtectedRoute>
                    <GrowthJourneyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/resume"
                element={
                  <ProtectedRoute>
                    <ResumePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/ats"
                element={
                  <ProtectedRoute>
                    <ATSAnalysisPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/saved-jobs"
                element={
                  <ProtectedRoute>
                    <SavedJobsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/applications"
                element={
                  <ProtectedRoute>
                    <ApplicationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="candidate/jobs/:id"
                element={
                  <ProtectedRoute>
                    <JobDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Recruiter Hub Routes */}
              <Route
                path="recruiter"
                element={
                  <ProtectedRoute>
                    <RecruiterDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="recruiter/dashboard"
                element={
                  <ProtectedRoute>
                    <RecruiterDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Hub Routes */}
              <Route
                path="admin"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Top-Level Aliases */}
              <Route path="dashboard" element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="swipe" element={<Navigate to="/candidate/swipe" replace />} />
              <Route path="explore" element={<Navigate to="/candidate/explore" replace />} />
              <Route path="jobs" element={<Navigate to="/candidate/explore" replace />} />
              <Route path="jobs/:id" element={<Navigate to="/candidate/jobs/:id" replace />} />
              <Route path="resume" element={<Navigate to="/candidate/resume" replace />} />
              <Route path="ats" element={<Navigate to="/candidate/ats" replace />} />
              <Route path="saved" element={<Navigate to="/candidate/saved-jobs" replace />} />
              <Route path="saved-jobs" element={<Navigate to="/candidate/saved-jobs" replace />} />
              <Route path="applications" element={<Navigate to="/candidate/applications" replace />} />
              <Route path="profile" element={<Navigate to="/candidate/profile" replace />} />
              <Route path="settings" element={<Navigate to="/candidate/settings" replace />} />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
