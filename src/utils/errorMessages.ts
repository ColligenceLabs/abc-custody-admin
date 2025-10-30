/**
 * 백엔드 에러 메시지를 프론트엔드 언어 설정에 맞게 변환
 * LanguageContext의 번역 시스템을 사용하는 에러 메시지 매핑 유틸리티
 */

interface ErrorResponse {
  message?: string;
  error?: string;
  status?: string;
}

/**
 * 백엔드 에러 키를 번역 키로 매핑
 */
const errorKeyMapping: Record<string, string> = {
  // 계정 상태
  'pending': 'error.account_pending',
  'inactive': 'error.account_inactive',
  'suspended': 'error.account_suspended',
  'blocked': 'error.account_blocked',

  // 일반 에러
  'User not found': 'error.user_not_found',
  'No user found with this email and member type': 'error.user_not_found',
  'Invalid email or password': 'error.invalid_credentials',
  'Account locked': 'error.account_locked',
  'Invalid PIN': 'error.invalid_pin',
  'Invalid OTP': 'error.invalid_otp'
};

/**
 * 백엔드 에러를 번역 키로 변환하고 LanguageContext의 t 함수를 사용하여 번역
 *
 * @param error - 백엔드에서 받은 에러 객체
 * @param t - LanguageContext의 번역 함수
 * @returns 번역된 에러 메시지
 */
export function mapErrorMessage(error: any, t?: (key: string) => string): string {
  // t 함수가 없으면 원본 메시지 반환 (fallback)
  if (!t) {
    const msg = error?.message || error?.error || 'An error occurred';
    return typeof msg === 'string' ? msg : '오류가 발생했습니다.';
  }

  // 에러 응답 파싱
  let errorResponse: ErrorResponse;
  if (typeof error === 'string') {
    errorResponse = { message: error };
  } else if (error?.response?.data) {
    errorResponse = error.response.data;
  } else {
    errorResponse = error || {};
  }

  // 계정 상태 기반 번역 키 찾기
  if (errorResponse.status && errorKeyMapping[errorResponse.status]) {
    return t(errorKeyMapping[errorResponse.status]);
  }

  // "Your account is [status]" 패턴 감지
  const accountStatusMatch = errorResponse.message?.match(/Your account is (\w+)\./);
  if (accountStatusMatch) {
    const status = accountStatusMatch[1];
    if (errorKeyMapping[status]) {
      return t(errorKeyMapping[status]);
    }
  }

  // 일반 에러 메시지 매핑
  const originalMessage = errorResponse.message || errorResponse.error;
  if (originalMessage && errorKeyMapping[originalMessage]) {
    return t(errorKeyMapping[originalMessage]);
  }

  // 매핑되지 않은 메시지는 원본 반환
  return originalMessage || t('common.error');
}

/**
 * 차단 관련 에러 메시지 생성
 *
 * @param remainingSeconds - 남은 차단 시간(초)
 * @param t - LanguageContext의 번역 함수
 * @returns 번역된 차단 메시지
 */
export function getBlockedMessage(remainingSeconds: number, t?: (key: string) => string): string {
  if (!t) {
    return `계정이 일시적으로 잠겼습니다. ${remainingSeconds}초 후 다시 시도하세요.`;
  }

  const baseMessage = t('error.account_locked');
  return `${baseMessage} ${remainingSeconds}초 후 다시 시도하세요.`;
}
