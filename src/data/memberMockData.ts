import { Member, MemberType, MemberStatus } from '@/types/member';

export const MOCK_MEMBERS: Member[] = [
  // 기업 회원
  {
    memberId: 'M001',
    type: 'corporate',
    status: 'active',
    createdAt: '2024-12-01T09:00:00Z',
    plan: 'enterprise',
    hasAgreedToAllTerms: true,
    termsAgreedAt: '2024-12-01T09:05:00Z'
  },
  {
    memberId: 'M002',
    type: 'corporate',
    status: 'active',
    createdAt: '2024-12-15T10:00:00Z',
    plan: 'professional',
    hasAgreedToAllTerms: true,
    termsAgreedAt: '2024-12-15T10:05:00Z'
  },

  // 개인 회원
  {
    memberId: 'M100',
    type: 'individual',
    status: 'active',
    createdAt: '2025-01-10T11:00:00Z',
    plan: 'basic',
    hasAgreedToAllTerms: true,
    termsAgreedAt: '2025-01-10T11:05:00Z'
  },
  {
    memberId: 'M101',
    type: 'individual',
    status: 'active',
    createdAt: '2025-01-15T14:00:00Z',
    plan: 'professional',
    hasAgreedToAllTerms: true,
    termsAgreedAt: '2025-01-15T14:05:00Z'
  },
  {
    memberId: 'M102',
    type: 'individual',
    status: 'active',
    createdAt: '2025-01-20T16:00:00Z',
    plan: 'basic',
    hasAgreedToAllTerms: true,
    termsAgreedAt: '2025-01-20T16:05:00Z'
  }
];

// 유틸리티 함수
export const getMemberById = (memberId: string): Member | undefined => {
  return MOCK_MEMBERS.find(member => member.memberId === memberId);
};

export const getMembersByType = (type: MemberType): Member[] => {
  return MOCK_MEMBERS.filter(member => member.type === type);
};

export const getMembersByStatus = (status: MemberStatus): Member[] => {
  return MOCK_MEMBERS.filter(member => member.status === status);
};

export const getActiveCorporateMembers = (): Member[] => {
  return MOCK_MEMBERS.filter(
    member => member.type === 'corporate' && member.status === 'active'
  );
};

export const getActiveIndividualMembers = (): Member[] => {
  return MOCK_MEMBERS.filter(
    member => member.type === 'individual' && member.status === 'active'
  );
};
