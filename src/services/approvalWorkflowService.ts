/**
 * 승인 워크플로우 서비스
 * Task 2.2: 회원사 승인 워크플로우 관리
 */

import {
  ApprovalWorkflow,
  ApprovalWorkflowStatus,
  ApprovalStage,
  ApprovalStageDetail,
  ApprovalStageStatus,
  ApprovalDecision,
  ApprovalActionRequest,
  ApprovalActionResponse,
  ApprovalHistory,
  ApprovalHistoryEvent,
  ApprovalStatistics,
  APPROVAL_STAGE_REQUIREMENTS,
  APPROVAL_STAGE_INFO
} from '@/types/approvalWorkflow';
import { AdminRole } from '@/types/admin';
// localStorage 헬퍼 함수들
const getFromStorage = <T>(key: string): T[] => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setToStorage = <T>(key: string, data: T[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage:`, error);
  }
};

class ApprovalWorkflowService {
  // 승인 워크플로우 생성
  async createWorkflow(memberId: string, applicationId: string): Promise<ApprovalWorkflow> {
    const workflow: ApprovalWorkflow = {
      id: this.generateId(),
      memberId,
      applicationId,
      currentStage: ApprovalStage.DOCUMENT_VERIFICATION,
      status: ApprovalWorkflowStatus.PENDING,
      stages: this.initializeStages(),
      createdAt: new Date(),
      notes: ""
    };

    // 첫 번째 단계 시작
    workflow.stages[0].status = ApprovalStageStatus.IN_PROGRESS;
    workflow.stages[0].startedAt = new Date();
    workflow.status = ApprovalWorkflowStatus.IN_PROGRESS;
    workflow.startedAt = new Date();

    await this.saveWorkflow(workflow);

    // 히스토리 기록
    await this.addHistoryEvent(workflow.id, {
      id: this.generateId(),
      timestamp: new Date(),
      stage: ApprovalStage.DOCUMENT_VERIFICATION,
      action: ApprovalDecision.APPROVE,
      performedBy: "system",
      performedByName: "시스템",
      comments: "워크플로우 자동 생성 및 첫 번째 단계 시작",
      previousStatus: ApprovalStageStatus.PENDING,
      newStatus: ApprovalStageStatus.IN_PROGRESS
    });

    return workflow;
  }

  // 승인 액션 처리
  async processApprovalAction(request: ApprovalActionRequest): Promise<ApprovalActionResponse> {
    const workflow = await this.getWorkflow(request.workflowId);
    if (!workflow) {
      throw new Error('승인 워크플로우를 찾을 수 없습니다.');
    }

    const currentStage = workflow.stages.find(s => s.stage === request.stage);
    if (!currentStage) {
      throw new Error('해당 승인 단계를 찾을 수 없습니다.');
    }

    // 권한 검증
    const requirements = APPROVAL_STAGE_REQUIREMENTS[request.stage];
    const adminRole = await this.getAdminRole(request.adminUserId);
    if (!requirements.requiredRole.includes(adminRole)) {
      throw new Error('해당 단계의 승인 권한이 없습니다.');
    }

    let response: ApprovalActionResponse;

    switch (request.decision) {
      case ApprovalDecision.APPROVE:
        response = await this.processApproval(workflow, request);
        break;
      case ApprovalDecision.REJECT:
        response = await this.processRejection(workflow, request);
        break;
      case ApprovalDecision.REQUEST_MORE_INFO:
        response = await this.requestMoreInfo(workflow, request);
        break;
      case ApprovalDecision.ESCALATE:
        response = await this.escalateWorkflow(workflow, request);
        break;
      default:
        throw new Error('유효하지 않은 승인 결정입니다.');
    }

    // 히스토리 기록
    await this.addHistoryEvent(workflow.id, {
      id: this.generateId(),
      timestamp: new Date(),
      stage: request.stage,
      action: request.decision,
      performedBy: request.adminUserId,
      performedByName: await this.getAdminName(request.adminUserId),
      comments: request.comments,
      documentsAffected: [...(request.documentsVerified || []), ...(request.documentsRejected || [])],
      previousStatus: currentStage.status,
      newStatus: workflow.stages.find(s => s.stage === request.stage)?.status || currentStage.status
    });

    return response;
  }

  // 승인 처리
  private async processApproval(workflow: ApprovalWorkflow, request: ApprovalActionRequest): Promise<ApprovalActionResponse> {
    const stageIndex = workflow.stages.findIndex(s => s.stage === request.stage);
    const currentStage = workflow.stages[stageIndex];

    // 현재 단계 완료
    currentStage.status = ApprovalStageStatus.COMPLETED;
    currentStage.completedAt = new Date();
    currentStage.decision = ApprovalDecision.APPROVE;
    currentStage.comments = request.comments;

    // 검증된 문서 업데이트
    if (request.documentsVerified) {
      currentStage.verifiedDocuments = [...currentStage.verifiedDocuments, ...request.documentsVerified];
    }

    // 워크플로우에 승인자 추가
    if (!workflow.approvedBy) workflow.approvedBy = [];
    workflow.approvedBy.push(request.adminUserId);

    let nextStage: ApprovalStage | undefined;
    let finalDecision: "approved" | "rejected" | undefined;

    // 다음 단계 확인
    if (stageIndex < workflow.stages.length - 1) {
      // 다음 단계로 진행
      nextStage = workflow.stages[stageIndex + 1].stage;
      workflow.currentStage = nextStage;
      workflow.stages[stageIndex + 1].status = ApprovalStageStatus.IN_PROGRESS;
      workflow.stages[stageIndex + 1].startedAt = new Date();
    } else {
      // 모든 단계 완료 - 최종 승인
      workflow.status = ApprovalWorkflowStatus.COMPLETED;
      workflow.finalDecision = "approved";
      workflow.completedAt = new Date();
      finalDecision = "approved";

      // 자동 계정 생성 트리거
      await this.triggerAccountCreation(workflow.memberId);
    }

    await this.saveWorkflow(workflow);

    return {
      success: true,
      workflowId: workflow.id,
      updatedStage: request.stage,
      nextStage,
      finalDecision,
      message: finalDecision === "approved" ? "최종 승인 완료되었습니다." : "단계 승인 완료되었습니다.",
      requiresNotification: true,
      notificationRecipients: await this.getNotificationRecipients(workflow, nextStage)
    };
  }

  // 거부 처리
  private async processRejection(workflow: ApprovalWorkflow, request: ApprovalActionRequest): Promise<ApprovalActionResponse> {
    const currentStage = workflow.stages.find(s => s.stage === request.stage);
    if (!currentStage) throw new Error('현재 단계를 찾을 수 없습니다.');

    // 현재 단계 거부로 설정
    currentStage.status = ApprovalStageStatus.REJECTED;
    currentStage.completedAt = new Date();
    currentStage.decision = ApprovalDecision.REJECT;
    currentStage.comments = request.comments;

    // 거부된 문서 업데이트
    if (request.documentsRejected) {
      currentStage.rejectedDocuments = [...currentStage.rejectedDocuments, ...request.documentsRejected];
    }

    // 워크플로우 전체 거부
    workflow.status = ApprovalWorkflowStatus.REJECTED;
    workflow.finalDecision = "rejected";
    workflow.rejectedBy = request.adminUserId;
    workflow.rejectionReason = request.rejectionReason || request.comments || "승인 거부됨";
    workflow.completedAt = new Date();

    await this.saveWorkflow(workflow);

    return {
      success: true,
      workflowId: workflow.id,
      updatedStage: request.stage,
      finalDecision: "rejected",
      message: "신청이 거부되었습니다.",
      requiresNotification: true,
      notificationRecipients: await this.getMemberNotificationRecipients(workflow.memberId)
    };
  }

  // 추가 정보 요청 처리
  private async requestMoreInfo(workflow: ApprovalWorkflow, request: ApprovalActionRequest): Promise<ApprovalActionResponse> {
    const currentStage = workflow.stages.find(s => s.stage === request.stage);
    if (!currentStage) throw new Error('현재 단계를 찾을 수 없습니다.');

    currentStage.comments = request.comments;
    currentStage.decision = ApprovalDecision.REQUEST_MORE_INFO;

    await this.saveWorkflow(workflow);

    return {
      success: true,
      workflowId: workflow.id,
      updatedStage: request.stage,
      message: "추가 정보가 요청되었습니다.",
      requiresNotification: true,
      notificationRecipients: await this.getMemberNotificationRecipients(workflow.memberId)
    };
  }

  // 에스컬레이션 처리
  private async escalateWorkflow(workflow: ApprovalWorkflow, request: ApprovalActionRequest): Promise<ApprovalActionResponse> {
    workflow.status = ApprovalWorkflowStatus.ESCALATED;
    workflow.escalatedAt = new Date();
    workflow.escalatedBy = request.adminUserId;

    await this.saveWorkflow(workflow);

    return {
      success: true,
      workflowId: workflow.id,
      updatedStage: request.stage,
      message: "상급자에게 에스컬레이션되었습니다.",
      requiresNotification: true,
      notificationRecipients: await this.getSuperAdminRecipients()
    };
  }

  // 워크플로우 조회
  async getWorkflow(workflowId: string): Promise<ApprovalWorkflow | null> {
    const workflows = getFromStorage<ApprovalWorkflow>('approval_workflows') || [];
    return workflows.find(w => w.id === workflowId) || null;
  }

  // 회원사별 워크플로우 조회
  async getWorkflowByMemberId(memberId: string): Promise<ApprovalWorkflow | null> {
    const workflows = getFromStorage<ApprovalWorkflow>('approval_workflows') || [];
    return workflows.find(w => w.memberId === memberId) || null;
  }

  // 워크플로우 목록 조회
  async getWorkflows(filter?: {
    status?: ApprovalWorkflowStatus;
    stage?: ApprovalStage;
    assignedTo?: string;
  }): Promise<ApprovalWorkflow[]> {
    let workflows = getFromStorage<ApprovalWorkflow>('approval_workflows') || [];

    if (filter?.status) {
      workflows = workflows.filter(w => w.status === filter.status);
    }

    if (filter?.stage) {
      workflows = workflows.filter(w => w.currentStage === filter.stage);
    }

    if (filter?.assignedTo) {
      workflows = workflows.filter(w =>
        w.stages.some(s => s.assignedTo === filter.assignedTo && s.status === ApprovalStageStatus.IN_PROGRESS)
      );
    }

    return workflows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // 승인 히스토리 조회
  async getApprovalHistory(workflowId: string): Promise<ApprovalHistory> {
    const events = getFromStorage<ApprovalHistoryEvent>(`approval_history_${workflowId}`) || [];

    return {
      workflowId,
      events: events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      totalEvents: events.length
    };
  }

  // 승인 통계 조회
  async getApprovalStatistics(): Promise<ApprovalStatistics> {
    const workflows = await this.getWorkflows();

    const totalWorkflows = workflows.length;
    const pendingWorkflows = workflows.filter(w => w.status === ApprovalWorkflowStatus.PENDING || w.status === ApprovalWorkflowStatus.IN_PROGRESS).length;
    const completedWorkflows = workflows.filter(w => w.status === ApprovalWorkflowStatus.COMPLETED).length;
    const rejectedWorkflows = workflows.filter(w => w.status === ApprovalWorkflowStatus.REJECTED).length;

    // 평균 처리 시간 계산 (완료된 워크플로우 기준)
    const completedWithTimes = workflows.filter(w => w.completedAt && w.startedAt);
    const averageProcessingTime = completedWithTimes.length > 0
      ? completedWithTimes.reduce((sum, w) => {
          const processingTime = (new Date(w.completedAt!).getTime() - new Date(w.startedAt!).getTime()) / (1000 * 60 * 60);
          return sum + processingTime;
        }, 0) / completedWithTimes.length
      : 0;

    // 단계별 통계 계산
    const stageStatistics = {} as Record<ApprovalStage, any>;
    Object.values(ApprovalStage).forEach(stage => {
      const stageData = workflows.flatMap(w => w.stages.filter(s => s.stage === stage));
      const completed = stageData.filter(s => s.status === ApprovalStageStatus.COMPLETED);
      const rejected = stageData.filter(s => s.status === ApprovalStageStatus.REJECTED);
      const escalated = workflows.filter(w => w.status === ApprovalWorkflowStatus.ESCALATED && w.currentStage === stage);
      const overdue = stageData.filter(s => s.isOverdue);

      stageStatistics[stage] = {
        totalProcessed: stageData.length,
        averageProcessingTime: completed.length > 0
          ? completed.reduce((sum, s) => {
              if (s.completedAt && s.startedAt) {
                return sum + (new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / (1000 * 60 * 60);
              }
              return sum;
            }, 0) / completed.length
          : 0,
        approvalRate: stageData.length > 0 ? (completed.length / stageData.length) * 100 : 0,
        rejectionRate: stageData.length > 0 ? (rejected.length / stageData.length) * 100 : 0,
        escalationRate: stageData.length > 0 ? (escalated.length / stageData.length) * 100 : 0,
        overdueRate: stageData.length > 0 ? (overdue.length / stageData.length) * 100 : 0
      };
    });

    return {
      totalWorkflows,
      pendingWorkflows,
      completedWorkflows,
      rejectedWorkflows,
      averageProcessingTime,
      stageStatistics
    };
  }

  // 초기 단계 설정
  private initializeStages(): ApprovalStageDetail[] {
    return Object.values(ApprovalStage).map(stage => {
      const requirements = APPROVAL_STAGE_REQUIREMENTS[stage];
      return {
        stage,
        status: ApprovalStageStatus.PENDING,
        requiredRole: requirements.requiredRole[0], // 첫 번째 권한을 기본으로 설정
        requiredDocuments: requirements.requiredDocuments,
        verifiedDocuments: [],
        rejectedDocuments: [],
        timeoutHours: requirements.timeoutHours,
        isOverdue: false
      };
    });
  }

  // 자동 계정 생성 트리거
  private async triggerAccountCreation(memberId: string): Promise<void> {
    // 자동 계정 생성 서비스 호출 (다음 태스크에서 구현)
    console.log(`자동 계정 생성 트리거됨 - 회원사 ID: ${memberId}`);

    // Mock: 회원사 상태를 ACTIVE로 변경
    const members = getFromStorage<any>('members') || [];
    const memberIndex = members.findIndex((m: any) => m.id === memberId);
    if (memberIndex !== -1) {
      (members[memberIndex] as any).status = 'ACTIVE';
      (members[memberIndex] as any).onboardingStatus = 'approved';
      (members[memberIndex] as any).approvedAt = new Date().toISOString();
      setToStorage('members', members);
    }
  }

  // 워크플로우 저장
  private async saveWorkflow(workflow: ApprovalWorkflow): Promise<void> {
    const workflows = getFromStorage<ApprovalWorkflow>('approval_workflows') || [];
    const index = workflows.findIndex(w => w.id === workflow.id);

    if (index !== -1) {
      workflows[index] = workflow;
    } else {
      workflows.push(workflow);
    }

    setToStorage('approval_workflows', workflows);
  }

  // 히스토리 이벤트 추가
  private async addHistoryEvent(workflowId: string, event: ApprovalHistoryEvent): Promise<void> {
    const key = `approval_history_${workflowId}`;
    const events = getFromStorage<ApprovalHistoryEvent>(key) || [];
    events.push(event);
    setToStorage(key, events);
  }

  // 알림 수신자 조회
  private async getNotificationRecipients(workflow: ApprovalWorkflow, nextStage?: ApprovalStage): Promise<string[]> {
    if (!nextStage) {
      // 최종 승인 완료 시 회원사에게 알림
      return await this.getMemberNotificationRecipients(workflow.memberId);
    }

    // 다음 단계 담당자에게 알림
    const requirements = APPROVAL_STAGE_REQUIREMENTS[nextStage];
    const admins = getFromStorage('admins') || [];
    return admins
      .filter((admin: any) => requirements.requiredRole.includes(admin.role))
      .map((admin: any) => admin.email);
  }

  // 회원사 알림 수신자 조회
  private async getMemberNotificationRecipients(memberId: string): Promise<string[]> {
    const members = getFromStorage<any>('members') || [];
    const member = members.find((m: any) => m.id === memberId);
    return member ? [(member as any).contacts?.[0]?.email].filter(Boolean) : [];
  }

  // 최고관리자 알림 수신자 조회
  private async getSuperAdminRecipients(): Promise<string[]> {
    const admins = getFromStorage('admins') || [];
    return admins
      .filter((admin: any) => admin.role === AdminRole.SUPER_ADMIN)
      .map((admin: any) => admin.email);
  }

  // 관리자 권한 조회
  private async getAdminRole(adminUserId: string): Promise<AdminRole> {
    const admins = getFromStorage<any>('admins') || [];
    const admin = admins.find((a: any) => a.id === adminUserId);
    return (admin as any)?.role || AdminRole.VIEWER;
  }

  // 관리자 이름 조회
  private async getAdminName(adminUserId: string): Promise<string> {
    const admins = getFromStorage<any>('admins') || [];
    const admin = admins.find((a: any) => a.id === adminUserId);
    return (admin as any)?.name || "알 수 없음";
  }

  // ID 생성 헬퍼
  private generateId(): string {
    return 'WF-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const approvalWorkflowService = new ApprovalWorkflowService();
export default approvalWorkflowService;