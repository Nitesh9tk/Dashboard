'use client';

import React, { useState, useEffect } from 'react';
import { MockLead } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import {
  Plus, HelpCircle, DollarSign, RefreshCw, X, Search,
  TrendingUp, Award, Clock, ArrowRight, ShieldAlert, Sparkles,
  Edit2, Trash2, Mail, Phone, Calendar, User, Check
} from 'lucide-react';

const STAGES = [
  { key: 'new_lead', name: 'New Lead', probability: 0.1, color: '#3b82f6' },
  { key: 'contacted', name: 'Contacted', probability: 0.2, color: '#06b6d4' },
  { key: 'interested', name: 'Interested', probability: 0.4, color: '#f59e0b' },
  { key: 'meeting_scheduled', name: 'Meeting Scheduled', probability: 0.6, color: '#8b5cf6' },
  { key: 'proposal_sent', name: 'Proposal Sent', probability: 0.75, color: '#ec4899' },
  { key: 'negotiation', name: 'Negotiation', probability: 0.9, color: '#f97316' },
  { key: 'won', name: 'Won', probability: 1.0, color: '#10b981' },
  { key: 'lost', name: 'Lost', probability: 0.0, color: '#ef4444' },
] as const;

function getLeadScore(lead: MockLead) {
  const value = lead.revenuePotential;
  if (value >= 150000) return { label: 'Hot', color: 'var(--danger)', bg: 'var(--danger-light)' };
  if (value >= 60000) return { label: 'Warm', color: 'var(--warning)', bg: 'var(--warning-light)' };
  return { label: 'Cold', color: 'var(--info)', bg: 'var(--info-light)' };
}

export default function LeadsPipeline() {
  const [leads, setLeads] = useState<MockLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<MockLead | null>(null);
  
  // Drag and drop tracking
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [activeDragStage, setActiveDragStage] = useState<string | null>(null);

  // Form States (New Lead / Edit Lead)
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('LinkedIn Outbound');
  const [revenuePotential, setRevenuePotential] = useState('');
  const [stage, setStage] = useState<MockLead['stage']>('new_lead');
  const [assignedTo, setAssignedTo] = useState('Sales Team');
  const [industry, setIndustry] = useState('Technology');

  const fetchLeads = async () => {
    try {
      const l = await dataService.getLeads();
      setLeads(l);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStage = async (leadId: string, newStage: MockLead['stage']) => {
    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead) return;

    const updatedLead = { ...targetLead, stage: newStage };
    setLeads(prev => prev.map(l => l.id === leadId ? updatedLead : l));
    await dataService.saveLead(updatedLead);

    // Automation: if won, automatically onboard as client
    if (newStage === 'won') {
      const currentClients = await dataService.getClients();
      if (!currentClients.some(c => c.companyName.toLowerCase() === (targetLead.companyName || targetLead.clientName).toLowerCase())) {
        const newClient = {
          id: 'c' + Date.now(),
          companyName: targetLead.companyName || targetLead.clientName,
          contactPerson: targetLead.clientName,
          email: targetLead.email || 'billing@agency.com',
          phone: targetLead.phone || '+91 99999 88888',
          gstNumber: '27AAACA9999Z1Z9',
          monthlyFee: targetLead.revenuePotential,
          totalContractValue: targetLead.revenuePotential,
          received: 0,
          balance: targetLead.revenuePotential,
          contractType: 'monthly' as const,
          contractStart: new Date().toISOString().split('T')[0],
          contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'active' as const
        };
        await dataService.saveClient(newClient);
      }
    }
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLead: MockLead = {
      id: 'l' + Date.now(),
      clientName,
      companyName,
      email,
      phone,
      stage,
      source,
      revenuePotential: Number(revenuePotential) || 0,
      assignedTo,
      industry,
    };
    const saved = await dataService.saveLead(newLead);
    setLeads(prev => [saved, ...prev]);
    setIsAddModalOpen(false);
    
    // Reset form
    setClientName(''); setCompanyName(''); setEmail(''); setPhone('');
    setRevenuePotential(''); setStage('new_lead'); setAssignedTo('Sales Team'); setIndustry('Technology');
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    const updated: MockLead = {
      ...selectedLead,
      clientName,
      companyName,
      email,
      phone,
      stage,
      source,
      revenuePotential: Number(revenuePotential) || 0,
      assignedTo,
      industry,
    };

    setLeads(prev => prev.map(l => l.id === selectedLead.id ? updated : l));
    await dataService.saveLead(updated);
    
    // Check won status
    if (stage === 'won' && selectedLead.stage !== 'won') {
      await handleUpdateStage(selectedLead.id, 'won');
    }

    setSelectedLead(null);
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      // In localStorage fallback, dataService.removeLead is called or we can simulate it
      const updatedList = leads.filter(l => l.id !== id);
      setLeads(updatedList);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bb24_leads', JSON.stringify(updatedList));
      }
      setSelectedLead(null);
    }
  };

  const openEditModal = (lead: MockLead) => {
    setSelectedLead(lead);
    setClientName(lead.clientName);
    setCompanyName(lead.companyName);
    setEmail(lead.email);
    setPhone(lead.phone || '');
    setSource(lead.source);
    setRevenuePotential(String(lead.revenuePotential));
    setStage(lead.stage);
    setAssignedTo(lead.assignedTo);
    setIndustry(lead.industry);
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setActiveDragStage(stageKey);
  };

  const handleDragLeave = () => {
    setActiveDragStage(null);
  };

  const handleDrop = async (e: React.DragEvent, stageKey: MockLead['stage']) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (leadId) {
      await handleUpdateStage(leadId, stageKey);
    }
    setDraggedLeadId(null);
    setActiveDragStage(null);
  };

  // Budget validation & searching
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.clientName.toLowerCase().includes(search.toLowerCase()) ||
                          l.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          l.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesSource = sourceFilter === 'all' ? true : l.source === sourceFilter;
    const matchesBudget = minBudget ? l.revenuePotential >= Number(minBudget) : true;

    return matchesSearch && matchesSource && matchesBudget;
  });

  // Calculate Pipeline Analytics Stats
  const activeLeads = filteredLeads.filter(l => l.stage !== 'lost');
  const totalPipelineSum = activeLeads.reduce((sum, l) => sum + l.revenuePotential, 0);
  const wonLeadsCount = filteredLeads.filter(l => l.stage === 'won').length;
  const lostLeadsCount = filteredLeads.filter(l => l.stage === 'lost').length;
  const winRate = (wonLeadsCount + lostLeadsCount) > 0 
    ? Math.round((wonLeadsCount / (wonLeadsCount + lostLeadsCount)) * 100) 
    : 0;

  const weightedPipeline = activeLeads.reduce((sum, l) => {
    const stageProb = STAGES.find(s => s.key === l.stage)?.probability || 0;
    return sum + (l.revenuePotential * stageProb);
  }, 0);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Sales Pipeline</h1>
          <p className="text-text-secondary text-sm mt-1">Track prospective deals, manage stage conversions, and predict forecasted revenues.</p>
        </div>
        <button
          onClick={() => {
            setSelectedLead(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white hover:opacity-90 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </button>
      </div>

      {/* ── Pipeline Forecast Summary Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pipeline Value', value: `₹${(totalPipelineSum / 100000).toFixed(2)}L`, sub: 'Total active value', icon: DollarSign, color: 'var(--accent)' },
          { label: 'Weighted pipeline', value: `₹${(weightedPipeline / 100000).toFixed(2)}L`, sub: 'Adjusted by probability', icon: TrendingUp, color: 'var(--success)' },
          { label: 'Active Deals', value: activeLeads.length, sub: 'Leads in progress', icon: Clock, color: 'var(--warning)' },
          { label: 'Win Rate %', value: `${winRate}%`, sub: 'Won vs Lost ratios', icon: Award, color: 'var(--danger)' },
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

      {/* ── Toolbar Search & Filters ── */}
      <div className="card p-4 bg-bg-secondary flex flex-wrap gap-3 items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search prospect or company name..."
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
          />
        </div>

        {/* Source filter */}
        <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-2 rounded-lg border border-border-primary">
          <Sparkles className="h-3.5 w-3.5 text-text-secondary" />
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-text-secondary border-none outline-none cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="LinkedIn Outbound">LinkedIn Outbound</option>
            <option value="Google Ads">Google Ads</option>
            <option value="Referral">Referral</option>
            <option value="Organic Search">Organic Search</option>
            <option value="Cold Outreach">Cold Outreach</option>
          </select>
        </div>

        {/* Min budget filter */}
        <div className="flex items-center gap-1.5 bg-bg-tertiary px-3 py-2 rounded-lg border border-border-primary">
          <DollarSign className="h-3.5 w-3.5 text-text-secondary" />
          <input
            type="number"
            value={minBudget}
            onChange={e => setMinBudget(e.target.value)}
            placeholder="Min Budget (₹)"
            className="bg-transparent text-xs font-semibold text-text-secondary border-none outline-none w-28 placeholder:text-text-muted"
          />
        </div>
      </div>

      {/* ── Kanban Board Layout ── */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin">
        {STAGES.map((stg) => {
          const columnLeads = filteredLeads.filter(l => l.stage === stg.key);
          const count = columnLeads.length;
          const value = columnLeads.reduce((sum, l) => sum + l.revenuePotential, 0);
          const isDragOver = activeDragStage === stg.key;

          return (
            <div
              key={stg.key}
              onDragOver={e => handleDragOver(e, stg.key)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, stg.key)}
              className={`flex-1 min-w-[280px] max-w-[320px] bg-bg-secondary/40 border rounded-2xl p-4 flex flex-col h-[75vh] transition-all ${
                isDragOver ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20' : 'border-border-primary'
              }`}
            >
              {/* Column Header */}
              <div className="flex justify-between items-start border-b border-border-primary pb-3.5 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: stg.color }} />
                    <h3 className="font-semibold text-xs text-text-primary uppercase tracking-wider">{stg.name}</h3>
                  </div>
                  <span className="text-[10px] text-text-secondary font-medium block mt-1">₹{(value / 100000).toFixed(2)}L potential</span>
                </div>
                <span className="h-5 w-5 bg-bg-tertiary border border-border-primary rounded-full text-[10px] font-semibold text-text-secondary flex items-center justify-center shrink-0">
                  {count}
                </span>
              </div>

              {/* Stack items */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {columnLeads.length === 0 ? (
                  <div className="h-28 rounded-xl border border-dashed border-border-primary flex flex-col items-center justify-center text-center text-text-muted p-4 bg-bg-secondary/20">
                    <HelpCircle className="h-5 w-5 mb-1.5 opacity-30" />
                    <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted">Empty Stage</span>
                  </div>
                ) : (
                  columnLeads.map((lead) => {
                    const score = getLeadScore(lead);
                    const isDragging = draggedLeadId === lead.id;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={e => handleDragStart(e, lead.id)}
                        className={`card bg-bg-secondary p-4 border border-border-primary shadow-sm space-y-3 group cursor-grab active:cursor-grabbing hover:border-brand-primary/45 transition-all ${
                          isDragging ? 'opacity-50 scale-95 border-brand-primary' : ''
                        }`}
                        onClick={() => openEditModal(lead)}
                      >
                        {/* Title & Edit Icon */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-text-primary truncate">{lead.companyName || lead.clientName}</h4>
                            {lead.companyName && <span className="text-[9px] text-text-secondary block mt-0.5 truncate">{lead.clientName}</span>}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); openEditModal(lead); }}
                            className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-bg-tertiary text-text-secondary transition-all"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Middle Info */}
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="bg-bg-tertiary px-2 py-0.5 rounded text-text-secondary border border-border-primary">
                            {lead.source}
                          </span>
                          <span className="font-semibold text-text-primary flex items-center">
                            ₹{lead.revenuePotential.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Footer Badges */}
                        <div className="flex items-center justify-between border-t border-border-secondary pt-2.5">
                          <span className="text-[9px] text-text-muted font-semibold capitalize">{lead.industry}</span>
                          <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{ background: score.bg, color: score.color }}>
                            {score.label}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit Lead Modal ── */}
      {(isAddModalOpen || selectedLead) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-lg bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-semibold text-base text-text-primary">
                  {selectedLead ? 'Edit Prospect Lead' : 'Add New Pipeline Lead'}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  {selectedLead ? 'Update deal values, source criteria, and assigned staff.' : 'Enter prospective client information to track conversions.'}
                </p>
              </div>
              <button
                onClick={() => { setIsAddModalOpen(false); setSelectedLead(null); }}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={selectedLead ? handleEditLead : handleAddLead} className="space-y-4">
              
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Client Name</label>
                  <input
                    type="text" required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Sanjay Singh"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Company Name</label>
                  <input
                    type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Zetta Cloud"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Email</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="sanjay@zetta.in"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Phone Number</label>
                  <input
                    type="text" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 99999 00000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Lead Source</label>
                  <select
                    value={source} onChange={e => setSource(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  >
                    <option value="LinkedIn Outbound">LinkedIn Outbound</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Organic Search">Organic Search</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Revenue Potential (INR)</label>
                  <input
                    type="number" required value={revenuePotential} onChange={e => setRevenuePotential(e.target.value)} placeholder="150000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Pipeline Stage</label>
                  <select
                    value={stage} onChange={e => setStage(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  >
                    {STAGES.map(s => (
                      <option key={s.key} value={s.key}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Assigned Representative</label>
                  <input
                    type="text" required value={assignedTo} onChange={e => setAssignedTo(e.target.value)} placeholder="Sales Team"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Industry Sector</label>
                <input
                  type="text" required value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Technology"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border-primary">
                {selectedLead && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold bg-danger-light text-danger hover:opacity-90 transition-all cursor-pointer"
                  >
                    Delete Lead
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setSelectedLead(null); }}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-primary hover:opacity-90 transition-all shadow-sm cursor-pointer animate-pulse-soft"
                >
                  {selectedLead ? 'Save Changes' : 'Create Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
