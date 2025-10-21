/**
 * Corporate EDD Section Component
 * 법인회원 EDD (Enhanced Due Diligence) 정보 표시 섹션
 *
 * 제출된 EDD 서류 및 UBO 상세 정보를 표시
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download, CheckCircle2, Clock, User } from "lucide-react";
import { CorporateEDDSubmission } from "@/types/onboardingAml";

interface CorporateEDDSectionProps {
  edd: Omit<CorporateEDDSubmission, 'applicationId'> | null;
  eddRequired: boolean;
}

export function CorporateEDDSection({ edd, eddRequired }: CorporateEDDSectionProps) {
  // EDD가 필요하지 않은 경우
  if (!eddRequired) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>EDD (Enhanced Due Diligence)</CardTitle>
              <CardDescription>추가 실사 정보</CardDescription>
            </div>
            <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              불필요
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            LOW 또는 MEDIUM 리스크로 평가되어 추가 실사가 필요하지 않습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  // EDD가 필요하지만 아직 제출되지 않은 경우
  if (!edd?.submittedAt) {
    return (
      <Card className="border-yellow-200 bg-yellow-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>EDD (Enhanced Due Diligence)</CardTitle>
              <CardDescription>추가 실사 정보</CardDescription>
            </div>
            <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
              <Clock className="h-3 w-3 mr-1" />
              제출 대기
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-yellow-700">
            HIGH 리스크로 평가되어 추가 실사가 필요합니다. 법인에게 EDD 서류 및 UBO 상세 정보 제출을 요청하세요.
          </div>
        </CardContent>
      </Card>
    );
  }

  // EDD가 제출된 경우
  const businessDocuments = [
    { label: "사업 계획서", url: edd.businessPlanUrl },
    { label: "재무제표", url: edd.financialStatementsUrl },
    { label: "거래처 목록", url: edd.clientListUrl },
  ].filter(doc => doc.url);

  const investigationDocuments = [
    { label: "백그라운드 체크", url: edd.backgroundCheckUrl },
    { label: "현장 실사 보고서", url: edd.onSiteInspectionUrl },
    { label: "임원 인터뷰 기록", url: edd.executiveInterviewUrl },
  ].filter(doc => doc.url);

  return (
    <Card className="border-sky-200 bg-sky-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>EDD (Enhanced Due Diligence)</CardTitle>
            <CardDescription>추가 실사 정보</CardDescription>
          </div>
          <Badge variant="default" className="text-sky-600 bg-sky-50 border-sky-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            제출 완료
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 제출 일시 */}
        <div className="flex items-center gap-2 text-sm text-sky-700">
          <Clock className="h-4 w-4" />
          <span>
            제출 일시: {new Date(edd.submittedAt).toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* UBO 상세 정보 */}
        {edd.detailedUboInfo && edd.detailedUboInfo.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              UBO 상세 정보
            </div>
            <div className="space-y-3">
              {edd.detailedUboInfo.map((ubo: { uboId: string; idNumber: string; idImageUrl: string; fundSourceUrl?: string }, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{ubo.uboId}</div>
                    <Badge variant="outline" className="text-xs">UBO {index + 1}</Badge>
                  </div>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">신분증 번호:</span>
                      <span className="font-mono">{ubo.idNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">신분증 이미지:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(ubo.idImageUrl, '_blank')}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        보기
                      </Button>
                    </div>
                    {ubo.fundSourceUrl && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">자금 출처:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(ubo.fundSourceUrl!, '_blank')}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          보기
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 사업 관련 서류 */}
        {businessDocuments.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-3">사업 관련 서류</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {businessDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{doc.label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    보기
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 조사 관련 서류 */}
        {investigationDocuments.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-3">조사 관련 서류</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {investigationDocuments.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{doc.label}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    보기
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 추가 서류 */}
        {edd.additionalDocumentUrls && edd.additionalDocumentUrls.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-3">기타 추가 서류</div>
            <div className="space-y-2">
              {edd.additionalDocumentUrls.map((url: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-muted-foreground truncate">
                      추가 서류 {index + 1}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(url, '_blank')}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    보기
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
