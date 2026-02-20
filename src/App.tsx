import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore, useThemeStore, useMarketStore, useBugStore } from '@/stores';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Markets from '@/pages/Markets';
import FDMaster from '@/pages/FDMaster';
import FDBooking from '@/pages/FDBooking';
import RateNegotiation from '@/pages/RateNegotiation';
import CashFlowSchedule from '@/pages/CashFlowSchedule';
import AccrualEngine from '@/pages/AccrualEngine';
import InterestReceipts from '@/pages/InterestReceipts';
import MaturityRollover from '@/pages/MaturityRollover';
import PeriodClose from '@/pages/PeriodClose';
import Accounting from '@/pages/Accounting';
import Reports from '@/pages/Reports';
import Notifications from '@/pages/Notifications';
import AdminPanel from '@/pages/AdminPanel';
import UserProfile from '@/pages/UserProfile';
import MainLayout from '@/layouts/MainLayout';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, currentUser } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (currentUser?.role !== 'SYSTEM_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { theme } = useThemeStore();
  const { fetchAllMarketData } = useMarketStore();
  const { syncSession } = useAuthStore();
  const { activeBugs } = useBugStore();

  // Apply theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light-orange') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Sync session on mount (for cross-tab support)
  useEffect(() => {
    syncSession();
  }, [syncSession]);

  // Fetch market data on mount
  useEffect(() => {
    fetchAllMarketData();
    
    // Set up periodic refresh (every 30 seconds)
    const interval = setInterval(() => {
      fetchAllMarketData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchAllMarketData]);

  return (
    <BrowserRouter>
      {/* Bug Overlay for QA - visible only when bugs are active */}
      <div className={`bug-overlay ${activeBugs.length > 0 ? 'active' : ''}`} />
      <div className={`bug-indicator ${activeBugs.length > 0 ? 'visible' : ''}`}>
        ⚠️ {activeBugs.length} Bug{activeBugs.length !== 1 ? 's' : ''} Active
      </div>
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard & Analytics */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="markets" element={<Markets />} />
          
          {/* FD Management */}
          <Route path="fd-master" element={<FDMaster />} />
          <Route path="fd-booking" element={<FDBooking />} />
          <Route path="fd-booking/new" element={<FDBooking />} />
          <Route path="fd-booking/:id" element={<FDBooking />} />
          
          {/* Treasury Operations */}
          <Route path="rate-negotiation" element={<RateNegotiation />} />
          <Route path="cash-flow" element={<CashFlowSchedule />} />
          <Route path="accrual-engine" element={<AccrualEngine />} />
          <Route path="interest-receipts" element={<InterestReceipts />} />
          <Route path="maturity" element={<MaturityRollover />} />
          <Route path="maturity/rollover" element={<MaturityRollover />} />
          <Route path="maturity/payout" element={<MaturityRollover />} />
          
          {/* Period & Accounting */}
          <Route path="period-close" element={<PeriodClose />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="accounting/journal" element={<Accounting />} />
          <Route path="accounting/reconciliation" element={<Accounting />} />
          
          {/* Reports & Compliance */}
          <Route path="reports" element={<Reports />} />
          <Route path="reports/portfolio" element={<Reports />} />
          <Route path="reports/tax" element={<Reports />} />
          <Route path="reports/audit" element={<Reports />} />
          <Route path="tds-register" element={<Reports />} />
          
          {/* User & System */}
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<UserProfile />} />
          
          {/* Admin Only */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="admin/audit"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          <Route
            path="admin/bugs"
            element={
              <AdminRoute>
                <AdminPanel />
              </AdminRoute>
            }
          />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
