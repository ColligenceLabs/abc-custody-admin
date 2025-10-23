/**
 * 관리자 대출 관리 시스템 API 서비스
 */

import {
  AdminBankLoan,
  AdminBankLoanProduct,
  LoanDashboardStats,
  LoansResponse,
  LoanFilters,
  LiquidationCall,
  LiquidationExecution,
  ExchangeStatus,
  Alert,
  AlertConfig,
  LoanProductRequest,
  Currency,
  ProductStats,
} from "@/types/admin-lending";

// Mock 데이터 생성 함수들

function generateMockLoans(): AdminBankLoan[] {
  const customers = [
    { id: "cust-1", name: "김철수", bank: "신한은행", account: "110-123-456789" },
    { id: "cust-2", name: "이영희", bank: "KB국민은행", account: "123-456-789012" },
    { id: "cust-3", name: "박민수", bank: "하나은행", account: "456-789-012345" },
    { id: "cust-4", name: "정수진", bank: "우리은행", account: "789-012-345678" },
    { id: "cust-5", name: "최동욱", bank: "NH농협은행", account: "012-345-678901" },
  ];

  const assets: Currency[] = ["BTC", "ETH", "USDT", "USDC", "SOL"];
  const riskLevels: AdminBankLoan["riskLevel"][] = ["safe", "caution", "danger", "liquidation"];

  return customers.flatMap((customer, index) =>
    assets.map((asset, assetIndex) => {
      const riskLevel = riskLevels[Math.min(index, riskLevels.length - 1)];
      let healthFactor: number;

      // 위험도에 따른 Health Factor 설정
      if (riskLevel === "safe") healthFactor = 1.8 + Math.random() * 0.5;
      else if (riskLevel === "caution") healthFactor = 1.3 + Math.random() * 0.2;
      else if (riskLevel === "danger") healthFactor = 1.05 + Math.random() * 0.15;
      else healthFactor = 0.85 + Math.random() * 0.1; // liquidation: 0.85 ~ 0.95

      const collateralAmount = asset === "BTC" ? 0.5 : asset === "ETH" ? 10 : 50000;
      const currentPrice = asset === "BTC" ? 50000000 : asset === "ETH" ? 3000000 : 1300;
      const collateralValue = collateralAmount * currentPrice;
      const loanAmount = collateralValue * 0.6; // LTV 60%

      return {
        id: `loan-${index}-${assetIndex}`,
        customerId: customer.id,
        customerName: customer.name,
        customerBank: customer.bank,
        customerAccount: customer.account,
        product: {
          id: `product-${assetIndex}`,
          productName: `${asset} 담보 대출`,
          bankName: customer.bank,
          collateralAsset: asset,
          loanTerm: "1년",
          ltv: 60,
          interestRate: 8.5,
          minLoanAmount: 10000000,
          maxLoanAmount: 500000000,
          earlyRepaymentFee: "없음",
          additionalCollateralAllowed: true,
          features: ["추가 담보 가능", "중도 상환 수수료 없음"],
          description: `${asset} 담보 대출 상품`,
        },
        collateralAsset: {
          asset,
          amount: collateralAmount,
          currentPrice,
          value: collateralValue,
          volatility: 15.5,
          supportedLTV: 60,
        },
        loanAmount,
        interestRate: 8.5,
        healthFactor,
        liquidationThreshold: 1.1,
        liquidationPrice: currentPrice * 0.9,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
        maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        status: riskLevel === "safe" ? "active" : riskLevel === "caution" ? "warning" : "danger",
        accruedInterest: loanAmount * 0.085 * 0.3,
        riskLevel,
      };
    })
  );
}

function generateMockLiquidationCalls(): LiquidationCall[] {
  const loans = generateMockLoans().filter((loan) => loan.healthFactor < 1.0);

  return loans.slice(0, 6).map((loan, index) => ({
    id: `liq-call-${index}`,
    loanId: loan.id,
    customerId: loan.customerId,
    customerName: loan.customerName,
    collateralAsset: loan.collateralAsset,
    loanAmount: loan.loanAmount,
    healthFactor: loan.healthFactor,
    receivedAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000).toISOString(),
    status: index < 2 ? "pending" : index < 4 ? "processing" : "completed",
    priority: loan.healthFactor < 0.9 ? "urgent" : loan.healthFactor < 0.95 ? "high" : "normal",
  }));
}

// API 함수들

export async function getLoanDashboardStats(): Promise<LoanDashboardStats> {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const loans = generateMockLoans();
  const totalLoanAmount = loans.reduce((sum, loan) => sum + loan.loanAmount, 0);
  const totalCollateralValue = loans.reduce((sum, loan) => sum + loan.collateralAsset.value, 0);
  const averageHealthFactor = loans.reduce((sum, loan) => sum + loan.healthFactor, 0) / loans.length;
  const liquidationRiskCount = loans.filter((loan) => loan.healthFactor < 1.2).length;

  return {
    totalLoanAmount,
    totalCollateralValue,
    averageHealthFactor,
    liquidationRiskCount,
    riskDistribution: {
      safe: loans.filter((l) => l.riskLevel === "safe").length,
      caution: loans.filter((l) => l.riskLevel === "caution").length,
      danger: loans.filter((l) => l.riskLevel === "danger").length,
      liquidation: loans.filter((l) => l.riskLevel === "liquidation").length,
    },
    recentActivities: [
      {
        id: "act-1",
        type: "repayment",
        loanId: "loan-1",
        customerId: "cust-1",
        customerName: "김철수",
        description: "대출 원금 일부 상환",
        amount: 5000000,
        asset: "BTC",
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      },
      {
        id: "act-2",
        type: "collateral_added",
        loanId: "loan-2",
        customerId: "cust-2",
        customerName: "이영희",
        description: "담보 추가 예치",
        amount: 2,
        asset: "ETH",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "act-3",
        type: "loan_created",
        loanId: "loan-3",
        customerId: "cust-3",
        customerName: "박민수",
        description: "신규 대출 승인",
        amount: 30000000,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: "act-4",
        type: "liquidation",
        loanId: "loan-4",
        customerId: "cust-4",
        customerName: "정수진",
        description: "청산 절차 시작",
        amount: 0.5,
        asset: "BTC",
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
      },
    ],
  };
}

export async function getLoans(
  filters?: LoanFilters,
  pagination?: { page: number; limit: number }
): Promise<LoansResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let loans = generateMockLoans();

  // 필터 적용
  if (filters?.riskLevel && filters.riskLevel.length > 0) {
    loans = loans.filter((loan) => filters.riskLevel!.includes(loan.riskLevel));
  }

  if (filters?.status && filters.status.length > 0) {
    loans = loans.filter((loan) => filters.status!.includes(loan.status));
  }

  if (filters?.asset && filters.asset.length > 0) {
    loans = loans.filter((loan) => filters.asset!.includes(loan.collateralAsset.asset));
  }

  if (filters?.healthFactorMin !== undefined) {
    loans = loans.filter((loan) => loan.healthFactor >= filters.healthFactorMin!);
  }

  if (filters?.healthFactorMax !== undefined) {
    loans = loans.filter((loan) => loan.healthFactor <= filters.healthFactorMax!);
  }

  // 페이지네이션
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedLoans = loans.slice(startIndex, endIndex);

  return {
    loans: paginatedLoans,
    pagination: {
      page,
      limit,
      total: loans.length,
      totalPages: Math.ceil(loans.length / limit),
    },
  };
}

export async function getLiquidationCalls(
  status?: LiquidationCall["status"]
): Promise<LiquidationCall[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let calls = generateMockLiquidationCalls();

  if (status) {
    calls = calls.filter((call) => call.status === status);
  }

  return calls;
}

export async function getLiquidationCallStats() {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const calls = generateMockLiquidationCalls();

  return {
    totalCalls: calls.length,
    pendingCalls: calls.filter((c) => c.status === "pending").length,
    processingCalls: calls.filter((c) => c.status === "processing").length,
  };
}

export async function getExchangeStatus(): Promise<ExchangeStatus[]> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  return [
    {
      exchange: "upbit",
      connected: true,
      latency: 45,
      lastChecked: new Date().toISOString(),
      currentPrice: {
        BTC: 50000000,
        ETH: 3000000,
        USDT: 1300,
        USDC: 1300,
        SOL: 80000,
      },
    },
    {
      exchange: "bithumb",
      connected: true,
      latency: 52,
      lastChecked: new Date().toISOString(),
      currentPrice: {
        BTC: 49950000,
        ETH: 2995000,
        USDT: 1298,
        USDC: 1299,
        SOL: 79500,
      },
    },
  ];
}

// 대출 상품 Mock 데이터 (고객용 프론트와 동일)
const MOCK_LOAN_PRODUCTS: AdminBankLoanProduct[] = [
  {
    id: "jb-btc-short",
    productName: "비트코인 담보 단기대출",
    bankName: "전북은행",
    collateralAsset: "BTC",
    loanTerm: "1개월",
    ltv: 60,
    interestRate: 3.5,
    minLoanAmount: 1000000,
    maxLoanAmount: 100000000,
    earlyRepaymentFee: "면제",
    additionalCollateralAllowed: true,
    features: ["24시간 신청", "즉시 승인", "조기상환 수수료 면제"],
    description: "비트코인을 담보로 한 단기 대출 상품",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-btc-medium",
    productName: "비트코인 담보 중기대출",
    bankName: "전북은행",
    collateralAsset: "BTC",
    loanTerm: "3개월",
    ltv: 65,
    interestRate: 4.0,
    minLoanAmount: 2000000,
    maxLoanAmount: 200000000,
    earlyRepaymentFee: "원금의 0.5%",
    additionalCollateralAllowed: true,
    features: ["담보 추가 가능", "이자 분납 가능"],
    description: "비트코인을 담보로 한 중기 대출 상품",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-btc-long",
    productName: "비트코인 담보 장기대출",
    bankName: "전북은행",
    collateralAsset: "BTC",
    loanTerm: "1년",
    ltv: 70,
    interestRate: 4.8,
    minLoanAmount: 5000000,
    maxLoanAmount: 500000000,
    earlyRepaymentFee: "원금의 1.0%",
    additionalCollateralAllowed: true,
    features: ["최대 LTV 70%", "장기 저금리"],
    description: "비트코인을 담보로 한 장기 대출 상품",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-eth-short",
    productName: "이더리움 담보 단기대출",
    bankName: "전북은행",
    collateralAsset: "ETH",
    loanTerm: "1개월",
    ltv: 55,
    interestRate: 3.8,
    minLoanAmount: 1000000,
    maxLoanAmount: 80000000,
    earlyRepaymentFee: "면제",
    additionalCollateralAllowed: true,
    features: ["24시간 신청", "조기상환 수수료 면제"],
    description: "이더리움을 담보로 한 단기 대출 상품",
    isActive: true,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-eth-medium",
    productName: "이더리움 담보 중기대출",
    bankName: "전북은행",
    collateralAsset: "ETH",
    loanTerm: "6개월",
    ltv: 60,
    interestRate: 4.3,
    minLoanAmount: 3000000,
    maxLoanAmount: 150000000,
    earlyRepaymentFee: "원금의 0.8%",
    additionalCollateralAllowed: true,
    features: ["중기 안정성", "담보 추가 가능"],
    description: "이더리움을 담보로 한 중기 대출 상품",
    isActive: true,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-usdt-stable",
    productName: "테더 담보 안정형대출",
    bankName: "전북은행",
    collateralAsset: "USDT",
    loanTerm: "3개월",
    ltv: 80,
    interestRate: 3.2,
    minLoanAmount: 500000,
    maxLoanAmount: 300000000,
    earlyRepaymentFee: "면제",
    additionalCollateralAllowed: false,
    features: ["최고 LTV 80%", "안정적 담보", "낮은 금리"],
    description: "안정적인 테더를 담보로 한 저금리 대출 상품",
    isActive: true,
    createdAt: "2025-01-03T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-multi-premium",
    productName: "다중자산 담보 프리미엄",
    bankName: "전북은행",
    collateralAsset: "BTC, ETH, USDT",
    loanTerm: "6개월",
    ltv: 75,
    interestRate: 4.5,
    minLoanAmount: 10000000,
    maxLoanAmount: 1000000000,
    earlyRepaymentFee: "원금의 0.3%",
    additionalCollateralAllowed: true,
    features: ["다중 자산 담보", "대용량 대출", "프리미엄 서비스"],
    description: "여러 가상자산을 함께 담보로 하는 프리미엄 대출 상품",
    isActive: true,
    createdAt: "2025-01-04T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-btc-premium",
    productName: "비트코인 VIP 대출",
    bankName: "전북은행",
    collateralAsset: "BTC",
    loanTerm: "1년",
    ltv: 75,
    interestRate: 4.2,
    minLoanAmount: 50000000,
    maxLoanAmount: 2000000000,
    earlyRepaymentFee: "면제",
    additionalCollateralAllowed: true,
    features: ["VIP 전용", "최우대 금리", "전담 매니저"],
    description: "고액 고객을 위한 VIP 비트코인 담보 대출",
    isActive: false,
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-eth-auto",
    productName: "이더리움 자동연장대출",
    bankName: "전북은행",
    collateralAsset: "ETH",
    loanTerm: "3개월 (자동연장)",
    ltv: 65,
    interestRate: 4.1,
    minLoanAmount: 2000000,
    maxLoanAmount: 120000000,
    earlyRepaymentFee: "면제",
    additionalCollateralAllowed: true,
    features: ["자동 연장", "갱신 수수료 무료", "유연한 관리"],
    description: "자동으로 연장되는 이더리움 담보 대출 상품",
    isActive: true,
    createdAt: "2025-01-06T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "jb-usdt-express",
    productName: "테더 초고속대출",
    bankName: "전북은행",
    collateralAsset: "USDT",
    loanTerm: "1개월",
    ltv: 70,
    interestRate: 3.0,
    minLoanAmount: 300000,
    maxLoanAmount: 50000000,
    earlyRepaymentFee: "면제",
    additionalCollateralAllowed: false,
    features: ["1분 승인", "즉시 실행", "초저금리"],
    description: "1분 내 승인되는 초고속 테더 담보 대출",
    isActive: true,
    createdAt: "2025-01-07T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
];

export async function getLoanProducts(): Promise<AdminBankLoanProduct[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_LOAN_PRODUCTS;
}

export async function getLoanProductStats(): Promise<ProductStats[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return MOCK_LOAN_PRODUCTS.map((product) => ({
    productId: product.id,
    totalApplications: Math.floor(Math.random() * 100) + 20,
    approvedCount: Math.floor(Math.random() * 80) + 15,
    rejectedCount: Math.floor(Math.random() * 10),
    activeLoans: Math.floor(Math.random() * 50) + 5,
    totalLoanAmount: (Math.floor(Math.random() * 500) + 100) * 10000000,
    averageHealthFactor: 1.3 + Math.random() * 0.5,
    approvalRate: 75 + Math.random() * 20,
  }));
}

export async function toggleLoanProductStatus(productId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const product = MOCK_LOAN_PRODUCTS.find((p) => p.id === productId);
  if (product) {
    product.isActive = !product.isActive;
    product.updatedAt = new Date().toISOString();
  }
}

// ============================================================================
// 알림 관리 Mock 데이터 및 함수
// ============================================================================

const MOCK_ALERT_CONFIGS: AlertConfig[] = [
  {
    id: "alert-config-1",
    type: "health_factor",
    threshold: 1.5,
    enabled: true,
    channels: ["email", "sms"],
    message: "헬스팩터가 1.5 이하로 떨어졌습니다.",
    severity: "warning",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "alert-config-2",
    type: "health_factor",
    threshold: 1.2,
    enabled: true,
    channels: ["email", "sms"],
    message: "헬스팩터가 1.2 이하로 떨어졌습니다. 즉시 확인이 필요합니다.",
    severity: "high",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "alert-config-3",
    type: "health_factor",
    threshold: 1.0,
    enabled: true,
    channels: ["email", "sms"],
    message: "청산 위험! 헬스팩터가 1.0 이하입니다.",
    severity: "critical",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "alert-config-4",
    type: "price_change",
    threshold: 10,
    enabled: true,
    channels: ["email"],
    message: "담보 자산 가격이 10% 이상 변동되었습니다.",
    severity: "info",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "alert-config-5",
    type: "liquidation",
    threshold: 0,
    enabled: true,
    channels: ["email", "sms"],
    message: "청산이 실행되었습니다.",
    severity: "critical",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  },
];

let MOCK_ALERTS: Alert[] = [
  {
    id: "alert-1",
    type: "health_factor",
    loanId: "loan-0-0",
    customerId: "cust-1",
    customerName: "김철수",
    message: "헬스팩터가 1.2 이하로 떨어졌습니다. 즉시 확인이 필요합니다.",
    severity: "high",
    sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    channels: ["email", "sms"],
    read: false,
    details: {
      healthFactor: 1.15,
      collateralAsset: "BTC",
      loanAmount: 15000000,
    },
  },
  {
    id: "alert-2",
    type: "health_factor",
    loanId: "loan-1-1",
    customerId: "cust-2",
    customerName: "이영희",
    message: "헬스팩터가 1.5 이하로 떨어졌습니다.",
    severity: "warning",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    channels: ["email", "sms"],
    read: false,
    details: {
      healthFactor: 1.42,
      collateralAsset: "ETH",
      loanAmount: 18000000,
    },
  },
  {
    id: "alert-3",
    type: "liquidation",
    loanId: "loan-3-0",
    customerId: "cust-4",
    customerName: "정수진",
    message: "청산이 실행되었습니다.",
    severity: "critical",
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    channels: ["email", "sms"],
    read: true,
    details: {
      healthFactor: 0.89,
      collateralAsset: "BTC",
      loanAmount: 25000000,
      liquidatedAmount: 25000000,
    },
  },
  {
    id: "alert-4",
    type: "price_change",
    loanId: "loan-2-2",
    customerId: "cust-3",
    customerName: "박민수",
    message: "담보 자산 가격이 10% 이상 변동되었습니다.",
    severity: "info",
    sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    channels: ["email"],
    read: true,
    details: {
      asset: "USDT",
      priceChange: -12.5,
      oldPrice: 1300,
      newPrice: 1137.5,
    },
  },
  {
    id: "alert-5",
    type: "health_factor",
    loanId: "loan-0-1",
    customerId: "cust-1",
    customerName: "김철수",
    message: "청산 위험! 헬스팩터가 1.0 이하입니다.",
    severity: "critical",
    sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    channels: ["email", "sms"],
    read: false,
    details: {
      healthFactor: 0.95,
      collateralAsset: "ETH",
      loanAmount: 30000000,
    },
  },
  {
    id: "alert-6",
    type: "health_factor",
    loanId: "loan-4-0",
    customerId: "cust-5",
    customerName: "최동욱",
    message: "헬스팩터가 1.5 이하로 떨어졌습니다.",
    severity: "warning",
    sentAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    channels: ["email", "sms"],
    read: true,
    details: {
      healthFactor: 1.38,
      collateralAsset: "BTC",
      loanAmount: 20000000,
    },
  },
  {
    id: "alert-7",
    type: "health_factor",
    loanId: "loan-2-3",
    customerId: "cust-3",
    customerName: "박민수",
    message: "헬스팩터가 1.2 이하로 떨어졌습니다. 즉시 확인이 필요합니다.",
    severity: "high",
    sentAt: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    channels: ["email", "sms"],
    read: true,
    details: {
      healthFactor: 1.18,
      collateralAsset: "USDC",
      loanAmount: 22000000,
    },
  },
  {
    id: "alert-8",
    type: "price_change",
    loanId: "loan-1-4",
    customerId: "cust-2",
    customerName: "이영희",
    message: "담보 자산 가격이 10% 이상 변동되었습니다.",
    severity: "info",
    sentAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    channels: ["email"],
    read: true,
    details: {
      asset: "SOL",
      priceChange: 15.3,
      oldPrice: 1300,
      newPrice: 1498.9,
    },
  },
];

export async function getAlertConfigs(): Promise<AlertConfig[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_ALERT_CONFIGS;
}

export async function getAlertHistory(): Promise<Alert[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  // 최신 순으로 정렬
  return [...MOCK_ALERTS].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  );
}

export async function getRiskCustomers(): Promise<AdminBankLoan[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const allLoans = generateMockLoans();
  // 헬스팩터가 1.5 이하인 대출만 반환
  return allLoans.filter((loan) => loan.healthFactor < 1.5);
}

export async function markAlertAsRead(alertId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const alert = MOCK_ALERTS.find((a) => a.id === alertId);
  if (alert) {
    alert.read = true;
  }
}

export async function updateAlertConfig(
  configId: string,
  updates: Partial<AlertConfig>
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const config = MOCK_ALERT_CONFIGS.find((c) => c.id === configId);
  if (config) {
    Object.assign(config, updates);
    config.updatedAt = new Date().toISOString();
  }
}

export async function testAlert(configId: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 테스트 알림 발송 시뮬레이션
  console.log(`테스트 알림 발송: ${configId}`);
}

// 청산 실행 내역 Mock 데이터
const MOCK_LIQUIDATION_EXECUTIONS: LiquidationExecution[] = [
  {
    id: "exec-001",
    liquidationCallId: "liq-call-0",
    loanId: "loan-3-2",
    steps: [
      {
        step: 1,
        name: "담보 자산 평가",
        status: "completed",
        startedAt: "2025-01-15T09:00:00Z",
        completedAt: "2025-01-15T09:01:30Z",
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택 및 연결",
        status: "completed",
        startedAt: "2025-01-15T09:01:30Z",
        completedAt: "2025-01-15T09:02:00Z",
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "completed",
        startedAt: "2025-01-15T09:02:00Z",
        completedAt: "2025-01-15T09:15:20Z",
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "completed",
        startedAt: "2025-01-15T09:15:20Z",
        completedAt: "2025-01-15T09:17:45Z",
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "completed",
        startedAt: "2025-01-15T09:17:45Z",
        completedAt: "2025-01-15T09:20:00Z",
        error: null,
      },
    ],
    selectedExchange: "upbit",
    estimatedAmount: 64500000,
    actualAmount: 65000000,
    bankRepayment: 50000000,
    customerRefund: 15000000,
    startedAt: "2025-01-15T09:00:00Z",
    completedAt: "2025-01-15T09:20:00Z",
    status: "completed",
    error: null,
  },
  {
    id: "exec-002",
    liquidationCallId: "liq-call-1",
    loanId: "loan-4-1",
    steps: [
      {
        step: 1,
        name: "담보 자산 평가",
        status: "completed",
        startedAt: "2025-01-14T14:30:00Z",
        completedAt: "2025-01-14T14:31:15Z",
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택 및 연결",
        status: "completed",
        startedAt: "2025-01-14T14:31:15Z",
        completedAt: "2025-01-14T14:31:45Z",
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "completed",
        startedAt: "2025-01-14T14:31:45Z",
        completedAt: "2025-01-14T14:48:30Z",
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "completed",
        startedAt: "2025-01-14T14:48:30Z",
        completedAt: "2025-01-14T14:50:20Z",
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "completed",
        startedAt: "2025-01-14T14:50:20Z",
        completedAt: "2025-01-14T14:52:00Z",
        error: null,
      },
    ],
    selectedExchange: "bithumb",
    estimatedAmount: 29800000,
    actualAmount: 30000000,
    bankRepayment: 18000000,
    customerRefund: 12000000,
    startedAt: "2025-01-14T14:30:00Z",
    completedAt: "2025-01-14T14:52:00Z",
    status: "completed",
    error: null,
  },
  {
    id: "exec-003",
    liquidationCallId: "liq-call-2",
    loanId: "loan-3-0",
    steps: [
      {
        step: 1,
        name: "담보 자산 평가",
        status: "completed",
        startedAt: "2025-01-13T11:00:00Z",
        completedAt: "2025-01-13T11:01:40Z",
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택 및 연결",
        status: "completed",
        startedAt: "2025-01-13T11:01:40Z",
        completedAt: "2025-01-13T11:02:10Z",
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "completed",
        startedAt: "2025-01-13T11:02:10Z",
        completedAt: "2025-01-13T11:25:45Z",
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "completed",
        startedAt: "2025-01-13T11:25:45Z",
        completedAt: "2025-01-13T11:28:30Z",
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "completed",
        startedAt: "2025-01-13T11:28:30Z",
        completedAt: "2025-01-13T11:31:00Z",
        error: null,
      },
    ],
    selectedExchange: "upbit",
    estimatedAmount: 24900000,
    actualAmount: 25000000,
    bankRepayment: 15000000,
    customerRefund: 10000000,
    startedAt: "2025-01-13T11:00:00Z",
    completedAt: "2025-01-13T11:31:00Z",
    status: "completed",
    error: null,
  },
  {
    id: "exec-004",
    liquidationCallId: "liq-call-3",
    loanId: "loan-4-3",
    steps: [
      {
        step: 1,
        name: "담보 자산 평가",
        status: "completed",
        startedAt: "2025-01-12T16:15:00Z",
        completedAt: "2025-01-12T16:16:20Z",
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택 및 연결",
        status: "completed",
        startedAt: "2025-01-12T16:16:20Z",
        completedAt: "2025-01-12T16:16:50Z",
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "completed",
        startedAt: "2025-01-12T16:16:50Z",
        completedAt: "2025-01-12T16:32:15Z",
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "completed",
        startedAt: "2025-01-12T16:32:15Z",
        completedAt: "2025-01-12T16:34:40Z",
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "completed",
        startedAt: "2025-01-12T16:34:40Z",
        completedAt: "2025-01-12T16:37:00Z",
        error: null,
      },
    ],
    selectedExchange: "bithumb",
    estimatedAmount: 64800000,
    actualAmount: 65000000,
    bankRepayment: 39000000,
    customerRefund: 26000000,
    startedAt: "2025-01-12T16:15:00Z",
    completedAt: "2025-01-12T16:37:00Z",
    status: "completed",
    error: null,
  },
  {
    id: "exec-005",
    liquidationCallId: "liq-call-4",
    loanId: "loan-3-4",
    steps: [
      {
        step: 1,
        name: "담보 자산 평가",
        status: "completed",
        startedAt: "2025-01-11T10:45:00Z",
        completedAt: "2025-01-11T10:46:30Z",
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택 및 연결",
        status: "completed",
        startedAt: "2025-01-11T10:46:30Z",
        completedAt: "2025-01-11T10:47:00Z",
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "completed",
        startedAt: "2025-01-11T10:47:00Z",
        completedAt: "2025-01-11T11:05:20Z",
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "completed",
        startedAt: "2025-01-11T11:05:20Z",
        completedAt: "2025-01-11T11:07:45Z",
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "completed",
        startedAt: "2025-01-11T11:07:45Z",
        completedAt: "2025-01-11T11:10:00Z",
        error: null,
      },
    ],
    selectedExchange: "upbit",
    estimatedAmount: 64700000,
    actualAmount: 65000000,
    bankRepayment: 39000000,
    customerRefund: 26000000,
    startedAt: "2025-01-11T10:45:00Z",
    completedAt: "2025-01-11T11:10:00Z",
    status: "completed",
    error: null,
  },
];

export async function getLiquidationExecutions(filters?: {
  status?: LiquidationExecution["status"][];
}): Promise<LiquidationExecution[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let executions = [...MOCK_LIQUIDATION_EXECUTIONS];

  // 상태 필터링
  if (filters?.status && filters.status.length > 0) {
    executions = executions.filter((exec) =>
      filters.status!.includes(exec.status)
    );
  }

  // 최신 순으로 정렬
  return executions.sort(
    (a, b) =>
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );
}

export async function getLiquidationStats(): Promise<{
  completedExecutions: number;
  totalLiquidatedAmount: number;
  totalBankRepayment: number;
  totalCustomerRefund: number;
}> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const completedExecutions = MOCK_LIQUIDATION_EXECUTIONS.filter(
    (exec) => exec.status === "completed"
  );

  const totalLiquidatedAmount = completedExecutions.reduce(
    (sum, exec) => sum + exec.actualAmount,
    0
  );

  const totalBankRepayment = completedExecutions.reduce(
    (sum, exec) => sum + exec.bankRepayment,
    0
  );

  const totalCustomerRefund = completedExecutions.reduce(
    (sum, exec) => sum + exec.customerRefund,
    0
  );

  return {
    completedExecutions: completedExecutions.length,
    totalLiquidatedAmount,
    totalBankRepayment,
    totalCustomerRefund,
  };
}

/**
 * 청산 시작
 */
export async function startLiquidation(
  liquidationCallId: string,
  exchangeId: string
): Promise<LiquidationExecution> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const newExecution: LiquidationExecution = {
    id: `exec-${Date.now()}`,
    liquidationCallId,
    loanId: `loan-${Date.now()}`,
    steps: [
      {
        step: 1,
        name: "담보 자산 평가",
        status: "in_progress",
        startedAt: new Date().toISOString(),
        completedAt: null,
        error: null,
      },
      {
        step: 2,
        name: "거래소 선택 및 연결",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
      {
        step: 3,
        name: "자산 매각",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
      {
        step: 4,
        name: "은행 상환",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
      {
        step: 5,
        name: "고객 환급",
        status: "pending",
        startedAt: null,
        completedAt: null,
        error: null,
      },
    ],
    selectedExchange: exchangeId as "upbit" | "bithumb",
    estimatedAmount: 0,
    actualAmount: 0,
    bankRepayment: 0,
    customerRefund: 0,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    completedAt: null,
    error: null,
  };

  return newExecution;
}

/**
 * 대출 상품 생성
 */
export async function createLoanProduct(
  product: LoanProductRequest
): Promise<AdminBankLoanProduct> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const newProduct: AdminBankLoanProduct = {
    id: `prod-${Date.now()}`,
    productName: product.productName,
    bankName: product.bankName,
    collateralAsset: product.collateralAsset,
    loanTerm: product.loanTerm,
    ltv: product.ltv,
    interestRate: product.interestRate,
    minLoanAmount: product.minLoanAmount,
    maxLoanAmount: product.maxLoanAmount,
    earlyRepaymentFee: product.earlyRepaymentFee,
    additionalCollateralAllowed: product.additionalCollateralAllowed,
    features: product.features,
    description: product.description,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newProduct;
}

/**
 * 대출 상품 수정
 */
export async function updateLoanProduct(
  productId: string,
  updates: Partial<LoanProductRequest>
): Promise<AdminBankLoanProduct> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const product = MOCK_LOAN_PRODUCTS.find((p) => p.id === productId);
  if (!product) {
    throw new Error("상품을 찾을 수 없습니다.");
  }

  const updatedProduct: AdminBankLoanProduct = {
    ...product,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  return updatedProduct;
}
