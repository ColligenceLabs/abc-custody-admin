/**
 * useDashboardData Hook
 *
 * 대시보드 데이터 제공 (API 연동)
 */

import { useEffect, useState } from 'react';
import { AssetType } from '@/types/withdrawalV2';
import { getAssetWalletRatios, AssetWalletInfo as ApiAssetWalletInfo } from '@/services/walletApi';
import { getDashboardStats } from '@/services/dashboardApi';

export interface DashboardStats {
  totalMembers: number;
  totalAssetValue: string;
  totalAssetValueNum: number; // 숫자 값 추가 (축약 및 전체 포맷용)
  todayTransactions: number;
  pendingTransactions: number;
  deposits24h: number;
  withdrawals24h: number;
}

export interface AssetDistribution {
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL';
  amount: string; // 실제 자산 수량
  value: number; // KRW 환산 가치
  percentage: number;
  color: string;
  [key: string]: any; // Recharts 호환성을 위한 index signature
}

export interface AssetWalletInfo {
  asset: AssetType;
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

export interface WalletStatus {
  hot: {
    balance: string;
    percentage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  cold: {
    balance: string;
    percentage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  needsRebalancing: boolean;
}

export interface RecentTransaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  asset: 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL';
  amount: string;
  memberName: string;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
}

export interface Alert {
  id: string;
  type: 'withdrawal' | 'compliance' | 'system' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  actionRequired: boolean;
}

// Mock 데이터
const MOCK_STATS: DashboardStats = {
  totalMembers: 24,
  totalAssetValue: '₩2,450,000,000',
  totalAssetValueNum: 2450000000, // 24.5억 원
  todayTransactions: 156,
  pendingTransactions: 3,
  deposits24h: 89,
  withdrawals24h: 67,
};

// Hot 지갑 자산 분포 (전체의 20%)
const MOCK_ASSET_DISTRIBUTION_HOT: AssetDistribution[] = [
  { asset: 'BTC', amount: '2.45', value: 196000000, percentage: 40, color: '#F7931A' },
  { asset: 'ETH', amount: '24.5', value: 122500000, percentage: 25, color: '#627EEA' },
  { asset: 'USDT', amount: '75,385', value: 98000000, percentage: 20, color: '#26A17B' },
  { asset: 'USDC', amount: '37,692', value: 49000000, percentage: 10, color: '#2775CA' },
  { asset: 'SOL', amount: '163.33', value: 24500000, percentage: 5, color: '#00FFA3' },
];

// Cold 지갑 자산 분포 (전체의 80%)
const MOCK_ASSET_DISTRIBUTION_COLD: AssetDistribution[] = [
  { asset: 'BTC', amount: '9.80', value: 784000000, percentage: 40, color: '#F7931A' },
  { asset: 'ETH', amount: '98.0', value: 490000000, percentage: 25, color: '#627EEA' },
  { asset: 'USDT', amount: '301,538', value: 392000000, percentage: 20, color: '#26A17B' },
  { asset: 'USDC', amount: '150,769', value: 196000000, percentage: 10, color: '#2775CA' },
  { asset: 'SOL', amount: '653.33', value: 98000000, percentage: 5, color: '#00FFA3' },
];

const MOCK_WALLET_STATUS: WalletStatus = {
  hot: {
    balance: '₩490,000,000',
    percentage: 20,
    status: 'healthy',
  },
  cold: {
    balance: '₩1,960,000,000',
    percentage: 80,
    status: 'healthy',
  },
  needsRebalancing: false,
};

const MOCK_RECENT_TRANSACTIONS: RecentTransaction[] = [
  {
    id: 'TX-2025-001',
    type: 'deposit',
    asset: 'BTC',
    amount: '0.5',
    memberName: 'Alpha Corporation',
    status: 'completed',
    timestamp: new Date(Date.now() - 5 * 60000),
  },
  {
    id: 'TX-2025-002',
    type: 'withdrawal',
    asset: 'ETH',
    amount: '10.0',
    memberName: 'Beta Investments',
    status: 'pending',
    timestamp: new Date(Date.now() - 10 * 60000),
  },
  {
    id: 'TX-2025-003',
    type: 'deposit',
    asset: 'USDT',
    amount: '50000.0',
    memberName: 'Gamma Holdings',
    status: 'completed',
    timestamp: new Date(Date.now() - 15 * 60000),
  },
  {
    id: 'TX-2025-004',
    type: 'withdrawal',
    asset: 'SOL',
    amount: '500.0',
    memberName: 'Delta Trading',
    status: 'completed',
    timestamp: new Date(Date.now() - 20 * 60000),
  },
  {
    id: 'TX-2025-005',
    type: 'deposit',
    asset: 'USDC',
    amount: '30000.0',
    memberName: 'Epsilon Finance',
    status: 'failed',
    timestamp: new Date(Date.now() - 25 * 60000),
  },
];

const MOCK_ALERTS: Alert[] = [
  {
    id: 'AL-001',
    type: 'withdrawal',
    severity: 'high',
    message: '대량 출금 요청 3건 승인 대기 중',
    timestamp: new Date(Date.now() - 10 * 60000),
    actionRequired: true,
  },
  {
    id: 'AL-002',
    type: 'compliance',
    severity: 'medium',
    message: 'AML 검토 필요 - Gamma Holdings',
    timestamp: new Date(Date.now() - 20 * 60000),
    actionRequired: true,
  },
  {
    id: 'AL-003',
    type: 'system',
    severity: 'low',
    message: 'Cold 지갑 동기화 완료',
    timestamp: new Date(Date.now() - 30 * 60000),
    actionRequired: false,
  },
  {
    id: 'AL-004',
    type: 'security',
    severity: 'critical',
    message: '비정상적인 로그인 시도 감지',
    timestamp: new Date(Date.now() - 5 * 60000),
    actionRequired: true,
  },
];

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>(MOCK_STATS);
  const [assetWalletInfo, setAssetWalletInfo] = useState<AssetWalletInfo[]>([]);
  const [assetDistributionHot, setAssetDistributionHot] = useState<AssetDistribution[]>(MOCK_ASSET_DISTRIBUTION_HOT);
  const [assetDistributionCold, setAssetDistributionCold] = useState<AssetDistribution[]>(MOCK_ASSET_DISTRIBUTION_COLD);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // API에서 실제 데이터 가져오기 (병렬 처리)
        const [statsData, ratios] = await Promise.all([
          getDashboardStats(),
          getAssetWalletRatios()
        ]);

        // 통계 데이터 설정
        setStats(statsData);

        // API 응답을 AssetWalletInfo 타입으로 변환
        const walletInfo: AssetWalletInfo[] = ratios.map((ratio) => ({
          asset: ratio.asset as AssetType,
          hotBalance: ratio.hotBalance,
          coldBalance: ratio.coldBalance,
          totalBalance: ratio.totalBalance,
          hotRatio: ratio.hotRatio,
          coldRatio: ratio.coldRatio,
          targetHotRatio: ratio.targetHotRatio,
          targetColdRatio: ratio.targetColdRatio,
          deviation: ratio.deviation,
          needsRebalancing: ratio.needsRebalancing,
        }));

        setAssetWalletInfo(walletInfo);

        // Hot/Cold 자산 분포 차트 데이터 생성
        const hotDistribution: AssetDistribution[] = walletInfo.map((info) => {
          const hotValue = parseFloat(info.hotBalance) || 0;
          const totalValue = parseFloat(info.totalBalance) || 1;
          const percentage = (hotValue / totalValue) * 100;

          return {
            asset: info.asset as 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL',
            amount: info.hotBalance,
            value: hotValue * 100000000, // 임시 KRW 환산 (실제로는 가격 API 필요)
            percentage: parseFloat(percentage.toFixed(2)),
            color: getAssetColor(info.asset),
          };
        });

        const coldDistribution: AssetDistribution[] = walletInfo.map((info) => {
          const coldValue = parseFloat(info.coldBalance) || 0;
          const totalValue = parseFloat(info.totalBalance) || 1;
          const percentage = (coldValue / totalValue) * 100;

          return {
            asset: info.asset as 'BTC' | 'ETH' | 'USDT' | 'USDC' | 'SOL',
            amount: info.coldBalance,
            value: coldValue * 100000000, // 임시 KRW 환산
            percentage: parseFloat(percentage.toFixed(2)),
            color: getAssetColor(info.asset),
          };
        });

        setAssetDistributionHot(hotDistribution);
        setAssetDistributionCold(coldDistribution);
      } catch (err) {
        console.error('대시보드 데이터 조회 실패:', err);
        setError('대시보드 데이터 조회에 실패했습니다.');
        // 에러 시 Mock 데이터 사용
        setStats(MOCK_STATS);
        setAssetWalletInfo(generateMockAssetWalletInfo());
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return {
    stats,
    assetDistributionHot,
    assetDistributionCold,
    assetWalletInfo,
    walletStatus: MOCK_WALLET_STATUS,
    recentTransactions: MOCK_RECENT_TRANSACTIONS,
    alerts: MOCK_ALERTS,
    loading,
    error,
  };
}

// 자산별 색상 매핑
function getAssetColor(asset: string): string {
  const colorMap: Record<string, string> = {
    BTC: '#F7931A',
    ETH: '#627EEA',
    USDT: '#26A17B',
    USDC: '#2775CA',
    SOL: '#00FFA3',
  };
  return colorMap[asset] || '#6B7280';
}

// Mock AssetWalletInfo 생성 (Fallback용)
function generateMockAssetWalletInfo(): AssetWalletInfo[] {
  return MOCK_ASSET_DISTRIBUTION_HOT.map((hotAsset, index) => {
    const coldAsset = MOCK_ASSET_DISTRIBUTION_COLD[index];
    const hotBalance = parseFloat(hotAsset.amount.replace(/,/g, ''));
    const coldBalance = parseFloat(coldAsset.amount.replace(/,/g, ''));
    const totalBalance = hotBalance + coldBalance;

    const hotRatio = (hotBalance / totalBalance) * 100;
    const coldRatio = (coldBalance / totalBalance) * 100;
    const targetHotRatio = 20;
    const targetColdRatio = 80;
    const deviation = hotRatio - targetHotRatio;

    return {
      asset: hotAsset.asset as AssetType,
      hotBalance: hotAsset.amount,
      coldBalance: coldAsset.amount,
      totalBalance: totalBalance.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }),
      hotRatio,
      coldRatio,
      targetHotRatio,
      targetColdRatio,
      deviation,
      needsRebalancing: hotRatio > 20,
    };
  });
}
