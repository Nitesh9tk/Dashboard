import { supabase } from './supabase';

export interface UserSession {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  isDemo: boolean;
  phone?: string;
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
      if (typeof window !== 'undefined') {
        const targetDemoUsers = [
          { email: 'ceo@bb24.agency', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' },
          { email: 'ceo.bb24.agency@gmail.com', password: 'admin', role: 'founder', name: 'Nitesh Sharma', phone: '+91 98765 43210' },
          // Employees
          { email: 'divyansh@bb24.agency', password: 'password', role: 'employee', name: 'Divyansh' },
          { email: 'govind@bb24.agency', password: 'password', role: 'employee', name: 'Govind' },
          { email: 'kavya@bb24.agency', password: 'password', role: 'employee', name: 'Kavya' },
          { email: 'amit@bb24.agency', password: 'password', role: 'employee', name: 'Amit' },
          { email: 'nitin@bb24.agency', password: 'password', role: 'employee', name: 'Nitin' },
          // Clients
          { email: 'gsayurveda@email.com', password: 'password', role: 'client', name: 'GS Ayurveda Team' },
          { email: 'ashvastra@email.com', password: 'password', role: 'client', name: 'Ashvastra Team' },
          { email: 'chillqubig@email.com', password: 'password', role: 'client', name: 'Chillqubig Team' },
          { email: 'oncoadvisor@email.com', password: 'password', role: 'client', name: 'OncoAdvisor Team' },
          { email: 'spevents@email.com', password: 'password', role: 'client', name: 'SP Events Team' },
          { email: 'wellavitta@email.com', password: 'password', role: 'client', name: 'WellaVitta Team' },
        ];

        const userBaseStr = localStorage.getItem('bb24_user_base');
        let userBase = userBaseStr ? JSON.parse(userBaseStr) : [];

        // Force align target demo users to ensure correct roles/credentials
        targetDemoUsers.forEach(target => {
          const idx = userBase.findIndex((u: any) => u.email.toLowerCase() === target.email.toLowerCase());
          if (idx !== -1) {
            userBase[idx].role = target.role;
            if (['ceo@bb24.agency', 'gsayurveda@email.com', 'kavya@bb24.agency'].includes(target.email)) {
              userBase[idx].password = target.password;
              userBase[idx].name = target.name;
            }
          } else {
            userBase.push(target);
          }
        });
        localStorage.setItem('bb24_user_base', JSON.stringify(userBase));

        const loginEmail = email ? email.toLowerCase().trim() : '';
        const matchedUser = userBase.find((u: any) => u.email.toLowerCase() === loginEmail);

        if (!matchedUser) {
          return { success: false, error: 'User not found in local workspace base' };
        }

        // Verify password
        const cleanPassword = password || '';
        if (matchedUser.password !== cleanPassword) {
          return { success: false, error: 'Invalid password' };
        }

        const nameParts = matchedUser.name ? matchedUser.name.split(' ') : ['User', 'Member'];
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || 'Member';

        // Create a mock user session for sandbox evaluation
        const mockSession: UserSession = {
          id: matchedUser.id || 'demo-user-' + matchedUser.email,
          email: matchedUser.email,
          role: matchedUser.role,
          firstName: firstName,
          lastName: lastName,
          organizationName: matchedUser.role === 'client' ? matchedUser.name : 'BB24 Agency',
          phone: matchedUser.phone || '',
          isDemo: true,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(mockSession));
        return { success: true, session: mockSession };
      }
      return { success: false, error: 'Window context not available' };
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
  },

  // Update profile updates
  updateProfile(updates: Partial<UserSession>): void {
    if (typeof window === 'undefined') return;
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return;
    try {
      const session = JSON.parse(sessionStr);
      const updatedSession = { ...session, ...updates };
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
      
      // Update credentials user base
      const userBaseStr = localStorage.getItem('bb24_user_base');
      if (userBaseStr) {
        const userBase = JSON.parse(userBaseStr);
        const index = userBase.findIndex((u: any) => u.email.toLowerCase() === session.email.toLowerCase());
        if (index !== -1) {
          const matchedUser = userBase[index];
          if (updates.firstName || updates.lastName) {
            matchedUser.name = `${updates.firstName || session.firstName} ${updates.lastName || session.lastName}`.trim();
          }
          if (updates.email) {
            matchedUser.email = updates.email;
          }
          if (updates.phone) {
            matchedUser.phone = updates.phone;
          }
          localStorage.setItem('bb24_user_base', JSON.stringify(userBase));
        }
      }
    } catch (e) {
      console.error('Failed to update profile', e);
    }
  }
};
