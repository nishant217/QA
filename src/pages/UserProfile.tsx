import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Key,
  Smartphone,
  Globe,
  Moon,
  Sun,
  Bell,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore, useThemeStore, useFDStore, useTransactionStore, useNotificationStore } from '@/stores';
import { toast } from 'sonner';

export default function UserProfile() {
  const { currentUser, logout } = useAuthStore();
  const { theme, cycleTheme } = useThemeStore();
  const { fdMaster } = useFDStore();
  const { transactions } = useTransactionStore();
  const { notifications } = useNotificationStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    toast.success('Password updated successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleResetData = async () => {
    setIsResetting(true);
    // Simulate data reset
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Demo data reset to defaults');
    setIsResetting(false);
  };

  const stats = {
    fdsCreated: fdMaster.filter((fd) => fd.createdBy === currentUser?.id).length,
    transactions: transactions.filter((t) => t.createdBy === currentUser?.id).length,
    notifications: notifications.filter((n) => !n.isRead).length,
    loginHistory: 24,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Profile & Settings</h1>
        <p className="text-[var(--text-muted)]">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="card-surface p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{currentUser?.name.charAt(0)}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">{currentUser?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-[var(--text-muted)]" />
              <span className="text-[var(--text-muted)]">{currentUser?.email}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="badge-orange">{currentUser?.role.replace('_', ' ')}</span>
              <span className="text-sm text-[var(--text-muted)]">
                Member since {new Date(currentUser?.createdAt || '').toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-[var(--accent)]">{stats.fdsCreated}</p>
            <p className="text-sm text-[var(--text-muted)]">FDs Created</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-[var(--accent)]">{stats.transactions}</p>
            <p className="text-sm text-[var(--text-muted)]">Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-[var(--accent)]">{stats.notifications}</p>
            <p className="text-sm text-[var(--text-muted)]">Unread Notifications</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-mono font-bold text-[var(--accent)]">{stats.loginHistory}</p>
            <p className="text-sm text-[var(--text-muted)]">Logins (30d)</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Section */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <Key className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Security</h3>
              <p className="text-sm text-[var(--text-muted)]">Update your password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                  }
                  className="input-field w-full pr-10"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[var(--text-subtle)]" />
                  ) : (
                    <Eye className="w-4 h-4 text-[var(--text-subtle)]" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                className="input-field w-full"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="input-field w-full"
                placeholder="Confirm new password"
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              Update Password
            </button>
          </form>
        </div>

        {/* Preferences Section */}
        <div className="card-surface p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <Bell className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Preferences</h3>
              <p className="text-sm text-[var(--text-muted)]">Manage your notification settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Email Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, emailNotifications: !prev.emailNotifications }))
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.emailNotifications ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: preferences.emailNotifications ? 26 : 2 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[var(--text-muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Push Notifications</p>
                  <p className="text-xs text-[var(--text-muted)]">Receive push notifications</p>
                </div>
              </div>
              <button
                onClick={() =>
                  setPreferences((prev) => ({ ...prev, pushNotifications: !prev.pushNotifications }))
                }
                className={`w-12 h-6 rounded-full transition-colors ${
                  preferences.pushNotifications ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                }`}
              >
                <motion.div
                  className="w-5 h-5 rounded-full bg-white shadow-md"
                  animate={{ x: preferences.pushNotifications ? 26 : 2 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'light-orange' ? (
                  <Sun className="w-5 h-5 text-orange-500" />
                ) : theme === 'dark-teal' ? (
                  <Moon className="w-5 h-5 text-teal-500" />
                ) : (
                  <Moon className="w-5 h-5 text-orange-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Theme</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {theme === 'dark-orange' && 'Dark Orange'}
                    {theme === 'dark-teal' && 'Dark Red'}
                    {theme === 'light-orange' && 'Light Orange'}
                  </p>
                </div>
              </div>
              <button
                onClick={cycleTheme}
                className="px-3 py-1.5 bg-[var(--bg-hover)] text-[var(--text-muted)] text-sm rounded-lg hover:text-[var(--text-primary)] transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="card-surface p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
            <Globe className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Session Information</h3>
            <p className="text-sm text-[var(--text-muted)]">Current session details</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Login Time</p>
            <p className="font-mono text-[var(--text-primary)]">{new Date().toLocaleTimeString('en-IN')}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Session ID</p>
            <p className="font-mono text-xs text-[var(--text-primary)]">
              sess_{Math.random().toString(36).substr(2, 8)}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">IP Address</p>
            <p className="font-mono text-[var(--text-primary)]">192.168.1.100</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Last Activity</p>
            <p className="font-mono text-[var(--text-primary)]">Just now</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card-surface p-6 border-red-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-500">Danger Zone</h3>
            <p className="text-sm text-[var(--text-muted)]">Irreversible actions</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg">
          <div>
            <p className="font-medium text-[var(--text-primary)]">Reset Demo Data</p>
            <p className="text-sm text-[var(--text-muted)]">
              This will reset all data to default values. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
            {isResetting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
