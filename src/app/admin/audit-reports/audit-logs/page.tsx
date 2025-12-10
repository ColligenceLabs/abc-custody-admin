"use client";

import { useState, useEffect } from "react";
import { Download, ChevronDown, ChevronRight, User, FileText, Globe, AlertCircle, FileDown, Search, X } from "lucide-react";
import {
  getActionLabel,
  getResourceLabel,
  getResultLabel,
  getRoleLabel,
  getMemberTypeLabel,
  getStatusLabel,
  formatDateTime,
  formatRelativeTime,
  parseUserAgent,
  truncateDynamic,
  getFieldLabel,
  ACTION_OPTIONS,
  RESOURCE_OPTIONS,
  RESULT_OPTIONS,
} from "@/utils/auditLogFormatters";
import { generateAdminAuditLogPDF, AdminAuditLog } from "@/utils/adminAuditLogPdfGenerator";
import { useToast } from "@/hooks/use-toast";

export default function AuditLogsPage() {
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
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/audit-logs?${params}`,
        {
          credentials: 'include', // 쿠키 기반 인증
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('감사 로그 데이터:', result.data);
        setLogs(result.data);
      } else {
        console.error("감사 로그 조회 실패:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("에러 상세:", errorData);
      }
    } catch (error) {
      console.error("감사 로그 조회 오류:", error);
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
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/audit-logs/export`,
        {
          credentials: 'include', // 쿠키 기반 인증
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
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

  const handleDownloadPDF = async (log: any) => {
    try {
      await generateAdminAuditLogPDF(log as AdminAuditLog);
      toast({ description: "PDF 파일이 다운로드되었습니다." });
    } catch (error) {
      console.error('PDF 다운로드 실패:', error);
      toast({
        variant: "destructive",
        description: "PDF 다운로드에 실패했습니다."
      });
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
          <h1 className="text-3xl font-bold text-gray-900">감사 로그</h1>
          <p className="mt-1 text-gray-600">
            모든 사용자 활동 및 시스템 변경 이력
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

          {/* 리소스 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              리소스 유형
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
              {RESULT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 사용자/조직 검색 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              사용자/조직 검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="사용자 ID 또는 조직명"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase w-10">

                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  날짜
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  사용자
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  작업
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  리소스
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  결과
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log: any) => {
                const isExpanded = expandedRows.has(log.id);
                return (
                  <>
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRow(log.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-gray-600">
                        {log.id}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(log.createdAt).toLocaleString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          {log.userRole && log.userName?.includes('@') ? (
                            <span>{getRoleLabel(log.userRole)}</span>
                          ) : (
                            <span>{log.userName || log.userId}</span>
                          )}
                        </div>
                        {log.memberType === 'corporate' && log.organizationName && (
                          <span className="text-gray-500 text-xs">({log.organizationName})</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">{getActionLabel(log.action, log.details)}</td>
                      <td className="px-4 py-3 text-sm">{getResourceLabel(log.resource)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            log.result === "SUCCESS"
                              ? "bg-sky-50 text-sky-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {getResultLabel(log.result)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {log.ipAddress}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-details`} className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          {/* PDF 다운로드 버튼 */}
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={() => handleDownloadPDF(log)}
                              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
                            >
                              <FileDown className="w-4 h-4" />
                              PDF 다운로드
                            </button>
                          </div>
                          {(() => {
                            const userAgentInfo = parseUserAgent(log.userAgent);
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 기본 정보 */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <User className="w-4 h-4 text-sky-600" />
                                    기본 정보
                                  </div>
                                  <div className="pl-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">작업자:</span>
                                      <span className="text-gray-900 font-medium">
                                        {log.userId === 'anonymous' && log.details?.targetUser?.name
                                          ? log.details.targetUser.name
                                          : log.userRole && log.userName?.includes('@')
                                          ? getRoleLabel(log.userRole)
                                          : log.userName || log.userId}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">작업 시간:</span>
                                      <span className="text-gray-900 font-medium">
                                        {formatDateTime(log.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600"></span>
                                      <span className="text-gray-500 text-xs">
                                        {formatRelativeTime(log.createdAt)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">ID:</span>
                                      <span className="text-gray-900 font-mono text-xs">
                                        {log.id}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 작업 내용 */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <FileText className="w-4 h-4 text-sky-600" />
                                    작업 내용
                                  </div>
                                  <div className="pl-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">작업:</span>
                                      <span className="text-gray-900 font-medium">
                                        {getActionLabel(log.action, log.details)}
                                      </span>
                                    </div>
                                    {!["login", "logout", "first_login"].includes(log.action) && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">대상:</span>
                                        <span className="text-gray-900 font-medium">
                                          {getResourceLabel(log.resource)}
                                        </span>
                                      </div>
                                    )}
                                    {log.details?.targetUser?.roleChange?.previousRole &&
                                      log.details?.targetUser?.roleChange?.newRole && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">역할 변경:</span>
                                          <span className="text-gray-900 font-medium">
                                            {getRoleLabel(log.details.targetUser.roleChange.previousRole)}
                                            {" → "}
                                            {getRoleLabel(log.details.targetUser.roleChange.newRole)}
                                          </span>
                                        </div>
                                      )}
                                    {(log.result === "FAILED" || log.errorMessage) && (
                                      <div className="flex justify-between">
                                        <span className="text-gray-600">결과:</span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${
                                          log.result === "SUCCESS"
                                            ? "bg-sky-50 text-sky-600"
                                            : "bg-red-50 text-red-600"
                                        }`}>
                                          {getResultLabel(log.result)}
                                        </span>
                                      </div>
                                    )}
                                    {log.errorMessage && (
                                      <div className="mt-2">
                                        <span className="text-gray-600 block mb-1">오류 메시지:</span>
                                        <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                                          {log.errorMessage}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* 접속 정보 */}
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                    <Globe className="w-4 h-4 text-sky-600" />
                                    접속 정보
                                  </div>
                                  <div className="pl-6 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">IP 주소:</span>
                                      <span className="text-gray-900 font-mono text-xs">
                                        {log.ipAddress || "-"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">브라우저:</span>
                                      <span className="text-gray-900 text-xs">
                                        {log.userId === "system" ? "-" : userAgentInfo.browser}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">디바이스:</span>
                                      <span className="text-gray-900 text-xs">
                                        {log.userId === "system" ? "-" : userAgentInfo.os}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 상세 내역 */}
                                {log.details && Object.keys(log.details).length > 0 && (
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                      <AlertCircle className="w-4 h-4 text-sky-600" />
                                      상세 내역
                                    </div>
                                    <div className="pl-6 space-y-2 text-sm">
                                      {/* 로그인 관련 정보 */}
                                      {log.details.email && ["login", "first_login"].includes(log.action) && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">이메일:</span>
                                          <span className="text-gray-900">{log.details.email}</span>
                                        </div>
                                      )}
                                      {log.details.gaSetupCompleted && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">GA 설정:</span>
                                          <span className="text-gray-900">완료</span>
                                        </div>
                                      )}
                                      {(log.details.loginMethods || log.details.loginMethod) && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">인증 방법:</span>
                                          <span className="text-gray-900">
                                            {log.details.loginMethods
                                              ? Array.isArray(log.details.loginMethods)
                                                ? log.details.loginMethods
                                                    .map((method: string) => {
                                                      if (method === "sms_pin") return "SMS PIN";
                                                      if (method === "google_otp") return "Google 인증";
                                                      if (method === "password") return "비밀번호";
                                                      return method;
                                                    })
                                                    .join(" + ")
                                                : log.details.loginMethods
                                              : log.details.loginMethod === "google_otp"
                                              ? "SMS PIN + Google 인증"
                                              : log.details.loginMethod === "password"
                                              ? "비밀번호"
                                              : log.details.loginMethod}
                                          </span>
                                        </div>
                                      )}
                                      {log.details.sessionCount !== undefined && (
                                        <div className="flex justify-between">
                                          <span className="text-gray-600">종료된 세션:</span>
                                          <span className="text-gray-900">{log.details.sessionCount}개</span>
                                        </div>
                                      )}

                                      {/* 역할 변경 정보 */}
                                      {log.details.targetUser?.roleChange && (
                                        <>
                                          {log.details.targetUser.roleChange.previousRole &&
                                            log.details.targetUser.roleChange.newRole && (
                                              <div className="flex justify-between">
                                                <span className="text-gray-600">역할 변경:</span>
                                                <span className="text-gray-900">
                                                  {getRoleLabel(log.details.targetUser.roleChange.previousRole)}
                                                  {" → "}
                                                  {getRoleLabel(log.details.targetUser.roleChange.newRole)}
                                                </span>
                                              </div>
                                            )}
                                        </>
                                      )}

                                      {/* 필드 변경 정보 */}
                                      {log.details.targetUser?.fieldChanges &&
                                        Object.keys(log.details.targetUser.fieldChanges).length > 0 && (
                                          <div className="mt-3 pt-3 border-t border-gray-200">
                                            <div className="text-xs font-semibold text-gray-700 mb-2">
                                              변경된 필드
                                            </div>
                                            {Object.entries(log.details.targetUser.fieldChanges).map(
                                              ([field, change]: [string, any]) => (
                                                <div key={field} className="flex justify-between text-xs mb-1">
                                                  <span className="text-gray-600">{getFieldLabel(field)}:</span>
                                                  <span className="text-gray-900">
                                                    <span className="text-red-600 line-through">{change.before || "-"}</span>
                                                    {" → "}
                                                    <span className="text-sky-600 font-medium">{change.after || "-"}</span>
                                                  </span>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        )}

                                      {/* 출금 관련 정보 */}
                                      {log.resource === "withdrawals" && log.details && (
                                        <>
                                          {(log.details.amount || log.details.body?.amount) && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">금액:</span>
                                              <span className="text-gray-900 font-medium">
                                                {parseFloat(log.details.amount || log.details.body?.amount)}{" "}
                                                {log.details.currency || log.details.asset || log.details.body?.currency}
                                              </span>
                                            </div>
                                          )}
                                          {(log.details.krwAmount || log.details.body?.krwAmount) && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">KRW 환산:</span>
                                              <span className="text-gray-900">
                                                ₩{parseFloat(log.details.krwAmount || log.details.body?.krwAmount).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
                                              </span>
                                            </div>
                                          )}
                                          {(log.details.status || log.details.body?.status) && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">상태:</span>
                                              <span className="text-gray-900">
                                                {getStatusLabel(log.details.status || log.details.body?.status)}
                                              </span>
                                            </div>
                                          )}
                                          {(log.details.toAddress || log.details.body?.toAddress) && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">출금 주소:</span>
                                              <span className="text-gray-900 font-mono text-xs">
                                                {truncateDynamic(log.details.toAddress || log.details.body?.toAddress, 50)}
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* 입금 관련 정보 */}
                                      {log.resource === "deposits" && (
                                        <>
                                          {log.details.amount && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">금액:</span>
                                              <span className="text-gray-900 font-medium">
                                                {parseFloat(log.details.amount)} {log.details.asset}
                                              </span>
                                            </div>
                                          )}
                                          {log.details.krwAmount && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">KRW 환산:</span>
                                              <span className="text-gray-900">
                                                ₩{parseFloat(log.details.krwAmount).toLocaleString("ko-KR", { maximumFractionDigits: 0 })}
                                              </span>
                                            </div>
                                          )}
                                          {log.details.status && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">상태:</span>
                                              <span className="text-gray-900">{getStatusLabel(log.details.status)}</span>
                                            </div>
                                          )}
                                          {log.details.txHash && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">트랜잭션:</span>
                                              <span className="text-gray-900 font-mono text-xs">
                                                {truncateDynamic(log.details.txHash, 50)}
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* 입금 환불 관련 정보 */}
                                      {(log.resource === "depositReturns" || log.resource === "deposit-returns") && log.details?.changes && (
                                        <div className="mt-3">
                                          <div className="text-xs font-semibold text-gray-700 mb-2">환불 상세 내역</div>
                                          {log.details.changes.map((change: string, idx: number) => (
                                            <div key={idx} className="text-xs text-gray-600 mb-1">
                                              {idx === 0 ? (
                                                <div className="font-semibold text-gray-800 mb-1">{change}</div>
                                              ) : (
                                                <div className="ml-2">- {change}</div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* 사용자 생성/수정 관련 정보 */}
                                      {log.resource !== "groups" && log.details.body && (
                                        <>
                                          {log.details.body.name && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">사용자명:</span>
                                              <span className="text-gray-900">{log.details.body.name}</span>
                                            </div>
                                          )}
                                          {log.details.body.email && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">이메일:</span>
                                              <span className="text-gray-900">{log.details.body.email}</span>
                                            </div>
                                          )}
                                          {log.details.body.role && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">역할:</span>
                                              <span className="text-gray-900">{getRoleLabel(log.details.body.role)}</span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* 그룹 관련 정보 */}
                                      {log.resource === "groups" && (
                                        <>
                                          {log.details.groupName && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">그룹명:</span>
                                              <span className="text-gray-900 font-medium">{log.details.groupName}</span>
                                            </div>
                                          )}
                                          {log.details.approverName && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">승인자:</span>
                                              <span className="text-gray-900">{log.details.approverName}</span>
                                            </div>
                                          )}
                                          {log.details.approvalProgress && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">승인 진행:</span>
                                              <span className="text-gray-900">{log.details.approvalProgress}</span>
                                            </div>
                                          )}
                                          {log.details.oldStatus && log.details.newStatus && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">상태 변경:</span>
                                              <span className="text-gray-900">
                                                <span className="text-red-600 line-through">{getStatusLabel(log.details.oldStatus)}</span>
                                                {" → "}
                                                <span className="text-sky-600 font-medium">{getStatusLabel(log.details.newStatus)}</span>
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* 주소 관련 정보 */}
                                      {log.resource === "addresses" && log.details?.body && (
                                        <>
                                          {log.details.body.address && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">주소:</span>
                                              <span className="text-gray-900 font-mono text-xs">
                                                {truncateDynamic(log.details.body.address, 50)}
                                              </span>
                                            </div>
                                          )}
                                          {log.details.body.coin && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">자산:</span>
                                              <span className="text-gray-900">{log.details.body.coin}</span>
                                            </div>
                                          )}
                                          {log.details.body.coin && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">네트워크:</span>
                                              <span className="text-gray-900">
                                                {log.details.body.coin === 'BTC' ? 'Bitcoin' :
                                                 log.details.body.coin === 'ETH' ? 'Ethereum (ERC20)' :
                                                 log.details.body.coin === 'USDT' ? 'Ethereum (ERC20)' :
                                                 log.details.body.coin === 'USDC' ? 'Ethereum (ERC20)' :
                                                 log.details.body.coin === 'SOL' ? 'Solana' :
                                                 log.details.body.coin}
                                              </span>
                                            </div>
                                          )}
                                          {log.details.body.permissions && (
                                            <div className="flex justify-between">
                                              <span className="text-gray-600">권한:</span>
                                              <span className="text-gray-900 text-xs">
                                                {log.details.body.permissions.canDeposit && "입금 가능"}
                                                {log.details.body.permissions.canDeposit && log.details.body.permissions.canWithdraw && " / "}
                                                {log.details.body.permissions.canWithdraw && "출금 가능"}
                                              </span>
                                            </div>
                                          )}
                                        </>
                                      )}

                                      {/* 회사 설정 관련 정보 */}
                                      {log.resource === "company" && log.details?.changes && (
                                        <div className="mt-3">
                                          <div className="text-xs font-semibold text-gray-700 mb-2">변경 내역</div>
                                          {log.details.changes.map((change: string, idx: number) => (
                                            <div key={idx} className="text-xs text-gray-600 mb-1">
                                              - {change}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* 토큰 설정 관련 정보 */}
                                      {log.resource === "supportedTokens" && log.details?.changes && (
                                        <div className="mt-3">
                                          <div className="text-xs font-semibold text-gray-700 mb-2">변경 내역</div>
                                          {log.details.changes.map((change: string, idx: number) => (
                                            <div key={idx} className="text-xs text-gray-600 mb-1">
                                              - {change}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* IP 화이트리스트 관련 정보 */}
                                      {log.resource === "ip-whitelist" && (
                                        <>
                                          {/* CREATE 작업 */}
                                          {log.action === "create" && log.details?.body && (
                                            <>
                                              {log.details.body.ipRange && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">IP 대역:</span>
                                                  <span className="text-gray-900 font-mono text-xs">{log.details.body.ipRange}</span>
                                                </div>
                                              )}
                                              {log.details.body.type && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">유형:</span>
                                                  <span className="text-gray-900">
                                                    {log.details.body.type === 'single' ? '단일 IP' :
                                                     log.details.body.type === 'range' ? 'IP 범위' :
                                                     log.details.body.type === 'cidr' ? 'CIDR 표기' :
                                                     log.details.body.type}
                                                  </span>
                                                </div>
                                              )}
                                              {log.details.body.description && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">설명:</span>
                                                  <span className="text-gray-900">{log.details.body.description}</span>
                                                </div>
                                              )}
                                            </>
                                          )}

                                          {/* UPDATE 작업 (toggle) */}
                                          {log.action === "update" && log.details?.changes && (
                                            <>
                                              {log.details.changes.ipInfo?.ipRange && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">IP 대역:</span>
                                                  <span className="text-gray-900 font-mono text-xs">{log.details.changes.ipInfo.ipRange}</span>
                                                </div>
                                              )}
                                              {log.details.changes.ipInfo?.type && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">유형:</span>
                                                  <span className="text-gray-900">
                                                    {log.details.changes.ipInfo.type === 'single' ? '단일 IP' :
                                                     log.details.changes.ipInfo.type === 'range' ? 'IP 범위' :
                                                     log.details.changes.ipInfo.type === 'cidr' ? 'CIDR 표기' :
                                                     log.details.changes.ipInfo.type}
                                                  </span>
                                                </div>
                                              )}
                                              {log.details.changes.ipInfo?.description && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">설명:</span>
                                                  <span className="text-gray-900">{log.details.changes.ipInfo.description}</span>
                                                </div>
                                              )}
                                              {log.details.changes.statusChange && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">상태 변경:</span>
                                                  <span className="text-gray-900">
                                                    <span className="text-red-600 line-through">{log.details.changes.statusChange.before}</span>
                                                    {" → "}
                                                    <span className="text-sky-600 font-medium">{log.details.changes.statusChange.after}</span>
                                                  </span>
                                                </div>
                                              )}
                                            </>
                                          )}

                                          {/* DELETE 작업 */}
                                          {log.action === "delete" && log.details?.changes?.deletedIPInfo && (
                                            <>
                                              {log.details.changes.deletedIPInfo.ipRange && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">삭제된 IP 대역:</span>
                                                  <span className="text-gray-900 font-mono text-xs">{log.details.changes.deletedIPInfo.ipRange}</span>
                                                </div>
                                              )}
                                              {log.details.changes.deletedIPInfo.type && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">유형:</span>
                                                  <span className="text-gray-900">
                                                    {log.details.changes.deletedIPInfo.type === 'single' ? '단일 IP' :
                                                     log.details.changes.deletedIPInfo.type === 'range' ? 'IP 범위' :
                                                     log.details.changes.deletedIPInfo.type === 'cidr' ? 'CIDR 표기' :
                                                     log.details.changes.deletedIPInfo.type}
                                                  </span>
                                                </div>
                                              )}
                                              {log.details.changes.deletedIPInfo.description && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">설명:</span>
                                                  <span className="text-gray-900">{log.details.changes.deletedIPInfo.description}</span>
                                                </div>
                                              )}
                                              {log.details.changes.deletedIPInfo.isActive !== undefined && (
                                                <div className="flex justify-between">
                                                  <span className="text-gray-600">삭제 시 상태:</span>
                                                  <span className="text-gray-900">{log.details.changes.deletedIPInfo.isActive ? '활성' : '비활성'}</span>
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
