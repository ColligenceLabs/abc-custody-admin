import { Currency } from "@/types/withdrawal";
import { UserRole } from "@/types/user";

/**
 * 역할 기반 승인 정책 인터페이스
 */
export interface RoleBasedApprovalPolicy {
  minAmount: number;
  maxAmount: number;
  currency: Currency;
  requiredRoles: ApprovalRequirement[];
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high' | 'critical';
}

/**
 * 승인 요구사항 인터페이스
 */
export interface ApprovalRequirement {
  role: UserRole;                    // 'admin' | 'manager' | 'operator' | 'viewer'
  department?: string;               // '재무팀' | '리스크팀' | '기술팀' 등
  count: number;                     // 필요한 인원 수
  priority: number;                  // 선택 우선순위 (1=최우선)
  fallbackDepartments?: string[];    // 대체 부서 옵션
  description: string;               // 요구사항 설명
}

/**
 * 선택된 승인자 정보
 */
export interface SelectedApprover {
  userId: string;
  userName: string;
  role: UserRole;
  department: string;
  priority: number;
  isAutoSelected: boolean;
  reason: string; // 선택된 이유
}

/**
 * 정책 매칭 결과
 */
export interface PolicyMatchResult {
  policy: RoleBasedApprovalPolicy;
  selectedApprovers: SelectedApprover[];
  missingRequirements: ApprovalRequirement[];
  warnings: string[];
}