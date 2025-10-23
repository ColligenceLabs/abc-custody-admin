/**
 * ReassessmentQueue Component
 * 위험 고객 재평가
 *
 * 재평가가 필요한 위험 고객의 외부 시스템 처리 상태 표시
 */

"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Eye, RefreshCw } from "lucide-react";
import { ReassessmentQueueItem } from "@/types/onboardingAml";
import { RiskLevelBadge } from "../../components/RiskLevelBadge";
import { requestIndividualAmlRescan, requestCorporateUboRescan } from "@/services/monitoringApi";

interface ReassessmentQueueProps {
  items: ReassessmentQueueItem[];
  loading: boolean;
  onRefresh: () => void;
}

export function ReassessmentQueue({
  items,
  loading,
  onRefresh,
}: ReassessmentQueueProps) {
  const { toast } = useToast();
  const [rescanningId, setRescanningId] = useState<string | null>(null);

  // 우선순위 배지
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge className="text-red-600 bg-red-50 border-red-200">높음</Badge>;
      case 'MEDIUM':
        return <Badge className="text-yellow-600 bg-yellow-50 border-yellow-200">중간</Badge>;
      case 'LOW':
        return <Badge className="text-sky-600 bg-sky-50 border-sky-200">낮음</Badge>;
      default:
        return <Badge className="text-gray-600 bg-gray-50 border-gray-200">-</Badge>;
    }
  };

  // 외부 시스템 상태 배지
  const getExternalStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="text-yellow-600 bg-yellow-50 border-yellow-200">대기 중</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="text-indigo-600 bg-indigo-50 border-indigo-200">처리 중</Badge>;
      case 'COMPLETED':
        return <Badge className="text-sky-600 bg-sky-50 border-sky-200">완료</Badge>;
      case 'FAILED':
        return <Badge className="text-red-600 bg-red-50 border-red-200">실패</Badge>;
      default:
        return <Badge className="text-gray-600 bg-gray-50 border-gray-200">-</Badge>;
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

  // 재검증 요청
  const handleRescan = async (item: ReassessmentQueueItem) => {
    try {
      setRescanningId(item.id);

      const response = item.memberType === 'individual'
        ? await requestIndividualAmlRescan(item.id)
        : await requestCorporateUboRescan(item.id);

      toast({
        description: response.message,
      });

      // 목록 새로고침
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "재검증 요청에 실패했습니다.",
      });
    } finally {
      setRescanningId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          위험 고객 재평가
        </CardTitle>
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
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>위험 고객 재평가 대기 중인 항목이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">회원명 / 타입</th>
                  <th className="text-left p-4 font-medium text-sm">현재 위험도</th>
                  <th className="text-left p-4 font-medium text-sm">재평가 사유</th>
                  <th className="text-left p-4 font-medium text-sm">요청일</th>
                  <th className="text-left p-4 font-medium text-sm">우선순위</th>
                  <th className="text-left p-4 font-medium text-sm">외부 시스템 상태</th>
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

                    {/* 현재 위험도 */}
                    <td className="p-4">
                      <RiskLevelBadge level={item.currentRiskLevel} source="SYSTEM" />
                    </td>

                    {/* 재평가 사유 */}
                    <td className="p-4">
                      <div className="text-sm max-w-xs truncate">
                        {item.reassessmentReason}
                      </div>
                    </td>

                    {/* 요청일 */}
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(item.requestedAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* 우선순위 */}
                    <td className="p-4">
                      {getPriorityBadge(item.priority)}
                    </td>

                    {/* 외부 시스템 상태 */}
                    <td className="p-4">
                      {getExternalStatusBadge(item.externalSystemStatus)}
                    </td>

                    {/* 작업 */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/members/onboarding-aml/review/${item.memberType}/${item.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            검토
                          </Button>
                        </Link>
                        {(item.externalSystemStatus === 'FAILED' ||
                          item.externalSystemStatus === 'PENDING') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRescan(item)}
                            disabled={rescanningId === item.id}
                          >
                            <RefreshCw className={`h-4 w-4 mr-1 ${rescanningId === item.id ? 'animate-spin' : ''}`} />
                            재요청
                          </Button>
                        )}
                      </div>
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
