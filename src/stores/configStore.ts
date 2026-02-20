import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FeatureFlags, SystemSettings } from '@/types';

interface ConfigState {
  featureFlags: FeatureFlags;
  systemSettings: SystemSettings;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
  toggleFeatureFlag: (flag: keyof FeatureFlags, userId: string) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>, userId: string) => void;
  resetToDefaults: (userId: string) => void;
}

const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableMarketsScreen: true,
  enableRateNegotiationModule: true,
  enableFDBookingModule: true,
  enableAccrualEngine: true,
  enableInterestReceipts: true,
  enableMaturityModule: true,
  enablePeriodClose: true,
  enableAccountingWorkbench: true,
  enableReportsModule: true,
  enableAIChatbot: true,
  enablePDFIntelligence: true,
  enableBulkUpload: true,
  enableAPIIntegrations: true,
  enableTDSModule: true,
  enableCashFlowSchedule: true,
  enableAuditExport: true,
  enableMailShare: true,
  enableLiveMarketTicker: true,
  enableFXRates: true,
  enableDarkModeToggle: true,
  maintenanceMode: false,
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  maxFDAmount: 500000000,
  varianceThreshold: 1000,
  sessionTimeoutMins: 60,
  tdsThresholdAmount: 50000,
  defaultCurrency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  numberFormat: 'indian',
  workingDayConvention: 'ACT/ACT',
  auditRetentionDays: 2555,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      featureFlags: DEFAULT_FEATURE_FLAGS,
      systemSettings: DEFAULT_SYSTEM_SETTINGS,
      lastModifiedBy: undefined,
      lastModifiedAt: undefined,

      toggleFeatureFlag: (flag: keyof FeatureFlags, userId: string) => {
        set((state) => ({
          featureFlags: {
            ...state.featureFlags,
            [flag]: !state.featureFlags[flag],
          },
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString(),
        }));
      },

      updateSystemSettings: (settings: Partial<SystemSettings>, userId: string) => {
        set((state) => ({
          systemSettings: {
            ...state.systemSettings,
            ...settings,
          },
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString(),
        }));
      },

      resetToDefaults: (userId: string) => {
        set({
          featureFlags: DEFAULT_FEATURE_FLAGS,
          systemSettings: DEFAULT_SYSTEM_SETTINGS,
          lastModifiedBy: userId,
          lastModifiedAt: new Date().toISOString(),
        });
      },
    }),
    {
      name: 'nyneos-config',
    }
  )
);
