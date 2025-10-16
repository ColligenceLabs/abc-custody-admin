# Task 4.4: 출금 실행 모니터링 시스템 설계 문서

## 개요

**목적**: Air-gap 서명 완료 후 블록체인 브로드캐스트부터 최종 컨펌 완료까지 실시간 추적 및 관리

**핵심 기능**:
1. 트랜잭션 브로드캐스트 상태 모니터링
2. 컨펌 추적 대시보드 (실시간 컨펌 카운트)
3. 실패 처리 및 재시도 시스템
4. 완료 알림 시스템 (관리자 + 회원사)

**관련 Task**:
- Task 4.1: 출금 대기열 관리 → Task 4.2: AML 검증 → Task 4.3: Air-gap 서명 → **Task 4.4: 실행 모니터링**

---

## 1. 시스템 아키텍처

### 1.1 데이터 흐름

```
[Task 4.3: Air-gap 서명 완료]
         ↓
[브로드캐스트 준비] ← executionApi.broadcastTransaction()
         ↓
[블록체인 노드에 전송] → TxHash 생성
         ↓
[Mempool 진입] → status: "broadcasted"
         ↓
[블록 포함 대기] → 10초마다 컨펌 수 체크
         ↓
[컨펌 진행] → 1/6 → 2/6 → 3/6 → 4/6 → 5/6 → 6/6
         ↓
[완료 처리] → status: "completed"
         ↓
[알림 발송] → 관리자 Toast + 회원사 이메일
```

### 1.2 실패 처리 및 재시도 흐름

```
[브로드캐스트 실패 감지]
         ↓
[실패 유형 분류]
    ├─ BroadcastFailed → 3회 재시도 (1분 간격)
    ├─ InsufficientFee → RBF로 수수료 증가 후 재전송
    ├─ NetworkTimeout → 5회 재시도 (30초 간격)
    ├─ DoubleSpend → 수동 검토 플래그
    └─ InvalidTransaction → Air-gap 단계로 되돌림
         ↓
[3회 재시도 실패] → 관리자 알림 (긴급)
         ↓
[1시간 이상 미완료] → SUPER_ADMIN Slack 알림
         ↓
[24시간 이상 미완료] → 수동 개입 필요
```

---

## 2. 데이터 구조 설계

### 2.1 TypeScript 타입 정의

```typescript
// /src/types/withdrawal.ts 확장

/**
 * 출금 실행 상태
 */
export type WithdrawalExecutionStatus =
  | "preparing"      // 브로드캐스트 준비 중
  | "broadcasting"   // 브로드캐스트 중
  | "broadcasted"    // 브로드캐스트 완료 (mempool)
  | "confirming"     // 컨펌 진행 중
  | "completed"      // 완료 (필요 컨펌 수 달성)
  | "failed"         // 실패
  | "retrying";      // 재시도 중

/**
 * 실패 유형
 */
export type BroadcastFailureType =
  | "broadcast_failed"    // 브로드캐스트 실패
  | "insufficient_fee"    // 수수료 부족
  | "network_timeout"     // 네트워크 타임아웃
  | "double_spend"        // 이중 지불 감지
  | "invalid_transaction" // 잘못된 트랜잭션
  | "node_error";         // 노드 오류

/**
 * 네트워크 혼잡도
 */
export type NetworkCongestion = "low" | "medium" | "high" | "critical";

/**
 * 출금 실행 정보
 */
export interface WithdrawalExecution {
  id: string;
  withdrawalId: string;
  memberId: string;
  memberName: string;
  asset: string;
  amount: string;
  toAddress: string;

  // 트랜잭션 정보
  txHash?: string;
  rawTransaction?: string;
  networkFee: string;

  // 상태 및 진행률
  status: WithdrawalExecutionStatus;
  confirmations: {
    current: number;
    required: number;
    progress: number; // 0-100 (percentage)
  };

  // 시간 정보
  createdAt: Date;
  broadcastedAt?: Date;
  firstConfirmedAt?: Date;
  completedAt?: Date;
  estimatedCompletionTime?: Date;

  // 재시도 정보
  retryInfo?: {
    attempt: number;
    maxAttempts: number;
    lastAttemptAt: Date;
    nextAttemptAt?: Date;
    failureType?: BroadcastFailureType;
    failureReason?: string;
  };

  // RBF (Replace-By-Fee) 정보
  rbfInfo?: {
    originalFee: string;
    currentFee: string;
    feeIncreaseCount: number;
    maxFeeIncreases: number;
  };

  // 알림 정보
  notifications: {
    adminNotified: boolean;
    memberNotified: boolean;
    escalated: boolean;
    lastNotificationAt?: Date;
  };

  // 블록체인 정보
  blockchainInfo?: {
    blockHeight?: number;
    blockHash?: string;
    blockTime?: Date;
  };

  // 감사 로그
  auditLog: AuditLogEntry[];
}

/**
 * 감사 로그 항목
 */
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  action:
    | "created"
    | "broadcasted"
    | "confirmed"
    | "completed"
    | "failed"
    | "retried"
    | "rbf_applied"
    | "escalated";
  details: string;
  performedBy?: string;
}

/**
 * 실행 통계
 */
export interface ExecutionStatistics {
  broadcasting: {
    count: number;
    totalAmount: string;
    avgBroadcastTime: number; // seconds
  };
  confirming: {
    count: number;
    totalAmount: string;
    avgProgress: number; // 0-100
    avgConfirmTime: number; // seconds per confirmation
  };
  completed24h: {
    count: number;
    totalAmount: string;
    totalFees: string;
    avgCompletionTime: number; // seconds
  };
  failed: {
    count: number;
    totalAmount: string;
    retrying: number;
    needsManualIntervention: number;
  };
}

/**
 * 네트워크 상태
 */
export interface NetworkStatus {
  asset: string; // "BTC", "ETH", "USDT"
  blockHeight: number;
  avgBlockTime: number; // seconds
  avgConfirmTime: number; // seconds

  // 수수료 정보
  feeRate: {
    slow: string;
    medium: string;
    fast: string;
    unit: string; // "sat/vB" for BTC, "gwei" for ETH
  };

  // 혼잡도
  congestion: NetworkCongestion;

  // 노드 상태
  nodeStatus: "online" | "degraded" | "offline";
  lastCheckedAt: Date;
}

/**
 * 실행 필터
 */
export interface ExecutionFilter {
  status?: WithdrawalExecutionStatus[];
  asset?: string[];
  searchQuery?: string; // TxHash, 회원사명, 주소
  dateRange?: {
    from: Date;
    to: Date;
  };
}

/**
 * 브로드캐스트 요청
 */
export interface BroadcastTransactionRequest {
  withdrawalId: string;
  signedTransaction: string;
  networkFee: string;
}

/**
 * 재시도 요청
 */
export interface RetryBroadcastRequest {
  executionId: string;
  increaseFee?: boolean; // RBF 적용 여부
  feeMultiplier?: number; // 기본 1.5배
}

/**
 * 완료 처리 요청
 */
export interface CompleteExecutionRequest {
  executionId: string;
  finalConfirmations: number;
  blockHeight: number;
  blockHash: string;
}
```

---

## 3. API 서비스 레이어

### 3.1 executionApi.ts 함수 목록

```typescript
// /src/services/executionApi.ts

/**
 * 1. 실행 통계 조회
 */
export async function getExecutionStatistics(): Promise<ExecutionStatistics>

/**
 * 2. 실행 대기열 조회 (필터링, 정렬)
 */
export async function getExecutionQueue(
  filter?: ExecutionFilter
): Promise<WithdrawalExecution[]>

/**
 * 3. 실행 상세 조회
 */
export async function getExecutionDetail(
  executionId: string
): Promise<WithdrawalExecution>

/**
 * 4. 트랜잭션 브로드캐스트
 */
export async function broadcastTransaction(
  request: BroadcastTransactionRequest
): Promise<WithdrawalExecution>

/**
 * 5. 컨펌 상태 확인 (블록체인 API 호출)
 */
export async function checkConfirmations(
  txHash: string,
  asset: string
): Promise<number>

/**
 * 6. 브로드캐스트 재시도
 */
export async function retryBroadcast(
  request: RetryBroadcastRequest
): Promise<WithdrawalExecution>

/**
 * 7. 완료 처리
 */
export async function markAsCompleted(
  request: CompleteExecutionRequest
): Promise<WithdrawalExecution>

/**
 * 8. 네트워크 상태 조회
 */
export async function getNetworkStatus(
  asset: string
): Promise<NetworkStatus>

/**
 * 9. 자동 컨펌 체크 (백그라운드 작업)
 */
export async function autoCheckConfirmations(): Promise<void>

/**
 * 10. Mock 데이터 생성
 */
export function generateMockExecutions(count: number): WithdrawalExecution[]

/**
 * 11. Mock 데이터 초기화
 */
export function initializeMockExecutions(): void
```

### 3.2 주요 로직

#### 자동 컨펌 시뮬레이션 (Mock)

```typescript
// 10초마다 실행되는 백그라운드 작업
export async function autoCheckConfirmations(): Promise<void> {
  const executions = loadExecutions();
  const now = new Date();

  for (const exec of executions) {
    if (exec.status === "confirming") {
      // 10초마다 +1 컨펌 (개발용 시뮬레이션)
      const timeSinceBroadcast = now.getTime() - exec.broadcastedAt!.getTime();
      const secondsElapsed = Math.floor(timeSinceBroadcast / 1000);
      const newConfirmations = Math.min(
        Math.floor(secondsElapsed / 10),
        exec.confirmations.required
      );

      if (newConfirmations > exec.confirmations.current) {
        exec.confirmations.current = newConfirmations;
        exec.confirmations.progress = Math.round(
          (newConfirmations / exec.confirmations.required) * 100
        );

        // 첫 컨펌 시간 기록
        if (newConfirmations === 1 && !exec.firstConfirmedAt) {
          exec.firstConfirmedAt = now;
        }

        // 완료 처리
        if (newConfirmations === exec.confirmations.required) {
          exec.status = "completed";
          exec.completedAt = now;
          exec.notifications.adminNotified = true;
          exec.notifications.memberNotified = true;

          // 감사 로그
          exec.auditLog.push({
            id: generateId(),
            timestamp: now,
            action: "completed",
            details: `${exec.confirmations.required} confirmations reached`,
          });
        }
      }
    }
  }

  saveExecutions(executions);
}
```

#### 재시도 로직

```typescript
export async function retryBroadcast(
  request: RetryBroadcastRequest
): Promise<WithdrawalExecution> {
  const exec = getExecutionDetail(request.executionId);

  if (!exec.retryInfo) {
    throw new Error("No retry info available");
  }

  // 최대 재시도 횟수 체크
  if (exec.retryInfo.attempt >= exec.retryInfo.maxAttempts) {
    exec.notifications.escalated = true;
    exec.auditLog.push({
      id: generateId(),
      timestamp: new Date(),
      action: "escalated",
      details: "Max retries exceeded, manual intervention required",
    });
    throw new Error("Max retries exceeded");
  }

  // RBF (Replace-By-Fee) 적용
  if (request.increaseFee && exec.asset === "BTC") {
    const multiplier = request.feeMultiplier || 1.5;
    const newFee = (parseFloat(exec.networkFee) * multiplier).toFixed(8);

    exec.rbfInfo = {
      originalFee: exec.rbfInfo?.originalFee || exec.networkFee,
      currentFee: newFee,
      feeIncreaseCount: (exec.rbfInfo?.feeIncreaseCount || 0) + 1,
      maxFeeIncreases: 3,
    };

    exec.networkFee = newFee;
  }

  // 재시도
  exec.status = "retrying";
  exec.retryInfo.attempt += 1;
  exec.retryInfo.lastAttemptAt = new Date();
  exec.retryInfo.nextAttemptAt = new Date(Date.now() + 60000); // 1분 후

  exec.auditLog.push({
    id: generateId(),
    timestamp: new Date(),
    action: "retried",
    details: `Retry attempt ${exec.retryInfo.attempt}/${exec.retryInfo.maxAttempts}`,
  });

  saveExecution(exec);
  return exec;
}
```

---

## 4. React Query Hooks

### 4.1 useExecution.ts Hook 목록

```typescript
// /src/hooks/useExecution.ts

/**
 * Query Hooks (자동 갱신)
 */

// 30초마다 통계 갱신
export function useExecutionStatistics()

// 10초마다 대기열 갱신 (실시간성 중요)
export function useExecutionQueue(filter?: ExecutionFilter)

// 개별 실행 상세 조회
export function useExecutionDetail(executionId: string)

// 60초마다 네트워크 상태 갱신
export function useNetworkStatus(asset: string)

/**
 * Mutation Hooks (액션)
 */

// 트랜잭션 브로드캐스트
export function useBroadcastTransaction()

// 재시도
export function useRetryBroadcast()

// 완료 처리
export function useMarkAsCompleted()

/**
 * Utility Hooks (헬퍼)
 */

// 컨펌 진행률 계산
export function useConfirmationProgress(
  current: number,
  required: number
): { percentage: number; display: string }

// 예상 완료 시간 계산
export function useEstimatedTime(
  current: number,
  required: number,
  avgConfirmTime: number
): string

// 상태별 색상 매핑
export function useExecutionStatusColor(
  status: WithdrawalExecutionStatus
): string

// 혼잡도별 색상 매핑
export function useNetworkCongestionColor(
  congestion: NetworkCongestion
): string

/**
 * 통합 Hook
 */
export function useExecutionManager()
```

---

## 5. UI 컴포넌트 설계

### 5.1 컴포넌트 구조

```
/src/app/admin/withdrawals/execution/
├── ExecutionStats.tsx          # 통계 카드 (4개)
├── ExecutionTable.tsx          # 실행 모니터링 테이블
├── ExecutionDetailModal.tsx   # 상세 정보 모달 (3개 탭)
├── NetworkStatusPanel.tsx     # 네트워크 상태 패널
├── ExecutionFilter.tsx        # 필터 및 검색
└── page.tsx                   # 메인 페이지
```

### 5.2 ExecutionStats.tsx (통계 카드)

**4개 통계 카드**:
1. 브로드캐스트 중 - 현재 전송 중인 트랜잭션 (건수, 금액)
2. 컨펌 대기 - 컨펌 진행 중 (건수, 평균 진행률)
3. 오늘 완료 - 24시간 내 완료 (건수, 금액, 수수료)
4. 실패/재시도 - 실패 건수, 재시도 중, 수동 개입 필요

```typescript
interface ExecutionStatsProps {
  stats: ExecutionStatistics;
  isLoading: boolean;
}

export function ExecutionStats({ stats, isLoading }: ExecutionStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 브로드캐스트 중 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">브로드캐스트 중</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.broadcasting.count}건</div>
          <p className="text-xs text-muted-foreground">
            총 {formatAmount(stats.broadcasting.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 컨펌 대기 카드 */}
      {/* 오늘 완료 카드 */}
      {/* 실패/재시도 카드 */}
    </div>
  );
}
```

### 5.3 ExecutionTable.tsx (실행 모니터링 테이블)

**컬럼**:
- TxHash (복사 버튼, 탐색기 링크)
- 회원사
- 자산
- 금액
- 컨펌 진행률 (Progress Bar: 3/6 = 50%)
- 상태 (배지)
- 예상 완료 시간
- 작업 버튼 (상세보기, 재시도)

```typescript
export function ExecutionTable({ executions }: ExecutionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>TxHash</TableHead>
          <TableHead>회원사</TableHead>
          <TableHead>자산</TableHead>
          <TableHead className="text-right">금액</TableHead>
          <TableHead>컨펌 진행률</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>예상 완료</TableHead>
          <TableHead className="text-right">작업</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {executions.map((exec) => (
          <TableRow key={exec.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <code className="text-xs">{truncateHash(exec.txHash)}</code>
                <Button variant="ghost" size="sm">
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </TableCell>

            <TableCell>{exec.memberName}</TableCell>

            <TableCell>
              <CryptoIcon symbol={exec.asset} size="sm" />
              {exec.asset}
            </TableCell>

            <TableCell className="text-right">
              {formatAmount(exec.amount)} {exec.asset}
            </TableCell>

            <TableCell>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>
                    {exec.confirmations.current}/{exec.confirmations.required}
                  </span>
                  <span className="text-muted-foreground">
                    {exec.confirmations.progress}%
                  </span>
                </div>
                <Progress value={exec.confirmations.progress} />
              </div>
            </TableCell>

            <TableCell>
              <Badge variant={getStatusVariant(exec.status)}>
                {getStatusDisplay(exec.status)}
              </Badge>
            </TableCell>

            <TableCell>
              {exec.estimatedCompletionTime && (
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(exec.estimatedCompletionTime)}
                </span>
              )}
            </TableCell>

            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
              {exec.status === "failed" && (
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

### 5.4 ExecutionDetailModal.tsx (상세 모달)

**3개 탭 구조**:

1. **트랜잭션 정보**
   - TxHash (복사, 탐색기 링크)
   - 회원사명
   - 자산 및 금액
   - 수신 주소
   - 네트워크 수수료
   - 브로드캐스트 시간
   - RBF 정보 (있는 경우)

2. **컨펌 추적**
   - 현재 컨펌 수 / 필요 컨펌 수
   - Progress Bar
   - 블록 높이, 블록 해시
   - 첫 컨펌 시간
   - 예상 완료 시간
   - 컨펌별 타임라인

3. **알림 로그**
   - 감사 로그 타임라인
   - 브로드캐스트, 컨펌, 완료, 실패, 재시도 이력

**재시도 버튼** (실패 시만 표시):
- RBF 옵션 (BTC만)
- 수수료 증가 배율 선택

```typescript
export function ExecutionDetailModal({
  execution,
  isOpen,
  onClose,
}: ExecutionDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>출금 실행 상세</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="transaction">
          <TabsList>
            <TabsTrigger value="transaction">트랜잭션 정보</TabsTrigger>
            <TabsTrigger value="confirmations">컨펌 추적</TabsTrigger>
            <TabsTrigger value="logs">알림 로그</TabsTrigger>
          </TabsList>

          {/* Tab 1: 트랜잭션 정보 */}
          <TabsContent value="transaction">
            {/* TxHash, 회원사, 자산, 금액, 주소, 수수료, RBF 정보 */}
          </TabsContent>

          {/* Tab 2: 컨펌 추적 */}
          <TabsContent value="confirmations">
            {/* Progress Bar, 블록 정보, 컨펌 타임라인 */}
          </TabsContent>

          {/* Tab 3: 알림 로그 */}
          <TabsContent value="logs">
            {/* 감사 로그 타임라인 */}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          {execution.status === "failed" && (
            <Button onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              재시도
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            닫기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 5.5 NetworkStatusPanel.tsx (네트워크 상태)

**3개 자산별 네트워크 상태**:
- BTC, ETH, USDT (ERC-20)

**표시 정보**:
- 블록 높이
- 평균 블록 시간
- 평균 컨펌 시간
- 수수료 (느림/보통/빠름)
- 혼잡도 (초록/노랑/빨강)
- 노드 상태

```typescript
export function NetworkStatusPanel() {
  const btcStatus = useNetworkStatus("BTC");
  const ethStatus = useNetworkStatus("ETH");
  const usdtStatus = useNetworkStatus("USDT");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* BTC 네트워크 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CryptoIcon symbol="BTC" size="sm" />
            Bitcoin Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">블록 높이</span>
            <span className="text-sm font-medium">
              {btcStatus.data?.blockHeight.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">평균 컨펌 시간</span>
            <span className="text-sm font-medium">
              {btcStatus.data?.avgConfirmTime}분
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">혼잡도</span>
            <Badge variant={getCongestionVariant(btcStatus.data?.congestion)}>
              {btcStatus.data?.congestion}
            </Badge>
          </div>
          <Separator />
          <div className="space-y-1">
            <div className="text-xs font-medium">수수료 (sat/vB)</div>
            <div className="flex justify-between text-xs">
              <span>느림: {btcStatus.data?.feeRate.slow}</span>
              <span>보통: {btcStatus.data?.feeRate.medium}</span>
              <span>빠름: {btcStatus.data?.feeRate.fast}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ETH, USDT 동일한 구조 */}
    </div>
  );
}
```

### 5.6 ExecutionFilter.tsx (필터 및 검색)

**필터 옵션**:
- 상태별: 준비중, 브로드캐스트, 컨펌중, 완료, 실패, 재시도
- 자산별: BTC, ETH, USDT
- 날짜 범위

**검색**:
- TxHash, 회원사명, 주소

```typescript
export function ExecutionFilter({ filter, onFilterChange }: ExecutionFilterProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 검색 */}
          <div className="flex-1">
            <Input
              placeholder="TxHash, 회원사명, 주소로 검색..."
              value={filter.searchQuery || ""}
              onChange={(e) =>
                onFilterChange({ ...filter, searchQuery: e.target.value })
              }
            />
          </div>

          {/* 상태 필터 */}
          <Select
            value={filter.status?.[0] || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...filter,
                status: value === "all" ? undefined : [value],
              })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="broadcasting">브로드캐스트</SelectItem>
              <SelectItem value="confirming">컨펌 중</SelectItem>
              <SelectItem value="completed">완료</SelectItem>
              <SelectItem value="failed">실패</SelectItem>
            </SelectContent>
          </Select>

          {/* 자산 필터 */}
          <Select
            value={filter.asset?.[0] || "all"}
            onValueChange={(value) =>
              onFilterChange({
                ...filter,
                asset: value === "all" ? undefined : [value],
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="자산 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>

          {/* 필터 초기화 */}
          <Button
            variant="outline"
            onClick={() => onFilterChange({})}
          >
            초기화
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5.7 page.tsx (메인 페이지)

```typescript
// /src/app/admin/withdrawals/execution/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useExecutionStatistics, useExecutionQueue } from "@/hooks/useExecution";
import { initializeMockExecutions, autoCheckConfirmations } from "@/services/executionApi";
import { ExecutionFilter } from "@/types/withdrawal";

export default function WithdrawalExecutionPage() {
  const [filter, setFilter] = useState<ExecutionFilter>({});
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);

  // 초기화
  useEffect(() => {
    initializeMockExecutions();

    // 자동 컨펌 체크 (10초마다)
    const interval = setInterval(autoCheckConfirmations, 10000);
    return () => clearInterval(interval);
  }, []);

  // 데이터 조회
  const { data: stats, isLoading: statsLoading } = useExecutionStatistics();
  const { data: executions, isLoading: executionsLoading } = useExecutionQueue(filter);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">출금 실행 모니터링</h1>
      </div>

      {/* 통계 카드 */}
      <ExecutionStats stats={stats} isLoading={statsLoading} />

      {/* 네트워크 상태 */}
      <NetworkStatusPanel />

      {/* 필터 */}
      <ExecutionFilter filter={filter} onFilterChange={setFilter} />

      {/* 실행 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>실행 대기열</CardTitle>
        </CardHeader>
        <CardContent>
          <ExecutionTable
            executions={executions || []}
            isLoading={executionsLoading}
            onViewDetail={setSelectedExecution}
          />
        </CardContent>
      </Card>

      {/* 상세 모달 */}
      {selectedExecution && (
        <ExecutionDetailModal
          executionId={selectedExecution}
          isOpen={!!selectedExecution}
          onClose={() => setSelectedExecution(null)}
        />
      )}
    </div>
  );
}
```

---

## 6. 알림 시스템

### 6.1 알림 유형 및 채널

**알림 유형**:
1. 브로드캐스트 성공 - "트랜잭션이 블록체인에 전송되었습니다"
2. 컨펌 진행 - "3/6 컨펌 완료" (50%, 75%, 100% 시점)
3. 완료 - "출금이 완료되었습니다"
4. 실패 - "브로드캐스트 실패, 재시도 중"
5. 재시도 에스컬레이션 - "3회 재시도 실패, 수동 개입 필요"

**알림 채널**:
- 관리자 대시보드: Toast 알림 (모든 상태 변화)
- 회원사 이메일: 완료 시에만 발송
- Slack (SUPER_ADMIN): 실패 및 에스컬레이션
- SMS: 24시간 이상 미완료 긴급 상황

### 6.2 이메일 템플릿

**제목**: `[커스터디] 출금 완료 - {amount} {asset}`

**본문**:
```
안녕하세요, {memberName}님

출금 요청이 성공적으로 완료되었습니다.

[출금 정보]
- 자산: {asset}
- 금액: {amount}
- 수신 주소: {toAddress}
- 네트워크 수수료: {networkFee}

[블록체인 정보]
- TxHash: {txHash}
- 컨펌 수: {confirmations}
- 블록 높이: {blockHeight}
- 완료 시간: {completedAt}

[탐색기 확인]
{blockExplorerUrl}

감사합니다.
커스터디 서비스팀
```

---

## 7. 구현 순서 및 예상 시간

### 7.1 우선순위별 작업 목록

**Phase 1: 핵심 인프라 (3-4시간)**
1. 타입 정의 추가 (withdrawal.ts 확장) - 1시간
2. API 서비스 레이어 구현 (executionApi.ts) - 2-3시간
   - 11개 함수 구현
   - LocalStorage Mock Database
   - 자동 컨펌 시뮬레이션

**Phase 2: React Query 통합 (2시간)**
3. React Query Hooks 구현 (useExecution.ts) - 2시간
   - 12개 Hook (Query 4, Mutation 3, Utility 4, 통합 1)
   - 자동 갱신 설정

**Phase 3: UI 컴포넌트 (3-4시간)**
4. ExecutionStats.tsx (통계 카드) - 30분
5. ExecutionTable.tsx (실행 테이블) - 1시간
6. ExecutionDetailModal.tsx (상세 모달) - 1-1.5시간
7. NetworkStatusPanel.tsx (네트워크 상태) - 30분
8. ExecutionFilter.tsx (필터) - 30분
9. page.tsx (메인 페이지) - 30분

**Phase 4: 통합 및 테스트 (1-2시간)**
10. 사이드바 메뉴 추가 - 30분
11. 통합 테스트 및 버그 수정 - 1-1.5시간

**총 예상 시간**: 9-12시간 (약 1-1.5일)

### 7.2 검증 기준

**기능 검증**:
- [x] 실시간 컨펌 카운트 업데이트 (10초마다)
- [x] Progress Bar로 진행률 시각화
- [x] 재시도 시스템 동작 (실패 → 재시도)
- [x] RBF 수수료 증가 기능
- [x] 완료 시 Toast 알림
- [x] 필터 및 검색 기능
- [x] 네트워크 상태 실시간 표시

**UI/UX 검증**:
- [x] 반응형 레이아웃 (모바일/태블릿/데스크톱)
- [x] 다크/라이트 모드
- [x] 블록체인 탐색기 링크
- [x] TxHash 복사 기능
- [x] 상태별 색상 구분

---

## 8. 사이드바 메뉴 추가

### 8.1 AdminSidebar.tsx 수정

```typescript
// 출금 관리 섹션에 추가
{
  title: "출금 관리",
  items: [
    {
      title: "출금 대기열",
      href: "/admin/withdrawals/queue",
      icon: Clock,
      badge: withdrawalStats?.pending || 0,
    },
    {
      title: "AML 검증",
      href: "/admin/withdrawals/aml",
      icon: Shield,
      badge: withdrawalStats?.amlReview || 0,
    },
    {
      title: "Air-gap 서명",
      href: "/admin/withdrawals/airgap",
      icon: QrCode,
      badge: withdrawalStats?.awaitingSignature || 0,
    },
    {
      title: "출금 실행", // 🆕 추가
      href: "/admin/withdrawals/execution",
      icon: Activity, // Lucide React의 Activity 아이콘
      badge: withdrawalStats?.executing || 0, // 실행 중인 트랜잭션 수
    },
  ],
},
```

---

## 9. Mock 데이터 샘플

### 9.1 샘플 실행 데이터

```typescript
{
  id: "exec-001",
  withdrawalId: "wd-12345",
  memberId: "member-001",
  memberName: "A기업",
  asset: "BTC",
  amount: "0.5",
  toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",

  txHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  networkFee: "0.00001",

  status: "confirming",
  confirmations: {
    current: 3,
    required: 6,
    progress: 50,
  },

  createdAt: new Date("2025-10-13T10:00:00Z"),
  broadcastedAt: new Date("2025-10-13T10:01:00Z"),
  firstConfirmedAt: new Date("2025-10-13T10:11:00Z"),
  estimatedCompletionTime: new Date("2025-10-13T10:41:00Z"),

  notifications: {
    adminNotified: true,
    memberNotified: false,
    escalated: false,
  },

  auditLog: [
    {
      id: "log-001",
      timestamp: new Date("2025-10-13T10:00:00Z"),
      action: "created",
      details: "Execution request created from Air-gap signing",
    },
    {
      id: "log-002",
      timestamp: new Date("2025-10-13T10:01:00Z"),
      action: "broadcasted",
      details: "Transaction broadcasted to Bitcoin network",
    },
    {
      id: "log-003",
      timestamp: new Date("2025-10-13T10:11:00Z"),
      action: "confirmed",
      details: "First confirmation received (1/6)",
    },
  ],
}
```

---

## 10. 다음 단계

Task 4.4 완료 후:
- **Phase 4 완료**: 출금 처리 시스템 전체 완료
- **Phase 5 시작**: 볼트 관리 시스템 (Task 5.1, 5.2)
- **전체 진행률**: 약 80% 완료 (12주 계획 중 10주 완료)

---

**작성일**: 2025-10-13
**예상 완료 시간**: 9-12시간 (약 1-1.5일)
**의존성**: Task 4.3 (Air-gap 서명) 완료 필수
