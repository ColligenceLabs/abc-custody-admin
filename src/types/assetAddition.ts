/**
 * 자산 추가 관련 타입 정의
 */

export interface Asset {
  symbol: string;
  name: string;
  isAdded: boolean;
  contractAddress?: string;
}

export interface NetworkOption {
  networkGroup: string;
  networkName: string;
  isActive: boolean;
  existingAddress?: string;
  primaryAsset: {
    symbol: string;
    name: string;
    required: boolean;
  };
  supportedTokens: Asset[];
}

export interface AssetAdditionRequest {
  networkGroup: string;
  primaryAsset?: string; // 신규 네트워크인 경우
  tokens: string[]; // 추가할 토큰들
}

export type WizardStep = 'network-select' | 'asset-select' | 'custom-token';

export interface WizardState {
  step: WizardStep;
  selectedNetwork: string | null;
  selectedAssets: string[];
  customToken: {
    symbol: string;
    name: string;
    contractAddress: string;
  } | null;
}
