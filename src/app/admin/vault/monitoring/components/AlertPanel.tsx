'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { VaultAlert, AlertSeverity } from '@/types/vault';
import { AlertCircle, AlertTriangle, Info, XCircle, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface AlertPanelProps {
  alerts: VaultAlert[];
  onResolve: (alertId: string) => void;
  isLoading: boolean;
}

export function AlertPanel({ alerts, onResolve, isLoading }: AlertPanelProps) {
  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.INFO:
        return <Info className="h-4 w-4 text-blue-500" />;
      case AlertSeverity.WARNING:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case AlertSeverity.ERROR:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case AlertSeverity.CRITICAL:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getSeverityClass = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.INFO:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
      case AlertSeverity.WARNING:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      case AlertSeverity.ERROR:
        return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
      case AlertSeverity.CRITICAL:
        return 'border-red-500 bg-red-50 dark:bg-red-950';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>알림</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const unresolvedAlerts = alerts.filter(alert => !alert.isResolved);
  const sortedAlerts = [...unresolvedAlerts].sort((a, b) => {
    // 심각도 우선 정렬
    const severityOrder = {
      [AlertSeverity.CRITICAL]: 0,
      [AlertSeverity.ERROR]: 1,
      [AlertSeverity.WARNING]: 2,
      [AlertSeverity.INFO]: 3
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>알림</CardTitle>
          <div className="text-sm text-muted-foreground">
            {unresolvedAlerts.length}개 활성
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[800px] overflow-y-auto">
          {sortedAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Check className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">모든 알림 확인 완료!</p>
              <p className="text-sm text-muted-foreground mt-2">
                현재 활성화된 알림이 없습니다.
              </p>
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <Alert key={alert.id} className={`${getSeverityClass(alert.severity)} border-l-4`}>
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <AlertTitle className="text-sm font-semibold">
                        {alert.title}
                      </AlertTitle>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.createdAt), {
                          addSuffix: true,
                          locale: ko
                        })}
                      </span>
                    </div>

                    <AlertDescription className="text-sm">
                      {alert.message}
                    </AlertDescription>

                    {alert.metadata.recommendedAction && (
                      <div className="mt-2 p-2 bg-background/50 rounded text-xs">
                        <span className="font-medium">권장 조치:</span>
                        <div className="mt-1 text-muted-foreground">
                          {alert.metadata.recommendedAction}
                        </div>
                      </div>
                    )}

                    {alert.metadata.urgencyLevel && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          긴급도:
                        </span>
                        <div className="flex gap-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 w-2 rounded-full ${
                                i < alert.metadata.urgencyLevel!
                                  ? alert.severity === AlertSeverity.CRITICAL
                                    ? 'bg-red-500'
                                    : alert.severity === AlertSeverity.ERROR
                                    ? 'bg-orange-500'
                                    : alert.severity === AlertSeverity.WARNING
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                                  : 'bg-muted'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <span className="text-xs font-medium">
                          {alert.metadata.urgencyLevel}/10
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onResolve(alert.id)}
                      >
                        해결
                      </Button>
                      {alert.autoResolve && (
                        <span className="text-xs text-muted-foreground">
                          (자동 해결 가능)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Alert>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
