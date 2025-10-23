/**
 * 관리자 대출 관리 서비스
 * Mock 데이터를 사용한 대출 조회 및 관리 기능
 */

import {
  AdminBankLoan,
  LoanDashboardStats,
  LoanFilters,
  LoansResponse,
  Pagination,
} from "@/types/admin-lending";

// Mock 데이터 imports
import adminLoansData from "@/data/mockData/admin-loans.json";
import loanDashboardStatsData from "@/data/mockData/loan-dashboard-stats.json";

/**
 * 대출 목록 조회 (필터링 및 페이지네이션 지원)
 */
export async function getLoans(
  filters?: LoanFilters,
  pagination?: { page?: number; limit?: number }
): Promise<LoansResponse> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredLoans = [...(adminLoansData as AdminBankLoan[])];

  // 필터 적용
  if (filters) {
    // 상태 필터
    if (filters.status && filters.status.length > 0) {
      filteredLoans = filteredLoans.filter((loan) =>
        filters.status!.includes(loan.status)
      );
    }

    // 자산 필터
    if (filters.asset && filters.asset.length > 0) {
      filteredLoans = filteredLoans.filter((loan) =>
        filters.asset!.includes(loan.collateralAsset.asset)
      );
    }

    // 위험도 필터
    if (filters.riskLevel && filters.riskLevel.length > 0) {
      filteredLoans = filteredLoans.filter((loan) =>
        filters.riskLevel!.includes(loan.riskLevel)
      );
    }

    // Health Factor 범위 필터
    if (filters.healthFactorMin !== undefined) {
      filteredLoans = filteredLoans.filter(
        (loan) => loan.healthFactor >= filters.healthFactorMin!
      );
    }
    if (filters.healthFactorMax !== undefined) {
      filteredLoans = filteredLoans.filter(
        (loan) => loan.healthFactor <= filters.healthFactorMax!
      );
    }

    // 검색 필터 (고객명, 대출 ID)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredLoans = filteredLoans.filter(
        (loan) =>
          loan.customerName.toLowerCase().includes(searchLower) ||
          loan.id.toLowerCase().includes(searchLower) ||
          loan.customerId.toLowerCase().includes(searchLower)
      );
    }
  }

  // 페이지네이션 적용
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedLoans = filteredLoans.slice(startIndex, endIndex);

  const paginationResult: Pagination = {
    page,
    limit,
    total: filteredLoans.length,
    totalPages: Math.ceil(filteredLoans.length / limit),
  };

  return {
    loans: paginatedLoans,
    pagination: paginationResult,
  };
}

/**
 * 특정 대출 상세 정보 조회
 */
export async function getLoanById(
  loanId: string
): Promise<AdminBankLoan | null> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const loan = (adminLoansData as AdminBankLoan[]).find(
    (loan) => loan.id === loanId
  );

  return loan || null;
}

/**
 * 대출 대시보드 통계 조회
 */
export async function getLoanDashboardStats(): Promise<LoanDashboardStats> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 250));

  return loanDashboardStatsData as LoanDashboardStats;
}

/**
 * 고객별 대출 목록 조회
 */
export async function getLoansByCustomer(
  customerId: string
): Promise<AdminBankLoan[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const loans = (adminLoansData as AdminBankLoan[]).filter(
    (loan) => loan.customerId === customerId
  );

  return loans;
}

/**
 * 위험도별 대출 목록 조회
 */
export async function getLoansByRiskLevel(
  riskLevel: AdminBankLoan["riskLevel"]
): Promise<AdminBankLoan[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const loans = (adminLoansData as AdminBankLoan[]).filter(
    (loan) => loan.riskLevel === riskLevel
  );

  // Health Factor 순으로 정렬 (낮은 순)
  return loans.sort((a, b) => a.healthFactor - b.healthFactor);
}

/**
 * 자산별 대출 통계 조회
 */
export async function getLoanStatsByAsset(): Promise<
  Record<
    string,
    {
      totalCount: number;
      totalAmount: number;
      totalCollateralValue: number;
      averageHealthFactor: number;
    }
  >
> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const loans = adminLoansData as AdminBankLoan[];
  const statsByAsset: Record<
    string,
    {
      totalCount: number;
      totalAmount: number;
      totalCollateralValue: number;
      averageHealthFactor: number;
    }
  > = {};

  loans.forEach((loan) => {
    const asset = loan.collateralAsset.asset;
    if (!statsByAsset[asset]) {
      statsByAsset[asset] = {
        totalCount: 0,
        totalAmount: 0,
        totalCollateralValue: 0,
        averageHealthFactor: 0,
      };
    }

    statsByAsset[asset].totalCount += 1;
    statsByAsset[asset].totalAmount += loan.loanAmount;
    statsByAsset[asset].totalCollateralValue += loan.collateralAsset.value;
    statsByAsset[asset].averageHealthFactor += loan.healthFactor;
  });

  // 평균 Health Factor 계산
  Object.keys(statsByAsset).forEach((asset) => {
    statsByAsset[asset].averageHealthFactor /= statsByAsset[asset].totalCount;
  });

  return statsByAsset;
}
