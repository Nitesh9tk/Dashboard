'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MockClient, MockInvoice, MockProject } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import {
  Search, Plus, Mail, Phone, Calendar, X, User,
  TrendingUp, AlertCircle, CheckCircle, Clock,
  Building2, IndianRupee, Trash2, ChevronRight,
  Edit2, ExternalLink, Download, LayoutGrid, List, Check,
  Filter, ShieldAlert, Heart, Activity, FileText, Settings,
  Eye, RefreshCw, AlertTriangle
} from 'lucide-react';

const GRADIENTS = [
  'gradient-blue', 'gradient-success', 'gradient-warning',
  'gradient-danger', 'gradient-purple', 'gradient-cyan'
];

// ─── Health Score Helper ──────────────────────────────────────────────
function getHealthInfo(client: MockClient) {
  // Calculate a mock but deterministic health score based on metrics
  let score = 90;
  const payRatio = client.totalContractValue > 0 ? (client.received / client.totalContractValue) : 1;
  
  if (payRatio < 0.3) score -= 25;
  else if (payRatio < 0.7) score -= 10;
  
  if (client.balance > 50000) score -= 15;
  if (client.status === 'paused') score -= 20;
  if (client.status === 'inactive') score -= 50;

  score = Math.max(15, Math.min(100, score));

  if (score >= 80) return { score, label: 'Healthy', color: 'var(--success)', bg: 'var(--success-light)', ring: '#10b981' };
  if (score >= 50) return { score, label: 'Warning', color: 'var(--warning)', bg: 'var(--warning-light)', ring: '#f59e0b' };
  return { score, label: 'At Risk', color: 'var(--danger)', bg: 'var(--danger-light)', ring: '#ef4444' };
}

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
    completed: { bg: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent)' },
  };
  return map[status] || map.inactive;
}

// ─── Client Detail Drawer Panel ───────────────────────────────────────
function ClientDetailPanel({
  client,
  idx,
  onClose,
  onRemove,
  onUpdateStatus,
  invoices = [],
  projects = []
}: {
  client: MockClient;
  idx: number;
  onClose: () => void;
  onRemove: (id: string) => void;
  onUpdateStatus: (id: string, status: MockClient['status']) => void;
  invoices: MockInvoice[];
  projects: MockProject[];
}) {
  const grad = GRADIENTS[idx % GRADIENTS.length];
  const pay = payInfo(client);
  const stat = statusInfo(client.status);
  const health = getHealthInfo(client);
  const receivedPct = client.totalContractValue > 0
    ? Math.round((client.received / client.totalContractValue) * 100) : 0;

  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'invoices'>('summary');

  // Filter items for this client
  const clientInvoices = invoices.filter(inv => inv.clientName.toLowerCase() === client.companyName.toLowerCase());
  const clientProjects = projects.filter(proj => proj.clientName.toLowerCase() === client.companyName.toLowerCase());

  // Generate deterministic activities timeline
  const mockTimeline = [
    { type: 'system', title: 'Client record created', date: client.contractStart, desc: 'Initial onboarding details submitted.' },
    { type: 'contract', title: 'Contract signed', date: client.contractStart, desc: `${client.contractType === 'monthly' ? 'Monthly retainer' : 'One-time project'} agreement activated.` },
    ...(clientInvoices.length > 0 ? clientInvoices.map((inv, i) => ({
      type: 'invoice',
      title: `Invoice ${inv.invoiceNumber} ${inv.status}`,
      date: inv.status === 'paid' ? (inv.paidAt || inv.dueDate) : inv.dueDate,
      desc: `Invoice of ₹${inv.amount.toLocaleString('en-IN')} is ${inv.status}.`
    })) : [
      { type: 'invoice', title: 'First invoice created', date: client.contractStart, desc: `Invoice of ₹${client.monthlyFee.toLocaleString('en-IN')} pending setup.` }
    ]),
    ...(clientProjects.length > 0 ? clientProjects.map(proj => ({
      type: 'project',
      title: `Project: ${proj.name}`,
      date: proj.startDate,
      desc: `Project is currently in ${proj.status} stage (${proj.completionRate}% complete).`
    })) : [])
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg flex flex-col animate-slide-in"
        style={{
          background: 'var(--bg-secondary)',
          borderLeft: '1px solid var(--border-primary)',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-primary">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl ${grad} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
              {client.companyName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="font-bold text-base text-text-primary">{client.companyName}</h2>
              <p className="text-xs text-text-secondary">{client.contactPerson}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all">
            <X className="h-4 w-4 text-text-secondary" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border-primary bg-bg-primary px-4">
          {[
            { id: 'summary', label: 'Summary', icon: FileText },
            { id: 'timeline', label: 'Timeline', icon: Activity },
            { id: 'invoices', label: 'Invoices', icon: IndianRupee },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  active ? 'border-brand-primary text-brand-primary' : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'summary' && (
            <>
              {/* Quick Status Block */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-border-primary bg-bg-tertiary">
                  <span className="text-[10px] text-text-muted font-semibold block uppercase">Status</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: stat.color }} />
                    <span className="text-xs font-bold capitalize text-text-primary">{client.status}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border border-border-primary bg-bg-tertiary">
                  <span className="text-[10px] text-text-muted font-semibold block uppercase">Billing Status</span>
                  <span className="inline-block mt-1 text-xs font-bold text-text-primary px-2 py-0.5 rounded-full" style={{ background: pay.bg, color: pay.color }}>
                    {pay.label}
                  </span>
                </div>
                <div className="p-3 rounded-xl border border-border-primary bg-bg-tertiary">
                  <span className="text-[10px] text-text-muted font-semibold block uppercase">Health Index</span>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Heart className="h-3.5 w-3.5" style={{ fill: health.color, stroke: 'none' }} />
                    <span className="text-xs font-bold text-text-primary">{health.score}%</span>
                  </div>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="p-4 rounded-xl border border-border-primary bg-bg-tertiary space-y-2">
                <span className="text-[10px] text-text-muted font-bold block uppercase tracking-wider">Update Status</span>
                <div className="flex gap-2">
                  {(['active', 'paused', 'inactive', 'completed'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus(client.id, s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                        client.status === s
                          ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                          : 'bg-bg-secondary text-text-secondary border-border-primary hover:border-border-hover'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 rounded-xl border border-border-primary bg-bg-tertiary space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Contact Details</p>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-brand-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Key Contact</p>
                      <p className="font-semibold text-text-primary">{client.contactPerson}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-brand-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Email Address</p>
                      <a href={`mailto:${client.email}`} className="font-semibold text-brand-primary hover:underline">{client.email}</a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-brand-primary" />
                    <div>
                      <p className="text-xs text-text-secondary">Phone Number</p>
                      <p className="font-semibold text-text-primary">{client.phone}</p>
                    </div>
                  </div>
                  {client.gstNumber && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-text-secondary" />
                      <div>
                        <p className="text-xs text-text-secondary">GST No.</p>
                        <p className="font-semibold text-text-primary">{client.gstNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="p-4 rounded-xl border border-border-primary bg-bg-tertiary space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Financial Overview</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Retainer Fee (Monthly)', value: `₹${client.monthlyFee.toLocaleString('en-IN')}` },
                    { label: 'Total Deal Value', value: `₹${client.totalContractValue.toLocaleString('en-IN')}` },
                    { label: 'Received Collections', value: `₹${client.received.toLocaleString('en-IN')}`, color: 'var(--success)' },
                    { label: 'Remaining Balance', value: `₹${client.balance.toLocaleString('en-IN')}`, color: client.balance > 0 ? 'var(--danger)' : 'var(--success)' },
                  ].map((x, i) => (
                    <div key={i} className="p-3 bg-bg-secondary rounded-lg border border-border-primary">
                      <span className="text-[10px] text-text-muted font-medium block">{x.label}</span>
                      <span className="text-sm font-semibold block mt-0.5" style={{ color: x.color }}>{x.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-text-secondary">Collection Progress</span>
                    <span className="font-bold text-text-primary">{receivedPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-border-primary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${receivedPct}%`,
                        background: receivedPct === 100 ? 'var(--success)' : receivedPct > 0 ? 'var(--warning)' : 'var(--danger)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Project Status */}
              {clientProjects.length > 0 && (
                <div className="p-4 rounded-xl border border-border-primary bg-bg-tertiary space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Active Work & Projects</p>
                  <div className="space-y-2">
                    {clientProjects.map(proj => (
                      <div key={proj.id} className="p-3 bg-bg-secondary rounded-lg border border-border-primary flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-text-primary">{proj.name}</p>
                          <span className="text-[10px] text-text-muted capitalize block mt-0.5">Status: {proj.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-text-primary">{proj.completionRate}%</span>
                          <div className="h-1.5 w-16 rounded-full bg-bg-tertiary overflow-hidden">
                            <div className="h-full bg-brand-primary" style={{ width: `${proj.completionRate}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline duration */}
              <div className="p-4 rounded-xl border border-border-primary bg-bg-tertiary">
                <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-2">Agreement Timeline</p>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-brand-primary" />
                  <span className="font-medium text-text-primary">{client.contractStart}</span>
                  <ChevronRight className="h-4 w-4 text-text-muted" />
                  <span className="font-medium text-text-primary">{client.contractEnd}</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-6 relative pl-4 border-l-2 border-border-primary ml-2 py-2">
              {mockTimeline.map((item, i) => (
                <div key={i} className="relative space-y-1">
                  <div className="absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 border-bg-secondary flex items-center justify-center"
                    style={{
                      background: item.type === 'system' ? 'var(--accent)' :
                                  item.type === 'contract' ? '#7c3aed' :
                                  item.type === 'invoice' ? 'var(--success)' : 'var(--warning)'
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs font-bold text-text-primary">{item.title}</p>
                    <span className="text-[9px] text-text-muted font-semibold">{item.date}</span>
                  </div>
                  <p className="text-xs text-text-secondary">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'invoices' && (
            <div className="space-y-3">
              {clientInvoices.length > 0 ? (
                clientInvoices.map(inv => (
                  <div key={inv.id} className="p-3.5 rounded-xl border border-border-primary bg-bg-tertiary flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{inv.invoiceNumber}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          inv.status === 'paid' ? 'bg-success-light text-success' :
                          inv.status === 'overdue' ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'
                        }`}>
                          {inv.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary">Due: {inv.dueDate}</p>
                    </div>
                    <span className="text-sm font-semibold text-text-primary">₹{inv.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <FileText className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-text-secondary">No invoices available for this client.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Panel Footer */}
        <div className="p-4 flex gap-3 border-t border-border-primary">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
          >
            Close Panel
          </button>
          <button
            onClick={() => { if (window.confirm(`Delete client "${client.companyName}"? This action cannot be undone.`)) onRemove(client.id); }}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-danger-light text-danger hover:opacity-90 border border-transparent transition-all cursor-pointer"
          >
            <Trash2 className="h-4 w-4" /> Remove Client
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Main clients Dashboard CRM ───────────────────────────────────────
export default function ClientsCRM() {
  const router = useRouter();
  const [clients, setClients] = useState<MockClient[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  
  // States for views & filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'inactive' | 'completed'>('all');
  const [contractFilter, setContractFilter] = useState<'all' | 'monthly' | 'one_time'>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | 'healthy' | 'warning' | 'risk'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selection states (for bulk actions)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals & Panels
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ client: MockClient; idx: number } | null>(null);

  // Form States (New Client)
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

  const [loading, setLoading] = useState(true);

  // Fetch all initial data
  const loadAllData = async () => {
    try {
      const [c, inv, proj] = await Promise.all([
        dataService.getClients(),
        dataService.getInvoices(),
        dataService.getProjects()
      ]);
      setClients(c);
      setInvoices(inv);
      setProjects(proj);
    } catch (err) {
      console.error('Failed to load CRM data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const fee = Number(monthlyFee) || 0;
    const total = Number(totalContractValue) || fee;
    const newClient: MockClient = {
      id: 'c' + Date.now(),
      companyName,
      contactPerson,
      email,
      phone,
      gstNumber,
      monthlyFee: fee,
      totalContractValue: total,
      received: 0,
      balance: total,
      contractType,
      contractStart: contractStart || new Date().toISOString().split('T')[0],
      contractEnd: contractEnd || new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const saved = await dataService.saveClient(newClient);
    setClients(prev => [saved, ...prev]);
    setIsAddModalOpen(false);
    
    // Clear form
    setCompanyName(''); setContactPerson(''); setEmail(''); setPhone('');
    setGstNumber(''); setMonthlyFee(''); setTotalContractValue('');
    setContractStart(''); setContractEnd(''); setContractType('monthly');
  };

  const handleRemoveClient = async (id: string) => {
    await dataService.removeClient(id);
    setClients(prev => prev.filter(c => c.id !== id));
    setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    setSelectedClient(null);
  };

  const handleUpdateStatus = async (id: string, newStatus: MockClient['status']) => {
    const list = [...clients];
    const index = list.findIndex(c => c.id === id);
    if (index > -1) {
      const updatedClient = { ...list[index], status: newStatus };
      list[index] = updatedClient;
      setClients(list);
      if (selectedClient && selectedClient.client.id === id) {
        setSelectedClient({ client: updatedClient, idx: selectedClient.idx });
      }
      await dataService.saveClient(updatedClient);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedIds.length} selected clients?`)) {
      await Promise.all(selectedIds.map(id => dataService.removeClient(id)));
      setClients(prev => prev.filter(c => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    }
  };

  const handleBulkStatusChange = async (status: MockClient['status']) => {
    const updatedList = clients.map(c => {
      if (selectedIds.includes(c.id)) {
        const updated = { ...c, status };
        dataService.saveClient(updated); // Async save
        return updated;
      }
      return c;
    });
    setClients(updatedList);
    setSelectedIds([]);
  };

  const handleBulkExport = () => {
    const exportClients = clients.filter(c => selectedIds.includes(c.id));
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Company Name,Contact,Email,Phone,Monthly Fee,Total Contract Value,Status"].join(",") + "\n"
      + exportClients.map(c => `"${c.companyName}","${c.contactPerson}","${c.email}","${c.phone}",${c.monthlyFee},${c.totalContractValue},"${c.status}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bb24_clients_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredClients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredClients.map(c => c.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  // Filter & Search Evaluation
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          client.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
                          client.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : client.status === statusFilter;
    const matchesContract = contractFilter === 'all' ? true : client.contractType === contractFilter;
    
    const health = getHealthInfo(client);
    const matchesHealth = healthFilter === 'all' ? true :
                          healthFilter === 'healthy' ? health.score >= 80 :
                          healthFilter === 'warning' ? health.score >= 50 && health.score < 80 :
                          health.score < 50; // 'risk'

    return matchesSearch && matchesStatus && matchesContract && matchesHealth;
  });

  // Calculate high-level metrics for toolbar analytics
  const activeCount = clients.filter(c => c.status === 'active').length;
  const pausedCount = clients.filter(c => c.status === 'paused').length;
  const criticalCount = clients.filter(c => getHealthInfo(c).score < 50).length;
  const pipelineValue = clients.filter(c => c.status === 'active').reduce((sum, c) => sum + c.monthlyFee, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading connections...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">CRM Connections</h1>
          <p className="text-text-secondary text-sm mt-1">Manage active contracts, track client health indicators, and oversee accounts billing.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white hover:opacity-90 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Onboard Client
        </button>
      </div>

      {/* ── High-Level Analytics Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Retainers', value: activeCount, sub: `${clients.length} total accounts`, icon: CheckCircle, color: 'var(--success)' },
          { label: 'Monthly Run Rate', value: `₹${pipelineValue.toLocaleString('en-IN')}`, sub: 'From active connections', icon: TrendingUp, color: 'var(--accent)' },
          { label: 'On Pause', value: pausedCount, sub: 'Paused subscriptions', icon: Clock, color: 'var(--warning)' },
          { label: 'At Risk CRM', value: criticalCount, sub: 'Needs immediate review', icon: AlertTriangle, color: 'var(--danger)' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-4 flex items-center justify-between bg-bg-secondary">
              <div>
                <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider block">{stat.label}</span>
                <span className="text-lg font-bold text-text-primary block mt-1">{stat.value}</span>
                <span className="text-[10px] text-text-secondary block mt-0.5">{stat.sub}</span>
              </div>
              <div className="p-2.5 rounded-lg flex items-center justify-center shrink-0" style={{ background: stat.color + '15', color: stat.color }}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Advanced Toolbar Filter Bar ── */}
      <div className="card p-4 bg-bg-secondary space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Searches & Filters */}
          <div className="flex flex-wrap gap-2.5 items-center flex-1">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search clients, key contact, email..."
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-2 rounded-lg border border-border-primary">
              <Filter className="h-3.5 w-3.5 text-text-secondary" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-text-secondary border-none outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Contract Type Dropdown */}
            <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-2 rounded-lg border border-border-primary">
              <FileText className="h-3.5 w-3.5 text-text-secondary" />
              <select
                value={contractFilter}
                onChange={e => setContractFilter(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-text-secondary border-none outline-none cursor-pointer"
              >
                <option value="all">All Contract Types</option>
                <option value="monthly">Monthly Retainer</option>
                <option value="one_time">One-time Project</option>
              </select>
            </div>

            {/* Health Score Dropdown */}
            <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-2 rounded-lg border border-border-primary">
              <Heart className="h-3.5 w-3.5 text-text-secondary" />
              <select
                value={healthFilter}
                onChange={e => setHealthFilter(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-text-secondary border-none outline-none cursor-pointer"
              >
                <option value="all">All Health Profiles</option>
                <option value="healthy">Healthy (&gt;= 80%)</option>
                <option value="warning">Warning (50% - 79%)</option>
                <option value="risk">At Risk (&lt; 50%)</option>
              </select>
            </div>
          </div>

          {/* Right: Grid/List View Toggles */}
          <div className="flex items-center gap-1 bg-bg-tertiary p-1 rounded-lg border border-border-primary shrink-0 self-end md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-bg-secondary shadow-sm text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-bg-secondary shadow-sm text-brand-primary' : 'text-text-secondary hover:text-text-primary'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Bulk Actions Panel ── */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 bg-brand-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {selectedIds.length}
              </span>
              <span className="text-xs font-semibold text-brand-primary">clients selected</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1 bg-bg-secondary px-2.5 py-1.5 rounded-lg border border-border-primary text-xs">
                <span className="text-[10px] text-text-muted font-bold mr-1">Status:</span>
                <select
                  onChange={e => handleBulkStatusChange(e.target.value as any)}
                  defaultValue=""
                  className="bg-transparent font-semibold text-text-secondary outline-none border-none cursor-pointer"
                >
                  <option value="" disabled>Change Status</option>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                onClick={handleBulkExport}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary text-text-secondary hover:text-text-primary text-xs font-semibold rounded-lg border border-border-primary transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Export CSV
              </button>
              
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-danger-light text-danger hover:opacity-90 text-xs font-semibold rounded-lg border border-transparent transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Client Display Content Area ── */}
      {filteredClients.length > 0 ? (
        viewMode === 'grid' ? (
          
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredClients.map((client, index) => {
              const grad = GRADIENTS[index % GRADIENTS.length];
              const stat = statusInfo(client.status);
              const pay = payInfo(client);
              const health = getHealthInfo(client);
              const isSelected = selectedIds.includes(client.id);
              const receivedPct = client.totalContractValue > 0
                ? Math.round((client.received / client.totalContractValue) * 100) : 0;

              return (
                <div
                  key={client.id}
                  className={`card card-interactive bg-bg-secondary overflow-hidden ${isSelected ? 'ring-2 ring-brand-primary' : ''}`}
                  onClick={() => setSelectedClient({ client, idx: index })}
                >
                  {/* Select Checkbox (Stops propagation) */}
                  <div
                    className="absolute top-4 left-4 z-10"
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(client.id)}
                      className="h-4 w-4 rounded border-border-primary bg-bg-tertiary text-brand-primary cursor-pointer focus:ring-0"
                    />
                  </div>

                  {/* Top Header Card */}
                  <div className="p-5 pt-12 space-y-4 border-b border-border-primary relative">
                    
                    {/* Status badges */}
                    <div className="absolute top-4 right-4 flex gap-1.5">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: stat.bg, color: stat.color }}>
                        {client.status}
                      </span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: pay.bg, color: pay.color }}>
                        {pay.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`h-11 w-11 rounded-xl ${grad} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
                        {client.companyName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-text-primary truncate">{client.companyName}</h3>
                        <p className="text-xs text-text-secondary truncate">{client.contactPerson}</p>
                      </div>
                    </div>

                    {/* Quick Contacts */}
                    <div className="space-y-1.5 pt-2 text-xs">
                      <div className="flex items-center gap-2 text-text-secondary truncate">
                        <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span className="truncate">{client.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
                        <span>{client.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4 bg-bg-tertiary/20">
                    
                    {/* Billing Stats */}
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <span className="text-[9px] text-text-muted font-semibold block uppercase">Monthly Retainer</span>
                        <span className="font-semibold text-text-primary">₹{client.monthlyFee.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-text-muted font-semibold block uppercase">Collections</span>
                        <span className="font-semibold text-text-primary">₹{client.received.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-text-secondary mb-1">
                        <span>Collections Paid</span>
                        <span className="font-bold">{receivedPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-border-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${receivedPct}%`,
                            background: receivedPct === 100 ? 'var(--success)' : receivedPct > 0 ? 'var(--warning)' : 'var(--danger)'
                          }}
                        />
                      </div>
                    </div>

                    {/* Health & Tags */}
                    <div className="flex justify-between items-center pt-1">
                      
                      {/* Health Indicator */}
                      <div className="flex items-center gap-1.5 bg-bg-secondary border border-border-primary py-1 px-2.5 rounded-lg">
                        <Heart className="h-3.5 w-3.5" style={{ fill: health.color, stroke: 'none' }} />
                        <span className="text-[10px] font-bold text-text-primary">{health.score}% Health</span>
                      </div>

                      {/* Custom Tags */}
                      <div className="flex gap-1">
                        {client.monthlyFee >= 30000 && (
                          <span className="text-[8px] font-semibold tracking-wider uppercase bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded">VIP</span>
                        )}
                        <span className="text-[8px] font-semibold tracking-wider uppercase bg-bg-secondary text-text-secondary border border-border-primary px-1.5 py-0.5 rounded capitalize">
                          {client.contractType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          
          /* LIST VIEW TABLE */
          <div className="card bg-bg-secondary overflow-hidden border border-border-primary">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-tertiary border-b border-border-primary text-text-secondary text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === filteredClients.length && filteredClients.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-border-primary bg-bg-tertiary text-brand-primary cursor-pointer focus:ring-0"
                      />
                    </th>
                    <th className="py-4 px-4">Client</th>
                    <th className="py-4 px-4">Key Contact</th>
                    <th className="py-4 px-4">Billing Profile</th>
                    <th className="py-4 px-4">Collections</th>
                    <th className="py-4 px-4">Health Index</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary text-xs">
                  {filteredClients.map((client, index) => {
                    const stat = statusInfo(client.status);
                    const pay = payInfo(client);
                    const health = getHealthInfo(client);
                    const isSelected = selectedIds.includes(client.id);
                    const receivedPct = client.totalContractValue > 0
                      ? Math.round((client.received / client.totalContractValue) * 100) : 0;

                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelectedClient({ client, idx: index })}
                        className={`hover:bg-bg-tertiary/40 transition-colors cursor-pointer ${isSelected ? 'bg-brand-primary/5' : ''}`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(client.id)}
                            className="h-4 w-4 rounded border-border-primary bg-bg-tertiary text-brand-primary cursor-pointer focus:ring-0"
                          />
                        </td>
                        
                        {/* Client details */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-lg ${GRADIENTS[index % GRADIENTS.length]} flex items-center justify-center text-white font-semibold text-[11px] shrink-0`}>
                              {client.companyName.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-text-primary truncate">{client.companyName}</p>
                              <p className="text-[10px] text-text-muted capitalize">{client.contractType.replace('_', ' ')} Retainer</p>
                            </div>
                          </div>
                        </td>

                        {/* Contact details */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-text-primary">{client.contactPerson}</p>
                          <p className="text-[10px] text-text-secondary">{client.email}</p>
                        </td>

                        {/* Monthly fee & Total */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-text-primary">₹{client.monthlyFee.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-text-muted">Total: ₹{client.totalContractValue.toLocaleString('en-IN')}</p>
                        </td>

                        {/* Collections Progress */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 justify-between max-w-[120px] mb-1">
                            <span className="font-bold text-text-primary">₹{client.received.toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-text-muted font-bold">{receivedPct}%</span>
                          </div>
                          <div className="h-1.5 w-full max-w-[120px] bg-bg-tertiary rounded-full overflow-hidden">
                            <div className="h-full bg-brand-success" style={{ width: `${receivedPct}%` }} />
                          </div>
                        </td>

                        {/* Health Score */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Heart className="h-3.5 w-3.5" style={{ fill: health.color, stroke: 'none' }} />
                            <span className="font-bold text-text-primary">{health.score}%</span>
                            <span className="text-[10px] text-text-muted">({health.label})</span>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4">
                          <span className="text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize" style={{ background: stat.bg, color: stat.color }}>
                            {client.status}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedClient({ client, idx: index })}
                            className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer inline-flex"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="card p-12 text-center bg-bg-secondary">
          <Activity className="h-12 w-12 text-text-muted mx-auto mb-3 opacity-40 animate-pulse-soft" />
          <h3 className="text-base font-bold text-text-primary">No clients match your filter criteria</h3>
          <p className="text-xs text-text-secondary mt-1">Try resetting search queries or widening filter settings.</p>
        </div>
      )}

      {/* ── Client Details Drawer panel ── */}
      {selectedClient && (
        <ClientDetailPanel
          client={selectedClient.client}
          idx={selectedClient.idx}
          onClose={() => setSelectedClient(null)}
          onRemove={handleRemoveClient}
          onUpdateStatus={handleUpdateStatus}
          invoices={invoices}
          projects={projects}
        />
      )}

      {/* ── Onboard Client Modal ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-xl bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-semibold text-base text-text-primary">Onboard Enterprise Client</h3>
                <p className="text-xs text-text-secondary mt-0.5">Initialize contract agreements, tax details, and billing parameters.</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddClient} className="space-y-4">
              
              {/* Row 1: Company & Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Company Name</label>
                  <input
                    type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Corp"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Key Contact Person</label>
                  <input
                    type="text" required value={contactPerson} onChange={e => setContactPerson(e.target.value)} placeholder="John Doe"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Billing Email</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="finance@acme.com"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Phone Number</label>
                  <input
                    type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 3: Contract Type & Monthly Fee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Agreement Type</label>
                  <select
                    value={contractType} onChange={e => setContractType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  >
                    <option value="monthly">Monthly Retainer</option>
                    <option value="one_time">One-time Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Monthly Fee (₹)</label>
                  <input
                    type="number" required value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} placeholder="35000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 4: Deal Value & GST */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Total Contract Value (₹)</label>
                  <input
                    type="number" value={totalContractValue} onChange={e => setTotalContractValue(e.target.value)} placeholder="Leave blank = monthly fee"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">GST No. (Optional)</label>
                  <input
                    type="text" value={gstNumber} onChange={e => setGstNumber(e.target.value)} placeholder="27AAACA9999Z1Z9"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 5: Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Start Date</label>
                  <input
                    type="date" required value={contractStart} onChange={e => setContractStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">End Date</label>
                  <input
                    type="date" required value={contractEnd} onChange={e => setContractEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border-primary">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-primary hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  Confirm Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
