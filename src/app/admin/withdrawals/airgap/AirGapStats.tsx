"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAirGapStatistics } from "@/hooks/useAirGap";
import { Loader2, Clock, CheckCircle2, AlertTriangle } from "lucide-react";

/**
 * Air-gap 통계 카드 컴포넌트
 * 4개 통계 카드: 서명 대기, 부분 서명, 오늘 완료, 곧 만료
 */
export function AirGapStats() {
  const { data: stats, isLoading, isError } = useAirGapStatistics();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">로딩 중...</CardTitle>
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-8 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          통계 데이터를 불러오는데 실패했습니다.
        </p>
      </div>
    );
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (num >= 1) return `${num.toFixed(2)} BTC`;
    return `${(num * 1000).toFixed(0)} mBTC`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* 서명 대기 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">서명 대기</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingSignatures.count}건</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatAmount(stats.pendingSignatures.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 부분 서명 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">부분 서명</CardTitle>
          <div className="h-4 w-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.partialSigned.count}건</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.partialSigned.signatures}
          </p>
        </CardContent>
      </Card>

      {/* 오늘 완료 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">오늘 완료</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedToday.count}건</div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatAmount(stats.completedToday.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 곧 만료 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">곧 만료</CardTitle>
          <AlertTriangle
            className={`h-4 w-4 ${
              stats.expiringSoon.count > 0 ? "text-red-500" : "text-muted-foreground"
            }`}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.expiringSoon.count}건</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.expiringSoon.hoursRemaining > 0
              ? `평균 ${stats.expiringSoon.hoursRemaining}시간 남음`
              : "만료 임박 없음"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
