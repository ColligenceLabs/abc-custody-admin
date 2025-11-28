/**
 * 사업/재무 정보 섹션 (21개 필드)
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BusinessInfoDetail, FilesUrls } from "@/types/corporateOnboardingReview";
import {
  formatCurrency,
  getCompanySizeLabel,
  maskSensitiveData
} from "@/lib/corporateLabels";
import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BusinessFinanceSectionProps {
  businessInfo: BusinessInfoDetail | null;
  files: FilesUrls;
}

export function BusinessFinanceSection({ businessInfo, files }: BusinessFinanceSectionProps) {
  if (!businessInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>사업/재무 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-gray-500">
            사업/재무 정보가 없습니다.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleFileView = (url?: string) => {
    if (url) window.open(url, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>사업/재무 정보</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 사업 정보 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">사업 정보</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">주요 사업</label>
              <p>{businessInfo.mainBusiness || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">주요 상품</label>
              <p>{businessInfo.mainProducts || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">주요 고객</label>
              <p>{businessInfo.majorCustomers || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">주요 공급업체</label>
              <p>{businessInfo.majorSuppliers || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">직원 수</label>
              <p>
                {businessInfo.employeeCount
                  ? `${businessInfo.employeeCount.toLocaleString('ko-KR')}명`
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">영업장 수</label>
              <p>
                {businessInfo.businessLocationCount
                  ? `${businessInfo.businessLocationCount.toLocaleString('ko-KR')}곳`
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">회계연도</label>
              <p>{businessInfo.fiscalYear || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">기업 규모</label>
              <Badge variant="secondary">
                {getCompanySizeLabel(businessInfo.companySize)}
              </Badge>
            </div>
          </div>
        </div>

        {/* 재무 정보 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">재무 정보</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">월간 매출</label>
              <p className="font-mono text-sm">
                {formatCurrency(businessInfo.monthlyRevenue)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">총 자산</label>
              <p className="font-mono text-sm">
                {formatCurrency(businessInfo.totalAssets)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">총 자본</label>
              <p className="font-mono text-sm">
                {formatCurrency(businessInfo.totalCapital)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">총 부채</label>
              <p className="font-mono text-sm">
                {formatCurrency(businessInfo.totalLiabilities)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">순이익</label>
              <p className="font-mono text-sm">
                {formatCurrency(businessInfo.netIncome)}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">시장 점유율</label>
              <p>
                {businessInfo.marketShare > 0
                  ? `${businessInfo.marketShare}%`
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* 주거래은행 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">주거래은행</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">은행명</label>
              <p>{businessInfo.mainBankName || '-'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500">계좌 국가</label>
              <p>{businessInfo.mainBankAccountCountry || '-'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">계좌번호</label>
              <p className="font-mono">
                {businessInfo.mainBankAccount
                  ? maskSensitiveData(businessInfo.mainBankAccount, 3, 4)
                  : '-'}
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-500">계좌명의인</label>
              <p>{businessInfo.mainBankAccountHolder || '-'}</p>
            </div>
          </div>
        </div>

        {/* 제출 서류 */}
        <div>
          <h3 className="text-sm font-semibold mb-3 border-b pb-2">제출 서류</h3>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-400" />
              <span className="text-sm">재무제표</span>
            </div>
            {files.financialStatements ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFileView(files.financialStatements)}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            ) : (
              <Badge variant="secondary" className="text-xs">
                미제출
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
