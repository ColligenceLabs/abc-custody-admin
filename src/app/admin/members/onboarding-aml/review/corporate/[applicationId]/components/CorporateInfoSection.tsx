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
  companyName: string;
  businessNumber: string;
  corporateRegistryNumber?: string;
  establishedDate?: string;
  corporateAddress?: string;
  corporateNationality?: string;
  industry?: string;
  businessDescription?: string;
}

/**
 * 국가 코드를 한글로 변환
 */
function getCountryLabel(countryCode?: string): string {
  const labels: Record<string, string> = {
    'KOR': '대한민국',
    'USA': '미국',
    'JPN': '일본',
    'CHN': '중국',
    'SGP': '싱가포르',
    'HKG': '홍콩',
    'GBR': '영국',
    'DEU': '독일',
    'FRA': '프랑스',
  };
  return countryCode ? (labels[countryCode] || countryCode) : '-';
}

export function CorporateInfoSection({
  corporateInfo,
  companyName,
  businessNumber,
  corporateRegistryNumber,
  establishedDate,
  corporateAddress,
  corporateNationality,
  industry,
  businessDescription
}: CorporateInfoSectionProps) {
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
          법인 정보
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">기본 정보</h4>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground mb-1">법인명</div>
              <div className="font-medium">{companyName}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">법인등록번호</div>
              <div className="font-medium">{corporateRegistryNumber || '-'}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">사업자등록번호</div>
              <div className="font-medium">{businessNumber}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">설립일자</div>
              <div className="font-medium">
                {establishedDate ? new Date(establishedDate).toLocaleDateString('ko-KR') : '-'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">업종</div>
              <div className="font-medium">{industry || '-'}</div>
            </div>
            <div className="md:col-span-3"></div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">국가</div>
              <div className="font-medium">{getCountryLabel(corporateNationality)}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground mb-1">법인 소재지</div>
              <div className="font-medium">{corporateAddress || '-'}</div>
            </div>
            <div className="md:col-span-3">
              <div className="text-sm text-muted-foreground mb-1">주요 사업내용</div>
              <div className="font-medium">{businessDescription || '-'}</div>
            </div>
          </div>
        </div>

        {/* 법인 서류 */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm">제출 서류</h4>
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
