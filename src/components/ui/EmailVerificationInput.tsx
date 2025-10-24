/**
 * EmailVerificationInput Component
 * 이메일 인증 코드 발송 및 검증을 위한 재사용 가능한 컴포넌트
 *
 * 주요 기능:
 * - 이메일 입력 및 유효성 검사
 * - 인증 코드 발송 (3분 타이머)
 * - 인증 코드 검증
 * - 재발송 기능 (최대 3회)
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Shield, Check } from "lucide-react";
import {
  sendVerificationCode,
  verifyCode,
  isValidEmail,
  type VerificationCodeResponse,
} from "@/services/emailVerificationApi";

// ===========================
// 타입 정의
// ===========================

interface EmailVerificationInputProps {
  // 필수
  email: string;
  onEmailChange: (email: string) => void;
  onVerified: (verified: boolean) => void;

  // 선택
  disabled?: boolean;       // 전체 컴포넌트 비활성화
  label?: string;          // 이메일 필드 라벨
  required?: boolean;      // 필수 입력 표시
  showLabel?: boolean;     // 라벨 표시 여부
  className?: string;      // 커스텀 스타일
}

// ===========================
// 컴포넌트
// ===========================

export function EmailVerificationInput({
  email,
  onEmailChange,
  onVerified,
  disabled = false,
  label = "이메일",
  required = false,
  showLabel = true,
  className = "",
}: EmailVerificationInputProps) {
  const { toast } = useToast();

  // 상태 관리
  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // 타이머 (3분 = 180초)
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 타이머 포맷 (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 이메일 변경 핸들러
  const handleEmailChange = (value: string) => {
    if (!codeSent && !isVerified) {
      onEmailChange(value);
    }
  };

  // 인증 코드 발송
  const handleSendCode = async () => {
    if (!email || !isValidEmail(email)) {
      toast({
        variant: "destructive",
        description: "올바른 이메일 주소를 입력해주세요.",
      });
      return;
    }

    if (resendCount >= 3) {
      toast({
        variant: "destructive",
        description: "재발송 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.",
      });
      return;
    }

    try {
      setIsSending(true);
      const response: VerificationCodeResponse = await sendVerificationCode(email);

      if (response.success) {
        setCodeSent(true);
        setTimeLeft(180); // 3분
        setCanResend(false);
        setResendCount((prev) => prev + 1);

        // Mock 환경: 인증 코드를 Toast로 표시
        if (response.code) {
          toast({
            description: `인증 코드가 발송되었습니다. (개발용: ${response.code})`,
          });
        } else {
          toast({
            description: response.message,
          });
        }
      } else {
        toast({
          variant: "destructive",
          description: response.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "인증 코드 발송에 실패했습니다.",
      });
    } finally {
      setIsSending(false);
    }
  };

  // 인증 코드 검증
  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        variant: "destructive",
        description: "6자리 인증 코드를 입력해주세요.",
      });
      return;
    }

    try {
      setIsVerifying(true);
      const result = await verifyCode(email, verificationCode);

      if (result.verified) {
        setIsVerified(true);
        onVerified(true);
        toast({
          description: result.message,
        });
      } else {
        toast({
          variant: "destructive",
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "인증 확인에 실패했습니다.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Enter 키 핸들러
  const handleEmailKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !codeSent && !isVerified) {
      handleSendCode();
    }
  };

  const handleCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && codeSent && !isVerified) {
      handleVerifyCode();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 이메일 입력 */}
      <div className="space-y-2">
        {showLabel && (
          <Label htmlFor="email-verification-input">
            {label} {required && '*'}
            {isVerified && (
              <Badge className="ml-2 text-sky-600 bg-sky-50 border-sky-200">
                <Check className="h-3 w-3 mr-1" />
                인증 완료
              </Badge>
            )}
          </Label>
        )}
        <div className="flex gap-2">
          <Input
            id="email-verification-input"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            onKeyPress={handleEmailKeyPress}
            placeholder="example@email.com"
            disabled={disabled || codeSent || isVerified}
            required={required}
            aria-label={label}
            aria-required={required}
            aria-invalid={!isValidEmail(email) && email.length > 0}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleSendCode}
            disabled={
              disabled ||
              isVerified ||
              isSending ||
              !email ||
              !isValidEmail(email) ||
              (codeSent && !canResend) ||
              resendCount >= 3
            }
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                발송 중
              </>
            ) : codeSent ? (
              <>
                <Mail className="h-4 w-4 mr-2" />
                재발송 {resendCount > 0 && `(${resendCount}/3)`}
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                발송
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 인증 코드 입력 */}
      {codeSent && !isVerified && (
        <div className="space-y-2">
          <Label htmlFor="verification-code-input">
            인증 코드 {required && '*'}
            {timeLeft > 0 && (
              <span className="ml-2 text-sm text-muted-foreground">
                {formatTime(timeLeft)} 남음
              </span>
            )}
            {timeLeft === 0 && (
              <span className="ml-2 text-sm text-red-600">
                만료됨
              </span>
            )}
          </Label>
          <div className="flex gap-2">
            <Input
              id="verification-code-input"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={handleCodeKeyPress}
              placeholder="6자리 숫자"
              maxLength={6}
              disabled={disabled || isVerified || timeLeft === 0}
              required={required}
              aria-label="인증 코드"
              aria-required={required}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={
                disabled ||
                isVerified ||
                isVerifying ||
                verificationCode.length !== 6 ||
                timeLeft === 0
              }
            >
              {isVerifying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  확인 중
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  확인
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
