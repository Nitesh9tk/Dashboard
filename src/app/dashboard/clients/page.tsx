'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockClient } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import {
  Search, Plus, Mail, Phone, Calendar, X, User,
  TrendingUp, AlertCircle, CheckCircle, Clock,
  Building2, IndianRupee, Trash2, ChevronRight,
  Edit2, ExternalLink, Download,
} from 'lucide-react';

// ─── Colour helpers ──────────────────────────────────────────────────
const GRADIENTS = [
  'gradient-blue', 'gradient-success', 'gradient-warning',
  'gradient-danger', 'gradient-purple', 'gradient-blue',
  'gradient-success', 'gradient-warning',
];

function payInfo(client: MockClient) {
  if (client.balance === 0) return { label: 'Cleared', bg: 'var(--success-light)', color: 'var(--success)' };
  if (client.received === 0) return { label: 'Unpaid', bg: 'var(--danger-light)', color: 'var(--danger)' };
  return { label: 'Partial', bg: 'var(--warning-light)', color: 'var(--warning)' };
}

function statusInfo(status: MockClient['status']) {
  const map = {
    active: { bg: 'var(--success-light)', color: 'var(--success)' },
    paused: { bg: 'var(--warning-light)', color: 'var(--warning)' },
    inactive: { bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' },
    completed: { bg: '#dbeafe', color: '#1d4ed8' },
  };
  return map[status] || map.inactive;
}

// ─── Client Detail Slide-out Panel ───────────────────────────────────
function ClientDetailPanel({
  client, idx, onClose, onRemove,
}: {
  client: MockClient; idx: number; onClose: () => void; onRemove: (id: string) => void;
}) {
  const grad = GRADIENTS[idx % GRADIENTS.length];
  const pay = payInfo(client);
  const stat = statusInfo(client.status);
  const receivedPct = client.totalContractValue > 0
    ? Math.round((client.received / client.totalContractValue) * 100) : 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col animate-slide-in"
        style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border-primary)', boxShadow: '-8px 0 40px rgba(0,0,0,0.1)' }}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${grad} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {client.companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{client.companyName}</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{client.contactPerson}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-all"
            style={{ border: '1px solid var(--border-primary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
            <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Row */}
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize" style={{ background: stat.bg, color: stat.color }}>
              {client.status}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: pay.bg, color: pay.color }}>
              {pay.label}
            </span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full capitalize" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              {client.contractType.replace('_', ' ')}
            </span>
          </div>

          {/* Contact Info */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Contact Details</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-primary)' }}>{client.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <a href={`mailto:${client.email}`} className="truncate" style={{ color: 'var(--accent)' }}>{client.email}</a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
                <span style={{ color: 'var(--text-primary)' }}>{client.phone}</span>
              </div>
              {client.gstNumber && (
                <div className="flex items-center gap-2 text-xs">
                  <Building2 className="h-4 w-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>GST: {client.gstNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Revenue Details */}
          <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Financial Summary</p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Monthly Fee', value: `₹${client.monthlyFee.toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
                { label: 'Contract Value', value: `₹${client.totalContractValue.toLocaleString('en-IN')}`, color: 'var(--text-primary)' },
                { label: 'Received', value: `₹${client.received.toLocaleString('en-IN')}`, color: 'var(--success)' },
                { label: 'Balance', value: `₹${client.balance.toLocaleString('en-IN')}`, color: client.balance > 0 ? 'var(--danger)' : 'var(--success)' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Payment Progress */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-secondary)' }}>Payment collected</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{receivedPct}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'var(--border-primary)' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${receivedPct}%`,
                    background: receivedPct === 100 ? 'var(--success)' : receivedPct > 0 ? 'var(--warning)' : 'var(--danger)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Contract Timeline */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Contract Period</p>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 shrink-0" style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-primary)' }}>{client.contractStart}</span>
              <ChevronRight className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
              <span style={{ color: 'var(--text-primary)' }}>{client.contractEnd}</span>
            </div>
          </div>
        </div>

        {/* Panel Footer Actions */}
        <div className="p-4 flex gap-3" style={{ borderTop: '1px solid var(--border-primary)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
            Close
          </button>
          <button
            onClick={() => { if (window.confirm(`Remove "${client.companyName}" from clients?`)) onRemove(client.id); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'var(--danger-light)', color: 'var(--danger)', border: '1px solid transparent' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}>
            <Trash2 className="h-4 w-4" /> Remove Client
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────
export default function ClientsCRM() {
  const router = useRouter();
  const [clients, setClients] = useState<MockClient[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'inactive' | 'completed'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ client: MockClient; idx: number } | null>(null);

  // Form States
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [totalContractValue, setTotalContractValue] = useState('');
  const [contractType, setContractType] = useState<'monthly' | 'one_time'>('monthly');
  const [contractStart, setContractStart] = useState('');
  const [contractEnd, setContractEnd] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      const c = await dataService.getClients();
      setClients(c);
    };
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(monthlyFee) || 0;
    const total = Number(totalContractValue) || fee;
    const newClient: MockClient = {
      id: 'c' + Date.now(),
      companyName, contactPerson, email, phone, gstNumber,
      monthlyFee: fee, totalContractValue: total,
      received: 0, balance: total,
      contractType,
      contractStart: contractStart || new Date().toISOString().split('T')[0],
      contractEnd: contractEnd || new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const saved = await dataService.saveClient(newClient);
    setClients(prev => [saved, ...prev]);
    setIsAddModalOpen(false);
    setCompanyName(''); setContactPerson(''); setEmail(''); setPhone('');
    setGstNumber(''); setMonthlyFee(''); setTotalContractValue('');
    setContractStart(''); setContractEnd(''); setContractType('monthly');
  };

  const handleRemoveClient = async (id: string) => {
    await dataService.removeClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
    setSelectedClient(null);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.companyName.toLowerCase().includes(search.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      client.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Summary
  const activeClients = clients.filter(c => c.status === 'active');
  const totalMRR = activeClients.reduce((sum, c) => sum + c.monthlyFee, 0);
  const totalReceived = clients.reduce((sum, c) => sum + c.received, 0);
  const totalBalance = clients.reduce((sum, c) => sum + c.balance, 0);

  const handleExport = () => {
    const headers = ['Company Name', 'Contact Person', 'Email', 'Phone', 'Monthly Fee (INR)', 'Contract Start', 'Contract End', 'Status', 'Contract Type'];
    const rows = filteredClients.map(c => [
      c.companyName,
      c.contactPerson,
      c.email,
      c.phone || '',
      c.monthlyFee.toString(),
      c.contractStart || '',
      c.contractEnd || '',
      c.status,
      c.contractType
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'clients_crm_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const FILTERS = ['all', 'active', 'paused', 'inactive', 'completed'] as const;

  return (
    <div className="space-y-6 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Clients CRM</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Manage clients, contracts, and billing. Click any card to view details.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-blue shadow-sm hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" /> Add Client
          </button>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Revenue', value: `₹${totalMRR.toLocaleString('en-IN')}`, color: 'var(--accent)' },
          { label: 'Total Received', value: `₹${totalReceived.toLocaleString('en-IN')}`, color: 'var(--success)' },
          { label: 'Outstanding', value: `₹${totalBalance.toLocaleString('en-IN')}`, color: 'var(--warning)' },
          { label: 'Total Clients', value: `${clients.length}`, color: 'var(--text-primary)' },
        ].map(item => (
          <div key={item.label} className="card p-4 animate-fade-up" style={{ background: 'var(--bg-secondary)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
            <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── Filters + Search ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text" placeholder="Search clients..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
            onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
            onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className="px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all"
              style={statusFilter === f
                ? { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' }
                : { background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }
              }>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* ── Client Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredClients.map((client, idx) => {
          const pay = payInfo(client);
          const stat = statusInfo(client.status);
          const grad = GRADIENTS[idx % GRADIENTS.length];
          const receivedPct = client.totalContractValue > 0
            ? Math.round((client.received / client.totalContractValue) * 100) : 0;

          return (
            <div
              key={client.id}
              className="card card-interactive p-5 space-y-4 group"
              style={{ background: 'var(--bg-secondary)' }}
              onClick={() => setSelectedClient({ client, idx })}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl ${grad} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
                    {client.companyName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {client.companyName}
                    </h3>
                    <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{client.contactPerson}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize" style={{ background: stat.bg, color: stat.color }}>
                    {client.status}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: pay.bg, color: pay.color }}>
                    {pay.label}
                  </span>
                </div>
              </div>

              {/* Quick Info */}
              <div className="space-y-1.5 pt-1" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <Calendar className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  {client.contractStart} → {client.contractEnd}
                </div>
              </div>

              {/* Payment Progress */}
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span style={{ color: 'var(--text-muted)' }}>Payment collected</span>
                  <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{receivedPct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${receivedPct}%`,
                      background: receivedPct === 100 ? 'var(--success)' : receivedPct > 0 ? 'var(--warning)' : 'var(--danger)',
                    }} />
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid var(--border-secondary)' }}>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Monthly Fee</p>
                  <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>₹{client.monthlyFee.toLocaleString('en-IN')}</p>
                </div>
                <span className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--accent)' }}>
                  View Details <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16" style={{ color: 'var(--text-muted)' }}>
            <Building2 className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No clients found</p>
            <p className="text-xs mt-1">Try changing the search or filter</p>
          </div>
        )}
      </div>

      {/* ── Detail Panel ── */}
      {selectedClient && (
        <ClientDetailPanel
          client={selectedClient.client}
          idx={selectedClient.idx}
          onClose={() => setSelectedClient(null)}
          onRemove={handleRemoveClient}
        />
      )}

      {/* ── Add Client Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />

          <div className="relative w-full max-w-lg rounded-2xl p-6 overflow-y-auto max-h-[90vh] z-10 space-y-5 animate-fade-up"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>

            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <div>
                <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Onboard New Client</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Fill in the client details to add to CRM</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-lg"
                style={{ border: '1px solid var(--border-primary)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Company Name', val: companyName, set: setCompanyName, ph: 'e.g. Acme Studio', type: 'text', req: true },
                  { label: 'Contact Person', val: contactPerson, set: setContactPerson, ph: 'Rahul Sharma', type: 'text', req: true },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input type={f.type} required={f.req} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                      onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
                  </div>
                ))}
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Email', val: email, set: setEmail, ph: 'billing@acme.com', type: 'email', req: true },
                  { label: 'Phone', val: phone, set: setPhone, ph: '+91 98765 43210', type: 'text', req: true },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input type={f.type} required={f.req} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                      onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
                  </div>
                ))}
              </div>

              {/* Contract Type + Monthly Fee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Contract Type</label>
                  <select value={contractType} onChange={e => setContractType(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}>
                    <option value="monthly">Monthly Retainer</option>
                    <option value="one_time">One-time Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Monthly Fee (₹)</label>
                  <input type="number" required value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} placeholder="15000"
                    className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
                </div>
              </div>

              {/* Total Value + GST */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>Total Contract Value (₹)</label>
                  <input type="number" value={totalContractValue} onChange={e => setTotalContractValue(e.target.value)} placeholder="Leave blank = monthly fee"
                    className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>GST No. (Optional)</label>
                  <input type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="27AAACA1111A1Z1"
                    className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Contract Start', val: contractStart, set: setContractStart },
                  { label: 'Contract End', val: contractEnd, set: setContractEnd },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input type="date" required value={f.val} onChange={e => f.set(e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl outline-none"
                      style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
                      onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-blue hover:opacity-90 transition-all shadow-sm">
                  Save & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
