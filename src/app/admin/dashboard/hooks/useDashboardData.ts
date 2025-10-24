/**
 * useDashboardData Hook
 *
 * 대시보드 Mock 데이터 제공
 */

import { AssetType } from '@/types/withdrawalV2';

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
  // Hot/Cold 데이터를 조합하여 AssetWalletInfo 생성
  const assetWalletInfo: AssetWalletInfo[] = MOCK_ASSET_DISTRIBUTION_HOT.map((hotAsset, index) => {
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

  return {
    stats: MOCK_STATS,
    assetDistributionHot: MOCK_ASSET_DISTRIBUTION_HOT,
    assetDistributionCold: MOCK_ASSET_DISTRIBUTION_COLD,
    assetWalletInfo,
    walletStatus: MOCK_WALLET_STATUS,
    recentTransactions: MOCK_RECENT_TRANSACTIONS,
    alerts: MOCK_ALERTS,
  };
}
