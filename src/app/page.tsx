'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHelper } from '@/lib/auth';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const activeSession = authHelper.getCurrentSession();
    if (activeSession) {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary text-text-primary">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border-primary border-t-brand-accent" />
        <span className="text-sm font-semibold tracking-wide animate-pulse">Initializing BB24...</span>
      </div>
    </div>
  );
}
