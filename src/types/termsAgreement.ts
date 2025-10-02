// 약관 동의 타입 정의

export type TermsType =
  | 'personal_info'         // 개인정보 수집 및 이용 동의
  | 'certification_service' // 인증사 서비스 이용약관 동의
  | 'unique_id'             // 고유식별정보 처리 동의
  | 'telecom_service';      // 통신사 이용약관 동의

export interface Terms {
  termsId: string;
  type: TermsType;
  version: string;
  title: string;
  content: string;
  isRequired: boolean;
  effectiveDate: string;
  isActive: boolean;
}

export interface MemberTermsAgreement {
  agreementId: string;
  memberId: string;
  termsId: string;
  termsType: TermsType;
  termsVersion: string;
  agreedAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// 약관 타입별 한국어 이름
export const TERMS_TYPE_NAMES: Record<TermsType, string> = {
  personal_info: '개인정보 수집 및 이용 동의',
  certification_service: '인증사 서비스 이용약관 동의',
  unique_id: '고유식별정보 처리 동의',
  telecom_service: '통신사 이용약관 동의'
};

// 필수 약관 목록
export const REQUIRED_TERMS_TYPES: TermsType[] = [
  'personal_info',
  'certification_service',
  'unique_id',
  'telecom_service'
];
