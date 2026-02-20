import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FD } from '@/types';

export interface AccrualEntry {
  id: string;
  fdId: string;
  fdRef: string;
  bankName: string;
  principal: number;
  interestRate: number;
  accrualDate: string;
  fromDate: string;
  toDate: string;
  daysAccrued: number;
  dailyInterestRate: number;
  interestAccrued: number;
  tdsRate: number;
  tdsAmount: number;
  netInterest: number;
  compoundingFrequency: string;
  dayCountConvention: string;
  isCompound: boolean;
  runId: string;
  status: 'CALCULATED' | 'POSTED' | 'REVERSED';
  createdAt: string;
  createdBy: string;
  postedAt?: string;
  postedBy?: string;
}

export interface AccrualRun {
  id: string;
  runDate: string;
  periodFrom: string;
  periodTo: string;
  runType: 'SIMULATION' | 'FINAL';
  status: 'DRAFT' | 'COMPLETED' | 'POSTED' | 'CANCELLED';
  totalFDs: number;
  totalPrincipal: number;
  totalInterest: number;
  totalTDS: number;
  totalNet: number;
  entries: AccrualEntry[];
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  runId: string;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  reference: string;
}

interface AccrualState {
  accrualRuns: AccrualRun[];
  currentRun: AccrualRun | null;
  isCalculating: boolean;
  
  // Actions
  createAccrualRun: (periodFrom: string, periodTo: string, runType: 'SIMULATION' | 'FINAL') => string;
  calculateAccruals: (runId: string, fdList: FD[]) => Promise<void>;
  finalizeRun: (runId: string, userId: string) => void;
  cancelRun: (runId: string, reason: string) => void;
  reverseRun: (runId: string, reason: string) => void;
  getAccrualHistory: (fdId: string) => AccrualEntry[];
  getTotalAccrualsForPeriod: (fromDate: string, toDate: string) => number;
  generateJournalEntries: (runId: string) => JournalEntry[];
  
  // Calculation utilities
  calculateSimpleInterest: (principal: number, rate: number, days: number, dayCountConvention: string) => number;
  calculateCompoundInterest: (principal: number, rate: number, days: number, compoundingFrequency: string, dayCountConvention: string) => number;
  getDaysInPeriod: (fromDate: string, toDate: string) => number;
  getDaysInYear: (date: string, dayCountConvention: string) => number;
  calculateTDS: (interestAmount: number, tdsRate: number) => number;
  
  // Getters
  getRunById: (runId: string) => AccrualRun | undefined;
  getActiveRuns: () => AccrualRun[];
  getCompletedRuns: () => AccrualRun[];
}

const TDS_RATES = {
  'WITH_PAN': 0.10,     // 10% TDS with PAN
  'WITHOUT_PAN': 0.20,  // 20% TDS without PAN
  'EXEMPT_15G': 0.00,   // No TDS with 15G
  'EXEMPT_15H': 0.00,   // No TDS with 15H
};

export const useAccrualStore = create<AccrualState>()(
  persist(
    (set, get) => ({
      accrualRuns: [],
      currentRun: null,
      isCalculating: false,

      createAccrualRun: (periodFrom: string, periodTo: string, runType: 'SIMULATION' | 'FINAL') => {
        const runId = `acr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newRun: AccrualRun = {
          id: runId,
          runDate: new Date().toISOString(),
          periodFrom,
          periodTo,
          runType,
          status: 'DRAFT',
          totalFDs: 0,
          totalPrincipal: 0,
          totalInterest: 0,
          totalTDS: 0,
          totalNet: 0,
          entries: [],
          createdAt: new Date().toISOString(),
          createdBy: 'current-user', // Would be from auth store
        };

        set(state => ({
          accrualRuns: [...state.accrualRuns, newRun],
          currentRun: newRun,
        }));

        return runId;
      },

      calculateAccruals: async (runId: string, fdList: FD[]) => {
        set({ isCalculating: true });
        
        const run = get().getRunById(runId);
        if (!run) {
          set({ isCalculating: false });
          return;
        }

        // Simulate calculation delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const entries: AccrualEntry[] = [];
        let totalPrincipal = 0;
        let totalInterest = 0;
        let totalTDS = 0;

        for (const fd of fdList) {
          if (fd.status !== 'Active' && fd.status !== 'Near Maturity') continue;

          const days = get().getDaysInPeriod(run.periodFrom, run.periodTo);
          const tdsRate = TDS_RATES[fd.tdsPlan] || TDS_RATES.WITH_PAN;
          
          let interestAccrued: number;
          
          if (fd.interestType === 'Simple') {
            interestAccrued = get().calculateSimpleInterest(
              fd.principal, 
              fd.interestRate, 
              days, 
              fd.dayCountConvention
            );
          } else {
            interestAccrued = get().calculateCompoundInterest(
              fd.principal, 
              fd.interestRate, 
              days, 
              fd.compoundingFrequency, 
              fd.dayCountConvention
            );
          }

          const tdsAmount = get().calculateTDS(interestAccrued, tdsRate);
          const netInterest = interestAccrued - tdsAmount;

          const entry: AccrualEntry = {
            id: `ace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            fdId: fd.id,
            fdRef: fd.referenceNumber,
            bankName: fd.bankName,
            principal: fd.principal,
            interestRate: fd.interestRate,
            accrualDate: new Date().toISOString(),
            fromDate: run.periodFrom,
            toDate: run.periodTo,
            daysAccrued: days,
            dailyInterestRate: fd.interestRate / get().getDaysInYear(run.periodTo, fd.dayCountConvention),
            interestAccrued,
            tdsRate,
            tdsAmount,
            netInterest,
            compoundingFrequency: fd.compoundingFrequency,
            dayCountConvention: fd.dayCountConvention,
            isCompound: fd.interestType === 'Compound',
            runId,
            status: 'CALCULATED',
            createdAt: new Date().toISOString(),
            createdBy: 'current-user',
          };

          entries.push(entry);
          totalPrincipal += fd.principal;
          totalInterest += interestAccrued;
          totalTDS += tdsAmount;
        }

        const totalNet = totalInterest - totalTDS;

        set(state => ({
          accrualRuns: state.accrualRuns.map(r => 
            r.id === runId 
              ? { 
                  ...r, 
                  status: 'COMPLETED' as const,
                  totalFDs: entries.length,
                  totalPrincipal,
                  totalInterest,
                  totalTDS,
                  totalNet,
                  entries 
                }
              : r
          ),
          currentRun: state.currentRun?.id === runId 
            ? { ...state.currentRun, status: 'COMPLETED' as const, entries, totalFDs: entries.length, totalPrincipal, totalInterest, totalTDS, totalNet }
            : state.currentRun,
          isCalculating: false,
        }));
      },

      finalizeRun: (runId: string, userId: string) => {
        set(state => ({
          accrualRuns: state.accrualRuns.map(r => 
            r.id === runId 
              ? { 
                  ...r, 
                  status: 'POSTED' as const,
                  approvedBy: userId,
                  approvedAt: new Date().toISOString(),
                  entries: r.entries.map(e => ({ ...e, status: 'POSTED' as const, postedAt: new Date().toISOString(), postedBy: userId }))
                }
              : r
          ),
          currentRun: state.currentRun?.id === runId 
            ? { ...state.currentRun, status: 'POSTED' as const, approvedBy: userId, approvedAt: new Date().toISOString() }
            : state.currentRun,
        }));
      },

      cancelRun: (runId: string, reason: string) => {
        set(state => ({
          accrualRuns: state.accrualRuns.map(r => 
            r.id === runId 
              ? { ...r, status: 'CANCELLED' as const, notes: reason }
              : r
          ),
        }));
      },

      reverseRun: (runId: string, reason: string) => {
        set(state => ({
          accrualRuns: state.accrualRuns.map(r => 
            r.id === runId 
              ? { 
                  ...r, 
                  notes: `${r.notes || ''}\nREVERSED: ${reason}`,
                  entries: r.entries.map(e => ({ ...e, status: 'REVERSED' as const }))
                }
              : r
          ),
        }));
      },

      getAccrualHistory: (fdId: string) => {
        const { accrualRuns } = get();
        return accrualRuns
          .flatMap(run => run.entries)
          .filter(entry => entry.fdId === fdId)
          .sort((a, b) => new Date(b.accrualDate).getTime() - new Date(a.accrualDate).getTime());
      },

      getTotalAccrualsForPeriod: (fromDate: string, toDate: string) => {
        const { accrualRuns } = get();
        return accrualRuns
          .filter(run => run.status === 'POSTED')
          .flatMap(run => run.entries)
          .filter(entry => entry.fromDate >= fromDate && entry.toDate <= toDate)
          .reduce((sum, entry) => sum + entry.interestAccrued, 0);
      },

      generateJournalEntries: (runId: string) => {
        const run = get().getRunById(runId);
        if (!run) return [];

        const entries: JournalEntry[] = [];

        // Group by bank for journal entries
        const bankGroups = run.entries.reduce((groups, entry) => {
          if (!groups[entry.bankName]) {
            groups[entry.bankName] = {
              totalInterest: 0,
              totalTDS: 0,
              totalNet: 0,
            };
          }
          groups[entry.bankName].totalInterest += entry.interestAccrued;
          groups[entry.bankName].totalTDS += entry.tdsAmount;
          groups[entry.bankName].totalNet += entry.netInterest;
          return groups;
        }, {} as Record<string, { totalInterest: number; totalTDS: number; totalNet: number }>);

        // Create journal entries for each bank
        Object.entries(bankGroups).forEach(([bankName, totals]) => {
          // Debit: FD Accrued Interest Receivable
          entries.push({
            id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            runId,
            accountCode: '1300001',
            accountName: `Accrued Interest - ${bankName}`,
            description: `Interest accrual ${run.periodFrom} to ${run.periodTo}`,
            debitAmount: totals.totalInterest,
            creditAmount: 0,
            reference: `ACR-${run.id}`,
          });

          // Credit: Interest Income
          entries.push({
            id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            runId,
            accountCode: '4000001',
            accountName: 'Interest Income - Fixed Deposits',
            description: `Interest accrual ${run.periodFrom} to ${run.periodTo}`,
            debitAmount: 0,
            creditAmount: totals.totalNet,
            reference: `ACR-${run.id}`,
          });

          // Credit: TDS Receivable (if any)
          if (totals.totalTDS > 0) {
            entries.push({
              id: `je-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              runId,
              accountCode: '1200001',
              accountName: 'TDS Receivable',
              description: `TDS on interest accrual ${run.periodFrom} to ${run.periodTo}`,
              debitAmount: 0,
              creditAmount: totals.totalTDS,
              reference: `ACR-${run.id}`,
            });
          }
        });

        return entries;
      },

      // Calculation utilities
      calculateSimpleInterest: (principal: number, rate: number, days: number, dayCountConvention: string) => {
        const daysInYear = get().getDaysInYear('2024-01-01', dayCountConvention);
        return (principal * rate * days) / (100 * daysInYear);
      },

      calculateCompoundInterest: (principal: number, rate: number, days: number, compoundingFrequency: string, dayCountConvention: string) => {
        const daysInYear = get().getDaysInYear('2024-01-01', dayCountConvention);
        const annualRate = rate / 100;
        
        let compoundingPeriods: number;
        switch (compoundingFrequency) {
          case 'Monthly': compoundingPeriods = 12; break;
          case 'Quarterly': compoundingPeriods = 4; break;
          case 'Half-Yearly': compoundingPeriods = 2; break;
          case 'Annual': compoundingPeriods = 1; break;
          default: compoundingPeriods = 1;
        }
        
        const periodsElapsed = (days * compoundingPeriods) / daysInYear;
        const futureValue = principal * Math.pow(1 + (annualRate / compoundingPeriods), periodsElapsed);
        
        return futureValue - principal;
      },

      getDaysInPeriod: (fromDate: string, toDate: string) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const diffTime = Math.abs(to.getTime() - from.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      },

      getDaysInYear: (date: string, dayCountConvention: string) => {
        const year = new Date(date).getFullYear();
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        
        switch (dayCountConvention) {
          case 'ACT/ACT':
          case 'ACT/365': return 365;
          case 'ACT/360': return 360;
          case '30/360': return 360;
          default: return isLeapYear ? 366 : 365;
        }
      },

      calculateTDS: (interestAmount: number, tdsRate: number) => {
        return interestAmount * tdsRate;
      },

      // Getters
      getRunById: (runId: string) => {
        return get().accrualRuns.find(run => run.id === runId);
      },

      getActiveRuns: () => {
        return get().accrualRuns.filter(run => run.status === 'DRAFT' || run.status === 'COMPLETED');
      },

      getCompletedRuns: () => {
        return get().accrualRuns.filter(run => run.status === 'POSTED');
      },
    }),
    {
      name: 'accrual-store',
      partialize: (state) => ({
        accrualRuns: state.accrualRuns,
        // Don't persist currentRun and isCalculating
      }),
    }
  )
);