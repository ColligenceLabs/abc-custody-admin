const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface Balance {
  id: string;
  userId: string;
  asset: string;
  network: string;
  availableBalance: string;
  lockedBalance: string;
  totalBalance: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  pendingWithdrawals?: Array<{
    id: string;
    amount: number;
    status: string;
    initiatedAt: string;
  }>;
}

export interface BalanceVerifyRequest {
  userId: string;
  asset: string;
  network: string;
  amount: number;
}

export interface BalanceVerifyResponse {
  canWithdraw: boolean;
  availableBalance?: number;
  requestedAmount?: number;
  remainingBalance?: number;
  reason?: string;
}

export async function getUserBalances(
  userId: string,
  asset?: string,
  network?: string
): Promise<Balance[]> {
  const params = new URLSearchParams({ userId });
  if (asset) params.append("asset", asset);
  if (network) params.append("network", network);

  const response = await fetch(`${API_URL}/api/balances?${params}`);
  if (!response.ok) {
    throw new Error("잔액 조회 실패");
  }
  return response.json();
}

export async function verifyWithdrawalAmount(
  data: BalanceVerifyRequest
): Promise<BalanceVerifyResponse> {
  const response = await fetch(`${API_URL}/api/balances/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok && response.status !== 400) {
    throw new Error(result.error || "출금 가능 여부 확인 실패");
  }

  return result;
}
