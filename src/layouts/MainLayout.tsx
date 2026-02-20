import { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Home,
  TrendingUp,
  FileText,
  FolderOpen,
  Percent,
  Calendar,
  Bell,
  LogOut,
  User,
  ChevronRight,
  Building2,
  Wallet,
  Landmark,
  Lock,
  BarChart3,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Database,
  Bug,
} from 'lucide-react';
import { useAuthStore, useConfigStore, useNotificationStore, useThemeStore, useChatStore } from '@/stores';
import { toast } from 'sonner';
import { BugIndicator, BugHighlight } from '@/components/ui/bug-indicator';
import BugControlPanel from '@/components/ui/bug-control-panel';
import NotificationDropdown from '@/components/ui/notification-dropdown';
import GlobalSearch from '@/components/ui/global-search';
import ChatMessage from '@/components/ui/chat-message';
import TypingIndicator from '@/components/ui/typing-indicator';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  featureFlag?: keyof ReturnType<typeof useConfigStore.getState>['featureFlags'];
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: Home, path: '/dashboard' },
  { label: 'Markets', icon: TrendingUp, path: '/markets', featureFlag: 'enableMarketsScreen' },
  { label: 'Rate Negotiation', icon: Percent, path: '/rate-negotiation', featureFlag: 'enableRateNegotiationModule' },
  { label: 'FD Booking', icon: FileText, path: '/fd-booking', featureFlag: 'enableFDBookingModule' },
  { label: 'FD Master', icon: FolderOpen, path: '/fd-master' },
  { label: 'Cash Flow', icon: Calendar, path: '/cash-flow', featureFlag: 'enableCashFlowSchedule' },
  { label: 'Accrual Engine', icon: BarChart3, path: '/accrual-engine', featureFlag: 'enableAccrualEngine' },
  { label: 'Interest Receipts', icon: Wallet, path: '/interest-receipts', featureFlag: 'enableInterestReceipts' },
  { label: 'Maturity & Rollover', icon: Landmark, path: '/maturity', featureFlag: 'enableMaturityModule' },
  { label: 'Period Close', icon: Lock, path: '/period-close', featureFlag: 'enablePeriodClose' },
  { label: 'Accounting', icon: Database, path: '/accounting', featureFlag: 'enableAccountingWorkbench' },
  { label: 'Reports', icon: BarChart3, path: '/reports', featureFlag: 'enableReportsModule' },
  { label: 'Notifications', icon: Bell, path: '/notifications' },
  { label: 'Admin Panel', icon: Shield, path: '/admin', adminOnly: true },
  { label: 'Profile', icon: User, path: '/profile' },
];

// Market Ticker Component
function MarketTicker() {
  const { featureFlags } = useConfigStore();
  const { cryptoPrices, fxRates } = useMarketStore();

  if (!featureFlags.enableLiveMarketTicker) return null;

  const tickerItems = [
    // Crypto
    ...cryptoPrices.slice(0, 5).map(c => ({
      label: c.symbol.toUpperCase(),
      value: `$${c.current_price.toLocaleString()}`,
      change: c.price_change_percentage_24h_in_currency,
    })),
    // FX
    ...fxRates.map(fx => ({
      label: `USD/${fx.currency}`,
      value: fx.rate.toFixed(2),
      change: fx.change24h,
    })),
  ];

  return (
    <div className="h-8 bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-hidden flex items-center">
      <div className="ticker-scroll flex items-center gap-8 whitespace-nowrap">
        {[...tickerItems, ...tickerItems].map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs font-medium text-[var(--text-muted)]">{item.label}</span>
            <span className="text-xs font-mono text-[var(--text-primary)]">{item.value}</span>
            {item.change !== undefined && (
              <span className={`text-xs font-mono ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// AI Chat Button Component
function AIChatButton() {
  const { featureFlags } = useConfigStore();
  const { conversations, createConversation, setCurrentConversation } = useChatStore();
  const [isOpen, setIsOpen] = useState(false);

  if (!featureFlags.enableAIChatbot) return null;

  const handleOpen = () => {
    const id = createConversation();
    setCurrentConversation(id);
    setIsOpen(true);
  };

  return (
    <>
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg z-50 pulse-glow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Sparkles className="w-6 h-6 text-white" />
        {conversations.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
            {conversations.length}
          </span>
        )}
      </motion.button>

      <AIChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

// AI Chat Panel Component
function AIChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { getCurrentConversation, sendMessage, isLoading } = useChatStore();
  const [input, setInput] = useState('');
  const conversation = getCurrentConversation();

  const handleSend = async () => {
    if (!input.trim() || !conversation) return;
    await sendMessage(conversation.id, input);
    setInput('');
  };

  const quickQuestions = [
    'Calculate maturity for ₹1Cr @7.5% for 365 days',
    'Which bank has the best FD rate today?',
    'What is the TDS deduction rule for corporates?',
    'Explain quarterly compounding vs simple interest',
    'How to calculate accrued interest for FDs?',
    'What are the current RBI guidelines for FDs?',
    'How does auto-rollover work at maturity?',
    'What is the minimum tenure for corporate FDs?',
    'Explain the difference between FD and CD',
    'How to negotiate better FD rates with banks?',
    'What documents are needed for FD booking?',
    'How is TDS calculated on FD interest?'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 drawer-overlay z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-gradient-to-r from-[var(--bg-card)] to-[var(--bg-surface)]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] text-lg">NyneOS AI Assistant</h3>
                  <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online • Powered by Meta LLaMA
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-[var(--bg-hover)] rounded-lg transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {conversation?.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Welcome to NyneOS AI</h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-xs">
                    I'm here to help with Fixed Deposits, treasury operations, banking regulations, and platform guidance.
                  </p>
                </div>
              ) : (
                conversation?.messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    isLatest={index === conversation.messages.length - 1}
                  />
                ))
              )}
              {isLoading && <TypingIndicator />}
            </div>

            {/* Quick Questions */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-surface)]/50">
              <p className="text-xs font-medium text-[var(--text-muted)] mb-3 flex items-center gap-2">
                <Sparkles className="w-3 h-3" />
                Quick Questions
              </p>
              <div className="max-h-[120px] overflow-y-auto mb-4 space-y-2 pr-2 scrollbar-thin scrollbar-track-[var(--bg-surface)] scrollbar-thumb-[var(--border)] hover:scrollbar-thumb-[var(--accent)]">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q);
                    }}
                    disabled={isLoading}
                    className="w-full text-xs px-3 py-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg hover:border-[var(--accent)] hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed block"
                  >
                    {q.length > 45 ? q.slice(0, 45) + '...' : q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="relative">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Ask anything about FDs, treasury, or this platform..."
                      className="w-full input-field pr-12 bg-[var(--bg-card)] border-2 border-[var(--border)] focus:border-[var(--accent)] transition-colors"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-[var(--text-muted)]">
                      {input.length}/500
                    </div>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                  >
                    {isLoading ? (
                      <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                    ) : (
                      <>
                        <span className="text-sm font-medium">Send</span>
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Import useMarketStore
import { useMarketStore } from '@/stores';

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [bugControlOpen, setBugControlOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const mobileSidebarRef = useRef(mobileSidebarOpen);
  
  // Update ref when state changes
  useEffect(() => {
    mobileSidebarRef.current = mobileSidebarOpen;
  }, [mobileSidebarOpen]);
  const { currentUser, logout } = useAuthStore();
  const { featureFlags } = useConfigStore();
  const { unreadCount } = useNotificationStore();
  const { theme, cycleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
        setMobileSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mobileSidebarRef.current) {
        setMobileSidebarOpen(false);
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
    toast.success('Logged out successfully');
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && currentUser?.role !== 'SYSTEM_ADMIN') return false;
    if (item.featureFlag && !featureFlags[item.featureFlag]) return false;
    return true;
  });

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen flex main-bg">
      {/* Mobile Overlay */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isMobile ? 260 : (isSidebarOpen ? 260 : 70),
          x: isMobile ? (mobileSidebarOpen ? 0 : -260) : 0,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`${isMobile ? 'fixed' : 'relative'} left-0 top-0 h-full bg-[var(--bg-card)] border-r border-[var(--border)] z-40 flex flex-col overflow-hidden flex-shrink-0 ${isMobile && !mobileSidebarOpen ? 'pointer-events-none' : ''}`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h1 className="text-lg font-bold text-gradient">NyneOS</h1>
                <p className="text-xs text-[var(--text-muted)]">FinFlow</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-[var(--accent)]">
                {currentUser?.name.charAt(0)}
              </span>
            </div>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {currentUser?.name}
                </p>
                <span className="badge-orange text-xs">
                  {currentUser?.role.replace('_', ' ')}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item w-full block ${isActive(item.path) ? 'active' : ''}`}
              title={!isSidebarOpen ? item.label : undefined}
              onClick={() => isMobile && setMobileSidebarOpen(false)}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {item.label === 'Notifications' && unreadCount > 0 && isSidebarOpen && (
                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-2 border-t border-[var(--border)] space-y-1">
          {featureFlags.enableDarkModeToggle && (
            <button
              onClick={cycleTheme}
              className="sidebar-item w-full"
              title={!isSidebarOpen ? 'Cycle Theme' : undefined}
            >
              {theme === 'dark-orange' && <Sun className="w-5 h-5 flex-shrink-0 text-orange-500" />}
              {theme === 'dark-teal' && <Sun className="w-5 h-5 flex-shrink-0 text-teal-500" />}
              {theme === 'light-orange' && <Moon className="w-5 h-5 flex-shrink-0 text-orange-500" />}
              {isSidebarOpen && (
                <span className="text-sm">
                  {theme === 'dark-orange' && 'Dark Orange'}
                  {theme === 'dark-teal' && 'Dark Red'}
                  {theme === 'light-orange' && 'Light Orange'}
                </span>
              )}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="sidebar-item w-full text-red-500 hover:text-red-400"
            title={!isSidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-14 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger / Desktop sidebar toggle */}
            <button
              onClick={() => isMobile ? setMobileSidebarOpen(!mobileSidebarOpen) : setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[var(--bg-hover)] rounded-lg"
            >
              <Menu className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            {/* Global Search */}
            <GlobalSearch className="hidden md:block" />
          </div>

          <div className="flex items-center gap-3">
            {/* Bug Control Panel (Admin Only) */}
            {currentUser?.role === 'SYSTEM_ADMIN' && (
              <button
                onClick={() => setBugControlOpen(true)}
                className="relative p-2 hover:bg-[var(--bg-hover)] rounded-lg"
                title="QA Bug Control Panel"
              >
                <Bug className="w-5 h-5 text-red-500" />
              </button>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                className="relative p-2 hover:bg-[var(--bg-hover)] rounded-lg"
              >
                <Bell className="w-5 h-5 text-[var(--text-muted)]" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white pulse-glow">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationDropdown
                isOpen={notificationDropdownOpen}
                onClose={() => setNotificationDropdownOpen(false)}
                unreadCount={unreadCount}
              />
            </div>

            {/* User Avatar */}
            <Link
              to="/profile"
              className="flex items-center gap-2 p-1.5 hover:bg-[var(--bg-hover)] rounded-lg"
            >
              <div className="w-8 h-8 rounded-full bg-[var(--accent-glow)] flex items-center justify-center">
                <span className="text-sm font-semibold text-[var(--accent)]">
                  {currentUser?.name.charAt(0)}
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Market Ticker */}
        <MarketTicker />

        {/* Maintenance Banner */}
        {featureFlags.maintenanceMode && (
          <div className="bg-orange-500/20 border-b border-orange-500/50 px-4 py-2 flex items-center justify-center gap-2">
            <span className="text-sm text-orange-500">
              ⚠️ System maintenance scheduled. Some features may be unavailable.
            </span>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto max-w-full">
          <div className="max-w-full overflow-hidden">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bug Indicator (Admin Only) */}
      <BugIndicator />
      <BugHighlight />

      {/* Bug Control Panel (Admin Only) */}
      <BugControlPanel 
        isOpen={bugControlOpen} 
        onClose={() => setBugControlOpen(false)} 
      />

      {/* AI Chat Button */}
      <AIChatButton />
    </div>
  );
}
