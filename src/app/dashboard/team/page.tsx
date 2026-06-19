'use client';

import React, { useState, useEffect } from 'react';
import { MockEmployee, MockTask } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import {
  Users, Search, Plus, Award, Briefcase, Zap, UserCheck,
  ShieldAlert, X, Eye, EyeOff, TreeDeciduous, Calendar,
  Check, Play, ArrowRight, RefreshCw, BarChart2, Star
} from 'lucide-react';
import { authHelper } from '@/lib/auth';

const SKILL_MAP: Record<string, string[]> = {
  'Elena Rostova': ['Copywriting', 'SEO Ads', 'LinkedIn B2B', 'Analytics'],
  'Siddharth Malhotra': ['Accounting', 'Audit', 'Taxation', 'Tally Prime'],
  'Ananya Iyer': ['UI UX Design', 'Figma', 'Prototyping', 'React'],
  'Nitesh Sharma': ['Strategic Planning', 'Leadership', 'Sales Closing', 'Finance'],
  'Sanjay Singh': ['Prospect Outreach', 'Email Campaigning', 'Sales Closing'],
};

interface LeaveRequest {
  id: string;
  name: string;
  type: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

const DEFAULT_LEAVES: LeaveRequest[] = [
  { id: 'l1', name: 'Elena Rostova', type: 'Sick Leave', startDate: '2026-06-15', endDate: '2026-06-16', status: 'pending' },
  { id: 'l2', name: 'Ananya Iyer', type: 'Casual Leave', startDate: '2026-06-20', endDate: '2026-06-23', status: 'approved' },
];

export default function TeamHub() {
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [tasks, setTasks] = useState<MockTask[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  
  const [activeTab, setActiveTab] = useState<'directory' | 'org' | 'leaves'>('directory');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<MockEmployee | null>(null);

  // Form States (New Team Member)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'client'>('employee');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Marketing');
  const [salary, setSalary] = useState('');
  const [feedback, setFeedback] = useState('');

  // Form States (New Leave)
  const [leaveType, setLeaveType] = useState('Sick Leave');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [emp, t] = await Promise.all([
        dataService.getEmployees(),
        dataService.getTasks(),
      ]);
      setEmployees(emp);
      setTasks(t);

      // Load leaves from localStorage or default
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('bb24_leaves');
        if (stored) setLeaves(JSON.parse(stored));
        else {
          localStorage.setItem('bb24_leaves', JSON.stringify(DEFAULT_LEAVES));
          setLeaves(DEFAULT_LEAVES);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setSession(authHelper.getCurrentSession());
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    const userBaseStr = localStorage.getItem('bb24_user_base');
    const userBase = userBaseStr ? JSON.parse(userBaseStr) : [];
    
    if (userBase.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      setFeedback('A user with this email already exists.');
      return;
    }

    const newEmpId = 'e' + Date.now();

    if (role === 'employee') {
      const newEmployee: MockEmployee = {
        id: newEmpId,
        name: fullName,
        position: position || 'Associate Specialist',
        department: department,
        joiningDate: new Date().toISOString().split('T')[0],
        salary: Number(salary) || 50000,
        performanceScore: 5.0,
        productivityScore: 100.0,
      };
      const saved = await dataService.saveEmployee(newEmployee);
      setEmployees(prev => [...prev, saved]);
    }

    const newUserObject = {
      name: fullName,
      email: email.toLowerCase(),
      password: password || 'password123',
      role: role
    };

    localStorage.setItem('bb24_user_base', JSON.stringify([...userBase, newUserObject]));
    setFeedback(`Success! User account created for ${fullName} (${role}).`);
    
    setFullName(''); setEmail(''); setPassword(''); setPosition(''); setSalary('');
    
    setTimeout(() => {
      setIsModalOpen(false);
      setFeedback('');
    }, 2000);
  };

  const handleAddLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const newLeave: LeaveRequest = {
      id: 'l' + Date.now(),
      name: `${session.firstName} ${session.lastName}`,
      type: leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      status: 'pending',
    };
    
    const updated = [newLeave, ...leaves];
    setLeaves(updated);
    localStorage.setItem('bb24_leaves', JSON.stringify(updated));

    // Reset Form
    setLeaveStart('');
    setLeaveEnd('');
  };

  const handleApproveLeave = (id: string, approve: boolean) => {
    const updated = leaves.map(l => {
      if (l.id === id) {
        return { ...l, status: approve ? 'approved' as const : 'rejected' as const };
      }
      return l;
    });
    setLeaves(updated);
    localStorage.setItem('bb24_leaves', JSON.stringify(updated));
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
          <span className="text-sm font-semibold text-text-secondary">Loading team hub...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Team Management</h1>
          <p className="text-text-secondary text-sm mt-1">Oversee employee directories, organizational structures, workloads, and leave policies.</p>
        </div>
        {session?.role === 'founder' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-white hover:opacity-90 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer animate-pulse-soft"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-bg-tertiary">
        {[
          { id: 'directory', label: 'Team Directory', icon: Users },
          { id: 'org', label: 'Organization Chart', icon: TreeDeciduous },
          { id: 'leaves', label: 'Leave Planner', icon: Calendar },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id as any);
                setSelectedEmployee(null);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'bg-bg-secondary text-brand-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content: Directory ── */}
      {activeTab === 'directory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          
          {/* Main List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="card p-3 bg-bg-secondary">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search team member by name, role, department..."
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                />
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredEmployees.map((emp) => {
                const skills = SKILL_MAP[emp.name] || ['General Admin', 'Customer Support'];
                const isSelected = selectedEmployee?.id === emp.id;

                return (
                  <div
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`card bg-bg-secondary p-4 flex flex-col justify-between border hover:border-brand-primary/45 transition-all cursor-pointer ${
                      isSelected ? 'ring-2 ring-brand-primary border-brand-primary' : 'border-border-primary'
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-9 w-9 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm shrink-0">
                          {emp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-text-primary truncate">{emp.name}</h4>
                          <span className="text-[10px] text-text-secondary block mt-0.5 truncate capitalize">{emp.position}</span>
                        </div>
                      </div>

                      {/* Skill Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {skills.map((s, i) => (
                          <span key={i} className="text-[8px] font-bold bg-bg-tertiary text-text-secondary border border-border-primary px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Metrics */}
                    <div className="border-t border-border-secondary pt-3 flex items-center justify-between text-[10px] text-text-secondary">
                      <span>Dept: <strong>{emp.department}</strong></span>
                      <span className="font-semibold text-brand-primary flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-brand-warning stroke-none" />
                        {emp.performanceScore.toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Panel: Detail Viewer / Workload */}
          <div className="space-y-4">
            {selectedEmployee ? (
              <div className="card bg-bg-secondary p-5 space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-border-primary pb-3.5">
                  <h3 className="font-bold text-sm text-text-primary">Performance Stats</h3>
                  <button onClick={() => setSelectedEmployee(null)} className="p-1 rounded hover:bg-bg-tertiary text-text-secondary">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Info summary */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-extrabold">
                    {selectedEmployee.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-text-primary">{selectedEmployee.name}</h4>
                    <p className="text-[10px] text-text-secondary capitalize">{selectedEmployee.position}</p>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Performance Rating</span>
                      <span className="font-bold text-text-primary">{selectedEmployee.performanceScore.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 w-full bg-border-primary rounded-full overflow-hidden">
                      <div className="h-full bg-brand-success" style={{ width: `${selectedEmployee.performanceScore * 10}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-text-secondary">Productivity Score</span>
                      <span className="font-bold text-text-primary">{selectedEmployee.productivityScore}%</span>
                    </div>
                    <div className="h-2 w-full bg-border-primary rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: `${selectedEmployee.productivityScore}%` }} />
                    </div>
                  </div>
                </div>

                <div className="border-t border-border-primary pt-3.5 text-xs text-text-secondary space-y-2">
                  <div className="flex justify-between">
                    <span>Joined Date:</span>
                    <strong className="text-text-primary">{selectedEmployee.joiningDate}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Salary:</span>
                    <strong className="text-text-primary">₹{selectedEmployee.salary.toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-bg-secondary p-5 space-y-4">
                <h3 className="font-bold text-sm text-text-primary border-b border-border-primary pb-3.5">
                  Workload Distribution
                </h3>
                
                {/* Horizontal progress bars representing workload */}
                <div className="space-y-3 pt-2">
                  {employees.slice(0, 5).map(emp => {
                    const empTasks = tasks.filter(t => t.assignedTo.toLowerCase().includes(emp.name.split(' ')[0].toLowerCase()));
                    const count = empTasks.length;
                    const pct = Math.min(100, count * 20); // mock calculation out of 5 tasks max
                    return (
                      <div key={emp.id} className="space-y-1">
                        <div className="flex justify-between text-[10px] text-text-secondary">
                          <span className="font-semibold text-text-primary">{emp.name}</span>
                          <span>{count} tasks</span>
                        </div>
                        <div className="h-1.5 w-full bg-bg-tertiary rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab Content: Org Chart ── */}
      {activeTab === 'org' && (
        <div className="card bg-bg-secondary p-6 space-y-8 animate-fade-in overflow-x-auto">
          <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5 mb-6">
            Company Organization Tree
          </h3>

          <div className="min-w-[700px] flex flex-col items-center gap-8 py-4">
            
            {/* Level 1: CEO */}
            <div className="flex flex-col items-center">
              <div className="p-4 bg-brand-primary/10 border-2 border-brand-primary rounded-xl text-center shadow-sm w-44">
                <p className="font-extrabold text-xs text-brand-primary uppercase tracking-wider">CEO & Founder</p>
                <h4 className="font-bold text-sm text-text-primary mt-1">
                  {session ? `${session.firstName} ${session.lastName}` : 'Nitesh Sharma'}
                </h4>
                <p className="text-[9px] text-text-secondary mt-0.5">Management</p>
              </div>
            </div>

            {/* Vert connector line */}
            <div className="h-8 w-0.5 bg-border-primary -my-8" />

            {/* Horizontal divider line */}
            <div className="w-[500px] h-0.5 bg-border-primary" />

            {/* Level 2: Department Leads */}
            <div className="flex gap-16 justify-center">
              {[
                { title: 'Marketing Head', name: 'Elena Rostova', dept: 'Marketing', color: 'var(--chart-1)' },
                { title: 'Creative Designer', name: 'Ananya Iyer', dept: 'Design & Code', color: 'var(--chart-5)' },
                { title: 'Accounts & Audit', name: 'Siddharth Malhotra', dept: 'Finance', color: 'var(--chart-3)' },
              ].map((lead, i) => (
                <div key={i} className="flex flex-col items-center relative">
                  
                  {/* Vertical lines connecting departments */}
                  <div className="h-4 w-0.5 bg-border-primary -mt-8" />

                  <div className="p-4 bg-bg-tertiary border border-border-primary rounded-xl text-center shadow-sm w-40 hover:border-brand-primary transition-all">
                    <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: lead.color }}>
                      {lead.title}
                    </span>
                    <h4 className="font-bold text-xs text-text-primary mt-2">{lead.name}</h4>
                    <p className="text-[9px] text-text-secondary mt-0.5">{lead.dept}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ── Tab Content: Leaves ── */}
      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          
          {/* Leaves List */}
          <div className="lg:col-span-2 card bg-bg-secondary p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5">
              Leave Requests & History
            </h3>

            <div className="space-y-3">
              {leaves.length > 0 ? (
                leaves.map(l => (
                  <div key={l.id} className="p-3.5 bg-bg-tertiary/40 border border-border-primary rounded-xl flex items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-xs text-text-primary">{l.name}</p>
                      <p className="text-[10px] text-text-secondary">
                        {l.type} • {l.startDate} to {l.endDate}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        l.status === 'approved' ? 'bg-success-light text-success' :
                        l.status === 'rejected' ? 'bg-danger-light text-danger' : 'bg-warning-light text-warning'
                      }`}>
                        {l.status}
                      </span>
                      
                      {/* Approve/Reject Controls (Only CEO/Admin can see or use in this flow) */}
                      {l.status === 'pending' && session?.role === 'founder' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleApproveLeave(l.id, true)}
                            className="p-1.5 bg-success-light text-success border border-transparent rounded-lg hover:opacity-90 transition-all cursor-pointer"
                            title="Approve Leave"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleApproveLeave(l.id, false)}
                            className="p-1.5 bg-danger-light text-danger border border-transparent rounded-lg hover:opacity-90 transition-all cursor-pointer"
                            title="Reject Leave"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-10 w-10 text-text-muted mx-auto mb-3 opacity-30" />
                  <p className="text-xs text-text-secondary">No leave logs requested yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Request Leave Form */}
          <div className="card bg-bg-secondary p-5 space-y-4">
            <h3 className="font-extrabold text-sm text-text-primary border-b border-border-primary pb-3.5">
              Request Time Off
            </h3>
            
            <form onSubmit={handleAddLeave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Leave Category</label>
                <select
                  value={leaveType} onChange={e => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                >
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                  <option value="Maternity / Paternity">Maternity / Paternity</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Start Date</label>
                  <input
                    type="date" required value={leaveStart} onChange={e => setLeaveStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">End Date</label>
                  <input
                    type="date" required value={leaveEnd} onChange={e => setLeaveEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-brand-primary hover:opacity-90 transition-all shadow-sm cursor-pointer"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overlay animate-fade-in">
          <div className="w-full max-w-md bg-bg-secondary border border-border-primary rounded-2xl shadow-modal overflow-hidden p-6 animate-scale-in">
            
            <div className="flex justify-between items-center pb-4 border-b border-border-primary mb-5">
              <div>
                <h3 className="font-extrabold text-base text-text-primary">Add Team Account</h3>
                <p className="text-xs text-text-secondary mt-0.5">Invite new payroll staff or client managers.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg border border-border-primary hover:bg-bg-tertiary transition-all"
              >
                <X className="h-4 w-4 text-text-secondary" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3.5 rounded-xl border text-xs mb-4 ${
                feedback.includes('Success') 
                  ? 'bg-success-light border-success-border text-success' 
                  : 'bg-danger-light border-danger-border text-danger'
              }`}>
                {feedback}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Full Name</label>
                <input
                  type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Neha Sharma"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Email Address</label>
                  <input
                    type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="neha@bb24.agency"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Password</label>
                  <input
                    type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">System Role</label>
                  <select
                    value={role} onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary cursor-pointer"
                  >
                    <option value="employee">Employee / Specialist</option>
                    <option value="client">Client Portal Account</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Monthly Salary (₹)</label>
                  <input
                    type="number" required={role === 'employee'} disabled={role === 'client'} value={salary} onChange={e => setSalary(e.target.value)} placeholder="65000"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Position Title</label>
                  <input
                    type="text" required={role === 'employee'} disabled={role === 'client'} value={position} onChange={e => setPosition(e.target.value)} placeholder="Creative Copywriter"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider mb-1.5 text-text-secondary">Department</label>
                  <select
                    disabled={role === 'client'} value={department} onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-border-primary bg-bg-tertiary text-text-primary outline-none focus:border-brand-primary disabled:opacity-50 cursor-pointer"
                  >
                    <option value="Marketing">Marketing Creative</option>
                    <option value="Design">UI UX Design</option>
                    <option value="Finance">Finance & Audits</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
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
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
