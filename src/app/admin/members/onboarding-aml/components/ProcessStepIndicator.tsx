/**
 * ProcessStepIndicator Component
 * 온보딩 프로세스 단계 표시 컴포넌트
 *
 * 4단계 프로세스 진행 상황을 시각적으로 표시
 */

import { OnboardingStep } from "@/types/onboardingAml";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProcessStepIndicatorProps {
  currentStep: OnboardingStep;
  totalSteps?: number;
  type: "individual" | "corporate";
  amlCompleted?: boolean; // 외부 AML 완료 여부
  className?: string;
}

/**
 * 개인회원 단계명
 */
const individualSteps = [
  "KYC 신원확인",
  "AML 스크리닝",
  "위험도 평가",
  "추가 절차",
  "최종 승인",
];

/**
 * 법인회원 단계명
 */
const corporateSteps = [
  "법인 정보 확인",
  "UBO 검증",
  "위험도 평가",
  "추가 절차",
  "최종 승인",
];

export function ProcessStepIndicator({
  currentStep,
  totalSteps = 5,
  type,
  amlCompleted = false,
  className,
}: ProcessStepIndicatorProps) {
  const steps = type === "individual" ? individualSteps : corporateSteps;

  return (
    <div className={cn("w-full", className)}>
      {/* 진행률 바 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            진행 단계: {currentStep}/{totalSteps}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round((currentStep / totalSteps) * 100)}% 완료
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* 단계 표시 */}
      <div className="space-y-2">
        {steps.map((stepName, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          // 2단계(AML 스크리닝/UBO 검증)에서 외부 시스템 대기 표시
          const isWaitingForExternal = stepNumber === 2 && isCurrent && !amlCompleted;

          return (
            <div
              key={stepNumber}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all",
                isCompleted && "bg-sky-50 border-sky-200",
                isCurrent && "bg-blue-50 border-blue-300 shadow-sm",
                isUpcoming && "bg-gray-50 border-gray-200 opacity-60"
              )}
            >
              {/* 단계 번호/체크 아이콘 */}
              <div
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm",
                  isCompleted && "bg-sky-600 text-white",
                  isCurrent && "bg-blue-600 text-white",
                  isUpcoming && "bg-gray-300 text-gray-600"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stepNumber
                )}
              </div>

              {/* 단계명 */}
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isCompleted && "text-sky-700",
                    isCurrent && "text-blue-700",
                    isUpcoming && "text-gray-500"
                  )}
                >
                  {stepName}
                </p>

                {/* 외부 시스템 대기 메시지 */}
                {isWaitingForExternal && (
                  <p className="text-xs text-yellow-600 mt-1">
                    외부 AML 시스템 처리 중...
                  </p>
                )}

                {/* 완료 메시지 */}
                {isCompleted && (
                  <p className="text-xs text-sky-600 mt-1">
                    완료
                  </p>
                )}

                {/* 진행중 메시지 */}
                {isCurrent && !isWaitingForExternal && (
                  <p className="text-xs text-blue-600 mt-1">
                    진행중
                  </p>
                )}
              </div>

              {/* 상태 인디케이터 */}
              {isCurrent && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 외부 AML 대기 알림 */}
      {currentStep === 2 && !amlCompleted && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">
            외부 AML 솔루션에서 {type === "individual" ? "스크리닝" : "UBO 검증"}을 진행 중입니다.
            결과가 도착하면 자동으로 다음 단계로 진행됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
