/**
 * Dashboard API Service
 *
 * 대시보드 통계 데이터 API
 */

import { apiClient } from './api';

/**
 * 대시보드 통계 데이터
 */
export interface DashboardStats {
  totalMembers: number;
  totalAssetValue: string;
  totalAssetValueNum: number;
  todayTransactions: number;
  pendingTransactions: number;
  deposits24h: number;
  withdrawals24h: number;
}

/**
 * API Response 형식
 */
export interface DashboardStatsResponse {
  success: boolean;
  data: DashboardStats;
  timestamp: string;
}

/**
 * 대시보드 통계 조회
 * @returns Promise<DashboardStats>
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<DashboardStatsResponse>('/dashboard/stats');
  return response.data.data;
};
