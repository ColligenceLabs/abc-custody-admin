/**
 * RegistrationSourceBadge Component
 * 신청 경로 배지 컴포넌트
 *
 * 온라인/오프라인 신청 경로를 구분하여 표시
 */

import { Badge } from "@/components/ui/badge";
import { RegistrationSource } from "@/types/onboardingAml";
import { cn } from "@/lib/utils";
import { Globe, Building, Phone, Mail } from "lucide-react";

interface RegistrationSourceBadgeProps {
  source: RegistrationSource;
  showIcon?: boolean;
  className?: string;
}

/**
 * 신청 경로별 스타일 매핑
 */
const sourceStyles: Record<RegistrationSource, string> = {
  ONLINE: "text-blue-600 bg-blue-50 border-blue-200",
  OFFLINE_BRANCH: "text-purple-600 bg-purple-50 border-purple-200",
  PHONE_INQUIRY: "text-indigo-600 bg-indigo-50 border-indigo-200",
  EMAIL_REQUEST: "text-teal-600 bg-teal-50 border-teal-200",
};

/**
 * 신청 경로별 라벨
 */
const sourceLabels: Record<RegistrationSource, string> = {
  ONLINE: "온라인 신청",
  OFFLINE_BRANCH: "지점 방문",
  PHONE_INQUIRY: "전화 문의",
  EMAIL_REQUEST: "이메일 요청",
};

/**
 * 신청 경로별 아이콘
 */
const sourceIcons: Record<RegistrationSource, React.ElementType> = {
  ONLINE: Globe,
  OFFLINE_BRANCH: Building,
  PHONE_INQUIRY: Phone,
  EMAIL_REQUEST: Mail,
};

export function RegistrationSourceBadge({
  source,
  showIcon = true,
  className,
}: RegistrationSourceBadgeProps) {
  const Icon = sourceIcons[source];

  return (
    <Badge
      variant="outline"
      className={cn(sourceStyles[source], "font-medium", className)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {sourceLabels[source]}
    </Badge>
  );
}
