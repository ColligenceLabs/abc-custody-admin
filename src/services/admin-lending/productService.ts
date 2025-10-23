/**
 * 대출 상품 관리 서비스
 * 상품 CRUD 및 통계 관리
 */

import {
  AdminBankLoanProduct,
  LoanProductRequest,
  Currency,
  ProductStats,
} from "@/types/admin-lending";

// Mock 데이터 import
import loanProductsData from "@/data/mockData/loan-products.json";
import adminLoansData from "@/data/mockData/admin-loans.json";

// Mock 데이터베이스 (메모리 상에서 관리)
let products: AdminBankLoanProduct[] = loanProductsData as AdminBankLoanProduct[];

/**
 * 모든 대출 상품 조회
 */
export async function getLoanProducts(
  isActive?: boolean
): Promise<AdminBankLoanProduct[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filteredProducts = [...products];

  // 활성 상태 필터
  if (isActive !== undefined) {
    filteredProducts = filteredProducts.filter((p) => p.isActive === isActive);
  }

  // 생성일 내림차순 정렬
  return filteredProducts.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * 특정 상품 조회
 */
export async function getLoanProductById(
  productId: string
): Promise<AdminBankLoanProduct | null> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 150));

  const product = products.find((p) => p.id === productId);
  return product || null;
}

/**
 * 담보 자산별 상품 조회
 */
export async function getLoanProductsByAsset(
  asset: Currency
): Promise<AdminBankLoanProduct[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 150));

  return products.filter((p) => p.collateralAsset === asset);
}

/**
 * 새 상품 생성
 */
export async function createLoanProduct(
  request: LoanProductRequest
): Promise<AdminBankLoanProduct> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 300));

  const now = new Date().toISOString();
  const newProduct: AdminBankLoanProduct = {
    id: `product-${Date.now()}`,
    ...request,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  products.push(newProduct);
  return newProduct;
}

/**
 * 상품 정보 수정
 */
export async function updateLoanProduct(
  productId: string,
  request: Partial<LoanProductRequest>
): Promise<AdminBankLoanProduct> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 300));

  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) {
    throw new Error("상품을 찾을 수 없습니다");
  }

  const updatedProduct: AdminBankLoanProduct = {
    ...products[index],
    ...request,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  return updatedProduct;
}

/**
 * 상품 활성화/비활성화
 */
export async function toggleLoanProductStatus(
  productId: string
): Promise<AdminBankLoanProduct> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) {
    throw new Error("상품을 찾을 수 없습니다");
  }

  products[index] = {
    ...products[index],
    isActive: !products[index].isActive,
    updatedAt: new Date().toISOString(),
  };

  return products[index];
}

/**
 * 상품 삭제 (실제로는 비활성화)
 */
export async function deleteLoanProduct(
  productId: string
): Promise<void> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 200));

  const index = products.findIndex((p) => p.id === productId);
  if (index === -1) {
    throw new Error("상품을 찾을 수 없습니다");
  }

  // 실제 삭제 대신 비활성화
  products[index] = {
    ...products[index],
    isActive: false,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * 상품별 대출 통계 조회
 */
export async function getLoanProductStats(): Promise<ProductStats[]> {
  // Mock API 호출 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 250));

  const loans = adminLoansData as any[];
  const stats: ProductStats[] = [];

  products.forEach((product) => {
    // 해당 상품을 사용한 대출 필터링
    const productLoans = loans.filter(
      (loan) => loan.product.id === product.id
    );

    if (productLoans.length === 0) {
      stats.push({
        productId: product.id,
        totalApplications: 0,
        approvedCount: 0,
        rejectedCount: 0,
        activeLoans: 0,
        totalLoanAmount: 0,
        averageHealthFactor: 0,
        approvalRate: 0,
      });
      return;
    }

    const activeLoans = productLoans.filter(
      (loan) => loan.status === "active" || loan.status === "warning"
    );

    const totalHealthFactor = activeLoans.reduce(
      (sum, loan) => sum + loan.healthFactor,
      0
    );

    stats.push({
      productId: product.id,
      totalApplications: productLoans.length,
      approvedCount: productLoans.length, // Mock에서는 모두 승인
      rejectedCount: 0,
      activeLoans: activeLoans.length,
      totalLoanAmount: productLoans.reduce(
        (sum, loan) => sum + loan.loanAmount,
        0
      ),
      averageHealthFactor:
        activeLoans.length > 0 ? totalHealthFactor / activeLoans.length : 0,
      approvalRate: 100, // Mock에서는 100%
    });
  });

  return stats;
}

/**
 * 상품별 통계 단일 조회
 */
export async function getLoanProductStatById(
  productId: string
): Promise<ProductStats | null> {
  const allStats = await getLoanProductStats();
  return allStats.find((s) => s.productId === productId) || null;
}
