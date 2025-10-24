export interface Transaction {
  id: string;
  type: "deposit" | "withdrawal"; // 거래 유형
  asset: string; // 자산 종류 (BTC, ETH, USDT, USDC, SOL)
  network?: string; // 네트워크 (bitcoin, ethereum, holesky, solana, polygon)
  amount: string; // 수량 (Decimal string)
  value?: number; // KRW 환산 금액
  status: "completed" | "pending" | "failed"; // 거래 상태
  timestamp: string; // 거래 시간 (ISO 8601)
  txHash?: string; // 트랜잭션 해시
  from?: string; // 발신 주소
  to?: string; // 수신 주소
  confirmations?: number; // 블록 확인 수 (deposit만)

  // mypage address history에서 사용하는 추가 필드들
  addressLabel?: string; // 주소 레이블
  fee?: string; // 수수료
  krwValue?: number; // KRW 환산 금액 (value와 동일한 용도)
  exchangeRate?: number; // 환율
  address?: string; // 주소 (mock data에서 사용)
  blockHeight?: number; // 블록 높이 (mock data에서 사용)
  memo?: string; // 메모 (mock data에서 사용)
}

export interface TransactionFilters {
  type?: "all" | "deposit" | "withdrawal";
  asset?: "all" | string;
  status?: "all" | "completed" | "pending" | "failed";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface TransactionListResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface TransactionSummary {
  totalDeposits: number; // 총 입금액 (KRW)
  totalWithdrawals: number; // 총 출금액 (KRW)
  depositCount: number; // 입금 건수
  withdrawalCount: number; // 출금 건수
  pendingCount: number; // 대기 중인 거래 수
}