
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export interface Session {
  user: User;
  access_token: string;
  expires_at: number;
}

class CustomAuthService {
  private currentUser: User | null = null;
  private sessionToken: string | null = null;
  private authListeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.initializeSession();
  }

  private async initializeSession() {
    const token = localStorage.getItem('session_token');
    const userStr = localStorage.getItem('current_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        const isValid = await this.validateSession(token);
        
        if (isValid) {
          this.currentUser = user;
          this.sessionToken = token;
          this.notifyListeners();
        } else {
          this.clearSession();
        }
      } catch (error) {
        console.error('Error initializing session:', error);
        this.clearSession();
      }
    }
  }

  private async validateSession(token: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, session_expires_at')
        .eq('session_token', token)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      const expiresAt = new Date(data.session_expires_at);
      return expiresAt > new Date();
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  private setSession(user: User, token: string) {
    this.currentUser = user;
    this.sessionToken = token;
    localStorage.setItem('session_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.notifyListeners();
  }

  private clearSession() {
    this.currentUser = null;
    this.sessionToken = null;
    localStorage.removeItem('session_token');
    localStorage.removeItem('current_user');
    this.notifyListeners();
  }

  private notifyListeners() {
    this.authListeners.forEach(listener => listener(this.currentUser));
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    this.authListeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
    
    return () => {
      const index = this.authListeners.indexOf(callback);
      if (index > -1) {
        this.authListeners.splice(index, 1);
      }
    };
  }

  async signUp(email: string, password: string, userData: any): Promise<AuthResponse> {
    try {
      // Generate salt and hash password
      const { data: saltData, error: saltError } = await supabase.rpc('generate_salt');
      if (saltError) throw saltError;
      
      const salt = saltData;
      const { data: hashData, error: hashError } = await supabase.rpc('hash_password', {
        password,
        salt
      });
      if (hashError) throw hashError;

      // Create user
      const { data: userData: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: hashData,
          salt,
          email_verified: false
        })
        .select()
        .single();

      if (userError) {
        return { user: null, error: userError.message };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: newUser.id,
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          address: userData.address,
          phone: userData.phone,
          role_id: userData.role_id,
          organization_id: userData.organization_id
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          email_verified: newUser.email_verified,
          created_at: newUser.created_at
        },
        error: null
      };
    } catch (error: any) {
      return { user: null, error: error.message || 'Registration failed' };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user by email
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError || !user) {
        return { user: null, error: 'Invalid credentials' };
      }

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        return { user: null, error: 'Account is temporarily locked' };
      }

      // Verify password
      const { data: isValid, error: verifyError } = await supabase.rpc('verify_password', {
        password,
        hash: user.password_hash
      });

      if (verifyError || !isValid) {
        // Increment failed attempts
        await supabase
          .from('users')
          .update({ 
            failed_login_attempts: user.failed_login_attempts + 1,
            locked_until: user.failed_login_attempts >= 4 ? 
              new Date(Date.now() + 15 * 60 * 1000).toISOString() : null
          })
          .eq('id', user.id);

        return { user: null, error: 'Invalid credentials' };
      }

      // Generate session token
      const { data: sessionToken, error: tokenError } = await supabase.rpc('generate_session_token');
      if (tokenError) throw tokenError;

      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Update user with session info and reset failed attempts
      await supabase
        .from('users')
        .update({
          session_token: sessionToken,
          session_expires_at: expiresAt.toISOString(),
          failed_login_attempts: 0,
          locked_until: null
        })
        .eq('id', user.id);

      const authUser = {
        id: user.id,
        email: user.email,
        email_verified: user.email_verified,
        created_at: user.created_at
      };

      this.setSession(authUser, sessionToken);

      return { user: authUser, error: null };
    } catch (error: any) {
      return { user: null, error: error.message || 'Login failed' };
    }
  }

  async signOut(): Promise<{ error: string | null }> {
    try {
      if (this.sessionToken) {
        // Clear session token from database
        await supabase
          .from('users')
          .update({
            session_token: null,
            session_expires_at: null
          })
          .eq('session_token', this.sessionToken);
      }

      this.clearSession();
      return { error: null };
    } catch (error: any) {
      return { error: error.message || 'Logout failed' };
    }
  }

  getUser(): User | null {
    return this.currentUser;
  }

  getSession(): Session | null {
    if (!this.currentUser || !this.sessionToken) {
      return null;
    }

    return {
      user: this.currentUser,
      access_token: this.sessionToken,
      expires_at: Date.now() + 24 * 60 * 60 * 1000
    };
  }
}

export const customAuth = new CustomAuthService();
