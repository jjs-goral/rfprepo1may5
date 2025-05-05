import React, { ReactNode } from 'react';
import Header from './Header';
import { AuthProvider } from '@/lib/supabase/AuthProvider';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6">
          {children}
        </main>
        {/* Footer could go here */}
      </div>
    </AuthProvider>
  );
}
