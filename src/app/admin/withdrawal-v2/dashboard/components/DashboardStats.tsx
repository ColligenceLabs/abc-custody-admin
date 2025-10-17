/**
 * DashboardStats Component
 *
 * 출금 관리2 대시보드 통계 카드
 * 4개의 주요 통계 표시 (대기 중, 주의 필요, 처리 중, 오늘 완료)
 */

import { Card, CardContent } from "@/components/ui/card";
import { Clock, ShieldCheck, FileSignature, CheckCircle } from "lucide-react";
import { WithdrawalV2Stats } from "@/types/withdrawalV2";

interface DashboardStatsProps {
  stats?: WithdrawalV2Stats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-20 mb-2" />
                <div className="h-8 bg-muted rounded w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      icon: Clock,
      label: "대기 중",
      value: stats.withdrawalWait + stats.processing,
      sublabel: `출금 대기 ${stats.withdrawalWait} / 출금처리대기 ${stats.processing}`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      icon: ShieldCheck,
      label: "주의 필요",
      value: stats.amlIssue,
      sublabel: "AML 문제",
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-100 dark:bg-red-900/20",
    },
    {
      icon: FileSignature,
      label: "전송 중",
      value: stats.withdrawalPending + stats.transferring,
      sublabel: `출금처리중 ${stats.withdrawalPending} / 전송 중 ${stats.transferring}`,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      icon: CheckCircle,
      label: "오늘 완료",
      value: stats.completedToday,
      sublabel: stats.totalValueTodayKRW + " 원",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stat.sublabel}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
