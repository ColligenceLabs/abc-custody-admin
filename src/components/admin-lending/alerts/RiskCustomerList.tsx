/**
 * 청산 위험 고객 목록 컴포넌트
 * 실시간 업데이트되는 위험 고객 테이블
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AdminBankLoan } from "@/types/admin-lending";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface RiskCustomerListProps {
  customers: AdminBankLoan[];
  lastUpdated: Date;
}

export default function RiskCustomerList({
  customers,
  lastUpdated,
}: RiskCustomerListProps) {
  // HF 배지 컬러
  const getHealthFactorBadgeClass = (hf: number) => {
    if (hf < 1.0) return "bg-red-50 text-red-600 border-red-200";
    if (hf < 1.2) return "bg-red-50 text-red-600 border-red-200";
    if (hf < 1.5) return "bg-yellow-50 text-yellow-600 border-yellow-200";
    return "bg-sky-50 text-sky-600 border-sky-200";
  };

  // 위험 레벨 텍스트
  const getRiskLevelText = (hf: number) => {
    if (hf < 1.0) return "청산";
    if (hf < 1.2) return "위험";
    if (hf < 1.5) return "주의";
    return "안전";
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
    return `${amount.toLocaleString()}원`;
  };

  // 시간 포맷팅
  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-base">청산 위험 고객</CardTitle>
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
              {customers.length}건
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>{formatTime(lastUpdated)} 업데이트</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {customers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>청산 위험 고객이 없습니다</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200">
                <tr className="text-left text-gray-600">
                  <th className="pb-2 font-medium">고객명</th>
                  <th className="pb-2 font-medium">담보</th>
                  <th className="pb-2 font-medium text-right">HF</th>
                  <th className="pb-2 font-medium text-right">대출금액</th>
                  <th className="pb-2 font-medium text-center">상태</th>
                  <th className="pb-2 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {customer.customerAccount}
                        </p>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <CryptoIcon
                          symbol={customer.collateralAsset.asset as any}
                          size={20}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {customer.collateralAsset.asset}
                          </p>
                          <p className="text-xs text-gray-500">
                            {customer.collateralAsset.amount}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant="outline"
                        className={`${getHealthFactorBadgeClass(customer.healthFactor)} border`}
                      >
                        {customer.healthFactor.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatAmount(customer.loanAmount)}
                    </td>
                    <td className="py-3 text-center">
                      <Badge
                        variant="outline"
                        className={`${getHealthFactorBadgeClass(customer.healthFactor)} border`}
                      >
                        {getRiskLevelText(customer.healthFactor)}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Link
                        href={`/admin/lending/loans?id=${customer.id}`}
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        상세
                      </Link>
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
