import { BudgetPeriod } from "@/types/groups";

/**
 * 예산 기간 계산 및 검증 유틸리티 함수들
 */

/**
 * 예산 기간 유효성 검증
 */
export const validateBudgetPeriod = (budgetPeriod: BudgetPeriod): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 기본 필드 검증
  if (!budgetPeriod.type) {
    errors.push("예산 유형을 선택해주세요.");
  }

  if (!budgetPeriod.amount || budgetPeriod.amount.amount <= 0) {
    errors.push("예산 금액은 0보다 커야 합니다.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 현재 시점 기준으로 해당 예산 타입의 유효 기간 계산
 */
export const calculateCurrentPeriodForBudget = (
  budgetYear: number,
  budgetType: BudgetPeriod['type'],
  referenceDate: Date = new Date()
): { start: Date; end: Date } => {
  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth();

  switch (budgetType) {
    case 'monthly': {
      // 현재 월 기간
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0);
      return { start, end };
    }

    case 'quarterly': {
      // 현재 분기 기간
      const currentQuarter = Math.floor(currentMonth / 3);
      const startMonth = currentQuarter * 3;
      const start = new Date(currentYear, startMonth, 1);
      const end = new Date(currentYear, startMonth + 3, 0);
      return { start, end };
    }

    case 'yearly': {
      // 설정된 예산 년도 전체 기간
      const start = new Date(budgetYear, 0, 1);
      const end = new Date(budgetYear, 11, 31);
      return { start, end };
    }

    default:
      throw new Error(`지원하지 않는 예산 유형: ${budgetType}`);
  }
};

/**
 * 예산 기간 요약 텍스트 생성
 */
export const getBudgetPeriodSummary = (
  budgetPeriod: BudgetPeriod,
  budgetYear: number,
  referenceDate: Date = new Date()
): string => {
  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const { start, end } = calculateCurrentPeriodForBudget(budgetYear, budgetPeriod.type, referenceDate);
  const startDateStr = start.toLocaleDateString('ko-KR');
  const endDateStr = end.toLocaleDateString('ko-KR');

  const baseText = `${formatAmount(budgetPeriod.amount.amount, budgetPeriod.amount.currency)}`;

  switch (budgetPeriod.type) {
    case 'monthly':
      return `${baseText} (${startDateStr} ~ ${endDateStr})`;
    case 'quarterly':
      return `${baseText} (${startDateStr} ~ ${endDateStr})`;
    case 'yearly':
      return `${baseText} (${budgetYear}년: ${startDateStr} ~ ${endDateStr})`;
    default:
      return baseText;
  }
};

/**
 * 예산 기간이 현재 활성화되어 있는지 확인
 */
export const isBudgetPeriodActive = (
  budgetPeriod: BudgetPeriod,
  budgetYear: number,
  currentDate: Date = new Date()
): boolean => {
  try {
    const { start, end } = calculateCurrentPeriodForBudget(budgetYear, budgetPeriod.type, currentDate);
    return currentDate >= start && currentDate <= end;
  } catch {
    return false;
  }
};

/**
 * 예산 기간 정보를 풍부하게 만들어 반환 (현재 시점 기준)
 */
export const enrichBudgetPeriod = (
  budgetPeriod: BudgetPeriod,
  budgetYear: number,
  referenceDate: Date = new Date()
): BudgetPeriod & { currentPeriodStart: string; currentPeriodEnd: string } => {
  try {
    const { start, end } = calculateCurrentPeriodForBudget(budgetYear, budgetPeriod.type, referenceDate);

    return {
      ...budgetPeriod,
      currentPeriodStart: start.toISOString().split('T')[0],
      currentPeriodEnd: end.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Failed to enrich budget period:', error);
    return {
      ...budgetPeriod,
      currentPeriodStart: '',
      currentPeriodEnd: ''
    };
  }
};