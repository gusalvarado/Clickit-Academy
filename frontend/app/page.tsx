'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Root page - redirects to login or dashboard based on auth state
 */
export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state during redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-terminal-bg">
      <div className="text-terminal-green">Loading...</div>
    </div>
  );
}
