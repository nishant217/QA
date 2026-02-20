import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Percent,
  Building2,
  TrendingUp,
  Clock,
  Check,
  X,
  ChevronRight,
  Plus,
  Search,
  Filter,
} from 'lucide-react';
import { useMasterStore } from '@/stores';
import { formatCurrency } from '@/lib/utils';

export default function RateNegotiation() {
  const { banks, rateCards } = useMasterStore();
  const [activeTab, setActiveTab] = useState('requests');

  const rateRequests = [
    {
      id: 'RR-2026-001',
      principal: 50000000,
      tenor: 365,
      requestedRate: 7.75,
      status: 'Submitted',
      banksContacted: ['HDFC', 'ICICI', 'Axis'],
      createdAt: '2026-02-15',
    },
    {
      id: 'RR-2026-002',
      principal: 25000000,
      tenor: 180,
      requestedRate: 7.50,
      status: 'Offers Received',
      banksContacted: ['SBI', 'Kotak'],
      createdAt: '2026-02-10',
    },
    {
      id: 'RR-2026-003',
      principal: 100000000,
      tenor: 730,
      requestedRate: 8.00,
      status: 'Approved',
      banksContacted: ['HDFC', 'ICICI', 'Axis', 'Kotak'],
      createdAt: '2026-02-05',
    },
  ];

  const rateOffers = [
    { bank: 'HDFC Bank', rate: 7.75, tenor: 365, validUntil: '2026-02-28', isNegotiable: true },
    { bank: 'ICICI Bank', rate: 7.80, tenor: 365, validUntil: '2026-03-01', isNegotiable: true },
    { bank: 'Axis Bank', rate: 7.70, tenor: 365, validUntil: '2026-02-25', isNegotiable: false },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Rate Negotiation</h1>
          <p className="text-[var(--text-muted)]">Negotiate FD rates with partner banks</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      {/* Rate Comparison */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Current Rate Cards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {banks.slice(0, 4).map((bank) => {
            const bestRate = rateCards
              .filter((rc) => rc.bankId === bank.id)
              .sort((a, b) => b.rate - a.rate)[0];
            return (
              <div key={bank.id} className="p-4 bg-[var(--bg-surface)] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-4 h-4 text-[var(--accent)]" />
                  <span className="font-medium text-[var(--text-primary)]">{bank.shortName}</span>
                </div>
                <p className="text-2xl font-mono font-bold text-[var(--accent)]">
                  {bestRate ? `${bestRate.rate}%` : 'N/A'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {bestRate ? `Best rate for ${bestRate.tenorMin}-${bestRate.tenorMax} days` : 'No rates available'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {[
          { id: 'requests', label: 'Rate Requests' },
          { id: 'offers', label: 'Received Offers' },
          { id: 'comparison', label: 'Comparison Grid' },
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

      {/* Rate Requests */}
      {activeTab === 'requests' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Reference</th>
                <th className="text-right p-3">Principal</th>
                <th className="text-right p-3">Tenor</th>
                <th className="text-right p-3">Requested Rate</th>
                <th className="text-left p-3">Banks</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rateRequests.map((req) => (
                <tr key={req.id} className="table-row">
                  <td className="p-3 text-[var(--accent)] font-mono">{req.id}</td>
                  <td className="p-3 text-right font-mono text-[var(--text-primary)]">
                    {formatCurrency(req.principal)}
                  </td>
                  <td className="p-3 text-right font-mono text-[var(--text-primary)]">{req.tenor} days</td>
                  <td className="p-3 text-right font-mono text-[var(--accent)]">{req.requestedRate}%</td>
                  <td className="p-3 text-[var(--text-muted)]">{req.banksContacted.join(', ')}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        req.status === 'Approved'
                          ? 'bg-green-500/20 text-green-500'
                          : req.status === 'Offers Received'
                          ? 'bg-blue-500/20 text-blue-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="p-3 text-[var(--text-muted)]">{req.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Received Offers */}
      {activeTab === 'offers' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rateOffers.map((offer, index) => (
            <div key={index} className="card-surface p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[var(--accent)]" />
                  <span className="font-medium text-[var(--text-primary)]">{offer.bank}</span>
                </div>
                {offer.isNegotiable && (
                  <span className="px-2 py-1 bg-[var(--accent-glow)] text-[var(--accent)] rounded-full text-xs">
                    Negotiable
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Rate</span>
                  <span className="font-mono font-bold text-[var(--accent)]">{offer.rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Tenor</span>
                  <span className="font-mono text-[var(--text-primary)]">{offer.tenor} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Valid Until</span>
                  <span className="text-[var(--text-primary)]">{offer.validUntil}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 btn-primary text-sm py-2">Accept</button>
                <button className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--bg-hover)]">
                  Negotiate
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Comparison Grid */}
      {activeTab === 'comparison' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-surface overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Bank</th>
                <th className="text-right p-3">7-30 days</th>
                <th className="text-right p-3">31-90 days</th>
                <th className="text-right p-3">91-180 days</th>
                <th className="text-right p-3">181-365 days</th>
                <th className="text-right p-3">365+ days</th>
              </tr>
            </thead>
            <tbody>
              {banks.slice(0, 5).map((bank) => (
                <tr key={bank.id} className="table-row">
                  <td className="p-3 font-medium text-[var(--text-primary)]">{bank.name}</td>
                  {[1, 2, 3, 4, 5].map((tenorGroup) => {
                    const rate = rateCards.find((rc) => rc.bankId === bank.id && rc.tenorMin <= tenorGroup * 90 && rc.tenorMax >= tenorGroup * 90);
                    return (
                      <td key={tenorGroup} className="p-3 text-right font-mono text-[var(--text-primary)]">
                        {rate ? `${rate.rate}%` : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
