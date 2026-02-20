import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Bitcoin,
  Globe,
  Star,
  Search,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useMarketStore } from '@/stores';
import { formatCurrency, formatCompactNumber } from '@/lib/utils';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Market Health Card
function MarketHealthCard({
  title,
  value,
  subtitle,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle?: string;
  change?: number;
  icon: React.ElementType;
}) {
  return (
    <div className="card-surface p-4">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--accent)]" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-sm text-[var(--text-muted)] mt-3">{title}</h3>
      <p className="text-xl font-mono font-bold text-[var(--text-primary)]">{value}</p>
      {subtitle && <p className="text-xs text-[var(--text-subtle)] mt-1">{subtitle}</p>}
    </div>
  );
}

// Fear & Greed Gauge
function FearGreedGauge({ value }: { value: number }) {
  const getColor = (v: number) => {
    if (v <= 25) return '#EF4444';
    if (v <= 45) return '#F97316';
    if (v <= 55) return '#F59E0B';
    if (v <= 75) return '#22C55E';
    return '#16A34A';
  };

  const getLabel = (v: number) => {
    if (v <= 25) return 'Extreme Fear';
    if (v <= 45) return 'Fear';
    if (v <= 55) return 'Neutral';
    if (v <= 75) return 'Greed';
    return 'Extreme Greed';
  };

  return (
    <div className="card-surface p-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Fear & Greed Index</h3>
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-24 overflow-hidden">
          <div
            className="absolute w-48 h-48 rounded-full"
            style={{
              background: `conic-gradient(from 180deg, #EF4444 0deg, #F97316 45deg, #F59E0B 90deg, #22C55E 135deg, #16A34A 180deg)`,
            }}
          />
          <div className="absolute inset-4 bg-[var(--bg-card)] rounded-full" />
          <motion.div
            className="absolute bottom-0 left-1/2 w-1 h-24 bg-[var(--text-primary)] origin-bottom"
            style={{ marginLeft: '-2px' }}
            animate={{ rotate: (value / 100) * 180 - 90 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <div className="text-center mt-4">
          <p className="text-4xl font-bold" style={{ color: getColor(value) }}>
            {value}
          </p>
          <p className="text-lg font-medium" style={{ color: getColor(value) }}>
            {getLabel(value)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Crypto Table Row
function CryptoTableRow({
  crypto,
  onSelect,
  isSelected,
}: {
  crypto: any;
  onSelect: () => void;
  isSelected: boolean;
}) {
  const sparklineData = crypto.sparkline_in_7d?.price.map((p: number, i: number) => ({ value: p, index: i })) || [];
  const isPositive7d = (crypto.price_change_percentage_7d_in_currency || 0) >= 0;

  return (
    <motion.tr
      layout
      onClick={onSelect}
      className={`table-row cursor-pointer ${isSelected ? 'bg-[var(--accent-glow)]' : ''}`}
    >
      <td className="p-3">
        <div className="flex items-center gap-3">
          <button className="text-[var(--text-subtle)] hover:text-[var(--accent)]">
            <Star className="w-4 h-4" />
          </button>
          <span className="text-[var(--text-muted)] w-6">{crypto.market_cap_rank || '-'}</span>
          {crypto.image && (
            <img src={crypto.image} alt={crypto.name} className="w-8 h-8 rounded-full" />
          )}
          <div>
            <p className="font-medium text-[var(--text-primary)]">{crypto.name}</p>
            <p className="text-xs text-[var(--text-muted)] uppercase">{crypto.symbol}</p>
          </div>
        </div>
      </td>
      <td className="p-3 text-right font-mono text-[var(--text-primary)]">
        ${crypto.current_price.toLocaleString()}
      </td>
      <td className={`p-3 text-right font-mono ${(crypto.price_change_percentage_1h_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {(crypto.price_change_percentage_1h_in_currency || 0).toFixed(2)}%
      </td>
      <td className={`p-3 text-right font-mono ${(crypto.price_change_percentage_24h_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {(crypto.price_change_percentage_24h_in_currency || 0).toFixed(2)}%
      </td>
      <td className={`p-3 text-right font-mono ${(crypto.price_change_percentage_7d_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
        {(crypto.price_change_percentage_7d_in_currency || 0).toFixed(2)}%
      </td>
      <td className="p-3 text-right font-mono text-[var(--text-primary)]">
        {formatCompactNumber(crypto.market_cap)}
      </td>
      <td className="p-3 text-right font-mono text-[var(--text-muted)]">
        {formatCompactNumber(crypto.total_volume)}
      </td>
      <td className="p-3">
        <div className="w-24 h-8">
          {sparklineData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={isPositive7d ? '#22C55E' : '#EF4444'}
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

// FX Rate Card
function FXRateCard({ currency, rate, change }: { currency: string; rate: number; change?: number }) {
  const flags: Record<string, string> = {
    INR: '🇮🇳',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    AED: '🇦🇪',
    JPY: '🇯🇵',
    SGD: '🇸🇬',
  };

  return (
    <div className="card-surface p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{flags[currency] || '🌐'}</span>
          <div>
            <p className="font-medium text-[var(--text-primary)]">USD/{currency}</p>
            <p className="text-xs text-[var(--text-muted)]">{currency}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold text-[var(--text-primary)]">{rate.toFixed(4)}</p>
          {change !== undefined && (
            <p className={`text-xs font-mono ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(2)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Markets() {
  const {
    cryptoPrices,
    fxRates,
    fearGreedIndex,
    fearGreedHistory,
    globalMarketCap,
    globalVolume24h,
    btcDominance,
    isLoading,
    fetchAllMarketData,
  } = useMarketStore();

  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'market_cap' | 'price_change_24h'>('market_cap');

  useEffect(() => {
    fetchAllMarketData();
    const interval = setInterval(fetchAllMarketData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllMarketData]);

  const filteredCryptos = cryptoPrices
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'market_cap') return b.market_cap - a.market_cap;
      return (b.price_change_percentage_24h_in_currency || 0) - (a.price_change_percentage_24h_in_currency || 0);
    });

  const selectedCryptoData = cryptoPrices.find((c) => c.id === selectedCrypto);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Markets</h1>
          <p className="text-[var(--text-muted)]">Live cryptocurrency and FX market data</p>
        </div>
        <button
          onClick={fetchAllMarketData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] transition-colors"
        >
          <Activity className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </button>
      </div>

      {/* Market Health Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <MarketHealthCard
          title="Global Market Cap"
          value={formatCompactNumber(globalMarketCap)}
          icon={Globe}
        />
        <MarketHealthCard
          title="24h Volume"
          value={formatCompactNumber(globalVolume24h)}
          icon={Activity}
        />
        <MarketHealthCard
          title="BTC Dominance"
          value={`${btcDominance.toFixed(1)}%`}
          icon={Bitcoin}
        />
        <MarketHealthCard
          title="Fear & Greed"
          value={fearGreedIndex?.value.toString() || '-'}
          subtitle={fearGreedIndex?.value_classification}
          icon={Activity}
        />
        <MarketHealthCard
          title="USD/INR"
          value={fxRates.find((r) => r.currency === 'INR')?.rate.toFixed(2) || '-'}
          change={fxRates.find((r) => r.currency === 'INR')?.change24h}
          icon={DollarSign}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto Table */}
        <div className="lg:col-span-2 card-surface p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Cryptocurrency Prices</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-subtle)]" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-10 w-48"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field"
              >
                <option value="market_cap">Market Cap</option>
                <option value="price_change_24h">24h Change</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="text-left p-3">Asset</th>
                  <th className="text-right p-3">Price</th>
                  <th className="text-right p-3">1h %</th>
                  <th className="text-right p-3">24h %</th>
                  <th className="text-right p-3">7d %</th>
                  <th className="text-right p-3">Market Cap</th>
                  <th className="text-right p-3">Volume (24h)</th>
                  <th className="text-left p-3">7d Chart</th>
                </tr>
              </thead>
              <tbody>
                {filteredCryptos.map((crypto) => (
                  <CryptoTableRow
                    key={crypto.id}
                    crypto={crypto}
                    onSelect={() => setSelectedCrypto(crypto.id)}
                    isSelected={selectedCrypto === crypto.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Fear & Greed */}
          <FearGreedGauge value={fearGreedIndex?.value || 50} />

          {/* FX Rates */}
          <div className="card-surface p-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">FX Rates</h3>
            <div className="space-y-3">
              {fxRates.map((rate) => (
                <FXRateCard
                  key={rate.currency}
                  currency={rate.currency}
                  rate={rate.rate}
                  change={rate.change24h}
                />
              ))}
            </div>
          </div>

          {/* Selected Crypto Detail */}
          {selectedCryptoData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-surface p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                {selectedCryptoData.image && (
                  <img src={selectedCryptoData.image} alt={selectedCryptoData.name} className="w-10 h-10 rounded-full" />
                )}
                <div>
                  <h3 className="font-semibold text-[var(--text-primary)]">{selectedCryptoData.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] uppercase">{selectedCryptoData.symbol}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Price</span>
                  <span className="font-mono text-[var(--text-primary)]">${selectedCryptoData.current_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">24h Change</span>
                  <span className={`font-mono ${(selectedCryptoData.price_change_percentage_24h_in_currency || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {(selectedCryptoData.price_change_percentage_24h_in_currency || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Market Cap</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatCompactNumber(selectedCryptoData.market_cap)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Volume (24h)</span>
                  <span className="font-mono text-[var(--text-primary)]">{formatCompactNumber(selectedCryptoData.total_volume)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Fear & Greed History Chart */}
      <div className="card-surface p-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Fear & Greed History (30 Days)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={fearGreedHistory.slice().reverse()}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="timestamp"
              stroke="var(--text-muted)"
              fontSize={10}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            />
            <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [value, 'Index']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN')}
            />
            <Bar dataKey="value">
              {fearGreedHistory.map((entry, index) => {
                const color = entry.value <= 25 ? '#EF4444' :
                              entry.value <= 45 ? '#F97316' :
                              entry.value <= 55 ? '#F59E0B' :
                              entry.value <= 75 ? '#22C55E' : '#16A34A';
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
