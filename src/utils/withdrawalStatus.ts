import type { WithdrawalStatus, IndividualWithdrawalStatus, CorporateWithdrawalStatus } from "@/types/withdrawal";

/**
 * 출금 상태 유틸리티 함수
 *
 * 출금 상태값에 대한 표시 레이블, 배지 색상, 상태 확인 등의 헬퍼 함수 제공
 */

// 상태 레이블 매핑
const STATUS_LABELS: Record<WithdrawalStatus, string> = {
  // 기업회원 전용 상태
  withdrawal_request: '출금 신청',
  withdrawal_rejected: '결재 반려',
  archived: '아카이브',

  // 공통 상태 (withdrawal_wait부터)
  withdrawal_wait: '출금 대기',
  withdrawal_stopped: '출금 정지',

  // AML 검증 단계
  aml_review: 'AML 검증',
  aml_issue: 'AML 이슈',

  // 관리자 처리 단계
  processing: '출금 처리 대기',
  transferring: '출금 중',

  // 최종 상태
  success: '출금 완료',
  failed: '출금 실패',
  admin_rejected: '관리자 거부'
};

/**
 * 상태값을 한글 레이블로 변환
 * @param status 출금 상태값
 * @returns 한글 레이블
 */
export function getStatusLabel(status: WithdrawalStatus): string {
  return STATUS_LABELS[status] || status;
}

/**
 * 상태 배지 색상 반환 (Tailwind CSS 클래스)
 * @param status 출금 상태값
 * @returns Tailwind CSS 클래스 문자열
 */
export function getStatusBadgeColor(status: WithdrawalStatus): string {
  const colorMap: Record<WithdrawalStatus, string> = {
    // 대기/진행 중 상태 (노란색/파란색/보라색 계열)
    withdrawal_wait: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    aml_review: 'text-blue-600 bg-blue-50 border-blue-200',
    transferring: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    processing: 'text-purple-600 bg-purple-50 border-purple-200',
    withdrawal_request: 'text-blue-600 bg-blue-50 border-blue-200',

    // 완료/성공 상태 (하늘색 계열 - 초록색 대체)
    success: 'text-sky-600 bg-sky-50 border-sky-200',

    // 문제/실패 상태 (빨간색 계열)
    aml_issue: 'text-red-600 bg-red-50 border-red-200',
    failed: 'text-red-600 bg-red-50 border-red-200',
    admin_rejected: 'text-red-600 bg-red-50 border-red-200',
    withdrawal_rejected: 'text-red-600 bg-red-50 border-red-200',

    // 중립/정지 상태 (회색 계열)
    withdrawal_stopped: 'text-gray-600 bg-gray-50 border-gray-200',
    archived: 'text-gray-600 bg-gray-50 border-gray-200'
  };

  return colorMap[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}

/**
 * 종료 상태 여부 확인 (더 이상 상태 전환이 없는 최종 상태)
 * @param status 출금 상태값
 * @returns 종료 상태 여부
 */
export function isTerminalStatus(status: WithdrawalStatus): boolean {
  const terminalStatuses: WithdrawalStatus[] = [
    'archived',
    'withdrawal_stopped',
    'admin_rejected',
    'success',
    'failed'
  ];
  return terminalStatuses.includes(status);
}

/**
 * 진행 중 상태 여부 확인
 * @param status 출금 상태값
 * @returns 진행 중 상태 여부
 */
export function isInProgressStatus(status: WithdrawalStatus): boolean {
  const inProgressStatuses: WithdrawalStatus[] = [
    'withdrawal_wait',
    'aml_review',
    'processing',
    'transferring'
  ];
  return inProgressStatuses.includes(status);
}

/**
 * 취소 가능 여부 확인
 * @param status 출금 상태값
 * @returns 취소 가능 여부
 */
export function isCancellable(status: WithdrawalStatus): boolean {
  // withdrawal_wait 상태에서만 사용자가 취소 가능
  return status === 'withdrawal_wait';
}

/**
 * 에러 상태 여부 확인
 * @param status 출금 상태값
 * @returns 에러 상태 여부
 */
export function isErrorStatus(status: WithdrawalStatus): boolean {
  const errorStatuses: WithdrawalStatus[] = [
    'aml_issue',
    'failed',
    'admin_rejected',
    'withdrawal_rejected'
  ];
  return errorStatuses.includes(status);
}

/**
 * 개인회원 전용 상태 여부 확인
 * @param status 출금 상태값
 * @returns 개인회원도 사용 가능한 상태 여부
 */
export function isIndividualStatus(status: WithdrawalStatus): boolean {
  const individualStatuses: IndividualWithdrawalStatus[] = [
    'withdrawal_wait',
    'withdrawal_stopped',
    'aml_review',
    'aml_issue',
    'processing',
    'transferring',
    'success',
    'failed',
    'admin_rejected'
  ];
  return individualStatuses.includes(status as IndividualWithdrawalStatus);
}

/**
 * 기업회원 전용 상태 여부 확인
 * @param status 출금 상태값
 * @returns 기업회원 전용 상태 여부
 */
export function isCorporateOnlyStatus(status: WithdrawalStatus): boolean {
  const corporateOnlyStatuses: WithdrawalStatus[] = [
    'withdrawal_request',
    'withdrawal_rejected',
    'archived'
  ];
  return corporateOnlyStatuses.includes(status);
}

/**
 * 상태 진행도 반환 (0-100%)
 * @param status 출금 상태값
 * @returns 진행도 퍼센트
 */
export function getStatusProgress(status: WithdrawalStatus): number {
  const progressMap: Record<WithdrawalStatus, number> = {
    withdrawal_request: 10,
    withdrawal_wait: 20,
    aml_review: 40,
    aml_issue: 40,
    processing: 60,
    transferring: 80,
    success: 100,
    failed: 100,
    admin_rejected: 100,
    withdrawal_rejected: 100,
    withdrawal_stopped: 100,
    archived: 100
  };

  return progressMap[status] || 0;
}

/**
 * 다음 가능한 상태 목록 반환
 * @param currentStatus 현재 상태값
 * @param memberType 회원 타입 ('individual' | 'corporate')
 * @returns 다음 가능한 상태값 배열
 */
export function getPossibleNextStatuses(
  currentStatus: WithdrawalStatus,
  memberType: 'individual' | 'corporate'
): WithdrawalStatus[] {
  const transitions: Record<WithdrawalStatus, WithdrawalStatus[]> = {
    // 기업회원: 출금 신청 → 출금 대기 또는 반려
    withdrawal_request: ['withdrawal_wait', 'withdrawal_rejected'],

    // 출금 대기 → AML 검증 또는 사용자 정지
    withdrawal_wait: ['aml_review', 'withdrawal_stopped'],

    // AML 검증 → 출금 처리 대기 또는 AML 이슈
    aml_review: ['processing', 'aml_issue'],

    // AML 이슈 → 관리자 거부
    aml_issue: ['admin_rejected'],

    // 출금 처리 대기 → 출금 중 또는 관리자 거부
    processing: ['transferring', 'admin_rejected'],

    // 출금 중 → 성공 또는 실패
    transferring: ['success', 'failed'],

    // 결재 반려 → 아카이브
    withdrawal_rejected: ['archived'],

    // 종료 상태는 다음 상태 없음
    success: [],
    failed: [],
    admin_rejected: [],
    withdrawal_stopped: [],
    archived: []
  };

  return transitions[currentStatus] || [];
}
