/**
 * UBOStructureViewer Component
 * UBO 구조 뷰어
 *
 * 외부 AML 시스템의 UBO 검증 결과 표시 (읽기 전용)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UBOVerification } from "@/types/onboardingAml";

interface UBOStructureViewerProps {
  ubo: UBOVerification;
}

export function UBOStructureViewer({ ubo }: UBOStructureViewerProps) {
  // PEP 상태 배지
  const getPepBadge = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return <Badge className="text-red-600 bg-red-50 border-red-200">PEP 발견</Badge>;
      case 'NOT_MATCHED':
        return <Badge className="text-sky-600 bg-sky-50 border-sky-200">PEP 미발견</Badge>;
      default:
        return <Badge className="text-gray-600 bg-gray-50 border-gray-200">확인 중</Badge>;
    }
  };

  // 검증 상태 배지
  const getVerificationBadge = (verified: boolean) => {
    return verified ? (
      <Badge className="text-sky-600 bg-sky-50 border-sky-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        검증 완료
      </Badge>
    ) : (
      <Badge className="text-yellow-600 bg-yellow-50 border-yellow-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        검증 대기
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            실질적 소유자 (UBO) 구조
          </CardTitle>
          <div className="flex items-center gap-2">
            {ubo.complexStructure && (
              <Badge className="text-indigo-600 bg-indigo-50 border-indigo-200">
                복잡 구조
              </Badge>
            )}
            {ubo.trustStructure && (
              <Badge className="text-purple-600 bg-purple-50 border-purple-200">
                신탁 구조
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 외부 시스템 정보 */}
          <div className="p-4 bg-muted/30 rounded-lg border">
            <div className="text-sm font-medium mb-2">외부 검증 정보</div>
            <div className="grid gap-2 text-sm">
              {ubo.verifiedAt && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">검증 일시:</span>
                  <span>{new Date(ubo.verifiedAt).toLocaleString('ko-KR')}</span>
                </div>
              )}
              {ubo.verifiedBy && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">검증 시스템:</span>
                  <span>{ubo.verifiedBy}</span>
                </div>
              )}
              {ubo.externalReferenceId && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">참조 ID:</span>
                  <span className="font-mono text-xs">{ubo.externalReferenceId}</span>
                </div>
              )}
            </div>
          </div>

          {/* UBO 목록 */}
          <div className="space-y-3">
            <div className="text-sm font-medium">주주 구조</div>
            {ubo.structure.map((shareholder, index) => (
              <div
                key={index}
                className={`p-4 border rounded-lg ${
                  shareholder.isUBO ? 'border-indigo-200 bg-indigo-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{shareholder.name}</span>
                      {shareholder.isUBO && (
                        <Badge className="text-indigo-600 bg-indigo-50 border-indigo-200">
                          UBO (25% 이상)
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      지분율: {shareholder.sharePercentage}%
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getPepBadge(shareholder.pepStatus)}
                    {getVerificationBadge(shareholder.idVerified)}
                  </div>
                </div>

                {/* PEP 상세 정보 */}
                {shareholder.pepStatus === 'MATCHED' && shareholder.pepDetails && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-red-900">
                        <div className="font-medium mb-1">PEP 상세 정보</div>
                        <div>{shareholder.pepDetails}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 서류 링크 */}
                {shareholder.documentUrl && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(shareholder.documentUrl, '_blank')}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      신분증 보기
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 주의사항 */}
          {ubo.structure.some(s => s.pepStatus === 'MATCHED') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-900">
                  <div className="font-medium mb-1">주의: PEP 발견</div>
                  <div>
                    실질적 소유자 중 정치적 주요인물(PEP)이 발견되었습니다.
                    추가 검토가 필요할 수 있습니다.
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
