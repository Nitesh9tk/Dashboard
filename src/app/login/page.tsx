'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelper } from '@/lib/auth';
import { Eye, EyeOff, ShieldCheck, Database, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  useEffect(() => {
    // Check if user has active session
    const activeSession = authHelper.getCurrentSession();
    if (activeSession) {
      router.push('/dashboard');
    }
    // Verify Supabase Config
    setIsDbConnected(authHelper.isSupabaseConfigured());
    // Auto-disable demo mode if database variables are active
    if (authHelper.isSupabaseConfigured()) {
      setIsDemoMode(false);
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authHelper.signIn(email, password, isDemoMode);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = async () => {
    setLoading(true);
    const res = await authHelper.signIn('ceo@bb24.agency', '', true);
    if (res.success) {
      router.push('/dashboard');
    } else {
      setError('Demo launch failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent opacity-5 dark:opacity-10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent opacity-5 dark:opacity-10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl border border-border-primary shadow-xl relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-bg-primary font-bold text-2xl tracking-wider mb-3 shadow-md">
            BB
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome to BB24
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            The Premium Marketing Agency Operating System
          </p>
        </div>

        {/* Database Status Alert */}
        <div className="flex items-center gap-3 p-3 rounded-lg text-xs border border-border-primary bg-bg-secondary">
          {isDbConnected ? (
            <>
              <Database className="h-4 w-4 text-brand-success shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-text-primary block">Supabase Connected</span>
                <span className="text-text-secondary">Using your external cloud database storage.</span>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 text-brand-warning shrink-0" />
              <div className="text-left">
                <span className="font-semibold text-text-primary block">Local Sandbox (Demo Mode)</span>
                <span className="text-text-secondary">No setup required. Launching with local mock data.</span>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="p-3 text-sm text-brand-danger bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Main login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.com"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm"
              />
            </div>

            {!isDemoMode && (
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mode Selector Toggle (Show if DB is connected) */}
          {isDbConnected && (
            <div className="flex items-center justify-between border-t border-border-primary pt-4 text-sm">
              <span className="text-text-secondary">Enable Demo Mode</span>
              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDemoMode ? 'bg-brand-accent' : 'bg-bg-tertiary'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDemoMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {!isDemoMode ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:bg-brand-primary/90 text-sm font-semibold rounded-xl transition-all shadow-sm focus:outline-none flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Sign In'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDemoBypass}
                disabled={loading}
                className="w-full py-3 px-4 bg-brand-accent text-white hover:bg-brand-accent-hover text-sm font-semibold rounded-xl transition-all shadow-md focus:outline-none flex items-center justify-center gap-2"
              >
                <Zap className="h-4 w-4 fill-current" />
                {loading ? 'Launching...' : 'Launch Demo Workspace'}
              </button>
            )}
          </div>
        </form>

        <div className="text-center text-xs text-text-secondary pt-2">
          <span>Don&apos;t have an account? </span>
          <Link href="/signup" className="font-semibold text-brand-accent hover:underline">
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
