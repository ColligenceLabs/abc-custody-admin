/**
 * AMLScreeningResult Component
 * 외부 AML 스크리닝 결과 표시 컴포넌트
 *
 * 외부 AML 솔루션의 스크리닝 결과를 읽기 전용으로 표시
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AMLScreening, RiskLevel } from "@/types/onboardingAml";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface AMLScreeningResultProps {
  result: AMLScreening;
  provider?: string; // 외부 AML 솔루션명 (result에 없으면 별도 전달)
  readonly?: boolean; // 읽기 전용 표시 여부
  className?: string;
}

/**
 * PEP 상태 스타일 및 라벨
 */
const pepStatusConfig = {
  CLEAR: {
    label: "해당 없음",
    color: "text-sky-600 bg-sky-50 border-sky-200",
    icon: CheckCircle,
  },
  MATCHED: {
    label: "매칭됨",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: XCircle,
  },
  POSSIBLE_MATCH: {
    label: "유사 매칭",
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    icon: AlertTriangle,
  },
};

/**
 * 리스트 상태 스타일 및 라벨
 */
const listStatusConfig = {
  CLEAR: {
    label: "해당 없음",
    color: "text-sky-600 bg-sky-50 border-sky-200",
    icon: CheckCircle,
  },
  MATCHED: {
    label: "매칭됨",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: XCircle,
  },
};

/**
 * 국가 위험도 스타일
 */
const countryRiskConfig: Record<RiskLevel, string> = {
  LOW: "text-sky-600 bg-sky-50 border-sky-200",
  MEDIUM: "text-yellow-600 bg-yellow-50 border-yellow-200",
  HIGH: "text-red-600 bg-red-50 border-red-200",
};

export function AMLScreeningResult({
  result,
  provider,
  readonly = true,
  className,
}: AMLScreeningResultProps) {
  const PepIcon = pepStatusConfig[result.pepStatus].icon;
  const SanctionIcon = listStatusConfig[result.sanctionListStatus].icon;
  const BlacklistIcon = listStatusConfig[result.blacklistStatus].icon;

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              AML 스크리닝 결과
            </CardTitle>
            <CardDescription>
              외부 AML 솔루션 검증 결과 (읽기 전용)
            </CardDescription>
          </div>
          {readonly && (
            <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
              읽기 전용
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* PEP 상태 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              PEP (정치적 노출인물)
            </span>
            <Badge
              variant="outline"
              className={cn(pepStatusConfig[result.pepStatus].color, "font-medium")}
            >
              <PepIcon className="mr-1 h-3 w-3" />
              {pepStatusConfig[result.pepStatus].label}
            </Badge>
          </div>
          {result.pepDetails && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              {result.pepDetails}
            </div>
          )}
        </div>

        {/* 제재리스트 상태 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              제재리스트 (OFAC, UN, EU 등)
            </span>
            <Badge
              variant="outline"
              className={cn(listStatusConfig[result.sanctionListStatus].color, "font-medium")}
            >
              <SanctionIcon className="mr-1 h-3 w-3" />
              {listStatusConfig[result.sanctionListStatus].label}
            </Badge>
          </div>
          {result.sanctionDetails && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {result.sanctionDetails}
            </div>
          )}
        </div>

        {/* 블랙리스트 상태 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              내부 블랙리스트
            </span>
            <Badge
              variant="outline"
              className={cn(listStatusConfig[result.blacklistStatus].color, "font-medium")}
            >
              <BlacklistIcon className="mr-1 h-3 w-3" />
              {listStatusConfig[result.blacklistStatus].label}
            </Badge>
          </div>
          {result.blacklistReason && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              사유: {result.blacklistReason}
            </div>
          )}
        </div>

        {/* 국가 위험도 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            거주지 국가 위험도
          </span>
          <Badge
            variant="outline"
            className={cn(countryRiskConfig[result.countryRiskLevel], "font-medium")}
          >
            {result.countryRiskLevel}
          </Badge>
        </div>

        {/* 스크리닝 정보 */}
        <div className="pt-4 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">스크리닝 제공자</span>
            <span className="font-medium">{provider || result.screeningProvider}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">스크리닝 일시</span>
            <span className="font-medium">
              {new Date(result.screeningDate).toLocaleString('ko-KR')}
            </span>
          </div>
          {result.externalReferenceId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">외부 참조 ID</span>
              <span className="font-mono text-xs text-muted-foreground">
                {result.externalReferenceId}
              </span>
            </div>
          )}
        </div>

        {/* 읽기 전용 알림 */}
        {readonly && (
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              이 정보는 외부 AML 솔루션에서 제공한 결과로, 관리자가 직접 수정할 수 없습니다.
              재검증이 필요한 경우 외부 AML 재검증 요청 기능을 사용하세요.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
