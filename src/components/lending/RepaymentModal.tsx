import { useState, useEffect } from "react";
import { XMarkIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { RepaymentRequest, RepaymentCalculation, HealthFactorLevel } from "./types";

interface BankLoan {
  id: string;
  product: {
    productName: string;
    bankName: string;
    earlyRepaymentFee: string;
  };
  collateralAsset: {
    asset: string;
    amount: number;
    value: number;
  };
  loanAmount: number;
  interestRate: number;
  healthFactor: number;
  liquidationThreshold: number;
  accruedInterest: number;
  status: string;
}

interface RepaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: BankLoan | null;
  onSubmit: (request: RepaymentRequest) => void;
}

export function RepaymentModal({
  isOpen,
  onClose,
  loan,
  onSubmit
}: RepaymentModalProps) {
  const [repaymentType, setRepaymentType] = useState<"full" | "partial">("full");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [calculation, setCalculation] = useState<RepaymentCalculation | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // 헬스팩터 레벨 계산
  const getHealthFactorLevel = (healthFactor: number): HealthFactorLevel => {
    if (healthFactor >= 2.0) {
      return {
        level: "safe",
        label: "안전",
        color: "text-sky-600",
        bgColor: "bg-sky-50"
      };
    } else if (healthFactor >= 1.5) {
      return {
        level: "moderate",
        label: "보통",
        color: "text-blue-600",
        bgColor: "bg-blue-50"
      };
    } else if (healthFactor >= 1.2) {
      return {
        level: "warning",
        label: "주의",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      };
    } else {
      return {
        level: "danger",
        label: "위험",
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
  };

  // 상환 계산
  const calculateRepayment = (type: "full" | "partial", repaymentAmount?: number): RepaymentCalculation => {
    if (!loan) {
      return {
        currentBalance: 0,
        accruedInterest: 0,
        totalPayable: 0,
        repaymentAmount: 0,
        remainingBalance: 0,
        earlyRepaymentFee: 0
      };
    }

    const currentBalance = loan.loanAmount;
    const accruedInterest = loan.accruedInterest;
    const totalPayable = currentBalance + accruedInterest;

    const paymentAmount = type === "full" ? totalPayable : (repaymentAmount || 0);
    const remainingBalance = Math.max(0, totalPayable - paymentAmount);

    // 조기상환 수수료 계산 (상품에 따라)
    let earlyRepaymentFee = 0;
    if (loan.product.earlyRepaymentFee !== "면제" && type === "full") {
      const feeRate = loan.product.earlyRepaymentFee.includes("1.0%") ? 0.01 :
                     loan.product.earlyRepaymentFee.includes("0.8%") ? 0.008 :
                     loan.product.earlyRepaymentFee.includes("0.3%") ? 0.003 : 0;
      earlyRepaymentFee = currentBalance * feeRate;
    }

    // 헬스팩터 재계산 (부분 상환 시)
    let newHealthFactor = loan.healthFactor;
    if (remainingBalance > 0) {
      const collateralValue = loan.collateralAsset.value;
      newHealthFactor = (collateralValue * loan.liquidationThreshold) / remainingBalance;
    }

    return {
      currentBalance,
      accruedInterest,
      totalPayable,
      repaymentAmount: paymentAmount + earlyRepaymentFee,
      remainingBalance,
      earlyRepaymentFee,
      newHealthFactor: remainingBalance > 0 ? newHealthFactor : undefined
    };
  };

  // 금액 포맷팅
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 상환 타입이나 금액 변경 시 계산 업데이트
  useEffect(() => {
    if (loan) {
      const numAmount = repaymentType === "partial" ? parseInt(amount.replace(/,/g, '')) || 0 : 0;
      setCalculation(calculateRepayment(repaymentType, numAmount));
    }
  }, [loan, repaymentType, amount]);

  // 입력 금액 포맷팅
  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const formattedValue = new Intl.NumberFormat('ko-KR').format(parseInt(numericValue) || 0);
    setAmount(formattedValue === "0" ? "" : formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan || !calculation) return;

    const request: RepaymentRequest = {
      loanId: loan.id,
      type: repaymentType,
      amount: repaymentType === "partial" ? (parseInt(amount.replace(/,/g, '')) || 0) + calculation.earlyRepaymentFee : calculation.repaymentAmount,
      note: note.trim() || undefined
    };

    onSubmit(request);
    onClose();
  };

  const handleConfirm = () => {
    setIsConfirming(true);
  };

  const handleBack = () => {
    setIsConfirming(false);
  };

  if (!isOpen || !loan) return null;

  const totalPayable = loan.loanAmount + loan.accruedInterest;
  const maxRepayment = totalPayable;
  const minRepayment = Math.min(1000000, totalPayable); // 최소 100만원

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {!isConfirming ? (
          <>
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">대출 상환</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* 대출 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900">{loan.product.productName}</h4>
                  <p className="text-sm text-gray-600">{loan.product.bankName}</p>
                </div>
                <div className="flex items-center">
                  <CryptoIcon symbol={loan.collateralAsset.asset} size={24} className="mr-2" />
                  <span className="text-sm font-medium">
                    {loan.collateralAsset.amount} {loan.collateralAsset.asset}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">대출 잔액</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(loan.loanAmount)}</p>
                </div>
                <div>
                  <span className="text-gray-600">누적 이자</span>
                  <p className="font-semibold text-gray-900">{formatCurrency(loan.accruedInterest)}</p>
                </div>
                <div>
                  <span className="text-gray-600">총 상환 필요 금액</span>
                  <p className="font-semibold text-primary-600">{formatCurrency(totalPayable)}</p>
                </div>
                <div>
                  <span className="text-gray-600">현재 헬스팩터</span>
                  <div className="flex items-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthFactorLevel(loan.healthFactor).color} ${getHealthFactorLevel(loan.healthFactor).bgColor}`}>
                      {loan.healthFactor.toFixed(2)} - {getHealthFactorLevel(loan.healthFactor).label}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 상환 타입 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  상환 방식 선택
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="full"
                      checked={repaymentType === "full"}
                      onChange={(e) => setRepaymentType(e.target.value as "full" | "partial")}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium">전액 상환</div>
                      <div className="text-sm text-gray-600">대출 전액과 이자를 모두 상환합니다</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-primary-600">
                        {formatCurrency(totalPayable + (calculation?.earlyRepaymentFee || 0))}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="partial"
                      checked={repaymentType === "partial"}
                      onChange={(e) => setRepaymentType(e.target.value as "full" | "partial")}
                      className="mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium">부분 상환</div>
                      <div className="text-sm text-gray-600">원하는 금액만큼 부분 상환합니다</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* 부분 상환 금액 입력 */}
              {repaymentType === "partial" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상환 금액
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="상환할 금액을 입력하세요"
                      required
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      원
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    최소: {formatCurrency(minRepayment)} / 최대: {formatCurrency(maxRepayment)}
                  </p>
                </div>
              )}

              {/* 조기 상환 수수료 안내 */}
              {loan.product.earlyRepaymentFee !== "면제" && repaymentType === "full" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">조기 상환 수수료</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        조기 상환 수수료 {loan.product.earlyRepaymentFee}가 부과됩니다.
                        ({formatCurrency(calculation?.earlyRepaymentFee || 0)})
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 상환 후 예상 결과 */}
              {calculation && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-3">상환 후 예상 결과</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">상환 금액</span>
                      <p className="font-semibold text-blue-900">{formatCurrency(calculation.repaymentAmount)}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">남은 대출 잔액</span>
                      <p className="font-semibold text-blue-900">{formatCurrency(calculation.remainingBalance)}</p>
                    </div>
                    {calculation.newHealthFactor && (
                      <div className="col-span-2">
                        <span className="text-blue-700">변경될 헬스팩터</span>
                        <div className="flex items-center mt-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getHealthFactorLevel(calculation.newHealthFactor).color} ${getHealthFactorLevel(calculation.newHealthFactor).bgColor}`}>
                            {calculation.newHealthFactor.toFixed(2)} - {getHealthFactorLevel(calculation.newHealthFactor).label}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 메모 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메모 (선택사항)
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="상환 사유나 메모를 입력하세요"
                />
              </div>

              {/* 액션 버튼 */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={repaymentType === "partial" && (!amount || parseInt(amount.replace(/,/g, '')) < minRepayment)}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  상환하기
                </button>
              </div>
            </form>
          </>
        ) : (
          // 확인 단계
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">상환 확인</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-4">상환 내역 확인</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상환 방식</span>
                    <span className="font-medium">{repaymentType === "full" ? "전액 상환" : "부분 상환"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">상환 금액</span>
                    <span className="font-medium">{formatCurrency(calculation?.repaymentAmount || 0)}</span>
                  </div>
                  {calculation?.earlyRepaymentFee && calculation.earlyRepaymentFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">조기상환 수수료</span>
                      <span className="font-medium">{formatCurrency(calculation.earlyRepaymentFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">남은 대출 잔액</span>
                    <span className="font-medium">{formatCurrency(calculation?.remainingBalance || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">상환 전 확인사항</h4>
                    <ul className="text-sm text-red-700 mt-1 space-y-1">
                      <li>• 상환 후에는 취소가 불가능합니다.</li>
                      <li>• 상환 금액이 정확한지 다시 한번 확인해주세요.</li>
                      {calculation?.earlyRepaymentFee && calculation.earlyRepaymentFee > 0 && (
                        <li>• 조기 상환 수수료가 별도로 부과됩니다.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  이전으로
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  상환 확정
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}