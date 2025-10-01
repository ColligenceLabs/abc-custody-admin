import { CryptoCurrency, CryptoAmount, ExpenseStatus, ExpenseRequest, GroupType, WalletGroup } from '@/types/groups';

// 가상자산별 소수점 자리수 정의
export const getCurrencyDecimals = (currency: CryptoCurrency): number => {
  const decimals = {
    'BTC': 8,
    'ETH': 4,
    'USDT': 2,
    'USDC': 2,
    'SOL': 4
  };
  return decimals[currency];
};

// 가상자산 아이콘 URL 매핑
export const getCryptoIconUrl = (currency: CryptoCurrency): string => {
  const iconMap: { [key: string]: string } = {
    'BTC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png',
    'ETH': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png',
    'USDT': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdt.png',
    'USDC': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdc.png',
    'SOL': 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png',
  };

  return iconMap[currency] || 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/generic.png';
};

// 가상자산 금액 포맷팅
export const formatCryptoAmount = (cryptoAmount: CryptoAmount): string => {
  const decimals = getCurrencyDecimals(cryptoAmount.currency);
  const fixedNumber = cryptoAmount.amount.toFixed(decimals).replace(/\.?0+$/, '');

  // 천자리 콤마 추가
  const formattedNumber = parseFloat(fixedNumber).toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });

  return `${formattedNumber} ${cryptoAmount.currency}`;
};

// 소수점 입력 검증 함수
export const validateDecimalInput = (value: string, currency: CryptoCurrency): boolean => {
  if (value === '') return true;

  // 소수점을 포함한 숫자 패턴 검증
  if (!/^\d*\.?\d*$/.test(value)) return false;

  const decimals = getCurrencyDecimals(currency);
  const parts = value.split('.');

  // 소수점 자리수 확인
  if (parts.length === 2 && parts[1].length > decimals) return false;

  return true;
};

// 암호화폐 입력값을 숫자로 변환 (검증 포함)
export const parseDecimalAmount = (value: string): number => {
  if (value === '') return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

// 예산 사용률 계산
export const calculateBudgetUsageRate = (used: CryptoAmount, budget: CryptoAmount): number => {
  // 같은 통화인 경우에만 계산
  if (used.currency === budget.currency && budget.amount > 0) {
    return (used.amount / budget.amount) * 100;
  }
  return 0;
};

// 같은 통화별로 지출 합계 계산
export const calculateExpenseSum = (expenses: ExpenseRequest[], status?: ExpenseStatus): { [currency: string]: number } => {
  const sums: { [currency: string]: number } = {};
  
  expenses
    .filter(e => !status || e.status === status)
    .forEach(e => {
      const currency = e.amount.currency;
      sums[currency] = (sums[currency] || 0) + e.amount.amount;
    });
  
  return sums;
};

// 통화별 합계를 표시용 문자열로 변환
export const formatExpenseSums = (sums: { [currency: string]: number }): string => {
  return Object.entries(sums)
    .map(([currency, amount]) => formatCryptoAmount({ amount, currency: currency as CryptoCurrency }))
    .join(', ');
};

// 기간별 지출 필터링 함수
export const getExpensesForPeriod = (expenses: ExpenseRequest[], period: "monthly" | "quarterly" | "yearly") => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentQuarter = Math.floor(currentMonth / 3);
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.requestedAt);
    const expenseYear = expenseDate.getFullYear();
    const expenseMonth = expenseDate.getMonth();
    const expenseQuarter = Math.floor(expenseMonth / 3);
    
    switch (period) {
      case 'monthly':
        return expenseYear === currentYear && expenseMonth === currentMonth;
      case 'quarterly':
        return expenseYear === currentYear && expenseQuarter === currentQuarter;
      case 'yearly':
        return expenseYear === currentYear;
      default:
        return false;
    }
  });
};

// 그룹 유형 컬러 매핑
export const getTypeColor = (type: GroupType) => {
  const colors = {
    department: "bg-blue-100 text-blue-800",
    project: "bg-indigo-100 text-indigo-800",
    team: "bg-purple-100 text-purple-800",
  };
  return colors[type];
};

// 그룹 유형 이름 매핑
export const getTypeName = (type: GroupType) => {
  const names = {
    department: "부서",
    project: "프로젝트",
    team: "팀",
  };
  return names[type];
};

// 지출 상태 컬러 매핑
export const getStatusColor = (status: ExpenseStatus) => {
  const colors = {
    draft: "bg-gray-100 text-gray-800",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return colors[status];
};

// 지출 상태 이름 매핑
export const getStatusName = (status: ExpenseStatus) => {
  const names = {
    draft: "임시저장",
    pending: "승인대기",
    approved: "승인됨",
    rejected: "반려됨",
  };
  return names[status];
};

// 날짜 포맷팅
export const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(dateString));
};

// 예산 사용 퍼센티지 계산 헬퍼
export const getBudgetUsagePercentage = (group: WalletGroup) => {
  return Math.round(calculateBudgetUsageRate(group.budgetUsed, group.monthlyBudget));
};

export const getQuarterlyBudgetUsagePercentage = (group: WalletGroup) => {
  return Math.round(calculateBudgetUsageRate(group.quarterlyBudgetUsed, group.quarterlyBudget));
};

export const getYearlyBudgetUsagePercentage = (group: WalletGroup) => {
  return Math.round(calculateBudgetUsageRate(group.yearlyBudgetUsed, group.yearlyBudget));
};

