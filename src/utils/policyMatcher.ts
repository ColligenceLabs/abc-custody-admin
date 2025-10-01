/**
 * 정책 기반 결재자 매칭 유틸리티
 * 예산 금액(가상자산)을 KRW로 환산하고 해당하는 정책을 찾아 필수 결재자를 반환
 */

import { CryptoCurrency } from "@/types/groups";
import { APPROVAL_POLICIES, ApprovalPolicy } from "@/utils/approverAssignment";

export interface PolicyMatchResult {
  matchedPolicy: ApprovalPolicy | null;
  requiredApprovers: string[];
  riskLevel: string;
  budgetAmountKRW: number;
  policyId?: string;
}

export interface ExchangeRates {
  BTC: number;
  ETH: number;
  USDT: number;
  USDC: number;
  SOL: number;
}

// 기본 환율 설정 (실제 환경에서는 실시간 API 연동)
const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  BTC: 45000000,  // 1 BTC = 45,000,000 KRW
  ETH: 3000000,   // 1 ETH = 3,000,000 KRW
  USDT: 1300,     // 1 USDT = 1,300 KRW
  USDC: 1300,     // 1 USDC = 1,300 KRW
  SOL: 150000,    // 1 SOL = 150,000 KRW
};

/**
 * 예산 금액(가상자산)을 KRW로 환산하고 해당하는 정책을 찾음
 */
export function matchPolicyByBudget(
  budgetAmount: number,
  currency: CryptoCurrency,
  exchangeRates?: Partial<ExchangeRates>
): PolicyMatchResult {
  // 1. 가상자산을 KRW로 환산
  const krwAmount = convertToKRW(budgetAmount, currency, exchangeRates);

  // 2. 금액에 해당하는 정책 찾기
  const krwPolicies = APPROVAL_POLICIES.filter(policy => policy.currency === 'KRW');
  const matchedPolicy = krwPolicies.find(policy =>
    krwAmount >= policy.minAmount && krwAmount <= policy.maxAmount
  ) || null;

  // 3. 정책 ID 생성 (디버깅 및 추적용)
  const policyId = matchedPolicy
    ? `KRW-${krwPolicies.indexOf(matchedPolicy)}`
    : undefined;

  // 4. 위험도 계산
  const approverCount = matchedPolicy?.requiredApprovers.length || 0;
  const riskLevel = getRiskLevelByApproverCount(approverCount);

  // 5. 결과 반환
  return {
    matchedPolicy,
    requiredApprovers: matchedPolicy?.requiredApprovers || [],
    riskLevel,
    budgetAmountKRW: krwAmount,
    policyId
  };
}

/**
 * 가상자산을 KRW로 환산
 */
export function convertToKRW(
  amount: number,
  currency: CryptoCurrency,
  exchangeRates?: Partial<ExchangeRates>
): number {
  if (amount <= 0) return 0;

  const rates = { ...DEFAULT_EXCHANGE_RATES, ...exchangeRates };
  const rate = rates[currency];

  if (!rate) {
    console.warn(`Exchange rate not found for currency: ${currency}`);
    return 0;
  }

  return Math.round(amount * rate);
}

/**
 * 결재자 수에 따른 위험도 계산
 */
export function getRiskLevelByApproverCount(approverCount: number): string {
  if (approverCount <= 2) return "낮음";
  if (approverCount === 3) return "보통";
  if (approverCount === 4) return "높음";
  if (approverCount === 5) return "매우 높음";
  return "극높음";
}

/**
 * 위험도에 따른 색상 클래스 반환
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case "낮음":
      return "text-blue-600";
    case "보통":
      return "text-yellow-600";
    case "높음":
      return "text-orange-600";
    case "매우 높음":
      return "text-red-600";
    case "극높음":
      return "text-red-800";
    default:
      return "text-gray-600";
  }
}

/**
 * KRW 금액을 읽기 쉬운 형태로 포맷팅
 */
export function formatCurrencyKRW(amount: number): string {
  if (amount === 0) return "0원";
  if (amount === Infinity) return "무제한";

  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * 실시간 환율 가져오기 (향후 확장용)
 */
export async function fetchRealTimeExchangeRates(): Promise<ExchangeRates> {
  try {
    // 실제 구현에서는 CoinGecko, Binance API 등 활용
    // const response = await fetch('/api/exchange-rates');
    // const rates = await response.json();
    // return rates;

    // 현재는 기본값 반환
    return DEFAULT_EXCHANGE_RATES;
  } catch (error) {
    console.error('Failed to fetch real-time exchange rates:', error);
    return DEFAULT_EXCHANGE_RATES;
  }
}

/**
 * 정책 변경이 기존 그룹에 미치는 영향 분석 (향후 확장용)
 */
export function analyzePolicyImpact(
  updatedPolicy: ApprovalPolicy,
  existingGroups: any[]
): {
  affectedGroups: any[];
  recommendActions: string[];
} {
  // TODO: 구현 예정
  return {
    affectedGroups: [],
    recommendActions: []
  };
}

/**
 * 예산 금액 변경 시 정책 재매칭 필요 여부 확인
 */
export function shouldRematchPolicy(
  currentPolicyId: string | undefined,
  newBudgetAmount: number,
  currency: CryptoCurrency,
  exchangeRates?: Partial<ExchangeRates>
): boolean {
  const newMatch = matchPolicyByBudget(newBudgetAmount, currency, exchangeRates);
  return newMatch.policyId !== currentPolicyId;
}