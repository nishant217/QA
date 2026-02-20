import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Bank, FDRateCard, Holiday, GLMapping, ApprovalMatrix } from '@/types';

interface MasterState {
  banks: Bank[];
  rateCards: FDRateCard[];
  holidays: Holiday[];
  glMappings: GLMapping[];
  approvalMatrix: ApprovalMatrix[];
  interestTypes: string[];
  dayCountConventions: string[];
  compoundingFrequencies: string[];
  tdsPlans: { value: string; label: string; rate: number }[];
  addBank: (bank: Omit<Bank, 'id' | 'createdAt'>) => void;
  updateBank: (id: string, updates: Partial<Bank>) => void;
  deleteBank: (id: string) => void;
  addRateCard: (rateCard: Omit<FDRateCard, 'id'>) => void;
  updateRateCard: (id: string, updates: Partial<FDRateCard>) => void;
  deleteRateCard: (id: string) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  deleteHoliday: (id: string) => void;
  getRateForBankAndTenor: (bankId: string, tenorDays: number, amount: number) => number | null;
}

const SEED_BANKS: Bank[] = [
  {
    id: 'bank-hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    ifscPrefix: 'HDFC',
    contactPerson: 'Rajesh Kumar',
    contactEmail: 'rajesh.kumar@hdfcbank.com',
    contactPhone: '+91-22-6160-6161',
    isActive: true,
    apiEnabled: true,
    maxFDAmount: 1000000000,
    creditRating: 'AAA',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-sbi',
    name: 'State Bank of India',
    shortName: 'SBI',
    ifscPrefix: 'SBIN',
    contactPerson: 'Suresh Patil',
    contactEmail: 'suresh.patil@sbi.co.in',
    contactPhone: '+91-22-2274-2935',
    isActive: true,
    apiEnabled: true,
    maxFDAmount: 2000000000,
    creditRating: 'AAA',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    ifscPrefix: 'ICIC',
    contactPerson: 'Anita Sharma',
    contactEmail: 'anita.sharma@icicibank.com',
    contactPhone: '+91-22-3366-7777',
    isActive: true,
    apiEnabled: true,
    maxFDAmount: 1000000000,
    creditRating: 'AAA',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    ifscPrefix: 'UTIB',
    contactPerson: 'Vikram Mehta',
    contactEmail: 'vikram.mehta@axisbank.com',
    contactPhone: '+91-22-2425-2525',
    isActive: true,
    apiEnabled: true,
    maxFDAmount: 750000000,
    creditRating: 'AA+',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-kotak',
    name: 'Kotak Mahindra Bank',
    shortName: 'Kotak',
    ifscPrefix: 'KKBK',
    contactPerson: 'Priya Nair',
    contactEmail: 'priya.nair@kotak.com',
    contactPhone: '+91-22-6160-6000',
    isActive: true,
    apiEnabled: true,
    maxFDAmount: 1000000000,
    creditRating: 'AAA',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-idfc',
    name: 'IDFC First Bank',
    shortName: 'IDFC',
    ifscPrefix: 'IDFB',
    contactPerson: 'Rahul Gupta',
    contactEmail: 'rahul.gupta@idfcfirstbank.com',
    contactPhone: '+91-1800-10-888',
    isActive: true,
    apiEnabled: false,
    maxFDAmount: 500000000,
    creditRating: 'AA',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-yes',
    name: 'Yes Bank',
    shortName: 'Yes',
    ifscPrefix: 'YESB',
    contactPerson: 'Deepak Joshi',
    contactEmail: 'deepak.joshi@yesbank.in',
    contactPhone: '+91-22-3099-3600',
    isActive: true,
    apiEnabled: false,
    maxFDAmount: 250000000,
    creditRating: 'A+',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'bank-indusind',
    name: 'IndusInd Bank',
    shortName: 'IndusInd',
    ifscPrefix: 'INDB',
    contactPerson: 'Neha Singh',
    contactEmail: 'neha.singh@indusind.com',
    contactPhone: '+91-22-4406-6666',
    isActive: true,
    apiEnabled: false,
    maxFDAmount: 500000000,
    creditRating: 'AA',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

const SEED_RATE_CARDS: FDRateCard[] = [
  // HDFC Bank
  { id: 'rc-hdfc-1', bankId: 'bank-hdfc', bankName: 'HDFC Bank', tenorMin: 7, tenorMax: 29, rate: 3.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-hdfc-2', bankId: 'bank-hdfc', bankName: 'HDFC Bank', tenorMin: 30, tenorMax: 90, rate: 4.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-hdfc-3', bankId: 'bank-hdfc', bankName: 'HDFC Bank', tenorMin: 91, tenorMax: 180, rate: 5.75, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-hdfc-4', bankId: 'bank-hdfc', bankName: 'HDFC Bank', tenorMin: 181, tenorMax: 364, rate: 6.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-hdfc-5', bankId: 'bank-hdfc', bankName: 'HDFC Bank', tenorMin: 365, tenorMax: 545, rate: 7.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-hdfc-6', bankId: 'bank-hdfc', bankName: 'HDFC Bank', tenorMin: 546, tenorMax: 730, rate: 7.40, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  
  // SBI
  { id: 'rc-sbi-1', bankId: 'bank-sbi', bankName: 'State Bank of India', tenorMin: 7, tenorMax: 45, rate: 3.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 1000 },
  { id: 'rc-sbi-2', bankId: 'bank-sbi', bankName: 'State Bank of India', tenorMin: 46, tenorMax: 179, rate: 5.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 1000 },
  { id: 'rc-sbi-3', bankId: 'bank-sbi', bankName: 'State Bank of India', tenorMin: 180, tenorMax: 364, rate: 6.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 1000 },
  { id: 'rc-sbi-4', bankId: 'bank-sbi', bankName: 'State Bank of India', tenorMin: 365, tenorMax: 730, rate: 7.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 1000 },
  { id: 'rc-sbi-5', bankId: 'bank-sbi', bankName: 'State Bank of India', tenorMin: 731, tenorMax: 1825, rate: 7.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 1000 },
  
  // ICICI
  { id: 'rc-icici-1', bankId: 'bank-icici', bankName: 'ICICI Bank', tenorMin: 7, tenorMax: 29, rate: 3.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-icici-2', bankId: 'bank-icici', bankName: 'ICICI Bank', tenorMin: 30, tenorMax: 90, rate: 4.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-icici-3', bankId: 'bank-icici', bankName: 'ICICI Bank', tenorMin: 91, tenorMax: 180, rate: 6.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-icici-4', bankId: 'bank-icici', bankName: 'ICICI Bank', tenorMin: 181, tenorMax: 270, rate: 7.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-icici-5', bankId: 'bank-icici', bankName: 'ICICI Bank', tenorMin: 271, tenorMax: 365, rate: 7.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-icici-6', bankId: 'bank-icici', bankName: 'ICICI Bank', tenorMin: 366, tenorMax: 730, rate: 7.75, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  
  // Axis
  { id: 'rc-axis-1', bankId: 'bank-axis', bankName: 'Axis Bank', tenorMin: 7, tenorMax: 29, rate: 3.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-axis-2', bankId: 'bank-axis', bankName: 'Axis Bank', tenorMin: 30, tenorMax: 90, rate: 4.75, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-axis-3', bankId: 'bank-axis', bankName: 'Axis Bank', tenorMin: 91, tenorMax: 180, rate: 6.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-axis-4', bankId: 'bank-axis', bankName: 'Axis Bank', tenorMin: 181, tenorMax: 364, rate: 7.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-axis-5', bankId: 'bank-axis', bankName: 'Axis Bank', tenorMin: 365, tenorMax: 545, rate: 7.60, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  
  // Kotak
  { id: 'rc-kotak-1', bankId: 'bank-kotak', bankName: 'Kotak Mahindra Bank', tenorMin: 7, tenorMax: 30, rate: 3.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 5000 },
  { id: 'rc-kotak-2', bankId: 'bank-kotak', bankName: 'Kotak Mahindra Bank', tenorMin: 31, tenorMax: 90, rate: 5.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 5000 },
  { id: 'rc-kotak-3', bankId: 'bank-kotak', bankName: 'Kotak Mahindra Bank', tenorMin: 91, tenorMax: 180, rate: 6.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 5000 },
  { id: 'rc-kotak-4', bankId: 'bank-kotak', bankName: 'Kotak Mahindra Bank', tenorMin: 181, tenorMax: 363, rate: 7.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 5000 },
  { id: 'rc-kotak-5', bankId: 'bank-kotak', bankName: 'Kotak Mahindra Bank', tenorMin: 364, tenorMax: 545, rate: 8.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 5000 },
  
  // IDFC
  { id: 'rc-idfc-1', bankId: 'bank-idfc', bankName: 'IDFC First Bank', tenorMin: 7, tenorMax: 30, rate: 4.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-idfc-2', bankId: 'bank-idfc', bankName: 'IDFC First Bank', tenorMin: 31, tenorMax: 90, rate: 5.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-idfc-3', bankId: 'bank-idfc', bankName: 'IDFC First Bank', tenorMin: 91, tenorMax: 180, rate: 7.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-idfc-4', bankId: 'bank-idfc', bankName: 'IDFC First Bank', tenorMin: 181, tenorMax: 365, rate: 8.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-idfc-5', bankId: 'bank-idfc', bankName: 'IDFC First Bank', tenorMin: 366, tenorMax: 545, rate: 8.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  
  // Yes Bank
  { id: 'rc-yes-1', bankId: 'bank-yes', bankName: 'Yes Bank', tenorMin: 7, tenorMax: 30, rate: 4.00, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-yes-2', bankId: 'bank-yes', bankName: 'Yes Bank', tenorMin: 31, tenorMax: 90, rate: 5.75, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-yes-3', bankId: 'bank-yes', bankName: 'Yes Bank', tenorMin: 91, tenorMax: 180, rate: 7.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-yes-4', bankId: 'bank-yes', bankName: 'Yes Bank', tenorMin: 181, tenorMax: 365, rate: 8.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-yes-5', bankId: 'bank-yes', bankName: 'Yes Bank', tenorMin: 366, tenorMax: 545, rate: 8.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  
  // IndusInd
  { id: 'rc-indus-1', bankId: 'bank-indusind', bankName: 'IndusInd Bank', tenorMin: 7, tenorMax: 29, rate: 3.75, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-indus-2', bankId: 'bank-indusind', bankName: 'IndusInd Bank', tenorMin: 30, tenorMax: 90, rate: 5.25, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-indus-3', bankId: 'bank-indusind', bankName: 'IndusInd Bank', tenorMin: 91, tenorMax: 180, rate: 6.75, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-indus-4', bankId: 'bank-indusind', bankName: 'IndusInd Bank', tenorMin: 181, tenorMax: 364, rate: 7.50, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
  { id: 'rc-indus-5', bankId: 'bank-indusind', bankName: 'IndusInd Bank', tenorMin: 365, tenorMax: 545, rate: 8.10, isSpecial: false, validFrom: '2026-01-01', minimumAmount: 10000 },
];

const SEED_HOLIDAYS: Holiday[] = [
  { id: 'hol-001', date: '2026-01-01', name: 'New Year', type: 'National', isRecurring: true },
  { id: 'hol-002', date: '2026-01-26', name: 'Republic Day', type: 'National', isRecurring: true },
  { id: 'hol-003', date: '2026-03-17', name: 'Holi', type: 'National', isRecurring: true },
  { id: 'hol-004', date: '2026-04-10', name: 'Good Friday', type: 'National', isRecurring: true },
  { id: 'hol-005', date: '2026-05-01', name: 'Labour Day', type: 'National', isRecurring: true },
  { id: 'hol-006', date: '2026-08-15', name: 'Independence Day', type: 'National', isRecurring: true },
  { id: 'hol-007', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'National', isRecurring: true },
  { id: 'hol-008', date: '2026-10-23', name: 'Dussehra', type: 'National', isRecurring: true },
  { id: 'hol-009', date: '2026-11-12', name: 'Diwali', type: 'National', isRecurring: true },
  { id: 'hol-010', date: '2026-12-25', name: 'Christmas', type: 'National', isRecurring: true },
];

const SEED_GL_MAPPINGS: GLMapping[] = [
  { id: 'gl-001', accountCode: '1001001', accountName: 'Fixed Deposits - HDFC', accountType: 'Asset', category: 'Investments', isActive: true },
  { id: 'gl-002', accountCode: '1001002', accountName: 'Fixed Deposits - SBI', accountType: 'Asset', category: 'Investments', isActive: true },
  { id: 'gl-003', accountCode: '1001003', accountName: 'Fixed Deposits - ICICI', accountType: 'Asset', category: 'Investments', isActive: true },
  { id: 'gl-004', accountCode: '4001001', accountName: 'Interest Income - FD', accountType: 'Income', category: 'Other Income', isActive: true },
  { id: 'gl-005', accountCode: '2001001', accountName: 'TDS Receivable', accountType: 'Asset', category: 'Current Assets', isActive: true },
  { id: 'gl-006', accountCode: '5001001', accountName: 'Bank Charges', accountType: 'Expense', category: 'Operating Expenses', isActive: true },
  { id: 'gl-007', accountCode: '1001004', accountName: 'Fixed Deposits - Others', accountType: 'Asset', category: 'Investments', isActive: true },
];

const SEED_APPROVAL_MATRIX: ApprovalMatrix[] = [
  { id: 'am-001', module: 'FD Booking', minAmount: 0, maxAmount: 10000000, approverRole: 'TREASURY_DEALER', isActive: true },
  { id: 'am-002', module: 'FD Booking', minAmount: 10000001, maxAmount: 50000000, approverRole: 'CFO', isActive: true },
  { id: 'am-003', module: 'FD Booking', minAmount: 50000001, maxAmount: 999999999999, approverRole: 'SYSTEM_ADMIN', isActive: true },
  { id: 'am-004', module: 'Rate Negotiation', minAmount: 0, maxAmount: 25000000, approverRole: 'TREASURY_DEALER', isActive: true },
  { id: 'am-005', module: 'Rate Negotiation', minAmount: 25000001, maxAmount: 999999999999, approverRole: 'CFO', isActive: true },
  { id: 'am-006', module: 'Accrual Posting', minAmount: 0, maxAmount: 999999999999, approverRole: 'CFO', isActive: true },
  { id: 'am-007', module: 'Maturity Action', minAmount: 0, maxAmount: 999999999999, approverRole: 'TREASURY_DEALER', isActive: true },
];

export const useMasterStore = create<MasterState>()(
  persist(
    (set, get) => ({
      banks: SEED_BANKS,
      rateCards: SEED_RATE_CARDS,
      holidays: SEED_HOLIDAYS,
      glMappings: SEED_GL_MAPPINGS,
      approvalMatrix: SEED_APPROVAL_MATRIX,
      interestTypes: ['Simple', 'Compound'],
      dayCountConventions: ['ACT/ACT', 'ACT/365', 'ACT/360', '30/360'],
      compoundingFrequencies: ['Monthly', 'Quarterly', 'Half-Yearly', 'Annual', 'At Maturity'],
      tdsPlans: [
        { value: 'WITH_PAN', label: 'With PAN (10% TDS)', rate: 10 },
        { value: 'WITHOUT_PAN', label: 'Without PAN (20% TDS)', rate: 20 },
        { value: 'EXEMPT_15G', label: 'Form 15G (No TDS)', rate: 0 },
        { value: 'EXEMPT_15H', label: 'Form 15H (No TDS - Senior Citizen)', rate: 0 },
      ],

      addBank: (bank) => {
        const newBank: Bank = {
          ...bank,
          id: `bank-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ banks: [...state.banks, newBank] }));
      },

      updateBank: (id, updates) => {
        set((state) => ({
          banks: state.banks.map(b => b.id === id ? { ...b, ...updates } : b),
        }));
      },

      deleteBank: (id) => {
        set((state) => ({
          banks: state.banks.filter(b => b.id !== id),
        }));
      },

      addRateCard: (rateCard) => {
        const newRateCard: FDRateCard = {
          ...rateCard,
          id: `rc-${Date.now()}`,
        };
        set((state) => ({ rateCards: [...state.rateCards, newRateCard] }));
      },

      updateRateCard: (id, updates) => {
        set((state) => ({
          rateCards: state.rateCards.map(rc => rc.id === id ? { ...rc, ...updates } : rc),
        }));
      },

      deleteRateCard: (id) => {
        set((state) => ({
          rateCards: state.rateCards.filter(rc => rc.id !== id),
        }));
      },

      addHoliday: (holiday) => {
        const newHoliday: Holiday = {
          ...holiday,
          id: `hol-${Date.now()}`,
        };
        set((state) => ({ holidays: [...state.holidays, newHoliday] }));
      },

      deleteHoliday: (id) => {
        set((state) => ({
          holidays: state.holidays.filter(h => h.id !== id),
        }));
      },

      getRateForBankAndTenor: (bankId, tenorDays, amount) => {
        const rateCard = get().rateCards.find(
          rc => rc.bankId === bankId &&
                tenorDays >= rc.tenorMin &&
                tenorDays <= rc.tenorMax &&
                amount >= rc.minimumAmount &&
                (!rc.maximumAmount || amount <= rc.maximumAmount)
        );
        return rateCard?.rate || null;
      },
    }),
    {
      name: 'nyneos-master',
    }
  )
);
