/**
 * 청산 관리 서비스
 * 청산콜, 청산 실행, 거래소 상태 관리
 */

import {
  LiquidationCall,
  LiquidationExecution,
  ExchangeStatus,
  LiquidationHistoryFilters,
} from "@/types/admin-lending";

// Mock 데이터 imports
import liquidationCallsData from "@/data/mockData/liquidation-calls.json";
import liquidationExecutionsData from "@/data/mockData/liquidation-executions.json";
import exchangeStatusData from "@/data/mockData/exchange-status.json";

/**
 * 청산콜 목록 조회
 */
export async function getLiquidationCalls(
  status?: LiquidationCall["status"]
): Promise<LiquidationCall[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  let calls = [...(liquidationCallsData as LiquidationCall[])];

  // 상태 필터
  if (status) {
    calls = calls.filter((call) => call.status === status);
  }

  // Health Factor 오름차순 정렬 (가장 위험한 것부터)
  return calls.sort((a, b) => a.healthFactor - b.healthFactor);
}

/**
 * 특정 청산콜 상세 조회
 */
export async function getLiquidationCallById(
  callId: string
): Promise<LiquidationCall | null> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 150));

  const call = (liquidationCallsData as LiquidationCall[]).find(
    (c) => c.id === callId
  );

  return call || null;
}

/**
 * 청산 실행 시작
 */
export async function startLiquidation(
  callId: string,
  exchange: "upbit" | "bithumb"
): Promise<LiquidationExecution> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 500));

  const call = await getLiquidationCallById(callId);
  if (!call) {
    throw new Error("청산콜을 찾을 수 없습니다");
  }

  // 새로운 청산 실행 생성
  const execution: LiquidationExecution = {
    id: `liq-exec-${Date.now()}`,
    liquidationCallId: callId,
    loanId: call.loanId,
    steps: [
      {
        step: 1,
        name: "담보 자산 확인",
        status: "in_progress",
        startedAt: new Date().toISOString(),
        completedAt: null,
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
    ],
    selectedExchange: exchange,
    estimatedAmount: call.collateralAsset.value,
    actualAmount: 0,
    bankRepayment: 0,
    customerRefund: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    status: "in_progress",
    error: null,
  };

  return execution;
}

/**
 * 청산 실행 목록 조회
 */
export async function getLiquidationExecutions(
  filters?: LiquidationHistoryFilters
): Promise<LiquidationExecution[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  let executions = [
    ...(liquidationExecutionsData as LiquidationExecution[]),
  ];

  // 필터 적용
  if (filters) {
    if (filters.status && filters.status.length > 0) {
      executions = executions.filter((exec) =>
        filters.status!.includes(exec.status)
      );
    }

    if (filters.customerId) {
      // customerId로 필터링하려면 청산콜 데이터와 조인 필요
      const calls = liquidationCallsData as LiquidationCall[];
      const customerCallIds = calls
        .filter((c) => c.customerId === filters.customerId)
        .map((c) => c.id);

      executions = executions.filter((exec) =>
        customerCallIds.includes(exec.liquidationCallId)
      );
    }

    if (filters.startDate) {
      executions = executions.filter(
        (exec) => new Date(exec.startedAt) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      executions = executions.filter(
        (exec) => new Date(exec.startedAt) <= new Date(filters.endDate!)
      );
    }
  }

  // 시작 시간 내림차순 정렬
  return executions.sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

/**
 * 특정 청산 실행 상세 조회
 */
export async function getLiquidationExecutionById(
  executionId: string
): Promise<LiquidationExecution | null> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 150));

  const execution = (
    liquidationExecutionsData as LiquidationExecution[]
  ).find((e) => e.id === executionId);

  return execution || null;
}

/**
 * 청산콜로 청산 실행 조회
 */
export async function getLiquidationExecutionByCallId(
  callId: string
): Promise<LiquidationExecution | null> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 150));

  const execution = (
    liquidationExecutionsData as LiquidationExecution[]
  ).find((e) => e.liquidationCallId === callId);

  return execution || null;
}

/**
 * 거래소 상태 조회
 */
export async function getExchangeStatus(): Promise<ExchangeStatus[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 100));

  return exchangeStatusData as ExchangeStatus[];
}

/**
 * 특정 거래소 상태 조회
 */
export async function getExchangeStatusByName(
  exchange: "upbit" | "bithumb"
): Promise<ExchangeStatus | null> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 100));

  const status = (exchangeStatusData as ExchangeStatus[]).find(
    (e) => e.exchange === exchange
  );

  return status || null;
}

/**
 * 청산 통계 조회
 */
export async function getLiquidationStats(): Promise<{
  totalCalls: number;
  pendingCalls: number;
  processingCalls: number;
  completedExecutions: number;
  totalLiquidatedAmount: number;
  totalBankRepayment: number;
  totalCustomerRefund: number;
}> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const calls = liquidationCallsData as LiquidationCall[];
  const executions = liquidationExecutionsData as LiquidationExecution[];

  const completedExecutions = executions.filter(
    (e) => e.status === "completed"
  );

  return {
    totalCalls: calls.length,
    pendingCalls: calls.filter((c) => c.status === "pending").length,
    processingCalls: calls.filter((c) => c.status === "processing").length,
    completedExecutions: completedExecutions.length,
    totalLiquidatedAmount: completedExecutions.reduce(
      (sum, e) => sum + e.actualAmount,
      0
    ),
    totalBankRepayment: completedExecutions.reduce(
      (sum, e) => sum + e.bankRepayment,
      0
    ),
    totalCustomerRefund: completedExecutions.reduce(
      (sum, e) => sum + e.customerRefund,
      0
    ),
  };
}
