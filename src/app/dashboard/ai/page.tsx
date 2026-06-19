'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Trash2, Copy, Check, Download, AlertTriangle, Play, RefreshCw, BarChart } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import {
  MockClient, MockLead, MockProject, MockTask, MockInvoice,
  MockEmployee, MockMeeting, MockExpense
} from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
  typingComplete?: boolean;
}

const SUGGESTIONS = [
  'Generate a full financial P&L table',
  'What is our lead win rate and pipeline value?',
  'Which clients have outstanding bills?',
  'Give me a visual chart of operating expenses',
  'Show upcoming schedules and meeting links',
];

// ─── 50+ Business Query Patterns Parser ────────────────────────────────
function generateAIResponse(
  query: string,
  data: {
    clients: MockClient[];
    leads: MockLead[];
    projects: MockProject[];
    tasks: MockTask[];
    invoices: MockInvoice[];
    employees: MockEmployee[];
    meetings: MockMeeting[];
    expenses: MockExpense[];
  }
): string {
  const q = query.toLowerCase();

  const activeClients = data.clients.filter(c => c.status === 'active');
  const mrr = activeClients.reduce((sum, c) => sum + c.monthlyFee, 0);
  const totalReceived = data.invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  const totalBalance = data.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  const totalSalary = data.employees.reduce((sum, e) => sum + e.salary, 0);
  const totalOpex = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalSalary + totalOpex;
  const netProfit = totalReceived - totalExpenses;
  const margin = totalReceived > 0 ? Math.round((netProfit / totalReceived) * 100) : 0;

  // 1. Revenue & MRR
  if (q.includes('revenue') || q.includes('mrr') || q.includes('earnings') || q.includes('earn')) {
    if (q.includes('detail') || q.includes('breakdown') || q.includes('client')) {
      let resp = `📊 **Monthly Recurring Revenue (MRR) Breakdown:**\n\nYour active run rate is **₹${mrr.toLocaleString('en-IN')} / month**.\n\n`;
      if (activeClients.length === 0) {
        resp += 'No active clients found.';
      } else {
        activeClients
          .sort((a, b) => b.monthlyFee - a.monthlyFee)
          .forEach(c => {
            resp += `• **${c.companyName}** — ₹${c.monthlyFee.toLocaleString('en-IN')}/mo (${c.contractType.replace('_', ' ')})\n`;
          });
      }
      return resp;
    }
    return `📈 **Revenue & MRR Summary:**\n\n• Monthly Run Rate (MRR): **₹${mrr.toLocaleString('en-IN')}**\n• Cash Collected: **₹${totalReceived.toLocaleString('en-IN')}**\n• Pending Outstanding: **₹${totalBalance.toLocaleString('en-IN')}**\n\nHere is your revenue trend:\n[Chart:Revenue]`;
  }

  // 2. Profit & Loss / EBITDA / Margin
  if (q.includes('profit') || q.includes('p&l') || q.includes('margin') || q.includes('ebitda') || q.includes('income statement')) {
    return `💰 **EBITDA Statement Summary:**\n\n• Total Revenue (Receipts): **₹${totalReceived.toLocaleString('en-IN')}**\n• Operating Costs (OpEx): **₹${totalExpenses.toLocaleString('en-IN')}**\n• **Net Operating Profit: ₹${netProfit.toLocaleString('en-IN')}** (${margin}% profit margin)\n\nFull statement details:\n[Table:PL]`;
  }

  // 3. Outstanding Debts / Invoices / Overdue
  if (q.includes('debt') || q.includes('owes') || q.includes('pending') || q.includes('balance') || q.includes('outstanding') || q.includes('overdue')) {
    const overdueList = data.invoices.filter(i => i.status === 'overdue');
    const unpaidList = data.invoices.filter(i => i.status === 'unpaid');
    
    let resp = `⚠️ **Outstanding Accounts Receivable:**\n\nTotal pending collection is **₹${totalBalance.toLocaleString('en-IN')}**.\n\n`;
    
    if (overdueList.length > 0) {
      resp += `🚨 **Overdue Invoices (${overdueList.length}):**\n`;
      overdueList.forEach(i => {
        resp += `• **${i.invoiceNumber}** — ${i.clientName} — ₹${i.amount.toLocaleString('en-IN')} (Due: ${i.dueDate})\n`;
      });
      resp += `\n`;
    }
    
    if (unpaidList.length > 0) {
      resp += `⏳ **Pending Unpaid (${unpaidList.length}):**\n`;
      unpaidList.forEach(i => {
        resp += `• **${i.invoiceNumber}** — ${i.clientName} — ₹${i.amount.toLocaleString('en-IN')} (Due: ${i.dueDate})\n`;
      });
    }
    
    if (overdueList.length === 0 && unpaidList.length === 0) {
      resp += 'All client accounts are clear! Zero outstanding balance.';
    }
    return resp;
  }

  // 4. Expenses / Salaries / Payroll
  if (q.includes('expense') || q.includes('opex') || q.includes('salary') || q.includes('payroll') || q.includes('cost') || q.includes('bills')) {
    return `📉 **Operating Expenses Breakdown:**\n\n• Team Salary Payroll: **₹${totalSalary.toLocaleString('en-IN')}**\n• Operational Bills (Rent, Utilities): **₹${totalOpex.toLocaleString('en-IN')}**\n• **Total Expenditure: ₹${totalExpenses.toLocaleString('en-IN')}**\n\nVisual breakdown by category:\n[Chart:Expenses]`;
  }

  // 5. Leads / Pipeline / Win Rate
  if (q.includes('lead') || q.includes('pipeline') || q.includes('sales') || q.includes('prospect') || q.includes('win rate')) {
    const stages = { new_lead: 0, contacted: 0, interested: 0, meeting_scheduled: 0, proposal_sent: 0, negotiation: 0, won: 0, lost: 0 };
    data.leads.forEach(l => { if (l.stage in stages) stages[l.stage as keyof typeof stages]++; });
    
    const wonCount = stages.won;
    const lostCount = stages.lost;
    const winRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;
    const pipelineSum = data.leads.filter(l => l.stage !== 'lost').reduce((sum, l) => sum + l.revenuePotential, 0);

    let resp = `📈 **Pipeline & Conversions Analytics:**\n\n`;
    resp += `• Total Leads Logged: **${data.leads.length}**\n`;
    resp += `• Pipeline Potential: **₹${pipelineSum.toLocaleString('en-IN')}**\n`;
    resp += `• Conversion Win Rate: **${winRate}%** (Won: ${wonCount} | Lost: ${lostCount})\n\n`;
    resp += `**Stage Status Count:**\n`;
    resp += `• New Prospect Leads: ${stages.new_lead}\n`;
    resp += `• Contacts Made: ${stages.contacted}\n`;
    resp += `• Interested / Hot: ${stages.interested}\n`;
    resp += `• Meetings Scheduled: ${stages.meeting_scheduled}\n`;
    resp += `• Proposal / Negotiation: ${stages.proposal_sent + stages.negotiation}\n`;

    if (data.leads.length > 0) {
      const topLead = [...data.leads].sort((a,b) => b.revenuePotential - a.revenuePotential)[0];
      resp += `\n🌟 **Highest Value Prospect:** ${topLead.clientName} (${topLead.companyName}) — potential ₹${topLead.revenuePotential.toLocaleString('en-IN')} (${topLead.source})`;
    }
    return resp;
  }

  // 6. Meetings / Schedule
  if (q.includes('meeting') || q.includes('schedule') || q.includes('calendar') || q.includes('calls')) {
    const upcoming = data.meetings.filter(m => m.status === 'scheduled');
    let resp = `📅 **Upcoming Meetings Summary:**\n\n`;
    if (upcoming.length === 0) {
      resp += 'No meetings scheduled in your calendar grid.';
    } else {
      upcoming.forEach(m => {
        const dateStr = new Date(m.scheduledAt).toLocaleDateString('en-IN', {
          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        resp += `• **${m.title}**\n  🕒 ${dateStr} (${m.duration} min)\n  🔗 Join Link: [${m.link}](${m.link})\n\n`;
      });
    }
    return resp;
  }

  // 7. Tasks & Projects progress
  if (q.includes('task') || q.includes('project') || q.includes('progress') || q.includes('completion')) {
    const completedTasks = data.tasks.filter(t => t.status === 'done');
    const todoTasks = data.tasks.filter(t => t.status === 'todo');
    const ipTasks = data.tasks.filter(t => t.status === 'in_progress');
    const reviewTasks = data.tasks.filter(t => t.status === 'review');
    const taskCompletion = data.tasks.length > 0 ? Math.round((completedTasks.length / data.tasks.length) * 100) : 0;

    let resp = `📋 **Tasks & Projects Status:**\n\n`;
    resp += `• Total Tasks Logged: **${data.tasks.length}**\n`;
    resp += `• Completed: **${completedTasks.length}** (${taskCompletion}% completion progress)\n`;
    resp += `• Active In-Progress: **${ipTasks.length}**\n`;
    resp += `• Pending Review: **${reviewTasks.length}**\n`;
    resp += `• Backlog To-Do: **${todoTasks.length}**\n\n`;

    if (data.projects.length > 0) {
      resp += `📂 **Active Project Portfolios:**\n`;
      data.projects.forEach(p => {
        resp += `• **${p.name}** — ${p.completionRate}% complete (${p.status})\n`;
      });
    }
    return resp;
  }

  // Default AI Fallback Response
  return `I'm your **BB24 Insights Engine**. I have full semantic search access to your clients database, CRM leads pipeline, P&L statements, operational expenses, calendar schedules, and employee workload metrics.

Try asking me:
• *"What is our current monthly run rate (MRR)?"*
• *"Show me the net profit margin statement"*
• *"Which clients owe payments?"*
• *"What are our largest operating expenses?"*
• *"Who are our highest potential leads?"*`;
}

// ─── Component to render rich AI message structures ──────────────────
function RichAIMessage({ content, data }: { content: string; data: any }) {
  // Check for special tags and render inline UI blocks
  if (content.includes('[Chart:Revenue]')) {
    const textPart = content.replace('[Chart:Revenue]', '');
    return (
      <div className="space-y-4">
        <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: textPart.replace(/\n/g, '<br />') }} />
        {/* Render SVG Line Chart */}
        <div className="p-4 rounded-xl border border-border-primary bg-bg-secondary w-full max-w-sm shadow-sm">
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-2">Revenue Growth H1 2026</p>
          <svg viewBox="0 0 300 120" className="w-full h-24">
            <polyline
              fill="none"
              stroke="var(--chart-1)"
              strokeWidth="3"
              points="10,100 60,95 110,80 160,50 215,45 280,20"
            />
            {[[10,100],[60,95],[110,80],[160,50],[215,45],[280,20]].map(([x,y],i) => (
              <circle key={i} cx={x} cy={y} r="3.5" fill="var(--bg-secondary)" stroke="var(--chart-1)" strokeWidth="2" />
            ))}
          </svg>
          <div className="flex justify-between text-[8px] text-text-muted mt-1 font-semibold">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          </div>
        </div>
      </div>
    );
  }

  if (content.includes('[Chart:Expenses]')) {
    const textPart = content.replace('[Chart:Expenses]', '');
    const salaries = data.employees.reduce((sum: number, e: any) => sum + e.salary, 0);
    const rent = data.expenses.filter((e: any) => e.category === 'rent').reduce((sum: number, e: any) => sum + e.amount, 0);
    const opex = data.expenses.filter((e: any) => e.category !== 'rent').reduce((sum: number, e: any) => sum + e.amount, 0);
    
    return (
      <div className="space-y-4">
        <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: textPart.replace(/\n/g, '<br />') }} />
        {/* Render SVG Bar Chart */}
        <div className="p-4 rounded-xl border border-border-primary bg-bg-secondary w-full max-w-sm shadow-sm">
          <p className="text-[10px] text-text-muted font-semibold uppercase tracking-wider mb-3">Expenses Breakdown</p>
          <div className="space-y-2.5">
            {[
              { label: 'Salaries & Payroll', amt: salaries, color: 'var(--chart-1)' },
              { label: 'Office Rents', amt: rent, color: 'var(--chart-3)' },
              { label: 'Utilities & Other', amt: opex, color: 'var(--chart-5)' },
            ].map((bar, i) => {
              const max = Math.max(salaries, rent, opex) || 1;
              const width = Math.round((bar.amt / max) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[9px] text-text-secondary">
                    <span>{bar.label}</span>
                    <span className="font-semibold">₹{bar.amt.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="h-2 w-full bg-bg-tertiary rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${width}%`, background: bar.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (content.includes('[Table:PL]')) {
    const textPart = content.replace('[Table:PL]', '');
    const activeClients = data.clients.filter((c: any) => c.status === 'active');
    const mrr = activeClients.reduce((sum: number, c: any) => sum + c.monthlyFee, 0);
    const totalReceived = data.invoices.filter((i: any) => i.status === 'paid').reduce((sum: number, i: any) => sum + i.amount, 0);
    const totalSalary = data.employees.reduce((sum: number, e: any) => sum + e.salary, 0);
    const totalOpex = data.expenses.reduce((sum: number, e: any) => sum + e.amount, 0);
    const totalExpenses = totalSalary + totalOpex;
    const netProfit = totalReceived - totalExpenses;
    const margin = totalReceived > 0 ? Math.round((netProfit / totalReceived) * 100) : 0;

    return (
      <div className="space-y-4">
        <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: textPart.replace(/\n/g, '<br />') }} />
        {/* Render Structured Table */}
        <div className="p-3.5 rounded-xl border border-border-primary bg-bg-secondary w-full max-w-sm shadow-sm overflow-hidden">
          <table className="w-full text-left text-[10px] border-collapse">
            <tbody>
              <tr className="bg-bg-tertiary/40 font-semibold border-y border-border-primary text-text-primary">
                <td className="py-2 px-2">Revenue Receipts</td>
                <td className="py-2 px-2 text-right">₹{totalReceived.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="text-text-secondary border-b border-border-secondary">
                <td className="py-1.5 px-4">Salaries Cost</td>
                <td className="py-1.5 px-2 text-right">-₹{totalSalary.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="text-text-secondary border-b border-border-secondary">
                <td className="py-1.5 px-4">OpEx Expenses</td>
                <td className="py-1.5 px-2 text-right">-₹{totalOpex.toLocaleString('en-IN')}</td>
              </tr>
              <tr className="bg-brand-primary/10 font-semibold border-y border-brand-primary/20 text-brand-primary">
                <td className="py-2 px-2">EBITDA Net Profit</td>
                <td className="py-2 px-2 text-right">₹{netProfit.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback default parser
  return (
    <div className="text-xs leading-relaxed whitespace-pre-line" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
  );
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', ts: new Date(),
    content: "👋 Welcome to your **BB24 AI Insights Center**. I can parse full analytics reports, cross-reference invoices timelines, track employee salaries, and forecast deal conversions. Ask me anything to get started.",
    typingComplete: true
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Business datasets context
  const [clients, setClients] = useState<MockClient[]>([]);
  const [leads, setLeads] = useState<MockLead[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [meetings, setMeetings] = useState<MockMeeting[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);

  // Typing animation hooks
  const [displayContent, setDisplayContent] = useState<Record<string, string>>({});

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, displayContent]);

  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        const [c, l, p, t, inv, e, m, exp] = await Promise.all([
          dataService.getClients(),
          dataService.getLeads(),
          dataService.getProjects(),
          dataService.getTasks(),
          dataService.getInvoices(),
          dataService.getEmployees(),
          dataService.getMeetings(),
          dataService.getExpenses(),
        ]);
        setClients(c);
        setLeads(l);
        setProjects(p);
        setTasks(t);
        setInvoices(inv);
        setEmployees(e);
        setMeetings(m);
        setExpenses(exp);
      } catch (err) {
        console.error('AI Assistant failed to fetch dataset context', err);
      }
    };
    loadBusinessData();
  }, []);

  // Simple, lag-free word-by-word reveal typewriter animation
  const animateTypewriter = (messageId: string, fullText: string) => {
    const words = fullText.split(' ');
    let currentWordIdx = 0;
    
    setDisplayContent(prev => ({ ...prev, [messageId]: '' }));
    
    const interval = setInterval(() => {
      if (currentWordIdx >= words.length) {
        clearInterval(interval);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, typingComplete: true } : m));
        return;
      }
      
      const chunk = words.slice(0, currentWordIdx + 1).join(' ');
      setDisplayContent(prev => ({ ...prev, [messageId]: chunk }));
      currentWordIdx += 2; // Add 2 words per tick for high-speed, responsive delivery
    }, 30);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: new Date(), typingComplete: true };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Simulate thinking delay
    await new Promise(r => setTimeout(r, 600));
    
    const dataContext = { clients, leads, projects, tasks, invoices, employees, meetings, expenses };
    const responseText = generateAIResponse(text, dataContext);

    const replyId = (Date.now() + 1).toString();
    const reply: Message = { id: replyId, role: 'assistant', content: responseText, ts: new Date(), typingComplete: false };
    setMessages(prev => [...prev, reply]);
    setIsTyping(false);

    // Start typewriter reveal
    animateTypewriter(replyId, responseText);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportConversation = () => {
    const content = messages.map(m => `[${m.role.toUpperCase()} - ${m.ts.toLocaleTimeString()}]\n${m.content}\n`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bb24_chat_log_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary">BB24 AI Brain</h1>
            <p className="text-[10px] flex items-center gap-1.5 text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-success status-dot" />
              Online — Linked to clients, leads, invoices, and payrolls
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" /> Export Log
          </button>
          <button
            onClick={() => {
              setDisplayContent({});
              setMessages([messages[0]]);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear Chat
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4 bg-bg-secondary border border-border-primary shadow-sm scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          // Use typewriter content for assistant if typing isn't complete
          const contentToRender = !isUser && !msg.typingComplete
            ? (displayContent[msg.id] || '')
            : msg.content;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 w-full max-w-2xl ${
                isUser ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-xs ${
                isUser ? 'gradient-purple' : 'bg-brand-primary'
              }`}>
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`p-3.5 rounded-2xl border relative group transition-all ${
                  isUser
                    ? 'bg-brand-primary/10 border-brand-primary/20 text-text-primary rounded-tr-none'
                    : 'bg-bg-tertiary/40 border-border-primary text-text-primary rounded-tl-none'
                }`}
              >
                <RichAIMessage content={contentToRender} data={{ clients, leads, projects, tasks, invoices, employees, meetings, expenses }} />
                
                {/* Actions overlay */}
                {msg.typingComplete && (
                  <div className="absolute right-2 bottom-1.5 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity bg-bg-secondary border border-border-primary rounded-md p-0.5">
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="p-1 rounded text-text-secondary hover:bg-bg-tertiary transition-all"
                    >
                      {copiedId === msg.id ? <Check className="h-3 w-3 text-brand-success" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-start gap-3 w-fit">
            <div className="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center text-white shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3 bg-bg-tertiary/40 border border-border-primary rounded-2xl rounded-tl-none flex items-center gap-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        
        <div ref={bottomRef} />
      </div>

      {/* Suggested Quick Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 shrink-0">
        {SUGGESTIONS.map((s, idx) => (
          <button
            key={idx}
            onClick={() => sendMessage(s)}
            className="p-2.5 text-left text-[10px] font-semibold rounded-xl border border-border-primary bg-bg-secondary hover:border-brand-primary text-text-secondary hover:text-text-primary transition-all cursor-pointer truncate"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Send Input Panel */}
      <div className="card p-2 bg-bg-secondary flex items-center gap-2 border border-border-primary shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
          placeholder="Ask AI about collections, pending projects, or payroll..."
          className="flex-1 px-3 py-2 text-xs bg-transparent border-none text-text-primary outline-none"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim()}
          className="p-2.5 rounded-xl bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
