import { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import {
  formatAmount,
  formatDate,
  formatDateTime,
  getStatusInfo,
} from "@/utils/withdrawalHelpers";
import { exportWithdrawalAuditToCsv } from "@/utils/csvExport";
import { BlockchainInfo } from "./BlockchainInfo";

interface AuditTabProps {
  withdrawalRequests: WithdrawalRequest[];
}

export default function AuditTab({ withdrawalRequests }: AuditTabProps) {
  const [auditSearchTerm, setAuditSearchTerm] = useState("");
  const [auditStatusFilter, setAuditStatusFilter] = useState<string>("all");
  const [auditDateFilter, setAuditDateFilter] = useState<string>("all");
  const [auditCurrentPage, setAuditCurrentPage] = useState(1);
  const [auditItemsPerPage] = useState(10);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpanded = (requestId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedItems(newExpanded);
  };

  const getFilteredAuditRequests = () => {
    return withdrawalRequests.filter((request) => {
      // 검색어 필터
      const matchesSearch =
        auditSearchTerm === "" ||
        request.id.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
        request.initiator.toLowerCase().includes(auditSearchTerm.toLowerCase());

      // 상태 필터 - 명시적으로 처리
      const matchesStatus =
        auditStatusFilter === "all" || request.status === auditStatusFilter;

      // 날짜 필터
      let matchesDate = true;
      if (auditDateFilter !== "all") {
        const requestDate = new Date(request.initiatedAt);
        const now = new Date();
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        switch (auditDateFilter) {
          case "today":
            matchesDate = requestDate >= today;
            break;
          case "week":
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = requestDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(
              today.getTime() - 30 * 24 * 60 * 60 * 1000
            );
            matchesDate = requestDate >= monthAgo;
            break;
          case "quarter":
            const quarterAgo = new Date(
              today.getTime() - 90 * 24 * 60 * 60 * 1000
            );
            matchesDate = requestDate >= quarterAgo;
            break;
          default:
            matchesDate = true;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  };

  const getPaginatedAuditRequests = () => {
    const filtered = getFilteredAuditRequests();
    const startIndex = (auditCurrentPage - 1) * auditItemsPerPage;
    const endIndex = startIndex + auditItemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / auditItemsPerPage),
    };
  };

  const paginatedData = getPaginatedAuditRequests();

  // CSV 내보내기 핸들러
  const handleCsvExport = () => {
    const filteredRequests = getFilteredAuditRequests();
    exportWithdrawalAuditToCsv(filteredRequests);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              출금 감사 추적
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="신청 ID, 제목, 기안자 검색..."
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
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
                value={auditStatusFilter}
                onChange={(e) => setAuditStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 상태</option>
                <option value="submitted">결재 승인 대기</option>
                <option value="pending">출금 대기</option>
                <option value="processing">보안 검증</option>
                <option value="completed">출금 완료</option>
                <option value="rejected">반려</option>
                <option value="archived">처리 완료</option>
                <option value="stopped">출금 정지</option>
              </select>

              {/* 기간 필터 */}
              <select
                value={auditDateFilter}
                onChange={(e) => setAuditDateFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
                <option value="quarter">최근 3개월</option>
              </select>
              </div>
              {/* CSV 내보내기 버튼 */}
              <button
                onClick={handleCsvExport}
                className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>CSV 내보내기</span>
              </button>
            </div>
          </div>
        </div>

        {/* 데이터 표시 영역 */}
        <div className="p-6">
          {paginatedData.items.length === 0 ? (
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
              <div className="space-y-4">
                {paginatedData.items.map((request) => {
                  const isExpanded = expandedItems.has(request.id);

                  return (
                    <div
                      key={request.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      {/* 편안한 레이아웃 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500 font-medium">
                              #{request.id}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${
                                getStatusInfo(request.status).color
                              }`}
                            >
                              {getStatusInfo(request.status).name}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-1">
                            {request.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {request.initiator}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleItemExpanded(request.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
                        >
                          {isExpanded ? "접기" : "상세보기"}
                          <svg
                            className={`w-4 h-4 transition-transform ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* 중요 정보 - 자연스럽게 표시 */}
                      <div className="flex items-center gap-8 pt-2 border-t border-gray-100">
                        <div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatAmount(request.amount, request.currency)} {request.currency}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">출금 금액</div>
                        </div>
                        <div>
                          <div className="text-base font-semibold text-gray-900">
                            {formatDate(request.initiatedAt)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">신청 날짜</div>
                        </div>
                      </div>
                      {/* 상세보기 펼침/접힘 */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* 감사 추적 히스토리 */}
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">
                              감사 추적 히스토리
                            </h5>
                            <div className="space-y-2">
                              {request.auditTrail.map((entry, index) => {
                                const isApprovalAction =
                                  entry.action.endsWith("승인");
                                const isFutureAction =
                                  entry.action.endsWith("전");

                                return (
                                  <div
                                    key={index}
                                    className="flex items-start bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div
                                      className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${
                                        isFutureAction
                                          ? "bg-gray-400"
                                          : isApprovalAction
                                          ? "bg-sky-400"
                                          : "bg-blue-400"
                                      }`}
                                    ></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          {entry.action}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDateTime(entry.timestamp)}
                                        </p>
                                      </div>
                                      {!isApprovalAction &&
                                        entry.action !== "보안 검증 진행중" &&
                                        entry.action !== "보안 검증 완료" &&
                                        entry.action !== "블록체인 전송 완료" &&
                                        entry.action !== "출금 대기 진행중" && (
                                          <>
                                            {entry.details && (
                                              <p className="text-sm text-gray-600 mb-1">
                                                {entry.details}
                                              </p>
                                            )}
                                            {entry.userName && (
                                              <p className="text-xs text-gray-600">
                                                담당자: {request.initiator}
                                              </p>
                                            )}
                                          </>
                                        )}
                                    </div>
                                  </div>
                                );
                              })}

                              {/* 결재 승인 대기 상태일 때 대기중인 결재자들과 다음 단계 표시 */}
                              {request.status === "submitted" && (
                                <>
                                  {/* 대기중인 결재자들 */}
                                  {request.requiredApprovals
                                    .filter(
                                      (approver) =>
                                        !request.approvals.some(
                                          (approval) =>
                                            approval.userName === approver
                                        )
                                    )
                                    .map((pendingApprover, index) => (
                                      <div
                                        key={`pending-${index}`}
                                        className="flex items-start bg-gray-50 p-3 rounded-lg"
                                      >
                                        <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-yellow-400"></div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-medium text-gray-900">
                                              {pendingApprover} 결재 대기중
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}

                                  {/* 향후 단계들 */}
                                  <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-gray-400"></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          출금 대기 전
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-gray-400"></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          보안 검증 전
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-gray-400"></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          블록체인 전송 전
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* 출금 대기 상태일 때 다음 단계 표시 */}
                              {request.status === "pending" && (
                                <>
                                  <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-gray-400"></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          보안 검증 전
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-gray-400"></div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-medium text-gray-900">
                                          블록체인 전송 전
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* 보안 검증 상태일 때 블록체인 전송 전 표시 */}
                              {request.status === "processing" && (
                                <div className="flex items-start bg-gray-50 p-3 rounded-lg">
                                  <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 bg-gray-400"></div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        블록체인 전송 전
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 블록체인 상세 정보 */}
                          <BlockchainInfo request={request} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              {paginatedData.totalPages > 0 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                      총 {paginatedData.totalItems}개 중{" "}
                      {Math.min(
                        (auditCurrentPage - 1) * auditItemsPerPage + 1,
                        paginatedData.totalItems
                      )}
                      -
                      {Math.min(
                        auditCurrentPage * auditItemsPerPage,
                        paginatedData.totalItems
                      )}
                      개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setAuditCurrentPage(Math.max(1, auditCurrentPage - 1))
                        }
                        disabled={auditCurrentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>

                      {[...Array(paginatedData.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === auditCurrentPage;

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setAuditCurrentPage(pageNumber)}
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
                          setAuditCurrentPage(
                            Math.min(
                              paginatedData.totalPages,
                              auditCurrentPage + 1
                            )
                          )
                        }
                        disabled={auditCurrentPage === paginatedData.totalPages}
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
