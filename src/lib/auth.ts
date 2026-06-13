import { supabase } from './supabase';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  isDemo: boolean;
}

const SESSION_KEY = 'bb24_user_session';

export const authHelper = {
  // Check if Supabase client is connected (not using default placeholders)
  isSupabaseConfigured(): boolean {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !!url && !url.includes('placeholder-project');
  },

  // Log in using Email & Password (or Demo fallback)
  async signIn(email: string, password?: string, isDemoLogin = false): Promise<{ success: boolean; error?: string; session?: UserSession }> {
    if (isDemoLogin || !this.isSupabaseConfigured()) {
      // Check for dynamically created users in localStorage
      const userBaseStr = typeof window !== 'undefined' ? localStorage.getItem('bb24_user_base') : null;
      const userBase = userBaseStr ? JSON.parse(userBaseStr) : [];
      
      const loginEmail = email ? email.toLowerCase() : 'ceo@bb24.agency';
      const matchedUser = userBase.find((u: any) => u.email.toLowerCase() === loginEmail);

      let role = 'founder';
      let firstName = 'Dev';
      let lastName = 'Founder';

      if (matchedUser) {
        role = matchedUser.role;
        const nameParts = matchedUser.name ? matchedUser.name.split(' ') : ['User', 'Member'];
        firstName = nameParts[0] || 'User';
        lastName = nameParts.slice(1).join(' ') || 'Member';
      } else {
        // Fallback checks
        if (loginEmail.includes('client')) {
          role = 'client';
          firstName = 'Sophia';
          lastName = 'Moretti';
        } else if (loginEmail.includes('employee') || loginEmail.includes('team') || loginEmail.includes('staff')) {
          role = 'employee';
          firstName = 'Elena';
          lastName = 'Rostova';
        }
      }

      // Create a mock user session for sandbox evaluation
      const mockSession: UserSession = {
        id: 'demo-user-uuid-1234',
        email: loginEmail,
        role: role,
        firstName: firstName,
        lastName: lastName,
        organizationName: 'Alpha Digital Agency',
        isDemo: true,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
      return { success: true, session: mockSession };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
      if (error) throw error;
      
      if (data.user) {
        // Fetch organization / profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, organizations(*)')
          .eq('id', data.user.id)
          .single();

        const session: UserSession = {
          id: data.user.id,
          email: data.user.email || '',
          role: profile?.role || 'employee',
          firstName: profile?.first_name || 'Member',
          lastName: profile?.last_name || '',
          organizationName: profile?.organizations?.name || 'My Agency',
          isDemo: false,
        };

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return { success: true, session };
      }
      return { success: false, error: 'No user data returned' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Authentication failed' };
    }
  },

  // Register a new user
  async signUp(email: string, password?: string, firstName = '', lastName = ''): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupabaseConfigured()) {
      // Under demo mode, signup is immediately mock-logged in
      await this.signIn(email, password, true);
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  },

  // Log out the active session
  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
    if (this.isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  // Get active session
  getCurrentSession(): UserSession | null {
    if (typeof window === 'undefined') return null;
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }
};
