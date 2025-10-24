import { CoinPrices, PriceChangeResponse, PriceHistory } from '@/types/coinPrice';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ErrorResponse {
  error: string;
  message?: string;
  supportedCoins?: string[];
}

/**
 * 최신 코인 가격 조회
 * @param coins - 조회할 코인 목록 (선택사항, 기본값: 전체)
 */
export async function getCurrentPrices(coins?: string[]): Promise<CoinPrices> {
  const params = coins && coins.length > 0 ? `?coins=${coins.join(',')}` : '';
  const url = `${API_URL}/api/coin-prices/current${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '가격 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 코인 가격 변동율 조회
 * @param hours - 변동율 계산 시간 (기본값: 24시간)
 * @param coins - 조회할 코인 목록 (선택사항, 기본값: 전체)
 */
export async function getPriceChange(
  hours: number = 24,
  coins?: string[]
): Promise<PriceChangeResponse> {
  const params = new URLSearchParams({ hours: hours.toString() });

  if (coins && coins.length > 0) {
    params.append('coins', coins.join(','));
  }

  const url = `${API_URL}/api/coin-prices/change?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '변동율 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 코인 가격 히스토리 조회
 * @param coin - 코인 심볼 (필수)
 * @param options - 조회 옵션 (from, to, limit)
 */
export async function getPriceHistory(
  coin: string,
  options?: {
    from?: string;
    to?: string;
    limit?: number;
  }
): Promise<PriceHistory> {
  const params = new URLSearchParams({ coin: coin.toUpperCase() });

  if (options?.from) params.append('from', options.from);
  if (options?.to) params.append('to', options.to);
  if (options?.limit) params.append('limit', options.limit.toString());

  const url = `${API_URL}/api/coin-prices/history?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '히스토리 조회에 실패했습니다.');
  }

  return response.json();
}
