/**
 * CorporateAdminDecisionPanel Component
 * 법인회원 관리자 결정 패널
 *
 * 승인/거부/보류 결정을 내리는 관리자 작업 영역 (법인회원용)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { CorporateOnboarding } from "@/types/onboardingAml";

interface CorporateAdminDecisionPanelProps {
  application: CorporateOnboarding;
  onApprove: () => void;
  onReject: () => void;
  onHold: () => void;
}

export function CorporateAdminDecisionPanel({
  application,
  onApprove,
  onReject,
  onHold,
}: CorporateAdminDecisionPanelProps) {
  const isDecisionPending =
    application.adminReview.status === 'PENDING' ||
    application.adminReview.status === 'UNDER_REVIEW';

  // UBO 구조에서 PEP 발견 여부 확인
  const hasUboIssues = application.ubo
    ? application.ubo.structure.some(shareholder => shareholder.pepStatus === 'MATCHED')
    : false;

  const isHighRisk = application.riskAssessment?.overallRiskLevel === 'HIGH';

  return (
    <Card>
      <CardHeader>
        <CardTitle>관리자 결정</CardTitle>
        <CardDescription>
          {isDecisionPending
            ? '외부 AML 결과를 확인하고 승인/거부/보류 결정을 내려주세요.'
            : `현재 상태: ${application.adminReview.status}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 검토 요약 */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="font-medium text-sm">검토 요약</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">법인 서류 제출</span>
              <span className="font-medium">
                {application.corporateInfo.completedAt ? '완료' : '미완료'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">UBO 검증</span>
              <span className="font-medium">
                {application.ubo ? '완료' : '대기 중'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">위험도 평가</span>
              <span className="font-medium">
                {application.riskAssessment
                  ? `${application.riskAssessment.overallRiskLevel} (${application.riskAssessment.riskScore || 'N/A'})`
                  : '대기 중'}
              </span>
            </div>
          </div>
        </div>

        {/* 위험 요소 경고 */}
        {(hasUboIssues || isHighRisk) && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">검토 필요</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  {hasUboIssues && <li>실질적 소유자(UBO) 중 PEP 발견</li>}
                  {isHighRisk && <li>높은 위험도 등급 (HIGH)</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 복잡한 구조 경고 */}
        {application.ubo && (application.ubo.complexStructure || application.ubo.trustStructure) && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-700">
                <p className="font-medium">복잡한 소유 구조</p>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  {application.ubo.complexStructure && <li>복잡한 소유 구조가 감지되었습니다.</li>}
                  {application.ubo.trustStructure && <li>신탁 구조가 포함되어 있습니다.</li>}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 결정 이력 */}
        {application.adminReview.reviewedAt && (
          <div className="p-4 border rounded-lg space-y-2">
            <h4 className="font-medium text-sm">결정 이력</h4>
            <div className="text-sm space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">검토자</span>
                <span className="font-medium">{application.adminReview.reviewedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">검토 일시</span>
                <span className="font-medium">
                  {new Date(application.adminReview.reviewedAt).toLocaleString('ko-KR')}
                </span>
              </div>
              {application.adminReview.decisionReason && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground">사유</span>
                  <p className="mt-1">{application.adminReview.decisionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 결정 버튼 */}
        {isDecisionPending && (
          <div className="grid gap-2 md:grid-cols-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onApprove}
              className="border-sky-200 hover:bg-sky-50"
              disabled={!application.ubo || !application.riskAssessment}
            >
              <CheckCircle className="mr-2 h-4 w-4 text-sky-600" />
              승인
            </Button>
            <Button
              variant="outline"
              onClick={onHold}
              className="border-yellow-200 hover:bg-yellow-50"
            >
              <Clock className="mr-2 h-4 w-4 text-yellow-600" />
              보류
            </Button>
            <Button
              variant="outline"
              onClick={onReject}
              className="border-red-200 hover:bg-red-50"
            >
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              거부
            </Button>
          </div>
        )}

        {!application.ubo && (
          <p className="text-sm text-muted-foreground text-center py-2">
            외부 UBO 검증 결과를 기다리는 중입니다.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
