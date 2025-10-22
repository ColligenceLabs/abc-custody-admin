'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel, DialogTitle, Description } from '@headlessui/react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useOTPAuth } from '@/contexts/OTPAuthContext';
import { verifyOTP, OTPServiceError } from '@/services/otpService';
import { OTPInputField } from './OTPInputField';
import { OTPErrorMessage } from './OTPErrorMessage';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function OTPVerificationModal({
  isOpen,
  onClose,
  onSuccess
}: OTPVerificationModalProps) {
  const [otpCode, setOTPCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'error' | 'locked' | 'info'>('error');
  const [remainingAttempts, setRemainingAttempts] = useState<number | undefined>();
  const [remainingSeconds, setRemainingSeconds] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { setVerified } = useOTPAuth();

  // 카운트다운 타이머
  useEffect(() => {
    if (remainingSeconds && remainingSeconds > 0) {
      const timer = setTimeout(() => {
        setRemainingSeconds(remainingSeconds - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (remainingSeconds === 0) {
      // 카운트다운 완료 시 에러 초기화
      setError(null);
      setRemainingSeconds(undefined);
      setErrorType('error');
    }
  }, [remainingSeconds]);

  const handleSubmit = async () => {
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
      const result = await verifyOTP({
        email: user.email,
        memberType: user.memberType as 'individual' | 'corporate',
        otpCode
      });

      if (result.success) {
        setVerified();
        onSuccess();
        onClose();
      }
    } catch (err) {
      if (err instanceof OTPServiceError) {
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
        setError('알 수 없는 오류가 발생했습니다.');
        setErrorType('error');
      }
      setOTPCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPChange = (value: string) => {
    setOTPCode(value);
    // 에러 초기화 (새로 입력 시작하면)
    if (error && errorType !== 'locked') {
      setError(null);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={() => {}} // 닫기 방지 (인증 필수)
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-xl p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>

          <DialogTitle className="text-xl font-bold text-center text-gray-900 mb-2">
            Google OTP 인증
          </DialogTitle>

          <Description className="text-sm text-center text-gray-600 mb-6">
            개인정보 보호를 위해 Google Authenticator 인증이 필요합니다.
          </Description>

          <div className="space-y-4">
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
              className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg
                       hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors duration-200"
            >
              {isLoading ? '확인 중...' : '확인'}
            </button>

            {errorType === 'info' && (
              <div className="text-center">
                <a
                  href="/security/security"
                  className="text-sm text-primary-600 hover:text-primary-700 underline"
                >
                  Google Authenticator 설정하러 가기
                </a>
              </div>
            )}
          </div>

          {/* 상태 변경 알림 (스크린 리더용) */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {isLoading && '인증 확인 중입니다...'}
            {error && `오류: ${error}`}
            {!error && !isLoading && otpCode.length === 6 && '인증 코드 입력 완료'}
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
