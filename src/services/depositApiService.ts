import apiClient from '@/lib/api-client';
import { DepositTransaction, DepositFilter, DepositStats } from '@/types/deposit';

export interface GetDepositsParams {
  filter?: DepositFilter;
  page?: number;
  pageSize?: number;
}

export interface GetDepositsResponse {
  deposits: DepositTransaction[];
  total: number;
}

/**
 * 입금 목록 조회
 */
export async function getDeposits({
  filter = {},
  page = 1,
  pageSize = 10,
}: GetDepositsParams): Promise<GetDepositsResponse> {
  const params: any = {
    _page: page,
    _limit: pageSize,
    _sort: 'detectedAt',
    _order: 'desc',
  };

  if (filter.status && filter.status.length > 0) {
    params.status = filter.status; // 배열로 전달
  }
  if (filter.asset) {
    params.asset = filter.asset;
  }
  if (filter.userId) {
    params.userId = filter.userId;
  }

  const response = await apiClient.get('/deposits', { params });

  const total = parseInt(response.headers['x-total-count'] || '0');

  return {
    deposits: response.data,
    total,
  };
}

/**
 * 입금 상세 조회
 */
export async function getDepositById(id: string): Promise<DepositTransaction> {
  const response = await apiClient.get(`/deposits/${id}/full`);
  return response.data;
}

/**
 * 입금 통계 조회
 */
export async function getDepositStats(): Promise<DepositStats> {
  const response = await apiClient.get('/deposits/summary');

  // 백엔드 응답 형식을 프론트 형식으로 변환
  const { byStatus } = response.data;

  // 상태별 Map 생성
  const statusMap: Record<string, any> = {};
  byStatus.forEach((item: any) => {
    statusMap[item.status] = item;
  });

  // 헬퍼 함수: 상태별 통계 항목 생성
  const createStatItem = (status: string) => {
    const data = statusMap[status];
    if (!data) {
      return {
        count: 0,
        totalKRW: '0',
        trend: 'stable' as const,
        changePercent: 0,
      };
    }

    return {
      count: parseInt(data.count) || 0,
      totalKRW: Math.round(parseFloat(data.totalAmount || 0)).toString(),
      trend: data.trend || 'stable',
      changePercent: parseFloat(data.changePercent || 0),
    };
  };

  return {
    detected: createStatItem('detected'),
    confirming: createStatItem('confirming'),
    confirmed: createStatItem('confirmed'),
    credited: createStatItem('credited'),
  };
}
