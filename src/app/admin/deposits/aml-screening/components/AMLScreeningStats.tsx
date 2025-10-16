'use client';

/**
 * AML 스크리닝 통계 컴포넌트
 *
 * AML 검토 대기열의 통계를 시각적으로 표시합니다.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, AlertTriangle, Flag, CheckCircle2 } from 'lucide-react';
import type { AMLScreeningStats as AMLScreeningStatsType } from '@/types/deposit';

interface AMLScreeningStatsProps {
  stats: AMLScreeningStatsType;
  isLoading?: boolean;
}

export function AMLScreeningStats({ stats, isLoading }: AMLScreeningStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 w-4 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: '검토 대기',
      value: stats.pending.count,
      volume: `₩${Number(stats.pending.volumeKRW).toLocaleString()}`,
      icon: Clock,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: '고위험',
      value: stats.highRisk.count,
      volume: `₩${Number(stats.highRisk.volumeKRW).toLocaleString()}`,
      percentage: stats.highRisk.percentage.toFixed(1),
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: '플래그됨',
      value: stats.flagged.count,
      volume: `₩${Number(stats.flagged.volumeKRW).toLocaleString()}`,
      icon: Flag,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: '오늘 검토 완료',
      value: stats.reviewedToday.count,
      volume: `₩${Number(stats.reviewedToday.volumeKRW).toLocaleString()}`,
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {stat.value}건
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
              {stat.volume}
            </p>
            {stat.percentage && (
              <p className="text-xs text-gray-500 mt-1">
                전체의 {stat.percentage}%
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
