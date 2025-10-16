/**
 * Mock Data: Corporate Member Onboarding Applications
 * 기업 회원 온보딩 신청 Mock 데이터
 */

import { CorporateOnboardingApplication } from '@/data/types/corporateOnboarding';
import { MemberType } from '@/data/types/individualOnboarding';
import { ApprovalStage } from '@/types/approvalWorkflow';

export const corporateApplications: CorporateOnboardingApplication[] = [
  {
    id: "CORP-001",
    memberType: MemberType.CORPORATE,
    companyInfo: {
      companyName: "테크놀로지 코퍼레이션",
      businessNumber: "123-45-67890",
      corporateNumber: "110111-1234567",
      industry: "소프트웨어 개발",
      establishedDate: "2018-03-15"
    },
    representative: {
      name: "김대표",
      position: "대표이사",
      email: "ceo@techcorp.com",
      phone: "02-1234-5678"
    },
    contact: {
      name: "김철수",
      email: "kim@techcorp.com",
      phone: "02-1234-5679"
    },
    companyAddress: {
      street: "테헤란로 427",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06158",
      country: "대한민국"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: false },
      corporateRegistry: { uploaded: true, verified: true },
      representativeId: { uploaded: true, verified: false },
      amlDocuments: { uploaded: false, verified: false }
    },
    submittedAt: "2024-12-20T09:30:00Z",
    status: "document_review",
    priority: "high",
    workflow: {
      id: "WF-CORP-001",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "in_progress",
      progress: 25,
      assignedTo: "admin-001",
      dueDate: "2024-12-21T09:30:00Z",
      isOverdue: false
    }
  },
  {
    id: "CORP-002",
    memberType: MemberType.CORPORATE,
    companyInfo: {
      companyName: "글로벌 트레이딩",
      businessNumber: "234-56-78901",
      corporateNumber: "110111-2345678",
      industry: "무역업",
      establishedDate: "2015-07-20"
    },
    representative: {
      name: "박대표",
      position: "대표이사",
      email: "ceo@globaltrading.com",
      phone: "02-2345-6789"
    },
    contact: {
      name: "박영희",
      email: "park@globaltrading.com",
      phone: "02-2345-6790"
    },
    companyAddress: {
      street: "삼성로 512",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06192",
      country: "대한민국"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: true },
      corporateRegistry: { uploaded: true, verified: true },
      representativeId: { uploaded: true, verified: true },
      amlDocuments: { uploaded: true, verified: false }
    },
    submittedAt: "2024-12-19T14:15:00Z",
    status: "compliance_review",
    priority: "medium",
    workflow: {
      id: "WF-CORP-002",
      currentStage: ApprovalStage.COMPLIANCE_CHECK,
      status: "in_progress",
      progress: 50,
      assignedTo: "compliance-001",
      dueDate: "2024-12-21T14:15:00Z",
      isOverdue: false
    }
  },
  {
    id: "CORP-003",
    memberType: MemberType.CORPORATE,
    companyInfo: {
      companyName: "스마트 솔루션",
      businessNumber: "345-67-89012",
      corporateNumber: "110111-3456789",
      industry: "IT 컨설팅",
      establishedDate: "2019-11-10"
    },
    representative: {
      name: "이대표",
      position: "대표이사",
      email: "ceo@smartsolution.com",
      phone: "02-3456-7890"
    },
    contact: {
      name: "이민수",
      email: "lee@smartsolution.com",
      phone: "02-3456-7891"
    },
    companyAddress: {
      street: "판교역로 235",
      city: "분당구",
      state: "경기도",
      postalCode: "13494",
      country: "대한민국"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: false },
      corporateRegistry: { uploaded: false, verified: false },
      representativeId: { uploaded: false, verified: false },
      amlDocuments: { uploaded: false, verified: false }
    },
    submittedAt: "2024-12-18T11:45:00Z",
    status: "submitted",
    priority: "low",
    workflow: {
      id: "WF-CORP-003",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "pending",
      progress: 0,
      assignedTo: null,
      dueDate: "2024-12-19T11:45:00Z",
      isOverdue: true
    }
  },
  {
    id: "CORP-004",
    memberType: MemberType.CORPORATE,
    companyInfo: {
      companyName: "핀테크 이노베이션",
      businessNumber: "456-78-90123",
      corporateNumber: "110111-4567890",
      industry: "금융 서비스",
      establishedDate: "2020-05-25"
    },
    representative: {
      name: "정대표",
      position: "대표이사",
      email: "ceo@fintechinno.com",
      phone: "02-4567-8901"
    },
    contact: {
      name: "정수진",
      email: "jung@fintechinno.com",
      phone: "02-4567-8902"
    },
    companyAddress: {
      street: "여의대로 108",
      city: "영등포구",
      state: "서울특별시",
      postalCode: "07320",
      country: "대한민국"
    },
    documents: {
      businessRegistration: { uploaded: true, verified: true },
      corporateRegistry: { uploaded: true, verified: true },
      representativeId: { uploaded: true, verified: true },
      amlDocuments: { uploaded: true, verified: true }
    },
    submittedAt: "2024-12-17T16:20:00Z",
    status: "approved",
    priority: "high",
    workflow: {
      id: "WF-CORP-004",
      currentStage: ApprovalStage.FINAL_APPROVAL,
      status: "completed",
      progress: 100,
      assignedTo: "admin-supervisor-001",
      dueDate: "2024-12-20T16:20:00Z",
      isOverdue: false
    }
  }
];
