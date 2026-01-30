"use client";

import { useState, useEffect } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';

export default function TransactionsReportPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [memberType, setMemberType] = useState<
    "all" | "individual" | "corporate"
  >("all");

  useEffect(() => {
    fetchTransactions();
  }, [memberType]);

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (memberType !== "all") {
        params.append("memberType", memberType);
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        }/api/reports/transactions?${params}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data);
      }
    } catch (error) {
      console.error("거래 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">전체 거래 리포트</h1>
          <p className="mt-1 text-gray-600">모든 고객의 입출금 거래 내역</p>
        </div>
        <select
          value={memberType}
          onChange={(e) => setMemberType(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">전체 (개인+기업)</option>
          <option value="individual">개인 회원만</option>
          <option value="corporate">기업 회원만</option>
        </select>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  날짜
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  자산
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  금액
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  회원 유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.type === "deposit"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-orange-50 text-orange-600"
                      }`}
                    >
                      {tx.type === "deposit" ? "입금" : "출금"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(tx.date).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{tx.coin}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {tx.krwAmount ? `₩${tx.krwAmount.toLocaleString()}` : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tx.memberType === "individual"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {tx.memberType === "individual" ? "개인" : "기업"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
