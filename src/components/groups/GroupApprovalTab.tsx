import { useState } from "react";
import {
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import { GroupCreationRequest } from "@/types/groups";
import { Modal } from "@/components/common/Modal";
import { mockGroupRequests } from "@/data/groupMockData";
import { MOCK_USERS } from "@/data/userMockData";
import {
  getCryptoIconUrl,
  formatCryptoAmount,
  getTypeColor,
  getTypeName,
  formatDate,
} from "@/utils/groupsUtils";
import GroupApprovalAuthModal from "./GroupApprovalAuthModal";

// User ID로 사용자 이름 가져오기
const getUserNameById = (userId: string): string => {
  const user = MOCK_USERS.find(u => u.id === userId);
  return user ? user.name : userId; // ID를 찾지 못하면 ID 자체를 반환
};

interface GroupApprovalTabProps {
  groupRequests?: GroupCreationRequest[];
  onApproveRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string, reason: string) => void;
  onReapproveRequest?: (requestId: string) => void;
}

const getCryptoIcon = (currency: string) => {
  return (
    <img
      src={getCryptoIconUrl(currency as any)}
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const fallback = document.createElement("div");
        fallback.className =
          "w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold";
        fallback.textContent = currency[0];
        target.parentNode?.replaceChild(fallback, target);
      }}
    />
  );
};

const formatCryptoAmountWithIcon = (cryptoAmount: any) => {
  return (
    <div className="flex items-center space-x-2">
      {getCryptoIcon(cryptoAmount.currency)}
      <span>{formatCryptoAmount(cryptoAmount)}</span>
    </div>
  );
};

export default function GroupApprovalTab(props: GroupApprovalTabProps) {
  const { groupRequests, onApproveRequest, onRejectRequest, onReapproveRequest } = props;

  // props로 받은 데이터를 우선 사용하고, 없으면 mock 데이터 사용
  const requests = groupRequests || mockGroupRequests;

  const [selectedRequest, setSelectedRequest] =
    useState<GroupCreationRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null
  );

  // 승인/반려 팝업 상태
  const [showApprovalModal, setShowApprovalModal] = useState<{
    show: boolean;
    requestId: string | null;
    action: "approve" | "reject" | null;
  }>({ show: false, requestId: null, action: null });

  // 인증 모달 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingApprovalRequest, setPendingApprovalRequest] = useState<
    string | null
  >(null);

  const handleApproveRequest = (requestId: string) => {
    setShowApprovalModal({ show: true, requestId, action: "approve" });
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    console.log("Rejecting group request:", requestId, "Reason:", reason);
    if (onRejectRequest) {
      onRejectRequest(requestId, reason);
    }
    setShowRejectModal(false);
    setRejectReason("");
    setRejectingRequestId(null);
    alert("그룹 생성 요청이 반려되었습니다.");
  };

  const handleReapproveRequest = (requestId: string) => {
    console.log("Re-approving group request:", requestId);
    if (onReapproveRequest) {
      onReapproveRequest(requestId);
    }
    alert("그룹 생성 요청이 재승인 처리되어 승인 대기 상태로 변경되었습니다.");
  };

  const openRejectModal = (requestId: string) => {
    setRejectingRequestId(requestId);
    setShowRejectModal(true);
  };

  // 승인/반려 확인
  const confirmApproval = () => {
    if (!showApprovalModal.requestId || !showApprovalModal.action) return;

    if (showApprovalModal.action === "approve") {
      // 승인 시 인증 모달 표시
      setPendingApprovalRequest(showApprovalModal.requestId);
      setShowApprovalModal({ show: false, requestId: null, action: null });
      setShowAuthModal(true);
    } else if (showApprovalModal.action === "reject") {
      // 반려 처리 (기존 로직 사용)
      openRejectModal(showApprovalModal.requestId);
      setShowApprovalModal({ show: false, requestId: null, action: null });
    }
  };

  // 팝업 닫기
  const closeApprovalModal = () => {
    setShowApprovalModal({ show: false, requestId: null, action: null });
  };

  // 인증 완료 처리
  const handleAuthComplete = (sessionId: string) => {
    if (!pendingApprovalRequest) return;

    console.log(
      `Group request ${pendingApprovalRequest} approved with auth session ${sessionId}`
    );

    if (onApproveRequest) {
      onApproveRequest(pendingApprovalRequest);
    }

    alert("관리자 인증이 완료되어 그룹 생성 요청이 승인되었습니다.");

    // 상태 초기화
    setShowAuthModal(false);
    setPendingApprovalRequest(null);
  };

  // 인증 실패 처리
  const handleAuthFailed = (reason: string) => {
    alert(`관리자 인증에 실패했습니다: ${reason}`);
    setShowAuthModal(false);
    setPendingApprovalRequest(null);
  };

  // 인증 모달 닫기
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPendingApprovalRequest(null);
  };

  // 필터링 및 페이지네이션 로직
  const getFilteredRequests = () => {
    // 반려 및 아카이브된 항목 제외 (pending, approved만 표시)
    let filtered = requests.filter(
      (request) => request.status === "pending" || request.status === "approved"
    );

    // 상태 필터
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // 검색 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.name.toLowerCase().includes(searchLower) ||
          request.description.toLowerCase().includes(searchLower) ||
          getUserNameById(request.requestedBy).toLowerCase().includes(searchLower) ||
          getUserNameById(request.manager).toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const getPaginatedRequests = () => {
    const filtered = getFilteredRequests();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const paginatedData = getPaginatedRequests();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
              승인 대기
            </span>
          </div>
        );
      case "approved":
        return (
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-4 w-4" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              승인 완료
            </span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center space-x-2">
            <XCircleIcon className="h-4 w-4" />
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              반려됨
            </span>
          </div>
        );
      default:
        return null;
    }
  };

  const getApprovalState = (
    approver: string,
    request: GroupCreationRequest,
    index: number
  ) => {
    const approval = request.approvals.find((a) => a.userName === approver);
    const rejection = request.rejections.find((r) => r.userName === approver);

    // 순차적 결재 로직: 이전 결재자들이 모두 승인했는지 확인
    const previousApprovers = request.requiredApprovals.slice(0, index);
    const allPreviousApproved = previousApprovers.every((prevApprover) =>
      request.approvals.some((a) => a.userName === prevApprover)
    );

    // 이전 결재자가 반려했는지 확인
    const anyPreviousRejected = previousApprovers.some((prevApprover) =>
      request.rejections.some((r) => r.userName === prevApprover)
    );

    if (approval) {
      return {
        status: "approved",
        statusText: "승인 완료",
        statusTime: formatDate(approval.approvedAt),
        iconColor: "text-green-500",
        textColor: "text-green-700",
      };
    } else if (rejection) {
      return {
        status: "rejected",
        statusText: "반려",
        statusTime: formatDate(rejection.rejectedAt),
        iconColor: "text-red-500",
        textColor: "text-red-700",
      };
    } else if (anyPreviousRejected) {
      return {
        status: "blocked",
        statusText: "승인 대기 (반려로 인해 미진행)",
        statusTime: null,
        iconColor: "text-gray-400",
        textColor: "text-gray-500",
      };
    } else if (!allPreviousApproved) {
      return {
        status: "waiting",
        statusText: "승인 대기 (순서 대기)",
        statusTime: null,
        iconColor: "text-gray-400",
        textColor: "text-gray-500",
      };
    } else {
      return {
        status: "ready",
        statusText: "승인 대기 (검토 가능)",
        statusTime: null,
        iconColor: "text-yellow-500",
        textColor: "text-yellow-700",
      };
    }
  };

  const getStatusIcon = (status: string, iconColor: string) => {
    const iconProps = `h-5 w-5 ${iconColor} mr-3`;

    switch (status) {
      case "approved":
        return (
          <svg
            className={iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
            />
          </svg>
        );
      case "rejected":
        return (
          <svg
            className={iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "ready":
        return (
          <svg
            className={iconProps}
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
        );
      default:
        return (
          <svg
            className={iconProps}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h8M12 8v8"
            />
          </svg>
        );
    }
  };

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              그룹 생성 승인 요청
            </h3>

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="그룹명, 설명, 요청자 검색..."
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
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "all"
                      | "pending"
                      | "approved"
                      | "rejected"
                  )
                }
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 상태</option>
                <option value="pending">승인 대기</option>
                <option value="approved">승인 완료</option>
                <option value="rejected">반려됨</option>
              </select>
            </div>
          </div>

          {/* 결과 요약 */}
          <div className="mb-4 text-sm text-gray-600">
            총 {paginatedData.totalItems}건의 결과{" "}
            {paginatedData.totalPages > 0
              ? `(${currentPage} / ${paginatedData.totalPages} 페이지)`
              : ""}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    그룹 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예산 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    요청일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.items.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">
                            {request.name}
                          </p>
                          <span
                            className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(
                              request.type
                            )}`}
                          >
                            {getTypeName(request.type)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          관리자: {getUserNameById(request.manager)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {request.budgetSetup?.baseType === "yearly" &&
                          request.yearlyBudget.amount > 0 && (
                            <>
                              <span className="text-gray-500">연간:</span>{" "}
                              {formatCryptoAmountWithIcon(request.yearlyBudget)}
                            </>
                          )}
                        {request.budgetSetup?.baseType === "quarterly" &&
                          request.quarterlyBudget.amount > 0 && (
                            <>
                              <span className="text-gray-500">분기:</span>{" "}
                              {formatCryptoAmountWithIcon(
                                request.quarterlyBudget
                              )}
                            </>
                          )}
                        {request.budgetSetup?.baseType === "monthly" && (
                          <>
                            <span className="text-gray-500">월간:</span>{" "}
                            {formatCryptoAmountWithIcon(request.monthlyBudget)}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getUserNameById(request.requestedBy)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          상세보기
                        </button>
                        <div className="h-4 w-px bg-gray-300"></div>
                        {request.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(request.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                            >
                              승인
                            </button>
                            <button
                              onClick={() => openRejectModal(request.id)}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                            >
                              반려
                            </button>
                          </>
                        )}
                        {request.status === "rejected" && (
                          <button
                            onClick={() => handleReapproveRequest(request.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                          >
                            재승인 처리
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginatedData.items.length === 0 && (
              <div className="text-center py-12">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-900">
                  검색 결과가 없습니다
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  다른 검색어나 필터 조건을 시도해보세요.
                </p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          {paginatedData.totalItems > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, paginatedData.totalItems)}
                개 항목 중 {paginatedData.totalItems}개
              </div>

              {paginatedData.totalPages > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>

                  {Array.from(
                    { length: Math.min(5, paginatedData.totalPages) },
                    (_, i) => {
                      const pageNum =
                        Math.max(
                          1,
                          Math.min(
                            paginatedData.totalPages - 4,
                            currentPage - 2
                          )
                        ) + i;

                      if (pageNum > paginatedData.totalPages) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === pageNum
                              ? "bg-primary-600 text-white"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(paginatedData.totalPages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === paginatedData.totalPages}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 상세보기 모달 */}
      {selectedRequest && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          {/* 헤더 */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedRequest.name} 생성 요청
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 왼쪽: 그룹 정보 */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  그룹 정보
                </h5>
                <div className="space-y-4">
                  {/* 기본 정보 */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          그룹명
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedRequest.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          유형
                        </span>
                        <div className="mt-1">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
                              selectedRequest.type
                            )}`}
                          >
                            {getTypeName(selectedRequest.type)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          관리자
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {getUserNameById(selectedRequest.manager)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          기준 년도
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedRequest.budgetSetup?.year || "미설정"}년
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          요청일
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {formatDate(selectedRequest.requestedAt)}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          기준 통화
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedRequest.budgetSetup?.currency || "미설정"}
                        </p>
                      </div>
                    </div>

                    {/* 그룹 설명 */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        그룹 설명
                      </span>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                        {selectedRequest.description}
                      </p>
                    </div>
                  </div>

                  {/* 예산 설정 정보 */}
                  {selectedRequest.budgetSetup && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        예산 설정 상세
                      </h5>
                      <div className="bg-white border border-gray-200 rounded-lg p-5">
                        {/* 예산 기준 정보 */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-800">
                              {selectedRequest.budgetSetup.baseType === "yearly"
                                ? "연간 기준"
                                : selectedRequest.budgetSetup.baseType ===
                                  "quarterly"
                                ? "분기 기준"
                                : "월간 기준"}{" "}
                              예산
                            </span>
                            <span className="text-lg font-bold text-gray-900">
                              {selectedRequest.budgetSetup.baseAmount.toLocaleString()}{" "}
                              {selectedRequest.budgetSetup.currency}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            기간: {selectedRequest.budgetSetup.startDate} ~{" "}
                            {selectedRequest.budgetSetup.endDate}
                          </div>
                        </div>

                        {/* 분기별 예산 (연간인 경우) */}
                        {selectedRequest.budgetSetup.baseType === "yearly" &&
                          selectedRequest.budgetSetup.quarterlyBudgets.length >
                            0 && (
                            <div className="mb-4">
                              <div className="text-xs font-medium text-gray-700 mb-2 block">
                                분기별 분배
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {selectedRequest.budgetSetup.quarterlyBudgets.map(
                                  (qb) => (
                                    <div
                                      key={qb.quarter}
                                      className="bg-gray-50 border border-gray-200 rounded p-3"
                                    >
                                      <div className="text-xs text-gray-500">
                                        {qb.quarter}분기
                                      </div>
                                      <div className="text-sm font-semibold text-gray-900">
                                        {qb.amount.toLocaleString()}{" "}
                                        {selectedRequest.budgetSetup!.currency}
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* 월별 예산 */}
                        <div>
                          <div className="text-xs font-medium text-gray-700 mb-2 block">
                            월별 분배
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {selectedRequest.budgetSetup.monthlyBudgets.map(
                              (mb) => (
                                <div
                                  key={mb.month}
                                  className="bg-gray-50 border border-gray-200 rounded p-3"
                                >
                                  <div className="text-xs text-gray-500">
                                    {mb.month}월
                                  </div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {mb.amount.toLocaleString()}{" "}
                                    {selectedRequest.budgetSetup!.currency}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 오른쪽: 결재 정보 */}
              <div>
                <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  결재 정보
                </h5>
                <div className="space-y-4">
                  {/* 결재자별 상세 현황 */}
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h6 className="text-sm font-medium text-gray-700 mb-3">
                      필수 결재자 승인 현황
                    </h6>
                    <div className="space-y-3 mb-4">
                      {selectedRequest.requiredApprovals.map(
                        (approver, index) => {
                          const state = getApprovalState(
                            approver,
                            selectedRequest,
                            index
                          );

                          return (
                            <div
                              key={approver}
                              className="flex items-center justify-between p-3 bg-white rounded border"
                            >
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {getStatusIcon(state.status, state.iconColor)}
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">
                                      {index + 1}.
                                    </span>
                                    <span className="text-sm text-gray-900 font-medium">
                                      {getUserNameById(approver)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`text-sm font-medium ${state.textColor}`}
                                >
                                  {state.statusText}
                                </span>
                                {state.statusTime && (
                                  <div className="text-xs text-gray-500">
                                    {state.statusTime}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* 진행률 요약 */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          승인 진행률: {selectedRequest.approvals.length}/
                          {selectedRequest.requiredApprovals.length}
                          {selectedRequest.rejections.length > 0 &&
                            ` (반려 ${selectedRequest.rejections.length}건)`}
                        </span>
                        <span
                          className={`font-medium ${
                            selectedRequest.status === "rejected"
                              ? "text-red-600"
                              : selectedRequest.status === "approved"
                              ? "text-green-600"
                              : "text-blue-600"
                          }`}
                        >
                          {selectedRequest.status === "rejected"
                            ? "반려됨"
                            : selectedRequest.status === "approved"
                            ? "승인 완료"
                            : "진행 중"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 반려 사유 상세 (반려된 경우) */}
                  {selectedRequest.status === "rejected" &&
                    selectedRequest.rejectedReason && (
                      <div className="bg-white border border-red-200 rounded-lg p-5">
                        <h6 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2 text-red-600"
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
                          반려 사유
                        </h6>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-red-900">
                              반려자
                            </span>
                            <span className="text-xs text-red-700">
                              {selectedRequest.rejectedAt
                                ? formatDate(selectedRequest.rejectedAt)
                                : formatDate(selectedRequest.requestedAt)}
                            </span>
                          </div>
                          <div className="mb-3">
                            <span className="text-sm font-medium text-red-900">
                              {selectedRequest.rejections[0]?.userName ||
                                "관리자"}
                            </span>
                          </div>
                          <div className="bg-white border border-red-200 rounded p-3">
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {selectedRequest.rejectedReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* 액션 버튼 */}
                  {(selectedRequest.status === "pending" ||
                    selectedRequest.status === "rejected") && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      {selectedRequest.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              handleApproveRequest(selectedRequest.id);
                              setSelectedRequest(null);
                            }}
                            className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => {
                              openRejectModal(selectedRequest.id);
                              setSelectedRequest(null);
                            }}
                            className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                          >
                            반려
                          </button>
                        </>
                      )}
                      {selectedRequest.status === "rejected" && (
                        <button
                          onClick={() => {
                            handleReapproveRequest(selectedRequest.id);
                            setSelectedRequest(null);
                          }}
                          className="flex items-center px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          재승인 처리
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 반려 사유 입력 모달 */}
      <Modal isOpen={showRejectModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              반려 사유 입력
            </h3>
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
                setRejectingRequestId(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                반려 사유 *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="반려 사유를 입력하세요"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectingRequestId(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (rejectingRequestId && rejectReason.trim()) {
                    handleRejectRequest(
                      rejectingRequestId,
                      rejectReason.trim()
                    );
                  }
                }}
                disabled={!rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                반려
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 승인 확인 모달 */}
      <Modal isOpen={showApprovalModal.show}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {showApprovalModal.action === "approve"
                  ? "승인 확인"
                  : "반려 확인"}
              </h3>
              <button
                onClick={closeApprovalModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
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

            {(() => {
              const request = requests.find(
                (r) => r.id === showApprovalModal.requestId
              );
              if (!request) return null;

              const getBudgetDisplay = () => {
                if (
                  request.budgetSetup?.baseType === "yearly" &&
                  request.yearlyBudget.amount > 0
                ) {
                  return `연간: ${formatCryptoAmount(request.yearlyBudget)}`;
                } else if (
                  request.budgetSetup?.baseType === "quarterly" &&
                  request.quarterlyBudget.amount > 0
                ) {
                  return `분기: ${formatCryptoAmount(request.quarterlyBudget)}`;
                } else {
                  return `월간: ${formatCryptoAmount(request.monthlyBudget)}`;
                }
              };

              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {request.name} 그룹 생성
                    </h4>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">요청 ID:</span>
                        <span className="ml-1 font-medium">#{request.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">요청자:</span>
                        <span className="ml-1 font-medium">
                          {getUserNameById(request.requestedBy)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">관리자:</span>
                        <span className="ml-1 font-medium">
                          {getUserNameById(request.manager)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">예산:</span>
                        <span className="ml-1 font-medium">
                          {getBudgetDisplay()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {showApprovalModal.action === "approve" ? (
                    <div>
                      <p className="text-gray-700 mb-4">
                        위 그룹 생성 요청을{" "}
                        <span className="font-semibold text-green-600">
                          승인
                        </span>
                        하시겠습니까?
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                              승인 후 처리 과정
                            </p>
                            <p>
                              승인 완료 시 자동으로 그룹이 생성되고 설정된
                              예산이 할당됩니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-4">
                        위 그룹 생성 요청을{" "}
                        <span className="font-semibold text-red-600">반려</span>
                        하시겠습니까?
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={closeApprovalModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={confirmApproval}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${
                        showApprovalModal.action === "approve"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {showApprovalModal.action === "approve"
                        ? "승인하기"
                        : "반려하기"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </Modal>

      {/* 관리자 인증 모달 */}
      <GroupApprovalAuthModal
        isOpen={showAuthModal}
        request={
          pendingApprovalRequest
            ? requests.find((r) => r.id === pendingApprovalRequest) ||
              null
            : null
        }
        onClose={closeAuthModal}
        onAuthComplete={handleAuthComplete}
        onAuthFailed={handleAuthFailed}
      />
    </div>
  );
}
