"use client";

import { useState, useEffect } from "react";

export default function BalancesReportPage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const authData = localStorage.getItem("admin-auth");
      const token = authData ? JSON.parse(authData).accessToken : null;
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
        }/api/reports/balances`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        setBalances(result.data);
      }
    } catch (error) {
      console.error("잔액 조회 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalKRW = balances.reduce(
    (sum: number, b: any) => sum + b.balanceKRW,
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">전체 잔액 관리</h1>
        <p className="mt-1 text-gray-600">모든 고객의 자산 현황</p>
      </div>

      {/* 총 자산 */}
      <div className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2">시스템 총 자산</h3>
        <div className="text-4xl font-bold">₩{totalKRW.toLocaleString()}</div>
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
                  자산
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  보유량
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  KRW 환산
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  비율
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {balances.map((balance: any) => {
                const percentage =
                  totalKRW > 0
                    ? ((balance.balanceKRW / totalKRW) * 100).toFixed(1)
                    : 0;
                return (
                  <tr key={balance.coin} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {balance.coin}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {parseFloat(balance.balance).toFixed(8)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      ₩{balance.balanceKRW.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
