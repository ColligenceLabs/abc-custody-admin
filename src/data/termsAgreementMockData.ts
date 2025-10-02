import {
  Terms,
  MemberTermsAgreement,
  TermsType,
  REQUIRED_TERMS_TYPES
} from '@/types/termsAgreement';

// 약관 목록
export const MOCK_TERMS: Terms[] = [
  {
    termsId: 'TERMS001',
    type: 'personal_info',
    version: '1.0',
    title: '개인정보 수집 및 이용 동의',
    content: `1. 수집하는 개인정보 항목
- 필수항목: 이름, 이메일, 휴대폰번호
- 선택항목: 주소

2. 개인정보의 수집 및 이용 목적
- 회원 가입 및 관리
- 서비스 제공 및 개선

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지

4. 동의를 거부할 권리 및 거부 시 불이익
- 필수항목 미동의 시 회원가입 불가`,
    isRequired: true,
    effectiveDate: '2025-01-01',
    isActive: true
  },
  {
    termsId: 'TERMS002',
    type: 'certification_service',
    version: '1.0',
    title: '인증사 서비스 이용약관 동의',
    content: `제1조 (목적)
본 약관은 본인확인서비스 제공을 위한 이용조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.

제2조 (서비스의 내용)
1. 본인확인서비스는 휴대폰 본인확인을 통해 본인 여부를 확인합니다.
2. 본인확인기관은 정보통신망법에 따라 안전하게 개인정보를 처리합니다.

제3조 (개인정보의 제공)
회사는 본인확인을 위해 본인확인기관에 개인정보를 제공할 수 있습니다.`,
    isRequired: true,
    effectiveDate: '2025-01-01',
    isActive: true
  },
  {
    termsId: 'TERMS003',
    type: 'unique_id',
    version: '1.0',
    title: '고유식별정보 처리 동의',
    content: `1. 수집하는 고유식별정보
- 주민등록번호 (본인확인 시)
- 외국인등록번호 (외국인 본인확인 시)

2. 고유식별정보의 처리 목적
- 본인 식별 및 중복 가입 방지
- 법령상 의무 이행

3. 보유 및 이용 기간
- 회원 탈퇴 후 5년 (전자금융거래법)

4. 동의 거부 권리
- 고유식별정보 제공 거부 시 본인확인 서비스 이용 불가`,
    isRequired: true,
    effectiveDate: '2025-01-01',
    isActive: true
  },
  {
    termsId: 'TERMS004',
    type: 'telecom_service',
    version: '1.0',
    title: '통신사 이용약관 동의',
    content: `제1조 (목적)
본 약관은 이동통신사의 본인확인 서비스 이용에 관한 사항을 규정합니다.

제2조 (서비스 내용)
1. SMS 인증번호 발송
2. 휴대폰 본인확인
3. 본인확인 결과 제공

제3조 (이용자의 의무)
1. 정확한 정보 제공
2. 타인 명의 도용 금지
3. 부정 이용 금지

제4조 (개인정보 보호)
통신사는 관련 법령에 따라 개인정보를 안전하게 관리합니다.`,
    isRequired: true,
    effectiveDate: '2025-01-01',
    isActive: true
  }
];

// 회원별 약관 동의 이력
export const MOCK_TERMS_AGREEMENTS: MemberTermsAgreement[] = [
  // M001 (기업 회원) - 4가지 약관 모두 동의
  {
    agreementId: 'AGR001',
    memberId: 'M001',
    termsId: 'TERMS001',
    termsType: 'personal_info',
    termsVersion: '1.0',
    agreedAt: '2024-12-01T09:05:00Z',
    ipAddress: '123.123.123.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR002',
    memberId: 'M001',
    termsId: 'TERMS002',
    termsType: 'certification_service',
    termsVersion: '1.0',
    agreedAt: '2024-12-01T09:05:01Z',
    ipAddress: '123.123.123.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR003',
    memberId: 'M001',
    termsId: 'TERMS003',
    termsType: 'unique_id',
    termsVersion: '1.0',
    agreedAt: '2024-12-01T09:05:02Z',
    ipAddress: '123.123.123.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR004',
    memberId: 'M001',
    termsId: 'TERMS004',
    termsType: 'telecom_service',
    termsVersion: '1.0',
    agreedAt: '2024-12-01T09:05:03Z',
    ipAddress: '123.123.123.101',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },

  // M002 (기업 회원) - 4가지 약관 모두 동의
  {
    agreementId: 'AGR005',
    memberId: 'M002',
    termsId: 'TERMS001',
    termsType: 'personal_info',
    termsVersion: '1.0',
    agreedAt: '2024-12-15T10:05:00Z',
    ipAddress: '123.123.123.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR006',
    memberId: 'M002',
    termsId: 'TERMS002',
    termsType: 'certification_service',
    termsVersion: '1.0',
    agreedAt: '2024-12-15T10:05:01Z',
    ipAddress: '123.123.123.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR007',
    memberId: 'M002',
    termsId: 'TERMS003',
    termsType: 'unique_id',
    termsVersion: '1.0',
    agreedAt: '2024-12-15T10:05:02Z',
    ipAddress: '123.123.123.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR008',
    memberId: 'M002',
    termsId: 'TERMS004',
    termsType: 'telecom_service',
    termsVersion: '1.0',
    agreedAt: '2024-12-15T10:05:03Z',
    ipAddress: '123.123.123.102',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },

  // M100 (개인 회원) - 4가지 약관 모두 동의
  {
    agreementId: 'AGR009',
    memberId: 'M100',
    termsId: 'TERMS001',
    termsType: 'personal_info',
    termsVersion: '1.0',
    agreedAt: '2025-01-10T11:05:00Z',
    ipAddress: '123.123.123.201',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    agreementId: 'AGR010',
    memberId: 'M100',
    termsId: 'TERMS002',
    termsType: 'certification_service',
    termsVersion: '1.0',
    agreedAt: '2025-01-10T11:05:01Z',
    ipAddress: '123.123.123.201',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    agreementId: 'AGR011',
    memberId: 'M100',
    termsId: 'TERMS003',
    termsType: 'unique_id',
    termsVersion: '1.0',
    agreedAt: '2025-01-10T11:05:02Z',
    ipAddress: '123.123.123.201',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    agreementId: 'AGR012',
    memberId: 'M100',
    termsId: 'TERMS004',
    termsType: 'telecom_service',
    termsVersion: '1.0',
    agreedAt: '2025-01-10T11:05:03Z',
    ipAddress: '123.123.123.201',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15'
  },

  // M101 (개인 회원) - 4가지 약관 모두 동의
  {
    agreementId: 'AGR013',
    memberId: 'M101',
    termsId: 'TERMS001',
    termsType: 'personal_info',
    termsVersion: '1.0',
    agreedAt: '2025-01-15T14:05:00Z',
    ipAddress: '123.123.123.202',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR014',
    memberId: 'M101',
    termsId: 'TERMS002',
    termsType: 'certification_service',
    termsVersion: '1.0',
    agreedAt: '2025-01-15T14:05:01Z',
    ipAddress: '123.123.123.202',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR015',
    memberId: 'M101',
    termsId: 'TERMS003',
    termsType: 'unique_id',
    termsVersion: '1.0',
    agreedAt: '2025-01-15T14:05:02Z',
    ipAddress: '123.123.123.202',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR016',
    memberId: 'M101',
    termsId: 'TERMS004',
    termsType: 'telecom_service',
    termsVersion: '1.0',
    agreedAt: '2025-01-15T14:05:03Z',
    ipAddress: '123.123.123.202',
    userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G998B) AppleWebKit/537.36'
  },

  // M102 (개인 회원) - 4가지 약관 모두 동의
  {
    agreementId: 'AGR017',
    memberId: 'M102',
    termsId: 'TERMS001',
    termsType: 'personal_info',
    termsVersion: '1.0',
    agreedAt: '2025-01-20T16:05:00Z',
    ipAddress: '123.123.123.203',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR018',
    memberId: 'M102',
    termsId: 'TERMS002',
    termsType: 'certification_service',
    termsVersion: '1.0',
    agreedAt: '2025-01-20T16:05:01Z',
    ipAddress: '123.123.123.203',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR019',
    memberId: 'M102',
    termsId: 'TERMS003',
    termsType: 'unique_id',
    termsVersion: '1.0',
    agreedAt: '2025-01-20T16:05:02Z',
    ipAddress: '123.123.123.203',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    agreementId: 'AGR020',
    memberId: 'M102',
    termsId: 'TERMS004',
    termsType: 'telecom_service',
    termsVersion: '1.0',
    agreedAt: '2025-01-20T16:05:03Z',
    ipAddress: '123.123.123.203',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  }
];

// 유틸리티 함수
export const getTermsById = (termsId: string): Terms | undefined => {
  return MOCK_TERMS.find(terms => terms.termsId === termsId);
};

export const getTermsByType = (type: TermsType): Terms | undefined => {
  return MOCK_TERMS.find(terms => terms.type === type && terms.isActive);
};

export const getActiveTerms = (): Terms[] => {
  return MOCK_TERMS.filter(terms => terms.isActive);
};

export const getRequiredTerms = (): Terms[] => {
  return MOCK_TERMS.filter(terms => terms.isRequired && terms.isActive);
};

export const getMemberTermsAgreements = (memberId: string): MemberTermsAgreement[] => {
  return MOCK_TERMS_AGREEMENTS.filter(agreement => agreement.memberId === memberId);
};

export const hasAgreedToAllTerms = (memberId: string): boolean => {
  const agreements = getMemberTermsAgreements(memberId);
  return REQUIRED_TERMS_TYPES.every(type =>
    agreements.some(agreement => agreement.termsType === type)
  );
};

export const getAgreementByMemberAndType = (
  memberId: string,
  termsType: TermsType
): MemberTermsAgreement | undefined => {
  return MOCK_TERMS_AGREEMENTS.find(
    agreement => agreement.memberId === memberId && agreement.termsType === termsType
  );
};
