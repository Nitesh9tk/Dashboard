import { supabase } from './supabase';
import { authHelper } from './auth';
import {
  mockClients, mockLeads, mockProjects, mockTasks,
  mockInvoices, mockEmployees, mockMeetings, mockExpenses,
  MockClient, MockLead, MockProject, MockTask, MockInvoice,
  MockEmployee, MockMeeting, MockExpense
} from './mock-data';

// LocalStorage Keys
const KEYS = {
  CLIENTS: 'bb24_clients',
  LEADS: 'bb24_leads',
  PROJECTS: 'bb24_projects',
  TASKS: 'bb24_tasks',
  INVOICES: 'bb24_invoices',
  EMPLOYEES: 'bb24_employees',
  MEETINGS: 'bb24_meetings',
  EXPENSES: 'bb24_expenses',
};

// Seed Local Storage if empty
function initializeLocalStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(KEYS.CLIENTS)) {
    localStorage.setItem(KEYS.CLIENTS, JSON.stringify(mockClients));
  }
  if (!localStorage.getItem(KEYS.LEADS)) {
    localStorage.setItem(KEYS.LEADS, JSON.stringify(mockLeads));
  }
  if (!localStorage.getItem(KEYS.PROJECTS)) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(mockProjects));
  }
  if (!localStorage.getItem(KEYS.TASKS)) {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(mockTasks));
  }
  if (!localStorage.getItem(KEYS.INVOICES)) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(mockInvoices));
  }
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(mockEmployees));
  }
  if (!localStorage.getItem(KEYS.MEETINGS)) {
    localStorage.setItem(KEYS.MEETINGS, JSON.stringify(mockMeetings));
  }
  if (!localStorage.getItem(KEYS.EXPENSES)) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(mockExpenses));
  }
}

// Ensure local storage is set up
initializeLocalStorage();

// Generic Local Storage Helpers
function getLocal<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export const dataService = {
  // Check if Supabase mode is active
  isOnline(): boolean {
    return authHelper.isSupabaseConfigured();
  },

  // ─── CLIENTS ────────────────────────────────────────────────────────
  async getClients(): Promise<MockClient[]> {
    if (!this.isOnline()) {
      return getLocal<MockClient>(KEYS.CLIENTS, mockClients);
    }

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('company_name', { ascending: true });

      if (error) throw error;

      // Fetch related invoices to calculate contract values, received, and balance dynamically
      const { data: invoices } = await supabase.from('invoices').select('*');

      return (data || []).map((row: any) => {
        const clientInvs = (invoices || []).filter((inv: any) => inv.client_id === row.id);
        const received = clientInvs.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
        const balance = clientInvs.filter((inv: any) => inv.status === 'unpaid' || inv.status === 'overdue').reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
        const totalVal = clientInvs.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0) || Number(row.monthly_fee);

        return {
          id: row.id,
          companyName: row.company_name,
          contactPerson: row.contact_person,
          email: row.email,
          phone: row.phone || '',
          gstNumber: row.gst_number || '',
          monthlyFee: Number(row.monthly_fee) || 0,
          totalContractValue: totalVal,
          received: received,
          balance: balance,
          contractType: totalVal > Number(row.monthly_fee) ? 'one_time' : 'monthly',
          contractStart: row.contract_start_date || '',
          contractEnd: row.contract_end_date || '',
          status: row.status as MockClient['status'],
        };
      });
    } catch (err) {
      console.warn('Supabase clients fetch failed, falling back to LocalStorage', err);
      return getLocal<MockClient>(KEYS.CLIENTS, mockClients);
    }
  },

  async saveClient(client: MockClient): Promise<MockClient> {
    if (!this.isOnline()) {
      const list = getLocal<MockClient>(KEYS.CLIENTS, mockClients);
      const index = list.findIndex(c => c.id === client.id);
      if (index > -1) {
        list[index] = client;
      } else {
        list.unshift(client);
      }
      saveLocal(KEYS.CLIENTS, list);
      
      // Also update synced mock client data in other local storage keys if needed
      return client;
    }

    try {
      const payload = {
        company_name: client.companyName,
        contact_person: client.contactPerson,
        email: client.email,
        phone: client.phone,
        gst_number: client.gstNumber,
        monthly_fee: client.monthlyFee,
        contract_start_date: client.contractStart || null,
        contract_end_date: client.contractEnd || null,
        status: client.status,
      };

      let result;
      // If it's a UUID, it's an existing client, otherwise it's new
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(client.id);

      if (isUUID) {
        const { data, error } = await supabase
          .from('clients')
          .update(payload)
          .eq('id', client.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return {
        ...client,
        id: result.id,
      };
    } catch (err) {
      console.warn('Supabase saveClient failed, saving to LocalStorage', err);
      const list = getLocal<MockClient>(KEYS.CLIENTS, mockClients);
      const index = list.findIndex(c => c.id === client.id);
      if (index > -1) list[index] = client;
      else list.unshift(client);
      saveLocal(KEYS.CLIENTS, list);
      return client;
    }
  },

  async removeClient(id: string): Promise<boolean> {
    if (!this.isOnline()) {
      const list = getLocal<MockClient>(KEYS.CLIENTS, mockClients);
      const filtered = list.filter(c => c.id !== id);
      saveLocal(KEYS.CLIENTS, filtered);
      return true;
    }

    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase removeClient failed, removing from LocalStorage', err);
      const list = getLocal<MockClient>(KEYS.CLIENTS, mockClients);
      const filtered = list.filter(c => c.id !== id);
      saveLocal(KEYS.CLIENTS, filtered);
      return true;
    }
  },

  // ─── LEADS ──────────────────────────────────────────────────────────
  async getLeads(): Promise<MockLead[]> {
    if (!this.isOnline()) {
      return getLocal<MockLead>(KEYS.LEADS, mockLeads);
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        clientName: row.client_name,
        companyName: row.company_name || '',
        email: row.email || '',
        phone: row.phone || '',
        stage: row.stage as MockLead['stage'],
        source: row.source || 'Referral',
        revenuePotential: Number(row.revenue_potential) || 0,
        assignedTo: row.assigned_to || 'Sales Team',
        industry: row.industry || 'General',
      }));
    } catch (err) {
      console.warn('Supabase leads fetch failed, using LocalStorage', err);
      return getLocal<MockLead>(KEYS.LEADS, mockLeads);
    }
  },

  async saveLead(lead: MockLead): Promise<MockLead> {
    if (!this.isOnline()) {
      const list = getLocal<MockLead>(KEYS.LEADS, mockLeads);
      const index = list.findIndex(l => l.id === lead.id);
      if (index > -1) list[index] = lead;
      else list.push(lead);
      saveLocal(KEYS.LEADS, list);
      return lead;
    }

    try {
      const payload = {
        client_name: lead.clientName,
        company_name: lead.companyName,
        email: lead.email,
        phone: lead.phone,
        stage: lead.stage,
        source: lead.source,
        revenue_potential: lead.revenuePotential,
        industry: lead.industry || 'General',
      };

      let result;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(lead.id);

      if (isUUID) {
        const { data, error } = await supabase
          .from('leads')
          .update(payload)
          .eq('id', lead.id)
          .select()
          .single();
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('leads')
          .insert([payload])
          .select()
          .single();
        if (error) throw error;
        result = data;
      }

      return { ...lead, id: result.id };
    } catch (err) {
      console.warn('Supabase saveLead failed, saving to LocalStorage', err);
      const list = getLocal<MockLead>(KEYS.LEADS, mockLeads);
      const index = list.findIndex(l => l.id === lead.id);
      if (index > -1) list[index] = lead;
      else list.push(lead);
      saveLocal(KEYS.LEADS, list);
      return lead;
    }
  },

  async removeLead(id: string): Promise<boolean> {
    if (!this.isOnline()) {
      const list = getLocal<MockLead>(KEYS.LEADS, mockLeads);
      const filtered = list.filter(l => l.id !== id);
      saveLocal(KEYS.LEADS, filtered);
      return true;
    }

    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('Supabase removeLead failed, removing from LocalStorage', err);
      const list = getLocal<MockLead>(KEYS.LEADS, mockLeads);
      const filtered = list.filter(l => l.id !== id);
      saveLocal(KEYS.LEADS, filtered);
      return true;
    }
  },

  // ─── PROJECTS ───────────────────────────────────────────────────────
  async getProjects(): Promise<MockProject[]> {
    if (!this.isOnline()) {
      return getLocal<MockProject>(KEYS.PROJECTS, mockProjects);
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, clients(company_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        clientId: row.client_id,
        clientName: row.clients?.company_name || 'Agency Client',
        name: row.name,
        description: row.description || '',
        startDate: row.start_date || '',
        dueDate: row.due_date || '',
        status: row.status as MockProject['status'],
        completionRate: row.completion_rate || 50, // default placeholder completion
      }));
    } catch (err) {
      console.warn('Supabase projects fetch failed, using LocalStorage', err);
      return getLocal<MockProject>(KEYS.PROJECTS, mockProjects);
    }
  },

  // ─── TASKS ──────────────────────────────────────────────────────────
  async getTasks(): Promise<MockTask[]> {
    if (!this.isOnline()) {
      return getLocal<MockTask>(KEYS.TASKS, mockTasks);
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, projects(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        projectId: row.project_id,
        projectName: row.projects?.name || 'Campaign',
        title: row.title,
        priority: row.priority as MockTask['priority'],
        status: row.status as MockTask['status'],
        dueDate: row.due_date ? row.due_date.split('T')[0] : '',
        assignedTo: row.assigned_to || 'Team',
      }));
    } catch (err) {
      console.warn('Supabase tasks fetch failed, using LocalStorage', err);
      return getLocal<MockTask>(KEYS.TASKS, mockTasks);
    }
  },

  // ─── INVOICES ───────────────────────────────────────────────────────
  async getInvoices(): Promise<MockInvoice[]> {
    if (!this.isOnline()) {
      return getLocal<MockInvoice>(KEYS.INVOICES, mockInvoices);
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(company_name)')
        .order('due_date', { ascending: false });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        clientName: row.clients?.company_name || 'Agency Client',
        invoiceNumber: row.invoice_number,
        amount: Number(row.amount) || 0,
        dueDate: row.due_date || '',
        status: row.status as MockInvoice['status'],
        paidAt: row.paid_at || undefined,
      }));
    } catch (err) {
      console.warn('Supabase invoices fetch failed, using LocalStorage', err);
      return getLocal<MockInvoice>(KEYS.INVOICES, mockInvoices);
    }
  },

  // ─── EMPLOYEES ──────────────────────────────────────────────────────
  async getEmployees(): Promise<MockEmployee[]> {
    if (!this.isOnline()) {
      return getLocal<MockEmployee>(KEYS.EMPLOYEES, mockEmployees);
    }

    try {
      // Maps to profiles table in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('role', 'eq', 'client'); // ignore client portal users

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim(),
        position: row.department ? `${row.role} (${row.department})` : row.role,
        department: row.department || 'Operations',
        joiningDate: row.joining_date || '2026-01-01',
        salary: Number(row.salary) || 0,
        performanceScore: Number(row.performance_score) || 5.0,
        productivityScore: Number(row.productivity_score) || 100.0,
        avatarUrl: row.avatar_url || undefined,
      }));
    } catch (err) {
      console.warn('Supabase profiles/employees fetch failed, using LocalStorage', err);
      return getLocal<MockEmployee>(KEYS.EMPLOYEES, mockEmployees);
    }
  },

  async saveEmployee(employee: MockEmployee): Promise<MockEmployee> {
    if (!this.isOnline()) {
      const list = getLocal<MockEmployee>(KEYS.EMPLOYEES, mockEmployees);
      const index = list.findIndex(e => e.id === employee.id);
      if (index > -1) list[index] = employee;
      else list.push(employee);
      saveLocal(KEYS.EMPLOYEES, list);
      return employee;
    }

    try {
      // We can update the profile table in Supabase if the profile exists
      const names = employee.name.split(' ');
      const firstName = names[0] || 'Member';
      const lastName = names.slice(1).join(' ') || '';

      const payload = {
        first_name: firstName,
        last_name: lastName,
        department: employee.department,
        salary: employee.salary,
        joining_date: employee.joiningDate,
        performance_score: employee.performanceScore,
        productivity_score: employee.productivityScore,
      };

      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', employee.id);

      if (error) throw error;
      return employee;
    } catch (err) {
      console.warn('Supabase saveEmployee failed, saving locally', err);
      const list = getLocal<MockEmployee>(KEYS.EMPLOYEES, mockEmployees);
      const index = list.findIndex(e => e.id === employee.id);
      if (index > -1) list[index] = employee;
      else list.push(employee);
      saveLocal(KEYS.EMPLOYEES, list);
      return employee;
    }
  },

  // ─── MEETINGS ───────────────────────────────────────────────────────
  async getMeetings(): Promise<MockMeeting[]> {
    // Falls back to LocalStorage by default if meetings table doesn't exist
    if (!this.isOnline()) {
      return getLocal<MockMeeting>(KEYS.MEETINGS, mockMeetings);
    }

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        scheduledAt: row.scheduled_at,
        duration: row.duration || 30,
        link: row.link || '',
        status: row.status as MockMeeting['status'],
        summary: row.summary || undefined,
      }));
    } catch (err) {
      // Graceful fallback for omitted table in schema.sql
      return getLocal<MockMeeting>(KEYS.MEETINGS, mockMeetings);
    }
  },

  async saveMeeting(meeting: MockMeeting): Promise<MockMeeting> {
    if (!this.isOnline()) {
      const list = getLocal<MockMeeting>(KEYS.MEETINGS, mockMeetings);
      const index = list.findIndex(m => m.id === meeting.id);
      if (index > -1) list[index] = meeting;
      else list.unshift(meeting);
      saveLocal(KEYS.MEETINGS, list);
      return meeting;
    }

    try {
      const payload = {
        title: meeting.title,
        scheduled_at: meeting.scheduledAt,
        duration: meeting.duration,
        link: meeting.link,
        status: meeting.status,
        summary: meeting.summary || null,
      };

      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(meeting.id);

      if (isUUID) {
        await supabase.from('meetings').update(payload).eq('id', meeting.id);
      } else {
        await supabase.from('meetings').insert([payload]);
      }
      return meeting;
    } catch (err) {
      // Graceful fallback
      const list = getLocal<MockMeeting>(KEYS.MEETINGS, mockMeetings);
      const index = list.findIndex(m => m.id === meeting.id);
      if (index > -1) list[index] = meeting;
      else list.unshift(meeting);
      saveLocal(KEYS.MEETINGS, list);
      return meeting;
    }
  },

  async removeMeeting(id: string): Promise<boolean> {
    if (!this.isOnline()) {
      const list = getLocal<MockMeeting>(KEYS.MEETINGS, mockMeetings);
      const filtered = list.filter(m => m.id !== id);
      saveLocal(KEYS.MEETINGS, filtered);
      return true;
    }

    try {
      await supabase.from('meetings').delete().eq('id', id);
      return true;
    } catch (err) {
      const list = getLocal<MockMeeting>(KEYS.MEETINGS, mockMeetings);
      const filtered = list.filter(m => m.id !== id);
      saveLocal(KEYS.MEETINGS, filtered);
      return true;
    }
  },

  // ─── EXPENSES ───────────────────────────────────────────────────────
  async getExpenses(): Promise<MockExpense[]> {
    if (!this.isOnline()) {
      return getLocal<MockExpense>(KEYS.EXPENSES, mockExpenses);
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*');

      if (error) throw error;

      return (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        amount: Number(row.amount) || 0,
        category: row.category as MockExpense['category'],
      }));
    } catch (err) {
      // Graceful fallback for omitted table in schema.sql
      return getLocal<MockExpense>(KEYS.EXPENSES, mockExpenses);
    }
  },

  async saveExpense(expense: MockExpense): Promise<MockExpense> {
    const list = getLocal<MockExpense>(KEYS.EXPENSES, mockExpenses);
    const index = list.findIndex(e => e.id === expense.id);
    if (index > -1) list[index] = expense;
    else list.push(expense);
    saveLocal(KEYS.EXPENSES, list);

    if (this.isOnline()) {
      try {
        const payload = {
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
        };
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(expense.id);
        if (isUUID) {
          await supabase.from('expenses').update(payload).eq('id', expense.id);
        } else {
          await supabase.from('expenses').insert([payload]);
        }
      } catch (err) {
        console.warn('Supabase saveExpense failed, kept local only', err);
      }
    }
    return expense;
  },

  async removeExpense(id: string): Promise<boolean> {
    const list = getLocal<MockExpense>(KEYS.EXPENSES, mockExpenses);
    const filtered = list.filter(e => e.id !== id);
    saveLocal(KEYS.EXPENSES, filtered);

    if (this.isOnline()) {
      try {
        await supabase.from('expenses').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase removeExpense failed, kept local only', err);
      }
    }
    return true;
  }
};
