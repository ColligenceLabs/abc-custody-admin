"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/solid";

export default function CompletePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const completeOnboarding = async () => {
      try {
        // localStorage에서 온보딩 데이터 가져오기
        const onboardingData = JSON.parse(localStorage.getItem('corporate_onboarding') || '{}');

        // 백엔드 API 호출 (온보딩 완료 처리)
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/api/users/${user?.id}/complete-onboarding`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...onboardingData,
            completedAt: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          throw new Error('온보딩 완료 처리 실패');
        }

        console.log('[Onboarding] 완료 처리 성공');

        // localStorage 정리
        localStorage.removeItem('corporate_onboarding');

        // 2초 후 대시보드로 이동
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      } catch (error) {
        console.error('[Onboarding] 완료 처리 실패:', error);
        // 에러 발생해도 대시보드로 이동 (사용자 경험 우선)
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    };

    completeOnboarding();
  }, [user]);

  const handleGoToDashboard = () => {
    router.push('/overview');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-12 text-center">
        {isProcessing ? (
          <>
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <SparklesIcon className="w-12 h-12 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              온보딩을 완료하는 중입니다...
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-sky-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              온보딩이 완료되었습니다!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              이제 ABC Custody의 모든 서비스를 이용하실 수 있습니다
            </p>

            {/* 완료된 항목 */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-sm font-medium text-gray-700 mb-4">완료된 설정</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-sky-600">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Google Authenticator
                </div>
                <div className="flex items-center text-sky-600">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  PASS 본인인증
                </div>
                <div className="flex items-center text-sky-600">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  주소 화이트리스트
                </div>
                <div className="flex items-center text-sky-600">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  eKYC 인증
                </div>
              </div>
            </div>

            <button
              onClick={handleGoToDashboard}
              className="px-8 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              대시보드로 이동
            </button>
          </>
        )}
      </div>
    </div>
  );
}
