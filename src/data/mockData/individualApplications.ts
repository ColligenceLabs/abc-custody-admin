/**
 * Mock Data: Individual Member Onboarding Applications
 * 개인 회원 온보딩 신청 Mock 데이터
 */

import { IndividualOnboardingApplication, MemberType } from '@/data/types/individualOnboarding';
import { ApprovalStage } from '@/types/approvalWorkflow';

export const individualApplications: IndividualOnboardingApplication[] = [
  {
    id: "IND-001",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "김철수",
      birthDate: "1985-03-15",
      nationality: "대한민국",
      idNumber: "850315-1234567"
    },
    contact: {
      name: "김철수",
      email: "chulsoo.kim@email.com",
      phone: "010-1234-5678"
    },
    address: {
      street: "테헤란로 427",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06158",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: true },
      proofOfAddress: { uploaded: true, verified: false },
      incomeProof: { uploaded: true, verified: false },
      selfiePhoto: { uploaded: true, verified: true }
    },
    submittedAt: "2024-12-20T10:30:00Z",
    status: "document_review",
    priority: "high",
    workflow: {
      id: "WF-IND-001",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "in_progress",
      progress: 25,
      assignedTo: "admin-001",
      dueDate: "2024-12-21T10:30:00Z",
      isOverdue: false
    }
  },
  {
    id: "IND-002",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "이영희",
      birthDate: "1992-07-22",
      nationality: "대한민국",
      idNumber: "920722-2345678"
    },
    contact: {
      name: "이영희",
      email: "younghee.lee@email.com",
      phone: "010-2345-6789"
    },
    address: {
      street: "판교역로 235",
      city: "분당구",
      state: "경기도",
      postalCode: "13494",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: true },
      proofOfAddress: { uploaded: true, verified: true },
      incomeProof: { uploaded: false, verified: false },
      selfiePhoto: { uploaded: true, verified: true }
    },
    submittedAt: "2024-12-19T15:45:00Z",
    status: "compliance_review",
    priority: "medium",
    workflow: {
      id: "WF-IND-002",
      currentStage: ApprovalStage.COMPLIANCE_CHECK,
      status: "in_progress",
      progress: 50,
      assignedTo: "compliance-001",
      dueDate: "2024-12-21T15:45:00Z",
      isOverdue: false
    }
  },
  {
    id: "IND-003",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "박민수",
      birthDate: "1988-11-08",
      nationality: "대한민국",
      idNumber: "881108-1456789"
    },
    contact: {
      name: "박민수",
      email: "minsu.park@email.com",
      phone: "010-3456-7890"
    },
    address: {
      street: "올림픽로 300",
      city: "송파구",
      state: "서울특별시",
      postalCode: "05551",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: false },
      proofOfAddress: { uploaded: false, verified: false },
      incomeProof: { uploaded: false, verified: false },
      selfiePhoto: { uploaded: false, verified: false }
    },
    submittedAt: "2024-12-18T09:20:00Z",
    status: "submitted",
    priority: "low",
    workflow: {
      id: "WF-IND-003",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "pending",
      progress: 0,
      assignedTo: null,
      dueDate: "2024-12-19T09:20:00Z",
      isOverdue: true
    }
  },
  {
    id: "IND-004",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "정수진",
      birthDate: "1995-05-17",
      nationality: "대한민국",
      idNumber: "950517-2567890"
    },
    contact: {
      name: "정수진",
      email: "sujin.jung@email.com",
      phone: "010-4567-8901"
    },
    address: {
      street: "압구정로 10길 12",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06009",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: true },
      proofOfAddress: { uploaded: true, verified: true },
      incomeProof: { uploaded: true, verified: true },
      selfiePhoto: { uploaded: true, verified: true }
    },
    submittedAt: "2024-12-17T14:10:00Z",
    status: "approved",
    priority: "high",
    workflow: {
      id: "WF-IND-004",
      currentStage: ApprovalStage.FINAL_APPROVAL,
      status: "completed",
      progress: 100,
      assignedTo: "admin-supervisor-001",
      dueDate: "2024-12-20T14:10:00Z",
      isOverdue: false
    }
  },
  {
    id: "IND-005",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "최동욱",
      birthDate: "1990-02-28",
      nationality: "대한민국",
      idNumber: "900228-1678901"
    },
    contact: {
      name: "최동욱",
      email: "dongwook.choi@email.com",
      phone: "010-5678-9012"
    },
    address: {
      street: "삼성로 512",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06192",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: true },
      proofOfAddress: { uploaded: true, verified: false },
      incomeProof: { uploaded: true, verified: true },
      selfiePhoto: { uploaded: true, verified: false }
    },
    submittedAt: "2024-12-20T11:50:00Z",
    status: "document_review",
    priority: "medium",
    workflow: {
      id: "WF-IND-005",
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: "in_progress",
      progress: 25,
      assignedTo: "admin-002",
      dueDate: "2024-12-22T11:50:00Z",
      isOverdue: false
    }
  },
  {
    id: "IND-006",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "강민지",
      birthDate: "1993-09-12",
      nationality: "대한민국",
      idNumber: "930912-2789012"
    },
    contact: {
      name: "강민지",
      email: "minji.kang@email.com",
      phone: "010-6789-0123"
    },
    address: {
      street: "논현로 842",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06104",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: false },
      proofOfAddress: { uploaded: true, verified: false },
      incomeProof: { uploaded: false, verified: false },
      selfiePhoto: { uploaded: true, verified: false }
    },
    submittedAt: "2024-12-16T13:30:00Z",
    status: "rejected",
    priority: "low",
    workflow: {
      id: "WF-IND-006",
      currentStage: ApprovalStage.COMPLIANCE_CHECK,
      status: "rejected",
      progress: 50,
      assignedTo: "compliance-002",
      dueDate: "2024-12-18T13:30:00Z",
      isOverdue: true
    }
  },
  {
    id: "IND-007",
    memberType: MemberType.INDIVIDUAL,
    personalInfo: {
      fullName: "윤재현",
      birthDate: "1987-12-03",
      nationality: "대한민국",
      idNumber: "871203-1890123"
    },
    contact: {
      name: "윤재현",
      email: "jaehyun.yoon@email.com",
      phone: "010-7890-1234"
    },
    address: {
      street: "역삼로 456",
      city: "강남구",
      state: "서울특별시",
      postalCode: "06234",
      country: "대한민국"
    },
    documents: {
      personalId: { uploaded: true, verified: true },
      proofOfAddress: { uploaded: true, verified: true },
      incomeProof: { uploaded: true, verified: false },
      selfiePhoto: { uploaded: true, verified: true }
    },
    submittedAt: "2024-12-19T08:15:00Z",
    status: "compliance_review",
    priority: "high",
    workflow: {
      id: "WF-IND-007",
      currentStage: ApprovalStage.RISK_ASSESSMENT,
      status: "in_progress",
      progress: 75,
      assignedTo: "risk-001",
      dueDate: "2024-12-21T08:15:00Z",
      isOverdue: false
    }
  }
];
