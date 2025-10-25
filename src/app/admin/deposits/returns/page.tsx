/**
 * 환불 처리 페이지 (Task 3.5)
 *
 * 검증 실패로 환불이 필요한 입금을 관리하는 페이지
 */

'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { ReturnStats, ReturnStatsData } from './components/ReturnStats';
import { ReturnFilters, ReturnFilterState } from './components/ReturnFilters';
import { ReturnQueueTable } from './components/ReturnQueueTable';
import { ReturnTransaction } from '@/types/deposit';
import {
  getReturns,
  getReturnStats,
} from '@/services/depositReturnApiService';

export default function ReturnsPage() {
  const [filters, setFilters] = useState<ReturnFilterState>({});

  // 반환 통계 조회 (5분마다 백그라운드 동기화)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['returnStats'],
    queryFn: getReturnStats,
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  // 반환 목록 조회 (5분마다 백그라운드 동기화)
  const { data: returnsData, isLoading: isReturnsLoading, refetch } = useQuery({
    queryKey: ['returns', filters],
    queryFn: () => getReturns({
      status: filters.status,
      page: 1,
      pageSize: 1000,
    }),
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  // 수동 새로고침
  const handleManualRefresh = () => {
    refetch();
  };

  // 필터링된 환불 목록 (클라이언트 사이드 필터링)
  const returns = returnsData?.data || [];
  const filteredReturns = returns.filter((returnTx) => {
    // 환불 사유 필터
    if (filters.reason && filters.reason.length > 0) {
      if (!filters.reason.includes(returnTx.reason)) {
        return false;
      }
    }

    // 검색 쿼리
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesTxHash = returnTx.originalTxHash.toLowerCase().includes(query);
      const matchesReturnTxHash = returnTx.returnTxHash?.toLowerCase().includes(query);
      const matchesAddress = returnTx.returnAddress.toLowerCase().includes(query);

      if (!matchesTxHash && !matchesReturnTxHash && !matchesAddress) {
        return false;
      }
    }

    return true;
  });

  const loading = isStatsLoading || isReturnsLoading;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">입금 반환 관리</h1>
          <p className="text-muted-foreground mt-2">
            검증 실패로 반환이 필요한 입금을 추적하고 관리합니다
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && <ReturnStats stats={stats} />}

      {/* 반환 대기열 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>반환 대기열</CardTitle>
          <CardDescription>
            총 {filteredReturns.length}개의 반환 요청 (전체 {returns.length}건 중)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 */}
          <ReturnFilters filters={filters} onFilterChange={setFilters} />

          {/* 테이블 */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ReturnQueueTable returns={filteredReturns} />
          )}
        </CardContent>
      </Card>

      {/* 안내 메시지 */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-400">
            반환 처리 프로세스
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p>
            <strong>1. 요청 (Pending)</strong>: 관리자가 미검증 입금에 대해 반환 요청을 생성합니다.
          </p>
          <p>
            <strong>2. 승인 (Approved)</strong>: 권한 있는 관리자가 반환 요청을 검토하고 승인합니다.
          </p>
          <p>
            <strong>3. 실행 (Processing)</strong>: 승인된 반환이 블록체인 트랜잭션으로 실행됩니다.
          </p>
          <p>
            <strong>4. 완료 (Completed)</strong>: 블록체인 컨펌을 받아 반환이 최종 완료됩니다.
          </p>
          <p className="pt-2 border-t border-blue-200 dark:border-blue-800 font-semibold">
            반환 시 네트워크 수수료를 제외한 금액이 지정된 주소로 전송됩니다.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
