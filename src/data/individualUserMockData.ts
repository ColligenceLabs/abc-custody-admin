import {
  IndividualUser,
  KYCLevel,
  DEFAULT_INDIVIDUAL_PERMISSIONS,
  DEFAULT_WALLET_LIMITS
} from '@/types/individualUser';

export const MOCK_INDIVIDUAL_USERS: IndividualUser[] = [
  {
    id: 'I001',
    individualUserId: 'IU001',
    memberId: 'M100',
    name: '홍길동',
    email: 'hong@gmail.com',
    phone: '+82 010-3000-0001',
    status: 'active',
    lastLogin: '2025-09-20T10:00:00Z',
    hasGASetup: true,
    gaSetupDate: '2025-01-10T12:00:00Z',
    isFirstLogin: false,
    birthDate: '1990-05-15',
    identityVerified: true,
    kycLevel: 'level3',
    kycVerifiedAt: '2025-01-10T13:00:00Z',
    fundSource: '급여소득',
    amlVerifiedAt: '2025-01-10T14:00:00Z',
    amlNextVerificationDate: '2026-01-10T14:00:00Z',
    amlVerificationCycle: 12,
    permissions: DEFAULT_INDIVIDUAL_PERMISSIONS,
    walletLimit: DEFAULT_WALLET_LIMITS.level3
  },
  {
    id: 'I002',
    individualUserId: 'IU002',
    memberId: 'M101',
    name: '김영희',
    email: 'kim.younghee@naver.com',
    phone: '+82 010-3000-0002',
    status: 'active',
    lastLogin: '2025-09-19T14:30:00Z',
    hasGASetup: true,
    gaSetupDate: '2025-01-15T15:00:00Z',
    isFirstLogin: false,
    birthDate: '1985-08-20',
    identityVerified: true,
    kycLevel: 'level2',
    kycVerifiedAt: '2025-01-15T16:00:00Z',
    fundSource: '사업소득',
    amlVerifiedAt: '2025-01-15T17:00:00Z',
    amlNextVerificationDate: '2026-01-15T17:00:00Z',
    amlVerificationCycle: 12,
    permissions: DEFAULT_INDIVIDUAL_PERMISSIONS,
    walletLimit: DEFAULT_WALLET_LIMITS.level2
  },
  {
    id: 'I003',
    individualUserId: 'IU003',
    memberId: 'M102',
    name: '박철수',
    email: 'park.cs@kakao.com',
    phone: '+82 010-3000-0003',
    status: 'active',
    lastLogin: '2025-09-18T09:15:00Z',
    hasGASetup: false,
    isFirstLogin: false,
    birthDate: '1995-12-10',
    identityVerified: true,
    kycLevel: 'level1',
    kycVerifiedAt: '2025-01-20T17:00:00Z',
    fundSource: '투자소득',
    amlVerifiedAt: '2025-01-20T18:00:00Z',
    amlNextVerificationDate: '2026-01-20T18:00:00Z',
    amlVerificationCycle: 12,
    permissions: DEFAULT_INDIVIDUAL_PERMISSIONS,
    walletLimit: DEFAULT_WALLET_LIMITS.level1
  }
];

// 유틸리티 함수
export const getIndividualUserById = (id: string): IndividualUser | undefined => {
  return MOCK_INDIVIDUAL_USERS.find(user => user.id === id);
};

export const getIndividualUserByMemberId = (memberId: string): IndividualUser | undefined => {
  return MOCK_INDIVIDUAL_USERS.find(user => user.memberId === memberId);
};

export const getIndividualUserByEmail = (email: string): IndividualUser | undefined => {
  return MOCK_INDIVIDUAL_USERS.find(user => user.email === email);
};

export const getIndividualUsersByKYCLevel = (kycLevel: KYCLevel): IndividualUser[] => {
  return MOCK_INDIVIDUAL_USERS.filter(user => user.kycLevel === kycLevel);
};

export const getActiveIndividualUsers = (): IndividualUser[] => {
  return MOCK_INDIVIDUAL_USERS.filter(user => user.status === 'active');
};

export const getVerifiedIndividualUsers = (): IndividualUser[] => {
  return MOCK_INDIVIDUAL_USERS.filter(user => user.identityVerified);
};
