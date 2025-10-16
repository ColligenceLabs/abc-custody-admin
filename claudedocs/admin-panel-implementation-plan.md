# 기업용 커스터디 관리자 페이지 구현 계획서

## 프로젝트 개요

### 서비스 구조

- **대상**: 기업용 가상자산 커스터디 서비스
- **핵심 역할**: 회원사 관리, 자산 모니터링, 출금 처리
- **운영 주체**: 커스터디 서비스 제공 회사 (내부 관리자용)

### 현재 구현 상태

**기업 회원용 대시보드 (완료)**

- 자산 모니터링: AssetOverview 컴포넌트
- 출금 관리: WithdrawalManagement (내부 승인)
- 사용자 관리: UserManagement (기업 내부)
- 그룹 관리: GroupManagement (부서별 지갑)
- 보안 설정: SecuritySettings (2FA, 정책)

**관리자 페이지 (미구현)**

- 회원사 온보딩 시스템 ❌
- Hot/Cold 지갑 관리 ❌
- 출금 처리 관리자 인터페이스 ❌
- 실시간 알림 시스템 ❌
- 컴플라이언스 대시보드 ❌

### 비즈니스 플로우

```
1. 회원사 온보딩 → 2. 사용할 자산 목록 추가 → 3. 자동 입금 주소 생성 (각 자산별)
→ 4. 회원사 직접 입출금 주소 등록/관리 → 5. 입금 감지 (생성된 입금 주소로)
→ 6. 송신 주소 검증 (회원사 등록 주소) → 7. 입금 AML 검증 → 8. Travel Rule 준수 확인
→ 9. 일일 한도 체크 → 10. 처리 결정 (배분/환불) → 11. Hot/Cold 지갑 자동 배분 (20%/80%)
→ 12. 출금 요청 수신 → 13. 수신 주소 검증 (회원사 등록 주소) → 14. 일일 한도 확인
→ 15. 출금 AML 검증 → 16. Hot/Cold 리밸런싱 → 17. Air-gap 서명 → 18. 출금 실행
```

### 회원사 셀프 주소 관리 시스템 (핵심 구조)

**핵심 원칙**:

- 회원사가 자산 추가 시 입금 주소 자동 생성
- 회원사가 직접 입출금 주소 등록/삭제 관리
- 모든 입출금은 회원사가 등록한 주소에서만 가능

#### 주소 유형 분류

- **개인 지갑**: 개인 소유 지갑 (일일 100만원 한도)
- **VASP 지갑**: 거래소/금융기관 지갑 (Travel Rule 준수 필수)

#### 권한 설정

- **입금 전용**: 해당 주소로부터의 입금만 허용
- **출금 전용**: 해당 주소로의 출금만 허용
- **입출금 겸용**: 입금과 출금 모두 허용

### 커스터디 볼트 구조

**이중 보안 아키텍처**

- **Hot Wallet (20%)**: 즉시 출금 가능, 온라인 보관
- **Cold Wallet (80%)**: 장기 보관, 오프라인 보관 (Air-gap)
- **수동 리밸런싱**: 관리자가 필요시 수동으로 Hot/Cold 간 이체

---

## 상세 기능 명세

### 1. 회원사 관리 시스템

#### 1.1 온보딩 프로세스

**기능 요구사항**

- 회원사 가입 신청 목록 관리
- KYC/KYB 문서 업로드 및 검증
  - 사업자등록증
  - 법인등기부등본
  - 대표자 신분증
  - AML 관련 서류
- 승인/반려/보류 처리 워크플로우
- 승인 후 회원사가 자산 추가 시 자동 입금 주소 생성

#### 1.2 회원사 자산 관리 모니터링

**자산별 입금 주소 생성 시스템**

```typescript
interface MemberAsset {
  id: string;
  memberId: string;
  assetSymbol: string; // "BTC", "ETH", "USDT"
  depositAddress: string; // 자동 생성된 입금 주소
  isActive: boolean;
  createdAt: string;
  lastActivityAt?: string;
}
```

#### 1.3 회원사 셀프 주소 관리 모니터링

**회원사가 직접 관리하는 입출금 주소**

```typescript
interface RegisteredAddress {
  id: string;
  memberId: string;
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp";
  permissions: {
    canDeposit: boolean;
    canWithdraw: boolean;
  };
  dailyLimits?: {
    deposit: number; // KRW 기준 (개인: 1,000,000원)
    withdrawal: number; // KRW 기준 (개인: 1,000,000원)
  };
  dailyUsage: {
    date: string; // YYYY-MM-DD
    depositAmount: number; // 당일 사용한 입금액
    withdrawalAmount: number; // 당일 사용한 출금액
  };
  vaspInfo?: {
    businessName: string;
    travelRuleConnected: boolean;
    complianceScore: number;
  };
  status: "active" | "suspended" | "blocked";
  addedAt: string;
}
```

**관리자 모니터링 기능**

- 회원사별 자산 추가/제거 이력 모니터링
- 생성된 입금 주소별 거래 내역 조회
- 회원사가 등록한 입출금 주소 목록 조회
- 의심 주소 플래그 및 차단 기능
- 주소 등록/삭제 변경 이력 감사
- 일일 한도 사용량 모니터링
- VASP 정보 관리 및 Travel Rule 연동 상태

**화면 구성**

```
/admin/members/onboarding
├── 신청 목록 (대기/진행중/완료)
├── 상세 검토 페이지
├── 문서 뷰어
└── 승인 처리 모달

/admin/members/[memberId]/assets
├── 추가된 자산 목록 및 생성된 입금 주소
├── 자산별 입금 거래 내역
└── 자산 추가/제거 이력

/admin/members/[memberId]/addresses
├── 회원사가 등록한 입출금 주소 목록
├── 주소별 권한 설정 및 사용량
├── 의심 주소 플래그 관리
└── 주소 변경 이력 감사
```

#### 1.4 회원사 정보 관리

**기능 요구사항**

- 회원사 기본 정보 CRUD
- 계약 정보 관리 (요금제, 수수료율)
- 회원사 담당자 정보 관리
- 출금 승인자 설정 및 권한 관리
- 자산별 생성된 입금 주소 조회 (관리자 모니터링용)
- 거래 한도 설정
- 알림 수신 설정

**데이터 구조**

```typescript
interface Member {
  id: string;
  companyName: string;
  businessNumber: string;
  status: "active" | "suspended" | "terminated";
  contractInfo: {
    plan: "basic" | "premium" | "enterprise";
    feeRate: number;
    monthlyLimit: number;
    dailyLimit: number;
  };
  generatedDepositAddresses: {
    asset: string;
    depositAddress: string; // 자동 생성된 입금 주소
    balance: string;
    isActive: boolean;
  }[];
  contacts: {
    name: string;
    email: string;
    phone: string;
    role: "admin" | "approver" | "viewer";
    status: "active" | "inactive";
  }[];
  approvalSettings: {
    requiredApprovers: number;
    approvalThreshold: string; // KRW 기준
    emergencyContacts: string[];
  };
  notificationSettings: {
    email: boolean;
    sms: boolean;
    slack?: string;
  };
}
```

#### 1.5 오프보딩 프로세스

**기능 요구사항**

- 계약 해지 신청 처리
- 잔여 자산 정산 워크플로우
- 데이터 보관/삭제 정책 적용
- 감사 로그 보존

---

### 2. 자산 모니터링 대시보드

#### 2.1 실시간 모니터링

**메인 대시보드 (/admin/dashboard)**

```
┌─────────────────────────────────────┐
│  총 관리 자산 (TVL)                 │
│  ₿ 125.5 BTC | Ξ 2,450 ETH        │
│  $ 45,250,000 USDT                 │
└─────────────────────────────────────┘

┌─────────────┬─────────────┬─────────┐
│ Hot Wallet  │ Cold Wallet │ 잔액상태│
│ 18% (목표20%)│ 82% (목표80%)│ 주의   │
│ ₩81억       │ ₩369억      │ 수동    │
└─────────────┴─────────────┴─────────┘

┌──────────────┬──────────────────────┐
│ 입금 현황    │ 출금 대기           │
│ 15건 / 1시간 │ 3건 / ₩5억          │
└──────────────┴──────────────────────┘

[실시간 트랜잭션 피드]
- 10:23:45 | A사 | +1.5 BTC | 입금→분배 완료
- 10:20:12 | B사 | -500 USDT | Hot→출금 처리중
- 10:15:30 | 관리자 | Cold→Hot | 수동 리밸런싱 실행
```

#### 2.2 회원사별 자산 현황

**기능 요구사항**

- 회원사별 보유 자산 실시간 조회
- 입출금 히스토리
- 자산 변동 추이 차트
- CSV 내보내기

**모니터링 지표**

```typescript
interface AssetMetrics {
  memberId: string;
  assets: {
    symbol: string;
    balance: string;
    valueInKRW: string;
    lastUpdated: Date;
  }[];
  transactions24h: number;
  volume24h: string;
  alerts: Alert[];
}

interface VaultMetrics {
  hotWallet: {
    totalValue: string;
    assets: AssetBalance[];
    utilizationRate: number; // 사용률
  };
  coldWallet: {
    totalValue: string;
    assets: AssetBalance[];
    securityLevel: "high" | "critical";
  };
  balanceStatus: {
    hotRatio: number; // 현재 Hot 비율 (%)
    coldRatio: number; // 현재 Cold 비율 (%)
    targetHotRatio: number; // 목표 Hot 비율 (20%)
    targetColdRatio: number; // 목표 Cold 비율 (80%)
    deviation: number; // 목표 비율과의 편차 (%)
    lastRebalance?: Date; // 마지막 수동 리밸런싱 시간
    needsRebalancing: boolean; // 리밸런싱 필요 여부 알림
  };
}

interface AssetBalance {
  symbol: string;
  balance: string;
  percentage: number;
}
```

#### 2.3 입금 AML 및 Travel Rule 시스템

**입금 감지 및 1차 검증**

- 회원사가 자산 추가 시 입금 주소 자동 생성 (BTC, ETH, USDT 등)
- 생성된 입금 주소로 들어오는 모든 입금 실시간 감지
- 송신 주소가 해당 회원사 등록 주소인지 확인 (필수)
- 송신 주소 권한 확인 (canDeposit 체크)
- 송신 주소 분류 (개인 지갑 / VASP 지갑)

**AML 스크리닝 시스템**

```typescript
interface DepositAMLCheck {
  transactionHash: string;
  fromAddress: string;
  amount: string;
  currency: Currency;
  checks: {
    blacklistCheck: boolean;
    sanctionsListCheck: boolean;
    riskScore: number; // 0-100
    addressType: "registered" | "personal" | "unknown" | "exchange";
  };
  status: "pending" | "approved" | "flagged" | "rejected";
  manualReview: boolean;
  reviewNotes?: string;
}
```

**Travel Rule 준수 검증**

```typescript
interface TravelRuleCheck {
  transactionId: string;
  amount: string;
  amountInKRW: string;
  threshold: string; // "1000000" (100만원)
  isExceeding: boolean;
  originatorInfo?: {
    vasp: string;
    customerName: string;
    customerAddress: string;
  };
  requiresReturn: boolean;
  returnReason?: "travel_rule_violation" | "insufficient_info";
}
```

**일일 한도 검증**

```typescript
interface DailyLimitCheck {
  address: string;
  todayUsage: number; // 오늘 사용한 금액 (KRW)
  dailyLimit: number; // 일일 한도 (개인: 1,000,000원)
  transactionAmount: number; // 현재 거래 금액 (KRW)
  isExceeding: boolean; // 한도 초과 여부
  remainingLimit: number; // 남은 한도
}
```

**처리 결정 로직**

1. **회원사 미등록 주소**: 즉시 환불 (해당 회원사가 등록하지 않은 송신 주소)
2. **권한 없음**: 즉시 환불 (canDeposit: false)
3. **개인 지갑 + 일일 한도 초과**: 자동 환불 (100만원 기준)
4. **AML 플래그**: 수동 검토 대기열
5. **Travel Rule 위반**: 자동 환불
6. **제재 주소**: 즉시 동결 및 신고
7. **모든 검증 통과**: Hot/Cold 자동 배분

**Hot/Cold 잔액 모니터링 시스템**

```typescript
interface VaultMonitoring {
  totalValue: string;
  hotWallet: {
    balance: string;
    percentage: number; // 현재 비율
    targetPercentage: number; // 목표 비율 (20%)
    status: "normal" | "low" | "high" | "critical";
  };
  coldWallet: {
    balance: string;
    percentage: number; // 현재 비율
    targetPercentage: number; // 목표 비율 (80%)
    status: "normal" | "low" | "high" | "critical";
  };
  deviation: number; // 목표 대비 편차
  alerts: {
    needsRebalancing: boolean;
    hotTooLow: boolean; // Hot 잔액 부족 경고
    hotTooHigh: boolean; // Hot 잔액 과다 경고
  };
  lastManualRebalance?: Date;
}
```

**수동 리밸런싱 도구**

- Hot → Cold 이체 버튼 (관리자 승인 필요)
- Cold → Hot 이체 버튼 (Air-gap 서명 필요)
- 목표 비율 대비 현재 상태 시각화
- 리밸런싱 필요 시점 알림
- 이체 이력 및 사유 기록

#### 2.4 환불(Return) 시스템

**자동 환불 프로세스**

```typescript
interface ReturnTransaction {
  id: string;
  originalTxHash: string;
  returnTxHash?: string;
  amount: string;
  currency: Currency;
  returnAddress: string;
  reason: "travel_rule_violation" | "aml_flag" | "compliance_requirement";
  status: "pending" | "processing" | "completed" | "failed";
  networkFee: string;
  returnAmount: string; // 원금 - 수수료
  processedAt?: string;
  completedAt?: string;
}
```

**환불 처리 단계**

1. **환불 대상 식별**: 회원사 미등록 주소/권한없음/한도초과/Travel Rule 위반 등
2. **환불 사유 분류**:
   - `member_unregistered_address`: 해당 회원사가 등록하지 않은 주소
   - `no_permission`: 권한 없음 (입금 권한 없는 주소)
   - `daily_limit_exceeded`: 일일 한도 초과
   - `travel_rule_violation`: Travel Rule 위반
   - `aml_flag`: AML 의심 거래
3. **수수료 계산**: 네트워크 수수료 차감
4. **환불 트랜잭션 생성**: Hot Wallet에서 반환
5. **Air-gap 서명**: 보안 서명 프로세스
6. **브로드캐스트**: 블록체인 전송
7. **완료 알림**: 회원사 및 관리자 알림

**모니터링 화면**

```
/admin/deposits/
├── 입금 감지 현황
├── AML 스크리닝 대기열
├── Travel Rule 검증
├── 환불 처리 현황
└── 컴플라이언스 보고서

/admin/vault-management/
├── Hot/Cold 잔액 현황 및 비율 모니터링
├── 수동 리밸런싱 도구
├── 리밸런싱 히스토리 및 사유 기록
└── 잔액 임계값 알림 설정
```

#### 2.5 블록체인 네트워크 모니터링

**기능 요구사항**

- 네트워크 상태 (Bitcoin, Ethereum 등)
- 가스비/수수료 현황
- 컨펌 시간 모니터링
- 네트워크 혼잡도 알림

---

### 3. 출금 처리 워크플로우

#### 3.1 출금 요청 관리

**출금 요청 대기열 (/admin/withdrawals)**

```
상태: [대기] [AML검토] [서명대기] [처리중] [완료]

┌─────┬────────┬────────┬─────────┬────────┬────────┐
│ 우선│ 회원사 │ 자산   │ 금액    │ 상태   │ 작업   │
├─────┼────────┼────────┼─────────┼────────┼────────┤
│ 🔴  │ A기업  │ BTC    │ 5.2     │ AML검토│ [처리] │
│ 🟡  │ B기업  │ USDT   │ 100,000 │ 대기   │ [처리] │
└─────┴────────┴────────┴─────────┴────────┴────────┘
```

**처리 단계**

1. **요청 접수**: 회원사 내부 승인 완료 알림
2. **수신 주소 검증**: 해당 회원사가 등록한 주소인지 확인 및 권한 확인
3. **일일 한도 검증**: 개인 지갑의 경우 일일 한도 확인
4. **출금 가능 금액 조정**: 개인 지갑은 한도 내에서만 출금
5. **AML 검증**: 자동 스크리닝 + 수동 검토
6. **잔액 확인**: Hot Wallet 잔액 체크
7. **Cold→Hot 이체**: 필요 시 관리자가 수동으로 Cold에서 Hot으로 이체
8. **트랜잭션 생성**: UTXO 선택, 수수료 계산
9. **Air-gap 서명**: 오프라인 서명 요청
10. **브로드캐스트**: 블록체인 전송
11. **모니터링**: 컨펌 추적
12. **한도 업데이트**: 개인 지갑 일일 사용량 기록

#### 3.2 AML/컴플라이언스

**자동화 검증**

```typescript
interface AMLCheck {
  withdrawalId: string;
  checks: {
    blacklist: boolean;
    riskScore: number; // 0-100
    sanctionsList: boolean;
    travelRule: boolean;
  };
  manualReview: boolean;
  reviewNotes: string;
}
```

**검증 항목**

- 블랙리스트 주소 확인
- 리스크 점수 산출 (Chainalysis API)
- 제재 대상 확인
- Travel Rule 준수
- 대량 출금 알림 (1억원 이상)

#### 3.3 Air-gap 서명 시스템

**보안 요구사항**

- 오프라인 서명 장치와 통신
- QR 코드 기반 트랜잭션 전송
- 다중 서명 지원 (2-of-3, 3-of-5)
- 서명 검증 및 로깅

**워크플로우**

```
온라인 시스템          Air-gap 시스템
     │                      │
     ├─[TX 생성]──QR코드───→│
     │                      ├─[서명]
     │←──QR코드──[서명된TX]─┤
     ├─[검증 및 전송]       │
```

---

### 4. 알림 및 커뮤니케이션

#### 4.1 실시간 알림 시스템

**알림 유형**

- 🔴 긴급: 제재 주소 입금, 대량 출금, 시스템 오류
- 🟡 주의: AML 플래그, Travel Rule 위반, 한도 초과
- 🟠 환불: 자동 환불 처리, 환불 실패
- 🔵 정보: 입금 확인, 처리 완료, 배분 완료

**입금 관련 특별 알림**

- Travel Rule 위반 감지 (100만원 초과 개인주소)
- AML 스크리닝 실패
- 환불 처리 상태 변경
- 제재 주소 입금 감지

**알림 채널**

- 웹 푸시 알림
- 이메일
- Slack/Telegram 웹훅
- SMS (긴급 건만)

#### 4.2 티켓 시스템

**기능 요구사항**

- 회원사 문의 접수
- 우선순위 분류
- 담당자 배정
- 처리 현황 추적

---

### 5. 보안 및 권한 관리

#### 5.1 역할 기반 접근 제어 (RBAC)

**권한 레벨**

```typescript
enum AdminRole {
  SUPER_ADMIN = "super_admin", // 전체 권한
  OPERATIONS = "operations", // 출금 처리
  COMPLIANCE = "compliance", // AML/KYC
  SUPPORT = "support", // 고객 지원
  VIEWER = "viewer", // 읽기 전용
}
```

**권한 매트릭스**
| 기능 | Super Admin | Operations | Compliance | Support | Viewer |
|------|------------|------------|------------|---------|--------|
| 회원사 승인 | ✓ | - | ✓ | - | - |
| 출금 처리 | ✓ | ✓ | - | - | - |
| AML 검토 | ✓ | ✓ | ✓ | - | - |
| 자산 조회 | ✓ | ✓ | ✓ | ✓ | ✓ |

#### 5.2 보안 기능

**필수 보안 요구사항**

- 2FA 인증 (Google OTP)
- IP 화이트리스트
- 세션 타임아웃 (30분)
- 감사 로그 (모든 작업 기록)
- 민감 작업 시 재인증

---

### 6. 보고서 및 분석

#### 6.1 운영 보고서

**일일 보고서**

- 총 관리 자산 (TVL)
- 입출금 건수 및 금액
- 수수료 수익
- AML/Travel Rule 위반 건수
- 환불 처리 현황
- 이상 거래 탐지

**월간 보고서**

- 회원사별 거래 통계
- 자산 성장률
- 컴플라이언스 준수율
- Travel Rule 위반 분석
- 환불 통계 및 손실 분석
- 시스템 가용성

#### 6.2 컴플라이언스 보고서

**규제 보고서**

- Travel Rule 준수 보고서
- AML 스크리닝 결과
- 의심 거래 보고 (STR)
- 제재 주소 탐지 로그
- 환불 처리 감사 추적

**리스크 분석**

- 높은 리스크 거래 패턴
- 회원사별 리스크 점수
- 지역별/자산별 위험도 분석

#### 6.3 분석 대시보드

**주요 지표**

- 거래량 추이
- 회원사 활성도
- 자산 분포
- 수수료 수익 분석

---

## 기술 스택

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- React Query (데이터 페칭)
- Socket.io (실시간 통신)

### Backend 연동

- REST API
- WebSocket (실시간 알림)
- GraphQL (복잡한 쿼리)

### 보안

- JWT + Refresh Token
- 2FA (TOTP)
- E2E 암호화 (민감 데이터)

### 모니터링

- Sentry (에러 트래킹)
- DataDog (APM)
- CloudWatch (인프라)

---

## 구현 로드맵

### 기존 자산 활용 계획

**재사용 가능한 컴포넌트**

- AssetOverview → AdminAssetOverview (Hot/Cold 지갑용)
- WithdrawalManagement → AdminWithdrawalQueue
- UserManagement → MemberManagement (회원사용)
- CryptoIcon, StatusBadge 등 UI 컴포넌트

### Phase 1: 관리자 기본 구조 (4주)

**Week 1-2: 관리자 인프라**

- [x] 프로젝트 셋업 (기존 활용)
- [ ] 관리자 전용 인증 시스템
- [ ] 관리자 레이아웃 및 네비게이션
- [ ] 권한 체계 (SUPER_ADMIN, OPERATIONS, COMPLIANCE)

**Week 3-4: 핵심 기능**

- [ ] 회원사 온보딩 관리 시스템
- [ ] Hot/Cold 지갑 모니터링 대시보드 (AssetOverview 확장)
- [ ] 입금 AML 스크리닝 시스템
- [ ] Travel Rule 검증 및 환불 시스템
- [ ] 관리자용 출금 처리 대기열

### Phase 2: 고도화 (4주)

**Week 5-6: AML/컴플라이언스**

- [ ] AML 자동 스크리닝
- [ ] 리스크 점수 시스템
- [ ] Travel Rule 구현

**Week 7-8: 실시간 기능**

- [ ] WebSocket 알림
- [ ] 실시간 대시보드
- [ ] 티켓 시스템

### Phase 3: 최적화 (4주)

**Week 9-10: Air-gap 통합**

- [ ] QR 코드 시스템
- [ ] 다중 서명 지원
- [ ] 서명 검증 자동화

**Week 11-12: 보고서 및 분석**

- [ ] 보고서 생성 자동화
- [ ] 분석 대시보드
- [ ] CSV 내보내기

---

## 리스크 및 대응 방안

### 기술적 리스크

| 리스크                 | 영향도 | 대응 방안                   |
| ---------------------- | ------ | --------------------------- |
| 블록체인 네트워크 장애 | 높음   | 다중 노드 운영, 폴백 시스템 |
| Air-gap 통신 실패      | 높음   | 수동 백업 프로세스          |
| 대량 트래픽            | 중간   | 로드 밸런싱, 캐싱           |

### 보안 리스크

| 리스크           | 영향도 | 대응 방안                   |
| ---------------- | ------ | --------------------------- |
| 내부자 위협      | 높음   | 다중 승인, 감사 로그        |
| 관리자 계정 탈취 | 높음   | 2FA 필수, IP 제한           |
| 세션 하이재킹    | 중간   | 세션 검증 강화              |
| 피싱 공격        | 중간   | 보안 교육, 이상 로그인 탐지 |

---

## 성공 지표 (KPI)

### 운영 효율성

- 출금 처리 시간: < 30분
- 시스템 가용성: > 99.9%
- AML 자동화율: > 80%

### 보안 지표

- 보안 사고: 0건
- 2FA 적용률: 100%
- 감사 로그 커버리지: 100%

### 비즈니스 지표

- 회원사 온보딩 시간: < 2일
- 고객 만족도: > 4.5/5
- 수수료 수익: 목표 대비 100%+

---

## 기존 코드베이스 분석 상세

### 활용 가능한 기존 구조

#### 1. UI 컴포넌트 재사용

```typescript
// 재사용 가능한 컴포넌트들
- CryptoIcon: /src/components/ui/CryptoIcon.tsx
- StatusBadge: /src/components/withdrawal/StatusBadge.tsx
- PriorityBadge: /src/components/withdrawal/PriorityBadge.tsx
- Modal: /src/components/common/Modal.tsx
- PageLayout: /src/components/PageLayout.tsx
```

#### 2. 타입 정의 확장 필요

```typescript
// 기존: /src/types/withdrawal.ts
// 추가 필요: /src/types/admin.ts, /src/types/member.ts, /src/types/vault.ts
```

#### 3. Context 구조 활용

```typescript
// 기존: AuthContext, LanguageContext, CompanyContext
// 추가 필요: AdminContext, VaultContext
```

### 관리자 페이지 라우팅 구조

```
src/app/admin/
├── dashboard/                 # 관리자 메인 대시보드
├── members/                   # 회원사 관리 (모니터링 중심)
│   ├── onboarding/           # 온보딩 관리
│   ├── [memberId]/           # 회원사 상세
│   │   ├── assets/           # 자산 및 생성된 입금 주소 관리
│   │   ├── addresses/        # 회원사가 등록한 입출금 주소 모니터링
│   │   └── transactions/     # 거래 내역 및 감사 추적
│   └── address-audit/        # 전체 회원사 주소 변경 이력 감사
├── deposits/                  # 입금 모니터링 및 처리
│   ├── monitoring/           # 실시간 입금 감지
│   ├── address-verification/ # 회원사 등록 주소 검증
│   ├── aml-screening/        # AML 스크리닝
│   ├── travel-rule/          # Travel Rule 검증
│   └── returns/              # 환불 처리
├── vault/                     # 볼트 관리
│   ├── monitoring/           # Hot/Cold 잔액 모니터링
│   └── rebalancing/          # 수동 리밸런싱 도구
├── withdrawals/               # 출금 처리
│   ├── queue/                # 대기열
│   ├── aml/                  # AML 검토
│   └── airgap/               # Air-gap 서명
├── compliance/                # 컴플라이언스
│   ├── reports/              # 규제 보고서
│   ├── travel-rule-config/   # Travel Rule 설정
│   ├── aml-policies/         # AML 정책 관리
│   └── suspicious-addresses/ # 의심 주소 관리
└── reports/                   # 운영 보고서
```

---

## 다음 단계

1. **관리자 인증 시스템**: 기존 AuthContext 확장
2. **관리자 레이아웃**: PageLayout 컴포넌트 확장
3. **회원사 타입 정의**: /src/types/member.ts, /src/types/memberAsset.ts 생성
4. **회원사 자산 모니터링**: 생성된 입금 주소 및 회원사 등록 주소 추적 시스템
5. **볼트 관리 시스템**: AssetOverview 컴포넌트 확장 (Hot/Cold 비율 모니터링)
6. **출금 대기열**: WithdrawalManagement 컴포넌트 확장 (회원사 등록 주소 검증 중심)

---

## 참고 자료

- [Custody Best Practices](https://example.com)
- [AML Compliance Guide](https://example.com)
- [Air-gap Security](https://example.com)

---

_작성일: 2025-09-25_
_작성자: 커스터디 서비스 개발팀_
