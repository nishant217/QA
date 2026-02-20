import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  RefreshCw,
  Wallet,
  AlertTriangle,
  Check,
  X,
  Building2,
  TrendingUp,
  ArrowRight,
  FileText,
  Download,
} from 'lucide-react';
import { useFDStore } from '@/stores';
import { formatCurrency, formatDate, getDaysToMaturity } from '@/lib/utils';
import { toast } from 'sonner';

export default function MaturityRollover() {
  const { fdMaster, getMaturingFDs } = useFDStore();
  const [selectedAction, setSelectedAction] = useState<'payout' | 'rollover' | 'preclose'>('payout');

  const maturing7Days = getMaturingFDs(7);
  const maturing30Days = getMaturingFDs(30);
  const maturedFDs = fdMaster.filter((fd) => fd.status === 'Matured');

  const handleAction = (fdId: string, action: string) => {
    toast.success(`${action} initiated for FD`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Maturity & Rollover</h1>
          <p className="text-[var(--text-muted)]">Manage FD maturities and rollover options</p>
        </div>
      </div>

      {/* Critical Alerts */}
      {maturing7Days.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-red-500 font-medium">
              {maturing7Days.length} FDs maturing within 7 days require immediate action
            </p>
            <p className="text-sm text-red-500/80">
              Total value: {formatCurrency(maturing7Days.reduce((sum, fd) => sum + fd.principal, 0))}
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Maturing (7 days)</p>
              <p className="text-xl font-mono font-bold text-red-500">{maturing7Days.length}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Maturing (30 days)</p>
              <p className="text-xl font-mono font-bold text-orange-500">{maturing30Days.length}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Matured (Pending)</p>
              <p className="text-xl font-mono font-bold text-blue-500">{maturedFDs.length}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Rollover Rate</p>
              <p className="text-xl font-mono font-bold text-green-500">68%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'payout', label: 'Payout to Account', icon: Wallet, desc: 'Transfer maturity amount to bank account' },
          { id: 'rollover', label: 'Rollover FD', icon: RefreshCw, desc: 'Reinvest principal with new terms' },
          { id: 'preclose', label: 'Pre-mature Closure', icon: X, desc: 'Close FD before maturity date' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id as any)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedAction === action.id
                  ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                  : 'border-[var(--border)] hover:border-[var(--border-hover)]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-[var(--accent)]" />
                <span className="font-medium text-[var(--text-primary)]">{action.label}</span>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{action.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Maturing FDs Table */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Maturing FDs</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3">FD Reference</th>
              <th className="text-left p-3">Bank</th>
              <th className="text-right p-3">Principal</th>
              <th className="text-right p-3">Maturity Amount</th>
              <th className="text-left p-3">Maturity Date</th>
              <th className="text-right p-3">Days Left</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {maturing30Days.map((fd) => {
              const daysLeft = getDaysToMaturity(fd.maturityDate);
              return (
                <tr key={fd.id} className="table-row">
                  <td className="p-3 font-mono text-[var(--accent)]">{fd.referenceNumber}</td>
                  <td className="p-3 text-[var(--text-primary)]">{fd.bankName}</td>
                  <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(fd.principal)}
                  </td>
                  <td className="p-3 text-right font-mono text-[var(--accent)]">
                    {formatCurrency(fd.maturityAmount || 0)}
                  </td>
                  <td className="p-3 text-[var(--text-primary)]">{formatDate(fd.maturityDate)}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`font-mono ${
                        daysLeft <= 7 ? 'text-red-500' : daysLeft <= 30 ? 'text-orange-500' : 'text-[var(--text-muted)]'
                      }`}
                    >
                      {daysLeft} days
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(fd.id, 'Payout')}
                        className="px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded text-sm hover:border-[var(--accent)]"
                      >
                        Payout
                      </button>
                      <button
                        onClick={() => handleAction(fd.id, 'Rollover')}
                        className="px-3 py-1 bg-[var(--accent-glow)] text-[var(--accent)] rounded text-sm"
                      >
                        Rollover
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Matured FDs */}
      {maturedFDs.length > 0 && (
        <div className="card-surface overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Matured FDs (Action Required)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">FD Reference</th>
                <th className="text-left p-3">Bank</th>
                <th className="text-right p-3">Maturity Amount</th>
                <th className="text-left p-3">Matured On</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {maturedFDs.map((fd) => (
                <tr key={fd.id} className="table-row">
                  <td className="p-3 font-mono text-[var(--accent)]">{fd.referenceNumber}</td>
                  <td className="p-3 text-[var(--text-primary)]">{fd.bankName}</td>
                  <td className="p-3 text-right font-mono text-[var(--accent)]">
                    {formatCurrency(fd.maturityAmount || 0)}
                  </td>
                  <td className="p-3 text-[var(--text-primary)]">{formatDate(fd.maturityDate)}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">Pending Action</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(fd.id, 'Payout')}
                        className="px-3 py-1 bg-green-500/20 text-green-500 rounded text-sm"
                      >
                        Process Payout
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Closure Certificate */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Closure Certificates</h3>
            <p className="text-sm text-[var(--text-muted)]">Download closure certificates for completed transactions</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]">
            <FileText className="w-4 h-4" />
            View All
          </button>
        </div>
      </div>
    </div>
  );
}
