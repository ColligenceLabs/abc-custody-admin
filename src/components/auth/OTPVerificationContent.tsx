'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOTPAuth } from '@/contexts/OTPAuthContext';
import { verifyOTP, OTPServiceError } from '@/services/otpService';
import { OTPInputField } from './OTPInputField';
import { OTPErrorMessage } from './OTPErrorMessage';
import Link from 'next/link';

interface OTPVerificationContentProps {
  onSuccess: () => void;
}

export function OTPVerificationContent({ onSuccess }: OTPVerificationContentProps) {
  const { user } = useAuth();
  const { setVerified } = useOTPAuth();
  const [otpCode, setOTPCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'error' | 'locked' | 'info'>('error');
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>();
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>();

  useEffect(() => {
    if (remainingSeconds && remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (remainingSeconds === 0) {
      setError(null);
      setRemainingSeconds(undefined);
      setErrorType('error');
    }
  }, [remainingSeconds]);

  const handleSubmit = useCallback(async () => {
    if (otpCode.length !== 6) {
      setError('OTP 코드는 6자리 숫자여야 합니다.');
      setErrorType('error');
      return;
    }

    if (!user) {
      setError('사용자 정보를 찾을 수 없습니다.');
      setErrorType('error');
      return;
    }

    setIsLoading(true);
    setError(null);
    setRemainingAttempts(undefined);
    setRemainingSeconds(undefined);

    try {
      console.log('[OTP] 인증 요청:', {
        email: user.email,
        memberType: user.memberType,
        otpCodeLength: otpCode.length
      });

      const result = await verifyOTP({
        email: user.email,
        memberType: user.memberType as 'individual' | 'corporate',
        otpCode
      });

      console.log('[OTP] 인증 성공:', result);

      if (result.success) {
        setVerified();
        onSuccess();
      }
    } catch (err) {
      console.error('[OTP] 인증 실패:', err);

      if (err instanceof OTPServiceError) {
        console.error('[OTP] 서비스 오류:', {
          code: err.code,
          message: err.message,
          details: err.details
        });

        setError(err.message);

        if (err.code === 'ACCOUNT_LOCKED') {
          setErrorType('locked');
          setRemainingSeconds(err.details.remainingSeconds);
        } else if (err.code === 'GA_NOT_SETUP') {
          setErrorType('info');
        } else {
          setErrorType('error');
          setRemainingAttempts(err.details.remainingAttempts);
        }
      } else {
        console.error('[OTP] 알 수 없는 오류:', err);
        setError('알 수 없는 오류가 발생했습니다.');
        setErrorType('error');
      }
      setOTPCode('');
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, user, setVerified, onSuccess]);

  // 6자리 입력 완료 시 자동 인증
  useEffect(() => {
    if (otpCode.length === 6 && !isLoading && errorType !== 'locked') {
      const timer = setTimeout(() => {
        handleSubmit();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [otpCode, isLoading, errorType, handleSubmit]);

  const handleOTPChange = (value: string) => {
    setOTPCode(value);
    if (error && errorType !== 'locked') {
      setError(null);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              OTP 인증
            </h2>
            <p className="text-sm text-gray-600">
              Google Authenticator 앱에서 생성된
              <br />
              6자리 인증 코드를 입력하세요
            </p>
          </div>

          <div className="space-y-6">
            <OTPInputField
              value={otpCode}
              onChange={handleOTPChange}
              onSubmit={handleSubmit}
              disabled={isLoading || errorType === 'locked'}
            />

            {error && (
              <OTPErrorMessage
                message={error}
                type={errorType}
                remainingAttempts={remainingAttempts}
                remainingSeconds={remainingSeconds}
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={otpCode.length !== 6 || isLoading || errorType === 'locked'}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-primary-600 rounded-lg
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '인증 중...' : '인증하기'}
            </button>

            {errorType === 'info' && (
              <div className="text-center">
                <Link
                  href="/security"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Google Authenticator 설정하기
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              개인정보 보호를 위해 마이페이지 접근 시 OTP 인증이 필요합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
