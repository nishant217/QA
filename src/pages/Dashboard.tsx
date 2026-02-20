import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Receipt,
  AlertCircle,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock,
} from 'lucide-react';
import { useFDStore, useNotificationStore, useTransactionStore } from '@/stores';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useBugEffects, getBugClasses, bugEffects } from '@/hooks/useBugEffects';

// Recharts imports
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// KPI Card Component
interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  icon: React.ElementType;
  onClick?: () => void;
  alert?: boolean;
}

function KPICard({ title, value, subtitle, trend, icon: Icon, onClick, alert }: KPICardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`kpi-card cursor-pointer ${alert ? 'border-red-500/50' : ''}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert ? 'bg-red-500/20' : 'bg-[var(--accent-glow)]'}`}>
          <Icon className={`w-5 h-5 ${alert ? 'text-red-500' : 'text-[var(--accent)]'}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-[var(--text-muted)] mb-1">{title}</h3>
      <p className="text-2xl font-mono font-bold text-[var(--text-primary)]">{value}</p>
      {subtitle && <p className="text-xs text-[var(--text-subtle)] mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// Portfolio Trend Data
const portfolioTrendData = [
  { month: 'Mar', value: 24500000, interest: 180000 },
  { month: 'Apr', value: 25800000, interest: 195000 },
  { month: 'May', value: 26200000, interest: 210000 },
  { month: 'Jun', value: 27100000, interest: 225000 },
  { month: 'Jul', value: 27500000, interest: 240000 },
  { month: 'Aug', value: 28000000, interest: 255000 },
  { month: 'Sep', value: 27850000, interest: 250000 },
  { month: 'Oct', value: 28150000, interest: 265000 },
  { month: 'Nov', value: 28300000, interest: 275000 },
  { month: 'Dec', value: 28100000, interest: 270000 },
  { month: 'Jan', value: 27950000, interest: 285000 },
  { month: 'Feb', value: 28150000, interest: 310000 },
];

// Bank Concentration Data
const bankConcentrationData = [
  { name: 'HDFC', value: 105000000, color: '#F97316' },
  { name: 'ICICI', value: 55000000, color: '#3B82F6' },
  { name: 'Kotak', value: 36000000, color: '#22C55E' },
  { name: 'Axis', value: 20000000, color: '#F59E0B' },
  { name: 'Others', value: 65500000, color: '#8B5CF6' },
];

// Maturity Ladder Data
const maturityLadderData = [
  { month: 'Feb 2026', amount: 20000000 },
  { month: 'Mar 2026', amount: 0 },
  { month: 'Apr 2026', amount: 0 },
  { month: 'May 2026', amount: 0 },
  { month: 'Jun 2026', amount: 15000000 },
  { month: 'Jul 2026', amount: 0 },
  { month: 'Aug 2026', amount: 0 },
];

// Recent Activity Component
function RecentActivity() {
  const { transactions } = useTransactionStore();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="card-surface p-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {recentTransactions.map((txn) => (
          <div key={txn.id} className="flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                txn.type === 'Deposit' ? 'bg-green-500/20' :
                txn.type === 'Withdrawal' ? 'bg-red-500/20' :
                'bg-blue-500/20'
              }`}>
                <Wallet className={`w-4 h-4 ${
                  txn.type === 'Deposit' ? 'text-green-500' :
                  txn.type === 'Withdrawal' ? 'text-red-500' :
                  'text-blue-500'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{txn.description}</p>
                <p className="text-xs text-[var(--text-muted)]">{new Date(txn.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <span className={`text-sm font-mono font-medium ${
              txn.type === 'Deposit' ? 'text-green-500' :
              txn.type === 'Withdrawal' ? 'text-red-500' :
              'text-[var(--text-primary)]'
            }`}>
              {txn.type === 'Deposit' ? '+' : txn.type === 'Withdrawal' ? '-' : ''}
              {formatCurrency(txn.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Action Items Component
function ActionItems() {
  const navigate = useNavigate();
  const { getMaturingFDs } = useFDStore();
  const maturingFDs = getMaturingFDs(30);
  const urgentMaturing = getMaturingFDs(7);

  const actions = [
    {
      title: `${urgentMaturing.length} FDs maturing within 7 days`,
      description: 'Immediate action required',
      urgent: true,
      action: () => navigate('/maturity'),
    },
    {
      title: `${maturingFDs.length} FDs maturing within 30 days`,
      description: 'Review rollover options',
      urgent: false,
      action: () => navigate('/maturity?window=30'),
    },
    {
      title: '3 Pending Approvals',
      description: 'Rate requests awaiting approval',
      urgent: false,
      action: () => navigate('/rate-negotiation'),
    },
  ];

  return (
    <div className="card-surface p-4">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Action Items</h3>
      <div className="space-y-3">
        {actions.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center justify-between p-3 bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                item.urgent ? 'bg-red-500/20' : 'bg-[var(--accent-glow)]'
              }`}>
                <AlertCircle className={`w-4 h-4 ${item.urgent ? 'text-red-500' : 'text-[var(--accent)]'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${item.urgent ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                  {item.title}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{item.description}</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--text-subtle)]" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { fdMaster, getTotalPortfolio, getMaturingFDs } = useFDStore();
  const { notifications } = useNotificationStore();
  const [mounted, setMounted] = useState(false);

  // Apply bug effects
  const { isDataCorrupted, isChartMisrender, hasCalculationError } = useBugEffects();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate KPIs
  const totalPortfolio = getTotalPortfolio();
  const activeFDs = fdMaster.filter(fd => fd.status === 'Active' || fd.status === 'Near Maturity');
  const interestEarnedMTD = activeFDs.reduce((sum, fd) => {
    const monthlyInterest = (fd.principal * (fd.interestRate / 100)) / 12;
    return sum + monthlyInterest;
  }, 0);
  const interestReceivedMTD = interestEarnedMTD * 0.9; // Approximate after TDS
  const maturingIn30Days = getMaturingFDs(30);
  const pendingApprovals = notifications.filter(n => n.type === 'approval' && !n.isRead).length;
  const openExceptions = notifications.filter(n => n.type === 'alert' && !n.isRead).length;

  if (!mounted) return null;

  return (
    <div className={`space-y-6 max-w-full overflow-hidden ${getBugClasses.glitchyChart(isChartMisrender)}`}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
          <p className="text-[var(--text-muted)]">Overview of your treasury operations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-muted)]">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Critical Alerts */}
      {maturingIn30Days.some(fd => {
        const daysToMaturity = Math.ceil((new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysToMaturity <= 7;
      }) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <p className="text-orange-500">
            <span className="font-semibold">Alert:</span> {maturingIn30Days.filter(fd => {
              const daysToMaturity = Math.ceil((new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return daysToMaturity <= 7;
            }).length} FDs maturing within 7 days require immediate action
          </p>
          <button
            onClick={() => navigate('/maturity')}
            className="ml-auto text-sm text-orange-500 hover:underline"
          >
            View Details
          </button>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          title="Total FD Portfolio"
          value={bugEffects.formatCurrency(totalPortfolio, isDataCorrupted)}
          subtitle={`${activeFDs.length} active FDs`}
          trend={{ value: 5.2, isPositive: true }}
          icon={Wallet}
          onClick={() => navigate('/fd-master?status=active')}
        />
        <KPICard
          title="Interest Earned MTD"
          value={bugEffects.formatCurrency(interestEarnedMTD, isDataCorrupted)}
          subtitle="Accrued interest"
          trend={{ value: 3.8, isPositive: true }}
          icon={PiggyBank}
          onClick={() => navigate('/accrual-engine')}
        />
        <KPICard
          title="Interest Received MTD"
          value={bugEffects.formatCurrency(interestReceivedMTD, isDataCorrupted)}
          subtitle="After TDS deduction"
          trend={{ value: 2.1, isPositive: true }}
          icon={Receipt}
          onClick={() => navigate('/interest-receipts')}
        />
        <KPICard
          title="Pending Approvals"
          value={pendingApprovals.toString()}
          subtitle="Awaiting your review"
          icon={Clock}
          onClick={() => navigate('/accounting')}
          alert={pendingApprovals > 5}
        />
        <KPICard
          title="Maturing in 30 Days"
          value={`${maturingIn30Days.length} FDs`}
          subtitle={formatCurrency(maturingIn30Days.reduce((sum, fd) => sum + fd.principal, 0))}
          icon={Calendar}
          onClick={() => navigate('/maturity?window=30')}
          alert={maturingIn30Days.some(fd => {
            const daysToMaturity = Math.ceil((new Date(fd.maturityDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            return daysToMaturity <= 7;
          })}
        />
        <KPICard
          title="Open Exceptions"
          value={openExceptions.toString()}
          subtitle="Require attention"
          icon={AlertTriangle}
          onClick={() => navigate('/interest-receipts/exceptions')}
          alert={openExceptions > 0}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Portfolio Trend */}
        <div className="xl:col-span-2 card-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Portfolio Trend</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-[var(--accent-glow)] text-[var(--accent)] rounded-full">12M</button>
              <button className="px-3 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-full">6M</button>
              <button className="px-3 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-full">3M</button>
            </div>
          </div>
          <div className="chart-container">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={portfolioTrendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Area type="monotone" dataKey="value" stroke="#F97316" fillOpacity={1} fill="url(#colorValue)" />
              <Area type="monotone" dataKey="interest" stroke="#3B82F6" fillOpacity={0} fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Concentration */}
        <div className="card-surface p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Bank Concentration</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={bankConcentrationData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {bankConcentrationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {bankConcentrationData.map((bank) => (
              <div key={bank.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: bank.color }} />
                  <span className="text-[var(--text-muted)]">{bank.name}</span>
                </div>
                <span className="font-mono text-[var(--text-primary)]">
                  {((bank.value / bankConcentrationData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Maturity Ladder */}
        <div className="xl:col-span-2 card-surface p-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Maturity Ladder (Next 6 Months)</h3>
          <div className="chart-container">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={maturityLadderData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(value) => `₹${(value / 10000000).toFixed(0)}Cr`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Bar dataKey="amount" fill="#F97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Action Items & Recent Activity */}
        <div className="space-y-6">
          <ActionItems />
          <RecentActivity />
        </div>
      </div>

      {/* FD Summary Table */}
      <div className="card-surface p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Recent FDs</h3>
          <button
            onClick={() => navigate('/fd-master')}
            className="flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="text-left p-3">Reference</th>
                <th className="text-left p-3">Bank</th>
                <th className="text-right p-3">Principal</th>
                <th className="text-right p-3">Rate</th>
                <th className="text-left p-3">Maturity Date</th>
                <th className="text-left p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {fdMaster.slice(0, 5).map((fd) => (
                <tr key={fd.id} className="table-row">
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/fd-master?id=${fd.id}`)}
                      className="text-[var(--accent)] hover:underline font-mono"
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
                  <td className="p-3 text-[var(--text-muted)]">
                    {new Date(fd.maturityDate).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      fd.status === 'Active' ? 'bg-green-500/20 text-green-500' :
                      fd.status === 'Near Maturity' ? 'bg-orange-500/20 text-orange-500' :
                      fd.status === 'Matured' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {fd.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
