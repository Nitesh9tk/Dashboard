import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables with secure fallbacks for local-only testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Initialize the Supabase Client SDK
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
