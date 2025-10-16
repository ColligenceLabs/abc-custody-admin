/**
 * Vault API Service
 *
 * Handles Hot/Cold wallet monitoring, rebalancing operations, and Air-gap signing
 */

import {
  VaultStatus,
  VaultValue,
  RebalancingRecord,
  RebalancingRequest,
  RebalancingStatus,
  RebalancingType,
  RebalancingPriority,
  RebalancingStats,
  RebalancingCalculation,
  RebalancingFilter,
  AirGapSigningRequest,
  SignedTransaction,
  VaultAlert,
  VaultAlertType,
  VaultAlertMetadata,
  WalletType,
  AlertSeverity,
  BalanceStatus,
  RebalancingAsset,
  AssetTransferStatus
} from '@/types/vault';
import { mockDb } from './mockDatabase';

// Simulated API delays
const API_DELAY = {
  FAST: 200,
  MEDIUM: 500,
  SLOW: 1000,
  VERY_SLOW: 2000 // For complex operations like Air-gap signing
} as const;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class VaultApiService {
  private static instance: VaultApiService;

  private constructor() {}

  public static getInstance(): VaultApiService {
    if (!VaultApiService.instance) {
      VaultApiService.instance = new VaultApiService();
    }
    return VaultApiService.instance;
  }

  // Vault Status Monitoring
  async getVaultStatus(): Promise<VaultStatus> {
    await delay(API_DELAY.FAST);
    return mockDb.getVaultStatus();
  }

  async updateVaultStatus(updates: Partial<VaultStatus>): Promise<VaultStatus> {
    await delay(API_DELAY.MEDIUM);
    return mockDb.updateVaultStatus({
      ...updates,
      updatedAt: new Date()
    });
  }

  async getHotWalletBalance(): Promise<VaultValue> {
    await delay(API_DELAY.FAST);
    const vaultStatus = mockDb.getVaultStatus();
    return vaultStatus.hotWallet.totalValue;
  }

  async getColdWalletBalance(): Promise<VaultValue> {
    await delay(API_DELAY.FAST);
    const vaultStatus = mockDb.getVaultStatus();
    return vaultStatus.coldWallet.totalValue;
  }

  async getHotColdRatio(): Promise<BalanceStatus> {
    await delay(API_DELAY.FAST);
    const vaultStatus = mockDb.getVaultStatus();
    return vaultStatus.balanceStatus;
  }

  // Vault Alerts and Monitoring
  async getVaultAlerts(): Promise<VaultAlert[]> {
    await delay(API_DELAY.FAST);

    const vaultStatus = mockDb.getVaultStatus();
    const alerts: VaultAlert[] = [];

    // Check for rebalancing needs
    if (vaultStatus.balanceStatus.needsRebalancing) {
      alerts.push({
        id: 'alert-rebalance-001',
        type: VaultAlertType.REBALANCING_NEEDED,
        severity: vaultStatus.balanceStatus.deviation > 5 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
        title: '리밸런싱 필요',
        message: `Hot 지갑 비율이 ${vaultStatus.balanceStatus.hotRatio}% 입니다 (목표: ${vaultStatus.balanceStatus.targetHotRatio}%)`,
        metadata: {
          previousValue: vaultStatus.balanceStatus.targetHotRatio.toString() + '%',
          recommendedAction: '목표 비율 복원을 위해 리밸런싱을 시작하세요',
          urgencyLevel: vaultStatus.balanceStatus.deviation > 5 ? 8 : 5,
          estimatedImpact: '24시간 내에 조치하지 않으면 중간 위험도'
        },
        createdAt: new Date(),
        isResolved: false,
        autoResolve: false
      });
    }

    // Check for low hot wallet balance
    if (vaultStatus.hotWallet.utilizationRate > 80) {
      alerts.push({
        id: 'alert-hot-low-001',
        type: VaultAlertType.HOT_WALLET_LOW,
        severity: vaultStatus.hotWallet.utilizationRate > 90 ? AlertSeverity.CRITICAL : AlertSeverity.ERROR,
        title: 'Hot 지갑 잔액 부족',
        message: `Hot 지갑 활용률이 ${vaultStatus.hotWallet.utilizationRate}% 입니다`,
        metadata: {
          walletType: WalletType.HOT,
          previousValue: '80%',
          recommendedAction: 'Hot 지갑에 자금을 추가하거나 리밸런싱을 시작하세요',
          urgencyLevel: vaultStatus.hotWallet.utilizationRate > 90 ? 9 : 7,
          estimatedImpact: '서비스 중단의 높은 위험'
        },
        createdAt: new Date(),
        isResolved: false,
        autoResolve: false
      });
    }

    // Check for security issues
    if (vaultStatus.coldWallet.securityLevel !== 'high') {
      alerts.push({
        id: 'alert-security-001',
        type: VaultAlertType.SECURITY_BREACH,
        severity: AlertSeverity.ERROR,
        title: '보안 레벨 경고',
        message: `Cold 지갑 보안 레벨: ${vaultStatus.coldWallet.securityLevel}`,
        metadata: {
          walletType: WalletType.COLD,
          previousValue: 'high',
          recommendedAction: 'Cold 지갑 보안 설정을 검토하고 업그레이드하세요',
          urgencyLevel: 6,
          estimatedImpact: '잠재적 보안 취약점'
        },
        createdAt: new Date(),
        isResolved: false,
        autoResolve: false
      });
    }

    return alerts;
  }

  async resolveAlert(alertId: string): Promise<{ success: boolean }> {
    await delay(API_DELAY.FAST);

    // In real implementation, would update alert status
    console.log(`Resolving alert: ${alertId}`);

    return { success: true };
  }

  // Rebalancing Operations
  async getRebalancingHistory(limit: number = 50): Promise<RebalancingRecord[]> {
    await delay(API_DELAY.FAST);

    const history = mockDb.getRebalancingHistory();
    return history.slice(0, limit);
  }

  async calculateRebalancingAmount(
    targetRatio: { hot: number; cold: number }
  ): Promise<{
    hotToCold: string;
    coldToHot: string;
    recommendation: 'hot_to_cold' | 'cold_to_hot' | 'no_change';
    estimatedGasFee: string;
  }> {
    await delay(API_DELAY.MEDIUM);

    const vaultStatus = mockDb.getVaultStatus();
    const totalValue = parseFloat(vaultStatus.totalValue.totalInKRW);
    const currentHotValue = parseFloat(vaultStatus.hotWallet.totalValue.totalInKRW);
    const currentColdValue = parseFloat(vaultStatus.coldWallet.totalValue.totalInKRW);

    const targetHotValue = (totalValue * targetRatio.hot) / 100;
    const targetColdValue = (totalValue * targetRatio.cold) / 100;

    const hotToColdAmount = Math.max(0, currentHotValue - targetHotValue);
    const coldToHotAmount = Math.max(0, targetHotValue - currentHotValue);

    let recommendation: 'hot_to_cold' | 'cold_to_hot' | 'no_change';
    if (hotToColdAmount > coldToHotAmount) {
      recommendation = 'hot_to_cold';
    } else if (coldToHotAmount > hotToColdAmount) {
      recommendation = 'cold_to_hot';
    } else {
      recommendation = 'no_change';
    }

    // Estimate gas fee (mock calculation)
    const estimatedGasFee = Math.max(hotToColdAmount, coldToHotAmount) * 0.001; // 0.1% of transfer amount

    return {
      hotToCold: Math.floor(hotToColdAmount).toString(),
      coldToHot: Math.floor(coldToHotAmount).toString(),
      recommendation,
      estimatedGasFee: Math.floor(estimatedGasFee).toString()
    };
  }

  async initiateRebalancing(request: RebalancingRequest): Promise<{
    success: boolean;
    rebalancingId: string;
    estimatedCompletionTime: string;
  }> {
    await delay(API_DELAY.SLOW);

    const rebalancingId = `rebalance-${Date.now()}`;

    // Create a minimal rebalancing record for now
    // In a real implementation, this would properly handle the request data
    const historyRecord = {
      id: `rebalance-${Date.now()}`,
      type: request.type,
      reason: request.reason,
      priority: request.priority,
      status: 'pending' as any,
      createdAt: new Date()
    };

    // Simulate processing time based on type
    const processingTime = request.type === 'cold_to_hot' ? 1800000 : 300000; // 30min for cold, 5min for hot
    const estimatedCompletionTime = new Date(Date.now() + processingTime);

    // In real implementation, this would trigger the actual blockchain operations
    setTimeout(() => {
      this.completeRebalancing(historyRecord.id);
    }, Math.min(processingTime, 5000)); // For demo, complete in 5 seconds max

    return {
      success: true,
      rebalancingId: historyRecord.id,
      estimatedCompletionTime: estimatedCompletionTime.toISOString()
    };
  }

  private async completeRebalancing(rebalancingId: string): Promise<void> {
    // This would be called when the blockchain transaction completes
    // For now, just log the completion to avoid complex mock updates
    console.log(`Rebalancing completed: ${rebalancingId}`);
  }

  // Air-gap Signing Operations
  async generateUnsignedTransaction(request: AirGapSigningRequest): Promise<{
    unsignedTx: string;
    qrCode: string;
    expiresAt: string;
  }> {
    await delay(API_DELAY.MEDIUM);

    // For simplicity, use first transaction
    const firstTx = request.transactions[0];
    const unsignedTx = {
      to: firstTx.toAddress,
      value: firstTx.amount,
      gasPrice: '20000000000',
      gasLimit: '21000',
      nonce: Math.floor(Math.random() * 1000),
      data: '0x'
    };

    const unsignedTxString = JSON.stringify(unsignedTx);
    const qrCode = `data:text/plain;base64,${btoa(unsignedTxString)}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

    return {
      unsignedTx: unsignedTxString,
      qrCode,
      expiresAt
    };
  }

  async submitSignedTransaction(signedTx: SignedTransaction): Promise<{
    success: boolean;
    transactionHash: string;
    estimatedConfirmationTime: string;
  }> {
    await delay(API_DELAY.SLOW);

    // Verify signed transaction (mock verification)
    if (!this.verifySignedTransaction(signedTx)) {
      throw new Error('Invalid signed transaction');
    }

    const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const estimatedConfirmationTime = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // In real implementation, broadcast to blockchain network
    console.log(`Broadcasting transaction: ${transactionHash}`);

    return {
      success: true,
      transactionHash,
      estimatedConfirmationTime
    };
  }

  async getTransactionStatus(transactionHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed';
    confirmations: number;
    blockNumber?: number;
    gasUsed?: string;
  }> {
    await delay(API_DELAY.FAST);

    // Mock transaction status
    const statuses: ('pending' | 'confirmed' | 'failed')[] = ['pending', 'confirmed', 'confirmed', 'confirmed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      status,
      confirmations: status === 'confirmed' ? Math.floor(Math.random() * 100) + 12 : 0,
      blockNumber: status === 'confirmed' ? Math.floor(Math.random() * 1000000) + 18000000 : undefined,
      gasUsed: status === 'confirmed' ? (Math.floor(Math.random() * 21000) + 21000).toString() : undefined
    };
  }

  // Vault Statistics and Reporting
  async getVaultStatistics(period: 'day' | 'week' | 'month'): Promise<{
    totalValue: string;
    totalValueChange: string;
    hotWalletUtilization: number;
    rebalancingCount: number;
    averageRebalancingTime: number;
    securityScore: number;
  }> {
    await delay(API_DELAY.MEDIUM);

    const vaultStatus = mockDb.getVaultStatus();
    const rebalancingHistory = mockDb.getRebalancingHistory();

    // Calculate period-specific data
    const periodMs = {
      day: 86400000,
      week: 604800000,
      month: 2592000000
    }[period];

    const periodStart = new Date(Date.now() - periodMs);
    const periodRebalancing = rebalancingHistory.filter(
      record => new Date(record.createdAt) >= periodStart
    );

    const averageRebalancingTime = periodRebalancing.length > 0
      ? periodRebalancing.reduce((sum, record) => {
          if (record.completedAt) {
            const duration = new Date(record.completedAt).getTime() - new Date(record.createdAt).getTime();
            return sum + duration;
          }
          return sum;
        }, 0) / periodRebalancing.length
      : 0;

    return {
      totalValue: vaultStatus.totalValue.totalInKRW,
      totalValueChange: '+2.5', // Mock percentage change
      hotWalletUtilization: vaultStatus.hotWallet.utilizationRate,
      rebalancingCount: periodRebalancing.length,
      averageRebalancingTime: Math.floor(averageRebalancingTime / 60000), // Convert to minutes
      securityScore: vaultStatus.coldWallet.securityLevel === 'high' ? 95 : 75
    };
  }

  // Rebalancing Management
  async getRebalancingStats(): Promise<RebalancingStats> {
    await delay(API_DELAY.FAST);

    // Auto-initialize if no data
    const stored = localStorage.getItem('rebalancing_history');
    if (!stored) {
      this.initializeMockRebalancingHistory();
    }

    const vaultStatus = mockDb.getVaultStatus();
    const history = this.loadRebalancingHistory();

    const completedRecords = history.filter(r => r.status === RebalancingStatus.COMPLETED);
    const pendingRecords = history.filter(r => r.status === RebalancingStatus.PENDING);
    const approvedRecords = history.filter(r => r.status === RebalancingStatus.APPROVED);
    const failedRecords = history.filter(r => r.status === RebalancingStatus.FAILED);

    // Today's completed count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = completedRecords.filter(r => {
      const completedAt = r.completedAt ? new Date(r.completedAt) : null;
      return completedAt && completedAt >= today;
    });

    // Last rebalancing
    const lastRebalancing = completedRecords.length > 0
      ? completedRecords.sort((a, b) => {
          const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return bTime - aTime;
        })[0]
      : null;

    // Average duration
    const completedWithDuration = completedRecords.filter(r => r.actualDuration);
    const averageDuration = completedWithDuration.length > 0
      ? completedWithDuration.reduce((sum, r) => sum + (r.actualDuration || 0), 0) / completedWithDuration.length
      : 0;

    return {
      currentHotRatio: vaultStatus.balanceStatus.hotRatio,
      currentColdRatio: vaultStatus.balanceStatus.coldRatio,
      deviation: vaultStatus.balanceStatus.deviation,
      lastRebalancingDate: lastRebalancing?.completedAt ? new Date(lastRebalancing.completedAt) : null,
      totalRebalancingCount: completedRecords.length,
      pendingCount: pendingRecords.length,
      approvedCount: approvedRecords.length,
      completedTodayCount: completedToday.length,
      failedCount: failedRecords.length,
      averageDuration: Math.round(averageDuration)
    };
  }

  async getFilteredRebalancingHistory(filter?: RebalancingFilter): Promise<RebalancingRecord[]> {
    await delay(API_DELAY.FAST);

    let history = this.loadRebalancingHistory();

    // Apply filters
    if (filter?.status && filter.status.length > 0) {
      history = history.filter(r => filter.status!.includes(r.status));
    }

    if (filter?.type && filter.type.length > 0) {
      history = history.filter(r => filter.type!.includes(r.type));
    }

    if (filter?.priority && filter.priority.length > 0) {
      history = history.filter(r => filter.priority!.includes(r.priority));
    }

    if (filter?.dateRange) {
      history = history.filter(r => {
        const createdAt = new Date(r.createdAt);
        return createdAt >= filter.dateRange!.start && createdAt <= filter.dateRange!.end;
      });
    }

    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      history = history.filter(r =>
        r.id.toLowerCase().includes(searchLower) ||
        r.reason.toLowerCase().includes(searchLower) ||
        r.initiatedBy.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt descending
    return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async calculateDetailedRebalancing(): Promise<RebalancingCalculation> {
    await delay(API_DELAY.MEDIUM);

    const vaultStatus = mockDb.getVaultStatus();
    const totalValue = parseFloat(vaultStatus.totalValue.totalInKRW);
    const currentHotValue = parseFloat(vaultStatus.hotWallet.totalValue.totalInKRW);
    const currentColdValue = parseFloat(vaultStatus.coldWallet.totalValue.totalInKRW);

    const targetHotValue = (totalValue * 20) / 100;
    const targetColdValue = (totalValue * 80) / 100;

    const hotToColdAmount = Math.max(0, currentHotValue - targetHotValue);
    const coldToHotAmount = Math.max(0, targetHotValue - currentHotValue);

    let direction: RebalancingType;
    let requiredAmount: number;

    if (hotToColdAmount > coldToHotAmount) {
      direction = RebalancingType.HOT_TO_COLD;
      requiredAmount = hotToColdAmount;
    } else {
      direction = RebalancingType.COLD_TO_HOT;
      requiredAmount = coldToHotAmount;
    }

    const estimatedFee = requiredAmount * 0.001; // 0.1% fee

    // Calculate after-rebalancing ratios
    const afterHotValue = direction === RebalancingType.HOT_TO_COLD
      ? currentHotValue - requiredAmount
      : currentHotValue + requiredAmount;
    const afterColdValue = direction === RebalancingType.HOT_TO_COLD
      ? currentColdValue + requiredAmount
      : currentColdValue - requiredAmount;

    const afterHotRatio = (afterHotValue / totalValue) * 100;
    const afterColdRatio = (afterColdValue / totalValue) * 100;
    const afterDeviation = Math.abs(afterHotRatio - 20);

    return {
      currentHotValue: Math.floor(currentHotValue).toString(),
      currentColdValue: Math.floor(currentColdValue).toString(),
      currentTotalValue: Math.floor(totalValue).toString(),
      targetHotValue: Math.floor(targetHotValue).toString(),
      targetColdValue: Math.floor(targetColdValue).toString(),
      requiredTransferAmount: Math.floor(requiredAmount).toString(),
      direction,
      estimatedFee: Math.floor(estimatedFee).toString(),
      afterHotRatio: Math.round(afterHotRatio * 10) / 10,
      afterColdRatio: Math.round(afterColdRatio * 10) / 10,
      afterDeviation: Math.round(afterDeviation * 10) / 10
    };
  }

  // Utility Methods
  private verifySignedTransaction(signedTx: SignedTransaction): boolean {
    // Mock signature verification
    return !!(signedTx.signature && signedTx.signature.length > 100);
  }

  private loadRebalancingHistory(): RebalancingRecord[] {
    const stored = localStorage.getItem('rebalancing_history');
    if (!stored) {
      return [];
    }

    try {
      const data = JSON.parse(stored);
      // Convert date strings to Date objects
      return data.map((record: any) => ({
        ...record,
        createdAt: new Date(record.createdAt),
        approvedAt: record.approvedAt ? new Date(record.approvedAt) : undefined,
        startedAt: record.startedAt ? new Date(record.startedAt) : undefined,
        completedAt: record.completedAt ? new Date(record.completedAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to load rebalancing history:', error);
      return [];
    }
  }

  private initializeMockRebalancingHistory(): void {
    const mockHistory: RebalancingRecord[] = this.generateMockRebalancingHistory();
    localStorage.setItem('rebalancing_history', JSON.stringify(mockHistory));
    console.log('Rebalancing history auto-initialized with', mockHistory.length, 'records');
  }

  private generateMockRebalancingHistory(): RebalancingRecord[] {
    const records: RebalancingRecord[] = [];
    const now = Date.now();

    const statuses = [
      { status: RebalancingStatus.COMPLETED, count: 8 },
      { status: RebalancingStatus.PENDING, count: 2 },
      { status: RebalancingStatus.APPROVED, count: 1 },
      { status: RebalancingStatus.PROCESSING, count: 1 },
      { status: RebalancingStatus.FAILED, count: 2 },
      { status: RebalancingStatus.CANCELLED, count: 1 }
    ];

    const reasons = [
      '정기 리밸런싱',
      '긴급 유동성 확보',
      '보안 강화',
      '유지보수',
      '대량 출금 대응',
      '기타'
    ];

    const priorities = [
      RebalancingPriority.LOW,
      RebalancingPriority.NORMAL,
      RebalancingPriority.HIGH,
      RebalancingPriority.EMERGENCY
    ];

    let id = 1;

    statuses.forEach(({ status, count }) => {
      for (let i = 0; i < count; i++) {
        const daysAgo = status === RebalancingStatus.COMPLETED
          ? Math.floor(Math.random() * 30)
          : Math.floor(Math.random() * 3);
        const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

        const type = Math.random() > 0.4 ? RebalancingType.HOT_TO_COLD : RebalancingType.COLD_TO_HOT;
        const amount = (Math.random() * 49.5 + 0.5).toFixed(8); // 0.5 ~ 50 BTC
        const amountInKRW = (parseFloat(amount) * 80000000).toFixed(0); // 1 BTC = 80M KRW

        const record: RebalancingRecord = {
          id: `rebalance-${String(id).padStart(3, '0')}`,
          type,
          amount,
          amountInKRW,
          assets: [
            {
              symbol: 'BTC',
              amount,
              fromAddress: type === RebalancingType.HOT_TO_COLD ? 'hot-wallet-btc' : 'cold-wallet-btc',
              toAddress: type === RebalancingType.HOT_TO_COLD ? 'cold-wallet-btc' : 'hot-wallet-btc',
              txHash: status === RebalancingStatus.COMPLETED ? `0x${Math.random().toString(16).substr(2, 64)}` : undefined,
              status: status === RebalancingStatus.COMPLETED ? AssetTransferStatus.COMPLETED : AssetTransferStatus.PENDING
            }
          ],
          fromWallet: type === RebalancingType.HOT_TO_COLD ? WalletType.HOT : WalletType.COLD,
          toWallet: type === RebalancingType.HOT_TO_COLD ? WalletType.COLD : WalletType.HOT,
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          initiatedBy: 'admin@custody.com',
          approvedBy: status !== RebalancingStatus.PENDING ? 'supervisor@custody.com' : undefined,
          status,
          createdAt,
          approvedAt: status !== RebalancingStatus.PENDING ? new Date(createdAt.getTime() + 10 * 60 * 1000) : undefined,
          startedAt: status === RebalancingStatus.COMPLETED || status === RebalancingStatus.PROCESSING
            ? new Date(createdAt.getTime() + 15 * 60 * 1000)
            : undefined,
          completedAt: status === RebalancingStatus.COMPLETED
            ? new Date(createdAt.getTime() + (20 + Math.random() * 40) * 60 * 1000)
            : undefined,
          estimatedDuration: type === RebalancingType.COLD_TO_HOT ? 30 : 5,
          actualDuration: status === RebalancingStatus.COMPLETED
            ? (5 + Math.random() * 50)
            : undefined,
          txHashes: status === RebalancingStatus.COMPLETED
            ? [`0x${Math.random().toString(16).substr(2, 64)}`]
            : [],
          fees: (parseFloat(amount) * 0.001).toFixed(8),
          errorMessage: status === RebalancingStatus.FAILED ? 'Network timeout error' : undefined,
          notes: status === RebalancingStatus.CANCELLED ? '관리자에 의해 취소됨' : undefined
        };

        records.push(record);
        id++;
      }
    });

    return records;
  }

  // Real-time Simulation (for development)
  async simulateVaultActivity(): Promise<void> {
    // Simulate small balance changes
    const vaultStatus = mockDb.getVaultStatus();
    const randomChange = (Math.random() - 0.5) * 0.02; // ±1% change

    // Skip complex mock vault updates to avoid type errors
    console.log('Vault activity simulated with change:', randomChange);
  }
}

export const vaultApi = VaultApiService.getInstance();