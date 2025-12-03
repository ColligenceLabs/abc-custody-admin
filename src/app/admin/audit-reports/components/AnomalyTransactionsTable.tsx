"use client";

import { useState, useEffect } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { AlertTriangle, ExternalLink } from "lucide-react";

interface Anomaly {
  id: string;
  type: string;
  transactionType: string;
  coin: string;
  amount: string;
  krwAmount: number;
  user: string;
  userId: string;
  memberType: string;
  date: string;
  severity: "high" | "medium" | "low";
  reason: string;
}

export default function AnomalyTransactionsTable() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnomalies();
  }, []);

  const fetchAnomalies = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/statistics/anomalies`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setAnomalies(result.data || []);
      }
    } catch (error) {
      console.error("이상 거래 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { label: string; color: string }> = {
      high: { label: "높음", color: "bg-red-50 text-red-600 border-red-200" },
      medium: {
        label: "중간",
        color: "bg-yellow-50 text-yellow-600 border-yellow-200",
      },
      low: { label: "낮음", color: "bg-gray-50 text-gray-600 border-gray-200" },
    };

    const badge = severityMap[severity] || severityMap.low;

    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full border ${badge.color}`}
      >
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (anomalies.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            최근 이상 거래
          </h3>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-sky-50 text-sky-600 border border-sky-200">
            0건
          </span>
        </div>
        <div className="text-center py-8 text-gray-500">
          이상 거래가 감지되지 않았습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            최근 이상 거래
          </h3>
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-50 text-red-600 border border-red-200">
            {anomalies.length}건
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                심각도
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                날짜
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                유형
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                자산
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                금액
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                사용자
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                감지 사유
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                상세
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {anomalies.map((anomaly) => (
              <tr key={anomaly.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {getSeverityBadge(anomaly.severity)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {new Date(anomaly.date).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      anomaly.transactionType === "deposit"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-orange-50 text-orange-600"
                    }`}
                  >
                    {anomaly.transactionType === "deposit" ? "입금" : "출금"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {anomaly.coin}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-sm font-mono text-gray-900">
                    {parseFloat(anomaly.amount).toFixed(4)}
                  </div>
                  <div className="text-xs text-gray-600">
                    ₩{anomaly.krwAmount.toLocaleString()}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{anomaly.user}</div>
                  <div className="text-xs text-gray-500">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${
                        anomaly.memberType === "individual"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {anomaly.memberType === "individual" ? "개인" : "기업"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {anomaly.reason}
                </td>
                <td className="px-4 py-3 text-center">
                  <button className="text-sky-600 hover:text-sky-700">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
