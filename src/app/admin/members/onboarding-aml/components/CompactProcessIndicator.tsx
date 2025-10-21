/**
 * CompactProcessIndicator Component
 * 테이블용 컴팩트 프로세스 단계 표시기
 *
 * 특징:
 * - 최소 공간 사용 (약 60px 높이)
 * - 호버 시 상세 툴팁 표시
 * - 진행률 시각화
 */

"use client";

import { OnboardingStep } from "@/types/onboardingAml";
import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompactProcessIndicatorProps {
  currentStep: OnboardingStep;
  totalSteps?: number;
  type: "individual" | "corporate";
  amlCompleted?: boolean;
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

export function CompactProcessIndicator({
  currentStep,
  totalSteps = 5,
  type,
  amlCompleted = false,
  className,
}: CompactProcessIndicatorProps) {
  const steps = type === "individual" ? individualSteps : corporateSteps;
  const progress = (currentStep / totalSteps) * 100;
  const currentStepName = steps[currentStep - 1] || "";

  // 2단계에서 외부 시스템 대기 중인지 확인
  const isWaitingForExternal = currentStep === 2 && !amlCompleted;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("w-full", className)}>
            {/* 진행률 정보 */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {currentStep}/{totalSteps} 단계
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}%
              </span>
            </div>

            {/* 프로그레스 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-500",
                  isWaitingForExternal
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-blue-500 to-purple-500"
                )}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* 현재 단계명 */}
            <div className="flex items-center gap-2">
              {isWaitingForExternal ? (
                <Clock className="h-3 w-3 text-yellow-600 animate-pulse" />
              ) : (
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    currentStep === totalSteps ? "bg-sky-600" : "bg-blue-600 animate-pulse"
                  )}
                />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isWaitingForExternal
                    ? "text-yellow-700"
                    : currentStep === totalSteps
                    ? "text-sky-700"
                    : "text-blue-700"
                )}
              >
                {currentStepName}
                {isWaitingForExternal && " (외부 처리중)"}
              </span>
            </div>
          </div>
        </TooltipTrigger>

        {/* 호버 툴팁 - 전체 단계 표시 */}
        <TooltipContent side="right" className="w-72 p-4">
          <div className="space-y-3">
            <div className="font-semibold text-sm border-b pb-2">
              온보딩 진행 상황
            </div>

            {/* 전체 단계 목록 */}
            {steps.map((stepName, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              const isWaitingStep = stepNumber === 2 && isCurrent && !amlCompleted;

              return (
                <div
                  key={stepNumber}
                  className={cn(
                    "flex items-start gap-2 text-sm",
                    isCompleted && "text-sky-700",
                    isCurrent && !isWaitingStep && "text-blue-700 font-medium",
                    isWaitingStep && "text-yellow-700 font-medium",
                    !isCompleted && !isCurrent && "text-gray-500"
                  )}
                >
                  {/* 아이콘 */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-sky-600" />
                    ) : isCurrent ? (
                      isWaitingStep ? (
                        <Clock className="h-4 w-4 text-yellow-600" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-blue-600 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                        </div>
                      )
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                    )}
                  </div>

                  {/* 단계 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {stepNumber}.
                      </span>
                      <span className="truncate">{stepName}</span>
                    </div>

                    {/* 상태 메시지 */}
                    {isCompleted && (
                      <div className="text-xs text-sky-600 mt-0.5">완료</div>
                    )}
                    {isCurrent && !isWaitingStep && (
                      <div className="text-xs text-blue-600 mt-0.5">진행중</div>
                    )}
                    {isWaitingStep && (
                      <div className="text-xs text-yellow-600 mt-0.5">
                        외부 {type === "individual" ? "AML 스크리닝" : "UBO 검증"} 처리중
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 외부 시스템 대기 안내 */}
            {currentStep === 2 && !amlCompleted && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                외부 AML 솔루션에서 처리 중입니다. 결과가 도착하면 자동으로 다음 단계로
                진행됩니다.
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
