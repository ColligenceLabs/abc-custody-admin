/**
 * Onboarding API - Mock Implementation
 * 온보딩 승인/반려/보류 처리 API 및 신규 신청 생성
 */

import type {
  IndividualOnboardingApplication,
  PersonalInfo,
  ContactInfo,
  AddressInfo,
  IndividualDocuments,
} from '../types/individualOnboarding';
import { MemberType } from '../types/individualOnboarding';
import type {
  CorporateOnboardingApplication,
  CompanyInfo,
  RepresentativeInfo,
  CompanyAddress,
  CorporateDocuments,
} from '../types/corporateOnboarding';
import { ApprovalStage } from '@/types/approvalWorkflow';

/**
 * 승인 결과
 */
export interface ApprovalResult {
  success: boolean;
  message: string;
  applicationId: string;
  newStatus: string;
}

/**
 * 반려 사유
 */
export const REJECTION_REASONS = {
  incomplete_documents: "서류 미비",
  invalid_documents: "서류 위조 의심",
  failed_aml: "AML 검증 실패",
  ineligible: "가입 자격 미달",
  other: "기타 사유"
} as const;

export type RejectionReasonKey = keyof typeof REJECTION_REASONS;

/**
 * 개인 회원 신청 승인
 */
export async function approveIndividualApplication(
  applicationId: string,
  notes: string
): Promise<ApprovalResult> {
  // Mock implementation with delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`✅ Approved individual application ${applicationId}`);
  console.log(`📝 Review notes: ${notes}`);

  return {
    success: true,
    message: "개인 회원 신청이 승인되었습니다.",
    applicationId,
    newStatus: "approved"
  };
}

/**
 * 개인 회원 신청 반려
 */
export async function rejectIndividualApplication(
  applicationId: string,
  reason: RejectionReasonKey,
  notes: string
): Promise<ApprovalResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`❌ Rejected individual application ${applicationId}`);
  console.log(`📋 Reason: ${REJECTION_REASONS[reason]}`);
  console.log(`📝 Review notes: ${notes}`);

  return {
    success: true,
    message: "개인 회원 신청이 반려되었습니다.",
    applicationId,
    newStatus: "rejected"
  };
}

/**
 * 개인 회원 신청 보류
 */
export async function holdIndividualApplication(
  applicationId: string,
  notes: string
): Promise<ApprovalResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`⏸️ Put on hold individual application ${applicationId}`);
  console.log(`📝 Review notes: ${notes}`);

  return {
    success: true,
    message: "개인 회원 신청이 보류되었습니다.",
    applicationId,
    newStatus: "on_hold"
  };
}

/**
 * 기업 회원 신청 승인
 */
export async function approveCorporateApplication(
  applicationId: string,
  notes: string
): Promise<ApprovalResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`✅ Approved corporate application ${applicationId}`);
  console.log(`📝 Review notes: ${notes}`);

  return {
    success: true,
    message: "기업 회원 신청이 승인되었습니다.",
    applicationId,
    newStatus: "approved"
  };
}

/**
 * 기업 회원 신청 반려
 */
export async function rejectCorporateApplication(
  applicationId: string,
  reason: RejectionReasonKey,
  notes: string
): Promise<ApprovalResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`❌ Rejected corporate application ${applicationId}`);
  console.log(`📋 Reason: ${REJECTION_REASONS[reason]}`);
  console.log(`📝 Review notes: ${notes}`);

  return {
    success: true,
    message: "기업 회원 신청이 반려되었습니다.",
    applicationId,
    newStatus: "rejected"
  };
}

/**
 * 기업 회원 신청 보류
 */
export async function holdCorporateApplication(
  applicationId: string,
  notes: string
): Promise<ApprovalResult> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  console.log(`⏸️ Put on hold corporate application ${applicationId}`);
  console.log(`📝 Review notes: ${notes}`);

  return {
    success: true,
    message: "기업 회원 신청이 보류되었습니다.",
    applicationId,
    newStatus: "on_hold"
  };
}

/**
 * 문서 검증 완료 처리
 */
export async function verifyDocument(
  applicationId: string,
  documentType: string
): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`✅ Verified document: ${documentType} for application ${applicationId}`);

  return {
    success: true,
    message: `${documentType} 검증이 완료되었습니다.`
  };
}

/**
 * 문서 재요청
 */
export async function requestDocumentResubmission(
  applicationId: string,
  documentType: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log(`🔄 Requested resubmission: ${documentType} for application ${applicationId}`);
  console.log(`📋 Reason: ${reason}`);

  return {
    success: true,
    message: `${documentType} 재제출이 요청되었습니다.`
  };
}

// ========================================
// 신규 신청 생성 API
// ========================================

// Mock data storage (in-memory)
let individualApplications: IndividualOnboardingApplication[] = [];
let corporateApplications: CorporateOnboardingApplication[] = [];

/**
 * Generate unique ID for application
 */
function generateApplicationId(type: 'individual' | 'corporate'): string {
  const prefix = type === 'individual' ? 'IND' : 'CORP';
  const timestamp = Date.now();
  return `${prefix}-${timestamp}`;
}

/**
 * Calculate due date (7 days from now)
 */
function calculateDueDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
}

/**
 * Create new individual onboarding application
 */
export async function createIndividualApplication(data: {
  personalInfo: PersonalInfo;
  contact: ContactInfo;
  address: AddressInfo;
  documents: IndividualDocuments;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}): Promise<IndividualOnboardingApplication> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const now = new Date().toISOString();
  const application: IndividualOnboardingApplication = {
    id: generateApplicationId('individual'),
    memberType: MemberType.INDIVIDUAL,
    personalInfo: data.personalInfo,
    contact: data.contact,
    address: data.address,
    documents: data.documents,
    submittedAt: now,
    status: data.status,
    priority: data.priority,
    workflow: {
      id: `WF-${Date.now()}`,
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: 'pending',
      progress: 0,
      assignedTo: null,
      dueDate: calculateDueDate(),
      isOverdue: false,
    },
  };

  individualApplications.push(application);
  console.log(`✅ Created individual application ${application.id}`);
  return application;
}

/**
 * Create new corporate onboarding application
 */
export async function createCorporateApplication(data: {
  companyInfo: CompanyInfo;
  representative: RepresentativeInfo;
  contact: ContactInfo;
  companyAddress: CompanyAddress;
  documents: CorporateDocuments;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
}): Promise<CorporateOnboardingApplication> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const now = new Date().toISOString();
  const application: CorporateOnboardingApplication = {
    id: generateApplicationId('corporate'),
    memberType: MemberType.CORPORATE,
    companyInfo: data.companyInfo,
    representative: data.representative,
    contact: data.contact,
    companyAddress: data.companyAddress,
    documents: data.documents,
    submittedAt: now,
    status: data.status,
    priority: data.priority,
    workflow: {
      id: `WF-${Date.now()}`,
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: 'pending',
      progress: 0,
      assignedTo: null,
      dueDate: calculateDueDate(),
      isOverdue: false,
    },
  };

  corporateApplications.push(application);
  console.log(`✅ Created corporate application ${application.id}`);
  return application;
}

/**
 * Get all individual applications (from in-memory storage)
 */
export function getCreatedIndividualApplications(): IndividualOnboardingApplication[] {
  return individualApplications;
}

/**
 * Get all corporate applications (from in-memory storage)
 */
export function getCreatedCorporateApplications(): CorporateOnboardingApplication[] {
  return corporateApplications;
}

/**
 * Clear all created applications (for testing)
 */
export function clearCreatedApplications(): void {
  individualApplications = [];
  corporateApplications = [];
}
