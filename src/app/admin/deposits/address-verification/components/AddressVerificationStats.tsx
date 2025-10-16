'use client';

/**
 * 주소 검증 통계 컴포넌트
 *
 * 검증 통과/실패 통계를 시각적으로 표시합니다.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle, Flag } from 'lucide-react';
import type { AddressVerificationStats as AddressVerificationStatsType } from '@/types/deposit';

interface AddressVerificationStatsProps {
  stats: AddressVerificationStatsType;
  isLoading?: boolean;
}

export function AddressVerificationStats({ stats, isLoading }: AddressVerificationStatsProps) {
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
      title: '검증 통과',
      value: stats.passed.count,
      volume: `₩${Number(stats.passed.volumeKRW).toLocaleString()}`,
      percentage: stats.passed.percentage.toFixed(1),
      icon: CheckCircle2,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: '미등록 주소',
      value: stats.unregistered.count,
      volume: `₩${Number(stats.unregistered.volumeKRW).toLocaleString()}`,
      percentage: stats.unregistered.percentage.toFixed(1),
      icon: XCircle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: '권한 없음',
      value: stats.noPermission.count,
      volume: `₩${Number(stats.noPermission.volumeKRW).toLocaleString()}`,
      percentage: stats.noPermission.percentage.toFixed(1),
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
    {
      title: '플래그됨',
      value: stats.flagged.count,
      volume: `₩${Number(stats.flagged.volumeKRW).toLocaleString()}`,
      percentage: stats.flagged.percentage.toFixed(1),
      icon: Flag,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
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
              {stat.value}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stat.volume}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              전체의 {stat.percentage}%
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
