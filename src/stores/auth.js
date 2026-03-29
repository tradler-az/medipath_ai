import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  role: null,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (response.ok) {
        set({ 
          user: data.user, 
          token: data.access_token, 
          role: data.role,
        });
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    set({ user: null, token: null, role: null });
  },

  setRole: (role) => set({ role }),

  isAuthenticated: () => Boolean(get().token && get().role),
  
  hasRole: (requiredRole) => get().role === requiredRole,
  
  hasAnyRole: (roles) => roles.includes(get().role),
}));

