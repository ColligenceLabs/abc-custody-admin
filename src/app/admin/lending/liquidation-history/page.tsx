/**
 * 청산 이력 페이지
 * 완료된 청산 내역 조회 및 통계
 */

"use client";

import { useEffect, useState } from "react";
import { TrendingDown, DollarSign, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LiquidationExecution } from "@/types/admin-lending";
import {
  getLiquidationExecutions,
  getLiquidationStats,
} from "@/services/admin-lending";

export default function LiquidationHistoryPage() {
  const [executions, setExecutions] = useState<LiquidationExecution[]>([]);
  const [stats, setStats] = useState({
    completedExecutions: 0,
    totalLiquidatedAmount: 0,
    totalBankRepayment: 0,
    totalCustomerRefund: 0,
  });
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  const fetchData = async () => {
    setLoading(true);
    try {
      const [executionsData, statsData] = await Promise.all([
        getLiquidationExecutions({ status: ["completed"] }),
        getLiquidationStats(),
      ]);
      setExecutions(executionsData);
      setStats(statsData);
    } catch (error) {
      console.error("청산 이력 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchData();
  }, []);

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 소요 시간 계산
  const calculateDuration = (startedAt: string, completedAt: string): string => {
    const start = new Date(startedAt);
    const end = new Date(completedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "1분 미만";
    if (diffMins < 60) return `${diffMins}분`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            청산 이력
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            완료된 청산 내역 및 통계
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log("다운로드 기능 준비중")}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>내역 다운로드</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>새로고침</span>
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              완료된 청산
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.completedExecutions}건
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              총 청산 금액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(stats.totalLiquidatedAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              은행 상환 총액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {formatAmount(stats.totalBankRepayment)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              고객 환급 총액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-600">
              {formatAmount(stats.totalCustomerRefund)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 청산 이력 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>청산 완료 내역</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-100 animate-pulse rounded"
                />
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              완료된 청산 내역이 없습니다.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      청산 ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      대출 ID
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      거래소
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      청산 금액
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      은행 상환
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      고객 환급
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      소요 시간
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      완료 시각
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {executions.map((execution) => (
                    <tr
                      key={execution.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-indigo-600">
                          {execution.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600">
                          {execution.loanId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge className="bg-purple-50 text-purple-600 border-purple-200 border capitalize">
                          {execution.selectedExchange}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(execution.actualAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-indigo-600">
                          {formatAmount(execution.bankRepayment)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-sky-600">
                          {formatAmount(execution.customerRefund)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {execution.completedAt &&
                            calculateDuration(
                              execution.startedAt,
                              execution.completedAt
                            )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {execution.completedAt &&
                            formatDate(execution.completedAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
