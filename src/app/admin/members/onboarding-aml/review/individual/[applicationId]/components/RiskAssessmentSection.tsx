/**
 * RiskAssessmentSection Component
 * 위험도 평가 결과 섹션
 *
 * 외부 AML 솔루션의 위험도 평가 결과 표시 (읽기 전용)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { RiskAssessment } from "@/types/onboardingAml";
import { RiskLevelBadge } from "../../../../components/RiskLevelBadge";

interface RiskAssessmentSectionProps {
  riskAssessment: RiskAssessment;
}

export function RiskAssessmentSection({ riskAssessment }: RiskAssessmentSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              위험도 평가
            </CardTitle>
            <CardDescription>
              외부 시스템 평가 | {new Date(riskAssessment.assessedAt).toLocaleString('ko-KR')}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200">
            읽기 전용
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 종합 위험도 */}
        <div className="p-6 border-2 rounded-lg text-center">
          <div className="text-sm text-muted-foreground mb-2">종합 위험도</div>
          <div className="flex items-center justify-center gap-3">
            <RiskLevelBadge level={riskAssessment.riskLevel} source="SYSTEM" />
            {riskAssessment.riskScore !== undefined && (
              <div className="text-2xl font-bold">{riskAssessment.riskScore}/100</div>
            )}
          </div>
        </div>


        {/* 평가 정보 */}
        <div className="pt-4 border-t grid gap-3 md:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground mb-1">평가 방식</div>
            <Badge variant="outline">
              {riskAssessment.assessedBy === 'SYSTEM' ? '자동 평가' : '수동 평가'}
            </Badge>
          </div>
          {riskAssessment.externalReferenceId && (
            <div>
              <div className="text-sm text-muted-foreground mb-1">외부 참조 ID</div>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {riskAssessment.externalReferenceId}
              </code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
