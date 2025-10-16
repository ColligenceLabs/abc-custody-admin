/**
 * Unified Onboarding Types
 * 통합 온보딩 타입 정의 (개인 + 기업)
 */

import { IndividualOnboardingApplication } from './individualOnboarding';
import { CorporateOnboardingApplication } from './corporateOnboarding';
import { MemberType } from './individualOnboarding';

/**
 * 통합 온보딩 신청 타입 (Discriminated Union)
 */
export type OnboardingApplication =
  | IndividualOnboardingApplication
  | CorporateOnboardingApplication;

/**
 * Type Guard: 개인 회원 신청인지 확인
 */
export function isIndividualApplication(
  app: OnboardingApplication
): app is IndividualOnboardingApplication {
  return app.memberType === MemberType.INDIVIDUAL;
}

/**
 * Type Guard: 기업 회원 신청인지 확인
 */
export function isCorporateApplication(
  app: OnboardingApplication
): app is CorporateOnboardingApplication {
  return app.memberType === MemberType.CORPORATE;
}

/**
 * 회원 타입별 디스플레이 이름
 */
export const MEMBER_TYPE_DISPLAY_NAMES = {
  [MemberType.INDIVIDUAL]: "개인 회원",
  [MemberType.CORPORATE]: "기업 회원"
} as const;

/**
 * 회원 타입별 아이콘 (Lucide React)
 */
export const MEMBER_TYPE_ICONS = {
  [MemberType.INDIVIDUAL]: "User",
  [MemberType.CORPORATE]: "Building"
} as const;

/**
 * 신청자 이름 추출 헬퍼 함수
 */
export function getApplicantName(app: OnboardingApplication): string {
  if (isIndividualApplication(app)) {
    return app.personalInfo.fullName;
  } else {
    return app.companyInfo.companyName;
  }
}

/**
 * 신청자 식별번호 추출 헬퍼 함수 (마스킹 처리)
 */
export function getApplicantId(app: OnboardingApplication): string {
  if (isIndividualApplication(app)) {
    // 주민번호 마스킹: 123456-*******
    const idNumber = app.personalInfo.idNumber;
    return idNumber.replace(/(\d{6})-(\d{7})/, '$1-*******');
  } else {
    // 사업자번호: 123-45-67890
    return app.companyInfo.businessNumber;
  }
}

/**
 * 연락처 정보 추출 헬퍼 함수
 */
export function getContactInfo(app: OnboardingApplication) {
  return app.contact;
}

/**
 * 문서 진행률 계산 헬퍼 함수
 */
export function getDocumentProgress(app: OnboardingApplication): {
  verified: number;
  total: number;
  percentage: number;
} {
  const docs = app.documents;
  const docEntries = Object.values(docs);

  const total = docEntries.length;
  const verified = docEntries.filter(doc => doc.verified).length;
  const percentage = total > 0 ? (verified / total) * 100 : 0;

  return { verified, total, percentage };
}

/**
 * Validation: 개인 회원 문서 검증
 */
export function validateIndividualDocuments(app: IndividualOnboardingApplication): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const docs = app.documents;

  if (!docs.personalId.uploaded) {
    errors.push("신분증을 업로드해주세요");
  }
  if (!docs.proofOfAddress.uploaded) {
    errors.push("주소 증명서를 업로드해주세요");
  }
  if (!docs.selfiePhoto.uploaded) {
    errors.push("본인 확인 사진을 업로드해주세요");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validation: 기업 회원 문서 검증
 */
export function validateCorporateDocuments(app: CorporateOnboardingApplication): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const docs = app.documents;

  if (!docs.businessRegistration.uploaded) {
    errors.push("사업자등록증을 업로드해주세요");
  }
  if (!docs.corporateRegistry.uploaded) {
    errors.push("법인등기부등본을 업로드해주세요");
  }
  if (!docs.representativeId.uploaded) {
    errors.push("대표자 신분증을 업로드해주세요");
  }
  if (!docs.amlDocuments.uploaded) {
    errors.push("AML 관련 서류를 업로드해주세요");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 통합 문서 검증 함수
 */
export function validateDocuments(app: OnboardingApplication): {
  isValid: boolean;
  errors: string[];
} {
  if (isIndividualApplication(app)) {
    return validateIndividualDocuments(app);
  } else {
    return validateCorporateDocuments(app);
  }
}
