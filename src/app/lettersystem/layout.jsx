'use client';

import TopNavigation from '@/components/layout/TopNavigation';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function LetterSystemLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="lg:pl-64 transition-[padding] duration-200">
          <TopNavigation />
          <main className="p-4 md:p-6 pt-20 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
