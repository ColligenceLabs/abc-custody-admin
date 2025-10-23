/**
 * 대출 목록 테이블 컴포넌트
 * 페이지네이션, 정렬, 상세 보기 기능 포함
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AdminBankLoan, Pagination } from "@/types/admin-lending";

interface LoansTableProps {
  loans: AdminBankLoan[];
  loading: boolean;
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onLoanClick: (loan: AdminBankLoan) => void;
}

export default function LoansTable({
  loans,
  loading,
  pagination,
  onPageChange,
  onLoanClick,
}: LoansTableProps) {
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

  // 상태별 배지 스타일
  const getStatusBadgeClass = (status: AdminBankLoan["status"]) => {
    switch (status) {
      case "active":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "warning":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "danger":
        return "bg-red-50 text-red-600 border-red-200";
      case "liquidation":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "liquidated":
        return "bg-gray-50 text-gray-600 border-gray-200";
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

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 페이지 번호 배열 생성
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    const { page, totalPages } = pagination;

    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <Card>
      <CardContent className="p-0">
        {/* 테이블 */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded" />
            ))}
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            조건에 맞는 대출이 없습니다.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      대출 ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      고객 정보
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                      담보 자산
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                      대출 금액
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      Health Factor
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      위험도
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      상태
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                      만기일
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loans.map((loan) => (
                    <tr
                      key={loan.id}
                      onClick={() => onLoanClick(loan)}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-mono text-indigo-600">
                          {loan.id}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {loan.customerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {loan.customerBank} {loan.customerAccount}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(loan.loanAmount)}원
                        </div>
                        <div className="text-xs text-gray-500">
                          금리 {loan.interestRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-sm font-bold ${getHealthFactorColor(
                            loan.healthFactor
                          )}`}
                        >
                          {loan.healthFactor.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
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
                      <td className="px-6 py-4 text-center">
                        <Badge
                          className={`${getStatusBadgeClass(
                            loan.status
                          )} border`}
                        >
                          {loan.status === "active" && "활성"}
                          {loan.status === "warning" && "주의"}
                          {loan.status === "danger" && "위험"}
                          {loan.status === "liquidation" && "청산 중"}
                          {loan.status === "liquidated" && "청산 완료"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900">
                          {formatDate(loan.maturityDate)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                총 {pagination.total}건 중 {(pagination.page - 1) * pagination.limit + 1}
                -
                {Math.min(
                  pagination.page * pagination.limit,
                  pagination.total
                )}
                건 표시
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {getPageNumbers().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={
                      pageNum === pagination.page
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : ""
                    }
                  >
                    {pageNum}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
