// 대출 관련 타입 정의
export interface RepaymentRequest {
  loanId: string;
  type: "full" | "partial";
  amount?: number; // 부분 상환 시 금액
  note?: string;
}

export interface CollateralAddition {
  loanId: string;
  assets: {
    asset: string;
    amount: number;
  }[];
  note?: string;
}

export interface RepaymentCalculation {
  currentBalance: number;
  accruedInterest: number;
  totalPayable: number;
  repaymentAmount: number;
  remainingBalance: number;
  earlyRepaymentFee: number;
  newHealthFactor?: number;
}

export interface CollateralImpact {
  currentHealthFactor: number;
  newHealthFactor: number;
  currentLTV: number;
  newLTV: number;
  addedCollateralValue: number;
  totalCollateralValue: number;
}

export interface HealthFactorLevel {
  level: "safe" | "moderate" | "warning" | "danger";
  label: string;
  color: string;
  bgColor: string;
}