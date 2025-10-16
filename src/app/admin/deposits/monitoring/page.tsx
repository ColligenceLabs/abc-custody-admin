'use client';

/**
 * 입금 모니터링 메인 페이지
 *
 * 실시간 입금 감지, 통계, 필터링, 상세 정보 표시를 통합합니다.
 */

import { useState, useEffect } from 'react';
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
import { RefreshCw, Plus } from 'lucide-react';

import { getDeposits, getDepositStats, getDepositById, generateMockDeposits, initializeMockDeposits } from '@/services/depositApi';
import { DepositFilter, DepositTransaction, DepositDetails } from '@/types/deposit';

import { DepositStats } from './components/DepositStats';
import { DepositFilters } from './components/DepositFilters';
import { DepositFeed } from './components/DepositFeed';
import { DepositDetailModal } from './components/DepositDetailModal';

export default function DepositMonitoringPage() {
  // 필터 상태
  const [filter, setFilter] = useState<DepositFilter>({});

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 선택된 입금 (상세 모달용)
  const [selectedDepositId, setSelectedDepositId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock 데이터 초기화 (클라이언트 사이드에서만)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeMockDeposits();
    }
  }, []);

  // 통계 조회 (5초마다 자동 refetch)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['depositStats'],
    queryFn: getDepositStats,
    refetchInterval: 5000,
  });

  // 입금 목록 조회 (필터 변경 시 refetch, 5초마다 자동 refetch)
  const { data: depositsData, isLoading: isDepositsLoading, refetch } = useQuery({
    queryKey: ['deposits', filter, currentPage, pageSize],
    queryFn: () => getDeposits({ filter, page: currentPage, pageSize }),
    refetchInterval: 5000,
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

  // 수동 새로고침
  const handleManualRefresh = () => {
    refetch();
  };

  // Mock 데이터 강제 생성 (개발용)
  const handleGenerateMockData = () => {
    if (typeof window !== 'undefined') {
      // 기존 데이터 삭제 후 새로 생성
      localStorage.removeItem('deposits');
      const mockDeposits = generateMockDeposits(50);

      if (mockDeposits.length === 0) {
        alert('⚠️ 회원사 데이터가 없습니다. 먼저 회원사 온보딩을 확인하세요.');
        return;
      }

      localStorage.setItem('deposits', JSON.stringify(mockDeposits));
      refetch();
      alert(`✅ ${mockDeposits.length}개의 입금 데이터가 생성되었습니다!\n실제 회원사명으로 표시됩니다.`);
    }
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

        {/* 버튼 그룹 */}
        <div className="flex items-center space-x-2">
          {/* Mock 데이터 생성 버튼 (개발용) */}
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="outline"
              onClick={handleGenerateMockData}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Mock 데이터 생성</span>
            </Button>
          )}

          {/* 새로고침 버튼 */}
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>새로고침</span>
          </Button>
        </div>
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
                총 {depositsData?.total || 0}건
                {depositsData?.total === 0 && (
                  <span className="ml-2 text-yellow-600">
                    - Mock 데이터가 없습니다. 위의 "Mock 데이터 생성" 버튼을 클릭하세요.
                  </span>
                )}
              </CardDescription>
            </div>
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
        deposit={selectedDepositDetails as DepositDetails | null}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}