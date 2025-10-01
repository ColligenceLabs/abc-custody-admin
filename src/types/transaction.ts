export interface Transaction {
  id: string;
  txHash: string; // 트랜잭션 해시
  direction: "deposit" | "withdrawal"; // 입금/출금 구분
  assetType: string; // 자산 종류 (BTC, ETH 등)
  amount: number; // 수량
  krwValue: number; // 원화 환산 가치
  timestamp: string; // 거래 시간 (ISO 8601)
  address: string; // 관련 주소
  addressLabel?: string; // 주소 라벨
  status: "completed" | "pending" | "failed"; // 거래 상태
  confirmations?: number; // 블록 확인 수
  fee?: number; // 수수료
  blockHeight?: number; // 블록 높이
  exchangeRate?: number; // 환율 (원/자산)
  memo?: string; // 메모
}

export interface TransactionFilters {
  direction?: "all" | "deposit" | "withdrawal";
  assetType?: "all" | string;
  status?: "all" | "completed" | "pending" | "failed";
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TransactionSummary {
  totalDeposits: number; // 총 입금액 (KRW)
  totalWithdrawals: number; // 총 출금액 (KRW)
  depositCount: number; // 입금 건수
  withdrawalCount: number; // 출금 건수
  pendingCount: number; // 대기 중인 거래 수
}