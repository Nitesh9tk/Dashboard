'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Trash2, Copy, Check } from 'lucide-react';
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
}

const SUGGESTIONS = [
  'Show me this month\'s revenue summary',
  'Which client owes the most money?',
  'How many active clients do we have?',
  'What is our net profit this month?',
  'List all team members and salaries',
];

// Simple rule-based responses using real dynamic database/localStorage context
function generateResponse(
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
  const totalReceived = data.clients.reduce((sum, c) => sum + c.received, 0);
  const totalBalance = data.clients.reduce((sum, c) => sum + c.balance, 0);
  const totalSalary = data.employees.reduce((sum, e) => sum + e.salary, 0);
  const totalOpex = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = totalSalary + totalOpex;
  const netProfit = mrr - totalExpenses;
  const margin = mrr > 0 ? Math.round((netProfit / mrr) * 100) : 0;

  if (q.includes('revenue') || q.includes('mrr')) {
    let breakdown = `📊 **Monthly Revenue (MRR): ₹${mrr.toLocaleString('en-IN')}**\n\nBreakdown by client:\n`;
    if (activeClients.length === 0) {
      breakdown += 'No active clients found.';
    } else {
      activeClients
        .sort((a, b) => b.monthlyFee - a.monthlyFee)
        .forEach(c => {
          breakdown += `• ${c.companyName} — ₹${c.monthlyFee.toLocaleString('en-IN')}\n`;
        });
    }
    return breakdown;
  }
  
  if (q.includes('profit') || q.includes('expenses') || q.includes('p&l')) {
    return `💰 **P&L Summary:**\n\n• Total Revenue: ₹${mrr.toLocaleString('en-IN')}\n• Team Salaries: ₹${totalSalary.toLocaleString('en-IN')}\n• Operational Expenses: ₹${totalOpex.toLocaleString('en-IN')}\n• **Net Profit: ₹${netProfit.toLocaleString('en-IN')}** (${margin}% margin)`;
  }
  
  if (q.includes('client') && (q.includes('owes') || q.includes('pending') || q.includes('balance') || q.includes('outstanding'))) {
    const debtors = data.clients.filter(c => c.balance > 0);
    let breakdown = `⚠️ **Pending Collections:**\n\n`;
    if (debtors.length === 0) {
      breakdown += 'All accounts cleared! No pending outstanding balance.';
    } else {
      debtors.forEach(c => {
        const payStatus = c.received === 0 ? 'fully unpaid' : 'partial';
        breakdown += `• ${c.companyName} — ₹${c.balance.toLocaleString('en-IN')} (${payStatus})\n`;
      });
      breakdown += `\n**Total Outstanding: ₹${totalBalance.toLocaleString('en-IN')}**`;
    }
    return breakdown;
  }
  
  if (q.includes('active client') || q.includes('how many client')) {
    const active = data.clients.filter(c => c.status === 'active').length;
    const completed = data.clients.filter(c => c.status === 'completed').length;
    const paused = data.clients.filter(c => c.status === 'paused').length;
    
    let resp = `👥 **Client Status:**\n\n• Active Clients: ${active}\n• Completed Clients: ${completed}\n`;
    if (paused > 0) resp += `• Paused Clients: ${paused}\n`;
    resp += `• Total Clients: ${data.clients.length}\n`;
    
    if (active > 0) {
      const topClient = [...data.clients].sort((a, b) => b.monthlyFee - a.monthlyFee)[0];
      resp += `\nHighest value client: ${topClient.companyName} (₹${topClient.monthlyFee.toLocaleString('en-IN')}/mo)`;
    }
    return resp;
  }
  
  if (q.includes('team') || q.includes('employee') || q.includes('salary') || q.includes('salaries')) {
    let resp = `👨‍💼 **Team Members:**\n\n`;
    if (data.employees.length === 0) {
      resp += 'No team members recorded.';
    } else {
      data.employees.forEach(e => {
        resp += `• ${e.name} — ${e.position} — ₹${e.salary.toLocaleString('en-IN')}/mo\n`;
      });
      resp += `\n**Total Salary Bill: ₹${totalSalary.toLocaleString('en-IN')}/mo**`;
    }
    return resp;
  }
  
  if (q.includes('lead') || q.includes('pipeline') || q.includes('sales')) {
    const stages = {
      new_lead: 0, contacted: 0, interested: 0, meeting_scheduled: 0,
      proposal_sent: 0, negotiation: 0, won: 0, lost: 0
    };
    data.leads.forEach(l => {
      if (l.stage in stages) stages[l.stage as keyof typeof stages]++;
    });
    
    let resp = `📈 **Sales Pipeline:**\n\n• Total Leads: ${data.leads.length}\n• Won: ${stages.won}\n• In Negotiation: ${stages.negotiation}\n• Proposal Sent: ${stages.proposal_sent}\n• Lost: ${stages.lost}\n• New/Contacted: ${stages.new_lead + stages.contacted}\n\n`;
    
    if (data.leads.length > 0) {
      const highestLead = [...data.leads].sort((a,b) => b.revenuePotential - a.revenuePotential)[0];
      resp += `Highest potential lead: ${highestLead.clientName} from ${highestLead.companyName || 'Unknown'} (₹${highestLead.revenuePotential.toLocaleString('en-IN')} - ${highestLead.source})`;
    }
    return resp;
  }
  
  if (q.includes('meeting') || q.includes('schedule')) {
    const upcoming = data.meetings.filter(m => m.status === 'scheduled');
    let resp = `📅 **Upcoming Meetings:**\n\n`;
    if (upcoming.length === 0) {
      resp += 'No upcoming meetings scheduled.';
    } else {
      upcoming.forEach(m => {
        const dateStr = new Date(m.scheduledAt).toLocaleDateString('en-IN', {
          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        resp += `• ${m.title} — ${dateStr}\n`;
      });
    }
    return resp;
  }
  
  return `I'm BB24's AI assistant. I can help you with:\n\n📊 Revenue & P&L analysis\n👥 Client account details\n💰 Expense breakdowns\n📈 Lead pipeline status\n👨‍💼 Team & salary info\n📅 Meeting schedules\n\nTry asking: *"What is our net profit?"* or *"Which client owes the most?"*`;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([{
    id: '0', role: 'assistant', ts: new Date(),
    content: "👋 Hi! I'm BB24's AI assistant. Ask me anything about your clients, revenue, leads, or team.",
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Dynamic business context datasets
  const [clients, setClients] = useState<MockClient[]>([]);
  const [leads, setLeads] = useState<MockLead[]>([]);
  const [projects, setProjects] = useState<MockProject[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [invoices, setInvoices] = useState<MockInvoice[]>([]);
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [meetings, setMeetings] = useState<MockMeeting[]>([]);
  const [expenses, setExpenses] = useState<MockExpense[]>([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

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

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, ts: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 700 + Math.random() * 600));
    
    // Inject dynamic state context into response generator
    const dataContext = { clients, leads, projects, tasks, invoices, employees, meetings, expenses };
    const responseText = generateResponse(text, dataContext);

    const reply: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: responseText, ts: new Date() };
    setMessages(prev => [...prev, reply]);
    setIsTyping(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 gradient-blue rounded-xl flex items-center justify-center text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>BB24 AI Assistant</h1>
            <p className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 status-dot" />
              Online — Knows your clients, leads, and finances
            </p>
          </div>
        </div>
        <button onClick={() => setMessages([messages[0]])}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
          style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl p-4 space-y-4 shadow-sm" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 animate-fade-up ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'assistant' ? 'gradient-blue text-white' : 'text-white'}`}
              style={msg.role === 'user' ? { background: 'var(--accent)' } : {}}>
              {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] relative group`}>
              <div className="p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                style={msg.role === 'assistant'
                  ? { background: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderRadius: '4px 16px 16px 16px' }
                  : { background: 'var(--accent)', color: '#fff', borderRadius: '16px 4px 16px 16px' }}>
                {msg.content}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {msg.ts.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {msg.role === 'assistant' && (
                  <button onClick={() => handleCopy(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded cursor-pointer"
                    style={{ color: 'var(--text-muted)' }}>
                    {copiedId === msg.id ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fade-up">
            <div className="h-8 w-8 rounded-xl gradient-blue flex items-center justify-center text-white shadow-sm shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="p-3.5 rounded-2xl flex items-center gap-1.5" style={{ background: 'var(--bg-tertiary)', borderRadius: '4px 16px 16px 16px' }}>
              {[0,1,2].map(i => (
                <span key={i} className="h-2 w-2 rounded-full bg-blue-400"
                  style={{ animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => sendMessage(s)}
            className="ripple-container whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer"
            style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)', background: 'var(--bg-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'; }}>
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3 shrink-0">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Ask about your business..."
          className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)' }}
          onFocus={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'}
          onBlur={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-primary)'} />
        <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
          className="ripple-container h-12 w-12 rounded-xl flex items-center justify-center text-white gradient-blue shadow-sm hover:opacity-90 transition-all disabled:opacity-40 cursor-pointer">
          <Send className="h-4 w-4" />
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
