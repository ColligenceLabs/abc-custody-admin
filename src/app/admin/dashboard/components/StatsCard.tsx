/**
 * StatsCard Component
 *
 * 통계 정보를 표시하는 재사용 가능한 카드 컴포넌트
 */

import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'text-sapphire-600 dark:text-sapphire-400',
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="space-y-1">
          <p className={`text-3xl font-bold ${color}`}>{value}</p>

          {trend && (
            <p
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
