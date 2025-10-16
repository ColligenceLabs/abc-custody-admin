/**
 * Onboarding Application Types
 * 회원사 온보딩 신청 타입 정의
 */

import { ApprovalStage } from '@/types/approvalWorkflow';

export interface OnboardingContact {
  name: string;
  email: string;
  phone: string;
}

export interface OnboardingDocument {
  uploaded: boolean;
  verified: boolean;
}

export interface OnboardingDocuments {
  businessRegistration: OnboardingDocument;
  corporateRegistry: OnboardingDocument;
  representativeId: OnboardingDocument;
  amlDocuments: OnboardingDocument;
}

export interface OnboardingWorkflow {
  id: string;
  currentStage: ApprovalStage;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  progress: number;
  assignedTo: string | null;
  dueDate: string;
  isOverdue: boolean;
}

export interface OnboardingApplication {
  id: string;
  companyName: string;
  businessNumber: string;
  submittedAt: string;
  status: 'submitted' | 'document_review' | 'compliance_review' | 'approved' | 'rejected';
  priority: 'high' | 'medium' | 'low';
  contact: OnboardingContact;
  documents: OnboardingDocuments;
  workflow: OnboardingWorkflow;
}
