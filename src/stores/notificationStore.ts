import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  pushEnabled: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAllRead: () => void;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByPriority: (priority: Notification['priority']) => Notification[];
  // Auto-trigger methods
  triggerFDMaturity: (fdId: string, bankName: string, amount: number, daysToMaturity: number) => void;
  triggerFDOverdue: (fdId: string, bankName: string, amount: number) => void;
  triggerRateNegotiation: (requestId: string, amount: number, status: 'pending' | 'approved' | 'rejected') => void;
  triggerAccrualComplete: (period: string, amount: number) => void;
  triggerFDBooked: (fdId: string, bankName: string, amount: number, rate: number) => void;
  triggerTDSMismatch: (receiptId: string, bankName: string, variance: number) => void;
  triggerPolicyBreach: (fdId: string, bankName: string, breachType: string) => void;
  triggerInterestReceipt: (fdId: string, bankName: string, amount: number) => void;
  triggerRolloverComplete: (fdId: string, bankName: string, newRate: number) => void;
  triggerPeriodClose: (period: string, status: 'initiated' | 'completed' | 'failed') => void;
  triggerBankRateUpdate: (bankName: string, oldRate: number, newRate: number) => void;
  triggerApprovalRequired: (requestType: string, requestId: string, amount: number) => void;
  triggerComplianceAlert: (alertType: string, description: string) => void;
  triggerMarketAlert: (asset: string, change: number, currentValue: number) => void;
  triggerSystemAlert: (alertType: string, message: string, priority?: Notification['priority']) => void;
  // Push notification
  requestPushPermission: () => Promise<boolean>;
  sendPushNotification: (title: string, body: string) => void;
}

const generateId = () => `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Seed notifications
const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: generateId(),
    type: 'alert',
    priority: 'high',
    title: 'FD Maturing Soon',
    description: 'FD-2026-004 (Axis Bank) matures in 10 days — action required',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'fd-004',
    relatedEntityType: 'fd',
    actionUrl: '/maturity',
    actionLabel: 'View Maturity',
  },
  {
    id: generateId(),
    type: 'alert',
    priority: 'critical',
    title: 'FD Overdue',
    description: 'FD-2026-008 (SBI) has matured and requires immediate payout or rollover action',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'fd-008',
    relatedEntityType: 'fd',
    actionUrl: '/maturity',
    actionLabel: 'Take Action',
  },
  {
    id: generateId(),
    type: 'approval',
    priority: 'high',
    title: 'Approval Required',
    description: 'Rate negotiation request RR-2026-003 (₹5 Cr) awaiting your approval',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'rr-003',
    relatedEntityType: 'rateRequest',
    actionUrl: '/rate-negotiation',
    actionLabel: 'Review',
  },
  {
    id: generateId(),
    type: 'system',
    priority: 'medium',
    title: 'Accrual Run Completed',
    description: 'Monthly accrual for February 2026 completed: ₹12,45,678 interest accrued',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'acr-002',
    relatedEntityType: 'accrual',
    actionUrl: '/accrual-engine',
    actionLabel: 'View Details',
  },
  {
    id: generateId(),
    type: 'fd_event',
    priority: 'medium',
    title: 'New FD Booked',
    description: 'FD-2026-015 created — ₹1.75 Cr @ 8.35% with IDFC First Bank',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    relatedEntityId: 'fd-015',
    relatedEntityType: 'fd',
    actionUrl: '/fd-master',
    actionLabel: 'View FD',
  },
  {
    id: generateId(),
    type: 'compliance',
    priority: 'high',
    title: 'TDS Mismatch Detected',
    description: 'Variance of ₹12,450 found in TDS for HDFC Bank interest receipt',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'rcpt-007',
    relatedEntityType: 'receipt',
    actionUrl: '/interest-receipts',
    actionLabel: 'Reconcile',
  },
  {
    id: generateId(),
    type: 'market',
    priority: 'low',
    title: 'Crypto Market Update',
    description: 'BTC crossed $95,000 — portfolio value increased by 2.3%',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionUrl: '/markets',
    actionLabel: 'View Markets',
  },
  {
    id: generateId(),
    type: 'system',
    priority: 'low',
    title: 'System Maintenance Scheduled',
    description: 'Scheduled maintenance on 25-Feb-2026 02:00-04:00 IST',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: generateId(),
    type: 'alert',
    priority: 'medium',
    title: 'Bank Rate Updated',
    description: 'HDFC Bank increased FD rates by 0.25% for 365-day tenor',
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionUrl: '/rate-negotiation',
    actionLabel: 'View Rates',
  },
  {
    id: generateId(),
    type: 'approval',
    priority: 'medium',
    title: 'Journal Batch Approved',
    description: 'Journal batch JB-2026-002 has been posted to GL',
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    relatedEntityId: 'jb-002',
    relatedEntityType: 'accrual',
    actionUrl: '/accounting',
    actionLabel: 'View Entry',
  },
  {
    id: generateId(),
    type: 'fd_event',
    priority: 'low',
    title: 'Interest Credited',
    description: 'Quarterly interest of ₹3,75,000 credited for FD-2026-001',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    relatedEntityId: 'fd-001',
    relatedEntityType: 'fd',
    actionUrl: '/interest-receipts',
    actionLabel: 'View Receipt',
  },
  {
    id: generateId(),
    type: 'compliance',
    priority: 'high',
    title: 'Form 15G/15H Expiring',
    description: '3 Forms 15G expire this month — renewal required to avoid TDS',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    actionUrl: '/tds-register',
    actionLabel: 'View Forms',
  },
  {
    id: generateId(),
    type: 'system',
    priority: 'medium',
    title: 'Period Close Initiated',
    description: 'February 2026 period close process has been initiated',
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionUrl: '/period-close',
    actionLabel: 'View Progress',
  },
  {
    id: generateId(),
    type: 'alert',
    priority: 'critical',
    title: 'Policy Breach Detected',
    description: 'FD amount exceeds single-bank limit for Yes Bank',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'fd-009',
    relatedEntityType: 'fd',
    actionUrl: '/fd-master',
    actionLabel: 'Review FD',
  },
  {
    id: generateId(),
    type: 'market',
    priority: 'low',
    title: 'USD/INR Rate Alert',
    description: 'USD/INR crossed 87.50 — consider hedging exposure',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionUrl: '/markets',
    actionLabel: 'View FX',
  },
  {
    id: generateId(),
    type: 'fd_event',
    priority: 'medium',
    title: 'Rollover Completed',
    description: 'FD-2026-002 successfully rolled over for another 365 days @ 7.35%',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    relatedEntityId: 'fd-002',
    relatedEntityType: 'fd',
    actionUrl: '/fd-master',
    actionLabel: 'View Details',
  },
  {
    id: generateId(),
    type: 'system',
    priority: 'low',
    title: 'Backup Completed',
    description: 'Daily backup completed successfully — 2.4 GB archived',
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: generateId(),
    type: 'approval',
    priority: 'high',
    title: 'Exception Approval Needed',
    description: 'Interest receipt variance of ₹45,670 requires CFO approval',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    relatedEntityId: 'rcpt-012',
    relatedEntityType: 'receipt',
    actionUrl: '/interest-receipts',
    actionLabel: 'Review',
  },
  {
    id: generateId(),
    type: 'compliance',
    priority: 'medium',
    title: 'Audit Trail Export Ready',
    description: 'Q4 2025 audit trail export is ready for download',
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    actionUrl: '/reports',
    actionLabel: 'Download',
  },
  {
    id: generateId(),
    type: 'fd_event',
    priority: 'low',
    title: 'Pre-mature Closure Processed',
    description: 'FD-2026-006 closed prematurely — net payout of ₹1,02,34,567 processed',
    timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    relatedEntityId: 'fd-006',
    relatedEntityType: 'fd',
    actionUrl: '/fd-master',
    actionLabel: 'View Certificate',
  },
];

// Format currency helper
const formatCurrency = (amount: number): string => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${amount.toLocaleString()}`;
};

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: SEED_NOTIFICATIONS,
      unreadCount: SEED_NOTIFICATIONS.filter(n => !n.isRead).length,
      pushEnabled: false,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: generateId(),
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));

        // Send push notification if enabled
        if (get().pushEnabled && notification.priority === 'critical' || notification.priority === 'high') {
          get().sendPushNotification(notification.title, notification.description);
        }
      },

      markAsRead: (id: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          if (notification && !notification.isRead) {
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, isRead: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            };
          }
          return state;
        });
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      },

      dismissNotification: (id: string) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const newNotifications = state.notifications.filter(n => n.id !== id);
          return {
            notifications: newNotifications,
            unreadCount: notification && !notification.isRead
              ? Math.max(0, state.unreadCount - 1)
              : state.unreadCount,
          };
        });
      },

      clearAllRead: () => {
        set((state) => ({
          notifications: state.notifications.filter(n => !n.isRead),
        }));
      },

      getNotificationsByType: (type: Notification['type']) => {
        return get().notifications.filter(n => n.type === type);
      },

      getNotificationsByPriority: (priority: Notification['priority']) => {
        return get().notifications.filter(n => n.priority === priority);
      },

      // Auto-trigger: FD Maturity Alert
      triggerFDMaturity: (fdId, bankName, amount, daysToMaturity) => {
        const priority: Notification['priority'] = daysToMaturity <= 3 ? 'critical' : daysToMaturity <= 7 ? 'high' : 'medium';
        get().addNotification({
          type: 'alert',
          priority,
          title: daysToMaturity === 0 ? 'FD Matures Today' : `FD Matures in ${daysToMaturity} Days`,
          description: `${fdId} (${bankName}, ${formatCurrency(amount)}) requires rollover or payout decision`,
          relatedEntityId: fdId,
          relatedEntityType: 'fd',
          actionUrl: '/maturity',
          actionLabel: 'Take Action',
        });
      },

      // Auto-trigger: FD Overdue
      triggerFDOverdue: (fdId, bankName, amount) => {
        get().addNotification({
          type: 'alert',
          priority: 'critical',
          title: 'FD Overdue - Immediate Action Required',
          description: `${fdId} (${bankName}, ${formatCurrency(amount)}) has matured and requires immediate payout or rollover`,
          relatedEntityId: fdId,
          relatedEntityType: 'fd',
          actionUrl: '/maturity',
          actionLabel: 'Process Now',
        });
      },

      // Auto-trigger: Rate Negotiation
      triggerRateNegotiation: (requestId, amount, status) => {
        const titles: Record<string, string> = {
          pending: 'Rate Negotiation Pending Approval',
          approved: 'Rate Negotiation Approved',
          rejected: 'Rate Negotiation Rejected',
        };
        get().addNotification({
          type: 'approval',
          priority: status === 'pending' ? 'high' : 'medium',
          title: titles[status],
          description: `Request ${requestId} (${formatCurrency(amount)}) - ${status}`,
          relatedEntityId: requestId,
          relatedEntityType: 'rateRequest',
          actionUrl: '/rate-negotiation',
          actionLabel: status === 'pending' ? 'Review' : 'View Details',
        });
      },

      // Auto-trigger: Accrual Complete
      triggerAccrualComplete: (period, amount) => {
        get().addNotification({
          type: 'system',
          priority: 'medium',
          title: 'Monthly Accrual Completed',
          description: `Accrual for ${period} completed: ${formatCurrency(amount)} interest accrued across all active FDs`,
          relatedEntityId: `acr-${period}`,
          relatedEntityType: 'accrual',
          actionUrl: '/accrual-engine',
          actionLabel: 'View Details',
        });
      },

      // Auto-trigger: FD Booked
      triggerFDBooked: (fdId, bankName, amount, rate) => {
        get().addNotification({
          type: 'fd_event',
          priority: 'medium',
          title: 'New FD Successfully Booked',
          description: `${fdId} created with ${bankName} for ${formatCurrency(amount)} @ ${rate}%`,
          relatedEntityId: fdId,
          relatedEntityType: 'fd',
          actionUrl: '/fd-master',
          actionLabel: 'View FD',
        });
      },

      // Auto-trigger: TDS Mismatch
      triggerTDSMismatch: (receiptId, bankName, variance) => {
        get().addNotification({
          type: 'compliance',
          priority: 'high',
          title: 'TDS Mismatch Detected',
          description: `Variance of ${formatCurrency(Math.abs(variance))} found in TDS for ${bankName} interest receipt`,
          relatedEntityId: receiptId,
          relatedEntityType: 'receipt',
          actionUrl: '/interest-receipts',
          actionLabel: 'Reconcile',
        });
      },

      // Auto-trigger: Policy Breach
      triggerPolicyBreach: (fdId, bankName, breachType) => {
        get().addNotification({
          type: 'alert',
          priority: 'critical',
          title: 'Investment Policy Breach',
          description: `${fdId} (${bankName}) - ${breachType}`,
          relatedEntityId: fdId,
          relatedEntityType: 'fd',
          actionUrl: '/fd-master',
          actionLabel: 'Review FD',
        });
      },

      // Auto-trigger: Interest Receipt
      triggerInterestReceipt: (fdId, bankName, amount) => {
        get().addNotification({
          type: 'fd_event',
          priority: 'low',
          title: 'Interest Credited',
          description: `${formatCurrency(amount)} credited for ${fdId} (${bankName})`,
          relatedEntityId: fdId,
          relatedEntityType: 'fd',
          actionUrl: '/interest-receipts',
          actionLabel: 'View Receipt',
        });
      },

      // Auto-trigger: Rollover Complete
      triggerRolloverComplete: (fdId, bankName, newRate) => {
        get().addNotification({
          type: 'fd_event',
          priority: 'medium',
          title: 'FD Rollover Completed',
          description: `${fdId} (${bankName}) successfully rolled over @ ${newRate}%`,
          relatedEntityId: fdId,
          relatedEntityType: 'fd',
          actionUrl: '/fd-master',
          actionLabel: 'View Details',
        });
      },

      // Auto-trigger: Period Close
      triggerPeriodClose: (period, status) => {
        const titles: Record<string, string> = {
          initiated: 'Period Close Initiated',
          completed: 'Period Close Completed',
          failed: 'Period Close Failed',
        };
        get().addNotification({
          type: 'system',
          priority: status === 'failed' ? 'high' : 'medium',
          title: titles[status],
          description: `${period} period close process ${status}`,
          relatedEntityId: `pc-${period}`,
          relatedEntityType: 'period',
          actionUrl: '/period-close',
          actionLabel: status === 'failed' ? 'View Errors' : 'View Details',
        });
      },

      // Auto-trigger: Bank Rate Update
      triggerBankRateUpdate: (bankName, oldRate, newRate) => {
        const change = newRate - oldRate;
        const direction = change > 0 ? 'increased' : 'decreased';
        get().addNotification({
          type: 'market',
          priority: 'low',
          title: 'Bank FD Rate Updated',
          description: `${bankName} ${direction} FD rates by ${Math.abs(change).toFixed(2)}% to ${newRate}%`,
          actionUrl: '/rate-negotiation',
          actionLabel: 'View Rates',
        });
      },

      // Auto-trigger: Approval Required
      triggerApprovalRequired: (requestType, requestId, amount) => {
        get().addNotification({
          type: 'approval',
          priority: 'high',
          title: 'Approval Required',
          description: `${requestType} ${requestId} (${formatCurrency(amount)}) awaiting your approval`,
          relatedEntityId: requestId,
          relatedEntityType: 'approval',
          actionUrl: '/admin',
          actionLabel: 'Review',
        });
      },

      // Auto-trigger: Compliance Alert
      triggerComplianceAlert: (alertType, description) => {
        get().addNotification({
          type: 'compliance',
          priority: 'high',
          title: alertType,
          description,
          actionUrl: '/reports',
          actionLabel: 'View Details',
        });
      },

      // Auto-trigger: Market Alert
      triggerMarketAlert: (asset, change, currentValue) => {
        const direction = change >= 0 ? 'up' : 'down';
        get().addNotification({
          type: 'market',
          priority: 'low',
          title: `${asset} ${direction === 'up' ? 'Surged' : 'Dropped'}`,
          description: `${asset} is ${direction} ${Math.abs(change).toFixed(2)}% at $${currentValue.toLocaleString()}`,
          actionUrl: '/markets',
          actionLabel: 'View Markets',
        });
      },

      // Auto-trigger: System Alert
      triggerSystemAlert: (alertType, message, priority = 'medium') => {
        get().addNotification({
          type: 'system',
          priority,
          title: alertType,
          description: message,
        });
      },

      // Request push notification permission
      requestPushPermission: async () => {
        if (!('Notification' in window)) {
          return false;
        }
        
        const permission = await Notification.requestPermission();
        const enabled = permission === 'granted';
        set({ pushEnabled: enabled });
        return enabled;
      },

      // Send push notification
      sendPushNotification: (title, body) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
          return;
        }
        
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      },
    }),
    {
      name: 'nyneos-notifications',
    }
  )
);
