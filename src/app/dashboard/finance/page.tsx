'use client';
import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/data-service';
import { MockClient, MockInvoice, MockExpense, MockEmployee } from '@/lib/mock-data';
import { IndianRupee, TrendingUp, TrendingDown, Wallet, AlertCircle, CheckCircle, Clock, Download } from 'lucide-react';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses'>('overview');

  const [clients, setClients] = useState<MockClient[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [c, inv, exp, emp] = await Promise.all([
          dataService.getClients(),
          dataService.getInvoices(),
          dataService.getExpenses(),
          dataService.getEmployees(),
        ]);
        setClients(c);
        setInvoices(inv);
        setExpenses(exp);
        setEmployees(emp);
      } catch (err) {
        console.error('Failed to fetch finance metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading financial hub...</span>
        </div>
      </div>
    );
  }

  const activeClients = clients.filter(c => c.status === 'active');
  const mrr = activeClients.reduce((s, c) => s + c.monthlyFee, 0);
  const totalReceived = clients.reduce((s, c) => s + c.received, 0);
  const totalBalance = clients.reduce((s, c) => s + c.balance, 0);
  const totalSalary = employees.reduce((s, e) => s + e.salary, 0);
  const totalOpex = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalSalary + totalOpex;
  const netProfit = mrr - totalExpenses;
  const margin = mrr > 0 ? Math.round((netProfit / mrr) * 100) : 0;

  const handleExport = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (activeTab === 'invoices') {
      filename = 'invoices_report.csv';
      headers = ['Invoice Number', 'Client Name', 'Amount (INR)', 'Due Date', 'Status'];
      rows = invoices.map(inv => [
        inv.invoiceNumber,
        inv.clientName,
        inv.amount.toString(),
        inv.dueDate,
        inv.status
      ]);
    } else if (activeTab === 'expenses') {
      filename = 'expenses_report.csv';
      headers = ['Type', 'Item/Employee Name', 'Details/Role', 'Amount (INR)'];
      expenses.forEach(exp => {
        rows.push(['Operational Expense', exp.name, exp.category, exp.amount.toString()]);
      });
      employees.forEach(emp => {
        rows.push(['Salary', emp.name, emp.position, emp.salary.toString()]);
      });
    } else {
      filename = 'pl_overview_report.csv';
      headers = ['Metric', 'Amount (INR) / Value'];
      rows = [
        ['Monthly Recurring Revenue (MRR)', mrr.toString()],
        ['Total Received', totalReceived.toString()],
        ['Outstanding Balance', totalBalance.toString()],
        ['Team Salaries Bill', totalSalary.toString()],
        ['Operational Expenses', totalOpex.toString()],
        ['Total Expenses', totalExpenses.toString()],
        ['Net Profit', netProfit.toString()],
        ['Net Margin (%)', margin.toString() + '%']
      ];
    }

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = [5000, 20000, 33000, 66000, 77000, mrr];

  const TABS = [
    { id: 'overview', label: 'P&L Overview' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'expenses', label: 'Expenses' },
  ] as const;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Finance Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Revenue, expenses, invoices and P&L at a glance.</p>
        </div>
        <button onClick={handleExport} className="ripple-container flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}>
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: `₹${mrr.toLocaleString('en-IN')}`, icon: IndianRupee, gradient: 'gradient-blue', sub: `${activeClients.length} active clients` },
          { label: 'Total Received', value: `₹${totalReceived.toLocaleString('en-IN')}`, icon: CheckCircle, gradient: 'gradient-success', sub: 'Collected this month' },
          { label: 'Outstanding', value: `₹${totalBalance.toLocaleString('en-IN')}`, icon: Clock, gradient: 'gradient-warning', sub: 'Pending collection' },
          { label: 'Net Profit', value: `${margin}% margin`, icon: netProfit >= 0 ? TrendingUp : TrendingDown, gradient: netProfit >= 0 ? 'gradient-purple' : 'gradient-danger', sub: `₹${Math.abs(netProfit).toLocaleString('en-IN')}` },
        ].map(c => (
          <div key={c.label} className="card p-5 animate-fade-up" style={{ background: 'var(--bg-secondary)' }}>
            <div className={`h-10 w-10 ${c.gradient} rounded-xl flex items-center justify-center text-white mb-3 shadow-sm`}>
              <c.icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-tertiary)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={activeTab === t.id
              ? { background: 'var(--bg-secondary)', color: 'var(--accent)', boxShadow: 'var(--card-shadow)' }
              : { color: 'var(--text-secondary)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h2 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Revenue Growth — H1 2026</h2>
              <span className="badge-blue">Jan–Jun 2026</span>
            </div>
            <div className="h-44 relative">
              <svg viewBox="0 0 500 160" className="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40, 80, 120].map(y => (
                  <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="var(--border-primary)" strokeWidth="0.8" strokeDasharray="4,4" />
                ))}
                <path d="M 0 155 Q 80 150 160 138 T 320 108 T 420 83 T 500 66 L 500 160 L 0 160 Z" fill="url(#finGrad)" />
                <path d="M 0 155 Q 80 150 160 138 T 320 108 T 420 83 T 500 66" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
                {[[0,155],[100,148],[200,131],[300,108],[400,83],[500,66]].map(([x,y],i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill={i===5?'var(--accent)':'var(--bg-secondary)'} stroke="var(--accent)" strokeWidth="2" />
                ))}
              </svg>
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {months.map((m,i) => (
                  <div key={m} className="text-center">
                    <div>{m}</div>
                    <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>₹{(revenueData[i]/1000).toFixed(0)}K</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>
              P&L Summary
            </h2>
            <div className="flex justify-center my-4 relative">
              <svg width="110" height="110" viewBox="0 0 36 36" className="transform -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3.5" stroke="var(--bg-tertiary)" />
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="3.5"
                  stroke={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'}
                  strokeDasharray={`${Math.min(Math.abs(margin),100)*0.88} 88`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>{margin}%</span>
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Margin</span>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Total Revenue', val: `₹${mrr.toLocaleString('en-IN')}`, color: 'var(--success)', dot: 'bg-green-500' },
                { label: 'Team Salaries', val: `₹${totalSalary.toLocaleString('en-IN')}`, color: 'var(--danger)', dot: 'bg-red-400' },
                { label: 'Operational', val: `₹${totalOpex.toLocaleString('en-IN')}`, color: 'var(--warning)', dot: 'bg-orange-400' },
                { label: 'Net Profit', val: `₹${netProfit.toLocaleString('en-IN')}`, color: netProfit>=0?'var(--success)':'var(--danger)', dot: 'bg-blue-500' },
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
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
          <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>All Invoices</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  {['Invoice No.', 'Client', 'Amount', 'Due Date', 'Status'].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv.id} className="transition-all" style={{ borderBottom: '1px solid var(--border-secondary)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                    <td className="py-3 px-3 font-medium" style={{ color: 'var(--accent)' }}>{inv.invoiceNumber}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-primary)' }}>{inv.clientName}</td>
                    <td className="py-3 px-3 font-semibold" style={{ color: 'var(--text-primary)' }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3" style={{ color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{
                        background: inv.status === 'paid' ? 'var(--success-light)' : inv.status === 'overdue' ? 'var(--danger-light)' : 'var(--warning-light)',
                        color: inv.status === 'paid' ? 'var(--success)' : inv.status === 'overdue' ? 'var(--danger)' : 'var(--warning)',
                      }}>{inv.status}</span>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No invoices generated.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>Monthly Expenses</h2>
            <div className="space-y-3">
              {expenses.map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{exp.category === 'rent' ? '🏢' : exp.category === 'food' ? '🍎' : exp.category === 'health' ? '💊' : exp.category === 'utility' ? '⚡' : '📦'}</span>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{exp.name}</span>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>₹{exp.amount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No expenses recorded.</p>
              )}
            </div>
            <div className="flex justify-between font-bold text-sm mt-4 pt-3" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
              <span>Total Operational</span>
              <span style={{ color: 'var(--danger)' }}>₹{totalOpex.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
            <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>Team Salaries</h2>
            <div className="space-y-3">
              {employees.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 rounded-xl" style={{ border: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 gradient-blue rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm">{emp.name[0]}</div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{emp.position}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>₹{emp.salary.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {employees.length === 0 && (
                <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>No employees recorded.</p>
              )}
            </div>
            <div className="flex justify-between font-bold text-sm mt-4 pt-3" style={{ borderTop: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
              <span>Total Salaries</span>
              <span style={{ color: 'var(--danger)' }}>₹{totalSalary.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
