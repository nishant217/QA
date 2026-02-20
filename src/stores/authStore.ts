import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginHistory } from '@/types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  sessionId: string | null;
  loginHistory: LoginHistory[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  addLoginHistory: (entry: LoginHistory) => void;
  syncSession: () => void;
}

const ADMIN_USER: User = {
  id: 'admin-001',
  email: 'admin@nyneos.com',
  name: 'Arjun Sharma',
  role: 'SYSTEM_ADMIN',
  createdAt: '2024-01-01T00:00:00Z',
  lastLogin: new Date().toISOString(),
};

const DEMO_USER: User = {
  id: 'demo-001',
  email: 'demo@nyneos.com',
  name: 'Priya Mehta',
  role: 'TREASURY_DEALER',
  createdAt: '2024-01-01T00:00:00Z',
  lastLogin: new Date().toISOString(),
};

// Cross-tab session sync using localStorage
const SESSION_KEY = 'nyneos-session';
const SESSION_TIMESTAMP_KEY = 'nyneos-session-timestamp';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      sessionId: null,
      loginHistory: [],

      login: async (email: string, password: string) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        if (email === 'admin@nyneos.com' && password === 'admin123456') {
          const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const user = { ...ADMIN_USER, lastLogin: new Date().toISOString() };
          
          set({
            currentUser: user,
            isAuthenticated: true,
            sessionId,
          });

          // Store in localStorage for cross-tab sync
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user, sessionId }));
          localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());

          // Add to login history
          const historyEntry: LoginHistory = {
            id: `login-${Date.now()}`,
            userId: user.id,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.100',
          };
          get().addLoginHistory(historyEntry);

          return { success: true };
        }

        if (email === 'demo@nyneos.com' && password === '0987654321') {
          const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const user = { ...DEMO_USER, lastLogin: new Date().toISOString() };
          
          set({
            currentUser: user,
            isAuthenticated: true,
            sessionId,
          });

          // Store in localStorage for cross-tab sync
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user, sessionId }));
          localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());

          const historyEntry: LoginHistory = {
            id: `login-${Date.now()}`,
            userId: user.id,
            timestamp: new Date().toISOString(),
            ipAddress: '192.168.1.101',
          };
          get().addLoginHistory(historyEntry);

          return { success: true };
        }

        return { success: false, error: 'Invalid email or password' };
      },

      logout: () => {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        set({
          currentUser: null,
          isAuthenticated: false,
          sessionId: null,
        });
      },

      addLoginHistory: (entry: LoginHistory) => {
        set(state => ({
          loginHistory: [entry, ...state.loginHistory].slice(0, 100),
        }));
      },

      syncSession: () => {
        // Check for existing session in localStorage (for cross-tab sync)
        const storedSession = localStorage.getItem(SESSION_KEY);
        const storedTimestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);
        
        if (storedSession && storedTimestamp) {
          const timestamp = parseInt(storedTimestamp, 10);
          const now = Date.now();
          const sessionAge = now - timestamp;
          const maxSessionAge = 8 * 60 * 60 * 1000; // 8 hours
          
          if (sessionAge < maxSessionAge) {
            try {
              const { user, sessionId } = JSON.parse(storedSession);
              const currentState = get();
              
              // Only sync if different session
              if (currentState.sessionId !== sessionId) {
                set({
                  currentUser: user,
                  isAuthenticated: true,
                  sessionId,
                });
              }
            } catch {
              // Invalid session data, clear it
              localStorage.removeItem(SESSION_KEY);
              localStorage.removeItem(SESSION_TIMESTAMP_KEY);
            }
          } else {
            // Session expired
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(SESSION_TIMESTAMP_KEY);
          }
        }
      },
    }),
    {
      name: 'nyneos-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
        sessionId: state.sessionId,
        loginHistory: state.loginHistory,
      }),
    }
  )
);

// Set up cross-tab sync listener
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === SESSION_KEY) {
      const authStore = useAuthStore.getState();
      
      if (e.newValue) {
        // New session created in another tab
        try {
          const { user, sessionId } = JSON.parse(e.newValue);
          if (authStore.sessionId !== sessionId) {
            useAuthStore.setState({
              currentUser: user,
              isAuthenticated: true,
              sessionId,
            });
          }
        } catch {
          // Invalid session data
        }
      } else {
        // Session cleared in another tab (logout)
        if (authStore.isAuthenticated) {
          useAuthStore.setState({
            currentUser: null,
            isAuthenticated: false,
            sessionId: null,
          });
        }
      }
    }
  });
}
