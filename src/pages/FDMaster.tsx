import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Mail,
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Building2,
  Calendar,
  Percent,
  Wallet,
  ArrowUpDown,
} from 'lucide-react';
import { useFDStore, useMasterStore } from '@/stores';
import { formatCurrency, formatDate, getStatusColor, getDaysToMaturity } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ITEMS_PER_PAGE = 10;

export default function FDMaster() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fdMaster } = useFDStore();
  const { banks } = useMasterStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof typeof fdMaster[0]>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and sort FDs
  const filteredFDs = useMemo(() => {
    let result = [...fdMaster];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (fd) =>
          fd.referenceNumber.toLowerCase().includes(query) ||
          fd.bankName.toLowerCase().includes(query) ||
          fd.bankFDRef?.toLowerCase().includes(query)
      );
    }

    // Bank filter
    if (selectedBank !== 'all') {
      result = result.filter((fd) => fd.bankId === selectedBank);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((fd) => fd.status === selectedStatus);
    }

    // URL param filter
    const statusParam = searchParams.get('status');
    if (statusParam) {
      result = result.filter((fd) => fd.status.toLowerCase() === statusParam.toLowerCase());
    }

    // Sort
    result.sort((a, b) => {
      const aValue = a[sortField] as string | number;
      const bValue = b[sortField] as string | number;
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [fdMaster, searchQuery, selectedBank, selectedStatus, sortField, sortDirection, searchParams]);

  // Pagination
  const totalPages = Math.ceil(filteredFDs.length / ITEMS_PER_PAGE);
  const paginatedFDs = filteredFDs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: keyof typeof fdMaster[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportToExcel = () => {
    const data = filteredFDs.map((fd) => ({
      'Reference Number': fd.referenceNumber,
      'Bank': fd.bankName,
      'Bank FD Ref': fd.bankFDRef || '',
      'Principal': fd.principal,
      'Interest Rate': fd.interestRate,
      'Start Date': fd.startDate,
      'Maturity Date': fd.maturityDate,
      'Tenor (Days)': fd.tenorDays,
      'Interest Type': fd.interestType,
      'Compounding': fd.compoundingFrequency,
      'Day Count': fd.dayCountConvention,
      'Maturity Amount': fd.maturityAmount,
      'Status': fd.status,
    }));

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header as keyof typeof row];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FD_Master_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">FD Master</h1>
          <p className="text-[var(--text-muted)]">Central registry of all fixed deposits</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
          <button
            onClick={() => navigate('/fd-booking')}
            className="btn-primary flex items-center gap-2"
          >
            <span className="text-sm">Book New FD</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-surface p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
            <input
              type="text"
              placeholder="Search by reference, bank..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

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

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Near Maturity">Near Maturity</option>
            <option value="Matured">Matured</option>
            <option value="Closed">Closed</option>
            <option value="Pending">Pending</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Filter className="w-4 h-4" />
            <span>{filteredFDs.length} results</span>
          </div>
        </div>
      </div>

      {/* FD Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('referenceNumber')}>
                  <div className="flex items-center gap-1">
                    Reference
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('bankName')}>
                  <div className="flex items-center gap-1">
                    Bank
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right p-3 cursor-pointer" onClick={() => handleSort('principal')}>
                  <div className="flex items-center justify-end gap-1">
                    Principal
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right p-3 cursor-pointer" onClick={() => handleSort('interestRate')}>
                  <div className="flex items-center justify-end gap-1">
                    Rate
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-left p-3 cursor-pointer" onClick={() => handleSort('maturityDate')}>
                  <div className="flex items-center gap-1">
                    Maturity Date
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="text-right p-3">Days Left</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFDs.map((fd) => {
                const daysToMaturity = getDaysToMaturity(fd.maturityDate);
                return (
                  <tr key={fd.id} className="table-row">
                    <td className="p-3">
                      <button
                        onClick={() => navigate(`/fd-master?id=${fd.id}`)}
                        className="text-[var(--accent)] hover:underline font-mono text-sm"
                      >
                        {fd.referenceNumber}
                      </button>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-primary)]">{fd.bankName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                      {formatCurrency(fd.principal)}
                    </td>
                    <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                      {fd.interestRate.toFixed(2)}%
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-[var(--text-primary)]">{formatDate(fd.maturityDate)}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <span
                        className={`font-mono ${
                          daysToMaturity <= 7
                            ? 'text-red-500'
                            : daysToMaturity <= 30
                            ? 'text-orange-500'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {daysToMaturity > 0 ? `${daysToMaturity} days` : 'Overdue'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(fd.status)}`}>
                        {fd.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/fd-master?id=${fd.id}`)}
                          className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <button
                          className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
                          title="Email"
                        >
                          <Mail className="w-4 h-4 text-[var(--text-muted)]" />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-[var(--bg-hover)] rounded-lg">
                              <MoreHorizontal className="w-4 h-4 text-[var(--text-muted)]" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[var(--bg-card)] border-[var(--border)]">
                            <DropdownMenuItem
                              onClick={() => navigate(`/maturity?fd=${fd.id}`)}
                              className="text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                            >
                              Initiate Maturity
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/fd-booking?rollover=${fd.id}`)}
                              className="text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                            >
                              Rollover
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => navigate(`/fd-booking?preclose=${fd.id}`)}
                              className="text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                            >
                              Pre-mature Closure
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border)]">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredFDs.length)} of {filteredFDs.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-[var(--text-primary)]">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Total Portfolio</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
                {formatCurrency(fdMaster.reduce((sum, fd) => sum + fd.principal, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Percent className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Active FDs</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
                {fdMaster.filter((fd) => fd.status === 'Active' || fd.status === 'Near Maturity').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Maturing (30d)</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
                {fdMaster.filter((fd) => {
                  const days = getDaysToMaturity(fd.maturityDate);
                  return days > 0 && days <= 30;
                }).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card-surface p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-[var(--text-muted)]">Bank Partners</p>
              <p className="text-xl font-mono font-bold text-[var(--text-primary)]">
                {new Set(fdMaster.map((fd) => fd.bankId)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
