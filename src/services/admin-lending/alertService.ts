/**
 * 알림 관리 서비스
 * 알림 설정, 알림 내역, 청산 위험 고객 관리
 */

import {
  AlertConfig,
  Alert,
  AlertHistoryFilters,
  AdminBankLoan,
} from "@/types/admin-lending";
import alertConfigsData from "@/data/mockData/alert-configs.json";
import alertHistoryData from "@/data/mockData/alert-history.json";
import adminLoansData from "@/data/mockData/admin-loans.json";

// Mock 데이터베이스 (메모리 상에서 관리)
let alertConfigs: AlertConfig[] = alertConfigsData as AlertConfig[];
let alertHistory: Alert[] = alertHistoryData as Alert[];

/**
 * 모든 알림 설정 조회
 */
export async function getAlertConfigs(): Promise<AlertConfig[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return [...alertConfigs];
}

/**
 * 특정 알림 설정 조회
 */
export async function getAlertConfig(
  id: string
): Promise<AlertConfig | null> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const config = alertConfigs.find((c) => c.id === id);
  return config || null;
}

/**
 * 알림 설정 수정
 */
export async function updateAlertConfig(
  id: string,
  updates: Partial<AlertConfig>
): Promise<AlertConfig> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = alertConfigs.findIndex((c) => c.id === id);
  if (index === -1) {
    throw new Error("알림 설정을 찾을 수 없습니다");
  }

  alertConfigs[index] = {
    ...alertConfigs[index],
    ...updates,
  };

  return alertConfigs[index];
}

/**
 * 알림 내역 조회
 */
export async function getAlertHistory(
  filters?: AlertHistoryFilters
): Promise<Alert[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...alertHistory];

  // 타입 필터
  if (filters?.type && filters.type.length > 0) {
    filtered = filtered.filter((alert) => filters.type!.includes(alert.type));
  }

  // 심각도 필터
  if (filters?.severity && filters.severity.length > 0) {
    filtered = filtered.filter((alert) =>
      filters.severity!.includes(alert.severity)
    );
  }

  // 날짜 범위 필터
  if (filters?.startDate) {
    filtered = filtered.filter(
      (alert) => new Date(alert.sentAt) >= new Date(filters.startDate!)
    );
  }
  if (filters?.endDate) {
    filtered = filtered.filter(
      (alert) => new Date(alert.sentAt) <= new Date(filters.endDate!)
    );
  }

  // 읽음 필터
  if (filters?.read !== undefined) {
    filtered = filtered.filter((alert) => alert.read === filters.read);
  }

  // 최신순 정렬
  return filtered.sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

/**
 * 알림 읽음 처리
 */
export async function markAlertAsRead(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const index = alertHistory.findIndex((alert) => alert.id === id);
  if (index !== -1) {
    alertHistory[index].read = true;
  }
}

/**
 * 청산 위험 고객 목록 조회
 * HF < 1.5인 대출 필터링
 */
export async function getRiskCustomers(): Promise<AdminBankLoan[]> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const loans = adminLoansData as AdminBankLoan[];

  // HF < 1.5이고 활성 상태인 대출만 필터
  const riskLoans = loans.filter(
    (loan) =>
      loan.healthFactor < 1.5 &&
      (loan.status === "active" ||
        loan.status === "warning" ||
        loan.status === "danger" ||
        loan.status === "liquidation")
  );

  // HF 오름차순 정렬 (낮은 것부터)
  return riskLoans.sort((a, b) => a.healthFactor - b.healthFactor);
}

/**
 * 알림 테스트 발송
 */
export async function testAlert(configId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const config = alertConfigs.find((c) => c.id === configId);
  if (!config) {
    throw new Error("알림 설정을 찾을 수 없습니다");
  }

  // 실제로는 알림 발송 로직 (이메일, SMS, 시스템 알림)
  // Mock에서는 알림 내역에 테스트 알림 추가
  const testAlertItem: Alert = {
    id: `alert-test-${Date.now()}`,
    type: config.type,
    severity: "info",
    message: `테스트 알림: ${config.type} (임계값: ${config.threshold})`,
    details: {
      isTest: true,
      configId: config.id,
    },
    sentAt: new Date().toISOString(),
    channels: config.channels,
    read: false,
  };

  alertHistory.unshift(testAlertItem);
}

/**
 * 알림 통계 조회
 */
export async function getAlertStats(): Promise<{
  total: number;
  unread: number;
  critical: number;
  warning: number;
  info: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const unread = alertHistory.filter((a) => !a.read).length;
  const critical = alertHistory.filter((a) => a.severity === "critical").length;
  const warning = alertHistory.filter((a) => a.severity === "warning").length;
  const info = alertHistory.filter((a) => a.severity === "info").length;

  return {
    total: alertHistory.length,
    unread,
    critical,
    warning,
    info,
  };
}
