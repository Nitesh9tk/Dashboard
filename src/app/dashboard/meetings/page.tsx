'use client';
import React, { useState, useEffect } from 'react';
import { MockMeeting } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import { Calendar, Plus, Video, Clock, X, CheckCircle, Trash2 } from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MockMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState('30');
  const [link, setLink] = useState('');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const data = await dataService.getMeetings();
        setMeetings(data);
      } catch (err) {
        console.error('Failed to load meetings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const nm: MockMeeting = {
      id: 'm' + Date.now(), title,
      scheduledAt: new Date(scheduledAt).toISOString(),
      duration: Number(duration), link, status: 'scheduled',
    };
    const saved = await dataService.saveMeeting(nm);
    setMeetings(prev => [saved, ...prev]);
    setIsModalOpen(false);
    setTitle(''); setScheduledAt(''); setDuration('30'); setLink('');
  };

  const handleDelete = async (id: string) => {
    await dataService.removeMeeting(id);
    setMeetings(prev => prev.filter(m => m.id !== id));
  };

  const handleMarkDone = async (id: string) => {
    const target = meetings.find(m => m.id === id);
    if (target) {
      const updated = { ...target, status: 'completed' as const };
      await dataService.saveMeeting(updated);
      setMeetings(prev => prev.map(m => m.id === id ? updated : m));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin" />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Loading meetings...</span>
        </div>
      </div>
    );
  }

  const upcoming = meetings.filter(m => m.status === 'scheduled');
  const completed = meetings.filter(m => m.status === 'completed');

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
      {children}
    </div>
  );

  const inputStyle = {
    background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)',
    color: 'var(--text-primary)', borderRadius: '10px', padding: '10px 12px',
    fontSize: '13px', width: '100%', outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Meetings Hub</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Schedule and join client & team sync calls.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)}
          className="ripple-container flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-blue shadow-sm hover:opacity-90 transition-all cursor-pointer">
          <Plus className="h-4 w-4" /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Upcoming', value: upcoming.length, icon: Calendar, gradient: 'gradient-blue' },
          { label: 'Completed', value: completed.length, icon: CheckCircle, gradient: 'gradient-success' },
          { label: 'Total This Month', value: meetings.length, icon: Video, gradient: 'gradient-purple' },
        ].map(s => (
          <div key={s.label} className="card p-4 animate-fade-up" style={{ background: 'var(--bg-secondary)' }}>
            <div className={`h-9 w-9 ${s.gradient} rounded-xl flex items-center justify-center text-white mb-3 shadow-sm`}>
              <s.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      <div className="card p-5" style={{ background: 'var(--bg-secondary)' }}>
        <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>
          📅 Upcoming Meetings
        </h2>
        <div className="space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No upcoming meetings. Schedule one!</p>
          )}
          {upcoming.map(m => (
            <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl transition-all"
              style={{ border: '1px solid var(--border-primary)' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 gradient-blue rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                  <p className="text-xs flex items-center gap-1.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <Clock className="h-3 w-3" />
                    {new Date(m.scheduledAt).toLocaleString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })}
                    &nbsp;·&nbsp;{m.duration} min
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={m.link} target="_blank" rel="noreferrer"
                  className="ripple-container px-3 py-2 rounded-lg text-xs font-semibold text-white gradient-blue hover:opacity-90 transition-all">
                  Join Call
                </a>
                <button onClick={() => handleMarkDone(m.id)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--success-light)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ''}>
                  Done
                </button>
                <button onClick={() => handleDelete(m.id)} className="p-2 rounded-lg transition-all cursor-pointer"
                  style={{ border: '1px solid var(--border-primary)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--danger-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = ''; }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="card p-5" style={{ background: 'var(--bg-secondary)', opacity: 0.85 }}>
          <h2 className="font-semibold text-sm mb-4 pb-3" style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
            ✅ Completed Meetings
          </h2>
          <div className="space-y-2">
            {completed.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl"
                style={{ border: '1px solid var(--border-primary)', opacity: 0.7 }}>
                <div>
                  <p className="text-sm font-medium line-through" style={{ color: 'var(--text-secondary)' }}>{m.title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(m.scheduledAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })}
                  </p>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>Done</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl p-6 z-10 animate-scale-in space-y-5"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid var(--border-primary)' }}>
              <h3 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>Schedule New Meeting</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-lg"
                style={{ border: '1px solid var(--border-primary)' }}>
                <X className="h-4 w-4" style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <Field label="Meeting Title">
                <input style={inputStyle} required value={title} onChange={e => setTitle(e.target.value)} placeholder="Client Review Call" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date & Time">
                  <input type="datetime-local" style={inputStyle} required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
                </Field>
                <Field label="Duration (min)">
                  <input type="number" style={inputStyle} value={duration} onChange={e => setDuration(e.target.value)} />
                </Field>
              </div>
              <Field label="Meeting Link">
                <input style={inputStyle} required value={link} onChange={e => setLink(e.target.value)} placeholder="https://meet.google.com/..." />
              </Field>
              <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border-primary)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{ border: '1px solid var(--border-primary)', color: 'var(--text-secondary)' }}>
                  Cancel
                </button>
                <button type="submit"
                  className="ripple-container flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-blue hover:opacity-90 transition-all shadow-sm">
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
