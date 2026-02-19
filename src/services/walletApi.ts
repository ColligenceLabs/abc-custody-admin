import { apiClient } from './api';

/**
 * 자산별 Hot/Cold 지갑 비율 정보
 */
export interface AssetWalletInfo {
  asset: string; // 동적으로 받은 자산 심볼 (BTC, ETH, USDT, USDC, SOL, TALK 등)
  hotBalance: string;
  coldBalance: string;
  totalBalance: string;
  hotRatio: number;
  coldRatio: number;
  targetHotRatio: number;
  targetColdRatio: number;
  deviation: number;
  needsRebalancing: boolean;
}

/**
 * API Response 형식
 */
export interface AssetWalletRatiosResponse {
  success: boolean;
  data: AssetWalletInfo[];
  timestamp: string;
}

/**
 * 자산별 Hot/Cold 지갑 비율 조회
 * @returns Promise<AssetWalletInfo[]>
 */
export const getAssetWalletRatios = async (): Promise<AssetWalletInfo[]> => {
  const response = await apiClient.get<AssetWalletRatiosResponse>('/wallets/asset-ratios');
  return response.data.data;
};

/**
 * Treasury 자산 분포 정보
 */
export interface TreasuryAssetDistribution {
  asset: string;
  amount: string;
  percentage: number;
}

/**
 * Treasury 자산 분포 API 응답
 */
export interface TreasuryDistributionResponse {
  success: boolean;
  data: TreasuryAssetDistribution[];
}

/**
 * Treasury 자산 분포 조회
 * @returns Promise<TreasuryAssetDistribution[]>
 */
export const getTreasuryAssetDistribution = async (): Promise<TreasuryAssetDistribution[]> => {
  const response = await apiClient.get<TreasuryDistributionResponse>('/wallets/treasury-distribution');
  return response.data.data;
};
