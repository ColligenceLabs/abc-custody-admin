"use client";

import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  BanknotesIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";

interface BankLoanProduct {
  id: string;
  productName: string;
  bankName: string;
  collateralAsset: string;
  loanTerm: string;
  ltv: number;
  interestRate: number;
  minLoanAmount: number;
  maxLoanAmount: number;
  earlyRepaymentFee: string;
  additionalCollateralAllowed: boolean;
  features: string[];
  description: string;
}

interface CollateralAsset {
  asset: string;
  amount: number;
  currentPrice: number;
  value: number;
  volatility: number;
  supportedLTV: number;
}

interface LoanApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: BankLoanProduct | null;
  availableCollateral: CollateralAsset[];
  onSubmit: (product: BankLoanProduct) => void;
}

type SectionType = "guide" | "product" | "rate" | "risk";

interface AccordionSection {
  id: SectionType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function LoanApplicationModal({
  isOpen,
  onClose,
  product,
  availableCollateral,
  onSubmit,
}: LoanApplicationModalProps) {
  const [expandedSections, setExpandedSections] = useState<SectionType[]>(["guide"]);
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [loanTerm, setLoanTerm] = useState(12);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // loanTerm 문자열을 월 단위로 변환 (예: "1개월" → 1, "3개월" → 3, "1년" → 12)
  const parseLoanTermToMonths = (loanTermString: string): number => {
    if (loanTermString.includes("년")) {
      const years = parseInt(loanTermString);
      return years * 12;
    } else if (loanTermString.includes("개월")) {
      return parseInt(loanTermString);
    }
    return 12; // 기본값
  };

  // 상품의 최대 대출 기간(월)
  const maxLoanTermMonths = product ? parseLoanTermToMonths(product.loanTerm) : 12;

  // 사용 가능한 대출 기간 옵션 생성
  const getLoanTermOptions = () => {
    const allOptions = [
      { value: 1, label: "1개월" },
      { value: 3, label: "3개월" },
      { value: 6, label: "6개월" },
      { value: 12, label: "1년" },
    ];

    // 상품의 최대 기간 이하인 옵션만 반환
    return allOptions.filter(option => option.value <= maxLoanTermMonths);
  };

  const loanTermOptions = getLoanTermOptions();

  // 상품이 변경되면 대출 기간을 최대값 또는 첫 번째 옵션으로 초기화
  useEffect(() => {
    if (product && loanTermOptions.length > 0) {
      // 현재 선택된 값이 허용 범위를 벗어나면 첫 번째 옵션으로 초기화
      const validOption = loanTermOptions.find(opt => opt.value === loanTerm);
      if (!validOption) {
        setLoanTerm(loanTermOptions[0].value);
      }
    }
  }, [product, loanTerm, loanTermOptions]);

  if (!product) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value);
  };

  // 매칭되는 담보자산 찾기
  const matchingCollateral = availableCollateral.find(
    (asset) => product.collateralAsset.includes(asset.asset)
  );

  // 최대 대출 가능 금액 계산
  const maxLoanAmount = matchingCollateral
    ? Math.min(
        (matchingCollateral.value * product.ltv) / 100,
        product.maxLoanAmount
      )
    : 0;

  // 월 상환액 계산 (원리금균등분할상환)
  const calculateMonthlyPayment = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) return principal / months;

    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                   (Math.pow(1 + monthlyRate, months) - 1);
    return payment;
  };

  const monthlyPayment = calculateMonthlyPayment(loanAmount, product.interestRate, loanTerm);
  const totalPayment = monthlyPayment * loanTerm;
  const totalInterest = totalPayment - loanAmount;

  // 헬스팩터 계산
  const calculateHealthFactor = () => {
    if (!matchingCollateral) return 0;
    const liquidationThreshold = 0.85; // 85%
    return (matchingCollateral.value * liquidationThreshold) / loanAmount;
  };

  const healthFactor = calculateHealthFactor();

  const sections: AccordionSection[] = [
    {
      id: "guide",
      title: "대출신청안내",
      icon: DocumentTextIcon,
    },
    {
      id: "product",
      title: "상품정보",
      icon: InformationCircleIcon,
    },
    {
      id: "rate",
      title: "금리 및 비용",
      icon: CurrencyDollarIcon,
    },
    {
      id: "risk",
      title: "리스크관리",
      icon: ExclamationTriangleIcon,
    },
  ];

  const toggleSection = (sectionId: SectionType) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const expandAllSections = () => {
    setExpandedSections(sections.map(section => section.id));
  };

  const collapseAllSections = () => {
    setExpandedSections([]);
  };

  const handleSubmit = async () => {
    // 유효성 검증: 선택한 기간이 상품의 최대 기간을 초과하는지 확인
    if (loanTerm > maxLoanTermMonths) {
      alert(`대출 기간은 최대 ${product.loanTerm}까지 선택 가능합니다.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션
      onSubmit(product);
      onClose();
    } catch (error) {
      console.error("대출 신청 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderGuideTab = () => (
    <div className="space-y-8">
      {/* 대출 준비사항 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
          대출준비사항
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              전북은행 계좌 (본인명의)
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              담보자산 ({product.collateralAsset})
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              신분증 및 본인인증
            </li>
          </ul>
        </div>
      </div>

      {/* 이용절차 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="h-5 w-5 text-gray-600 mr-2" />
          이용절차
        </h3>
        <div className="space-y-4">
          {[
            {
              step: 1,
              title: "담보자산 확인",
              description: "보유중인 가상자산이 대출 가능한지 확인합니다."
            },
            {
              step: 2,
              title: "간편한도조회",
              description: "실명인증 및 개인신용정보 동의를 통해 대출한도를 조회합니다."
            },
            {
              step: 3,
              title: "대출조건 확인",
              description: "LTV, 금리, 기간 등 대출 조건을 확인하고 선택합니다."
            },
            {
              step: 4,
              title: "본인인증",
              description: "신분증 촬영 등 비대면으로 본인확인을 진행합니다."
            },
            {
              step: 5,
              title: "약정서 작성",
              description: "대출 약정서를 작성하고 전자서명을 진행합니다."
            },
            {
              step: 6,
              title: "대출실행",
              description: "담보 설정 완료 후 대출금을 지급합니다."
            }
          ].map((item) => (
            <div key={item.step} className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {item.step}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 심사안내 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 text-gray-600 mr-2" />
          심사안내
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700 mb-3">
            가상자산 담보 대출의 경우 담보자산 확인 시 자동심사하여 승인된 경우
            직원심사 절차를 생략하고 즉시 대출을 실행할 수 있습니다.
          </p>
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-2">아래와 같은 경우, 자동심사가 적용되지 않을 수 있습니다:</p>
            <ul className="space-y-1 ml-4">
              <li>• 담보자산 가격이 급격히 변동한 경우</li>
              <li>• 고객 신용정보가 불일치하는 경우</li>
              <li>• 기타 당행 내규에 의해 자동심사 제외 대상인 경우</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 유의사항 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2" />
          유의사항
        </h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• 대출신청정보가 당행 기준에 충족되지 않을 경우 대출이 거절될 수 있습니다.</li>
            <li>• 가상자산 가격 변동으로 인해 헬스팩터가 1.0 이하로 떨어질 경우 담보가 청산될 수 있습니다.</li>
            <li>• 담보자산의 시장 상황에 따라 대출 조건이 변경될 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderProductTab = () => (
    <div className="space-y-8">
      {/* 상품 개요 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 개요</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="font-medium text-gray-900">{product.productName}</h4>
            <p className="text-sm text-gray-600 mt-1">{product.description}</p>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">담보자산</dt>
                <dd className="text-sm text-gray-900 mt-1">{product.collateralAsset}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">LTV (담보인정비율)</dt>
                <dd className="text-sm text-gray-900 mt-1">{product.ltv}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">대출기간</dt>
                <dd className="text-sm text-gray-900 mt-1">{product.loanTerm}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">금리</dt>
                <dd className="text-sm text-gray-900 mt-1">연 {product.interestRate}%</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* 대출 한도 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">대출 한도</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">기본 한도</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">최소 대출금액</dt>
                  <dd className="text-gray-900">{formatCurrency(product.minLoanAmount)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">최대 대출금액</dt>
                  <dd className="text-gray-900">{formatCurrency(product.maxLoanAmount)}</dd>
                </div>
              </dl>
            </div>
            {matchingCollateral && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">고객님 한도</h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">보유 담보자산</dt>
                    <dd className="text-gray-900">
                      {matchingCollateral.amount} {matchingCollateral.asset}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">담보 가치</dt>
                    <dd className="text-gray-900">{formatCurrency(matchingCollateral.value)}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <dt className="text-gray-500 font-medium">최대 대출 가능</dt>
                    <dd className="text-primary-600 font-semibold">{formatCurrency(maxLoanAmount)}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상품 특징 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 특징</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
              <span className="text-sm text-gray-900">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 상환 방식 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">상환 방식</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <BanknotesIcon className="h-6 w-6 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-gray-900">원리금균등분할상환</h4>
              <p className="text-sm text-gray-600 mt-1">
                원금과 이자의 합을 매월 동일한 금액으로 갚아가는 방식입니다.
                매월 일정한 금액을 상환하므로 상환 계획을 세우기 쉽습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRateTab = () => (
    <div className="space-y-8">
      {/* 대출 계산기 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CalculatorIcon className="h-5 w-5 text-gray-600 mr-2" />
          대출 계산기
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            {/* 대출금액 슬라이더 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대출금액: {formatCurrency(loanAmount)}
              </label>
              <input
                type="range"
                min={product.minLoanAmount}
                max={maxLoanAmount}
                step={100000}
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{formatCurrency(product.minLoanAmount)}</span>
                <span>{formatCurrency(maxLoanAmount)}</span>
              </div>
            </div>

            {/* 대출기간 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대출기간
                <span className="ml-2 text-xs text-gray-500">
                  (최대 {product.loanTerm}까지 선택 가능)
                </span>
              </label>
              <select
                value={loanTerm}
                onChange={(e) => setLoanTerm(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
              >
                {loanTermOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 계산 결과 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">상환 정보</h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-600">월 상환액</dt>
                  <dd className="text-gray-900 font-medium">{formatCurrency(monthlyPayment)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">총 상환액</dt>
                  <dd className="text-gray-900">{formatCurrency(totalPayment)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">총 이자</dt>
                  <dd className="text-red-600">{formatCurrency(totalInterest)}</dd>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <dt className="text-gray-600">헬스팩터</dt>
                  <dd className={`font-medium ${
                    healthFactor >= 1.5 ? 'text-sky-600' :
                    healthFactor >= 1.2 ? 'text-yellow-600' :
                    healthFactor >= 1.0 ? 'text-orange-600' : 'text-red-600'
                  }`}>
                    {healthFactor.toFixed(2)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* 금리 정보 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">금리 정보</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  구분
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  비고
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  기준금리
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  연 2.97%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  시장기준금리 적용
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  적용금리
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  연 {product.interestRate}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  신용등급별 차등
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  우대금리
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  최대 -0.5%p
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  거래실적별 적용
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 수수료 정보 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">수수료 정보</h3>
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3">조기상환수수료</h4>
            <p className="text-sm text-gray-900">{product.earlyRepaymentFee}</p>
            {product.earlyRepaymentFee !== "면제" && (
              <p className="text-xs text-gray-500 mt-2">
                중도상환대출금액 × 0.44% × (대출잔여일수 ÷ 대출기간)
              </p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3">인지세</h4>
            <div className="text-sm text-gray-900">
              <p>대출약정 체결시 납부하는 세금 (고객과 은행 50%씩 부담)</p>
              <ul className="mt-2 space-y-1 text-gray-600">
                <li>• 5천만원 이하: 비과세</li>
                <li>• 5천만원 초과 ~ 1억원 이하: 70,000원 (고객부담: 35,000원)</li>
                <li>• 1억원 초과 ~ 10억원 이하: 150,000원 (고객부담: 75,000원)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRiskTab = () => (
    <div className="space-y-8">
      {/* 헬스팩터 설명 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="h-5 w-5 text-gray-600 mr-2" />
          헬스팩터 관리
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-3">
              헬스팩터는 담보자산 가치 대비 대출금의 안전성을 나타내는 지표입니다.
              헬스팩터가 1.0 이하로 떨어지면 담보가 청산될 수 있습니다.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900 mb-2">계산 공식</p>
              <p className="text-sm text-gray-700 font-mono">
                헬스팩터 = (담보자산 가치 × 청산기준) ÷ 대출금액
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { min: 1.5, label: "안전", color: "text-gray-700 bg-gray-50 border-gray-200" },
              { min: 1.2, label: "주의", color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
              { min: 1.0, label: "위험", color: "text-orange-600 bg-orange-50 border-orange-200" },
              { min: 0, label: "청산", color: "text-red-600 bg-red-50 border-red-200" }
            ].map((level, index) => (
              <div key={index} className={`p-3 rounded-lg border ${level.color}`}>
                <div className="text-xs font-medium mb-1">
                  {level.min > 0 ? `${level.min}+` : "< 1.0"}
                </div>
                <div className="text-sm font-semibold">{level.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 청산 프로세스 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2" />
          청산 프로세스
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="space-y-4">
            {[
              {
                title: "1차 경고 (헬스팩터 1.2 이하)",
                description: "SMS, 이메일을 통한 알림 발송",
                color: "text-yellow-600"
              },
              {
                title: "2차 경고 (헬스팩터 1.1 이하)",
                description: "추가 담보 제공 또는 부분 상환 권고",
                color: "text-orange-600"
              },
              {
                title: "청산 실행 (헬스팩터 1.0 이하)",
                description: "담보자산 자동 매각 및 대출금 회수",
                color: "text-red-600"
              }
            ].map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-3 h-3 rounded-full ${step.color.replace('text-', 'bg-')} mt-2`}></div>
                <div>
                  <h4 className={`font-medium ${step.color}`}>{step.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 리스크 관리 방법 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">리스크 관리 방법</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-gray-600 mr-2" />
              담보 추가
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              헬스팩터가 낮아질 때 추가 담보를 제공하여 안전성을 높일 수 있습니다.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 실시간 담보 추가 가능</li>
              <li>• 수수료 없음</li>
              <li>• 즉시 헬스팩터 개선</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <BanknotesIcon className="h-5 w-5 text-gray-600 mr-2" />
              부분 상환
            </h4>
            <p className="text-sm text-gray-700 mb-3">
              대출금의 일부를 상환하여 헬스팩터를 개선할 수 있습니다.
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• 언제든지 부분 상환 가능</li>
              <li>• 조기상환수수료 적용</li>
              <li>• 이자 절약 효과</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 실시간 모니터링 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">실시간 모니터링</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="h-6 w-6 text-gray-600 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900">24시간 모니터링 서비스</h4>
              <p className="text-sm text-gray-700 mt-1">
                가상자산 가격 변동을 실시간으로 모니터링하고, 헬스팩터 변화를 즉시 알려드립니다.
              </p>
              <ul className="text-sm text-gray-600 mt-3 space-y-1">
                <li>• 가격 변동 실시간 알림</li>
                <li>• 헬스팩터 변화 추적</li>
                <li>• 청산 위험 사전 경고</li>
                <li>• 모바일 앱 푸시 알림</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* 헤더 */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                  <div>
                    <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900">
                      {product.productName}
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      {product.bankName} · {product.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md bg-white p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* 모두 펼치기/접기 버튼 */}
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={expandAllSections}
                      className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    >
                      모두 펼치기
                    </button>
                    <button
                      type="button"
                      onClick={collapseAllSections}
                      className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                    >
                      모두 접기
                    </button>
                  </div>
                </div>

                {/* 아코디언 콘텐츠 */}
                <div className="max-h-[70vh] overflow-y-auto">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSections.includes(section.id);

                    return (
                      <div key={section.id} className="border-b border-gray-200">
                        {/* 아코디언 헤더 */}
                        <button
                          type="button"
                          onClick={() => toggleSection(section.id)}
                          className="w-full px-6 py-4 bg-white hover:bg-gray-50 flex items-center justify-between text-left transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="text-lg font-medium text-gray-900">
                              {section.title}
                            </span>
                          </div>
                          {isExpanded ? (
                            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>

                        {/* 아코디언 콘텐츠 */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                          <div className="px-6 pb-6">
                            {section.id === "guide" && renderGuideTab()}
                            {section.id === "product" && renderProductTab()}
                            {section.id === "rate" && renderRateTab()}
                            {section.id === "risk" && renderRiskTab()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                  <div className="text-sm text-gray-600">
                    <p>기타 자세한 내용은 전북은행 고객상담센터(1588-4477)로 문의하시기 바랍니다.</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      onClick={onClose}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleSubmit}
                      className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          처리중...
                        </>
                      ) : (
                        "대출 신청"
                      )}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}