'use client';

import React, { useState, useEffect } from 'react';
import { MockMeeting } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import {
  Calendar as CalendarIcon, Plus, Video, Clock, X, CheckCircle,
  Trash2, ChevronLeft, ChevronRight, Users, LayoutGrid, List,
  Link as LinkIcon, RefreshCw, AlertTriangle
} from 'lucide-react';

const TYPE_COLORS = {
  internal: { bg: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)', border: 'rgba(16, 185, 129, 0.25)', label: 'Internal Sprint' },
  client: { bg: 'rgba(37, 99, 235, 0.12)', color: 'var(--accent)', border: 'rgba(37, 99, 235, 0.25)', label: 'Client Sync' },
  urgent: { bg: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)', border: 'rgba(239, 68, 68, 0.25)', label: 'Urgent Audit' },
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MockMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
  
  // Date states
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('30');
  const [link, setLink] = useState('');
  const [meetingType, setMeetingType] = useState<'internal' | 'client' | 'urgent'>('client');
  const [summary, setSummary] = useState('');

  const fetchMeetings = async () => {
    try {
      const data = await dataService.getMeetings();
      setMeetings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const nm: MockMeeting & { summary?: string } = {
      id: 'm' + Date.now(),
      title,
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration: Number(duration),
      link: link || 'https://meet.google.com/abc-defg-hij',
      status: 'scheduled',
      summary: summary || `${meetingType === 'client' ? 'Client sync call' : 'Sprint review session'}.`
    };
    
    // Save to list
    const saved = await dataService.saveMeeting(nm);
    setMeetings(prev => [saved, ...prev]);
    setIsModalOpen(false);
    
    // Reset Form
    setTitle(''); setScheduledAt(''); setDuration('30'); setLink(''); setSummary(''); setMeetingType('client');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Cancel this meeting?")) {
      await dataService.removeMeeting(id);
      setMeetings(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleMarkDone = async (id: string) => {
    const target = meetings.find(m => m.id === id);
    if (target) {
      const updated = { ...target, status: 'completed' as const };
      await dataService.saveMeeting(updated);
      setMeetings(prev => prev.map(m => m.id === id ? updated : m));
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Date generators
  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayIndex = new Date(year, monthIndex, 1).getDay(); // Sunday = 0, Monday = 1 ...

  const monthDaysArray: (Date | null)[] = [];
  // Prefix days
  for (let i = 0; i < firstDayIndex; i++) {
    monthDaysArray.push(null);
  }
  // Actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    monthDaysArray.push(new Date(year, monthIndex, i));
  }

  // Week view dates calculation (current week Mon-Sun)
  const getWeekDays = () => {
    const today = new Date(currentDate);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const weekDaysArray = getWeekDays();

  // Helper to format date key matching 'YYYY-MM-DD'
  const formatDateKey = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Check meetings matching a specific day
  const getDayMeetings = (d: Date) => {
    const key = formatDateKey(d);
    return meetings.filter(m => m.scheduledAt.startsWith(key));
  };

  // Total metrics
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');
  const completedMeetings = meetings.filter(m => m.status === 'completed');

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading meetings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Calendar & Meetings</h1>
          <p className="text-text-secondary text-sm mt-1">Schedule recurring syncs, manage group calls, and coordinate upcoming sprints.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white hover:opacity-90 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer animate-pulse-soft"
        >
          <Plus className="h-4 w-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Calendar view toggles & header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-bg-secondary p-4 card">
        
        {/* Navigation month/week indicators */}
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 border border-border-primary rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <h2 className="text-base font-bold text-text-primary min-w-[140px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button
            onClick={handleNextMonth}
            className="p-2 border border-border-primary rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Mode selector */}
        <div className="flex gap-1 p-1 rounded-xl bg-bg-tertiary w-fit">
          {[
            { id: 'month', label: 'Month Grid', icon: LayoutGrid },
            { id: 'week', label: 'Week View', icon: CalendarIcon },
            { id: 'list', label: 'All Meetings', icon: List },
          ].map(m => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === m.id
                    ? 'bg-bg-secondary text-brand-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Month Grid View ── */}
      {viewMode === 'month' && (
        <div className="card bg-bg-secondary overflow-hidden p-4">
          
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-primary pb-3 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 bg-border-primary/20">
            {monthDaysArray.map((day, idx) => {
              const dayMeetings = day ? getDayMeetings(day) : [];
              const isToday = day ? formatDateKey(day) === formatDateKey(new Date()) : false;

              return (
                <div
                  key={idx}
                  className={`calendar-day min-h-[90px] border border-border-secondary p-1 flex flex-col justify-between ${
                    day ? 'bg-bg-secondary' : 'bg-bg-tertiary/10 pointer-events-none'
                  } ${isToday ? 'today' : ''}`}
                >
                  {day ? (
                    <>
                      {/* Day number */}
                      <span className={`text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full ${
                        isToday ? 'bg-brand-primary text-white' : 'text-text-secondary'
                      }`}>
                        {day.getDate()}
                      </span>

                      {/* Day meetings stack */}
                      <div className="space-y-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                        {dayMeetings.map(m => {
                          const mType = (m.title.toLowerCase().includes('sync') || m.title.toLowerCase().includes('client')) ? 'client' :
                                        (m.title.toLowerCase().includes('audit') || m.title.toLowerCase().includes('urgent')) ? 'urgent' : 'internal';
                          const theme = TYPE_COLORS[mType];
                          return (
                            <div
                              key={m.id}
                              style={{ background: theme.bg, color: theme.color, borderColor: theme.border }}
                              className="text-[9px] font-bold p-1 rounded border truncate"
                              title={m.title}
                            >
                              {m.title}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Week View ── */}
      {viewMode === 'week' && (
        <div className="card bg-bg-secondary p-4 overflow-x-auto">
          <div className="min-w-[650px] grid grid-cols-7 gap-2">
            {weekDaysArray.map((day, idx) => {
              const dayMeetings = getDayMeetings(day);
              const isToday = formatDateKey(day) === formatDateKey(new Date());

              return (
                <div key={idx} className={`p-3 rounded-xl border flex flex-col h-[400px] justify-between ${
                  isToday ? 'border-brand-primary bg-brand-primary/5' : 'border-border-primary bg-bg-tertiary/20'
                }`}>
                  <div>
                    {/* Day Header */}
                    <div className="text-center pb-2.5 border-b border-border-primary mb-3">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                        {day.toLocaleDateString('default', { weekday: 'short' })}
                      </p>
                      <h4 className={`text-base font-extrabold mt-1 h-6 w-6 mx-auto flex items-center justify-center rounded-full ${
                        isToday ? 'bg-brand-primary text-white' : 'text-text-primary'
                      }`}>
                        {day.getDate()}
                      </h4>
                    </div>

                    {/* Day Meetings Stack */}
                    <div className="space-y-2.5 overflow-y-auto max-h-[280px] scrollbar-thin">
                      {dayMeetings.length > 0 ? (
                        dayMeetings.map(m => {
                          const mType = (m.title.toLowerCase().includes('sync') || m.title.toLowerCase().includes('client')) ? 'client' :
                                        (m.title.toLowerCase().includes('audit') || m.title.toLowerCase().includes('urgent')) ? 'urgent' : 'internal';
                          const theme = TYPE_COLORS[mType];
                          return (
                            <div
                              key={m.id}
                              style={{ background: theme.bg, color: theme.color, borderColor: theme.border }}
                              className="p-2 border rounded-xl flex flex-col gap-1 shadow-sm"
                            >
                              <span className="text-[9px] font-bold line-clamp-2">{m.title}</span>
                              <span className="text-[8px] opacity-75 font-semibold flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                {new Date(m.scheduledAt).toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-[9px] text-text-muted text-center py-10 italic">No schedules</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── List View ── */}
      {viewMode === 'list' && (
        <div className="card bg-bg-secondary p-5 space-y-4 animate-fade-in">
          <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3">
            All Scheduled Syncs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meetings.map((m) => {
              const mType = (m.title.toLowerCase().includes('sync') || m.title.toLowerCase().includes('client')) ? 'client' :
                            (m.title.toLowerCase().includes('audit') || m.title.toLowerCase().includes('urgent')) ? 'urgent' : 'internal';
              const theme = TYPE_COLORS[mType];

              return (
                <div key={m.id} className="p-4 border border-border-primary rounded-xl flex flex-col justify-between gap-3 bg-bg-tertiary/20">
                  <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-text-primary">{m.title}</span>
                        <span className="text-[8px] font-extrabold px-2 py-0.5 rounded border uppercase" style={{ background: theme.bg, color: theme.color, borderColor: theme.border }}>
                          {theme.label}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary">
                        {new Date(m.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {m.duration} min
                      </p>
                    </div>

                    <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full capitalize shrink-0 ${
                      m.status === 'completed' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  {m.summary && (
                    <p className="text-[10px] text-text-secondary italic bg-bg-secondary p-2 rounded-lg border border-border-primary">
                      {m.summary}
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-border-secondary">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 bg-danger-light text-danger rounded-lg hover:opacity-90 transition-all cursor-pointer"
                        title="Cancel Meeting"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      {m.status === 'scheduled' && (
                        <button
                          onClick={() => handleMarkDone(m.id)}
                          className="p-1.5 bg-success-light text-success rounded-lg hover:opacity-90 transition-all cursor-pointer"
                          title="Mark Done"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {m.status === 'scheduled' && m.link && (
                      <a
                        href={m.link} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] font-bold text-white bg-brand-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-all text-center"
                      >
                        <Video className="h-3 w-3" /> Join Call
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule Meeting Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-extrabold text-base text-text-primary">Schedule Meeting Sync</h3>
                <p className="text-xs text-text-secondary mt-0.5">Integrate zoom/meet coordinates for payroll staff or clients.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Topic / Title</label>
                <input
                  type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="GS Ayurveda Project Sync"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Date & Time</label>
                  <input
                    type="datetime-local" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Duration (min)</label>
                  <select
                    value={duration} onChange={e => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes</option>
                    <option value="45">45 Minutes</option>
                    <option value="60">60 Minutes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Sync Type</label>
                  <select
                    value={meetingType} onChange={e => setMeetingType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="client">Client Sync (Blue)</option>
                    <option value="internal">Internal Sprint (Green)</option>
                    <option value="urgent">Urgent Audit (Red)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Meeting Link</label>
                  <input
                    type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Notes / Agenda (Optional)</label>
                <textarea
                  value={summary} onChange={e => setSummary(e.target.value)} placeholder="Agenda outline details..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary h-20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border-primary">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold border border-border-primary text-text-secondary hover:bg-bg-tertiary transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-brand-primary hover:opacity-90 transition-all shadow-sm cursor-pointer"
                >
                  Schedule Call
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
