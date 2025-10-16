'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export function TwoFactorForm() {
  const { verify2FA, logout, isLoading, error, clearError } = useAdminAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last digit
    setCode(newCode);
    clearError();

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value && newCode.every(digit => digit !== '')) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        if (digits.length === 6) {
          const newCode = digits.split('');
          setCode(newCode);
          // Focus last input
          inputRefs.current[5]?.focus();
          // Auto-submit
          handleSubmit(digits);
        }
      });
    }

    // Handle Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      const fullCode = code.join('');
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  const handleSubmit = async (codeValue?: string) => {
    const fullCode = codeValue || code.join('');

    if (fullCode.length !== 6) {
      return;
    }

    await verify2FA(fullCode);
  };

  const handleBackToLogin = async () => {
    await logout();
  };

  const handleResendCode = () => {
    // TODO: Implement resend 2FA code functionality
    console.log('Resend 2FA code');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          2단계 인증
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Google Authenticator에서 6자리 코드를 입력하세요
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 6-digit input */}
          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <Input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="\d"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-lg font-mono"
                disabled={isLoading}
                autoComplete="off"
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleSubmit()}
              className="w-full"
              disabled={isLoading || code.some(digit => digit === '')}
              variant="sapphire"
            >
              {isLoading ? '인증 중...' : '인증'}
            </Button>

            <div className="flex justify-between items-center text-sm">
              <button
                onClick={handleBackToLogin}
                className="flex items-center gap-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                disabled={isLoading}
              >
                <ArrowLeft size={16} />
                로그인으로 돌아가기
              </button>

              <button
                onClick={handleResendCode}
                className="text-sapphire-600 hover:text-sapphire-800 dark:text-sapphire-400 dark:hover:text-sapphire-200"
                disabled={isLoading}
              >
                코드 재전송
              </button>
            </div>
          </div>

          {/* Help text */}
          <div className="bg-gray-50 dark:bg-gray-900/20 p-3 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
              <strong>도움말:</strong><br />
              • Google Authenticator 앱에서 6자리 코드를 확인하세요<br />
              • 코드는 30초마다 변경됩니다<br />
              • 코드를 복사하여 붙여넣을 수 있습니다
            </p>
          </div>

          {/* Test code notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>테스트용:</strong> 123456 입력
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}