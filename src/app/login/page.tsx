'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelper } from '@/lib/auth';
import { Eye, EyeOff, ShieldCheck, Database, Zap, X, PhoneCall, KeyRound, ArrowLeft, ArrowRight, Check, Crown, Users, UserCheck } from 'lucide-react';

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
    
    // Force align/correct local user base credentials
    if (typeof window !== 'undefined') {
      const userBaseStr = localStorage.getItem('bb24_user_base');
      let userBase = userBaseStr ? JSON.parse(userBaseStr) : [];
      
      const targetUsers = [
        { email: 'ceo@bb24.agency', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' },
        { email: 'gsayurveda@email.com', password: 'password', role: 'client', name: 'GS Ayurveda Team' },
        { email: 'kavya@bb24.agency', password: 'password', role: 'employee', name: 'Kavya' }
      ];

      targetUsers.forEach(target => {
        const existingIdx = userBase.findIndex((u: any) => u.email.toLowerCase() === target.email.toLowerCase());
        if (existingIdx !== -1) {
          userBase[existingIdx] = { ...userBase[existingIdx], ...target };
        } else {
          userBase.push(target);
        }
      });
      localStorage.setItem('bb24_user_base', JSON.stringify(userBase));
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

  const handleQuickLogin = async (role: 'admin' | 'client' | 'team') => {
    setLoading(true);
    setError('');
    let targetEmail = '';
    let targetPass = '';
    
    if (role === 'admin') {
      targetEmail = 'ceo@bb24.agency';
      targetPass = 'admin';
    } else if (role === 'client') {
      targetEmail = 'gsayurveda@email.com';
      targetPass = 'password';
    } else if (role === 'team') {
      targetEmail = 'kavya@bb24.agency';
      targetPass = 'password';
    }

    setEmail(targetEmail);
    setPassword(targetPass);

    try {
      const res = await authHelper.signIn(targetEmail, targetPass, true);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Quick login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
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
    
    const requiredDemoEmails = ['ceo@bb24.agency', 'gsayurveda@email.com', 'kavya@bb24.agency'];
    const isMissingAny = !userBaseStr || !requiredDemoEmails.every(email => 
      userBase.some((u: any) => u.email.toLowerCase() === email.toLowerCase())
    );

    if (isMissingAny || userBase.length === 0) {
      userBase = [
        { email: 'ceo@bb24.agency', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' },
        { email: 'ceo.bb24.agency@gmail.com', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' },
        // Employees
        { email: 'divyansh@bb24.agency', password: 'password', role: 'employee', name: 'Divyansh' },
        { email: 'govind@bb24.agency', password: 'password', role: 'employee', name: 'Govind' },
        { email: 'kavya@bb24.agency', password: 'password', role: 'employee', name: 'Kavya' },
        { email: 'amit@bb24.agency', password: 'password', role: 'employee', name: 'Amit' },
        { email: 'nitin@bb24.agency', password: 'password', role: 'employee', name: 'Nitin' },
        // Clients
        { email: 'gsayurveda@email.com', password: 'password', role: 'client', name: 'GS Ayurveda Team' },
        { email: 'ashvastra@email.com', password: 'password', role: 'client', name: 'Ashvastra Team' },
        { email: 'chillqubig@email.com', password: 'password', role: 'client', name: 'Chillqubig Team' },
        { email: 'oncoadvisor@email.com', password: 'password', role: 'client', name: 'OncoAdvisor Team' },
        { email: 'spevents@email.com', password: 'password', role: 'client', name: 'SP Events Team' },
        { email: 'wellavitta@email.com', password: 'password', role: 'client', name: 'WellaVitta Team' },
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
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-bg-primary font-semibold text-2xl tracking-wider mb-3 shadow-md">
            BB
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">
            Welcome to BB24
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            The Premium Marketing Agency Operating System
          </p>
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
              <label htmlFor="email" className="block text-xs font-medium text-text-secondary uppercase tracking-wider mb-2">
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
                className="w-full px-4 py-3 bg-bg-secondary/40 border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm backdrop-blur-md"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setIsForgotOpen(true); setForgotStep(1); setForgotError(''); }}
                  className="text-[11px] font-semibold text-brand-accent hover:underline bg-none border-none cursor-pointer"
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
                  className="w-full px-4 py-3 bg-bg-secondary/40 border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm backdrop-blur-md"
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

          <div className="space-y-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:bg-brand-primary/90 text-sm font-semibold rounded-xl transition-all shadow-lg shadow-brand-primary/20 focus:outline-none flex items-center justify-center gap-2 cursor-pointer active:scale-95 duration-150"
            >
              {loading ? 'Processing...' : 'Sign In'}
            </button>

            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">
                Or Sign In Instantly via Demo Roles
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* Admin Preset */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-primary bg-bg-secondary/30 backdrop-blur-md hover:border-brand-primary/50 hover:bg-brand-primary/10 transition-all group cursor-pointer active:scale-95 duration-150"
                >
                  <div className="p-2 rounded-lg bg-brand-primary/15 text-brand-primary group-hover:scale-110 transition-transform shadow-inner">
                    <Crown className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-text-primary mt-2">CEO & Founder</span>
                  <span className="text-[8px] text-text-secondary font-medium mt-0.5">Nitesh Sharma</span>
                </button>

                {/* Client Preset */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('client')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-primary bg-bg-secondary/30 backdrop-blur-md hover:border-brand-success/50 hover:bg-brand-success/10 transition-all group cursor-pointer active:scale-95 duration-150"
                >
                  <div className="p-2 rounded-lg bg-brand-success/15 text-brand-success group-hover:scale-110 transition-transform shadow-inner">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-text-primary mt-2">Client Portal</span>
                  <span className="text-[8px] text-text-secondary font-medium mt-0.5">GS Ayurveda</span>
                </button>

                {/* Team Preset */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('team')}
                  disabled={loading}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border-primary bg-bg-secondary/30 backdrop-blur-md hover:border-brand-accent/50 hover:bg-brand-accent/10 transition-all group cursor-pointer active:scale-95 duration-150"
                >
                  <div className="p-2 rounded-lg bg-brand-accent/15 text-brand-accent group-hover:scale-110 transition-transform shadow-inner">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-text-primary mt-2">Team Workspace</span>
                  <span className="text-[8px] text-text-secondary font-medium mt-0.5">Kavya - Specialist</span>
                </button>
              </div>
            </div>
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
                <h3 className="font-bold text-base text-text-primary">Reset Password</h3>
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
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Registered Mobile Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-medium text-text-secondary">+91</div>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="98765 43210"
                      className="w-full pl-10 pr-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm font-medium tracking-wider"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:opacity-95 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Sending Code...' : 'Send Reset Code'}
                  <PhoneCall className="h-4 w-4" />
                </button>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">6-Digit Reset Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter reset code"
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm font-semibold text-center tracking-widest"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-3 px-4 border border-border-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-brand-accent text-white hover:bg-brand-accent-hover text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Verify Code <KeyRound className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">New Password</label>
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
                  <label className="block text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Confirm New Password</label>
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
                  className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:opacity-95 text-xs font-semibold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
