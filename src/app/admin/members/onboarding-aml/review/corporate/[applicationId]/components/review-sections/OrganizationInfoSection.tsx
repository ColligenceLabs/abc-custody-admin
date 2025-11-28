/**
 * 법인 기본정보 섹션 (24개 필드 전체 표시)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrganizationDetail, FilesUrls } from "@/types/corporateOnboardingReview";
import { getCorporateTypeLabel } from "@/lib/corporateLabels";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrganizationInfoSectionProps {
  organization: OrganizationDetail;
  files: FilesUrls;
}

export function OrganizationInfoSection({ organization, files }: OrganizationInfoSectionProps) {
  const handleFileView = (url?: string) => {
    console.log('handleFileView called with URL:', url);
    console.log('All files:', files);
    if (url) {
      console.log('Opening URL:', url);
      window.open(url, '_blank');
    } else {
      console.error('URL is undefined or empty');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>법인 기본정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 기본 정보 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">기본 정보</h3>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-xs text-gray-500">법인명</label><p className="font-medium">{organization.organizationName}</p></div>
            <div><label className="text-xs text-gray-500">사업자등록번호</label><p>{organization.businessNumber}</p></div>
            <div><label className="text-xs text-gray-500">법인등록번호</label><p>{organization.corporateRegistryNumber}</p></div>
            <div><label className="text-xs text-gray-500">설립일자</label><p>{organization.establishmentDate}</p></div>
            <div><label className="text-xs text-gray-500">법인유형</label><p>{getCorporateTypeLabel(organization.corporateType)}</p></div>
            <div><label className="text-xs text-gray-500">업종</label><p>{organization.industryType || '-'}</p></div>
          </div>
        </div>

        {/* 법인 속성 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">법인 속성</h3>
          <div className="flex gap-2">
            <Badge variant={organization.isVASP ? "destructive" : "secondary"}>VASP: {organization.isVASP ? 'Y' : 'N'}</Badge>
            <Badge variant={organization.isFinancialInstitution ? "default" : "secondary"}>금융기관: {organization.isFinancialInstitution ? 'Y' : 'N'}</Badge>
            <Badge variant="secondary">비영리: {organization.isNonProfit ? 'Y' : 'N'}</Badge>
            <Badge variant="secondary">공공기관: {organization.isPublicEntity ? 'Y' : 'N'}</Badge>
          </div>
        </div>

        {/* 주소 및 연락처 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">주소 및 연락처</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs text-gray-500">우편번호</label><p>{organization.zipCode || '-'}</p></div>
            <div><label className="text-xs text-gray-500">전화번호</label><p>{organization.phone || '-'}</p></div>
            <div className="col-span-2"><label className="text-xs text-gray-500">주소</label><p>{organization.address || '-'} {organization.addressDetail}</p></div>
            <div><label className="text-xs text-gray-500">국가</label><p>{organization.countryCode || 'KR'}</p></div>
            <div><label className="text-xs text-gray-500">홈페이지</label><p className="text-blue-600">{organization.homepageUrl || '-'}</p></div>
          </div>
        </div>

        {/* 실소유자 면제 */}
        {organization.isRealOwnerExempt && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">실소유자 확인 면제 (코드: {organization.realOwnerExemptCode})</p>
          </div>
        )}

        {/* 제출 서류 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">제출 서류</h3>
          <div className="grid grid-cols-2 gap-3">
            {['businessLicense', 'corporateRegistry', 'articlesOfIncorporation', 'shareholderList'].map((key) => {
              const labels: Record<string, string> = {
                businessLicense: '사업자등록증',
                corporateRegistry: '법인등기부등본',
                articlesOfIncorporation: '정관',
                shareholderList: '주주명부'
              };
              const url = files[key as keyof FilesUrls];
              return (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{labels[key]}</span>
                  </div>
                  {url ? (
                    <Button variant="ghost" size="sm" onClick={() => handleFileView(url)}>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-xs">미제출</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
