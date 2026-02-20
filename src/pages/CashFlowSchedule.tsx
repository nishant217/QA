import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Download,
  Mail,
  TrendingUp,
  TrendingDown,
  Filter,
  Building2,
  Wallet,
} from 'lucide-react';
import { useFDStore } from '@/stores';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CashFlowSchedule() {
  const { fdMaster } = useFDStore();
  const [selectedBank, setSelectedBank] = useState('all');
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');

  // Generate cash flow data
  const cashFlows = fdMaster
    .filter((fd) => fd.status === 'Active' || fd.status === 'Near Maturity')
    .flatMap((fd) => {
      const flows = [];
      const startDate = new Date(fd.startDate);
      const maturityDate = new Date(fd.maturityDate);
      
      if (fd.interestType === 'Compound' && fd.compoundingFrequency !== 'At Maturity') {
        const months = viewMode === 'monthly' ? 1 : 3;
        let currentDate = new Date(startDate);
        
        while (currentDate < maturityDate) {
          currentDate.setMonth(currentDate.getMonth() + months);
          if (currentDate <= maturityDate) {
            const periodInterest = (fd.principal * (fd.interestRate / 100) * (months * 30)) / 365;
            flows.push({
              fdId: fd.id,
              fdRef: fd.referenceNumber,
              bankName: fd.bankName,
              date: new Date(currentDate).toISOString().split('T')[0],
              type: 'Interest',
              amount: periodInterest,
              isProjected: true,
            });
          }
        }
      }
      
      // Add maturity principal
      flows.push({
        fdId: fd.id,
        fdRef: fd.referenceNumber,
        bankName: fd.bankName,
        date: fd.maturityDate,
        type: 'Principal',
        amount: fd.principal,
        isProjected: true,
      });
      
      return flows;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const filteredFlows = selectedBank === 'all' 
    ? cashFlows 
    : cashFlows.filter((f) => f.bankName === selectedBank);

  const uniqueBanks = Array.from(new Set(cashFlows.map((f) => f.bankName)));

  // Group by month
  const groupedByMonth = filteredFlows.reduce((acc, flow) => {
    const month = flow.date.substring(0, 7);
    if (!acc[month]) acc[month] = [];
    acc[month].push(flow);
    return acc;
  }, {} as Record<string, typeof cashFlows>);

  const exportToExcel = () => {
    const csv = [
      ['Date', 'FD Reference', 'Bank', 'Type', 'Amount', 'Status'].join(','),
      ...filteredFlows.map((f) =>
        [f.date, f.fdRef, f.bankName, f.type, f.amount, f.isProjected ? 'Projected' : 'Actual'].join(',')
      ),
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cash_flow_schedule_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Cash Flow Schedule</h1>
          <p className="text-[var(--text-muted)]">Projected interest and principal flows</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)]">
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <Calendar className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total Flows</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{cashFlows.length}</p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Interest Flows</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
                {cashFlows.filter((f) => f.type === 'Interest').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Principal Flows</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
                {cashFlows.filter((f) => f.type === 'Principal').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Bank Partners</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{uniqueBanks.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="input-field"
          >
            <option value="all">All Banks</option>
            {uniqueBanks.map((bank) => (
              <option key={bank} value={bank}>
                {bank}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg text-sm ${
                viewMode === 'monthly'
                  ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('quarterly')}
              className={`px-4 py-2 rounded-lg text-sm ${
                viewMode === 'quarterly'
                  ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
      </div>

      {/* Cash Flow Table */}
      <div className="card-surface overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">FD Reference</th>
              <th className="text-left p-3">Bank</th>
              <th className="text-left p-3">Type</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlows.slice(0, 50).map((flow, index) => (
              <tr key={index} className="table-row">
                <td className="p-3 text-[var(--text-primary)]">{formatDate(flow.date)}</td>
                <td className="p-3 font-mono text-[var(--accent)]">{flow.fdRef}</td>
                <td className="p-3 text-[var(--text-muted)]">{flow.bankName}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      flow.type === 'Interest'
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-blue-500/20 text-blue-500'
                    }`}
                  >
                    {flow.type}
                  </span>
                </td>
                <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                  {formatCurrency(flow.amount)}
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs">
                    Projected
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
