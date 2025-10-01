export type DepositStatus = 
  | "detected"      // 블록체인에서 감지됨
  | "confirming"    // 컨펌 진행 중
  | "confirmed"     // 컨펌 완료
  | "credited"      // 입금 처리 완료
  | "failed";       // 실패

export interface DepositTransaction {
  id: string;
  txHash: string;
  asset: string;
  network: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  status: DepositStatus;
  currentConfirmations: number;
  requiredConfirmations: number;
  detectedAt: string;
  confirmedAt?: string;
  creditedAt?: string;
  failedReason?: string;
  estimatedTime?: number; // 예상 완료 시간 (분)
  blockHeight?: number;
  fee?: string;
}

export interface DepositHistory extends DepositTransaction {
  valueInKRW?: number;
  valueInUSD?: number;
}

export interface DepositStatistics {
  todayTotal: {
    count: number;
    amount: number;
    amountKRW: number;
  };
  weekTotal: {
    count: number;
    amount: number;
    amountKRW: number;
  };
  monthTotal: {
    count: number;
    amount: number;
    amountKRW: number;
  };
  averageProcessingTime: number; // 평균 처리 시간 (분)
  assetBreakdown: Array<{
    asset: string;
    count: number;
    amount: string;
    percentage: number;
  }>;
}