import { Organization } from '@/types/organization';

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    organizationId: 'ORG001',
    memberId: 'M001',
    organizationName: '주식회사 에이',
    businessNumber: '123-45-67890',
    industry: '금융',
    representativeEmail: 'ceo@company.com',
    address: '서울특별시 강남구 테헤란로 123',
    phoneNumber: '+82 2-1234-5678',
    establishedDate: '2020-01-15',
    isVerified: true,
    verifiedAt: '2024-12-01T10:00:00Z'
  },
  {
    organizationId: 'ORG002',
    memberId: 'M002',
    organizationName: '주식회사 비',
    businessNumber: '987-65-43210',
    industry: 'IT/소프트웨어',
    representativeEmail: 'ceo@companyb.com',
    address: '서울특별시 서초구 서초대로 456',
    phoneNumber: '+82 2-9876-5432',
    establishedDate: '2021-03-20',
    isVerified: true,
    verifiedAt: '2024-12-15T11:00:00Z'
  }
];

// 유틸리티 함수
export const getOrganizationById = (organizationId: string): Organization | undefined => {
  return MOCK_ORGANIZATIONS.find(org => org.organizationId === organizationId);
};

export const getOrganizationByMemberId = (memberId: string): Organization | undefined => {
  return MOCK_ORGANIZATIONS.find(org => org.memberId === memberId);
};

export const getVerifiedOrganizations = (): Organization[] => {
  return MOCK_ORGANIZATIONS.filter(org => org.isVerified);
};

export const getOrganizationsByIndustry = (industry: string): Organization[] => {
  return MOCK_ORGANIZATIONS.filter(org => org.industry === industry);
};
