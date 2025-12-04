import apiClient from '@/lib/api-client';
import { ReturnTransaction, ReturnType, ReturnStatus } from '@/types/deposit';

/**
 * 반환 목록 조회 파라미터
 */
export interface GetReturnsParams {
  status?: ReturnStatus[];
  returnType?: ReturnType;
  asset?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 반환 목록 응답
 */
export interface GetReturnsResponse {
  data: ReturnTransaction[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 반환 통계 응답
 */
export interface ReturnStats {
  pending: {
    count: number;
    volumeKRW: string;
  };
  processing: {
    count: number;
    volumeKRW: string;
  };
  completed: {
    count: number;
    volumeKRW: string;
  };
  failed: {
    count: number;
    volumeKRW: string;
  };
  cancelled: {
    count: number;
    volumeKRW: string;
  };
}

/**
 * 반환 요청 생성 파라미터
 */
export interface CreateReturnRequest {
  returnType: ReturnType;
  returnAddress: string;
  reason: string;
  requestedBy: string;
}

/**
 * 반환 승인 파라미터
 */
export interface ApproveReturnRequest {
  approvedBy: string;
}

/**
 * 반환 목록 조회
 */
export async function getReturns(params: GetReturnsParams = {}): Promise<GetReturnsResponse> {
  const {
    status,
    returnType,
    asset,
    page = 1,
    pageSize = 100,
    sort = 'requestedAt',
    order = 'desc',
  } = params;

  const queryParams: any = {
    _page: page,
    _limit: pageSize,
    _sort: sort,
    _order: order,
  };

  if (status && status.length > 0) {
    queryParams.status = status; // 배열로 전달
  }
  if (returnType) {
    queryParams.returnType = returnType;
  }
  if (asset) {
    queryParams.asset = asset;
  }

  const response = await apiClient.get<GetReturnsResponse>('/deposit-returns', {
    params: queryParams,
  });

  return response.data;
}

/**
 * 반환 상세 조회
 */
export async function getReturnById(id: string): Promise<ReturnTransaction> {
  const response = await apiClient.get<ReturnTransaction>(`/deposit-returns/${id}`);
  return response.data;
}

/**
 * 반환 통계 조회 (오늘 날짜 데이터만)
 */
export async function getReturnStats(): Promise<ReturnStats> {
  // 모든 반환 데이터 조회
  const response = await apiClient.get<GetReturnsResponse>('/deposit-returns', {
    params: { _limit: 10000 },
  });

  const returns = response.data.data || response.data;

  // 오늘 날짜 범위 설정 (00:00:00 ~ 23:59:59)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 오늘 데이터만 필터링
  const todayReturns = (Array.isArray(returns) ? returns : []).filter((returnTx: ReturnTransaction) => {
    const requestedAt = new Date(returnTx.requestedAt);
    return requestedAt >= today && requestedAt < tomorrow;
  });

  // KRW 환율 (임시 - 추후 실제 환율 API 사용)
  const exchangeRates: Record<string, number> = {
    BTC: 50000000,
    ETH: 3000000,
    USDT: 1300,
    USDC: 1300,
    SOL: 100000,
  };

  // 상태별 통계 계산
  const stats: ReturnStats = {
    pending: { count: 0, volumeKRW: '0' },
    processing: { count: 0, volumeKRW: '0' },
    completed: { count: 0, volumeKRW: '0' },
    failed: { count: 0, volumeKRW: '0' },
    cancelled: { count: 0, volumeKRW: '0' },
  };

  todayReturns.forEach((returnTx: ReturnTransaction) => {
    const status = returnTx.status;
    if (stats[status as keyof ReturnStats]) {
      stats[status as keyof ReturnStats].count++;

      const rate = exchangeRates[returnTx.asset] || 0;
      const amountKRW = parseFloat(returnTx.returnAmount) * rate;
      const currentVolume = parseFloat(stats[status as keyof ReturnStats].volumeKRW);
      stats[status as keyof ReturnStats].volumeKRW = (currentVolume + amountKRW).toString();
    }
  });

  return stats;
}

/**
 * 반환 요청 생성
 */
export async function createReturn(
  depositId: string,
  request: CreateReturnRequest
): Promise<ReturnTransaction> {
  const response = await apiClient.post<ReturnTransaction>(
    `/deposits/${depositId}/return`,
    request
  );
  return response.data;
}

/**
 * 반환 승인
 */
export async function approveReturn(
  id: string,
  request: ApproveReturnRequest
): Promise<ReturnTransaction> {
  const response = await apiClient.post<ReturnTransaction>(
    `/deposit-returns/${id}/approve`,
    request
  );
  return response.data;
}

/**
 * 반환 실행 (블록체인 트랜잭션)
 */
export async function executeReturn(id: string): Promise<{
  message: string;
  txHash: string;
  depositReturn: ReturnTransaction;
}> {
  const response = await apiClient.post(`/deposit-returns/${id}/execute`);
  return response.data;
}

/**
 * 반환 취소 파라미터
 */
export interface CancelReturnRequest {
  reason?: string;
}

/**
 * 반환 취소
 */
export async function cancelReturn(
  id: string,
  request?: CancelReturnRequest
): Promise<{ message: string }> {
  const response = await apiClient.delete(`/deposit-returns/${id}`, {
    data: request,
  });
  return response.data;
}
