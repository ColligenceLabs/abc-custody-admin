/**
 * 출금 진행률 헬퍼 함수
 *
 * 출금 상태별 진행 단계 및 설명을 제공합니다.
 */

/**
 * 출금 상태에 따른 현재 단계를 반환합니다.
 * @param status - 출금 상태
 * @returns 현재 단계 (1-4, withdrawal_wait는 0)
 */
export const getCurrentStep = (status: string): number => {
  const stepMap: Record<string, number> = {
    'withdrawal_wait': 0,      // 0단계: 24시간 대기 중 (진행률 표시 안 함)
    'aml_review': 1,           // 1단계: 보안 검증 (AML)
    'approval_pending': 1,     // 1단계: 보안 검증 (승인)
    'withdrawal_pending': 2,   // 2단계: 출금 처리 대기
    'processing': 3,           // 3단계: 처리 중
    'transferring': 4,         // 4단계: 전송 중
  };
  return stepMap[status] || 0;
};

/**
 * 출금 상태에 따른 단계 설명을 반환합니다.
 * @param status - 출금 상태
 * @returns 단계 설명 문자열
 */
export const getStepDescription = (status: string): string => {
  const descriptionMap: Record<string, string> = {
    'withdrawal_wait': '오출금 방지 24시간 대기 중',
    'aml_review': '보안 검증 중 (AML 검토)',
    'approval_pending': '보안 검증 중 (승인 대기)',
    'withdrawal_pending': '출금 스케줄 대기 중',
    'processing': '블록체인 전송 준비 중',
    'transferring': '블록체인 전송 중',
  };
  return descriptionMap[status] || '';
};

/**
 * 출금이 진행 중인 상태인지 확인합니다.
 * @param status - 출금 상태
 * @returns 진행 중 여부
 */
export const isWithdrawalInProgress = (status: string): boolean => {
  return [
    'aml_review',
    'approval_pending',
    'withdrawal_pending',
    'processing',
    'transferring'
  ].includes(status);
};

/**
 * 24시간 대기 상태인지 확인합니다.
 * @param status - 출금 상태
 * @returns 대기 중 여부
 */
export const isWithdrawalWaiting = (status: string): boolean => {
  return status === 'withdrawal_wait';
};

/**
 * 출금 진행률 백분율을 계산합니다.
 * @param status - 출금 상태
 * @returns 진행률 (0-100)
 */
export const getProgressPercentage = (status: string): number => {
  const currentStep = getCurrentStep(status);
  const totalSteps = 4; // withdrawal_wait 제외, 4단계
  return currentStep > 0 ? (currentStep / totalSteps) * 100 : 0;
};

/**
 * 24시간 대기의 남은 시간을 계산합니다.
 * @param processingScheduledAt - 처리 예정 시간 (선택)
 * @param initiatedAt - 출금 신청 시간 (fallback)
 * @param waitingPeriodHours - 대기 시간 (기본 24시간)
 * @returns 남은 시간 문자열 (예: "23시간 45분")
 */
export const getRemainingWaitTime = (
  processingScheduledAt?: string,
  initiatedAt?: string,
  waitingPeriodHours: number = 24
): string => {
  // processingScheduledAt이 있으면 우선 사용
  if (processingScheduledAt) {
    const scheduledTime = new Date(processingScheduledAt).getTime();
    const now = Date.now();
    const remainingMs = scheduledTime - now;

    if (remainingMs <= 0) {
      return '대기 완료';
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      return '24시간';
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  }

  // processingScheduledAt이 없으면 initiatedAt에서 계산
  if (initiatedAt) {
    const initiatedTime = new Date(initiatedAt).getTime();
    const waitingPeriodMs = waitingPeriodHours * 60 * 60 * 1000;
    const scheduledTime = initiatedTime + waitingPeriodMs;
    const now = Date.now();
    const remainingMs = scheduledTime - now;

    if (remainingMs <= 0) {
      return '대기 완료';
    }

    const hours = Math.floor(remainingMs / (1000 * 60 * 60));
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours >= 24) {
      return '24시간';
    } else if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else {
      return `${minutes}분`;
    }
  }

  return '24시간';
};
