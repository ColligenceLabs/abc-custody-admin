import { Balance, BalanceSummary } from '@/types/balance';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface BalanceFilters {
  userId: string;
  asset?: string;
  network?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * 사용자 잔고 조회
 */
export async function getUserBalances(
  filters: BalanceFilters
): Promise<Balance[]> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  const url = `${API_URL}/api/balances?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '잔고 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 사용자 전체 잔고 요약
 */
export async function getBalanceSummary(userId: string): Promise<BalanceSummary> {
  const response = await fetch(`${API_URL}/api/balances/summary?userId=${userId}`);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '잔고 요약 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 출금 가능 여부 확인
 */
export async function verifyWithdrawalAmount(
  userId: string,
  asset: string,
  network: string,
  amount: number
): Promise<{
  canWithdraw: boolean;
  reason?: string;
  availableBalance?: number;
  requestedAmount?: number;
  remainingBalance?: number;
}> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/balances/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ userId, asset, network, amount }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 가능 여부 확인에 실패했습니다.');
  }

  return response.json();
}
