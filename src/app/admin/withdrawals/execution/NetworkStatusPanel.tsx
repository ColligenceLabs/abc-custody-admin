"use client";

// ============================================================================
// 네트워크 상태 패널 컴포넌트 (Task 4.4)
// ============================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNetworkStatus, useUpdateNetworkStatus } from "@/hooks/useExecution";
import { NetworkCongestion } from "@/types/withdrawal";
import { Activity, RefreshCw } from "lucide-react";

const congestionConfig: Record<
  NetworkCongestion,
  { label: string; color: string; bgColor: string }
> = {
  low: {
    label: "원활",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  medium: {
    label: "보통",
    color: "text-yellow-600",
    bgColor: "bg-yellow-500/10",
  },
  high: {
    label: "혼잡",
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  critical: {
    label: "매우 혼잡",
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
};

export function NetworkStatusPanel() {
  const { data: networkStatus, isLoading } = useNetworkStatus();
  const updateMutation = useUpdateNetworkStatus();

  const handleRefresh = () => {
    updateMutation.mutate();
  };

  if (isLoading || !networkStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">네트워크 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">네트워크 상태</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={updateMutation.isPending}
        >
          <RefreshCw
            className={`h-4 w-4 ${updateMutation.isPending ? "animate-spin" : ""}`}
          />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {networkStatus.map((network) => {
            const congestion = congestionConfig[network.congestion];
            return (
              <div
                key={network.network}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{network.network}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${congestion.color} ${congestion.bgColor}`}
                  >
                    {congestion.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">현재 수수료:</span>
                    <div className="font-medium">{network.currentFee}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">평균 컨펌:</span>
                    <div className="font-medium">
                      {network.avgConfirmationTime}분
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">대기 중:</span>
                    <div className="font-medium">
                      {network.pendingTxCount.toLocaleString()}건
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">블록 높이:</span>
                    <div className="font-medium">
                      {network.blockHeight.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  업데이트:{" "}
                  {new Date(network.lastUpdatedAt).toLocaleTimeString("ko-KR")}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
