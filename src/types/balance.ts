export interface Balance {
  id: string;
  asset: string;
  network: string;
  availableBalance: string;
  lockedBalance: string;
  totalBalance: string;
  updatedAt: string;
  pendingWithdrawals?: Array<{
    id: string;
    amount: number;
    status: string;
    initiatedAt: string;
  }>;
}

export interface BalanceSummary {
  userId: string;
  totalAssets: number;
  balances: Array<{
    asset: string;
    network: string;
    totalBalance: number;
    availableBalance: number;
    lockedBalance: number;
  }>;
}

export interface AssetData {
  symbol: string;
  name: string;
  balance: string;
  value: number;
  change: number;
  currentPrice: number;
}
