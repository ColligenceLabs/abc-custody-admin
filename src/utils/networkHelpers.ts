/**
 * 네트워크 관련 헬퍼 함수
 */

import { NetworkGroup } from '@/types/networkGroup';
import { NetworkOption, Asset } from '@/types/assetAddition';

// 네트워크별 지원 자산 정의
const NETWORK_ASSETS = {
  ethereum: {
    networkName: 'Ethereum',
    primaryAsset: { symbol: 'ETH', name: 'Ethereum', required: true },
    supportedTokens: [
      { symbol: 'USDT', name: 'Tether', contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      { symbol: 'USDC', name: 'USD Coin', contractAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
    ],
  },
  bitcoin: {
    networkName: 'Bitcoin',
    primaryAsset: { symbol: 'BTC', name: 'Bitcoin', required: true },
    supportedTokens: [],
  },
  solana: {
    networkName: 'Solana',
    primaryAsset: { symbol: 'SOL', name: 'Solana', required: true },
    supportedTokens: [],
  },
};

/**
 * 기존 네트워크 그룹과 지원 자산 정보를 결합하여 NetworkOption 생성
 */
export function groupAssetsByNetwork(
  existingNetworks: NetworkGroup[]
): NetworkOption[] {
  const networkOptions: NetworkOption[] = [];

  // 모든 네트워크 그룹에 대해 옵션 생성
  Object.entries(NETWORK_ASSETS).forEach(([networkGroup, config]) => {
    // 이미 활성화된 네트워크 찾기
    const existingNetwork = existingNetworks.find((n) => n.network === networkGroup);

    // 이미 추가된 자산 목록
    const addedAssets = new Set(
      existingNetwork?.assets.map((a) => a.coin) || []
    );

    // 지원 토큰 목록에 추가 여부 표시
    const supportedTokens: Asset[] = config.supportedTokens.map((token) => ({
      ...token,
      isAdded: addedAssets.has(token.symbol),
    }));

    networkOptions.push({
      networkGroup,
      networkName: config.networkName,
      isActive: !!existingNetwork,
      existingAddress: existingNetwork?.address,
      primaryAsset: config.primaryAsset,
      supportedTokens,
    });
  });

  return networkOptions;
}

/**
 * 네트워크 그룹에서 네트워크 이름 가져오기
 */
export function getNetworkName(networkGroup: string): string {
  return NETWORK_ASSETS[networkGroup as keyof typeof NETWORK_ASSETS]?.networkName || networkGroup;
}

/**
 * 심볼이 기본 자산인지 확인
 */
export function isPrimaryAsset(symbol: string): boolean {
  return Object.values(NETWORK_ASSETS).some(
    (config) => config.primaryAsset.symbol === symbol
  );
}

/**
 * 심볼의 네트워크 그룹 가져오기
 */
export function getNetworkGroupBySymbol(symbol: string): string | null {
  for (const [networkGroup, config] of Object.entries(NETWORK_ASSETS)) {
    if (config.primaryAsset.symbol === symbol) {
      return networkGroup;
    }
    if (config.supportedTokens.some((t) => t.symbol === symbol)) {
      return networkGroup;
    }
  }
  return null;
}
