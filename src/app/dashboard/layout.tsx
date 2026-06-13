'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authHelper, UserSession } from '@/lib/auth';
import {
  LayoutDashboard,
  Users,
  GitPullRequest,
  Briefcase,
  Wallet,
  Sparkles,
  Calendar,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Building,
  Bell,
  Search,
  Settings,
  TrendingUp,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const activeSession = authHelper.getCurrentSession();
    if (!activeSession) {
      router.push('/login');
    } else {
      setSession(activeSession);
    }
    setLoading(false);

    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = storedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.className = initialTheme;
  }, [router]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.className = nextTheme;
  };

  const handleLogout = async () => {
    await authHelper.signOut();
    router.push('/login');
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading workspace...</span>
        </div>
      </div>
    );
  }

  const allMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['founder', 'super_admin', 'manager', 'employee', 'client'] },
    { name: 'Clients CRM', path: '/dashboard/clients', icon: Users, roles: ['founder', 'super_admin', 'manager'] },
    { name: 'Leads Pipeline', path: '/dashboard/leads', icon: GitPullRequest, roles: ['founder', 'super_admin', 'manager'] },
    { name: 'Finance Hub', path: '/dashboard/finance', icon: Wallet, roles: ['founder', 'super_admin', 'manager'] },
    { name: 'Team Hub', path: '/dashboard/team', icon: Users, roles: ['founder', 'super_admin', 'manager', 'employee'] },
    { name: 'Meetings', path: '/dashboard/meetings', icon: Calendar, roles: ['founder', 'super_admin', 'manager', 'employee', 'client'] },
    { name: 'AI Assistant', path: '/dashboard/ai', icon: Sparkles, roles: ['founder', 'super_admin', 'manager', 'employee', 'client'] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(session.role));

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ─── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="h-9 w-9 rounded-xl gradient-blue flex items-center justify-center text-white font-black text-base shadow-sm">
            B
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>BB24 Agency</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Operating System</p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'nav-active shadow-sm' : ''
                }`}
                style={!isActive ? { color: 'var(--text-secondary)' } : {}}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.background = '';
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Section */}
        <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-8 w-8 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {session.firstName[0]}{session.lastName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                {session.firstName} {session.lastName}
              </p>
              <p className="text-[10px] capitalize" style={{ color: 'var(--text-muted)' }}>{session.role}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}
            >
              {theme === 'dark' ? <><Sun className="h-3.5 w-3.5" />Light</> : <><Moon className="h-3.5 w-3.5" />Dark</>}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ border: '1px solid var(--border-primary)', color: 'var(--danger)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--danger-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-6 shrink-0" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
          {/* Mobile menu button */}
          <button className="lg:hidden p-2 rounded-lg" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ border: '1px solid var(--border-primary)' }}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Page title hint */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {session.organizationName}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg transition-all"
              style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-blue-500" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all"
              style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            <div className="h-8 w-8 rounded-full gradient-blue flex items-center justify-center text-white text-xs font-bold cursor-pointer shadow-sm">
              {session.firstName[0]}{session.lastName[0]}
            </div>
          </div>
        </header>

        {/* Mobile Nav Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <nav className="relative flex flex-col w-64 h-full z-50 py-4 px-3 space-y-1 animate-slide-in"
              style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-primary)' }}>
              <div className="flex items-center justify-between px-2 pb-4 mb-2" style={{ borderBottom: '1px solid var(--border-primary)' }}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg gradient-blue flex items-center justify-center text-white font-bold text-sm">B</div>
                  <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>BB24 Agency</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 rounded-lg" style={{ border: '1px solid var(--border-primary)' }}>
                  <X className="h-4 w-4" />
                </button>
              </div>

              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'nav-active' : ''}`}
                    style={!isActive ? { color: 'var(--text-secondary)' } : {}}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}

              <div className="absolute bottom-4 left-3 right-3">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
                  <LogOut className="h-4 w-4" />Logout
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
}
