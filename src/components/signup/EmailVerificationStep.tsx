"use client";

import { useState, useEffect, useRef } from "react";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { SignupData } from "@/app/signup/page";

interface EmailVerificationStepProps {
  initialData: SignupData;
  onComplete: (data: Partial<SignupData>) => void;
  onBack: () => void;
}

export default function EmailVerificationStep({
  initialData,
  onComplete,
  onBack,
}: EmailVerificationStepProps) {
  const [email, setEmail] = useState(initialData.email || "");
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  const handleSendEmailCode = async () => {
    if (!email) {
      setMessage({ type: "error", text: "이메일 주소를 입력해주세요." });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage({ type: "error", text: "올바른 이메일 형식이 아닙니다." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 이메일 중복 확인 (에러 시 신규 이메일로 간주)
      const { checkEmailDuplicate } = await import('@/lib/api/auth');
      let isDuplicate = false;

      try {
        isDuplicate = await checkEmailDuplicate(email);
      } catch (error) {
        console.warn('이메일 중복 확인 실패, 신규 이메일로 간주:', error);
        isDuplicate = false;
      }

      if (isDuplicate) {
        setMessage({ type: "error", text: "이미 사용 중인 이메일 주소입니다." });
        setLoading(false);
        return;
      }

      // MVP 시연용: 인증코드 123456 발송 시뮬레이션
      setEmailCodeSent(true);
      setEmailCooldown(60);
      setEmailVerificationCode(""); // 재발송 시 입력값 초기화
      setMessage({
        type: "success",
        text: "인증코드가 이메일로 발송되었습니다. (테스트용 코드: 123456)"
      });
    } catch (error) {
      setMessage({ type: "error", text: "이메일 인증코드 발송에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (emailVerificationCode.length !== 6) {
      setMessage({ type: "error", text: "인증번호 6자리를 입력해주세요." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 이메일 인증코드 검증
      const { verifyEmailCode } = await import('@/lib/api/auth');
      const result = await verifyEmailCode(email, emailVerificationCode);

      if (result.success) {
        setEmailVerified(true);
        setMessage({ type: "success", text: result.message });

        // 인증 완료 후 자동으로 다음 단계로 이동
        setTimeout(() => {
          onComplete({ email });
        }, 1000);
      } else {
        // 입력 필드 초기화
        setEmailVerificationCode("");
        setMessage({ type: "error", text: result.message });

        // 입력 필드에 포커스
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 100);
      }
    } catch (error) {
      setMessage({ type: "error", text: "인증코드 검증에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <EnvelopeIcon className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          이메일 인증을 진행합니다
        </h2>
        <p className="text-gray-600 mt-1">
          이메일로 발송된 인증코드를 입력해주세요
        </p>
      </div>

      {/* 메시지 */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            message.type === "success"
              ? "bg-primary-50 border-primary-200 text-primary-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center">
            {message.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        </div>
      )}

      {/* 입력 폼 */}
      <div className="space-y-4">
        {/* 이메일 (로그인 ID) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일 (로그인 ID)
          </label>
          <div className="flex space-x-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={emailVerified}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="example@email.com"
            />
            {!emailVerified && (
              <button
                onClick={handleSendEmailCode}
                disabled={emailCooldown > 0 || loading}
                className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
              >
                {emailCooldown > 0
                  ? `재발송 (${emailCooldown})`
                  : emailCodeSent
                  ? "재발송"
                  : "인증요청"}
              </button>
            )}
            {emailVerified && (
              <div className="flex items-center px-4 py-3 bg-sky-50 border border-sky-200 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-sky-600 mr-2" />
                <span className="text-sm font-medium text-sky-600">
                  인증완료
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 이메일 인증번호 입력 */}
        {emailCodeSent && !emailVerified && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일 인증번호
            </label>
            <div className="flex space-x-2">
              <input
                ref={emailInputRef}
                type="text"
                maxLength={6}
                value={emailVerificationCode}
                onChange={(e) =>
                  setEmailVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-xl font-mono tracking-widest"
                placeholder="123456"
              />
              <button
                onClick={handleVerifyEmail}
                disabled={emailVerificationCode.length !== 6 || loading}
                className="px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
              >
                {loading ? "확인 중..." : "인증확인"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 버튼 */}
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          이전
        </button>
      </div>
    </div>
  );
}
