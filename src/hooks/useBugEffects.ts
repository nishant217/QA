import { useBugStore } from '@/stores/bugStore';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';

// Hook to apply bug effects to components
export function useBugEffects() {
  const { isBugActive } = useBugStore();
  const { currentUser } = useAuthStore();
  const [isSearchFrozen, setIsSearchFrozen] = useState(false);

  // Only apply bugs to demo/non-admin users (for testing)
  const shouldApplyBugs = currentUser?.role !== 'SYSTEM_ADMIN';

  useEffect(() => {
    if (shouldApplyBugs && isBugActive('search_broken')) {
      setIsSearchFrozen(true);
    } else {
      setIsSearchFrozen(false);
    }
  }, [isBugActive('search_broken'), shouldApplyBugs]);

  return {
    // UI bugs
    isMisalignedButtons: shouldApplyBugs && isBugActive('ui_glitch'),
    isBigButtons: shouldApplyBugs && isBugActive('ui_glitch'),
    
    // Data bugs
    isDataCorrupted: shouldApplyBugs && isBugActive('data_corruption'),
    
    // Performance bugs
    isSlowLoad: shouldApplyBugs && isBugActive('slow_load'),
    
    // Search bugs
    isSearchFrozen,
    isSearchBroken: shouldApplyBugs && isBugActive('search_broken'),
    
    // Chart bugs
    isChartMisrender: shouldApplyBugs && isBugActive('chart_misrender'),
    
    // Permission bugs
    hasPermissionLeak: shouldApplyBugs && isBugActive('permission_leak'),
    
    // Calculation bugs
    hasCalculationError: shouldApplyBugs && isBugActive('calculation_error'),
    
    // Theme bugs
    isThemeBroken: shouldApplyBugs && isBugActive('theme_break'),
    
    // Filter bugs
    isFilterMalfunction: shouldApplyBugs && isBugActive('filter_malfunction'),
    
    // Export bugs
    isExportCorrupt: shouldApplyBugs && isBugActive('export_corrupt'),
    
    // Memory leak simulation
    hasMemoryLeak: shouldApplyBugs && isBugActive('memory_leak'),
    
    // General flag
    shouldApplyBugs,
  };
}

// CSS class generators for bug effects
export const getBugClasses = {
  misalignedButton: (isActive: boolean) => 
    isActive ? 'transform translate-x-2 translate-y-1' : '',
    
  bigButton: (isActive: boolean) => 
    isActive ? 'scale-125 text-lg px-6 py-4' : '',
    
  corruptedText: (isActive: boolean) => 
    isActive ? 'font-mono text-red-500 line-through' : '',
    
  slowAnimation: (isActive: boolean) => 
    isActive ? 'transition-all duration-[10000ms]' : 'transition-all duration-200',
    
  frozenInput: (isActive: boolean) => 
    isActive ? 'pointer-events-none opacity-50 cursor-not-allowed' : '',
    
  brokenTheme: (isActive: boolean) => 
    isActive ? 'bg-red-500 text-white border-yellow-500' : '',
    
  glitchyChart: (isActive: boolean) => 
    isActive ? 'transform rotate-2 skew-x-2' : '',
};

// Bug effect functions
export const bugEffects = {
  // Corrupt currency formatting
  formatCurrency: (amount: number, isCorrupted: boolean = false) => {
    if (isCorrupted) {
      // Show incorrect decimal places
      return `₹${(amount / 100000).toFixed(1)}`;
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  // TDS calculation with bug
  calculateTDS: (amount: number, hasError: boolean = false) => {
    if (hasError) {
      // Use wrong percentage (5% instead of 10%)
      return amount * 0.05;
    }
    return amount * 0.10;
  },

  // Search filter with bug
  filterSearchResults: (results: any[], query: string, isBroken: boolean = false) => {
    if (isBroken && query.length > 0) {
      // Return empty results when search is broken
      return [];
    }
    return results.filter(item => 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(query.toLowerCase())
      )
    );
  },

  // Date filter with malfunction
  filterByDateRange: (items: any[], fromDate: string, toDate: string, isMalfunctioning: boolean = false) => {
    if (isMalfunctioning) {
      // Return all items regardless of date range
      return items;
    }
    return items.filter(item => {
      const itemDate = new Date(item.date || item.createdAt || item.startDate);
      return itemDate >= new Date(fromDate) && itemDate <= new Date(toDate);
    });
  },

  // Export with corruption
  generateExport: (data: any[], isCorrupt: boolean = false) => {
    if (isCorrupt) {
      // Return corrupted data
      return {
        success: false,
        error: 'File corrupted during export. Cannot generate Excel file.',
        data: null,
      };
    }
    return {
      success: true,
      data,
      filename: `export_${new Date().getTime()}.xlsx`,
    };
  },
};

// Notification storm effect
export function useBugNotificationStorm() {
  const { isBugActive } = useBugStore();
  const { currentUser } = useAuthStore();
  const shouldApplyBugs = currentUser?.role !== 'SYSTEM_ADMIN';

  useEffect(() => {
    if (shouldApplyBugs && isBugActive('notification_storm')) {
      // Trigger multiple notifications
      const notifications = [
        'System Update Available',
        'New FD Rate Alert',
        'Compliance Warning',
        'API Rate Limit Warning',
        'Database Backup Started',
        'User Session Timeout Warning',
        'New Market Data Available',
        'Treasury Report Ready',
        'Audit Log Generated',
        'System Performance Alert',
      ];

      let count = 0;
      const interval = setInterval(() => {
        if (count >= 50) {
          clearInterval(interval);
          return;
        }
        
        // Simulate notification
        const event = new CustomEvent('bug-notification', {
          detail: {
            title: notifications[count % notifications.length],
            message: `Bug notification #${count + 1}`,
            type: 'warning',
          }
        });
        window.dispatchEvent(event);
        count++;
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isBugActive('notification_storm'), shouldApplyBugs]);
}

// Memory leak simulation
export function useBugMemoryLeak() {
  const { isBugActive } = useBugStore();
  const { currentUser } = useAuthStore();
  const shouldApplyBugs = currentUser?.role !== 'SYSTEM_ADMIN';
  
  useEffect(() => {
    if (shouldApplyBugs && isBugActive('memory_leak')) {
      // Simulate memory leak by creating unreferenced objects
      const interval = setInterval(() => {
        const leak: any[] = [];
        for (let i = 0; i < 10000; i++) {
          leak.push({ id: i, data: new Array(1000).fill('memory-leak-data') });
        }
        // Intentionally don't clean up
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isBugActive('memory_leak'), shouldApplyBugs]);
}