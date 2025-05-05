'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/supabase/AuthProvider';

export default function Header() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const getInitials = () => {
    if (!user?.name) return 'U';
    return user.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard" className="text-2xl font-bold">
            RFP Generator
          </Link>
          
          {user && (
            <nav className="hidden md:flex space-x-6">
              <Link 
                href="/dashboard" 
                className={`hover:text-blue-200 ${isActive('/dashboard') ? 'font-semibold' : ''}`}
              >
                Dashboard
              </Link>
              <Link 
                href="/projects" 
                className={`hover:text-blue-200 ${isActive('/projects') ? 'font-semibold' : ''}`}
              >
                Projects
              </Link>
              <Link 
                href="/documents" 
                className={`hover:text-blue-200 ${isActive('/documents') ? 'font-semibold' : ''}`}
              >
                Documents
              </Link>
              <Link 
                href="/settings" 
                className={`hover:text-blue-200 ${isActive('/settings') ? 'font-semibold' : ''}`}
              >
                Settings
              </Link>
            </nav>
          )}
        </div>
        
        {user && (
          <div className="flex items-center">
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-white text-blue-600 flex items-center justify-center font-bold">
                {getInitials()}
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  {user.name || user.email}
                </div>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
