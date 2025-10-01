import {
  ApprovalAuthSession,
  ApprovalAuthStep,
  AuthenticationStep,
  UserAuthInfo
} from "@/types/withdrawal";

// Mock 사용자 인증 정보 (실제로는 API에서 가져옴)
export const mockCurrentUserAuth: UserAuthInfo = {
  userId: "admin-001",
  userName: "관리자",
  phoneNumber: "+82 010-1234-5678",
  hasOtpEnabled: true,
  hasSmsEnabled: true,
};

// 인증 세션 생성
export const createAuthSession = (requestId: string): ApprovalAuthSession => {
  const sessionId = `AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date();

  return {
    requestId,
    sessionId,
    initiatedAt: now.toISOString(),
    otpAuth: {
      step: "otp",
      status: "pending",
      attempts: 0,
      maxAttempts: 5,
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(), // 10분
    },
    smsAuth: {
      step: "sms",
      status: "pending",
      attempts: 0,
      maxAttempts: 5,
      expiresAt: new Date(now.getTime() + 3 * 60 * 1000).toISOString(), // 3분
    },
    isCompleted: false,
  };
};

// OTP 검증
export const verifyOTP = async (otp: string, sessionId: string): Promise<boolean> => {
  // Mock 검증 (실제로는 서버 API 호출)
  await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션

  // 개발용 테스트 OTP: 123456
  return otp === "123456";
};

// SMS 인증번호 발송
export const sendSMSCode = async (phoneNumber: string, sessionId: string): Promise<{ success: boolean; code?: string }> => {
  // Mock SMS 발송 (실제로는 SMS 서비스 API 호출)
  await new Promise(resolve => setTimeout(resolve, 1000)); // 네트워크 지연 시뮬레이션

  const mockCode = "987654"; // 개발용 테스트 코드
  console.log(`SMS 발송됨 (${phoneNumber}): ${mockCode}`);

  return {
    success: true,
    code: mockCode, // 개발 환경에서만 반환
  };
};

// SMS 인증번호 검증
export const verifySMSCode = async (code: string, sessionId: string): Promise<boolean> => {
  // Mock 검증 (실제로는 서버 API 호출)
  await new Promise(resolve => setTimeout(resolve, 500)); // 네트워크 지연 시뮬레이션

  // 개발용 테스트 SMS 코드: 987654
  return code === "987654";
};

// 인증 단계 업데이트
export const updateAuthStep = (
  session: ApprovalAuthSession,
  step: AuthenticationStep,
  status: "verified" | "failed",
  newAttempts?: number
): ApprovalAuthSession => {
  const updatedSession = { ...session };
  const now = new Date().toISOString();

  if (step === "otp") {
    updatedSession.otpAuth = {
      ...updatedSession.otpAuth,
      status,
      attempts: newAttempts ?? updatedSession.otpAuth.attempts + 1,
      verifiedAt: status === "verified" ? now : undefined,
    };
  } else if (step === "sms") {
    updatedSession.smsAuth = {
      ...updatedSession.smsAuth,
      status,
      attempts: newAttempts ?? updatedSession.smsAuth.attempts + 1,
      verifiedAt: status === "verified" ? now : undefined,
    };
  }

  // 모든 인증이 완료되었는지 확인
  if (updatedSession.otpAuth.status === "verified" && updatedSession.smsAuth.status === "verified") {
    updatedSession.isCompleted = true;
    updatedSession.completedAt = now;
  }

  return updatedSession;
};

// 인증 만료 확인
export const isAuthExpired = (authStep: ApprovalAuthStep): boolean => {
  if (!authStep.expiresAt) return false;
  return new Date(authStep.expiresAt) < new Date();
};

// 인증 시도 한계 확인
export const isAuthAttemptsExceeded = (authStep: ApprovalAuthStep): boolean => {
  return authStep.attempts >= authStep.maxAttempts;
};

// 남은 시간 계산 (초 단위)
export const getRemainingTime = (expiresAt: string): number => {
  const expires = new Date(expiresAt);
  const now = new Date();
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.floor(diff / 1000));
};

// 시간 포맷 (MM:SS)
export const formatRemainingTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 인증 세션 검증
export const validateAuthSession = (session: ApprovalAuthSession): {
  isValid: boolean;
  reason?: string
} => {
  // OTP 만료 확인
  if (isAuthExpired(session.otpAuth)) {
    return { isValid: false, reason: "OTP 인증 시간이 만료되었습니다." };
  }

  // SMS 만료 확인
  if (isAuthExpired(session.smsAuth)) {
    return { isValid: false, reason: "SMS 인증 시간이 만료되었습니다." };
  }

  // OTP 시도 횟수 확인
  if (isAuthAttemptsExceeded(session.otpAuth)) {
    return { isValid: false, reason: "OTP 인증 시도 횟수를 초과했습니다." };
  }

  // SMS 시도 횟수 확인
  if (isAuthAttemptsExceeded(session.smsAuth)) {
    return { isValid: false, reason: "SMS 인증 시도 횟수를 초과했습니다." };
  }

  return { isValid: true };
};

// SMS 재발송 가능 확인 (1분 간격)
let lastSMSSentTime: number = 0;
export const canResendSMS = (): boolean => {
  const now = Date.now();
  const canResend = now - lastSMSSentTime > 60000; // 1분
  return canResend;
};

export const markSMSSent = (): void => {
  lastSMSSentTime = Date.now();
};

// 인증 성공 시 audit trail 엔트리 생성
export const createAuthAuditEntry = (
  session: ApprovalAuthSession,
  action: "otp_verified" | "sms_verified" | "auth_completed" | "auth_failed"
) => {
  const actionMap = {
    otp_verified: "OTP 인증 완료",
    sms_verified: "SMS 인증 완료",
    auth_completed: "관리자 인증 완료",
    auth_failed: "관리자 인증 실패",
  };

  return {
    timestamp: new Date().toISOString(),
    action: actionMap[action],
    userId: mockCurrentUserAuth.userId,
    userName: mockCurrentUserAuth.userName,
    details: `세션 ID: ${session.sessionId}`,
    ipAddress: "127.0.0.1", // 실제로는 클라이언트 IP
  };
};