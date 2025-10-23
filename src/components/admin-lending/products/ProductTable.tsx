/**
 * 대출 상품 테이블 컴포넌트
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AdminBankLoanProduct, ProductStats } from "@/types/admin-lending";
import { Eye, Power } from "lucide-react";
import Link from "next/link";

interface ProductTableProps {
  products: AdminBankLoanProduct[];
  stats: ProductStats[];
  onToggleStatus: (product: AdminBankLoanProduct) => void;
}

export default function ProductTable({
  products,
  stats,
  onToggleStatus,
}: ProductTableProps) {
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
    return `${amount.toLocaleString()}원`;
  };

  const getProductStats = (productId: string): ProductStats | undefined => {
    return stats.find((s) => s.productId === productId);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상품명
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  담보자산
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  대출기간
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  LTV
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  금리
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  대출한도
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  조기상환수수료
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => {
                const productStats = getProductStats(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !product.isActive ? "opacity-60" : ""
                    }`}
                  >
                    {/* 상품명 */}
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.productName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {product.bankName}
                        </div>
                        {productStats && productStats.activeLoans > 0 && (
                          <div className="text-xs text-indigo-600 mt-0.5">
                            활성 대출: {productStats.activeLoans}건
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 담보자산 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <CryptoIcon
                          symbol={product.collateralAsset.split(",")[0].trim() as any}
                          size={20}
                        />
                        <span className="text-sm text-gray-900">
                          {product.collateralAsset}
                        </span>
                      </div>
                    </td>

                    {/* 대출기간 */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        {product.loanTerm}
                      </div>
                    </td>

                    {/* LTV */}
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-sky-600">
                        {product.ltv}%
                      </div>
                    </td>

                    {/* 금리 */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        연 {product.interestRate}%
                      </div>
                    </td>

                    {/* 대출한도 */}
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">
                        <div>최소: {formatAmount(product.minLoanAmount)}</div>
                        <div className="text-xs text-gray-500">
                          최대: {formatAmount(product.maxLoanAmount)}
                        </div>
                      </div>
                    </td>

                    {/* 조기상환수수료 */}
                    <td className="px-4 py-3">
                      <div
                        className={`text-sm ${
                          product.earlyRepaymentFee === "면제"
                            ? "text-sky-600 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {product.earlyRepaymentFee}
                      </div>
                    </td>

                    {/* 상태 */}
                    <td className="px-4 py-3 text-center">
                      <Badge
                        className={`${
                          product.isActive
                            ? "bg-sky-50 text-sky-600 border-sky-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        } border`}
                      >
                        {product.isActive ? "활성" : "비활성"}
                      </Badge>
                    </td>

                    {/* 관리 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <Link href={`/admin/lending/products/${product.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onToggleStatus(product)}
                        >
                          <Power
                            className={`h-4 w-4 ${
                              product.isActive
                                ? "text-gray-600"
                                : "text-sky-600"
                            }`}
                          />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
