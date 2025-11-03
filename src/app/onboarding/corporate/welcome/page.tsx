"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircleIcon, ShieldCheckIcon, UserIcon, MapPinIcon, IdentificationIcon } from "@heroicons/react/24/outline";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // 기업 사용자가 아니거나 이미 온보딩 완료한 경우 대시보드로 리다이렉트
    if (user && (user.memberType !== 'corporate' || user.onboardingCompleted)) {
      router.push('/overview');
    }
  }, [user, router]);

  const handleStart = () => {
    // GA 설정부터 시작
    router.push('/onboarding/corporate/ga-setup');
  };

  const steps = [
    {
      icon: ShieldCheckIcon,
      title: 'Google Authenticator 등록',
      description: '2단계 보안 인증 설정',
    },
    {
      icon: UserIcon,
      title: 'PASS 본인인증',
      description: '휴대폰 인증 및 개인정보 확인',
    },
    {
      icon: MapPinIcon,
      title: '주소 화이트리스트 설정',
      description: '안전한 출금을 위한 주소 등록',
    },
    {
      icon: IdentificationIcon,
      title: 'eKYC 인증',
      description: '신분증 및 계좌 인증',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            환영합니다, {user?.name}님!
          </h1>
          <p className="text-gray-600">
            ABC Custody 기업 서비스 이용을 위한 필수 설정을 진행합니다
          </p>
        </div>

        {/* 온보딩 단계 안내 */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            완료해야 할 단계
          </h2>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                  <step.icon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="inline-block w-6 h-6 bg-primary-600 text-white rounded-full text-xs font-bold flex items-center justify-center mr-2">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 ml-8">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 안내 사항 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                온보딩 안내
              </h3>
              <div className="mt-2 text-sm text-blue-800">
                <ul className="list-disc list-inside space-y-1">
                  <li>모든 단계는 순서대로 진행해야 합니다</li>
                  <li>소요 시간: 약 10-15분</li>
                  <li>중간에 나가도 진행 상황이 저장됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleStart}
          className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
        >
          온보딩 시작하기
        </button>
      </div>
    </div>
  );
}
