'use client';

/**
 * 입금 모니터링 메인 페이지
 *
 * 실제 백엔드 DB 연동 + WebSocket 실시간 업데이트
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCw, Info } from 'lucide-react';

import { getDeposits, getDepositStats, getDepositById } from '@/services/depositApiService';
import { useDepositSocket } from '@/hooks/useDepositSocket';
import { DepositFilter, DepositTransaction } from '@/types/deposit';

import { DepositStats } from './components/DepositStats';
import { DepositFilters } from './components/DepositFilters';
import { DepositFeed } from './components/DepositFeed';
import { DepositDetailModal } from './components/DepositDetailModal';

export default function DepositMonitoringPage() {
  // WebSocket 연결 및 실시간 업데이트
  useDepositSocket();

  const [filter, setFilter] = useState<DepositFilter>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 통계 조회 (5분마다 백그라운드 동기화)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['depositStats'],
    queryFn: getDepositStats,
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  // 입금 목록 조회 (5분마다 백그라운드 동기화)
  const { data: depositsData, isLoading: isDepositsLoading, refetch } = useQuery({
    queryKey: ['deposits', filter, currentPage, pageSize],
    queryFn: () => getDeposits({ filter, page: currentPage, pageSize }),
    refetchInterval: 5 * 60 * 1000, // 5분
  });

  // 선택된 입금 상세 조회
  const { data: selectedDepositDetails } = useQuery({
    queryKey: ['depositDetails', selectedDepositId],
    queryFn: () => (selectedDepositId ? getDepositById(selectedDepositId) : null),
    enabled: !!selectedDepositId,
  });

  // 필터 초기화
  const handleResetFilter = () => {
    setFilter({});
    setCurrentPage(1);
  };

  // 필터 변경 시 페이지 1로 리셋
  const handleFilterChange = (newFilter: DepositFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // 입금 상세 보기
  const handleViewDetails = (deposit: DepositTransaction) => {
    setSelectedDepositId(deposit.id);
    setIsDetailModalOpen(true);
  };

  // 모달 닫기
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDepositId(null);
  };

  const handleManualRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            입금 모니터링
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            실시간 입금 감지 및 검증 시스템
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleManualRefresh}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>새로고침</span>
        </Button>
      </div>

      {/* 통계 카드 */}
      {stats && <DepositStats stats={stats} isLoading={isStatsLoading} />}

      {/* 메인 콘텐츠 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>실시간 입금 피드</CardTitle>
              <CardDescription>
                총 {depositsData?.total || 0}건 (자동 업데이트)
              </CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 cursor-help">
                    <Info className="h-4 w-4" />
                    <span className="hidden sm:inline">발신자 검증</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="left" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">발신자 주소 검증</p>
                    <ul className="text-xs space-y-1">
                      <li>• 검증됨: 화이트리스트 등록 주소</li>
                      <li>• 미검증: 미등록 주소 (검토 필요)</li>
                    </ul>
                    <p className="text-xs text-gray-500">
                      회원사 등록 출금 주소에서의 입금 여부를 확인합니다.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 영역 */}
          <DepositFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilter}
          />

          {/* 테이블 영역 */}
          <DepositFeed
            deposits={depositsData?.deposits || []}
            isLoading={isDepositsLoading}
            onViewDetails={handleViewDetails}
          />

          {/* 페이징 */}
          {depositsData && depositsData.total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                전체 {depositsData.total}건 중 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, depositsData.total)}건 표시
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>

                  {Array.from(
                    { length: Math.ceil(depositsData.total / pageSize) },
                    (_, i) => i + 1
                  ).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(Math.ceil(depositsData.total / pageSize), prev + 1)
                        )
                      }
                      className={
                        currentPage === Math.ceil(depositsData.total / pageSize)
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 모달 */}
      <DepositDetailModal
        deposit={selectedDepositDetails as DepositTransaction | null}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}