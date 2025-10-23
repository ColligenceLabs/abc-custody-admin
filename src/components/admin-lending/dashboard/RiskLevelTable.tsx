/**
 * 위험도별 대출 테이블 컴포넌트
 * 위험도별 탭과 대출 목록을 통합하여 표시
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AdminBankLoan } from "@/types/admin-lending";
import { getLoans } from "@/services/admin-lending";

type RiskLevel = "all" | "safe" | "caution" | "danger" | "liquidation";

interface RiskTab {
  id: RiskLevel;
  label: string;
  count: number;
}

export default function RiskLevelTable() {
  const [loans, setLoans] = useState<AdminBankLoan[]>([]);
  const [activeTab, setActiveTab] = useState<RiskLevel>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLoans() {
      try {
        const response = await getLoans(
          activeTab === "all" ? undefined : { riskLevel: [activeTab] },
          { page: 1, limit: 10 }
        );
        setLoans(response.loans);
      } catch (error) {
        console.error("대출 목록 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLoans();
  }, [activeTab]);

  // 위험도별 건수 계산
  const getRiskCounts = (): Record<RiskLevel, number> => {
    return {
      all: loans.length,
      safe: loans.filter((l) => l.riskLevel === "safe").length,
      caution: loans.filter((l) => l.riskLevel === "caution").length,
      danger: loans.filter((l) => l.riskLevel === "danger").length,
      liquidation: loans.filter((l) => l.riskLevel === "liquidation").length,
    };
  };

  const riskCounts = getRiskCounts();

  const tabs: RiskTab[] = [
    { id: "all", label: "전체", count: riskCounts.all },
    { id: "safe", label: "안전", count: riskCounts.safe },
    { id: "caution", label: "주의", count: riskCounts.caution },
    { id: "danger", label: "위험", count: riskCounts.danger },
    { id: "liquidation", label: "청산", count: riskCounts.liquidation },
  ];

  // 위험도별 배지 스타일
  const getRiskBadgeClass = (riskLevel: AdminBankLoan["riskLevel"]) => {
    switch (riskLevel) {
      case "safe":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "caution":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "danger":
        return "bg-red-50 text-red-600 border-red-200";
      case "liquidation":
        return "bg-purple-50 text-purple-600 border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };

  // Health Factor 색상
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return "text-sky-600";
    if (healthFactor >= 1.2) return "text-yellow-600";
    if (healthFactor >= 1.0) return "text-red-600";
    return "text-purple-600";
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`;
    }
    return amount.toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>위험도별 대출 현황</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 탭 메뉴 */}
        <div className="flex space-x-1 border-b border-gray-200 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* 테이블 */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            해당 위험도의 대출이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    고객명
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    담보 자산
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    대출 금액
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Health Factor
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    위험도
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {loan.customerName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {loan.customerBank} {loan.customerAccount}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <CryptoIcon
                          symbol={loan.collateralAsset.asset}
                          size={24}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {loan.collateralAsset.amount}{" "}
                            {loan.collateralAsset.asset}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatAmount(loan.collateralAsset.value)}원
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {formatAmount(loan.loanAmount)}원
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-bold ${getHealthFactorColor(
                          loan.healthFactor
                        )}`}
                      >
                        {loan.healthFactor.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={`${getRiskBadgeClass(
                          loan.riskLevel
                        )} border`}
                      >
                        {loan.riskLevel === "safe" && "안전"}
                        {loan.riskLevel === "caution" && "주의"}
                        {loan.riskLevel === "danger" && "위험"}
                        {loan.riskLevel === "liquidation" && "청산"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
