"use client";

import { useState } from "react";
import { GroupAuditEntry, GroupAuditAction } from "@/types/groups";
import {
  getFilteredAuditEntries,
  auditActionConfig,
} from "@/data/groupAuditMockData";
import { exportGroupAuditToCsv } from "@/utils/groupAuditExport";

interface GroupAuditTabProps {}

export default function GroupAuditTab({}: GroupAuditTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<GroupAuditAction | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedItems(newExpanded);
  };

  const getFilteredAuditData = () => {
    let startDate: string | undefined;
    let endDate: string | undefined;

    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (dateFilter) {
        case "today":
          startDate = today.toISOString();
          break;
        case "week":
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          startDate = weekAgo.toISOString();
          break;
        case "month":
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          startDate = monthAgo.toISOString();
          break;
        case "quarter":
          const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
          startDate = quarterAgo.toISOString();
          break;
      }
    }

    return getFilteredAuditEntries({
      groupId: groupFilter === "all" ? undefined : groupFilter,
      action: actionFilter,
      startDate,
      endDate,
      searchTerm: searchTerm || undefined,
    });
  };

  const getPaginatedData = () => {
    const filtered = getFilteredAuditData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  };

  const formatDateTime = (timestamp: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(timestamp));
  };

  const formatChangeValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "없음";
    }

    if (typeof value === "object") {
      if (value.amount !== undefined && value.currency !== undefined) {
        return `${value.amount.toLocaleString()} ${value.currency}`;
      }
      return JSON.stringify(value);
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }

    return String(value);
  };

  const getActionConfig = (action: GroupAuditAction) => {
    return auditActionConfig[action];
  };

  const handleCsvExport = () => {
    const filteredEntries = getFilteredAuditData();
    exportGroupAuditToCsv(filteredEntries);
  };

  const paginatedData = getPaginatedData();

  // 고유한 그룹 ID 목록 가져오기
  const uniqueGroups = Array.from(
    new Set(getFilteredAuditEntries({}).map((entry) => entry.groupId))
  );

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              그룹 감사 추적
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 검색 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="그룹ID, 그룹명, 담당자 검색..."
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

                {/* 그룹 필터 */}
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">모든 그룹</option>
                  {uniqueGroups.map((groupId) => (
                    <option key={groupId} value={groupId}>
                      {groupId}
                    </option>
                  ))}
                </select>

                {/* 액션 필터 */}
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value as GroupAuditAction | "ALL")}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="ALL">모든 액션</option>
                  <option value="CREATE">생성</option>
                  <option value="APPROVE">승인</option>
                  <option value="REJECT">반려</option>
                  <option value="MODIFY">수정</option>
                  <option value="BUDGET_MODIFY">예산수정</option>
                  <option value="REAPPLY">재신청</option>
                  <option value="SUSPEND">정지</option>
                  <option value="ARCHIVE">아카이브</option>
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
                {paginatedData.items.map((entry) => {
                  const isExpanded = expandedItems.has(entry.id);
                  const actionConfig = getActionConfig(entry.action);

                  return (
                    <div
                      key={entry.id}
                      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      {/* 기본 정보 */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm text-gray-500 font-medium">
                              {entry.groupId}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded border ${actionConfig.color}`}
                            >
                              {actionConfig.name}
                            </span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-900 mb-1">
                            {entry.groupName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {entry.userName} • {entry.details}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleItemExpanded(entry.id)}
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

                      {/* 시간 정보 */}
                      <div className="flex items-center gap-8 pt-2 border-t border-gray-100">
                        <div>
                          <div className="text-base font-semibold text-gray-900">
                            {formatDate(entry.timestamp)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">처리 날짜</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">
                            {formatDateTime(entry.timestamp)}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">정확한 시간</div>
                        </div>
                      </div>

                      {/* 상세보기 펼침/접힘 */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* 변경 내용 */}
                          {entry.changes && entry.changes.length > 0 && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-900 mb-3">
                                변경 내용
                              </h5>
                              <div className="space-y-2">
                                {entry.changes.map((change, index) => (
                                  <div
                                    key={index}
                                    className="bg-gray-50 p-3 rounded-lg"
                                  >
                                    <div className="font-medium text-sm text-gray-700 mb-1">
                                      {change.field === "groupName" && "그룹명"}
                                      {change.field === "groupType" && "그룹유형"}
                                      {change.field === "monthlyBudget" && "월예산"}
                                      {change.field === "quarterlyBudget" && "분기예산"}
                                      {change.field === "yearlyBudget" && "연예산"}
                                      {change.field === "manager" && "관리자"}
                                      {change.field === "description" && "설명"}
                                      {!["groupName", "groupType", "monthlyBudget", "quarterlyBudget", "yearlyBudget", "manager", "description"].includes(change.field) && change.field}
                                    </div>
                                    {entry.action === "CREATE" ? (
                                      <div className="space-y-1">
                                        <div className="text-sky-600 font-medium text-xs">
                                          생성된 값:
                                        </div>
                                        <div className="bg-sky-50 p-2 rounded text-sm">
                                          {formatChangeValue(change.newValue)}
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <div>
                                          <div className="text-red-600 font-medium mb-1 text-xs">
                                            이전 값:
                                          </div>
                                          <div className="bg-red-50 p-2 rounded text-sm">
                                            {formatChangeValue(change.oldValue)}
                                          </div>
                                        </div>
                                        <div>
                                          <div className="text-sky-600 font-medium mb-1 text-xs">
                                            변경된 값:
                                          </div>
                                          <div className="bg-sky-50 p-2 rounded text-sm">
                                            {formatChangeValue(change.newValue)}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 메타데이터 */}
                          {entry.metadata && (
                            <div className="space-y-3">
                              {entry.metadata.reason && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                                    사유
                                  </h5>
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {entry.metadata.reason}
                                  </p>
                                </div>
                              )}
                              {entry.metadata.approvers && entry.metadata.approvers.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900 mb-2">
                                    승인자
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {entry.metadata.approvers.map((approver, index) => (
                                      <span
                                        key={index}
                                        className="px-2 py-1 bg-sky-100 text-sky-800 text-xs rounded-full"
                                      >
                                        {approver}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 페이지네이션 */}
              {paginatedData.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-center">
                    <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                      총 {paginatedData.totalItems}개 중{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        paginatedData.totalItems
                      )}
                      -
                      {Math.min(
                        currentPage * itemsPerPage,
                        paginatedData.totalItems
                      )}
                      개 표시
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        이전
                      </button>

                      {[...Array(paginatedData.totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        const isCurrentPage = pageNumber === currentPage;

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
                        onClick={() =>
                          setCurrentPage(
                            Math.min(paginatedData.totalPages, currentPage + 1)
                          )
                        }
                        disabled={currentPage === paginatedData.totalPages}
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