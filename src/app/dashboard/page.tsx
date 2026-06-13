'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHelper, UserSession } from '@/lib/auth';
import { dataService } from '@/lib/data-service';
import {
  MockClient, MockProject, MockMeeting, MockInvoice,
  MockEmployee, MockTask, MockExpense,
} from '@/lib/mock-data';
import {
  TrendingUp, TrendingDown, Users, Briefcase, Calendar,
  Activity, Plus, Wallet, Clock, CheckSquare, ChevronRight,
  AlertCircle, Building2, IndianRupee,
} from 'lucide-react';

// ─── Stat Card ────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, gradient, trend,
}: {
  label: string; value: string; sub?: string;
  icon: React.ElementType; gradient: string; trend?: string;
}) {
  return (
    <div className="card p-5 animate-fade-up" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex items-start justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl ${gradient} flex items-center justify-center text-white shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--success)' }}>
            <TrendingUp className="h-3 w-3" />{trend}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  );
}

// ─── Section Card ──────────────────────────────────────────────────
function SectionCard({ title, children, action, actionLabel }: {
  title: string; children: React.ReactNode; action?: () => void; actionLabel?: string;
}) {
  return (
    <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
      <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{title}</h2>
        {action && (
          <button onClick={action} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
            {actionLabel} <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default function CEODashboard() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  
  // Dashboard state
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
    if (!active) {
      router.push('/login');
      return;
    }
    setSession(active);

    const fetchData = async () => {
      try {
        const [c, p, m, inv, e, t, exp] = await Promise.all([
          dataService.getClients(),
          dataService.getProjects(),
          dataService.getMeetings(),
          dataService.getInvoices(),
          dataService.getEmployees(),
          dataService.getTasks(),
          dataService.getExpenses(),
        ]);
        setClients(c);
        setProjects(p);
        setMeetings(m);
        setInvoices(inv);
        setEmployees(e);
        setTasks(t);
        setExpenses(exp);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading workspace metrics...</span>
        </div>
      </div>
    );
  }

  // ─── Founder Dashboard ────────────────────────────────────────────
  const renderFounderDashboard = () => {
    const activeClients = clients.filter(c => c.status === 'active');
    const mrr = activeClients.reduce((sum, c) => sum + c.monthlyFee, 0);
    const totalReceived = clients.reduce((sum, c) => sum + c.received, 0);
    const totalBalance = clients.reduce((sum, c) => sum + c.balance, 0);
    const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0);
    const totalOpex = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = totalSalary + totalOpex;
    const netProfit = mrr - totalExpenses;
    const avgProjectCompletion = projects.length
      ? Math.round(projects.reduce((sum, p) => sum + p.completionRate, 0) / projects.length)
      : 0;

    const clientColors = [
      'gradient-blue', 'gradient-success', 'gradient-warning',
      'gradient-danger', 'gradient-purple', 'gradient-blue',
      'gradient-success', 'gradient-warning',
    ];

    return (
      <div className="space-y-6">
        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Welcome back 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening at <strong>{session.organizationName}</strong> today.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/dashboard/clients')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-blue shadow-sm hover:opacity-90 transition-all cursor-pointer">
              <Plus className="h-4 w-4" /> Add Client
            </button>
            <button onClick={() => router.push('/dashboard/leads')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}>
              View Leads
            </button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Monthly Revenue" value={`₹${mrr.toLocaleString('en-IN')}`}
            sub={`${activeClients.length} active clients`} icon={IndianRupee}
            gradient="gradient-blue" trend="+18%" />
          <StatCard label="Received" value={`₹${totalReceived.toLocaleString('en-IN')}`}
            sub={`₹${totalBalance.toLocaleString('en-IN')} pending`} icon={Wallet}
            gradient="gradient-success" />
          <StatCard label="Net Profit" value={`${netProfit >= 0 ? '+' : ''}₹${Math.abs(netProfit).toLocaleString('en-IN')}`}
            sub={`₹${totalExpenses.toLocaleString('en-IN')} expenses`} icon={netProfit >= 0 ? TrendingUp : TrendingDown}
            gradient={netProfit >= 0 ? 'gradient-purple' : 'gradient-danger'} />
          <StatCard label="Clients" value={`${activeClients.length}/${clients.length}`}
            sub="Active / Total" icon={Building2}
            gradient="gradient-warning" />
        </div>

        {/* ── Revenue Breakdown + P&L ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Client Revenue Bars */}
          <div className="lg:col-span-2 card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-5 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div>
                <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Client Revenue Breakdown</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Monthly fee per client with payment status</p>
              </div>
              <span className="badge-blue">June 2026</span>
            </div>

            <div className="space-y-4">
              {activeClients.sort((a, b) => b.monthlyFee - a.monthlyFee).map((client, idx) => {
                const pct = mrr > 0 ? Math.round((client.monthlyFee / mrr) * 100) : 0;
                const payStatus = client.balance === 0 ? 'Cleared' : client.received === 0 ? 'Unpaid' : 'Partial';
                const payColor = { Cleared: 'var(--success)', Unpaid: 'var(--danger)', Partial: 'var(--warning)' }[payStatus];
                const payBg = { Cleared: 'var(--success-light)', Unpaid: 'var(--danger-light)', Partial: 'var(--warning-light)' }[payStatus];

                return (
                  <div key={client.id}
                    className="p-3 rounded-xl cursor-pointer transition-all"
                    style={{ border: '1px solid var(--border-primary)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; (e.currentTarget as HTMLElement).style.background = ''; }}
                    onClick={() => router.push('/dashboard/clients')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`h-7 w-7 rounded-lg ${clientColors[idx % clientColors.length]} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
                          {client.companyName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{client.companyName}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{client.contractType.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: payBg, color: payColor }}>
                          {payStatus}
                        </span>
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          ₹{client.monthlyFee.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] w-7 text-right" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                      <div className={`h-full rounded-full ${clientColors[idx % clientColors.length]}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {activeClients.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'var(--text-muted)' }}>No active clients onboarded yet.</p>
              )}
            </div>

            {/* Total row */}
            <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Total Monthly Revenue</span>
              <span className="text-lg font-bold" style={{ color: 'var(--accent)' }}>₹{mrr.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* P&L + Expenses */}
          <div className="flex flex-col gap-4">
            {/* Profit Summary */}
            <div className="card p-5 flex-1" style={{ background: 'var(--bg-secondary)' }}>
              <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                P&L Summary
              </h2>
              {/* Mini donut */}
              <div className="flex justify-center my-3 relative">
                <svg width="90" height="90" viewBox="0 0 36 36" className="transform -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" stroke="var(--border-primary)" />
                  <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4"
                    stroke={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
                    strokeDasharray={`${mrr > 0 ? Math.min(Math.abs(netProfit / mrr) * 87.96, 87.96).toFixed(1) : 0} 87.96`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-bold" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {mrr > 0 ? Math.round((netProfit / mrr) * 100) : 0}%
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { label: 'Revenue', val: `₹${mrr.toLocaleString('en-IN')}`, color: 'var(--success)', dot: 'bg-green-500' },
                  { label: 'Expenses', val: `₹${totalExpenses.toLocaleString('en-IN')}`, color: 'var(--danger)', dot: 'bg-red-500' },
                  { label: 'Net Profit', val: `₹${netProfit.toLocaleString('en-IN')}`, color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', dot: 'bg-blue-500' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                      {item.label}
                    </span>
                    <span className="font-semibold" style={{ color: item.color }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
              <h2 className="font-semibold text-xs mb-3" style={{ color: 'var(--text-primary)' }}>Monthly Expenses</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>Salaries</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{totalSalary.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--text-secondary)' }}>Operational</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>₹{totalOpex.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>Total</span>
                  <span className="font-bold" style={{ color: 'var(--danger)' }}>₹{totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Revenue Trend Chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Trend Chart */}
          <div className="lg:col-span-2 card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Revenue Growth — H1 2026</h2>
              <span className="badge-blue">H1 2026</span>
            </div>
            <div className="h-44 relative">
              <svg viewBox="0 0 500 160" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40, 80, 120].map(y => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="var(--border-primary)" strokeWidth="0.8" strokeDasharray="4,4" />
                ))}
                <path d="M 0 155 Q 80 152 160 140 T 320 110 T 420 85 T 500 68 L 500 160 L 0 160 Z" fill="url(#blueGrad)" />
                <path d="M 0 155 Q 80 152 160 140 T 320 110 T 420 85 T 500 68" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                {[[0, 155], [100, 148], [200, 133], [300, 110], [400, 85], [500, 68]].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="3.5" fill={i === 5 ? '#2563eb' : 'var(--bg-secondary)'} stroke="#2563eb" strokeWidth="2" />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                <span>Jan<br/>₹5K</span>
                <span>Feb<br/>₹20K</span>
                <span>Mar<br/>₹33K</span>
                <span>Apr<br/>₹66K</span>
                <span>May<br/>₹77K</span>
                <span>Jun<br/>₹97.5K</span>
              </div>
            </div>
          </div>

          {/* Project Score */}
          <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>
              Project Delivery
            </h2>
            <div className="flex justify-center my-3 relative">
              <svg width="100" height="100" viewBox="0 0 36 36" className="transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3.5" stroke="var(--bg-tertiary)" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3.5" stroke="var(--accent)"
                  strokeDasharray={`${(avgProjectCompletion / 100) * 87.96} 87.96`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{avgProjectCompletion}%</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Done</span>
              </div>
            </div>

            <div className="space-y-3 mt-2">
              {projects.map(p => (
                <div key={p.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{p.clientName}</span>
                    <span className="font-semibold ml-2 shrink-0" style={{ color: 'var(--accent)' }}>{p.completionRate}%</span>
                  </div>
                  <div className="h-1 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full gradient-blue" style={{ width: `${p.completionRate}%` }} />
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No active projects.</p>
              )}
            </div>

            <div className="flex justify-around mt-4 pt-3 text-center" style={{ borderTop: '1px solid var(--border-primary)' }}>
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{projects.filter(p => p.status === 'active').length}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Active</p>
              </div>
              <div style={{ width: '1px', background: 'var(--border-primary)' }} />
              <div>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{employees.length}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Team</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Meetings + Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Upcoming Meetings">
            <div className="space-y-3">
              {meetings.filter(m => m.status === 'scheduled').slice(0, 3).map(meeting => (
                <div key={meeting.id} className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ border: '1px solid var(--border-primary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{meeting.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(meeting.scheduledAt).toLocaleString('en-IN', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        hour: 'numeric', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <a href={meeting.link} target="_blank" rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white gradient-blue hover:opacity-90 transition-all shrink-0">
                    Join
                  </a>
                </div>
              ))}
              {meetings.filter(m => m.status === 'scheduled').length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No upcoming meetings scheduled.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Pending Collections" action={() => router.push('/dashboard/clients')} actionLabel="View All">
            <div className="space-y-3">
              {clients.filter(c => c.balance > 0).slice(0, 3).map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-xl"
                  style={{ border: '1px solid var(--border-primary)', background: 'var(--danger-light)' }}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--danger)' }} />
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{client.companyName}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>Balance due</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold" style={{ color: 'var(--danger)' }}>₹{client.balance.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {clients.filter(c => c.balance > 0).length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-success)', fontWeight: 600 }}>All invoices are cleared! 🎉</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  // ─── Client Portal ─────────────────────────────────────────────────
  const renderClientDashboard = () => {
    // Filter projects and invoices dynamically based on client name/organization
    const clientProjects = projects.filter(p => p.clientName.toLowerCase().includes(session.organizationName.toLowerCase()) || p.clientName.toLowerCase().includes(session.firstName.toLowerCase()));
    const clientInvoices = invoices.filter(i => i.clientName.toLowerCase().includes(session.organizationName.toLowerCase()) || i.clientName.toLowerCase().includes(session.firstName.toLowerCase()));
    const totalPending = clientInvoices.filter(i => i.status !== 'paid').reduce((s, i) => s + i.amount, 0);
    const paidTasksCount = tasks.filter(t => t.status === 'done' && clientProjects.some(p => p.id === t.projectId)).length;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Client Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Your campaigns and billing at a glance.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Active Campaigns" value={`${clientProjects.length}`} sub="Running" icon={Briefcase} gradient="gradient-blue" />
          <StatCard label="Pending Invoice" value={`₹${totalPending.toLocaleString('en-IN')}`} sub="Due soon" icon={Clock} gradient="gradient-danger" />
          <StatCard label="Tasks Done MTD" value={`${paidTasksCount || 14}`} sub="Milestones" icon={CheckSquare} gradient="gradient-success" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="Campaign Progress">
            <div className="space-y-4">
              {clientProjects.map(p => (
                <div key={p.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <span style={{ color: 'var(--accent)' }}>{p.completionRate}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full gradient-blue" style={{ width: `${p.completionRate}%` }} />
                  </div>
                </div>
              ))}
              {clientProjects.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No active campaigns linked to your account.</p>
              )}
            </div>
          </SectionCard>
          <SectionCard title="Invoices">
            <div className="space-y-3">
              {clientInvoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-3 rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.invoiceNumber}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Due: {inv.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>₹{inv.amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] font-semibold" style={{ color: inv.status === 'paid' ? 'var(--success)' : 'var(--warning)' }}>
                      {inv.status}
                    </p>
                  </div>
                </div>
              ))}
              {clientInvoices.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No invoices found.</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    );
  };

  // ─── Employee Portal ────────────────────────────────────────────────
  const renderEmployeeDashboard = () => {
    // Dynamically filter tasks assigned to this employee
    const myTasks = tasks.filter(t => t.assignedTo.toLowerCase().includes(session.firstName.toLowerCase()) || t.assignedTo.toLowerCase().includes('team'));
    const pendingTasks = myTasks.filter(t => t.status !== 'done');
    const myPerformance = employees.find(e => e.name.toLowerCase().includes(session.firstName.toLowerCase()))?.productivityScore || 95;

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Team Workspace</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Track tasks and meetings.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Open Tasks" value={`${pendingTasks.length}`} sub="This week" icon={CheckSquare} gradient="gradient-blue" />
          <StatCard label="Productivity Index" value={`${myPerformance}%`} sub="Performance score" icon={Activity} gradient="gradient-success" />
          <StatCard label="Meetings" value={`${meetings.filter(m => m.status === 'scheduled').length}`} sub="Upcoming" icon={Calendar} gradient="gradient-warning" />
        </div>
        <SectionCard title="My Tasks">
          <div className="space-y-3">
            {myTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{task.projectName}</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {myTasks.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No tasks assigned to you.</p>
            )}
          </div>
        </SectionCard>
      </div>
    );
  };

  if (session.role === 'client') return renderClientDashboard();
  if (session.role === 'employee') return renderEmployeeDashboard();
  return renderFounderDashboard();
}
