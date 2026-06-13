'use client';

import React, { useState, useEffect } from 'react';
import { MockEmployee } from '@/lib/mock-data';
import { dataService } from '@/lib/data-service';
import { Users, Search, Plus, Award, Briefcase, Zap, UserCheck, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';
import { authHelper } from '@/lib/auth';

export default function TeamHub() {
  const [employees, setEmployees] = useState<MockEmployee[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'employee' | 'client'>('employee');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('Marketing Creative');
  const [salary, setSalary] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      const e = await dataService.getEmployees();
      setEmployees(e);
    };
    fetchTeam();
    setSession(authHelper.getCurrentSession());
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback('');

    // Check if email already exists
    const userBaseStr = localStorage.getItem('bb24_user_base');
    const userBase = userBaseStr ? JSON.parse(userBaseStr) : [];
    
    if (userBase.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      setFeedback('A user with this email already exists.');
      return;
    }

    const newEmpId = 'e' + Date.now();

    // 1. Add to local UI display list if it's an employee
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

    // 2. Add to localStorage user base so they can actually log in!
    const newUserObject = {
      name: fullName,
      email: email.toLowerCase(),
      password: password || 'password123',
      role: role
    };

    localStorage.setItem('bb24_user_base', JSON.stringify([...userBase, newUserObject]));

    // Show success feedback
    setFeedback(`Success! User account created for ${fullName} (${role}). They can now log in using their email.`);
    
    // Reset inputs
    setFullName('');
    setEmail('');
    setPassword('');
    setPosition('');
    setSalary('');
    
    // Auto-close modal after 2.5 seconds
    setTimeout(() => {
      setIsModalOpen(false);
      setFeedback('');
    }, 2500);
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.position.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase())
  );

  const isAdmin = session?.role === 'founder' || session?.role === 'super_admin' || session?.role === 'manager';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Team Hub</h1>
          <p className="text-text-secondary text-sm mt-1">Manage agency departments, verify employee performance, and deploy portal logins.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-primary text-bg-primary hover:bg-brand-primary/95 text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Create User Account
          </button>
        )}
      </div>

      {/* Stats row */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-5 rounded-xl border border-border-primary text-xs">
            <span className="text-text-secondary uppercase font-bold tracking-wide">Average Performance</span>
            <div className="text-xl font-black text-text-primary mt-2">4.83 / 5.00</div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-border-primary text-xs">
            <span className="text-text-secondary uppercase font-bold tracking-wide">Monthly Payroll</span>
            <div className="text-xl font-black text-text-primary mt-2">₹{employees.reduce((sum, e) => sum + e.salary, 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="glass-panel p-5 rounded-xl border border-border-primary text-xs">
            <span className="text-text-secondary uppercase font-bold tracking-wide">Avg Productivity Score</span>
            <div className="text-xl font-black text-text-primary mt-2">93.2%</div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          type="text"
          placeholder="Search team members by name, position, or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-bg-secondary border border-border-primary text-text-primary text-xs rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all"
        />
      </div>

      {/* Employees list */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="glass-panel p-6 rounded-xl border border-border-primary hover:border-text-muted/50 transition-all flex flex-col justify-between shadow-sm relative group"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-brand-accent text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-primary">{emp.name}</h3>
                    <span className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5">
                      <Briefcase className="h-3 w-3 text-text-muted" />
                      {emp.position}
                    </span>
                  </div>
                </div>
              </div>

              {/* Department Tag */}
              <div className="text-[10px] font-semibold bg-bg-tertiary px-2 py-0.5 rounded border border-border-primary w-fit">
                {emp.department}
              </div>

              {/* Performance Metrics */}
              <div className="border-t border-border-secondary pt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-text-secondary text-[10px] block">Performance</span>
                  <span className="font-bold text-text-primary flex items-center gap-1 mt-0.5">
                    <Award className="h-3.5 w-3.5 text-brand-warning" />
                    {emp.performanceScore} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-text-secondary text-[10px] block">Productivity Index</span>
                  <span className="font-bold text-text-primary flex items-center gap-1 mt-0.5">
                    <Zap className="h-3.5 w-3.5 text-brand-accent" />
                    {emp.productivityScore}%
                  </span>
                </div>
              </div>
            </div>

            {/* Salary details (Admin only) */}
            {isAdmin && (
              <div className="mt-6 border-t border-border-primary pt-3 flex justify-between items-center bg-bg-secondary/30 -mx-6 -mb-6 p-4 rounded-b-xl">
                <div>
                  <span className="text-[9px] text-text-secondary uppercase tracking-wider block font-semibold">Monthly Compensation</span>
                  <span className="text-xs font-black text-text-primary">₹{emp.salary.toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[10px] text-text-secondary">Joined: {emp.joiningDate}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className="relative w-full max-w-md bg-bg-primary border border-border-primary rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] z-10 space-y-5">
            <div className="flex items-center justify-between border-b border-border-primary pb-3">
              <h3 className="font-extrabold text-base text-text-primary">Create Portal User Account</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-md hover:bg-bg-tertiary">
                <X className="h-5 w-5" />
              </button>
            </div>

            {feedback && (
              <div className={`p-3 text-xs rounded-lg border text-center font-medium ${
                feedback.includes('Success') 
                  ? 'text-brand-success bg-brand-success/10 border-brand-success/20' 
                  : 'text-brand-danger bg-brand-danger/10 border-brand-danger/20'
              }`}>
                {feedback}
              </div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                >
                  <option value="employee">Employee Portal Access</option>
                  <option value="client">Client Portal Access</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Login Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@bb24.agency"
                  className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {role === 'employee' && (
                <div className="grid grid-cols-2 gap-4 border-t border-border-primary pt-3">
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Position</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="UI Designer"
                      className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Monthly Salary (INR)</label>
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="80000"
                      className="w-full px-3 py-2 bg-bg-secondary border border-border-primary text-text-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-accent text-xs"
                    />
                  </div>
                </div>
              )}

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
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
