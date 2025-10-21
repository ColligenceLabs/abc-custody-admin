/**
 * OnboardingStatusBadge Component
 * 온보딩 상태 배지 컴포넌트
 *
 * 관리자가 결정한 온보딩 상태를 표시
 */

import { Badge } from "@/components/ui/badge";
import { OnboardingStatus } from "@/types/onboardingAml";
import { cn } from "@/lib/utils";

interface OnboardingStatusBadgeProps {
  status: OnboardingStatus;
  className?: string;
}

/**
 * 상태별 스타일 매핑
 */
const statusStyles: Record<OnboardingStatus, string> = {
  PENDING: "text-gray-600 bg-gray-50 border-gray-200",
  UNDER_REVIEW: "text-yellow-600 bg-yellow-50 border-yellow-200",
  APPROVED: "text-sky-600 bg-sky-50 border-sky-200",
  REJECTED: "text-red-600 bg-red-50 border-red-200",
  ON_HOLD: "text-orange-600 bg-orange-50 border-orange-200",
};

/**
 * 상태별 라벨
 */
const statusLabels: Record<OnboardingStatus, string> = {
  PENDING: "대기",
  UNDER_REVIEW: "검토중",
  APPROVED: "승인",
  REJECTED: "거부",
  ON_HOLD: "보류",
};

export function OnboardingStatusBadge({ status, className }: OnboardingStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status], "font-medium", className)}
    >
      {statusLabels[status]}
    </Badge>
  );
}
