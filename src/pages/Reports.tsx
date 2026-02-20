import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Building2,
  Wallet,
  AlertCircle,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useFDStore, useMasterStore } from '@/stores';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

const REPORT_TYPES = [
  {
    id: 'portfolio',
    name: 'FD Portfolio Report',
    description: 'Complete overview of all fixed deposits',
    icon: Wallet,
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 'accrual',
    name: 'Interest Accrual Report',
    description: 'Monthly interest accrual summary',
    icon: TrendingUp,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'receipts',
    name: 'Interest Receipt & Reconciliation',
    description: 'Receipt matching and variance analysis',
    icon: Check,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'tds',
    name: 'TDS Register Report',
    description: 'TDS deductions and compliance',
    icon: FileText,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'maturity',
    name: 'Maturity Ladder',
    description: 'Upcoming maturities by month',
    icon: Calendar,
    formats: ['PDF', 'Excel', 'CSV'],
  },
  {
    id: 'cashflow',
    name: 'Cash Flow Schedule',
    description: 'Projected interest and principal flows',
    icon: BarChart3,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'variance',
    name: 'Variance & Exception Report',
    description: 'Reconciliation exceptions and variances',
    icon: AlertCircle,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'exposure',
    name: 'Bank Exposure Report',
    description: 'Concentration risk by bank',
    icon: Building2,
    formats: ['PDF', 'Excel'],
  },
  {
    id: 'evidence',
    name: 'Period Close Evidence Pack',
    description: 'Complete evidence for audit',
    icon: FileText,
    formats: ['ZIP'],
  },
  {
    id: 'audit',
    name: 'Audit Trail Report',
    description: 'Complete system audit log',
    icon: FileText,
    formats: ['PDF', 'Excel', 'CSV'],
  },
];

export default function Reports() {
  const { fdMaster } = useFDStore();
  const { banks } = useMasterStore();
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBank, setSelectedBank] = useState('all');

  const handleGenerateReport = (format: string) => {
    toast.success(`Generating ${selectedReport} report in ${format} format...`);
    setTimeout(() => {
      toast.success('Report downloaded successfully');
    }, 1500);
  };

  // Portfolio summary data
  const portfolioSummary = {
    totalFDs: fdMaster.length,
    activeFDs: fdMaster.filter((fd) => fd.status === 'Active' || fd.status === 'Near Maturity').length,
    totalPrincipal: fdMaster.reduce((sum, fd) => sum + fd.principal, 0),
    totalInterest: fdMaster.reduce((sum, fd) => sum + (fd.interestAccrued || 0), 0),
    bankCount: new Set(fdMaster.map((fd) => fd.bankId)).size,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reports & Analytics</h1>
          <p className="text-[var(--text-muted)]">Generate and download financial reports</p>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Portfolio Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Total FDs</p>
            <p className="text-2xl font-mono font-bold text-[var(--accent)]">{portfolioSummary.totalFDs}</p>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Active FDs</p>
            <p className="text-2xl font-mono font-bold text-green-500">{portfolioSummary.activeFDs}</p>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Total Principal</p>
            <p className="text-2xl font-mono font-bold text-[var(--accent)]">
              {formatCurrency(portfolioSummary.totalPrincipal)}
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Interest Accrued</p>
            <p className="text-2xl font-mono font-bold text-blue-500">
              {formatCurrency(portfolioSummary.totalInterest)}
            </p>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Bank Partners</p>
            <p className="text-2xl font-mono font-bold text-purple-500">{portfolioSummary.bankCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-muted)] mb-1">Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="input-field"
            >
              <option value="all">All Banks</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedReport(report.id)}
              className={`card-surface p-6 cursor-pointer transition-all ${
                selectedReport === report.id ? 'border-[var(--accent)]' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
                  <Icon className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <div className="flex gap-1">
                  {report.formats.map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 bg-[var(--bg-surface)] text-[var(--text-muted)] rounded text-xs"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-1">{report.name}</h3>
              <p className="text-sm text-[var(--text-muted)]">{report.description}</p>

              {selectedReport === report.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 border-t border-[var(--border)]"
                >
                  <p className="text-sm text-[var(--text-muted)] mb-2">Download as:</p>
                  <div className="flex gap-2">
                    {report.formats.map((format) => (
                      <button
                        key={format}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateReport(format);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[var(--accent-glow)] text-[var(--accent)] rounded-lg text-sm hover:bg-[var(--accent)] hover:text-white transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        {format}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recently Generated</h3>
        <div className="space-y-3">
          {[
            { name: 'FD Portfolio Report', date: '2026-02-20', format: 'PDF', size: '2.4 MB' },
            { name: 'Interest Accrual Report', date: '2026-02-19', format: 'Excel', size: '856 KB' },
            { name: 'TDS Register Report', date: '2026-02-18', format: 'PDF', size: '1.2 MB' },
          ].map((report, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{report.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Generated on {report.date} • {report.format} • {report.size}
                  </p>
                </div>
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
