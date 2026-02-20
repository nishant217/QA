import { create } from 'zustand';
import type { CryptoPrice, FXRate, FearGreedData } from '@/types';

interface MarketState {
  cryptoPrices: CryptoPrice[];
  fxRates: FXRate[];
  fearGreedIndex: FearGreedData | null;
  fearGreedHistory: FearGreedData[];
  globalMarketCap: number;
  globalVolume24h: number;
  btcDominance: number;
  lastUpdated: string;
  isLoading: boolean;
  error: string | null;
  fetchCryptoPrices: () => Promise<void>;
  fetchFXRates: () => Promise<void>;
  fetchFearGreed: () => Promise<void>;
  fetchGlobalData: () => Promise<void>;
  fetchAllMarketData: () => Promise<void>;
}

// Initial seed data
const INITIAL_CRYPTO: CryptoPrice[] = [
  {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    current_price: 95423.56,
    price_change_percentage_1h_in_currency: 0.32,
    price_change_percentage_24h_in_currency: 2.15,
    price_change_percentage_7d_in_currency: 5.78,
    market_cap: 1892345678901,
    total_volume: 34567890123,
    sparkline_in_7d: { price: [90000, 91000, 89500, 92000, 93500, 94500, 95423] },
  },
  {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    current_price: 2789.45,
    price_change_percentage_1h_in_currency: -0.15,
    price_change_percentage_24h_in_currency: 1.82,
    price_change_percentage_7d_in_currency: 4.23,
    market_cap: 334567890123,
    total_volume: 15678901234,
    sparkline_in_7d: { price: [2650, 2680, 2620, 2700, 2740, 2760, 2789] },
  },
  {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    current_price: 198.76,
    price_change_percentage_1h_in_currency: 0.85,
    price_change_percentage_24h_in_currency: 5.42,
    price_change_percentage_7d_in_currency: 12.34,
    market_cap: 92345678901,
    total_volume: 4567890123,
    sparkline_in_7d: { price: [175, 180, 178, 185, 190, 195, 198] },
  },
  {
    id: 'ripple',
    symbol: 'xrp',
    name: 'XRP',
    current_price: 2.87,
    price_change_percentage_1h_in_currency: 0.12,
    price_change_percentage_24h_in_currency: -1.25,
    price_change_percentage_7d_in_currency: 3.45,
    market_cap: 165432109876,
    total_volume: 2345678901,
    sparkline_in_7d: { price: [2.75, 2.80, 2.78, 2.85, 2.90, 2.88, 2.87] },
  },
  {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    current_price: 678.92,
    price_change_percentage_1h_in_currency: 0.05,
    price_change_percentage_24h_in_currency: 0.89,
    price_change_percentage_7d_in_currency: 2.34,
    market_cap: 98765432109,
    total_volume: 1234567890,
    sparkline_in_7d: { price: [660, 665, 662, 670, 675, 677, 678] },
  },
  {
    id: 'cardano',
    symbol: 'ada',
    name: 'Cardano',
    current_price: 0.89,
    price_change_percentage_1h_in_currency: -0.25,
    price_change_percentage_24h_in_currency: 3.45,
    price_change_percentage_7d_in_currency: 8.92,
    market_cap: 32109876543,
    total_volume: 987654321,
    sparkline_in_7d: { price: [0.82, 0.84, 0.83, 0.86, 0.87, 0.88, 0.89] },
  },
  {
    id: 'polkadot',
    symbol: 'dot',
    name: 'Polkadot',
    current_price: 5.67,
    price_change_percentage_1h_in_currency: 0.45,
    price_change_percentage_24h_in_currency: 2.78,
    price_change_percentage_7d_in_currency: 6.54,
    market_cap: 8765432109,
    total_volume: 345678901,
    sparkline_in_7d: { price: [5.30, 5.40, 5.35, 5.50, 5.55, 5.62, 5.67] },
  },
  {
    id: 'chainlink',
    symbol: 'link',
    name: 'Chainlink',
    current_price: 19.45,
    price_change_percentage_1h_in_currency: 0.18,
    price_change_percentage_24h_in_currency: 4.23,
    price_change_percentage_7d_in_currency: 11.23,
    market_cap: 12345678901,
    total_volume: 567890123,
    sparkline_in_7d: { price: [17.50, 17.80, 17.60, 18.20, 18.50, 19.10, 19.45] },
  },
  {
    id: 'avalanche-2',
    symbol: 'avax',
    name: 'Avalanche',
    current_price: 28.76,
    price_change_percentage_1h_in_currency: -0.32,
    price_change_percentage_24h_in_currency: 1.92,
    price_change_percentage_7d_in_currency: 7.45,
    market_cap: 10987654321,
    total_volume: 456789012,
    sparkline_in_7d: { price: [26.50, 26.80, 26.60, 27.20, 27.50, 28.30, 28.76] },
  },
  {
    id: 'uniswap',
    symbol: 'uni',
    name: 'Uniswap',
    current_price: 9.87,
    price_change_percentage_1h_in_currency: 0.22,
    price_change_percentage_24h_in_currency: 3.12,
    price_change_percentage_7d_in_currency: 9.87,
    market_cap: 7654321098,
    total_volume: 234567890,
    sparkline_in_7d: { price: [8.90, 9.05, 8.95, 9.30, 9.50, 9.70, 9.87] },
  },
];

const INITIAL_FX_RATES: FXRate[] = [
  { currency: 'INR', rate: 87.52, change24h: 0.15, lastUpdated: new Date().toISOString() },
  { currency: 'EUR', rate: 0.95, change24h: -0.08, lastUpdated: new Date().toISOString() },
  { currency: 'GBP', rate: 0.79, change24h: 0.02, lastUpdated: new Date().toISOString() },
  { currency: 'AED', rate: 3.67, change24h: 0.0, lastUpdated: new Date().toISOString() },
  { currency: 'JPY', rate: 151.23, change24h: -0.45, lastUpdated: new Date().toISOString() },
  { currency: 'SGD', rate: 1.34, change24h: 0.05, lastUpdated: new Date().toISOString() },
];

const INITIAL_FEAR_GREED: FearGreedData = {
  value: 72,
  value_classification: 'Greed',
  timestamp: new Date().toISOString(),
};

const INITIAL_FEAR_GREED_HISTORY: FearGreedData[] = Array.from({ length: 30 }, (_, i) => ({
  value: 40 + Math.floor(Math.random() * 40),
  value_classification: ['Fear', 'Neutral', 'Greed'][Math.floor(Math.random() * 3)],
  timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
}));

export const useMarketStore = create<MarketState>((set, get) => ({
  cryptoPrices: INITIAL_CRYPTO,
  fxRates: INITIAL_FX_RATES,
  fearGreedIndex: INITIAL_FEAR_GREED,
  fearGreedHistory: INITIAL_FEAR_GREED_HISTORY,
  globalMarketCap: 2894567890123,
  globalVolume24h: 98765432109,
  btcDominance: 65.4,
  lastUpdated: new Date().toISOString(),
  isLoading: false,
  error: null,

  fetchCryptoPrices: async () => {
    set({ isLoading: true, error: null });
    try {
      // Try to fetch from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=1h,24h,7d'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch crypto prices');
      }
      
      const data = await response.json();
      set({
        cryptoPrices: data,
        lastUpdated: new Date().toISOString(),
        isLoading: false,
      });
    } catch (error) {
      // Keep existing data on error
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch crypto prices',
        isLoading: false,
      });
    }
  },

  fetchFXRates: async () => {
    try {
      const response = await fetch('https://open.er-api.com/v6/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch FX rates');
      }
      
      const data = await response.json();
      const rates = data.rates;
      
      const fxRates: FXRate[] = [
        { currency: 'INR', rate: rates.INR, change24h: 0.15, lastUpdated: new Date().toISOString() },
        { currency: 'EUR', rate: rates.EUR, change24h: -0.08, lastUpdated: new Date().toISOString() },
        { currency: 'GBP', rate: rates.GBP, change24h: 0.02, lastUpdated: new Date().toISOString() },
        { currency: 'AED', rate: rates.AED, change24h: 0.0, lastUpdated: new Date().toISOString() },
        { currency: 'JPY', rate: rates.JPY, change24h: -0.45, lastUpdated: new Date().toISOString() },
        { currency: 'SGD', rate: rates.SGD, change24h: 0.05, lastUpdated: new Date().toISOString() },
      ];
      
      set({ fxRates });
    } catch (error) {
      // Keep existing data on error
    }
  },

  fetchFearGreed: async () => {
    try {
      const response = await fetch('https://api.alternative.me/fng/?limit=30');
      
      if (!response.ok) {
        throw new Error('Failed to fetch fear & greed index');
      }
      
      const data = await response.json();
      const history = data.data.map((item: any) => ({
        value: parseInt(item.value),
        value_classification: item.value_classification,
        timestamp: new Date(parseInt(item.timestamp) * 1000).toISOString(),
      }));
      
      set({
        fearGreedIndex: history[0],
        fearGreedHistory: history,
      });
    } catch (error) {
      // Keep existing data on error
    }
  },

  fetchGlobalData: async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      
      if (!response.ok) {
        throw new Error('Failed to fetch global data');
      }
      
      const data = await response.json();
      
      set({
        globalMarketCap: data.data.total_market_cap.usd,
        globalVolume24h: data.data.total_volume.usd,
        btcDominance: data.data.market_cap_percentage.btc,
      });
    } catch (error) {
      // Keep existing data on error
    }
  },

  fetchAllMarketData: async () => {
    set({ isLoading: true });
    
    await Promise.all([
      get().fetchCryptoPrices(),
      get().fetchFXRates(),
      get().fetchFearGreed(),
      get().fetchGlobalData(),
    ]);
    
    set({ isLoading: false });
  },
}));
