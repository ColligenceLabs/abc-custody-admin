/**
 * 전북은행 대출 서비스 Mock 데이터
 */

import { BankLoanProduct, CollateralAsset, BankLoan } from "@/types/lending";

/**
 * 전북은행 대출 상품 목록
 */
export const MOCK_BANK_LOAN_PRODUCTS: BankLoanProduct[] = [
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
    description: "비트코인을 담보로 한 단기 대출 상품"
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
    description: "비트코인을 담보로 한 중기 대출 상품"
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
    description: "비트코인을 담보로 한 장기 대출 상품"
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
    description: "이더리움을 담보로 한 단기 대출 상품"
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
    description: "이더리움을 담보로 한 중기 대출 상품"
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
    description: "안정적인 테더를 담보로 한 저금리 대출 상품"
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
    description: "여러 가상자산을 함께 담보로 하는 프리미엄 대출 상품"
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
    description: "고액 고객을 위한 VIP 비트코인 담보 대출"
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
    description: "자동으로 연장되는 이더리움 담보 대출 상품"
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
    description: "1분 내 승인되는 초고속 테더 담보 대출"
  }
];

/**
 * 보유 자산 (담보 가능한 자산)
 */
export const MOCK_AVAILABLE_COLLATERAL: CollateralAsset[] = [
  {
    asset: "BTC",
    amount: 0.5,
    currentPrice: 95000000,
    value: 47500000,
    volatility: 0.045,
    supportedLTV: 75
  },
  {
    asset: "ETH",
    amount: 10,
    currentPrice: 3200000,
    value: 32000000,
    volatility: 0.055,
    supportedLTV: 70
  },
  {
    asset: "USDT",
    amount: 50000,
    currentPrice: 1320,
    value: 66000000,
    volatility: 0.005,
    supportedLTV: 80
  }
];

/**
 * 활성 대출 목록
 */
export const MOCK_ACTIVE_BANK_LOANS: BankLoan[] = [
  {
    id: "loan-001",
    product: MOCK_BANK_LOAN_PRODUCTS[0], // 비트코인 담보 단기대출 (1개월)
    collateralAsset: MOCK_AVAILABLE_COLLATERAL[0],
    loanAmount: 30000000,
    interestRate: 3.5,
    healthFactor: 1.58,
    liquidationThreshold: 0.85,
    createdAt: "2025-09-05",
    maturityDate: "2025-10-04", // 1개월 후
    lastUpdated: new Date().toISOString(),
    status: "active",
    accruedInterest: 125000
  },
  {
    id: "loan-002",
    product: MOCK_BANK_LOAN_PRODUCTS[3], // 이더리움 담보 단기대출 (1개월)
    collateralAsset: MOCK_AVAILABLE_COLLATERAL[1],
    loanAmount: 20000000,
    interestRate: 3.8,
    healthFactor: 1.12,
    liquidationThreshold: 0.85,
    createdAt: "2025-09-20",
    maturityDate: "2025-10-19", // 1개월 후
    lastUpdated: new Date().toISOString(),
    status: "danger",
    accruedInterest: 87500
  }
];