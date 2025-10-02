// 조직 타입 정의

export interface Organization {
  organizationId: string;
  memberId: string;
  organizationName: string;
  businessNumber: string;
  industry: string;
  representativeEmail: string;
  address?: string;
  phoneNumber?: string;
  establishedDate?: string;
  isVerified: boolean;
  verifiedAt?: string;
}

// 산업 분류
export const INDUSTRY_OPTIONS = [
  '금융',
  'IT/소프트웨어',
  '제조',
  '유통/물류',
  '의료/제약',
  '교육',
  '부동산',
  '서비스',
  '미디어/엔터테인먼트',
  '기타'
] as const;

export type IndustryType = typeof INDUSTRY_OPTIONS[number];
