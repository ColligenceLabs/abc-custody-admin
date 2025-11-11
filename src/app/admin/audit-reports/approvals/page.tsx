"use client";

import { useState, useEffect } from "react";

export default function ApprovalsReportPage() {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const authData = localStorage.getItem("admin-auth");
      const token = authData ? JSON.parse(authData).accessToken : null;
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/approvals/statistics`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setStatistics(result.data);
      }
    } catch (error) {
      console.error("승인 통계 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">승인 분석</h1>
        <p className="mt-1 text-gray-600">전체 승인 프로세스 통계 및 분석</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      ) : statistics ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm text-gray-600 mb-2">총 요청</h3>
              <div className="text-3xl font-bold">{statistics.total}건</div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm text-gray-600 mb-2">승인 완료</h3>
              <div className="text-3xl font-bold text-sky-600">
                {statistics.approved}건
              </div>
              <div className="text-sm text-gray-600 mt-1">
                승인율: {statistics.approvalRate}%
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm text-gray-600 mb-2">반려</h3>
              <div className="text-3xl font-bold text-red-600">
                {statistics.rejected}건
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-sm text-gray-600 mb-2">평균 소요 시간</h3>
              <div className="text-3xl font-bold text-purple-600">
                {statistics.avgApprovalTime}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">승인 프로세스 효율성</h3>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-600"
                style={{ width: `${statistics.approvalRate}%` }}
              ></div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              승인율: {statistics.approvalRate}% (평균{" "}
              {statistics.avgApprovalTime} 소요)
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500">
          데이터가 없습니다.
        </div>
      )}
    </div>
  );
}
