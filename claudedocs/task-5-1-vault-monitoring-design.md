# Task 5.1: Hot/Cold 볼트 모니터링 시스템 설계

## 📋 개요

**Task**: Task 5.1 - Hot/Cold 볼트 모니터링
**설계일**: 2025-10-14
**상태**: 📐 설계 완료 → 구현 대기
**Phase**: Phase 5 (볼트 관리 시스템)

## 🎯 설계 목표

Hot Wallet(20%)과 Cold Wallet(80%)의 잔액, 비율, 자산 분포를 실시간으로 모니터링하고, 목표 비율 대비 편차를 시각화하여 리밸런싱 필요 여부를 알려주는 대시보드 구축

## ✅ 기존 인프라 확인

### 타입 시스템 (src/types/vault.ts) - ✅ 완료

이미 모든 필요한 타입이 정의되어 있습니다:

**주요 타입**:
- `VaultStatus`: 전체 볼트 상태 (Hot/Cold 지갑, 알림, 성능 지표)
- `WalletInfo`: 지갑 정보 (자산, 활용률, 상태, 보안 수준)
- `BalanceStatus`: Hot/Cold 비율 상태 (목표 vs 실제, 편차, 리밸런싱 필요 여부)
- `VaultAlert`: 알림 시스템 (리밸런싱 필요, 잔액 부족, 보안 경고)
- `AssetValue`: 자산 가치 (잔액, KRW/USD 가치, 24시간 변동률)
- `RebalancingRecord`: 리밸런싱 이력
- `DeviationStatus`: 편차 상태 (optimal/acceptable/warning/critical)

**결론**: 추가 타입 정의 불필요 ✅

### API 서비스 레이어 (src/services/vaultApi.ts) - ✅ 완료

이미 모든 필요한 API 함수가 구현되어 있습니다:

**조회 API**:
```typescript
getVaultStatus(): Promise<VaultStatus>
getHotWalletBalance(): Promise<VaultValue>
getColdWalletBalance(): Promise<VaultValue>
getHotColdRatio(): Promise<BalanceStatus>
getVaultAlerts(): Promise<VaultAlert[]>
getVaultStatistics(period: 'day' | 'week' | 'month'): Promise<Statistics>
getRebalancingHistory(limit: number): Promise<RebalancingRecord[]>
```

**결론**: API 서비스 레이어 완벽 구현 완료 ✅

## 🏗️ UI 컴포넌트 설계

### 페이지 구조

**경로**: `/admin/vault/monitoring`

**레이아웃**: 3단 구조 + 우측 사이드바

```
┌────────────────────────────────────────────────────────┬──────────────┐
│  상단: 통계 카드 (4개)                                       │  우측 사이드바  │
│  [Total Value] [Hot Wallet] [Cold Wallet] [Security]   │  [알림 패널]   │
├────────────────────────────────────────────────────────┤              │
│  메인: Hot/Cold 비율 차트 (2단)                            │              │
│  ┌──────────────────┬──────────────────────────────┐   │              │
│  │ 도넛 차트          │ 목표 vs 실제 바 차트            │   │              │
│  │ (현재 비율)        │ (편차 표시)                    │   │              │
│  └──────────────────┴──────────────────────────────┘   │              │
├────────────────────────────────────────────────────────┤              │
│  하단: 자산별 분포 테이블                                    │              │
│  [BTC] [ETH] [USDT] [USDC] [SOL]                      │              │
│  각 자산의 Hot/Cold 분포 + Progress Bar + 리밸런싱 상태   │              │
└────────────────────────────────────────────────────────┴──────────────┘
```

### 컴포넌트 분할

#### 1. VaultStats.tsx (통계 카드 컴포넌트)

**경로**: `src/app/admin/vault/monitoring/components/VaultStats.tsx`
**예상 코드량**: 120라인

**4개 통계 카드**:

1. **Total Value** (총 자산 가치)
   - 총 자산 가치 (KRW, USD)
   - 24시간 변동률 (%)
   - 자산 구성 (5개 자산)

2. **Hot Wallet Status** (Hot 지갑 상태)
   - Hot 지갑 총 가치
   - 활용률 (Utilization Rate)
   - 현재 비율 vs 목표 비율 (20%)
   - 상태 배지 (normal/low/high/critical)

3. **Cold Wallet Status** (Cold 지갑 상태)
   - Cold 지갑 총 가치
   - 보안 수준 (Security Level)
   - 현재 비율 vs 목표 비율 (80%)
   - 마지막 활동 시간

4. **Security Score** (보안 점수)
   - 보안 점수 (0-100)
   - 최근 30일 보안 사고 수
   - 시스템 가동률 (Uptime %)
   - 트랜잭션 성공률 (%)

**Props**:
```typescript
interface VaultStatsProps {
  vaultStatus: VaultStatus;
  isLoading: boolean;
}
```

#### 2. RatioChart.tsx (비율 차트 섹션)

**경로**: `src/app/admin/vault/monitoring/components/RatioChart.tsx`
**예상 코드량**: 150라인

**2개 차트 포함**:

1. **DonutChart** (좌측 - 도넛 차트)
   - 현재 Hot/Cold 비율 시각화
   - 중앙에 총 자산 가치 표시
   - Sapphire 테마 컬러 (Hot: 블루, Cold: 퍼플)
   - 범례: Hot XX%, Cold XX%

2. **RatioComparisonChart** (우측 - 바 차트)
   - 목표 비율 바: Hot 20%, Cold 80% (회색 배경)
   - 실제 비율 바: 현재 비율 (컬러)
   - 편차 표시:
     - Optimal (±2%): 초록색
     - Acceptable (±5%): 노란색
     - Warning (±10%): 오렌지
     - Critical (>±10%): 빨간색
   - 편차 수치 표시 (예: "+3.5%")

**Props**:
```typescript
interface RatioChartProps {
  balanceStatus: BalanceStatus;
  totalValue: VaultValue;
  isLoading: boolean;
}
```

#### 3. AssetDistributionTable.tsx (자산 분포 테이블)

**경로**: `src/app/admin/vault/monitoring/components/AssetDistributionTable.tsx`
**예상 코드량**: 180라인

**테이블 컬럼**:
1. **자산** (Asset): BTC, ETH, USDT, USDC, SOL
2. **Hot 지갑**: 잔액 + USD 가치
3. **Cold 지갑**: 잔액 + USD 가치
4. **총 잔액**: 합계
5. **Hot/Cold 비율**: Progress Bar (Hot 파란색 / Cold 보라색)
6. **목표 비율**: 20% / 80%
7. **편차**: ±X%
8. **상태**: optimal/acceptable/warning/critical 배지
9. **리밸런싱**: 필요 여부 + 권장 금액

**기능**:
- 정렬: 자산명, Hot 잔액, Cold 잔액, 총 잔액, 편차
- 필터: 리밸런싱 필요 자산만 보기
- Progress Bar: Hot/Cold 비율 시각화 (0-100%)

**Props**:
```typescript
interface AssetDistributionTableProps {
  hotWallet: WalletInfo;
  coldWallet: WalletInfo;
  isLoading: boolean;
}
```

#### 4. AlertPanel.tsx (알림 패널)

**경로**: `src/app/admin/vault/monitoring/components/AlertPanel.tsx`
**예상 코드량**: 100라인

**알림 유형**:
1. **REBALANCING_NEEDED**: 리밸런싱 필요
   - 현재 비율 vs 목표 비율
   - 편차 수치
   - 권장 조치: "리밸런싱 시작"

2. **HOT_WALLET_LOW**: Hot 지갑 잔액 부족
   - 현재 활용률 (%)
   - 권장 조치: "Cold → Hot 이체"

3. **HOT_WALLET_HIGH**: Hot 지갑 잔액 과다
   - 현재 비율
   - 권장 조치: "Hot → Cold 이체"

4. **SECURITY_BREACH**: 보안 경고
   - 보안 수준 저하
   - 권장 조치: "보안 설정 검토"

**알림 표시**:
- 심각도별 색상: INFO(파란색), WARNING(노란색), ERROR(오렌지), CRITICAL(빨간색)
- 생성 시간 (상대 시간: "3분 전")
- 해결/확인 버튼

**Props**:
```typescript
interface AlertPanelProps {
  alerts: VaultAlert[];
  onResolve: (alertId: string) => void;
  isLoading: boolean;
}
```

#### 5. page.tsx (메인 페이지)

**경로**: `src/app/admin/vault/monitoring/page.tsx`
**예상 코드량**: 100라인

**책임**:
- React Query hooks 통합
- 4개 컴포넌트 레이아웃 구성
- 로딩 상태 관리
- 에러 처리
- 자동 갱신 (10초마다 폴링)

**구조**:
```tsx
export default function VaultMonitoringPage() {
  const { data: vaultStatus, isLoading } = useVaultStatus();
  const { data: alerts } = useVaultAlerts();
  const { mutate: resolveAlert } = useResolveAlert();

  return (
    <div className="container mx-auto p-6">
      <h1>Hot/Cold 볼트 모니터링</h1>

      <VaultStats vaultStatus={vaultStatus} isLoading={isLoading} />

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <RatioChart balanceStatus={vaultStatus.balanceStatus} />
          <AssetDistributionTable
            hotWallet={vaultStatus.hotWallet}
            coldWallet={vaultStatus.coldWallet}
          />
        </div>

        <div className="col-span-1">
          <AlertPanel alerts={alerts} onResolve={resolveAlert} />
        </div>
      </div>
    </div>
  );
}
```

## 🔗 React Query Hooks 설계

### 파일: src/hooks/useVault.ts

**예상 코드량**: 250라인

### Query Hooks (6개)

#### 1. useVaultStatus()
```typescript
export function useVaultStatus() {
  return useQuery({
    queryKey: ['vaultStatus'],
    queryFn: () => vaultApi.getVaultStatus(),
    staleTime: 10000, // 10초
    refetchInterval: 10000, // 10초마다 자동 갱신
    retry: 3,
    retryDelay: 1000
  });
}
```

**사용 목적**: 전체 볼트 상태 조회 (Hot/Cold 지갑, 비율, 알림)

#### 2. useHotWalletBalance()
```typescript
export function useHotWalletBalance() {
  return useQuery({
    queryKey: ['hotWalletBalance'],
    queryFn: () => vaultApi.getHotWalletBalance(),
    staleTime: 10000,
    retry: 3
  });
}
```

**사용 목적**: Hot 지갑 잔액 조회

#### 3. useColdWalletBalance()
```typescript
export function useColdWalletBalance() {
  return useQuery({
    queryKey: ['coldWalletBalance'],
    queryFn: () => vaultApi.getColdWalletBalance(),
    staleTime: 10000,
    retry: 3
  });
}
```

**사용 목적**: Cold 지갑 잔액 조회

#### 4. useVaultAlerts()
```typescript
export function useVaultAlerts() {
  return useQuery({
    queryKey: ['vaultAlerts'],
    queryFn: () => vaultApi.getVaultAlerts(),
    staleTime: 5000, // 5초 (알림은 더 자주 갱신)
    refetchInterval: 5000,
    retry: 2
  });
}
```

**사용 목적**: 알림 목록 조회 (리밸런싱 필요, 잔액 부족 등)

#### 5. useVaultStatistics(period)
```typescript
export function useVaultStatistics(period: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: ['vaultStatistics', period],
    queryFn: () => vaultApi.getVaultStatistics(period),
    staleTime: 30000, // 30초
    retry: 3
  });
}
```

**사용 목적**: 기간별 통계 조회 (일/주/월)

#### 6. useRebalancingHistory(limit)
```typescript
export function useRebalancingHistory(limit: number = 50) {
  return useQuery({
    queryKey: ['rebalancingHistory', limit],
    queryFn: () => vaultApi.getRebalancingHistory(limit),
    staleTime: 30000,
    retry: 3
  });
}
```

**사용 목적**: 리밸런싱 이력 조회

### Mutation Hooks (2개 - Task 5.2용이지만 미리 정의)

#### 1. useResolveAlert()
```typescript
export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => vaultApi.resolveAlert(alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultAlerts'] });
      toast.success('알림이 해결되었습니다');
    },
    onError: () => {
      toast.error('알림 해결에 실패했습니다');
    }
  });
}
```

**사용 목적**: 알림 해결/확인

#### 2. useInitiateRebalancing() (Task 5.2용)
```typescript
export function useInitiateRebalancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RebalancingRequest) =>
      vaultApi.initiateRebalancing(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaultStatus'] });
      queryClient.invalidateQueries({ queryKey: ['rebalancingHistory'] });
      toast.success('리밸런싱이 시작되었습니다');
    },
    onError: () => {
      toast.error('리밸런싱 시작에 실패했습니다');
    }
  });
}
```

**사용 목적**: 리밸런싱 시작 (Task 5.2에서 사용)

### Polling Hook

#### useVaultPolling()
```typescript
export function useVaultPolling() {
  const vaultStatus = useVaultStatus();
  const vaultAlerts = useVaultAlerts();

  return {
    vaultStatus,
    vaultAlerts,
    isLoading: vaultStatus.isLoading || vaultAlerts.isLoading,
    isError: vaultStatus.isError || vaultAlerts.isError
  };
}
```

**사용 목적**: 전체 볼트 데이터 자동 갱신 (10초마다)

## 📊 차트 라이브러리

### Recharts 선택

**이유**:
- React 친화적
- TypeScript 지원 우수
- Shadcn UI와 호환성 좋음
- 커스터마이징 용이

**설치**:
```bash
npm install recharts
```

### 차트 컴포넌트 설계

#### 1. DonutChart.tsx

**경로**: `src/app/admin/vault/monitoring/components/DonutChart.tsx`
**예상 코드량**: 100라인

**차트 타입**: PieChart (도넛 형태)

**데이터 구조**:
```typescript
const data = [
  { name: 'Hot Wallet', value: 20, fill: '#3b82f6' }, // 블루
  { name: 'Cold Wallet', value: 80, fill: '#8b5cf6' } // 퍼플
];
```

**주요 기능**:
- 중앙에 총 자산 가치 표시
- 마우스 오버 시 상세 정보 (KRW, USD)
- 범례 표시 (Hot XX%, Cold XX%)
- 애니메이션 효과

**Props**:
```typescript
interface DonutChartProps {
  hotRatio: number;
  coldRatio: number;
  totalValue: string;
  hotValue: string;
  coldValue: string;
}
```

#### 2. RatioComparisonChart.tsx

**경로**: `src/app/admin/vault/monitoring/components/RatioComparisonChart.tsx`
**예상 코드량**: 100라인

**차트 타입**: BarChart (가로 바 차트)

**데이터 구조**:
```typescript
const data = [
  { name: 'Target', hot: 20, cold: 80 },
  { name: 'Actual', hot: actualHotRatio, cold: actualColdRatio }
];
```

**주요 기능**:
- 목표 비율 바 (회색 배경)
- 실제 비율 바 (편차 상태에 따른 색상)
- 편차 수치 표시 (±X%)
- 툴팁: 상세 정보

**Props**:
```typescript
interface RatioComparisonChartProps {
  balanceStatus: BalanceStatus;
  deviationStatus: DeviationStatus;
}
```

## 🎨 Shadcn UI 컴포넌트

### 추가 설치 필요 컴포넌트

```bash
# Alert 컴포넌트 (알림 패널용)
npx shadcn@latest add alert

# Progress 컴포넌트 (Progress Bar용)
npx shadcn@latest add progress

# Table 컴포넌트 (자산 분포 테이블용)
npx shadcn@latest add table

# Tabs 컴포넌트 (통계 기간 선택용)
npx shadcn@latest add tabs

# Toast 컴포넌트 (알림용)
npx shadcn@latest add toast
```

### 기존 컴포넌트 활용

- **Card**: 통계 카드, 차트 카드
- **Badge**: 상태 배지 (optimal/warning/critical)
- **Button**: 액션 버튼 (알림 해결, 리밸런싱 시작)
- **Select**: 기간 선택 (day/week/month)

## 🔄 자동 갱신 전략

### 폴링 주기

1. **볼트 상태**: 10초마다 갱신
   - `useVaultStatus()`: refetchInterval: 10000
   - 잔액, 비율, 자산 분포 실시간 모니터링

2. **알림**: 5초마다 갱신
   - `useVaultAlerts()`: refetchInterval: 5000
   - 긴급 알림 빠른 감지

3. **통계**: 30초마다 갱신
   - `useVaultStatistics()`: staleTime: 30000
   - 리소스 절약

4. **리밸런싱 이력**: 30초마다 갱신
   - `useRebalancingHistory()`: staleTime: 30000

### React Query 설정

```typescript
// src/app/layout.tsx에서 React Query Provider 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
    }
  }
});
```

## 🎨 Sapphire 테마 적용

### 컬러 팔레트

**Hot Wallet (블루 계열)**:
- 기본: `#3b82f6` (blue-500)
- 호버: `#2563eb` (blue-600)
- 배경: `#dbeafe` (blue-100)

**Cold Wallet (퍼플 계열)**:
- 기본: `#8b5cf6` (purple-500)
- 호버: `#7c3aed` (purple-600)
- 배경: `#ede9fe` (purple-100)

**상태 색상**:
- Optimal: `#10b981` (green-500)
- Acceptable: `#eab308` (yellow-500)
- Warning: `#f97316` (orange-500)
- Critical: `#ef4444` (red-500)

### 그라데이션 효과

```css
/* Hot Wallet 그라데이션 */
background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);

/* Cold Wallet 그라데이션 */
background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);

/* Sapphire 테마 그라데이션 */
background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
```

## 📱 반응형 디자인

### 브레이크포인트

- **모바일** (< 768px): 단일 컬럼, 사이드바 하단 배치
- **태블릿** (768px - 1024px): 2컬럼 그리드
- **데스크톱** (> 1024px): 3컬럼 그리드 (메인 2 + 사이드바 1)

### 레이아웃 조정

```typescript
// 모바일: 세로 스택
<div className="flex flex-col gap-4 lg:grid lg:grid-cols-3">

// 데스크톱: 2:1 비율 그리드
<div className="col-span-2">...</div>
<div className="col-span-1">...</div>
```

## 📁 파일 구조

```
src/
├── app/
│   └── admin/
│       └── vault/
│           └── monitoring/
│               ├── page.tsx (메인 페이지, 100라인)
│               └── components/
│                   ├── VaultStats.tsx (통계 카드, 120라인)
│                   ├── RatioChart.tsx (비율 차트, 150라인)
│                   ├── AssetDistributionTable.tsx (자산 테이블, 180라인)
│                   ├── AlertPanel.tsx (알림 패널, 100라인)
│                   ├── DonutChart.tsx (도넛 차트, 100라인)
│                   └── RatioComparisonChart.tsx (바 차트, 100라인)
├── hooks/
│   └── useVault.ts (React Query hooks, 250라인)
├── services/
│   └── vaultApi.ts (이미 구현 완료 ✅)
└── types/
    └── vault.ts (이미 구현 완료 ✅)
```

## 📊 예상 코드량

### 컴포넌트별 코드량

| 파일 | 예상 라인 수 | 설명 |
|------|------------|------|
| page.tsx | 100라인 | 메인 페이지 레이아웃 |
| VaultStats.tsx | 120라인 | 4개 통계 카드 |
| RatioChart.tsx | 150라인 | 비율 차트 섹션 |
| AssetDistributionTable.tsx | 180라인 | 자산 분포 테이블 |
| AlertPanel.tsx | 100라인 | 알림 패널 |
| DonutChart.tsx | 100라인 | 도넛 차트 |
| RatioComparisonChart.tsx | 100라인 | 바 차트 |
| useVault.ts | 250라인 | React Query hooks |
| **총계** | **1,200라인** | **전체 코드량** |

## ⏱️ 예상 소요시간

| 단계 | 예상 시간 | 설명 |
|------|----------|------|
| 라이브러리 설치 | 10분 | Recharts, Shadcn 컴포넌트 |
| React Query Hooks | 40분 | useVault.ts 구현 |
| 차트 컴포넌트 | 40분 | DonutChart, RatioComparisonChart |
| UI 컴포넌트 | 90분 | 4개 UI 컴포넌트 구현 |
| 메인 페이지 | 20분 | 레이아웃 통합 |
| 사이드메뉴 라우팅 | 10분 | AdminSidebar 업데이트 |
| 테스트 및 검증 | 30분 | UI/UX 테스트, 버그 수정 |
| **총계** | **3-4시간** | **전체 구현 시간** |

## 🧪 테스트 시나리오

### 기본 기능 테스트

```bash
# 개발 서버 실행
npm run dev

# URL 접속
http://localhost:3010/admin/vault/monitoring

# 확인 사항
✅ 4개 통계 카드 표시 (Total Value, Hot, Cold, Security)
✅ 도넛 차트로 Hot/Cold 비율 시각화
✅ 바 차트로 목표 vs 실제 비율 비교
✅ 자산별 분포 테이블 (5개 자산)
✅ Progress Bar로 각 자산의 Hot/Cold 비율 표시
✅ 알림 패널 (리밸런싱 필요, 잔액 부족)
✅ 10초마다 자동 갱신 (폴링)
✅ 반응형 레이아웃 (모바일/태블릿/데스크톱)
```

### 자동 갱신 테스트

1. 볼트 모니터링 페이지 진입
2. 브라우저 콘솔에서 10초마다 "Polling..." 확인
3. 잔액 및 비율이 자동으로 업데이트되는지 확인
4. 알림이 5초마다 갱신되는지 확인

### 알림 테스트

1. Mock 데이터에서 리밸런싱 필요 상태 생성
2. 알림 패널에 REBALANCING_NEEDED 알림 표시 확인
3. [해결] 버튼 클릭 시 알림 제거 확인
4. Toast 알림 표시 확인

### 반응형 테스트

1. 데스크톱: 3컬럼 그리드 (메인 2 + 사이드바 1)
2. 태블릿: 2컬럼 그리드
3. 모바일: 단일 컬럼, 사이드바 하단 배치

## 🔗 연관 Task

### 선행 Task

- ✅ Task 1.1: 프로젝트 초기 설정
- ✅ Task 1.2: Shadcn UI 및 테마 설정
- ✅ Phase 4: 출금 처리 시스템 (100% 완료)

### 후속 Task

- ⏳ Task 5.2: 수동 리밸런싱 도구
  - Hot→Cold, Cold→Hot 이체 인터페이스
  - 이체 금액 계산기
  - 리밸런싱 이력 및 사유 기록
  - Air-gap 서명 연동

## 🚀 구현 순서

### Step 1: 라이브러리 설치 (10분)

```bash
# Recharts 설치
npm install recharts

# Shadcn 컴포넌트 설치
npx shadcn@latest add alert
npx shadcn@latest add progress
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add toast
```

### Step 2: React Query Hooks (40분)

**파일**: `src/hooks/useVault.ts`

1. useVaultStatus() 구현
2. useHotWalletBalance() 구현
3. useColdWalletBalance() 구현
4. useVaultAlerts() 구현
5. useVaultStatistics() 구현
6. useRebalancingHistory() 구현
7. useResolveAlert() 구현 (Mutation)
8. useVaultPolling() 구현

### Step 3: 차트 컴포넌트 (40분)

**파일**:
- `src/app/admin/vault/monitoring/components/DonutChart.tsx`
- `src/app/admin/vault/monitoring/components/RatioComparisonChart.tsx`

1. DonutChart 구현 (Recharts PieChart)
2. RatioComparisonChart 구현 (Recharts BarChart)
3. Sapphire 테마 컬러 적용
4. 툴팁 및 범례 추가

### Step 4: UI 컴포넌트 (90분)

**4개 컴포넌트 순차 구현**:

1. VaultStats.tsx (20분)
   - 4개 통계 카드
   - 로딩 상태 처리

2. RatioChart.tsx (25분)
   - DonutChart + RatioComparisonChart 통합
   - 레이아웃 구성

3. AssetDistributionTable.tsx (30분)
   - Shadcn Table 사용
   - Progress Bar 추가
   - 정렬 및 필터 기능

4. AlertPanel.tsx (15분)
   - Shadcn Alert 사용
   - 심각도별 색상
   - 해결 버튼

### Step 5: 메인 페이지 (20분)

**파일**: `src/app/admin/vault/monitoring/page.tsx`

1. React Query hooks 통합
2. 4개 컴포넌트 레이아웃 구성
3. 로딩 상태 관리
4. 에러 처리

### Step 6: 사이드메뉴 라우팅 (10분)

**파일**: `src/components/admin/layout/AdminSidebar.tsx`

1. "볼트 관리" 섹션 추가
2. "Hot/Cold 모니터링" 메뉴 아이템 추가
3. 아이콘: Vault (lucide-react)

### Step 7: 테스트 및 검증 (30분)

1. UI 테스트 (모든 컴포넌트 표시 확인)
2. 자동 갱신 테스트 (10초 폴링)
3. 알림 테스트 (해결 버튼)
4. 반응형 테스트 (모바일/태블릿/데스크톱)
5. 버그 수정 및 최적화

## 📝 구현 체크리스트

### 라이브러리 설치
- [ ] Recharts 설치
- [ ] Shadcn Alert 컴포넌트 추가
- [ ] Shadcn Progress 컴포넌트 추가
- [ ] Shadcn Table 컴포넌트 추가
- [ ] Shadcn Tabs 컴포넌트 추가
- [ ] Shadcn Toast 컴포넌트 추가

### React Query Hooks
- [ ] useVaultStatus() 구현
- [ ] useHotWalletBalance() 구현
- [ ] useColdWalletBalance() 구현
- [ ] useVaultAlerts() 구현
- [ ] useVaultStatistics() 구현
- [ ] useRebalancingHistory() 구현
- [ ] useResolveAlert() 구현
- [ ] useVaultPolling() 구현

### 차트 컴포넌트
- [ ] DonutChart.tsx 구현
- [ ] RatioComparisonChart.tsx 구현
- [ ] Sapphire 테마 적용
- [ ] 툴팁 및 범례 추가

### UI 컴포넌트
- [ ] VaultStats.tsx 구현
- [ ] RatioChart.tsx 구현
- [ ] AssetDistributionTable.tsx 구현
- [ ] AlertPanel.tsx 구현

### 메인 페이지
- [ ] page.tsx 구현
- [ ] React Query hooks 통합
- [ ] 레이아웃 구성
- [ ] 로딩/에러 처리

### 사이드메뉴
- [ ] AdminSidebar.tsx 업데이트
- [ ] "볼트 관리" 섹션 추가
- [ ] "Hot/Cold 모니터링" 메뉴 추가

### 테스트
- [ ] UI 테스트 (모든 컴포넌트)
- [ ] 자동 갱신 테스트 (폴링)
- [ ] 알림 테스트
- [ ] 반응형 테스트
- [ ] 버그 수정

## 🎉 완료 기준

### 기능 완료 조건

1. **통계 카드**: 4개 카드 모두 표시, 실시간 데이터 업데이트 ✅
2. **비율 차트**: 도넛 차트 + 바 차트 정상 작동 ✅
3. **자산 분포 테이블**: 5개 자산 모두 표시, Progress Bar 작동 ✅
4. **알림 패널**: 알림 표시 및 해결 기능 작동 ✅
5. **자동 갱신**: 10초마다 폴링 확인 ✅
6. **반응형**: 모바일/태블릿/데스크톱 레이아웃 정상 ✅
7. **사이드메뉴**: 라우팅 정상 작동 ✅

### 품질 기준

- TypeScript 타입 에러 0개
- ESLint 경고 0개
- 모든 컴포넌트 200-300라인 이내
- Sapphire 테마 일관성 유지
- 접근성(Accessibility) 기본 준수
- 로딩 상태 및 에러 처리 완료

## 📈 성능 목표

- 초기 로딩: < 2초
- API 응답: < 500ms (Mock)
- 자동 갱신: 10초마다 (리소스 효율적)
- 메모리 사용: < 100MB (React Query 캐싱)
- UI 반응성: < 100ms (사용자 인터랙션)

---

**작성일**: 2025-10-14
**Phase 5 시작**: Task 5.1 - Hot/Cold 볼트 모니터링 시스템
**다음 Task**: Task 5.2 - 수동 리밸런싱 도구
