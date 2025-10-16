'use client';

/**
 * AML 스크리닝 페이지
 *
 * 입금 거래에 대한 AML(Anti-Money Laundering) 검토 시스템입니다.
 * - 리스크 점수 기반 스크리닝
 * - 제재 목록 체크
 * - 수동 검토 인터페이스
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { RefreshCw, AlertTriangle } from 'lucide-react';

import {
  getAMLScreeningQueue,
  getAMLScreeningStats,
  getAMLScreeningDetail,
  approveAMLReview,
  flagAMLDeposit,
} from '@/services/depositApi';
import type { AMLScreeningFilter, AMLScreeningItem, AMLScreeningDetail } from '@/types/deposit';

import { AMLScreeningStats } from './components/AMLScreeningStats';
import { AMLScreeningFilters } from './components/AMLScreeningFilters';
import { AMLScreeningTable } from './components/AMLScreeningTable';
import { AMLScreeningDetailModal } from './components/AMLScreeningDetailModal';

export default function AMLScreeningPage() {
  const queryClient = useQueryClient();

  // 필터 상태
  const [filter, setFilter] = useState<AMLScreeningFilter>({});

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 선택된 아이템 (상세 모달용)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 통계 조회 (5초마다 자동 refetch)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['amlScreeningStats'],
    queryFn: getAMLScreeningStats,
    refetchInterval: 5000,
  });

  // AML 검토 대기열 조회 (필터 변경 시 refetch, 5초마다 자동 refetch)
  const { data: queueData, isLoading: isQueueLoading, refetch } = useQuery({
    queryKey: ['amlScreeningQueue', filter, currentPage, pageSize],
    queryFn: () => getAMLScreeningQueue({ filter, page: currentPage, pageSize }),
    refetchInterval: 5000,
  });

  // 선택된 아이템 상세 조회
  const { data: selectedItemDetail } = useQuery({
    queryKey: ['amlScreeningDetail', selectedItemId],
    queryFn: () =>
      selectedItemId ? getAMLScreeningDetail(selectedItemId.replace('aml-', '')) : null,
    enabled: !!selectedItemId,
  });

  // 승인 mutation
  const approveMutation = useMutation({
    mutationFn: (depositId: string) =>
      approveAMLReview({
        depositId,
        action: 'approve',
        notes: 'AML 검토 승인 - 수동 검토 완료',
        performedBy: 'admin-001', // TODO: use actual admin ID
      }),
    onSuccess: () => {
      alert('✅ AML 검토가 승인되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['amlScreeningQueue'] });
      queryClient.invalidateQueries({ queryKey: ['amlScreeningStats'] });
      setIsDetailModalOpen(false);
    },
    onError: () => {
      alert('❌ 승인 처리 실패. 다시 시도해주세요.');
    },
  });

  // 플래그 mutation
  const flagMutation = useMutation({
    mutationFn: (depositId: string) =>
      flagAMLDeposit({
        depositId,
        action: 'flag',
        notes: 'AML 위험 플래그 - 추가 조사 필요',
        performedBy: 'admin-001', // TODO: use actual admin ID
      }),
    onSuccess: () => {
      alert('⚠️ 의심 거래로 플래그되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['amlScreeningQueue'] });
      queryClient.invalidateQueries({ queryKey: ['amlScreeningStats'] });
      setIsDetailModalOpen(false);
    },
    onError: () => {
      alert('❌ 플래그 처리 실패. 다시 시도해주세요.');
    },
  });

  // 필터 초기화
  const handleResetFilter = () => {
    setFilter({});
    setCurrentPage(1);
  };

  // 필터 변경 시 페이지 1로 리셋
  const handleFilterChange = (newFilter: AMLScreeningFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // 상세 보기
  const handleViewDetails = (item: AMLScreeningItem) => {
    setSelectedItemId(item.depositId);
    setIsDetailModalOpen(true);
  };

  // 모달 닫기
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedItemId(null);
  };

  // 승인 처리
  const handleApprove = (item: AMLScreeningItem | AMLScreeningDetail) => {
    if (confirm(`${item.memberName}의 거래를 승인하시겠습니까?`)) {
      approveMutation.mutate(item.depositId);
    }
  };

  // 플래그 처리
  const handleFlag = (item: AMLScreeningItem | AMLScreeningDetail) => {
    if (confirm(`${item.memberName}의 거래를 의심 거래로 플래그하시겠습니까?`)) {
      flagMutation.mutate(item.depositId);
    }
  };

  // 수동 새로고침
  const handleManualRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['amlScreeningStats'] });
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            AML 스크리닝
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            입금 거래에 대한 자금 세탁 방지 검토 시스템
          </p>
        </div>

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

      {/* 통계 카드 */}
      {stats && <AMLScreeningStats stats={stats} isLoading={isStatsLoading} />}

      {/* 안내 메시지 */}
      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>AML 스크리닝 시스템</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            <strong>검토 프로세스:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>입금 감지 시 송신 주소에 대한 자동 AML 스크리닝 실행</li>
            <li>블랙리스트, 제재 목록, PEP, 부정적 미디어 체크</li>
            <li>리스크 점수 0-100으로 산출 (높을수록 위험)</li>
            <li>고위험 거래는 수동 검토 필요, 관리자 승인 또는 플래그 처리</li>
          </ul>
        </CardContent>
      </Card>

      {/* 메인 콘텐츠 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>검토 대기열</CardTitle>
              <CardDescription>
                총 {queueData?.total || 0}건
                {queueData?.total === 0 && (
                  <span className="ml-2 text-yellow-600">
                    - 입금 모니터링 페이지에서 Mock 데이터를 생성하세요
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 영역 */}
          <AMLScreeningFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilter}
          />

          {/* 테이블 영역 */}
          <AMLScreeningTable
            items={queueData?.items || []}
            isLoading={isQueueLoading}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onFlag={handleFlag}
          />

          {/* 페이징 */}
          {queueData && queueData.total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                전체 {queueData.total}건 중 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, queueData.total)}건 표시
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
                    { length: Math.ceil(queueData.total / pageSize) },
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
                          Math.min(Math.ceil(queueData.total / pageSize), prev + 1)
                        )
                      }
                      className={
                        currentPage === Math.ceil(queueData.total / pageSize)
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
      <AMLScreeningDetailModal
        item={selectedItemDetail as AMLScreeningDetail | null}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onApprove={handleApprove}
        onFlag={handleFlag}
      />
    </div>
  );
}
