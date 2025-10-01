import { useState } from "react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { WithdrawalRequest } from "@/types/withdrawal";
import {
  getStatusInfo,
  getPriorityInfo,
  formatAmount,
  formatDateTime,
} from "@/utils/withdrawalHelpers";
import { convertToKRW } from "@/utils/approverAssignment";
import { ProcessingTableRow } from "./ProcessingTableRow";
import { WithdrawalStopModal } from "./WithdrawalStopModal";
import { BlockchainInfo } from "./BlockchainInfo";

interface AirgapTabProps {
  withdrawalRequests: WithdrawalRequest[];
}

export default function AirgapTab({ withdrawalRequests }: AirgapTabProps) {
  const [processingSearchTerm, setProcessingSearchTerm] = useState("");
  const [processingStatusFilter, setProcessingStatusFilter] =
    useState<string>("all");
  const [processingDateFilter, setProcessingDateFilter] =
    useState<string>("all");
  const [processingCurrentPage, setProcessingCurrentPage] = useState(1);
  const [processingItemsPerPage] = useState(10);
  const [selectedProcessingRequest, setSelectedProcessingRequest] = useState<
    string | null
  >(null);
  const [stopModalRequest, setStopModalRequest] =
    useState<WithdrawalRequest | null>(null);

  // 출금 처리 필터링 로직
  const getFilteredProcessingRequests = () => {
    return withdrawalRequests.filter((request) => {
      // 상태 필터
      const statusMatch =
        processingStatusFilter === "all" ||
        (processingStatusFilter === "pending" &&
          request.status === "pending") ||
        (processingStatusFilter === "processing" &&
          request.status === "processing") ||
        (processingStatusFilter === "security_verification" &&
          request.status === "processing") ||
        (processingStatusFilter === "completed" &&
          request.status === "completed");

      // 검색어 필터
      const searchMatch =
        processingSearchTerm === "" ||
        request.id.toLowerCase().includes(processingSearchTerm.toLowerCase()) ||
        request.title
          .toLowerCase()
          .includes(processingSearchTerm.toLowerCase()) ||
        request.initiator
          .toLowerCase()
          .includes(processingSearchTerm.toLowerCase()) ||
        request.amount
          .toString()
          .includes(processingSearchTerm.toLowerCase()) ||
        request.currency
          .toLowerCase()
          .includes(processingSearchTerm.toLowerCase());

      // 기간 필터
      let dateMatch = true;
      if (processingDateFilter !== "all") {
        const requestDate = new Date(request.initiatedAt);
        const now = new Date();
        const diffTime = now.getTime() - requestDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (processingDateFilter) {
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

      return (
        statusMatch &&
        searchMatch &&
        dateMatch &&
        ["pending", "processing", "completed"].includes(request.status)
      );
    });
  };

  const getPaginatedProcessingRequests = () => {
    const filtered = getFilteredProcessingRequests();
    const startIndex = (processingCurrentPage - 1) * processingItemsPerPage;
    const endIndex = startIndex + processingItemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / processingItemsPerPage),
      currentPage: processingCurrentPage,
      itemsPerPage: processingItemsPerPage,
    };
  };

  const paginatedData = getPaginatedProcessingRequests();

  const handleStopWithdrawal = (requestId: string, reason: string) => {
    // 실제로는 API 호출하여 출금 정지 처리
    console.log("출금 정지:", requestId, "사유:", reason);
    // 상태 업데이트 로직 (실제로는 상위 컴포넌트에서 처리)
    alert(`출금이 중지되었습니다.\n사유: ${reason}`);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              출금 처리 현황
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="신청 ID, 제목, 기안자, 자산 검색..."
                  value={processingSearchTerm}
                  onChange={(e) => setProcessingSearchTerm(e.target.value)}
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
                value={processingStatusFilter}
                onChange={(e) => setProcessingStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 상태</option>
                <option value="pending">출금 대기</option>
                <option value="processing">보안 검증</option>
                <option value="security_verification">보안 검증</option>
                <option value="completed">처리완료</option>
              </select>

              {/* 기간 필터 */}
              <select
                value={processingDateFilter}
                onChange={(e) => setProcessingDateFilter(e.target.value)}
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
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        진행률/대기순서
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedData.items.map((request) => (
                      <ProcessingTableRow
                        key={request.id}
                        request={request}
                        onToggleDetails={(requestId) =>
                          setSelectedProcessingRequest(
                            selectedProcessingRequest === requestId
                              ? null
                              : requestId
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
                        (paginatedData.currentPage - 1) *
                          paginatedData.itemsPerPage +
                          1,
                        paginatedData.totalItems
                      )}
                      -
                      {Math.min(
                        paginatedData.currentPage * paginatedData.itemsPerPage,
                        paginatedData.totalItems
                      )}
                      개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setProcessingCurrentPage(
                            Math.max(1, paginatedData.currentPage - 1)
                          )
                        }
                        disabled={paginatedData.currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>

                      {[...Array(paginatedData.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage =
                          pageNumber === paginatedData.currentPage;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setProcessingCurrentPage(pageNumber)}
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
                          setProcessingCurrentPage(
                            Math.min(
                              paginatedData.totalPages,
                              paginatedData.currentPage + 1
                            )
                          )
                        }
                        disabled={
                          paginatedData.currentPage === paginatedData.totalPages
                        }
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
      {selectedProcessingRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {(() => {
            const request = withdrawalRequests.find(
              (r) => r.id === selectedProcessingRequest
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
                      onClick={() => setSelectedProcessingRequest(null)}
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
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 출금 요약 */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        출금 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {formatAmount(request.amount, request.currency)}
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
                            <svg
                              className="w-4 h-4 mr-2 text-gray-500"
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

                    {/* 승인 정보 */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        결재 승인 정보
                      </h5>
                      <div className="space-y-4">
                        {/* 필수 결재자 승인 현황 */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <h6 className="text-sm font-medium text-gray-700 mb-3">
                            필수 결재자 승인 현황
                          </h6>
                          <div className="space-y-2">
                            {request.requiredApprovals.map((approver) => {
                              const approval = request.approvals.find(
                                (a) => a.userName === approver
                              );
                              return (
                                <div
                                  key={approver}
                                  className="flex items-center justify-between p-3 bg-white rounded border"
                                >
                                  <div className="flex items-center">
                                    {approval ? (
                                      <CheckCircleIcon className="h-5 w-5 text-sky-500 mr-3" />
                                    ) : (
                                      <ClockIcon className="h-5 w-5 text-yellow-500 mr-3" />
                                    )}
                                    <span className="font-medium text-gray-900">
                                      {approver}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    {approval ? (
                                      <div>
                                        <span className="text-sm font-medium text-sky-700">
                                          승인 완료
                                        </span>
                                        <div className="text-xs text-gray-500">
                                          {new Date(
                                            approval.approvedAt
                                          ).toLocaleString("ko-KR")}
                                        </div>
                                        {approval.signature && (
                                          <div className="text-xs text-sky-600 mt-1">
                                            디지털 서명 완료
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-sm font-medium text-yellow-700">
                                        승인 대기
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 대기 중인 승인자 */}
                        {request.requiredApprovals.length >
                          request.approvals.length && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h6 className="text-sm font-medium text-gray-900 mb-2">
                              승인 대기 중
                            </h6>
                            <div className="text-sm text-gray-600">
                              {request.requiredApprovals.length -
                                request.approvals.length}
                              명의 승인이 추가로 필요합니다.
                            </div>
                          </div>
                        )}

                        {/* 출금 대기 상태 표시 - pending 상태일 때만 표시 */}
                        {request.status === "pending" && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-800">
                                  출금 대기 중입니다
                                </span>
                              </div>
                              <button
                                onClick={() => setStopModalRequest(request)}
                                className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              >
                                출금 정지
                              </button>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              오출금 방지를 위한 대기 기간이 진행 중입니다.
                              <div className="mt-1 font-medium text-gray-700">
                                {(() => {
                                  // ID별 남은 시간 매핑
                                  const etaMap: { [key: string]: string } = {
                                    "2025-09-0005": "17분",
                                    "2025-09-0006": "12시간 35분",
                                    "2025-09-0007": "24시간",
                                  };
                                  const remainingTime =
                                    etaMap[request.id] || "24시간";
                                  return `남은 시간: ${remainingTime}`;
                                })()}
                              </div>
                            </div>
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

      {/* 출금 정지 모달 */}
      {stopModalRequest && (
        <WithdrawalStopModal
          request={stopModalRequest}
          isOpen={!!stopModalRequest}
          onClose={() => setStopModalRequest(null)}
          onConfirm={handleStopWithdrawal}
        />
      )}
    </div>
  );
}
