/**
 * useWithdrawalV2Stats Hook
 *
 * V2 대시보드 통계 데이터 조회 훅
 */

import { useState, useEffect } from 'react';
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { WithdrawalV2DashboardStats } from '@/types/withdrawalV2';
import { withdrawalV2Api } from '@/services/withdrawalV2Api';

export function useWithdrawalV2Stats() {
  const [data, setData] = useState<WithdrawalV2DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const stats = await withdrawalV2Api.getWithdrawalV2Stats();
      setData(stats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('데이터 조회 실패'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // 30초마다 자동 갱신
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchStats,
  };
}
