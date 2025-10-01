"use client";

import React, { useState, useEffect } from "react";
import {
  PolicyLog,
  PolicyLogFilter,
  PolicyLogSummary,
} from "@/types/policyLog";
import {
  getPolicyLogs,
  getFilteredPolicyLogs,
  getPolicyLogSummary,
  downloadLogsAsCSV,
} from "@/utils/policyLogUtils";
import { Modal } from "@/components/common/Modal";

interface PolicyLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
  policyId?: string;  // 특정 정책 ID (optional)
  policyDescription?: string;  // 정책 설명 (UI 표시용)
}

export default function PolicyLogViewer({
  isOpen,
  onClose,
  policyId,
  policyDescription,
}: PolicyLogViewerProps) {
  const [logs, setLogs] = useState<PolicyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<PolicyLog[]>([]);
  const [summary, setSummary] = useState<PolicyLogSummary | null>(null);
  const [filter, setFilter] = useState<PolicyLogFilter>({
    action: "ALL",
  });
  const [selectedLog, setSelectedLog] = useState<PolicyLog | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list");

  // 로그 데이터 로드
  useEffect(() => {
    if (isOpen) {
      let logsToShow: PolicyLog[];

      if (policyId) {
        // 특정 정책의 로그만 가져오기
        logsToShow = getFilteredPolicyLogs({ policyId });
      } else {
        // 전체 로그 가져오기
        logsToShow = getPolicyLogs();
      }

      setLogs(logsToShow);
      setFilteredLogs(logsToShow);
      setSummary(getPolicyLogSummary());
    }
  }, [isOpen, policyId]);

  // 필터 적용
  useEffect(() => {
    let filtered: PolicyLog[];

    if (policyId) {
      // 특정 정책의 로그에 추가 필터 적용
      filtered = getFilteredPolicyLogs({ ...filter, policyId });
    } else {
      // 전체 로그에 필터 적용
      filtered = getFilteredPolicyLogs(filter);
    }

    setFilteredLogs(filtered);
  }, [filter, logs, policyId]);

  const handleFilterChange = (field: keyof PolicyLogFilter, value: any) => {
    setFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExportCSV = () => {
    downloadLogsAsCSV(
      filteredLogs,
      `policy_logs_${new Date().toISOString().split("T")[0]}.csv`
    );
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getFieldDisplayName = (field: string) => {
    const fieldMap: { [key: string]: string } = {
      description: "정책 설명",
      minAmount: "최소 금액",
      maxAmount: "최대 금액",
      requiredApprovers: "필요 결재자",
      entire_policy: "전체 정책",
      status: "상태",
    };
    return fieldMap[field] || field;
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-blue-100 text-blue-800";
      case "UPDATE":
        return "bg-yellow-100 text-yellow-800";
      case "SUSPEND":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "CREATE":
        return "생성";
      case "UPDATE":
        return "수정";
      case "SUSPEND":
        return "정지";
      default:
        return action;
    }
  };

  const formatChangeValue = (value: any) => {
    if (value === null || value === undefined) {
      return "없음";
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return "없음";
      }
      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }

    if (typeof value === "number") {
      if (value === Infinity) {
        return "무제한";
      }
      return value.toLocaleString();
    }

    // 상태값을 한글로 변환
    const statusValue = String(value);
    if (statusValue === "ACTIVE") {
      return "활성";
    }
    if (statusValue === "SUSPENDED") {
      return "정지";
    }
    if (statusValue === "INACTIVE") {
      return "비활성";
    }

    return statusValue;
  };

  // 타임라인 뷰 렌더링
  const renderTimelineView = () => {
    if (filteredLogs.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          조건에 맞는 로그가 없습니다.
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="relative">
          {/* 타임라인 라인 */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* 타임라인 항목들 */}
          <div className="space-y-6">
            {filteredLogs.map((log, index) => (
              <div key={log.id} className="relative flex items-start">
                {/* 타임라인 점 */}
                <div className="flex-shrink-0 relative">
                  <div
                    className={`w-3 h-3 rounded-full border-2 border-white ${
                      log.action === "CREATE"
                        ? "bg-blue-500"
                        : log.action === "UPDATE"
                        ? "bg-yellow-500"
                        : log.action === "SUSPEND"
                        ? "bg-orange-500"
                        : "bg-gray-500"
                    }`}
                  ></div>
                  {index !== filteredLogs.length - 1 && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gray-200"></div>
                  )}
                </div>

                {/* 로그 내용 */}
                <div
                  className="ml-6 flex-1 bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {getActionText(log.action)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {log.policyDescription}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {log.userName}
                    </span>
                    {log.changes.length > 0 && (
                      <span className="text-xs text-gray-500">
                        변경:{" "}
                        {log.changes
                          .map((c) => getFieldDisplayName(c.field))
                          .join(", ")}
                      </span>
                    )}
                  </div>

                  {log.metadata.reason && (
                    <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      사유: {log.metadata.reason}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPolicyFields = (policyObject: any, title: string) => {
    if (!policyObject || typeof policyObject !== "object") {
      return null;
    }

    const fields = [
      { key: "description", label: "정책 설명" },
      { key: "minAmount", label: "최소 금액" },
      { key: "maxAmount", label: "최대 금액" },
      { key: "requiredApprovers", label: "필요 결재자" },
    ];

    return (
      <div className="space-y-2">
        <div className="font-medium text-sm text-gray-700 mb-2">{title}</div>
        {fields.map((field) => (
          <div key={field.key} className="bg-gray-50 p-3 rounded">
            <div className="font-medium text-sm text-gray-700 mb-1">
              {field.label}
            </div>
            <div className="text-sm">
              <span className="text-red-600">
                삭제된 값: {formatChangeValue(policyObject[field.key])}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-[60vw] max-w-none max-h-[90vh] overflow-hidden bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {policyId && policyDescription
                  ? `${policyDescription} 세부 이력`
                  : "정책 변경 이력"
                }
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {policyId
                  ? "해당 정책의 변경사항을 확인할 수 있습니다"
                  : "모든 정책 변경사항을 확인할 수 있습니다"
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {summary.totalLogs}
                    </div>
                    <div className="text-sm text-gray-600">전체 로그</div>
                  </div>
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-gray-600"
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
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {summary.createCount}
                    </div>
                    <div className="text-sm text-gray-600">생성</div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-yellow-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {summary.updateCount}
                    </div>
                    <div className="text-sm text-gray-600">수정</div>
                  </div>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {summary.suspendCount || 0}
                    </div>
                    <div className="text-sm text-gray-600">정지</div>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-orange-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-center">
            {/* 뷰 모드 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                보기
              </label>
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "list"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  목록
                </button>
                <button
                  onClick={() => setViewMode("timeline")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === "timeline"
                      ? "bg-primary-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  타임라인
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                액션
              </label>
              <select
                value={filter.action || "ALL"}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="ALL">전체</option>
                <option value="CREATE">생성</option>
                <option value="UPDATE">수정</option>
                <option value="SUSPEND">정지</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 날짜
              </label>
              <input
                type="date"
                value={filter.startDate || ""}
                onChange={(e) =>
                  handleFilterChange("startDate", e.target.value)
                }
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 날짜
              </label>
              <input
                type="date"
                value={filter.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="flex-1"></div>
            <button
              onClick={handleExportCSV}
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

        {/* Log Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-96 overflow-y-auto">
            {viewMode === "timeline" ? (
              renderTimelineView()
            ) : // 기존 목록 뷰
            filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                조건에 맞는 로그가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {getActionText(log.action)}
                        </span>
                        <span className="font-medium text-gray-900">
                          {log.policyDescription}
                        </span>
                        <span className="text-sm text-gray-500">
                          {log.userName}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                    {log.changes.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        변경:{" "}
                        {log.changes
                          .map((c) => getFieldDisplayName(c.field))
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Log Detail Modal */}
        {selectedLog && (
          <Modal isOpen={true} onClose={() => setSelectedLog(null)}>
            <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden bg-white rounded-xl shadow-xl">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    로그 상세 정보
                  </h3>
                  <button
                    onClick={() => setSelectedLog(null)}
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
              </div>
              <div className="p-6 overflow-y-auto max-h-96">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        액션:
                      </span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getActionBadgeColor(
                          selectedLog.action
                        )}`}
                      >
                        {getActionText(selectedLog.action)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        시간:
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {formatTimestamp(selectedLog.timestamp)}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        정책:
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedLog.policyDescription}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        수정자:
                      </span>
                      <span className="ml-2 text-sm text-gray-600">
                        {selectedLog.userName}
                      </span>
                    </div>
                  </div>

                  {selectedLog.metadata.reason && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        사유:
                      </span>
                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {selectedLog.metadata.reason}
                      </p>
                    </div>
                  )}

                  {selectedLog.changes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        변경 내용:
                      </span>
                      <div className="mt-2 space-y-2">
                        {selectedLog.changes.map((change, index) => (
                          <div key={index}>
                            <div className="bg-gray-50 p-3 rounded">
                              <div className="font-medium text-sm text-gray-700 mb-1">
                                {getFieldDisplayName(change.field)}
                              </div>
                              <div className="text-sm">
                                {selectedLog.action === "CREATE" ? (
                                  // 생성 시에는 이후 값만 표시
                                  <div className="space-y-1">
                                    <div className="text-green-600 font-medium">
                                      생성된 값:
                                    </div>
                                    <div className="bg-green-50 p-2 rounded">
                                      {formatChangeValue(change.newValue)}
                                    </div>
                                  </div>
                                ) : selectedLog.action === "SUSPEND" ? (
                                  // 정지 시에는 정지 상태 표시
                                  <div className="space-y-1">
                                    <div className="text-orange-600 font-medium">
                                      정지됨
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded">
                                      {change.field === "status" ? (
                                        <div>
                                          <div className="text-sm text-gray-600 mb-1">
                                            상태 변경:
                                          </div>
                                          <div className="text-orange-700">
                                            {formatChangeValue(change.oldValue)}{" "}
                                            →{" "}
                                            {formatChangeValue(change.newValue)}
                                          </div>
                                        </div>
                                      ) : (
                                        <div>
                                          정지 사유:{" "}
                                          {selectedLog.metadata.reason ||
                                            "사유 없음"}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  // 수정 시에는 이전/이후 값 모두 표시
                                  <div className="space-y-2">
                                    <div>
                                      <div className="text-red-600 font-medium mb-1">
                                        이전 값:
                                      </div>
                                      <div className="bg-red-50 p-2 rounded">
                                        {formatChangeValue(change.oldValue)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-green-600 font-medium mb-1">
                                        변경된 값:
                                      </div>
                                      <div className="bg-green-50 p-2 rounded">
                                        {formatChangeValue(change.newValue)}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Modal>
  );
}
