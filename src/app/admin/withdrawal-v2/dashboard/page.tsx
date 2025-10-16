/**
 * Withdrawal Manager v2 - Dashboard Page
 *
 * 통합 대시보드 메인 페이지
 * 모든 볼트 상태, 출금 통계, 알림, 최근 활동을 통합 표시
 */

"use client";

import { useWithdrawalV2Stats } from "./hooks/useWithdrawalV2Stats";
import { DashboardStats } from "./components/DashboardStats";
import { VaultSummaryCard } from "./components/VaultSummaryCard";
import { AlertBanner } from "./components/AlertBanner";
import { BlockchainVaultCard } from "./components/BlockchainVaultCard";
import { WithdrawalStatusCard } from "./components/WithdrawalStatusCard";
import { RecentActivityFeed } from "./components/RecentActivityFeed";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WithdrawalV2DashboardPage() {
  const { data, isLoading, error, refetch } = useWithdrawalV2Stats();

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200 font-semibold">
            데이터 로딩 중 오류가 발생했습니다
          </p>
          <p className="text-red-700 dark:text-red-300 text-sm mt-1">
            {error.message}
          </p>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">출금 관리 대시보드</h1>
          <p className="text-muted-foreground mt-1">
            실시간 볼트 모니터링 및 출금 관리
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {data?.lastUpdated
              ? `마지막 업데이트: ${data.lastUpdated.toLocaleTimeString(
                  "ko-KR"
                )}`
              : "로딩 중..."}
          </span>
          <Button
            onClick={refetch}
            variant="outline"
            size="sm"
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            새로고침
          </Button>
        </div>
      </div>

      {/* 알림 배너 */}
      <AlertBanner alerts={data?.alerts} />

      {/* 출금 통계 카드 */}
      <DashboardStats stats={data?.withdrawals} />

      {/* 전체 볼트 요약 & 출금 상태 분포 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VaultSummaryCard summary={data?.vaultSummary} />
        <WithdrawalStatusCard stats={data?.withdrawals} />
      </div>

      {/* 블록체인별 볼트 카드 */}
      <div>
        <h2 className="text-xl font-bold mb-4">블록체인별 볼트 상태</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <BlockchainVaultCard vault={data?.vaults.bitcoin} />
          <BlockchainVaultCard vault={data?.vaults.ethereum} />
          <BlockchainVaultCard vault={data?.vaults.solana} />
        </div>
      </div>

      {/* 리밸런싱 상태 */}
      {data?.rebalancing && (
        <div>
          <h2 className="text-xl font-bold mb-4">리밸런싱 현황</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">필요</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {data.rebalancing.required}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">진행 중</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {data.rebalancing.inProgress}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-500/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">오늘 완료</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {data.rebalancing.completedToday}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 최근 활동 */}
      <div>
        <h2 className="text-xl font-bold mb-4">최근 활동</h2>
        <RecentActivityFeed />
      </div>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-xl">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
            <p className="text-sm text-muted-foreground">데이터 로딩 중...</p>
          </div>
        </div>
      )}
    </div>
  );
}
