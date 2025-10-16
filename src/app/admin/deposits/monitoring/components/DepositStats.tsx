'use client';

/**
 * 입금 통계 카드 컴포넌트
 *
 * 오늘 입금, 검증 대기, 환불 예정, 완료 건수 및 금액을 표시합니다.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DepositStats as DepositStatsType } from '@/types/deposit';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  ArrowDownUp
} from 'lucide-react';

interface DepositStatsProps {
  stats: DepositStatsType;
  isLoading?: boolean;
}

export function DepositStats({ stats, isLoading }: DepositStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: '오늘 입금',
      count: stats.today.count,
      amount: stats.today.totalKRW,
      trend: stats.today.trend,
      changePercent: stats.today.changePercent,
      icon: ArrowDownUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: '검증 대기',
      count: stats.verifying.count,
      amount: stats.verifying.totalKRW,
      trend: stats.verifying.trend,
      changePercent: stats.verifying.changePercent,
      icon: Clock,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: '환불 예정',
      count: stats.toReturn.count,
      amount: stats.toReturn.totalKRW,
      trend: stats.toReturn.trend,
      changePercent: stats.toReturn.changePercent,
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: '완료',
      count: stats.completed.count,
      amount: stats.completed.totalKRW,
      trend: stats.completed.trend,
      changePercent: stats.completed.changePercent,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <div className="space-y-1">
              {/* 건수 */}
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {stat.count.toLocaleString()}건
              </div>

              {/* 금액 */}
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                ₩{parseInt(stat.amount).toLocaleString()}
              </div>

              {/* 트렌드 */}
              {stat.trend && stat.changePercent !== undefined && (
                <div className="flex items-center space-x-1 text-xs">
                  {stat.trend === 'up' ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">
                        +{stat.changePercent.toFixed(1)}%
                      </span>
                    </>
                  ) : stat.trend === 'down' ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">
                        {stat.changePercent.toFixed(1)}%
                      </span>
                    </>
                  ) : (
                    <span className="text-gray-500">변동 없음</span>
                  )}
                  <span className="text-gray-500">전일 대비</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}