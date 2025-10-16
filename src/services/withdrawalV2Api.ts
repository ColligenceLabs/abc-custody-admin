/**
 * Withdrawal Manager v2 - API Service
 *
 * 출금 관리2 시스템 서비스 레이어
 * 기존 Phase 4 시스템과 데이터 공유 (Option 2)
 * 블록체인별 독립 볼트 관리 및 리밸런싱 통합
 *
 * @created 2025-10-15
 */

import {
  NetworkEnvironment,
  BlockchainType,
  AssetType,
  ASSET_TO_BLOCKCHAIN,
  BLOCKCHAIN_NATIVE_ASSET,
  getBlockchainByAsset,
  getNativeAsset,
  getBlockchainDisplayName,
  BlockchainVaultStatus,
  WithdrawalV2Request,
  WithdrawalV2DashboardStats,
  WithdrawalV2Stats,
  VaultV2Summary,
  RebalancingV2Stats,
  AlertV2Stats,
  VaultCheckResult,
  RebalancingRequest,
  WalletInfo,
  WithdrawalStatus,
  HotWalletBalanceCheck,
  ColdWalletBalanceInfo,
  AMLReview
} from '@/types/withdrawalV2';

// Import existing Phase 4 services for data sharing
import { vaultApi } from './vaultApi';
import { mockDb } from './mockDatabase';

// Simulated API delays
const API_DELAY = {
  FAST: 200,
  MEDIUM: 500,
  SLOW: 1000,
} as const;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// Withdrawal V2 API Service Class
// ============================================================================

class WithdrawalV2ApiService {
  private static instance: WithdrawalV2ApiService;

  private constructor() {}

  public static getInstance(): WithdrawalV2ApiService {
    if (!WithdrawalV2ApiService.instance) {
      WithdrawalV2ApiService.instance = new WithdrawalV2ApiService();
    }
    return WithdrawalV2ApiService.instance;
  }

  // ========================================
  // Dashboard Statistics
  // ========================================

  /**
   * V2 통합 대시보드 통계 조회
   * 모든 블록체인의 볼트 상태 + 출금 통계 + 리밸런싱 + 알림
   */
  async getWithdrawalV2Stats(): Promise<WithdrawalV2DashboardStats> {
    await delay(API_DELAY.MEDIUM);

    // 1. 기존 Phase 4 볼트 상태 조회 (데이터 공유)
    const vaultStatus = await vaultApi.getVaultStatus();

    // 2. 블록체인별 볼트 상태 계산
    const bitcoinVault = this.calculateBlockchainVault('BITCOIN', 'mainnet');
    const ethereumVault = this.calculateBlockchainVault('ETHEREUM', 'mainnet');
    const solanaVault = this.calculateBlockchainVault('SOLANA', 'mainnet');

    // 3. 출금 통계 집계 (Mock - 실제로는 LocalStorage에서)
    const withdrawalStats = this.getWithdrawalStats();

    // 4. 리밸런싱 통계
    const rebalancingStats = this.getRebalancingStats();

    // 5. 알림 감지
    const alerts = this.detectAlerts(bitcoinVault, ethereumVault, solanaVault);

    // 6. 전체 볼트 요약
    const vaultSummary = this.aggregateVaultSummary(
      [bitcoinVault, ethereumVault, solanaVault],
      'mainnet'
    );

    return {
      withdrawals: withdrawalStats,
      vaults: {
        bitcoin: bitcoinVault,
        ethereum: ethereumVault,
        solana: solanaVault,
      },
      vaultSummary,
      rebalancing: rebalancingStats,
      alerts,
      lastUpdated: new Date(),
    };
  }

  // ========================================
  // Blockchain Vault Calculation
  // ========================================

  /**
   * 블록체인별 볼트 상태 계산
   * Bitcoin, Ethereum (& ERC20), Solana 각각 독립적으로 관리
   *
   * 중요: 리밸런싱 기준은 네이티브 자산의 개수(수량) 기준입니다!
   * - Bitcoin: BTC 개수
   * - Ethereum: ETH 개수 (ERC20는 별도)
   * - Solana: SOL 개수
   */
  private calculateBlockchainVault(
    blockchain: BlockchainType,
    network: NetworkEnvironment
  ): BlockchainVaultStatus {
    // Mock 데이터 (실제로는 vaultApi에서 조회)
    // 여기서는 각 블록체인별로 독립적인 Hot/Cold 잔고를 가정

    const mockVaultData = this.getMockBlockchainVaultData(blockchain, network);

    // 네이티브 자산 찾기
    const nativeAsset = getNativeAsset(blockchain);

    // Hot/Cold 네이티브 자산 개수
    const hotNativeAsset = mockVaultData.hotAssets.find(a => a.symbol === nativeAsset);
    const coldNativeAsset = mockVaultData.coldAssets.find(a => a.symbol === nativeAsset);

    const hotAmount = hotNativeAsset ? parseFloat(hotNativeAsset.balance) : 0;
    const coldAmount = coldNativeAsset ? parseFloat(coldNativeAsset.balance) : 0;
    const totalAmount = hotAmount + coldAmount;

    // 네이티브 자산 개수 기준으로 비율 계산
    const hotRatio = totalAmount > 0 ? (hotAmount / totalAmount) * 100 : 0;
    const coldRatio = totalAmount > 0 ? (coldAmount / totalAmount) * 100 : 0;
    const deviation = Math.abs(hotRatio - 20);

    // KRW는 참고용으로만 계산
    const hotTotalKRW = mockVaultData.hotAssets.reduce(
      (sum, asset) => sum + parseFloat(asset.valueKRW.replace(/,/g, '')),
      0
    );

    const coldTotalKRW = mockVaultData.coldAssets.reduce(
      (sum, asset) => sum + parseFloat(asset.valueKRW.replace(/,/g, '')),
      0
    );

    const totalKRW = hotTotalKRW + coldTotalKRW;

    // Hot 자산 비율 계산
    const hotAssets = mockVaultData.hotAssets.map(asset => ({
      ...asset,
      percentage: hotTotalKRW > 0 ? (parseFloat(asset.valueKRW.replace(/,/g, '')) / hotTotalKRW) * 100 : 0
    }));

    // Cold 자산 비율 계산
    const coldAssets = mockVaultData.coldAssets.map(asset => ({
      ...asset,
      percentage: coldTotalKRW > 0 ? (parseFloat(asset.valueKRW.replace(/,/g, '')) / coldTotalKRW) * 100 : 0
    }));

    return {
      blockchain,
      blockchainName: getBlockchainDisplayName(blockchain),
      network,

      hotWallet: {
        totalValueKRW: hotTotalKRW.toLocaleString('ko-KR'),
        assets: hotAssets,
      },

      coldWallet: {
        totalValueKRW: coldTotalKRW.toLocaleString('ko-KR'),
        assets: coldAssets,
      },

      totalValueKRW: totalKRW.toLocaleString('ko-KR'),
      hotRatio: Math.round(hotRatio * 10) / 10,
      coldRatio: Math.round(coldRatio * 10) / 10,
      targetHotRatio: 20,
      targetColdRatio: 80,
      deviation: Math.round(deviation * 10) / 10,
      needsRebalancing: deviation > 5,
      rebalancingThreshold: 5,
      lastUpdated: new Date(),
    };
  }

  /**
   * Mock 블록체인별 볼트 데이터
   * 실제로는 vaultApi나 별도 저장소에서 조회
   */
  private getMockBlockchainVaultData(
    blockchain: BlockchainType,
    network: NetworkEnvironment
  ) {
    // Bitcoin 블록체인
    if (blockchain === 'BITCOIN') {
      return {
        hotAssets: [
          {
            symbol: 'BTC' as AssetType,
            balance: '25.5',
            valueKRW: '2,040,000,000',
            percentage: 100,
          },
        ],
        coldAssets: [
          {
            symbol: 'BTC' as AssetType,
            balance: '102.0',
            valueKRW: '8,160,000,000',
            percentage: 100,
          },
        ],
      };
    }

    // Ethereum 블록체인 (ETH & ERC20 통합)
    if (blockchain === 'ETHEREUM') {
      return {
        hotAssets: [
          {
            symbol: 'ETH' as AssetType,
            balance: '500.0',
            valueKRW: '2,500,000,000',
            percentage: 50,
          },
          {
            symbol: 'USDT' as AssetType,
            balance: '1,500,000.0',
            valueKRW: '2,000,000,000',
            percentage: 40,
          },
          {
            symbol: 'USDC' as AssetType,
            balance: '500,000.0',
            valueKRW: '500,000,000',
            percentage: 10,
          },
        ],
        coldAssets: [
          {
            symbol: 'ETH' as AssetType,
            balance: '2,000.0',
            valueKRW: '10,000,000,000',
            percentage: 50,
          },
          {
            symbol: 'USDT' as AssetType,
            balance: '6,000,000.0',
            valueKRW: '8,000,000,000',
            percentage: 40,
          },
          {
            symbol: 'USDC' as AssetType,
            balance: '2,000,000.0',
            valueKRW: '2,000,000,000',
            percentage: 10,
          },
        ],
      };
    }

    // Solana 블록체인
    if (blockchain === 'SOLANA') {
      return {
        hotAssets: [
          {
            symbol: 'SOL' as AssetType,
            balance: '10,000.0',
            valueKRW: '1,500,000,000',
            percentage: 100,
          },
        ],
        coldAssets: [
          {
            symbol: 'SOL' as AssetType,
            balance: '40,000.0',
            valueKRW: '6,000,000,000',
            percentage: 100,
          },
        ],
      };
    }

    // Fallback
    return { hotAssets: [], coldAssets: [] };
  }

  // ========================================
  // Withdrawal Statistics
  // ========================================

  /**
   * 출금 통계 집계 (개선된 7-상태 모델)
   */
  private getWithdrawalStats(): WithdrawalV2Stats {
    // Mock 데이터 (실제로는 LocalStorage에서 출금 요청 조회)
    return {
      pending: 3,
      approvalWaiting: 5,
      amlFlagged: 1,
      processing: 4,
      completed: 15,
      rejected: 2,
      failed: 1,
      completedToday: 15,
      totalValueTodayKRW: '5,240,000,000',
    };
  }

  /**
   * 리밸런싱 통계
   */
  private getRebalancingStats(): RebalancingV2Stats {
    // Mock 데이터
    return {
      required: 3,
      inProgress: 1,
      completedToday: 2,
      byBlockchain: {
        bitcoin: 1,
        ethereum: 1,
        solana: 1,
      },
    };
  }

  /**
   * 알림 감지
   */
  private detectAlerts(
    bitcoin: BlockchainVaultStatus,
    ethereum: BlockchainVaultStatus,
    solana: BlockchainVaultStatus
  ): AlertV2Stats {
    return {
      urgentWithdrawals: 2,
      hotBalanceLow: {
        bitcoin: bitcoin.hotRatio < 15,
        ethereum: ethereum.hotRatio < 15,
        solana: solana.hotRatio < 15,
      },
      expiringSignatures: 1,
    };
  }

  /**
   * 전체 볼트 요약
   */
  private aggregateVaultSummary(
    vaults: BlockchainVaultStatus[],
    network: NetworkEnvironment
  ): VaultV2Summary {
    const totalKRW = vaults.reduce(
      (sum, vault) => sum + parseFloat(vault.totalValueKRW.replace(/,/g, '')),
      0
    );

    const hotTotalKRW = vaults.reduce(
      (sum, vault) => sum + parseFloat(vault.hotWallet.totalValueKRW.replace(/,/g, '')),
      0
    );

    const coldTotalKRW = vaults.reduce(
      (sum, vault) => sum + parseFloat(vault.coldWallet.totalValueKRW.replace(/,/g, '')),
      0
    );

    const overallHotRatio = totalKRW > 0 ? (hotTotalKRW / totalKRW) * 100 : 0;
    const overallColdRatio = totalKRW > 0 ? (coldTotalKRW / totalKRW) * 100 : 0;

    const blockchainsNeedingRebalancing = vaults
      .filter(vault => vault.needsRebalancing)
      .map(vault => vault.blockchain);

    return {
      network,
      totalValueKRW: totalKRW.toLocaleString('ko-KR'),
      hotTotalKRW: hotTotalKRW.toLocaleString('ko-KR'),
      coldTotalKRW: coldTotalKRW.toLocaleString('ko-KR'),
      overallHotRatio: Math.round(overallHotRatio * 10) / 10,
      overallColdRatio: Math.round(overallColdRatio * 10) / 10,
      blockchainsNeedingRebalancing,
    };
  }

  // ========================================
  // Helper Methods
  // ========================================

  /**
   * Mock 출금 정보 조회
   * 실제로는 LocalStorage나 상태 관리에서 조회
   */
  private getMockWithdrawal(withdrawalId: string): WithdrawalV2Request {
    // Mock withdrawal request
    return {
      id: withdrawalId,
      memberId: 'member-001',
      memberName: 'Alpha Corporation',
      amount: '5.0',
      asset: 'BTC',
      blockchain: 'BITCOIN',
      network: 'mainnet',
      toAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      status: 'pending',
      priority: 'normal',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  // ========================================
  // Pre-Withdrawal Vault Check
  // ========================================

  /**
   * 출금 전 볼트 체크
   * 해당 블록체인의 Hot 잔고 충분 여부 확인
   */
  async checkVaultBeforeWithdrawal(
    withdrawalId: string
  ): Promise<VaultCheckResult> {
    await delay(API_DELAY.MEDIUM);

    // 1. 출금 정보 조회 (Mock - 실제로는 LocalStorage)
    const withdrawal = this.getMockWithdrawal(withdrawalId);

    // 2. 블록체인 자동 판별
    const blockchain = getBlockchainByAsset(withdrawal.asset);
    const network = withdrawal.network;

    // 3. 해당 블록체인 볼트 상태 조회
    const blockchainVault = this.calculateBlockchainVault(blockchain, network);

    // 4. Hot 잔고 충분성 체크
    const assetHotBalance = blockchainVault.hotWallet.assets.find(
      a => a.symbol === withdrawal.asset
    )?.balance || '0';

    const requestedAmount = parseFloat(withdrawal.amount);
    const availableBalance = parseFloat(assetHotBalance);

    const isEnough = availableBalance >= requestedAmount;

    // 5. 리밸런싱 계산 (필요 시)
    let rebalancing = null;
    if (!isEnough) {
      const shortfall = requestedAmount - availableBalance;
      const margin = shortfall * 0.2; // 20% 안전 마진

      rebalancing = {
        required: true,
        blockchain,
        network,
        asset: withdrawal.asset,
        amount: shortfall.toString(),
        amountWithMargin: (shortfall + margin).toString(),
        amountKRW: (shortfall * 80000000).toString(), // Mock 환율
        reason: 'insufficient_hot' as const,
        estimatedTime: '30분',
        priority: 'urgent' as const,
      };
    }

    // 6. 출금 후 예상 상태
    const afterWithdrawal = {
      hotBalance: (availableBalance - requestedAmount).toString(),
      coldBalance: blockchainVault.coldWallet.assets.find(
        a => a.symbol === withdrawal.asset
      )?.balance || '0',
      hotRatio: blockchainVault.hotRatio - 2, // Mock 계산
      coldRatio: blockchainVault.coldRatio + 2,
      needsRebalancing: Math.abs((blockchainVault.hotRatio - 2) - 20) > 5,
      deviation: Math.abs((blockchainVault.hotRatio - 2) - 20),
    };

    // VaultCheckResult 구조로 변환
    return {
      blockchain,
      network,
      hotSufficient: isEnough,
      hotBalance: assetHotBalance,
      requestedAmount: withdrawal.amount,
      rebalancingRequired: !isEnough,
      rebalancingAmount: !isEnough && rebalancing ? rebalancing.amountWithMargin : undefined,
      rebalancingAsset: !isEnough ? withdrawal.asset : undefined,
      checkedAt: new Date(),
    };
  }


  // ========================================
  // Hot/Cold Wallet Operations (New)
  // ========================================

  /**
   * Hot/Cold 지갑 잔고 확인
   * approval_waiting 상태에서 표시할 정보 계산
   */
  async checkWalletBalances(request: WithdrawalV2Request): Promise<{
    hot: HotWalletBalanceCheck;
    cold: ColdWalletBalanceInfo;
  }> {
    await delay(API_DELAY.FAST);

    const blockchain = getBlockchainByAsset(request.asset);
    const vaultStatus = this.calculateBlockchainVault(blockchain, request.network);

    // Hot 지갑 잔고 체크
    const hotAsset = vaultStatus.hotWallet.assets.find(a => a.symbol === request.asset);
    const coldAsset = vaultStatus.coldWallet.assets.find(a => a.symbol === request.asset);

    const currentBalance = parseFloat(hotAsset?.balance || '0');
    const requestedAmount = parseFloat(request.amount);
    const afterBalance = currentBalance - requestedAmount;
    const isSufficient = afterBalance >= 0;

    // Hot/Cold 비율 계산 (네이티브 자산 기준)
    const nativeAsset = getNativeAsset(blockchain);
    const hotNative = vaultStatus.hotWallet.assets.find(a => a.symbol === nativeAsset);
    const coldNative = vaultStatus.coldWallet.assets.find(a => a.symbol === nativeAsset);

    const hotNativeBalance = parseFloat(hotNative?.balance || '0');
    const coldNativeBalance = parseFloat(coldNative?.balance || '0');
    const totalNative = hotNativeBalance + coldNativeBalance;

    const currentHotRatio = totalNative > 0 ? (hotNativeBalance / totalNative) * 100 : 0;
    const afterHotRatio = totalNative > 0 ? ((hotNativeBalance - (request.asset === nativeAsset ? requestedAmount : 0)) / totalNative) * 100 : 0;
    const deviation = Math.abs(afterHotRatio - 20);

    const hotWalletCheck: HotWalletBalanceCheck = {
      asset: request.asset,
      currentBalance: currentBalance.toString(),
      requestedAmount: requestedAmount.toString(),
      afterBalance: afterBalance.toString(),
      isSufficient,
      shortfall: isSufficient ? undefined : (requestedAmount - currentBalance).toString(),
      currentHotRatio: Math.round(currentHotRatio * 10) / 10,
      afterHotRatio: Math.round(afterHotRatio * 10) / 10,
      needsRebalancing: deviation > 5,
      deviation: Math.round(deviation * 10) / 10,
    };

    const coldWalletInfo: ColdWalletBalanceInfo = {
      asset: request.asset,
      currentBalance: coldAsset?.balance || '0',
      isSufficient: parseFloat(coldAsset?.balance || '0') >= requestedAmount,
    };

    return { hot: hotWalletCheck, cold: coldWalletInfo };
  }

  /**
   * Hot 지갑 출금 승인
   * approval_waiting → processing
   */
  async approveWithHotWallet(requestId: string, hotCheck: HotWalletBalanceCheck): Promise<void> {
    await delay(API_DELAY.MEDIUM);

    // 1. Hot 잔고 최종 확인
    if (!hotCheck.isSufficient) {
      throw new Error('Hot 지갑 잔고가 부족합니다.');
    }

    // 2. Hot 지갑 출금 API 호출 (외부 시스템) - Mock
    console.log(`Hot wallet withdrawal initiated for request ${requestId}`);

    // 3. 상태 전이: approval_waiting → processing
    // 4. walletSource: "hot" 설정
    // 5. 외부 시스템 콜백 대기

    // Mock: 실제로는 데이터베이스 업데이트
    return Promise.resolve();
  }

  /**
   * Cold 지갑 출금 승인
   * approval_waiting → processing
   */
  async approveWithColdWallet(requestId: string, coldInfo: ColdWalletBalanceInfo): Promise<void> {
    await delay(API_DELAY.MEDIUM);

    // 1. Cold 잔고 확인
    if (!coldInfo.isSufficient) {
      throw new Error('Cold 지갑 잔고가 부족합니다.');
    }

    // 2. Cold 지갑 출금 API 호출 (외부 시스템) - Mock
    console.log(`Cold wallet withdrawal initiated for request ${requestId}`);

    // 3. 상태 전이: approval_waiting → processing
    // 4. walletSource: "cold" 설정
    // 5. 외부 시스템 콜백 대기

    // Mock: 실제로는 데이터베이스 업데이트
    return Promise.resolve();
  }

  /**
   * AML 검토 상태 확인
   * pending → approval_waiting 또는 aml_flagged 전이
   */
  async checkAMLStatus(requestId: string): Promise<AMLReview> {
    await delay(API_DELAY.MEDIUM);

    // Mock AML 검토 결과
    const mockReview: AMLReview = {
      reviewId: `AML-${requestId}`,
      status: Math.random() > 0.1 ? 'passed' : 'flagged',
      riskLevel: Math.random() > 0.1 ? 'low' : 'high',
      riskScore: Math.random() > 0.1 ? 25 : 85,
      flaggedReasons: Math.random() > 0.1 ? undefined : ['High-risk jurisdiction', 'Large amount'],
      reviewedAt: new Date(),
      notes: 'Automated AML review completed',
    };

    return mockReview;
  }

  /**
   * 출금 거부
   * approval_waiting 또는 aml_flagged → rejected
   */
  async rejectWithdrawal(requestId: string, reason: string): Promise<void> {
    await delay(API_DELAY.FAST);

    // Mock: 실제로는 데이터베이스 업데이트
    console.log(`Withdrawal ${requestId} rejected: ${reason}`);
    return Promise.resolve();
  }

  /**
   * MPC 지갑 콜백 처리
   * processing → completed 또는 failed
   */
  async handleMPCCallback(
    requestId: string,
    result: {
      success: boolean;
      txHash?: string;
      error?: { code: string; message: string };
    }
  ): Promise<void> {
    await delay(API_DELAY.FAST);

    // Mock: 실제로는 데이터베이스 업데이트
    if (result.success) {
      console.log(`Withdrawal ${requestId} completed with txHash: ${result.txHash}`);
    } else {
      console.log(`Withdrawal ${requestId} failed: ${result.error?.message}`);
    }

    return Promise.resolve();
  }
}

// ============================================================================
// State Transition Validation
// ============================================================================

/**
 * 허용된 상태 전이 규칙
 */
const ALLOWED_TRANSITIONS: Record<WithdrawalStatus, WithdrawalStatus[]> = {
  pending: ["approval_waiting", "aml_flagged"],
  approval_waiting: ["processing", "rejected"],
  aml_flagged: ["rejected"],
  processing: ["completed", "failed"],
  completed: [],
  rejected: [],
  failed: ["pending"], // 재시도 가능
};

/**
 * 상태 전이 검증 함수
 */
export function isValidTransition(
  from: WithdrawalStatus,
  to: WithdrawalStatus
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

// Export singleton instance
export const withdrawalV2Api = WithdrawalV2ApiService.getInstance();
