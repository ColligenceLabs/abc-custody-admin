// ============================================================================
// 출금 AML 통계 카드 컴포넌트
// ============================================================================
// Task 4.2: 출금 AML 검증 시스템
// 용도: AML 검토 상태별 통계 표시
// ============================================================================

"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Shield,
} from "lucide-react";
import type { WithdrawalAMLStats } from "@/types/withdrawal";

// ============================================================================
// Props 인터페이스
// ============================================================================

interface WithdrawalAMLStatsProps {
  stats: WithdrawalAMLStats;
  isLoading?: boolean;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 금액 포맷팅
 */
function formatAmount(amount: string): string {
  const num = parseFloat(amount);
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(0)}M`;
  }
  return `${(num / 1_000).toFixed(0)}K`;
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export default function WithdrawalAMLStats({
  stats,
  isLoading,
}: WithdrawalAMLStatsProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-full mb-2" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 대기 중 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            대기 중
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.pending.count}건
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₩{formatAmount(stats.pending.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 승인됨 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            승인됨
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {stats.approved.count}건
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₩{formatAmount(stats.approved.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 플래그됨 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            플래그됨
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {stats.flagged.count}건
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₩{formatAmount(stats.flagged.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 거부됨 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            거부됨
          </CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.rejected.count}건
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ₩{formatAmount(stats.rejected.totalAmount)}
          </p>
        </CardContent>
      </Card>

      {/* 추가 통계 (2행) */}
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">AML 지표</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">
                평균 리스크 점수
              </span>
            </div>
            <Badge
              variant={
                stats.averageRiskScore >= 60
                  ? "destructive"
                  : stats.averageRiskScore >= 40
                  ? "default"
                  : "secondary"
              }
            >
              {stats.averageRiskScore}/100
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">
                고위험 건수
              </span>
            </div>
            <span className="text-sm font-medium">{stats.highRiskCount}건</span>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            대량 출금 모니터링
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">
                1억원 이상 출금
              </span>
            </div>
            <Badge variant="outline">{stats.largeAmountCount}건</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            대량 출금은 자동으로 수동 검토 대기열에 추가됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
