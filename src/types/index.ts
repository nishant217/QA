// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'SYSTEM_ADMIN' | 'TREASURY_DEALER' | 'CFO' | 'VIEWER';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface LoginHistory {
  id: string;
  userId: string;
  timestamp: string;
  ipAddress: string;
  sessionDuration?: number;
}

// FD Types
export type FDStatus = 'Active' | 'Matured' | 'Closed' | 'Pending' | 'Near Maturity';
export type InterestType = 'Simple' | 'Compound';
export type CompoundingFrequency = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'At Maturity';
export type DayCountConvention = 'ACT/ACT' | 'ACT/365' | 'ACT/360' | '30/360';
export type TDSPlan = 'WITH_PAN' | 'WITHOUT_PAN' | 'EXEMPT_15G' | 'EXEMPT_15H';

export interface FD {
  id: string;
  referenceNumber: string;
  bankId: string;
  bankName: string;
  bankFDRef?: string;
  principal: number;
  interestRate: number;
  startDate: string;
  maturityDate: string;
  tenorDays: number;
  interestType: InterestType;
  compoundingFrequency: CompoundingFrequency;
  dayCountConvention: DayCountConvention;
  tdsPlan: TDSPlan;
  status: FDStatus;
  maturityAmount?: number;
  interestAccrued?: number;
  tdsDeducted?: number;
  netInterest?: number;
  accountNumber?: string;
  beneficiaryName?: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export interface CashFlowEntry {
  id: string;
  fdId: string;
  fdReferenceNumber: string;
  bankName: string;
  date: string;
  type: 'Interest' | 'Principal' | 'TDS' | 'Net';
  amount: number;
  isProjected: boolean;
  isActual?: boolean;
  actualAmount?: number;
  variance?: number;
}

// Transaction Types
export type TransactionType = 'Transfer' | 'Payment' | 'Refund' | 'Withdrawal' | 'Deposit';
export type TransactionStatus = 'Pending' | 'Completed' | 'Failed' | 'Flagged' | 'Reversed';

export interface Transaction {
  id: string;
  referenceNumber: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  status: TransactionStatus;
  relatedFDId?: string;
  bankAccount?: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  failureReason?: string;
}

// Notification Types
export type NotificationType = 'alert' | 'system' | 'compliance' | 'market' | 'approval' | 'fd_event' | 'info';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  relatedEntityId?: string;
  relatedEntityType?: 'fd' | 'transaction' | 'accrual' | 'receipt' | 'rateRequest' | 'period' | 'approval';
  actionUrl?: string;
  actionLabel?: string;
}

// Portfolio position for AI context
export interface FDPosition {
  id: string;
  bankName: string;
  principal: number;
  interestRate: number;
  maturityDate: string;
  status: FDStatus;
}

// Rate Negotiation Types
export type RateRequestStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Offers Received' | 'Approved' | 'Rejected' | 'Converted';

export interface RateRequest {
  id: string;
  referenceNumber: string;
  principalAmount: number;
  tenorDays: number;
  requestedRate?: number;
  status: RateRequestStatus;
  banksContacted: string[];
  offers: RateOffer[];
  selectedOfferId?: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  notes?: string;
}

export interface RateOffer {
  id: string;
  rateRequestId: string;
  bankId: string;
  bankName: string;
  offeredRate: number;
  isNegotiable: boolean;
  validUntil: string;
  terms?: string;
  isSelected: boolean;
  receivedAt: string;
}

// Accrual Types
export type AccrualRunStatus = 'Draft' | 'Simulation' | 'Awaiting Approval' | 'Approved' | 'Posted' | 'Reversed';

export interface AccrualRun {
  id: string;
  referenceNumber: string;
  period: string;
  startDate: string;
  endDate: string;
  status: AccrualRunStatus;
  totalInterestAccrued: number;
  totalTDSDeducted: number;
  fdCount: number;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  postedAt?: string;
}

export interface AccrualLedgerEntry {
  id: string;
  accrualRunId: string;
  fdId: string;
  fdReferenceNumber: string;
  bankName: string;
  principal: number;
  interestRate: number;
  daysInPeriod: number;
  interestAccrued: number;
  tdsAmount: number;
  netInterest: number;
  runStatus: AccrualRunStatus;
  period: string;
}

// Interest Receipt Types
export type ReceiptMatchStatus = 'Unmatched' | 'Matched' | 'Partial' | 'Exception';

export interface InterestReceipt {
  id: string;
  referenceNumber: string;
  fdId?: string;
  fdReferenceNumber?: string;
  bankName: string;
  receiptDate: string;
  interestAmountReceived: number;
  tdsDeducted: number;
  netAmount: number;
  expectedAmount?: number;
  variance?: number;
  matchStatus: ReceiptMatchStatus;
  statementReference?: string;
  notes?: string;
  createdAt: string;
  matchedAt?: string;
  matchedBy?: string;
}

// Maturity Types
export type MaturityActionType = 'Payout' | 'Rollover' | 'Premature Closure';
export type MaturityActionStatus = 'Pending' | 'Approved' | 'Executed' | 'Cancelled';

export interface MaturityAction {
  id: string;
  fdId: string;
  fdReferenceNumber: string;
  bankName: string;
  principalAmount: number;
  maturityAmount: number;
  maturityDate: string;
  actionType: MaturityActionType;
  status: MaturityActionStatus;
  rolloverTenor?: number;
  rolloverRate?: number;
  payoutAccount?: string;
  tdsDeducted?: number;
  closureCharges?: number;
  netPayout?: number;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  executedAt?: string;
}

// Period Close Types
export type PeriodCloseStatus = 'Open' | 'In Progress' | 'Ready for Close' | 'Closed';

export interface PeriodClose {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  status: PeriodCloseStatus;
  checklist: CloseChecklistItem[];
  evidencePackUrl?: string;
  closedAt?: string;
  closedBy?: string;
}

export interface CloseChecklistItem {
  id: string;
  periodCloseId: string;
  category: string;
  task: string;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
}

// Accounting Types
export type JournalStatus = 'Draft' | 'Ready' | 'Posted' | 'Reversed';

export interface JournalBatch {
  id: string;
  referenceNumber: string;
  period: string;
  description: string;
  status: JournalStatus;
  totalDebit: number;
  totalCredit: number;
  entries: JournalEntry[];
  createdAt: string;
  createdBy: string;
  postedAt?: string;
  postedBy?: string;
}

export interface JournalEntry {
  id: string;
  batchId: string;
  lineNumber: number;
  accountCode: string;
  accountName: string;
  description: string;
  debitAmount: number;
  creditAmount: number;
  costCenter?: string;
  reference?: string;
}

// Master Data Types
export interface Bank {
  id: string;
  name: string;
  shortName: string;
  ifscPrefix: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive: boolean;
  apiEnabled: boolean;
  maxFDAmount: number;
  creditRating?: string;
  createdAt: string;
}

export interface FDRateCard {
  id: string;
  bankId: string;
  bankName: string;
  tenorMin: number;
  tenorMax: number;
  rate: number;
  isSpecial: boolean;
  validFrom: string;
  validUntil?: string;
  minimumAmount: number;
  maximumAmount?: number;
  notes?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'National' | 'Regional' | 'Bank';
  isRecurring: boolean;
}

export interface GLMapping {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Income' | 'Expense';
  category: string;
  description?: string;
  isActive: boolean;
}

export interface ApprovalMatrix {
  id: string;
  module: string;
  minAmount: number;
  maxAmount: number;
  approverRole: string;
  approverUserId?: string;
  isActive: boolean;
}

// Feature Flags
export interface FeatureFlags {
  enableMarketsScreen: boolean;
  enableRateNegotiationModule: boolean;
  enableFDBookingModule: boolean;
  enableAccrualEngine: boolean;
  enableInterestReceipts: boolean;
  enableMaturityModule: boolean;
  enablePeriodClose: boolean;
  enableAccountingWorkbench: boolean;
  enableReportsModule: boolean;
  enableAIChatbot: boolean;
  enablePDFIntelligence: boolean;
  enableBulkUpload: boolean;
  enableAPIIntegrations: boolean;
  enableTDSModule: boolean;
  enableCashFlowSchedule: boolean;
  enableAuditExport: boolean;
  enableMailShare: boolean;
  enableLiveMarketTicker: boolean;
  enableFXRates: boolean;
  enableDarkModeToggle: boolean;
  maintenanceMode: boolean;
}

export interface SystemSettings {
  maxFDAmount: number;
  varianceThreshold: number;
  sessionTimeoutMins: number;
  tdsThresholdAmount: number;
  defaultCurrency: string;
  dateFormat: string;
  numberFormat: 'indian' | 'international';
  workingDayConvention: string;
  auditRetentionDays: number;
}

// Audit Types
export interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  sessionId: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// Upload Types
export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  content?: string;
  extractedData?: any;
  uploadedAt: string;
  uploadedBy: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
}

// Market Data Types
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  market_cap: number;
  total_volume: number;
  sparkline_in_7d?: { price: number[] };
  image?: string;
}

export interface FXRate {
  currency: string;
  rate: number;
  change24h?: number;
  lastUpdated: string;
}

export interface FearGreedData {
  value: number;
  value_classification: string;
  timestamp: string;
}

// Report Types
export type ReportType = 
  | 'FD_PORTFOLIO'
  | 'INTEREST_ACCRUAL'
  | 'INTEREST_RECEIPT'
  | 'TDS_REGISTER'
  | 'MATURITY_LADDER'
  | 'CASH_FLOW'
  | 'VARIANCE_EXCEPTION'
  | 'BANK_EXPOSURE'
  | 'PERIOD_CLOSE'
  | 'AUDIT_TRAIL';

// PDF Extracted Data
export interface PDFExtractedData {
  documentType: 'FD_ADVICE' | 'FD_CERTIFICATE' | 'BANK_STATEMENT' | 'INTEREST_CERTIFICATE' | 'UNKNOWN';
  bankName?: string;
  fdReferenceNumber?: string;
  principalAmount?: number;
  interestRate?: number;
  startDate?: string;
  maturityDate?: string;
  tenorDays?: number;
  interestType?: InterestType;
  compoundingFrequency?: CompoundingFrequency;
  maturityAmount?: number;
  tdsPlan?: TDSPlan;
  accountNumber?: string;
  beneficiaryName?: string;
  confidence: number;
  missingFields: string[];
  rawHighlights: string[];
}
