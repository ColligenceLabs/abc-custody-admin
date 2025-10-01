"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  CurrencyDollarIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  BanknotesIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { mockConnectedAccounts } from "@/data/mockAccounts";
import { RepaymentModal } from "./lending/RepaymentModal";
import { AddCollateralModal } from "./lending/AddCollateralModal";
import { RepaymentRequest, CollateralAddition } from "./lending/types";
import LoanApplicationButton from "./lending/LoanApplicationButton";
import LoanApplicationModal from "./lending/LoanApplicationModal";
import { BankLoanProduct, CollateralAsset, BankLoan } from "@/types/lending";
import {
  MOCK_BANK_LOAN_PRODUCTS,
  MOCK_AVAILABLE_COLLATERAL,
  MOCK_ACTIVE_BANK_LOANS,
} from "@/data/mockLendingData";

interface AdditionalServicesProps {
  plan: ServicePlan;
  initialTab?: "staking" | "lending" | "swap" | "krw";
}

interface StakingPosition {
  id: string;
  asset: string;
  amount: string;
  validator: string;
  apy: number;
  rewards: string;
  status: "active" | "unstaking";
}

interface LendingPosition {
  id: string;
  asset: string;
  amount: string;
  apy: number;
  earned: string;
  maturity: string;
  status: "active" | "completed";
}

// 은행 대출 서비스 타입 정의

interface HealthFactorLevel {
  min: number;
  max: number;
  status: "safe" | "warning" | "danger" | "liquidation";
  color: string;
  bgColor: string;
  label: string;
}

interface PriceFeed {
  asset: string;
  upbitPrice: number;
  bithumbPrice: number;
  averagePrice: number;
  change24h: number;
  lastUpdated: string;
}

export default function AdditionalServices({
  plan,
  initialTab,
}: AdditionalServicesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<
    "staking" | "lending" | "swap" | "krw"
  >(initialTab || "staking");

  // 대출 페이지 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 상태 관리
  const [repaymentModalOpen, setRepaymentModalOpen] = useState(false);
  const [collateralModalOpen, setCollateralModalOpen] = useState(false);
  const [loanApplicationModalOpen, setLoanApplicationModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<BankLoan | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<BankLoanProduct | null>(null);

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: "staking" | "lending" | "swap" | "krw") => {
    setActiveTab(newTab);
    router.push(`/services/${newTab}`);
  };

  // 모달 핸들러 함수들
  const handleRepaymentClick = (loan: BankLoan) => {
    setSelectedLoan(loan);
    setRepaymentModalOpen(true);
  };

  const handleCollateralClick = (loan: BankLoan) => {
    setSelectedLoan(loan);
    setCollateralModalOpen(true);
  };

  // 대출 신청 핸들러
  const handleLoanApplication = (product: BankLoanProduct) => {
    setSelectedProduct(product);
    setLoanApplicationModalOpen(true);
  };

  const handleRepaymentSubmit = (request: RepaymentRequest) => {
    console.log("상환 신청:", request);
    // 실제 상환 로직 구현
    alert(`대출 상환이 신청되었습니다. (${request.type === "full" ? "전액" : "부분"} 상환)`);
    setRepaymentModalOpen(false);
    setSelectedLoan(null);
  };

  const handleCollateralSubmit = (addition: CollateralAddition) => {
    console.log("담보 추가:", addition);
    // 실제 담보 추가 로직 구현
    alert(`담보가 추가되었습니다. (${addition.assets.length}개 자산)`);
    setCollateralModalOpen(false);
    setSelectedLoan(null);
  };

  const closeModals = () => {
    setRepaymentModalOpen(false);
    setCollateralModalOpen(false);
    setLoanApplicationModalOpen(false);
    setSelectedLoan(null);
    setSelectedProduct(null);
  };

  // 대출 신청 완료 핸들러
  const handleLoanApplicationSubmit = (product: BankLoanProduct) => {
    console.log("대출 신청 완료:", product);
    // 실제 대출 신청 API 호출
    alert(`${product.productName} 신청이 완료되었습니다. 심사 결과는 1-2일 내에 안내해드립니다.`);
  };

  const stakingPositions: StakingPosition[] = [
    {
      id: "1",
      asset: "ETH",
      amount: "32.0",
      validator: "Ethereum 2.0",
      apy: 4.2,
      rewards: "1.344",
      status: "active",
    },
    {
      id: "2",
      asset: "SOL",
      amount: "500",
      validator: "Solana Validator",
      apy: 6.8,
      rewards: "34.0",
      status: "active",
    },
  ];

  // 헬스팩터 레벨 정의 (눈의 피로를 줄이는 부드러운 색상)
  const healthFactorLevels: HealthFactorLevel[] = [
    { min: 1.5, max: Infinity, status: "safe", color: "text-sky-600", bgColor: "bg-sky-50", label: "안전" },
    { min: 1.2, max: 1.5, status: "warning", color: "text-amber-600", bgColor: "bg-amber-50", label: "주의" },
    { min: 1.0, max: 1.2, status: "danger", color: "text-orange-600", bgColor: "bg-orange-50", label: "위험" },
    { min: 0, max: 1.0, status: "liquidation", color: "text-rose-600", bgColor: "bg-rose-50", label: "청산" }
  ];

  // Mock 데이터 import
  const bankLoanProducts = MOCK_BANK_LOAN_PRODUCTS;
  const availableCollateral = MOCK_AVAILABLE_COLLATERAL;
  const activeBankLoans = MOCK_ACTIVE_BANK_LOANS;

  // 실시간 가격 피드 (시뮬레이션)
  const priceFeed: PriceFeed[] = [
    {
      asset: "BTC",
      upbitPrice: 95200000,
      bithumbPrice: 94800000,
      averagePrice: 95000000,
      change24h: 2.3,
      lastUpdated: new Date().toISOString()
    },
    {
      asset: "ETH",
      upbitPrice: 3220000,
      bithumbPrice: 3180000,
      averagePrice: 3200000,
      change24h: -1.2,
      lastUpdated: new Date().toISOString()
    },
    {
      asset: "USDT",
      upbitPrice: 1322,
      bithumbPrice: 1318,
      averagePrice: 1320,
      change24h: 0.1,
      lastUpdated: new Date().toISOString()
    }
  ];

  const lendingPositions: LendingPosition[] = [
    {
      id: "1",
      asset: "USDC",
      amount: "50000",
      apy: 8.5,
      earned: "4250",
      maturity: "2024-06-15",
      status: "active",
    },
    {
      id: "2",
      asset: "KRW",
      amount: "25000",
      apy: 7.2,
      earned: "1800",
      maturity: "2024-05-30",
      status: "active",
    },
  ];

  const formatCurrency = (value: number | string) => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(numValue);
  };

  // 헬스팩터 계산 함수
  const calculateHealthFactor = (collateralValue: number, liquidationThreshold: number, loanAmount: number): number => {
    if (loanAmount === 0) return Infinity;
    return (collateralValue * liquidationThreshold) / loanAmount;
  };

  // 헬스팩터 레벨 반환 함수
  const getHealthFactorLevel = (healthFactor: number): HealthFactorLevel => {
    return healthFactorLevels.find(level =>
      healthFactor >= level.min && healthFactor < level.max
    ) || healthFactorLevels[healthFactorLevels.length - 1];
  };

  // 남은 일수 계산
  const calculateRemainingDays = (maturityDate: string): number => {
    const today = new Date();
    const maturity = new Date(maturityDate);
    const diffTime = maturity.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 남은 기간 포맷팅
  const formatRemainingTerm = (maturityDate: string): { text: string; color: string; bgColor: string } => {
    const remainingDays = calculateRemainingDays(maturityDate);

    if (remainingDays < 0) {
      return { text: "만기 도래", color: "text-gray-600", bgColor: "bg-gray-100" };
    } else if (remainingDays === 0) {
      return { text: "오늘 만기", color: "text-red-600", bgColor: "bg-red-50" };
    } else if (remainingDays <= 7) {
      return { text: `${remainingDays}일 남음`, color: "text-red-600", bgColor: "bg-red-50" };
    } else if (remainingDays <= 30) {
      return { text: `${remainingDays}일 남음`, color: "text-yellow-600", bgColor: "bg-yellow-50" };
    } else if (remainingDays <= 90) {
      const months = Math.floor(remainingDays / 30);
      const days = remainingDays % 30;
      return {
        text: days > 0 ? `${months}개월 ${days}일 남음` : `${months}개월 남음`,
        color: "text-sky-600",
        bgColor: "bg-sky-50"
      };
    } else {
      const months = Math.floor(remainingDays / 30);
      return { text: `${months}개월 남음`, color: "text-sky-600", bgColor: "bg-sky-50" };
    }
  };

  // 청산가 계산 함수
  const calculateLiquidationPrice = (loanAmount: number, collateralAmount: number, liquidationThreshold: number): number => {
    return loanAmount / (collateralAmount * liquidationThreshold);
  };

  // LTV 계산 함수
  const calculateLTV = (loanAmount: number, collateralValue: number): number => {
    if (collateralValue === 0) return 0;
    return (loanAmount / collateralValue) * 100;
  };

  // 최대 대출 가능 금액 계산
  const calculateMaxLoanAmount = (collateralValue: number, ltv: number): number => {
    return collateralValue * (ltv / 100);
  };

  // 담보 추가 필요 금액 계산
  const calculateRequiredCollateral = (loan: BankLoan, targetHealthFactor: number = 1.5): number => {
    const requiredCollateralValue = (loan.loanAmount * targetHealthFactor) / loan.liquidationThreshold;
    const currentCollateralValue = loan.collateralAsset.value;
    const additionalValue = requiredCollateralValue - currentCollateralValue;
    return Math.max(0, additionalValue / loan.collateralAsset.currentPrice);
  };

  // 일일 이자 계산
  const calculateDailyInterest = (principal: number, annualRate: number): number => {
    return (principal * annualRate) / 365 / 100;
  };

  const renderStaking = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">스테이킹 서비스</h2>
          <p className="text-gray-600">자산을 스테이킹하여 보상을 받아보세요</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <PlusIcon className="h-5 w-5 mr-2" />새 스테이킹
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                총 스테이킹 자산
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(42000 * 1300)}
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">누적 보상</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(1894 * 1300)}
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">평균 APY</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">4.85%</p>
            </div>
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            스테이킹 포지션
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  자산
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수량
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  검증인
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  APY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  보상
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stakingPositions.map((position) => (
                <tr key={position.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${position.asset.toLowerCase()}.png`}
                        alt={position.asset}
                        className="w-8 h-8 rounded-full mr-3"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `data:image/svg+xml;base64,${btoa(`
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                              <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                              <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                ${position.asset}
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                      <span className="font-semibold text-gray-900">
                        {position.asset}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.validator}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">
                    {position.apy}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                    {position.rewards} {position.asset}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        position.status === "active"
                          ? "text-green-600 bg-green-50"
                          : "text-yellow-600 bg-yellow-50"
                      }`}
                    >
                      {position.status === "active" ? "활성" : "언스테이킹"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLending = () => {
    const itemsPerPage = 5;

    // 전북은행 계좌 확인
    const jeonbukAccount = mockConnectedAccounts.find(
      account => account.bankCode === "037" && account.status === "connected" && account.isVerified
    );
    const hasJeonbukAccount = !!jeonbukAccount;

    // 총 대출 잔액과 담보 가치 계산
    const totalLoanAmount = activeBankLoans.reduce((sum, loan) => sum + loan.loanAmount, 0);
    const totalCollateralValue = activeBankLoans.reduce((sum, loan) => sum + loan.collateralAsset.value, 0);
    const totalAccruedInterest = activeBankLoans.reduce((sum, loan) => sum + loan.accruedInterest, 0);
    const averageHealthFactor = activeBankLoans.length > 0
      ? activeBankLoans.reduce((sum, loan) => sum + loan.healthFactor, 0) / activeBankLoans.length
      : 0;

    // 페이징 계산
    const totalPages = Math.ceil(bankLoanProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentProducts = bankLoanProducts.slice(startIndex, endIndex);

    // 페이지 변경 핸들러
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    return (
      <div className="space-y-6">
        {/* 헤더 섹션 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">가상자산 담보 대출</h2>
          <p className="text-gray-600">
            가상자산을 담보로 은행에서 원화 대출을 받아보세요
          </p>
        </div>

        {/* 대출 현황 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">총 대출 잔액</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalLoanAmount)}
                </p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">총 담보 가치</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalCollateralValue)}
                </p>
              </div>
              <ArrowTrendingUpIcon className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">누적 이자</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalAccruedInterest)}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">평균 헬스팩터</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className={`text-2xl font-bold ${
                    averageHealthFactor >= 1.5 ? 'text-green-600' :
                    averageHealthFactor >= 1.2 ? 'text-yellow-600' :
                    averageHealthFactor >= 1.0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {averageHealthFactor.toFixed(2)}
                  </p>
                  <div className="relative group">
                    <InformationCircleIcon className={`h-5 w-5 cursor-help ${
                      averageHealthFactor >= 1.5 ? 'text-green-600' :
                      averageHealthFactor >= 1.2 ? 'text-yellow-600' :
                      averageHealthFactor >= 1.0 ? 'text-orange-600' : 'text-red-600'
                    }`} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="space-y-1">
                        <div>안전: 1.5 이상</div>
                        <div>주의: 1.2~1.5</div>
                        <div>위험: 1.0~1.2</div>
                        <div>청산: 1.0 미만</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                averageHealthFactor >= 1.5 ? 'bg-green-600' :
                averageHealthFactor >= 1.2 ? 'bg-yellow-600' :
                averageHealthFactor >= 1.0 ? 'bg-orange-600' : 'bg-red-600'
              }`}>
                <span className="text-white text-xs font-bold">HF</span>
              </div>
            </div>
          </div>
        </div>

        {/* 전북은행 계좌 확인 경고 */}
        {!hasJeonbukAccount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  전북은행 계좌 연결 필요
                </h3>
                <p className="text-yellow-700 mb-4">
                  가상자산 담보 대출 서비스를 이용하기 위해서는 전북은행 계좌가 연결되어야 합니다.
                  원화 대출금 지급과 상환을 위해 필수적으로 필요합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="/security/accounts"
                    className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    계좌 연결하기
                  </a>
                  <div className="text-sm text-yellow-600">
                    💡 전북은행 계좌가 없으시면 온라인으로 개설 가능합니다
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 전북은행 대출 상품 목록 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">전북은행 대출 상품</h3>
                <p className="text-sm text-gray-600 mt-1">가상자산을 담보로 원화 대출을 신청하세요</p>
              </div>
              {hasJeonbukAccount && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircleIcon className="h-5 w-5 mr-1" />
                  전북은행 계좌 연결됨
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상품명
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    담보자산
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대출기간
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    LTV
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    금리
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    대출한도
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    조기상환수수료
                  </th>
                  <th className="px-3 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    신청
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-3 md:px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                        <div className="text-xs text-gray-500 mt-1 hidden md:block">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${product.collateralAsset.split(',')[0].trim().toLowerCase()}.png`}
                          alt={product.collateralAsset}
                          className="w-5 h-5 md:w-6 md:h-6 rounded-full mr-2"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="12" fill="#f3f4f6"/>
                                <text x="12" y="16" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="bold" fill="#6b7280">
                                  ${product.collateralAsset.split(',')[0].trim()}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <span className="text-sm font-medium text-gray-900 hidden md:inline">{product.collateralAsset}</span>
                        <span className="text-xs font-medium text-gray-900 md:hidden">{product.collateralAsset.split(',')[0].trim()}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.loanTerm}
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-blue-600">{product.ltv}%</span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        <span className="hidden md:inline">연 </span>{product.interestRate}%
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      <div>
                        <div>최소: {formatCurrency(product.minLoanAmount)}</div>
                        <div>최대: {formatCurrency(product.maxLoanAmount)}</div>
                      </div>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                      <span className={`text-sm ${product.earlyRepaymentFee === '면제' ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                        {product.earlyRepaymentFee}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                      <LoanApplicationButton
                        product={product}
                        hasJeonbukAccount={hasJeonbukAccount}
                        availableCollateral={availableCollateral}
                        onApplicationClick={handleLoanApplication}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이징 네비게이션 */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  총 {bankLoanProducts.length}개 상품 중 {startIndex + 1}-{Math.min(endIndex, bankLoanProducts.length)}개 표시
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-primary-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 활성 대출 관리 */}
        {activeBankLoans.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">활성 대출 관리</h3>
              <p className="text-sm text-gray-600 mt-1">현재 진행 중인 대출을 관리하세요</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      대출 정보
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      담보 자산
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      대출 잔액
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      헬스팩터
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      남은 기간
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      누적 이자
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeBankLoans.map((loan) => {
                    const healthLevel = getHealthFactorLevel(loan.healthFactor);
                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{loan.product.productName}</div>
                            <div className="text-sm text-gray-500">{loan.product.bankName} · 연 {loan.interestRate}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${loan.collateralAsset.asset.toLowerCase()}.png`}
                              alt={loan.collateralAsset.asset}
                              className="w-8 h-8 rounded-full mr-3"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                    <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                                    <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                      ${loan.collateralAsset.asset}
                                    </text>
                                  </svg>
                                `)}`;
                              }}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {loan.collateralAsset.amount} {loan.collateralAsset.asset}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatCurrency(loan.collateralAsset.value)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(loan.loanAmount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            LTV: {calculateLTV(loan.loanAmount, loan.collateralAsset.value).toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${healthLevel.color} ${healthLevel.bgColor}`}>
                              {loan.healthFactor.toFixed(2)} - {healthLevel.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const remaining = formatRemainingTerm(loan.maturityDate);
                            return (
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${remaining.color} ${remaining.bgColor}`}>
                                {remaining.text}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(loan.accruedInterest)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleRepaymentClick(loan)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              상환
                            </button>
                            {loan.healthFactor < 1.2 && (
                              <button
                                onClick={() => handleCollateralClick(loan)}
                                className="text-orange-600 hover:text-orange-900 transition-colors"
                              >
                                담보추가
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 실시간 가격 피드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">실시간 가격 정보</h3>
            <p className="text-sm text-gray-600 mt-1">업비트 · 빗썸 평균 가격 기준</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자산
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업비트
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    빗썸
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    평균 가격
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    24시간 변동
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {priceFeed.map((price) => (
                  <tr key={price.asset} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${price.asset.toLowerCase()}.png`}
                          alt={price.asset}
                          className="w-8 h-8 rounded-full mr-3"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                                <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                  ${price.asset}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <span className="font-semibold text-gray-900">{price.asset}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(price.upbitPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {formatCurrency(price.bithumbPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                      {formatCurrency(price.averagePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <span className={`font-medium ${
                        price.change24h >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {price.change24h >= 0 ? '+' : ''}{price.change24h.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSwap = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">토큰 교환 서비스</h2>
        <p className="text-gray-600">
          Off-chain 방식으로 빠르고 안전한 자산 교환
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">자산 교환</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              보내는 자산
            </label>
            <div className="flex space-x-2">
              <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                <option>BTC</option>
                <option>ETH</option>
                <option>USDC</option>
                <option>KRW</option>
              </select>
              <input
                type="number"
                placeholder="수량"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowsRightLeftIcon className="h-6 w-6 text-gray-400" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              받는 자산
            </label>
            <div className="flex space-x-2">
              <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                <option>ETH</option>
                <option>BTC</option>
                <option>USDC</option>
                <option>KRW</option>
              </select>
              <input
                type="number"
                placeholder="예상 수량"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                readOnly
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">교환 수수료:</span>
              <span className="font-semibold">0.25%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">슬리피지:</span>
              <span className="font-semibold">0.1%</span>
            </div>
          </div>

          <button className="w-full py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            교환하기
          </button>
        </div>
      </div>
    </div>
  );

  const renderKRW = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">구매 대행 서비스</h2>
        <p className="text-gray-600">가상자산과 원화 간의 실시간 교환 서비스</p>
      </div>

      {/* 연결된 계좌 선택 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            연결된 은행 계좌
          </h3>
          <a
            href="/security"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            계좌 관리
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 기본 계좌 예시 */}
          <div className="border border-primary-200 bg-primary-50 rounded-lg p-4 cursor-pointer hover:bg-primary-100 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">KB국민은행</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                    활성
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  ***-***-123456
                </div>
                <div className="text-xs text-gray-500">
                  일일 한도: ₩5,000,000
                </div>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">신한은행</span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    대기
                  </span>
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  ***-***-789012
                </div>
                <div className="text-xs text-gray-500">
                  일일 한도: ₩3,000,000
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg
              className="w-4 h-4 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm text-blue-800">
              구매 대행을 위해서는 연결된 은행 계좌가 필요합니다.
              <a href="/security" className="underline hover:no-underline">
                보안 설정
              </a>
              에서 계좌를 연결하세요.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 가산자산 → 원화 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            가상자산 → 원화
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매할 가상자산
              </label>
              <div className="flex space-x-2">
                <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                  <option>BTC - Bitcoin</option>
                  <option>ETH - Ethereum</option>
                  <option>SOL - Solana</option>
                  <option>KRW - Tether</option>
                  <option>USDC - USD Coin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                판매 수량
              </label>
              <input
                type="number"
                placeholder="0.1"
                step="0.00000001"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">예상 받을 금액:</span>
                <span className="font-semibold text-lg">₩9,500,000</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">교환 수수료 (0.5%):</span>
                <span className="text-red-600">-₩47,500</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-200">
                <span className="text-gray-600">실제 받을 금액:</span>
                <span className="font-bold text-green-600">₩9,452,500</span>
              </div>
            </div>
            <button
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled
            >
              가산자산 판매
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              계좌 연결 후 이용 가능합니다
            </p>
          </div>
        </div>

        {/* 원화 → 가산자산 */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            원화 → 가산자산
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구매할 가산자산
              </label>
              <div className="flex space-x-2">
                <select className="flex-1 px-3 py-2 border border-gray-200 rounded-lg">
                  <option>BTC - Bitcoin</option>
                  <option>ETH - Ethereum</option>
                  <option>SOL - Solana</option>
                  <option>KRW - Tether</option>
                  <option>USDC - USD Coin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                구매 금액 (KRW)
              </label>
              <input
                type="number"
                placeholder="1,000,000"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">예상 받을 수량:</span>
                <span className="font-semibold text-lg">0.01052 BTC</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-600">교환 수수료 (0.5%):</span>
                <span className="text-red-600">-₩5,000</span>
              </div>
              <div className="flex justify-between text-sm mt-1 pt-2 border-t border-gray-200">
                <span className="text-gray-600">실제 받을 수량:</span>
                <span className="font-bold text-green-600">0.01047 BTC</span>
              </div>
            </div>
            <button
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled
            >
              가산자산 구매
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              계좌 연결 후 이용 가능합니다
            </p>
          </div>
        </div>
      </div>

      {/* 실시간 환율 정보 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            실시간 환율 정보
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  자산
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매수가 (KRW)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매도가 (KRW)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  스프레드
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                {
                  symbol: "BTC",
                  name: "Bitcoin",
                  buyPrice: 95000000,
                  sellPrice: 94500000,
                },
                {
                  symbol: "ETH",
                  name: "Ethereum",
                  buyPrice: 3200000,
                  sellPrice: 3180000,
                },
                {
                  symbol: "SOL",
                  name: "Solana",
                  buyPrice: 150000,
                  sellPrice: 149000,
                },
                {
                  symbol: "KRW",
                  name: "Tether",
                  buyPrice: 1320,
                  sellPrice: 1310,
                },
                {
                  symbol: "USDC",
                  name: "USD Coin",
                  buyPrice: 1320,
                  sellPrice: 1310,
                },
              ].map((rate) => {
                const spread = (
                  ((rate.buyPrice - rate.sellPrice) / rate.sellPrice) *
                  100
                ).toFixed(2);
                return (
                  <tr key={rate.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${rate.symbol.toLowerCase()}.png`}
                          alt={rate.symbol}
                          className="w-8 h-8 rounded-full mr-3"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                                <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                  ${rate.symbol}
                                </text>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {rate.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {rate.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-blue-600">
                        ₩{rate.buyPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-medium text-red-600">
                        ₩{rate.sellPrice.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm text-gray-900">{spread}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: "staking", name: "스테이킹", icon: ChartBarIcon },
    { id: "lending", name: "대출", icon: BanknotesIcon },
    { id: "swap", name: "교환", icon: ArrowsRightLeftIcon },
    { id: "krw", name: "구매 대행", icon: CurrencyDollarIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">부가 서비스</h1>
        <p className="text-gray-600 mt-1">
          스테이킹, 렌딩, 교환 등 다양한 부가 서비스를 이용하세요
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === "staking" && renderStaking()}
        {activeTab === "lending" && renderLending()}
        {activeTab === "swap" && renderSwap()}
        {activeTab === "krw" && renderKRW()}
      </div>

      {/* 대출 관련 모달들 */}
      <RepaymentModal
        isOpen={repaymentModalOpen}
        onClose={closeModals}
        loan={selectedLoan}
        onSubmit={handleRepaymentSubmit}
      />

      <AddCollateralModal
        isOpen={collateralModalOpen}
        onClose={closeModals}
        loan={selectedLoan}
        availableAssets={availableCollateral}
        onSubmit={handleCollateralSubmit}
      />

      <LoanApplicationModal
        isOpen={loanApplicationModalOpen}
        onClose={closeModals}
        product={selectedProduct}
        availableCollateral={availableCollateral}
        onSubmit={handleLoanApplicationSubmit}
      />
    </div>
  );
}
