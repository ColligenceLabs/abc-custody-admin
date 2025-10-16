/**
 * Corporate Member Onboarding Types
 * 기업 회원 온보딩 타입 정의
 */

import { ApprovalStage } from '@/types/approvalWorkflow';
import { MemberType, OnboardingDocument, OnboardingWorkflow, ContactInfo } from './individualOnboarding';

/**
 * 기업 정보
 */
export interface CompanyInfo {
  companyName: string;       // 회사명
  businessNumber: string;    // 사업자등록번호
  corporateNumber: string;   // 법인등록번호
  industry: string;          // 업종
  establishedDate: string;   // 설립일 (YYYY-MM-DD)
}

/**
 * 대표자 정보
 */
export interface RepresentativeInfo {
  name: string;              // 대표자명
  position: string;          // 직책
  email: string;             // 이메일
  phone: string;             // 전화번호
}

/**
 * 기업 주소 정보
 */
export interface CompanyAddress {
  street: string;            // 도로명 주소
  city: string;              // 시/군/구
  state: string;             // 시/도
  postalCode: string;        // 우편번호
  country: string;           // 국가
}

/**
 * 기업 회원 문서
 */
export interface CorporateDocuments {
  // 사업자등록증 (필수)
  businessRegistration: OnboardingDocument;

  // 법인등기부등본 (필수)
  corporateRegistry: OnboardingDocument;

  // 대표자 신분증 (필수)
  representativeId: OnboardingDocument;

  // AML 관련 서류 (필수)
  amlDocuments: OnboardingDocument;
}

/**
 * 기업 회원 온보딩 신청
 */
export interface CorporateOnboardingApplication {
  id: string;
  memberType: MemberType.CORPORATE;

  // 기업 정보
  companyInfo: CompanyInfo;

  // 대표자 정보
  representative: RepresentativeInfo;

  // 담당자 정보 (대표자와 다를 수 있음)
  contact: ContactInfo;

  // 기업 주소
  companyAddress: CompanyAddress;

  // 기업 회원 전용 문서
  documents: CorporateDocuments;

  // 공통 필드
  submittedAt: string;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  workflow: OnboardingWorkflow;
}

/**
 * 기업 회원 문서 라벨
 */
export const CORPORATE_DOCUMENT_LABELS = {
  businessRegistration: "사업자등록증",
  corporateRegistry: "법인등기부등본",
  representativeId: "대표자 신분증",
  amlDocuments: "AML 관련 서류"
} as const;
