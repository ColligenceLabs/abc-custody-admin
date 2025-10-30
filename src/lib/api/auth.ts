import { User } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: User;
  token: string;
}

export interface ErrorResponse {
  error: string;
}

/**
 * 로그인 API 호출
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.error || '로그인에 실패했습니다.');
  }

  return response.json();
}

/**
 * 이메일로 사용자 조회
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const response = await fetch(`${API_URL}/api/users?email=${email}`);

  if (!response.ok) {
    throw new Error('사용자 조회에 실패했습니다.');
  }

  const users: User[] = await response.json();
  return users.length > 0 ? users[0] : null;
}

/**
 * 전체 사용자 조회
 */
export async function getUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/api/users`);

  if (!response.ok) {
    throw new Error('사용자 목록 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 사용자 정보 업데이트
 */
export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('사용자 정보 업데이트에 실패했습니다.');
  }

  return response.json();
}

/**
 * 마지막 로그인 시간 업데이트
 */
export async function updateLastLogin(userId: string): Promise<User> {
  return updateUser(userId, {
    lastLogin: new Date().toISOString(),
  });
}

/**
 * 회원가입 - 새 사용자 생성
 */
export async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '회원가입에 실패했습니다.');
  }

  const result = await response.json();
  return result.user;
}

/**
 * 이메일 중복 확인
 */
export async function checkEmailDuplicate(email: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/api/users?email=${encodeURIComponent(email)}`);

  if (!response.ok) {
    throw new Error('이메일 확인에 실패했습니다.');
  }

  const users: User[] = await response.json();
  return users.length > 0;
}

/**
 * 이메일 인증코드 발송
 */
export async function sendEmailVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
  // 실제로는 서버에서 이메일 발송 처리
  // 여기서는 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 실제 구현 시 서버 API 호출
  return {
    success: true,
    message: '이메일로 인증코드가 발송되었습니다.',
  };
}

/**
 * 이메일 인증코드 검증
 */
export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; message: string }> {
  // 실제로는 서버에서 검증 처리
  // 여기서는 시뮬레이션 (테스트용 코드: 123456)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const isValid = code === '123456';

  return {
    success: isValid,
    message: isValid ? '이메일 인증이 완료되었습니다.' : '인증코드가 올바르지 않습니다.',
  };
}

/**
 * 휴대폰 인증코드 발송
 */
export async function sendPhoneVerificationCode(phone: string): Promise<{ success: boolean; message: string }> {
  // 실제로는 서버에서 SMS 발송 처리
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message: '인증번호가 발송되었습니다.',
  };
}

/**
 * 휴대폰 인증코드 검증
 */
export async function verifyPhoneCode(phone: string, code: string): Promise<{ success: boolean; message: string }> {
  // 실제로는 서버에서 검증 처리
  // 여기서는 시뮬레이션 (테스트용 코드: 123456)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const isValid = code === '123456';

  return {
    success: isValid,
    message: isValid ? '본인인증이 완료되었습니다.' : '인증번호가 올바르지 않습니다.',
  };
}

// ============================================
// 새로운 백엔드 API 함수들
// ============================================

/**
 * 이메일 확인 (Google Authenticator 로그인 1단계)
 * POST /api/auth/verify-email
 */
export async function verifyEmail(
  email: string,
  memberType: 'individual' | 'corporate'
): Promise<{
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberType: string;
    hasGASetup: boolean;
    isFirstLogin: boolean;
  };
  requiresOTP?: boolean;
  locked?: boolean;
  unlockAt?: string;
  remainingSeconds?: number;
  loginFailCount?: number;
  remainingAttempts?: number;
  blockFailCount?: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, memberType }),
  });

  const data = await response.json();

  // 차단 상태(403) 또는 사용자 없음(404)일 때도 데이터 반환
  if (response.status === 403 && data.locked) {
    // 차단 상태
    return {
      success: false,
      message: data.message,
      locked: true,
      unlockAt: data.unlockAt,
      remainingSeconds: data.remainingSeconds
    };
  }

  if (response.status === 404) {
    // 사용자 없음 (실패 카운트 포함)
    return {
      success: false,
      message: data.message,
      loginFailCount: data.loginFailCount,
      remainingAttempts: data.remainingAttempts,
      blockFailCount: data.blockFailCount
    };
  }

  if (!response.ok) {
    // 에러 객체에 백엔드 응답 전체를 포함 (status, message 등)
    const error: any = new Error(data.message || '이메일 확인에 실패했습니다.');
    error.response = { data };
    throw error;
  }

  return data;
}

/**
 * Google Authenticator OTP 검증 및 JWT 토큰 발급 (로그인 2단계)
 * POST /api/auth/verify-otp
 */
export async function verifyOtpBackend(
  email: string,
  memberType: 'individual' | 'corporate',
  otpCode: string
): Promise<{
  success: boolean;
  message: string;
  token?: string;
  expiresIn?: string;
  user?: User;
  locked?: boolean;
  unlockAt?: string;
  remainingSeconds?: number;
  loginFailCount?: number;
  remainingAttempts?: number;
  blockFailCount?: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, memberType, otpCode }),
  });

  const data = await response.json();

  console.log('[verifyOtpBackend] 응답:', { status: response.status, data });

  // 차단 상태(403) 확인
  if (response.status === 403) {
    console.log('[403 차단] data.locked:', data.locked, 'data:', data);
    return {
      success: false,
      message: data.message,
      locked: true,
      unlockAt: data.unlockAt,
      remainingSeconds: data.remainingSeconds
    };
  }

  // OTP 실패(401) - 실패 카운트 포함
  if (response.status === 401) {
    return {
      success: false,
      message: data.message,
      loginFailCount: data.loginFailCount,
      remainingAttempts: data.remainingAttempts,
      blockFailCount: data.blockFailCount
    };
  }

  if (!response.ok) {
    throw new Error(data.message || 'OTP 인증에 실패했습니다.');
  }

  return data;
}

/**
 * JWT 토큰으로 현재 사용자 정보 조회
 * GET /api/auth/me
 */
export async function getCurrentUserWithToken(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('사용자 정보 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * JWT 토큰 갱신
 * POST /api/auth/refresh
 */
export async function refreshAuthToken(token: string): Promise<{
  success: boolean;
  token: string;
  expiresIn: string;
}> {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }

  return response.json();
}

/**
 * JWT 인증이 필요한 API 호출을 위한 fetch wrapper
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 401 에러 시 자동 로그아웃
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth_session');
    window.location.href = '/login';
    throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
  }

  return response;
}

// ============================================
// 이메일 인증 PIN 코드 관련 함수들
// ============================================

/**
 * 이메일 인증 PIN 코드 전송
 * POST /api/auth/send-email-pin
 */
export async function sendEmailPin(email: string): Promise<{
  success: boolean;
  message: string;
  expiresIn?: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/send-email-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'PIN 코드 전송에 실패했습니다.');
  }

  return data;
}

/**
 * 이메일 인증 PIN 코드 검증 (로그인용)
 * POST /api/auth/verify-email-pin-login
 */
export async function verifyEmailPinLogin(
  email: string,
  pinCode: string,
  memberType: 'individual' | 'corporate'
): Promise<{
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    memberType: string;
    hasGASetup: boolean;
    isFirstLogin: boolean;
  };
  requiresOTP?: boolean;
}> {
  const response = await fetch(`${API_URL}/api/auth/verify-email-pin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, pinCode, memberType }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'PIN 코드 검증에 실패했습니다.');
  }

  return data;
}

/**
 * 이메일 인증 PIN 코드 검증 (회원가입용)
 * POST /api/auth/verify-email-pin-signup
 */
export async function verifyEmailPinSignup(
  email: string,
  pinCode: string
): Promise<{
  success: boolean;
  message: string;
  email: string;
}> {
  const response = await fetch(`${API_URL}/api/auth/verify-email-pin-signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, pinCode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'PIN 코드 검증에 실패했습니다.');
  }

  return data;
}

/**
 * SMS 인증번호 발송
 * POST /api/auth/send-sms-pin
 */
export async function sendSmsPin(
  phone: string
): Promise<{
  success: boolean;
  message: string;
  requestId: string;
  expiresIn: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/send-sms-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'SMS 발송에 실패했습니다.');
  }

  return data;
}

/**
 * SMS 인증번호 검증 (로그인용 - IP 기반 차단 포함)
 * POST /api/auth/verify-sms-pin
 */
export async function verifySmsPin(
  phone: string,
  pin: string,
  email?: string
): Promise<{
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  locked?: boolean;
  unlockAt?: string;
  remainingSeconds?: number;
  loginFailCount?: number;
  remainingAttempts?: number;
  blockFailCount?: number;
}> {
  const response = await fetch(`${API_URL}/api/auth/verify-sms-pin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ phone, pin, email }),
  });

  const data = await response.json();

  console.log('[verifySmsPin] 응답:', { status: response.status, data });

  // 차단 상태(403) 확인
  if (response.status === 403) {
    return {
      success: false,
      message: data.message,
      locked: true,
      unlockAt: data.unlockAt,
      remainingSeconds: data.remainingSeconds
    };
  }

  // SMS 실패(400) - 실패 카운트 포함
  if (response.status === 400) {
    return {
      success: false,
      message: data.message,
      loginFailCount: data.loginFailCount,
      remainingAttempts: data.remainingAttempts,
      blockFailCount: data.blockFailCount
    };
  }

  if (!response.ok) {
    throw new Error(data.message || 'SMS 인증에 실패했습니다.');
  }

  return data;
}

/**
 * PASS 본인인증 정보 검증 및 중복 확인
 * POST /api/auth/verify-pass-auth
 */
export async function verifyPassAuth(
  identityVerificationId: string
): Promise<{
  success: boolean;
  verifiedInfo?: {
    name: string;
    phoneNumber: string;
    birthDate: string;
    gender: string;
    ci: string;
    di: string;
  };
  isDuplicate?: boolean;
  message?: string;
}> {
  const response = await fetch(`${API_URL}/api/auth/verify-pass-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identityVerificationId }),
  });

  const data = await response.json();

  console.log('[verifyPassAuth] 응답:', { status: response.status, data });

  if (response.status === 409) {
    // 중복 가입
    return {
      success: false,
      isDuplicate: true,
      message: data.message || '이미 가입된 계정이 있습니다.'
    };
  }

  if (!response.ok) {
    throw new Error(data.message || 'PASS 인증 검증에 실패했습니다.');
  }

  return data;
}
