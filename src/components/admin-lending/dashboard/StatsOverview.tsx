/**
 * 대출 대시보드 통계 개요 컴포넌트
 * 4개의 주요 통계 카드를 그리드로 표시
 */

"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Shield,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import StatsCard from "./StatsCard";
import { LoanDashboardStats } from "@/types/admin-lending";
import { getLoanDashboardStats } from "@/services/admin-lending";

export default function StatsOverview() {
  const [stats, setStats] = useState<LoanDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getLoanDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("통계 데이터 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500">
        통계 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  // 금액 포맷팅 함수
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`;
    }
    return `${amount.toLocaleString()}원`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="총 대출 금액"
        value={formatAmount(stats.totalLoanAmount)}
        icon={DollarSign}
        description="전체 활성 대출 합계"
        iconClassName="text-indigo-600"
      />

      <StatsCard
        title="총 담보 가치"
        value={formatAmount(stats.totalCollateralValue)}
        icon={Shield}
        description="담보 자산 총 평가액"
        iconClassName="text-purple-600"
      />

      <StatsCard
        title="평균 Health Factor"
        value={stats.averageHealthFactor.toFixed(2)}
        icon={TrendingUp}
        description={
          stats.averageHealthFactor >= 1.5
            ? "안전한 수준입니다"
            : stats.averageHealthFactor >= 1.2
            ? "주의가 필요합니다"
            : "위험한 수준입니다"
        }
        iconClassName={
          stats.averageHealthFactor >= 1.5
            ? "text-sky-600"
            : stats.averageHealthFactor >= 1.2
            ? "text-yellow-600"
            : "text-red-600"
        }
      />

      <StatsCard
        title="청산 위험 건수"
        value={stats.liquidationRiskCount}
        icon={AlertTriangle}
        description={`총 ${
          stats.riskDistribution.danger + stats.riskDistribution.liquidation
        }건 주의 필요`}
        iconClassName="text-red-600"
      />
    </div>
  );
}
