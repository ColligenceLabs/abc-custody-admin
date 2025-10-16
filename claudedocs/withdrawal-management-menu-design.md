# 출금 관리2 (Withdrawal Manager v2) 구성 계획서

## 📋 문서 개요

- **작성일**: 2025-10-15
- **프로젝트명**: 출금 관리2 (Withdrawal Manager v2)
- **목적**: Hot/Cold 볼트 리밸런싱을 완전히 통합한 새로운 출금 관리 시스템
- **기존 시스템**: Phase 4 출금 관리 (`/admin/withdrawals/*`) - **유지됨, 변경 없음**
- **새 시스템**: 출금 관리2 (`/admin/withdrawal-v2/*`) - **새롭게 구현**
- **핵심 비즈니스 로직**: Hot 20% / Cold 80% 비율 유지, 출금 전후 자동 리밸런싱
- **독립성**: 기존 Phase 시스템과 완전히 독립적으로 구현, Phase 5와 무관

---

## 🔄 기존 시스템 vs 새 시스템

### 기존 출금 관리 (Phase 4 완료) - **유지됨**

**라우트**: `/admin/withdrawals/*`

```
📂 출금 관리 (기존)
├── /queue          - 출금 요청 대기열
├── /aml            - AML 검증
├── /airgap         - Air-gap 서명
└── /execution      - 출금 실행 모니터링
```

**특징**:
- ✅ 기본적인 출금 처리 워크플로우
- ✅ AML 검증 및 Air-gap 서명 시스템
- ✅ 컨펌 추적 및 실행 모니터링
- ❌ Hot/Cold 리밸런싱 통합 없음
- ❌ 잔고 자동 체크 기능 없음

**현재 상태**: 완료됨, 그대로 유지

---

### 새로운 출금 관리2 (Withdrawal Manager v2) - **신규 구현**

**라우트**: `/admin/withdrawal-v2/*`

```
📂 출금 관리2 (신규)
├── /dashboard      - 통합 대시보드 (Hot/Cold 잔고 포함)
├── /requests       - 출금 요청 관리
├── /vault-check    - 잔고 확인 및 리밸런싱
├── /signing        - Air-gap 서명 (리밸런싱 통합)
└── /execution      - 출금 실행 및 사후 관리
```

**특징**:
- ✅ Hot/Cold 잔고 자동 체크 통합
- ✅ 리밸런싱 자동 트리거 시스템
- ✅ 출금 전후 비율 관리
- ✅ 통합 대시보드 (출금 + 볼트 상태)
- ✅ 완전히 새로운 UI/UX

**현재 상태**: 계획 단계, 신규 구현 예정

---

## 🎯 비즈니스 요구사항

### 핵심 출금 프로세스

```
1. 고객 출금 요청
   ↓
2. 회원사 등록 주소 검증
   ↓
3. AML/컴플라이언스 검증
   ↓
4. 🆕 Hot Wallet 잔고 확인
   ├─ ✅ 충분 → Air-gap 서명으로 이동
   └─ ❌ 부족 → Cold → Hot 리밸런싱 필요
       ↓
       Air-gap 서명 (리밸런싱)
       ↓
       Cold → Hot 이체 완료
       ↓
       다시 출금 프로세스 진행
   ↓
5. Air-gap 서명 (출금)
   ↓
6. 출금 실행 (브로드캐스트)
   ↓
7. 🆕 출금 후 Hot/Cold 비율 재확인
   ├─ Hot < 20% → Cold → Hot 리밸런싱 권장
   └─ Hot > 20% → Hot → Cold 리밸런싱 권장
```

### 볼트 비율 유지 원칙

- **목표 비율**: Hot 20% / Cold 80%
- **허용 편차**: ±5% (Hot 15-25%, Cold 75-85%)
- **리밸런싱 트리거**: 편차 5% 초과 시 알림
- **리밸런싱 방식**: 수동 (관리자 승인 필요, Air-gap 서명)

### 블록체인별 볼트 구조 🆕

**지원 자산 및 블록체인**:
- **Bitcoin (BTC)**: Bitcoin 블록체인 - 독립 볼트
- **Ethereum (ETH)**: Ethereum 블록체인 - ETH & ERC20 통합 볼트
- **ERC20 토큰**: Ethereum 블록체인 (ETH와 동일)
  - USDT (Tether USD)
  - USDC (USD Coin)
  - Custom ERC20 토큰 (확장 가능)
- **Solana (SOL)**: Solana 블록체인 - 독립 볼트

**네트워크 환경**:
- **Mainnet**: 실제 프로덕션 환경
- **Testnet**: 개발/테스트 환경
  - Bitcoin: Testnet3
  - Ethereum: Sepolia
  - Solana: Devnet

**볼트 분리 전략** (Mainnet 기준):

```
1. Bitcoin 블록체인 볼트
   ├── Hot Wallet (20%)
   │   └── BTC (Mainnet)
   └── Cold Wallet (80%)
       └── BTC (Mainnet)

2. Ethereum 블록체인 볼트 (통합)
   ├── Hot Wallet (20%)
   │   ├── ETH (Mainnet)
   │   ├── USDT (ERC20, Mainnet)
   │   ├── USDC (ERC20, Mainnet)
   │   └── Custom ERC20 (Mainnet)
   └── Cold Wallet (80%)
       ├── ETH (Mainnet)
       ├── USDT (ERC20, Mainnet)
       ├── USDC (ERC20, Mainnet)
       └── Custom ERC20 (Mainnet)

3. Solana 블록체인 볼트
   ├── Hot Wallet (20%)
   │   └── SOL (Mainnet)
   └── Cold Wallet (80%)
       └── SOL (Mainnet)
```

**핵심 원칙**:
- ✅ 각 블록체인별로 독립적인 Hot/Cold 비율 관리
- ✅ ETH와 ERC20 토큰은 동일한 Ethereum 블록체인을 사용하므로 통합 볼트
- ✅ BTC와 SOL은 별도 블록체인이므로 독립 볼트
- ✅ 자산(Asset) 타입으로 어떤 블록체인인지 자동 판별
- ✅ 네트워크는 Mainnet/Testnet 환경만 구분
- ✅ 출금 시 해당 블록체인의 Hot 잔고만 체크
- ✅ 리밸런싱도 블록체인별로 독립 실행

---

## 📂 출금 관리2 메뉴 구조

### 선택된 구조: 통합 워크플로우 기반 (추천 ⭐)

Hot/Cold 리밸런싱을 완전히 통합한 새로운 출금 워크플로우 시스템입니다.

**베이스 라우트**: `/admin/withdrawal-v2/*`

```
📂 출금 관리2 (Withdrawal Manager v2)
│
├── 📊 통합 대시보드          /dashboard 🆕
│   ├── 출금 통계 (대기/처리중/완료)
│   ├── Hot/Cold 잔고 현황 (실시간)
│   ├── 리밸런싱 필요 알림 (자동 감지)
│   ├── 오늘의 출금 요약
│   └── 긴급 알림 센터
│
├── 📋 출금 요청 관리         /requests 🆕
│   ├── 전체 출금 요청 목록
│   ├── 상태별 필터 (대기/AML검토/잔고확인/서명/실행중/완료)
│   ├── 우선순위 관리 (긴급/일반/낮음)
│   ├── 통합 검색 (회원사/주소/TxHash)
│   └── 일괄 처리 기능
│
├── 🏦 잔고 확인 & 리밸런싱   /vault-check 🆕
│   ├── Hot/Cold 잔고 실시간 모니터링
│   ├── 출금 가능 여부 자동 판단
│   ├── 리밸런싱 필요 출금 목록
│   ├── 자동 리밸런싱 트리거 시스템
│   ├── 예상 비율 시뮬레이터 (출금 전후)
│   ├── 리밸런싱 계산기
│   └── 리밸런싱 이력 및 통계
│
├── 🔐 통합 서명 센터         /signing 🆕
│   ├── 출금 서명 대기열
│   ├── 리밸런싱 서명 대기열
│   ├── QR 코드 생성 (출금 + 리밸런싱 통합)
│   ├── 서명 스캔 및 검증
│   ├── 다중 서명 진행 상황
│   ├── 만료 관리 (6시간 제한)
│   └── 긴급 서명 우선 처리
│
└── 📡 실행 & 사후 관리       /execution 🆕
    ├── 브로드캐스트 모니터링
    ├── 컨펌 추적 (실시간 폴링)
    ├── 실패 처리 및 재시도
    ├── 출금 후 Hot/Cold 비율 자동 체크
    ├── 리밸런싱 권장 알림
    └── 완료 보고서 생성
```

**핵심 특징**:
- ✅ 출금 + 리밸런싱 완전 통합 워크플로우
- ✅ Hot/Cold 잔고를 항상 고려한 출금 처리
- ✅ 자동화된 리밸런싱 트리거 시스템
- ✅ 통합 대시보드로 전체 상황 한눈에 파악
- ✅ 기존 시스템과 독립적 (기존 /admin/withdrawals와 병렬 운영)

**기존 시스템과의 차이점**:
| 기능 | 기존 출금 관리 | 출금 관리2 (신규) |
|------|-------------|-----------------|
| 라우트 | `/admin/withdrawals/*` | `/admin/withdrawal-v2/*` |
| Hot 잔고 체크 | ❌ 수동 | ✅ 자동 통합 |
| 리밸런싱 | ❌ 별도 작업 | ✅ 워크플로우 통합 |
| 통합 대시보드 | ❌ 없음 | ✅ 출금+볼트 통합 |
| 사후 관리 | ❌ 기본만 | ✅ 비율 체크 및 권장 |
| UI/UX | Phase 4 스타일 | 새로운 디자인 |

---

## 🔄 전체 출금 처리 프로세스 다이어그램

```
┌─────────────────────────────────────────────────────────┐
│ Step 1: 출금 요청 접수 (/admin/withdrawals/queue)       │
│                                                           │
│ ✓ 회원사 출금 요청 수신                                   │
│ ✓ 우선순위 자동 계산 (긴급/일반/낮음)                     │
│ ✓ 수신 주소 검증 (회원사 등록 주소 확인)                   │
│ ✓ 일일 한도 체크 (개인 지갑: 100만원)                     │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Step 2: AML 검증 (/admin/withdrawals/aml)               │
│                                                           │
│ ✓ 자동 스크리닝 (블랙리스트, 제재 목록, PEP)              │
│ ✓ 리스크 점수 계산 (0-100)                               │
│ ✓ 수동 검토 (리스크 60+ 또는 1억원+)                     │
│ ✓ 승인/거부/플래그 처리                                  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Step 3: 🆕 Hot/Cold 잔고 확인 및 리밸런싱                │
│         (/admin/withdrawals/vault-check)                 │
│                                                           │
│ ┌─────────────────────────────────────────────────┐     │
│ │ Hot Wallet 잔고 확인                             │     │
│ │ - 현재 잔액: 10 BTC                              │     │
│ │ - 출금 요청: 8 BTC                               │     │
│ │ - 예약 중: 1 BTC                                 │     │
│ │ - 출금 가능: 1 BTC (부족!)                       │     │
│ └─────────────────────────────────────────────────┘     │
│                    ↓                                      │
│         Hot 잔고 충분?                                    │
│            ↙              ↘                              │
│    ✅ 충분 (1 BTC ≥ 8 BTC)  ❌ 부족 (1 BTC < 8 BTC)     │
│       ↓                        ↓                         │
│  Step 4로 이동      ┌──────────────────────┐            │
│                     │ Cold → Hot 리밸런싱   │            │
│                     │                       │            │
│                     │ 1. 필요 금액 계산     │            │
│                     │    부족: 7 BTC        │            │
│                     │    안전 마진: +20%    │            │
│                     │    이체 금액: 8.4 BTC │            │
│                     │                       │            │
│                     │ 2. Air-gap 서명 필요  │            │
│                     │    서명 유형: 리밸런싱│            │
│                     │    우선순위: 긴급     │            │
│                     │                       │            │
│                     │ 3. Cold → Hot 이체    │            │
│                     │    상태: 진행 중...   │            │
│                     └──────────────────────┘            │
│                              ↓                           │
│                     리밸런싱 완료 후                      │
│                     다시 Step 3 실행                      │
│                     (이번엔 충분함 → Step 4)              │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Step 4: Air-gap 서명 (/admin/withdrawals/airgap)        │
│                                                           │
│ ✓ QR 코드 생성 (트랜잭션 정보)                            │
│ ✓ 오프라인 서명 장치로 전송                               │
│ ✓ 다중 서명 수집 (2-of-3, 3-of-5)                        │
│ ✓ 서명 검증 및 완료                                      │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Step 5: 출금 실행 (/admin/withdrawals/execution)        │
│                                                           │
│ ✓ 트랜잭션 브로드캐스트                                   │
│ ✓ 컨펌 추적 (목표 컨펌 수까지 모니터링)                   │
│ ✓ 실패 시 재시도 (RBF 지원)                              │
│ ✓ 완료 알림 (Toast + Email)                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ Step 6: 🆕 출금 후 리밸런싱 체크                         │
│                                                           │
│ ┌─────────────────────────────────────────────────┐     │
│ │ Hot/Cold 비율 재계산                             │     │
│ │ - 출금 전: Hot 25% / Cold 75%                   │     │
│ │ - 출금 후: Hot 18% / Cold 82%                   │     │
│ │ - 목표: Hot 20% / Cold 80%                      │     │
│ │ - 편차: -2% (허용 범위 내)                       │     │
│ └─────────────────────────────────────────────────┘     │
│                    ↓                                      │
│         편차 5% 초과?                                     │
│            ↙              ↘                              │
│    ❌ 정상 (±5% 이내)    ✅ 리밸런싱 필요 (±5% 초과)     │
│       ↓                        ↓                         │
│  출금 완료           ┌──────────────────────┐            │
│                     │ 리밸런싱 권장 알림     │            │
│                     │                       │            │
│                     │ - Hot < 20%:          │            │
│                     │   Cold → Hot 권장     │            │
│                     │                       │            │
│                     │ - Hot > 20%:          │            │
│                     │   Hot → Cold 권장     │            │
│                     │                       │            │
│                     │ 관리자 선택:          │            │
│                     │ [지금 리밸런싱]        │            │
│                     │ [나중에]              │            │
│                     └──────────────────────┘            │
└─────────────────────────────────────────────────────────┘
```

---

## 🆕 구현 상세

### 1. 통합 대시보드

**페이지 경로**: `/admin/withdrawal-v2/dashboard`

**타입 정의**:

```typescript
// /src/types/withdrawalV2.ts (신규 파일)

/**
 * 네트워크 환경 타입
 */
type NetworkEnvironment = "mainnet" | "testnet";

/**
 * 블록체인 타입 (자산으로 자동 판별)
 */
type BlockchainType = "BITCOIN" | "ETHEREUM" | "SOLANA";

/**
 * 자산 타입
 */
type AssetType = "BTC" | "ETH" | "USDT" | "USDC" | "SOL" | "CUSTOM_ERC20";

/**
 * 자산 메타데이터
 */
interface AssetMetadata {
  symbol: AssetType;
  name: string;
  blockchain: BlockchainType; // 어느 블록체인에 속하는지
  decimals: number;
  isNative: boolean; // ETH, BTC, SOL = true, ERC20 = false
  contractAddress?: string; // ERC20만 해당

  // 자산별 지원 네트워크
  supportedNetworks: {
    mainnet: boolean;
    testnet: boolean;
  };
}

/**
 * 블록체인별 볼트 상태
 */
interface BlockchainVaultStatus {
  blockchain: BlockchainType;
  blockchainName: string; // "Bitcoin", "Ethereum & ERC20", "Solana"
  network: NetworkEnvironment; // "mainnet" | "testnet"

  // Hot Wallet
  hotWallet: {
    totalValueKRW: string; // 전체 Hot 자산 가치 (KRW)
    assets: {
      symbol: AssetType;
      balance: string;
      valueKRW: string;
      percentage: number; // 이 자산이 Hot 내에서 차지하는 비율
    }[];
  };

  // Cold Wallet
  coldWallet: {
    totalValueKRW: string; // 전체 Cold 자산 가치 (KRW)
    assets: {
      symbol: AssetType;
      balance: string;
      valueKRW: string;
      percentage: number; // 이 자산이 Cold 내에서 차지하는 비율
    }[];
  };

  // 비율 정보
  totalValueKRW: string; // 블록체인 전체 자산 가치
  hotRatio: number; // Hot 비율 (%)
  coldRatio: number; // Cold 비율 (%)
  targetHotRatio: 20;
  targetColdRatio: 80;
  deviation: number; // 목표 대비 편차 (%)
  needsRebalancing: boolean; // 리밸런싱 필요 여부
}

/**
 * 자산별 블록체인 매핑 헬퍼 함수
 */
function getBlockchainByAsset(asset: AssetType): BlockchainType {
  switch (asset) {
    case "BTC":
      return "BITCOIN";
    case "ETH":
    case "USDT":
    case "USDC":
    case "CUSTOM_ERC20":
      return "ETHEREUM";
    case "SOL":
      return "SOLANA";
  }
}

/**
 * 통합 대시보드 통계
 */
interface WithdrawalV2DashboardStats {
  // 출금 통계
  withdrawals: {
    pending: number; // 대기 중
    amlReview: number; // AML 검토 중
    vaultCheck: number; // 잔고 확인 중
    signing: number; // 서명 대기 중
    executing: number; // 실행 중
    completedToday: number; // 오늘 완료
    totalValueToday: string; // 오늘 총 출금액 (KRW)
  };

  // 🆕 블록체인별 볼트 상태 (Mainnet 기준)
  vaults: {
    bitcoin: BlockchainVaultStatus; // Bitcoin 블록체인 볼트
    ethereum: BlockchainVaultStatus; // Ethereum 블록체인 볼트 (ETH & ERC20 통합)
    solana: BlockchainVaultStatus; // Solana 블록체인 볼트
  };

  // 전체 볼트 요약
  vaultSummary: {
    network: NetworkEnvironment; // "mainnet" | "testnet"
    totalValueKRW: string; // 전체 자산 가치
    hotTotalKRW: string; // 전체 Hot 자산
    coldTotalKRW: string; // 전체 Cold 자산
    overallHotRatio: number; // 전체 평균 Hot 비율
    overallColdRatio: number; // 전체 평균 Cold 비율
    blockchainsNeedingRebalancing: BlockchainType[]; // 리밸런싱 필요한 블록체인 목록
  };

  // 리밸런싱 통계
  rebalancing: {
    required: number; // 리밸런싱 필요한 출금 건수
    inProgress: number; // 리밸런싱 진행 중
    completedToday: number; // 오늘 완료한 리밸런싱
    byBlockchain: {
      bitcoin: number; // Bitcoin 리밸런싱 필요 건수
      ethereum: number; // Ethereum 리밸런싱 필요 건수
      solana: number; // Solana 리밸런싱 필요 건수
    };
  };

  // 긴급 알림
  alerts: {
    urgentWithdrawals: number; // 긴급 출금
    hotBalanceLow: {
      bitcoin: boolean; // Bitcoin Hot 부족
      ethereum: boolean; // Ethereum Hot 부족
      solana: boolean; // Solana Hot 부족
    };
    expiringSignatures: number; // 곧 만료되는 서명
  };
}
```

**UI 컴포넌트**:

```tsx
// /src/app/admin/withdrawal-v2/dashboard/page.tsx

export default function WithdrawalV2Dashboard() {
  const { data: stats } = useWithdrawalV2Stats();

  return (
    <div className="space-y-6">
      {/* 1. 긴급 알림 배너 */}
      {stats?.alerts && <AlertBanner alerts={stats.alerts} />}

      {/* 2. 통계 카드 그리드 */}
      <DashboardStatsGrid stats={stats} />

      {/* 3. 🆕 블록체인별 Hot/Cold 잔고 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bitcoin 블록체인 볼트 */}
        <BlockchainVaultCard vault={stats?.vaults.bitcoin} />

        {/* Ethereum 블록체인 볼트 (ETH & ERC20 통합) */}
        <BlockchainVaultCard vault={stats?.vaults.ethereum} />

        {/* Solana 블록체인 볼트 */}
        <BlockchainVaultCard vault={stats?.vaults.solana} />
      </div>

      {/* 4. 전체 볼트 요약 */}
      <VaultSummaryCard summary={stats?.vaultSummary} />

      {/* 5. 출금 요청 현황 */}
      <WithdrawalStatusCard withdrawals={stats?.withdrawals} />

      {/* 6. 최근 활동 */}
      <RecentActivityFeed />
    </div>
  );
}

// 🆕 블록체인별 볼트 카드 컴포넌트
function BlockchainVaultCard({ vault }: { vault?: BlockchainVaultStatus }) {
  if (!vault) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {vault.blockchain === "BITCOIN" && <Bitcoin className="w-5 h-5" />}
          {vault.blockchain === "ETHEREUM" && <Ethereum className="w-5 h-5" />}
          {vault.blockchain === "SOLANA" && <Solana className="w-5 h-5" />}
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
              <p className="text-2xl font-bold">{vault.hotRatio}%</p>
              <p className="text-xs text-muted-foreground">
                {vault.hotWallet.totalValueKRW}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cold</p>
              <p className="text-2xl font-bold">{vault.coldRatio}%</p>
              <p className="text-xs text-muted-foreground">
                {vault.coldWallet.totalValueKRW}
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
                리밸런싱 필요 (편차: {vault.deviation}%)
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

### 2. 출금 요청 관리

**페이지 경로**: `/admin/withdrawal-v2/requests`

**타입 정의**:

```typescript
/**
 * 출금 관리2 요청 (기존과 독립적)
 */
interface WithdrawalV2Request {
  id: string;
  memberId: string;
  memberName: string;

  // 출금 정보
  amount: string;
  asset: AssetType; // BTC, ETH, USDT, USDC, SOL, CUSTOM_ERC20
  blockchain: BlockchainType; // BITCOIN, ETHEREUM, SOLANA (자산으로 자동 판별)
  network: NetworkEnvironment; // mainnet | testnet
  toAddress: string;

  // 상태 (확장됨)
  status:
    | "pending"           // 대기 중
    | "aml_review"        // AML 검토 중
    | "vault_check"       // 잔고 확인 중
    | "rebalancing"       // 리밸런싱 진행 중
    | "signing"           // 서명 대기 중
    | "executing"         // 실행 중
    | "completed"         // 완료
    | "failed"            // 실패
    | "cancelled";        // 취소됨

  // 우선순위
  priority: "urgent" | "normal" | "low";

  // AML 검증
  amlCheck?: {
    status: "pending" | "approved" | "flagged" | "rejected";
    riskScore: number;
    reviewedAt?: Date;
  };

  // 🆕 블록체인별 잔고 체크
  vaultCheck?: {
    blockchain: BlockchainType; // 어느 블록체인 볼트를 체크했는지
    network: NetworkEnvironment; // mainnet | testnet
    hotSufficient: boolean; // 해당 블록체인 Hot 충분 여부
    rebalancingRequired: boolean;
    rebalancingAmount?: string;
    rebalancingAsset?: AssetType; // 리밸런싱 자산 (보통 네이티브 자산)
    checkedAt?: Date;
  };

  // 서명 정보
  signing?: {
    airGapRequestId: string;
    signaturesRequired: number;
    signaturesCollected: number;
    status: "pending" | "partial" | "completed" | "expired";
  };

  // 실행 정보
  execution?: {
    txHash?: string;
    confirmations: number;
    targetConfirmations: number;
    status: "broadcasting" | "confirming" | "confirmed" | "failed";
  };

  createdAt: Date;
  updatedAt: Date;
}
```

**UI 컴포넌트**:

```tsx
// /src/app/admin/withdrawal-v2/requests/page.tsx

export default function WithdrawalV2RequestsPage() {
  return (
    <div className="space-y-6">
      {/* 1. 통계 카드 */}
      <RequestStatsCards />

      {/* 2. 필터 및 검색 */}
      <RequestFilter />

      {/* 3. 출금 요청 테이블 */}
      <RequestTable />
    </div>
  );
}

function RequestTable() {
  // 상태별 색상 코딩
  // - pending: 회색
  // - aml_review: 노랑
  // - vault_check: 파랑
  // - rebalancing: 보라
  // - signing: 주황
  // - executing: 청록
  // - completed: 초록
  // - failed/cancelled: 빨강
}
```

---

### 3. 잔고 확인 및 리밸런싱

**페이지 경로**: `/admin/withdrawal-v2/vault-check`

**타입 정의**:

```typescript
// /src/types/withdrawalV2.ts에 추가

/**
 * 출금 전 블록체인별 볼트 체크 결과
 */
interface VaultCheckBeforeWithdrawal {
  withdrawalId: string;
  requestedAmount: string;
  requestedAsset: AssetType; // BTC, ETH, USDT, USDC, SOL
  requestedBlockchain: BlockchainType; // BITCOIN, ETHEREUM, SOLANA
  requestedNetwork: NetworkEnvironment; // mainnet | testnet
  checkedAt: Date;

  // 🆕 해당 블록체인의 Hot Wallet 상태
  hotWallet: {
    blockchain: BlockchainType; // BITCOIN, ETHEREUM, SOLANA
    network: NetworkEnvironment; // mainnet | testnet
    currentBalance: string; // 해당 자산의 현재 잔액
    currentBalanceKRW: string; // KRW 환산 금액
    reservedAmount: string; // 예약된 금액 (다른 출금 대기 중)
    availableBalance: string; // 출금 가능 잔액 = 현재 - 예약
    isEnough: boolean; // 출금 가능 여부
    shortfall?: string; // 부족 금액 (부족한 경우만)
    shortfallKRW?: string; // 부족 금액 (KRW)
  };

  // 🆕 해당 블록체인의 Cold Wallet 상태
  coldWallet: {
    blockchain: BlockchainType;
    network: NetworkEnvironment;
    currentBalance: string; // 해당 자산의 현재 잔액
    currentBalanceKRW: string; // KRW 환산 금액
    availableBalance: string; // 리밸런싱 가능 잔액
  };

  // 🆕 블록체인별 리밸런싱 정보
  rebalancing: {
    required: boolean; // 리밸런싱 필요 여부
    blockchain: BlockchainType; // 어느 블록체인에서 리밸런싱이 필요한지
    network: NetworkEnvironment; // mainnet | testnet
    asset: AssetType; // 리밸런싱 자산 (보통 네이티브 자산)
    amount: string; // Cold → Hot 이체 필요 금액
    amountWithMargin: string; // 안전 마진 포함 (+20%)
    amountKRW: string; // KRW 환산 금액
    reason: "insufficient_hot" | "maintain_ratio";
    estimatedTime: string; // Air-gap 서명 소요 시간 (예: "30분")
    priority: "urgent" | "normal"; // 우선순위
  };

  // 출금 후 예상 상태
  afterWithdrawal: {
    hotBalance: string; // 출금 후 Hot 잔액
    coldBalance: string; // 출금 후 Cold 잔액
    hotRatio: number; // 출금 후 예상 Hot 비율 (%)
    coldRatio: number; // 출금 후 예상 Cold 비율 (%)
    needsRebalancing: boolean; // 출금 후 리밸런싱 필요 여부
    deviation: number; // 목표 비율과의 편차 (%)
  };
}

/**
 * 🆕 블록체인별 리밸런싱 권장 알림
 */
interface RebalancingRecommendation {
  recommendationId: string;
  blockchain: BlockchainType; // 어느 블록체인 볼트에 대한 권장인지
  network: NetworkEnvironment; // mainnet | testnet
  triggeredBy: "withdrawal" | "manual_check" | "scheduled";
  triggeredAt: Date;

  currentStatus: {
    blockchain: BlockchainType;
    blockchainName: string;
    hotBalance: string; // 네이티브 자산 기준
    coldBalance: string;
    hotBalanceKRW: string;
    coldBalanceKRW: string;
    hotRatio: number; // 현재 Hot 비율
    coldRatio: number; // 현재 Cold 비율
    totalValueKRW: string; // 전체 자산 가치 (KRW)
  };

  targetStatus: {
    hotRatio: number; // 목표 Hot 비율 (20%)
    coldRatio: number; // 목표 Cold 비율 (80%)
  };

  recommendation: {
    action: "cold_to_hot" | "hot_to_cold" | "none";
    asset: AssetType; // 이체할 자산 (보통 네이티브 자산)
    amount: string; // 이체 권장 금액
    amountKRW: string; // KRW 환산 금액
    reason: string; // 권장 사유
    priority: "high" | "medium" | "low";
  };

  actions: {
    autoTrigger: boolean; // 자동 트리거 가능 여부
    requiresApproval: boolean; // 승인 필요 여부
    requiresAirGapSigning: boolean; // Air-gap 서명 필요 여부
  };
}
```

**UI 컴포넌트 구조**:

```tsx
// /src/app/admin/withdrawals/vault-check/page.tsx

export default function VaultCheckPage() {
  return (
    <div className="space-y-6">
      {/* 1. 통계 카드 */}
      <VaultCheckStats />

      {/* 2. Hot/Cold 잔고 현황 */}
      <VaultBalanceOverview />

      {/* 3. 리밸런싱 필요 출금 목록 */}
      <RebalancingRequiredWithdrawals />

      {/* 4. 리밸런싱 이력 */}
      <RebalancingHistory />
    </div>
  );
}

// 1. 통계 카드 컴포넌트
function VaultCheckStats() {
  // 4개 통계 카드
  // - Hot 충분: X건
  // - 리밸런싱 필요: X건
  // - 리밸런싱 진행 중: X건
  // - 오늘 리밸런싱 완료: X건
}

// 2. Hot/Cold 잔고 현황 컴포넌트
function VaultBalanceOverview() {
  // - 현재 Hot/Cold 비율 차트
  // - 목표 비율 대비 편차 표시
  // - 자산별 Hot/Cold 분포
  // - 리밸런싱 권장 알림 (편차 5% 초과 시)
}

// 3. 리밸런싱 필요 출금 목록
function RebalancingRequiredWithdrawals() {
  // 테이블 형태
  // - 출금 ID
  // - 회원사
  // - 자산 & 금액
  // - Hot 부족 금액
  // - 필요 리밸런싱 금액
  // - 우선순위
  // - [리밸런싱 시작] 버튼
}
```

**API 함수**:

```typescript
// /src/services/vaultApi.ts에 추가

/**
 * 출금 전 볼트 체크
 */
export async function checkVaultBeforeWithdrawal(
  withdrawalId: string
): Promise<VaultCheckBeforeWithdrawal> {
  // 1. 출금 정보 조회
  const withdrawal = await getWithdrawalRequest(withdrawalId);

  // 2. Hot/Cold 잔고 조회
  const vaultStatus = await getVaultStatus();

  // 3. 출금 가능 여부 판단
  const hotAvailable = calculateAvailableBalance(
    vaultStatus.hotWallet.balance,
    vaultStatus.hotWallet.reserved
  );

  const isEnough = hotAvailable >= withdrawal.amount;

  // 4. 리밸런싱 필요 시 계산
  let rebalancing = null;
  if (!isEnough) {
    const shortfall = withdrawal.amount - hotAvailable;
    const margin = shortfall * 0.2; // 20% 안전 마진
    rebalancing = {
      required: true,
      amount: shortfall.toString(),
      amountWithMargin: (shortfall + margin).toString(),
      reason: "insufficient_hot",
      estimatedTime: "30분",
      priority: withdrawal.priority === "urgent" ? "urgent" : "normal",
    };
  }

  // 5. 출금 후 예상 상태 계산
  const afterWithdrawal = calculateAfterWithdrawalStatus(
    vaultStatus,
    withdrawal.amount
  );

  return {
    withdrawalId,
    requestedAmount: withdrawal.amount,
    requestedCurrency: withdrawal.currency,
    checkedAt: new Date(),
    hotWallet: {
      currentBalance: vaultStatus.hotWallet.balance,
      reservedAmount: vaultStatus.hotWallet.reserved,
      availableBalance: hotAvailable.toString(),
      isEnough,
      shortfall: !isEnough ? (withdrawal.amount - hotAvailable).toString() : undefined,
    },
    coldWallet: {
      currentBalance: vaultStatus.coldWallet.balance,
      availableBalance: vaultStatus.coldWallet.balance, // Cold는 전액 사용 가능
    },
    rebalancing,
    afterWithdrawal,
  };
}

/**
 * 리밸런싱 권장 체크
 */
export async function checkRebalancingRecommendation(): Promise<RebalancingRecommendation> {
  const vaultStatus = await getVaultStatus();
  const deviation = Math.abs(vaultStatus.balanceStatus.hotRatio - 20);

  let action: "cold_to_hot" | "hot_to_cold" | "none" = "none";
  let amount = "0";
  let priority: "high" | "medium" | "low" = "low";

  if (deviation > 5) {
    if (vaultStatus.balanceStatus.hotRatio < 20) {
      action = "cold_to_hot";
      // 목표 20%로 맞추기 위한 이체 금액 계산
      const targetHot = vaultStatus.totalValue * 0.2;
      amount = (targetHot - vaultStatus.hotWallet.balance).toString();
    } else {
      action = "hot_to_cold";
      const targetHot = vaultStatus.totalValue * 0.2;
      amount = (vaultStatus.hotWallet.balance - targetHot).toString();
    }

    priority = deviation > 10 ? "high" : "medium";
  }

  return {
    recommendationId: generateId(),
    triggeredBy: "manual_check",
    triggeredAt: new Date(),
    currentStatus: {
      hotBalance: vaultStatus.hotWallet.balance,
      coldBalance: vaultStatus.coldWallet.balance,
      hotRatio: vaultStatus.balanceStatus.hotRatio,
      coldRatio: vaultStatus.balanceStatus.coldRatio,
      totalValue: vaultStatus.totalValue,
    },
    targetStatus: {
      hotRatio: 20,
      coldRatio: 80,
    },
    recommendation: {
      action,
      amount,
      reason: `현재 Hot 비율 ${vaultStatus.balanceStatus.hotRatio}% (목표 20%)`,
      priority,
    },
    actions: {
      autoTrigger: false, // 수동 승인 필요
      requiresApproval: true,
      requiresAirGapSigning: true,
    },
  };
}

/**
 * 리밸런싱 자동 트리거
 */
export async function triggerRebalancing(
  amount: string,
  currency: Currency,
  direction: "cold_to_hot" | "hot_to_cold",
  reason: string
): Promise<{ airGapRequestId: string }> {
  // 1. Air-gap 서명 요청 생성
  const airGapRequest = await createAirGapRequest({
    type: "rebalancing",
    amount,
    currency,
    fromWallet: direction === "cold_to_hot" ? "cold" : "hot",
    toWallet: direction === "cold_to_hot" ? "hot" : "cold",
    reason,
    priority: "urgent",
  });

  // 2. 리밸런싱 이력 기록
  await recordRebalancingHistory({
    direction,
    amount,
    currency,
    reason,
    airGapRequestId: airGapRequest.id,
    status: "pending",
  });

  return { airGapRequestId: airGapRequest.id };
}
```

---

---

### 4. 통합 서명 센터

**페이지 경로**: `/admin/withdrawal-v2/signing`

**특징**:
- 출금 서명과 리밸런싱 서명을 한 곳에서 관리
- 긴급 출금 우선 처리
- QR 코드 일괄 생성/스캔

**UI 구조**:

```tsx
// /src/app/admin/withdrawal-v2/signing/page.tsx

export default function SigningCenterPage() {
  return (
    <div className="space-y-6">
      {/* 1. 통계 카드 */}
      <SigningStatsCards />

      {/* 2. 탭 구조 */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="withdrawal">출금 서명</TabsTrigger>
          <TabsTrigger value="rebalancing">리밸런싱 서명</TabsTrigger>
          <TabsTrigger value="urgent">긴급</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <SigningQueueTable type="all" />
        </TabsContent>
        {/* ... 나머지 탭 */}
      </Tabs>
    </div>
  );
}
```

---

### 5. 실행 및 사후 관리

**페이지 경로**: `/admin/withdrawal-v2/execution`

**핵심 기능**:
1. 출금 실행 모니터링 (브로드캐스트 → 컨펌)
2. **출금 완료 후 자동 Hot/Cold 비율 체크**
3. **리밸런싱 권장 알림 자동 생성**
4. 실패 처리 및 재시도

**출금 후 자동 체크 워크플로우**:

**워크플로우 통합**:

```typescript
// /src/app/admin/withdrawals/queue/page.tsx 수정

async function handleApproveWithdrawal(withdrawalId: string) {
  try {
    // 1. AML 승인
    await approveWithdrawalAML(withdrawalId);

    // 2. 🆕 Hot 잔고 자동 체크
    const vaultCheck = await checkVaultBeforeWithdrawal(withdrawalId);

    if (vaultCheck.rebalancing?.required) {
      // 3. 리밸런싱 필요 알림 모달
      setRebalancingAlert({
        show: true,
        withdrawalId,
        shortfall: vaultCheck.hotWallet.shortfall!,
        rebalancingAmount: vaultCheck.rebalancing.amountWithMargin,
        estimatedTime: vaultCheck.rebalancing.estimatedTime,
        priority: vaultCheck.rebalancing.priority,
      });
    } else {
      // 4. Hot 충분 → Air-gap 서명으로 자동 이동
      toast.success("출금 승인 완료. Air-gap 서명 대기열로 이동합니다.");
      router.push(`/admin/withdrawals/airgap?highlight=${withdrawalId}`);
    }
  } catch (error) {
    toast.error("승인 처리 실패");
  }
}

// 리밸런싱 알림 모달 컴포넌트
function RebalancingAlertModal({ alert, onClose }: Props) {
  const handleStartRebalancing = async () => {
    // 자동 리밸런싱 트리거
    const { airGapRequestId } = await triggerRebalancing(
      alert.rebalancingAmount,
      "BTC", // 또는 동적으로
      "cold_to_hot",
      `출금 ${alert.withdrawalId}를 위한 리밸런싱`
    );

    toast.success("리밸런싱 Air-gap 서명이 생성되었습니다.");
    router.push(`/admin/withdrawals/airgap?highlight=${airGapRequestId}`);
  };

  return (
    <Dialog open={alert.show} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>리밸런싱 필요</DialogTitle>
          <DialogDescription>
            Hot Wallet 잔고가 부족하여 출금을 진행할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">부족 금액</p>
            <p className="text-lg font-semibold">{alert.shortfall}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              필요 리밸런싱 금액 (안전 마진 +20%)
            </p>
            <p className="text-lg font-semibold">{alert.rebalancingAmount}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">예상 소요 시간</p>
            <p className="text-lg font-semibold">{alert.estimatedTime}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            나중에
          </Button>
          <Button
            variant="sapphire"
            onClick={handleStartRebalancing}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            지금 리밸런싱 시작
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### Phase 5.3: Cold → Hot 리밸런싱 자동 트리거

**기능 설명**:
- 리밸런싱도 Air-gap 서명 필요 (보안 정책)
- 출금과 동일한 서명 프로세스 사용
- 서명 유형: `rebalancing` (기존 `withdrawal`과 구분)

**Air-gap 서명 요청 타입 확장**:

```typescript
// /src/types/vault.ts 수정

type AirGapSigningType =
  | "withdrawal"          // 출금
  | "rebalancing"         // 리밸런싱
  | "emergency_withdrawal" // 긴급 출금
  | "maintenance";        // 유지보수

interface AirGapSigningRequest {
  id: string;
  type: AirGapSigningType; // 타입 확장
  // ... 나머지 필드

  // 🆕 리밸런싱 전용 필드
  rebalancingInfo?: {
    direction: "cold_to_hot" | "hot_to_cold";
    fromWallet: "hot" | "cold";
    toWallet: "hot" | "cold";
    reason: string; // 리밸런싱 사유
    relatedWithdrawalId?: string; // 관련 출금 ID (출금 때문에 리밸런싱한 경우)
  };
}
```

**리밸런싱 자동 트리거 흐름**:

```typescript
// /src/services/vaultApi.ts

export async function triggerRebalancing(
  amount: string,
  currency: Currency,
  direction: "cold_to_hot" | "hot_to_cold",
  reason: string,
  relatedWithdrawalId?: string
): Promise<{ airGapRequestId: string }> {
  // 1. Air-gap 서명 요청 생성
  const airGapRequest: AirGapSigningRequest = {
    id: generateId(),
    type: "rebalancing",
    status: "pending",
    priority: relatedWithdrawalId ? "urgent" : "normal", // 출금 관련이면 긴급
    requiredSignatures: 2,
    collectedSignatures: 0,
    signers: [
      { name: "Admin 1", publicKey: "...", hasSigned: false },
      { name: "Admin 2", publicKey: "...", hasSigned: false },
      { name: "Admin 3", publicKey: "...", hasSigned: false },
    ],
    transactionData: {
      currency,
      amount,
      fromAddress: direction === "cold_to_hot" ? "Cold Wallet" : "Hot Wallet",
      toAddress: direction === "cold_to_hot" ? "Hot Wallet" : "Cold Wallet",
      networkFee: "0.0001", // 예시
    },
    rebalancingInfo: {
      direction,
      fromWallet: direction === "cold_to_hot" ? "cold" : "hot",
      toWallet: direction === "cold_to_hot" ? "hot" : "cold",
      reason,
      relatedWithdrawalId,
    },
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6시간 후
  };

  // 2. LocalStorage에 저장
  await saveAirGapRequest(airGapRequest);

  // 3. 리밸런싱 이력 기록
  await recordRebalancingHistory({
    id: generateId(),
    direction,
    amount,
    currency,
    reason,
    airGapRequestId: airGapRequest.id,
    status: "pending",
    createdAt: new Date(),
  });

  return { airGapRequestId: airGapRequest.id };
}
```

---

### Phase 5.4: 출금 후 Hot/Cold 비율 재확인 및 리밸런싱 알림

**통합 지점**: `/admin/withdrawals/execution` → 출금 완료 후 자동 실행

**워크플로우 통합**:

```typescript
// /src/services/executionApi.ts 수정

export async function onWithdrawalCompleted(executionId: string) {
  // 1. 출금 실행 상태 업데이트
  await updateExecutionStatus(executionId, "completed");

  // 2. 🆕 Hot/Cold 비율 재확인
  const vaultStatus = await getVaultStatus();
  const deviation = Math.abs(vaultStatus.balanceStatus.hotRatio - 20);

  if (deviation > 5) {
    // 3. 목표 비율과 5% 이상 차이나면 알림
    const recommendation = await checkRebalancingRecommendation();

    // 4. 알림 생성
    await createNotification({
      type: "rebalancing_recommended",
      priority: recommendation.recommendation.priority === "high" ? "urgent" : "warning",
      title: "리밸런싱 권장",
      message: `출금 완료 후 Hot 비율 ${vaultStatus.balanceStatus.hotRatio}% (목표 20%)`,
      data: recommendation,
      createdAt: new Date(),
    });

    // 5. Toast 알림
    toast.info("출금 완료 후 리밸런싱이 권장됩니다. 볼트 관리 페이지를 확인하세요.");
  }

  // 6. 완료 알림 발송 (기존)
  await sendCompletionNotification(executionId);
}
```

**리밸런싱 권장 알림 UI**:

```tsx
// /src/app/admin/withdrawals/execution/page.tsx에 추가

function RebalancingRecommendationBanner({ recommendation }: Props) {
  if (!recommendation || recommendation.recommendation.action === "none") {
    return null;
  }

  const actionText =
    recommendation.recommendation.action === "cold_to_hot"
      ? "Cold → Hot 리밸런싱"
      : "Hot → Cold 리밸런싱";

  const priorityColor = {
    high: "bg-red-100 border-red-500 text-red-900",
    medium: "bg-yellow-100 border-yellow-500 text-yellow-900",
    low: "bg-blue-100 border-blue-500 text-blue-900",
  }[recommendation.recommendation.priority];

  return (
    <div className={`border-l-4 p-4 ${priorityColor} rounded-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold">리밸런싱 권장</h3>
          <p className="text-sm mt-1">{recommendation.recommendation.reason}</p>
          <p className="text-sm mt-2">
            권장 이체 금액: <span className="font-semibold">
              {recommendation.recommendation.amount} BTC
            </span>
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* 나중에 처리 */}}
          >
            나중에
          </Button>
          <Button
            variant="sapphire"
            size="sm"
            onClick={() => router.push("/admin/vault/rebalancing")}
            className="gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 5.5: 수동 리밸런싱 도구 UI

**페이지 경로**: `/admin/vault/rebalancing`

**UI 구조**:

```tsx
// /src/app/admin/vault/rebalancing/page.tsx

export default function RebalancingPage() {
  return (
    <div className="space-y-6">
      {/* 1. 현재 Hot/Cold 비율 */}
      <CurrentRatioCard />

      {/* 2. 리밸런싱 계산기 */}
      <RebalancingCalculator />

      {/* 3. 리밸런싱 이력 */}
      <RebalancingHistoryTable />
    </div>
  );
}

// 1. 현재 Hot/Cold 비율 카드
function CurrentRatioCard() {
  const { data: vaultStatus } = useVaultStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>현재 Hot/Cold 비율</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Hot Wallet */}
          <div>
            <p className="text-sm text-muted-foreground">Hot Wallet</p>
            <p className="text-2xl font-bold">
              {vaultStatus?.balanceStatus.hotRatio}%
            </p>
            <p className="text-sm">목표: 20%</p>
            <Progress
              value={vaultStatus?.balanceStatus.hotRatio}
              className="mt-2"
            />
          </div>

          {/* Cold Wallet */}
          <div>
            <p className="text-sm text-muted-foreground">Cold Wallet</p>
            <p className="text-2xl font-bold">
              {vaultStatus?.balanceStatus.coldRatio}%
            </p>
            <p className="text-sm">목표: 80%</p>
            <Progress
              value={vaultStatus?.balanceStatus.coldRatio}
              className="mt-2"
            />
          </div>
        </div>

        {/* 편차 경고 */}
        {vaultStatus?.balanceStatus.deviation > 5 && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-500 rounded-lg">
            <p className="text-sm text-yellow-900">
              목표 비율과 {vaultStatus.balanceStatus.deviation}% 차이납니다.
              리밸런싱을 권장합니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 2. 리밸런싱 계산기
function RebalancingCalculator() {
  const [direction, setDirection] = useState<"cold_to_hot" | "hot_to_cold">("cold_to_hot");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleStartRebalancing = async () => {
    const { airGapRequestId } = await triggerRebalancing(
      amount,
      "BTC",
      direction,
      reason
    );

    toast.success("리밸런싱 Air-gap 서명이 생성되었습니다.");
    router.push(`/admin/withdrawals/airgap?highlight=${airGapRequestId}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>리밸런싱 실행</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 방향 선택 */}
          <div>
            <Label>리밸런싱 방향</Label>
            <RadioGroup value={direction} onValueChange={setDirection}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cold_to_hot" id="cold_to_hot" />
                <Label htmlFor="cold_to_hot">Cold → Hot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hot_to_cold" id="hot_to_cold" />
                <Label htmlFor="hot_to_cold">Hot → Cold</Label>
              </div>
            </RadioGroup>
          </div>

          {/* 금액 입력 */}
          <div>
            <Label>이체 금액 (BTC)</Label>
            <Input
              type="number"
              step="0.00000001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00000000"
            />
          </div>

          {/* 사유 입력 */}
          <div>
            <Label>리밸런싱 사유</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="리밸런싱 사유를 입력하세요"
            />
          </div>

          {/* 실행 버튼 */}
          <Button
            variant="sapphire"
            onClick={handleStartRebalancing}
            disabled={!amount || !reason}
            className="w-full gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            리밸런싱 시작 (Air-gap 서명 생성)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📊 구현 우선순위 및 일정

### 독립 프로젝트 구현 계획

**프로젝트명**: 출금 관리2 (Withdrawal Manager v2)
**베이스 라우트**: `/admin/withdrawal-v2/*`
**기존 시스템과의 관계**: 완전히 독립적, 병렬 운영

| 우선순위 | 구성 요소 | 예상 소요시간 | 의존성 |
|---------|---------|-------------|--------|
| **P0** | 1. 타입 시스템 구축 (`/src/types/withdrawalV2.ts`) | 0.5일 | - |
| **P0** | 2. API 서비스 레이어 (`/src/services/withdrawalV2Api.ts`) | 1일 | 타입 완료 |
| **P0** | 3. 통합 대시보드 (`/dashboard`) | 2일 | API 완료 |
| **P1** | 4. 출금 요청 관리 (`/requests`) | 1.5일 | 대시보드 완료 |
| **P1** | 5. 잔고 확인 & 리밸런싱 (`/vault-check`) | 2일 | API 완료 |
| **P1** | 6. 통합 서명 센터 (`/signing`) | 1.5일 | 출금 요청 완료 |
| **P2** | 7. 실행 & 사후 관리 (`/execution`) | 1.5일 | 서명 센터 완료 |
| **P2** | 8. 사이드바 메뉴 추가 (AdminSidebar) | 0.5일 | - |
| **P3** | 9. 통합 테스트 및 버그 수정 | 1일 | 전체 완료 |

**총 예상 소요시간**: 11.5일 (약 2.3주)

**구현 순서**:
1. **Week 1 (Day 1-5)**: P0 완료 (타입 + API + 대시보드)
2. **Week 2 (Day 6-10)**: P1 완료 (요청 관리 + 잔고 체크 + 서명)
3. **Week 3 (Day 11-12)**: P2-P3 완료 (실행 관리 + 메뉴 + 테스트)

---

## 🧪 테스트 시나리오

### 시나리오 1: Hot 잔고 충분한 경우

```
1. 출금 요청: 1 BTC
2. Hot 잔고: 5 BTC (충분)
3. AML 승인 → 즉시 Air-gap 서명으로 이동
4. 출금 완료 후 비율 체크
   - Hot 18% / Cold 82% (허용 범위 내)
   - 알림 없음
```

### 시나리오 2: Hot 잔고 부족, 리밸런싱 필요 (Bitcoin 블록체인)

```
1. 출금 요청: 8 BTC
   - 자산: BTC
   - 블록체인: BITCOIN (자동 판별)
   - 네트워크: mainnet

2. Bitcoin 블록체인 Hot 잔고: 1 BTC (부족)
3. AML 승인 → Bitcoin Hot 잔고 체크 → 부족 감지
4. 리밸런싱 알림 모달 표시
   - 블록체인: Bitcoin
   - 네트워크: Mainnet
   - 부족 금액: 7 BTC
   - 안전 마진 포함: 8.4 BTC
   - 이체 자산: BTC
5. [지금 리밸런싱 시작] 클릭
6. Air-gap 서명 요청 생성 (Bitcoin Cold → Hot 리밸런싱, Mainnet)
7. 리밸런싱 완료 후 다시 출금 프로세스 진행
8. 출금 완료 후 Bitcoin 블록체인 비율 체크
   - Bitcoin Hot 15% / Cold 85% (편차 -5%, 경계)
   - Bitcoin 리밸런싱 권장 알림 표시
   - Ethereum, Solana 블록체인은 영향 없음
```

### 시나리오 3: 다중 블록체인 출금 및 리밸런싱

```
1. BTC 출금 요청: 10 BTC
   - 자산: BTC
   - 블록체인: BITCOIN (자동 판별)
   - 네트워크: mainnet
   - Bitcoin Hot: 50 BTC (충분)
   - 출금 완료 후: Hot 40 BTC / Cold 160 BTC
   - Bitcoin Hot 16.67% / Cold 83.33% (편차 -3.33%, 정상)

2. ETH 출금 요청: 200 ETH
   - 자산: ETH
   - 블록체인: ETHEREUM (자동 판별)
   - 네트워크: mainnet
   - Ethereum Hot: 100 ETH (부족)
   - 리밸런싱 필요 알림
   - Ethereum Cold → Hot 리밸런싱 (120 ETH, Mainnet)
   - 리밸런싱 완료 후 출금 진행
   - Ethereum Hot 18% / Cold 82% (정상)

3. USDT 출금 요청: 50,000 USDT (ERC20)
   - 자산: USDT
   - 블록체인: ETHEREUM (자동 판별, ERC20는 Ethereum)
   - 네트워크: mainnet
   - Ethereum 블록체인 Hot 확인 (ETH & ERC20 통합)
   - USDT Hot: 100,000 USDT (충분)
   - 출금 완료 (ETH 가스비 차감)
   - Ethereum 비율 재확인: Hot 17% / Cold 83% (정상)

4. SOL 출금 요청: 1,000 SOL
   - 자산: SOL
   - 블록체인: SOLANA (자동 판별)
   - 네트워크: mainnet
   - Solana Hot: 500 SOL (부족)
   - Solana Cold → Hot 리밸런싱 (600 SOL, Mainnet)
   - 리밸런싱 완료 후 출금 진행
   - Solana Hot 14% / Cold 86% (편차 -6%, 경고)
   - Solana 리밸런싱 권장 알림 표시

요약:
- Bitcoin 블록체인: 정상
- Ethereum 블록체인: 정상
- Solana 블록체인: 리밸런싱 권장 (우선순위: Medium)
```

---

## 📝 완료 기준

### 출금 관리2 (Withdrawal Manager v2) 완료 기준:

**기본 인프라**:
- [ ] `/src/types/withdrawalV2.ts` 타입 시스템 완성
- [ ] `/src/services/withdrawalV2Api.ts` API 서비스 레이어 완성
- [ ] Mock 데이터 생성 및 초기화 시스템

**페이지별 완료 기준**:
- [ ] 통합 대시보드 동작 (`/admin/withdrawal-v2/dashboard`)
  - [ ] 출금 통계 카드 표시
  - [ ] Hot/Cold 잔고 실시간 모니터링
  - [ ] 긴급 알림 배너 동작

- [ ] 출금 요청 관리 동작 (`/admin/withdrawal-v2/requests`)
  - [ ] 전체 출금 요청 목록 표시
  - [ ] 상태별/우선순위별 필터링
  - [ ] 통합 검색 기능

- [ ] 잔고 확인 및 리밸런싱 동작 (`/admin/withdrawal-v2/vault-check`)
  - [ ] Hot 잔고 자동 체크 시스템
  - [ ] 리밸런싱 필요 출금 목록
  - [ ] 리밸런싱 자동 트리거
  - [ ] 예상 비율 시뮬레이터

- [ ] 통합 서명 센터 동작 (`/admin/withdrawal-v2/signing`)
  - [ ] 출금 + 리밸런싱 서명 통합 관리
  - [ ] QR 코드 생성/스캔
  - [ ] 긴급 서명 우선 처리

- [ ] 실행 및 사후 관리 동작 (`/admin/withdrawal-v2/execution`)
  - [ ] 출금 실행 모니터링
  - [ ] 출금 후 Hot/Cold 비율 자동 체크
  - [ ] 리밸런싱 권장 알림 자동 생성

**통합 테스트**:
- [ ] 전체 출금 워크플로우 E2E 테스트
- [ ] Hot 잔고 충분/부족 시나리오 테스트
- [ ] 리밸런싱 자동 트리거 테스트
- [ ] 출금 후 비율 체크 테스트

**UI/UX**:
- [ ] 사이드바 메뉴에 "출금 관리2" 추가
- [ ] 기존 "출금 관리"와 시각적으로 구분
- [ ] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [ ] 다크 모드 지원

---

## 🚀 시작하기

### Step 1: 프로젝트 초기화

```bash
# 1. 타입 정의 파일 생성
touch src/types/withdrawalV2.ts

# 2. API 서비스 레이어 생성
touch src/services/withdrawalV2Api.ts

# 3. 페이지 디렉토리 생성
mkdir -p src/app/admin/withdrawal-v2/{dashboard,requests,vault-check,signing,execution}

# 4. 각 페이지 파일 생성
touch src/app/admin/withdrawal-v2/dashboard/page.tsx
touch src/app/admin/withdrawal-v2/requests/page.tsx
touch src/app/admin/withdrawal-v2/vault-check/page.tsx
touch src/app/admin/withdrawal-v2/signing/page.tsx
touch src/app/admin/withdrawal-v2/execution/page.tsx
```

### Step 2: 사이드바 메뉴 추가

```tsx
// src/components/admin/layout/AdminSidebar.tsx 수정

const menuItems = [
  // ... 기존 메뉴들

  {
    label: "출금 관리 (기존)",
    icon: Send,
    badge: withdrawalBadge,
    subItems: [
      { label: "대기열", href: "/admin/withdrawals/queue" },
      { label: "AML 검증", href: "/admin/withdrawals/aml" },
      { label: "Air-gap 서명", href: "/admin/withdrawals/airgap" },
      { label: "출금 실행", href: "/admin/withdrawals/execution" },
    ],
  },

  // 🆕 새로운 출금 관리2
  {
    label: "출금 관리2 (신규)",
    icon: Zap, // 다른 아이콘 사용
    badge: withdrawalV2Badge,
    highlight: true, // 신규 표시
    subItems: [
      { label: "통합 대시보드", href: "/admin/withdrawal-v2/dashboard" },
      { label: "출금 요청", href: "/admin/withdrawal-v2/requests" },
      { label: "잔고 & 리밸런싱", href: "/admin/withdrawal-v2/vault-check" },
      { label: "통합 서명", href: "/admin/withdrawal-v2/signing" },
      { label: "실행 관리", href: "/admin/withdrawal-v2/execution" },
    ],
  },
];
```

### Step 3: 개발 서버 실행

```bash
npm run dev
```

**접속 URL**: `http://localhost:3010/admin/withdrawal-v2/dashboard`

---

## 📚 참고 사항

### 기존 시스템과의 병렬 운영

**기존 출금 관리** (`/admin/withdrawals/*`):
- ✅ Phase 4에서 구현 완료
- ✅ 그대로 유지, 변경 없음
- ✅ 기존 관리자는 계속 사용 가능

**새 출금 관리2** (`/admin/withdrawal-v2/*`):
- 🆕 완전히 새로운 시스템
- 🆕 Hot/Cold 리밸런싱 완전 통합
- 🆕 새로운 UI/UX 디자인
- 🆕 기존 시스템과 독립적으로 운영

### 데이터 공유 여부

**Option A: 완전히 독립** (추천)
- 각자 별도의 Mock 데이터 사용
- 테스트 및 비교가 용이
- 기존 시스템에 영향 없음

**Option B: 데이터 공유**
- 동일한 출금 데이터 조회
- 하나의 시스템으로 통합 예정이라면 선택

### 향후 계획

1. **단기 (1-2주)**: 출금 관리2 기본 구현 완료
2. **중기 (1개월)**: 실제 운영 테스트 및 피드백 수집
3. **장기 (2-3개월)**:
   - 두 시스템 성능 비교
   - 사용자 피드백 기반 개선
   - 최종적으로 하나의 시스템으로 통합 또는 병렬 유지 결정

---

_작성일: 2025-10-15_
_마지막 업데이트: 2025-10-15_
_프로젝트 유형: 독립 신규 프로젝트_
_예상 완료: 11.5일 (약 2.3주)_
