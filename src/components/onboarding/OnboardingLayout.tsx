"use client";

import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { ClockIcon } from "@heroicons/react/24/outline";
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
    <div className="min-h-screen bg-gray-50">
      {/* 진행 상태 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">기업 고객 온보딩</h1>
              <p className="text-sm text-gray-600 mt-1">
                서비스 이용을 위한 필수 설정을 진행해주세요
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">진행률</div>
              <div className="text-2xl font-bold text-primary-600">
                {completedSteps.length} / {CORPORATE_ONBOARDING_STEPS.length}
              </div>
            </div>
          </div>

          {/* 단계 진행 표시 */}
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="flex items-center space-x-4 min-w-max">
                {CORPORATE_ONBOARDING_STEPS.map((config, index) => {
                  const status = getStepStatus(config.step);

                  return (
                    <div key={config.step} className="flex items-center">
                      <div className="flex flex-col items-center">
                        {/* 단계 아이콘 */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                            status === 'completed'
                              ? 'bg-sky-100 border-sky-600'
                              : status === 'current'
                              ? 'bg-primary-100 border-primary-600'
                              : 'bg-gray-100 border-gray-300'
                          }`}
                        >
                          {status === 'completed' ? (
                            <CheckCircleIcon className="w-6 h-6 text-sky-600" />
                          ) : status === 'current' ? (
                            <ClockIcon className="w-6 h-6 text-primary-600" />
                          ) : (
                            <span className="text-sm font-medium text-gray-400">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* 단계 이름 */}
                        <div className="mt-2 text-center">
                          <div
                            className={`text-xs font-medium ${
                              status === 'completed'
                                ? 'text-sky-600'
                                : status === 'current'
                                ? 'text-primary-600'
                                : 'text-gray-500'
                            }`}
                          >
                            {config.title}
                          </div>
                        </div>
                      </div>

                      {/* 연결선 */}
                      {index < CORPORATE_ONBOARDING_STEPS.length - 1 && (
                        <div
                          className={`w-16 h-0.5 transition-colors ${
                            isStepCompleted(config.step)
                              ? 'bg-sky-600'
                              : 'bg-gray-300'
                          }`}
                          style={{ marginBottom: '32px' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
