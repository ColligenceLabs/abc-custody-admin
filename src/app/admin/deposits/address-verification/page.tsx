'use client';

/**
 * 주소 검증 페이지
 *
 * 입금 주소 검증 상태를 모니터링하고 관리합니다.
 * - 송신 주소가 회원사 등록 주소인지 확인
 * - 입금 권한 검증
 * - 미등록 주소 자동 플래그
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
  getAddressVerifications,
  getAddressVerificationStats,
  getAddressVerificationDetail,
  flagSuspiciousAddress,
} from '@/services/depositApi';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import {
  AddressVerificationFilter,
  AddressVerificationListItem,
  AddressVerificationDetail,
} from '@/types/deposit';

import { AddressVerificationStats } from './components/AddressVerificationStats';
import { AddressVerificationFilters } from './components/AddressVerificationFilters';
import { AddressVerificationTable } from './components/AddressVerificationTable';
import { AddressVerificationDetailModal } from './components/AddressVerificationDetailModal';

export default function AddressVerificationPage() {
  const authContext = useAdminAuth();
  const queryClient = useQueryClient();

  // 필터 상태
  const [filter, setFilter] = useState<AddressVerificationFilter>({});

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // 선택된 검증 (상세 모달용)
  const [selectedVerificationId, setSelectedVerificationId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 통계 조회 (5초마다 자동 refetch)
  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['addressVerificationStats'],
    queryFn: getAddressVerificationStats,
    refetchInterval: 5000,
  });

  // 검증 목록 조회 (필터 변경 시 refetch, 5초마다 자동 refetch)
  const { data: verificationsData, isLoading: isVerificationsLoading, refetch } = useQuery({
    queryKey: ['addressVerifications', filter, currentPage, pageSize],
    queryFn: () => getAddressVerifications({ filter, page: currentPage, pageSize }),
    refetchInterval: 5000,
  });

  // 선택된 검증 상세 조회
  const { data: selectedVerificationDetail } = useQuery({
    queryKey: ['addressVerificationDetail', selectedVerificationId],
    queryFn: () =>
      selectedVerificationId ? getAddressVerificationDetail(selectedVerificationId) : null,
    enabled: !!selectedVerificationId,
  });

  // 주소 플래그 mutation
  const flagMutation = useMutation({
    mutationFn: flagSuspiciousAddress,
    onSuccess: () => {
      alert('✅ 의심 주소로 플래그되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['addressVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['addressVerificationStats'] });
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
  const handleFilterChange = (newFilter: AddressVerificationFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // 검증 상세 보기
  const handleViewDetails = (verification: AddressVerificationListItem) => {
    setSelectedVerificationId(verification.id);
    setIsDetailModalOpen(true);
  };

  // 모달 닫기
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVerificationId(null);
  };

  // 주소 플래그
  const handleFlagAddress = (verification: AddressVerificationListItem | AddressVerificationDetail) => {
    if (!authContext) return;

    const reason = verification.failureReason
      ? verification.failureReason === 'unregistered_address'
        ? '미등록 주소'
        : verification.failureReason === 'no_deposit_permission'
        ? '입금 권한 없음'
        : '검증 실패'
      : '수동 플래그';

    flagMutation.mutate({
      depositId: verification.depositId,
      address: verification.fromAddress,
      reason,
      notes: '관리자 수동 플래그 처리',
      performedBy: 'admin-001', // TODO: use actual admin ID
    });
  };

  // 수동 새로고침
  const handleManualRefresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ['addressVerificationStats'] });
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            주소 검증
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            입금 주소 검증 상태를 모니터링하고 관리합니다
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
      {stats && <AddressVerificationStats stats={stats} isLoading={isStatsLoading} />}

      {/* 안내 메시지 */}
      <Card className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-gray-100 flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>주소 검증 시스템</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
          <p>
            <strong>검증 프로세스:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>입금 감지 시 송신 주소를 회원사 등록 주소 목록과 자동 매칭</li>
            <li>등록된 주소인 경우 입금 권한(canDeposit) 확인</li>
            <li>미등록 주소 또는 권한 없는 주소는 자동으로 환불 처리 대상</li>
            <li>관리자는 의심 주소를 수동으로 플래그 처리 가능</li>
          </ul>
        </CardContent>
      </Card>

      {/* 메인 콘텐츠 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>검증 결과 목록</CardTitle>
              <CardDescription>
                총 {verificationsData?.total || 0}건
                {verificationsData?.total === 0 && (
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
          <AddressVerificationFilters
            filter={filter}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilter}
          />

          {/* 테이블 영역 */}
          <AddressVerificationTable
            verifications={verificationsData?.verifications || []}
            isLoading={isVerificationsLoading}
            onViewDetails={handleViewDetails}
            onFlagAddress={handleFlagAddress}
          />

          {/* 페이징 */}
          {verificationsData && verificationsData.total > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                전체 {verificationsData.total}건 중 {(currentPage - 1) * pageSize + 1}-
                {Math.min(currentPage * pageSize, verificationsData.total)}건 표시
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
                    { length: Math.ceil(verificationsData.total / pageSize) },
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
                          Math.min(Math.ceil(verificationsData.total / pageSize), prev + 1)
                        )
                      }
                      className={
                        currentPage === Math.ceil(verificationsData.total / pageSize)
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
      <AddressVerificationDetailModal
        verification={selectedVerificationDetail as AddressVerificationDetail | null}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onFlagAddress={handleFlagAddress}
      />
    </div>
  );
}
