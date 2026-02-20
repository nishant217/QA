import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  ExternalLink,
  Clock,
  AlertCircle,
  Info,
  TrendingUp,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
}

export function NotificationDropdown({ isOpen, onClose, unreadCount }: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    dismissNotification,
    clearAllRead
  } = useNotificationStore();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Close on Escape key
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, onClose]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'market':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'maturity':
      case 'schedule':
        return <Calendar className="w-4 h-4 text-orange-500" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) {
      return 'bg-[var(--bg-surface)] border-[var(--border)]';
    }
    
    switch (type) {
      case 'alert':
      case 'error':
        return 'bg-red-500/5 border-red-500/20 border-l-red-500';
      case 'success':
        return 'bg-green-500/5 border-green-500/20 border-l-green-500';
      case 'info':
        return 'bg-blue-500/5 border-blue-500/20 border-l-blue-500';
      case 'market':
        return 'bg-purple-500/5 border-purple-500/20 border-l-purple-500';
      case 'maturity':
      case 'schedule':
        return 'bg-orange-500/5 border-orange-500/20 border-l-orange-500';
      default:
        return 'bg-[var(--accent-glow)] border-[var(--border)] border-l-[var(--accent)]';
    }
  };

  const handleNotificationClick = (notificationId: string, actionUrl?: string) => {
    markAsRead(notificationId);
    if (actionUrl && actionUrl.startsWith('/')) {
      onClose();
    }
  };

  const recentNotifications = notifications
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-12 right-0 w-96 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-[var(--text-primary)]" />
              <h3 className="font-semibold text-[var(--text-primary)]">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={clearAllRead}
                className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                title="Clear all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      relative p-4 hover:bg-[var(--bg-hover)] transition-colors border-l-2
                      ${getNotificationColor(notification.type, notification.isRead)}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`
                            text-sm font-medium leading-tight
                            ${notification.isRead ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}
                          `}>
                            {notification.title}
                          </h4>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button
                              onClick={() => dismissNotification(notification.id)}
                              className="p-1 hover:bg-[var(--bg-surface)] rounded text-[var(--text-muted)] hover:text-red-500"
                              title="Delete notification"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        
                        <p className={`
                          text-xs mt-1 line-clamp-2
                          ${notification.isRead ? 'text-[var(--text-subtle)]' : 'text-[var(--text-muted)]'}
                        `}>
                          {notification.description}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-[var(--text-subtle)]">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          
                          {notification.actionUrl && (
                            <Link
                              to={notification.actionUrl}
                              onClick={() => handleNotificationClick(notification.id, notification.actionUrl)}
                              className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                            >
                              View
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                        
                        {!notification.isRead && (
                          <div className="absolute top-4 right-4 w-2 h-2 bg-[var(--accent)] rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-[var(--text-muted)]">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications</p>
                <p className="text-xs mt-1">You're all caught up!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {recentNotifications.length > 0 && (
            <div className="border-t border-[var(--border)] p-3">
              <Link
                to="/notifications"
                onClick={onClose}
                className="block w-full text-center text-sm text-[var(--accent)] hover:underline"
              >
                View all notifications
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default NotificationDropdown;