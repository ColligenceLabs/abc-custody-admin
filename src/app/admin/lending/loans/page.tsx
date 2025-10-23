/**
 * 대출 목록 메인 페이지
 * 필터, 테이블, 상세 모달을 통합하여 표시
 */

"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import LoanFilters from "@/components/admin-lending/loans/LoanFilters";
import LoansTable from "@/components/admin-lending/loans/LoansTable";
import LoanDetailModal from "@/components/admin-lending/loans/LoanDetailModal";
import {
  AdminBankLoan,
  LoanFilters as LoanFiltersType,
  Pagination,
} from "@/types/admin-lending";
import { getLoans } from "@/services/admin-lending";

const initialFilters: LoanFiltersType = {};

export default function LoansListPage() {
  const [loans, setLoans] = useState<AdminBankLoan[]>([]);
  const [filters, setFilters] = useState<LoanFiltersType>(initialFilters);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<AdminBankLoan | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // 대출 목록 조회
  const fetchLoans = async (newFilters?: LoanFiltersType, page?: number) => {
    setLoading(true);
    try {
      const response = await getLoans(
        newFilters || filters,
        { page: page || pagination.page, limit: pagination.limit }
      );
      setLoans(response.loans);
      setPagination(response.pagination);
    } catch (error) {
      console.error("대출 목록 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    fetchLoans();
  }, []);

  // 필터 변경 핸들러
  const handleFiltersChange = (newFilters: LoanFiltersType) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLoans(newFilters, 1);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilters(initialFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchLoans(initialFilters, 1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
    fetchLoans(filters, page);
  };

  // 대출 클릭 핸들러
  const handleLoanClick = (loan: AdminBankLoan) => {
    setSelectedLoan(loan);
    setDetailModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedLoan(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-7 h-7 mr-2 text-indigo-600" />
            대출 목록
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            전체 대출 내역 조회 및 필터링
          </p>
        </div>
        <div className="text-sm text-gray-600">
          총 <span className="font-bold text-indigo-600">{pagination.total}</span>
          건의 대출
        </div>
      </div>

      {/* 필터 */}
      <LoanFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* 테이블 */}
      <LoansTable
        loans={loans}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLoanClick={handleLoanClick}
      />

      {/* 상세 모달 */}
      <LoanDetailModal
        loan={selectedLoan}
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
