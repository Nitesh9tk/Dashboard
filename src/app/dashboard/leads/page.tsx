'use client';

import React, { useState, useEffect } from 'react';
import { MockLead } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import { GitPullRequest, Plus, HelpCircle, DollarSign, RefreshCw, X } from 'lucide-react';

export default function LeadsPipeline() {
  const [leads, setLeads] = useState<MockLead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form States
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [source, setSource] = useState('LinkedIn Outbound');
  const [revenuePotential, setRevenuePotential] = useState('');
  const [stage, setStage] = useState<'new_lead' | 'contacted' | 'interested' | 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'won' | 'lost'>('new_lead');

  useEffect(() => {
    const fetchLeads = async () => {
      const l = await dataService.getLeads();
      setLeads(l);
    };
    fetchLeads();
  }, []);

  const stagesList = [
    { key: 'new_lead', name: 'New Lead' },
    { key: 'contacted', name: 'Contacted' },
    { key: 'interested', name: 'Interested' },
    { key: 'meeting_scheduled', name: 'Meeting Scheduled' },
    { key: 'proposal_sent', name: 'Proposal Sent' },
    { key: 'negotiation', name: 'Negotiation' },
    { key: 'won', name: 'Won' },
    { key: 'lost', name: 'Lost' },
  ] as const;

  const handleUpdateStage = async (leadId: string, newStage: MockLead['stage']) => {
    const updated = leads.map((lead) => {
      if (lead.id === leadId) {
        return { ...lead, stage: newStage };
      }
      return lead;
    });
    setLeads(updated);

    const targetLead = leads.find(l => l.id === leadId);
    if (targetLead) {
      const updatedLead = { ...targetLead, stage: newStage };
      await dataService.saveLead(updatedLead);

      // Simulate automation engine: if stage is updated to 'won', automatically add to clients in CRM
      if (newStage === 'won') {
        const currentClients = await dataService.getClients();
        // Add if not already present
        if (!currentClients.some((c: any) => c.companyName.toLowerCase() === (targetLead.companyName || targetLead.clientName).toLowerCase())) {
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
            contractEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year
            status: 'active' as const
          };
          await dataService.saveClient(newClient);
        }
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
      assignedTo: 'Sales Team',
      industry: 'General',
    };
    const saved = await dataService.saveLead(newLead);
    setLeads([...leads, saved]);
    setIsModalOpen(false);

    // Clear form
    setClientName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setRevenuePotential('');
    setStage('new_lead');
  };

  // Calculate stats per column
  const getStageStats = (stageKey: typeof stagesList[number]['key']) => {
    const stageLeads = leads.filter(l => l.stage === stageKey);
    const count = stageLeads.length;
    const value = stageLeads.reduce((sum, l) => sum + l.revenuePotential, 0);
    return { count, value };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Sales Pipeline</h1>
          <p className="text-text-secondary text-sm mt-1">Track incoming lead prospects, evaluate deal size, and manage sales conversions.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-bg-primary hover:bg-brand-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </button>
      </div>

      {/* Kanban Board Container */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-4 px-4 scrollbar-thin">
        {stagesList.map((stg) => {
          const { count, value } = getStageStats(stg.key);
          const columnLeads = leads.filter(l => l.stage === stg.key);

          return (
            <div
              key={stg.key}
              className="flex-1 min-w-[280px] max-w-[320px] bg-bg-secondary/40 border border-border-primary rounded-xl p-4 flex flex-col h-[75vh]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center border-b border-border-primary pb-3 mb-4">
                <div>
                  <h3 className="font-extrabold text-xs text-text-primary uppercase tracking-wider">{stg.name}</h3>
                  <span className="text-[10px] text-text-secondary font-semibold block mt-0.5">₹{(value / 100000).toFixed(2)}L potential</span>
                </div>
                <span className="h-5 w-5 bg-bg-tertiary border border-border-primary rounded-full text-[10px] font-bold text-text-secondary flex items-center justify-center">
                  {count}
                </span>
              </div>

              {/* Column Cards Stack */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {columnLeads.length === 0 ? (
                  <div className="h-28 rounded-lg border border-dashed border-border-primary flex flex-col items-center justify-center text-center text-text-muted p-4">
                    <HelpCircle className="h-5 w-5 mb-1 opacity-40" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">No leads here</span>
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="glass-panel p-4 rounded-xl border border-border-primary hover:border-text-muted shadow-sm transition-all space-y-3 group"
                    >
                      <div>
                        <h4 className="font-bold text-xs text-text-primary truncate">{lead.companyName || lead.clientName}</h4>
                        {lead.companyName && <span className="text-[9px] text-text-secondary block mt-0.5">{lead.clientName}</span>}
                      </div>

                      <div className="flex justify-between items-center text-[10px]">
                        <span className="bg-bg-tertiary px-2 py-0.5 rounded text-text-secondary border border-border-primary">
                          {lead.source}
                        </span>
                        <span className="font-black text-text-primary flex items-center">
                          <DollarSign className="h-3 w-3 text-text-muted" />
                          ₹{lead.revenuePotential.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Stage quick toggle */}
                      <div className="border-t border-border-secondary pt-2.5 flex items-center justify-between gap-2">
                        <span className="text-[9px] text-text-secondary font-semibold uppercase">Move to:</span>
                        <select
                          value={lead.stage}
                          onChange={(e) => handleUpdateStage(lead.id, e.target.value as MockLead['stage'])}
                          className="bg-bg-secondary border border-border-primary text-text-secondary text-[10px] font-semibold rounded px-1.5 py-0.5 focus:outline-none focus:border-brand-accent transition-all"
                        >
                          {stagesList.map((opt) => (
                            <option key={opt.key} value={opt.key}>
                              {opt.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-lg bg-bg-primary border border-border-primary rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] z-10 space-y-6">
            <div className="flex items-center justify-between border-b border-border-primary pb-3">
              <h3 className="font-extrabold text-lg text-text-primary">Add New Lead to Pipeline</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-bg-tertiary">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Prospect Name</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Sanjay Singh"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Zetta Cloud"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sanjay@zetta.in"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 99999 00000"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Deal Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  >
                    <option value="LinkedIn Outbound">LinkedIn Outbound</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Referral">Referral</option>
                    <option value="Organic Search">Organic Search</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Revenue Potential (INR)</label>
                  <input
                    type="number"
                    required
                    value={revenuePotential}
                    onChange={(e) => setRevenuePotential(e.target.value)}
                    placeholder="150000"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Initial Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                >
                  {stagesList.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border-primary">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-border-primary hover:bg-bg-secondary text-xs font-semibold rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-primary text-bg-primary hover:bg-brand-primary/95 text-xs font-semibold rounded-lg transition-all"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
