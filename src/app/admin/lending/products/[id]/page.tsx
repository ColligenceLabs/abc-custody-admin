/**
 * 대출 상품 상세 페이지
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { ArrowLeft, Power, TrendingUp, DollarSign, Users } from "lucide-react";
import {
  AdminBankLoanProduct,
  ProductStats,
} from "@/types/admin-lending";
import {
  getLoanProducts,
  getLoanProductStats,
  toggleLoanProductStatus,
} from "@/services/admin-lending";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<AdminBankLoanProduct | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, statsData] = await Promise.all([
        getLoanProducts(),
        getLoanProductStats(),
      ]);

      const currentProduct = productsData.find((p) => p.id === params.id);
      const currentStats = statsData.find((s) => s.productId === params.id);

      if (!currentProduct) {
        toast({
          variant: "destructive",
          title: "상품을 찾을 수 없습니다",
          description: "요청하신 상품이 존재하지 않습니다.",
        });
        router.push("/admin/lending/products");
        return;
      }

      setProduct(currentProduct);
      setStats(currentStats || null);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "데이터 로드 실패",
        description: "상품 정보를 불러오는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  // 상품 활성화/비활성화 핸들러
  const handleToggleStatus = async () => {
    if (!product) return;

    try {
      await toggleLoanProductStatus(product.id);
      toast({
        description: `상품이 ${product.isActive ? "비활성화" : "활성화"}되었습니다.`,
      });
      await loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "상태 변경 실패",
        description: "상품 상태를 변경하는 중 오류가 발생했습니다.",
      });
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억원`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(0)}만원`;
    return `${amount.toLocaleString()}원`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/lending/products")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              목록으로
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {product.productName}
              </h1>
              <p className="text-sm text-gray-600 mt-1">{product.bankName}</p>
            </div>
          </div>
          <Button
            variant={product.isActive ? "outline" : "default"}
            onClick={handleToggleStatus}
          >
            <Power className="h-4 w-4 mr-2" />
            {product.isActive ? "비활성화" : "활성화"}
          </Button>
        </div>

        {/* 상태 및 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">상품 상태</p>
                  <Badge
                    className={`mt-2 ${
                      product.isActive
                        ? "bg-sky-50 text-sky-600 border-sky-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    } border`}
                  >
                    {product.isActive ? "활성" : "비활성"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {stats && (
            <>
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">활성 대출</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {stats.activeLoans}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">건</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 대출액</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {formatAmount(stats.totalLoanAmount)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">평균 대출액</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">
                        {stats.activeLoans > 0
                          ? formatAmount(
                              stats.totalLoanAmount / stats.activeLoans
                            )
                          : "0원"}
                      </p>
                    </div>
                    <div className="p-3 bg-sky-50 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-sky-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">담보자산</span>
                <div className="flex items-center space-x-2">
                  <CryptoIcon
                    symbol={product.collateralAsset.split(",")[0].trim() as any}
                    size={20}
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {product.collateralAsset}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">대출기간</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.loanTerm}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">조기상환수수료</span>
                <span
                  className={`text-sm font-medium ${
                    product.earlyRepaymentFee === "면제"
                      ? "text-sky-600"
                      : "text-gray-900"
                  }`}
                >
                  {product.earlyRepaymentFee}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">추가 담보 허용</span>
                <span className="text-sm font-medium text-gray-900">
                  {product.additionalCollateralAllowed ? "가능" : "불가"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 대출 조건 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">대출 조건</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">LTV</span>
                <span className="text-sm font-medium text-sky-600">
                  {product.ltv}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">금리</span>
                <span className="text-sm font-medium text-gray-900">
                  연 {product.interestRate}%
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm text-gray-600">최소 대출금액</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(product.minLoanAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">최대 대출금액</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(product.maxLoanAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 상품 특징 및 설명 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 상품 특징 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">상품 특징</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-sky-600 mr-2">•</span>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* 상품 설명 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">상품 설명</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {product.description}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
