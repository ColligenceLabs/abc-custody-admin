// 회원 타입 정의

export type MemberType = 'corporate' | 'individual';
export type MemberStatus = 'active' | 'inactive' | 'suspended';

export interface Member {
  memberId: string;
  type: MemberType;
  status: MemberStatus;
  createdAt: string;
  plan: string;
  hasAgreedToAllTerms: boolean;
}

// 회원 타입별 한국어 이름
export const MEMBER_TYPE_NAMES: Record<MemberType, string> = {
  corporate: '기업 회원',
  individual: '개인 회원'
};

// 회원 상태별 한국어 이름
export const MEMBER_STATUS_NAMES: Record<MemberStatus, string> = {
  active: '활성',
  inactive: '비활성',
  suspended: '정지'
};

// 요금제 옵션
export const PLAN_OPTIONS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise'
} as const;

export const PLAN_NAMES: Record<string, string> = {
  basic: '베이직',
  professional: '프로페셔널',
  enterprise: '엔터프라이즈'
};
