'use client';

import { useState } from 'react';
import { RebalancingStatsCards } from './components/RebalancingStats';
import { RebalancingCalculatorCard } from './components/RebalancingCalculator';
import { RebalancingFormCard } from './components/RebalancingForm';
import { RebalancingHistoryTable } from './components/RebalancingHistory';
import {
  useRebalancingManagementPanel,
  useFilteredRebalancingHistory
} from '@/hooks/useVault';
import { RebalancingFilter, RebalancingRequest } from '@/types/vault';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function RebalancingPage() {
  const [filter, setFilter] = useState<RebalancingFilter>({});
  const { toast } = useToast();

  const {
    stats,
    calculation,
    vaultStatus,
    isLoadingStats,
    isLoadingCalculation,
    initiateRebalancing,
    isInitiating,
    initiateSuccess,
    error
  } = useRebalancingManagementPanel();

  const {
    data: historyRecords,
    isLoading: isLoadingHistory
  } = useFilteredRebalancingHistory(filter);

  const handleSubmitRebalancing = (request: RebalancingRequest) => {
    initiateRebalancing(request, {
      onSuccess: (data) => {
        toast({
          title: '리밸런싱 시작됨',
          description: `리밸런싱 ID: ${data.rebalancingId}`,
        });
      },
      onError: (error: any) => {
        toast({
          title: '리밸런싱 실패',
          description: error.message || '알 수 없는 오류가 발생했습니다',
          variant: 'destructive',
        });
      }
    });
  };

  const handleFilterChange = (newFilter: RebalancingFilter) => {
    setFilter(newFilter);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">데이터 로딩 오류</p>
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
          <h1 className="text-3xl font-bold tracking-tight">Hot/Cold 지갑 리밸런싱</h1>
          <p className="text-muted-foreground mt-2">
            Hot(20%)와 Cold(80%) 지갑 간 자산 이동 및 비율 조정 관리
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(isLoadingStats || isLoadingCalculation) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>업데이트 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <RebalancingStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Calculator */}
        <div className="lg:col-span-2">
          <RebalancingCalculatorCard
            calculation={calculation}
            isLoading={isLoadingCalculation}
          />
        </div>

        {/* Right Column - Form */}
        <div className="lg:col-span-1">
          <RebalancingFormCard
            calculation={calculation}
            onSubmit={handleSubmitRebalancing}
            isSubmitting={isInitiating}
          />
        </div>
      </div>

      {/* History Table */}
      <RebalancingHistoryTable
        records={historyRecords || []}
        isLoading={isLoadingHistory}
        onFilterChange={handleFilterChange}
      />

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>통계 및 계산은 30초마다 자동 갱신됩니다</span>
        </div>
      </div>
    </div>
  );
}
