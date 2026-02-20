import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FD, CashFlowEntry } from '@/types';

interface FDState {
  fdMaster: FD[];
  cashFlowSchedules: CashFlowEntry[];
  addFD: (fd: Omit<FD, 'id' | 'createdAt'>) => void;
  updateFD: (id: string, updates: Partial<FD>) => void;
  deleteFD: (id: string) => void;
  getFDById: (id: string) => FD | undefined;
  getActiveFDs: () => FD[];
  getFDsByBank: (bankId: string) => FD[];
  getFDsByStatus: (status: FD['status']) => FD[];
  getMaturingFDs: (days: number) => FD[];
  getTotalPortfolio: () => number;
  generateCashFlow: (fdId: string) => CashFlowEntry[];
}

// Calculate maturity amount based on interest type
const calculateMaturityAmount = (
  principal: number,
  rate: number,
  tenorDays: number,
  interestType: FD['interestType'],
  compoundingFrequency: FD['compoundingFrequency'],
  dayCount: FD['dayCountConvention']
): { maturityAmount: number; totalInterest: number } => {
  const daysInYear = dayCount === 'ACT/360' ? 360 : 365;
  
  if (interestType === 'Simple') {
    const interest = principal * (rate / 100) * (tenorDays / daysInYear);
    return {
      maturityAmount: principal + interest,
      totalInterest: interest,
    };
  } else {
    // Compound interest
    const frequencyMap: Record<string, number> = {
      'Monthly': 12,
      'Quarterly': 4,
      'Half-Yearly': 2,
      'Annual': 1,
      'At Maturity': 1,
    };
    const n = frequencyMap[compoundingFrequency] || 4;
    const years = tenorDays / daysInYear;
    const maturityAmount = principal * Math.pow(1 + (rate / 100) / n, n * years);
    return {
      maturityAmount,
      totalInterest: maturityAmount - principal,
    };
  }
};

// Seed FD data
const SEED_FDS: FD[] = [
  {
    id: 'fd-001',
    referenceNumber: 'FD-2026-001',
    bankId: 'bank-hdfc',
    bankName: 'HDFC Bank',
    bankFDRef: 'HDFC/FD/2026/A123456',
    principal: 20000000,
    interestRate: 7.50,
    startDate: '2026-01-15',
    maturityDate: '2027-01-15',
    tenorDays: 365,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/ACT',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '50100234567890',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-01-15T10:30:00Z',
    createdBy: 'admin-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'fd-002',
    referenceNumber: 'FD-2026-002',
    bankId: 'bank-sbi',
    bankName: 'State Bank of India',
    bankFDRef: 'SBI/FD/2026/B789012',
    principal: 5000000,
    interestRate: 7.25,
    startDate: '2026-01-10',
    maturityDate: '2028-01-10',
    tenorDays: 730,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '345678901234',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-01-10T09:15:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'fd-003',
    referenceNumber: 'FD-2026-003',
    bankId: 'bank-icici',
    bankName: 'ICICI Bank',
    bankFDRef: 'ICICI/FD/2026/C345678',
    principal: 15000000,
    interestRate: 7.75,
    startDate: '2026-02-01',
    maturityDate: '2026-07-31',
    tenorDays: 180,
    interestType: 'Simple',
    compoundingFrequency: 'At Maturity',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '123456789012',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-02-01T14:20:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-02-01T15:00:00Z',
  },
  {
    id: 'fd-004',
    referenceNumber: 'FD-2026-004',
    bankId: 'bank-axis',
    bankName: 'Axis Bank',
    bankFDRef: 'AXIS/FD/2026/D901234',
    principal: 7500000,
    interestRate: 7.60,
    startDate: '2025-02-20',
    maturityDate: '2026-02-20',
    tenorDays: 365,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Near Maturity',
    accountNumber: '910111213141',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2025-02-20T11:00:00Z',
    createdBy: 'admin-001',
    approvedBy: 'admin-001',
    approvedAt: '2025-02-20T12:00:00Z',
  },
  {
    id: 'fd-005',
    referenceNumber: 'FD-2026-005',
    bankId: 'bank-kotak',
    bankName: 'Kotak Mahindra Bank',
    bankFDRef: 'KOTAK/FD/2026/E567890',
    principal: 30000000,
    interestRate: 8.00,
    startDate: '2026-01-05',
    maturityDate: '2027-07-05',
    tenorDays: 545,
    interestType: 'Compound',
    compoundingFrequency: 'Half-Yearly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '515253545556',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-01-05T10:00:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-01-05T11:30:00Z',
  },
  {
    id: 'fd-006',
    referenceNumber: 'FD-2026-006',
    bankId: 'bank-idfc',
    bankName: 'IDFC First Bank',
    bankFDRef: 'IDFC/FD/2026/F123789',
    principal: 10000000,
    interestRate: 8.25,
    startDate: '2026-01-20',
    maturityDate: '2027-01-20',
    tenorDays: 365,
    interestType: 'Compound',
    compoundingFrequency: 'Monthly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '616263646566',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-01-20T09:30:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'fd-007',
    referenceNumber: 'FD-2026-007',
    bankId: 'bank-hdfc',
    bankName: 'HDFC Bank',
    bankFDRef: 'HDFC/FD/2026/G456123',
    principal: 50000000,
    interestRate: 7.40,
    startDate: '2026-02-10',
    maturityDate: '2026-11-07',
    tenorDays: 270,
    interestType: 'Simple',
    compoundingFrequency: 'At Maturity',
    dayCountConvention: 'ACT/ACT',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '50100234567891',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-02-10T13:45:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-02-10T14:30:00Z',
  },
  {
    id: 'fd-008',
    referenceNumber: 'FD-2026-008',
    bankId: 'bank-sbi',
    bankName: 'State Bank of India',
    bankFDRef: 'SBI/FD/2026/H789456',
    principal: 25000000,
    interestRate: 7.30,
    startDate: '2025-08-15',
    maturityDate: '2026-02-15',
    tenorDays: 180,
    interestType: 'Simple',
    compoundingFrequency: 'At Maturity',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Matured',
    accountNumber: '345678901235',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2025-08-15T10:00:00Z',
    createdBy: 'admin-001',
    approvedBy: 'admin-001',
    approvedAt: '2025-08-15T11:00:00Z',
  },
  {
    id: 'fd-009',
    referenceNumber: 'FD-2026-009',
    bankId: 'bank-yes',
    bankName: 'Yes Bank',
    bankFDRef: 'YES/FD/2026/I321654',
    principal: 10000000,
    interestRate: 8.50,
    startDate: '2026-01-25',
    maturityDate: '2027-01-25',
    tenorDays: 365,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '717273747576',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-01-25T11:30:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-01-25T12:00:00Z',
  },
  {
    id: 'fd-010',
    referenceNumber: 'FD-2026-010',
    bankId: 'bank-indusind',
    bankName: 'IndusInd Bank',
    bankFDRef: 'INDUS/FD/2026/J987654',
    principal: 8000000,
    interestRate: 8.10,
    startDate: '2026-02-05',
    maturityDate: '2028-02-05',
    tenorDays: 730,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '818283848586',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-02-05T09:00:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-02-05T10:00:00Z',
  },
  {
    id: 'fd-011',
    referenceNumber: 'FD-2026-011',
    bankId: 'bank-icici',
    bankName: 'ICICI Bank',
    bankFDRef: 'ICICI/FD/2026/K147258',
    principal: 40000000,
    interestRate: 7.50,
    startDate: '2026-02-15',
    maturityDate: '2026-08-14',
    tenorDays: 180,
    interestType: 'Simple',
    compoundingFrequency: 'At Maturity',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '123456789013',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-02-15T14:00:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-02-15T15:00:00Z',
  },
  {
    id: 'fd-012',
    referenceNumber: 'FD-2026-012',
    bankId: 'bank-axis',
    bankName: 'Axis Bank',
    bankFDRef: 'AXIS/FD/2026/L369852',
    principal: 12500000,
    interestRate: 7.70,
    startDate: '2025-02-25',
    maturityDate: '2026-02-25',
    tenorDays: 365,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Near Maturity',
    accountNumber: '910111213142',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2025-02-25T10:30:00Z',
    createdBy: 'admin-001',
    approvedBy: 'admin-001',
    approvedAt: '2025-02-25T11:00:00Z',
  },
  {
    id: 'fd-013',
    referenceNumber: 'FD-2026-013',
    bankId: 'bank-kotak',
    bankName: 'Kotak Mahindra Bank',
    bankFDRef: 'KOTAK/FD/2026/M741852',
    principal: 6000000,
    interestRate: 7.90,
    startDate: '2026-01-12',
    maturityDate: '2027-07-12',
    tenorDays: 545,
    interestType: 'Compound',
    compoundingFrequency: 'Half-Yearly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '515253545557',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-01-12T11:00:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-01-12T12:00:00Z',
  },
  {
    id: 'fd-014',
    referenceNumber: 'FD-2026-014',
    bankId: 'bank-hdfc',
    bankName: 'HDFC Bank',
    bankFDRef: 'HDFC/FD/2026/N963741',
    principal: 35000000,
    interestRate: 7.45,
    startDate: '2026-02-08',
    maturityDate: '2026-11-05',
    tenorDays: 270,
    interestType: 'Simple',
    compoundingFrequency: 'At Maturity',
    dayCountConvention: 'ACT/ACT',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '50100234567892',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-02-08T09:45:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-02-08T10:30:00Z',
  },
  {
    id: 'fd-015',
    referenceNumber: 'FD-2026-015',
    bankId: 'bank-idfc',
    bankName: 'IDFC First Bank',
    bankFDRef: 'IDFC/FD/2026/O159753',
    principal: 17500000,
    interestRate: 8.35,
    startDate: '2026-02-18',
    maturityDate: '2027-02-18',
    tenorDays: 365,
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    status: 'Active',
    accountNumber: '616263646567',
    beneficiaryName: 'ABC Manufacturing Ltd.',
    createdAt: '2026-02-18T13:00:00Z',
    createdBy: 'demo-001',
    approvedBy: 'admin-001',
    approvedAt: '2026-02-18T14:00:00Z',
  },
];

// Calculate maturity amounts for all FDs
SEED_FDS.forEach(fd => {
  const calc = calculateMaturityAmount(
    fd.principal,
    fd.interestRate,
    fd.tenorDays,
    fd.interestType,
    fd.compoundingFrequency,
    fd.dayCountConvention
  );
  fd.maturityAmount = calc.maturityAmount;
  fd.interestAccrued = calc.totalInterest;
  fd.tdsDeducted = calc.totalInterest * 0.10;
  fd.netInterest = calc.totalInterest * 0.90;
});

export const useFDStore = create<FDState>()(
  persist(
    (set, get) => ({
      fdMaster: SEED_FDS,
      cashFlowSchedules: [],

      addFD: (fd) => {
        const calc = calculateMaturityAmount(
          fd.principal,
          fd.interestRate,
          fd.tenorDays,
          fd.interestType,
          fd.compoundingFrequency,
          fd.dayCountConvention
        );

        const newFD: FD = {
          ...fd,
          id: `fd-${Date.now()}`,
          createdAt: new Date().toISOString(),
          maturityAmount: calc.maturityAmount,
          interestAccrued: calc.totalInterest,
          tdsDeducted: calc.totalInterest * 0.10,
          netInterest: calc.totalInterest * 0.90,
        };

        set((state) => ({
          fdMaster: [...state.fdMaster, newFD],
        }));
      },

      updateFD: (id, updates) => {
        set((state) => ({
          fdMaster: state.fdMaster.map(fd =>
            fd.id === id ? { ...fd, ...updates } : fd
          ),
        }));
      },

      deleteFD: (id) => {
        set((state) => ({
          fdMaster: state.fdMaster.filter(fd => fd.id !== id),
        }));
      },

      getFDById: (id) => {
        return get().fdMaster.find(fd => fd.id === id);
      },

      getActiveFDs: () => {
        return get().fdMaster.filter(fd => fd.status === 'Active' || fd.status === 'Near Maturity');
      },

      getFDsByBank: (bankId) => {
        return get().fdMaster.filter(fd => fd.bankId === bankId);
      },

      getFDsByStatus: (status) => {
        return get().fdMaster.filter(fd => fd.status === status);
      },

      getMaturingFDs: (days) => {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        
        return get().fdMaster.filter(fd => {
          const maturityDate = new Date(fd.maturityDate);
          return (
            (fd.status === 'Active' || fd.status === 'Near Maturity') &&
            maturityDate >= today &&
            maturityDate <= futureDate
          );
        });
      },

      getTotalPortfolio: () => {
        return get().fdMaster
          .filter(fd => fd.status === 'Active' || fd.status === 'Near Maturity')
          .reduce((sum, fd) => sum + fd.principal, 0);
      },

      generateCashFlow: (fdId) => {
        const fd = get().getFDById(fdId);
        if (!fd) return [];

        const cashFlows: CashFlowEntry[] = [];
        const startDate = new Date(fd.startDate);
        const maturityDate = new Date(fd.maturityDate);
        
        if (fd.interestType === 'Simple') {
          // Simple interest - only at maturity
          cashFlows.push({
            id: `cf-${fdId}-maturity`,
            fdId,
            fdReferenceNumber: fd.referenceNumber,
            bankName: fd.bankName,
            date: fd.maturityDate,
            type: 'Net',
            amount: fd.netInterest || 0,
            isProjected: true,
          });
        } else {
          // Compound interest - periodic payouts
          const frequencyMap: Record<string, number> = {
            'Monthly': 1,
            'Quarterly': 3,
            'Half-Yearly': 6,
            'Annual': 12,
          };
          const months = frequencyMap[fd.compoundingFrequency] || 3;
          
          let currentDate = new Date(startDate);
          while (currentDate < maturityDate) {
            currentDate.setMonth(currentDate.getMonth() + months);
            if (currentDate <= maturityDate) {
              const periodInterest = (fd.principal * (fd.interestRate / 100) * (months * 30)) / 365;
              cashFlows.push({
                id: `cf-${fdId}-${currentDate.toISOString()}`,
                fdId,
                fdReferenceNumber: fd.referenceNumber,
                bankName: fd.bankName,
                date: currentDate.toISOString().split('T')[0],
                type: 'Interest',
                amount: periodInterest,
                isProjected: true,
              });
            }
          }
        }

        return cashFlows;
      },
    }),
    {
      name: 'nyneos-fd',
    }
  )
);
