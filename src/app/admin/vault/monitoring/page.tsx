'use client';

import { useVaultOverview, useResolveAlert } from '@/hooks/useVault';
import { VaultStats } from './components/VaultStats';
import { DonutChart } from './components/DonutChart';
import { RatioComparisonChart } from './components/RatioComparisonChart';
import { AssetDistributionTable } from './components/AssetDistributionTable';
import { AlertPanel } from './components/AlertPanel';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VaultMonitoringPage() {
  const {
    vaultStatus,
    alerts,
    isLoading,
    error
  } = useVaultOverview();

  const resolveAlertMutation = useResolveAlert();

  const handleResolveAlert = (alertId: string) => {
    resolveAlertMutation.mutate(alertId);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">볼트 데이터 로딩 오류</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hot/Cold 볼트 모니터링</h1>
          <p className="text-muted-foreground mt-2">
            Hot(20%)와 Cold(80%) 지갑의 잔액 및 비율 실시간 모니터링
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>업데이트 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <VaultStats vaultStatus={vaultStatus} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Asset Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Donut Chart */}
            {vaultStatus && (
              <DonutChart
                hotRatio={vaultStatus.balanceStatus.hotRatio}
                coldRatio={vaultStatus.balanceStatus.coldRatio}
                totalValue={vaultStatus.totalValue.totalInKRW}
                hotValue={vaultStatus.hotWallet.totalValue.totalInKRW}
                coldValue={vaultStatus.coldWallet.totalValue.totalInKRW}
              />
            )}

            {/* Ratio Comparison Chart */}
            {vaultStatus && (
              <RatioComparisonChart balanceStatus={vaultStatus.balanceStatus} />
            )}
          </div>

          {/* Asset Distribution Table */}
          <AssetDistributionTable
            hotWallet={vaultStatus?.hotWallet}
            coldWallet={vaultStatus?.coldWallet}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Alert Panel */}
        <div className="lg:col-span-1">
          <AlertPanel
            alerts={alerts}
            onResolve={handleResolveAlert}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>10초마다 자동 갱신</span>
        </div>
      </div>
    </div>
  );
}
