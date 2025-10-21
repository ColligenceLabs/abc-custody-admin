/**
 * CorporateRiskSection Component
 * 법인 위험도 평가 섹션
 *
 * 외부 AML 시스템의 법인 위험도 평가 결과 표시 (읽기 전용)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { CorporateRiskAssessment } from "@/types/onboardingAml";
import { RiskLevelBadge } from "../../../../components/RiskLevelBadge";

interface CorporateRiskSectionProps {
  riskAssessment: CorporateRiskAssessment;
}

export function CorporateRiskSection({ riskAssessment }: CorporateRiskSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          법인 위험도 평가 (외부 시스템)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 외부 시스템 정보 */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="text-sm font-medium mb-2">평가 정보</div>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">평가 일시:</span>
                <span>{new Date(riskAssessment.assessedAt).toLocaleString('ko-KR')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">평가 시스템:</span>
                <span>{riskAssessment.assessedBy}</span>
              </div>
              {riskAssessment.externalReferenceId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">참조 ID:</span>
                  <span className="font-mono text-xs">{riskAssessment.externalReferenceId}</span>
                </div>
              )}
            </div>
          </div>

          {/* 위험도 평가 항목 */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* 업종 위험도 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">업종 위험도</div>
                <RiskLevelBadge level={riskAssessment.industryRiskLevel} source="SYSTEM" />
              </div>
              <div className="text-sm text-muted-foreground">
                업종: {riskAssessment.industryType}
              </div>
            </div>

            {/* 지역 위험도 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">지역 위험도</div>
                <RiskLevelBadge level={riskAssessment.locationRiskLevel} source="SYSTEM" />
              </div>
              <div className="text-sm text-muted-foreground">
                사업장 위치: {riskAssessment.businessLocation}
              </div>
            </div>

            {/* UBO 위험도 */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">실질적 소유자 위험도</div>
                <RiskLevelBadge level={riskAssessment.uboRiskLevel} source="SYSTEM" />
              </div>
              <div className="text-sm text-muted-foreground">
                UBO 구조 및 PEP 여부 기반
              </div>
            </div>

            {/* 종합 위험도 */}
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium">종합 위험도</div>
                <RiskLevelBadge level={riskAssessment.overallRiskLevel} source="SYSTEM" />
              </div>
              {riskAssessment.riskScore !== undefined && (
                <div className="text-sm text-muted-foreground">
                  위험 점수: {riskAssessment.riskScore}/100
                </div>
              )}
            </div>
          </div>

          {/* 고위험 경고 */}
          {riskAssessment.overallRiskLevel === 'HIGH' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-900">
                  <div className="font-medium mb-1">고위험 평가</div>
                  <div>
                    외부 시스템에서 고위험으로 평가되었습니다.
                    신중한 검토와 추가 절차가 필요할 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
