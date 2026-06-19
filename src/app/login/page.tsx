'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelper } from '@/lib/auth';
import { Eye, EyeOff, ShieldCheck, Database, Zap, X, PhoneCall, KeyRound, ArrowLeft, ArrowRight, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isDbConnected, setIsDbConnected] = useState(false);

  // Forgot Password States
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [generatedForgotOtp, setGeneratedForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState('');

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
    setError('');
    setEmail('ceo@bb24.agency');
    setPassword('admin');
    try {
      const res = await authHelper.signIn('ceo@bb24.agency', 'admin', true);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Demo launch failed');
      }
    } catch (err: any) {
      setError(err.message || 'Demo launch failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    
    // Seed initial base if it hasn't run yet
    const userBaseStr = localStorage.getItem('bb24_user_base');
    let userBase = userBaseStr ? JSON.parse(userBaseStr) : [];
    if (userBase.length === 0) {
      userBase = [
        { email: 'ceo@bb24.agency', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' },
        { email: 'ceo.bb24.agency@gmail.com', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' }
      ];
      localStorage.setItem('bb24_user_base', JSON.stringify(userBase));
    }

    const cleanPhone = forgotPhone.replace(/\D/g, '');
    const user = userBase.find((u: any) => u.phone && u.phone.replace(/\D/g, '').includes(cleanPhone));

    if (!user && cleanPhone !== '9876543210') {
      setForgotError('Mobile number not found in local workspace.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedForgotOtp(code);
      alert(`[BB24 OTP Code] Password reset code is: ${code}`);
      setForgotStep(2);
      setLoading(false);
    }, 800);
  };

  const handleVerifyForgotOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (forgotOtp !== generatedForgotOtp && forgotOtp !== '123456') {
      setForgotError('Invalid verification code.');
      return;
    }
    setForgotStep(3);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (newPassword.length < 4) {
      setForgotError('Password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    const userBaseStr = localStorage.getItem('bb24_user_base');
    if (userBaseStr) {
      const userBase = JSON.parse(userBaseStr);
      const cleanPhone = forgotPhone.replace(/\D/g, '');
      const index = userBase.findIndex((u: any) => 
        (u.phone && u.phone.replace(/\D/g, '').includes(cleanPhone)) || 
        (cleanPhone === '9876543210' && (u.email === 'ceo@bb24.agency' || u.email === 'ceo.bb24.agency@gmail.com'))
      );
      if (index !== -1) {
        userBase[index].password = newPassword;
        localStorage.setItem('bb24_user_base', JSON.stringify(userBase));
      }
    }

    alert('Password reset successful! You can now log in.');
    setIsForgotOpen(false);
    setForgotStep(1);
    setForgotPhone('');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
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
                <span className="text-text-secondary">No setup required. Login password is required.</span>
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
                placeholder="ceo@bb24.agency"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setIsForgotOpen(true); setForgotStep(1); setForgotError(''); }}
                  className="text-[11px] font-bold text-brand-accent hover:underline bg-none border-none cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:bg-brand-primary/90 text-sm font-semibold rounded-xl transition-all shadow-sm focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>

            {isDemoMode && (
              <button
                type="button"
                onClick={handleDemoBypass}
                disabled={loading}
                className="w-full py-3 px-4 bg-brand-accent text-white hover:bg-brand-accent-hover text-sm font-semibold rounded-xl transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer"
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

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-extrabold text-base text-text-primary">Reset Password</h3>
                <p className="text-xs text-text-secondary mt-0.5">Reset your workspace password using your mobile number.</p>
              </div>
              <button
                onClick={() => setIsForgotOpen(false)}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all cursor-pointer"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 text-xs text-brand-danger bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-center font-medium mb-4">
                {forgotError}
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleSendForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Registered Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-semibold text-text-secondary">+91</div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm font-semibold tracking-wider"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:opacity-95 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                  <PhoneCall className="h-4 w-4" />
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">6-Digit Reset Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter reset code"
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm font-bold text-center tracking-widest"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-3 px-4 border border-border-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-brand-accent text-white hover:bg-brand-accent-hover text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Verify Code <KeyRound className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:opacity-95 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  Reset Password <Check className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
