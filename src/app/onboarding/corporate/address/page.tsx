"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import PersonalInfoConfirmStep from "@/components/signup/PersonalInfoConfirmStep";

export default function AddressSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [passData, setPassData] = useState<any>(null);

  // sessionStorage에서 PASS 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('onboarding_pass_data');
      if (saved) {
        setPassData(JSON.parse(saved));
      } else {
        // PASS 데이터가 없으면 PASS 페이지로 리다이렉트
        router.push('/onboarding/corporate/pass');
      }
    }
  }, [router]);

  const handleComplete = (data: any) => {
    console.log('[AddressSetup] 주소 및 약관 동의 완료:', data);

    // 전체 온보딩 데이터 저장
    const onboardingData = {
      ...passData,
      ...data,
      addressesSetup: true,
      addressSetupAt: new Date().toISOString(),
    };
    sessionStorage.setItem('onboarding_data', JSON.stringify(onboardingData));

    // eKYC 페이지로 이동
    router.push('/onboarding/corporate/kyc');
  };

  if (!passData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <OnboardingLayout currentStep="address" completedSteps={['welcome', 'ga_setup', 'pass']}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <PersonalInfoConfirmStep
          initialData={{
            passName: passData.passName || '',
            passPhone: passData.passPhone || '',
            passBirthDate: passData.passBirthDate || '',
            passGender: passData.passGender || '',
            email: user?.email || '',
            zipCode: '',
            address: '',
            detailAddress: '',
          }}
          onComplete={handleComplete}
          onBack={() => router.push('/onboarding/corporate/pass')}
        />
      </div>
    </OnboardingLayout>
  );
}
