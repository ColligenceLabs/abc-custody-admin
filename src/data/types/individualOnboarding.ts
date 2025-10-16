/**
 * Individual Member Onboarding Types
 * 개인 회원 온보딩 타입 정의
 */

import { ApprovalStage } from '@/types/approvalWorkflow';

/**
 * 회원 유형
 */
export enum MemberType {
  INDIVIDUAL = "individual",  // 개인 회원
  CORPORATE = "corporate"      // 기업 회원
}

/**
 * 개인 정보
 */
export interface PersonalInfo {
  fullName: string;          // 성명
  birthDate: string;         // 생년월일 (YYYY-MM-DD)
  nationality: string;       // 국적
  idNumber: string;          // 주민등록번호 (암호화)
}

/**
 * 주소 정보
 */
export interface AddressInfo {
  street: string;            // 도로명 주소
  city: string;              // 시/군/구
  state: string;             // 시/도
  postalCode: string;        // 우편번호
  country: string;           // 국가
}

/**
 * 연락처 정보
 */
export interface ContactInfo {
  name: string;              // 담당자명
  email: string;             // 이메일
  phone: string;             // 전화번호
}

/**
 * 문서 업로드 상태
 */
export interface OnboardingDocument {
  uploaded: boolean;
  verified: boolean;
}

/**
 * 개인 회원 문서
 */
export interface IndividualDocuments {
  // 신분증 (필수) - 주민등록증, 운전면허증, 여권
  personalId: OnboardingDocument;

  // 주소 증명서 (필수) - 공과금 고지서, 주민등록등본
  proofOfAddress: OnboardingDocument;

  // 소득 증명서 (선택) - 재직증명서, 소득금액증명원
  incomeProof: OnboardingDocument;

  // 본인 확인 사진 (필수) - 신분증 들고 촬영한 셀카
  selfiePhoto: OnboardingDocument;
}

/**
 * 온보딩 워크플로우
 */
export interface OnboardingWorkflow {
  id: string;
  currentStage: ApprovalStage;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  progress: number;
  assignedTo: string | null;
  dueDate: string;
  isOverdue: boolean;
}

/**
 * 개인 회원 온보딩 신청
 */
export interface IndividualOnboardingApplication {
  id: string;
  memberType: MemberType.INDIVIDUAL;

  // 개인 정보
  personalInfo: PersonalInfo;

  // 연락처 정보
  contact: ContactInfo;

  // 주소 정보
  address: AddressInfo;

  // 개인 회원 전용 문서
  documents: IndividualDocuments;

  // 공통 필드
  submittedAt: string;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  workflow: OnboardingWorkflow;
}

/**
 * 개인 회원 문서 라벨
 */
export const INDIVIDUAL_DOCUMENT_LABELS = {
  personalId: "신분증 (주민등록증/운전면허증/여권)",
  proofOfAddress: "주소 증명서 (공과금 고지서/주민등록등본)",
  incomeProof: "소득 증명서 (재직증명서/소득금액증명원)",
  selfiePhoto: "본인 확인 사진 (신분증 들고 촬영)"
} as const;
