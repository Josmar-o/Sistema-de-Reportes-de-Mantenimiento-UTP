'use client';

import { ReactNode } from 'react';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { SidebarProvider } from '@/components/layout/SidebarContext';

export default function PersonalLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['personal']}>
      <SidebarProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
