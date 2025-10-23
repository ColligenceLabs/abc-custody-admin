/**
 * 관리자 대출 관리 시스템 타입 정의
 */

// 기존 lending 타입 재사용
export type Currency = "BTC" | "ETH" | "USDT" | "USDC" | "SOL";

// 대출 상품 정보
export interface BankLoanProduct {
  id: string;
  productName: string;
  bankName: string;
  collateralAsset: string;
  loanTerm: string;
  ltv: number;
  interestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  earlyRepaymentFee: string;
  additionalCollateralAllowed: boolean;
  features: string[];
  description: string;
}

// 관리자용 대출 상품 (추가 필드 포함)
export interface AdminBankLoanProduct extends BankLoanProduct {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 대출 상품 생성/수정 요청
export interface LoanProductRequest {
  productName: string;
  bankName: string;
  collateralAsset: Currency;
  loanTerm: string;
  ltv: number;
  interestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  earlyRepaymentFee: string;
  additionalCollateralAllowed: boolean;
  features: string[];
  description: string;
}

// 담보 자산 정보
export interface CollateralAsset {
  asset: Currency;
  amount: number;
  currentPrice: number;
  value: number;
  volatility: number;
  supportedLTV: number;
}

// 관리자용 대출 정보
export interface AdminBankLoan {
  id: string;
  customerId: string;
  customerName: string;
  customerBank: string;
  customerAccount: string;
  product: BankLoanProduct;
  collateralAsset: CollateralAsset;
  loanAmount: number;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
  liquidationPrice: number;
  createdAt: string;
  maturityDate: string;
  lastUpdated: string;
  status: "active" | "warning" | "danger" | "liquidation" | "liquidated";
  accruedInterest: number;
  riskLevel: "safe" | "caution" | "danger" | "liquidation";
}

// 청산콜
export interface LiquidationCall {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  collateralAsset: CollateralAsset;
  loanAmount: number;
  healthFactor: number;
  receivedAt: string;
  status: "pending" | "processing" | "completed" | "failed";
  priority: "urgent" | "high" | "normal";
}

// 청산 단계
export interface LiquidationStep {
  step: number;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

// 청산 실행
export interface LiquidationExecution {
  id: string;
  liquidationCallId: string;
  loanId: string;
  steps: LiquidationStep[];
  selectedExchange: "upbit" | "bithumb";
  estimatedAmount: number;
  actualAmount: number;
  bankRepayment: number;
  customerRefund: number;
  startedAt: string;
  completedAt: string | null;
  status: "pending" | "in_progress" | "completed" | "failed";
  error: string | null;
}

// 외부 거래소 상태
export interface ExchangeStatus {
  exchange: "upbit" | "bithumb";
  connected: boolean;
  latency: number;
  lastChecked: string;
  currentPrice: Record<Currency, number>;
}

// 대출 상품 통계
export interface ProductStats {
  productId: string;
  totalApplications: number;
  approvedCount: number;
  rejectedCount: number;
  activeLoans: number;
  totalLoanAmount: number;
  averageHealthFactor: number;
  approvalRate: number;
}

// 알림 설정
export interface AlertConfig {
  id: string;
  type: "health_factor" | "price_change" | "liquidation";
  threshold: number;
  channels: ("email" | "sms")[];
  enabled: boolean;
  message: string;
  severity: "info" | "warning" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
}

// 대출 활동
export interface LoanActivity {
  id: string;
  type: "loan_created" | "repayment" | "collateral_added" | "liquidation" | "liquidation_completed";
  loanId: string;
  customerId: string;
  customerName: string;
  description: string;
  amount?: number;
  asset?: Currency;
  timestamp: string;
}

// 위험도별 분포
export interface RiskDistribution {
  safe: number;
  caution: number;
  danger: number;
  liquidation: number;
}

// 대출 대시보드 통계
export interface LoanDashboardStats {
  totalLoanAmount: number;
  totalCollateralValue: number;
  averageHealthFactor: number;
  liquidationRiskCount: number;
  riskDistribution: RiskDistribution;
  recentActivities: LoanActivity[];
}

// 대출 필터
export interface LoanFilters {
  status?: AdminBankLoan["status"][];
  asset?: Currency[];
  riskLevel?: AdminBankLoan["riskLevel"][];
  healthFactorMin?: number;
  healthFactorMax?: number;
  search?: string;
}

// 페이지네이션
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 대출 목록 응답
export interface LoansResponse {
  loans: AdminBankLoan[];
  pagination: Pagination;
}

// 청산 내역 필터
export interface LiquidationHistoryFilters {
  status?: LiquidationExecution["status"][];
  startDate?: string;
  endDate?: string;
  customerId?: string;
}

// 알림 내역
export interface Alert {
  id: string;
  type: "health_factor" | "price_change" | "liquidation";
  severity: "info" | "warning" | "high" | "critical";
  loanId?: string;
  customerId?: string;
  customerName?: string;
  message: string;
  details: any;
  sentAt: string;
  channels: ("email" | "sms")[];
  read: boolean;
}

// 알림 내역 필터
export interface AlertHistoryFilters {
  type?: Alert["type"][];
  severity?: Alert["severity"][];
  startDate?: string;
  endDate?: string;
  read?: boolean;
}
