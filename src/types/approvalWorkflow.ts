/**
 * 승인 워크플로우 타입 정의
 * Task 2.2: 회원사 승인 워크플로우용
 */

import { AdminRole } from './admin';

// 승인 단계 정의
export enum ApprovalStage {
  DOCUMENT_VERIFICATION = "document_verification",    // 문서 검증
  COMPLIANCE_CHECK = "compliance_check",             // 컴플라이언스 검토
  RISK_ASSESSMENT = "risk_assessment",               // 리스크 평가
  FINAL_APPROVAL = "final_approval"                  // 최종 승인
}

// 승인 워크플로우 메인 인터페이스
export interface ApprovalWorkflow {
  id: string;
  memberId: string;
  applicationId: string;
  currentStage: ApprovalStage;
  status: ApprovalWorkflowStatus;
  stages: ApprovalStageDetail[];
  finalDecision?: "approved" | "rejected";
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  approvedBy?: string[];
  rejectedBy?: string;
  rejectionReason?: string;
  escalatedAt?: Date;
  escalatedBy?: string;
  notes?: string;
}

export enum ApprovalWorkflowStatus {
  PENDING = "pending",           // 대기 중
  IN_PROGRESS = "in_progress",   // 진행 중
  COMPLETED = "completed",       // 완료 (승인됨)
  REJECTED = "rejected",         // 거부됨
  ESCALATED = "escalated"        // 에스컬레이션됨
}

// 승인 단계 상세 정보
export interface ApprovalStageDetail {
  stage: ApprovalStage;
  status: ApprovalStageStatus;
  assignedTo?: string; // Admin user ID
  requiredRole: AdminRole;
  startedAt?: Date;
  completedAt?: Date;
  decision?: ApprovalDecision;
  comments?: string;
  requiredDocuments: string[];
  verifiedDocuments: string[];
  rejectedDocuments: string[];
  timeoutHours: number;
  isOverdue: boolean;
}

export enum ApprovalStageStatus {
  PENDING = "pending",           // 대기 중
  IN_PROGRESS = "in_progress",   // 진행 중
  COMPLETED = "completed",       // 완료
  REJECTED = "rejected",         // 거부됨
  SKIPPED = "skipped",          // 건너뜀
  OVERDUE = "overdue"           // 기한 초과
}

export enum ApprovalDecision {
  APPROVE = "approve",                    // 승인
  REJECT = "reject",                     // 거부
  REQUEST_MORE_INFO = "request_more_info", // 추가 정보 요청
  ESCALATE = "escalate"                  // 상급자 에스컬레이션
}

// 승인 단계별 요구사항 정의
export interface ApprovalRequirement {
  minimumApprovers: number;
  requiredDocuments: string[];
  timeoutHours: number;
  allowWeekendProcessing: boolean;
  allowNightTimeProcessing: boolean;
  requiredRole: AdminRole[];
  escalationRules?: EscalationRule[];
}

export interface EscalationRule {
  condition: "timeout" | "rejection" | "manual";
  timeoutHours?: number;
  escalateTo: AdminRole[];
  notificationTemplate: string;
}

// 승인 단계별 요구사항 설정
export const APPROVAL_STAGE_REQUIREMENTS: Record<ApprovalStage, ApprovalRequirement> = {
  [ApprovalStage.DOCUMENT_VERIFICATION]: {
    minimumApprovers: 1,
    requiredDocuments: ["businessRegistration", "corporateRegistry", "representativeId"],
    timeoutHours: 24,
    allowWeekendProcessing: false,
    allowNightTimeProcessing: false,
    requiredRole: [AdminRole.OPERATIONS, AdminRole.SUPER_ADMIN],
    escalationRules: [
      {
        condition: "timeout",
        timeoutHours: 24,
        escalateTo: [AdminRole.SUPER_ADMIN],
        notificationTemplate: "document_verification_overdue"
      }
    ]
  },
  [ApprovalStage.COMPLIANCE_CHECK]: {
    minimumApprovers: 1,
    requiredDocuments: ["amlDocuments"],
    timeoutHours: 48,
    allowWeekendProcessing: false,
    allowNightTimeProcessing: false,
    requiredRole: [AdminRole.COMPLIANCE, AdminRole.SUPER_ADMIN],
    escalationRules: [
      {
        condition: "timeout",
        timeoutHours: 48,
        escalateTo: [AdminRole.SUPER_ADMIN],
        notificationTemplate: "compliance_check_overdue"
      }
    ]
  },
  [ApprovalStage.RISK_ASSESSMENT]: {
    minimumApprovers: 1,
    requiredDocuments: ["businessRegistration", "corporateRegistry", "representativeId", "amlDocuments"],
    timeoutHours: 72,
    allowWeekendProcessing: false,
    allowNightTimeProcessing: false,
    requiredRole: [AdminRole.OPERATIONS, AdminRole.COMPLIANCE, AdminRole.SUPER_ADMIN],
    escalationRules: [
      {
        condition: "timeout",
        timeoutHours: 72,
        escalateTo: [AdminRole.SUPER_ADMIN],
        notificationTemplate: "risk_assessment_overdue"
      }
    ]
  },
  [ApprovalStage.FINAL_APPROVAL]: {
    minimumApprovers: 1,
    requiredDocuments: ["businessRegistration", "corporateRegistry", "representativeId", "amlDocuments"],
    timeoutHours: 24,
    allowWeekendProcessing: false,
    allowNightTimeProcessing: false,
    requiredRole: [AdminRole.SUPER_ADMIN],
    escalationRules: []
  }
};

// 승인 액션 인터페이스
export interface ApprovalActionRequest {
  workflowId: string;
  stage: ApprovalStage;
  decision: ApprovalDecision;
  comments?: string;
  documentsVerified?: string[];
  documentsRejected?: string[];
  rejectionReason?: string;
  escalationReason?: string;
  adminUserId: string;
}

export interface ApprovalActionResponse {
  success: boolean;
  workflowId: string;
  updatedStage: ApprovalStage;
  nextStage?: ApprovalStage;
  finalDecision?: "approved" | "rejected";
  message: string;
  requiresNotification: boolean;
  notificationRecipients?: string[];
}

// 승인 히스토리 조회용 인터페이스
export interface ApprovalHistory {
  workflowId: string;
  events: ApprovalHistoryEvent[];
  totalEvents: number;
}

export interface ApprovalHistoryEvent {
  id: string;
  timestamp: Date;
  stage: ApprovalStage;
  action: ApprovalDecision;
  performedBy: string;
  performedByName: string;
  comments?: string;
  documentsAffected?: string[];
  previousStatus: ApprovalStageStatus;
  newStatus: ApprovalStageStatus;
}

// 승인 통계용 인터페이스
export interface ApprovalStatistics {
  totalWorkflows: number;
  pendingWorkflows: number;
  completedWorkflows: number;
  rejectedWorkflows: number;
  averageProcessingTime: number; // hours
  stageStatistics: Record<ApprovalStage, StageStatistics>;
}

export interface StageStatistics {
  totalProcessed: number;
  averageProcessingTime: number;
  approvalRate: number;
  rejectionRate: number;
  escalationRate: number;
  overdueRate: number;
}

// 헬퍼 함수들을 위한 유틸리티 타입
export interface StageDisplayInfo {
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export const APPROVAL_STAGE_INFO: Record<ApprovalStage, StageDisplayInfo> = {
  [ApprovalStage.DOCUMENT_VERIFICATION]: {
    name: "문서 검증",
    description: "필수 문서 업로드 및 검증",
    icon: "FileCheck",
    color: "blue",
    order: 1
  },
  [ApprovalStage.COMPLIANCE_CHECK]: {
    name: "컴플라이언스 검토",
    description: "AML/KYC 규정 준수 검토",
    icon: "Shield",
    color: "purple",
    order: 2
  },
  [ApprovalStage.RISK_ASSESSMENT]: {
    name: "리스크 평가",
    description: "비즈니스 리스크 종합 평가",
    icon: "AlertTriangle",
    color: "orange",
    order: 3
  },
  [ApprovalStage.FINAL_APPROVAL]: {
    name: "최종 승인",
    description: "관리자 최종 승인 결정",
    icon: "CheckCircle",
    color: "green",
    order: 4
  }
};