"use client";

// ============================================================================
// 출금 실행 모니터링 페이지 (Task 4.4)
// ============================================================================

import { useState } from "react";
import { ExecutionStats } from "./ExecutionStats";
import { ExecutionTable } from "./ExecutionTable";
import { ExecutionDetailModal } from "./ExecutionDetailModal";
import { NetworkStatusPanel } from "./NetworkStatusPanel";
import { ExecutionFilterComponent } from "./ExecutionFilter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useExecutionPolling } from "@/hooks/useExecution";
import {
  WithdrawalExecution,
  ExecutionFilter,
  ExecutionSort,
} from "@/types/withdrawal";
import { RefreshCw, ArrowUpDown } from "lucide-react";

export default function ExecutionMonitoringPage() {
  // 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<ExecutionFilter>({});
  const [sort, setSort] = useState<ExecutionSort>({
    field: "broadcastStartedAt",
    direction: "desc",
  });
  const [selectedExecution, setSelectedExecution] =
    useState<WithdrawalExecution | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 데이터 조회 (자동 폴링 10초)
  const { data, isLoading, refetch } = useExecutionPolling(
    filter,
    sort,
    currentPage,
    20
  );

  const handleFilterChange = (newFilter: ExecutionFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleSortChange = (field: string) => {
    setSort((prev) => ({
      field: field as ExecutionSort["field"],
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleViewDetail = (execution: WithdrawalExecution) => {
    setSelectedExecution(execution);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedExecution(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">출금 실행 모니터링</h1>
          <p className="text-muted-foreground">
            트랜잭션 브로드캐스트 및 컨펌 상태를 실시간으로 모니터링합니다
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <ExecutionStats />

      {/* 컨텐츠 영역 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 메인 컨텐츠 */}
        <div className="space-y-4 lg:col-span-2">
          {/* 필터 */}
          <ExecutionFilterComponent onFilterChange={handleFilterChange} />

          {/* 정렬 옵션 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">정렬:</span>
            </div>
            <Select
              value={sort.field}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="broadcastStartedAt">시작 시간</SelectItem>
                <SelectItem value="confirmations">컨펌 진행률</SelectItem>
                <SelectItem value="amount">금액</SelectItem>
                <SelectItem value="networkFee">네트워크 수수료</SelectItem>
                <SelectItem value="asset">자산</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setSort((prev) => ({
                  ...prev,
                  direction: prev.direction === "asc" ? "desc" : "asc",
                }))
              }
            >
              {sort.direction === "asc" ? "오름차순" : "내림차순"}
            </Button>
          </div>

          {/* 테이블 */}
          {isLoading ? (
            <div className="rounded-lg border p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  로딩 중...
                </span>
              </div>
            </div>
          ) : (
            <ExecutionTable
              executions={data?.executions || []}
              onViewDetail={handleViewDetail}
            />
          )}

          {/* 페이지네이션 */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                총 {data.totalCount}개 중 {(currentPage - 1) * 20 + 1}-
                {Math.min(currentPage * 20, data.totalCount)}개 표시
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: data.pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === data.pagination.totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, idx, arr) => (
                      <div key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(data.pagination.totalPages, p + 1)
                    )
                  }
                  disabled={currentPage === data.pagination.totalPages}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-4">
          {/* 네트워크 상태 패널 */}
          <NetworkStatusPanel />
        </div>
      </div>

      {/* 상세 모달 */}
      <ExecutionDetailModal
        execution={selectedExecution}
        open={showDetailModal}
        onClose={handleCloseModal}
      />
    </div>
  );
}
