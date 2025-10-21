/**
 * Email Verification API Service
 * 이메일 인증 코드 발송 및 검증 서비스
 *
 * Mock 구현: 개발 환경에서 실제 이메일 발송 없이 테스트 가능
 * 실제 환경: SendGrid, AWS SES 등의 이메일 서비스로 교체 가능
 */

// ===========================
// 타입 정의
// ===========================

/**
 * 인증 코드 발송 응답
 */
export interface VerificationCodeResponse {
  success: boolean;
  expiresAt: string;        // ISO 8601 형식
  message: string;
  code?: string;            // Mock 환경에서만 반환 (개발용)
}

/**
 * 인증 코드 검증 결과
 */
export interface VerificationResult {
  verified: boolean;
  message: string;
}

// ===========================
// Mock 데이터 저장소
// ===========================

/**
 * 인메모리 저장소 (실제 환경에서는 Redis/서버 세션 사용)
 */
const verificationStore = new Map<string, {
  code: string;
  expiresAt: Date;
  resendCount: number;
}>();

// ===========================
// 유틸리티 함수
// ===========================

/**
 * 6자리 랜덤 인증 코드 생성
 */
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 이메일 유효성 검사
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===========================
// API 함수
// ===========================

/**
 * 인증 코드 발송
 *
 * @param email - 인증할 이메일 주소
 * @returns 발송 결과 및 만료 시간
 */
export async function sendVerificationCode(
  email: string
): Promise<VerificationCodeResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 이메일 유효성 검사
      if (!isValidEmail(email)) {
        resolve({
          success: false,
          expiresAt: '',
          message: '올바른 이메일 주소를 입력해주세요.',
        });
        return;
      }

      // 재발송 횟수 체크
      const existing = verificationStore.get(email);
      if (existing && existing.resendCount >= 3) {
        resolve({
          success: false,
          expiresAt: '',
          message: '재발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
        });
        return;
      }

      // 인증 코드 생성
      const code = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분 후

      // 저장소에 저장
      verificationStore.set(email, {
        code,
        expiresAt,
        resendCount: existing ? existing.resendCount + 1 : 1,
      });

      // Mock 환경: 콘솔에 인증 코드 출력
      console.log(`[Mock Email] 인증 코드 발송: ${email}`);
      console.log(`[Mock Email] 인증 코드: ${code}`);
      console.log(`[Mock Email] 만료 시간: ${expiresAt.toLocaleString('ko-KR')}`);

      resolve({
        success: true,
        expiresAt: expiresAt.toISOString(),
        message: '인증 코드가 발송되었습니다.',
        code, // Mock 환경에서만 반환
      });
    }, 1000); // 1초 지연 (네트워크 시뮬레이션)
  });
}

/**
 * 인증 코드 검증
 *
 * @param email - 인증할 이메일 주소
 * @param code - 사용자가 입력한 인증 코드
 * @returns 검증 결과
 */
export async function verifyCode(
  email: string,
  code: string
): Promise<VerificationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 저장소에서 조회
      const stored = verificationStore.get(email);

      // 코드가 없는 경우
      if (!stored) {
        resolve({
          verified: false,
          message: '인증 코드를 먼저 발송해주세요.',
        });
        return;
      }

      // 만료 확인
      if (stored.expiresAt < new Date()) {
        resolve({
          verified: false,
          message: '인증 코드가 만료되었습니다. 재발송해주세요.',
        });
        return;
      }

      // 코드 일치 확인
      if (stored.code !== code) {
        resolve({
          verified: false,
          message: '인증 코드가 일치하지 않습니다.',
        });
        return;
      }

      // 인증 성공 - 저장소에서 제거
      verificationStore.delete(email);

      console.log(`[Mock Email] 인증 성공: ${email}`);

      resolve({
        verified: true,
        message: '인증이 완료되었습니다.',
      });
    }, 500); // 0.5초 지연
  });
}

/**
 * 저장소 초기화 (테스트용)
 */
export function clearVerificationStore(): void {
  verificationStore.clear();
}

/**
 * 저장소 조회 (디버깅용)
 */
export function getVerificationStore(): Map<string, {
  code: string;
  expiresAt: Date;
  resendCount: number;
}> {
  return verificationStore;
}
