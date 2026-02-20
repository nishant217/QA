import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Check,
  X,
  FileText,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState('queue');

  // Mock journal batches
  const journalBatches = [
    {
      id: 'JB-2026-001',
      period: '2026-02',
      description: 'February 2026 Interest Accrual',
      status: 'Posted',
      totalDebit: 1245678,
      totalCredit: 1245678,
      entries: 15,
      createdAt: '2026-02-28',
    },
    {
      id: 'JB-2026-002',
      period: '2026-02',
      description: 'TDS Adjustments',
      status: 'Ready',
      totalDebit: 45678,
      totalCredit: 45678,
      entries: 3,
      createdAt: '2026-02-27',
    },
    {
      id: 'JB-2026-003',
      period: '2026-02',
      description: 'Bank Charges',
      status: 'Draft',
      totalDebit: 2500,
      totalCredit: 2500,
      entries: 1,
      createdAt: '2026-02-26',
    },
  ];

  // Mock approval queue
  const approvalQueue = [
    {
      id: 'APR-001',
      type: 'Journal Batch',
      reference: 'JB-2026-002',
      description: 'TDS Adjustments',
      amount: 45678,
      requestedBy: 'Priya Mehta',
      requestedAt: '2026-02-27',
    },
    {
      id: 'APR-002',
      type: 'Rate Request',
      reference: 'RR-2026-003',
      description: 'Rate negotiation for ₹5 Cr',
      amount: 50000000,
      requestedBy: 'Priya Mehta',
      requestedAt: '2026-02-25',
    },
  ];

  const handleApprove = (id: string) => {
    toast.success(`Approved ${id}`);
  };

  const handleReject = (id: string) => {
    toast.error(`Rejected ${id}`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Accounting Workbench</h1>
          <p className="text-[var(--text-muted)]">Journal entries and approval queue</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Journal Batches</p>
              <p className="text-xl font-mono font-bold text-[var(--accent)]">{journalBatches.length}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Pending Approval</p>
              <p className="text-xl font-mono font-bold text-yellow-500">{approvalQueue.length}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Posted Today</p>
              <p className="text-xl font-mono font-bold text-green-500">3</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total Value</p>
              <p className="text-xl font-mono font-bold text-blue-500">₹1.29Cr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {[
          { id: 'queue', label: 'Approval Queue' },
          { id: 'journals', label: 'Journal Batches' },
          { id: 'entries', label: 'GL Entries' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Approval Queue */}
      {activeTab === 'queue' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pending Approvals</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Reference</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Requested By</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvalQueue.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="p-3 font-mono text-[var(--accent)]">{item.id}</td>
                  <td className="p-3 text-[var(--text-primary)]">{item.type}</td>
                  <td className="p-3 text-[var(--text-muted)]">{item.reference}</td>
                  <td className="p-3 text-[var(--text-primary)]">{item.description}</td>
                  <td className="p-3 text-right font-mono text-[var(--accent)]">
                    {formatCurrency(item.amount)}
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{item.requestedBy}</td>
                  <td className="p-3 text-[var(--text-muted)]">{formatDate(item.requestedAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="p-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Journal Batches */}
      {activeTab === 'journals' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Journal Batches</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Batch ID</th>
                <th className="text-left p-3">Period</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Debit</th>
                <th className="text-right p-3">Credit</th>
                <th className="text-right p-3">Entries</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {journalBatches.map((batch) => (
                <tr key={batch.id} className="table-row">
                  <td className="p-3 font-mono text-[var(--accent)]">{batch.id}</td>
                  <td className="p-3 text-[var(--text-primary)]">{batch.period}</td>
                  <td className="p-3 text-[var(--text-primary)]">{batch.description}</td>
                  <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(batch.totalDebit)}
                  </td>
                  <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(batch.totalCredit)}
                  </td>
                  <td className="p-3 text-right font-mono text-[var(--text-muted)]">{batch.entries}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        batch.status === 'Posted'
                          ? 'bg-green-500/20 text-green-500'
                          : batch.status === 'Ready'
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-gray-500/20 text-gray-500'
                      }`}
                    >
                      {batch.status}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{formatDate(batch.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* GL Entries */}
      {activeTab === 'entries' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">General Ledger Entries</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Date</th>
                <th className="text-left p-3">Account Code</th>
                <th className="text-left p-3">Account Name</th>
                <th className="text-left p-3">Description</th>
                <th className="text-right p-3">Debit</th>
                <th className="text-right p-3">Credit</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td className="p-3 text-[var(--text-muted)]">2026-02-28</td>
                <td className="p-3 font-mono text-[var(--text-primary)]">1001001</td>
                <td className="p-3 text-[var(--text-primary)]">Fixed Deposits - HDFC</td>
                <td className="p-3 text-[var(--text-muted)]">Interest accrual</td>
                <td className="p-3 text-right font-mono text-[var(--accent)]">₹1,25,000</td>
                <td className="p-3 text-right font-mono text-[var(--text-muted)]">-</td>
              </tr>
              <tr className="table-row">
                <td className="p-3 text-[var(--text-muted)]">2026-02-28</td>
                <td className="p-3 font-mono text-[var(--text-primary)]">4001001</td>
                <td className="p-3 text-[var(--text-primary)]">Interest Income - FD</td>
                <td className="p-3 text-[var(--text-muted)]">Interest accrual</td>
                <td className="p-3 text-right font-mono text-[var(--text-muted)]">-</td>
                <td className="p-3 text-right font-mono text-green-500">₹1,12,500</td>
              </tr>
              <tr className="table-row">
                <td className="p-3 text-[var(--text-muted)]">2026-02-28</td>
                <td className="p-3 font-mono text-[var(--text-primary)]">2001001</td>
                <td className="p-3 text-[var(--text-primary)]">TDS Receivable</td>
                <td className="p-3 text-[var(--text-muted)]">TDS on interest</td>
                <td className="p-3 text-right font-mono text-[var(--text-muted)]">-</td>
                <td className="p-3 text-right font-mono text-red-500">₹12,500</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
