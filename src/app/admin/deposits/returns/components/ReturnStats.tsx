/**
 * 환불 통계 컴포넌트
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownUp, Clock, CheckCircle2, XCircle } from 'lucide-react';

export interface ReturnStatsData {
  pending: {
    count: number;
    volumeKRW: string;
  };
  approved: {
    count: number;
    volumeKRW: string;
  };
  processing: {
    count: number;
    volumeKRW: string;
  };
  completed: {
    count: number;
    volumeKRW: string;
  };
  failed: {
    count: number;
    volumeKRW: string;
  };
}

interface ReturnStatsProps {
  stats: ReturnStatsData;
}

export function ReturnStats({ stats }: ReturnStatsProps) {
  const statCards = [
    {
      title: '대기',
      count: stats.pending.count,
      volume: parseFloat(stats.pending.volumeKRW).toLocaleString(),
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/10',
    },
    {
      title: '승인됨',
      count: stats.approved.count,
      volume: parseFloat(stats.approved.volumeKRW).toLocaleString(),
      icon: CheckCircle2,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50 dark:bg-sky-900/10',
    },
    {
      title: '처리중',
      count: stats.processing.count,
      volume: parseFloat(stats.processing.volumeKRW).toLocaleString(),
      icon: ArrowDownUp,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    },
    {
      title: '완료',
      count: stats.completed.count,
      volume: parseFloat(stats.completed.volumeKRW).toLocaleString(),
      icon: CheckCircle2,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/10',
    },
    {
      title: '실패',
      count: stats.failed.count,
      volume: parseFloat(stats.failed.volumeKRW).toLocaleString(),
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.count}건</div>
              <p className="text-xs text-muted-foreground mt-1">
                ₩{stat.volume}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
