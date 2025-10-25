/**
 * 네트워크 그룹 타입 정의
 */

export interface NetworkAsset {
  id: string;
  coin: string;
  label: string;
  contractAddress?: string;
  priceKRW?: number;
  priceUSD?: number;
  isPrimary: boolean;
  addedAt: string;
}

export interface NetworkGroup {
  network: string; // 'ethereum', 'bitcoin', 'solana'
  networkName: string; // 'Ethereum', 'Bitcoin', 'Solana'
  address: string; // 대표 주소
  assets: NetworkAsset[]; // 활성화된 자산 목록
}

// 네트워크 그룹 매핑 (백엔드와 동일)
export const NETWORK_GROUP_MAPPING: Record<string, string> = {
  'ETH': 'ethereum',
  'USDT': 'ethereum',
  'USDC': 'ethereum',
  'CUSTOM_ERC20': 'ethereum',
  'BTC': 'bitcoin',
  'SOL': 'solana',
};

// 기본 자산 목록
export const PRIMARY_ASSETS = ['ETH', 'BTC', 'SOL'];

/**
 * 자산 심볼로부터 네트워크 그룹 가져오기
 */
export function getNetworkGroup(symbol: string): string {
  return NETWORK_GROUP_MAPPING[symbol] || 'ethereum';
}

/**
 * 자산이 기본 자산인지 확인
 */
export function isPrimaryAsset(symbol: string): boolean {
  return PRIMARY_ASSETS.includes(symbol);
}

/**
 * 네트워크 그룹으로부터 기본 자산 가져오기
 */
export function getPrimaryAssetByNetworkGroup(networkGroup: string): string | null {
  return PRIMARY_ASSETS.find(asset => NETWORK_GROUP_MAPPING[asset] === networkGroup) || null;
}
