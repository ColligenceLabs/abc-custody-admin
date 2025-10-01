"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BanknotesIcon,
  ArrowRightIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { createPortal } from "react-dom";

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

interface LoanApplicationButtonProps {
  product: BankLoanProduct;
  hasJeonbukAccount: boolean;
  availableCollateral: CollateralAsset[];
  onApplicationClick: (product: BankLoanProduct) => void;
}

enum ApplicationStatus {
  ELIGIBLE = "eligible",
  ACCOUNT_REQUIRED = "account_required",
  INSUFFICIENT_COLLATERAL = "insufficient_collateral",
  MIN_AMOUNT_NOT_MET = "min_amount_not_met",
}

interface ApplicationStatusInfo {
  status: ApplicationStatus;
  maxLoanAmount: number;
  availableCollateralValue: number;
  message: string;
  actionText: string;
  colorClass: string;
  bgColorClass: string;
  iconColorClass: string;
  icon: any;
}

export default function LoanApplicationButton({
  product,
  hasJeonbukAccount,
  availableCollateral,
  onApplicationClick,
}: LoanApplicationButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, placement: 'bottom' });
  const [isTooltipMounted, setIsTooltipMounted] = useState(false);
  const [hoverTimer, setHoverTimer] = useState<NodeJS.Timeout | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // 툴팁 위치 계산
  const calculateTooltipPosition = () => {
    if (!buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipWidth = 320; // w-80 = 320px
    // 실제 툴팁 높이를 측정하거나 기본값 사용
    const tooltipHeight = tooltipRef.current?.offsetHeight || 250;
    const spacing = 12; // 증가된 간격으로 충돌 방지

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    // 기본적으로 하단에 표시하도록 변경
    let top = buttonRect.bottom + spacing;
    let left = buttonRect.left + buttonRect.width / 2 - tooltipWidth / 2;
    let placement = 'bottom';

    // 하단에 공간이 부족하면 상단에 표시
    if (top + tooltipHeight > viewportHeight - 10) {
      top = buttonRect.top - tooltipHeight - spacing;
      placement = 'top';

      // 상단에도 공간이 부족하면 다시 하단으로 (스크롤 고려)
      if (top < 10) {
        top = buttonRect.bottom + spacing;
        placement = 'bottom';
      }
    }

    // 좌측 경계 체크
    if (left < 10) {
      left = 10;
    }

    // 우측 경계 체크
    if (left + tooltipWidth > viewportWidth - 10) {
      left = viewportWidth - tooltipWidth - 10;
    }

    // 양쪽 모두 공간이 부족한 경우 우측/좌측에 표시 (추가 간격 적용)
    if (placement === 'bottom' && top + tooltipHeight > viewportHeight - 10) {
      top = buttonRect.top + buttonRect.height / 2 - tooltipHeight / 2;
      left = buttonRect.right + spacing + 4; // 추가 간격
      placement = 'right';

      // 우측에도 공간이 부족하면 좌측에
      if (left + tooltipWidth > viewportWidth - 10) {
        left = buttonRect.left - tooltipWidth - spacing - 4; // 추가 간격
        placement = 'left';
      }
    }

    setTooltipPosition({ top, left, placement });
  };

  // 툴팁 표시/숨김 처리 (지연 추가로 깜빡거림 방지)
  const handleMouseEnter = useCallback(() => {
    // 기존 타이머가 있다면 제거
    if (hoverTimer) {
      clearTimeout(hoverTimer);
    }

    const timer = setTimeout(() => {
      calculateTooltipPosition();
      setShowTooltip(true);
    }, 100);
    setHoverTimer(timer);
  }, [hoverTimer]);

  const handleMouseLeave = useCallback(() => {
    // 타이머 제거
    if (hoverTimer) {
      clearTimeout(hoverTimer);
      setHoverTimer(null);
    }

    setShowTooltip(false);
    setIsTooltipMounted(false);
  }, [hoverTimer]);

  // 툴팁이 마운트된 후 위치 재계산
  useEffect(() => {
    if (showTooltip && tooltipRef.current && !isTooltipMounted) {
      setIsTooltipMounted(true);
      // 다음 프레임에서 실행하여 DOM이 완전히 렌더링된 후 계산
      requestAnimationFrame(() => {
        calculateTooltipPosition();
      });
    }
  }, [showTooltip, isTooltipMounted]);

  // 윈도우 리사이즈 시 위치 재계산
  useEffect(() => {
    if (showTooltip) {
      const handleResize = () => calculateTooltipPosition();
      const handleScroll = () => calculateTooltipPosition();

      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, [showTooltip]);

  // 해당 상품의 담보자산에 해당하는 보유 자산 찾기
  const getMatchingCollateral = (): CollateralAsset[] => {
    const supportedAssets = product.collateralAsset.split(',').map(asset => asset.trim());
    return availableCollateral.filter(asset =>
      supportedAssets.includes(asset.asset)
    );
  };

  // 최대 대출 가능 금액 계산
  const calculateMaxLoanAmount = (): number => {
    const matchingCollateral = getMatchingCollateral();
    if (matchingCollateral.length === 0) return 0;

    const totalCollateralValue = matchingCollateral.reduce((sum, asset) => {
      const effectiveLTV = Math.min(product.ltv, asset.supportedLTV);
      return sum + (asset.value * effectiveLTV / 100);
    }, 0);

    return Math.min(totalCollateralValue, product.maxLoanAmount);
  };

  // 신청 상태 결정
  const getApplicationStatus = (): ApplicationStatusInfo => {
    // 1. 계좌 연결 확인
    if (!hasJeonbukAccount) {
      return {
        status: ApplicationStatus.ACCOUNT_REQUIRED,
        maxLoanAmount: 0,
        availableCollateralValue: 0,
        message: "전북은행 계좌 연결이 필요합니다",
        actionText: "계좌 연결",
        colorClass: "text-yellow-700",
        bgColorClass: "bg-yellow-50 hover:bg-yellow-100",
        iconColorClass: "text-yellow-600",
        icon: ExclamationTriangleIcon,
      };
    }

    const matchingCollateral = getMatchingCollateral();
    const maxLoanAmount = calculateMaxLoanAmount();
    const totalCollateralValue = matchingCollateral.reduce((sum, asset) => sum + asset.value, 0);

    // 2. 담보자산 보유 확인
    if (matchingCollateral.length === 0) {
      return {
        status: ApplicationStatus.INSUFFICIENT_COLLATERAL,
        maxLoanAmount: 0,
        availableCollateralValue: 0,
        message: `${product.collateralAsset} 담보자산이 필요합니다`,
        actionText: "담보 부족",
        colorClass: "text-orange-700",
        bgColorClass: "bg-orange-50 hover:bg-orange-100",
        iconColorClass: "text-orange-600",
        icon: ExclamationTriangleIcon,
      };
    }

    // 3. 최소 대출 금액 확인
    if (maxLoanAmount < product.minLoanAmount) {
      return {
        status: ApplicationStatus.MIN_AMOUNT_NOT_MET,
        maxLoanAmount,
        availableCollateralValue: totalCollateralValue,
        message: `최소 대출금액 ${formatCurrency(product.minLoanAmount)} 미달`,
        actionText: "금액 부족",
        colorClass: "text-gray-700",
        bgColorClass: "bg-gray-50 hover:bg-gray-100",
        iconColorClass: "text-gray-600",
        icon: InformationCircleIcon,
      };
    }

    // 4. 신청 가능
    return {
      status: ApplicationStatus.ELIGIBLE,
      maxLoanAmount,
      availableCollateralValue: totalCollateralValue,
      message: `최대 ${formatCurrency(maxLoanAmount)} 대출 가능`,
      actionText: "대출 신청",
      colorClass: "text-white",
      bgColorClass: "bg-primary-600 hover:bg-primary-700",
      iconColorClass: "text-white",
      icon: CheckCircleIcon,
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };

  const statusInfo = getApplicationStatus();
  const matchingCollateral = getMatchingCollateral();

  const handleClick = () => {
    if (statusInfo.status === ApplicationStatus.ELIGIBLE) {
      onApplicationClick(product);
    } else if (statusInfo.status === ApplicationStatus.ACCOUNT_REQUIRED) {
      // 계좌 연결 페이지로 이동
      window.location.href = "/security/accounts";
    }
  };

  const isClickable = statusInfo.status === ApplicationStatus.ELIGIBLE ||
                    statusInfo.status === ApplicationStatus.ACCOUNT_REQUIRED;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleClick}
        disabled={!isClickable}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          relative px-2 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium
          transition-all duration-200 border
          ${statusInfo.bgColorClass} ${statusInfo.colorClass}
          ${isClickable
            ? "cursor-pointer transform hover:scale-105 shadow-sm hover:shadow-md"
            : "cursor-not-allowed opacity-75"
          }
          ${statusInfo.status === ApplicationStatus.ELIGIBLE
            ? "border-primary-200 shadow-sm"
            : "border-gray-200"
          }
        `}
        aria-label={`${product.productName} ${statusInfo.actionText}`}
        aria-describedby={showTooltip ? `tooltip-${product.id}` : undefined}
      >
        <div className="flex items-center space-x-1 md:space-x-2">
          <statusInfo.icon className={`h-3 w-3 md:h-4 md:w-4 ${statusInfo.iconColorClass}`} />
          <span>{statusInfo.actionText}</span>
          {statusInfo.status === ApplicationStatus.ELIGIBLE && (
            <ArrowRightIcon className={`h-3 w-3 md:h-4 md:w-4 ${statusInfo.iconColorClass}`} />
          )}
        </div>
      </button>

      {/* 상세 정보 툴팁 - Portal로 body에 렌더링 */}
      {showTooltip && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          id={`tooltip-${product.id}`}
          className="fixed w-80 bg-white border border-gray-200 rounded-lg shadow-xl p-4 z-[9999]
                   transition-all duration-200 ease-out transform opacity-100 scale-100
                   pointer-events-none"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
          }}
          role="tooltip"
          aria-describedby={`tooltip-content-${product.id}`}
        >
          <div className="space-y-3">
            {/* 상태 메시지 */}
            <div className="flex items-start space-x-2">
              <statusInfo.icon className={`h-5 w-5 mt-0.5 ${statusInfo.iconColorClass}`} />
              <div>
                <p className="text-sm font-medium text-gray-900">{statusInfo.message}</p>
                {statusInfo.status === ApplicationStatus.ELIGIBLE && (
                  <p className="text-xs text-gray-600 mt-1">
                    신용도에 따라 실제 대출한도는 달라질 수 있습니다
                  </p>
                )}
              </div>
            </div>

            {/* 담보자산 정보 */}
            {matchingCollateral.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-700 mb-2">보유 담보자산</p>
                {matchingCollateral.map((asset) => (
                  <div key={asset.asset} className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{asset.asset}: {asset.amount.toLocaleString()}</span>
                    <span>{formatCurrency(asset.value)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 대출 조건 요약 */}
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-medium text-gray-700 mb-2">대출 조건</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>LTV: {product.ltv}%</div>
                <div>금리: 연 {product.interestRate}%</div>
                <div>기간: {product.loanTerm}</div>
                <div>수수료: {product.earlyRepaymentFee}</div>
              </div>
            </div>

            {/* 액션 가이드 */}
            {statusInfo.status !== ApplicationStatus.ELIGIBLE && (
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-700 mb-1">해결 방법</p>
                <p className="text-xs text-gray-600">
                  {statusInfo.status === ApplicationStatus.ACCOUNT_REQUIRED &&
                    "보안 설정에서 전북은행 계좌를 연결해주세요"}
                  {statusInfo.status === ApplicationStatus.INSUFFICIENT_COLLATERAL &&
                    `${product.collateralAsset} 자산을 입금해주세요`}
                  {statusInfo.status === ApplicationStatus.MIN_AMOUNT_NOT_MET &&
                    "더 많은 담보자산이 필요하거나 다른 상품을 고려해보세요"}
                </p>
              </div>
            )}
          </div>

          {/* 툴팁 화살표 - 위치에 따라 동적으로 변경 */}
          {tooltipPosition.placement === 'top' && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0
                          border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200">
            </div>
          )}
          {tooltipPosition.placement === 'bottom' && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0
                          border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-200">
            </div>
          )}
          {tooltipPosition.placement === 'left' && (
            <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0
                          border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-200">
            </div>
          )}
          {tooltipPosition.placement === 'right' && (
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0
                          border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-200">
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}