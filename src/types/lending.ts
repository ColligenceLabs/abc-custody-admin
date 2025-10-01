/**
 * 전북은행 대출 관련 타입 정의
 */

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

// 담보 자산 정보
export interface CollateralAsset {
  asset: string;
  amount: number;
  currentPrice: number;
  value: number;
  volatility: number;
  supportedLTV: number;
}

// 대출 정보
export interface BankLoan {
  id: string;
  product: BankLoanProduct;
  collateralAsset: CollateralAsset;
  loanAmount: number;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
  createdAt: string;
  lastUpdated: string;
  maturityDate: string; // 만기일
  status: "active" | "warning" | "danger" | "liquidation" | "liquidated";
  accruedInterest: number;
  nextPaymentDate?: string;
}