'use client';

import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/data-service';
import { MockClient, MockInvoice, MockEmployee, MockExpense } from '@/lib/mock-data';
import {
  BarChart3, TrendingUp, Users, Wallet, Download,
  Calendar, ChevronDown, FileText, ArrowUpRight,
  ArrowDownRight, IndianRupee, Clock, Filter,
} from 'lucide-react';

type ReportType = 'revenue' | 'clients' | 'team' | 'cashflow';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>('revenue');
  const [clients, setClients] = useState<MockClient[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('This Month');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [c, inv, emp, exp] = await Promise.all([
          dataService.getClients(), dataService.getInvoices(),
          dataService.getEmployees(), dataService.getExpenses(),
        ]);
        setClients(c); setInvoices(inv); setEmployees(emp); setExpenses(exp);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid var(--border-primary)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)' }}>Loading reports...</span>
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
  const netProfit = mrr - totalSalary - totalOpex;

  const reportTabs = [
    { key: 'revenue' as const, label: 'Revenue Report', icon: TrendingUp },
    { key: 'clients' as const, label: 'Client Retention', icon: Users },
    { key: 'team' as const, label: 'Team Productivity', icon: BarChart3 },
    { key: 'cashflow' as const, label: 'Cash Flow', icon: Wallet },
  ];

  const exportCSV = () => {
    let csv = '';
    if (activeReport === 'revenue') {
      csv = 'Metric,Amount\nMRR,' + mrr + '\nTotal Received,' + totalReceived + '\nBalance Pending,' + totalBalance + '\nTotal Salaries,' + totalSalary + '\nOperational Expenses,' + totalOpex + '\nNet Profit,' + netProfit;
    } else if (activeReport === 'clients') {
      csv = 'Company,Contact,Status,Monthly Fee,Received,Balance\n' +
        clients.map(c => `${c.companyName},${c.contactPerson},${c.status},${c.monthlyFee},${c.received},${c.balance}`).join('\n');
    } else if (activeReport === 'team') {
      csv = 'Name,Position,Department,Salary,Performance,Productivity\n' +
        employees.map(e => `${e.name},${e.position},${e.department},${e.salary},${e.performanceScore},${e.productivityScore}`).join('\n');
    } else {
      csv = 'Invoice,Client,Amount,Status,Due Date\n' +
        invoices.map(i => `${i.invoiceNumber},${i.clientName},${i.amount},${i.status},${i.dueDate}`).join('\n');
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `bb24_${activeReport}_report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Reports Center</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Pre-built analytics for data-driven decisions</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-card)',
            fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer',
          }}>
            <Calendar style={{ width: 14, height: 14 }} /> {dateRange} <ChevronDown style={{ width: 12, height: 12 }} />
          </button>
          <button onClick={exportCSV} className="btn btn-primary btn-sm">
            <Download style={{ width: 14, height: 14 }} /> Export CSV
          </button>
        </div>
      </div>

      {/* Report Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {reportTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveReport(tab.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 10, border: 'none',
                background: isActive ? 'var(--accent)' : 'var(--bg-card)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(37,99,235,0.25)' : 'var(--card-shadow)',
                transition: 'all 150ms ease',
              }}
            >
              <Icon style={{ width: 16, height: 16 }} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Report Content */}
      <div className="animate-fade-up">
        {activeReport === 'revenue' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Monthly Revenue', value: mrr, trend: '+24%', up: true },
                { label: 'Collections', value: totalReceived, trend: '+18%', up: true },
                { label: 'Pending Balance', value: totalBalance, trend: totalBalance > 0 ? 'Attention' : 'Clear', up: false },
                { label: 'Net Profit', value: netProfit, trend: netProfit > 0 ? '+32%' : 'Loss', up: netProfit > 0 },
              ].map(item => (
                <div key={item.label} className="card" style={{ padding: 20, background: 'var(--bg-card)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>₹{item.value.toLocaleString('en-IN')}</h3>
                    <span className={item.up ? 'badge-success' : 'badge-danger'} style={{ fontSize: 10 }}>{item.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* P&L Table */}
            <div className="card" style={{ background: 'var(--bg-card)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Profit & Loss Statement</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Item</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>This Month</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Last Month</th>
                      <th style={{ padding: '12px 20px', textAlign: 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { item: 'Revenue (MRR)', current: mrr, previous: Math.round(mrr * 0.8), isIncome: true },
                      { item: 'Salaries', current: totalSalary, previous: totalSalary, isIncome: false },
                      { item: 'Operational Costs', current: totalOpex, previous: Math.round(totalOpex * 0.9), isIncome: false },
                      { item: 'Net Profit', current: netProfit, previous: Math.round(mrr * 0.8 - totalSalary - totalOpex * 0.9), isIncome: true },
                    ].map(row => {
                      const change = row.previous > 0 ? Math.round(((row.current - row.previous) / row.previous) * 100) : 0;
                      return (
                        <tr key={row.item} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                          <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: row.item === 'Net Profit' ? 700 : 500, color: 'var(--text-primary)' }}>{row.item}</td>
                          <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: row.isIncome ? 'var(--success)' : 'var(--text-primary)' }}>₹{row.current.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, color: 'var(--text-muted)' }}>₹{row.previous.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <span className={change >= 0 ? 'badge-success' : 'badge-danger'} style={{ fontSize: 10 }}>
                              {change >= 0 ? '+' : ''}{change}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeReport === 'clients' && (
          <div className="card" style={{ background: 'var(--bg-card)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Client Retention Report</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{clients.length} total clients • {activeClients.length} active</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {['Company', 'Status', 'Monthly Fee', 'Received', 'Balance', 'Health'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Company' ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => {
                    const health = c.balance === 0 ? 'Healthy' : c.received === 0 ? 'At Risk' : 'Warning';
                    const healthClass = health === 'Healthy' ? 'badge-success' : health === 'At Risk' ? 'badge-danger' : 'badge-warning';
                    return (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.companyName}</p>
                          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.contactPerson}</p>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span className={c.status === 'active' ? 'badge-success' : 'badge-warning'} style={{ fontSize: 10, textTransform: 'capitalize' }}>{c.status}</span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>₹{c.monthlyFee.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, color: 'var(--success)' }}>₹{c.received.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, color: c.balance > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>₹{c.balance.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span className={healthClass} style={{ fontSize: 10 }}>{health}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'team' && (
          <div className="card" style={{ background: 'var(--bg-card)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Team Productivity Report</h3>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{employees.length} team members</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                    {['Team Member', 'Position', 'Department', 'Performance', 'Productivity', 'Salary'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Team Member' ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map(e => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '50%',
                            background: `linear-gradient(135deg, hsl(${e.name.charCodeAt(0) * 7 % 360}, 60%, 55%), hsl(${e.name.charCodeAt(0) * 7 % 360 + 30}, 60%, 45%))`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: 11, fontWeight: 700,
                          }}>{e.name.charAt(0)}</div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{e.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>{e.position}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>{e.department}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <div style={{ width: 48, height: 5, borderRadius: 4, background: 'var(--bg-tertiary)' }}>
                            <div style={{ height: '100%', borderRadius: 4, background: e.performanceScore >= 80 ? 'var(--success)' : e.performanceScore >= 60 ? 'var(--warning)' : 'var(--danger)', width: `${e.performanceScore}%` }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', width: 30 }}>{e.performanceScore}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{e.productivityScore}%</span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>₹{e.salary.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReport === 'cashflow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {[
                { label: 'Total Inflow', value: totalReceived, color: 'var(--success)' },
                { label: 'Total Outflow', value: totalSalary + totalOpex, color: 'var(--danger)' },
                { label: 'Net Cash Flow', value: totalReceived - totalSalary - totalOpex, color: (totalReceived - totalSalary - totalOpex) >= 0 ? 'var(--success)' : 'var(--danger)' },
                { label: 'Pending Collections', value: totalBalance, color: 'var(--warning)' },
              ].map(item => (
                <div key={item.label} className="card" style={{ padding: 20, background: 'var(--bg-card)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 8 }}>{item.label}</p>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: item.color }}>₹{Math.abs(item.value).toLocaleString('en-IN')}</h3>
                </div>
              ))}
            </div>

            <div className="card" style={{ background: 'var(--bg-card)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-primary)' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Invoice Cash Flow</h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
                      {['Invoice', 'Client', 'Amount', 'Status', 'Due Date'].map(h => (
                        <th key={h} style={{ padding: '12px 20px', textAlign: h === 'Invoice' || h === 'Client' ? 'left' : 'right', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                        <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{inv.invoiceNumber}</td>
                        <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)' }}>{inv.clientName}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>₹{inv.amount.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <span className={inv.status === 'paid' ? 'badge-success' : inv.status === 'overdue' ? 'badge-danger' : 'badge-warning'} style={{ fontSize: 10, textTransform: 'capitalize' }}>{inv.status}</span>
                        </td>
                        <td style={{ padding: '14px 20px', textAlign: 'right', fontSize: 12, color: 'var(--text-muted)' }}>{inv.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
