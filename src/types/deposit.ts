export type DepositStatus =
  | "detected"      // 블록체인에서 감지됨
  | "confirming"    // 컨펌 진행 중
  | "confirmed"     // 컨펌 완료
  | "credited"      // 입금 처리 완료
  | "failed";       // 실패

export type VaultTransferStatus =
  | "pending"       // 전송 대기
  | "sent"          // 전송 완료
  | "confirmed"     // 컨펌 완료
  | "failed";       // 실패

export interface VaultTransfer {
  id: string;
  status: VaultTransferStatus;
  txHash: string | null;
  feeAmount: string | null;
  feeRate: string | null;
  transferredAt: string | null;
  confirmedAt: string | null;
}

export interface DepositTransaction {
  id: string;
  txHash: string;
  asset: string;
  network: string;
  amount: string;
  fromAddress: string;
  toAddress: string;
  status: DepositStatus;
  senderVerified: boolean; // 발신자 화이트리스트 검증 결과
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
  vaultTransferred?: boolean;
  latestVaultTransfer?: VaultTransfer | null;
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