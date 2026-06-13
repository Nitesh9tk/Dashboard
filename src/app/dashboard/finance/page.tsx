'use client';

import React, { useState, useEffect } from 'react';
import { dataService } from '@/lib/data-service';
import { MockClient, MockInvoice, MockExpense, MockEmployee } from '@/lib/mock-data';
import {
  IndianRupee, TrendingUp, TrendingDown, Wallet, AlertCircle,
  CheckCircle, Clock, Download, Plus, Search, Filter, Calendar,
  User, Check, X, FileText, PieChart, ShieldAlert, ArrowUpRight,
  ChevronDown, ArrowDownRight, RefreshCw, Trash2
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'P&L Statement' },
  { id: 'invoices', label: 'Invoice Manager' },
  { id: 'expenses', label: 'Expenses Log' },
] as const;

export default function FinanceHub() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'expenses'>('overview');

  const [clients, setClients] = useState<MockClient[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States (New Invoice)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceClient, setInvoiceClient] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // Form States (New Expense)
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<'rent' | 'food' | 'health' | 'utility' | 'other'>('other');

  // Search & Filter
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  const loadFinanceData = async () => {
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

      // Auto-compute invoice number (INV-XXX)
      const maxNum = inv.reduce((max, item) => {
        const match = item.invoiceNumber.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      const nextNum = `INV-${String(maxNum + 1).padStart(3, '0')}`;
      setInvoiceNumber(nextNum);
    } catch (err) {
      console.error('Failed to load finance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(invoiceAmount) || 0;
    const newInvoice: MockInvoice = {
      id: 'inv' + Date.now(),
      clientName: invoiceClient,
      invoiceNumber: invoiceNumber,
      amount: amount,
      dueDate: invoiceDueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'unpaid',
    };

    const saved = await dataService.saveInvoice(newInvoice);
    setInvoices(prev => [saved, ...prev]);
    setIsInvoiceModalOpen(false);

    // Reset Form
    setInvoiceAmount('');
    setInvoiceDueDate('');
    
    // Auto increment for next
    const match = invoiceNumber.match(/\d+/);
    if (match) {
      const nextVal = parseInt(match[0], 10) + 1;
      setInvoiceNumber(`INV-${String(nextVal).padStart(3, '0')}`);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(expenseAmount) || 0;
    const newExpense: MockExpense = {
      id: 'exp' + Date.now(),
      name: expenseName,
      amount: amount,
      category: expenseCategory,
    };

    const saved = await dataService.saveExpense(newExpense);
    setExpenses(prev => [...prev, saved]);
    setIsExpenseModalOpen(false);

    // Reset Form
    setExpenseName('');
    setExpenseAmount('');
    setExpenseCategory('other');
  };

  const handleRemoveInvoice = async (id: string) => {
    if (window.confirm("Remove this invoice?")) {
      await dataService.removeInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleToggleInvoicePaid = async (inv: MockInvoice) => {
    const nextStatus = inv.status === 'paid' ? 'unpaid' : 'paid';
    const updated: MockInvoice = {
      ...inv,
      status: nextStatus,
      paidAt: nextStatus === 'paid' ? new Date().toISOString().split('T')[0] : undefined
    };
    
    setInvoices(prev => prev.map(item => item.id === inv.id ? updated : item));
    await dataService.saveInvoice(updated);

    // Sync client balances
    const clientsList = await dataService.getClients();
    const client = clientsList.find(c => c.companyName.toLowerCase() === inv.clientName.toLowerCase());
    if (client) {
      const nextReceived = nextStatus === 'paid' ? client.received + inv.amount : Math.max(0, client.received - inv.amount);
      const nextBalance = nextStatus === 'paid' ? Math.max(0, client.balance - inv.amount) : client.balance + inv.amount;
      const updatedClient = {
        ...client,
        received: nextReceived,
        balance: nextBalance
      };
      await dataService.saveClient(updatedClient);
      setClients(prev => prev.map(c => c.id === client.id ? updatedClient : c));
    }
  };

  // Math summaries
  const activeClients = clients.filter(c => c.status === 'active');
  const mrr = activeClients.reduce((s, c) => s + c.monthlyFee, 0);
  const totalReceived = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalBalance = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const totalSalary = employees.reduce((s, e) => s + e.salary, 0);
  const totalOpex = expenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalSalary + totalOpex;
  const netProfit = totalReceived - totalExpenses;
  const margin = totalReceived > 0 ? Math.round((netProfit / totalReceived) * 100) : 0;

  // Expense categories breakdown
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);
  categoryTotals['salaries'] = totalSalary;

  const exportReport = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    if (activeTab === 'invoices') {
      filename = `invoices_export_${Date.now()}.csv`;
      headers = ['Invoice No', 'Client', 'Amount (₹)', 'Due Date', 'Status'];
      rows = invoices.map(i => [i.invoiceNumber, i.clientName, i.amount.toString(), i.dueDate, i.status]);
    } else if (activeTab === 'expenses') {
      filename = `expenses_export_${Date.now()}.csv`;
      headers = ['Category', 'Item/Payee', 'Amount (₹)'];
      expenses.forEach(e => rows.push([e.category, e.name, e.amount.toString()]));
      employees.forEach(emp => rows.push(['Salary', emp.name, emp.salary.toString()]));
    } else {
      filename = `pl_statement_${Date.now()}.csv`;
      headers = ['Category', 'Details', 'Amount (₹)'];
      rows = [
        ['Revenue', 'Total Received Invoices', totalReceived.toString()],
        ['Revenue', 'Outstanding Collections', totalBalance.toString()],
        ['Expense', 'Team Salaries payroll', totalSalary.toString()],
        ['Expense', 'Operational Expenses', totalOpex.toString()],
        ['Summary', 'Net Profit Margin', netProfit.toString()],
        ['Summary', 'EBITDA Margin %', margin.toString() + '%']
      ];
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.map(v => `"${v}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
                          inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase());
    const matchesFilter = invoiceFilter === 'all' ? true : inv.status === invoiceFilter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading financial hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Finance Hub</h1>
          <p className="text-text-secondary text-sm mt-1">Track monthly profit & loss statements, generate clients billing, and monitor payroll expenses.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportReport}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-bg-secondary text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg border border-border-primary transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Export Data
          </button>
          <button
            onClick={() => {
              if (activeTab === 'expenses') setIsExpenseModalOpen(true);
              else setIsInvoiceModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white hover:opacity-90 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer animate-pulse-soft"
          >
            <Plus className="h-4 w-4" />
            {activeTab === 'expenses' ? 'Log Expense' : 'Create Invoice'}
          </button>
        </div>
      </div>

      {/* ── KPI Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Receipts (Collected)', value: `₹${totalReceived.toLocaleString('en-IN')}`, sub: 'Cash collections this month', icon: CheckCircle, color: 'var(--success)' },
          { label: 'Outstanding Invoices', value: `₹${totalBalance.toLocaleString('en-IN')}`, sub: 'Pending cash intake', icon: Clock, color: 'var(--warning)' },
          { label: 'Operational Costs', value: `₹${totalExpenses.toLocaleString('en-IN')}`, sub: 'Salaries + operational bills', icon: TrendingDown, color: 'var(--danger)' },
          { label: 'Net Profit Margin', value: `₹${netProfit.toLocaleString('en-IN')}`, sub: `${margin}% margin index`, icon: TrendingUp, color: 'var(--accent)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-4 flex items-center justify-between bg-bg-secondary">
              <div>
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">{stat.label}</span>
                <span className="text-lg font-extrabold text-text-primary block mt-1">{stat.value}</span>
                <span className="text-[10px] text-text-secondary block mt-0.5">{stat.sub}</span>
              </div>
              <div className="p-2.5 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.color + '15', color: stat.color }}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tabs selector ── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-bg-tertiary">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === t.id
                ? 'bg-bg-secondary text-brand-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content: P&L Statement ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          
          {/* Main Statement */}
          <div className="lg:col-span-2 card bg-bg-secondary p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5">
              Income Statement (Profit & Loss)
            </h3>
            
            <div className="space-y-1">
              <table className="w-full text-left text-xs border-collapse">
                <tbody>
                  {/* Revenue */}
                  <tr className="bg-bg-tertiary/40 font-bold border-y border-border-primary text-text-primary">
                    <td className="py-2.5 px-3">Revenue / Collections</td>
                    <td className="py-2.5 px-3 text-right">₹{totalReceived.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="text-text-secondary border-b border-border-secondary">
                    <td className="py-2 px-6">Client Invoiced Retainers (Paid)</td>
                    <td className="py-2 px-3 text-right">₹{totalReceived.toLocaleString('en-IN')}</td>
                  </tr>
                  
                  {/* Operating Costs */}
                  <tr className="bg-bg-tertiary/40 font-bold border-b border-border-primary text-text-primary">
                    <td className="py-2.5 px-3">Cost of Sales & Operations</td>
                    <td className="py-2.5 px-3 text-right">₹{totalExpenses.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="text-text-secondary border-b border-border-secondary">
                    <td className="py-2 px-6">Team Salaries & Payroll</td>
                    <td className="py-2 px-3 text-right">₹{totalSalary.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="text-text-secondary border-b border-border-secondary">
                    <td className="py-2 px-6">Operational expenses (Rent, utilities, software)</td>
                    <td className="py-2 px-3 text-right">₹{totalOpex.toLocaleString('en-IN')}</td>
                  </tr>

                  {/* Summary */}
                  <tr className="bg-bg-tertiary/40 font-bold border-y border-border-primary text-text-primary">
                    <td className="py-2.5 px-3 text-sm">Operating Profit (EBITDA)</td>
                    <td className="py-2.5 px-3 text-right text-sm" style={{ color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                      ₹{netProfit.toLocaleString('en-IN')}
                    </td>
                  </tr>
                  <tr className="text-text-secondary border-b border-border-secondary">
                    <td className="py-2 px-6">Operating Margin Ratio</td>
                    <td className="py-2 px-3 text-right font-semibold text-text-primary">{margin}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Tax disclaimer */}
            <div className="p-3 bg-bg-tertiary rounded-xl border border-border-primary text-[10px] text-text-secondary flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-brand-primary" />
              <span>Calculated based on paid invoices and recorded expenses. Tax liability estimates (18% GST) should be cross-referenced with your CA settings tab.</span>
            </div>
          </div>

          {/* Side: Category Breakdown */}
          <div className="card bg-bg-secondary p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5">
              Expense Distribution
            </h3>
            
            {/* Donut Chart */}
            <div className="flex items-center justify-center py-4 border-b border-border-primary">
              <div className="relative w-36 h-36">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-primary)" strokeWidth="4" />
                  
                  {/* Salaries segment (roughly 60%) */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--chart-1)" strokeWidth="4"
                    strokeDasharray="60 100" strokeDashoffset="0" />
                  {/* Rent segment (roughly 20%) */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--chart-3)" strokeWidth="4"
                    strokeDasharray="20 100" strokeDashoffset="-60" />
                  {/* Utilities & Other (remaining 20%) */}
                  <circle cx="18" cy="18" r="14" fill="none" stroke="var(--chart-5)" strokeWidth="4"
                    strokeDasharray="20 100" strokeDashoffset="-80" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-extrabold text-text-primary">₹{totalExpenses.toLocaleString('en-IN')}</span>
                  <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">Total Cost</span>
                </div>
              </div>
            </div>

            {/* Category legends */}
            <div className="space-y-3 pt-2">
              {[
                { name: 'Salaries & Payroll', amt: totalSalary, color: 'var(--chart-1)' },
                { name: 'Office rent & spaces', amt: categoryTotals['rent'] || 0, color: 'var(--chart-3)' },
                { name: 'Utilities & Other Bills', amt: (categoryTotals['utility'] || 0) + (categoryTotals['other'] || 0) + (categoryTotals['food'] || 0) + (categoryTotals['health'] || 0), color: 'var(--chart-5)' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                    <span className="text-text-secondary font-medium">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-text-primary">₹{item.amt.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab Content: Invoices ── */}
      {activeTab === 'invoices' && (
        <div className="card bg-bg-secondary p-5 space-y-4 animate-fade-in">
          
          {/* Invoice filter bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-primary pb-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={e => setInvoiceSearch(e.target.value)}
                placeholder="Search invoice number, client..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
              />
            </div>
            
            <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-2 rounded-lg border border-border-primary w-fit self-end sm:self-auto">
              <Filter className="h-3.5 w-3.5 text-text-secondary" />
              <select
                value={invoiceFilter}
                onChange={e => setInvoiceFilter(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-text-secondary border-none outline-none cursor-pointer"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* Invoices List */}
          <div className="space-y-2">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map(inv => {
                const isExpanded = expandedInvoiceId === inv.id;
                return (
                  <div key={inv.id} className="border border-border-primary rounded-xl overflow-hidden">
                    <div
                      onClick={() => setExpandedInvoiceId(isExpanded ? null : inv.id)}
                      className="p-4 bg-bg-secondary hover:bg-bg-tertiary/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-text-primary">{inv.invoiceNumber}</span>
                            <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                              inv.status === 'paid' ? 'bg-success-light text-success' :
                              inv.status === 'overdue' ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'
                            }`}>
                              {inv.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">{inv.clientName}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-text-muted">Due date</p>
                          <p className="text-xs font-semibold text-text-primary">{inv.dueDate}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-extrabold text-sm text-text-primary">₹{inv.amount.toLocaleString('en-IN')}</span>
                          <button
                            onClick={e => { e.stopPropagation(); handleToggleInvoicePaid(inv); }}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                              inv.status === 'paid'
                                ? 'bg-bg-tertiary border-border-primary text-text-secondary'
                                : 'bg-success-light border-transparent text-success hover:opacity-90'
                            }`}
                          >
                            {inv.status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Expansion */}
                    {isExpanded && (
                      <div className="p-4 bg-bg-tertiary/30 border-t border-border-primary space-y-4 animate-slide-down">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Invoice Timeline</h4>
                          <button
                            onClick={() => handleRemoveInvoice(inv.id)}
                            className="text-[10px] font-bold text-danger flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" /> Delete Invoice
                          </button>
                        </div>

                        {/* Beautiful Timeline track */}
                        <div className="flex items-center justify-between relative max-w-md mx-auto py-2">
                          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-border-primary -translate-y-1/2 -z-10" />
                          {[
                            { step: 'Created', done: true, date: '1st of Month' },
                            { step: 'Sent', done: true, date: '1st of Month' },
                            { step: 'Viewed', done: true, date: '2nd of Month' },
                            { step: 'Paid', done: inv.status === 'paid', date: inv.paidAt || 'Pending' },
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-1.5 bg-bg-secondary p-1 rounded-xl border border-border-primary">
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                step.done ? 'bg-brand-success text-white' : 'bg-bg-tertiary text-text-muted'
                              }`}>
                                {step.done ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                              </div>
                              <span className="text-[10px] font-bold text-text-primary">{step.step}</span>
                              <span className="text-[8px] text-text-muted">{step.date}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-30" />
                <p className="text-xs text-text-secondary">No invoices matched your filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab Content: Expenses ── */}
      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          
          {/* Expenses List */}
          <div className="lg:col-span-2 card bg-bg-secondary p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5">
              Operating Expenditure List
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-primary text-text-secondary font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Item / Person</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-secondary">
                  {/* Salaries */}
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-bg-tertiary/20">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-text-primary">{emp.name}</p>
                        <p className="text-[9px] text-text-muted">Salary • {emp.position}</p>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-text-secondary">Payroll</td>
                      <td className="py-2.5 px-3 text-right font-bold text-text-primary">₹{emp.salary.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                  {/* Operational */}
                  {expenses.map(exp => (
                    <tr key={exp.id} className="hover:bg-bg-tertiary/20">
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-text-primary">{exp.name}</p>
                        <p className="text-[9px] text-text-muted">Operational bill</p>
                      </td>
                      <td className="py-2.5 px-3 capitalize text-text-secondary">{exp.category}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-text-primary">₹{exp.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Expense Rules card */}
          <div className="card bg-bg-secondary p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5">
              Policy & Payroll Info
            </h3>
            <div className="space-y-3 text-xs text-text-secondary">
              <p>1. Salaries are automatically compiled based on active employee records on the <strong>Team page</strong>.</p>
              <p>2. To log tax audits, please export the P&L statement and upload to CA portals directly.</p>
              <p>3. All items created offline sync dynamically with indexed databases on reconnection.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Invoice Modal Creator ── */}
      {isInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-extrabold text-base text-text-primary">Create Client Invoice</h3>
                <p className="text-xs text-text-secondary mt-0.5">Generate client billing request parameters.</p>
              </div>
              <button
                onClick={() => setIsInvoiceModalOpen(false)}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleAddInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Client Company</label>
                <select
                  required value={invoiceClient} onChange={e => setInvoiceClient(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="" disabled>Select Client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.companyName}>{c.companyName}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Invoice Number</label>
                  <input
                    type="text" required value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} placeholder="INV-008"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Amount (₹)</label>
                  <input
                    type="number" required value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} placeholder="25000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Due Date</label>
                <input
                  type="date" value={invoiceDueDate} onChange={e => setInvoiceDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox" id="recCheckbox" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-border-primary bg-bg-tertiary text-brand-primary cursor-pointer focus:ring-0"
                />
                <label htmlFor="recCheckbox" className="text-xs font-semibold text-text-secondary cursor-pointer">
                  Setup as recurring invoice (monthly auto-generation)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-primary">
                <button
                  type="button"
                  onClick={() => setIsInvoiceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-primary hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Log Expense Modal ── */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-extrabold text-base text-text-primary">Log Operational Expense</h3>
                <p className="text-xs text-text-secondary mt-0.5">Input receipts data for EBITDA statements.</p>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Item / Vendor Name</label>
                <input
                  type="text" required value={expenseName} onChange={e => setExpenseName(e.target.value)} placeholder="Office rent June"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Amount (₹)</label>
                  <input
                    type="number" required value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="35000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Category</label>
                  <select
                    value={expenseCategory} onChange={e => setExpenseCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="rent">Rent / Leases</option>
                    <option value="utility">Utilities & Software</option>
                    <option value="food">Meals & Travel</option>
                    <option value="health">Health & Perks</option>
                    <option value="other">Other Costs</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-primary">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-primary hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
