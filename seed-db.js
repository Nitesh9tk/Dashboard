const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qqgnucqhlqqymaeutpjy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZ251Y3FobHFxeW1hZXV0cGp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzE5NTUsImV4cCI6MjA5NjkwNzk1NX0.3z2QA2rDMr6lucbj9oShaMmGI7IbXaaVYXbsnXU-WAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Seeding Supabase database...");
  
  const email = 'ceo.bb24.agency@gmail.com';
  const password = 'agencyceo123';
  
  console.log(`Authenticating as: ${email}...`);
  let sessionUser = null;
  
  // Try to sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (signInError) {
    console.log("User not found or login failed. Attempting signup...");
    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Dev',
          last_name: 'Founder'
        }
      }
    });
    
    if (signUpError) {
      console.error("Authentication/Signup failed:", signUpError);
      return;
    }
    
    console.log("✅ Signup successful! Logging in...");
    const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (signInError2) {
      console.error("Login after signup failed:", signInError2);
      return;
    }
    sessionUser = signInData2.user;
  } else {
    sessionUser = signInData.user;
  }
  
  console.log("✅ Logged in successfully! User ID:", sessionUser.id);
  
  // Fetch profile to get organization_id
  console.log("Fetching user profile to get organization ID...");
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', sessionUser.id)
    .single();
    
  if (profileError || !profile?.organization_id) {
    console.error("Failed to get profile organization_id:", profileError || "organization_id is null");
    return;
  }
  
  const orgId = profile.organization_id;
  console.log("✅ Active Organization ID:", orgId);

  // Generate UUIDs for the clients so projects and invoices can link to them correctly
  const clientIds = {
    c1: '81194f5b-9b4e-4f35-950f-2c07fb8d7a01', // GS Ayurveda
    c2: '81194f5b-9b4e-4f35-950f-2c07fb8d7a02', // Ashvastra Creation
    c3: '81194f5b-9b4e-4f35-950f-2c07fb8d7a03', // The Webbia & Ikie Posting
    c4: '81194f5b-9b4e-4f35-950f-2c07fb8d7a04', // Chillqubig
    c5: '81194f5b-9b4e-4f35-950f-2c07fb8d7a05', // OncoAdvisor
    c6: '81194f5b-9b4e-4f35-950f-2c07fb8d7a06', // The Webbia Website
    c7: '81194f5b-9b4e-4f35-950f-2c07fb8d7a07', // WellaVitta
    c8: '81194f5b-9b4e-4f35-950f-2c07fb8d7a08', // SP Events
  };

  const clientsData = [
    { id: clientIds.c1, organization_id: orgId, company_name: 'GS Ayurveda', contact_person: 'GS Ayurveda Team', email: 'gsayurveda@email.com', phone: '+91 98765 00001', monthly_fee: 15000, contract_start_date: '2026-01-01', contract_end_date: '2026-12-31', status: 'active' },
    { id: clientIds.c2, organization_id: orgId, company_name: 'Ashvastra Creation', contact_person: 'Ashvastra Team', email: 'ashvastra@email.com', phone: '+91 98765 00002', monthly_fee: 28000, contract_start_date: '2026-03-01', contract_end_date: '2026-12-31', status: 'active' },
    { id: clientIds.c3, organization_id: orgId, company_name: 'The Webbia & Ikie Posting', contact_person: 'Webbia Team', email: 'thewebbia@email.com', phone: '+91 98765 00003', monthly_fee: 6000, contract_start_date: '2026-04-01', contract_end_date: '2026-12-31', status: 'active' },
    { id: clientIds.c4, organization_id: orgId, company_name: 'Chillqubig', contact_person: 'Chillqubig Team', email: 'chillqubig@email.com', phone: '+91 98765 00004', monthly_fee: 5000, contract_start_date: '2026-04-01', contract_end_date: '2026-12-31', status: 'active' },
    { id: clientIds.c5, organization_id: orgId, company_name: 'OncoAdvisor', contact_person: 'OncoAdvisor Team', email: 'oncoadvisor@email.com', phone: '+91 98765 00005', monthly_fee: 10000, contract_start_date: '2026-05-01', contract_end_date: '2026-12-31', status: 'active' },
    { id: clientIds.c6, organization_id: orgId, company_name: 'The Webbia Website', contact_person: 'Webbia Website Team', email: 'thewebbia.web@email.com', phone: '+91 98765 00006', monthly_fee: 13000, contract_start_date: '2026-04-01', contract_end_date: '2026-07-31', status: 'active' },
    { id: clientIds.c7, organization_id: orgId, company_name: 'WellaVitta', contact_person: 'WellaVitta Team', email: 'wellavitta@email.com', phone: '+91 98765 00007', monthly_fee: 8000, contract_start_date: '2026-05-01', contract_end_date: '2026-08-31', status: 'active' },
    { id: clientIds.c8, organization_id: orgId, company_name: 'SP Events', contact_person: 'SP Events Team', email: 'spevents@email.com', phone: '+91 98765 00008', monthly_fee: 5000, contract_start_date: '2026-03-01', contract_end_date: '2026-03-31', status: 'inactive' },
  ];

  // Insert Clients
  const { error: clientsError } = await supabase.from('clients').upsert(clientsData);
  if (clientsError) console.error("Clients seed error:", clientsError);
  else console.log("✅ Seeded Clients");

  // 3. Insert Leads
  const leadsData = [
    { organization_id: orgId, client_name: 'Neha', company_name: 'Beauty Brand', email: 'neha@beautybrand.com', stage: 'won', source: 'Referral', revenue_potential: 120000 },
    { organization_id: orgId, client_name: 'Rohit', company_name: 'Travel Co.', email: 'rohit@travelco.com', stage: 'won', source: 'LinkedIn Outbound', revenue_potential: 95000 },
    { organization_id: orgId, client_name: 'Rahul', company_name: 'Fintech Solutions', email: 'rahul@fintechsolutions.com', stage: 'lost', source: 'Cold Outreach', revenue_potential: 180000 },
    { organization_id: orgId, client_name: 'Rajesh', company_name: 'E-Commerce Hub', email: 'rajesh@ecommercehub.com', stage: 'negotiation', source: 'Google Ads', revenue_potential: 250000 },
    { organization_id: orgId, client_name: 'Priya', company_name: 'Fashion Studio', email: 'priya@fashionstudio.com', stage: 'negotiation', source: 'Instagram', revenue_potential: 85000 },
    { organization_id: orgId, client_name: 'Dr. Batra', company_name: 'Health Clinic', email: 'drbatra@healthclinic.com', stage: 'proposal_sent', source: 'Referral', revenue_potential: 150000 },
    { organization_id: orgId, client_name: 'Vikram', company_name: 'FitLife Gym', email: 'vikram@fitlife.com', stage: 'proposal_sent', source: 'Cold Outreach', revenue_potential: 75000 },
    { organization_id: orgId, client_name: 'Amit', company_name: 'Realty Pro', email: 'amit@realtypro.com', stage: 'contacted', source: 'Referral', revenue_potential: 350000 },
    { organization_id: orgId, client_name: 'Pooja', company_name: 'EduLearn', email: 'pooja@edulearn.com', stage: 'new_lead', source: 'Organic Search', revenue_potential: 60000 },
    { organization_id: orgId, client_name: 'Karan', company_name: 'TechStartup', email: 'karan@techstartup.com', stage: 'new_lead', source: 'LinkedIn Outbound', revenue_potential: 200000 },
    { organization_id: orgId, client_name: 'Sneha', company_name: 'Food Delight', email: 'sneha@fooddelight.com', stage: 'new_lead', source: 'Google Ads', revenue_potential: 45000 },
    { organization_id: orgId, client_name: 'Sanjay', company_name: 'AutoDrive Motors', email: 'sanjay@autodrive.com', stage: 'contacted', source: 'Cold Outreach', revenue_potential: 280000 },
  ];
  
  const { error: leadsError } = await supabase.from('leads').upsert(leadsData);
  if (leadsError) console.error("Leads seed error:", leadsError);
  else console.log("✅ Seeded Leads");

  // 4. Insert Projects
  const projectIds = {
    p1: '91194f5b-9b4e-4f35-950f-2c07fb8d7a01',
    p2: '91194f5b-9b4e-4f35-950f-2c07fb8d7a02',
    p3: '91194f5b-9b4e-4f35-950f-2c07fb8d7a03',
  };
  const projectsData = [
    { id: projectIds.p1, organization_id: orgId, client_id: clientIds.c1, name: 'Social Media & Content Marketing', description: 'Monthly social media management, content creation, and organic growth strategy for Ayurveda brand.', start_date: '2026-01-01', due_date: '2026-12-31', status: 'active' },
    { id: projectIds.p2, organization_id: orgId, client_id: clientIds.c2, name: 'Brand Identity & Digital Marketing', description: 'Full-scale brand identity development, digital marketing, and paid ad campaigns.', start_date: '2026-03-01', due_date: '2026-12-31', status: 'active' },
    { id: projectIds.p3, organization_id: orgId, client_id: clientIds.c6, name: 'Website Development', description: 'Full website design and development project on a one-time basis.', start_date: '2026-04-01', due_date: '2026-07-31', status: 'active' },
  ];
  const { error: projectsError } = await supabase.from('projects').upsert(projectsData);
  if (projectsError) console.error("Projects seed error:", projectsError);
  else console.log("✅ Seeded Projects");

  // 5. Insert Invoices
  const invoicesData = [
    { organization_id: orgId, client_id: clientIds.c1, invoice_number: 'INV-2026-006', amount: 15000, due_date: '2026-06-15', status: 'unpaid' },
    { organization_id: orgId, client_id: clientIds.c1, invoice_number: 'INV-2026-005', amount: 7500, due_date: '2026-05-15', status: 'paid', paid_at: '2026-05-10T00:00:00Z' },
    { organization_id: orgId, client_id: clientIds.c2, invoice_number: 'INV-2026-004', amount: 28000, due_date: '2026-06-10', status: 'overdue' },
    { organization_id: orgId, client_id: clientIds.c6, invoice_number: 'INV-2026-003', amount: 13000, due_date: '2026-04-30', status: 'paid', paid_at: '2026-04-28T00:00:00Z' },
    { organization_id: orgId, client_id: clientIds.c8, invoice_number: 'INV-2026-001', amount: 5000, due_date: '2026-03-20', status: 'paid', paid_at: '2026-03-18T00:00:00Z' },
  ];
  const { error: invoicesError } = await supabase.from('invoices').upsert(invoicesData);
  if (invoicesError) console.error("Invoices seed error:", invoicesError);
  else console.log("✅ Seeded Invoices");

  console.log("🎉 Database Seed completed successfully!");
}

seed().catch(err => console.error("Fatal seed error:", err));
