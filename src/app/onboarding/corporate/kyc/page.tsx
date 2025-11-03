"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import IDAndAccountVerificationStep from "@/components/signup/IDAndAccountVerificationStep";

export default function KYCPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<any>(null);

  // sessionStorage에서 온보딩 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('onboarding_data');
      if (saved) {
        setOnboardingData(JSON.parse(saved));
      } else {
        // 데이터가 없으면 주소 페이지로 리다이렉트
        router.push('/onboarding/corporate/address');
      }
    }
  }, [router]);

  const handleKYCComplete = (kycData: any) => {
    console.log('[KYC] eKYC 인증 완료:', kycData);

    // KYC 데이터 추가
    const finalData = {
      ...onboardingData,
      ...kycData,
      kycCompleted: true,
      kycVerifiedAt: new Date().toISOString(),
    };

    sessionStorage.setItem('onboarding_data', JSON.stringify(finalData));

    // 완료 페이지로 이동
    router.push('/onboarding/corporate/complete');
  };

  if (!onboardingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <OnboardingLayout
      currentStep="kyc"
      completedSteps={['welcome', 'ga_setup', 'pass', 'address']}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <IDAndAccountVerificationStep
          initialData={{
            name: onboardingData.passName || '',
            phone: onboardingData.passPhone || '',
            email: user?.email || '',
            residentNumber: onboardingData.passBirthDate && onboardingData.passGender
              ? `${onboardingData.passBirthDate.replace(/-/g, '').substring(2)}-${onboardingData.passGender === 'MALE' ? '1' : '2'}******`
              : '',
          }}
          onComplete={handleKYCComplete}
          onBack={() => router.push('/onboarding/corporate/address')}
          skipMethodSelection={true}
          birthDate={onboardingData.passBirthDate}
        />
      </div>
    </OnboardingLayout>
  );
}
