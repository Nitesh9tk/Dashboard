'use client';

import React, { useState, useEffect } from 'react';
import { authHelper } from '@/lib/auth';
import {
  Settings as SettingsIcon, User, Building2, Bell, Palette,
  Shield, Download, Moon, Sun, Monitor, Save, Check,
  Mail, Phone, Globe, Lock, Key, ChevronRight,
  Database, Trash2, AlertTriangle,
} from 'lucide-react';

type SettingsTab = 'profile' | 'organization' | 'appearance' | 'notifications' | 'security' | 'data';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [firstName, setFirstName] = useState('Neha');
  const [lastName, setLastName] = useState('Sharma');
  const [email, setEmail] = useState('ceo.bb24.agency@gmail.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [role, setRole] = useState('Admin');

  // Org fields
  const [orgName, setOrgName] = useState('BB24 Agency');
  const [orgIndustry, setOrgIndustry] = useState('Digital Marketing');
  const [orgWebsite, setOrgWebsite] = useState('https://bb24.agency');

  // Notifications
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [invoiceReminders, setInvoiceReminders] = useState(true);
  const [meetingAlerts, setMeetingAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (stored) setTheme(stored);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = (t: 'light' | 'dark' | 'auto') => {
    setTheme(t);
    const actual = t === 'auto' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : t;
    localStorage.setItem('theme', actual);
    document.documentElement.classList.toggle('dark', actual === 'dark');
  };

  const handleExportData = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bb24_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'bb24_backup.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'organization' as const, label: 'Organization', icon: Building2 },
    { key: 'appearance' as const, label: 'Appearance', icon: Palette },
    { key: 'notifications' as const, label: 'Notifications', icon: Bell },
    { key: 'security' as const, label: 'Security', icon: Shield },
    { key: 'data' as const, label: 'Data & Backup', icon: Database },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12, padding: 2,
        background: checked ? 'var(--accent)' : 'var(--bg-tertiary)',
        border: 'none', cursor: 'pointer', transition: 'background 200ms ease',
        display: 'flex', alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: '50%', background: 'white',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        transition: 'all 200ms ease',
      }} />
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Manage your account, organization, and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: 24, minHeight: 500 }}>
        {/* Sidebar Tabs */}
        <div className="card" style={{ background: 'var(--bg-card)', width: 240, padding: 8, flexShrink: 0, height: 'fit-content' }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, border: 'none',
                  background: isActive ? 'var(--accent-light)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: isActive ? 600 : 500, cursor: 'pointer',
                  transition: 'all 150ms ease', textAlign: 'left',
                }}
              >
                <Icon style={{ width: 16, height: 16 }} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="card animate-fade-up" style={{ background: 'var(--bg-card)', flex: 1, padding: 28 }}>
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Profile Settings</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Manage your personal information</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 22, fontWeight: 800,
                }}>NS</div>
                <div>
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Neha Sharma</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Admin • BB24 Agency</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { label: 'First Name', value: firstName, setter: setFirstName },
                  { label: 'Last Name', value: lastName, setter: setLastName },
                  { label: 'Email Address', value: email, setter: setEmail },
                  { label: 'Phone Number', value: phone, setter: setPhone },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                    <input className="input-field" value={field.value} onChange={e => field.setter(e.target.value)} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Role</label>
                <input className="input-field" value={role} disabled style={{ opacity: 0.6 }} />
              </div>

              <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: 24 }}>
                {saved ? <><Check style={{ width: 16, height: 16 }} /> Saved!</> : <><Save style={{ width: 16, height: 16 }} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeTab === 'organization' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Organization</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Manage your company details</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'Organization Name', value: orgName, setter: setOrgName, icon: Building2 },
                  { label: 'Industry', value: orgIndustry, setter: setOrgIndustry, icon: Globe },
                  { label: 'Website', value: orgWebsite, setter: setOrgWebsite, icon: Globe },
                ].map(field => (
                  <div key={field.label}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{field.label}</label>
                    <input className="input-field" value={field.value} onChange={e => field.setter(e.target.value)} />
                  </div>
                ))}
              </div>

              <button onClick={handleSave} className="btn btn-primary" style={{ marginTop: 24 }}>
                {saved ? <><Check style={{ width: 16, height: 16 }} /> Saved!</> : <><Save style={{ width: 16, height: 16 }} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Appearance</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Customize the look and feel</p>

              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Theme</p>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { key: 'light' as const, label: 'Light', icon: Sun },
                  { key: 'dark' as const, label: 'Dark', icon: Moon },
                  { key: 'auto' as const, label: 'System', icon: Monitor },
                ].map(t => {
                  const Icon = t.icon;
                  const isActive = theme === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => handleThemeChange(t.key)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                        padding: '20px 28px', borderRadius: 12, cursor: 'pointer',
                        border: isActive ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                        background: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                        transition: 'all 150ms ease',
                      }}
                    >
                      <Icon style={{ width: 24, height: 24 }} />
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Notifications</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Control what notifications you receive</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Email Notifications', desc: 'Receive updates via email', checked: emailNotifs, setter: setEmailNotifs },
                  { label: 'Invoice Reminders', desc: 'Get alerted for overdue invoices', checked: invoiceReminders, setter: setInvoiceReminders },
                  { label: 'Meeting Alerts', desc: 'Reminders 15 min before meetings', checked: meetingAlerts, setter: setMeetingAlerts },
                  { label: 'Weekly Digest', desc: 'Summary report every Monday', checked: weeklyDigest, setter: setWeeklyDigest },
                ].map((item, idx) => (
                  <div key={item.label} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 0',
                    borderBottom: idx < 3 ? '1px solid var(--border-secondary)' : 'none',
                  }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</p>
                    </div>
                    <Toggle checked={item.checked} onChange={item.setter} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Security</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Protect your account</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[
                  { label: 'Change Password', desc: 'Update your login credentials', icon: Lock },
                  { label: 'Two-Factor Authentication', desc: 'Add extra security to your account', icon: Shield },
                  { label: 'API Keys', desc: 'Manage integration keys', icon: Key },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '16px 0', cursor: 'pointer',
                      borderBottom: idx < 2 ? '1px solid var(--border-secondary)' : 'none',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon style={{ width: 16, height: 16, color: 'var(--text-secondary)' }} />
                        </div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Data & Backup</h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>Export and manage your data</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="card" style={{
                  padding: 20, background: 'var(--bg-secondary)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Download style={{ width: 18, height: 18, color: 'var(--accent)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Export All Data</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Download a JSON backup of all your data</p>
                    </div>
                  </div>
                  <button onClick={handleExportData} className="btn btn-primary btn-sm">
                    <Download style={{ width: 14, height: 14 }} /> Export
                  </button>
                </div>

                <div className="card" style={{
                  padding: 20, background: 'var(--danger-light)',
                  border: '1px solid var(--danger-border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AlertTriangle style={{ width: 18, height: 18, color: 'var(--danger)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--danger)' }}>Reset All Data</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Clear all local storage data. This cannot be undone.</p>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (confirm('Are you sure? This will delete all your data.')) {
                      Object.keys(localStorage).filter(k => k.startsWith('bb24_')).forEach(k => localStorage.removeItem(k));
                      window.location.reload();
                    }
                  }}>
                    <Trash2 style={{ width: 14, height: 14 }} /> Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
