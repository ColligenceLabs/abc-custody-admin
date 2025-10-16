# 출금 관리 메뉴 구성 계획서

## 📋 문서 개요

- **작성일**: 2025-10-15
- **목적**: Hot/Cold 볼트 리밸런싱을 통합한 출금 관리 메뉴 구조 설계
- **관련 Phase**: Phase 4 (완료) + Phase 5 (진행 예정)
- **핵심 비즈니스 로직**: Hot 20% / Cold 80% 비율 유지, 출금 전후 리밸런싱

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

---

## 📂 출금 관리 메뉴 구조

### Option A: 프로세스 중심 구조 (추천 ⭐)

비즈니스 플로우를 그대로 반영한 구조로, 단계별 명확성과 확장성이 우수합니다.

```
📂 출금 관리 (/admin/withdrawals)
├── 📊 대시보드              /dashboard 🆕
│   ├── 출금 통계 (대기/처리중/완료)
│   ├── Hot/Cold 잔고 현황 (실시간)
│   ├── 리밸런싱 필요 알림
│   └── 최근 출금 내역
│
├── 📋 1. 출금 요청 대기열    /queue ✅ (Phase 4 완료)
│   ├── 우선순위 자동 계산
│   ├── 수신 주소 검증 (회원사 등록 주소)
│   ├── 일일 한도 체크
│   └── 회원사별/주소별 필터링
│
├── 🛡️ 2. AML 검증          /aml ✅ (Phase 4 완료)
│   ├── 자동 스크리닝 (블랙리스트, 제재 목록, PEP)
│   ├── 리스크 점수 계산 (0-100)
│   ├── 수동 검토 (리스크 60+ 또는 1억원+)
│   └── 승인/거부/플래그 처리
│
├── 🏦 3. 잔고 확인 및 리밸런싱 /vault-check 🆕 (Phase 5)
│   ├── Hot Wallet 잔고 실시간 조회
│   ├── 출금 가능 여부 자동 판단
│   ├── 리밸런싱 필요 시 자동 알림
│   ├── Cold → Hot 리밸런싱 자동 트리거
│   ├── 예상 비율 시뮬레이션 (출금 전후)
│   └── 리밸런싱 이력 조회
│
├── 🔐 4. Air-gap 서명       /airgap ✅ (Phase 4 완료)
│   ├── QR 코드 생성 (출금 + 리밸런싱)
│   ├── 오프라인 서명 스캔
│   ├── 다중 서명 수집 (2-of-3, 3-of-5)
│   ├── 서명 진행률 실시간 표시
│   └── 만료 관리 (6시간 제한)
│
└── 📡 5. 출금 실행          /execution ✅ (Phase 4 완료)
    ├── 트랜잭션 브로드캐스트
    ├── 컨펌 추적 (10초마다 폴링)
    ├── 실패 시 재시도 (RBF 지원)
    ├── 출금 후 Hot/Cold 비율 재확인 🆕
    └── 리밸런싱 권장 알림 🆕
```

**선택 이유**:
- ✅ 비즈니스 플로우와 정확히 일치
- ✅ 단계별 역할이 명확하게 구분됨
- ✅ 신규 관리자 온보딩 시 이해하기 쉬움
- ✅ 향후 단계 추가 시 확장 용이

### Option B: 상태 중심 구조

관리자의 작업 효율성에 초점을 맞춘 구조입니다.

```
📂 출금 관리 (/admin/withdrawals)
├── 📊 통합 대시보드          /dashboard 🆕
│   └── 모든 상태의 출금 요청 한눈에 보기
│
├── ⏳ 대기 중               /pending 🆕
│   ├── 출금 요청 대기 (queue)
│   └── AML 검토 대기 (aml)
│
├── 🏦 잔고 부족 (리밸런싱)   /vault-check 🆕
│   └── Hot 잔고 부족으로 리밸런싱 필요한 출금
│
├── 🔐 서명 대기             /signing
│   ├── 출금 서명 대기
│   └── 리밸런싱 서명 대기
│
└── 📡 실행 중 & 완료        /execution
    ├── 브로드캐스트 중
    ├── 컨펌 대기 중
    └── 완료된 출금
```

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

## 🆕 Phase 5 구현 상세

### Phase 5.1: Hot/Cold 잔고 모니터링 대시보드

**페이지 경로**: `/admin/withdrawals/vault-check`

**타입 정의**:

```typescript
// /src/types/vault.ts에 추가

/**
 * 출금 전 볼트 체크 결과
 */
interface VaultCheckBeforeWithdrawal {
  withdrawalId: string;
  requestedAmount: string;
  requestedCurrency: Currency;
  checkedAt: Date;

  // Hot Wallet 상태
  hotWallet: {
    currentBalance: string; // 현재 총 잔액
    reservedAmount: string; // 예약된 금액 (다른 출금 대기 중)
    availableBalance: string; // 출금 가능 잔액 = 현재 - 예약
    isEnough: boolean; // 출금 가능 여부
    shortfall?: string; // 부족 금액 (부족한 경우만)
  };

  // Cold Wallet 상태
  coldWallet: {
    currentBalance: string;
    availableBalance: string; // 리밸런싱 가능 잔액
  };

  // 리밸런싱 정보
  rebalancing: {
    required: boolean; // 리밸런싱 필요 여부
    amount: string; // Cold → Hot 이체 필요 금액
    amountWithMargin: string; // 안전 마진 포함 (+20%)
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
 * 리밸런싱 권장 알림
 */
interface RebalancingRecommendation {
  recommendationId: string;
  triggeredBy: "withdrawal" | "manual_check" | "scheduled";
  triggeredAt: Date;

  currentStatus: {
    hotBalance: string;
    coldBalance: string;
    hotRatio: number; // 현재 Hot 비율
    coldRatio: number; // 현재 Cold 비율
    totalValue: string; // 전체 자산 가치
  };

  targetStatus: {
    hotRatio: number; // 목표 Hot 비율 (20%)
    coldRatio: number; // 목표 Cold 비율 (80%)
  };

  recommendation: {
    action: "cold_to_hot" | "hot_to_cold" | "none";
    amount: string; // 이체 권장 금액
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

### Phase 5.2: 출금 전 Hot 잔고 자동 체크 시스템

**통합 지점**: `/admin/withdrawals/queue` → AML 승인 후 자동 실행

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

| 우선순위 | Phase | Task | 예상 소요시간 | 의존성 |
|---------|-------|------|-------------|--------|
| **P0** | 5.1 | Hot/Cold 잔고 모니터링 대시보드 | 2일 | - |
| **P1** | 5.2 | 출금 전 Hot 잔고 자동 체크 | 1일 | 5.1 완료 |
| **P1** | 5.3 | Cold → Hot 리밸런싱 자동 트리거 | 1.5일 | 5.2 완료, Air-gap 통합 |
| **P2** | 5.4 | 출금 후 비율 재확인 및 알림 | 0.5일 | 5.1 완료 |
| **P2** | 5.5 | 수동 리밸런싱 도구 UI | 1일 | 5.1, 5.3 완료 |

**총 예상 소요시간**: 6일 (약 1.2주)

**구현 순서**:
1. Day 1-2: Phase 5.1 (모니터링 대시보드)
2. Day 3: Phase 5.2 (출금 전 체크)
3. Day 4-5: Phase 5.3 (자동 트리거)
4. Day 5: Phase 5.4 (출금 후 체크)
5. Day 6: Phase 5.5 (수동 도구 UI)

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

### 시나리오 2: Hot 잔고 부족, 리밸런싱 필요

```
1. 출금 요청: 8 BTC
2. Hot 잔고: 1 BTC (부족)
3. AML 승인 → Hot 잔고 체크 → 부족 감지
4. 리밸런싱 알림 모달 표시
   - 부족 금액: 7 BTC
   - 안전 마진 포함: 8.4 BTC
5. [지금 리밸런싱 시작] 클릭
6. Air-gap 서명 요청 생성 (리밸런싱)
7. 리밸런싱 완료 후 다시 출금 프로세스 진행
8. 출금 완료 후 비율 체크
   - Hot 15% / Cold 85% (편차 -5%, 경계)
   - 리밸런싱 권장 알림 표시
```

### 시나리오 3: 출금 후 리밸런싱 권장

```
1. 출금 요청: 10 BTC
2. Hot 잔고: 50 BTC (충분)
3. 출금 완료 후
   - Hot 40 BTC / Cold 160 BTC
   - Hot 16.67% / Cold 83.33% (편차 -3.33%, 정상)
4. 추가 출금 요청: 30 BTC
5. 출금 완료 후
   - Hot 10 BTC / Cold 160 BTC
   - Hot 5.88% / Cold 94.12% (편차 -14.12%, 심각)
6. 리밸런싱 권장 알림
   - Cold → Hot 24 BTC 이체 권장
   - 우선순위: High
```

---

## 📝 완료 기준

### Phase 5 전체 완료 기준:

- [ ] Hot/Cold 잔고 모니터링 대시보드 동작 (`/admin/withdrawals/vault-check`)
- [ ] 출금 전 Hot 잔고 자동 체크 시스템 동작
- [ ] 리밸런싱 필요 시 자동 알림 모달 표시
- [ ] Cold → Hot 리밸런싱 자동 트리거 동작
- [ ] Air-gap 서명과 리밸런싱 통합 동작
- [ ] 출금 후 Hot/Cold 비율 재확인 자동 실행
- [ ] 편차 5% 초과 시 리밸런싱 권장 알림
- [ ] 수동 리밸런싱 도구 UI 동작 (`/admin/vault/rebalancing`)
- [ ] 리밸런싱 이력 조회 기능
- [ ] 모든 테스트 시나리오 통과

---

## 🚀 다음 단계

Phase 5 완료 후:

1. **Phase 6: 컴플라이언스 및 보고서** (2주)
   - 규제 보고서 생성
   - Travel Rule 설정 관리
   - AML 정책 관리
   - 의심 주소 관리
   - STR 보고 시스템
   - 운영 보고서 자동화
   - 실시간 알림 시스템 (WebSocket)

2. **최종 통합 테스트**
   - 전체 플로우 E2E 테스트
   - 성능 최적화
   - 보안 감사
   - 사용자 매뉴얼 작성

---

_작성일: 2025-10-15_
_마지막 업데이트: 2025-10-15_
_예상 완료: Phase 5 (1.2주) + Phase 6 (2주) = 총 3.2주_
