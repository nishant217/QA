import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ArrowRight,
  FileText,
  Building2,
  DollarSign,
  Bell,
  FolderOpen,
  Percent,
} from 'lucide-react';
import { useFDStore, useNotificationStore, useTransactionStore, useMasterStore } from '@/stores';
import { formatCurrency } from '@/lib/utils';
import { useBugEffects, bugEffects } from '@/hooks/useBugEffects';

interface SearchResult {
  id: string;
  type: 'fd' | 'bank' | 'transaction' | 'notification' | 'page' | 'rate';
  title: string;
  subtitle: string;
  description?: string;
  url: string;
  icon: React.ElementType;
  priority: number;
}

interface GlobalSearchProps {
  className?: string;
}

export function GlobalSearch({ className = '' }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { isSearchBroken } = useBugEffects();

  const { fdMaster, getFDsByBank } = useFDStore();
  const { notifications } = useNotificationStore();
  const { transactions } = useTransactionStore();
  const { banks } = useMasterStore();

  // Simple fuzzy matching
  const fuzzyMatch = useCallback((query: string, target: string): boolean => {
    if (query.length < 3) return false;
    
    let queryIndex = 0;
    for (let i = 0; i < target.length && queryIndex < query.length; i++) {
      if (target[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex >= Math.floor(query.length * 0.7);
  }, []);

  // Search scoring function
  const getSearchScore = useCallback((query: string, fields: string[]): number => {
    let score = 0;
    
    fields.forEach(field => {
      if (!field) return;
      
      const fieldLower = field.toLowerCase();
      
      // Exact match
      if (fieldLower === query) {
        score += 100;
      }
      // Starts with
      else if (fieldLower.startsWith(query)) {
        score += 50;
      }
      // Contains
      else if (fieldLower.includes(query)) {
        score += 25;
      }
      // Word starts with query
      else if (fieldLower.split(' ').some(word => word.startsWith(query))) {
        score += 15;
      }
      // Fuzzy match (for typos)
      else if (fuzzyMatch(query, fieldLower)) {
        score += 10;
      }
    });

    return score;
  }, [fuzzyMatch]);

  const handleResultClick = useCallback((result: SearchResult) => {
    navigate(result.url);
    setIsOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }, [navigate]);

  // Search function using useMemo
  const results = useMemo(() => {
    const searchResults: SearchResult[] = [];
    
    if (!query.trim()) {
      return searchResults;
    }

    const normalizedQuery = query.toLowerCase();

    // Search FDs
    fdMaster.forEach(fd => {
      const score = getSearchScore(normalizedQuery, [
        fd.referenceNumber,
        fd.bankName,
        fd.status,
        formatCurrency(fd.principal)
      ]);

      if (score > 0) {
        searchResults.push({
          id: fd.id,
          type: 'fd',
          title: `FD ${fd.referenceNumber}`,
          subtitle: fd.bankName,
          description: `${formatCurrency(fd.principal)} • ${fd.status}`,
          url: `/fd-master?fd=${fd.id}`,
          icon: FileText,
          priority: score,
        });
      }
    });

    // Search banks
    const uniqueBanks = Array.from(new Set(fdMaster.map(fd => fd.bankName)));
    uniqueBanks.forEach(bankName => {
      if (getSearchScore(normalizedQuery, [bankName]) > 0) {
        const bankFDs = getFDsByBank(bankName);
        const totalValue = bankFDs.reduce((sum, fd) => sum + fd.principal, 0);
        
        searchResults.push({
          id: `bank-${bankName}`,
          type: 'bank',
          title: bankName,
          subtitle: `${bankFDs.length} FDs`,
          description: formatCurrency(totalValue),
          url: `/fd-master?bank=${encodeURIComponent(bankName)}`,
          icon: Building2,
          priority: getSearchScore(normalizedQuery, [bankName]) + 10,
        });
      }
    });

    // Search transactions
    transactions.slice(0, 20).forEach(transaction => {
      const score = getSearchScore(normalizedQuery, [
        transaction.referenceNumber,
        transaction.type,
        transaction.description,
        formatCurrency(transaction.amount)
      ]);

      if (score > 0) {
        searchResults.push({
          id: transaction.id,
          type: 'transaction',
          title: transaction.referenceNumber,
          subtitle: transaction.type,
          description: `${transaction.description} • ${formatCurrency(transaction.amount)}`,
          url: `/cash-flow?transaction=${transaction.id}`,
          icon: DollarSign,
          priority: score,
        });
      }
    });

    // Search notifications
    notifications.slice(0, 15).forEach(notification => {
      const score = getSearchScore(normalizedQuery, [
        notification.title,
        notification.description
      ]);

      if (score > 0) {
        searchResults.push({
          id: notification.id,
          type: 'notification',
          title: notification.title,
          subtitle: notification.type,
          description: notification.description,
          url: notification.actionUrl || '/notifications',
          icon: Bell,
          priority: score - 5,
        });
      }
    });

    // Search banks and rates
    banks.forEach(bank => {
      const score = getSearchScore(normalizedQuery, [
        bank.name,
        bank.shortName,
        'rate',
        'interest'
      ]);

      if (score > 0) {
        searchResults.push({
          id: `rate-${bank.id}`,
          type: 'rate',
          title: `${bank.name} Rates`,
          subtitle: 'Interest Rates',
          description: `Current FD rates for ${bank.shortName}`,
          url: `/rate-negotiation?bank=${encodeURIComponent(bank.name)}`,
          icon: Percent,
          priority: score,
        });
      }
    });

    // Search pages/modules
    const pages = [
      { name: 'Dashboard', url: '/dashboard', keywords: ['dashboard', 'home', 'overview', 'summary'] },
      { name: 'FD Booking', url: '/fd-booking', keywords: ['booking', 'new', 'create', 'deposit'] },
      { name: 'FD Master', url: '/fd-master', keywords: ['master', 'list', 'view', 'manage'] },
      { name: 'Markets', url: '/markets', keywords: ['market', 'rates', 'live', 'prices'] },
      { name: 'Rate Negotiation', url: '/rate-negotiation', keywords: ['negotiation', 'rates', 'quotes'] },
      { name: 'Cash Flow', url: '/cash-flow', keywords: ['cash', 'flow', 'schedule', 'payments'] },
      { name: 'Accrual Engine', url: '/accrual-engine', keywords: ['accrual', 'interest', 'calculation'] },
      { name: 'Interest Receipts', url: '/interest-receipts', keywords: ['receipts', 'interest', 'payments'] },
      { name: 'Maturity & Rollover', url: '/maturity', keywords: ['maturity', 'rollover', 'renewal'] },
      { name: 'Period Close', url: '/period-close', keywords: ['period', 'close', 'closing'] },
      { name: 'Accounting', url: '/accounting', keywords: ['accounting', 'ledger', 'journal'] },
      { name: 'Reports', url: '/reports', keywords: ['reports', 'analytics', 'export'] },
      { name: 'Notifications', url: '/notifications', keywords: ['notifications', 'alerts', 'messages'] },
    ];

    pages.forEach(page => {
      const score = getSearchScore(normalizedQuery, [page.name, ...page.keywords]);
      if (score > 0) {
        searchResults.push({
          id: `page-${page.url}`,
          type: 'page',
          title: page.name,
          subtitle: 'Module',
          description: `Navigate to ${page.name}`,
          url: page.url,
          icon: FolderOpen,
          priority: score + 5,
        });
      }
    });

    // Sort by priority and limit results
    const finalResults = searchResults
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
    
    // Apply bug effect: return empty results when search is broken
    return bugEffects.filterSearchResults(finalResults, query, isSearchBroken);
  }, [query, fdMaster, notifications, transactions, banks, getFDsByBank, getSearchScore, isSearchBroken]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          event.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setQuery('');
          inputRef.current?.blur();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick]);

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0); // Reset selected index when query changes
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative flex items-center gap-2 bg-[var(--bg-surface)] rounded-lg px-3 py-1.5">
        <Search className="w-4 h-4 text-[var(--text-subtle)] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder="Search FDs, transactions, banks..."
          className="bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] w-64 outline-none"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="p-0.5 hover:bg-[var(--bg-hover)] rounded text-[var(--text-muted)]"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search Results */}
      <AnimatePresence>
        {isOpen && (query || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 left-0 right-0 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {results.length > 0 ? (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors
                      ${index === selectedIndex ? 'bg-[var(--bg-hover)]' : ''}
                    `}
                  >
                    <div className={`
                      flex-shrink-0 p-2 rounded-lg
                      ${result.type === 'fd' ? 'bg-blue-500/20 text-blue-500' : ''}
                      ${result.type === 'bank' ? 'bg-green-500/20 text-green-500' : ''}
                      ${result.type === 'transaction' ? 'bg-purple-500/20 text-purple-500' : ''}
                      ${result.type === 'notification' ? 'bg-orange-500/20 text-orange-500' : ''}
                      ${result.type === 'page' ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : ''}
                      ${result.type === 'rate' ? 'bg-teal-500/20 text-teal-500' : ''}
                    `}>
                      <result.icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {result.title}
                      </h4>
                      <p className="text-xs text-[var(--text-muted)] truncate">
                        {result.subtitle}
                        {result.description && ` • ${result.description}`}
                      </p>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-[var(--text-subtle)] flex-shrink-0" />
                  </button>
                ))}
              </div>
            ) : query ? (
              <div className="p-8 text-center text-[var(--text-muted)]">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs mt-1">Try searching for FDs, banks, or transactions</p>
              </div>
            ) : (
              <div className="p-6 text-center text-[var(--text-muted)]">
                <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start typing to search...</p>
                <p className="text-xs mt-1">FDs • Banks • Transactions • Pages</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GlobalSearch;