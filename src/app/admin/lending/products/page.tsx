/**
 * 대출 상품 관리 페이지
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProductTable from "@/components/admin-lending/products/ProductTable";
import { TrendingUp, Package, Activity, DollarSign } from "lucide-react";
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

type FilterTab = "all" | "active" | "inactive";

export default function ProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<AdminBankLoanProduct[]>([]);
  const [stats, setStats] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, statsData] = await Promise.all([
        getLoanProducts(),
        getLoanProductStats(),
      ]);
      setProducts(productsData);
      setStats(statsData);
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
  }, []);

  // 필터링된 상품
  const filteredProducts = products.filter((product) => {
    if (activeTab === "active") return product.isActive;
    if (activeTab === "inactive") return !product.isActive;
    return true;
  });

  // 통계 계산
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive).length;
  const totalActiveLoans = stats.reduce((sum, s) => sum + s.activeLoans, 0);
  const totalLoanAmount = stats.reduce(
    (sum, s) => sum + s.totalLoanAmount,
    0
  );

  // 상품 활성화/비활성화 핸들러
  const handleToggleStatus = async (product: AdminBankLoanProduct) => {
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

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "전체", count: totalProducts },
    { key: "active", label: "활성", count: activeProducts },
    { key: "inactive", label: "비활성", count: totalProducts - activeProducts },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">대출 상품 관리</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              제휴 은행 대출 상품을 관리합니다
            </p>
          </div>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">전체 상품</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalProducts}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 상품</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {activeProducts}
                  </p>
                </div>
                <div className="p-3 bg-sky-50 rounded-lg">
                  <Activity className="h-6 w-6 text-sky-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">활성 대출</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {totalActiveLoans}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">건</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
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
                    {formatAmount(totalLoanAmount)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 탭 */}
        <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 ${
                  activeTab === tab.key ? "text-indigo-100" : "text-gray-400"
                }`}
              >
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* 상품 테이블 */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                등록된 상품이 없습니다
              </h3>
              <p className="text-sm text-gray-600">
                제휴 은행에서 상품이 등록되면 표시됩니다
              </p>
            </CardContent>
          </Card>
        ) : (
          <ProductTable
            products={filteredProducts}
            stats={stats}
            onToggleStatus={handleToggleStatus}
          />
        )}
    </div>
  );
}
