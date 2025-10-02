import { OrganizationUser, UserRole, DEFAULT_PERMISSIONS_BY_ROLE } from '@/types/organizationUser';

export const MOCK_ORGANIZATION_USERS: OrganizationUser[] = [
  // ORG001 소속 사용자 (10명)
  {
    id: '1',
    organizationUserId: 'OU001',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '김대표',
    email: 'ceo@company.com',
    phone: '+82 010-1111-1111',
    role: 'admin',
    status: 'active',
    lastLogin: '2025-09-15T10:30:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.admin,
    department: '경영진',
    position: 'CEO',
    hasGASetup: true,
    gaSetupDate: '2025-09-10T14:20:00Z',
    isFirstLogin: false
  },
  {
    id: '2',
    organizationUserId: 'OU002',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '박재무',
    email: 'cfo@company.com',
    phone: '+82 010-1111-2222',
    role: 'manager',
    status: 'active',
    lastLogin: '2025-09-14T09:15:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.manager,
    department: '재무팀',
    position: 'CFO',
    hasGASetup: true,
    gaSetupDate: '2025-09-12T16:30:00Z',
    isFirstLogin: false
  },
  {
    id: '3',
    organizationUserId: 'OU003',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '이기술',
    email: 'cto@company.com',
    phone: '+82 010-1111-3333',
    role: 'manager',
    status: 'active',
    lastLogin: '2025-09-13T08:45:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.manager,
    department: '기술팀',
    position: 'CTO',
    hasGASetup: true,
    gaSetupDate: '2025-09-11T10:15:00Z',
    isFirstLogin: false
  },
  {
    id: '4',
    organizationUserId: 'OU004',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '최관리',
    email: 'manager@company.com',
    phone: '+82 010-1111-4444',
    role: 'manager',
    status: 'active',
    lastLogin: '2025-09-12T07:30:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.manager,
    department: 'IT팀',
    position: '관리자',
    hasGASetup: true,
    gaSetupDate: '2025-09-08T09:45:00Z',
    isFirstLogin: false
  },
  {
    id: '5',
    organizationUserId: 'OU005',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '정부관',
    email: 'sub-manager@company.com',
    phone: '+82 010-1111-5555',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-11T16:45:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: 'IT팀',
    position: '부관리자',
    hasGASetup: true,
    gaSetupDate: '2025-09-07T14:20:00Z',
    isFirstLogin: false
  },
  {
    id: '6',
    organizationUserId: 'OU006',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '한리스크',
    email: 'risk@company.com',
    phone: '+82 010-1111-6666',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-10T15:20:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '리스크팀',
    position: '리스크관리자',
    hasGASetup: true,
    gaSetupDate: '2025-09-06T11:30:00Z',
    isFirstLogin: false
  },
  {
    id: '7',
    organizationUserId: 'OU007',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '송컴플',
    email: 'compliance@company.com',
    phone: '+82 010-1111-7777',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-09T14:10:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '컴플라이언스팀',
    position: '컴플라이언스',
    hasGASetup: true,
    gaSetupDate: '2025-09-05T16:45:00Z',
    isFirstLogin: false
  },
  {
    id: '8',
    organizationUserId: 'OU008',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '조운영',
    email: 'operations@company.com',
    phone: '+82 010-1111-8888',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-08T13:30:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '운영팀',
    position: '운영관리자',
    hasGASetup: true,
    gaSetupDate: '2025-09-04T12:10:00Z',
    isFirstLogin: false
  },
  {
    id: '9',
    organizationUserId: 'OU009',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '김매니저',
    email: 'manager2@company.com',
    phone: '+82 010-1111-9999',
    role: 'manager',
    status: 'active',
    lastLogin: '2025-09-07T12:15:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.manager,
    department: '재무팀',
    position: '매니저',
    hasGASetup: true,
    gaSetupDate: '2025-09-03T15:20:00Z',
    isFirstLogin: false
  },
  {
    id: '10',
    organizationUserId: 'OU010',
    organizationId: 'ORG001',
    memberId: 'M001',
    name: '박조회자',
    email: 'viewer@company.com',
    phone: '+82 010-2222-0000',
    role: 'viewer',
    status: 'active',
    lastLogin: '2025-09-06T11:00:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.viewer,
    department: '회계팀',
    position: '조회자',
    hasGASetup: true,
    gaSetupDate: '2025-09-02T10:30:00Z',
    isFirstLogin: false
  },

  // ORG002 소속 사용자 (6명)
  {
    id: '11',
    organizationUserId: 'OU011',
    organizationId: 'ORG002',
    memberId: 'M002',
    name: '신신청자',
    email: 'initiator@companyb.com',
    phone: '+82 010-2222-1111',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-05T10:30:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '운영팀',
    position: '신청자',
    hasGASetup: true,
    gaSetupDate: '2025-09-01T13:45:00Z',
    isFirstLogin: false
  },
  {
    id: '12',
    organizationUserId: 'OU012',
    organizationId: 'ORG002',
    memberId: 'M002',
    name: '오승인자',
    email: 'approver2@companyb.com',
    phone: '+82 010-2222-2222',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-04T09:45:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '보안팀',
    position: '승인자',
    hasGASetup: true,
    gaSetupDate: '2025-08-31T08:20:00Z',
    isFirstLogin: false
  },
  {
    id: '13',
    organizationUserId: 'OU013',
    organizationId: 'ORG002',
    memberId: 'M002',
    name: '윤보안',
    email: 'security@companyb.com',
    phone: '+82 010-2222-3333',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-03T17:20:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '보안팀',
    position: 'CISO',
    hasGASetup: true,
    gaSetupDate: '2025-08-30T14:15:00Z',
    isFirstLogin: false
  },
  {
    id: '14',
    organizationUserId: 'OU014',
    organizationId: 'ORG002',
    memberId: 'M002',
    name: '임대기중',
    email: 'pending@companyb.com',
    phone: '+82 010-2222-4444',
    role: 'viewer',
    status: 'pending',
    lastLogin: '2025-09-02T00:00:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.viewer,
    department: '인사팀',
    position: '신입사원',
    hasGASetup: false,
    isFirstLogin: true
  },
  {
    id: '15',
    organizationUserId: 'OU015',
    organizationId: 'ORG002',
    memberId: 'M002',
    name: '전비활성',
    email: 'inactive@companyb.com',
    phone: '+82 010-2222-5555',
    role: 'operator',
    status: 'inactive',
    lastLogin: '2025-09-01T15:00:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '운영팀',
    position: '전 운영자',
    hasGASetup: true,
    gaSetupDate: '2025-08-29T11:30:00Z',
    isFirstLogin: false
  },
  {
    id: '16',
    organizationUserId: 'OU016',
    organizationId: 'ORG002',
    memberId: 'M002',
    name: '새신입',
    email: 'new@companyb.com',
    phone: '+82 010-3333-0001',
    role: 'operator',
    status: 'active',
    lastLogin: '2025-09-29T00:00:00Z',
    permissions: DEFAULT_PERMISSIONS_BY_ROLE.operator,
    department: '운영팀',
    position: '신입',
    hasGASetup: false,
    isFirstLogin: true
  }
];

// 유틸리티 함수 (기존 userMockData.ts 함수 유지)
export const getOrganizationUsersByRole = (role: UserRole): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user => user.role === role);
};

export const getActiveOrganizationUsers = (): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user => user.status === 'active');
};

export const getOrganizationUsersByDepartment = (department: string): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user => user.department === department);
};

export const getOrganizationUserById = (id: string): OrganizationUser | undefined => {
  return MOCK_ORGANIZATION_USERS.find(user => user.id === id);
};

export const getOrganizationUserByName = (name: string): OrganizationUser | undefined => {
  return MOCK_ORGANIZATION_USERS.find(user => user.name === name);
};

export const getOrganizationUserByEmail = (email: string): OrganizationUser | undefined => {
  return MOCK_ORGANIZATION_USERS.find(user => user.email === email);
};

export const getOrganizationUsersByOrganizationId = (organizationId: string): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user => user.organizationId === organizationId);
};

export const getOrganizationUsersByMemberId = (memberId: string): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user => user.memberId === memberId);
};

// 승인자 관련 필터링
export const getApprovers = (): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user =>
    ['operator', 'manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );
};

export const getRequiredApprovers = (): OrganizationUser[] => {
  return MOCK_ORGANIZATION_USERS.filter(user =>
    ['manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );
};

// 부서 목록
export const DEPARTMENTS = [
  '경영진',
  '재무팀',
  '기술팀',
  'IT팀',
  '리스크팀',
  '컴플라이언스팀',
  '운영팀',
  '회계팀',
  '보안팀',
  '인사팀'
];
