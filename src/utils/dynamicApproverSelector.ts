/**
 * 동적 결재자 선택 유틸리티
 * MOCK_USERS를 기반으로 역할과 부서에 따라 자동으로 최적의 결재자를 선택
 */

import { User } from "@/types/user";
import { Currency } from "@/types/withdrawal";
import { CryptoCurrency } from "@/types/groups";
import { MOCK_USERS } from "@/data/userMockData";
import {
  RoleBasedApprovalPolicy,
  ApprovalRequirement,
  SelectedApprover,
  PolicyMatchResult
} from "@/types/approval";
import {
  ROLE_BASED_APPROVAL_POLICIES,
  SPECIAL_TRANSACTION_REQUIREMENTS
} from "@/data/roleBasedApprovalPolicies";

/**
 * 환율 정보 (실제 환경에서는 외부 API 연동)
 */
const EXCHANGE_RATES = {
  BTC: 60000000, // 1 BTC = 6천만원
  ETH: 4000000,  // 1 ETH = 400만원
  USDT: 1350,    // 1 USDT = 1,350원
  USDC: 1350,    // 1 USDC = 1,350원
  SOL: 150000,   // 1 SOL = 150,000원
  KRW: 1         // 1 KRW = 1원
};

/**
 * 가상자산을 KRW로 환산
 */
export function convertToKRW(amount: number, currency: Currency | CryptoCurrency): number {
  if (amount <= 0) return 0;

  const rate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 1;
  return Math.round(amount * rate);
}

/**
 * 금액에 따른 정책 매칭
 */
export function matchRoleBasedPolicy(
  amount: number,
  currency: Currency | CryptoCurrency
): RoleBasedApprovalPolicy | null {
  const krwAmount = convertToKRW(amount, currency);

  return ROLE_BASED_APPROVAL_POLICIES.find(policy =>
    krwAmount >= policy.minAmount && krwAmount <= policy.maxAmount
  ) || null;
}

/**
 * 사용자 우선순위 점수 계산
 */
function getUserPriorityScore(user: User): number {
  // CEO/대표 = 최우선
  if (user.name.includes('대표') || user.position === 'CEO') return 1;

  // C-level 임원들 (CTO, CFO 등)
  if (user.position?.includes('C') && user.position?.includes('O')) return 2;

  // 매니저급
  if (user.role === 'manager') return 3;

  // 운영자급
  if (user.role === 'operator') return 4;

  // 관리자
  if (user.role === 'admin') return 5;

  return 10; // 기타
}

/**
 * 승인 요구사항에 맞는 사용자 후보 필터링
 */
function findCandidatesForRequirement(
  requirement: ApprovalRequirement,
  excludeUsers: User[] = []
): User[] {
  const excludeIds = excludeUsers.map(u => u.id);

  return MOCK_USERS.filter(user => {
    // 기본 조건: 활성 상태, 역할 일치, 중복 제외
    if (user.status !== 'active' ||
        user.role !== requirement.role ||
        excludeIds.includes(user.id)) {
      return false;
    }

    // 부서 조건 확인
    if (requirement.department) {
      const validDepartments = [
        requirement.department,
        ...(requirement.fallbackDepartments || [])
      ];
      return validDepartments.includes(user.department);
    }

    return true;
  });
}

/**
 * 특정 요구사항에 대한 최적 사용자 선택
 */
function selectBestUsersForRequirement(
  requirement: ApprovalRequirement,
  excludeUsers: User[] = []
): SelectedApprover[] {
  const candidates = findCandidatesForRequirement(requirement, excludeUsers);

  // 우선순위에 따라 정렬
  const sortedCandidates = candidates.sort((a, b) => {
    const scoreA = getUserPriorityScore(a);
    const scoreB = getUserPriorityScore(b);
    return scoreA - scoreB;
  });

  // 필요한 수만큼 선택
  const selectedUsers = sortedCandidates.slice(0, requirement.count);

  return selectedUsers.map(user => ({
    userId: user.id,
    userName: user.name,
    role: user.role,
    department: user.department,
    priority: requirement.priority,
    isAutoSelected: true,
    reason: `${requirement.description} (${user.department} ${user.position})`
  }));
}

/**
 * 메인 함수: 정책에 따른 동적 결재자 선택
 */
export function selectApproversByPolicy(
  amount: number,
  currency: Currency | CryptoCurrency,
  transactionType?: string
): PolicyMatchResult {
  // 1. 기본 정책 매칭
  const policy = matchRoleBasedPolicy(amount, currency);

  if (!policy) {
    return {
      policy: {
        minAmount: 0,
        maxAmount: 0,
        currency: 'KRW',
        requiredRoles: [],
        description: '매칭되는 정책 없음',
        riskLevel: 'low'
      },
      selectedApprovers: [],
      missingRequirements: [],
      warnings: ['해당 금액에 대한 정책을 찾을 수 없습니다.']
    };
  }

  // 2. 특수 거래 유형에 따른 추가 요구사항
  let allRequirements = [...policy.requiredRoles];
  if (transactionType && SPECIAL_TRANSACTION_REQUIREMENTS[transactionType as keyof typeof SPECIAL_TRANSACTION_REQUIREMENTS]) {
    const specialReq = SPECIAL_TRANSACTION_REQUIREMENTS[transactionType as keyof typeof SPECIAL_TRANSACTION_REQUIREMENTS];
    allRequirements.push(...specialReq.additionalRoles);
  }

  // 우선순위 순으로 정렬
  allRequirements.sort((a, b) => a.priority - b.priority);

  // 3. 순차적으로 결재자 선택
  const selectedApprovers: SelectedApprover[] = [];
  const missingRequirements: ApprovalRequirement[] = [];
  const warnings: string[] = [];
  const usedUsers: User[] = [];

  for (const requirement of allRequirements) {
    const selected = selectBestUsersForRequirement(requirement, usedUsers);

    if (selected.length < requirement.count) {
      missingRequirements.push(requirement);
      warnings.push(
        `${requirement.description}에 필요한 인원 ${requirement.count}명 중 ${selected.length}명만 찾을 수 있습니다.`
      );
    }

    selectedApprovers.push(...selected);

    // 선택된 사용자들을 제외 목록에 추가
    const selectedUserObjects = selected.map(s =>
      MOCK_USERS.find(u => u.id === s.userId)!
    ).filter(Boolean);
    usedUsers.push(...selectedUserObjects);
  }

  return {
    policy,
    selectedApprovers,
    missingRequirements,
    warnings
  };
}

/**
 * 기존 approverAssignment.ts와의 호환성을 위한 래퍼 함수
 */
export function getRequiredApproversCompat(
  amount: number,
  currency: Currency | CryptoCurrency
): string[] {
  const result = selectApproversByPolicy(amount, currency);
  return result.selectedApprovers.map(approver => approver.userId);
}

/**
 * 결재자 이름 목록 반환 (기존 컴포넌트 호환성)
 */
export function getRequiredApproverNames(
  amount: number,
  currency: Currency | CryptoCurrency
): string[] {
  const result = selectApproversByPolicy(amount, currency);
  return result.selectedApprovers.map(approver => approver.userName);
}

/**
 * 정책 정보와 결재자 정보를 함께 반환
 */
export function getApprovalPolicyInfo(
  amount: number,
  currency: Currency | CryptoCurrency
): {
  policy: RoleBasedApprovalPolicy | null;
  approvers: SelectedApprover[];
  warnings: string[];
} {
  const result = selectApproversByPolicy(amount, currency);
  return {
    policy: result.policy,
    approvers: result.selectedApprovers,
    warnings: result.warnings
  };
}

/**
 * KRW 금액 포맷팅
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
 * 위험도에 따른 색상 클래스 반환
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case "low":
      return "text-sky-600";
    case "medium":
      return "text-yellow-600";
    case "high":
      return "text-orange-600";
    case "very_high":
      return "text-red-600";
    case "critical":
      return "text-red-800";
    default:
      return "text-gray-600";
  }
}