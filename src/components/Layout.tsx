import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-[#1E293B] dark:text-[#F8FAFC] transition-colors w-full max-w-full overflow-x-clip">
      <Navbar />
      
      <div className="flex-1 flex w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 gap-8 xl:gap-12">
        {isAuthenticated && <Sidebar />}
        
        <main className="flex-1 pt-4 sm:pt-6 pb-24 sm:pb-16 min-w-0 overflow-y-auto w-full max-w-full space-y-6 sm:space-y-8">
          <Outlet />
        </main>
      </div>

      {/* Thumb-friendly Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};
