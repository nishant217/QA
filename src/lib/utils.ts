import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Indian Number Formatting
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (amount === undefined || amount === null) return '₹0.00';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatter.format(amount);
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  
  return new Intl.NumberFormat('en-IN').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    compactDisplay: 'short',
  });
  
  return formatter.format(num);
}

// Date Formatting
export function formatDate(date: string | Date, format: string = 'DD/MM/YYYY'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year}`;
  }
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Relative Time
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
}

// Days Calculation
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysToMaturity(maturityDate: string | Date): number {
  return getDaysBetween(new Date(), maturityDate);
}

// Interest Calculation
export function calculateSimpleInterest(
  principal: number,
  rate: number,
  days: number,
  dayCount: number = 365
): number {
  return principal * (rate / 100) * (days / dayCount);
}

export function calculateCompoundInterest(
  principal: number,
  rate: number,
  days: number,
  frequency: number = 4, // Quarterly
  dayCount: number = 365
): number {
  const years = days / dayCount;
  return principal * Math.pow(1 + (rate / 100) / frequency, frequency * years) - principal;
}

// Color Utilities
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'Active': 'bg-green-500/20 text-green-500',
    'Inactive': 'bg-gray-500/20 text-gray-500',
    'Pending': 'bg-yellow-500/20 text-yellow-500',
    'Approved': 'bg-green-500/20 text-green-500',
    'Rejected': 'bg-red-500/20 text-red-500',
    'Completed': 'bg-green-500/20 text-green-500',
    'Failed': 'bg-red-500/20 text-red-500',
    'Near Maturity': 'bg-orange-500/20 text-orange-500',
    'Matured': 'bg-blue-500/20 text-blue-500',
    'Closed': 'bg-gray-500/20 text-gray-500',
    'Draft': 'bg-gray-500/20 text-gray-500',
    'Simulation': 'bg-blue-500/20 text-blue-500',
    'Awaiting Approval': 'bg-yellow-500/20 text-yellow-500',
    'Posted': 'bg-green-500/20 text-green-500',
    'Reversed': 'bg-red-500/20 text-red-500',
    'Unmatched': 'bg-yellow-500/20 text-yellow-500',
    'Matched': 'bg-green-500/20 text-green-500',
    'Partial': 'bg-orange-500/20 text-orange-500',
    'Exception': 'bg-red-500/20 text-red-500',
    'Open': 'bg-red-500/20 text-red-500',
    'In Progress': 'bg-blue-500/20 text-blue-500',
    'Ready for Close': 'bg-yellow-500/20 text-yellow-500',
    'low': 'bg-gray-500/20 text-gray-500',
    'medium': 'bg-yellow-500/20 text-yellow-500',
    'high': 'bg-orange-500/20 text-orange-500',
    'critical': 'bg-red-500/20 text-red-500',
  };
  
  return colors[status] || 'bg-gray-500/20 text-gray-500';
}

// Priority Color
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    'low': 'border-l-gray-500',
    'medium': 'border-l-yellow-500',
    'high': 'border-l-orange-500',
    'critical': 'border-l-red-500',
  };
  
  return colors[priority] || 'border-l-gray-500';
}

// Export Helpers
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape values with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// Debounce
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Generate ID
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Validate Email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate PAN
export function isValidPAN(pan: string): boolean {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
}

// Mask Account Number
export function maskAccountNumber(accountNumber: string): string {
  if (accountNumber.length <= 4) return accountNumber;
  return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
}

// Parse Amount
export function parseAmount(amount: string): number {
  // Remove currency symbols and commas
  const cleaned = amount.replace(/[₹$,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

// Round to Decimal Places
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
