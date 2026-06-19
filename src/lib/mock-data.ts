export interface MockClient {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber: string;
  monthlyFee: number;
  totalContractValue: number;
  received: number;
  balance: number;
  contractType: 'monthly' | 'one_time';
  contractStart: string;
  contractEnd: string;
  status: 'active' | 'inactive' | 'paused' | 'completed';
}

export interface MockLead {
  id: string;
  clientName: string;
  companyName: string;
  email: string;
  phone?: string;
  stage: 'new_lead' | 'contacted' | 'interested' | 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'won' | 'lost';
  source: string;
  revenuePotential: number;
  assignedTo: string;
  industry: string;
}

export interface MockProject {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
  completionRate: number;
}

export interface MockTask {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'review' | 'done';
  dueDate: string;
  assignedTo: string;
}

export interface MockInvoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue' | 'cancelled';
  paidAt?: string;
}

export interface MockEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  joiningDate: string;
  salary: number;
  performanceScore: number;
  productivityScore: number;
  avatarUrl?: string;
}

export interface MockMeeting {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  link: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  summary?: string;
}

export interface MockExpense {
  id: string;
  name: string;
  amount: number;
  category: 'rent' | 'food' | 'health' | 'utility' | 'other';
}

// ─── REAL CLIENTS (From Google Sheet) ──────────────────────────────────────────
export const mockClients: MockClient[] = [
  {
    id: 'c1',
    companyName: 'GS Ayurveda',
    contactPerson: 'GS Ayurveda Team',
    email: 'gsayurveda@email.com',
    phone: '+91 98765 00001',
    gstNumber: '',
    monthlyFee: 15000,
    totalContractValue: 15000,
    received: 7500,
    balance: 7500,
    contractType: 'monthly',
    contractStart: '2026-05-15',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c2',
    companyName: 'Ashvastra Creation',
    contactPerson: 'Ashvastra Team',
    email: 'ashvastra@email.com',
    phone: '+91 98765 00002',
    gstNumber: '',
    monthlyFee: 28000,
    totalContractValue: 28000,
    received: 28000,
    balance: 0,
    contractType: 'monthly',
    contractStart: '2026-04-10',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c3',
    companyName: 'The Webbia & Ikie Posting',
    contactPerson: 'Webbia Team',
    email: 'thewebbia@email.com',
    phone: '+91 98765 00003',
    gstNumber: '',
    monthlyFee: 19000, // 6,000 + 13,000 Web combined
    totalContractValue: 19000,
    received: 0,
    balance: 19000,
    contractType: 'monthly',
    contractStart: '2026-05-13',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c4',
    companyName: 'Chillqubig',
    contactPerson: 'Chillqubig Team',
    email: 'chillqubig@email.com',
    phone: '+91 98765 00004',
    gstNumber: '',
    monthlyFee: 11000, // 5,000 + 6,000 Web combined
    totalContractValue: 11000,
    received: 0,
    balance: 11000,
    contractType: 'monthly',
    contractStart: '2026-06-05',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c5',
    companyName: 'OncoAdvisor',
    contactPerson: 'OncoAdvisor Team',
    email: 'oncoadvisor@email.com',
    phone: '+91 98765 00005',
    gstNumber: '',
    monthlyFee: 10000,
    totalContractValue: 10000,
    received: 0,
    balance: 10000,
    contractType: 'monthly',
    contractStart: '2026-05-01',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c6',
    companyName: 'The Webbia Website',
    contactPerson: 'Webbia Website Team',
    email: 'thewebbia.web@email.com',
    phone: '+91 98765 00006',
    gstNumber: '',
    monthlyFee: 13000,
    totalContractValue: 26000,
    received: 13000,
    balance: 13000,
    contractType: 'one_time',
    contractStart: '2026-04-01',
    contractEnd: '2026-07-31',
    status: 'active',
  },
  {
    id: 'c7',
    companyName: 'WellaVitta',
    contactPerson: 'WellaVitta Team',
    email: 'wellavitta@email.com',
    phone: '+91 98765 00007',
    gstNumber: '',
    monthlyFee: 8000,
    totalContractValue: 16500,
    received: 0,
    balance: 16500,
    contractType: 'one_time',
    contractStart: '2026-05-01',
    contractEnd: '2026-08-31',
    status: 'active',
  },
  {
    id: 'c8',
    companyName: 'SP Events',
    contactPerson: 'SP Events Team',
    email: 'spevents@email.com',
    phone: '+91 98765 00008',
    gstNumber: '',
    monthlyFee: 12500, // 5,000 + 7,500 Web combined
    totalContractValue: 12500,
    received: 0,
    balance: 12500,
    contractType: 'monthly',
    contractStart: '2026-06-13',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c9',
    companyName: 'Issara',
    contactPerson: 'Issara Team',
    email: 'issara@email.com',
    phone: '+91 98765 00009',
    gstNumber: '',
    monthlyFee: 16000, // 8,500 + 7,500 Web combined
    totalContractValue: 16000,
    received: 0,
    balance: 16000,
    contractType: 'monthly',
    contractStart: '2026-06-13',
    contractEnd: '2026-12-31',
    status: 'active',
  },
  {
    id: 'c10',
    companyName: 'EVENT NEW',
    contactPerson: 'Event New Team',
    email: 'eventnew@email.com',
    phone: '+91 98765 00010',
    gstNumber: '',
    monthlyFee: 12500, // 5,000 + 7,500 Web combined
    totalContractValue: 12500,
    received: 0,
    balance: 12500,
    contractType: 'monthly',
    contractStart: '2026-06-16',
    contractEnd: '2026-12-31',
    status: 'active',
  },
];

// ─── REAL LEADS (From Google Sheet) ───────────────────────────────────────────
export const mockLeads: MockLead[] = [
  {
    id: 'l1',
    clientName: 'Neha',
    companyName: 'Beauty Brand',
    email: 'neha@beautybrand.com',
    stage: 'won',
    source: 'Referral',
    revenuePotential: 120000,
    assignedTo: 'Sales Team',
    industry: 'Beauty',
  },
  {
    id: 'l2',
    clientName: 'Rohit',
    companyName: 'Travel Co.',
    email: 'rohit@travelco.com',
    stage: 'won',
    source: 'LinkedIn Outbound',
    revenuePotential: 95000,
    assignedTo: 'Sales Team',
    industry: 'Travel',
  },
  {
    id: 'l3',
    clientName: 'Rahul',
    companyName: 'Fintech Solutions',
    email: 'rahul@fintechsolutions.com',
    stage: 'lost',
    source: 'Cold Outreach',
    revenuePotential: 180000,
    assignedTo: 'Sales Team',
    industry: 'Finance',
  },
  {
    id: 'l4',
    clientName: 'Rajesh',
    companyName: 'E-Commerce Hub',
    email: 'rajesh@ecommercehub.com',
    stage: 'negotiation',
    source: 'Google Ads',
    revenuePotential: 250000,
    assignedTo: 'Sales Team',
    industry: 'E-commerce',
  },
  {
    id: 'l5',
    clientName: 'Priya',
    companyName: 'Fashion Studio',
    email: 'priya@fashionstudio.com',
    stage: 'negotiation',
    source: 'Instagram',
    revenuePotential: 85000,
    assignedTo: 'Sales Team',
    industry: 'Fashion',
  },
  {
    id: 'l6',
    clientName: 'Dr. Batra',
    companyName: 'Health Clinic',
    email: 'drbatra@healthclinic.com',
    stage: 'proposal_sent',
    source: 'Referral',
    revenuePotential: 150000,
    assignedTo: 'Sales Team',
    industry: 'Health',
  },
  {
    id: 'l7',
    clientName: 'Vikram',
    companyName: 'FitLife Gym',
    email: 'vikram@fitlife.com',
    stage: 'proposal_sent',
    source: 'Cold Outreach',
    revenuePotential: 75000,
    assignedTo: 'Sales Team',
    industry: 'Fitness',
  },
  {
    id: 'l8',
    clientName: 'Amit',
    companyName: 'Realty Pro',
    email: 'amit@realtypro.com',
    stage: 'contacted',
    source: 'Referral',
    revenuePotential: 350000,
    assignedTo: 'Sales Team',
    industry: 'Real Estate',
  },
  {
    id: 'l9',
    clientName: 'Pooja',
    companyName: 'EduLearn',
    email: 'pooja@edulearn.com',
    stage: 'new_lead',
    source: 'Organic Search',
    revenuePotential: 60000,
    assignedTo: 'Sales Team',
    industry: 'Education',
  },
  {
    id: 'l10',
    clientName: 'Karan',
    companyName: 'TechStartup',
    email: 'karan@techstartup.com',
    stage: 'new_lead',
    source: 'LinkedIn Outbound',
    revenuePotential: 200000,
    assignedTo: 'Sales Team',
    industry: 'Tech',
  },
  {
    id: 'l11',
    clientName: 'Sneha',
    companyName: 'Food Delight',
    email: 'sneha@fooddelight.com',
    stage: 'new_lead',
    source: 'Google Ads',
    revenuePotential: 45000,
    assignedTo: 'Sales Team',
    industry: 'Food',
  },
  {
    id: 'l12',
    clientName: 'Sanjay',
    companyName: 'AutoDrive Motors',
    email: 'sanjay@autodrive.com',
    stage: 'contacted',
    source: 'Cold Outreach',
    revenuePotential: 280000,
    assignedTo: 'Sales Team',
    industry: 'Automotive',
  },
];

export const mockProjects: MockProject[] = [
  {
    id: 'p1',
    clientId: 'c1',
    clientName: 'GS Ayurveda',
    name: 'Social Media & Content Marketing',
    description: 'Monthly social media management, content creation, and organic growth strategy for Ayurveda brand.',
    startDate: '2026-05-15',
    dueDate: '2026-12-31',
    status: 'active',
    completionRate: 52,
  },
  {
    id: 'p2',
    clientId: 'c2',
    clientName: 'Ashvastra Creation',
    name: 'Brand Identity & Digital Marketing',
    description: 'Full-scale brand identity development, digital marketing, and paid ad campaigns.',
    startDate: '2026-04-10',
    dueDate: '2026-12-31',
    status: 'active',
    completionRate: 30,
  },
  {
    id: 'p3',
    clientId: 'c6',
    clientName: 'The Webbia Website',
    name: 'Website Development',
    description: 'Full website design and development project on a one-time basis.',
    startDate: '2026-04-01',
    dueDate: '2026-07-31',
    status: 'active',
    completionRate: 65,
  },
  {
    id: 'p4',
    clientId: 'c9',
    clientName: 'Issara',
    name: 'Social Media Management',
    description: 'Instagram posting and growth campaign for Issara Udaipur.',
    startDate: '2026-06-13',
    dueDate: '2026-12-31',
    status: 'active',
    completionRate: 40,
  },
  {
    id: 'p5',
    clientId: 'c10',
    clientName: 'EVENT NEW',
    name: 'Instagram Growth Campaign',
    description: 'Instagram brand growth campaign and content creation.',
    startDate: '2026-06-16',
    dueDate: '2026-12-31',
    status: 'active',
    completionRate: 20,
  },
];

export const mockTasks: MockTask[] = [
  {
    id: 't1',
    projectId: 'p1',
    projectName: 'GS Ayurveda',
    title: 'Create June content calendar',
    priority: 'high',
    status: 'in_progress',
    dueDate: '2026-06-15',
    assignedTo: 'Kavya',
  },
  {
    id: 't2',
    projectId: 'p1',
    projectName: 'GS Ayurveda',
    title: 'Design product launch reels',
    priority: 'medium',
    status: 'review',
    dueDate: '2026-06-18',
    assignedTo: 'Divyansh',
  },
  {
    id: 't3',
    projectId: 'p2',
    projectName: 'Ashvastra Creation',
    title: 'Draft brand identity guidelines',
    priority: 'high',
    status: 'todo',
    dueDate: '2026-06-25',
    assignedTo: 'Kavya',
  },
  {
    id: 't4',
    projectId: 'p3',
    projectName: 'The Webbia Website',
    title: 'Homepage wireframe approval',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2026-06-20',
    assignedTo: 'Govind',
  },
];

export const mockInvoices: MockInvoice[] = [
  {
    id: 'i1',
    clientName: 'GS Ayurveda',
    invoiceNumber: 'INV-2026-006',
    amount: 7500,
    dueDate: '2026-06-20',
    status: 'unpaid',
  },
  {
    id: 'i2',
    clientName: 'GS Ayurveda',
    invoiceNumber: 'INV-2026-005',
    amount: 7500,
    dueDate: '2026-05-15',
    status: 'paid',
    paidAt: '2026-05-10',
  },
  {
    id: 'i3',
    clientName: 'Ashvastra Creation',
    invoiceNumber: 'INV-2026-004',
    amount: 28000,
    dueDate: '2026-06-10',
    status: 'paid',
    paidAt: '2026-06-08',
  },
  {
    id: 'i4',
    clientName: 'OncoAdvisor',
    invoiceNumber: 'INV-2026-008',
    amount: 10000,
    dueDate: '2026-06-10',
    status: 'unpaid',
  },
  {
    id: 'i5',
    clientName: 'Chillqubig',
    invoiceNumber: 'INV-2026-009',
    amount: 11000,
    dueDate: '2026-06-05',
    status: 'unpaid',
  },
  {
    id: 'i6',
    clientName: 'SP Events',
    invoiceNumber: 'INV-2026-010',
    amount: 12500,
    dueDate: '2026-06-13',
    status: 'unpaid',
  },
  {
    id: 'i7',
    clientName: 'The Webbia & Ikie Posting',
    invoiceNumber: 'INV-2026-011',
    amount: 19000,
    dueDate: '2026-06-15',
    status: 'unpaid',
  },
  {
    id: 'i8',
    clientName: 'Issara',
    invoiceNumber: 'INV-2026-012',
    amount: 16000,
    dueDate: '2026-06-13',
    status: 'unpaid',
  },
  {
    id: 'i9',
    clientName: 'EVENT NEW',
    invoiceNumber: 'INV-2026-013',
    amount: 16000,
    dueDate: '2026-06-16',
    status: 'unpaid',
  },
];

// ─── REAL EMPLOYEES (From Google Sheet) ──────────────────────────────────────
export const mockEmployees: MockEmployee[] = [
  {
    id: 'e1',
    name: 'Divyansh',
    position: 'Creative Director',
    department: 'Design & Creative',
    joiningDate: '2025-06-01',
    salary: 20000,
    performanceScore: 4.7,
    productivityScore: 93.0,
  },
  {
    id: 'e2',
    name: 'Govind',
    position: 'Web Developer',
    department: 'Technology',
    joiningDate: '2025-09-01',
    salary: 6000,
    performanceScore: 4.2,
    productivityScore: 88.5,
  },
  {
    id: 'e3',
    name: 'Kavya',
    position: 'Content Strategist',
    department: 'Marketing',
    joiningDate: '2025-10-15',
    salary: 16000,
    performanceScore: 4.8,
    productivityScore: 95.0,
  },
  {
    id: 'e4',
    name: 'Amit',
    position: 'Social Media Manager',
    department: 'Marketing',
    joiningDate: '2026-01-10',
    salary: 2000,
    performanceScore: 3.9,
    productivityScore: 82.0,
  },
  {
    id: 'e5',
    name: 'Nitin',
    position: 'Performance Marketing Analyst',
    department: 'Paid Media',
    joiningDate: '2026-02-01',
    salary: 12000,
    performanceScore: 4.5,
    productivityScore: 91.5,
  },
];

export const mockMeetings: MockMeeting[] = [
  {
    id: 'm1',
    title: 'GS Ayurveda June Campaign Review',
    scheduledAt: '2026-06-13T10:30:00Z',
    duration: 30,
    link: 'https://meet.google.com/abc-defg-hij',
    status: 'scheduled',
  },
  {
    id: 'm2',
    title: 'Ashvastra Brand Identity Presentation',
    scheduledAt: '2026-06-15T15:00:00Z',
    duration: 45,
    link: 'https://zoom.us/j/987654321',
    status: 'scheduled',
  },
  {
    id: 'm3',
    title: 'The Webbia Website Progress Sync',
    scheduledAt: '2026-06-16T11:00:00Z',
    duration: 30,
    link: 'https://meet.google.com/xyz-abcd-efg',
    status: 'scheduled',
  },
];

// ─── REAL UPCOMING EXPENSES (From Google Sheet) ───────────────────────────────
export const mockExpenses: MockExpense[] = [
  { id: 'exp1', name: 'Office Rent', amount: 13250, category: 'rent' },
  { id: 'exp2', name: 'Groceries', amount: 3000, category: 'food' },
  { id: 'exp3', name: 'Protein Supplement', amount: 3000, category: 'health' },
  { id: 'exp4', name: 'Other Expenses', amount: 3000, category: 'other' },
  { id: 'exp5', name: 'Milk', amount: 2500, category: 'food' },
  { id: 'exp6', name: 'Banana', amount: 2500, category: 'food' },
  { id: 'exp7', name: 'Gym Membership', amount: 1500, category: 'health' },
  { id: 'exp8', name: 'Electricity Bill', amount: 1000, category: 'utility' },
  { id: 'exp9', name: 'Creatine', amount: 600, category: 'health' },
  { id: 'exp10', name: 'Water', amount: 600, category: 'utility' },
  { id: 'exp11', name: 'Multivitamins', amount: 150, category: 'health' },
  { id: 'exp12', name: 'Samsung S21 FE', amount: 5000, category: 'other' },
];
