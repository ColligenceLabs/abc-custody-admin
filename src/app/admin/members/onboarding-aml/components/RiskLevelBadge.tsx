/**
 * RiskLevelBadge Component
 * 위험도 레벨 배지 컴포넌트
 *
 * 외부 AML 시스템의 위험도 평가 결과를 표시
 * 읽기 전용 정보
 */

import { Badge } from "@/components/ui/badge";
import { RiskLevel } from "@/types/onboardingAml";
import { cn } from "@/lib/utils";

interface RiskLevelBadgeProps {
  level: RiskLevel;
  source?: string; // 외부 AML 솔루션명 (예: "Chainalysis KYT")
  className?: string;
}

/**
 * 위험도별 스타일 매핑
 */
const riskLevelStyles: Record<RiskLevel, string> = {
  LOW: "text-sky-600 bg-sky-50 border-sky-200",
  MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
  HIGH: "text-red-600 bg-red-50 border-red-200",
};

/**
 * 위험도별 라벨
 */
const riskLevelLabels: Record<RiskLevel, string> = {
  LOW: "낮음",
  MEDIUM: "중간",
  HIGH: "높음",
};

export function RiskLevelBadge({ level, source, className }: RiskLevelBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge
        variant="outline"
        className={cn(riskLevelStyles[level], "font-medium")}
      >
        {level} - {riskLevelLabels[level]}
      </Badge>
      {source && (
        <span className="text-xs text-muted-foreground">
          (출처: {source})
        </span>
      )}
    </div>
  );
}
