import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  Calculator,
  Calendar,
  Percent,
  Wallet,
  ChevronRight,
  Check,
  FileText,
  Upload,
} from 'lucide-react';
import { useFDStore, useMasterStore, useNotificationStore } from '@/stores';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, label: 'Bank Selection' },
  { id: 2, label: 'FD Details' },
  { id: 3, label: 'Review & Confirm' },
];

export default function FDBooking() {
  const navigate = useNavigate();
  const { addFD } = useFDStore();
  const { banks, rateCards, tdsPlans, getRateForBankAndTenor } = useMasterStore();
  const { addNotification } = useNotificationStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    bankId: '',
    principal: '',
    tenorDays: '',
    interestRate: '',
    interestType: 'Compound',
    compoundingFrequency: 'Quarterly',
    dayCountConvention: 'ACT/365',
    tdsPlan: 'WITH_PAN',
    startDate: new Date().toISOString().split('T')[0],
    accountNumber: '',
    beneficiaryName: '',
    notes: '',
  });

  const selectedBank = banks.find((b) => b.id === formData.bankId);

  const calculateMaturityDate = () => {
    if (!formData.startDate || !formData.tenorDays) return '';
    const start = new Date(formData.startDate);
    const maturity = new Date(start);
    maturity.setDate(start.getDate() + parseInt(formData.tenorDays));
    return maturity.toISOString().split('T')[0];
  };

  const calculateMaturityAmount = () => {
    const principal = parseFloat(formData.principal) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    const days = parseInt(formData.tenorDays) || 0;

    if (!principal || !rate || !days) return 0;

    const dayCount = formData.dayCountConvention === 'ACT/360' ? 360 : 365;

    if (formData.interestType === 'Simple') {
      const interest = principal * (rate / 100) * (days / dayCount);
      return principal + interest;
    } else {
      const frequencyMap: Record<string, number> = {
        Monthly: 12,
        Quarterly: 4,
        'Half-Yearly': 2,
        Annual: 1,
        'At Maturity': 1,
      };
      const n = frequencyMap[formData.compoundingFrequency] || 4;
      const years = days / dayCount;
      return principal * Math.pow(1 + (rate / 100) / n, n * years);
    }
  };

  const handleBankSelect = (bankId: string) => {
    setFormData((prev) => ({ ...prev, bankId }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Auto-calculate rate when tenor changes
    if (field === 'tenorDays' && formData.bankId) {
      const rate = getRateForBankAndTenor(
        formData.bankId,
        parseInt(value) || 0,
        parseFloat(formData.principal) || 0
      );
      if (rate) {
        setFormData((prev) => ({ ...prev, interestRate: rate.toString() }));
      }
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const principal = parseFloat(formData.principal);
      const tenorDays = parseInt(formData.tenorDays);
      const interestRate = parseFloat(formData.interestRate);

      if (!formData.bankId || !principal || !tenorDays || !interestRate) {
        toast.error('Please fill in all required fields');
        return;
      }

      const maturityDate = calculateMaturityDate();
      const referenceNumber = `FD-2026-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`;

      addFD({
        referenceNumber,
        bankId: formData.bankId,
        bankName: selectedBank?.name || '',
        principal,
        interestRate,
        startDate: formData.startDate,
        maturityDate,
        tenorDays,
        interestType: formData.interestType as 'Simple' | 'Compound',
        compoundingFrequency: formData.compoundingFrequency as any,
        dayCountConvention: formData.dayCountConvention as any,
        tdsPlan: formData.tdsPlan as any,
        status: 'Active',
        accountNumber: formData.accountNumber,
        beneficiaryName: formData.beneficiaryName,
        notes: formData.notes,
        createdBy: 'demo-001',
      });

      // Add notification
      addNotification({
        type: 'fd_event',
        priority: 'medium',
        title: 'New FD Booked',
        description: `${referenceNumber} created — ${formatCurrency(principal)} @ ${interestRate}% with ${selectedBank?.name}`,
        relatedEntityId: referenceNumber,
        relatedEntityType: 'fd',
        actionUrl: '/fd-master',
        actionLabel: 'View FD',
      });

      toast.success('FD booked successfully!');
      navigate('/fd-master');
    } catch (error) {
      toast.error('Failed to book FD. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.bankId;
      case 2:
        return (
          !!formData.principal &&
          !!formData.tenorDays &&
          !!formData.interestRate &&
          !!formData.startDate
        );
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">FD Booking</h1>
        <p className="text-[var(--text-muted)]">Book a new fixed deposit</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                currentStep === step.id
                  ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                  : currentStep > step.id
                  ? 'bg-green-500/20 text-green-500'
                  : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-[var(--accent)] text-white'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--border)] text-[var(--text-muted)]'
                }`}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className="text-sm font-medium">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="card-surface p-6">
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Select Bank</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks
                .filter((b) => b.isActive)
                .map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleBankSelect(bank.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.bankId === bank.id
                        ? 'border-[var(--accent)] bg-[var(--accent-glow)]'
                        : 'border-[var(--border)] hover:border-[var(--border-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-[var(--accent)]" />
                      <span className="font-medium text-[var(--text-primary)]">{bank.name}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">Rating: {bank.creditRating || 'N/A'}</p>
                    <p className="text-sm text-[var(--text-muted)]">Max FD: {formatCurrency(bank.maxFDAmount)}</p>
                  </button>
                ))}
            </div>

            {selectedBank && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Available Rates</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="text-left p-2">Tenor Range</th>
                        <th className="text-right p-2">Rate</th>
                        <th className="text-right p-2">Min Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rateCards
                        .filter((rc) => rc.bankId === selectedBank.id)
                        .map((rc) => (
                          <tr key={rc.id} className="table-row">
                            <td className="p-2 text-[var(--text-primary)]">
                              {rc.tenorMin} - {rc.tenorMax} days
                            </td>
                            <td className="p-2 text-right font-mono text-[var(--accent)]">{rc.rate}%</td>
                            <td className="p-2 text-right font-mono text-[var(--text-muted)]">
                              {formatCurrency(rc.minimumAmount)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">FD Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Principal Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
                  <input
                    type="number"
                    value={formData.principal}
                    onChange={(e) => handleInputChange('principal', e.target.value)}
                    placeholder="Enter amount"
                    className="input-field pl-12 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Tenor (Days) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
                  <input
                    type="number"
                    value={formData.tenorDays}
                    onChange={(e) => handleInputChange('tenorDays', e.target.value)}
                    placeholder="Enter tenor in days"
                    className="input-field pl-12 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Interest Rate (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-subtle)]" />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    placeholder="Enter interest rate"
                    className="input-field pl-12 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Interest Type
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) => handleInputChange('interestType', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="Simple">Simple Interest</option>
                  <option value="Compound">Compound Interest</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Compounding Frequency
                </label>
                <select
                  value={formData.compoundingFrequency}
                  onChange={(e) => handleInputChange('compoundingFrequency', e.target.value)}
                  className="input-field w-full"
                  disabled={formData.interestType === 'Simple'}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Annual">Annual</option>
                  <option value="At Maturity">At Maturity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Day Count Convention
                </label>
                <select
                  value={formData.dayCountConvention}
                  onChange={(e) => handleInputChange('dayCountConvention', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="ACT/ACT">ACT/ACT</option>
                  <option value="ACT/365">ACT/365</option>
                  <option value="ACT/360">ACT/360</option>
                  <option value="30/360">30/360</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  TDS Plan
                </label>
                <select
                  value={formData.tdsPlan}
                  onChange={(e) => handleInputChange('tdsPlan', e.target.value)}
                  className="input-field w-full"
                >
                  {tdsPlans.map((plan) => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                  placeholder="Enter account number"
                  className="input-field w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                  Beneficiary Name
                </label>
                <input
                  type="text"
                  value={formData.beneficiaryName}
                  onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                  placeholder="Enter beneficiary name"
                  className="input-field w-full"
                />
              </div>
            </div>

            {/* Quick Calculator */}
            <div className="mt-6 p-4 bg-[var(--bg-surface)] rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Calculator className="w-5 h-5 text-[var(--accent)]" />
                <span className="font-medium text-[var(--text-primary)]">Quick Calculator</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Maturity Date</p>
                  <p className="font-mono text-[var(--text-primary)]">{formatDate(calculateMaturityDate())}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Maturity Amount</p>
                  <p className="font-mono text-[var(--accent)]">{formatCurrency(calculateMaturityAmount())}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Interest Earned</p>
                  <p className="font-mono text-green-500">
                    {formatCurrency(calculateMaturityAmount() - (parseFloat(formData.principal) || 0))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Effective Yield</p>
                  <p className="font-mono text-[var(--text-primary)]">
                    {formData.interestRate
                      ? `${(
                          ((calculateMaturityAmount() / (parseFloat(formData.principal) || 1) - 1) *
                            365 *
                            100) /
                          (parseInt(formData.tenorDays) || 365)
                        ).toFixed(2)}%`
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Review & Confirm</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Bank</span>
                  <span className="font-medium text-[var(--text-primary)]">{selectedBank?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Principal Amount</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {formatCurrency(parseFloat(formData.principal) || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Interest Rate</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {formData.interestRate}%
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Tenor</span>
                  <span className="font-mono font-medium text-[var(--text-primary)]">
                    {formData.tenorDays} days
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Start Date</span>
                  <span className="font-medium text-[var(--text-primary)]">{formatDate(formData.startDate)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Maturity Date</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {formatDate(calculateMaturityDate())}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Maturity Amount</span>
                  <span className="font-mono font-bold text-[var(--accent)]">
                    {formatCurrency(calculateMaturityAmount())}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Interest Type</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {formData.interestType} ({formData.compoundingFrequency})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-500">
                <span className="font-semibold">Note:</span> Please verify all details before confirming. Once
                booked, the FD will be activated after approval.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-2 border border-[var(--border)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>

        {currentStep < STEPS.length ? (
          <button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  );
}
