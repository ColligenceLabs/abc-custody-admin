// ============================================================================
// 출금 실행 모니터링 API 서비스 (Task 4.4)
// ============================================================================
// LocalStorage Mock Database 사용
// ============================================================================

import {
  WithdrawalExecution,
  ExecutionStatistics,
  NetworkStatus,
  ExecutionFilter,
  ExecutionSort,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  ConfirmationStatusResponse,
  RetryBroadcastRequest,
  ExecutionListResponse,
  WithdrawalExecutionStatus,
  BroadcastFailureType,
  NetworkCongestion,
} from "@/types/withdrawal";

// ============================================================================
// LocalStorage 키 상수
// ============================================================================

const STORAGE_KEYS = {
  EXECUTIONS: "withdrawal_executions",
  NETWORK_STATUS: "network_status",
};

// ============================================================================
// 유틸리티 함수
// ============================================================================

/**
 * LocalStorage에서 데이터 읽기
 */
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  const data = localStorage.getItem(key);
  if (!data) return defaultValue;

  try {
    const parsed = JSON.parse(data);
    // Date 타입 변환
    return convertDates(parsed);
  } catch {
    return defaultValue;
  }
}

/**
 * LocalStorage에 데이터 저장
 */
function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Date 문자열을 Date 객체로 변환
 */
function convertDates<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string" && /^\d{4}-\d{2}-\d{2}T/.test(obj)) {
    return new Date(obj) as T;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDates) as T;
  }
  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertDates(value);
    }
    return result as T;
  }
  return obj;
}

/**
 * 지연 함수 (API 호출 시뮬레이션)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock 데이터 생성 함수
 */
function generateMockExecution(
  withdrawalId: string,
  asset: string
): WithdrawalExecution {
  const now = new Date();
  const id = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 자산별 필요 컨펌 수
  const requiredConfirmations: Record<string, number> = {
    BTC: 6,
    ETH: 12,
    "USDT-ERC20": 12,
    "USDT-TRC20": 19,
  };

  return {
    id,
    withdrawalId,
    memberId: "member-001",
    memberName: "테스트 회원사",
    asset,
    network: asset === "BTC" ? "Bitcoin" : asset.includes("TRC20") ? "Tron" : "Ethereum",
    amount: "1.5",
    toAddress: "0x1234567890abcdef1234567890abcdef12345678",
    networkFee: "0.0005",
    status: "preparing",
    confirmations: {
      current: 0,
      required: requiredConfirmations[asset] || 12,
      progress: 0,
    },
    broadcastStartedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Mock 네트워크 상태 생성
 */
function generateMockNetworkStatus(): NetworkStatus[] {
  const now = new Date();

  return [
    {
      network: "Bitcoin",
      congestion: "medium" as NetworkCongestion,
      currentFee: "50 sat/vB",
      avgConfirmationTime: 15,
      pendingTxCount: 2500,
      blockHeight: 850000,
      lastUpdatedAt: now,
    },
    {
      network: "Ethereum",
      congestion: "low" as NetworkCongestion,
      currentFee: "25 Gwei",
      avgConfirmationTime: 3,
      pendingTxCount: 150000,
      blockHeight: 18500000,
      lastUpdatedAt: now,
    },
    {
      network: "Tron",
      congestion: "low" as NetworkCongestion,
      currentFee: "0 TRX",
      avgConfirmationTime: 2,
      pendingTxCount: 8000,
      blockHeight: 56000000,
      lastUpdatedAt: now,
    },
  ];
}

// ============================================================================
// API 함수들
// ============================================================================

/**
 * 1. 트랜잭션 브로드캐스트
 */
export async function broadcastTransaction(
  request: BroadcastTransactionRequest
): Promise<BroadcastTransactionResponse> {
  await delay(1500); // 브로드캐스트 시뮬레이션

  // 10% 확률로 실패 시뮬레이션
  const shouldFail = Math.random() < 0.1;

  if (shouldFail) {
    const failureTypes: BroadcastFailureType[] = [
      "broadcast_failed",
      "insufficient_fee",
      "network_timeout",
    ];
    const failureType = failureTypes[Math.floor(Math.random() * failureTypes.length)];

    return {
      success: false,
      error: `브로드캐스트 실패: ${failureType}`,
      failureType,
    };
  }

  // 성공 케이스
  const txHash = `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("")}`;

  const execution = generateMockExecution(request.withdrawalId, "ETH");
  execution.txHash = txHash;
  execution.status = "broadcasting";
  execution.networkFee = request.networkFee;

  // LocalStorage에 저장
  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );
  executions.push(execution);
  saveToStorage(STORAGE_KEYS.EXECUTIONS, executions);

  return {
    success: true,
    txHash,
    execution,
  };
}

/**
 * 2. 컨펌 상태 조회
 */
export async function getConfirmationStatus(
  txHash: string
): Promise<ConfirmationStatusResponse> {
  await delay(300);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  const execution = executions.find((e) => e.txHash === txHash);

  if (!execution) {
    throw new Error("트랜잭션을 찾을 수 없습니다.");
  }

  // Mock: 컨펌 수 자동 증가 (10초마다 1개씩)
  const elapsedMinutes = Math.floor(
    (Date.now() - new Date(execution.broadcastStartedAt).getTime()) / 10000
  );
  const currentConfirmations = Math.min(
    elapsedMinutes,
    execution.confirmations.required
  );
  const progress = Math.floor(
    (currentConfirmations / execution.confirmations.required) * 100
  );

  const isCompleted = currentConfirmations >= execution.confirmations.required;

  return {
    txHash,
    confirmations: currentConfirmations,
    requiredConfirmations: execution.confirmations.required,
    progress,
    isCompleted,
    estimatedTimeRemaining: isCompleted
      ? 0
      : (execution.confirmations.required - currentConfirmations) * 10,
    blockInfo: {
      blockNumber: 18500000 + currentConfirmations,
      blockTime: new Date(),
    },
  };
}

/**
 * 3. 출금 실행 목록 조회 (필터, 정렬, 페이징)
 */
export async function getExecutions(
  filter?: ExecutionFilter,
  sort?: ExecutionSort,
  page = 1,
  pageSize = 20
): Promise<ExecutionListResponse> {
  await delay(500);

  let executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  // 필터 적용
  if (filter) {
    if (filter.status && filter.status.length > 0) {
      executions = executions.filter((e) => filter.status?.includes(e.status));
    }

    if (filter.asset && filter.asset.length > 0) {
      executions = executions.filter((e) => filter.asset?.includes(e.asset));
    }

    if (filter.memberId) {
      executions = executions.filter((e) => e.memberId === filter.memberId);
    }

    if (filter.searchTerm) {
      const term = filter.searchTerm.toLowerCase();
      executions = executions.filter(
        (e) =>
          e.txHash?.toLowerCase().includes(term) ||
          e.toAddress.toLowerCase().includes(term) ||
          e.memberName.toLowerCase().includes(term)
      );
    }

    if (filter.failedOnly) {
      executions = executions.filter(
        (e) => e.status === "failed" || e.status === "broadcast_failed"
      );
    }

    if (filter.retryNeededOnly) {
      executions = executions.filter(
        (e) => e.retryInfo && e.retryInfo.attempt < e.retryInfo.maxAttempts
      );
    }
  }

  // 정렬
  if (sort) {
    executions.sort((a, b) => {
      let aValue: number | string | Date = 0;
      let bValue: number | string | Date = 0;

      switch (sort.field) {
        case "broadcastStartedAt":
          aValue = new Date(a.broadcastStartedAt).getTime();
          bValue = new Date(b.broadcastStartedAt).getTime();
          break;
        case "confirmations":
          aValue = a.confirmations.current;
          bValue = b.confirmations.current;
          break;
        case "amount":
          aValue = parseFloat(a.amount);
          bValue = parseFloat(b.amount);
          break;
        case "networkFee":
          aValue = parseFloat(a.networkFee);
          bValue = parseFloat(b.networkFee);
          break;
        case "asset":
          aValue = a.asset;
          bValue = b.asset;
          break;
      }

      if (aValue < bValue) return sort.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sort.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  // 페이징
  const totalCount = executions.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedExecutions = executions.slice(
    startIndex,
    startIndex + pageSize
  );

  // 통계 계산
  const statistics = calculateStatistics(executions);

  return {
    executions: paginatedExecutions,
    statistics,
    totalCount,
    pagination: {
      page,
      pageSize,
      totalPages,
    },
  };
}

/**
 * 4. 단일 출금 실행 상세 조회
 */
export async function getExecutionById(
  executionId: string
): Promise<WithdrawalExecution> {
  await delay(300);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  const execution = executions.find((e) => e.id === executionId);

  if (!execution) {
    throw new Error("출금 실행 정보를 찾을 수 없습니다.");
  }

  return execution;
}

/**
 * 5. 브로드캐스트 재시도
 */
export async function retryBroadcast(
  request: RetryBroadcastRequest
): Promise<BroadcastTransactionResponse> {
  await delay(1500);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  const executionIndex = executions.findIndex(
    (e) => e.id === request.executionId
  );

  if (executionIndex === -1) {
    throw new Error("출금 실행 정보를 찾을 수 없습니다.");
  }

  const execution = executions[executionIndex];

  // 재시도 정보 업데이트
  if (!execution.retryInfo) {
    execution.retryInfo = {
      attempt: 0,
      maxAttempts: 3,
      lastAttemptAt: new Date(),
    };
  }

  execution.retryInfo.attempt += 1;
  execution.retryInfo.lastAttemptAt = new Date();

  // RBF (수수료 증가)
  if (request.increaseFee && execution.asset === "BTC") {
    const multiplier = request.feeMultiplier || 1.5;
    const newFee = (parseFloat(execution.networkFee) * multiplier).toFixed(8);

    if (!execution.rbfInfo) {
      execution.rbfInfo = {
        originalFee: execution.networkFee,
        currentFee: newFee,
        feeIncreaseCount: 1,
        lastUpdatedAt: new Date(),
      };
    } else {
      execution.rbfInfo.currentFee = newFee;
      execution.rbfInfo.feeIncreaseCount += 1;
      execution.rbfInfo.lastUpdatedAt = new Date();
    }

    execution.networkFee = newFee;
  }

  // 80% 확률로 성공
  const shouldSucceed = Math.random() < 0.8;

  if (shouldSucceed) {
    execution.status = "broadcasting";
    execution.updatedAt = new Date();

    executions[executionIndex] = execution;
    saveToStorage(STORAGE_KEYS.EXECUTIONS, executions);

    return {
      success: true,
      txHash: execution.txHash,
      execution,
    };
  } else {
    // 실패
    const failureType: BroadcastFailureType = "network_timeout";
    execution.retryInfo.failureType = failureType;

    if (execution.retryInfo.attempt >= execution.retryInfo.maxAttempts) {
      execution.status = "failed";
      execution.failedAt = new Date();
      execution.failureReason = "최대 재시도 횟수 초과";
    }

    executions[executionIndex] = execution;
    saveToStorage(STORAGE_KEYS.EXECUTIONS, executions);

    return {
      success: false,
      error: `재시도 실패: ${failureType}`,
      failureType,
      execution,
    };
  }
}

/**
 * 6. 출금 실행 통계 조회
 */
export async function getExecutionStatistics(): Promise<ExecutionStatistics> {
  await delay(300);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  return calculateStatistics(executions);
}

/**
 * 7. 네트워크 상태 조회
 */
export async function getNetworkStatus(): Promise<NetworkStatus[]> {
  await delay(300);

  let networkStatus = getFromStorage<NetworkStatus[]>(
    STORAGE_KEYS.NETWORK_STATUS,
    []
  );

  // 초기 데이터가 없으면 생성
  if (networkStatus.length === 0) {
    networkStatus = generateMockNetworkStatus();
    saveToStorage(STORAGE_KEYS.NETWORK_STATUS, networkStatus);
  }

  return networkStatus;
}

/**
 * 8. 컨펌 완료 처리
 */
export async function markAsConfirmed(
  executionId: string
): Promise<WithdrawalExecution> {
  await delay(500);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  const executionIndex = executions.findIndex((e) => e.id === executionId);

  if (executionIndex === -1) {
    throw new Error("출금 실행 정보를 찾을 수 없습니다.");
  }

  const execution = executions[executionIndex];

  execution.status = "confirmed";
  execution.confirmedAt = new Date();
  execution.confirmations.current = execution.confirmations.required;
  execution.confirmations.progress = 100;
  execution.updatedAt = new Date();

  executions[executionIndex] = execution;
  saveToStorage(STORAGE_KEYS.EXECUTIONS, executions);

  return execution;
}

/**
 * 9. 실패 처리
 */
export async function markAsFailed(
  executionId: string,
  reason: string
): Promise<WithdrawalExecution> {
  await delay(500);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  const executionIndex = executions.findIndex((e) => e.id === executionId);

  if (executionIndex === -1) {
    throw new Error("출금 실행 정보를 찾을 수 없습니다.");
  }

  const execution = executions[executionIndex];

  execution.status = "failed";
  execution.failedAt = new Date();
  execution.failureReason = reason;
  execution.updatedAt = new Date();

  executions[executionIndex] = execution;
  saveToStorage(STORAGE_KEYS.EXECUTIONS, executions);

  return execution;
}

/**
 * 10. 출금 실행 삭제 (관리자용)
 */
export async function deleteExecution(executionId: string): Promise<void> {
  await delay(300);

  const executions = getFromStorage<WithdrawalExecution[]>(
    STORAGE_KEYS.EXECUTIONS,
    []
  );

  const filtered = executions.filter((e) => e.id !== executionId);

  saveToStorage(STORAGE_KEYS.EXECUTIONS, filtered);
}

/**
 * 11. 네트워크 상태 업데이트 (시뮬레이션)
 */
export async function updateNetworkStatus(): Promise<NetworkStatus[]> {
  await delay(500);

  const networkStatus = generateMockNetworkStatus();
  saveToStorage(STORAGE_KEYS.NETWORK_STATUS, networkStatus);

  return networkStatus;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 통계 계산
 */
function calculateStatistics(
  executions: WithdrawalExecution[]
): ExecutionStatistics {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const broadcasting = executions.filter((e) => e.status === "broadcasting");
  const confirming = executions.filter((e) => e.status === "confirming");
  const completedToday = executions.filter(
    (e) =>
      e.status === "confirmed" &&
      e.confirmedAt &&
      new Date(e.confirmedAt) >= todayStart
  );
  const failed = executions.filter(
    (e) => e.status === "failed" || e.status === "broadcast_failed"
  );

  const completed = executions.filter((e) => e.status === "confirmed");

  // 평균 컨펌 시간 계산 (분)
  let totalConfirmationTime = 0;
  let confirmationCount = 0;

  completed.forEach((e) => {
    if (e.confirmedAt) {
      const timeInMinutes =
        (new Date(e.confirmedAt).getTime() -
          new Date(e.broadcastStartedAt).getTime()) /
        60000;
      totalConfirmationTime += timeInMinutes;
      confirmationCount += 1;
    }
  });

  const averageConfirmationTime =
    confirmationCount > 0 ? totalConfirmationTime / confirmationCount : 0;

  // 성공률 계산
  const totalProcessed = completed.length + failed.length;
  const successRate =
    totalProcessed > 0 ? (completed.length / totalProcessed) * 100 : 0;

  return {
    broadcasting: {
      count: broadcasting.length,
      totalAmount: broadcasting
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        .toFixed(8),
    },
    confirming: {
      count: confirming.length,
      totalAmount: confirming
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        .toFixed(8),
    },
    completedToday: {
      count: completedToday.length,
      totalAmount: completedToday
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        .toFixed(8),
    },
    failed: {
      count: failed.length,
      totalAmount: failed
        .reduce((sum, e) => sum + parseFloat(e.amount), 0)
        .toFixed(8),
    },
    averageConfirmationTime: Math.round(averageConfirmationTime),
    successRate: Math.round(successRate * 100) / 100,
  };
}
