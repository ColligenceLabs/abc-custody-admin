/**
 * Admin Dashboard Page
 *
 * 커스터디 관리자 대시보드 메인 페이지
 */

'use client';

import { Metadata } from 'next';
import { Users, DollarSign, Activity, Clock, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { AssetDistributionChart } from './components/AssetDistributionChart';
import { useDashboardData } from './hooks/useDashboardData';
import { formatCompactCurrency, formatFullCurrency } from '@/lib/utils';
import { AssetWalletRatioSection } from '@/app/admin/withdrawal-v2/requests/components/AssetWalletRatioSection';

export default function AdminDashboardPage() {
  const { stats, assetDistributionHot, assetDistributionCold, assetWalletInfo } =
    useDashboardData();

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          대시보드
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          커스터디 서비스 현황을 확인하세요
        </p>
      </div>

      {/* 통계 카드 6개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatsCard
          title="전체 회원사"
          value={stats.totalMembers}
          icon={Users}
        />
        <StatsCard
          title="총 자산 가치"
          value={formatCompactCurrency(stats.totalAssetValueNum)}
          fullValue={formatFullCurrency(stats.totalAssetValueNum)}
          icon={DollarSign}
          color="text-sky-600 dark:text-sky-400"
        />
        <StatsCard
          title="오늘 거래"
          value={stats.todayTransactions}
          icon={Activity}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatsCard
          title="보류중 거래"
          value={stats.pendingTransactions}
          icon={Clock}
          color="text-amber-600 dark:text-amber-400"
        />
        <StatsCard
          title="오늘 입금"
          value={stats.deposits24h}
          icon={ArrowDownToLine}
          color="text-sky-600 dark:text-sky-400"
        />
        <StatsCard
          title="오늘 출금"
          value={stats.withdrawals24h}
          icon={ArrowUpFromLine}
          color="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* 자산별 Hot/Cold 지갑 밸런스 상태 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          자산별 Hot/Cold 지갑 밸런스
        </h2>
        <AssetWalletRatioSection assetsData={assetWalletInfo} />
      </div>

      {/* 2열 레이아웃: 자산 분포 Hot + Cold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AssetDistributionChart data={assetDistributionHot} title="Hot 지갑 자산 분포" />
        <AssetDistributionChart data={assetDistributionCold} title="Cold 지갑 자산 분포" />
      </div>
    </div>
  );
}
