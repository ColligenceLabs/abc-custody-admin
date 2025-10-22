const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface VerifyOTPParams {
  email: string;
  memberType: 'individual' | 'corporate';
  otpCode: string;
}

export interface VerifyOTPResult {
  success: boolean;
  message: string;
  token: string;
  expiresIn: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    memberType: string;
    phone: string;
    department?: string;
    position?: string;
    hasGASetup: boolean;
  };
}

export interface OTPError {
  error: string;
  message: string;
  loginFailCount?: number;
  remainingAttempts?: number;
  blockFailCount?: number;
  locked?: boolean;
  unlockAt?: string;
  remainingSeconds?: number;
}

export class OTPServiceError extends Error {
  public code: string;
  public details: OTPError;

  constructor(code: string, message: string, details: OTPError) {
    super(message);
    this.name = 'OTPServiceError';
    this.code = code;
    this.details = details;
  }
}

export async function verifyOTP({
  email,
  memberType,
  otpCode
}: VerifyOTPParams): Promise<VerifyOTPResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, memberType, otpCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 에러 처리
      if (response.status === 401) {
        throw new OTPServiceError(
          'INVALID_OTP',
          data.message || 'OTP 코드가 올바르지 않거나 만료되었습니다.',
          data
        );
      }

      if (response.status === 403) {
        throw new OTPServiceError(
          'ACCOUNT_LOCKED',
          `계정이 일시적으로 잠겼습니다. ${data.remainingSeconds || 0}초 후 다시 시도하세요.`,
          data
        );
      }

      if (response.status === 400) {
        throw new OTPServiceError(
          'GA_NOT_SETUP',
          'Google Authenticator가 설정되지 않았습니다. 먼저 설정해주세요.',
          data
        );
      }

      throw new OTPServiceError(
        'UNKNOWN_ERROR',
        data.message || '인증에 실패했습니다.',
        data
      );
    }

    return data as VerifyOTPResult;
  } catch (error) {
    if (error instanceof OTPServiceError) {
      throw error;
    }

    // 네트워크 오류 등
    throw new OTPServiceError(
      'NETWORK_ERROR',
      '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      {
        error: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      }
    );
  }
}
