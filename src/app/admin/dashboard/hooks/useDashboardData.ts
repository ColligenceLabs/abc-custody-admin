/**
 * useDashboardData Hook
 *
 * 대시보드 Mock 데이터 제공
 */

export interface DashboardStats {
  totalMembers: number;
  totalAssetValue: string;
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
  todayTransactions: 156,
  pendingTransactions: 3,
  deposits24h: 89,
  withdrawals24h: 67,
};

const MOCK_ASSET_DISTRIBUTION: AssetDistribution[] = [
  { asset: 'BTC', amount: '12.25', value: 980000000, percentage: 40, color: '#F7931A' },
  { asset: 'ETH', amount: '122.5', value: 612500000, percentage: 25, color: '#627EEA' },
  { asset: 'USDT', amount: '376,923', value: 490000000, percentage: 20, color: '#26A17B' },
  { asset: 'USDC', amount: '188,462', value: 245000000, percentage: 10, color: '#2775CA' },
  { asset: 'SOL', amount: '816.67', value: 122500000, percentage: 5, color: '#00FFA3' },
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
  return {
    stats: MOCK_STATS,
    assetDistribution: MOCK_ASSET_DISTRIBUTION,
    walletStatus: MOCK_WALLET_STATUS,
    recentTransactions: MOCK_RECENT_TRANSACTIONS,
    alerts: MOCK_ALERTS,
  };
}
