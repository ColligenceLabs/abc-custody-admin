"use client";

// ============================================================================
// 출금 실행 통계 카드 컴포넌트 (Task 4.4)
// ============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExecutionStatistics } from "@/hooks/useExecution";
import { Activity, CheckCircle, Clock, XCircle } from "lucide-react";

export function ExecutionStats() {
  const { data: stats, isLoading } = useExecutionStatistics();

  if (isLoading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">로딩 중...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "브로드캐스트 중",
      value: stats.broadcasting.count,
      amount: stats.broadcasting.totalAmount,
      icon: Activity,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "컨펌 대기 중",
      value: stats.confirming.count,
      amount: stats.confirming.totalAmount,
      icon: Clock,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "오늘 완료",
      value: stats.completedToday.count,
      amount: stats.completedToday.totalAmount,
      icon: CheckCircle,
      iconColor: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "실패 (재시도 필요)",
      value: stats.failed.count,
      amount: stats.failed.totalAmount,
      icon: XCircle,
      iconColor: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-4">
      {/* 메인 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {parseFloat(stat.amount) > 0
                    ? `${parseFloat(stat.amount).toFixed(4)} (총액)`
                    : "0 (총액)"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 추가 통계 정보 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              평균 컨펌 시간
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageConfirmationTime}분
            </div>
            <p className="text-xs text-muted-foreground">
              브로드캐스트부터 완료까지
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">성공률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              전체 처리 건 대비 성공 비율
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
