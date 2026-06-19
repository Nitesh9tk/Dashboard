'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authHelper, UserSession } from '@/lib/auth';
import {
  LayoutDashboard, Users, GitPullRequest, Wallet, Sparkles,
  Calendar, LogOut, Sun, Moon, Menu, X, Bell, Search,
  TrendingUp, MoreVertical, Crown, ChevronRight, ChevronLeft,
  Settings, FileText, PanelLeftClose, PanelLeft,
  Home, UserCircle, Zap, BarChart3, CreditCard,
  Target, Clock, CheckCircle, AlertCircle, ArrowRight,
} from 'lucide-react';

// ─── Notification mock data ────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: '1', text: 'Invoice #INV-007 is overdue', time: '2m ago', type: 'danger' as const, read: false },
  { id: '2', text: 'New lead from LinkedIn: TechPulse Inc', time: '15m ago', type: 'info' as const, read: false },
  { id: '3', text: 'Meeting with GS Ayurveda in 1 hour', time: '45m ago', type: 'warning' as const, read: false },
  { id: '4', text: 'Ananya completed 5 tasks today', time: '2h ago', type: 'success' as const, read: true },
  { id: '5', text: 'Monthly revenue target 78% achieved', time: '5h ago', type: 'info' as const, read: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

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
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');

    const handleProfileUpdate = () => {
      const updated = authHelper.getCurrentSession();
      if (updated) {
        setSession(updated);
      }
    };
    window.addEventListener('profile-update', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-update', handleProfileUpdate);
    };
  }, [router]);

  // Ctrl+K search shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  }, [theme]);

  const handleLogout = async () => {
    await authHelper.signOut();
    router.push('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500" style={{ animation: 'spin 0.8s linear infinite' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading workspace...</span>
        </div>
      </div>
    );
  }

  // ─── Menu Items ──────────────────────────────────────────────
  const mainMenuItems = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    ...(session.role === 'founder' ? [
      { name: 'Connections', path: '/dashboard/clients', icon: Users },
      { name: 'Pipeline', path: '/dashboard/leads', icon: GitPullRequest },
    ] : []),
    ...(session.role === 'founder' || session.role === 'client' ? [
      { name: 'Finance', path: '/dashboard/finance', icon: Wallet },
    ] : []),
    ...(session.role === 'founder' || session.role === 'employee' ? [
      { name: 'Team', path: '/dashboard/team', icon: UserCircle },
    ] : []),
    { name: 'Calendar', path: '/dashboard/meetings', icon: Calendar },
  ];

  const toolMenuItems = session.role === 'founder' ? [
    { name: 'Insights AI', path: '/dashboard/ai', icon: Sparkles },
    { name: 'Reports', path: '/dashboard/reports', icon: BarChart3 },
  ] : [];

  const bottomMenuItems = [
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(path);
  };

  // All items for search
  const allItems = [...mainMenuItems, ...toolMenuItems, ...bottomMenuItems];
  const filteredSearch = searchQuery
    ? allItems.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allItems;

  // ─── Sidebar Nav Item Renderer ───────────────────────────────
  const NavItem = ({ item, collapsed }: { item: typeof mainMenuItems[0]; collapsed: boolean }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    return (
      <Link
        href={item.path}
        className={`sidebar-nav-item ${active ? 'active' : ''}`}
        style={collapsed ? { justifyContent: 'center', padding: '10px' } : {}}
        onClick={() => setIsMobileMenuOpen(false)}
        title={collapsed ? item.name : undefined}
      >
        <Icon style={{ width: 18, height: 18, flexShrink: 0 }} />
        {!collapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

      {/* ═══════════════════════════════════════════════════════════
          SIDEBAR — Always dark, collapsible
          ═══════════════════════════════════════════════════════════ */}
      <aside
        className="hidden lg:flex flex-col shrink-0 h-full"
        style={{
          position: 'relative',
          zIndex: 50,
          width: isCollapsed ? 72 : 260,
          minWidth: isCollapsed ? 72 : 260,
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
          transition: 'width 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '4px 0 32px rgba(0,0,0,0.15)',
        }}
      >
        {/* Brand */}
        <div style={{ padding: isCollapsed ? '20px 0' : '20px 20px', display: 'flex', alignItems: 'center', gap: 12, justifyContent: isCollapsed ? 'center' : 'flex-start', height: 68 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #4361ee, #7b2fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px rgba(67,97,238,0.5)',
            overflow: 'hidden',
          }}>
            <img src="/bb24-logo.png" alt="BB24 Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          </div>
          {!isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.2 }}>BB24</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>Business OS</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute', top: 22, right: -13,
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d1630, #141e3d)',
            border: '1px solid rgba(67,97,238,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#4361ee', zIndex: 50,
            transition: 'all 180ms ease',
            boxShadow: '0 2px 12px rgba(67,97,238,0.25)',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 16px rgba(67,97,238,0.6)'; (e.currentTarget as HTMLElement).style.color = '#7ba4ff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(67,97,238,0.25)'; (e.currentTarget as HTMLElement).style.color = '#4361ee'; }}
        >
          {isCollapsed ? <ChevronRight style={{ width: 13, height: 13 }} /> : <ChevronLeft style={{ width: 13, height: 13 }} />}
        </button>

        {/* Nav - WORKSPACE */}
        <nav style={{ flex: 1, padding: isCollapsed ? '8px 10px' : '8px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!isCollapsed && <div className="sidebar-section-label">Workspace</div>}
          {mainMenuItems.map(item => (
            <NavItem key={item.path} item={item} collapsed={isCollapsed} />
          ))}

          {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: 8 }}>Tools</div>}
          {isCollapsed && <div style={{ height: 1, background: 'var(--sidebar-border)', margin: '8px 0' }} />}
          {toolMenuItems.map(item => (
            <NavItem key={item.path} item={item} collapsed={isCollapsed} />
          ))}

          {!isCollapsed && <div className="sidebar-section-label" style={{ marginTop: 8 }}>System</div>}
          {isCollapsed && <div style={{ height: 1, background: 'var(--sidebar-border)', margin: '8px 0' }} />}
          {bottomMenuItems.map(item => (
            <NavItem key={item.path} item={item} collapsed={isCollapsed} />
          ))}
        </nav>

        {/* Upgrade Widget — Solid Brand-color Highlighted Card */}
        {!isCollapsed && (
          <div style={{
            margin: '0 14px 10px',
            padding: '14px 16px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #4361ee 0%, #7b2fff 100%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(67, 97, 238, 0.25)',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Gloss overlay */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.15), transparent)', borderRadius: '14px 14px 0 0', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0,
              }}>
                <Crown style={{ width: 15, height: 15, color: '#ffffff' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>Upgrade Pro</p>
                <p style={{ fontSize: 10, color: '#e0e7ff', fontWeight: 500, marginTop: 1 }}>Unlock all features</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div style={{ padding: isCollapsed ? '12px 10px' : '12px 14px', borderTop: '1px solid rgba(67,97,238,0.1)', position: 'relative' }}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              gap: isCollapsed ? 0 : 10,
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              padding: '8px 10px',
              borderRadius: 12,
              background: 'transparent',
              border: 'none', cursor: 'pointer',
              transition: 'all 150ms ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(67,97,238,0.10)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
          >
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #4361ee 0%, #7b2fff 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
              position: 'relative',
              boxShadow: '0 0 14px rgba(67,97,238,0.5)',
            }}>
              {session.firstName ? session.firstName[0].toUpperCase() : 'N'}
              {/* Green online dot */}
              <span style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 10, height: 10, borderRadius: '50%',
                background: '#06d6a0', border: '2px solid var(--sidebar-bg)',
                boxShadow: '0 0 8px rgba(6,214,160,0.6)',
              }} />
            </div>
            {!isCollapsed && (
              <>
                <div style={{ textAlign: 'left', minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {session.firstName} {session.lastName}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'capitalize' }}>{session.role === 'founder' ? 'Admin' : session.role}</p>
                </div>
                <MoreVertical style={{ width: 14, height: 14, color: '#64748b', flexShrink: 0 }} />
              </>
            )}
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div
              className="animate-scale-in"
              style={{
                position: 'absolute',
                bottom: isCollapsed ? 60 : 68,
                left: isCollapsed ? 10 : 14,
                right: isCollapsed ? 'auto' : 14,
                width: isCollapsed ? 200 : 'auto',
                background: 'var(--bg-card)',
                borderRadius: 12,
                boxShadow: 'var(--dropdown-shadow)',
                border: '1px solid var(--border-primary)',
                padding: 6,
                zIndex: 100,
              }}
            >
              <button
                onClick={toggleTheme}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'var(--text-primary)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                {theme === 'dark' ? <Sun style={{ width: 15, height: 15 }} /> : <Moon style={{ width: 15, height: 15 }} />}
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: 'transparent', color: 'var(--danger)',
                  cursor: 'pointer', fontSize: 12, fontWeight: 600, textAlign: 'left',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--danger-light)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <LogOut style={{ width: 15, height: 15 }} />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MAIN CONTENT — offset by sidebar width
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="flex flex-col min-w-0 h-full flex-1"
      >

        {/* ── Top Header Bar ─────────────────────────────────────── */}
        <header
          style={{
            height: 60, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '0 28px',
            background: 'var(--bg-card)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid var(--border-primary)',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          {/* Left: Mobile Menu + Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Mobile hamburger */}
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              style={{
                padding: 8, borderRadius: 8,
                border: '1px solid var(--border-primary)',
                background: 'transparent', color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {isMobileMenuOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
            </button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>BB24</span>
              <span>/</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {allItems.find(i => isActive(i.path))?.name || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right: Search + Notifications + Theme + Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Search trigger */}
            <button
              onClick={() => setIsSearchOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 14px', borderRadius: 8,
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-tertiary)', cursor: 'pointer',
                color: 'var(--text-muted)', fontSize: 12, fontWeight: 500,
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'}
            >
              <Search style={{ width: 14, height: 14 }} />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden md:inline" style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px',
                borderRadius: 4, background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)', color: 'var(--text-muted)',
              }}>⌘K</kbd>
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
                style={{
                  position: 'relative', padding: 8, borderRadius: 8,
                  border: '1px solid var(--border-primary)',
                  background: 'transparent', cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <Bell style={{ width: 16, height: 16 }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#ef4444', color: 'white',
                    fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{unreadCount}</span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div
                  className="animate-slide-down"
                  style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 360, background: 'var(--bg-card)',
                    borderRadius: 14, boxShadow: 'var(--dropdown-shadow)',
                    border: '1px solid var(--border-primary)',
                    zIndex: 100, overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>Notifications</span>
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: 11, fontWeight: 500, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.map(n => (
                      <div
                        key={n.id}
                        style={{
                          padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'flex-start',
                          borderBottom: '1px solid var(--border-secondary)',
                          background: n.read ? 'transparent' : 'var(--accent-glow)',
                          transition: 'background 150ms ease',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'var(--accent-glow)'}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', marginTop: 5, flexShrink: 0,
                          background: n.type === 'danger' ? 'var(--danger)' : n.type === 'warning' ? 'var(--warning)' : n.type === 'success' ? 'var(--success)' : 'var(--info)',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{n.text}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                padding: 8, borderRadius: 8,
                border: '1px solid var(--border-primary)',
                background: 'transparent', cursor: 'pointer',
                color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 150ms ease',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
            >
              {theme === 'dark' ? <Sun style={{ width: 16, height: 16 }} /> : <Moon style={{ width: 16, height: 16 }} />}
            </button>

            {/* Profile avatar in header */}
            <div 
              onClick={() => router.push('/dashboard/settings')}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)',
              }}
            >
              {session.firstName ? session.firstName[0].toUpperCase() : ''}{session.lastName ? session.lastName[0].toUpperCase() : ''}
            </div>
          </div>
        </header>

        {/* ── Mobile Nav Drawer ──────────────────────────────────── */}
        {isMobileMenuOpen && (
          <div className="lg:hidden" style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
            <div className="overlay" style={{ position: 'fixed', inset: 0 }} onClick={() => setIsMobileMenuOpen(false)} />
            <nav
              className="animate-drawer"
              style={{
                position: 'relative', width: 280, height: '100%', zIndex: 201,
                background: 'var(--sidebar-bg)', padding: '16px 14px',
                display: 'flex', flexDirection: 'column',
                borderRight: '1px solid var(--sidebar-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 14,
                  }}>B</div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>BB24</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{ padding: 6, borderRadius: 6, border: '1px solid var(--sidebar-border)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div className="sidebar-section-label">Workspace</div>
                {mainMenuItems.map(item => <NavItem key={item.path} item={item} collapsed={false} />)}
                <div className="sidebar-section-label" style={{ marginTop: 8 }}>Tools</div>
                {toolMenuItems.map(item => <NavItem key={item.path} item={item} collapsed={false} />)}
                <div className="sidebar-section-label" style={{ marginTop: 8 }}>System</div>
                {bottomMenuItems.map(item => <NavItem key={item.path} item={item} collapsed={false} />)}
              </div>

              <button
                onClick={handleLogout}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px', borderRadius: 10, border: 'none',
                  background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', marginTop: 12,
                }}
              >
                <LogOut style={{ width: 16, height: 16 }} /> Logout
              </button>
            </nav>
          </div>
        )}

        {/* ── Command Palette (Ctrl+K) ───────────────────────────── */}
        {isSearchOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 120 }}>
            <div className="overlay" style={{ position: 'fixed', inset: 0 }} onClick={() => setIsSearchOpen(false)} />
            <div
              className="animate-scale-in"
              style={{
                position: 'relative', width: '100%', maxWidth: 520,
                background: 'var(--bg-card)', borderRadius: 16,
                boxShadow: 'var(--modal-shadow)', border: '1px solid var(--border-primary)',
                overflow: 'hidden', zIndex: 301, margin: '0 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border-primary)' }}>
                <Search style={{ width: 18, height: 18, color: 'var(--text-muted)', flexShrink: 0 }} />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search pages, features..."
                  style={{
                    flex: 1, border: 'none', outline: 'none', background: 'transparent',
                    fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit',
                  }}
                />
                <kbd style={{
                  fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5,
                  background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
                  color: 'var(--text-muted)',
                }}>ESC</kbd>
              </div>
              <div style={{ maxHeight: 320, overflowY: 'auto', padding: 6 }}>
                {filteredSearch.map(item => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10,
                        color: 'var(--text-primary)', textDecoration: 'none',
                        fontSize: 13, fontWeight: 500,
                        transition: 'background 150ms ease',
                      }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <Icon style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                      {item.name}
                      <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-muted)', marginLeft: 'auto' }} />
                    </Link>
                  );
                })}
                {filteredSearch.length === 0 && (
                  <p style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No results found
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Page Content ───────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
          {children}
        </main>
      </div>

      {/* Click-away handler for dropdowns */}
      {(isNotifOpen || isProfileOpen) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => { setIsNotifOpen(false); setIsProfileOpen(false); }}
        />
      )}
    </div>
  );
}
