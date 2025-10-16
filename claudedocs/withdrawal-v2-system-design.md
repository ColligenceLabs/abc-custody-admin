# Withdrawal Manager v2 - System Design Document

**작성일**: 2025-10-15
**프로젝트**: 출금 관리2 (Withdrawal Manager v2)
**설계 목적**: Hot/Cold 볼트 리밸런싱 통합 출금 시스템
**데이터 전략**: Option 2 - 기존 시스템과 데이터 공유

---

## 1. 시스템 아키텍처 개요

### 1.1 아키텍처 원칙

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│  /admin/withdrawal-v2/* (5 main pages + shared components)  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Service Layer                            │
│  withdrawalV2Api.ts (wraps & extends Phase 4 services)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  Shared localStorage/Mock DB with V2 extensions             │
│  Backward compatible with Phase 4 withdrawal system         │
└─────────────────────────────────────────────────────────────┘
```

**핵심 설계 원칙:**
1. **데이터 공유**: Phase 4 시스템과 동일한 데이터 소스 사용
2. **확장 가능성**: 기존 타입 확장, 새 필드 추가
3. **독립성**: 독립적인 UI/UX, 기존 시스템에 영향 없음
4. **하위 호환성**: 기존 데이터 읽기 가능, 점진적 마이그레이션

### 1.2 블록체인별 볼트 아키텍처

```
┌──────────────────────────────────────────────────────────────┐
│                   Multi-Blockchain Vault System              │
├──────────────────────────────────────────────────────────────┤
│  Bitcoin Blockchain Vault                                    │
│  ├─ Mainnet: Hot (20%) / Cold (80%)                         │
│  └─ Testnet: Hot (20%) / Cold (80%)                         │
├──────────────────────────────────────────────────────────────┤
│  Ethereum Blockchain Vault (통합)                            │
│  ├─ Mainnet:                                                 │
│  │  ├─ Hot (20%): ETH, USDT, USDC, Custom ERC20           │
│  │  └─ Cold (80%): ETH, USDT, USDC, Custom ERC20          │
│  └─ Testnet (Sepolia):                                      │
│     ├─ Hot (20%): ETH, USDT, USDC                          │
│     └─ Cold (80%): ETH, USDT, USDC                         │
├──────────────────────────────────────────────────────────────┤
│  Solana Blockchain Vault                                     │
│  ├─ Mainnet: Hot (20%) / Cold (80%)                         │
│  └─ Devnet: Hot (20%) / Cold (80%)                          │
└──────────────────────────────────────────────────────────────┘
```

**블록체인 자동 판별 로직:**
- BTC 출금 → Bitcoin 블록체인 볼트 체크
- ETH/USDT/USDC 출금 → Ethereum 블록체인 볼트 체크 (통합)
- SOL 출금 → Solana 블록체인 볼트 체크

---

## 2. 타입 시스템 설계

### 2.1 핵심 타입 계층 구조

```typescript
// src/types/withdrawalV2.ts

// ========================================
// Layer 1: Blockchain Primitives
// ========================================

type NetworkEnvironment = "mainnet" | "testnet";
type BlockchainType = "BITCOIN" | "ETHEREUM" | "SOLANA";
type AssetType = "BTC" | "ETH" | "USDT" | "USDC" | "SOL";

/**
 * 자산 → 블록체인 자동 매핑
 */
const ASSET_TO_BLOCKCHAIN: Record<AssetType, BlockchainType> = {
  BTC: "BITCOIN",
  ETH: "ETHEREUM",
  USDT: "ETHEREUM",  // ERC20
  USDC: "ETHEREUM",  // ERC20
  SOL: "SOLANA"
} as const;

function getBlockchainByAsset(asset: AssetType): BlockchainType {
  return ASSET_TO_BLOCKCHAIN[asset];
}

// ========================================
// Layer 2: Vault Status Types
// ========================================

interface WalletAssets {
  totalValueKRW: string;
  assets: {
    symbol: AssetType;
    balance: string;
    valueKRW: string;
    percentage: number;
  }[];
}

interface BlockchainVaultStatus {
  blockchain: BlockchainType;
  blockchainName: string;
  network: NetworkEnvironment;

  hotWallet: WalletAssets;
  coldWallet: WalletAssets;

  totalValueKRW: string;
  hotRatio: number;
  coldRatio: number;
  targetHotRatio: 20;
  targetColdRatio: 80;
  deviation: number;
  needsRebalancing: boolean;
}

// ========================================
// Layer 3: Withdrawal Extension Types
// ========================================

/**
 * 출금 전 볼트 체크 결과
 */
interface VaultCheckResult {
  withdrawalId: string;
  blockchain: BlockchainType;
  network: NetworkEnvironment;
  checkedAt: Date;

  hotWallet: {
    currentBalance: string;
    reservedAmount: string;
    availableBalance: string;
    isEnough: boolean;
    shortfall?: string;
    shortfallKRW?: string;
  };

  coldWallet: {
    currentBalance: string;
    availableBalance: string;
  };

  rebalancing?: {
    required: boolean;
    blockchain: BlockchainType;
    network: NetworkEnvironment;
    asset: AssetType;
    amount: string;
    amountWithMargin: string;
    reason: "insufficient_hot" | "maintain_ratio";
    estimatedTime: string;
    priority: "urgent" | "normal";
  };

  afterWithdrawal: {
    hotBalance: string;
    coldBalance: string;
    hotRatio: number;
    coldRatio: number;
    needsRebalancing: boolean;
    deviation: number;
  };
}

/**
 * V2 출금 요청 (기존 확장)
 */
interface WithdrawalV2Request {
  // 기존 Phase 4 필드들
  id: string;
  memberId: string;
  memberName: string;
  amount: string;
  currency: Currency; // Phase 4와 호환
  toAddress: string;
  createdAt: Date;

  // 🆕 V2 확장 필드
  asset: AssetType;
  blockchain: BlockchainType;
  network: NetworkEnvironment;

  status:
    | "pending"
    | "aml_review"
    | "vault_check"      // 🆕
    | "rebalancing"      // 🆕
    | "signing"
    | "executing"
    | "completed"
    | "failed"
    | "cancelled";

  priority: "urgent" | "normal" | "low";

  vaultCheck?: VaultCheckResult;

  // 기존 필드들 (AML, signing, execution)
  amlCheck?: AMLCheckResult;
  signing?: SigningInfo;
  execution?: ExecutionInfo;
}

// ========================================
// Layer 4: Dashboard Aggregation Types
// ========================================

interface WithdrawalV2DashboardStats {
  withdrawals: {
    pending: number;
    amlReview: number;
    vaultCheck: number;
    signing: number;
    executing: number;
    completedToday: number;
    totalValueToday: string;
  };

  vaults: {
    bitcoin: BlockchainVaultStatus;
    ethereum: BlockchainVaultStatus;
    solana: BlockchainVaultStatus;
  };

  vaultSummary: {
    network: NetworkEnvironment;
    totalValueKRW: string;
    hotTotalKRW: string;
    coldTotalKRW: string;
    overallHotRatio: number;
    overallColdRatio: number;
    blockchainsNeedingRebalancing: BlockchainType[];
  };

  rebalancing: {
    required: number;
    inProgress: number;
    completedToday: number;
    byBlockchain: {
      bitcoin: number;
      ethereum: number;
      solana: number;
    };
  };

  alerts: {
    urgentWithdrawals: number;
    hotBalanceLow: {
      bitcoin: boolean;
      ethereum: boolean;
      solana: boolean;
    };
    expiringSignatures: number;
  };
}
```

### 2.2 타입 설계 원칙

1. **계층적 구조**: Primitives → Domain Objects → Aggregations
2. **타입 안전성**: 모든 상태는 타입으로 표현
3. **확장 가능성**: 기존 타입 확장, 새 블록체인 추가 용이
4. **자동 추론**: 자산 타입으로 블록체인 자동 판별

---

## 3. 서비스 레이어 설계

### 3.1 서비스 레이어 아키텍처

```typescript
// src/services/withdrawalV2Api.ts

import {
  getWithdrawals as getWithdrawalsV1,
  getWithdrawal as getWithdrawalV1,
  createWithdrawal as createWithdrawalV1,
  updateWithdrawal as updateWithdrawalV1
} from './withdrawalApi';

import { getVaultStatus } from './vaultApi';
import { ASSET_TO_BLOCKCHAIN } from '@/types/withdrawalV2';

// ========================================
// 1. Dashboard Data Aggregation
// ========================================

export async function getWithdrawalV2Stats(): Promise<WithdrawalV2DashboardStats> {
  // 1. 기존 시스템 데이터 조회
  const withdrawals = await getWithdrawalsV1();
  const vaultStatus = await getVaultStatus();

  // 2. 블록체인별 볼트 상태 계산
  const bitcoinVault = calculateBlockchainVault(vaultStatus, 'BITCOIN', 'mainnet');
  const ethereumVault = calculateBlockchainVault(vaultStatus, 'ETHEREUM', 'mainnet');
  const solanaVault = calculateBlockchainVault(vaultStatus, 'SOLANA', 'mainnet');

  // 3. 출금 통계 집계
  const withdrawalStats = categorizeWithdrawals(withdrawals);

  // 4. 리밸런싱 통계 계산
  const rebalancingStats = calculateRebalancingStats(withdrawals);

  // 5. 알림 감지
  const alerts = detectAlerts(withdrawals, [bitcoinVault, ethereumVault, solanaVault]);

  // 6. 전체 볼트 요약
  const vaultSummary = aggregateVaultSummary([bitcoinVault, ethereumVault, solanaVault]);

  return {
    withdrawals: withdrawalStats,
    vaults: {
      bitcoin: bitcoinVault,
      ethereum: ethereumVault,
      solana: solanaVault
    },
    vaultSummary,
    rebalancing: rebalancingStats,
    alerts
  };
}

// ========================================
// 2. Blockchain-Specific Vault Calculation
// ========================================

function calculateBlockchainVault(
  vaultStatus: VaultStatus,
  blockchain: BlockchainType,
  network: NetworkEnvironment
): BlockchainVaultStatus {
  // 1. 해당 블록체인의 자산만 필터링
  const blockchainAssets = Object.keys(ASSET_TO_BLOCKCHAIN)
    .filter(asset => ASSET_TO_BLOCKCHAIN[asset as AssetType] === blockchain);

  // 2. Hot Wallet 집계
  const hotAssets = blockchainAssets.map(asset => {
    const balance = vaultStatus.hotWallet[asset] || "0";
    const valueKRW = convertToKRW(balance, asset);
    return {
      symbol: asset as AssetType,
      balance,
      valueKRW,
      percentage: 0 // 계산 필요
    };
  });

  const hotTotalKRW = hotAssets.reduce((sum, a) => sum + parseFloat(a.valueKRW), 0);

  // 3. Cold Wallet 집계
  const coldAssets = blockchainAssets.map(asset => {
    const balance = vaultStatus.coldWallet[asset] || "0";
    const valueKRW = convertToKRW(balance, asset);
    return {
      symbol: asset as AssetType,
      balance,
      valueKRW,
      percentage: 0 // 계산 필요
    };
  });

  const coldTotalKRW = coldAssets.reduce((sum, a) => sum + parseFloat(a.valueKRW), 0);

  // 4. 비율 계산
  const totalKRW = hotTotalKRW + coldTotalKRW;
  const hotRatio = (hotTotalKRW / totalKRW) * 100;
  const coldRatio = (coldTotalKRW / totalKRW) * 100;
  const deviation = Math.abs(hotRatio - 20);

  return {
    blockchain,
    blockchainName: getBlockchainName(blockchain),
    network,
    hotWallet: {
      totalValueKRW: hotTotalKRW.toLocaleString(),
      assets: hotAssets
    },
    coldWallet: {
      totalValueKRW: coldTotalKRW.toLocaleString(),
      assets: coldAssets
    },
    totalValueKRW: totalKRW.toLocaleString(),
    hotRatio,
    coldRatio,
    targetHotRatio: 20,
    targetColdRatio: 80,
    deviation,
    needsRebalancing: deviation > 5
  };
}

// ========================================
// 3. Pre-Withdrawal Vault Check
// ========================================

export async function checkVaultBeforeWithdrawal(
  withdrawalId: string
): Promise<VaultCheckResult> {
  // 1. 출금 정보 조회
  const withdrawal = await getWithdrawalV1(withdrawalId);

  // 2. 블록체인 자동 판별
  const blockchain = ASSET_TO_BLOCKCHAIN[withdrawal.currency as AssetType];
  const network: NetworkEnvironment = withdrawal.network || "mainnet";

  // 3. 해당 블록체인 볼트 상태 조회
  const vaultStatus = await getVaultStatus();
  const blockchainVault = calculateBlockchainVault(vaultStatus, blockchain, network);

  // 4. Hot 잔고 충분성 체크
  const assetHotBalance = parseFloat(
    blockchainVault.hotWallet.assets.find(a => a.symbol === withdrawal.currency)?.balance || "0"
  );

  const reservedAmount = calculateReservedAmount(blockchain, network);
  const availableBalance = assetHotBalance - reservedAmount;
  const requestedAmount = parseFloat(withdrawal.amount);

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
      asset: withdrawal.currency as AssetType,
      amount: shortfall.toString(),
      amountWithMargin: (shortfall + margin).toString(),
      reason: "insufficient_hot" as const,
      estimatedTime: "30분",
      priority: withdrawal.priority === "urgent" ? "urgent" : "normal" as const
    };
  }

  // 6. 출금 후 예상 상태
  const afterWithdrawal = calculateAfterWithdrawalStatus(
    blockchainVault,
    requestedAmount,
    withdrawal.currency as AssetType
  );

  return {
    withdrawalId,
    blockchain,
    network,
    checkedAt: new Date(),
    hotWallet: {
      currentBalance: assetHotBalance.toString(),
      reservedAmount: reservedAmount.toString(),
      availableBalance: availableBalance.toString(),
      isEnough,
      shortfall: !isEnough ? (requestedAmount - availableBalance).toString() : undefined,
      shortfallKRW: !isEnough ? convertToKRW(requestedAmount - availableBalance, withdrawal.currency).toString() : undefined
    },
    coldWallet: {
      currentBalance: blockchainVault.coldWallet.assets.find(a => a.symbol === withdrawal.currency)?.balance || "0",
      availableBalance: blockchainVault.coldWallet.assets.find(a => a.symbol === withdrawal.currency)?.balance || "0"
    },
    rebalancing,
    afterWithdrawal
  };
}

// ========================================
// 4. Rebalancing Trigger
// ========================================

export async function triggerRebalancing(
  blockchain: BlockchainType,
  network: NetworkEnvironment,
  amount: string,
  asset: AssetType,
  direction: "cold_to_hot" | "hot_to_cold",
  reason: string,
  relatedWithdrawalId?: string
): Promise<{ airGapRequestId: string }> {
  // 1. Air-gap 서명 요청 생성
  const airGapRequest = await createAirGapRequest({
    type: "rebalancing",
    blockchain,
    network,
    amount,
    currency: asset,
    fromWallet: direction === "cold_to_hot" ? "cold" : "hot",
    toWallet: direction === "cold_to_hot" ? "hot" : "cold",
    reason,
    priority: relatedWithdrawalId ? "urgent" : "normal",
    rebalancingInfo: {
      direction,
      relatedWithdrawalId
    }
  });

  // 2. 관련 출금 상태 업데이트 (있는 경우)
  if (relatedWithdrawalId) {
    await updateWithdrawalV1(relatedWithdrawalId, {
      status: "rebalancing",
      vaultCheck: {
        blockchain,
        network,
        hotSufficient: false,
        rebalancingRequired: true,
        rebalancingAmount: amount
      }
    });
  }

  // 3. 리밸런싱 이력 기록
  await recordRebalancingHistory({
    blockchain,
    network,
    direction,
    amount,
    asset,
    reason,
    airGapRequestId: airGapRequest.id,
    status: "pending",
    createdAt: new Date()
  });

  return { airGapRequestId: airGapRequest.id };
}

// ========================================
// Helper Functions
// ========================================

function getBlockchainName(blockchain: BlockchainType): string {
  const names = {
    BITCOIN: "Bitcoin",
    ETHEREUM: "Ethereum & ERC20",
    SOLANA: "Solana"
  };
  return names[blockchain];
}

function calculateReservedAmount(blockchain: BlockchainType, network: NetworkEnvironment): number {
  // 다른 출금 대기 중인 금액 합계
  // 실제 구현 필요
  return 0;
}

function calculateAfterWithdrawalStatus(
  vault: BlockchainVaultStatus,
  amount: number,
  asset: AssetType
) {
  // 출금 후 예상 Hot/Cold 비율 계산
  // 실제 구현 필요
  return {
    hotBalance: "0",
    coldBalance: "0",
    hotRatio: 0,
    coldRatio: 0,
    needsRebalancing: false,
    deviation: 0
  };
}
```

### 3.2 데이터 공유 전략

**기존 데이터 확장 패턴:**
```typescript
// src/data/initializeV2Data.ts

export function initializeV2Extensions() {
  // 1. 기존 출금 데이터 조회
  const existingWithdrawals = JSON.parse(
    localStorage.getItem('withdrawals') || '[]'
  );

  // 2. V2 필드 추가
  const enhancedWithdrawals = existingWithdrawals.map(w => {
    const asset = w.currency as AssetType;
    const blockchain = ASSET_TO_BLOCKCHAIN[asset];

    return {
      ...w,
      // V2 확장 필드 (기존 데이터에 없으면 추가)
      asset: asset,
      blockchain: blockchain,
      network: w.network || "mainnet",
      vaultCheck: w.vaultCheck || null,
      rebalancingInfo: w.rebalancingInfo || null
    };
  });

  // 3. 저장
  localStorage.setItem('withdrawals', JSON.stringify(enhancedWithdrawals));

  // 4. 블록체인별 볼트 데이터 초기화
  initializeBlockchainVaults();
}

function initializeBlockchainVaults() {
  const vaultData = {
    blockchainVaults: {
      bitcoin: {
        mainnet: createInitialVault('BITCOIN', 'mainnet'),
        testnet: createInitialVault('BITCOIN', 'testnet')
      },
      ethereum: {
        mainnet: createInitialVault('ETHEREUM', 'mainnet'),
        testnet: createInitialVault('ETHEREUM', 'testnet')
      },
      solana: {
        mainnet: createInitialVault('SOLANA', 'mainnet'),
        testnet: createInitialVault('SOLANA', 'testnet')
      }
    }
  };

  localStorage.setItem('vaultStatusV2', JSON.stringify(vaultData));
}
```

---

## 4. 컴포넌트 아키텍처 설계

### 4.1 페이지별 컴포넌트 구조

```
src/app/admin/withdrawal-v2/
├── dashboard/
│   ├── page.tsx                           (150 lines)
│   ├── components/
│   │   ├── DashboardStats.tsx            (120 lines)
│   │   ├── BlockchainVaultCard.tsx       (180 lines) ⭐
│   │   ├── VaultSummaryCard.tsx          (150 lines)
│   │   ├── WithdrawalStatusCard.tsx      (130 lines)
│   │   ├── RecentActivityFeed.tsx        (160 lines)
│   │   └── AlertBanner.tsx               (100 lines)
│   └── hooks/
│       └── useWithdrawalV2Stats.ts       (80 lines)
│
├── requests/
│   ├── page.tsx                           (120 lines)
│   ├── components/
│   │   ├── RequestStats.tsx              (100 lines)
│   │   ├── RequestFilter.tsx             (150 lines)
│   │   ├── RequestTable.tsx              (200 lines)
│   │   └── ApprovalModal.tsx             (180 lines) ⭐
│   └── hooks/
│       └── useWithdrawalRequests.ts      (100 lines)
│
├── vault-check/
│   ├── page.tsx                           (130 lines)
│   ├── components/
│   │   ├── VaultCheckStats.tsx           (110 lines)
│   │   ├── VaultBalanceOverview.tsx      (180 lines)
│   │   ├── RebalancingRequired.tsx       (200 lines) ⭐
│   │   ├── RebalancingHistory.tsx        (150 lines)
│   │   └── RebalancingAlertModal.tsx     (160 lines) ⭐
│   └── hooks/
│       └── useVaultCheck.ts              (120 lines)
│
├── signing/
│   ├── page.tsx                           (140 lines)
│   ├── components/
│   │   ├── SigningStats.tsx              (100 lines)
│   │   ├── SigningQueueTable.tsx         (220 lines)
│   │   ├── QRCodeGenerator.tsx           (150 lines)
│   │   └── SignatureScanner.tsx          (140 lines)
│   └── hooks/
│       └── useSigningQueue.ts            (90 lines)
│
└── execution/
    ├── page.tsx                           (130 lines)
    ├── components/
    │   ├── ExecutionStats.tsx            (100 lines)
    │   ├── ExecutionMonitor.tsx          (200 lines)
    │   ├── PostWithdrawalCheck.tsx       (180 lines) ⭐
    │   └── RebalancingRecommendation.tsx (160 lines) ⭐
    └── hooks/
        └── useExecution.ts               (110 lines)
```

### 4.2 공유 컴포넌트

```
src/components/withdrawal-v2/
├── shared/
│   ├── AssetIcon.tsx                      (80 lines)
│   ├── BlockchainBadge.tsx                (60 lines)
│   ├── NetworkBadge.tsx                   (50 lines)
│   ├── StatusBadge.tsx                    (90 lines)
│   ├── RatioProgress.tsx                  (120 lines)
│   └── RebalancingAlert.tsx               (140 lines)
│
└── hooks/
    ├── useBlockchainVault.ts              (100 lines)
    ├── useRebalancing.ts                  (120 lines)
    └── useVaultCheck.ts                   (110 lines)
```

### 4.3 핵심 컴포넌트 설계: BlockchainVaultCard

```tsx
// src/app/admin/withdrawal-v2/dashboard/components/BlockchainVaultCard.tsx

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bitcoin, Coins } from "lucide-react";
import { BlockchainVaultStatus } from "@/types/withdrawalV2";

interface BlockchainVaultCardProps {
  vault?: BlockchainVaultStatus;
}

export function BlockchainVaultCard({ vault }: BlockchainVaultCardProps) {
  if (!vault) return null;

  const getBlockchainIcon = () => {
    switch (vault.blockchain) {
      case "BITCOIN": return <Bitcoin className="w-5 h-5" />;
      case "ETHEREUM": return <Coins className="w-5 h-5" />;
      case "SOLANA": return <Coins className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getBlockchainIcon()}
          {vault.blockchainName}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {vault.network === "mainnet" ? "Mainnet" : "Testnet"}
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Hot/Cold 비율 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm text-muted-foreground">Hot</p>
              <p className="text-2xl font-bold">{vault.hotRatio.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {vault.hotWallet.totalValueKRW} KRW
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cold</p>
              <p className="text-2xl font-bold">{vault.coldRatio.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">
                {vault.coldWallet.totalValueKRW} KRW
              </p>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="space-y-1">
            <Progress value={vault.hotRatio} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              목표: Hot 20% / Cold 80%
            </p>
          </div>

          {/* 리밸런싱 필요 알림 */}
          {vault.needsRebalancing && (
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-xs text-yellow-900 dark:text-yellow-200">
                리밸런싱 필요 (편차: {vault.deviation.toFixed(1)}%)
              </p>
            </div>
          )}

          {/* 자산 목록 */}
          <div className="space-y-2">
            <p className="text-sm font-semibold">보유 자산</p>
            {vault.hotWallet.assets.map((asset) => (
              <div key={asset.symbol} className="flex justify-between text-xs">
                <span>{asset.symbol}</span>
                <span>{asset.balance}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 5. 워크플로우 통합 설계

### 5.1 자동 리밸런싱 트리거 워크플로우

```typescript
// 출금 승인 시 자동 실행

async function handleApproveWithdrawal(withdrawalId: string) {
  try {
    // 1. AML 승인 (기존)
    await approveWithdrawalAML(withdrawalId);

    // 2. 🆕 자동 볼트 체크
    const vaultCheck = await checkVaultBeforeWithdrawal(withdrawalId);

    if (vaultCheck.rebalancing?.required) {
      // 3. 리밸런싱 필요 모달 표시
      setRebalancingAlert({
        show: true,
        withdrawalId,
        blockchain: vaultCheck.blockchain,
        network: vaultCheck.network,
        shortfall: vaultCheck.hotWallet.shortfall!,
        shortfallKRW: vaultCheck.hotWallet.shortfallKRW!,
        rebalancingAmount: vaultCheck.rebalancing.amountWithMargin,
        estimatedTime: vaultCheck.rebalancing.estimatedTime,
        priority: vaultCheck.rebalancing.priority
      });
    } else {
      // 4. Hot 충분 → Air-gap 서명으로 이동
      toast.success("출금 승인 완료. Air-gap 서명 대기열로 이동합니다.");
      router.push(`/admin/withdrawal-v2/signing?highlight=${withdrawalId}`);
    }
  } catch (error) {
    toast.error("승인 처리 실패");
  }
}

// 리밸런싱 시작 핸들러
async function handleStartRebalancing(alert: RebalancingAlert) {
  const { airGapRequestId } = await triggerRebalancing(
    alert.blockchain,
    alert.network,
    alert.rebalancingAmount,
    getBlockchainNativeAsset(alert.blockchain), // BTC, ETH, or SOL
    "cold_to_hot",
    `출금 ${alert.withdrawalId}를 위한 긴급 리밸런싱`,
    alert.withdrawalId
  );

  toast.success("리밸런싱 Air-gap 서명이 생성되었습니다.");
  router.push(`/admin/withdrawal-v2/signing?highlight=${airGapRequestId}&type=rebalancing`);
}
```

### 5.2 출금 후 자동 비율 체크

```typescript
// 출금 완료 후 자동 실행

async function onWithdrawalCompleted(executionId: string, withdrawalId: string) {
  // 1. 출금 상태 업데이트
  await updateExecutionStatus(executionId, "completed");

  // 2. 출금 정보 조회
  const withdrawal = await getWithdrawal(withdrawalId);
  const blockchain = ASSET_TO_BLOCKCHAIN[withdrawal.currency as AssetType];
  const network = withdrawal.network || "mainnet";

  // 3. 🆕 해당 블록체인 볼트 비율 재확인
  const vaultStatus = await getVaultStatus();
  const blockchainVault = calculateBlockchainVault(vaultStatus, blockchain, network);

  const deviation = Math.abs(blockchainVault.hotRatio - 20);

  if (deviation > 5) {
    // 4. 리밸런싱 권장 알림 생성
    const recommendation: RebalancingRecommendation = {
      recommendationId: generateId(),
      blockchain,
      network,
      triggeredBy: "withdrawal",
      triggeredAt: new Date(),
      currentStatus: {
        blockchain,
        blockchainName: blockchainVault.blockchainName,
        hotBalance: blockchainVault.hotWallet.totalValueKRW,
        coldBalance: blockchainVault.coldWallet.totalValueKRW,
        hotRatio: blockchainVault.hotRatio,
        coldRatio: blockchainVault.coldRatio,
        totalValueKRW: blockchainVault.totalValueKRW
      },
      targetStatus: {
        hotRatio: 20,
        coldRatio: 80
      },
      recommendation: {
        action: blockchainVault.hotRatio < 20 ? "cold_to_hot" : "hot_to_cold",
        asset: getBlockchainNativeAsset(blockchain),
        amount: calculateRebalancingAmount(blockchainVault),
        amountKRW: "...",
        reason: `출금 완료 후 ${blockchain} Hot 비율 ${blockchainVault.hotRatio.toFixed(1)}% (목표 20%)`,
        priority: deviation > 10 ? "high" : "medium"
      },
      actions: {
        autoTrigger: false,
        requiresApproval: true,
        requiresAirGapSigning: true
      }
    };

    // 5. 알림 저장 및 표시
    await createNotification({
      type: "rebalancing_recommended",
      blockchain,
      network,
      data: recommendation,
      createdAt: new Date()
    });

    toast.info(
      `${blockchainVault.blockchainName} 리밸런싱 권장 (편차: ${deviation.toFixed(1)}%)`,
      {
        action: {
          label: "확인",
          onClick: () => router.push("/admin/withdrawal-v2/vault-check")
        }
      }
    );
  }

  // 6. 완료 알림 발송 (기존)
  await sendCompletionNotification(executionId);
}
```

---

## 6. 구현 우선순위 및 일정

### 6.1 구현 순서 (11.5일)

**P0: Foundation (Day 1-2.5)**
1. ✓ 타입 시스템 구축 (0.5일)
2. ✓ 서비스 레이어 구현 (1일)
3. ✓ 통합 대시보드 (2일)

**P1: Core Workflows (Day 3-5.5)**
4. ✓ 출금 요청 관리 (1.5일)
5. ✓ 잔고 확인 & 리밸런싱 (2일)
6. ✓ 통합 서명 센터 (1.5일)

**P2-P3: Completion (Day 6-7.5)**
7. ✓ 실행 & 사후 관리 (1.5일)
8. ✓ 사이드바 메뉴 추가 (0.5일)
9. ✓ 통합 테스트 (1일)

### 6.2 병렬 개발 전략

```
Day 1-2.5: P0 (순차 개발 필수)
├─ Day 1: 타입 시스템 + 서비스 레이어 시작
└─ Day 2-2.5: 대시보드 완성

Day 3-5.5: P1 (병렬 가능)
├─ Developer A: 출금 요청 관리 (1.5일)
└─ Developer B: 잔고 확인 & 리밸런싱 (2일)
    ↓
    통합 서명 센터 (1.5일)

Day 6-7.5: P2-P3 (순차 개발)
└─ 실행 관리 → 메뉴 → 테스트
```

---

## 7. 테스트 전략

### 7.1 단위 테스트

```typescript
// __tests__/withdrawalV2Api.test.ts

describe('withdrawalV2Api', () => {
  describe('getBlockchainByAsset', () => {
    it('should return BITCOIN for BTC', () => {
      expect(getBlockchainByAsset('BTC')).toBe('BITCOIN');
    });

    it('should return ETHEREUM for ERC20 tokens', () => {
      expect(getBlockchainByAsset('USDT')).toBe('ETHEREUM');
      expect(getBlockchainByAsset('USDC')).toBe('ETHEREUM');
    });
  });

  describe('checkVaultBeforeWithdrawal', () => {
    it('should detect insufficient hot balance', async () => {
      const result = await checkVaultBeforeWithdrawal('withdrawal-1');
      expect(result.hotWallet.isEnough).toBe(false);
      expect(result.rebalancing?.required).toBe(true);
    });
  });
});
```

### 7.2 통합 테스트

**시나리오 1: Hot 잔고 충분**
```typescript
test('Scenario 1: Sufficient Hot Balance', async () => {
  // 1. 출금 요청 생성 (1 BTC)
  // 2. Hot 잔고: 5 BTC
  // 3. AML 승인
  // 4. 볼트 체크 → 충분 감지
  // 5. Air-gap 서명으로 이동
  // 6. 출금 완료
  // 7. 비율 체크 → 정상 (편차 2%)
});
```

**시나리오 2: 리밸런싱 필요 (Bitcoin)**
```typescript
test('Scenario 2: Rebalancing Required - Bitcoin', async () => {
  // 1. BTC 출금 요청 (8 BTC)
  // 2. Bitcoin Hot: 1 BTC (부족)
  // 3. 리밸런싱 모달 표시
  // 4. Bitcoin Cold → Hot 리밸런싱 (8.4 BTC)
  // 5. Air-gap 서명 (rebalancing)
  // 6. 리밸런싱 완료
  // 7. 다시 출금 진행
  // 8. 출금 완료 후 Bitcoin 비율 체크
});
```

**시나리오 3: 다중 블록체인**
```typescript
test('Scenario 3: Multi-Blockchain Withdrawals', async () => {
  // 1. BTC 출금 → Bitcoin 볼트만 영향
  // 2. ETH 출금 → Ethereum 볼트만 영향
  // 3. USDT 출금 → Ethereum 볼트 (통합)
  // 4. SOL 출금 → Solana 볼트만 영향
  // 각 블록체인의 독립성 확인
});
```

---

## 8. 완료 기준

### 8.1 기술적 완료 기준

- [ ] 모든 타입 정의 완료 및 타입 에러 0개
- [ ] 서비스 레이어 함수 100% 구현
- [ ] 5개 페이지 모두 동작
- [ ] 블록체인별 볼트 상태 정확한 계산
- [ ] 자동 리밸런싱 트리거 동작
- [ ] 출금 후 비율 체크 자동 실행
- [ ] E2E 테스트 3개 시나리오 통과

### 8.2 UI/UX 완료 기준

- [ ] Sapphire 테마 일관성 유지
- [ ] 이모지 사용 금지 (Lucide 아이콘만)
- [ ] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [ ] 다크 모드 완전 지원
- [ ] 로딩 상태 표시
- [ ] 에러 핸들링 및 Toast 알림

### 8.3 비즈니스 로직 완료 기준

- [ ] Hot 20% / Cold 80% 비율 유지 로직
- [ ] 블록체인별 독립적 볼트 관리
- [ ] Ethereum & ERC20 통합 볼트
- [ ] 출금 전 자동 볼트 체크
- [ ] 리밸런싱 자동 트리거 (Air-gap 통합)
- [ ] 출금 후 비율 재확인 및 권장 알림

---

## 9. 마이그레이션 계획 (향후)

### 9.1 실제 API 전환 로드맵

**Phase 1: Mock → Real API (1주)**
```typescript
// Before
const withdrawals = JSON.parse(localStorage.getItem('withdrawals'));

// After
const withdrawals = await fetch('/api/withdrawals').then(r => r.json());
```

**Phase 2: WebSocket 실시간 업데이트 (1주)**
- 볼트 잔고 실시간 갱신
- 출금 상태 실시간 업데이트

**Phase 3: 통합 완료 (2주)**
- Phase 4 시스템과 완전 통합
- 단일 시스템으로 전환 또는 병렬 유지 결정

---

## 10. 결론

이 설계 문서는 Withdrawal Manager v2의 완전한 아키텍처를 정의합니다.

**핵심 설계 원칙:**
1. ✅ 데이터 공유 (Option 2)
2. ✅ 블록체인별 독립 볼트
3. ✅ 자동 리밸런싱 통합
4. ✅ 타입 안전성
5. ✅ 확장 가능성
6. ✅ 파일 크기 제한 (200-300라인)

**예상 결과:**
- 11.5일 안에 완전한 시스템 구축
- 기존 시스템과 독립적이면서 데이터 공유
- Hot/Cold 리밸런싱 완전 자동화
- 블록체인별 정확한 볼트 관리
- 확장 가능한 아키텍처

_설계 완료일: 2025-10-15_
_설계자: Claude Code with Sequential Thinking_
