import { useState } from "react";
import { GroupCreationRequest } from "@/types/groups";
import { getTypeColor, getTypeName, formatDate, getCryptoIconUrl, formatCryptoAmount } from "@/utils/groupsUtils";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";

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
        target.parentNode?.insertBefore(fallback, target);
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

interface RejectedManagementTabProps {
  groupRequests: GroupCreationRequest[];
  onReapprovalRequest: (requestId: string) => void;
  onArchive: (requestId: string) => void;
}


const getStatusIcon = (status: string) => {
  switch (status) {
    case "rejected":
      return <XCircleIcon className="h-4 w-4 text-red-600" />;
    case "archived":
      return <CheckCircleIcon className="h-4 w-4 text-gray-600" />;
    default:
      return <ExclamationCircleIcon className="h-4 w-4 text-gray-600" />;
  }
};

const getStatusInfo = (status: string) => {
  switch (status) {
    case "rejected":
      return { name: "반려", color: "bg-red-100 text-red-800" };
    case "archived":
      return { name: "처리완료", color: "bg-gray-100 text-gray-800" };
    default:
      return { name: "알 수 없음", color: "bg-gray-100 text-gray-800" };
  }
};

const formatCryptoAmountForDetail = (amount: number, currency: string) => {
  const decimals = currency === 'BTC' ? 4 : currency === 'ETH' ? 2 : 0;
  return amount.toFixed(decimals).replace(/\.?0+$/, '');
};

export default function RejectedManagementTab({
  groupRequests,
  onReapprovalRequest,
  onArchive
}: RejectedManagementTabProps) {
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 반려/보류 필터링 로직
  const getFilteredRequests = () => {
    return groupRequests.filter((request) => {
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
        request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description.toLowerCase().includes(searchTerm.toLowerCase());

      // 기간 필터
      let dateMatch = true;
      if (dateFilter !== "all") {
        const requestDate = new Date(request.requestedAt);
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
                  placeholder="요청 ID, 그룹명, 요청자, 관리자 검색..."
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
                    {paginatedData.items.map((request) => {
                      const statusInfo = getStatusInfo(request.status);

                      return (
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
                                관리자: {request.manager}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {request.budgetSetup?.baseType === "quarterly" &&
                                request.quarterlyBudget && request.quarterlyBudget.amount > 0 ? (
                                  <>
                                    <span className="text-gray-500">분기:</span>{" "}
                                    {formatCryptoAmountWithIcon(request.quarterlyBudget)}
                                  </>
                                ) : request.budgetSetup?.baseType === "monthly" &&
                                  request.monthlyBudget ? (
                                  <>
                                    <span className="text-gray-500">월간:</span>{" "}
                                    {formatCryptoAmountWithIcon(request.monthlyBudget)}
                                  </>
                                ) : request.yearlyBudget ? (
                                  <>
                                    <span className="text-gray-500">연간:</span>{" "}
                                    {formatCryptoAmountWithIcon(request.yearlyBudget)}
                                  </>
                                ) : null}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.requestedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.requestedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(request.status)}
                              <span
                                className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                              >
                                {statusInfo.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setSelectedRequest(
                                  selectedRequest === request.id ? null : request.id
                                )}
                                className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                              >
                                상세보기
                              </button>

                              {request.status === "rejected" && (
                                <>
                                  <div className="h-4 w-px bg-gray-300"></div>
                                  <button
                                    onClick={() => onReapprovalRequest(request.id)}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                  >
                                    재승인 요청
                                  </button>
                                  <button
                                    onClick={() => onArchive(request.id)}
                                    className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                                  >
                                    처리완료
                                  </button>
                                </>
                              )}

                              {request.status === "archived" && (
                                <>
                                  <div className="h-4 w-px bg-gray-300"></div>
                                  <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded cursor-not-allowed">
                                    처리완료
                                  </span>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
            const request = groupRequests.find(
              (r) => r.id === selectedRequest
            );
            if (!request) return null;

            const statusInfo = getStatusInfo(request.status);

            return (
              <div>
                {/* 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}
                          >
                            {statusInfo.name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {request.name} 상세 정보
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
                    {/* 그룹 요약 */}
                    <div className="lg:col-span-1">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        그룹 요청 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {request.name}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {getTypeName(request.type)}
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                              관리자: {request.manager}
                            </div>
                          </div>
                        </div>

                        {/* 상세 설명 */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            그룹 설명
                          </h6>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {request.description}
                          </p>
                        </div>

                        {/* 예산 정보 */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h6 className="text-sm font-medium text-gray-700 mb-3">예산 정보</h6>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">월간 예산</span>
                              <span className="font-medium">
                                {formatCryptoAmountForDetail(request.monthlyBudget.amount, request.monthlyBudget.currency)} {request.monthlyBudget.currency}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">분기 예산</span>
                              <span className="font-medium">
                                {formatCryptoAmountForDetail(request.quarterlyBudget.amount, request.quarterlyBudget.currency)} {request.quarterlyBudget.currency}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">연간 예산</span>
                              <span className="font-medium">
                                {formatCryptoAmountForDetail(request.yearlyBudget.amount, request.yearlyBudget.currency)} {request.yearlyBudget.currency}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">신청 시간</span>
                            <span className="font-medium">
                              {formatDate(request.requestedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">요청자</span>
                            <span className="font-medium">
                              {request.requestedBy}
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
                        {/* 승인 상태 */}
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-700">승인 진행 상황</span>
                            <span className="text-xs text-gray-500">
                              {request.approvals.length + request.rejections.length}/{request.requiredApprovals.length} 완료
                            </span>
                          </div>

                          <div className="space-y-3">
                            {request.requiredApprovals.map((approvalUser, index) => {
                              const approval = request.approvals.find(a => a.userName === approvalUser);
                              const rejection = request.rejections.find(r => r.userName === approvalUser);

                              return (
                                <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                                  <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                      {approval ? (
                                        <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                      ) : rejection ? (
                                        <XCircleIcon className="h-5 w-5 text-red-600" />
                                      ) : (
                                        <ClockIcon className="h-5 w-5 text-gray-400" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        {approvalUser}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {approval ? `${formatDate(approval.approvedAt)}에 승인` :
                                         rejection ? `${formatDate(rejection.rejectedAt)}에 반려` :
                                         "승인 대기 중"}
                                      </p>
                                    </div>
                                  </div>
                                  <div>
                                    {approval && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        승인
                                      </span>
                                    )}
                                    {rejection && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        반려
                                      </span>
                                    )}
                                    {!approval && !rejection && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                        대기
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 반려 사유 상세 */}
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
                                        {formatDate(rejection.rejectedAt)}
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
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}