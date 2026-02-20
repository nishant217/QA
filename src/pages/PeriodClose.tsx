import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Check,
  X,
  Calendar,
  FileText,
  Download,
  AlertCircle,
  TrendingUp,
  Building2,
  Wallet,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

export default function PeriodClose() {
  const [selectedPeriod, setSelectedPeriod] = useState('2026-02');
  const [isClosing, setIsClosing] = useState(false);

  const checklist = [
    { id: 1, task: 'All FD bookings approved and posted', category: 'FD Management', completed: true },
    { id: 2, task: 'Interest accruals calculated and posted', category: 'Accruals', completed: true },
    { id: 3, task: 'Interest receipts reconciled', category: 'Reconciliation', completed: true },
    { id: 4, task: 'TDS entries verified', category: 'Compliance', completed: false },
    { id: 5, task: 'Maturity actions processed', category: 'Operations', completed: true },
    { id: 6, task: 'Rate negotiations closed', category: 'Rates', completed: true },
    { id: 7, task: 'Journal entries posted to GL', category: 'Accounting', completed: false },
    { id: 8, task: 'Bank reconciliations completed', category: 'Reconciliation', completed: true },
    { id: 9, task: 'Variance analysis reviewed', category: 'Analytics', completed: false },
    { id: 10, task: 'Audit trail verified', category: 'Compliance', completed: true },
  ];

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = (completedCount / checklist.length) * 100;

  const handleClosePeriod = async () => {
    if (completedCount < checklist.length) {
      toast.error('Please complete all checklist items before closing the period');
      return;
    }

    setIsClosing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success(`Period ${selectedPeriod} closed successfully`);
    setIsClosing(false);
  };

  const handleDownloadEvidence = () => {
    toast.success('Evidence pack downloaded');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Period Close</h1>
          <p className="text-[var(--text-muted)]">Month-end closing process and checklist</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadEvidence}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
          >
            <Download className="w-4 h-4" />
            Evidence Pack
          </button>
        </div>
      </div>

      {/* Period Selection */}
      <div className="card-surface p-6">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Period</label>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">Status</label>
            <span className="px-3 py-2 bg-yellow-500/20 text-yellow-500 rounded-lg text-sm">In Progress</span>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleClosePeriod}
              disabled={isClosing || completedCount < checklist.length}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isClosing ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isClosing ? 'Closing...' : 'Close Period'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Close Readiness</h3>
          <span className="text-[var(--accent)] font-mono">{completedCount}/{checklist.length} completed</span>
        </div>
        <div className="h-4 bg-[var(--bg-surface)] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-sm text-[var(--text-muted)] mt-2">{progress.toFixed(0)}% complete</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Completed</p>
              <p className="text-xl font-mono font-bold text-green-500">{completedCount}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Pending</p>
              <p className="text-xl font-mono font-bold text-yellow-500">{checklist.length - completedCount}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">FDs Active</p>
              <p className="text-xl font-mono font-bold text-[var(--accent)]">13</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Interest Accrued</p>
              <p className="text-xl font-mono font-bold text-blue-500">₹12.45L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Close Checklist</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {checklist.map((item) => (
            <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-[var(--bg-hover)]">
              <button
                onClick={() => {}}
                className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                  item.completed
                    ? 'bg-green-500 border-green-500'
                    : 'border-[var(--border)] hover:border-[var(--accent)]'
                }`}
              >
                {item.completed && <Check className="w-4 h-4 text-white" />}
              </button>
              <div className="flex-1">
                <p className={`${item.completed ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-primary)]'}`}>
                  {item.task}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{item.category}</p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  item.completed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}
              >
                {item.completed ? 'Done' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Documents */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Evidence Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'FD Portfolio Report', type: 'PDF', size: '2.4 MB' },
            { name: 'Interest Accrual Summary', type: 'Excel', size: '856 KB' },
            { name: 'TDS Register', type: 'PDF', size: '1.2 MB' },
            { name: 'Bank Reconciliation', type: 'Excel', size: '1.5 MB' },
            { name: 'Journal Entries', type: 'PDF', size: '3.1 MB' },
            { name: 'Audit Trail', type: 'Excel', size: '4.8 MB' },
          ].map((doc, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-[var(--bg-surface)] rounded-lg">
              <FileText className="w-8 h-8 text-[var(--accent)]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{doc.name}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {doc.type} • {doc.size}
                </p>
              </div>
              <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
                <Download className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
