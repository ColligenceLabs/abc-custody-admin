import { BudgetSetup, MonthlyBudget, QuarterlyBudget, CryptoCurrency } from "@/types/groups";
import { getCurrencyDecimals } from "./groupsUtils";

/**
 * 예산 자동 분배 및 계산 유틸리티 함수들
 */

/**
 * 소수점 정밀도를 고려한 반올림 함수
 */
const roundToPrecision = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * 현재 날짜부터 남은 월들을 계산
 */
export const getRemainingMonths = (currentDate: Date, targetYear: number): number[] => {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-based to 1-based

  if (currentYear === targetYear) {
    // 현재 년도인 경우: 현재 월부터 12월까지
    return Array.from({ length: 12 - currentMonth + 1 }, (_, i) => currentMonth + i);
  } else if (currentYear < targetYear) {
    // 미래 년도인 경우: 1월부터 12월까지
    return Array.from({ length: 12 }, (_, i) => i + 1);
  } else {
    // 과거 년도인 경우: 빈 배열
    return [];
  }
};

/**
 * 현재 날짜부터 남은 분기들을 계산
 */
export const getRemainingQuarters = (currentDate: Date, targetYear: number): number[] => {
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1; // 0-based to 1-based

  if (currentYear === targetYear) {
    // 현재 년도인 경우: 현재 분기부터 4분기까지
    return Array.from({ length: 4 - currentQuarter + 1 }, (_, i) => currentQuarter + i);
  } else if (currentYear < targetYear) {
    // 미래 년도인 경우: 1분기부터 4분기까지
    return [1, 2, 3, 4];
  } else {
    // 과거 년도인 경우: 빈 배열
    return [];
  }
};

/**
 * 특정 분기에 포함된 월들을 반환
 */
export const getMonthsInQuarter = (quarter: number): number[] => {
  const startMonth = (quarter - 1) * 3 + 1;
  return [startMonth, startMonth + 1, startMonth + 2];
};

/**
 * 연간 예산 기준으로 자동 분배
 */
export const distributeYearlyBudget = (
  baseAmount: number,
  currency: CryptoCurrency,
  year: number,
  currentDate: Date = new Date()
): BudgetSetup => {
  const remainingMonths = getRemainingMonths(currentDate, year);
  const remainingQuarters = getRemainingQuarters(currentDate, year);
  const decimals = getCurrencyDecimals(currency);

  if (remainingMonths.length === 0) {
    throw new Error("선택한 년도에 남은 기간이 없습니다.");
  }

  // 분기별 자동 분배
  const quarterlyBudgets: QuarterlyBudget[] = [];
  for (const quarter of remainingQuarters) {
    const monthsInThisQuarter = getMonthsInQuarter(quarter).filter(
      month => remainingMonths.includes(month)
    );
    const quarterAmount = roundToPrecision(baseAmount / remainingMonths.length * monthsInThisQuarter.length, decimals);
    quarterlyBudgets.push({ quarter, amount: quarterAmount });
  }

  // 월별 자동 분배 (균등 분배)
  const monthlyAmount = roundToPrecision(baseAmount / remainingMonths.length, decimals);
  const monthlyBudgets: MonthlyBudget[] = remainingMonths.map(month => ({
    month,
    amount: monthlyAmount
  }));

  // 나머지 금액을 마지막 월에 추가
  const totalDistributed = monthlyAmount * remainingMonths.length;
  const remainder = roundToPrecision(baseAmount - totalDistributed, decimals);
  if (remainder > 0 && monthlyBudgets.length > 0) {
    monthlyBudgets[monthlyBudgets.length - 1].amount = roundToPrecision(
      monthlyBudgets[monthlyBudgets.length - 1].amount + remainder,
      decimals
    );
  }

  // 날짜 범위 계산
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-based to 1-based

  // 시작일 계산: 현재 년도이고 첫 번째 월이 현재 월이면 현재 날짜, 아니면 1일
  let startDate: Date;
  if (currentYear === year && remainingMonths[0] === currentMonth) {
    startDate = new Date(currentDate);
  } else {
    startDate = new Date(year, remainingMonths[0] - 1, 1);
  }

  // 종료일 계산: 마지막 월의 마지막 날
  const lastMonth = remainingMonths[remainingMonths.length - 1];
  const endDate = new Date(year, lastMonth, 0); // 다음 월의 0일 = 현재 월의 마지막 날

  return {
    year,
    baseType: 'yearly',
    baseAmount,
    currency,
    yearlyBudget: baseAmount,
    quarterlyBudgets,
    monthlyBudgets,
    remainingMonths,
    remainingQuarters,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * 분기 예산 기준으로 자동 분배
 */
export const distributeQuarterlyBudget = (
  baseAmount: number,
  currency: CryptoCurrency,
  year: number,
  quarter: number,
  currentDate: Date = new Date()
): BudgetSetup => {
  const allMonthsInQuarter = getMonthsInQuarter(quarter);
  const remainingMonths = getRemainingMonths(currentDate, year);

  // 해당 분기의 남은 월들만 필터링
  const quarterRemainingMonths = allMonthsInQuarter.filter(
    month => remainingMonths.includes(month)
  );

  if (quarterRemainingMonths.length === 0) {
    throw new Error("선택한 분기에 남은 기간이 없습니다.");
  }

  const decimals = getCurrencyDecimals(currency);

  // 월별 자동 분배 (균등 분배)
  const monthlyAmount = roundToPrecision(baseAmount / quarterRemainingMonths.length, decimals);
  const monthlyBudgets: MonthlyBudget[] = quarterRemainingMonths.map(month => ({
    month,
    amount: monthlyAmount
  }));

  // 나머지 금액을 마지막 월에 추가
  const totalDistributed = monthlyAmount * quarterRemainingMonths.length;
  const remainder = roundToPrecision(baseAmount - totalDistributed, decimals);
  if (remainder > 0 && monthlyBudgets.length > 0) {
    monthlyBudgets[monthlyBudgets.length - 1].amount = roundToPrecision(
      monthlyBudgets[monthlyBudgets.length - 1].amount + remainder,
      decimals
    );
  }

  // 분기 예산
  const quarterlyBudgets: QuarterlyBudget[] = [{ quarter, amount: baseAmount }];

  // 날짜 범위 계산
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-based to 1-based

  // 시작일 계산: 현재 년도이고 첫 번째 월이 현재 월이면 현재 날짜, 아니면 1일
  let startDate: Date;
  if (currentYear === year && quarterRemainingMonths[0] === currentMonth) {
    startDate = new Date(currentDate);
  } else {
    startDate = new Date(year, quarterRemainingMonths[0] - 1, 1);
  }

  // 종료일 계산: 마지막 월의 마지막 날
  const lastMonth = quarterRemainingMonths[quarterRemainingMonths.length - 1];
  const endDate = new Date(year, lastMonth, 0); // 다음 월의 0일 = 현재 월의 마지막 날

  return {
    year,
    baseType: 'quarterly',
    baseAmount,
    currency,
    selectedQuarter: quarter,
    quarterlyBudgets,
    monthlyBudgets,
    remainingMonths: quarterRemainingMonths,
    remainingQuarters: [quarter],
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * 월간 예산 기준으로 설정
 */
export const distributeMonthlyBudget = (
  baseAmount: number,
  currency: CryptoCurrency,
  year: number,
  month: number,
  currentDate: Date = new Date()
): BudgetSetup => {
  const remainingMonths = getRemainingMonths(currentDate, year);

  if (!remainingMonths.includes(month)) {
    throw new Error("선택한 월이 남은 기간에 포함되지 않습니다.");
  }

  // 월별 예산 (선택한 월만)
  const monthlyBudgets: MonthlyBudget[] = [{ month, amount: baseAmount }];

  // 날짜 범위 계산
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 0-based to 1-based

  // 시작일 계산: 현재 년도이고 선택한 월이 현재 월이면 현재 날짜, 아니면 1일
  let startDate: Date;
  if (currentYear === year && month === currentMonth) {
    startDate = new Date(currentDate);
  } else {
    startDate = new Date(year, month - 1, 1);
  }

  // 종료일 계산: 선택한 월의 마지막 날
  const endDate = new Date(year, month, 0); // 다음 월의 0일 = 현재 월의 마지막 날

  const quarter = Math.floor((month - 1) / 3) + 1;

  return {
    year,
    baseType: 'monthly',
    baseAmount,
    currency,
    selectedMonth: month,
    quarterlyBudgets: [],
    monthlyBudgets,
    remainingMonths: [month],
    remainingQuarters: [quarter],
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
};

/**
 * 주요 분배 함수 - baseType에 따라 적절한 분배 함수 호출
 */
export const distributeBudget = (
  baseAmount: number,
  currency: CryptoCurrency,
  year: number,
  baseType: 'yearly' | 'quarterly' | 'monthly',
  selectedQuarter?: number,
  selectedMonth?: number,
  currentDate: Date = new Date()
): BudgetSetup => {
  switch (baseType) {
    case 'yearly':
      return distributeYearlyBudget(baseAmount, currency, year, currentDate);

    case 'quarterly':
      if (!selectedQuarter) {
        throw new Error("분기 예산의 경우 분기를 선택해야 합니다.");
      }
      return distributeQuarterlyBudget(baseAmount, currency, year, selectedQuarter, currentDate);

    case 'monthly':
      if (!selectedMonth) {
        throw new Error("월간 예산의 경우 월을 선택해야 합니다.");
      }
      return distributeMonthlyBudget(baseAmount, currency, year, selectedMonth, currentDate);

    default:
      throw new Error(`지원하지 않는 예산 타입: ${baseType}`);
  }
};

/**
 * 예산 합계 검증
 */
export const validateBudgetSum = (
  budgets: { amount: number }[],
  maxAmount: number
): { valid: boolean; remaining: number; message: string | null } => {
  const sum = budgets.reduce((acc, b) => acc + b.amount, 0);
  const remaining = maxAmount - sum;

  return {
    valid: sum <= maxAmount,
    remaining,
    message: sum > maxAmount
      ? `총 예산을 초과할 수 없습니다. (초과 예산: ${sum - maxAmount})`
      : sum < maxAmount
      ? `총 예산보다 적습니다. (잔여 예산: ${remaining})`
      : null
  };
};

/**
 * 월별 예산 조정
 */
export const adjustMonthlyBudget = (
  budgetSetup: BudgetSetup,
  monthIndex: number,
  newAmount: number
): { success: boolean; message: string; updatedSetup?: BudgetSetup } => {
  const updatedMonthlyBudgets = [...budgetSetup.monthlyBudgets];

  if (monthIndex < 0 || monthIndex >= updatedMonthlyBudgets.length) {
    return { success: false, message: "잘못된 월 인덱스입니다." };
  }

  // 임시로 금액 변경하여 검증
  const originalAmount = updatedMonthlyBudgets[monthIndex].amount;
  updatedMonthlyBudgets[monthIndex] = { ...updatedMonthlyBudgets[monthIndex], amount: newAmount };

  // 최대 예산 검증
  const maxAmount = budgetSetup.baseType === 'yearly'
    ? budgetSetup.yearlyBudget!
    : budgetSetup.baseType === 'quarterly'
    ? budgetSetup.baseAmount
    : budgetSetup.baseAmount;

  const validation = validateBudgetSum(updatedMonthlyBudgets, maxAmount);

  if (!validation.valid) {
    return { success: false, message: validation.message! };
  }

  // 분기별 예산 재계산 (연간 예산인 경우)
  let updatedQuarterlyBudgets = [...budgetSetup.quarterlyBudgets];
  if (budgetSetup.baseType === 'yearly') {
    updatedQuarterlyBudgets = budgetSetup.quarterlyBudgets.map(qb => ({
      ...qb,
      amount: updatedMonthlyBudgets
        .filter(mb => getMonthsInQuarter(qb.quarter).includes(mb.month))
        .reduce((sum, mb) => sum + mb.amount, 0)
    }));
  }

  return {
    success: true,
    message: "예산이 성공적으로 조정되었습니다.",
    updatedSetup: {
      ...budgetSetup,
      monthlyBudgets: updatedMonthlyBudgets,
      quarterlyBudgets: updatedQuarterlyBudgets
    }
  };
};