# Pending Withdrawal Assets Summary - Design Specification

## 1. Overview

**Purpose**: 관리자가 현재 승인 대기(approval_waiting) 상태의 출금 요청들에서 실제로 이체해야 하는 자산의 종류와 총 수량을 한눈에 파악할 수 있는 UI 컴포넌트

**Location**: `/admin/withdrawal-v2/requests` 페이지, AssetWalletRatioSection 하단

**Key Requirements**:
- 승인 대기 중인 출금 요청만 집계
- 자산별로 그룹화하여 표시
- 총 이체 금액 KRW 환산 표시
- 긴급(urgent) 요청 수 강조
- 실시간 데이터 반영

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
PendingWithdrawalAssetsSection (New)
├── Card (Shadcn UI)
│   ├── CardHeader
│   │   ├── CardTitle ("승인 대기 중인 출금 자산")
│   │   └── Badge (총 요청 수)
│   └── CardContent
│       ├── PendingAssetsSummaryGrid
│       │   └── AssetSummaryCard[] (자산별 카드)
│       └── TotalSummaryBar (총 금액 및 긴급 요청)
```

### 2.2 Data Flow

```typescript
// 입력: 전체 출금 요청 목록
requests: WithdrawalV2Request[]

// 처리: approval_waiting 상태만 필터링 및 자산별 집계
const pendingRequests = requests.filter(r => r.status === 'approval_waiting')

// 출력: 자산별 집계 정보
interface AssetPendingSummary {
  asset: AssetType;           // 자산 종류 (BTC, ETH, USDT, USDC, SOL)
  totalAmount: string;        // 총 수량
  totalValueKRW: string;      // 원화 환산
  requestCount: number;       // 요청 건수
  urgentCount: number;        // 긴급 요청 건수
  memberIds: string[];        // 관련 회원사 ID
}
```

---

## 3. UI Design Specification

### 3.1 Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│ 🔄 승인 대기 중인 출금 자산                    Badge: 8건   │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ BTC Icon │  │ ETH Icon │  │ USDT Icon│  │ SOL Icon │   │
│  │  BTC     │  │   ETH    │  │   USDT   │  │   SOL    │   │
│  │  52.5    │  │  600.0   │  │ 10,000   │  │ 5,000.0  │   │
│  │ 3건 요청  │  │  2건 요청 │  │  2건 요청 │  │  1건 요청 │   │
│  │ 1건 긴급  │  │  0건 긴급 │  │  1건 긴급 │  │  0건 긴급 │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 총 이체 금액: ₩ 7,240,000,000 | 긴급 요청: 2건      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Specifications

#### A. AssetSummaryCard (자산별 카드)

**Visual Design**:
- 카드 크기: 180px × 160px
- 배경: Card 컴포넌트 (Shadcn UI)
- 호버 효과: hover:shadow-lg transition
- 그리드: grid grid-cols-5 gap-4 (5개 자산 지원)

**Content Structure**:
```tsx
<Card className="hover:shadow-lg transition-shadow">
  <CardContent className="p-4 space-y-3">
    {/* 자산 아이콘 및 이름 */}
    <div className="flex items-center gap-2">
      <CryptoIcon symbol="BTC" size={32} />
      <span className="text-sm font-medium text-muted-foreground">BTC</span>
    </div>

    {/* 총 수량 */}
    <div className="text-2xl font-bold">52.5</div>

    {/* 요청 건수 */}
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <FileText className="w-4 h-4" />
      <span>3건 요청</span>
    </div>

    {/* 긴급 요청 (조건부 표시) */}
    {urgentCount > 0 && (
      <Badge variant="destructive" className="text-xs">
        <AlertTriangle className="w-3 h-3 mr-1" />
        {urgentCount}건 긴급
      </Badge>
    )}
  </CardContent>
</Card>
```

#### B. TotalSummaryBar (총 금액 바)

**Visual Design**:
- 배경: bg-muted/50 (반투명 배경)
- 패딩: p-4
- 레이아아웃: flex justify-between items-center

**Content Structure**:
```tsx
<div className="bg-muted/50 rounded-lg p-4 flex justify-between items-center">
  {/* 총 이체 금액 */}
  <div className="flex items-center gap-2">
    <DollarSign className="w-5 h-5 text-primary" />
    <span className="text-sm font-medium text-muted-foreground">총 이체 금액</span>
    <span className="text-xl font-bold">₩ 7,240,000,000</span>
  </div>

  {/* 긴급 요청 수 */}
  {urgentCount > 0 && (
    <div className="flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-destructive" />
      <span className="text-sm font-medium text-muted-foreground">긴급 요청</span>
      <Badge variant="destructive">{urgentCount}건</Badge>
    </div>
  )}
</div>
```

### 3.3 Empty State (승인 대기 없음)

```tsx
<Card>
  <CardContent className="p-8 text-center">
    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
    <p className="text-lg font-medium text-muted-foreground">
      현재 승인 대기 중인 출금 요청이 없습니다
    </p>
    <p className="text-sm text-muted-foreground mt-2">
      모든 출금 요청이 처리되었습니다
    </p>
  </CardContent>
</Card>
```

---

## 4. Data Processing Logic

### 4.1 Asset Aggregation Function

```typescript
interface AssetPendingSummary {
  asset: AssetType;
  totalAmount: string;
  totalValueKRW: string;
  requestCount: number;
  urgentCount: number;
  memberIds: string[];
}

function aggregatePendingAssets(
  requests: WithdrawalV2Request[]
): AssetPendingSummary[] {
  // 1. approval_waiting 상태만 필터링
  const pendingRequests = requests.filter(
    r => r.status === 'approval_waiting'
  );

  // 2. 자산별로 그룹화
  const grouped = pendingRequests.reduce((acc, req) => {
    const { asset, amount, priority, memberId } = req;

    if (!acc[asset]) {
      acc[asset] = {
        asset,
        totalAmount: 0,
        requestCount: 0,
        urgentCount: 0,
        memberIds: [],
      };
    }

    // 수량 누적
    acc[asset].totalAmount += parseFloat(amount);
    acc[asset].requestCount += 1;

    // 긴급 요청 카운트
    if (priority === 'urgent') {
      acc[asset].urgentCount += 1;
    }

    // 회원사 ID 수집 (중복 제거)
    if (!acc[asset].memberIds.includes(memberId)) {
      acc[asset].memberIds.push(memberId);
    }

    return acc;
  }, {} as Record<AssetType, any>);

  // 3. KRW 환산 (Mock 환율 적용)
  const mockPrices: Record<AssetType, number> = {
    BTC: 80_000_000,   // 8천만원
    ETH: 5_000_000,    // 5백만원
    USDT: 1_300,       // 1,300원
    USDC: 1_300,       // 1,300원
    SOL: 150_000,      // 15만원
    CUSTOM_ERC20: 0,
  };

  return Object.values(grouped).map(item => ({
    ...item,
    totalAmount: item.totalAmount.toString(),
    totalValueKRW: (item.totalAmount * mockPrices[item.asset]).toLocaleString('ko-KR'),
  }));
}
```

### 4.2 Total Summary Calculation

```typescript
interface TotalPendingSummary {
  totalValueKRW: string;
  totalRequests: number;
  totalUrgentRequests: number;
  assetCount: number;
}

function calculateTotalSummary(
  summaries: AssetPendingSummary[]
): TotalPendingSummary {
  const totalValueKRW = summaries.reduce(
    (sum, item) => sum + parseFloat(item.totalValueKRW.replace(/,/g, '')),
    0
  );

  const totalRequests = summaries.reduce(
    (sum, item) => sum + item.requestCount,
    0
  );

  const totalUrgentRequests = summaries.reduce(
    (sum, item) => sum + item.urgentCount,
    0
  );

  return {
    totalValueKRW: totalValueKRW.toLocaleString('ko-KR'),
    totalRequests,
    totalUrgentRequests,
    assetCount: summaries.length,
  };
}
```

---

## 5. Implementation Files

### 5.1 New Component Files

```
src/app/admin/withdrawal-v2/requests/components/
├── PendingWithdrawalAssetsSection.tsx  (Main container)
├── AssetSummaryCard.tsx                 (Individual asset card)
└── TotalSummaryBar.tsx                  (Total summary bar)
```

### 5.2 Updated Files

```
src/app/admin/withdrawal-v2/requests/
└── page.tsx  (통합: AssetWalletRatioSection 아래에 추가)
```

---

## 6. Integration Pattern

### 6.1 Page Integration

```tsx
// src/app/admin/withdrawal-v2/requests/page.tsx

export default function WithdrawalRequestsPage() {
  const [requests, setRequests] = useState<WithdrawalV2Request[]>([...]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">출금 요청 관리</h1>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 자산별 Hot/Cold 지갑 비율 */}
      <AssetWalletRatioSection />

      {/* 🆕 승인 대기 중인 출금 자산 (NEW) */}
      <PendingWithdrawalAssetsSection requests={requests} />

      {/* 출금 요청 테이블 */}
      <RequestTable requests={requests} onView={handleView} />

      {/* 상세 정보 모달 */}
      <RequestDetailModal ... />
    </div>
  );
}
```

---

## 7. Responsive Design

### 7.1 Breakpoints

```typescript
// Desktop (default): grid-cols-5
// Tablet: grid-cols-3 (md:grid-cols-3)
// Mobile: grid-cols-2 (sm:grid-cols-2)

<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
  {assetSummaries.map(...)}
</div>
```

### 7.2 Mobile Optimization

- 카드 크기 축소: 모바일에서 p-3 적용
- 폰트 크기 조정: text-xl → text-lg
- 긴급 Badge: 아이콘만 표시 (텍스트 숨김)

---

## 8. Accessibility

### 8.1 ARIA Labels

```tsx
<Card aria-label={`${asset} 승인 대기 요약`}>
  <CardContent>
    <CryptoIcon symbol={asset} size={32} aria-hidden="true" />
    <span aria-label={`자산 종류: ${getAssetDisplayName(asset)}`}>
      {asset}
    </span>
    <div aria-label={`총 수량: ${totalAmount}`}>
      {totalAmount}
    </div>
    <div aria-label={`요청 건수: ${requestCount}건`}>
      {requestCount}건 요청
    </div>
  </CardContent>
</Card>
```

### 8.2 Keyboard Navigation

- 카드는 tab으로 이동 가능 (tabIndex={0})
- Enter 키로 상세 정보 확인 (향후 모달 연동)

---

## 9. Performance Considerations

### 9.1 Memoization

```tsx
const assetSummaries = useMemo(
  () => aggregatePendingAssets(requests),
  [requests]
);

const totalSummary = useMemo(
  () => calculateTotalSummary(assetSummaries),
  [assetSummaries]
);
```

### 9.2 Update Frequency

- 데이터 업데이트: 부모 컴포넌트(page.tsx)의 requests 변경 시 자동 반영
- 실시간 갱신: 30초마다 자동 새로고침 (선택적)

---

## 10. Future Enhancements

### 10.1 Interactive Features

- 자산 카드 클릭 → 해당 자산의 승인 대기 요청 목록 필터링
- 긴급 요청 Badge 클릭 → 긴급 요청만 필터링
- 총 금액 바 클릭 → 승인 대기 전체 요청 테이블로 스크롤

### 10.2 Additional Information

- 평균 대기 시간 표시
- 가장 오래된 요청 강조
- 회원사별 요청 수 분포 차트

---

## 11. Testing Scenarios

### 11.1 Unit Tests

```typescript
describe('PendingWithdrawalAssetsSection', () => {
  it('승인 대기 요청이 없으면 Empty State 표시', () => {
    const requests = [];
    render(<PendingWithdrawalAssetsSection requests={requests} />);
    expect(screen.getByText(/현재 승인 대기 중인 출금 요청이 없습니다/)).toBeInTheDocument();
  });

  it('자산별로 정확히 집계', () => {
    const requests = [
      { status: 'approval_waiting', asset: 'BTC', amount: '1.0', ... },
      { status: 'approval_waiting', asset: 'BTC', amount: '2.0', ... },
      { status: 'completed', asset: 'BTC', amount: '3.0', ... }, // 제외
    ];
    render(<PendingWithdrawalAssetsSection requests={requests} />);
    expect(screen.getByText('3.0')).toBeInTheDocument(); // 1.0 + 2.0
  });

  it('긴급 요청 수 정확히 계산', () => {
    const requests = [
      { status: 'approval_waiting', priority: 'urgent', ... },
      { status: 'approval_waiting', priority: 'normal', ... },
    ];
    render(<PendingWithdrawalAssetsSection requests={requests} />);
    expect(screen.getByText('1건 긴급')).toBeInTheDocument();
  });
});
```

### 11.2 Integration Tests

- 전체 페이지에서 컴포넌트 통합 테스트
- 새로고침 시 데이터 업데이트 확인
- 출금 요청 상태 변경 시 실시간 반영 확인

---

## 12. Implementation Priority

### Phase 1: Core Functionality
- [ ] AssetSummaryCard 기본 UI 구현
- [ ] aggregatePendingAssets 집계 로직 구현
- [ ] PendingWithdrawalAssetsSection 컨테이너 구현
- [ ] page.tsx 통합

### Phase 2: Enhancement
- [ ] TotalSummaryBar 구현
- [ ] Empty State 구현
- [ ] 긴급 요청 강조 표시

### Phase 3: Polish
- [ ] 반응형 디자인 최적화
- [ ] 접근성 ARIA 레이블 추가
- [ ] 애니메이션 효과 추가

---

## 13. Success Criteria

✅ **기능적 요구사항**:
- 승인 대기 중인 출금 요청만 정확히 집계
- 자산별 총 수량 및 KRW 환산 표시
- 긴급 요청 수 강조

✅ **비기능적 요구사항**:
- 로딩 시간 < 100ms (집계 계산)
- 모바일 반응형 지원
- WCAG 2.1 AA 접근성 준수

✅ **사용자 경험**:
- 관리자가 3초 내에 이체 필요 자산 파악 가능
- 긴급 요청 즉시 인지 가능
- 직관적인 시각적 디자인
