/**
 * PendingWithdrawalAssetsSection Component
 *
 * 승인 대기 중인 출금 요청의 자산별 요약 정보 표시
 * - approval_waiting 상태의 요청만 집계
 * - 자산별로 그룹화하여 카드 형태로 표시
 * - 총 금액 및 긴급 요청 수 표시
 */

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { WithdrawalV2Request, AssetType } from "@/types/withdrawalV2";
import {
  AssetSummaryCard,
  AssetPendingSummary,
} from "./AssetSummaryCard";
import { TotalSummaryBar, TotalPendingSummary } from "./TotalSummaryBar";

interface PendingWithdrawalAssetsSectionProps {
  requests: WithdrawalV2Request[];
}

// Mock 환율 (실제로는 API에서 조회)
const MOCK_PRICES: Record<AssetType, number> = {
  BTC: 80_000_000, // 8천만원
  ETH: 5_000_000, // 5백만원
  USDT: 1_300, // 1,300원
  USDC: 1_300, // 1,300원
  SOL: 150_000, // 15만원
  CUSTOM_ERC20: 0,
};

export function PendingWithdrawalAssetsSection({
  requests,
}: PendingWithdrawalAssetsSectionProps) {
  // 승인 대기 중인 요청만 필터링
  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "approval_waiting"),
    [requests]
  );

  // 자산별 집계
  const assetSummaries = useMemo(
    () => aggregatePendingAssets(pendingRequests),
    [pendingRequests]
  );

  // 총 요약 계산
  const totalSummary = useMemo(
    () => calculateTotalSummary(assetSummaries),
    [assetSummaries]
  );

  // Empty State: 승인 대기 요청이 없는 경우
  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              승인 대기 중인 출금 자산
            </span>
            <Badge variant="secondary">0건</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-500" />
          <p className="text-lg font-medium text-muted-foreground">
            현재 승인 대기 중인 출금 요청이 없습니다
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            모든 출금 요청이 처리되었습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  // 자산이 있는 경우: 카드 그리드 표시
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            승인 대기 중인 출금 자산
          </span>
          <Badge variant="secondary">{totalSummary.totalRequests}건</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 자산별 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {assetSummaries.map((summary) => (
            <AssetSummaryCard key={summary.asset} summary={summary} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 승인 대기 중인 요청을 자산별로 집계
 */
function aggregatePendingAssets(
  requests: WithdrawalV2Request[]
): AssetPendingSummary[] {
  // 자산별로 그룹화
  const grouped = requests.reduce(
    (acc, req) => {
      const { asset, amount, priority, memberId } = req;

      if (!acc[asset]) {
        acc[asset] = {
          asset,
          totalAmount: 0,
          requestCount: 0,
          urgentCount: 0,
          memberIds: [],
        };
      }

      // 수량 누적
      acc[asset].totalAmount += parseFloat(amount);
      acc[asset].requestCount += 1;

      // 긴급 요청 카운트
      if (priority === "urgent") {
        acc[asset].urgentCount += 1;
      }

      // 회원사 ID 수집 (중복 제거)
      if (!acc[asset].memberIds.includes(memberId)) {
        acc[asset].memberIds.push(memberId);
      }

      return acc;
    },
    {} as Record<
      AssetType,
      {
        asset: AssetType;
        totalAmount: number;
        requestCount: number;
        urgentCount: number;
        memberIds: string[];
      }
    >
  );

  // KRW 환산 추가
  return Object.values(grouped).map((item) => ({
    ...item,
    totalAmount: item.totalAmount.toString(),
    totalValueKRW: (item.totalAmount * MOCK_PRICES[item.asset]).toLocaleString(
      "ko-KR"
    ),
  }));
}

/**
 * 총 요약 계산
 */
function calculateTotalSummary(
  summaries: AssetPendingSummary[]
): TotalPendingSummary {
  const totalValueKRW = summaries.reduce(
    (sum, item) => sum + parseFloat(item.totalValueKRW.replace(/,/g, "")),
    0
  );

  const totalRequests = summaries.reduce(
    (sum, item) => sum + item.requestCount,
    0
  );

  const totalUrgentRequests = summaries.reduce(
    (sum, item) => sum + item.urgentCount,
    0
  );

  return {
    totalValueKRW: totalValueKRW.toLocaleString("ko-KR"),
    totalRequests,
    totalUrgentRequests,
    assetCount: summaries.length,
  };
}
