/**
 * 대출 상품 카드 컴포넌트
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AdminBankLoanProduct, ProductStats } from "@/types/admin-lending";
import { Edit, Power, TrendingUp } from "lucide-react";

interface ProductCardProps {
  product: AdminBankLoanProduct;
  stats?: ProductStats;
  onEdit: (product: AdminBankLoanProduct) => void;
  onToggleStatus: (product: AdminBankLoanProduct) => void;
}

export default function ProductCard({
  product,
  stats,
  onEdit,
  onToggleStatus,
}: ProductCardProps) {
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
    return `${amount.toLocaleString()}원`;
  };

  return (
    <Card className={!product.isActive ? "opacity-60" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <CryptoIcon symbol={product.collateralAsset as any} size={28} />
            <div>
              <CardTitle className="text-base">{product.productName}</CardTitle>
              <p className="text-xs text-gray-500">{product.bankName}</p>
            </div>
          </div>
          <Badge
            className={`${
              product.isActive
                ? "bg-sky-50 text-sky-600 border-sky-200"
                : "bg-gray-50 text-gray-600 border-gray-200"
            } border`}
          >
            {product.isActive ? "활성" : "비활성"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 상품 정보 */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">대출 기간</span>
            <span className="font-medium text-gray-900">{product.loanTerm}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">LTV</span>
            <span className="font-medium text-gray-900">{product.ltv}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">금리</span>
            <span className="font-medium text-gray-900">
              {product.interestRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">한도</span>
            <span className="text-xs text-gray-600">
              {formatAmount(product.minLoanAmount)} ~{" "}
              {formatAmount(product.maxLoanAmount)}
            </span>
          </div>
        </div>

        {/* 통계 정보 */}
        {stats && (
          <div className="bg-indigo-50 rounded-lg p-3 space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-indigo-600 font-medium flex items-center">
                <TrendingUp className="h-3.5 w-3.5 mr-1" />
                활성 대출
              </span>
              <span className="font-bold text-indigo-700">
                {stats.activeLoans}건
              </span>
            </div>
            {stats.totalLoanAmount > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-indigo-600">총 대출액</span>
                <span className="text-indigo-700">
                  {formatAmount(stats.totalLoanAmount)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 특징 태그 */}
        <div className="flex flex-wrap gap-1.5">
          {product.features.slice(0, 2).map((feature, idx) => (
            <Badge
              key={idx}
              variant="outline"
              className="text-xs bg-white text-gray-600"
            >
              {feature}
            </Badge>
          ))}
        </div>

        {/* 액션 버튼 */}
        <div className="flex space-x-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
            className="flex-1"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            수정
          </Button>
          <Button
            variant={product.isActive ? "outline" : "default"}
            size="sm"
            onClick={() => onToggleStatus(product)}
            className={
              product.isActive
                ? ""
                : "bg-sky-600 hover:bg-sky-700 text-white"
            }
          >
            <Power className="h-3.5 w-3.5 mr-1" />
            {product.isActive ? "비활성화" : "활성화"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
