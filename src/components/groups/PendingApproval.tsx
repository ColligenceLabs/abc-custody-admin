import { ClockIcon, XCircleIcon, XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import { WalletGroup, ExpenseRequest } from "@/types/groups";
import { mockGroups, mockExpenses } from "@/data/groupMockData";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  formatDate,
} from "@/utils/groupsUtils";
import { useState } from "react";

interface PendingApprovalProps {
  onApproveExpense?: (expenseId: string) => void;
  onRejectExpense?: (expenseId: string, reason: string) => void;
  onReapproveExpense?: (expenseId: string) => void;
}

const getCryptoIcon = (currency: string) => {
  return (
    <img
      src={getCryptoIconUrl(currency as any)}
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold';
        fallback.textContent = currency[0];
        target.parentNode?.replaceChild(fallback, target);
      }}
    />
  );
};

export default function PendingApproval(props: PendingApprovalProps) {
  const { onApproveExpense, onRejectExpense, onReapproveExpense } = props;
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRequest | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<"all" | "7days" | "30days" | "90days">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "rejected">("all");

  const handleApproveExpense = (expenseId: string) => {
    console.log("Approving expense:", expenseId);
    if (onApproveExpense) {
      onApproveExpense(expenseId);
    }
  };

  const handleRejectExpense = (expenseId: string, reason: string) => {
    console.log("Rejecting expense:", expenseId, "Reason:", reason);
    if (onRejectExpense) {
      onRejectExpense(expenseId, reason);
    }
  };

  const handleReapproveExpense = (expenseId: string) => {
    console.log("Re-approving expense:", expenseId);
    if (onReapproveExpense) {
      onReapproveExpense(expenseId);
    }
    alert("재승인 처리되어 승인 대기 상태로 변경되었습니다.");
  };

  // 필터링 및 페이지네이션 로직
  const getFilteredExpenses = () => {
    let filtered = mockExpenses.filter(
      expense => expense.status === 'pending' || expense.status === 'rejected'
    );

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    // 검색 필터
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower) ||
        expense.requestedBy.toLowerCase().includes(searchLower)
      );
    }

    // 날짜 필터
    if (dateRange !== 'all') {
      const now = new Date();
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const days = daysMap[dateRange];
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));

      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.requestedAt);
        return expenseDate >= cutoffDate;
      });
    }

    return filtered;
  };

  const getPaginatedExpenses = () => {
    const filtered = getFilteredExpenses();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage)
    };
  };

  const paginatedData = getPaginatedExpenses();

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              승인 대기 중인 지출
            </h3>

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="제목, 설명, 요청자 검색..."
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
                onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "rejected")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 상태</option>
                <option value="pending">승인 대기</option>
                <option value="rejected">반려됨</option>
              </select>

              {/* 기간 필터 */}
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as "all" | "7days" | "30days" | "90days")}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 기간</option>
                <option value="7days">최근 7일</option>
                <option value="30days">최근 30일</option>
                <option value="90days">최근 90일</option>
              </select>
            </div>
          </div>

          {/* 결과 요약 */}
          <div className="mb-4 text-sm text-gray-600">
            총 {paginatedData.totalItems}건의 결과 {paginatedData.totalPages > 0 ? `(${currentPage} / ${paginatedData.totalPages} 페이지)` : ''}
          </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      요청 내용
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      그룹
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      금액
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
                  {paginatedData.items.map((expense) => {
                    const group = mockGroups.find((g) => g.id === expense.groupId);
                    return (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {expense.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {expense.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {group?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getCryptoIcon(expense.amount.currency)}
                            <span className="font-semibold text-gray-900">
                              {formatCryptoAmount(expense.amount)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.requestedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(expense.requestedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {expense.status === 'pending' ? (
                            <div className="flex items-center space-x-2">
                              <ClockIcon className="h-4 w-4" />
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                승인 대기
                              </span>
                            </div>
                          ) : (
                            <div>
                              <div className="flex items-center space-x-2">
                                <XCircleIcon className="h-4 w-4" />
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  반려됨
                                </span>
                              </div>
                              {expense.rejectedReason && (
                                <p className="text-xs text-red-600 mt-1">
                                  {expense.rejectedReason}
                                </p>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedExpense(expense)}
                              className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                            >
                              상세보기
                            </button>
                            <div className="h-4 w-px bg-gray-300"></div>
                            {expense.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveExpense(expense.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                                >
                                  승인
                                </button>
                                <button
                                  onClick={() => handleRejectExpense(expense.id, "검토 필요")}
                                  className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                                >
                                  반려
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleReapproveExpense(expense.id)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              >
                                재승인 처리
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {paginatedData.items.length === 0 && (
                <div className="text-center py-12">
                  <ClockIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium text-gray-900">검색 결과가 없습니다</p>
                  <p className="text-sm text-gray-500 mt-1">다른 검색어나 필터 조건을 시도해보세요.</p>
                </div>
              )}
            </div>

            {/* 페이지네이션 */}
            {paginatedData.totalItems > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {(currentPage - 1) * itemsPerPage + 1}
                  -
                  {Math.min(currentPage * itemsPerPage, paginatedData.totalItems)}
                  개 항목 중 {paginatedData.totalItems}개
                </div>

                {paginatedData.totalPages > 0 && (
                  <div className="flex items-center space-x-2">
                    {/* 이전 페이지 */}
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>

                    {/* 페이지 번호 */}
                    {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        paginatedData.totalPages - 4,
                        currentPage - 2
                      )) + i;

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
                    })}

                    {/* 다음 페이지 */}
                    <button
                      onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, currentPage + 1))}
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

      {selectedExpense && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          {/* 헤더 */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        selectedExpense.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedExpense.status === 'pending' ? '승인 대기' : '반려됨'}
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {selectedExpense.title} 승인 요청
                  </h4>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpense(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 왼쪽: 지출 요약 */}
              <div className="lg:col-span-1">
                <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  지출 요약
                </h5>
                <div className="space-y-4">
                  {/* 금액 정보 - 강화된 표시 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {getCryptoIcon(selectedExpense.amount.currency)}
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {formatCryptoAmount(selectedExpense.amount)}
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {selectedExpense.amount.currency}
                      </div>
                      <div className="text-lg font-semibold text-primary-600">
                        ₩{selectedExpense.amount.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* 상세 설명 카드 */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <DocumentTextIcon className="w-4 h-4 mr-2 text-gray-500" />
                      지출 상세 설명
                    </h6>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedExpense.description}
                    </p>
                  </div>

                  {/* 기본 정보 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">신청시간</span>
                      <span className="font-medium">
                        {formatDate(selectedExpense.requestedAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">기안자</span>
                      <span className="font-medium">
                        {selectedExpense.requestedBy}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">카테고리</span>
                      <span className="font-medium">
                        {selectedExpense.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">그룹</span>
                      <span className="font-medium">
                        {mockGroups.find(g => g.id === selectedExpense.groupId)?.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 결재 정보 */}
              <div className="lg:col-span-2">
                <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  결재 정보
                </h5>
                <div className="space-y-4">
                  {/* 필수 결재자 승인 현황 */}
                  {selectedExpense.requiredApprovals && selectedExpense.requiredApprovals.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h6 className="text-sm font-medium text-gray-700 mb-3">
                        필수 결재자 승인 현황
                      </h6>
                      <div className="space-y-2">
                        {selectedExpense.requiredApprovals.map((approver, index) => {
                          const approval = selectedExpense.approvals?.find(a => a.userName === approver);
                          const rejection = selectedExpense.rejections?.find(r => r.userName === approver);

                          const getApprovalState = () => {
                            if (approval) {
                              return {
                                status: "approved" as const,
                                statusText: "승인 완료",
                                statusTime: formatDate(approval.approvedAt),
                                icon: (
                                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                  </svg>
                                ),
                                textColor: 'text-green-700'
                              };
                            } else if (rejection) {
                              return {
                                status: "rejected" as const,
                                statusText: "반려",
                                statusTime: formatDate(rejection.rejectedAt),
                                icon: (
                                  <svg className="h-5 w-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                ),
                                textColor: 'text-red-700'
                              };
                            } else {
                              return {
                                status: "waiting" as const,
                                statusText: "승인 대기",
                                statusTime: null,
                                icon: (
                                  <svg className="h-5 w-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8M12 8v8" />
                                  </svg>
                                ),
                                textColor: 'text-gray-500'
                              };
                            }
                          };

                          const state = getApprovalState();

                          return (
                            <div key={approver} className="flex items-center justify-between p-3 bg-white rounded border">
                              <div className="flex items-center">
                                <div className="flex items-center">
                                  {state.icon}
                                  <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2">{index + 1}.</span>
                                    <span className="text-sm text-gray-900 font-medium">{approver}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={`text-sm font-medium ${state.textColor}`}>
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
                        })}
                      </div>

                      {/* 진행률 표시 */}
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            승인 진행률: {selectedExpense.approvals?.length || 0}/{selectedExpense.requiredApprovals.length}
                            {selectedExpense.rejections && selectedExpense.rejections.length > 0 && ` (반려 ${selectedExpense.rejections.length}건)`}
                          </span>
                          <span className={`font-medium ${
                            selectedExpense.status === 'rejected'
                              ? 'text-red-600'
                              : (selectedExpense.approvals?.length || 0) === selectedExpense.requiredApprovals.length
                                ? 'text-green-600'
                                : 'text-blue-600'
                          }`}>
                            {selectedExpense.status === 'rejected'
                              ? '반려됨'
                              : (selectedExpense.approvals?.length || 0) === selectedExpense.requiredApprovals.length
                                ? '결재완료'
                                : '결재진행중'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 반려 사유 상세 (반려된 경우) */}
                  {selectedExpense.status === 'rejected' && selectedExpense.rejectedReason && (
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
                      <div className="bg-white p-3 rounded border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            반려 사유
                          </span>
                          <span className="text-xs text-gray-500">
                            {selectedExpense.rejectedAt ? formatDate(selectedExpense.rejectedAt) : formatDate(selectedExpense.requestedAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mb-2">
                          {selectedExpense.rejectedReason}
                        </p>
                        <div className="text-xs text-gray-500">
                          반려자: {selectedExpense.rejectedBy || selectedExpense.approvedBy || '관리자'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex justify-end space-x-3">
                    {selectedExpense.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            handleApproveExpense(selectedExpense.id);
                            setSelectedExpense(null);
                          }}
                          className="px-6 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => {
                            handleRejectExpense(selectedExpense.id, "검토 필요");
                            setSelectedExpense(null);
                          }}
                          className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          반려
                        </button>
                      </>
                    )}
                    {selectedExpense.status === 'rejected' && (
                      <button
                        onClick={() => {
                          handleReapproveExpense(selectedExpense.id);
                          setSelectedExpense(null);
                        }}
                        className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        재승인 처리
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}