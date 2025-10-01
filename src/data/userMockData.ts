import { User, UserRole, DEFAULT_PERMISSIONS_BY_ROLE } from '@/types/user';

export const MOCK_USERS: User[] = [
  {
    id: '1',
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
  {
    id: '11',
    name: '신신청자',
    email: 'initiator@company.com',
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
    name: '오승인자',
    email: 'approver2@company.com',
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
    name: '윤보안',
    email: 'security@company.com',
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
    name: '임대기중',
    email: 'pending@company.com',
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
    name: '전비활성',
    email: 'inactive@company.com',
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
  // 신규 사용자 추가 (테스트용)
  {
    id: '16',
    name: '새신입',
    email: 'new@company.com',
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

// 역할별 사용자 필터링 함수들
export const getUsersByRole = (role: UserRole): User[] => {
  return MOCK_USERS.filter(user => user.role === role);
};

export const getActiveUsers = (): User[] => {
  return MOCK_USERS.filter(user => user.status === 'active');
};

export const getUsersByDepartment = (department: string): User[] => {
  return MOCK_USERS.filter(user => user.department === department);
};

export const getUserById = (id: string): User | undefined => {
  return MOCK_USERS.find(user => user.id === id);
};

export const getUserByName = (name: string): User | undefined => {
  return MOCK_USERS.find(user => user.name === name);
};

export const getUserByEmail = (email: string): User | undefined => {
  return MOCK_USERS.find(user => user.email === email);
};

// 승인자 관련 필터링
export const getApprovers = (): User[] => {
  return MOCK_USERS.filter(user =>
    ['operator', 'manager', 'admin'].includes(user.role) &&
    user.status === 'active'
  );
};

export const getRequiredApprovers = (): User[] => {
  return MOCK_USERS.filter(user =>
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