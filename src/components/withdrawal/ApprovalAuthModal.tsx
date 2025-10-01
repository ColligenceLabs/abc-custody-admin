"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { ApprovalAuthSession, WithdrawalRequest } from "@/types/withdrawal";
import {
  createAuthSession,
  verifyOTP,
  sendSMSCode,
  verifySMSCode,
  updateAuthStep,
  validateAuthSession,
  getRemainingTime,
  formatRemainingTime,
  canResendSMS,
  markSMSSent,
  mockCurrentUserAuth,
} from "@/utils/authenticationHelpers";
import { formatAmount } from "@/utils/withdrawalHelpers";

interface ApprovalAuthModalProps {
  isOpen: boolean;
  request: WithdrawalRequest | null;
  onClose: () => void;
  onAuthComplete: (sessionId: string) => void;
  onAuthFailed: (reason: string) => void;
}

export default function ApprovalAuthModal({
  isOpen,
  request,
  onClose,
  onAuthComplete,
  onAuthFailed,
}: ApprovalAuthModalProps) {
  const [authSession, setAuthSession] = useState<ApprovalAuthSession | null>(null);
  const [currentStep, setCurrentStep] = useState<"otp" | "sms" | "complete">("otp");
  const [otpCode, setOtpCode] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [otpRemainingTime, setOtpRemainingTime] = useState(0);
  const [smsRemainingTime, setSmsRemainingTime] = useState(0);
  const [smsSent, setSmsSent] = useState(false);

  // 모달이 열릴 때 인증 세션 초기화
  useEffect(() => {
    if (isOpen && request) {
      const session = createAuthSession(request.id);
      setAuthSession(session);
      setCurrentStep("otp");
      setOtpCode("");
      setSmsCode("");
      setErrorMessage("");
      setSmsSent(false);
    }
  }, [isOpen, request]);

  // 타이머 업데이트
  useEffect(() => {
    if (!authSession) return;

    const timer = setInterval(() => {
      const otpTime = getRemainingTime(authSession.otpAuth.expiresAt!);
      const smsTime = authSession.smsAuth.expiresAt
        ? getRemainingTime(authSession.smsAuth.expiresAt)
        : 0;

      setOtpRemainingTime(otpTime);
      setSmsRemainingTime(smsTime);

      // 시간 만료 시 처리
      if (otpTime === 0 && currentStep === "otp") {
        setErrorMessage("OTP 인증 시간이 만료되었습니다.");
      }
      if (smsTime === 0 && currentStep === "sms") {
        setErrorMessage("SMS 인증 시간이 만료되었습니다.");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [authSession, currentStep]);

  const handleOTPVerify = async () => {
    if (!authSession || !otpCode) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const isValid = await verifyOTP(otpCode, authSession.sessionId);

      if (isValid) {
        const updatedSession = updateAuthStep(authSession, "otp", "verified");
        setAuthSession(updatedSession);
        setCurrentStep("sms");
        setOtpCode("");

        // SMS 자동 발송
        await handleSMSSend();
      } else {
        const updatedSession = updateAuthStep(authSession, "otp", "failed");
        setAuthSession(updatedSession);
        setErrorMessage(`OTP 인증에 실패했습니다. (시도: ${updatedSession.otpAuth.attempts}/${updatedSession.otpAuth.maxAttempts})`);

        if (updatedSession.otpAuth.attempts >= updatedSession.otpAuth.maxAttempts) {
          onAuthFailed("OTP 인증 시도 횟수를 초과했습니다.");
          return;
        }
      }
    } catch (error) {
      setErrorMessage("OTP 인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMSSend = async () => {
    if (!authSession || !canResendSMS()) {
      setErrorMessage("SMS 재발송은 1분 후에 가능합니다.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await sendSMSCode(mockCurrentUserAuth.phoneNumber, authSession.sessionId);

      if (result.success) {
        setSmsSent(true);
        markSMSSent();

        // SMS 만료 시간 업데이트
        const now = new Date();
        const updatedSession = {
          ...authSession,
          smsAuth: {
            ...authSession.smsAuth,
            expiresAt: new Date(now.getTime() + 3 * 60 * 1000).toISOString(),
          },
        };
        setAuthSession(updatedSession);
      } else {
        setErrorMessage("SMS 발송에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      setErrorMessage("SMS 발송 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSMSVerify = async () => {
    if (!authSession || !smsCode) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const isValid = await verifySMSCode(smsCode, authSession.sessionId);

      if (isValid) {
        const updatedSession = updateAuthStep(authSession, "sms", "verified");
        setAuthSession(updatedSession);
        setCurrentStep("complete");
        setSmsCode("");

        // 인증 완료
        setTimeout(() => {
          onAuthComplete(updatedSession.sessionId);
        }, 2000);
      } else {
        const updatedSession = updateAuthStep(authSession, "sms", "failed");
        setAuthSession(updatedSession);
        setErrorMessage(`SMS 인증에 실패했습니다. (시도: ${updatedSession.smsAuth.attempts}/${updatedSession.smsAuth.maxAttempts})`);

        if (updatedSession.smsAuth.attempts >= updatedSession.smsAuth.maxAttempts) {
          onAuthFailed("SMS 인증 시도 횟수를 초과했습니다.");
          return;
        }
      }
    } catch (error) {
      setErrorMessage("SMS 인증 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAuthSession(null);
    setOtpCode("");
    setSmsCode("");
    setErrorMessage("");
    setCurrentStep("otp");
    onClose();
  };

  if (!request || !authSession) return null;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              관리자 인증
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 출금 정보 요약 */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{request.title}</h4>
            <div className="text-sm text-gray-600">
              <p>신청 ID: #{request.id}</p>
              <p>출금 금액: {formatAmount(request.amount, request.currency)} {request.currency}</p>
            </div>
          </div>

          {/* 진행 단계 표시 */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center space-x-4">
              {/* OTP 단계 */}
              <div className={`flex items-center space-x-2 ${
                authSession.otpAuth.status === "verified" ? "text-sky-600" :
                currentStep === "otp" ? "text-blue-600" : "text-gray-400"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  authSession.otpAuth.status === "verified" ? "bg-sky-100" :
                  currentStep === "otp" ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  {authSession.otpAuth.status === "verified" ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <KeyIcon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium">OTP</span>
              </div>

              <div className="w-8 h-px bg-gray-200" />

              {/* SMS 단계 */}
              <div className={`flex items-center space-x-2 ${
                authSession.smsAuth.status === "verified" ? "text-sky-600" :
                currentStep === "sms" ? "text-blue-600" : "text-gray-400"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  authSession.smsAuth.status === "verified" ? "bg-sky-100" :
                  currentStep === "sms" ? "bg-blue-100" : "bg-gray-100"
                }`}>
                  {authSession.smsAuth.status === "verified" ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <DevicePhoneMobileIcon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-sm font-medium">SMS</span>
              </div>

              <div className="w-8 h-px bg-gray-200" />

              {/* 완료 단계 */}
              <div className={`flex items-center space-x-2 ${
                currentStep === "complete" ? "text-sky-600" : "text-gray-400"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  currentStep === "complete" ? "bg-sky-100" : "bg-gray-100"
                }`}>
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">완료</span>
              </div>
            </div>
          </div>

          {/* OTP 인증 단계 */}
          {currentStep === "otp" && (
            <div className="space-y-4">
              <div className="text-center">
                <KeyIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Google OTP 인증
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Google Authenticator 앱에서 6자리 인증번호를 입력해주세요.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증번호 (6자리)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>시도: {authSession.otpAuth.attempts}/{authSession.otpAuth.maxAttempts}</span>
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatRemainingTime(otpRemainingTime)}
                </span>
              </div>

              {errorMessage && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleOTPVerify}
                disabled={isLoading || otpCode.length !== 6 || otpRemainingTime === 0}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "인증 중..." : "OTP 인증"}
              </button>
            </div>
          )}

          {/* SMS 인증 단계 */}
          {currentStep === "sms" && (
            <div className="space-y-4">
              <div className="text-center">
                <DevicePhoneMobileIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  SMS 인증
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  등록된 휴대폰 번호로 인증번호를 발송했습니다.
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {mockCurrentUserAuth.phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증번호 (6자리)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="987654"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>시도: {authSession.smsAuth.attempts}/{authSession.smsAuth.maxAttempts}</span>
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {formatRemainingTime(smsRemainingTime)}
                </span>
              </div>

              {errorMessage && (
                <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <span className="text-sm text-red-800">{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <button
                  onClick={handleSMSVerify}
                  disabled={isLoading || smsCode.length !== 6 || smsRemainingTime === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? "인증 중..." : "SMS 인증"}
                </button>

                <button
                  onClick={handleSMSSend}
                  disabled={isLoading || !canResendSMS()}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  인증번호 재발송
                </button>
              </div>
            </div>
          )}

          {/* 완료 단계 */}
          {currentStep === "complete" && (
            <div className="space-y-4 text-center">
              <CheckCircleIcon className="w-16 h-16 text-sky-600 mx-auto" />
              <h4 className="text-lg font-medium text-gray-900">
                인증 완료
              </h4>
              <p className="text-sm text-gray-600">
                관리자 인증이 성공적으로 완료되었습니다.
                <br />
                출금 승인이 처리됩니다.
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}