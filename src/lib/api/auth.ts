import { User } from '@/types/user';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  const response = await fetch(`${API_URL}/auth/login`, {
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
  const response = await fetch(`${API_URL}/users?email=${email}`);

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
  const response = await fetch(`${API_URL}/users`);

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
  const response = await fetch(`${API_URL}/users/${userId}`, {
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
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('회원가입에 실패했습니다.');
  }

  return response.json();
}

/**
 * 이메일 중복 확인
 */
export async function checkEmailDuplicate(email: string): Promise<boolean> {
  const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`);

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
