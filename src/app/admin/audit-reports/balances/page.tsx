"use client";

import { useState, useEffect } from "react";
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';
import { formatCryptoAmount } from '@/lib/format';
import { Wallet, DollarSign } from 'lucide-react';

export default function BalancesReportPage() {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
        }/api/reports/balances`,
        {
          credentials: "include",
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
    (sum: number, b: any) => sum + (b.balanceKRW || 0),
    0
  );

  const totalUSD = balances.reduce(
    (sum: number, b: any) => sum + (b.balanceUSD || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">전체 잔액 관리</h1>
        <p className="mt-1 text-gray-600">모든 고객의 자산 현황</p>
      </div>

      {/* 총 자산 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* KRW 총 자산 */}
        <div className="p-6 bg-gradient-to-r from-sky-50 to-indigo-50 rounded-lg border border-sky-200">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-sky-600" />
            <span className="text-sm text-gray-600">총 자산 (KRW)</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ₩{totalKRW.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
        </div>

        {/* USD 총 자산 */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">총 자산 (USD)</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            ${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  소유자
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                  회원 유형
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  자산
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  보유량
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  USD 환산
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
              {balances.map((balance: any, index: number) => {
                const percentage =
                  totalKRW > 0
                    ? ((balance.balanceKRW / totalKRW) * 100).toFixed(1)
                    : 0;
                const isIndividual = balance.memberType === 'individual';
                return (
                  <tr key={`${balance.userId}-${balance.coin}-${index}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      {balance.ownerName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        isIndividual
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {isIndividual ? '개인' : '기업'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {balance.coin}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      {formatCryptoAmount(balance.balance, balance.coin)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-mono">
                      ${balance.balanceUSD?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      ₩{balance.balanceKRW?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || '0'}
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
