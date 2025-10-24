/**
 * 대출 대시보드 메인 페이지
 * 대출 현황 통계, 위험도별 테이블, 최근 활동을 통합하여 표시
 */

"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import StatsOverview from "@/components/admin-lending/dashboard/StatsOverview";
import RiskLevelTable from "@/components/admin-lending/dashboard/RiskLevelTable";
import RecentActivities from "@/components/admin-lending/dashboard/RecentActivities";

export default function LendingDashboardPage() {
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setRefreshing(true);

    // 새로고침 시뮬레이션
    setTimeout(() => {
      setRefreshing(false);
      toast({
        description: "데이터가 새로고침되었습니다.",
      });
      // 페이지 새로고침으로 데이터 갱신
      window.location.reload();
    }, 500);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">대출 대시보드</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            실시간 대출 현황 및 위험도 모니터링
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          <span>새로고침</span>
        </Button>
      </div>

      {/* 통계 카드 */}
      <StatsOverview />

      {/* 위험도별 테이블 (전체 너비) */}
      <RiskLevelTable />

      {/* 최근 활동 피드 (전체 너비) */}
      <RecentActivities />
    </div>
  );
}
