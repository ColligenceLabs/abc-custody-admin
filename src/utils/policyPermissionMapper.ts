import { User, UserRole } from '@/types/user';
import { PolicyApprovalMapping } from '@/types/permission';
import { hasPermission } from './permissionUtils';

// 로컬 함수들 (승인 정책 관련)
function canApprovePolicy(user: User, policyId: string): boolean {
  // 정책별 승인 권한은 개별적으로 관리
  return user.role === 'admin' || user.role === 'manager' || user.role === 'operator';
}

function canApproveAmount(user: User, amount: number): boolean {
  // 역할별 금액 제한
  const limits = {
    admin: Infinity,
    manager: 100000000,
    operator: 10000000,
    viewer: 0
  };
  return amount <= limits[user.role];
}

/**
 * 정책-권한 매핑 관련 유틸리티 함수들
 */

// Mock 정책 데이터 (실제로는 API에서 가져올 데이터)
export const MOCK_POLICY_MAPPINGS: PolicyApprovalMapping[] = [
  {
    policyId: 'policy_small_amount',
    policyName: '소액 거래 정책',
    description: '일반적인 소액 거래에 대한 승인 정책',
    minAmount: 0,
    maxAmount: 10000000, // 1천만원
    requiredApprovers: ['operator', 'manager', 'admin'],
    optionalApprovers: [],
    riskLevel: 'low'
  },
  {
    policyId: 'policy_medium_amount',
    policyName: '중액 거래 정책',
    description: '중간 규모 거래에 대한 승인 정책',
    minAmount: 10000000, // 1천만원
    maxAmount: 100000000, // 1억원
    requiredApprovers: ['manager', 'admin'],
    optionalApprovers: ['operator'],
    riskLevel: 'medium'
  },
  {
    policyId: 'policy_large_amount',
    policyName: '고액 거래 정책',
    description: '고액 거래에 대한 엄격한 승인 정책',
    minAmount: 100000000, // 1억원
    maxAmount: Infinity,
    requiredApprovers: ['admin'],
    optionalApprovers: ['manager'],
    riskLevel: 'high'
  },
  {
    policyId: 'policy_emergency',
    policyName: '긴급 거래 정책',
    description: '긴급 상황에서의 특별 승인 정책',
    minAmount: 0,
    maxAmount: 50000000, // 5천만원
    requiredApprovers: ['admin'],
    optionalApprovers: [],
    riskLevel: 'critical'
  }
];

/**
 * 정책 ID로 정책 매핑 정보를 가져오기
 */
export function getPolicyMapping(policyId: string): PolicyApprovalMapping | undefined {
  return MOCK_POLICY_MAPPINGS.find(policy => policy.policyId === policyId);
}

/**
 * 특정 금액에 해당하는 정책들을 가져오기
 */
export function getPoliciesForAmount(amount: number): PolicyApprovalMapping[] {
  return MOCK_POLICY_MAPPINGS.filter(policy =>
    amount >= policy.minAmount && amount <= policy.maxAmount
  );
}

/**
 * 사용자가 특정 정책을 승인할 수 있는지 확인
 */
export function canUserApprovePolicy(user: User, policyId: string): boolean {
  const policy = getPolicyMapping(policyId);
  if (!policy) return false;

  // 관리자는 모든 정책 승인 가능
  if (user.role === 'admin') return true;

  // 정책의 필수 승인자 목록에 사용자 역할이 포함되는지 확인
  const canApproveByRole = policy.requiredApprovers.includes(user.role) ||
                          policy.optionalApprovers.includes(user.role);

  // 사용자별 개별 정책 승인 권한 확인
  const canApproveByUser = canApprovePolicy(user, policyId);

  return canApproveByRole && canApproveByUser;
}

/**
 * 사용자가 특정 금액의 거래를 승인할 수 있는지 확인
 */
export function canUserApproveAmount(user: User, amount: number): {
  canApprove: boolean;
  applicablePolicies: PolicyApprovalMapping[];
  reason?: string;
} {
  const applicablePolicies = getPoliciesForAmount(amount);

  if (applicablePolicies.length === 0) {
    return {
      canApprove: false,
      applicablePolicies: [],
      reason: '해당 금액에 적용할 수 있는 정책이 없습니다.'
    };
  }

  // 적용 가능한 정책 중 하나라도 승인할 수 있으면 승인 가능
  const approvablePolicies = applicablePolicies.filter(policy =>
    canUserApprovePolicy(user, policy.policyId)
  );

  if (approvablePolicies.length === 0) {
    return {
      canApprove: false,
      applicablePolicies,
      reason: '해당 금액의 거래를 승인할 권한이 없습니다.'
    };
  }

  // 사용자별 최대 승인 금액 확인
  if (!canApproveAmount(user, amount)) {
    return {
      canApprove: false,
      applicablePolicies,
      reason: '사용자의 최대 승인 금액을 초과했습니다.'
    };
  }

  return {
    canApprove: true,
    applicablePolicies: approvablePolicies
  };
}

/**
 * 역할별로 승인 가능한 정책 목록을 가져오기
 */
export function getPoliciesForRole(role: UserRole): PolicyApprovalMapping[] {
  return MOCK_POLICY_MAPPINGS.filter(policy =>
    policy.requiredApprovers.includes(role) || policy.optionalApprovers.includes(role)
  );
}

/**
 * 위험도별로 정책을 필터링
 */
export function getPoliciesByRiskLevel(riskLevel: PolicyApprovalMapping['riskLevel']): PolicyApprovalMapping[] {
  return MOCK_POLICY_MAPPINGS.filter(policy => policy.riskLevel === riskLevel);
}

/**
 * 정책에 필요한 승인자 수 계산
 */
export function getRequiredApproversCount(policyId: string): number {
  const policy = getPolicyMapping(policyId);
  return policy ? policy.requiredApprovers.length : 0;
}

/**
 * 사용자별 승인 가능한 정책 통계
 */
export function getUserApprovalStats(user: User): {
  totalPolicies: number;
  approvablePolicies: number;
  policiesByRisk: Record<PolicyApprovalMapping['riskLevel'], number>;
  maxAmount: number;
} {
  const approvablePolicies = MOCK_POLICY_MAPPINGS.filter(policy =>
    canUserApprovePolicy(user, policy.policyId)
  );

  const policiesByRisk = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0
  };

  approvablePolicies.forEach(policy => {
    policiesByRisk[policy.riskLevel]++;
  });

  // 승인 가능한 최대 금액 계산
  const maxAmount = approvablePolicies.reduce((max, policy) =>
    Math.max(max, policy.maxAmount === Infinity ? Number.MAX_SAFE_INTEGER : policy.maxAmount), 0
  );

  return {
    totalPolicies: MOCK_POLICY_MAPPINGS.length,
    approvablePolicies: approvablePolicies.length,
    policiesByRisk,
    maxAmount: maxAmount === Number.MAX_SAFE_INTEGER ? Infinity : maxAmount
  };
}

/**
 * 정책별 승인 워크플로우 정보
 */
export function getPolicyWorkflow(policyId: string): {
  policy: PolicyApprovalMapping;
  workflow: {
    step: number;
    approverRole: string;
    required: boolean;
  }[];
} | null {
  const policy = getPolicyMapping(policyId);
  if (!policy) return null;

  const workflow = [
    ...policy.requiredApprovers.map((role, index) => ({
      step: index + 1,
      approverRole: role,
      required: true
    })),
    ...policy.optionalApprovers.map((role, index) => ({
      step: policy.requiredApprovers.length + index + 1,
      approverRole: role,
      required: false
    }))
  ];

  return { policy, workflow };
}

/**
 * 거래 금액에 따른 추천 정책 반환
 */
export function getRecommendedPolicy(amount: number): PolicyApprovalMapping | null {
  const applicablePolicies = getPoliciesForAmount(amount);

  if (applicablePolicies.length === 0) return null;

  // 가장 적절한 정책 선택 (가장 낮은 위험도의 정책 우선)
  const riskPriority = { low: 1, medium: 2, high: 3, critical: 4 };

  return applicablePolicies.sort((a, b) =>
    riskPriority[a.riskLevel] - riskPriority[b.riskLevel]
  )[0];
}

/**
 * 정책 변경이 기존 승인에 미치는 영향 분석
 */
export function analyzePolicyChangeImpact(
  oldPolicy: PolicyApprovalMapping,
  newPolicy: PolicyApprovalMapping
): {
  impactLevel: 'low' | 'medium' | 'high';
  changes: string[];
  affectedUsers: string[];
} {
  const changes: string[] = [];
  let impactLevel: 'low' | 'medium' | 'high' = 'low';

  // 금액 범위 변경 확인
  if (oldPolicy.minAmount !== newPolicy.minAmount || oldPolicy.maxAmount !== newPolicy.maxAmount) {
    changes.push('금액 범위 변경');
    impactLevel = 'medium';
  }

  // 위험도 변경 확인
  if (oldPolicy.riskLevel !== newPolicy.riskLevel) {
    changes.push('위험도 등급 변경');
    impactLevel = 'high';
  }

  // 승인자 변경 확인
  const oldApprovers = [...oldPolicy.requiredApprovers, ...oldPolicy.optionalApprovers];
  const newApprovers = [...newPolicy.requiredApprovers, ...newPolicy.optionalApprovers];

  if (JSON.stringify(oldApprovers.sort()) !== JSON.stringify(newApprovers.sort())) {
    changes.push('승인자 권한 변경');
    impactLevel = 'high';
  }

  // 영향받는 사용자 역할 (실제로는 API에서 사용자 데이터를 가져와야 함)
  const affectedRoles = Array.from(new Set([...oldApprovers, ...newApprovers]));

  return {
    impactLevel,
    changes,
    affectedUsers: affectedRoles // 실제로는 역할별 사용자 ID 목록
  };
}

/**
 * 정책 유효성 검증
 */
export function validatePolicyMapping(policy: Partial<PolicyApprovalMapping>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!policy.policyId || policy.policyId.trim() === '') {
    errors.push('정책 ID는 필수입니다.');
  }

  if (!policy.policyName || policy.policyName.trim() === '') {
    errors.push('정책 이름은 필수입니다.');
  }

  if (policy.minAmount === undefined || policy.minAmount < 0) {
    errors.push('최소 금액은 0 이상이어야 합니다.');
  }

  if (policy.maxAmount === undefined || policy.maxAmount <= 0) {
    errors.push('최대 금액은 0보다 커야 합니다.');
  }

  if (policy.minAmount !== undefined && policy.maxAmount !== undefined &&
      policy.minAmount >= policy.maxAmount) {
    errors.push('최소 금액은 최대 금액보다 작아야 합니다.');
  }

  if (!policy.requiredApprovers || policy.requiredApprovers.length === 0) {
    errors.push('최소 한 명의 필수 승인자가 필요합니다.');
  }

  if (!policy.riskLevel || !['low', 'medium', 'high', 'critical'].includes(policy.riskLevel)) {
    errors.push('유효한 위험도 등급을 선택해야 합니다.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}