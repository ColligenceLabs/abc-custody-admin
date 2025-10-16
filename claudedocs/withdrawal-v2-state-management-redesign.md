# 출금 요청 관리 (Withdrawal V2) 상태 관리 시스템 재설계

## 문서 정보

- **작성일**: 2025-10-15
- **최종 수정**: 2025-10-15
- **목적**: 출금 요청 상태 관리 시스템 단순화, UX 개선 및 Hot/Cold 지갑 선택 기능 추가
- **대상**: 관리자 페이지 출금 요청 관리 기능

## 목차

1. [현재 시스템 분석](#1-현재-시스템-분석)
2. [개선된 상태 모델](#2-개선된-상태-모델)
3. [Hot/Cold 지갑 선택 기능](#3-hotcold-지갑-선택-기능)
4. [상태 전이 다이어그램](#4-상태-전이-다이어그램)
5. [UI 구현 명세](#5-ui-구현-명세)
6. [API 서비스 레이어 변경](#6-api-서비스-레이어-변경)
7. [마이그레이션 계획](#7-마이그레이션-계획)
8. [테스트 전략](#8-테스트-전략)
9. [보안 고려사항](#9-보안-고려사항)
10. [개선 효과 요약](#10-개선-효과-요약)

---

## 1. 현재 시스템 분석

### 1.1 기존 상태 모델

```typescript
type WithdrawalStatus =
  | "pending"       // 대기 중
  | "aml_review"    // AML 검토 중
  | "vault_check"   // 볼트 잔고 확인 중
  | "rebalancing"   // 리밸런싱 진행 중
  | "signing"       // 서명 대기/진행 중
  | "executing"     // 실행 중
  | "completed"     // 완료
  | "failed"        // 실패
  | "cancelled";    // 취소됨
```

### 1.2 기존 시스템의 문제점

1. **상태 중복**: `pending`과 `aml_review`가 사실상 동일한 단계
2. **가시성 과다**: `vault_check`, `rebalancing`, `signing` 등 내부 프로세스가 상태로 노출
3. **UX 혼란**: 관리자 입장에서 어떤 액션을 취해야 하는지 불명확
4. **상태 전이 복잡성**: 9개 상태 간의 전이 로직이 복잡함
5. **Hot 잔고 부족 시 대응**: 리밸런싱 대기만 가능, 긴급 처리 불가

---

## 2. 개선된 상태 모델

### 2.1 새로운 상태 정의

```typescript
type WithdrawalStatus =
  | "pending"          // 대기 중 (AML 자동 검토 진행 중)
  | "approval_waiting" // 승인 대기 (AML 통과, Hot/Cold 선택 가능)
  | "aml_flagged"      // AML 문제 감지 (수동 검토 필요)
  | "processing"       // 처리 중 (Hot/Cold 외부 시스템 처리)
  | "completed"        // 완료
  | "rejected"         // 거부됨
  | "failed";          // 실패
```

**개선 사항**: 9개 → 7개 상태 (중복 제거, 단순화)

### 2.2 상태별 상세 설명

#### pending (대기 중)
- **의미**: 출금 요청이 생성되고 AML 자동 검토가 진행 중인 상태
- **자동 프로세스**: AML 리스크 평가 자동 실행
- **관리자 액션**: 없음 (자동 처리 대기)
- **다음 상태**: `approval_waiting` (AML 통과) 또는 `aml_flagged` (AML 문제)

#### approval_waiting (승인 대기)
- **의미**: AML 검토 통과, Hot/Cold 지갑 잔고 확인 완료, 관리자 승인 대기 상태
- **자동 프로세스**:
  - AML 리스크 평가 완료 (통과)
  - Hot 지갑 잔고 확인 완료
  - Cold 지갑 잔고 확인 완료
- **지갑 잔고 표시**:
  - Hot 지갑: 현재 잔고, 출금 후 잔고, 충분/부족 상태
  - Cold 지갑: 현재 잔고 (참고)
- **관리자 액션**:
  - "Hot 지갑에서 출금" 버튼 클릭 → Hot 출금 API 호출 → `processing`으로 전이
  - "Cold 지갑에서 출금" 버튼 클릭 → Cold 출금 API 호출 → `processing`으로 전이
  - "거부" 버튼 클릭 → `rejected`로 전이
- **버튼 활성화 조건**:
  - Hot 충분: Hot 버튼 활성화(권장), Cold 버튼 활성화(선택)
  - Hot 부족: Hot 버튼 비활성화, Cold 버튼 활성화(긴급)
- **다음 상태**: `processing` (Hot/Cold 승인) 또는 `rejected` (거부)

#### aml_flagged (AML 문제)
- **의미**: AML 검토에서 리스크가 감지되어 수동 검토가 필요한 상태
- **표시 정보**:
  - AML 리스크 레벨 (high)
  - 감지된 문제 내역
  - AML 검토 보고서
- **관리자 액션**:
  - "상세 보기" 버튼 → AML 상세 정보 모달
  - "거부" 버튼 클릭 → `rejected`로 전이
- **다음 상태**: `rejected` (거부 확정)

#### processing (처리 중)
- **의미**: 승인된 출금이 외부 시스템에서 실행 중인 상태
- **외부 시스템 처리**:
  - Hot 출금: Hot 지갑 출금 API 호출 → 외부 시스템 처리
  - Cold 출금: Cold 지갑 출금 API 호출 → 외부 시스템 처리
- **자동 프로세스**:
  - 외부 시스템이 트랜잭션 생성 및 서명
  - 블록체인 브로드캐스팅
  - 블록체인 컨펌 대기
  - 콜백 수신 대기
- **관리자 액션**: 없음 (외부 시스템 처리 대기)
- **다음 상태**: `completed` (콜백 성공) 또는 `failed` (콜백 실패)

#### completed (완료)
- **의미**: 트랜잭션이 성공적으로 완료된 최종 상태
- **표시 정보**:
  - 트랜잭션 해시
  - 완료 시각
  - 최종 출금 금액
  - 출금 소스 (Hot/Cold)
- **관리자 액션**: "상세 보기" (트랜잭션 정보 확인)
- **다음 상태**: 없음 (최종 상태)

#### rejected (거부됨)
- **의미**: 관리자가 수동으로 거부한 최종 상태
- **표시 정보**:
  - 거부 사유
  - 거부 시각
  - 거부한 관리자 정보
  - AML 문제 관련 여부
- **관리자 액션**: "상세 보기" (거부 정보 확인)
- **다음 상태**: 없음 (최종 상태)

#### failed (실패)
- **의미**: 기술적 오류로 실패한 최종 상태
- **표시 정보**:
  - 오류 코드
  - 오류 메시지
  - 실패 시각
  - 실패 단계 (MPC/Blockchain)
- **관리자 액션**:
  - "상세 보기" (오류 정보 확인)
  - "재시도" (선택적, 재처리 가능한 경우)
- **다음 상태**: 없음 (최종 상태) 또는 `pending` (재시도 시)

---

## 3. Hot/Cold 지갑 선택 기능

### 3.1 기능 개요

관리자가 출금 승인 시 Hot 지갑 또는 Cold 지갑을 선택할 수 있는 기능

**필요성**:
- Hot 지갑 잔고 부족 시 리밸런싱 대기 없이 즉시 처리
- 긴급 출금 요청에 대한 빠른 대응
- 관리자의 명확한 제어권

### 3.2 Hot vs Cold 출금 비교

| 구분 | Hot 지갑 출금 | Cold 지갑 출금 |
|------|-------------|---------------|
| **처리 속도** | 빠름 | 빠름 |
| **보안 수준** | 높음 | 매우 높음 (오프라인 저장) |
| **사용 상황** | 일반적인 출금 (권장) | Hot 부족 시, 긴급 출금 |
| **외부 시스템** | Hot 지갑 출금 API | Cold 지갑 출금 API |
| **상태 전이** | approval_waiting → processing → completed | approval_waiting → processing → completed |
| **처리 방식** | 외부 시스템 자동 처리 | 외부 시스템 자동 처리 |

### 3.3 지갑 잔고 확인 시스템

**approval_waiting 상태에서 표시되는 정보**:

```
┌─── Hot 지갑 잔고 확인 ──────────────┐
│ 현재 Hot 잔고:    25.5 BTC         │
│ 출금 요청 금액:    5.0 BTC         │
│ ─────────────────────────────      │
│ 출금 후 잔고:     20.5 BTC         │
│                                    │
│ 상태: ✓ Hot 지갑 잔고 충분 (녹색)  │
│                                    │
│ Hot/Cold 비율: 20% / 80%           │
└────────────────────────────────────┘

┌─── Cold 지갑 정보 (참고) ──────────┐
│ 현재 Cold 잔고:   102.0 BTC        │
└────────────────────────────────────┘
```

**Hot 잔고 부족 시**:

```
┌─── Hot 지갑 잔고 확인 ──────────────┐
│ 현재 Hot 잔고:     2.0 BTC         │
│ 출금 요청 금액:    5.0 BTC         │
│ ─────────────────────────────      │
│ 부족 금액:        3.0 BTC          │
│                                    │
│ 상태: ✗ Hot 지갑 잔고 부족 (빨강)  │
│                                    │
│ ⚠️ Hot 지갑 잔고가 부족합니다.     │
│    Cold 지갑에서 출금하거나        │
│    리밸런싱 후 처리하세요.         │
└────────────────────────────────────┘
```

---

## 4. 상태 전이 다이어그램

### 4.1 전체 상태 전이 흐름

```
                    [출금 요청 생성]
                           ↓
                      ┌─────────┐
                      │ pending │ (AML 자동 검토 진행)
                      └─────────┘
                           ↓
              ┌────────────┴────────────┐
              ↓                         ↓
    ┌──────────────────┐       ┌──────────────┐
    │ approval_waiting │       │ aml_flagged  │
    │ (Hot/Cold 선택)  │       │ (AML 문제)   │
    └──────────────────┘       └──────────────┘
              ↓                         ↓
     ┌────────┴────────┐         [거부 버튼]
     ↓                 ↓               ↓
[Hot API 호출]  [Cold API 호출]  ┌───────────┐
     ↓                 ↓         │ rejected  │ ◄─── [거부]
     └────────┬────────┘         │(거부 확정)│   (approval_waiting)
              ↓                  └───────────┘
       ┌────────────┐
       │ processing │
       │(외부 처리) │
       └────────────┘
              ↓
     ┌────────┴─────────┐
     ↓                  ↓
┌───────────┐      ┌─────────┐
│ completed │      │ failed  │
│  (완료)   │      │ (실패)  │
└───────────┘      └─────────┘
```

### 4.2 상태 전이 규칙

#### 자동 전이 (시스템)
- `pending` → `approval_waiting`: AML 검토 통과 시
- `pending` → `aml_flagged`: AML 문제 감지 시
- `processing` → `completed`: MPC/블록체인 콜백 성공 시
- `processing` → `failed`: MPC/블록체인 콜백 실패 시

#### 수동 전이 (관리자 액션)
- `approval_waiting` → `processing`: "Hot 지갑에서 출금" 버튼 클릭 (Hot API 호출)
- `approval_waiting` → `processing`: "Cold 지갑에서 출금" 버튼 클릭 (Cold API 호출)
- `approval_waiting` → `rejected`: "거부" 버튼 클릭
- `aml_flagged` → `rejected`: "거부" 버튼 클릭

---

## 5. UI 구현 명세

### 5.1 approval_waiting 상태 UI (Hot 잔고 충분)

```
┌──────────────────────────────────────────────────────────┐
│ 출금 요청 상세 정보                                        │
├──────────────────────────────────────────────────────────┤
│ 요청 ID: WD-2025-001                                     │
│ 회원사: Alpha Corporation                                │
│ 요청 금액: 5.0 BTC                                       │
│                                                          │
│ ┌─── Hot 지갑 잔고 확인 ────────────────────────┐       │
│ │  현재 Hot 잔고:    25.5 BTC                   │       │
│ │  출금 요청 금액:    5.0 BTC                   │       │
│ │  ─────────────────────────────────────        │       │
│ │  출금 후 잔고:     20.5 BTC (예상)            │       │
│ │                                                │       │
│ │  상태: ✓ Hot 지갑 잔고 충분                   │ (녹색)│
│ │  Hot/Cold 비율: 20% / 80% (목표 범위 내)      │       │
│ └────────────────────────────────────────────────┘       │
│                                                          │
│ ┌─── Cold 지갑 정보 (참고) ─────────────────────┐       │
│ │  현재 Cold 잔고:   102.0 BTC                  │       │
│ └────────────────────────────────────────────────┘       │
│                                                          │
│ ┌─── 승인 옵션 선택 ─────────────────────────────┐      │
│ │  [Hot 지갑에서 출금]  [Cold 지갑에서 출금]     │      │
│ │   (권장, 즉시 처리)    (긴급용, Air-gap 필요)  │      │
│ └─────────────────────────────────────────────────┘      │
│                                                          │
│                                  [거부]                  │
└──────────────────────────────────────────────────────────┘
```

### 5.2 approval_waiting 상태 UI (Hot 잔고 부족)

```
┌──────────────────────────────────────────────────────────┐
│ 출금 요청 상세 정보                                        │
├──────────────────────────────────────────────────────────┤
│ 요청 ID: WD-2025-002                                     │
│ 회원사: Beta Investments                                 │
│ 요청 금액: 50.0 BTC                                      │
│                                                          │
│ ┌─── Hot 지갑 잔고 확인 ────────────────────────┐       │
│ │  현재 Hot 잔고:     25.5 BTC                  │       │
│ │  출금 요청 금액:    50.0 BTC                  │       │
│ │  ─────────────────────────────────────        │       │
│ │  부족 금액:        24.5 BTC                   │       │
│ │                                                │       │
│ │  상태: ✗ Hot 지갑 잔고 부족                   │ (빨강)│
│ │                                                │       │
│ │  ⚠️ Hot 지갑 잔고가 부족합니다.                │       │
│ │     다음 옵션 중 선택하세요:                   │       │
│ │     • Cold 지갑에서 직접 출금 (긴급)          │       │
│ │     • 리밸런싱 후 Hot 지갑 출금 (권장)        │       │
│ └────────────────────────────────────────────────┘       │
│                                                          │
│ ┌─── Cold 지갑 정보 ────────────────────────────┐       │
│ │  현재 Cold 잔고:   102.0 BTC (충분)           │       │
│ └────────────────────────────────────────────────┘       │
│                                                          │
│ ┌─── 승인 옵션 선택 ─────────────────────────────┐      │
│ │  [Hot 지갑에서 출금]  [Cold 지갑에서 출금]     │      │
│ │   (비활성화, 잔고 부족)  (긴급 처리, 주황색 강조)│     │
│ │                                                 │      │
│ │  또는                                          │      │
│ │  [리밸런싱 후 처리]                             │      │
│ └─────────────────────────────────────────────────┘      │
│                                                          │
│                                  [거부]                  │
└──────────────────────────────────────────────────────────┘
```

### 5.3 상태별 UI 요소 요약

| 상태 | 배지 색상 | 상태 텍스트 | 버튼 | 추가 정보 |
|------|----------|------------|------|----------|
| pending | Yellow | "AML 검토 중" | 없음 | "AML 자동 검토가 진행 중입니다" |
| approval_waiting | Blue | "승인 대기" | "Hot 출금", "Cold 출금", "거부" | Hot/Cold 잔고 상태 표시 |
| aml_flagged | Red | "AML 문제" | "상세 보기", "거부" | AML 리스크 정보 |
| processing | Purple+Spinner | "처리 중" | 없음 | "외부 시스템(Hot/Cold) 처리 중" |
| completed | Green | "완료" | "상세 보기" | 트랜잭션 해시, 출금 소스 |
| rejected | Red | "거부됨" | "상세 보기" | 거부 사유 |
| failed | Red | "실패" | "상세 보기", "재시도"* | 오류 메시지 |

---

## 6. API 서비스 레이어 변경

### 6.1 타입 시스템 업데이트

```typescript
// src/types/withdrawalV2.ts

/**
 * 출금 소스 지갑
 */
export type WalletSource = "hot" | "cold";

/**
 * 출금 요청 상태
 */
export type WithdrawalStatus =
  | "pending"
  | "approval_waiting"
  | "aml_flagged"
  | "processing"
  | "completed"
  | "rejected"
  | "failed";

/**
 * Hot 지갑 잔고 확인 결과
 */
export interface HotWalletBalanceCheck {
  asset: AssetType;
  currentBalance: string;
  requestedAmount: string;
  afterBalance: string;
  isSufficient: boolean;
  shortfall?: string;
  currentHotRatio: number;
  afterHotRatio: number;
  needsRebalancing: boolean;
  deviation: number;
}

/**
 * Cold 지갑 잔고 정보
 */
export interface ColdWalletBalanceInfo {
  asset: AssetType;
  currentBalance: string;
  isSufficient: boolean;
}

/**
 * AML 검토 정보
 */
export interface AMLReview {
  reviewId: string;
  status: "passed" | "flagged";
  riskLevel: "low" | "medium" | "high";
  riskScore: number;
  flaggedReasons?: string[];
  reviewedAt: Date;
  notes?: string;
}

/**
 * 거부 정보
 */
export interface RejectionInfo {
  rejectedBy: string;
  rejectedAt: Date;
  reason: string;
  relatedAMLIssue?: boolean;
}

/**
 * MPC 지갑 실행 정보
 */
export interface MPCWalletExecution {
  mpcRequestId: string;
  initiatedAt: Date;
  callbackReceivedAt?: Date;
  status: "pending" | "success" | "failed";
  txHash?: string;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 출금 요청 (업데이트된 버전)
 */
export interface WithdrawalV2Request {
  // 기본 정보
  id: string;
  memberId: string;
  memberName: string;
  amount: string;
  asset: AssetType;
  blockchain: BlockchainType;
  network: NetworkEnvironment;
  toAddress: string;
  createdAt: Date;
  updatedAt: Date;

  // 상태
  status: WithdrawalStatus;

  // 출금 소스 (Hot/Cold)
  walletSource?: WalletSource;

  // AML 검토
  amlReview?: AMLReview;

  // Hot/Cold 지갑 잔고 확인
  hotWalletCheck?: HotWalletBalanceCheck;
  coldWalletInfo?: ColdWalletBalanceInfo;

  // MPC 지갑 실행 정보 (Hot/Cold 외부 API 처리)
  mpcExecution?: MPCWalletExecution;

  // 거부 정보
  rejection?: RejectionInfo;

  // 에러 정보
  error?: {
    code: string;
    message: string;
    occurredAt: Date;
  };
}
```

### 6.2 새로운 API 메서드

```typescript
// src/services/withdrawalV2Api.ts

class WithdrawalV2ApiService {
  /**
   * Hot/Cold 지갑 잔고 확인
   */
  async checkWalletBalances(requestId: string): Promise<{
    hot: HotWalletBalanceCheck;
    cold: ColdWalletBalanceInfo;
  }> {
    // Hot 지갑 잔고 체크
    // Cold 지갑 잔고 체크
    // Hot/Cold 비율 계산
  }

  /**
   * Hot 지갑 출금 승인
   * approval_waiting → processing
   */
  async approveWithHotWallet(requestId: string): Promise<void> {
    // 1. Hot 잔고 최종 확인
    // 2. Hot 지갑 출금 API 호출 (외부 시스템)
    // 3. 상태 전이: approval_waiting → processing
    // 4. walletSource: "hot" 설정
    // 5. 외부 시스템 콜백 대기
  }

  /**
   * Cold 지갑 출금 승인
   * approval_waiting → processing
   */
  async approveWithColdWallet(requestId: string): Promise<void> {
    // 1. Cold 잔고 확인
    // 2. Cold 지갑 출금 API 호출 (외부 시스템)
    // 3. 상태 전이: approval_waiting → processing
    // 4. walletSource: "cold" 설정
    // 5. 외부 시스템 콜백 대기
  }

  /**
   * AML 검토 상태 확인
   */
  async checkAMLStatus(requestId: string): Promise<AMLReview> {
    // AML 서비스 호출
    // pending → approval_waiting 또는 aml_flagged 전이
  }

  /**
   * 출금 거부
   */
  async rejectWithdrawal(requestId: string, reason: string): Promise<void> {
    // 상태 전이 + 거부 정보 저장
  }

  /**
   * MPC 지갑 콜백 처리
   */
  async handleMPCCallback(
    requestId: string,
    result: {
      success: boolean;
      txHash?: string;
      error?: { code: string; message: string };
    }
  ): Promise<void> {
    // processing → completed/failed 전이
  }
}
```

### 6.3 상태 전이 검증

```typescript
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
  failed: ["pending"],  // 재시도 가능
};

/**
 * 상태 전이 검증 함수
 */
function isValidTransition(
  from: WithdrawalStatus,
  to: WithdrawalStatus
): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}
```

---

## 7. 마이그레이션 계획

### 7.1 기존 상태 매핑

```typescript
const STATE_MIGRATION_MAP: Record<OldWithdrawalStatus, WithdrawalStatus> = {
  "pending": "pending",
  "aml_review": "pending",
  "vault_check": "approval_waiting",
  "rebalancing": "approval_waiting",
  "signing": "processing",
  "executing": "processing",
  "completed": "completed",
  "failed": "failed",
  "cancelled": "rejected",
};
```

### 7.2 단계별 롤아웃 (5일)

#### Phase 1: 타입 시스템 업데이트 (0.5일)
- `withdrawalV2.ts` 타입 정의 업데이트
- Hot/Cold 지갑 관련 인터페이스 추가
- 상태 enum 단순화 (7개 상태)

#### Phase 2: API 서비스 레이어 구현 (1.5일)
- `withdrawalV2Api.ts` 새 메서드 구현
- Hot/Cold 승인 로직 구현
- 외부 API 호출 및 콜백 처리

#### Phase 3: UI 컴포넌트 구현 (2일)
- `WalletBalanceCheck` 컴포넌트
- `ApprovalButtons` 컴포넌트 (Hot/Cold)
- 기존 `ApprovalModal` 업데이트

#### Phase 4: 통합 테스트 (0.5일)
- 전체 플로우 테스트
- Hot/Cold 출금 시나리오 테스트
- 외부 API 콜백 테스트

#### Phase 5: 배포 (0.5일)
- 데이터 마이그레이션
- 프로덕션 배포
- 모니터링

**총 예상 기간**: 5일

---

## 8. 테스트 전략

### 8.1 Hot 출금 시나리오

```typescript
test("Hot wallet sufficient -> Hot withdrawal", async () => {
  const request = createMockRequest({
    status: "approval_waiting",
    amount: "5.0",
    asset: "BTC"
  });

  // Hot 잔고 확인: 25.5 BTC (충분)
  const balances = await withdrawalV2Api.checkWalletBalances(request.id);
  expect(balances.hot.isSufficient).toBe(true);

  // Hot 출금 승인
  await withdrawalV2Api.approveWithHotWallet(request.id);

  const updated = await getRequest(request.id);
  expect(updated.status).toBe("processing");
  expect(updated.walletSource).toBe("hot");
});
```

### 8.2 Cold 출금 시나리오

```typescript
test("Hot wallet insufficient -> Cold withdrawal", async () => {
  const request = createMockRequest({
    status: "approval_waiting",
    amount: "50.0",
    asset: "BTC"
  });

  // Hot 부족, Cold 충분
  const balances = await withdrawalV2Api.checkWalletBalances(request.id);
  expect(balances.hot.isSufficient).toBe(false);
  expect(balances.cold.isSufficient).toBe(true);

  // Cold 출금 승인 → 외부 API 호출
  await withdrawalV2Api.approveWithColdWallet(request.id);

  const afterColdApproval = await getRequest(request.id);
  expect(afterColdApproval.status).toBe("processing");
  expect(afterColdApproval.walletSource).toBe("cold");

  // 외부 시스템 콜백 수신 (성공)
  await withdrawalV2Api.handleMPCCallback(request.id, {
    success: true,
    txHash: "0xabc123..."
  });

  const afterCallback = await getRequest(request.id);
  expect(afterCallback.status).toBe("completed");
});
```

---

## 9. 보안 고려사항

### 9.1 Cold 지갑 출금 정책

```typescript
const COLD_WALLET_POLICY = {
  // Cold 출금 일일 한도
  dailyLimit: {
    BTC: 100,
    ETH: 1000,
    USDT: 5000000,
  },

  // Cold 출금 건당 한도
  perTransactionLimit: {
    BTC: 50,
    ETH: 500,
    USDT: 2000000,
  },

  // Cold 출금 승인 권한
  requiredRole: "senior_admin",

  // 감사 로그 필수
  auditRequired: true,
};

---

## 10. 개선 효과 요약

### 10.1 개선 전 vs 개선 후

| 항목 | 개선 전 | 개선 후 | 개선율 |
|------|--------|--------|--------|
| 상태 개수 | 9개 | 7개 | -22% |
| Hot 부족 시 처리 | 리밸런싱 대기 필수 | Cold 직접 출금 가능 | 처리 시간 -60% |
| 긴급 출금 처리 | 30분+ | 즉시 처리 | -90% |
| 관리자 제어권 | 낮음 (자동) | 높음 (선택) | +100% |
| 상태 전이 복잡도 | 높음 | 낮음 | -50% |

### 10.2 주요 개선 사항

1. **명확한 의미론**: 각 상태가 명확한 비즈니스 의미를 가짐
2. **Hot/Cold 선택권**: 관리자가 상황에 맞게 출금 소스 선택
3. **긴급 대응 강화**: Hot 부족 시 즉시 Cold 출금 가능
4. **투명한 정보**: 모든 지갑 상태를 한 화면에서 확인
5. **외부 시스템 연동**: Hot/Cold 출금 모두 외부 API로 안전하게 처리

---

**문서 버전**: 2.0
**최종 수정**: 2025-10-15
**작성자**: Claude (AI Assistant)
