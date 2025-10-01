import {
  PolicyLog,
  PolicyLogAction,
  PolicyLogChange,
  PolicyLogFilter,
  PolicyLogSummary,
  PolicyLogMetadata
} from '@/types/policyLog';
import { ApprovalPolicy } from '@/utils/approverAssignment';

const POLICY_LOGS_KEY = 'custody_policy_logs';
const MAX_LOGS = 1000; // 최대 로그 개수
const LOG_RETENTION_DAYS = 90; // 로그 보관 기간 (일)

/**
 * 고유 로그 ID 생성
 */
function generateLogId(): string {
  return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 브라우저 정보 수집
 */
function getBrowserMetadata(): Pick<PolicyLogMetadata, 'userAgent'> {
  return {
    userAgent: navigator.userAgent
  };
}

/**
 * 정책 변경사항 비교
 */
export function comparePolicy(
  oldPolicy: Partial<ApprovalPolicy>,
  newPolicy: Partial<ApprovalPolicy>
): PolicyLogChange[] {
  const changes: PolicyLogChange[] = [];

  // 비교할 필드 목록
  const fieldsToCompare: (keyof ApprovalPolicy)[] = [
    'description',
    'minAmount',
    'maxAmount',
    'requiredApprovers'
  ];

  fieldsToCompare.forEach(field => {
    const oldValue = oldPolicy[field];
    const newValue = newPolicy[field];

    // 배열 비교 (결재자 목록)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes.push({
          field,
          oldValue: [...oldValue],
          newValue: [...newValue]
        });
      }
    }
    // 일반 값 비교
    else if (oldValue !== newValue) {
      changes.push({
        field,
        oldValue,
        newValue
      });
    }
  });

  return changes;
}

/**
 * 정책 로그 생성
 */
export function createPolicyLog(
  action: PolicyLogAction,
  policyId: string,
  policyDescription: string,
  userId: string,
  userName: string,
  changes: PolicyLogChange[] = [],
  additionalMetadata: Partial<PolicyLogMetadata> = {}
): PolicyLog {
  return {
    id: generateLogId(),
    timestamp: new Date().toISOString(),
    action,
    policyId,
    policyDescription,
    userId,
    userName,
    changes,
    metadata: {
      ...getBrowserMetadata(),
      ...additionalMetadata
    }
  };
}

/**
 * 로그를 localStorage에 저장
 */
export function savePolicyLog(log: PolicyLog): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existingLogs = getPolicyLogs();
    const updatedLogs = [log, ...existingLogs];

    // 최대 로그 수 제한
    const trimmedLogs = updatedLogs.slice(0, MAX_LOGS);

    localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(trimmedLogs));
  } catch (error) {
    console.error('정책 로그 저장 실패:', error);
  }
}

/**
 * 목업 데이터 생성 (개발 및 테스트용)
 */
function generateMockLogs(): PolicyLog[] {
  const now = new Date();
  const mockLogs: PolicyLog[] = [
    // 오늘 - 활발한 활동 (최근 5개)
    {
      id: 'log_mock_1',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5분 전
      action: 'UPDATE',
      policyId: 'KRW-0',
      policyDescription: '소액 거래',
      userId: '2',
      userName: '박재무',
      changes: [
        { field: 'maxAmount', oldValue: 100000, newValue: 200000 }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '업무량 증가로 인한 한도 상향 조정'
      }
    },
    {
      id: 'log_mock_2',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15분 전
      action: 'UPDATE',
      policyId: 'KRW-2',
      policyDescription: '고액 거래',
      userId: '3',
      userName: '윤보안',
      changes: [
        { field: 'requiredApprovers', oldValue: ['김대표', '박재무', '윤보안', '이기술'], newValue: ['김대표', '박재무', '윤보안', '이기술', '송컴플'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '고액 거래 보안 강화'
      }
    },
    {
      id: 'log_mock_3',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30분 전
      action: 'SUSPEND',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '3',
      userName: '윤보안',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '보안 검토를 위한 임시 정지'
      }
    },
    {
      id: 'log_mock_4',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), // 45분 전
      action: 'UPDATE',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '4',
      userName: '이기술',
      changes: [
        { field: 'description', oldValue: '중간 거래', newValue: '중간 금액 거래' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책명 명확화'
      }
    },
    {
      id: 'log_mock_5',
      timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(), // 1시간 30분 전
      action: 'SUSPEND',
      policyId: 'KRW-old-1',
      policyDescription: '구 정책 v1',
      userId: '5',
      userName: '송컴플',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책 업데이트로 인한 기존 정책 정지'
      }
    },

    // 어제 - 정기 점검 (5개)
    {
      id: 'log_mock_6',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(), // 어제 22시
      action: 'UPDATE',
      policyId: 'KRW-0',
      policyDescription: '소액 거래',
      userId: '2',
      userName: '박재무',
      changes: [
        { field: 'requiredApprovers', oldValue: ['박재무'], newValue: ['박재무', '윤보안'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '결재자 이중화'
      }
    },
    {
      id: 'log_mock_7',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 6 * 60 * 60 * 1000).toISOString(), // 어제 18시
      action: 'UPDATE',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '3',
      userName: '윤보안',
      changes: [
        { field: 'minAmount', oldValue: 100000, newValue: 200000 },
        { field: 'maxAmount', oldValue: 5000000, newValue: 10000000 }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '중간 거래 금액 범위 조정'
      }
    },
    {
      id: 'log_mock_8',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 8 * 60 * 60 * 1000).toISOString(), // 어제 16시
      action: 'SUSPEND',
      policyId: 'KRW-0',
      policyDescription: '소액 거래',
      userId: '5',
      userName: '송컴플',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책 개편으로 인한 일시적 정지'
      }
    },
    {
      id: 'log_mock_9',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 10 * 60 * 60 * 1000).toISOString(), // 어제 14시
      action: 'UPDATE',
      policyId: 'KRW-2',
      policyDescription: '고액 거래',
      userId: '4',
      userName: '이기술',
      changes: [
        { field: 'requiredApprovers', oldValue: ['김대표', '박재무', '윤보안'], newValue: ['김대표', '박재무', '윤보안', '이기술'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '기술팀 검토 추가'
      }
    },
    {
      id: 'log_mock_10',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000 - 12 * 60 * 60 * 1000).toISOString(), // 어제 12시
      action: 'SUSPEND',
      policyId: 'KRW-legacy-1',
      policyDescription: '구형 승인 정책',
      userId: '5',
      userName: '송컴플',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책 표준화 작업으로 인한 정지'
      }
    },

    // 이번 주 - 정책 재정비 (5개)
    {
      id: 'log_mock_11',
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3일 전
      action: 'SUSPEND',
      policyId: 'KRW-2',
      policyDescription: '고액 거래',
      userId: '1',
      userName: '김대표',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '시스템 점검 중 발견된 보안 이슈로 인한 긴급 정지'
      }
    },
    {
      id: 'log_mock_12',
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4일 전
      action: 'UPDATE',
      policyId: 'KRW-0',
      policyDescription: '소액 거래',
      userId: '2',
      userName: '박재무',
      changes: [
        { field: 'minAmount', oldValue: 0, newValue: 10000 }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '최소 거래 금액 설정'
      }
    },
    {
      id: 'log_mock_13',
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5일 전
      action: 'UPDATE',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '3',
      userName: '윤보안',
      changes: [
        { field: 'requiredApprovers', oldValue: ['박재무', '윤보안'], newValue: ['박재무', '윤보안', '이기술'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '보안 강화를 위한 결재자 추가'
      }
    },
    {
      id: 'log_mock_14',
      timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6일 전
      action: 'CREATE',
      policyId: 'KRW-mock-4',
      policyDescription: '임시 검증 정책',
      userId: '4',
      userName: '이기술',
      changes: [
        { field: 'description', oldValue: null, newValue: '임시 검증 정책' },
        { field: 'minAmount', oldValue: null, newValue: 50000 },
        { field: 'maxAmount', oldValue: null, newValue: 100000 },
        { field: 'requiredApprovers', oldValue: [], newValue: ['이기술', '윤보안'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '시스템 테스트를 위한 임시 정책 생성'
      }
    },
    {
      id: 'log_mock_15',
      timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 전
      action: 'UPDATE',
      policyId: 'KRW-2',
      policyDescription: '고액 거래',
      userId: '4',
      userName: '이기술',
      changes: [
        { field: 'minAmount', oldValue: 5000000, newValue: 10000000 }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '고액 거래 기준 상향 조정'
      }
    },

    // 이번 달 - 분기 검토 (5개)
    {
      id: 'log_mock_16',
      timestamp: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 2주 전
      action: 'SUSPEND',
      policyId: 'KRW-temp-policy',
      policyDescription: '임시 테스트 정책',
      userId: '5',
      userName: '송컴플',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '테스트 완료로 인한 정책 정지'
      }
    },
    {
      id: 'log_mock_17',
      timestamp: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18일 전
      action: 'CREATE',
      policyId: 'KRW-mock-5',
      policyDescription: '월말 정산 정책',
      userId: '2',
      userName: '박재무',
      changes: [
        { field: 'description', oldValue: null, newValue: '월말 정산 정책' },
        { field: 'minAmount', oldValue: null, newValue: 1000000 },
        { field: 'maxAmount', oldValue: null, newValue: Infinity },
        { field: 'requiredApprovers', oldValue: [], newValue: ['박재무', '송컴플'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '월말 정산 프로세스 체계화'
      }
    },
    {
      id: 'log_mock_18',
      timestamp: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString(), // 21일 전
      action: 'UPDATE',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '3',
      userName: '윤보안',
      changes: [
        { field: 'description', oldValue: '중간 금액 거래', newValue: '중간 거래' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '정책명 간소화'
      }
    },
    {
      id: 'log_mock_19',
      timestamp: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25일 전
      action: 'UPDATE',
      policyId: 'KRW-0',
      policyDescription: '소액 거래',
      userId: '1',
      userName: '김대표',
      changes: [
        { field: 'maxAmount', oldValue: 50000, newValue: 100000 }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '소액 거래 한도 상향'
      }
    },
    {
      id: 'log_mock_20',
      timestamp: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 전
      action: 'CREATE',
      policyId: 'KRW-mock-6',
      policyDescription: '분기별 감사 정책',
      userId: '5',
      userName: '송컴플',
      changes: [
        { field: 'description', oldValue: null, newValue: '분기별 감사 정책' },
        { field: 'minAmount', oldValue: null, newValue: 0 },
        { field: 'maxAmount', oldValue: null, newValue: Infinity },
        { field: 'requiredApprovers', oldValue: [], newValue: ['김대표', '송컴플', '박재무'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '분기별 정책 감사를 위한 신규 정책'
      }
    },

    // 추가 로그 (21-25)
    {
      id: 'log_mock_21',
      timestamp: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35일 전
      action: 'UPDATE',
      policyId: 'KRW-2',
      policyDescription: '고액 거래',
      userId: '2',
      userName: '박재무',
      changes: [
        { field: 'maxAmount', oldValue: 100000000, newValue: Infinity }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '고액 거래 상한 해제'
      }
    },
    {
      id: 'log_mock_22',
      timestamp: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(), // 40일 전
      action: 'CREATE',
      policyId: 'KRW-mock-7',
      policyDescription: '신규 고객 정책',
      userId: '4',
      userName: '이기술',
      changes: [
        { field: 'description', oldValue: null, newValue: '신규 고객 정책' },
        { field: 'minAmount', oldValue: null, newValue: 0 },
        { field: 'maxAmount', oldValue: null, newValue: 100000 },
        { field: 'requiredApprovers', oldValue: [], newValue: ['이기술', '윤보안'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '신규 고객 온보딩 정책'
      }
    },
    {
      id: 'log_mock_23',
      timestamp: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45일 전
      action: 'SUSPEND',
      policyId: 'KRW-old-legacy',
      policyDescription: '구 시스템 정책',
      userId: '1',
      userName: '김대표',
      changes: [
        { field: 'status', oldValue: 'ACTIVE', newValue: 'SUSPENDED' }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '시스템 마이그레이션 완료로 인한 정지'
      }
    },
    {
      id: 'log_mock_24',
      timestamp: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000).toISOString(), // 50일 전
      action: 'UPDATE',
      policyId: 'KRW-1',
      policyDescription: '중간 거래',
      userId: '3',
      userName: '윤보안',
      changes: [
        { field: 'maxAmount', oldValue: 3000000, newValue: 5000000 }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: '중간 거래 한도 증액'
      }
    },
    {
      id: 'log_mock_25',
      timestamp: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(), // 55일 전
      action: 'CREATE',
      policyId: 'KRW-mock-8',
      policyDescription: 'VIP 고객 정책',
      userId: '1',
      userName: '김대표',
      changes: [
        { field: 'description', oldValue: null, newValue: 'VIP 고객 정책' },
        { field: 'minAmount', oldValue: null, newValue: 10000000 },
        { field: 'maxAmount', oldValue: null, newValue: Infinity },
        { field: 'requiredApprovers', oldValue: [], newValue: ['김대표'] }
      ],
      metadata: {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        reason: 'VIP 고객 전용 신속 승인 정책'
      }
    }
  ];

  return mockLogs;
}

/**
 * localStorage에서 모든 로그 조회
 */
export function getPolicyLogs(): PolicyLog[] {
  // 서버 사이드 렌더링 중에는 localStorage가 없으므로 빈 배열 반환
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const logsJson = localStorage.getItem(POLICY_LOGS_KEY);
    let logs: PolicyLog[] = [];

    if (logsJson) {
      logs = JSON.parse(logsJson);
    } else {
      // 로그가 없으면 목업 데이터로 초기화
      logs = generateMockLogs();
      localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(logs));
    }

    // 만료된 로그 제거
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);

    const validLogs = logs.filter(log =>
      new Date(log.timestamp) > cutoffDate
    );

    // 만료된 로그가 있으면 업데이트
    if (validLogs.length !== logs.length) {
      localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(validLogs));
    }

    return validLogs;
  } catch (error) {
    console.error('정책 로그 조회 실패:', error);
    return [];
  }
}

/**
 * 필터를 적용하여 로그 조회
 */
export function getFilteredPolicyLogs(filter: PolicyLogFilter): PolicyLog[] {
  const allLogs = getPolicyLogs();

  return allLogs.filter(log => {
    // 날짜 필터
    if (filter.startDate) {
      const startDate = new Date(filter.startDate);
      if (new Date(log.timestamp) < startDate) return false;
    }

    if (filter.endDate) {
      const endDate = new Date(filter.endDate);
      endDate.setHours(23, 59, 59, 999); // 하루 끝까지
      if (new Date(log.timestamp) > endDate) return false;
    }

    // 액션 타입 필터
    if (filter.action && filter.action !== 'ALL') {
      if (log.action !== filter.action) return false;
    }

    // 사용자 필터
    if (filter.userId) {
      if (log.userId !== filter.userId) return false;
    }

    // 정책 ID 필터
    if (filter.policyId) {
      if (log.policyId !== filter.policyId) return false;
    }

    return true;
  });
}

/**
 * 로그 통계 생성
 */
export function getPolicyLogSummary(): PolicyLogSummary {
  const logs = getPolicyLogs();

  const createCount = logs.filter(log => log.action === 'CREATE').length;
  const updateCount = logs.filter(log => log.action === 'UPDATE').length;
  const suspendCount = logs.filter(log => log.action === 'SUSPEND').length;

  const uniqueUsers = new Set(logs.map(log => log.userId)).size;

  const lastActivity = logs.length > 0
    ? logs[0].timestamp // 최신순으로 정렬되어 있음
    : '';

  return {
    totalLogs: logs.length,
    createCount,
    updateCount,
    suspendCount,
    uniqueUsers,
    lastActivity
  };
}

/**
 * 로그를 CSV 형식으로 내보내기
 */
export function exportLogsToCSV(logs: PolicyLog[]): string {
  const headers = [
    '로그 ID',
    '시간',
    '액션',
    '정책 ID',
    '정책 설명',
    '사용자 ID',
    '사용자명',
    '변경 내용',
    '사유'
  ];

  const rows = logs.map(log => [
    log.id,
    new Date(log.timestamp).toLocaleString('ko-KR'),
    log.action,
    log.policyId,
    log.policyDescription,
    log.userId,
    log.userName,
    log.changes.map(change =>
      `${change.field}: ${JSON.stringify(change.oldValue)} → ${JSON.stringify(change.newValue)}`
    ).join('; '),
    log.metadata.reason || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * CSV 파일 다운로드
 */
export function downloadLogsAsCSV(logs: PolicyLog[], filename?: string): void {
  const csvContent = exportLogsToCSV(logs);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || `policy_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * 로그 모두 삭제 (관리자 전용)
 */
export function clearAllPolicyLogs(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(POLICY_LOGS_KEY);
}

/**
 * 목업 데이터로 초기화 (개발용)
 */
export function initializeMockData(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const mockLogs = generateMockLogs();
  localStorage.setItem(POLICY_LOGS_KEY, JSON.stringify(mockLogs));
}

/**
 * 특정 정책의 로그만 조회
 */
export function getPolicyLogsByPolicyId(policyId: string): PolicyLog[] {
  return getFilteredPolicyLogs({ policyId });
}

/**
 * 최근 활동 로그 조회 (최대 N개)
 */
export function getRecentPolicyLogs(limit: number = 10): PolicyLog[] {
  const logs = getPolicyLogs();
  return logs.slice(0, limit);
}