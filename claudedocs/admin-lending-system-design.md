# 관리자 프론트 - 대출 관리 시스템 설계 계획

## 관리 포인트 요약

관리자가 관리해야 할 **5대 핵심 영역**:

### 1. 대출 현황 모니터링
- 전체 대출 통계 및 리스크 현황
- 헬스팩터 분포 및 위험도 분석
- 실시간 가격 변동 모니터링

### 2. 청산 프로세스 관리
- 청산콜 수신 및 대기 큐 관리
- 외부 거래소 연동 청산 실행
- 청산 내역 및 결과 추적

### 3. 개별 대출 관리
- 고객별 대출 상세 정보
- 담보 추가/상환 요청 처리
- 헬스팩터 실시간 업데이트

### 4. 대출 상품 관리
- 전북은행 API 연동 상태
- 상품 활성화/비활성화
- 상품별 통계 및 성과

### 5. 알림 및 리스크 관리
- 헬스팩터 임계값 알림 설정
- 청산 위험 고객 모니터링
- 시스템 상태 알림

---

## 화면 구조 설계

### 디렉토리 구조

```
abc-custody-admin/src/app/admin/lending/
├── dashboard/              # 대출 대시보드
│   ├── page.tsx
│   ├── components/
│   │   ├── LendingStatsCards.tsx          # 통계 카드 (총 대출액, 담보, HF)
│   │   ├── HealthFactorDistribution.tsx   # HF 분포 차트
│   │   ├── RiskLevelTable.tsx             # 위험도별 대출 현황
│   │   ├── RecentLiquidationsFeed.tsx     # 최근 청산 내역
│   │   └── PriceFeedWidget.tsx            # 실시간 가격 피드
│   └── hooks/
│       └── useLendingDashboard.ts
│
├── loans/                  # 대출 목록 관리
│   ├── page.tsx
│   ├── components/
│   │   ├── LoanTable.tsx                  # 대출 테이블
│   │   ├── LoanTableRow.tsx               # 테이블 행
│   │   ├── LoanFilters.tsx                # 필터링 (상태, 자산, 고객)
│   │   ├── LoanDetailModal.tsx            # 대출 상세 모달
│   │   ├── HealthFactorBadge.tsx          # HF 배지
│   │   ├── CollateralInfo.tsx             # 담보 정보
│   │   └── ActionButtons.tsx              # 액션 버튼 (상세, 상환, 담보추가)
│   └── hooks/
│       └── useLoans.ts
│
├── liquidation/            # 청산 관리
│   ├── page.tsx
│   ├── components/
│   │   ├── LiquidationQueue.tsx           # 청산콜 대기 큐
│   │   ├── LiquidationCard.tsx            # 청산 대상 카드
│   │   ├── ExecutionDashboard.tsx         # 청산 실행 대시보드
│   │   ├── ExecutionSteps.tsx             # 청산 프로세스 단계
│   │   ├── ExchangeStatus.tsx             # 거래소 연동 상태
│   │   ├── LiquidationHistory.tsx         # 청산 내역
│   │   └── LiquidationResult.tsx          # 청산 결과 상세
│   └── hooks/
│       └── useLiquidation.ts
│
├── products/               # 대출 상품 관리
│   ├── page.tsx
│   ├── components/
│   │   ├── ProductTable.tsx               # 상품 테이블
│   │   ├── ProductCard.tsx                # 상품 카드
│   │   ├── ApiStatusWidget.tsx            # 전북은행 API 상태
│   │   ├── ProductStats.tsx               # 상품별 통계
│   │   └── ProductToggle.tsx              # 활성화/비활성화
│   └── hooks/
│       └── useProducts.ts
│
└── alerts/                 # 알림 관리
    ├── page.tsx
    ├── components/
    │   ├── AlertSettings.tsx              # 알림 설정
    │   ├── RiskCustomerList.tsx           # 청산 위험 고객 목록
    │   ├── AlertHistory.tsx               # 알림 내역
    │   └── ThresholdConfig.tsx            # 임계값 설정
    └── hooks/
        └── useAlerts.ts
```

---

## 화면별 상세 설계

### 1. 대출 대시보드 (`/admin/lending/dashboard`)

**목적**: 전체 대출 현황 및 리스크 한눈에 파악

**주요 섹션**:
```
┌─────────────────────────────────────────────────────┐
│ [통계 카드]                                          │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐              │
│ │총대출 │ │담보가 │ │평균HF│ │청산위│              │
│ │ 금액  │ │ 치   │ │      │ │ 험   │              │
│ └──────┘ └──────┘ └──────┘ └──────┘              │
├─────────────────────────────────────────────────────┤
│ [헬스팩터 분포]              [위험도별 현황]        │
│ ┌────────────┐              ┌────────────┐        │
│ │ 차트: HF   │              │ 안전: 45건 │        │
│ │ 분포 시각화│              │ 주의: 12건 │        │
│ │            │              │ 위험: 3건  │        │
│ └────────────┘              │ 청산: 1건  │        │
│                              └────────────┘        │
├─────────────────────────────────────────────────────┤
│ [최근 청산 내역]             [실시간 가격 피드]    │
│ • 고객A BTC 청산 완료        BTC: 95,000,000원     │
│ • 고객B ETH 담보 추가        ETH: 3,200,000원      │
│ • 고객C 부분 상환            USDT: 1,320원         │
└─────────────────────────────────────────────────────┘
```

**컴포넌트**:
- `LendingStatsCards`: 4개 통계 카드
- `HealthFactorDistribution`: 차트 라이브러리 활용
- `RiskLevelTable`: 위험도별 대출 건수 및 금액
- `RecentLiquidationsFeed`: 최근 10건 활동 피드
- `PriceFeedWidget`: 업비트/빗썸 평균 가격

### 2. 대출 목록 (`/admin/lending/loans`)

**목적**: 개별 대출 상세 관리 및 모니터링

**주요 기능**:
```
┌─────────────────────────────────────────────────────┐
│ [필터]                                              │
│ 상태: [전체▼] 자산: [전체▼] 고객: [검색]           │
│ HF 범위: [1.0] ~ [2.0]  검색: [고객명/ID]          │
├─────────────────────────────────────────────────────┤
│ [대출 테이블]                                       │
│ ┌──────┬────┬────┬────┬────┬────┬────┐          │
│ │고객명│담보│대출│ HF │만기│상태│액션│          │
│ ├──────┼────┼────┼────┼────┼────┼────┤          │
│ │김철수│BTC │30M │1.58│30일│안전│상세│          │
│ │      │0.5 │    │    │    │    │    │          │
│ ├──────┼────┼────┼────┼────┼────┼────┤          │
│ │박영희│ETH │20M │1.12│15일│위험│상세│          │
│ │      │10  │    │    │    │    │담보│          │
│ └──────┴────┴────┴────┴────┴────┴────┘          │
└─────────────────────────────────────────────────────┘
```

**필터링 옵션**:
- 대출 상태: 전체, 정상, 주의, 위험, 청산
- 담보 자산: 전체, BTC, ETH, USDT, USDC
- 헬스팩터 범위: 슬라이더 또는 입력
- 고객 검색: 이름, ID, 전북은행 계좌번호

**대출 상세 모달**:
```
┌─────────────────────────────────────────────┐
│ [대출 상세 정보]                     [닫기] │
├─────────────────────────────────────────────┤
│ 고객 정보                                   │
│ • 이름: 김철수                              │
│ • 전북은행 계좌: 037-****-1234             │
│ • 대출 ID: LOAN-001                        │
├─────────────────────────────────────────────┤
│ 대출 정보                                   │
│ • 상품: 비트코인 담보 단기대출              │
│ • 대출금액: 30,000,000원                   │
│ • 금리: 연 3.5%                            │
│ • 만기일: 2025-10-04 (30일 남음)           │
│ • 누적이자: 125,000원                      │
├─────────────────────────────────────────────┤
│ 담보 정보                                   │
│ • 자산: 0.5 BTC                            │
│ • 현재가: 95,000,000원/BTC                 │
│ • 담보가치: 47,500,000원                   │
│ • LTV: 63.2%                               │
├─────────────────────────────────────────────┤
│ 헬스팩터                                    │
│ • 현재: 1.58 [안전]                        │
│ • 청산가: 약 42,000,000원/BTC              │
│ • 담보추가 필요시: -                       │
├─────────────────────────────────────────────┤
│ 활동 내역                                   │
│ • 2025-09-05: 대출 실행                    │
│ • 2025-09-10: 이자 납부                    │
└─────────────────────────────────────────────┘
```

### 3. 청산 관리 (`/admin/lending/liquidation`)

**목적**: 청산 프로세스 실행 및 모니터링

**청산콜 대기 큐**:
```
┌─────────────────────────────────────────────────────┐
│ [청산콜 대기 큐]                    [자동새로고침: ON]│
├─────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐ │
│ │ [긴급] 고객: 박영희 | HF: 0.95 | ETH: 10개     │ │
│ │ 대출금: 20,000,000원 | 청산콜 수신: 5분 전      │ │
│ │ [청산 시작] [상세보기]                          │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [주의] 고객: 이민수 | HF: 1.08 | BTC: 0.3개   │ │
│ │ 대출금: 15,000,000원 | 청산콜 수신: 2시간 전    │ │
│ │ [청산 시작] [상세보기]                          │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**청산 실행 대시보드**:
```
┌─────────────────────────────────────────────────────┐
│ [청산 실행: LOAN-002 - 박영희]                      │
├─────────────────────────────────────────────────────┤
│ [프로세스 단계]                                     │
│ ✓ 1. 청산콜 수신 (완료)                            │
│ ✓ 2. 담보 확인 (완료)                              │
│ → 3. 외부 거래소 연동 (진행중...)                  │
│   4. 담보 매도 실행 (대기)                          │
│   5. 은행 상환 (대기)                              │
│   6. 잔여금 반환 (대기)                            │
├─────────────────────────────────────────────────────┤
│ [외부 거래소 상태]                                  │
│ • 업비트 API: [연결됨] 지연시간: 120ms             │
│ • 빗썸 API: [연결됨] 지연시간: 150ms               │
│ • 선택 거래소: 업비트 (가격 우위)                  │
├─────────────────────────────────────────────────────┤
│ [청산 시뮬레이션]                                   │
│ • 담보: 10 ETH                                      │
│ • 예상 매도가: 3,180,000원/ETH                     │
│ • 예상 총액: 31,800,000원                          │
│ • 은행 상환: 20,125,000원 (원금+이자)              │
│ • 고객 반환 예상: 11,675,000원                     │
├─────────────────────────────────────────────────────┤
│ [액션]                                              │
│ [청산 실행] [취소] [수동 개입]                     │
└─────────────────────────────────────────────────────┘
```

**청산 내역**:
- 완료된 청산 목록 (일자, 고객, 자산, 금액, 결과)
- 청산 성공/실패 통계
- 평균 청산 소요 시간
- 고객별 잔여금 반환 내역

### 4. 대출 상품 관리 (`/admin/lending/products`)

**목적**: 전북은행 대출 상품 및 API 연동 관리

**상품 테이블**:
```
┌─────────────────────────────────────────────────────┐
│ [전북은행 대출 상품]             [API 상태: 정상]   │
├─────────────────────────────────────────────────────┤
│ ┌──────┬────┬────┬────┬────┬────┬────┐          │
│ │상품명│담보│LTV │금리│상태│통계│액션│          │
│ ├──────┼────┼────┼────┼────┼────┼────┤          │
│ │BTC   │BTC │60% │3.5%│활성│45건│상세│          │
│ │단기  │    │    │    │    │    │비활│          │
│ ├──────┼────┼────┼────┼────┼────┼────┤          │
│ │ETH   │ETH │55% │3.8%│활성│30건│상세│          │
│ │단기  │    │    │    │    │    │비활│          │
│ └──────┴────┴────┴────┴────┴────┴────┘          │
└─────────────────────────────────────────────────────┘
```

**API 상태 위젯**:
- 전북은행 API 연결 상태
- 마지막 동기화 시간
- API 호출 통계 (성공/실패율)
- 상품 목록 업데이트 내역

### 5. 알림 관리 (`/admin/lending/alerts`)

**목적**: 리스크 알림 설정 및 모니터링

**알림 설정**:
```
┌─────────────────────────────────────────────────────┐
│ [헬스팩터 임계값 알림]                              │
├─────────────────────────────────────────────────────┤
│ • HF 1.5 이하: [이메일] [SMS] [시스템알림]        │
│ • HF 1.2 이하: [이메일] [SMS] [시스템알림]        │
│ • HF 1.0 이하: [이메일] [SMS] [시스템알림] [긴급] │
├─────────────────────────────────────────────────────┤
│ [가격 변동 알림]                                    │
│ • BTC 5% 이상 변동: [시스템알림]                   │
│ • ETH 5% 이상 변동: [시스템알림]                   │
├─────────────────────────────────────────────────────┤
│ [청산 위험 고객 목록]              [실시간 업데이트]│
│ ┌─────────────────────────────────────────────────┐ │
│ │ 박영희 | HF: 0.95 | 청산 진행중                │ │
│ │ 이민수 | HF: 1.08 | 청산 대기                  │ │
│ │ 최지훈 | HF: 1.15 | 주의 필요                  │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 데이터 타입 정의

### 핵심 타입

```typescript
// src/types/admin-lending.ts

// 관리자용 대출 정보
export interface AdminBankLoan {
  id: string;
  customerId: string;
  customerName: string;
  customerBank: string;
  customerAccount: string;
  product: BankLoanProduct;
  collateralAsset: CollateralAsset;
  loanAmount: number;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
  liquidationPrice: number;
  createdAt: string;
  maturityDate: string;
  lastUpdated: string;
  status: "active" | "warning" | "danger" | "liquidation" | "liquidated";
  accruedInterest: number;
  riskLevel: "safe" | "caution" | "danger" | "liquidation";
}

// 청산콜
export interface LiquidationCall {
  id: string;
  loanId: string;
  customerId: string;
  customerName: string;
  collateralAsset: CollateralAsset;
  loanAmount: number;
  healthFactor: number;
  receivedAt: string;
  status: "pending" | "processing" | "completed" | "failed";
  priority: "urgent" | "high" | "normal";
}

// 청산 실행
export interface LiquidationExecution {
  id: string;
  liquidationCallId: string;
  loanId: string;
  steps: LiquidationStep[];
  selectedExchange: "upbit" | "bithumb";
  estimatedAmount: number;
  actualAmount: number;
  bankRepayment: number;
  customerRefund: number;
  startedAt: string;
  completedAt: string | null;
  status: "pending" | "in_progress" | "completed" | "failed";
  error: string | null;
}

// 청산 단계
export interface LiquidationStep {
  step: number;
  name: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startedAt: string | null;
  completedAt: string | null;
  error: string | null;
}

// 외부 거래소 상태
export interface ExchangeStatus {
  exchange: "upbit" | "bithumb";
  connected: boolean;
  latency: number;
  lastChecked: string;
  currentPrice: Record<string, number>;
}

// 대출 상품 통계
export interface ProductStats {
  productId: string;
  totalApplications: number;
  approvedCount: number;
  rejectedCount: number;
  activeLoans: number;
  totalLoanAmount: number;
  averageHealthFactor: number;
  approvalRate: number;
}

// 알림 설정
export interface AlertConfig {
  id: string;
  type: "health_factor" | "price_change" | "liquidation";
  threshold: number;
  channels: ("email" | "sms" | "system")[];
  enabled: boolean;
}

// 대출 대시보드 통계
export interface LoanDashboardStats {
  totalLoanAmount: number;
  totalCollateralValue: number;
  averageHealthFactor: number;
  liquidationRiskCount: number;
  riskDistribution: {
    safe: number;
    caution: number;
    danger: number;
    liquidation: number;
  };
  recentActivities: LoanActivity[];
}

// 대출 활동
export interface LoanActivity {
  id: string;
  type: "loan_created" | "repayment" | "collateral_added" | "liquidation";
  customerId: string;
  customerName: string;
  description: string;
  timestamp: string;
}
```

---

## API 서비스 레이어

### 서비스 구조

```typescript
// src/services/admin-lending/

// loanService.ts - 대출 관리
export interface AdminLoanService {
  getLoans(filters: LoanFilters): Promise<AdminBankLoan[]>;
  getLoan(id: string): Promise<AdminBankLoan>;
  getLoanStats(): Promise<LoanDashboardStats>;
  updateLoan(id: string, updates: Partial<AdminBankLoan>): Promise<AdminBankLoan>;
}

// liquidationService.ts - 청산 관리
export interface LiquidationService {
  getLiquidationQueue(): Promise<LiquidationCall[]>;
  startLiquidation(callId: string): Promise<LiquidationExecution>;
  getExecutionStatus(executionId: string): Promise<LiquidationExecution>;
  getLiquidationHistory(filters: HistoryFilters): Promise<LiquidationExecution[]>;
  getExchangeStatus(): Promise<ExchangeStatus[]>;
}

// productService.ts - 상품 관리
export interface ProductService {
  getProducts(): Promise<BankLoanProduct[]>;
  getProduct(id: string): Promise<BankLoanProduct>;
  getProductStats(productId: string): Promise<ProductStats>;
  toggleProductStatus(productId: string, enabled: boolean): Promise<BankLoanProduct>;
  syncWithBank(): Promise<void>;
}

// alertService.ts - 알림 관리
export interface AlertService {
  getAlertConfigs(): Promise<AlertConfig[]>;
  updateAlertConfig(config: AlertConfig): Promise<AlertConfig>;
  getRiskCustomers(): Promise<AdminBankLoan[]>;
  getAlertHistory(filters: HistoryFilters): Promise<Alert[]>;
}
```

---

## 청산 프로세스 자동화 설계

### 청산 실행 워크플로우

```typescript
// src/services/admin-lending/liquidationWorkflow.ts

export class LiquidationWorkflow {
  async executeLiquidation(liquidationCall: LiquidationCall): Promise<LiquidationExecution> {
    const execution = await this.initializeExecution(liquidationCall);

    try {
      // Step 1: 청산콜 수신 확인
      await this.confirmLiquidationCall(execution);

      // Step 2: 담보 확인
      await this.verifyCollateral(execution);

      // Step 3: 외부 거래소 연동
      const exchange = await this.selectBestExchange(execution);

      // Step 4: 담보 매도 실행
      const saleResult = await this.executeSale(execution, exchange);

      // Step 5: 은행 상환
      await this.repayBank(execution, saleResult);

      // Step 6: 잔여금 반환
      await this.refundCustomer(execution, saleResult);

      // 완료
      await this.completeLiquidation(execution);

      return execution;
    } catch (error) {
      await this.handleLiquidationError(execution, error);
      throw error;
    }
  }

  private async selectBestExchange(execution: LiquidationExecution): Promise<ExchangeStatus> {
    // 업비트/빗썸 가격 비교하여 최적 거래소 선택
    const exchanges = await this.getExchangeStatus();
    return exchanges.reduce((best, current) =>
      current.currentPrice[execution.collateralAsset.asset] >
      best.currentPrice[execution.collateralAsset.asset] ? current : best
    );
  }

  private async executeSale(
    execution: LiquidationExecution,
    exchange: ExchangeStatus
  ): Promise<SaleResult> {
    // 외부 거래소 API를 통한 매도 실행
    // 실제 구현 시 거래소 API 연동 필요
    return {
      exchange: exchange.exchange,
      soldAmount: execution.collateralAsset.amount,
      receivedKRW: execution.estimatedAmount,
      fee: execution.estimatedAmount * 0.001,
      executedAt: new Date().toISOString()
    };
  }
}

interface SaleResult {
  exchange: "upbit" | "bithumb";
  soldAmount: number;
  receivedKRW: number;
  fee: number;
  executedAt: string;
}
```

---

## Mock 데이터 설계

### Mock 데이터 파일

```
src/data/mockData/
├── admin-loans.json              # 관리자용 대출 목록
├── liquidation-queue.json        # 청산콜 대기 큐
├── liquidation-history.json      # 청산 내역
├── exchange-status.json          # 거래소 상태
├── product-stats.json            # 상품 통계
└── alert-configs.json            # 알림 설정
```

### Mock 데이터 예시

```json
// admin-loans.json
[
  {
    "id": "loan-001",
    "customerId": "user_1",
    "customerName": "김철수",
    "customerBank": "전북은행",
    "customerAccount": "037-****-1234",
    "product": {
      "id": "jb-btc-short",
      "productName": "비트코인 담보 단기대출",
      "bankName": "전북은행"
    },
    "collateralAsset": {
      "asset": "BTC",
      "amount": 0.5,
      "currentPrice": 95000000,
      "value": 47500000
    },
    "loanAmount": 30000000,
    "interestRate": 3.5,
    "healthFactor": 1.58,
    "liquidationThreshold": 0.85,
    "liquidationPrice": 42000000,
    "createdAt": "2025-09-05",
    "maturityDate": "2025-10-04",
    "lastUpdated": "2025-10-22T10:00:00Z",
    "status": "active",
    "accruedInterest": 125000,
    "riskLevel": "safe"
  }
]
```

---

## 구현 우선순위

### Phase 1: 기본 모니터링 (1-2주)
1. 대출 대시보드 (`/dashboard`)
   - 통계 카드 컴포넌트
   - 헬스팩터 분포 차트
   - 위험도별 테이블
2. 대출 목록 (`/loans`)
   - 대출 테이블 및 필터
   - 대출 상세 모달
3. Mock 데이터 및 타입 정의
4. API 서비스 레이어 구축

### Phase 2: 청산 관리 (2-3주)
5. 청산 관리 페이지 (`/liquidation`)
   - 청산콜 대기 큐
   - 청산 실행 대시보드
   - 청산 프로세스 단계 표시
6. 청산 실행 워크플로우
   - 외부 거래소 연동 로직
   - 청산 시뮬레이션
7. 청산 내역 및 결과

### Phase 3: 상품 및 알림 (1-2주)
8. 대출 상품 관리 (`/products`)
   - 상품 테이블 및 통계
   - API 상태 위젯
9. 알림 관리 (`/alerts`)
   - 알림 설정 UI
   - 청산 위험 고객 모니터링
10. 전북은행 API 연동 (Mock)

### Phase 4: 고도화 (1-2주)
11. 실시간 업데이트 (WebSocket/Polling)
    - 헬스팩터 실시간 업데이트
    - 가격 피드 자동 갱신
12. 차트 및 시각화 개선
    - Recharts 라이브러리 통합
    - 대시보드 차트 고도화
13. 청산 프로세스 자동화
    - 자동 청산 트리거
    - 알림 자동 발송

---

## 기술 스택 및 패턴

### 사용할 라이브러리
- **Recharts**: 차트 시각화 (헬스팩터 분포)
- **React Query**: 서버 상태 관리 및 자동 폴링
- **Zustand**: 클라이언트 상태 관리
- **SWR**: 실시간 데이터 업데이트 (대안)
- **date-fns**: 날짜 포맷팅 및 계산

### 디자인 패턴
- **Sapphire 테마**: 일관된 블루/퍼플 그라데이션
- **CryptoIcon**: 가상자산 아이콘 표시
- **Toast**: 사용자 액션 피드백 (alert 금지)
- **파일 크기 제한**: 컴포넌트당 200-300라인
- **이모지 사용 금지**: Lucide React 아이콘만 사용

---

## 주요 기능 플로우

### 청산 프로세스 플로우

```
[전북은행 청산콜]
    ↓
[커스터디 시스템 수신] → [청산콜 대기 큐 추가]
    ↓
[관리자 대시보드 알림]
    ↓
[청산 시작 버튼 클릭] → [청산 실행 워크플로우 시작]
    ↓
[1. 담보 확인]
    ↓
[2. 거래소 선택] → [업비트/빗썸 가격 비교]
    ↓
[3. 담보 매도 실행] → [외부 거래소 API 호출]
    ↓
[4. 원화 확보] → [매도 결과 확인]
    ↓
[5. 전북은행 상환] → [대출금 + 이자 전액 상환]
    ↓
[6. 잔여금 계산] → [총 매도금액 - 상환금액]
    ↓
[7. 고객 계좌 반환] → [커스터디 계좌로 잔여금 입금]
    ↓
[청산 완료] → [내역 저장 및 알림]
```

### 헬스팩터 모니터링 플로우

```
[실시간 가격 피드 수신] → [업비트/빗썸 API]
    ↓
[담보 가치 재계산]
    ↓
[헬스팩터 업데이트] → [(담보가치 × 0.85) ÷ 대출금액]
    ↓
[임계값 확인]
    ↓
HF < 1.5? → [주의 알림 발송]
HF < 1.2? → [위험 알림 발송]
HF < 1.0? → [긴급 알림 + 청산콜 생성]
```

---

## 보안 및 권한 관리

### 관리자 권한 레벨

```typescript
export type AdminRole = "super_admin" | "loan_manager" | "risk_manager" | "viewer";

export interface AdminPermissions {
  canViewLoans: boolean;
  canManageLiquidation: boolean;
  canManageProducts: boolean;
  canConfigureAlerts: boolean;
  canExecuteLiquidation: boolean;
  canAccessSensitiveData: boolean;
}
```

### 권한별 접근 제어

- **Super Admin**: 모든 기능 접근
- **Loan Manager**: 대출 관리 및 상품 관리
- **Risk Manager**: 청산 관리 및 알림 설정
- **Viewer**: 읽기 전용 (대시보드, 통계)

---

## 성능 최적화 전략

### 1. 실시간 업데이트 최적화
- **Polling Interval**: 30초 (가격 피드), 60초 (대출 목록)
- **WebSocket**: 청산 프로세스 실시간 업데이트
- **Lazy Loading**: 대출 목록 페이지네이션

### 2. 데이터 캐싱
- **React Query**: 자동 캐싱 및 무효화
- **Stale Time**: 30초 (대출 데이터), 10초 (가격 데이터)
- **Cache Time**: 5분

### 3. 렌더링 최적화
- **React.memo**: 컴포넌트 메모이제이션
- **useMemo/useCallback**: 불필요한 재계산 방지
- **Virtual Scrolling**: 대출 목록 대량 데이터 처리

---

## 테스트 전략

### 단위 테스트
- 헬스팩터 계산 로직
- 청산가 계산 함수
- 날짜/시간 포맷팅

### 통합 테스트
- 청산 워크플로우 전체 프로세스
- API 서비스 레이어
- 상태 관리 (React Query + Zustand)

### E2E 테스트
- 대출 목록 필터링 및 검색
- 청산 실행 전체 플로우
- 알림 설정 및 트리거

---

## 배포 및 모니터링

### 배포 체크리스트
- [ ] 환경 변수 설정 (전북은행 API, 거래소 API)
- [ ] 프로덕션 빌드 테스트
- [ ] API 엔드포인트 검증
- [ ] 보안 취약점 스캔
- [ ] 성능 테스트

### 모니터링 항목
- API 응답 시간
- 청산 실행 성공률
- 헬스팩터 업데이트 지연
- 에러 발생 빈도
- 사용자 활동 로그

---

## 향후 개선 사항

### 단기 (1-3개월)
- 청산 프로세스 완전 자동화
- 모바일 앱 알림 연동
- 대시보드 커스터마이징

### 중기 (3-6개월)
- AI 기반 청산 위험 예측
- 다국어 지원 (영어, 중국어)
- 고급 분석 대시보드

### 장기 (6-12개월)
- 블록체인 트랜잭션 직접 모니터링
- 다중 은행 API 연동
- 자동 리밸런싱 시스템

---

## 요약

### 핵심 관리 포인트
1. **헬스팩터 실시간 모니터링**: 청산 위험 조기 감지
2. **청산 프로세스 관리**: 청산콜부터 고객 잔여금 반환까지
3. **외부 거래소 연동**: 최적 가격으로 담보 청산
4. **고객 자산 보호**: 투명한 청산 프로세스 및 잔여금 반환
5. **전북은행 API 관리**: 안정적인 대출 상품 운영

### 구현 우선순위
1. Phase 1: 대출 대시보드 및 목록 (기본 모니터링)
2. Phase 2: 청산 관리 시스템 (핵심 기능)
3. Phase 3: 상품 및 알림 관리 (운영 효율화)
4. Phase 4: 실시간 업데이트 및 자동화 (고도화)

---

**작성일**: 2025-10-22
**버전**: 1.0
**작성자**: Claude Code AI Assistant
