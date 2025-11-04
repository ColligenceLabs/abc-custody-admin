"use client";

import { CheckCircleIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { CORPORATE_ONBOARDING_STEPS, OnboardingStep } from "@/types/onboarding";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
}

export default function OnboardingLayout({
  children,
  currentStep,
  completedSteps,
}: OnboardingLayoutProps) {
  const getCurrentStepIndex = () => {
    return CORPORATE_ONBOARDING_STEPS.findIndex(s => s.step === currentStep);
  };

  const isStepCompleted = (step: OnboardingStep) => {
    return completedSteps.includes(step);
  };

  const isStepCurrent = (step: OnboardingStep) => {
    return currentStep === step;
  };

  const getStepStatus = (step: OnboardingStep) => {
    if (isStepCompleted(step)) return 'completed';
    if (isStepCurrent(step)) return 'current';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">기업 고객 온보딩</h1>
          <p className="mt-2 text-gray-600">서비스 이용을 위한 필수 설정을 진행해주세요</p>
        </div>

        {/* 단계 진행 표시 - 로그인 스타일과 동일 */}
        <div className="flex items-center justify-center mb-8">
          {CORPORATE_ONBOARDING_STEPS.map((config, index) => {
            const currentStepIndex = CORPORATE_ONBOARDING_STEPS.findIndex(s => s.step === currentStep);
            const isActive = currentStep === config.step;
            const isCompleted = currentStepIndex > index;
            const Icon = config.icon;

            return (
              <div key={config.step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : isActive
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-gray-300 text-gray-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-primary-600' : isCompleted ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {config.title}
                </span>
                {index < CORPORATE_ONBOARDING_STEPS.length - 1 && (
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* 메인 컨텐츠 */}
        {children}
      </div>
    </div>
  );
}
