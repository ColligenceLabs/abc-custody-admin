"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import PassVerificationStep from "@/components/signup/PassVerificationStep";

export default function PassVerificationPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePassComplete = (passData: any) => {
    console.log('[PassVerification] PASS 인증 완료:', passData);

    // localStorage에 PASS 데이터 저장 (주소 페이지로 전달하기 위해)
    sessionStorage.setItem('onboarding_pass_data', JSON.stringify(passData));

    // 주소 설정 페이지로 이동
    router.push('/onboarding/corporate/address');
  };

  return (
    <OnboardingLayout currentStep="pass" completedSteps={['welcome', 'ga_setup']}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <PassVerificationStep
          initialData={{}}
          onComplete={handlePassComplete}
          onBack={() => router.push('/onboarding/corporate/ga-setup')}
        />
      </div>
    </OnboardingLayout>
  );
}
