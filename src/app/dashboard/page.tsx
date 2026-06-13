'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authHelper, UserSession } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import {
  MockClient, MockProject, MockMeeting, MockInvoice,
  MockEmployee, MockTask, MockExpense,
} from '@/lib/mock-data';
import {
  TrendingUp, TrendingDown, Users, Briefcase, Calendar,
  Activity, Plus, Wallet, Clock, CheckSquare, ChevronRight,
  AlertCircle, IndianRupee, Search, Bell, Moon, Sun,
  Download, CreditCard, User, ChevronDown, MoreHorizontal,
  Zap, Target, ArrowUpRight, ArrowDownRight, Eye,
  FileText, UserPlus, Receipt, CalendarPlus, BarChart3,
  AlertTriangle, Sparkles, ArrowRight, Video,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// KPI Card — Clean, dark-mode compatible
// ═══════════════════════════════════════════════════════════════
function KpiCard({ label, value, sub, icon: Icon, iconBg, trend, trendUp }: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; iconBg: string;
  trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="card card-interactive" style={{ padding: 20, background: 'var(--bg-card)', minHeight: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>{label}</p>
          <h3 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</h3>
          {sub && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>{sub}</p>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          {trend && (
            <span className={trendUp ? 'badge-success' : 'badge-danger'} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
              {trendUp ? <ArrowUpRight style={{ width: 12, height: 12 }} /> : <ArrowDownRight style={{ width: 12, height: 12 }} />}
              {trend}
            </span>
          )}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', flexShrink: 0,
          }}>
            <Icon style={{ width: 18, height: 18 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Section Card Wrapper
// ═══════════════════════════════════════════════════════════════
function SectionCard({ title, subtitle, children, action, actionLabel, actionHref, headerRight }: {
  title: string; subtitle?: string; children: React.ReactNode;
  action?: () => void; actionLabel?: string; actionHref?: string;
  headerRight?: React.ReactNode;
}) {
  return (
    <div className="card" style={{ background: 'var(--bg-card)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</p>}
        </div>
        {headerRight || (
          actionHref ? (
            <Link href={actionHref} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
              {actionLabel || 'View All'} <ChevronRight style={{ width: 14, height: 14 }} />
            </Link>
          ) : action ? (
            <button onClick={action} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>
              {actionLabel} <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          ) : null
        )}
      </div>
      <div style={{ padding: 20 }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Quick Action Button
// ═══════════════════════════════════════════════════════════════
function QuickAction({ icon: Icon, label, href, color }: {
  icon: React.ElementType; label: string; href: string; color: string;
}) {
  return (
    <Link href={href} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '16px 10px', borderRadius: 12, textDecoration: 'none',
      border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
      transition: 'all 150ms ease', cursor: 'pointer',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = color; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: 18, height: 18, color }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Dashboard
// ═══════════════════════════════════════════════════════════════
export default function CEODashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [clients, setClients] = useState<MockClient[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [meetings, setMeetings] = useState<MockMeeting[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const active = authHelper.getCurrentSession();
    if (!active) { router.push('/login'); return; }
    setSession(active);

    const fetchData = async () => {
      try {
        const [c, p, m, inv, e, t, exp] = await Promise.all([
          dataService.getClients(), dataService.getProjects(), dataService.getMeetings(),
          dataService.getInvoices(), dataService.getEmployees(), dataService.getTasks(),
          dataService.getExpenses(),
        ]);
        setClients(c); setProjects(p); setMeetings(m); setInvoices(inv);
        setEmployees(e); setTasks(t); setExpenses(exp);
      } catch (err) { console.error('Failed to load dashboard data', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [router]);

  if (loading || !session) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid var(--border-primary)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Loading workspace...</span>
        </div>
      </div>
    );
  }

  // ─── Computed Metrics ──────────────────────────────────────────
  const activeClients = clients.filter(c => c.status === 'active');
  const totalRevenue = activeClients.reduce((s, c) => s + c.monthlyFee, 0);
  const totalReceived = clients.reduce((s, c) => s + c.received, 0);
  const totalExpenseAmt = expenses.reduce((s, e) => s + e.amount, 0) + employees.reduce((s, e) => s + e.salary, 0);
  const netProfit = totalRevenue - totalExpenseAmt;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue');
  const upcomingMeetings = meetings.filter(m => m.status === 'scheduled').slice(0, 3);
  const pendingTasks = tasks.filter(t => t.status !== 'done');
  const completedTasks = tasks.filter(t => t.status === 'done');
  const taskCompletion = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Recent activity mock
  const recentActivity = [
    { id: '1', text: 'New client GS Ayurveda added to CRM', time: '2 hours ago', icon: UserPlus, color: '#10b981' },
    { id: '2', text: 'Invoice #INV-004 marked as paid — ₹28,000', time: '4 hours ago', icon: CheckSquare, color: '#3b82f6' },
    { id: '3', text: 'Meeting with Ashvastra Creation completed', time: '6 hours ago', icon: Video, color: '#8b5cf6' },
    { id: '4', text: 'Lead from LinkedIn: TechPulse Inc added', time: '8 hours ago', icon: Zap, color: '#f59e0b' },
    { id: '5', text: 'Expense logged: Office rent ₹35,000', time: 'Yesterday', icon: Receipt, color: '#ef4444' },
  ];

  // ═══════════════════════════════════════════════════════════════
  // FOUNDER DASHBOARD — Command Center
  // ═══════════════════════════════════════════════════════════════
  const renderFounderDashboard = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Welcome Banner ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              Good morning, Neha! 👋
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, fontWeight: 500 }}>
              Here&apos;s your business at a glance. {overdueInvoices.length > 0 && (
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                  {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} need attention.
                </span>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{
              padding: '7px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
              color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Calendar style={{ width: 14, height: 14 }} />
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        {/* ── Overdue Alert Banner ── */}
        {overdueInvoices.length > 0 && (
          <div className="animate-fade-up" style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'var(--danger-light)', border: '1px solid var(--danger-border)',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <AlertTriangle style={{ width: 18, height: 18, color: 'var(--danger)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)' }}>
                {overdueInvoices.length} overdue invoice{overdueInvoices.length > 1 ? 's' : ''} totaling ₹{overdueInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString('en-IN')}
              </p>
            </div>
            <Link href="/dashboard/finance" style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              Review <ArrowRight style={{ width: 14, height: 14 }} />
            </Link>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <KpiCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} sub="Monthly recurring" icon={IndianRupee} iconBg="linear-gradient(135deg, #3b82f6, #6366f1)" trend="+24%" trendUp />
          <KpiCard label="Cash Received" value={`₹${totalReceived.toLocaleString('en-IN')}`} sub="Collections this month" icon={Download} iconBg="linear-gradient(135deg, #10b981, #059669)" trend="+18%" trendUp />
          <KpiCard label="Net Profit" value={`₹${netProfit.toLocaleString('en-IN')}`} sub="After all expenses" icon={TrendingUp} iconBg="linear-gradient(135deg, #8b5cf6, #6366f1)" trend={netProfit > 0 ? '+32%' : '-5%'} trendUp={netProfit > 0} />
          <KpiCard label="Active Clients" value={`${activeClients.length}`} sub={`${clients.length} total clients`} icon={Users} iconBg="linear-gradient(135deg, #f59e0b, #d97706)" />
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Quick Actions</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
            <QuickAction icon={UserPlus} label="Add Client" href="/dashboard/clients" color="#3b82f6" />
            <QuickAction icon={Receipt} label="Create Invoice" href="/dashboard/finance" color="#10b981" />
            <QuickAction icon={CalendarPlus} label="Schedule Meet" href="/dashboard/meetings" color="#8b5cf6" />
            <QuickAction icon={Zap} label="Add Lead" href="/dashboard/leads" color="#f59e0b" />
            <QuickAction icon={FileText} label="View Reports" href="/dashboard/reports" color="#06b6d4" />
            <QuickAction icon={Sparkles} label="Ask AI" href="/dashboard/ai" color="#ec4899" />
          </div>
        </div>

        {/* ── Charts Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

          {/* Revenue Overview Line Chart */}
          <SectionCard title="Revenue Overview" subtitle="Monthly revenue trend"
            headerRight={<span className="badge-blue" style={{ fontSize: 10 }}>This Month</span>}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <h4 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalRevenue.toLocaleString('en-IN')}</h4>
              <span className="badge-success" style={{ fontSize: 10, padding: '2px 8px' }}>▲ +24%</span>
            </div>
            <div style={{ height: 180, position: 'relative' }}>
              <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="4,4" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="4,4" />
                <path d="M 15 130 C 60 120, 80 95, 110 100 C 140 105, 170 125, 205 115 C 240 105, 270 50, 300 50 C 330 50, 360 85, 395 80 C 430 75, 460 70, 485 70 L 485 160 L 15 160 Z" fill="url(#lineGrad)" />
                <path d="M 15 130 C 60 120, 80 95, 110 100 C 140 105, 170 125, 205 115 C 240 105, 270 50, 300 50 C 330 50, 360 85, 395 80 C 430 75, 460 70, 485 70" fill="none" stroke="var(--chart-1)" strokeWidth="3" strokeLinecap="round" />
                {[[15,130],[110,100],[205,115],[300,50],[395,80],[485,70]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="4.5" fill={i===3 ? 'var(--chart-1)' : 'var(--bg-card)'} stroke="var(--chart-1)" strokeWidth="2.5" />
                ))}
                <rect x="268" y="10" width="64" height="28" rx="6" fill="var(--sidebar-bg)" />
                <polygon points="295,38 305,38 300,43" fill="var(--sidebar-bg)" />
                <text x="300" y="27" fill="#ffffff" fontSize="9.5" fontWeight="bold" textAnchor="middle">₹65,400</text>
              </svg>
              <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
                {['1 Jun','6 Jun','11 Jun','16 Jun','21 Jun','23 Jun'].map(d => (
                  <span key={d} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Income vs Expenses Donut */}
          <SectionCard title="Income vs Expenses" subtitle="Financial breakdown"
            headerRight={<span className="badge-blue" style={{ fontSize: 10 }}>This Month</span>}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: 140, height: 140 }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--chart-5)" strokeWidth="4.5" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--chart-4)" strokeWidth="4.5" strokeDasharray="33.9 88" strokeDashoffset="-44" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--chart-2)" strokeWidth="4.5" strokeDasharray="44 88" strokeDashoffset="0" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalRevenue.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Income', value: totalRevenue, color: 'var(--chart-2)' },
                  { label: 'Expenses', value: totalExpenseAmt, color: 'var(--chart-4)' },
                  { label: 'Profit', value: netProfit, color: 'var(--chart-5)' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Goals + Activity + Meetings Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>

          {/* Goal Progress */}
          <SectionCard title="Goal Progress" subtitle="Monthly targets">
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 24 }}>
              {[
                { label: 'Revenue', value: 78, target: '₹4L', color: 'var(--chart-1)' },
                { label: 'Clients', value: Math.min(Math.round((activeClients.length / 30) * 100), 100), target: '30', color: 'var(--chart-2)' },
                { label: 'Tasks', value: taskCompletion, target: `${tasks.length}`, color: 'var(--chart-5)' },
              ].map(goal => (
                <div key={goal.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <circle cx="18" cy="18" r="15" fill="none" stroke="var(--border-primary)" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke={goal.color} strokeWidth="3"
                        strokeDasharray={`${goal.value * 0.942} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>{goal.value}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>{goal.label}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Target: {goal.target}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard title="Recent Activity" subtitle="Latest updates" actionHref="/dashboard/reports" actionLabel="View All">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {recentActivity.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0',
                    borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border-secondary)' : 'none',
                  }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                      background: item.color + '15',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 14, height: 14, color: item.color }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.text}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Upcoming Meetings */}
          <SectionCard title="Upcoming Meetings" subtitle={`${upcomingMeetings.length} scheduled`} actionHref="/dashboard/meetings" actionLabel="Calendar">
            {upcomingMeetings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {upcomingMeetings.map(m => (
                  <div key={m.id} style={{
                    padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border-primary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 150ms ease', cursor: 'pointer',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</p>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {new Date(m.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {m.duration} min
                      </p>
                    </div>
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: 10, padding: '4px 12px' }}
                        onClick={e => e.stopPropagation()}
                      >Join</a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No upcoming meetings</p>
            )}
          </SectionCard>
        </div>

        {/* ── Team Workload + Cash Flow Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

          {/* Team Workload */}
          <SectionCard title="Team Workload" subtitle="Task distribution" actionHref="/dashboard/team" actionLabel="Manage Team">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {employees.slice(0, 5).map(emp => {
                const empTasks = tasks.filter(t => t.assignedTo.toLowerCase().includes(emp.name.split(' ')[0].toLowerCase()));
                const completedEmp = empTasks.filter(t => t.status === 'done').length;
                const totalEmp = empTasks.length || 1;
                const pct = Math.round((completedEmp / totalEmp) * 100);
                return (
                  <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 30, height: 30, borderRadius: '50%',
                      background: `linear-gradient(135deg, hsl(${emp.name.charCodeAt(0) * 7 % 360}, 60%, 55%), hsl(${emp.name.charCodeAt(0) * 7 % 360 + 30}, 60%, 45%))`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0,
                    }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{empTasks.length} tasks</span>
                      </div>
                      <div style={{ width: '100%', height: 5, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: pct > 70 ? 'var(--success)' : pct > 40 ? 'var(--warning)' : 'var(--danger)', width: `${pct}%`, transition: 'width 500ms ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Cash Flow Bar Chart */}
          <SectionCard title="Cash Flow" subtitle="Weekly inflow vs outflow"
            headerRight={<span className="badge-blue" style={{ fontSize: 10 }}>This Month</span>}
          >
            <div style={{ height: 180, position: 'relative' }}>
              <svg viewBox="0 0 320 180" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="flow-green" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="flow-red" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#ef4444" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="20" x2="320" y2="20" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="55" x2="320" y2="55" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="90" x2="320" y2="90" stroke="var(--border-hover)" strokeWidth="1.2" />
                <line x1="0" y1="125" x2="320" y2="125" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="0" y1="160" x2="320" y2="160" stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                <text x="5" y="24" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">₹100K</text>
                <text x="5" y="59" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">₹50K</text>
                <text x="5" y="94" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">₹0</text>
                <text x="5" y="129" fill="var(--text-muted)" fontSize="8.5" fontWeight="bold">-₹50K</text>
                <rect x="80" y="65" width="18" height="25" rx="4" fill="url(#flow-green)" />
                <rect x="140" y="45" width="18" height="45" rx="4" fill="url(#flow-green)" />
                <rect x="200" y="90" width="18" height="55" rx="4" fill="url(#flow-red)" />
                <rect x="260" y="40" width="18" height="50" rx="4" fill="url(#flow-green)" />
              </svg>
              <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', paddingLeft: 50 }}>
                {['1-7 Jun','8-14 Jun','15-21 Jun','22+ Jun'].map(d => (
                  <span key={d} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Bottom Row: Financial Trends + Top Expenses ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

          {/* Financial Trends */}
          <SectionCard title="Financial Trends" subtitle="Revenue vs expenses over time"
            headerRight={
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--chart-1)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>Revenue</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--chart-4)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>Expenses</span>
                </div>
              </div>
            }
          >
            <div style={{ height: 180, position: 'relative' }}>
              <svg viewBox="0 0 500 160" style={{ width: '100%', height: '100%' }} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="area-pink" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-4)" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="var(--chart-4)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {[30,65,100,135].map(y => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="var(--border-primary)" strokeWidth="1" strokeDasharray="3,3" />
                ))}
                <path d="M 60 120 C 120 125, 170 100, 220 110 C 270 95, 340 60, 400 35 C 430 35, 460 25, 480 20 L 480 160 L 60 160 Z" fill="url(#area-blue)" />
                <path d="M 60 135 C 120 130, 170 128, 220 125 C 270 118, 340 90, 400 55 C 430 65, 460 55, 480 50 L 480 160 L 60 160 Z" fill="url(#area-pink)" opacity="0.8" />
                <path d="M 60 120 C 120 125, 170 100, 220 110 C 270 95, 340 60, 400 35 C 430 35, 460 25, 480 20" fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 60 135 C 120 130, 170 128, 220 125 C 270 118, 340 90, 400 55 C 430 65, 460 55, 480 50" fill="none" stroke="var(--chart-4)" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              <div style={{ position: 'absolute', bottom: -4, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', paddingLeft: 50, paddingRight: 10 }}>
                {['Jan','Feb','Mar','Apr','May','Jun'].map(d => (
                  <span key={d} style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)' }}>{d}</span>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Top Expense Categories */}
          <SectionCard title="Top Expenses" subtitle="Category breakdown">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { name: 'Salaries', amount: 120000, pct: 50, icon: Users, color: 'var(--chart-1)' },
                { name: 'Marketing', amount: 54000, pct: 23, icon: TrendingUp, color: 'var(--chart-2)' },
                { name: 'Operations', amount: 42500, pct: 18, icon: Briefcase, color: 'var(--chart-3)' },
                { name: 'Others', amount: 24000, pct: 9, icon: MoreHorizontal, color: 'var(--chart-5)' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: item.color + '18',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon style={{ width: 14, height: 14, color: item.color }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>₹{item.amount.toLocaleString('en-IN')}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{item.pct}%</span>
                        </div>
                      </div>
                      <div style={{ width: '100%', height: 5, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: item.color, width: `${item.pct}%`, transition: 'width 600ms ease' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // CLIENT PORTAL
  // ═══════════════════════════════════════════════════════════════
  const renderClientDashboard = () => {
    const clientProjects = projects.filter(p => p.clientName.toLowerCase().includes(session.organizationName.toLowerCase()) || p.clientName.toLowerCase().includes(session.firstName.toLowerCase()));
    const clientInvoices = invoices.filter(i => i.clientName.toLowerCase().includes(session.organizationName.toLowerCase()) || i.clientName.toLowerCase().includes(session.firstName.toLowerCase()));
    const totalPending = clientInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Client Hub</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Your campaigns and billing at a glance.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Active Campaigns" value={`${clientProjects.length}`} sub="Running" icon={Briefcase} iconBg="linear-gradient(135deg, #3b82f6, #6366f1)" />
          <KpiCard label="Pending Invoice" value={`₹${totalPending.toLocaleString('en-IN')}`} sub="Due soon" icon={Clock} iconBg="linear-gradient(135deg, #ef4444, #dc2626)" />
          <KpiCard label="Tasks Done" value={`${tasks.filter(t => t.status === 'done').length}`} sub="Milestones" icon={CheckSquare} iconBg="linear-gradient(135deg, #10b981, #059669)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <SectionCard title="Campaign Progress">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {clientProjects.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{p.completionRate}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                    <div style={{ height: '100%', borderRadius: 4, background: 'var(--accent)', width: `${p.completionRate}%`, transition: 'width 500ms ease' }} />
                  </div>
                </div>
              ))}
              {clientProjects.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No active campaigns.</p>}
            </div>
          </SectionCard>
          <SectionCard title="Invoices">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clientInvoices.map(inv => (
                <div key={inv.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-primary)',
                }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoiceNumber}</p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Due: {inv.dueDate}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>₹{inv.amount.toLocaleString('en-IN')}</p>
                    <span className={inv.status === 'paid' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 10 }}>{inv.status}</span>
                  </div>
                </div>
              ))}
              {clientInvoices.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No invoices found.</p>}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  // ═══════════════════════════════════════════════════════════════
  // EMPLOYEE PORTAL
  // ═══════════════════════════════════════════════════════════════
  const renderEmployeeDashboard = () => {
    const myTasks = tasks.filter(t => t.assignedTo.toLowerCase().includes(session.firstName.toLowerCase()) || t.assignedTo.toLowerCase().includes('team'));
    const pendingMyTasks = myTasks.filter(t => t.status !== 'done');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Team Workspace</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Track tasks and meetings.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <KpiCard label="Open Tasks" value={`${pendingMyTasks.length}`} sub="This week" icon={CheckSquare} iconBg="linear-gradient(135deg, #3b82f6, #6366f1)" />
          <KpiCard label="Productivity" value="95%" sub="Performance score" icon={Activity} iconBg="linear-gradient(135deg, #10b981, #059669)" />
          <KpiCard label="Meetings" value={`${meetings.filter(m => m.status === 'scheduled').length}`} sub="Upcoming" icon={Calendar} iconBg="linear-gradient(135deg, #f59e0b, #d97706)" />
        </div>
        <SectionCard title="My Tasks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myTasks.map(task => (
              <div key={task.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border-primary)',
              }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{task.projectName}</p>
                </div>
                <span className="badge-blue" style={{ fontSize: 10, textTransform: 'capitalize' }}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {myTasks.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No tasks assigned.</p>}
          </div>
        </SectionCard>
      </div>
    );
  };

  if (session.role === 'client') return renderClientDashboard();
  if (session.role === 'employee') return renderEmployeeDashboard();
  return renderFounderDashboard();
}
