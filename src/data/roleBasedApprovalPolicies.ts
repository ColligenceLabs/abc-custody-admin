import { RoleBasedApprovalPolicy } from "@/types/approval";

/**
 * 역할 기반 승인 정책 데이터
 * MOCK_USERS의 사용자 역할과 부서를 기반으로 동적으로 결재자를 선택
 */
export const ROLE_BASED_APPROVAL_POLICIES: RoleBasedApprovalPolicy[] = [
  // 소액 거래 (100만원 미만)
  {
    minAmount: 0,
    maxAmount: 1000000,
    currency: "KRW",
    riskLevel: "low",
    requiredRoles: [
      {
        role: 'manager',
        department: '재무팀',
        count: 1,
        priority: 1,
        description: '재무팀 매니저 승인'
      },
      {
        role: 'operator',
        department: '리스크팀',
        count: 1,
        priority: 2,
        fallbackDepartments: ['보안팀'],
        description: '리스크 관리 검토'
      }
    ],
    description: "소액 거래 (100만원 미만)"
  },

  // 일반 거래 (100만원~1천만원)
  {
    minAmount: 1000000,
    maxAmount: 10000000,
    currency: "KRW",
    riskLevel: "medium",
    requiredRoles: [
      {
        role: 'manager',
        department: '재무팀',
        count: 1,
        priority: 1,
        description: '재무팀 매니저 승인'
      },
      {
        role: 'operator',
        department: '리스크팀',
        count: 1,
        priority: 2,
        fallbackDepartments: ['보안팀'],
        description: '리스크 관리 검토'
      },
      {
        role: 'manager',
        department: '기술팀',
        count: 1,
        priority: 3,
        fallbackDepartments: ['IT팀'],
        description: '기술팀 매니저 검토'
      }
    ],
    description: "일반 거래 (100만원~1천만원)"
  },

  // 중액 거래 (1천만원~1억원)
  {
    minAmount: 10000000,
    maxAmount: 100000000,
    currency: "KRW",
    riskLevel: "high",
    requiredRoles: [
      {
        role: 'manager',
        department: '재무팀',
        count: 1,
        priority: 1,
        description: '재무팀 매니저 승인'
      },
      {
        role: 'operator',
        department: '리스크팀',
        count: 1,
        priority: 2,
        fallbackDepartments: ['보안팀'],
        description: '리스크 관리 검토'
      },
      {
        role: 'manager',
        department: '기술팀',
        count: 1,
        priority: 3,
        fallbackDepartments: ['IT팀'],
        description: '기술팀 매니저 검토'
      },
      {
        role: 'operator',
        department: '컴플라이언스팀',
        count: 1,
        priority: 4,
        description: '컴플라이언스 검토'
      }
    ],
    description: "중액 거래 (1천만원~1억원)"
  },

  // 고액 거래 (1억원~10억원)
  {
    minAmount: 100000000,
    maxAmount: 1000000000,
    currency: "KRW",
    riskLevel: "very_high",
    requiredRoles: [
      {
        role: 'manager',
        department: '재무팀',
        count: 1,
        priority: 1,
        description: '재무팀 매니저 승인'
      },
      {
        role: 'operator',
        department: '리스크팀',
        count: 1,
        priority: 2,
        fallbackDepartments: ['보안팀'],
        description: '리스크 관리 검토'
      },
      {
        role: 'manager',
        department: '기술팀',
        count: 1,
        priority: 3,
        fallbackDepartments: ['IT팀'],
        description: '기술팀 매니저 검토'
      },
      {
        role: 'operator',
        department: '컴플라이언스팀',
        count: 1,
        priority: 4,
        description: '컴플라이언스 검토'
      },
      {
        role: 'admin',
        count: 1,
        priority: 5,
        description: '관리자 최종 승인'
      }
    ],
    description: "고액 거래 (1억원~10억원)"
  },

  // 초고액 거래 (10억원 이상)
  {
    minAmount: 1000000000,
    maxAmount: Infinity,
    currency: "KRW",
    riskLevel: "critical",
    requiredRoles: [
      {
        role: 'manager',
        department: '재무팀',
        count: 2, // 재무팀 매니저 2명 필요
        priority: 1,
        description: '재무팀 매니저 복수 승인'
      },
      {
        role: 'operator',
        department: '리스크팀',
        count: 1,
        priority: 2,
        fallbackDepartments: ['보안팀'],
        description: '리스크 관리 검토'
      },
      {
        role: 'manager',
        department: '기술팀',
        count: 1,
        priority: 3,
        fallbackDepartments: ['IT팀'],
        description: '기술팀 매니저 검토'
      },
      {
        role: 'operator',
        department: '컴플라이언스팀',
        count: 1,
        priority: 4,
        description: '컴플라이언스 검토'
      },
      {
        role: 'admin',
        count: 1,
        priority: 5,
        description: '관리자 최종 승인'
      }
    ],
    description: "초고액 거래 (10억원 이상)"
  }
];

/**
 * 특수 거래 유형별 추가 승인 요구사항
 */
export const SPECIAL_TRANSACTION_REQUIREMENTS = {
  cross_border: {
    additionalRoles: [
      {
        role: 'operator' as const,
        department: '법무팀',
        count: 1,
        priority: 10,
        description: '국경간 거래 법무 검토'
      }
    ],
    description: '국경간 거래 - 법무 검토 필수'
  },

  institutional: {
    additionalRoles: [
      {
        role: 'manager' as const,
        department: '비즈니스개발팀',
        count: 1,
        priority: 10,
        fallbackDepartments: ['영업팀'],
        description: '기관 거래 비즈니스 검토'
      }
    ],
    description: '기관 거래 - 비즈니스 개발팀 검토'
  },

  emergency: {
    additionalRoles: [
      {
        role: 'admin' as const,
        count: 1,
        priority: 1, // 최우선
        description: '긴급 거래 최고 책임자 직접 승인'
      }
    ],
    description: '긴급 거래 - 최고 책임자 직접 승인'
  }
};