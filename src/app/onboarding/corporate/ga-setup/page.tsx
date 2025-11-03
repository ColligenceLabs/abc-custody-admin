"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { ShieldCheckIcon, QrCodeIcon } from "@heroicons/react/24/outline";

export default function GASetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [secretKey] = useState('JBSWY3DPEHPK3PXP'); // Mock secret key
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&chld=M|0&cht=qr&chl=otpauth://totp/ABC%20Custody:${user?.email}?secret=${secretKey}&issuer=ABC%20Custody`;

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Mock 검증 (실제로는 백엔드 API 호출)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 검증 성공 시 localStorage에 저장
      const onboardingData = JSON.parse(localStorage.getItem('corporate_onboarding') || '{}');
      onboardingData.gaSetupCompleted = true;
      onboardingData.gaSetupAt = new Date().toISOString();
      localStorage.setItem('corporate_onboarding', JSON.stringify(onboardingData));

      // PASS 인증 페이지로 이동
      router.push('/onboarding/corporate/pass');
    } catch (err) {
      setError('인증에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <OnboardingLayout currentStep="ga_setup" completedSteps={['welcome']}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Google Authenticator 설정
          </h2>
          <p className="text-gray-600">
            보안을 위해 2단계 인증을 설정합니다
          </p>
        </div>

        <div className="space-y-6">
          {/* Step 1: 앱 다운로드 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                Google Authenticator 앱 설치
              </h3>
            </div>
            <p className="text-sm text-gray-600 ml-11">
              스마트폰에서 Google Authenticator 앱을 다운로드하여 설치해주세요
            </p>
          </div>

          {/* Step 2: QR 코드 스캔 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                QR 코드 스캔
              </h3>
            </div>
            <div className="flex flex-col items-center ml-11">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                또는 아래 키를 수동으로 입력하세요
              </p>
              <div className="mt-2 px-4 py-2 bg-gray-100 rounded-lg font-mono text-sm">
                {secretKey}
              </div>
            </div>
          </div>

          {/* Step 3: 인증번호 입력 */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                3
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                인증번호 확인
              </h3>
            </div>
            <div className="ml-11">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Authenticator에 표시된 6자리 숫자를 입력하세요
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push('/onboarding/corporate/welcome')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          <button
            onClick={handleVerify}
            disabled={verificationCode.length !== 6 || isVerifying}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isVerifying ? '확인 중...' : '다음'}
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}
