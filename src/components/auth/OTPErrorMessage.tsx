'use client';

import { ExclamationTriangleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface OTPErrorMessageProps {
  message: string;
  type?: 'error' | 'locked' | 'info';
  remainingAttempts?: number;
  remainingSeconds?: number;
}

export function OTPErrorMessage({
  message,
  type = 'error',
  remainingAttempts,
  remainingSeconds
}: OTPErrorMessageProps) {
  const getStyles = () => {
    switch (type) {
      case 'locked':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-800'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-800'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          text: 'text-red-800'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      id="otp-error"
      role="alert"
      aria-live="polite"
      className={`p-4 border rounded-lg ${styles.container}`}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {type === 'locked' ? (
            <ClockIcon className={`h-5 w-5 ${styles.icon}`} />
          ) : (
            <ExclamationTriangleIcon className={`h-5 w-5 ${styles.icon}`} />
          )}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {message}
          </p>

          {remainingAttempts !== undefined && remainingAttempts > 0 && (
            <p className={`text-sm mt-1 ${styles.text}`}>
              남은 시도 횟수: {remainingAttempts}회
            </p>
          )}

          {remainingSeconds !== undefined && remainingSeconds > 0 && (
            <p className={`text-sm mt-1 font-semibold ${styles.text}`}>
              {Math.floor(remainingSeconds / 60)}분 {remainingSeconds % 60}초 후 재시도 가능
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
