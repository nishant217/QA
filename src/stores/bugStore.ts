import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BugType = 
  | 'ui_glitch' 
  | 'data_corruption' 
  | 'notification_storm' 
  | 'chart_misrender' 
  | 'slow_load' 
  | 'api_failure' 
  | 'validation_bypass' 
  | 'permission_leak' 
  | 'calculation_error' 
  | 'export_corrupt' 
  | 'search_broken' 
  | 'filter_malfunction' 
  | 'theme_break' 
  | 'session_hijack' 
  | 'memory_leak';

export interface Bug {
  id: string;
  type: BugType;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  injectedAt?: string;
  injectedBy?: string;
}

interface BugState {
  bugs: Bug[];
  activeBugs: BugType[];
  injectBug: (bugId: string) => void;
  removeBug: (bugId: string) => void;
  removeAllBugs: () => void;
  isBugActive: (bugType: BugType) => boolean;
  getActiveBugs: () => Bug[];
  toggleBug: (bugId: string) => void;
}

// Predefined QA bugs
export const PREDEFINED_BUGS: Bug[] = [
  {
    id: 'bug-001',
    type: 'ui_glitch',
    name: 'UI Glitch: Misaligned Buttons',
    description: 'Buttons on FD Booking page appear misaligned by 10px',
    severity: 'low',
    isActive: false,
  },
  {
    id: 'bug-002',
    type: 'data_corruption',
    name: 'Data Corruption: Interest Display',
    description: 'Interest values show incorrect decimal places (e.g., 12.5 instead of 1,25,000)',
    severity: 'high',
    isActive: false,
  },
  {
    id: 'bug-003',
    type: 'notification_storm',
    name: 'Notification Storm',
    description: 'Triggers 50+ notifications in rapid succession',
    severity: 'medium',
    isActive: false,
  },
  {
    id: 'bug-004',
    type: 'chart_misrender',
    name: 'Chart Misrender: Negative Values',
    description: 'Portfolio chart displays negative bars incorrectly',
    severity: 'medium',
    isActive: false,
  },
  {
    id: 'bug-005',
    type: 'slow_load',
    name: 'Slow Load: 10s Delay',
    description: 'All API calls artificially delayed by 10 seconds',
    severity: 'medium',
    isActive: false,
  },
  {
    id: 'bug-006',
    type: 'api_failure',
    name: 'API Failure: Rate Fetch',
    description: 'Bank rate API returns 500 error consistently',
    severity: 'high',
    isActive: false,
  },
  {
    id: 'bug-007',
    type: 'validation_bypass',
    name: 'Validation Bypass: Negative Amounts',
    description: 'FD booking accepts negative principal amounts',
    severity: 'critical',
    isActive: false,
  },
  {
    id: 'bug-008',
    type: 'permission_leak',
    name: 'Permission Leak: Admin Features',
    description: 'Demo user can see admin-only buttons (non-functional)',
    severity: 'high',
    isActive: false,
  },
  {
    id: 'bug-009',
    type: 'calculation_error',
    name: 'Calculation Error: TDS',
    description: 'TDS calculation uses wrong percentage (5% instead of 10%)',
    severity: 'critical',
    isActive: false,
  },
  {
    id: 'bug-010',
    type: 'export_corrupt',
    name: 'Export Corrupt: Excel Files',
    description: 'Generated Excel files are corrupted and cannot be opened',
    severity: 'high',
    isActive: false,
  },
  {
    id: 'bug-011',
    type: 'search_broken',
    name: 'Search Broken: No Results',
    description: 'FD Master search returns empty results for all queries',
    severity: 'medium',
    isActive: false,
  },
  {
    id: 'bug-012',
    type: 'filter_malfunction',
    name: 'Filter Malfunction: Date Range',
    description: 'Date range filter shows records outside selected range',
    severity: 'medium',
    isActive: false,
  },
  {
    id: 'bug-013',
    type: 'theme_break',
    name: 'Theme Break: CSS Variables',
    description: 'Theme switcher causes CSS variables to become undefined',
    severity: 'low',
    isActive: false,
  },
  {
    id: 'bug-014',
    type: 'session_hijack',
    name: 'Session Hijack: Cross-Tab',
    description: 'Session incorrectly shared between admin and demo tabs',
    severity: 'critical',
    isActive: false,
  },
  {
    id: 'bug-015',
    type: 'memory_leak',
    name: 'Memory Leak: Chat Component',
    description: 'AI Chatbot causes memory leak after 50 messages',
    severity: 'medium',
    isActive: false,
  },
];

const BUGS_STORAGE_KEY = 'nyneos-bugs';

export const useBugStore = create<BugState>()(
  persist(
    (set, get) => ({
      bugs: PREDEFINED_BUGS,
      activeBugs: [],

      injectBug: (bugId: string) => {
        set((state) => {
          const bug = state.bugs.find(b => b.id === bugId);
          if (!bug) return state;

          const updatedBugs = state.bugs.map(b =>
            b.id === bugId
              ? { 
                  ...b, 
                  isActive: true, 
                  injectedAt: new Date().toISOString(),
                  injectedBy: 'admin'
                }
              : b
          );

          const activeBugs = updatedBugs
            .filter(b => b.isActive)
            .map(b => b.type);

          // Sync to localStorage for cross-tab access
          localStorage.setItem(BUGS_STORAGE_KEY, JSON.stringify({
            bugs: updatedBugs,
            activeBugs,
            lastUpdated: Date.now(),
          }));

          return { bugs: updatedBugs, activeBugs };
        });
      },

      removeBug: (bugId: string) => {
        set((state) => {
          const updatedBugs = state.bugs.map(b =>
            b.id === bugId
              ? { ...b, isActive: false, injectedAt: undefined, injectedBy: undefined }
              : b
          );

          const activeBugs = updatedBugs
            .filter(b => b.isActive)
            .map(b => b.type);

          // Sync to localStorage for cross-tab access
          localStorage.setItem(BUGS_STORAGE_KEY, JSON.stringify({
            bugs: updatedBugs,
            activeBugs,
            lastUpdated: Date.now(),
          }));

          return { bugs: updatedBugs, activeBugs };
        });
      },

      removeAllBugs: () => {
        set((state) => {
          const updatedBugs = state.bugs.map(b => ({
            ...b,
            isActive: false,
            injectedAt: undefined,
            injectedBy: undefined,
          }));

          localStorage.setItem(BUGS_STORAGE_KEY, JSON.stringify({
            bugs: updatedBugs,
            activeBugs: [],
            lastUpdated: Date.now(),
          }));

          return { bugs: updatedBugs, activeBugs: [] };
        });
      },

      isBugActive: (bugType: BugType) => {
        return get().activeBugs.includes(bugType);
      },

      getActiveBugs: () => {
        return get().bugs.filter(b => b.isActive);
      },

      toggleBug: (bugId: string) => {
        const bug = get().bugs.find(b => b.id === bugId);
        if (bug?.isActive) {
          get().removeBug(bugId);
        } else {
          get().injectBug(bugId);
        }
      },
    }),
    {
      name: 'nyneos-bug-store',
    }
  )
);

// Cross-tab sync for bugs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === BUGS_STORAGE_KEY) {
      try {
        const data = JSON.parse(e.newValue || '{}');
        if (data.bugs && data.activeBugs) {
          useBugStore.setState({
            bugs: data.bugs,
            activeBugs: data.activeBugs,
          });
        }
      } catch {
        // Invalid bug data
      }
    }
  });
}
