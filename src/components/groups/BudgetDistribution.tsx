import { useState, useEffect } from "react";
import { PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BudgetSetup, MonthlyBudget, QuarterlyBudget } from "@/types/groups";
import { adjustMonthlyBudget, validateBudgetSum, getMonthsInQuarter } from "@/utils/budgetCalculator";
import { getCurrencyDecimals, validateDecimalInput, parseDecimalAmount } from "@/utils/groupsUtils";

interface BudgetDistributionProps {
  budgetSetup: BudgetSetup;
  onChange: (updatedSetup: BudgetSetup) => void;
  onError?: (message: string) => void;
  className?: string;
}

interface EditingState {
  isEditing: boolean;
  monthIndex: number;
  tempValue: string;
}

export default function BudgetDistribution({
  budgetSetup,
  onChange,
  onError,
  className = ""
}: BudgetDistributionProps) {
  const [editing, setEditing] = useState<EditingState>({ isEditing: false, monthIndex: -1, tempValue: "" });
  const [validation, setValidation] = useState<{ valid: boolean; remaining: number; message: string | null }>({
    valid: true,
    remaining: 0,
    message: null
  });
  const decimals = getCurrencyDecimals(budgetSetup.currency);

  // 검증 상태 업데이트
  useEffect(() => {
    const maxAmount = budgetSetup.baseType === 'yearly'
      ? budgetSetup.yearlyBudget!
      : budgetSetup.baseAmount;

    const validationResult = validateBudgetSum(budgetSetup.monthlyBudgets, maxAmount);
    setValidation(validationResult);
  }, [budgetSetup]);

  const handleEditStart = (monthIndex: number) => {
    setEditing({
      isEditing: true,
      monthIndex,
      tempValue: budgetSetup.monthlyBudgets[monthIndex].amount.toString()
    });
  };

  const handleEditCancel = () => {
    setEditing({ isEditing: false, monthIndex: -1, tempValue: "" });
  };

  const handleEditSave = () => {
    const newAmount = parseDecimalAmount(editing.tempValue);

    if (newAmount < 0) {
      if (onError) {
        onError("올바른 금액을 입력해주세요.");
      }
      return;
    }

    const result = adjustMonthlyBudget(budgetSetup, editing.monthIndex, newAmount);

    if (result.success && result.updatedSetup) {
      // 성공 시 에러 메시지 클리어
      if (onError) {
        onError("");
      }
      onChange(result.updatedSetup);
      setEditing({ isEditing: false, monthIndex: -1, tempValue: "" });
    } else {
      if (onError) {
        onError(result.message);
      }
    }
  };

  const getMonthName = (month: number): string => {
    return `${month}월`;
  };

  const getQuarterName = (quarter: number): string => {
    return `${quarter}분기`;
  };

  const formatAmount = (amount: number): string => {
    return amount.toLocaleString('ko-KR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  };

  const getDateRange = (budgetSetup: BudgetSetup): string => {
    const start = new Date(budgetSetup.startDate);
    const end = new Date(budgetSetup.endDate);
    return `${start.toLocaleDateString('ko-KR')} ~ ${end.toLocaleDateString('ko-KR')}`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 예산 기간 정보 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">예산 기간 정보</h3>
        <div className="text-sm text-gray-600">
          <div>기준: {budgetSetup.baseType === 'yearly' ? '연간' : budgetSetup.baseType === 'quarterly' ? '분기' : '월간'} 예산</div>
          <div>기간: {getDateRange(budgetSetup)}</div>
          <div>총 예산: {formatAmount(budgetSetup.baseAmount)} {budgetSetup.currency}</div>
        </div>
      </div>

      {/* 검증 상태 표시 */}
      {validation.message && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <div className="text-sm font-medium text-red-700">
            {validation.message}
          </div>
        </div>
      )}

      {/* 분기별 예산 (연간 예산인 경우만) */}
      {budgetSetup.baseType === 'yearly' && budgetSetup.quarterlyBudgets.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">분기별 예산 분배</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {budgetSetup.quarterlyBudgets.map((qb) => (
              <div key={qb.quarter} className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500">{getQuarterName(qb.quarter)}</div>
                <div className="text-sm font-semibold">{formatAmount(qb.amount)} {budgetSetup.currency}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 월별 예산 */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">월별 예산 분배 (조정 가능)</h4>
        <div className="space-y-2">
          {budgetSetup.monthlyBudgets.map((mb, index) => (
            <div key={mb.month} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">{getMonthName(mb.month)}</span>
              </div>

              <div className="flex items-center space-x-2">
                {editing.isEditing && editing.monthIndex === index ? (
                  <>
                    <input
                      type="text"
                      value={editing.tempValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (validateDecimalInput(value, budgetSetup.currency)) {
                          setEditing({ ...editing, tempValue: value });
                        }
                      }}
                      className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      inputMode="decimal"
                      placeholder={`최대 ${decimals}자리 소수점`}
                      autoFocus
                    />
                    <span className="text-xs text-gray-500">{budgetSetup.currency}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditSave();
                      }}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditCancel();
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-semibold min-w-[80px] text-right">
                      {formatAmount(mb.amount)} {budgetSetup.currency}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleEditStart(index);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 총계 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">총 배분된 예산</span>
          <span className="text-lg font-semibold text-gray-900">
            {formatAmount(budgetSetup.monthlyBudgets.reduce((sum, mb) => sum + mb.amount, 0))} {budgetSetup.currency}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">기준 예산</span>
          <span className="text-sm text-gray-600">
            {formatAmount(budgetSetup.baseAmount)} {budgetSetup.currency}
          </span>
        </div>
      </div>
    </div>
  );
}