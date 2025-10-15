/**
 * 블록체인 Explorer URL 생성 유틸리티
 * 네트워크와 환경(testnet/mainnet)에 따라 적절한 explorer URL 반환
 */

type BlockchainEnv = 'testnet' | 'mainnet';
type NetworkType = 'Ethereum' | 'Bitcoin' | 'Solana' | 'Holesky';

interface ExplorerConfig {
  baseUrl: string;
  txPath: string;
  addressPath: string;
  blockPath: string;
}

// 환경 변수에서 blockchain 환경 가져오기
const getBlockchainEnv = (): BlockchainEnv => {
  return (process.env.NEXT_PUBLIC_BLOCKCHAIN_ENV as BlockchainEnv) || 'testnet';
};

// 네트워크별 Explorer 설정
const EXPLORER_CONFIGS: Record<NetworkType, Record<BlockchainEnv, ExplorerConfig>> = {
  Ethereum: {
    mainnet: {
      baseUrl: 'https://etherscan.io',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
    testnet: {
      baseUrl: 'https://holesky.etherscan.io',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
  },
  Holesky: {
    mainnet: {
      baseUrl: 'https://etherscan.io', // Holesky는 testnet이지만 fallback
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
    testnet: {
      baseUrl: 'https://holesky.etherscan.io',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
  },
  Bitcoin: {
    mainnet: {
      baseUrl: 'https://blockstream.info',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
    testnet: {
      baseUrl: 'https://blockstream.info/testnet',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
  },
  Solana: {
    mainnet: {
      baseUrl: 'https://explorer.solana.com',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
    testnet: {
      baseUrl: 'https://explorer.solana.com',
      txPath: '/tx',
      addressPath: '/address',
      blockPath: '/block',
    },
  },
};

/**
 * 네트워크에 맞는 Explorer 설정 가져오기
 */
const getExplorerConfig = (network: string): ExplorerConfig => {
  const env = getBlockchainEnv();

  // 네트워크 이름 정규화
  let normalizedNetwork: NetworkType;

  if (network.toLowerCase().includes('holesky')) {
    normalizedNetwork = 'Holesky';
  } else if (network.toLowerCase().includes('ethereum') || network.toLowerCase().includes('eth')) {
    normalizedNetwork = 'Ethereum';
  } else if (network.toLowerCase().includes('bitcoin') || network.toLowerCase().includes('btc')) {
    normalizedNetwork = 'Bitcoin';
  } else if (network.toLowerCase().includes('solana') || network.toLowerCase().includes('sol')) {
    normalizedNetwork = 'Solana';
  } else {
    // 기본값: Ethereum
    normalizedNetwork = 'Ethereum';
  }

  return EXPLORER_CONFIGS[normalizedNetwork][env];
};

/**
 * 트랜잭션 Explorer URL 생성
 * @param txHash - 트랜잭션 해시
 * @param network - 네트워크 이름 (예: "Ethereum", "Holesky", "Bitcoin")
 * @returns Explorer URL
 */
export const getTransactionExplorerUrl = (txHash: string, network: string): string => {
  const config = getExplorerConfig(network);

  // Solana testnet의 경우 cluster 파라미터 추가
  if (network.toLowerCase().includes('solana') && getBlockchainEnv() === 'testnet') {
    return `${config.baseUrl}${config.txPath}/${txHash}?cluster=devnet`;
  }

  return `${config.baseUrl}${config.txPath}/${txHash}`;
};

/**
 * 주소 Explorer URL 생성
 * @param address - 블록체인 주소
 * @param network - 네트워크 이름
 * @returns Explorer URL
 */
export const getAddressExplorerUrl = (address: string, network: string): string => {
  const config = getExplorerConfig(network);

  // Solana testnet의 경우 cluster 파라미터 추가
  if (network.toLowerCase().includes('solana') && getBlockchainEnv() === 'testnet') {
    return `${config.baseUrl}${config.addressPath}/${address}?cluster=devnet`;
  }

  return `${config.baseUrl}${config.addressPath}/${address}`;
};

/**
 * 블록 Explorer URL 생성
 * @param blockNumber - 블록 번호 또는 해시
 * @param network - 네트워크 이름
 * @returns Explorer URL
 */
export const getBlockExplorerUrl = (blockNumber: number | string, network: string): string => {
  const config = getExplorerConfig(network);

  // Solana testnet의 경우 cluster 파라미터 추가
  if (network.toLowerCase().includes('solana') && getBlockchainEnv() === 'testnet') {
    return `${config.baseUrl}${config.blockPath}/${blockNumber}?cluster=devnet`;
  }

  return `${config.baseUrl}${config.blockPath}/${blockNumber}`;
};

/**
 * 현재 블록체인 환경 반환
 * @returns 'testnet' | 'mainnet'
 */
export const getCurrentBlockchainEnv = (): BlockchainEnv => {
  return getBlockchainEnv();
};

/**
 * 네트워크 표시 이름 가져오기 (환경 포함)
 * @param network - 네트워크 이름
 * @returns 표시 이름 (예: "Ethereum Mainnet", "Holesky Testnet")
 */
export const getNetworkDisplayName = (network: string): string => {
  const env = getBlockchainEnv();
  const envName = env === 'mainnet' ? 'Mainnet' : 'Testnet';

  if (network.toLowerCase().includes('holesky')) {
    return `Holesky ${envName}`;
  } else if (network.toLowerCase().includes('ethereum') || network.toLowerCase().includes('eth')) {
    return `Ethereum ${envName}`;
  } else if (network.toLowerCase().includes('bitcoin') || network.toLowerCase().includes('btc')) {
    return `Bitcoin ${envName}`;
  } else if (network.toLowerCase().includes('solana') || network.toLowerCase().includes('sol')) {
    return `Solana ${envName}`;
  }

  return `${network} ${envName}`;
};
