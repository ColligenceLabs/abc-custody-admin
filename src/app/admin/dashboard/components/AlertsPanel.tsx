/**
 * AlertsPanel Component
 *
 * 알림 및 경고 표시
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  ArrowUpFromLine,
  Shield,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Alert } from '../hooks/useDashboardData';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getSeverityBadge = (
    severity: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    switch (severity) {
      case 'low':
        return (
          <Badge variant="secondary" className="text-xs">
            낮음
          </Badge>
        );
      case 'medium':
        return (
          <Badge className="bg-yellow-600 text-xs">중간</Badge>
        );
      case 'high':
        return (
          <Badge className="bg-orange-600 text-xs">높음</Badge>
        );
      case 'critical':
        return <Badge variant="destructive" className="text-xs">긴급</Badge>;
    }
  };

  const getTypeIcon = (type: 'withdrawal' | 'compliance' | 'system' | 'security') => {
    switch (type) {
      case 'withdrawal':
        return <ArrowUpFromLine className="w-4 h-4" />;
      case 'compliance':
        return <Shield className="w-4 h-4" />;
      case 'system':
        return <Server className="w-4 h-4" />;
      case 'security':
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: 'withdrawal' | 'compliance' | 'system' | 'security') => {
    switch (type) {
      case 'withdrawal':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
      case 'compliance':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
      case 'system':
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400';
      case 'security':
        return 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            알림 및 경고
          </CardTitle>
          <Badge variant="secondary">{alerts.length}건</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              {/* 타입 아이콘 */}
              <div className={`p-2 rounded-full ${getTypeColor(alert.type)}`}>
                {getTypeIcon(alert.type)}
              </div>

              {/* 메시지 및 시간 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  {getSeverityBadge(alert.severity)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(alert.timestamp, {
                    addSuffix: true,
                    locale: ko,
                  })}
                </p>

                {/* 액션 필요 여부 */}
                {alert.actionRequired && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    조치 필요
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
