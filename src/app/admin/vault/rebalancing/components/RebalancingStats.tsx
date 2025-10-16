'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RebalancingStats } from '@/types/vault';
import { TrendingUp, TrendingDown, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RebalancingStatsProps {
  stats: RebalancingStats | undefined;
  isLoading: boolean;
}

export function RebalancingStatsCards({ stats, isLoading }: RebalancingStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">로딩 중...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 animate-pulse bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getDeviationColor = (deviation: number) => {
    if (deviation <= 2) return 'text-green-600';
    if (deviation <= 5) return 'text-yellow-600';
    if (deviation <= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDeviationStatus = (deviation: number) => {
    if (deviation <= 2) return '최적';
    if (deviation <= 5) return '양호';
    if (deviation <= 10) return '주의';
    return '위험';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Current Ratio Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">현재 비율</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <div className="text-2xl font-bold">{stats.currentHotRatio.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Hot 지갑 (목표: 20%)</p>
            </div>
            <div className="pt-2 border-t">
              <div className="text-xl font-semibold">{stats.currentColdRatio.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Cold 지갑 (목표: 80%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deviation Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">목표 대비 편차</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className={`text-3xl font-bold ${getDeviationColor(stats.deviation)}`}>
              {stats.deviation > 0 ? '+' : ''}{stats.deviation.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium px-2 py-1 rounded ${
                stats.deviation <= 2 ? 'bg-green-100 text-green-700' :
                stats.deviation <= 5 ? 'bg-yellow-100 text-yellow-700' :
                stats.deviation <= 10 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {getDeviationStatus(stats.deviation)}
              </span>
            </div>
            {stats.deviation > 5 && (
              <p className="text-xs text-destructive font-medium">
                리밸런싱 권장
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Last Rebalancing Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">마지막 리밸런싱</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {stats.lastRebalancingDate
                ? formatDistanceToNow(stats.lastRebalancingDate, {
                    addSuffix: true,
                    locale: ko
                  })
                : '없음'}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t text-sm">
              <div>
                <div className="text-muted-foreground">총 횟수</div>
                <div className="font-semibold">{stats.totalRebalancingCount}회</div>
              </div>
              <div>
                <div className="text-muted-foreground">평균 소요</div>
                <div className="font-semibold">{stats.averageDuration}분</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">상태 요약</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">대기 중</span>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">승인됨</span>
              <span className="text-lg font-bold text-blue-600">{stats.approvedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">오늘 완료</span>
              <span className="text-lg font-bold text-green-600">{stats.completedTodayCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">실패</span>
              <span className="text-lg font-bold text-red-600">{stats.failedCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
