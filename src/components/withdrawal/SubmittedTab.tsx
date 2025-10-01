import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { WithdrawalTableRow } from "./WithdrawalTableRow";

interface SubmittedTabProps {
  mockRequests: WithdrawalRequest[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  selectedRequest: string | null;
  setSelectedRequest: (value: string | null) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
}

export function SubmittedTab({
  mockRequests,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  dateFilter,
  setDateFilter,
  selectedRequest,
  setSelectedRequest,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
}: SubmittedTabProps) {
  // Filter and pagination logic
  const filteredRequests = mockRequests.filter((request) => {
    const matchesSearch = !searchTerm || 
      request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.id.includes(searchTerm) ||
      request.currency.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    const matchesDate = dateFilter === "all" || (() => {
      const requestDate = new Date(request.initiatedAt);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today": return daysDiff === 0;
        case "week": return daysDiff <= 7;
        case "month": return daysDiff <= 30;
        case "quarter": return daysDiff <= 90;
        default: return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getPaginatedRequests = () => {
    const filtered = filteredRequests.filter((r) => ["submitted"].includes(r.status));
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const items = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      items,
      totalItems,
      totalPages,
      currentPage,
      itemsPerPage,
    };
  };

  const paginatedData = getPaginatedRequests();

  return (
    <>
      {/* 검색 및 필터 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="제목, 신청 ID, 화폐 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="all">모든 상태</option>
                <option value="submitted">결재 승인 대기</option>
              </select>
            </div>
            <div>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
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
      </div>

      {/* 데이터 표시 영역 */}
      <div className="p-6">
        {(() => {
          return paginatedData.totalItems === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  검색 결과가 없습니다
                </h3>
                <p className="text-gray-500">
                  다른 검색어나 필터 조건을 시도해보세요.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        신청 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        출금 내용
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        자산
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        기안자
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        우선순위
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        결재 현황
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests
                      .filter((r) => ["submitted"].includes(r.status))
                      .map((request) => (
                        <WithdrawalTableRow
                          key={request.id}
                          request={request}
                          onToggleDetails={(requestId) =>
                            setSelectedRequest(
                              selectedRequest === requestId ? null : requestId
                            )
                          }
                        />
                      ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              {paginatedData.totalPages > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                      총 {paginatedData.totalItems}개 중{" "}
                      {Math.min(
                        (paginatedData.currentPage - 1) * paginatedData.itemsPerPage + 1,
                        paginatedData.totalItems
                      )}
                      -{Math.min(paginatedData.currentPage * paginatedData.itemsPerPage, paginatedData.totalItems)}개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      
                      {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                        const startPage = Math.max(1, currentPage - 2);
                        const pageNumber = startPage + i;
                        if (pageNumber > paginatedData.totalPages) return null;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNumber
                                ? "text-primary-600 bg-primary-50 border border-primary-300"
                                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
                        disabled={currentPage === paginatedData.totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </>
  );
}