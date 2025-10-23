/**
 * AMLSection Component
 * 외부 AML 스크리닝 결과 섹션
 *
 * 외부 AML 솔루션(예: Chainalysis KYT)의 검증 결과 표시 (읽기 전용)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { AMLScreening } from "@/types/onboardingAml";

interface AMLSectionProps {
  aml: AMLScreening;
}

export function AMLSection({ aml }: AMLSectionProps) {
  const hasIssues =
    aml.pepStatus === 'MATCHED' ||
    aml.sanctionListStatus === 'MATCHED' ||
    aml.blacklistStatus === 'MATCHED';

  return (
    <Card className={hasIssues ? "border-red-200 bg-red-50/30" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              외부 AML 스크리닝 결과
            </CardTitle>
            <CardDescription>
              {aml.screeningProvider} | 검증 일시: {new Date(aml.screeningDate).toLocaleString('ko-KR')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
            읽기 전용
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PEP 상태 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">PEP (정치적 주요 인물)</span>
              {aml.pepStatus === 'CLEAR' ? (
                <CheckCircle className="h-4 w-4 text-sky-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <Badge
              variant="outline"
              className={
                aml.pepStatus === 'CLEAR'
                  ? "text-sky-600 bg-sky-50 border-sky-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }
            >
              {aml.pepStatus}
            </Badge>
            {aml.pepDetails && (
              <p className="text-sm text-muted-foreground mt-2">{aml.pepDetails}</p>
            )}
          </div>

          {/* 제재 리스트 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">제재 리스트</span>
              {aml.sanctionListStatus === 'CLEAR' ? (
                <CheckCircle className="h-4 w-4 text-sky-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <Badge
              variant="outline"
              className={
                aml.sanctionListStatus === 'CLEAR'
                  ? "text-sky-600 bg-sky-50 border-sky-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }
            >
              {aml.sanctionListStatus}
            </Badge>
            {aml.sanctionDetails && (
              <p className="text-sm text-muted-foreground mt-2">{aml.sanctionDetails}</p>
            )}
          </div>

          {/* 블랙리스트 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">블랙리스트</span>
              {aml.blacklistStatus === 'CLEAR' ? (
                <CheckCircle className="h-4 w-4 text-sky-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
            </div>
            <Badge
              variant="outline"
              className={
                aml.blacklistStatus === 'CLEAR'
                  ? "text-sky-600 bg-sky-50 border-sky-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }
            >
              {aml.blacklistStatus}
            </Badge>
          </div>

          {/* 국가 위험도 */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">국가 위험도</span>
            </div>
            <Badge
              variant="outline"
              className={
                aml.countryRiskLevel === 'LOW'
                  ? "text-sky-600 bg-sky-50 border-sky-200"
                  : aml.countryRiskLevel === 'MEDIUM'
                  ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                  : "text-red-600 bg-red-50 border-red-200"
              }
            >
              {aml.countryRiskLevel}
            </Badge>
          </div>
        </div>

        {/* 외부 참조 정보 */}
        {aml.externalReferenceId && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-1">외부 참조 ID</div>
            <code className="text-xs bg-muted px-2 py-1 rounded">{aml.externalReferenceId}</code>
          </div>
        )}

        {/* 경고 메시지 */}
        {hasIssues && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">주의</p>
                <p className="mt-1">
                  외부 AML 시스템에서 위험 요소가 감지되었습니다.
                  승인 전 추가 검토가 필요합니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
