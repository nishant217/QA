import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditEntry } from '@/types';

interface AuditState {
  auditLog: AuditEntry[];
  logAction: (entry: Omit<AuditEntry, 'id' | 'timestamp'>) => void;
  getAuditByUser: (userId: string) => AuditEntry[];
  getAuditByEntity: (entityType: string, entityId?: string) => AuditEntry[];
  getAuditByDateRange: (startDate: string, endDate: string) => AuditEntry[];
  exportAuditLog: (format: 'json' | 'csv') => string;
}

const generateId = () => `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Seed audit entries
const SEED_AUDIT: AuditEntry[] = [
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'FD_VIEWED',
    entityType: 'FD',
    entityId: 'fd-001',
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'FEATURE_FLAG_TOGGLED',
    entityType: 'SYSTEM_CONFIG',
    entityId: 'config-001',
    oldValue: { enableAIChatbot: false },
    newValue: { enableAIChatbot: true },
    reason: 'User request',
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'FD_CREATED',
    entityType: 'FD',
    entityId: 'fd-015',
    newValue: { referenceNumber: 'FD-2026-015', principal: 17500000 },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'FD_APPROVED',
    entityType: 'FD',
    entityId: 'fd-015',
    newValue: { status: 'Active', approvedBy: 'admin-001' },
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'REPORT_EXPORTED',
    entityType: 'REPORT',
    entityId: 'report-001',
    newValue: { type: 'FD_PORTFOLIO', format: 'PDF' },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'USER_CREATED',
    entityType: 'USER',
    entityId: 'user-003',
    newValue: { email: 'newuser@company.com', role: 'VIEWER' },
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'ACCRUAL_RUN_CREATED',
    entityType: 'ACCRUAL_RUN',
    entityId: 'acr-002',
    newValue: { period: '2026-02', status: 'Simulation' },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'ACCRUAL_RUN_APPROVED',
    entityType: 'ACCRUAL_RUN',
    entityId: 'acr-002',
    oldValue: { status: 'Awaiting Approval' },
    newValue: { status: 'Approved', approvedBy: 'admin-001' },
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'RATE_REQUEST_CREATED',
    entityType: 'RATE_REQUEST',
    entityId: 'rr-003',
    newValue: { principalAmount: 50000000, tenorDays: 365 },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'NOTIFICATION_READ',
    entityType: 'NOTIFICATION',
    entityId: 'notif-001',
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'MASTER_DATA_UPDATED',
    entityType: 'RATE_CARD',
    entityId: 'rc-hdfc-5',
    oldValue: { rate: 7.25 },
    newValue: { rate: 7.50 },
    reason: 'Rate revision by bank',
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'INTEREST_RECEIPT_UPLOADED',
    entityType: 'RECEIPT',
    entityId: 'rcpt-015',
    newValue: { bankName: 'HDFC Bank', amount: 375000 },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 13 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'MATURITY_ACTION_CREATED',
    entityType: 'MATURITY_ACTION',
    entityId: 'ma-001',
    newValue: { fdId: 'fd-008', actionType: 'Payout' },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'PERIOD_CLOSE_INITIATED',
    entityType: 'PERIOD_CLOSE',
    entityId: 'pc-2026-02',
    newValue: { period: '2026-02', status: 'In Progress' },
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'JOURNAL_BATCH_POSTED',
    entityType: 'JOURNAL_BATCH',
    entityId: 'jb-002',
    newValue: { status: 'Posted', totalDebit: 1245678 },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'PDF_UPLOADED',
    entityType: 'UPLOADED_FILE',
    entityId: 'file-001',
    newValue: { name: 'HDFC_FD_Certificate.pdf', type: 'FD_CERTIFICATE' },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 17 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'SYSTEM_SETTING_UPDATED',
    entityType: 'SYSTEM_CONFIG',
    entityId: 'config-002',
    oldValue: { sessionTimeoutMins: 30 },
    newValue: { sessionTimeoutMins: 60 },
    reason: 'Security policy update',
    sessionId: 'session-002',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'CASH_FLOW_GENERATED',
    entityType: 'CASH_FLOW',
    entityId: 'cf-001',
    newValue: { fdId: 'fd-001', entries: 4 },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
    userId: 'demo-001',
    userEmail: 'demo@nyneos.com',
    userRole: 'TREASURY_DEALER',
    action: 'TDS_REGISTER_EXPORTED',
    entityType: 'REPORT',
    entityId: 'report-tds-001',
    newValue: { period: '2025-25', format: 'Excel' },
    sessionId: 'session-001',
  },
  {
    id: generateId(),
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    userId: 'admin-001',
    userEmail: 'admin@nyneos.com',
    userRole: 'SYSTEM_ADMIN',
    action: 'LOGIN',
    entityType: 'SESSION',
    entityId: 'session-002',
    newValue: { ipAddress: '192.168.1.100' },
    sessionId: 'session-002',
  },
];

export const useAuditStore = create<AuditState>()(
  persist(
    (set, get) => ({
      auditLog: SEED_AUDIT,

      logAction: (entry) => {
        const newEntry: AuditEntry = {
          ...entry,
          id: generateId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          auditLog: [newEntry, ...state.auditLog],
        }));
      },

      getAuditByUser: (userId) => {
        return get().auditLog.filter(entry => entry.userId === userId);
      },

      getAuditByEntity: (entityType, entityId) => {
        return get().auditLog.filter(
          entry => entry.entityType === entityType &&
          (!entityId || entry.entityId === entityId)
        );
      },

      getAuditByDateRange: (startDate, endDate) => {
        return get().auditLog.filter(
          entry => entry.timestamp >= startDate && entry.timestamp <= endDate
        );
      },

      exportAuditLog: (format) => {
        const log = get().auditLog;
        
        if (format === 'json') {
          return JSON.stringify(log, null, 2);
        }
        
        // CSV format
        const headers = ['Timestamp', 'User', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Reason'];
        const rows = log.map(entry => [
          entry.timestamp,
          entry.userEmail,
          entry.userRole,
          entry.action,
          entry.entityType,
          entry.entityId,
          entry.reason || '',
        ]);
        
        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      },
    }),
    {
      name: 'nyneos-audit',
    }
  )
);
