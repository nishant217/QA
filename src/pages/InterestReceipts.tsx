import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Check,
  AlertCircle,
  Download,
  Mail,
  Search,
  Filter,
  Building2,
  Calendar,
  TrendingUp,
  X,
} from 'lucide-react';
import { useFDStore } from '@/stores';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function InterestReceipts() {
  const { fdMaster } = useFDStore();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Mock receipts data
  const receipts = [
    {
      id: 'RCPT-001',
      fdRef: 'FD-2026-001',
      bankName: 'HDFC Bank',
      receiptDate: '2026-04-15',
      interestAmount: 375000,
      tdsDeducted: 37500,
      netAmount: 337500,
      status: 'Matched',
    },
    {
      id: 'RCPT-002',
      fdRef: 'FD-2026-002',
      bankName: 'State Bank of India',
      receiptDate: '2026-04-10',
      interestAmount: 91250,
      tdsDeducted: 9125,
      netAmount: 82125,
      status: 'Matched',
    },
    {
      id: 'RCPT-003',
      fdRef: 'FD-2026-004',
      bankName: 'Axis Bank',
      receiptDate: '2025-05-20',
      interestAmount: 142500,
      tdsDeducted: 14250,
      netAmount: 128250,
      status: 'Matched',
    },
    {
      id: 'RCPT-004',
      fdRef: 'FD-2026-012',
      bankName: 'Axis Bank',
      receiptDate: '2025-11-25',
      interestAmount: 237500,
      tdsDeducted: 23750,
      netAmount: 213750,
      status: 'Exception',
    },
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);

    // Simulate upload and processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.success(`File "${file.name}" uploaded and processed successfully`);
    setIsUploading(false);
    setUploadedFile(null);
  };

  const totalInterest = receipts.reduce((sum, r) => sum + r.interestAmount, 0);
  const totalTDS = receipts.reduce((sum, r) => sum + r.tdsDeducted, 0);
  const totalNet = receipts.reduce((sum, r) => sum + r.netAmount, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Interest Receipts & TDS</h1>
          <p className="text-[var(--text-muted)]">Manage interest receipts and TDS reconciliation</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Upload Bank Statement</h3>
        <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center hover:border-[var(--accent)] transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
            <p className="text-[var(--text-primary)] font-medium mb-2">
              {isUploading ? 'Processing...' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-sm text-[var(--text-muted)]">CSV, Excel, or PDF files supported</p>
          </label>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total Interest</p>
              <p className="text-xl font-mono font-bold text-[var(--accent)]">{formatCurrency(totalInterest)}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">TDS Deducted</p>
              <p className="text-xl font-mono font-bold text-red-500">{formatCurrency(totalTDS)}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Net Received</p>
              <p className="text-xl font-mono font-bold text-green-500">{formatCurrency(totalNet)}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Exceptions</p>
              <p className="text-xl font-mono font-bold text-yellow-500">
                {receipts.filter((r) => r.status === 'Exception').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts Table */}
      <div className="card-surface overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Interest Receipts</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
              <input
                type="text"
                placeholder="Search..."
                className="input-field pl-10 w-48"
              />
            </div>
            <select className="input-field">
              <option value="all">All Status</option>
              <option value="matched">Matched</option>
              <option value="unmatched">Unmatched</option>
              <option value="exception">Exception</option>
            </select>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3">Receipt ID</th>
              <th className="text-left p-3">FD Reference</th>
              <th className="text-left p-3">Bank</th>
              <th className="text-left p-3">Receipt Date</th>
              <th className="text-right p-3">Interest</th>
              <th className="text-right p-3">TDS</th>
              <th className="text-right p-3">Net</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((receipt) => (
              <tr key={receipt.id} className="table-row">
                <td className="p-3 font-mono text-[var(--accent)]">{receipt.id}</td>
                <td className="p-3 text-[var(--text-primary)]">{receipt.fdRef}</td>
                <td className="p-3 text-[var(--text-muted)]">{receipt.bankName}</td>
                <td className="p-3 text-[var(--text-primary)]">{formatDate(receipt.receiptDate)}</td>
                <td className="p-3 text-right font-mono text-[var(--accent)]">
                  {formatCurrency(receipt.interestAmount)}
                </td>
                <td className="p-3 text-right font-mono text-red-500">
                  {formatCurrency(receipt.tdsDeducted)}
                </td>
                <td className="p-3 text-right font-mono text-green-500">
                  {formatCurrency(receipt.netAmount)}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      receipt.status === 'Matched'
                        ? 'bg-green-500/20 text-green-500'
                        : receipt.status === 'Exception'
                        ? 'bg-red-500/20 text-red-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {receipt.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
                    <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TDS Register */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">TDS Register</h3>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]">
            <Download className="w-4 h-4" />
            Download Form 26AS
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Financial Year</p>
            <p className="text-lg font-mono font-bold text-[var(--text-primary)]">2025-26</p>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Total TDS Deducted</p>
            <p className="text-lg font-mono font-bold text-red-500">{formatCurrency(totalTDS)}</p>
          </div>
          <div className="p-4 bg-[var(--bg-surface)] rounded-lg">
            <p className="text-sm text-[var(--text-muted)]">Form 15G/15H Submitted</p>
            <p className="text-lg font-mono font-bold text-green-500">3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
