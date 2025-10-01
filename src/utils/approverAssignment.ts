/**
 * 동적 결재자 할당 유틸리티
 * 금액과 거래 유형에 따라 적절한 결재자들을 자동으로 할당
 */

import { Currency } from "@/types/withdrawal";

export interface ApprovalPolicy {
  minAmount: number;
  maxAmount: number;
  currency: Currency;
  requiredApprovers: string[];
  description: string;
}

export const APPROVAL_POLICIES: ApprovalPolicy[] = [
  // KRW 기준 정책 - 모든 가상자산은 KRW 환산 금액으로 정책 적용
  {
    minAmount: 0,
    maxAmount: 1000000, // 100만원
    currency: "KRW",
    requiredApprovers: ["박재무", "한리스크"],
    description: "소액 거래 (100만원 미만)"
  },
  {
    minAmount: 1000000, // 100만원
    maxAmount: 10000000, // 1천만원
    currency: "KRW",
    requiredApprovers: ["박재무", "한리스크", "이기술"],
    description: "일반 거래 (100만원~1천만원)"
  },
  {
    minAmount: 10000000, // 1천만원
    maxAmount: 100000000, // 1억원
    currency: "KRW",
    requiredApprovers: ["박재무", "한리스크", "이기술", "송컴플"],
    description: "중액 거래 (1천만원~1억원)"
  },
  {
    minAmount: 100000000, // 1억원
    maxAmount: 1000000000, // 10억원
    currency: "KRW",
    requiredApprovers: ["박재무", "한리스크", "이기술", "송컴플", "김대표"],
    description: "고액 거래 (1억원~10억원)"
  },
  {
    minAmount: 1000000000, // 10억원
    maxAmount: Infinity,
    currency: "KRW",
    requiredApprovers: ["박재무", "한리스크", "이기술", "송컴플", "김대표", "김매니저"],
    description: "초고액 거래 (10억원 이상)"
  }
];

/**
 * 환율 정보 (실제로는 외부 API에서 가져와야 함)
 */
const EXCHANGE_RATES = {
  BTC: 60000000, // 1 BTC = 6천만원
  ETH: 4000000,  // 1 ETH = 400만원
  USDT: 1350,    // 1 USDT = 1,350원
  USDC: 1350,    // 1 USDC = 1,350원
  KRW: 1         // 1 KRW = 1원
};

/**
 * 모든 금액을 원화 기준으로 변환
 */
export function convertToKRW(amount: number, currency: Currency): number {
  const rate = EXCHANGE_RATES[currency] || 1;
  return amount * rate;
}

/**
 * 금액과 통화에 따라 적절한 결재자 목록을 반환
 * 모든 가상자산을 KRW로 환산하여 정책 적용
 */
export function getRequiredApprovers(amount: number, currency: Currency): string[] {
  // 가상자산을 KRW로 환산
  const krwAmount = convertToKRW(amount, currency);

  // KRW 기준 정책에서 매칭되는 정책 찾기
  const matchedPolicy = APPROVAL_POLICIES.find(policy =>
    krwAmount >= policy.minAmount && krwAmount < policy.maxAmount
  );

  if (matchedPolicy) {
    return matchedPolicy.requiredApprovers;
  }

  // 매칭되는 정책이 없으면 기본값 (최소 2명)
  return ["박재무", "윤보안"];
}

/**
 * 특정 거래에 대한 승인 정책 정보를 반환
 * 모든 가상자산을 KRW로 환산하여 정책 적용
 */
export function getApprovalPolicyInfo(amount: number, currency: Currency): ApprovalPolicy | null {
  // 가상자산을 KRW로 환산
  const krwAmount = convertToKRW(amount, currency);

  return APPROVAL_POLICIES.find(policy =>
    krwAmount >= policy.minAmount && krwAmount < policy.maxAmount
  ) || null;
}

/**
 * 거래 유형별 추가 결재자 (특수한 경우)
 */
export interface TransactionTypePolicy {
  type: string;
  additionalApprovers: string[];
  description: string;
}

export const TRANSACTION_TYPE_POLICIES: TransactionTypePolicy[] = [
  {
    type: "cross_border",
    additionalApprovers: ["정법무이사"],
    description: "국경간 거래 - 법무 검토 필수"
  },
  {
    type: "institutional",
    additionalApprovers: ["한비즈데브이사"],
    description: "기관 거래 - 비즈니스 개발팀 검토"
  },
  {
    type: "emergency",
    additionalApprovers: ["최CEO"],
    description: "긴급 거래 - CEO 직접 승인"
  }
];

/**
 * 거래 유형을 고려한 최종 결재자 목록 반환
 */
export function getFinalApprovers(
  amount: number,
  currency: Currency,
  transactionType?: string
): string[] {
  let approvers = getRequiredApprovers(amount, currency);

  // 거래 유형별 추가 결재자 확인
  if (transactionType) {
    const typePolicy = TRANSACTION_TYPE_POLICIES.find(policy => policy.type === transactionType);
    if (typePolicy) {
      // 중복 제거하면서 추가 결재자 포함
      const additionalApprovers = typePolicy.additionalApprovers.filter(
        approver => !approvers.includes(approver)
      );
      approvers = [...approvers, ...additionalApprovers];
    }
  }

  return approvers;
}

/**
 * 정책 설명 텍스트 생성
 */
export function getPolicyDescription(amount: number, currency: Currency, transactionType?: string): string {
  const policy = getApprovalPolicyInfo(amount, currency);
  const baseDescription = policy?.description || "기본 결재 정책";

  if (transactionType) {
    const typePolicy = TRANSACTION_TYPE_POLICIES.find(p => p.type === transactionType);
    if (typePolicy) {
      return `${baseDescription} + ${typePolicy.description}`;
    }
  }

  return baseDescription;
}