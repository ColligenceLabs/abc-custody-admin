"use client";

import { useState, useEffect } from "react";
import { Download, ChevronDown, ChevronRight, User, FileText, Globe, AlertCircle, FileDown, Search, X } from "lucide-react";
import {
  getActionLabel,
  getResourceLabel,
  getResultLabel,
  getRoleLabel,
  formatDateTime,
  formatRelativeTime,
  parseUserAgent,
  truncateDynamic,
  getFieldLabel,
  ACTION_OPTIONS,
  RESOURCE_OPTIONS,
  RESULT_OPTIONS,
} from "@/utils/auditLogFormatters";
import { useToast } from "@/hooks/use-toast";

export default function AdminAuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
    startDate: "",
    endDate: "",
    action: "",
    resource: "",
    result: "",
    search: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      // 필터 파라미터 추가 (값이 있는 경우에만)
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.action) params.append("action", filters.action);
      if (filters.resource) params.append("resource", filters.resource);
      if (filters.result) params.append("result", filters.result);
      if (filters.search) params.append("userId", filters.search);

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        }/api/reports/admin-audit-logs?${params}`,
        {
          credentials: 'include', // 쿠키 기반 인증
          headers: {
            'X-Request-Source': 'admin', // 관리자 요청임을 명시
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('관리자 감사 로그 데이터:', result.data);
        setLogs(result.data);
      } else {
        console.error("관리자 감사 로그 조회 실패:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("에러 상세:", errorData);

        if (response.status === 403) {
          toast({
            variant: "destructive",
            description: "관리자 감사 로그는 시스템 관리자만 조회할 수 있습니다."
          });
        }
      }
    } catch (error) {
      console.error("관리자 감사 로그 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        }/api/reports/admin-audit-logs/export`,
        {
          credentials: 'include', // 쿠키 기반 인증
          headers: {
            'X-Request-Source': 'admin', // 관리자 요청임을 명시
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `admin_audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({ description: "CSV 파일이 다운로드되었습니다." });
      } else {
        console.error("내보내기 실패:", response.status, response.statusText);
        toast({ variant: "destructive", description: "CSV 내보내기에 실패했습니다." });
      }
    } catch (error) {
      console.error("내보내기 오류:", error);
      toast({ variant: "destructive", description: "CSV 내보내기 중 오류가 발생했습니다." });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // 필터 변경 시 첫 페이지로 이동
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 100,
      startDate: "",
      endDate: "",
      action: "",
      resource: "",
      result: "",
      search: "",
    });
  };

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.action ||
    filters.resource ||
    filters.result ||
    filters.search;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">관리자 감사 로그</h1>
          <p className="mt-1 text-gray-600">
            슈퍼관리자의 모든 활동 및 시스템 변경 이력
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          CSV 내보내기
        </button>
      </div>

      {/* 필터 섹션 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">필터</h2>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              초기화
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 시작 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 날짜
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* 종료 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 날짜
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* 작업 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              작업 유형
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {ACTION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 리소스 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              리소스
            </label>
            <select
              value={filters.resource}
              onChange={(e) => handleFilterChange("resource", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {RESOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 결과 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              결과
            </label>
            <select
              value={filters.result}
              onChange={(e) => handleFilterChange("result", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">전체</option>
              <option value="success">성공</option>
              <option value="failure">실패</option>
            </select>
          </div>

          {/* 사용자 ID 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              관리자 ID 검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="관리자 ID로 검색..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 로그 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">로딩 중...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <AlertCircle className="w-12 h-12 mb-4 text-gray-400" />
              <p>감사 로그가 없습니다.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-4 py-3"></th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    시간
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리자
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    리소스
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    결과
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP 주소
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log: any) => (
                  <>
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => toggleRow(log.id)}
                    >
                      <td className="px-4 py-3 text-center">
                        {expandedRows.has(log.id) ? (
                          <ChevronDown className="w-4 h-4 text-gray-500 mx-auto" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500 mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div>{formatRelativeTime(log.timestamp)}</div>
                        <div className="text-xs text-gray-400">
                          {formatDateTime(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {log.userId}
                            </div>
                            {log.userRole && (
                              <div className="text-xs text-gray-500">
                                {getRoleLabel(log.userRole)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getActionLabel(log.action, log.details)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {getResourceLabel(log.resource)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.result === "success"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.result === "success" ? "성공" : "실패"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.ipAddress || "-"}
                      </td>
                    </tr>

                    {/* 확장된 상세 정보 */}
                    {expandedRows.has(log.id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="space-y-4 text-sm">
                            {/* 기본 정보 섹션 */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  관리자 정보
                                </h4>
                                <div className="pl-6 space-y-1 text-gray-600">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">ID:</span>
                                    <span className="text-gray-900 font-mono">
                                      {log.userId}
                                    </span>
                                  </div>
                                  {log.userRole && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">역할:</span>
                                      <span className="text-gray-900">
                                        {getRoleLabel(log.userRole)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <Globe className="w-4 h-4" />
                                  접속 정보
                                </h4>
                                <div className="pl-6 space-y-1 text-gray-600">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">IP 주소:</span>
                                    <span className="text-gray-900 font-mono text-xs">
                                      {log.ipAddress || "-"}
                                    </span>
                                  </div>
                                  {log.userAgent && (
                                    <>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">브라우저:</span>
                                        <span className="text-gray-900">
                                          {parseUserAgent(log.userAgent).browser}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">OS:</span>
                                        <span className="text-gray-900">
                                          {parseUserAgent(log.userAgent).os}
                                        </span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* 작업 정보 */}
                            {log.resourceId && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  작업 정보
                                </h4>
                                <div className="pl-6 space-y-1 text-gray-600">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">리소스 ID:</span>
                                    <span className="text-gray-900 font-mono text-xs">
                                      {truncateDynamic(log.resourceId, 50)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 상세 정보 */}
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900">
                                  상세 정보
                                </h4>
                                <div className="pl-6">
                                  <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-x-auto">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
