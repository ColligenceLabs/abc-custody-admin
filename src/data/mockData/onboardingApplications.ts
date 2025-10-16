/**
 * Mock Data: Onboarding Applications
 * 회원사 온보딩 신청 Mock 데이터
 */

import { OnboardingApplication } from '@/data/types/onboarding';
import { ApprovalStage } from '@/types/approvalWorkflow';

export const onboardingApplications: OnboardingApplication[] = [
  {
    id: "APP-001",
    companyName: "테크놀로지 코퍼레이션",
    businessNumber: "123-45-67890",
    submittedAt: "2024-12-20T09:30:00Z",
    status: "document_review",
    priority: "high",
    contact: {
      name: "김철수",
      email: "kim@techcorp.com",
      phone: "02-1234-5678"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: false },
      corporateRegistry: { uploaded: true, verified: true },
      representativeId: { uploaded: true, verified: false },
      amlDocuments: { uploaded: false, verified: false }
    },
    workflow: {
      id: "WF-001",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "in_progress",
      progress: 25,
      assignedTo: "admin-001",
      dueDate: "2024-12-21T09:30:00Z",
      isOverdue: false
    }
  },
  {
    id: "APP-002",
    companyName: "글로벌 트레이딩",
    businessNumber: "234-56-78901",
    submittedAt: "2024-12-19T14:15:00Z",
    status: "compliance_review",
    priority: "medium",
    contact: {
      name: "박영희",
      email: "park@globaltrading.com",
      phone: "02-2345-6789"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: true },
      corporateRegistry: { uploaded: true, verified: true },
      representativeId: { uploaded: true, verified: true },
      amlDocuments: { uploaded: true, verified: false }
    },
    workflow: {
      id: "WF-002",
      currentStage: ApprovalStage.COMPLIANCE_CHECK,
      status: "in_progress",
      progress: 50,
      assignedTo: "compliance-001",
      dueDate: "2024-12-21T14:15:00Z",
      isOverdue: false
    }
  },
  {
    id: "APP-003",
    companyName: "스마트 솔루션",
    businessNumber: "345-67-89012",
    submittedAt: "2024-12-18T11:45:00Z",
    status: "submitted",
    priority: "low",
    contact: {
      name: "이민수",
      email: "lee@smartsolution.com",
      phone: "02-3456-7890"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: false },
      corporateRegistry: { uploaded: false, verified: false },
      representativeId: { uploaded: false, verified: false },
      amlDocuments: { uploaded: false, verified: false }
    },
    workflow: {
      id: "WF-003",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "pending",
      progress: 0,
      assignedTo: null,
      dueDate: "2024-12-19T11:45:00Z",
      isOverdue: true
    }
  }
];
