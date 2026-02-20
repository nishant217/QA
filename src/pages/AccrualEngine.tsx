import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Check,
  FileText,
  Download,
  TrendingUp,
  Building2,
  AlertCircle,
  Settings,
  Percent,
  Eye,
  Archive,
  XCircle,
} from 'lucide-react';
import { useFDStore, useAccrualStore, useNotificationStore, useAuthStore } from '@/stores';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

export default function AccrualEngine() {
  const { fdMaster } = useFDStore();
  const { 
    currentRun,
    isCalculating,
    createAccrualRun,
    calculateAccruals,
    finalizeRun,
    cancelRun,
    generateJournalEntries,
    getActiveRuns,
    getCompletedRuns 
  } = useAccrualStore();
  const { triggerAccrualComplete } = useNotificationStore();
  const { currentUser } = useAuthStore();

  const [selectedPeriodFrom, setSelectedPeriodFrom] = useState('2024-02-01');
  const [selectedPeriodTo, setSelectedPeriodTo] = useState('2024-02-29');
  const [runType, setRunType] = useState<'SIMULATION' | 'FINAL'>('SIMULATION');
  const [showJournalPreview, setShowJournalPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');

  const activeFDs = fdMaster.filter((fd) => fd.status === 'Active' || fd.status === 'Near Maturity');
  const activeRuns = getActiveRuns();
  const completedRuns = getCompletedRuns();

  const handleCreateRun = async () => {
    if (!selectedPeriodFrom || !selectedPeriodTo) {
      toast.error('Please select both from and to dates');
      return;
    }

    if (new Date(selectedPeriodFrom) >= new Date(selectedPeriodTo)) {
      toast.error('From date must be before to date');
      return;
    }

    const runId = createAccrualRun(selectedPeriodFrom, selectedPeriodTo, runType);
    toast.success(`${runType === 'SIMULATION' ? 'Simulation' : 'Final run'} created`);
    
    // Start calculation immediately
    await calculateAccruals(runId, activeFDs);
    toast.success('Accrual calculation completed');
    
    // Show journal preview after calculation
    setShowJournalPreview(true);
    
    // Trigger notification for final runs
    if (runType === 'FINAL') {
      const run = useAccrualStore.getState().getRunById(runId);
      if (run) {
        triggerAccrualComplete(
          `${run.periodFrom} to ${run.periodTo}`,
          run.totalInterest
        );
      }
    }
  };

  const handleFinalize = () => {
    if (!currentRun || !currentUser) return;
    
    finalizeRun(currentRun.id, currentUser.id);
    toast.success('Accrual run finalized and posted to GL');
    setShowJournalPreview(false);
  };

  const handleCancel = () => {
    if (!currentRun) return;
    
    cancelRun(currentRun.id, 'Cancelled by user');
    toast.success('Accrual run cancelled');
    setShowJournalPreview(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'text-yellow-500 bg-yellow-500/20';
      case 'COMPLETED': return 'text-blue-500 bg-blue-500/20';
      case 'POSTED': return 'text-green-500 bg-green-500/20';
      case 'CANCELLED': return 'text-red-500 bg-red-500/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const currentJournal = currentRun ? generateJournalEntries(currentRun.id) : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Accrual Engine</h1>
          <p className="text-[var(--text-muted)]">Calculate and post interest accruals with precision</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab(activeTab === 'current' ? 'history' : 'current')}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
          >
            {activeTab === 'current' ? <Archive className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {activeTab === 'current' ? 'View History' : 'Current Run'}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'current' ? (
              <motion.div
                key="current"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Period Configuration */}
                <div className="card-surface p-6">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Accrual Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        Period From
                      </label>
                      <input
                        type="date"
                        value={selectedPeriodFrom}
                        onChange={(e) => setSelectedPeriodFrom(e.target.value)}
                        className="input-field"
                        disabled={isCalculating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        Period To
                      </label>
                      <input
                        type="date"
                        value={selectedPeriodTo}
                        onChange={(e) => setSelectedPeriodTo(e.target.value)}
                        className="input-field"
                        disabled={isCalculating}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                        Run Type
                      </label>
                      <select 
                        value={runType}
                        onChange={(e) => setRunType(e.target.value as 'SIMULATION' | 'FINAL')}
                        className="input-field"
                        disabled={isCalculating}
                      >
                        <option value="SIMULATION">Simulation</option>
                        <option value="FINAL">Final Run</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={handleCreateRun}
                        disabled={isCalculating}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 w-full"
                      >
                        {isCalculating ? (
                          <motion.div
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                        ) : (
                          <Calculator className="w-4 h-4" />
                        )}
                        {isCalculating ? 'Calculating...' : 'Calculate'}
                      </button>
                    </div>
                  </div>

                  {/* Active FDs Summary */}
                  <div className="mt-4 p-4 bg-[var(--bg-surface)] rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">Active FDs to Process:</span>
                      <span className="font-medium text-[var(--text-primary)]">{activeFDs.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--text-muted)]">Total Principal:</span>
                      <span className="font-mono text-[var(--accent)]">
                        {formatCurrency(activeFDs.reduce((sum, fd) => sum + fd.principal, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Current Run Results */}
                {currentRun && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="card-surface p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">FDs Processed</p>
                            <p className="text-xl font-bold text-blue-500">{currentRun.totalFDs}</p>
                          </div>
                        </div>
                      </div>
                      <div className="card-surface p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">Interest</p>
                            <p className="text-lg font-mono font-bold text-[var(--accent)]">
                              {formatCurrency(currentRun.totalInterest)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-surface p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">TDS</p>
                            <p className="text-lg font-mono font-bold text-red-500">
                              {formatCurrency(currentRun.totalTDS)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="card-surface p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-green-500" />
                          </div>
                          <div>
                            <p className="text-sm text-[var(--text-muted)]">Net</p>
                            <p className="text-lg font-mono font-bold text-green-500">
                              {formatCurrency(currentRun.totalNet)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {currentRun.status === 'COMPLETED' && (
                      <div className="flex items-center gap-3">
                        {runType === 'FINAL' && (
                          <button
                            onClick={handleFinalize}
                            className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                          >
                            <Check className="w-4 h-4" />
                            Finalize & Post to GL
                          </button>
                        )}
                        <button
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Run
                        </button>
                        <button
                          onClick={() => setShowJournalPreview(!showJournalPreview)}
                          className="flex items-center gap-2 px-4 py-3 border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
                        >
                          <Eye className="w-4 h-4" />
                          {showJournalPreview ? 'Hide' : 'Preview'} Journal
                        </button>
                      </div>
                    )}

                    {/* Accrual Details */}
                    <div className="card-surface overflow-hidden">
                      <div className="p-4 border-b border-[var(--border)]">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                          Accrual Details - {currentRun.runType} Run
                        </h3>
                        <p className="text-sm text-[var(--text-muted)]">
                          Period: {new Date(currentRun.periodFrom).toLocaleDateString()} - {new Date(currentRun.periodTo).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="table-header">
                              <th className="text-left p-3">FD Reference</th>
                              <th className="text-left p-3">Bank</th>
                              <th className="text-right p-3">Principal</th>
                              <th className="text-right p-3">Rate</th>
                              <th className="text-right p-3">Days</th>
                              <th className="text-right p-3">Type</th>
                              <th className="text-right p-3">Interest</th>
                              <th className="text-right p-3">TDS</th>
                              <th className="text-right p-3">Net</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentRun.entries.map((entry) => (
                              <tr key={entry.id} className="table-row">
                                <td className="p-3 font-mono text-[var(--accent)]">{entry.fdRef}</td>
                                <td className="p-3 text-[var(--text-primary)]">{entry.bankName}</td>
                                <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                                  {formatCurrency(entry.principal)}
                                </td>
                                <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                                  {entry.interestRate}%
                                </td>
                                <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                                  {entry.daysAccrued}
                                </td>
                                <td className="p-3 text-right text-xs">
                                  <span className={`px-2 py-1 rounded-full ${entry.isCompound ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    {entry.isCompound ? 'Compound' : 'Simple'}
                                  </span>
                                </td>
                                <td className="p-3 text-right font-mono text-[var(--accent)]">
                                  {formatCurrency(entry.interestAccrued)}
                                </td>
                                <td className="p-3 text-right font-mono text-red-500">
                                  {formatCurrency(entry.tdsAmount)}
                                </td>
                                <td className="p-3 text-right font-mono text-green-500">
                                  {formatCurrency(entry.netInterest)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Run History */}
                <div className="card-surface">
                  <div className="p-4 border-b border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Accrual Run History</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="table-header">
                          <th className="text-left p-3">Run ID</th>
                          <th className="text-left p-3">Period</th>
                          <th className="text-left p-3">Type</th>
                          <th className="text-left p-3">Status</th>
                          <th className="text-right p-3">FDs</th>
                          <th className="text-right p-3">Interest</th>
                          <th className="text-right p-3">Net</th>
                          <th className="text-left p-3">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...activeRuns, ...completedRuns]
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .map((run) => (
                          <tr key={run.id} className="table-row">
                            <td className="p-3 font-mono text-[var(--accent)]">
                              {run.id.split('-').slice(-1)[0]}
                            </td>
                            <td className="p-3 text-[var(--text-primary)]">
                              {new Date(run.periodFrom).toLocaleDateString()} - {new Date(run.periodTo).toLocaleDateString()}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${run.runType === 'FINAL' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                {run.runType}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(run.status)}`}>
                                {run.status}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono">{run.totalFDs}</td>
                            <td className="p-3 text-right font-mono text-[var(--accent)]">
                              {formatCurrency(run.totalInterest)}
                            </td>
                            <td className="p-3 text-right font-mono text-green-500">
                              {formatCurrency(run.totalNet)}
                            </td>
                            <td className="p-3 text-sm text-[var(--text-muted)]">
                              {new Date(run.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar - Quick Stats */}
        <div className="space-y-4">
          <div className="card-surface p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Bank Exposure
            </h4>
            <div className="space-y-2">
              {Object.entries(
                activeFDs.reduce((banks, fd) => {
                  banks[fd.bankName] = (banks[fd.bankName] || 0) + fd.principal;
                  return banks;
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([bank, amount]) => (
                <div key={bank} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)] truncate">{bank}</span>
                  <span className="font-mono text-[var(--text-primary)]">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-surface p-4">
            <h4 className="font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Rate Distribution
            </h4>
            <div className="space-y-2">
              {Object.entries(
                activeFDs.reduce((rates, fd) => {
                  const rate = `${fd.interestRate}%`;
                  rates[rate] = (rates[rate] || 0) + 1;
                  return rates;
                }, {} as Record<string, number>)
              )
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([rate, count]) => (
                <div key={rate} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">{rate}</span>
                  <span className="text-[var(--text-primary)]">{count} FDs</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Journal Preview Modal/Section */}
      <AnimatePresence>
        {showJournalPreview && currentRun && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="card-surface p-6"
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Journal Entry Preview - {currentRun.runType} Run
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="text-left p-3">Account Code</th>
                    <th className="text-left p-3">Account Name</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Debit</th>
                    <th className="text-right p-3">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {currentJournal.map((entry) => (
                    <tr key={entry.id} className="table-row">
                      <td className="p-3 font-mono text-[var(--text-primary)]">{entry.accountCode}</td>
                      <td className="p-3 text-[var(--text-primary)]">{entry.accountName}</td>
                      <td className="p-3 text-[var(--text-muted)]">{entry.description}</td>
                      <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                        {entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                        {entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[var(--bg-surface)]">
                  <tr>
                    <td colSpan={3} className="p-3 text-right font-semibold text-[var(--text-primary)]">
                      Total
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[var(--text-primary)]">
                      {formatCurrency(currentJournal.reduce((sum, entry) => sum + entry.debitAmount, 0))}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-[var(--text-primary)]">
                      {formatCurrency(currentJournal.reduce((sum, entry) => sum + entry.creditAmount, 0))}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}