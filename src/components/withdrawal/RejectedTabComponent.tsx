import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { getStatusInfo, getPriorityInfo, formatAmount, formatDateTime } from "@/utils/withdrawalHelpers";
import { convertToKRW } from "@/utils/approverAssignment";
import { RejectedTableRow } from "./RejectedTableRow";
import { ApprovalStatus } from "./ApprovalStatus";
import { ApprovalTimeline } from "./ApprovalTimeline";
import { BlockchainInfo } from "./BlockchainInfo";

interface RejectedTabComponentProps {
  withdrawalRequests: WithdrawalRequest[];
  onReapplication: (requestId: string) => void;
  onArchive: (requestId: string) => void;
}

export default function RejectedTabComponent({ 
  withdrawalRequests, 
  onReapplication, 
  onArchive 
}: RejectedTabComponentProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 반려/보류 필터링 로직
  const getFilteredRequests = () => {
    return withdrawalRequests.filter((request) => {
      // 상태 필터 - rejected 또는 archived만 표시
      const baseStatusMatch = request.status === "rejected" || request.status === "archived";
      const statusMatch = 
        statusFilter === "all" || 
        (statusFilter === "rejected" && request.status === "rejected") ||
        (statusFilter === "archived" && request.status === "archived");

      // 검색어 필터
      const searchMatch = 
        searchTerm === "" ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.initiator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.amount.toString().includes(searchTerm.toLowerCase()) ||
        request.currency.toLowerCase().includes(searchTerm.toLowerCase());

      // 기간 필터
      let dateMatch = true;
      if (dateFilter !== "all") {
        const requestDate = new Date(request.initiatedAt);
        const now = new Date();
        const diffTime = now.getTime() - requestDate.getTime();
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

      return baseStatusMatch && statusMatch && searchMatch && dateMatch;
    });
  };

  const getPaginatedRequests = () => {
    const filtered = getFilteredRequests();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    };
  };

  const paginatedData = getPaginatedRequests();

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              반려/보류 현황
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="신청 ID, 제목, 기안자, 자산 검색..."
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
                <option value="all">모든 상태</option>
                <option value="rejected">반려</option>
                <option value="archived">처리 완료</option>
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
                        승인진행률
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.items.map((request) => (
                      <RejectedTableRow
                        key={request.id}
                        request={request}
                        onToggleDetails={(requestId) =>
                          setSelectedRequest(
                            selectedRequest === requestId ? null : requestId
                          )
                        }
                        onReapplication={onReapplication}
                        onArchive={onArchive}
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
                        onClick={() => setCurrentPage(Math.max(1, paginatedData.currentPage - 1))}
                        disabled={paginatedData.currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>
                      
                      {[...Array(paginatedData.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === paginatedData.currentPage;
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setCurrentPage(pageNumber)}
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
                        onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, paginatedData.currentPage + 1))}
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

      {/* 상세 정보 패널 */}
      {selectedRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {(() => {
            const request = withdrawalRequests.find(
              (r) => r.id === selectedRequest
            );
            if (!request) return null;

            return (
              <div>
                {/* 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${
                              getStatusInfo(request.status).color
                            }`}
                          >
                            {getStatusInfo(request.status).name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {request.title} 상세 정보
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 출금 요약 */}
                    <div className="lg:col-span-1">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        출금 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {formatAmount(
                                request.amount,
                                request.currency
                              )}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {request.currency}
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                              ₩
                              {convertToKRW(request.amount, request.currency).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        {/* 상세 설명 */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            출금 상세 설명
                          </h6>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {request.description}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">신청 시간</span>
                            <span className="font-medium">
                              {formatDateTime(request.initiatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">기안자</span>
                            <span className="font-medium">
                              {request.initiator}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">우선순위</span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                getPriorityInfo(request.priority).color
                              }`}
                            >
                              {getPriorityInfo(request.priority).name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 결재 정보 */}
                    <div className="lg:col-span-2">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        결재 승인 정보
                      </h5>
                      <div className="space-y-4">
                        <ApprovalStatus 
                          request={request} 
                          showDetailedStatus={true}
                          showProgressSummary={false}
                        />

                        {(request.status === "rejected" || request.status === "archived") &&
                          request.rejections.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-center mb-3">
                                <svg
                                  className="w-5 h-5 text-gray-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-800">
                                  반려 사유 상세
                                </span>
                              </div>
                              {request.rejections.map(
                                (rejection, index) => (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded border"
                                  >
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium text-gray-700">
                                        반려 사유
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatDateTime(
                                          rejection.rejectedAt
                                        )}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-800 mb-2">
                                      {rejection.reason}
                                    </p>
                                    <div className="text-xs text-gray-500">
                                      반려자: {rejection.userName}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  {/* 블록체인 정보 */}
                  <BlockchainInfo request={request} />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}