import { CryptoCurrency } from '@/types/groups';

/**
 * 가상자산 심볼을 네트워크로 변환
 */
export function getNetworkByCurrency(currency: CryptoCurrency): string {
  const mapping: Record<CryptoCurrency, string> = {
    BTC: 'Bitcoin',
    ETH: 'Ethereum',
    USDT: 'Ethereum',  // USDT는 ERC20
    USDC: 'Ethereum',  // USDC는 ERC20
    SOL: 'Solana',
  };

  return mapping[currency] || 'Ethereum';  // 기본값: Ethereum
}

/**
 * 네트워크에서 지원하는 자산 목록 가져오기
 */
export function getAssetsByNetwork(
  network: string,
  networkAssets: Record<string, any[]>
): any[] {
  return networkAssets[network] || [];
}

/**
 * 그룹의 currency가 특정 네트워크에서 지원되는지 확인
 */
export function isCurrencySupportedOnNetwork(
  currency: CryptoCurrency,
  network: string
): boolean {
  const expectedNetwork = getNetworkByCurrency(currency);
  return expectedNetwork === network;
}
