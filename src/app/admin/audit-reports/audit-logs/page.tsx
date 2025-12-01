"use client";

import { useState, useEffect } from "react";
import { Download, ChevronDown, ChevronRight } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    page: 1,
    limit: 100,
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
      } else {
        console.error("내보내기 실패:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("내보내기 오류:", error);
    }
  };

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
                        {log.userName || log.userId}
                      </td>
                      <td className="px-4 py-3 text-sm">{log.action}</td>
                      <td className="px-4 py-3 text-sm">{log.resource}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            log.result === "SUCCESS"
                              ? "bg-sky-50 text-sky-600"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {log.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">
                        {log.ipAddress}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${log.id}-details`} className="bg-gray-50">
                        <td colSpan={8} className="px-4 py-4">
                          <div className="space-y-3 text-sm">
                            <div className="bg-white p-3 rounded border border-gray-300">
                              <span className="font-semibold text-gray-900">ID:</span>
                              <span className="ml-2 text-gray-700 font-mono text-sm break-all">{log.id}</span>
                            </div>
                            <div>
                              <div>
                                <span className="font-medium text-gray-700">사용자 ID:</span>
                                <span className="ml-2 text-gray-600">{log.userId}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">역할:</span>
                                <span className="ml-2 text-gray-600">{log.userRole || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">회원 유형:</span>
                                <span className="ml-2 text-gray-600">{log.memberType || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">조직 ID:</span>
                                <span className="ml-2 text-gray-600">{log.organizationId || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">리소스 ID:</span>
                                <span className="ml-2 text-gray-600">{log.resourceId || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">세션 ID:</span>
                                <span className="ml-2 text-gray-600 font-mono text-xs">{log.sessionId || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">User Agent:</span>
                                <span className="ml-2 text-gray-600 text-xs break-all">{log.userAgent || '-'}</span>
                              </div>
                            </div>
                            {log.details && (
                              <div className="mt-3">
                                <span className="font-medium text-gray-700">상세 정보:</span>
                                <pre className="mt-1 p-3 bg-white rounded border border-gray-200 text-xs overflow-x-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            )}
                            {log.errorMessage && (
                              <div className="mt-3">
                                <span className="font-medium text-red-700">에러 메시지:</span>
                                <div className="mt-1 p-3 bg-red-50 rounded border border-red-200 text-red-700">
                                  {log.errorMessage}
                                </div>
                              </div>
                            )}
                          </div>
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
