import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Users,
  Database,
  Settings,
  FileText,
  ToggleLeft,
  ToggleRight,
  Save,
  RotateCcw,
  Search,
  Download,
  Plus,
  Edit2,
  Trash2,
  Bug as BugIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuthStore, useConfigStore, useMasterStore, useAuditStore, useBugStore, PREDEFINED_BUGS, type Bug } from '@/stores';
import { toast } from 'sonner';

const TABS = [
  { id: 'flags', label: 'Feature Flags', icon: ToggleLeft },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'master', label: 'Master Data', icon: Database },
  { id: 'config', label: 'System Config', icon: Settings },
  { id: 'audit', label: 'Audit Viewer', icon: FileText },
  { id: 'bugs', label: 'QA Bug Injection', icon: BugIcon },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('flags');
  const { currentUser } = useAuthStore();
  const { featureFlags, toggleFeatureFlag, updateSystemSettings, systemSettings, resetToDefaults } =
    useConfigStore();
  const { banks, rateCards, addBank, updateBank } = useMasterStore();
  const { auditLog, exportAuditLog } = useAuditStore();
  const { bugs, activeBugs, injectBug, removeBug, removeAllBugs, toggleBug } = useBugStore();

  const handleToggleFlag = (flag: keyof typeof featureFlags) => {
    if (currentUser) {
      toggleFeatureFlag(flag, currentUser.id);
      toast.success(`Feature flag ${flag} ${featureFlags[flag] ? 'disabled' : 'enabled'}`);
    }
  };

  const handleResetDefaults = () => {
    if (currentUser) {
      resetToDefaults(currentUser.id);
      toast.success('Settings reset to defaults');
    }
  };

  const handleExportAudit = () => {
    const csv = exportAuditLog('csv');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Audit log exported');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Admin Panel</h1>
        <p className="text-[var(--text-muted)]">System administration and configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Feature Flags Tab */}
      {activeTab === 'flags' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Feature Flags</h3>
            <button
              onClick={handleResetDefaults}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(featureFlags).map(([key, value]) => (
              <div
                key={key}
                className="card-surface p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--text-primary)]">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {value ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleFlag(key as keyof typeof featureFlags)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    value ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 rounded-full bg-white shadow-md"
                    animate={{ x: value ? 26 : 2 }}
                    transition={{ duration: 0.2 }}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">User Management</h3>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </button>
          </div>

          <div className="card-surface overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Last Login</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="table-row">
                  <td className="p-3 text-[var(--text-primary)]">Arjun Sharma</td>
                  <td className="p-3 text-[var(--text-muted)]">admin@nyneos.com</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs">
                      System Admin
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                      Active
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">2 hours ago</td>
                  <td className="p-3 text-right">
                    <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
                      <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </td>
                </tr>
                <tr className="table-row">
                  <td className="p-3 text-[var(--text-primary)]">Priya Mehta</td>
                  <td className="p-3 text-[var(--text-muted)]">demo@nyneos.com</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs">
                      Treasury Dealer
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                      Active
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">5 minutes ago</td>
                  <td className="p-3 text-right">
                    <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
                      <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Master Data Tab */}
      {activeTab === 'master' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Banks</h3>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Bank
            </button>
          </div>

          <div className="card-surface overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">Bank Name</th>
                  <th className="text-left p-3">Short Name</th>
                  <th className="text-left p-3">IFSC Prefix</th>
                  <th className="text-right p-3">Max FD Amount</th>
                  <th className="text-left p-3">Rating</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banks.map((bank) => (
                  <tr key={bank.id} className="table-row">
                    <td className="p-3 text-[var(--text-primary)]">{bank.name}</td>
                    <td className="p-3 text-[var(--text-muted)]">{bank.shortName}</td>
                    <td className="p-3 font-mono text-[var(--text-muted)]">{bank.ifscPrefix}</td>
                    <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                      {bank.maxFDAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs">
                        {bank.creditRating || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          bank.isActive
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}
                      >
                        {bank.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
                        <Edit2 className="w-4 h-4 text-[var(--text-muted)]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* System Config Tab */}
      {activeTab === 'config' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">System Configuration</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-surface p-4">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Max FD Amount (₹)
              </label>
              <input
                type="number"
                value={systemSettings.maxFDAmount}
                onChange={(e) =>
                  currentUser &&
                  updateSystemSettings({ maxFDAmount: parseInt(e.target.value) }, currentUser.id)
                }
                className="input-field w-full"
              />
            </div>

            <div className="card-surface p-4">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Variance Threshold (₹)
              </label>
              <input
                type="number"
                value={systemSettings.varianceThreshold}
                onChange={(e) =>
                  currentUser &&
                  updateSystemSettings({ varianceThreshold: parseInt(e.target.value) }, currentUser.id)
                }
                className="input-field w-full"
              />
            </div>

            <div className="card-surface p-4">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                value={systemSettings.sessionTimeoutMins}
                onChange={(e) =>
                  currentUser &&
                  updateSystemSettings({ sessionTimeoutMins: parseInt(e.target.value) }, currentUser.id)
                }
                className="input-field w-full"
              />
            </div>

            <div className="card-surface p-4">
              <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                TDS Threshold Amount (₹)
              </label>
              <input
                type="number"
                value={systemSettings.tdsThresholdAmount}
                onChange={(e) =>
                  currentUser &&
                  updateSystemSettings({ tdsThresholdAmount: parseInt(e.target.value) }, currentUser.id)
                }
                className="input-field w-full"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Audit Viewer Tab */}
      {activeTab === 'audit' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Audit Log</h3>
            <button
              onClick={handleExportAudit}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          <div className="card-surface overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">Timestamp</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Entity Type</th>
                  <th className="text-left p-3">Entity ID</th>
                  <th className="text-left p-3">Reason</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.slice(0, 20).map((entry) => (
                  <tr key={entry.id} className="table-row">
                    <td className="p-3 text-[var(--text-muted)] text-sm">
                      {new Date(entry.timestamp).toLocaleString('en-IN')}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm text-[var(--text-primary)]">{entry.userEmail}</p>
                        <p className="text-xs text-[var(--text-muted)]">{entry.userRole}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full text-xs">
                        {entry.action}
                      </span>
                    </td>
                    <td className="p-3 text-[var(--text-muted)]">{entry.entityType}</td>
                    <td className="p-3 font-mono text-xs text-[var(--text-muted)]">{entry.entityId}</td>
                    <td className="p-3 text-[var(--text-muted)] text-sm">{entry.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* QA Bug Injection Tab */}
      {activeTab === 'bugs' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">QA Bug Injection System</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Inject predefined bugs for QA testing. Bugs are only visible to admin users.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {activeBugs.length > 0 && (
                <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-medium">
                  {activeBugs.length} Active
                </span>
              )}
              <button
                onClick={() => {
                  removeAllBugs();
                  toast.success('All bugs removed');
                }}
                disabled={activeBugs.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>

          {/* Active Bugs Alert */}
          {activeBugs.length > 0 && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">Bugs Currently Active</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">
                The following bugs are currently injected and affecting the application:
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {bugs.filter(b => b.isActive).map(bug => (
                  <span key={bug.id} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs">
                    {bug.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bug List */}
          <div className="grid grid-cols-1 gap-4">
            {bugs.map((bug) => (
              <div
                key={bug.id}
                className={`card-surface p-4 flex items-start justify-between transition-all ${
                  bug.isActive ? 'border-red-500/50 bg-red-500/5' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-medium ${bug.isActive ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                      {bug.name}
                    </h4>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        bug.severity === 'critical'
                          ? 'bg-red-500/20 text-red-500'
                          : bug.severity === 'high'
                          ? 'bg-orange-500/20 text-orange-500'
                          : bug.severity === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-blue-500/20 text-blue-500'
                      }`}
                    >
                      {bug.severity}
                    </span>
                    {bug.isActive && (
                      <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--text-muted)]">{bug.description}</p>
                  {bug.injectedAt && (
                    <p className="text-xs text-[var(--text-subtle)] mt-2">
                      Injected: {new Date(bug.injectedAt).toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    toggleBug(bug.id);
                    toast.success(bug.isActive ? 'Bug removed' : 'Bug injected');
                  }}
                  className={`ml-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bug.isActive
                      ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                  }`}
                >
                  {bug.isActive ? (
                    <span className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      Remove
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <BugIcon className="w-4 h-4" />
                      Inject
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
