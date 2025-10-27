"use client";

import { useState } from "react";
import { IndividualWithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";
import { formatAmount } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { ClipboardDocumentIcon, CheckIcon, FunnelIcon } from "@heroicons/react/24/outline";
import {
  getCurrentStep,
  getStepDescription,
  isWithdrawalInProgress,
  isWithdrawalWaiting,
  getProgressPercentage,
  getRemainingWaitTime
} from "@/utils/withdrawalProgressHelpers";

interface WithdrawalHistoryTableProps {
  withdrawals: IndividualWithdrawalRequest[];
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onViewDetails: (withdrawal: IndividualWithdrawalRequest) => void;
}

export default function WithdrawalHistoryTable({
  withdrawals,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems = 0,
  onPageChange,
  onViewDetails,
}: WithdrawalHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [copiedAddress, setCopiedAddress] = useState<string>("");

  // 필터링 로직
  const getFilteredWithdrawals = () => {
    return withdrawals.filter((withdrawal) => {
      // 검색어 필터
      const searchMatch =
        searchTerm === "" ||
        withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        withdrawal.amount.toString().includes(searchTerm.toLowerCase()) ||
        withdrawal.toAddress.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터
      const statusMatch = statusFilter === "all" || withdrawal.status === statusFilter;

      // 자산 필터
      const assetMatch = assetFilter === "all" || withdrawal.currency === assetFilter;

      // 기간 필터
      let dateMatch = true;
      if (dateFilter !== "all") {
        const withdrawalDate = new Date(withdrawal.initiatedAt);
        const now = new Date();
        const diffTime = now.getTime() - withdrawalDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            dateMatch = diffDays === 0;
            break;
          case "week":
            dateMatch = diffDays <= 7;
            break;
          case "month":
            dateMatch = diffDays <= 30;
            break;
          case "quarter":
            dateMatch = diffDays <= 90;
            break;
          default:
            dateMatch = true;
        }
      }

      return searchMatch && statusMatch && assetMatch && dateMatch;
    });
  };

  // 서버 사이드 페이징 - 필터링만 클라이언트에서 수행
  const getPaginatedWithdrawals = () => {
    const filtered = getFilteredWithdrawals();
    // 서버에서 이미 페이징된 데이터를 받으므로 추가 슬라이싱 불필요
    return {
      items: filtered,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    };
  };

  const paginatedData = getPaginatedWithdrawals();

  // 페이지 변경 핸들러 (서버 사이드 페이징)
  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    }
    // 페이지 변경 시 맨 위로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 고유 자산 목록 생성
  const uniqueAssets = Array.from(new Set(withdrawals.map((w) => w.currency)));

  // 고정 길이 truncate 함수
  const truncateAddress = (address: string) => {
    if (!address || address.length <= 30) {
      return address;
    }

    // 앞 18자, 뒤 12자 표시 (65%/35% 비율)
    return `${address.slice(0, 18)}...${address.slice(-12)}`;
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 통합된 테이블 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              출금 히스토리
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ID, 제목, 자산, 주소 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* 상태 필터 */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 상태</option>
                <option value="withdrawal_wait">출금 대기</option>
                <option value="aml_review">AML 검토</option>
                <option value="approval_pending">승인 대기</option>
                <option value="processing">처리 중</option>
                <option value="success">성공</option>
                <option value="failed">실패</option>
                <option value="withdrawal_stopped">중지</option>
              </select>

              {/* 자산 필터 */}
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 자산</option>
                {uniqueAssets.map((asset) => (
                  <option key={asset} value={asset}>
                    {asset}
                  </option>
                ))}
              </select>

              {/* 기간 필터 */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
                <option value="quarter">최근 3개월</option>
              </select>
            </div>
          </div>
        </div>

        {/* 데이터 표시 영역 */}
        <div className="p-6">
          {paginatedData.totalItems === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FunnelIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                검색 결과가 없습니다
              </h3>
              <p className="text-gray-500">
                다른 검색어나 필터 조건을 시도해보세요.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-32">
                        일시
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-28">
                        자산
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-28">
                        수량
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-48">
                        목적지 주소
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-36">
                        상태
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-52">
                        진행률
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-48">
                        완료 일시
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase w-32">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.items.map((withdrawal) => (
                      <tr key={withdrawal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="whitespace-nowrap">
                            {formatDateTime(withdrawal.initiatedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <CryptoIcon
                              symbol={withdrawal.currency}
                              size={32}
                              className="flex-shrink-0"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {withdrawal.currency}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {formatAmount(withdrawal.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <code
                              className="text-sm font-mono text-gray-700 flex-1"
                              title={withdrawal.toAddress}
                            >
                              {truncateAddress(withdrawal.toAddress)}
                            </code>
                            <button
                              onClick={() => handleCopyAddress(withdrawal.toAddress)}
                              className="ml-1 p-1 text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
                              title="주소 복사"
                            >
                              {copiedAddress === withdrawal.toAddress ? (
                                <CheckIcon className="h-4 w-4 text-sky-600" />
                              ) : (
                                <ClipboardDocumentIcon className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={withdrawal.status} />
                        </td>
                        <td className="px-6 py-4">
                          {isWithdrawalWaiting(withdrawal.status) ? (
                            <div className="space-y-1">
                              {/* 24시간 대기 중 - 남은 시간 표시 */}
                              <div className="text-sm font-medium text-gray-700">
                                남은 시간: {getRemainingWaitTime(withdrawal.processingScheduledAt, withdrawal.initiatedAt, withdrawal.waitingPeriodHours)}
                              </div>
                              <div className="text-xs text-gray-500">
                                오출금 방지 대기중
                              </div>
                            </div>
                          ) : isWithdrawalInProgress(withdrawal.status) ? (
                            <div className="space-y-2">
                              {/* 보안 검증 이후 단계 - 진행률 표시 */}
                              <div className="text-sm font-medium text-gray-700">
                                {getCurrentStep(withdrawal.status)}/4 단계
                              </div>

                              {/* 프로그레스 바 */}
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${getProgressPercentage(withdrawal.status)}%` }}
                                />
                              </div>

                              {/* 현재 단계 설명 */}
                              <div className="text-xs text-gray-500">
                                {getStepDescription(withdrawal.status)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {withdrawal.completedAt
                            ? formatDateTime(withdrawal.completedAt)
                            : withdrawal.cancelledAt
                            ? formatDateTime(withdrawal.cancelledAt)
                            : withdrawal.rejectedAt
                            ? formatDateTime(withdrawal.rejectedAt)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => onViewDetails(withdrawal)}
                            className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {paginatedData.totalItems > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                      총 {paginatedData.totalItems}개 중{" "}
                      {Math.min(
                        (paginatedData.currentPage - 1) * paginatedData.itemsPerPage + 1,
                        paginatedData.totalItems
                      )}
                      -
                      {Math.min(paginatedData.currentPage * paginatedData.itemsPerPage, paginatedData.totalItems)}
                      개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, paginatedData.currentPage - 1))}
                        disabled={paginatedData.currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>

                      {[...Array(Math.max(1, paginatedData.totalPages))].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === paginatedData.currentPage;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              isCurrentPage
                                ? "bg-primary-600 text-white border-primary-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(paginatedData.totalPages, paginatedData.currentPage + 1)
                          )
                        }
                        disabled={paginatedData.currentPage === paginatedData.totalPages}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
