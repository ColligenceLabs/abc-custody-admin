/**
 * WalletStatusCard Component
 *
 * Hot/Cold 지갑 상태 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Flame, Snowflake, AlertTriangle } from 'lucide-react';
import { WalletStatus } from '../hooks/useDashboardData';

interface WalletStatusCardProps {
  status: WalletStatus;
}

export function WalletStatusCard({ status }: WalletStatusCardProps) {
  const getStatusColor = (walletStatus: 'healthy' | 'warning' | 'critical') => {
    switch (walletStatus) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'critical':
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getStatusLabel = (walletStatus: 'healthy' | 'warning' | 'critical') => {
    switch (walletStatus) {
      case 'healthy':
        return '정상';
      case 'warning':
        return '주의';
      case 'critical':
        return '위험';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>지갑 상태</CardTitle>
          {status.needsRebalancing && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              리밸런싱 필요
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hot 지갑 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">Hot 지갑</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{status.hot.balance}</p>
              <p className={`text-xs ${getStatusColor(status.hot.status)}`}>
                {getStatusLabel(status.hot.status)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={status.hot.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {status.hot.percentage}%
            </p>
          </div>
        </div>

        {/* Cold 지갑 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">Cold 지갑</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{status.cold.balance}</p>
              <p className={`text-xs ${getStatusColor(status.cold.status)}`}>
                {getStatusLabel(status.cold.status)}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <Progress value={status.cold.percentage} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {status.cold.percentage}%
            </p>
          </div>
        </div>

        {/* 총 잔액 */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              총 잔액
            </span>
            <span className="text-lg font-bold">
              ₩
              {(
                parseInt(status.hot.balance.replace(/[^0-9]/g, '')) +
                parseInt(status.cold.balance.replace(/[^0-9]/g, ''))
              ).toLocaleString('ko-KR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
