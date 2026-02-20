import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  Trash2,
  Filter,
  AlertCircle,
  Info,
  Shield,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { useNotificationStore } from '@/stores';
import { useNavigate } from 'react-router-dom';
import { getRelativeTime, getPriorityColor, getStatusColor } from '@/lib/utils';
import { toast } from 'sonner';

const NOTIFICATION_TYPES = [
  { value: 'all', label: 'All', icon: Bell },
  { value: 'alert', label: 'Alerts', icon: AlertCircle },
  { value: 'system', label: 'System', icon: Info },
  { value: 'compliance', label: 'Compliance', icon: Shield },
  { value: 'market', label: 'Market', icon: TrendingUp },
  { value: 'approval', label: 'Approvals', icon: FileText },
  { value: 'fd_event', label: 'FD Events', icon: CheckCircle },
];

const PRIORITIES = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllRead,
  } = useNotificationStore();

  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((n) => {
    if (selectedType !== 'all' && n.type !== selectedType) return false;
    if (selectedPriority !== 'all' && n.priority !== selectedPriority) return false;
    return true;
  });

  const stats = {
    total: notifications.length,
    unread: unreadCount,
    critical: notifications.filter((n) => n.priority === 'critical' && !n.isRead).length,
    thisWeek: notifications.filter((n) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(n.timestamp) >= weekAgo;
    }).length,
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return AlertCircle;
      case 'system':
        return Info;
      case 'compliance':
        return Shield;
      case 'market':
        return TrendingUp;
      case 'approval':
        return FileText;
      case 'fd_event':
        return CheckCircle;
      default:
        return Bell;
    }
  };

  const handleSimulateAlert = () => {
    const alerts = [
      { type: 'alert', priority: 'high', title: 'FD Maturity Alert', description: 'FD-2026-XXX matures in 3 days' },
      { type: 'system', priority: 'medium', title: 'Backup Completed', description: 'Daily backup completed successfully' },
      { type: 'compliance', priority: 'critical', title: 'TDS Mismatch', description: 'Variance detected in TDS calculation' },
    ];
    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    toast.info('Simulated: ' + randomAlert.title);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notifications</h1>
          <p className="text-[var(--text-muted)]">Manage your notifications and alerts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateAlert}
            className="px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg text-sm hover:border-[var(--accent)]"
          >
            Simulate Alert
          </button>
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm">Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <p className="text-sm text-[var(--text-muted)]">Total</p>
          <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">{stats.total}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm text-[var(--text-muted)]">Unread</p>
          <p className="text-2xl font-mono font-bold text-[var(--accent)]">{stats.unread}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm text-[var(--text-muted)]">Critical</p>
          <p className="text-2xl font-mono font-bold text-red-500">{stats.critical}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm text-[var(--text-muted)]">This Week</p>
          <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">{stats.thisWeek}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-muted)]">Filter by:</span>
          </div>

          <div className="flex gap-2">
            {NOTIFICATION_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    selectedType === type.value
                      ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="input-field"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <button
            onClick={clearAllRead}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-500/10 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
            Clear Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="card-surface p-12 text-center">
            <Bell className="w-12 h-12 text-[var(--text-subtle)] mx-auto mb-4" />
            <p className="text-[var(--text-muted)]">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getTypeIcon(notification.type);
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card-surface p-4 border-l-4 ${
                  notification.isRead ? 'border-l-transparent' : getPriorityColor(notification.priority)
                } ${!notification.isRead ? 'notification-unread' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.type === 'alert'
                        ? 'bg-red-500/20'
                        : notification.type === 'system'
                        ? 'bg-blue-500/20'
                        : notification.type === 'compliance'
                        ? 'bg-purple-500/20'
                        : notification.type === 'market'
                        ? 'bg-green-500/20'
                        : notification.type === 'approval'
                        ? 'bg-yellow-500/20'
                        : 'bg-[var(--accent-glow)]'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        notification.type === 'alert'
                          ? 'text-red-500'
                          : notification.type === 'system'
                          ? 'text-blue-500'
                          : notification.type === 'compliance'
                          ? 'text-purple-500'
                          : notification.type === 'market'
                          ? 'text-green-500'
                          : notification.type === 'approval'
                          ? 'text-yellow-500'
                          : 'text-[var(--accent)]'
                      }`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`font-medium ${
                          notification.isRead ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)] font-semibold'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mb-2">{notification.description}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-[var(--text-subtle)]">
                        {getRelativeTime(notification.timestamp)}
                      </span>
                      {notification.actionUrl && (
                        <button
                          // CHANGE: use React Router navigation for internal links to keep SPA behavior
                          onClick={() => {
                            markAsRead(notification.id);
                            const url = notification.actionUrl!;
                            try {
                              // If it's an absolute external URL, fall back to full navigation
                              const isExternal = /^(https?:)?\/\//.test(url);
                              if (isExternal) {
                                window.location.href = url;
                              } else {
                                // internal route — use navigate() to avoid full page reload
                                navigate(url);
                              }
                            } catch (e) {
                              // fallback
                              window.location.href = notification.actionUrl!;
                            }
                          }}
                          className="text-xs text-[var(--accent)] hover:underline"
                        >
                          {notification.actionLabel || 'View'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                    )}
                    <button
                      onClick={() => dismissNotification(notification.id)}
                      className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
                      title="Dismiss"
                    >
                      <Trash2 className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
