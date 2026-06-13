'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelper } from '@/lib/auth';
import { ShieldCheck, PhoneCall, KeyRound, Building, User, Mail, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Registration States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('123456');
  
  // Admin Profile details (Step 3)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setIsDbConnected(authHelper.isSupabaseConfigured());
  }, []);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomOtp);
      // Alert user of OTP during sandbox demo
      alert(`[BB24 OTP Sandbox] Verification code: ${randomOtp}`);
      setStep(2);
      setLoading(false);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp !== generatedOtp && otp !== '123456') {
      setError('Invalid verification code. Please try again.');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setStep(3);
      setLoading(false);
    }, 500);
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isDbConnected) {
        // Mock demo register: save custom session values directly
        const mockSession = {
          id: 'demo-user-uuid-' + Math.floor(Math.random() * 10000),
          email,
          role: 'founder', // Signups represent Admin/Founder panel
          firstName: firstName || 'Owner',
          lastName: lastName || 'Member',
          organizationName: agencyName || 'My Digital Agency',
          phone: phone,
          isDemo: true,
        };
        localStorage.setItem('bb24_user_session', JSON.stringify(mockSession));
        
        // Seed initial mock user base to let admins configure other user accounts
        const defaultUsers = [
          { email: 'ceo@bb24.agency', role: 'founder', name: 'Dev Founder' },
          { email: 'employee@bb24.agency', role: 'employee', name: 'Elena Rostova' },
          { email: 'client@bb24.agency', role: 'client', name: 'Sophia Moretti' }
        ];
        localStorage.setItem('bb24_user_base', JSON.stringify(defaultUsers));

        router.push('/dashboard');
        return;
      }

      // Live Supabase signup
      const res = await authHelper.signUp(email, password, firstName, lastName);
      if (res.success) {
        router.push('/dashboard');
      } else {
        setError(res.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-primary px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent opacity-5 dark:opacity-10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-accent opacity-5 dark:opacity-10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 glass-panel p-8 rounded-2xl border border-border-primary shadow-xl relative z-10">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-bg-primary font-bold text-2xl tracking-wider mb-2 shadow-md">
            BB
          </div>
          <h2 className="text-2xl font-black tracking-tight text-text-primary">
            {step === 1 && 'Admin Registration'}
            {step === 2 && 'Verify Mobile Number'}
            {step === 3 && 'Setup Workspace Profile'}
          </h2>
          <p className="text-xs text-text-secondary mt-1.5">
            {step === 1 && 'Enter your mobile number to get verification code.'}
            {step === 2 && `Enter the code sent to (+91) ${phone}`}
            {step === 3 && 'Create your login email, password, and agency name.'}
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs text-brand-danger bg-brand-danger/10 border border-brand-danger/20 rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Step 1: Phone input */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-semibold text-text-secondary">
                  +91
                </div>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  pattern="[0-9]{10}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full pl-12 pr-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm font-semibold tracking-wider"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:bg-brand-primary/95 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Send Verification OTP'}
              <PhoneCall className="h-4 w-4" />
            </button>
          </form>
        )}

        {/* Step 2: OTP verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">
                6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-3 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all text-sm font-bold text-center tracking-widest"
              />
              <span className="text-[10px] text-text-secondary mt-2 block text-left">
                Didn&apos;t get the OTP? Use sandbox fallback <span className="font-semibold text-brand-accent">123456</span> or click Resend.
              </span>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 border border-border-primary hover:bg-bg-secondary text-text-secondary hover:text-text-primary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-brand-accent text-white hover:bg-brand-accent-hover text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
                <KeyRound className="h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Admin profile setup */}
        {step === 3 && (
          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Dev"
                  className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Founder"
                  className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Agency Name
              </label>
              <input
                type="text"
                required
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g. Pixel Craft Studio"
                className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ceo@youragency.com"
                className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2.5 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-brand-primary text-bg-primary hover:bg-brand-primary/95 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Setting up Workspace...' : 'Launch Admin Panel'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        <div className="text-center text-xs text-text-secondary pt-2 border-t border-border-primary/50">
          <span>Already registered your Admin? </span>
          <Link href="/login" className="font-bold text-brand-accent hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
