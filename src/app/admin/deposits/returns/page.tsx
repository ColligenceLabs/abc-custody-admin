/**
 * 환불 처리 페이지 (Task 3.5)
 *
 * 검증 실패로 환불이 필요한 입금을 관리하는 페이지
 */

"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { ReturnStats, ReturnStatsData } from "./components/ReturnStats";
import { ReturnFilters, ReturnFilterState } from "./components/ReturnFilters";
import { ReturnQueueTable } from "./components/ReturnQueueTable";
import { ReturnTransaction } from "@/types/deposit";
import { getReturns, getReturnStats } from "@/services/depositReturnApiService";
import { getSocketClient } from "@/lib/socket-client";

export default function ReturnsPage() {
  const [filters, setFilters] = useState<ReturnFilterState>({});

  // 반환 통계 조회 (5분마다 백그라운드 동기화)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["returnStats"],
    queryFn: getReturnStats,
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  // 반환 목록 조회 (5분마다 백그라운드 동기화)
  const {
    data: returnsData,
    isLoading: isReturnsLoading,
    refetch,
  } = useQuery({
    queryKey: ["returns", filters],
    queryFn: () =>
      getReturns({
        status: filters.status,
        page: 1,
        pageSize: 1000,
      }),
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  // 웹소켓 연결 및 실시간 업데이트
  useEffect(() => {
    const socket = getSocketClient();

    // 환불 상태 업데이트 이벤트 수신
    socket.on("depositReturn:update", (data: any) => {
      console.log("[DepositReturn] 실시간 업데이트:", data.depositReturn);

      // 목록 새로고침
      refetch();
    });

    return () => {
      socket.off("depositReturn:update");
    };
  }, [refetch]);

  // 수동 새로고침
  const handleManualRefresh = () => {
    refetch();
  };

  // 필터링된 환불 목록 (클라이언트 사이드 필터링)
  const returns = returnsData?.data || [];
  const filteredReturns = returns.filter((returnTx) => {
    // 상태 필터
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(returnTx.status as any)) {
        return false;
      }
    }

    // 환불 사유 필터
    if (filters.reason && filters.reason.length > 0) {
      if (!filters.reason.includes(returnTx.reason as any)) {
        return false;
      }
    }

    // 날짜 필터
    if (filters.startDate || filters.endDate) {
      const requestedAt = new Date(returnTx.requestedAt);

      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        if (requestedAt < start) {
          return false;
        }
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        if (requestedAt > end) {
          return false;
        }
      }
    }

    // 검색 쿼리 (TxHash, 회원사명, 주소)
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();

      // TxHash 검색
      const matchesTxHash = returnTx.originalTxHash
        .toLowerCase()
        .includes(query);
      const matchesReturnTxHash = returnTx.returnTxHash
        ?.toLowerCase()
        .includes(query);

      // 주소 검색
      const matchesAddress = returnTx.returnAddress
        .toLowerCase()
        .includes(query);

      // 회원사명 검색
      const user = returnTx.deposit?.user;
      const matchesOrgName = user?.organizationName
        ?.toLowerCase()
        .includes(query) || false;
      const matchesUserName = user?.name
        ?.toLowerCase()
        .includes(query) || false;

      if (!matchesTxHash && !matchesReturnTxHash && !matchesAddress && !matchesOrgName && !matchesUserName) {
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
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && <ReturnStats stats={stats} />}

      {/* 반환 대기열 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>환불 대기</CardTitle>
          <CardDescription>
            총 {filteredReturns.length}개의 환불 대기 (전체 {returns.length}건
            중)
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
            <ReturnQueueTable returns={filteredReturns} onRefresh={refetch} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
