/**
 * CorporateInfoSection Component
 * 법인 정보 섹션
 *
 * 법인 서류 정보 표시 (읽기 전용)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { CorporateInfo } from "@/types/onboardingAml";

interface CorporateInfoSectionProps {
  corporateInfo: CorporateInfo;
}

export function CorporateInfoSection({ corporateInfo }: CorporateInfoSectionProps) {
  const documents = [
    {
      label: "사업자등록증",
      url: corporateInfo.businessLicenseUrl,
    },
    {
      label: "법인등기부등본",
      url: corporateInfo.corporateRegistryUrl,
    },
    {
      label: "정관",
      url: corporateInfo.articlesOfIncorporationUrl,
    },
    {
      label: "주주명부",
      url: corporateInfo.shareholderListUrl,
    },
    {
      label: "대표자 신분증",
      url: corporateInfo.representativeIdUrl,
    },
    {
      label: "인감증명서",
      url: corporateInfo.representativeSealCertUrl,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          법인 서류
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 서류 목록 */}
          <div className="grid gap-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{doc.label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  보기
                </Button>
              </div>
            ))}
          </div>

          {/* 제출 완료 시간 */}
          {corporateInfo.completedAt && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                제출 완료: {new Date(corporateInfo.completedAt).toLocaleString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
