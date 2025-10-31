/**
 * IndividualTable Component
 * 개인회원 온보딩 테이블
 *
 * 목록 표시 및 페이지네이션
 */

"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Eye, FileText } from "lucide-react";
import { IndividualOnboarding } from "@/types/onboardingAml";
import { RiskLevelBadge } from "../../components/RiskLevelBadge";
import { OnboardingStatusBadge } from "../../components/OnboardingStatusBadge";
import { CompactProcessIndicator } from "../../components/CompactProcessIndicator";

interface IndividualTableProps {
  applications: IndividualOnboarding[];
  loading: boolean;
  currentPage: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export function IndividualTable({
  applications,
  loading,
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
}: IndividualTableProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <p>조회된 신청이 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium text-sm">신청자</th>
                <th className="text-left p-4 font-medium text-sm">진행 단계</th>
                <th className="text-left p-4 font-medium text-sm">위험도</th>
                <th className="text-left p-4 font-medium text-sm">EDD</th>
                <th className="text-left p-4 font-medium text-sm">상태</th>
                <th className="text-left p-4 font-medium text-sm">신청일</th>
                <th className="text-center p-4 font-medium text-sm">작업</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-muted/30 transition-colors">
                  {/* 신청자 */}
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{application.userName}</div>
                      <div className="text-sm text-muted-foreground">{application.userEmail}</div>
                    </div>
                  </td>

                  {/* 진행 단계 */}
                  <td className="p-4">
                    <CompactProcessIndicator
                      currentStep={application.adminReview.currentStep}
                      totalSteps={5}
                      type="individual"
                      amlCompleted={!!application.aml}
                    />
                  </td>

                  {/* 위험도 */}
                  <td className="p-4">
                    {application.riskAssessment ? (
                      <RiskLevelBadge
                        level={application.riskAssessment.riskLevel}
                        source="SYSTEM"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">평가 대기</span>
                    )}
                  </td>

                  {/* EDD 상태 */}
                  <td className="p-4">
                    {application.eddRequired ? (
                      application.edd?.submittedAt ? (
                        <Badge variant="default" className="text-sky-600 bg-sky-50 border-sky-200">
                          <FileText className="h-3 w-3 mr-1" />
                          제출 완료
                        </Badge>
                      ) : (
                        <Link href={`/admin/members/onboarding-aml/edd-request/individual/${application.id}`}>
                          <Badge variant="outline" className="text-yellow-600 border-yellow-300 hover:bg-yellow-50 cursor-pointer">
                            <FileText className="h-3 w-3 mr-1" />
                            요청 필요
                          </Badge>
                        </Link>
                      )
                    ) : (
                      <span className="text-sm text-muted-foreground">불필요</span>
                    )}
                  </td>

                  {/* 상태 */}
                  <td className="p-4">
                    <OnboardingStatusBadge status={application.adminReview.status} />
                  </td>

                  {/* 신청일 */}
                  <td className="p-4">
                    <div className="text-sm">
                      {new Date(application.createdAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </div>
                  </td>

                  {/* 작업 */}
                  <td className="p-4 text-center">
                    <Link href={`/admin/members/onboarding-aml/review/${application.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        검토
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              전체 {totalCount}건 중 {(currentPage - 1) * pageSize + 1}-
              {Math.min(currentPage * pageSize, totalCount)}건 표시
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                이전
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                다음
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
