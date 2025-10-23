/**
 * RenewalDueList Component
 * 고객확인 재이행 목록
 *
 * 고객확인 재이행이 필요한 회원 목록 표시
 */

"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Eye } from "lucide-react";
import { RenewalDueItem } from "@/types/onboardingAml";
import { RiskLevelBadge } from "../../components/RiskLevelBadge";

interface RenewalDueListProps {
  items: RenewalDueItem[];
  loading: boolean;
  daysThreshold: number;
  onThresholdChange: (days: number) => void;
  onRefresh: () => void;
}

export function RenewalDueList({
  items,
  loading,
  daysThreshold,
  onThresholdChange,
}: RenewalDueListProps) {
  // 긴급도 배지
  const getUrgencyBadge = (days: number) => {
    if (days <= 7) {
      return <Badge className="text-red-600 bg-red-50 border-red-200">긴급 ({days}일)</Badge>;
    } else if (days <= 14) {
      return <Badge className="text-yellow-600 bg-yellow-50 border-yellow-200">주의 ({days}일)</Badge>;
    } else {
      return <Badge className="text-sky-600 bg-sky-50 border-sky-200">여유 ({days}일)</Badge>;
    }
  };

  // 회원 타입 배지
  const getMemberTypeBadge = (type: 'individual' | 'corporate') => {
    return type === 'individual' ? (
      <Badge className="text-purple-600 bg-purple-50 border-purple-200">개인</Badge>
    ) : (
      <Badge className="text-indigo-600 bg-indigo-50 border-indigo-200">법인</Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            고객확인 재이행 목록
          </CardTitle>
          <Select
            value={daysThreshold.toString()}
            onValueChange={(value) => onThresholdChange(parseInt(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="기간 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7일 이내</SelectItem>
              <SelectItem value="14">14일 이내</SelectItem>
              <SelectItem value="30">30일 이내</SelectItem>
              <SelectItem value="60">60일 이내</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>고객확인 재이행이 필요한 회원이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">회원명 / 타입</th>
                  <th className="text-left p-4 font-medium text-sm">승인일</th>
                  <th className="text-left p-4 font-medium text-sm">재이행 예정일</th>
                  <th className="text-left p-4 font-medium text-sm">긴급도</th>
                  <th className="text-left p-4 font-medium text-sm">현재 위험도</th>
                  <th className="text-left p-4 font-medium text-sm">최근 평가</th>
                  <th className="text-center p-4 font-medium text-sm">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    {/* 회원명 / 타입 */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.applicantName}</span>
                        {getMemberTypeBadge(item.memberType)}
                      </div>
                    </td>

                    {/* 승인일 */}
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(item.approvedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* 갱신 예정일 */}
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(item.nextRenewalDue).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* 긴급도 */}
                    <td className="p-4">
                      {getUrgencyBadge(item.daysUntilRenewal)}
                    </td>

                    {/* 현재 위험도 */}
                    <td className="p-4">
                      <RiskLevelBadge level={item.currentRiskLevel} source="SYSTEM" />
                    </td>

                    {/* 최근 평가 */}
                    <td className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.lastAssessmentDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* 작업 */}
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/members/onboarding-aml/review/${item.memberType}/${item.id}`}
                      >
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
        )}
      </CardContent>
    </Card>
  );
}
