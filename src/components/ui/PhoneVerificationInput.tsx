/**
 * PhoneVerificationInput Component
 * PASS 본인인증 연동 준비된 전화번호 인증 컴포넌트
 *
 * 현재: SMS 인증 코드 방식
 * 향후: PASS 앱 본인인증 연동 가능
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Smartphone, Shield, Check } from "lucide-react";
import {
  requestPhoneVerification,
  verifySmsCode,
  isValidPhone,
  formatPhone,
  normalizePhone,
  type PassAuthRequest,
  type VerificationMethod,
} from "@/services/phoneVerificationApi";

// ===========================
// 타입 정의
// ===========================

interface PhoneVerificationInputProps {
  // 필수
  phone: string;
  onPhoneChange: (phone: string) => void;
  onVerified: (verified: boolean) => void;

  // 선택
  disabled?: boolean;          // 전체 컴포넌트 비활성화
  label?: string;             // 전화번호 필드 라벨
  required?: boolean;         // 필수 입력 표시
  showLabel?: boolean;        // 라벨 표시 여부
  method?: VerificationMethod; // 인증 방식 (SMS or PASS)
  className?: string;         // 커스텀 스타일
}

// ===========================
// 컴포넌트
// ===========================

export function PhoneVerificationInput({
  phone,
  onPhoneChange,
  onVerified,
  disabled = false,
  label = "전화번호",
  required = false,
  showLabel = true,
  method = 'SMS',
  className = "",
}: PhoneVerificationInputProps) {
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
  const [txId, setTxId] = useState("");

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

  // 전화번호 변경 핸들러 (자동 포맷팅)
  const handlePhoneChange = (value: string) => {
    if (!codeSent && !isVerified) {
      // 숫자만 추출
      const numbers = normalizePhone(value);
      // 최대 11자리
      const truncated = numbers.slice(0, 11);
      // 포맷팅하여 저장
      onPhoneChange(truncated);
    }
  };

  // 인증 코드 발송
  const handleSendCode = async () => {
    if (!phone || !isValidPhone(phone)) {
      toast({
        variant: "destructive",
        description: "올바른 전화번호를 입력해주세요. (예: 01012345678)",
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
      const response: PassAuthRequest = await requestPhoneVerification(phone, method);

      if (response.success) {
        setCodeSent(true);
        setTimeLeft(180); // 3분
        setCanResend(false);
        setResendCount((prev) => prev + 1);
        setTxId(response.txId || '');

        // Mock 환경: SMS 코드를 Toast로 표시
        if (method === 'SMS' && response.code) {
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

  // SMS 인증 코드 검증
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
      const result = await verifySmsCode(phone, verificationCode);

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
  const handlePhoneKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !codeSent && !isVerified) {
      handleSendCode();
    }
  };

  const handleCodeKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && codeSent && !isVerified) {
      handleVerifyCode();
    }
  };

  // 전화번호 표시용 포맷팅
  const displayPhone = phone ? formatPhone(phone) : '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 전화번호 입력 */}
      <div className="space-y-2">
        {showLabel && (
          <Label htmlFor="phone-verification-input">
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
            id="phone-verification-input"
            type="tel"
            value={displayPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onKeyPress={handlePhoneKeyPress}
            placeholder="010-1234-5678"
            disabled={disabled || codeSent || isVerified}
            required={required}
            aria-label={label}
            aria-required={required}
            aria-invalid={!isValidPhone(phone) && phone.length > 0}
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
              !phone ||
              !isValidPhone(phone) ||
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
                <Smartphone className="h-4 w-4 mr-2" />
                재발송 {resendCount > 0 && `(${resendCount}/3)`}
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                {method === 'PASS' ? 'PASS 인증' : 'SMS 발송'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 인증 코드 입력 (SMS 모드만) */}
      {method === 'SMS' && codeSent && !isVerified && (
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
