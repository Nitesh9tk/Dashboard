-- ==========================================
-- BB24 PostgreSQL Schema - Supabase Compatible
-- ==========================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Organizations (Tenants)
CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. Create Profiles linked to Supabase auth.users
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'employee' CHECK (role IN ('super_admin', 'founder', 'co_founder', 'manager', 'team_leader', 'employee', 'sales', 'finance', 'client')),
    department VARCHAR(100),
    joining_date DATE,
    salary NUMERIC(12, 2) DEFAULT 0.00,
    performance_score NUMERIC(3, 2) DEFAULT 5.00,
    productivity_score NUMERIC(5, 2) DEFAULT 100.00,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper Function to get active user's organization_id
CREATE OR REPLACE FUNCTION public.get_current_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- RLS Policies for Profiles
CREATE POLICY select_own_org_profiles ON public.profiles
    FOR SELECT TO authenticated
    USING (organization_id = public.get_current_organization_id());

CREATE POLICY update_own_profile ON public.profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- 4. Create CRM Clients
CREATE TABLE public.clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT public.get_current_organization_id(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    gst_number VARCHAR(15),
    monthly_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    contract_start_date DATE,
    contract_end_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Clients
CREATE POLICY tenant_isolation_clients ON public.clients
    FOR ALL TO authenticated
    USING (organization_id = public.get_current_organization_id())
    WITH CHECK (organization_id = public.get_current_organization_id());

-- 5. Create Sales Leads (Pipeline)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT public.get_current_organization_id(),
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    stage VARCHAR(50) DEFAULT 'new_lead' CHECK (stage IN ('new_lead', 'contacted', 'interested', 'meeting_scheduled', 'proposal_sent', 'negotiation', 'won', 'lost')),
    source VARCHAR(100),
    revenue_potential NUMERIC(12, 2) DEFAULT 0.00,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Leads
CREATE POLICY tenant_isolation_leads ON public.leads
    FOR ALL TO authenticated
    USING (organization_id = public.get_current_organization_id())
    WITH CHECK (organization_id = public.get_current_organization_id());

-- 6. Create Projects
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT public.get_current_organization_id(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Projects
CREATE POLICY tenant_isolation_projects ON public.projects
    FOR ALL TO authenticated
    USING (organization_id = public.get_current_organization_id())
    WITH CHECK (organization_id = public.get_current_organization_id());

-- 7. Create Tasks
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(50) DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Tasks (Isolated via parent projects)
CREATE POLICY tenant_isolation_tasks ON public.tasks
    FOR ALL TO authenticated
    USING (project_id IN (SELECT id FROM public.projects WHERE organization_id = public.get_current_organization_id()))
    WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE organization_id = public.get_current_organization_id()));

-- 8. Create Invoices
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE DEFAULT public.get_current_organization_id(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Invoices
CREATE POLICY tenant_isolation_invoices ON public.invoices
    FOR ALL TO authenticated
    USING (organization_id = public.get_current_organization_id())
    WITH CHECK (organization_id = public.get_current_organization_id());

-- 9. Auto-create Profile Hook
-- Automatically insert a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_org_id UUID;
BEGIN
    -- Create a default organization for the new sign up
    INSERT INTO public.organizations (name, subdomain)
    VALUES (
        concat(split_part(NEW.email, '@', 1), '''s Agency'),
        concat(split_part(NEW.email, '@', 1), '-', floor(random() * 1000)::text)
    )
    RETURNING id INTO default_org_id;

    -- Create profile linked to organization
    INSERT INTO public.profiles (id, organization_id, first_name, last_name, role)
    VALUES (
        NEW.id,
        default_org_id,
        coalesce(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        coalesce(NEW.raw_user_meta_data->>'last_name', 'Member'),
        'founder' -- First signup of an organization is designated as Founder
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger profile creation hook
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
