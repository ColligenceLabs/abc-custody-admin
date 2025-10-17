/**
 * WithdrawalStatusCard Component
 *
 * 출금 상태별 분포 카드
 * 7-상태 모델: pending, approvalWaiting, amlFlagged, processing, completed, rejected, failed
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { WithdrawalV2Stats } from "@/types/withdrawalV2";
import { FileText } from "lucide-react";

interface WithdrawalStatusCardProps {
  stats?: WithdrawalV2Stats;
}

export function WithdrawalStatusCard({ stats }: WithdrawalStatusCardProps) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>출금 상태 분포</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </CardContent>
      </Card>
    );
  }

  const statusItems = [
    {
      label: "출금 대기",
      value: stats.withdrawalWait,
      color: "bg-slate-500",
      textColor: "text-slate-700 dark:text-slate-300",
    },
    {
      label: "AML 검토 중",
      value: stats.amlReview,
      color: "bg-yellow-500",
      textColor: "text-yellow-700 dark:text-yellow-300",
    },
    {
      label: "출금처리중",
      value: stats.withdrawalPending,
      color: "bg-indigo-500",
      textColor: "text-indigo-700 dark:text-indigo-300",
    },
    {
      label: "AML 문제",
      value: stats.amlIssue,
      color: "bg-red-500",
      textColor: "text-red-700 dark:text-red-300",
    },
    {
      label: "출금처리대기",
      value: stats.processing,
      color: "bg-purple-500",
      textColor: "text-purple-700 dark:text-purple-300",
    },
    {
      label: "전송 중",
      value: stats.transferring,
      color: "bg-blue-500",
      textColor: "text-blue-700 dark:text-blue-300",
    },
    {
      label: "완료",
      value: stats.success,
      color: "bg-sky-500",
      textColor: "text-sky-700 dark:text-sky-300",
    },
    {
      label: "관리자거부",
      value: stats.adminRejected,
      color: "bg-slate-500",
      textColor: "text-slate-700 dark:text-slate-300",
    },
    {
      label: "실패",
      value: stats.failed,
      color: "bg-orange-500",
      textColor: "text-orange-700 dark:text-orange-300",
    },
  ];

  const totalActive =
    stats.withdrawalWait +
    stats.amlReview +
    stats.amlIssue +
    stats.processing +
    stats.withdrawalPending +
    stats.transferring;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          출금 상태 분포
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          전체 {totalActive}건 처리 중
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 상태별 진행률 바 */}
        {statusItems.map((item, index) => {
          const percentage =
            totalActive > 0 ? (item.value / totalActive) * 100 : 0;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${item.textColor}`}>
                    {item.value}건
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress
                value={percentage}
                className="h-2"
                style={
                  {
                    "--progress-background": `hsl(var(--${item.color.replace(
                      "bg-",
                      ""
                    )}))`,
                  } as React.CSSProperties
                }
              />
            </div>
          );
        })}

        {/* 오늘 완료 통계 */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">오늘 완료</span>
            <div className="text-right">
              <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                {stats.completedToday}건
              </p>
              <p className="text-xs text-muted-foreground">
                {stats.totalValueTodayKRW} 원
              </p>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
