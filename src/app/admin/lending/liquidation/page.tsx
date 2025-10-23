/**
 * 청산콜 관리 메인 페이지
 * 청산 대기 목록 및 실행 관리
 */

"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Loader2, AlertTriangle, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import CryptoIcon from "@/components/ui/CryptoIcon";
import LiquidationWorkflowModal from "@/components/admin-lending/liquidation/LiquidationWorkflowModal";
import { LiquidationStatsSection } from "@/components/admin-lending/liquidation/LiquidationStatsSection";
import LiquidationFilters, {
  LiquidationFilters as LiquidationFiltersType,
} from "@/components/admin-lending/liquidation/LiquidationFilters";
import { LiquidationCall } from "@/types/admin-lending";
import { getLiquidationCalls, getLiquidationCallStats } from "@/services/admin-lending";

export default function LiquidationPage() {
  const { toast } = useToast();
  const [allCalls, setAllCalls] = useState<LiquidationCall[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<LiquidationCall[]>([]);
  const [stats, setStats] = useState({
    totalCalls: 0,
    pendingCalls: 0,
    processingCalls: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<LiquidationCall | null>(null);
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [filters, setFilters] = useState<LiquidationFiltersType>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 데이터 로드
  const fetchData = async () => {
    setLoading(true);
    try {
      const [callsData, statsData] = await Promise.all([
        getLiquidationCalls(),
        getLiquidationCallStats(),
      ]);

      setAllCalls(callsData);
      setStats(statsData);
    } catch (error) {
      console.error("청산콜 데이터 로드 실패:", error);
      toast({
        variant: "destructive",
        title: "데이터 로드 실패",
        description: "청산콜 정보를 불러올 수 없습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchData();
  }, []);

  // 필터 적용
  useEffect(() => {
    let result = [...allCalls];

    // 상태 필터
    if (filters.status && filters.status.length > 0) {
      result = result.filter((call) => filters.status!.includes(call.status));
    }

    // 자산 필터
    if (filters.asset && filters.asset.length > 0) {
      result = result.filter((call) =>
        filters.asset!.includes(call.collateralAsset.asset)
      );
    }

    // Health Factor 범위 필터
    if (filters.healthFactorMin !== undefined) {
      result = result.filter(
        (call) => call.healthFactor >= filters.healthFactorMin!
      );
    }
    if (filters.healthFactorMax !== undefined) {
      result = result.filter(
        (call) => call.healthFactor <= filters.healthFactorMax!
      );
    }

    // 검색 필터 (고객명 또는 청산콜 ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (call) =>
          call.customerName.toLowerCase().includes(searchLower) ||
          call.id.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCalls(result);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  }, [allCalls, filters]);

  // 청산 실행 핸들러
  const handleExecute = (call: LiquidationCall) => {
    setSelectedCall(call);
    setWorkflowModalOpen(true);
  };

  // 워크플로우 완료 핸들러
  const handleWorkflowComplete = () => {
    toast({
      description: "청산이 완료되었습니다.",
    });
    fetchData();
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    toast({
      description: "데이터를 새로고침합니다.",
    });
    fetchData();
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilters({});
    toast({
      description: "필터가 초기화되었습니다.",
    });
  };

  // 페이징 계산
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, endIndex);

  // 페이지 번호 배열 생성
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6 p-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">청산콜 관리</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <LiquidationStatsSection
        totalCalls={stats.totalCalls}
        pendingCalls={stats.pendingCalls}
        processingCalls={stats.processingCalls}
      />

      {/* 검색/필터 UI */}
      <LiquidationFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
      />

      {/* 청산콜 목록 */}
      <Card>
        <CardContent className="p-0">
          {loading && paginatedCalls.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-600">청산콜 목록을 불러오는 중...</span>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              검색 조건에 맞는 청산콜이 없습니다.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                        청산콜 ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                        고객 정보
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                        담보 자산
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">
                        대출 금액
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                        헬스팩터
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                        상태
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                        수신 일시
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">
                        작업
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedCalls.map((call) => (
                    <tr
                      key={call.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-indigo-600">
                          {call.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {call.customerName}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {call.customerId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <CryptoIcon
                            symbol={call.collateralAsset.asset}
                            size={20}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {call.collateralAsset.asset}
                          </span>
                          <span className="text-sm text-gray-500">
                            {call.collateralAsset.amount}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {(call.loanAmount / 10000).toFixed(0)}만원
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <AlertTriangle
                            className={`h-4 w-4 ${
                              call.healthFactor < 0.9
                                ? "text-red-600"
                                : call.healthFactor < 1.0
                                ? "text-yellow-600"
                                : "text-gray-400"
                            }`}
                          />
                          <span
                            className={`text-sm font-bold ${
                              call.healthFactor < 0.9
                                ? "text-red-600"
                                : call.healthFactor < 1.0
                                ? "text-yellow-600"
                                : "text-gray-900"
                            }`}
                          >
                            {call.healthFactor.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge
                          className={
                            call.status === "pending"
                              ? "bg-yellow-50 text-yellow-600 border-yellow-200 border"
                              : call.status === "processing"
                              ? "bg-sky-50 text-sky-600 border-sky-200 border"
                              : call.status === "completed"
                              ? "bg-indigo-50 text-indigo-600 border-indigo-200 border"
                              : "bg-red-50 text-red-600 border-red-200 border"
                          }
                        >
                          {call.status === "pending"
                            ? "대기"
                            : call.status === "processing"
                            ? "처리중"
                            : call.status === "completed"
                            ? "완료"
                            : "실패"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm text-gray-600">
                          {new Date(call.receivedAt).toLocaleString("ko-KR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button
                          size="sm"
                          onClick={() => handleExecute(call)}
                          disabled={call.status !== "pending"}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          청산 실행
                        </Button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 페이지네이션 */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  총 {filteredCalls.length}건 중 {startIndex + 1}-
                  {Math.min(endIndex, filteredCalls.length)}건 표시
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className={
                        pageNum === currentPage
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
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 청산 워크플로우 모달 */}
      <LiquidationWorkflowModal
        call={selectedCall}
        open={workflowModalOpen}
        onClose={() => setWorkflowModalOpen(false)}
        onComplete={handleWorkflowComplete}
      />
    </div>
  );
}
