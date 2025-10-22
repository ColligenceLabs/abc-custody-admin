'use client';

import { useRef, KeyboardEvent } from 'react';

interface OTPInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
}

export function OTPInputField({
  value,
  onChange,
  onSubmit,
  disabled = false
}: OTPInputFieldProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, digit: string) => {
    // 숫자만 허용
    if (!/^\d*$/.test(digit)) return;

    const newValue = value.split('');
    newValue[index] = digit;
    const result = newValue.join('');
    onChange(result);

    // 다음 입력 필드로 자동 이동
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace: 이전 필드로 이동
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow Left: 이전 필드로 이동
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Arrow Right: 다음 필드로 이동
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Enter: 폼 제출
    if (e.key === 'Enter' && value.length === 6) {
      onSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    const digits = pasteData.replace(/\D/g, '').slice(0, 6);

    if (digits) {
      onChange(digits);
      // 마지막 입력 필드로 포커스 이동
      const lastIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <div role="group" aria-labelledby="otp-input-label">
      <label id="otp-input-label" className="sr-only">
        Google Authenticator OTP 코드 6자리
      </label>
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            aria-label={`OTP 코드 ${index + 1}번째 숫자`}
            aria-required="true"
            className="w-12 h-14 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none
                     disabled:bg-gray-100 disabled:cursor-not-allowed
                     transition-colors duration-200"
            autoFocus={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
