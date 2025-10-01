import { useState } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { WalletGroup, ExpenseRequest } from "@/types/groups";
import { mockGroups, mockExpenses } from "@/data/groupMockData";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  getStatusColor,
  getStatusName,
  formatDate,
} from "@/utils/groupsUtils";

interface ApprovalCompletedProps {
  // props 정의 (필요한 경우 추가)
}

// 가상자산 아이콘 컴포넌트
const getCryptoIcon = (currency: string) => {
  return (
    <img 
      src={getCryptoIconUrl(currency as any)} 
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        // 이미지 로드 실패시 폴백
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

// 지출 상태 아이콘 매핑
const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return (
        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "rejected":
      return (
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "pending":
      return (
        <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    default:
      return <ExclamationCircleIcon className="h-5 w-5 text-gray-600" />;
  }
};

export default function ApprovalCompleted({}: ApprovalCompletedProps) {
  // 승인 완료 탭용 페이지네이션 및 필터 state
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const [completedItemsPerPage] = useState(10);
  const [completedSearchTerm, setCompletedSearchTerm] = useState("");
  const [completedDateRange, setCompletedDateRange] = useState<"all" | "7days" | "30days" | "90days">("all");

  // 승인 완료 탭 필터링 및 페이지네이션 로직
  const getFilteredCompletedExpenses = () => {
    let filtered = mockExpenses.filter(expense => expense.status === 'approved');
    
    // 검색 필터
    if (completedSearchTerm) {
      const searchLower = completedSearchTerm.toLowerCase();
      filtered = filtered.filter(expense => 
        expense.title.toLowerCase().includes(searchLower) ||
        expense.description.toLowerCase().includes(searchLower) ||
        expense.requestedBy.toLowerCase().includes(searchLower)
      );
    }
    
    // 날짜 필터
    if (completedDateRange !== 'all') {
      const now = new Date();
      const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
      const days = daysMap[completedDateRange];
      const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.approvedAt || expense.requestedAt);
        return expenseDate >= cutoffDate;
      });
    }
    
    return filtered;
  };

  const getPaginatedCompletedExpenses = () => {
    const filtered = getFilteredCompletedExpenses();
    const startIndex = (completedCurrentPage - 1) * completedItemsPerPage;
    const endIndex = startIndex + completedItemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / completedItemsPerPage)
    };
  };

  const paginatedData = getPaginatedCompletedExpenses();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
            처리 완료된 지출
          </h3>
          
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 검색 */}
            <div className="relative">
              <input
                type="text"
                placeholder="제목, 설명, 요청자 검색..."
                value={completedSearchTerm}
                onChange={(e) => setCompletedSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            
            {/* 기간 필터 */}
            <select
              value={completedDateRange}
              onChange={(e) => setCompletedDateRange(e.target.value as "all" | "7days" | "30days" | "90days")}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
          총 {paginatedData.totalItems}건의 결과 {paginatedData.totalPages > 0 ? `(${completedCurrentPage} / ${paginatedData.totalPages} 페이지)` : ''}
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
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  처리 정보
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.items.length > 0 ? paginatedData.items.map((expense) => {
                const group = mockGroups.find(
                  (g) => g.id === expense.groupId
                );
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
                        <p className="text-xs text-gray-400">
                          요청일: {formatDate(expense.requestedAt)}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(expense.status)}
                        <span
                          className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getStatusColor(
                            expense.status
                          )}`}
                        >
                          {getStatusName(expense.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.status === 'approved' ? (
                        <div className="text-sm">
                          <p className="text-gray-900">승인: {expense.approvedBy}</p>
                          <p className="text-xs text-gray-500">
                            {expense.approvedAt && formatDate(expense.approvedAt)}
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p className="text-red-600 font-medium">반려 사유</p>
                          <p className="text-xs text-gray-500">
                            {expense.rejectedReason}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center">
                      <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">검색 결과가 없습니다.</p>
                      <p className="text-sm text-gray-400">다른 검색어나 필터를 시도해보세요.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {paginatedData.totalItems > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              {(completedCurrentPage - 1) * completedItemsPerPage + 1}
              -
              {Math.min(completedCurrentPage * completedItemsPerPage, paginatedData.totalItems)}
              개 항목 중 {paginatedData.totalItems}개
            </div>
            
            {paginatedData.totalPages > 0 && (
              <div className="flex items-center space-x-2">
                {/* 이전 페이지 */}
                <button
                  onClick={() => setCompletedCurrentPage(Math.max(1, completedCurrentPage - 1))}
                  disabled={completedCurrentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>
                
                {/* 페이지 번호 */}
                {Array.from({ length: Math.min(5, paginatedData.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    paginatedData.totalPages - 4,
                    completedCurrentPage - 2
                  )) + i;
                  
                  if (pageNum > paginatedData.totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCompletedCurrentPage(pageNum)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        completedCurrentPage === pageNum
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
                  onClick={() => setCompletedCurrentPage(Math.min(paginatedData.totalPages, completedCurrentPage + 1))}
                  disabled={completedCurrentPage === paginatedData.totalPages}
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
  );
}