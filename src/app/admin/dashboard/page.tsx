/**
 * Admin Dashboard Page
 *
 * 커스터디 관리자 대시보드 메인 페이지
 */

'use client';

import { Metadata } from 'next';
import { Users, DollarSign, Activity, Clock, ArrowDownToLine, ArrowUpFromLine, MessageSquare } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { AssetDistributionChart } from './components/AssetDistributionChart';
import { useDashboardData } from './hooks/useDashboardData';
import { formatCompactCurrency, formatFullCurrency } from '@/lib/utils';
import { AssetWalletRatioSection } from '@/app/admin/withdrawal-v2/requests/components/AssetWalletRatioSection';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInquiryStats } from '@/services/corporateInquiryApi';

export default function AdminDashboardPage() {
  const {
    stats,
    assetDistributionHot,
    assetDistributionCold,
    assetDistributionTreasury,
    assetWalletInfo,
    loading,
    error
  } = useDashboardData();

  // 법인 문의 통계
  const { data: inquiryStats } = useQuery({
    queryKey: ['corporateInquiryStats'],
    queryFn: getCorporateInquiryStats,
    refetchInterval: 5 * 60 * 1000, // 5분마다 자동 갱신
  });

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

      {/* 통계 카드 7개 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
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
        <StatsCard
          title="법인 문의 대기"
          value={inquiryStats?.waitingCount || 0}
          icon={MessageSquare}
          color="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* 자산별 Hot/Cold 지갑 밸런스 상태 */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-48">
          <div className="text-red-500">{error}</div>
        </div>
      ) : (
        <>
          <AssetWalletRatioSection />

          {/* 3열 레이아웃: 자산 분포 Hot + Cold + Treasury */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AssetDistributionChart data={assetDistributionHot} title="Hot 지갑 자산 분포" />
            <AssetDistributionChart data={assetDistributionCold} title="Cold 지갑 자산 분포" />
            <AssetDistributionChart data={assetDistributionTreasury} title="Treasury 지갑 자산 분포" />
          </div>
        </>
      )}
    </div>
  );
}
