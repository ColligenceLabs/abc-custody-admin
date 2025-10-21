/**
 * Phone Verification API Service
 * PASS 본인인증 연동 준비된 전화번호 인증 서비스
 *
 * Mock 구현: SMS 인증 코드로 시뮬레이션
 * 실제 환경: PASS(Phone Authentication Service System) 연동
 */

// ===========================
// 타입 정의
// ===========================

/**
 * 인증 방식
 * - PASS: PASS 앱 본인인증 (실제 환경)
 * - SMS: SMS 인증 코드 (개발/Mock 환경)
 */
export type VerificationMethod = 'PASS' | 'SMS';

/**
 * PASS 인증 요청 응답
 */
export interface PassAuthRequest {
  success: boolean;
  txId?: string;            // PASS 거래 ID
  expiresAt: string;        // 만료 시간
  message: string;
  method: VerificationMethod;
  code?: string;            // Mock/SMS 환경에서만 반환
}

/**
 * PASS 인증 상태
 */
export type PassAuthStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';

/**
 * PASS 인증 상태 조회 응답
 */
export interface PassAuthStatusResponse {
  status: PassAuthStatus;
  verified: boolean;
  message: string;
  userInfo?: {
    name: string;
    phone: string;
    birthDate: string;
  };
}

/**
 * 전화번호 검증 결과
 */
export interface PhoneVerificationResult {
  verified: boolean;
  message: string;
}

// ===========================
// Mock 데이터 저장소
// ===========================

/**
 * 인메모리 저장소 (실제 환경에서는 서버 세션/Redis 사용)
 */
const passAuthStore = new Map<string, {
  txId: string;
  code: string;
  phone: string;
  status: PassAuthStatus;
  expiresAt: Date;
  resendCount: number;
}>();

// ===========================
// 유틸리티 함수
// ===========================

/**
 * 전화번호 포맷 정규화 (하이픈 제거)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * 전화번호 유효성 검사
 * - 010, 011, 016, 017, 018, 019로 시작
 * - 10~11자리 숫자
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  const phoneRegex = /^(01[0-9])[0-9]{7,8}$/;
  return phoneRegex.test(normalized);
}

/**
 * 전화번호 포맷팅 (010-1234-5678)
 */
export function formatPhone(phone: string): string {
  const normalized = normalizePhone(phone);
  if (normalized.length === 10) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 6)}-${normalized.slice(6)}`;
  } else if (normalized.length === 11) {
    return `${normalized.slice(0, 3)}-${normalized.slice(3, 7)}-${normalized.slice(7)}`;
  }
  return phone;
}

/**
 * SMS 인증 코드 생성
 */
function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * PASS 거래 ID 생성
 */
function generateTxId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `PASS${timestamp}${random}`;
}

// ===========================
// API 함수
// ===========================

/**
 * PASS 본인인증 요청
 *
 * 실제 환경: PASS 서버로 인증 요청 전송
 * Mock 환경: SMS 인증 코드 시뮬레이션
 *
 * @param phone - 인증할 전화번호
 * @param method - 인증 방식 (PASS or SMS)
 * @returns 인증 요청 결과
 */
export async function requestPhoneVerification(
  phone: string,
  method: VerificationMethod = 'SMS'
): Promise<PassAuthRequest> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = normalizePhone(phone);

      // 전화번호 유효성 검사
      if (!isValidPhone(normalized)) {
        resolve({
          success: false,
          expiresAt: '',
          message: '올바른 전화번호를 입력해주세요.',
          method,
        });
        return;
      }

      // 재발송 횟수 체크
      const existing = passAuthStore.get(normalized);
      if (existing && existing.resendCount >= 3) {
        resolve({
          success: false,
          expiresAt: '',
          message: '재발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.',
          method,
        });
        return;
      }

      // 거래 ID 및 인증 코드 생성
      const txId = generateTxId();
      const code = generateSmsCode();
      const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3분 후

      // 저장소에 저장
      passAuthStore.set(normalized, {
        txId,
        code,
        phone: normalized,
        status: 'PENDING',
        expiresAt,
        resendCount: existing ? existing.resendCount + 1 : 1,
      });

      // Mock 환경: 콘솔에 인증 정보 출력
      if (method === 'SMS') {
        console.log(`[Mock SMS] 전화번호: ${formatPhone(normalized)}`);
        console.log(`[Mock SMS] 인증 코드: ${code}`);
        console.log(`[Mock SMS] 거래 ID: ${txId}`);
        console.log(`[Mock SMS] 만료 시간: ${expiresAt.toLocaleString('ko-KR')}`);
      } else {
        console.log(`[Mock PASS] 전화번호: ${formatPhone(normalized)}`);
        console.log(`[Mock PASS] 거래 ID: ${txId}`);
        console.log(`[Mock PASS] PASS 앱에서 승인이 필요합니다.`);
      }

      resolve({
        success: true,
        txId,
        expiresAt: expiresAt.toISOString(),
        message: method === 'PASS'
          ? 'PASS 앱에서 인증을 진행해주세요.'
          : '인증 코드가 발송되었습니다.',
        method,
        code: method === 'SMS' ? code : undefined, // SMS 모드에서만 코드 반환
      });
    }, 1000);
  });
}

/**
 * SMS 인증 코드 검증
 *
 * @param phone - 전화번호
 * @param code - 사용자가 입력한 인증 코드
 * @returns 검증 결과
 */
export async function verifySmsCode(
  phone: string,
  code: string
): Promise<PhoneVerificationResult> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const normalized = normalizePhone(phone);
      const stored = passAuthStore.get(normalized);

      // 인증 요청이 없는 경우
      if (!stored) {
        resolve({
          verified: false,
          message: '인증 코드를 먼저 요청해주세요.',
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

      // 인증 성공
      stored.status = 'APPROVED';
      passAuthStore.delete(normalized);

      console.log(`[Mock SMS] 인증 성공: ${formatPhone(normalized)}`);

      resolve({
        verified: true,
        message: '전화번호 인증이 완료되었습니다.',
      });
    }, 500);
  });
}

/**
 * PASS 인증 상태 조회 (폴링용)
 *
 * 실제 환경: PASS 서버로 상태 조회 API 호출
 * Mock 환경: 자동 승인 시뮬레이션
 *
 * @param txId - PASS 거래 ID
 * @returns 인증 상태
 */
export async function checkPassAuthStatus(
  txId: string
): Promise<PassAuthStatusResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // 거래 ID로 저장소 검색
      let found: any = null;
      for (const [, data] of Array.from(passAuthStore.entries())) {
        if (data.txId === txId) {
          found = data;
          break;
        }
      }

      if (!found) {
        resolve({
          status: 'EXPIRED',
          verified: false,
          message: '인증 요청을 찾을 수 없습니다.',
        });
        return;
      }

      // 만료 확인
      if (found.expiresAt < new Date()) {
        resolve({
          status: 'EXPIRED',
          verified: false,
          message: '인증 요청이 만료되었습니다.',
        });
        return;
      }

      // Mock: 30% 확률로 자동 승인 시뮬레이션
      if (found.status === 'PENDING' && Math.random() > 0.7) {
        found.status = 'APPROVED';
        passAuthStore.delete(found.phone);
      }

      const verified = found.status === 'APPROVED';

      resolve({
        status: found.status,
        verified,
        message: verified
          ? 'PASS 인증이 완료되었습니다.'
          : 'PASS 앱에서 인증을 진행해주세요.',
        userInfo: verified ? {
          name: '홍길동', // Mock 데이터
          phone: formatPhone(found.phone),
          birthDate: '1990-01-01',
        } : undefined,
      });
    }, 1000);
  });
}

/**
 * 저장소 초기화 (테스트용)
 */
export function clearPassAuthStore(): void {
  passAuthStore.clear();
}

/**
 * 저장소 조회 (디버깅용)
 */
export function getPassAuthStore(): Map<string, {
  txId: string;
  code: string;
  phone: string;
  status: PassAuthStatus;
  expiresAt: Date;
  resendCount: number;
}> {
  return passAuthStore;
}
