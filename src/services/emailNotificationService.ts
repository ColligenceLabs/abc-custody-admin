/**
 * 이메일 알림 서비스
 * Task 2.2: 승인 워크플로우 이메일 알림
 */

import { ApprovalStage, ApprovalDecision } from '@/types/approvalWorkflow';
import { Member, getMemberName } from '@/types/member';
import { AdminUser } from '@/types/admin';
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

// 알림 템플릿 타입
export enum NotificationType {
  // 온보딩 알림 (회원사용)
  APPLICATION_RECEIVED = "application_received",
  DOCUMENT_VERIFICATION_STARTED = "document_verification_started",
  DOCUMENT_VERIFICATION_COMPLETED = "document_verification_completed",
  COMPLIANCE_REVIEW_STARTED = "compliance_review_started",
  RISK_ASSESSMENT_STARTED = "risk_assessment_started",
  ADDITIONAL_INFO_REQUESTED = "additional_info_requested",
  APPLICATION_APPROVED = "application_approved",
  APPLICATION_REJECTED = "application_rejected",
  ACCOUNT_CREATED = "account_created",

  // 관리자 알림
  NEW_APPLICATION_ADMIN = "new_application_admin",
  APPROVAL_REQUEST_ADMIN = "approval_request_admin",
  STAGE_COMPLETED_ADMIN = "stage_completed_admin",
  STAGE_OVERDUE_ADMIN = "stage_overdue_admin",
  ESCALATION_ADMIN = "escalation_admin"
}

// 알림 우선순위
export enum NotificationPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  CRITICAL = "critical"
}

// 이메일 알림 페이로드
export interface EmailNotificationPayload {
  id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  template: NotificationType;
  variables: Record<string, any>;
  priority: NotificationPriority;
  scheduledAt?: Date;
  sentAt?: Date;
  status: EmailStatus;
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export enum EmailStatus {
  PENDING = "pending",
  SENDING = "sending",
  SENT = "sent",
  FAILED = "failed",
  CANCELLED = "cancelled"
}

// 이메일 템플릿
export interface EmailTemplate {
  type: NotificationType;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
  defaultPriority: NotificationPriority;
}

// 이메일 통계
export interface EmailStatistics {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  successRate: number;
  averageDeliveryTime: number;
  templateStats: Record<NotificationType, {
    sent: number;
    failed: number;
    successRate: number;
  }>;
}

class EmailNotificationService {
  private readonly templates: Map<NotificationType, EmailTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  // 승인 단계별 알림 발송
  async sendApprovalStageNotification(
    stage: ApprovalStage,
    member: Member,
    admin: AdminUser,
    decision: ApprovalDecision,
    comments?: string
  ): Promise<string[]> {
    const sentIds: string[] = [];

    try {
      // 회원사 알림
      const memberNotificationId = await this.sendMemberNotification(
        stage,
        member,
        decision,
        admin.name,
        comments
      );
      if (memberNotificationId) sentIds.push(memberNotificationId);

      // 관리자 알림
      if (decision === ApprovalDecision.APPROVE) {
        const adminNotificationId = await this.sendNextStageNotification(
          stage,
          member,
          admin
        );
        if (adminNotificationId) sentIds.push(adminNotificationId);
      }

      // 에스컬레이션 알림
      if (decision === ApprovalDecision.ESCALATE) {
        const escalationNotificationId = await this.sendEscalationNotification(
          stage,
          member,
          admin,
          comments
        );
        if (escalationNotificationId) sentIds.push(escalationNotificationId);
      }

      return sentIds;

    } catch (error) {
      console.error('승인 단계 알림 발송 실패:', error);
      throw error;
    }
  }

  // 회원사 알림 발송
  private async sendMemberNotification(
    stage: ApprovalStage,
    member: Member,
    decision: ApprovalDecision,
    adminName: string,
    comments?: string
  ): Promise<string | null> {
    const template = this.getMemberNotificationTemplate(stage, decision);
    if (!template) return null;

    const variables = {
      companyName: getMemberName(member),
      stageName: this.getStageDisplayName(stage),
      adminName,
      decision: this.getDecisionDisplayName(decision),
      comments: comments || '',
      applicationId: member.id,
      contactName: member.contacts[0]?.name || '담당자님',
      supportEmail: 'support@custody.com',
      supportPhone: '1588-0000'
    };

    const payload: Omit<EmailNotificationPayload, 'id'> = {
      to: [member.contacts[0]?.email].filter(Boolean),
      template,
      variables,
      priority: this.getPriorityForDecision(decision),
      status: EmailStatus.PENDING,
      retryCount: 0,
      maxRetries: 3,
      subject: this.buildSubject(template, variables)
    };

    return await this.queueEmail(payload);
  }

  // 다음 단계 담당자 알림
  private async sendNextStageNotification(
    currentStage: ApprovalStage,
    member: Member,
    completedByAdmin: AdminUser
  ): Promise<string | null> {
    const nextStage = this.getNextStage(currentStage);
    if (!nextStage) return null;

    const nextStageAdmins = await this.getStageApprovers(nextStage);
    if (nextStageAdmins.length === 0) return null;

    const variables = {
      companyName: getMemberName(member),
      stageName: this.getStageDisplayName(nextStage),
      previousStage: this.getStageDisplayName(currentStage),
      completedBy: completedByAdmin.name,
      applicationId: member.id,
      urgency: this.getStageUrgency(nextStage),
      dueDate: this.calculateDueDate(nextStage).toLocaleDateString('ko-KR')
    };

    const payload: Omit<EmailNotificationPayload, 'id'> = {
      to: nextStageAdmins.map(admin => admin.email),
      template: NotificationType.APPROVAL_REQUEST_ADMIN,
      variables,
      priority: NotificationPriority.HIGH,
      status: EmailStatus.PENDING,
      retryCount: 0,
      maxRetries: 3,
      subject: this.buildSubject(NotificationType.APPROVAL_REQUEST_ADMIN, variables)
    };

    return await this.queueEmail(payload);
  }

  // 에스컬레이션 알림
  private async sendEscalationNotification(
    stage: ApprovalStage,
    member: Member,
    escalatedByAdmin: AdminUser,
    reason?: string
  ): Promise<string | null> {
    const superAdmins = await this.getSuperAdmins();
    if (superAdmins.length === 0) return null;

    const variables = {
      companyName: getMemberName(member),
      stageName: this.getStageDisplayName(stage),
      escalatedBy: escalatedByAdmin.name,
      escalationReason: reason || '추가 검토 필요',
      applicationId: member.id,
      escalatedAt: new Date().toLocaleString('ko-KR')
    };

    const payload: Omit<EmailNotificationPayload, 'id'> = {
      to: superAdmins.map(admin => admin.email),
      template: NotificationType.ESCALATION_ADMIN,
      variables,
      priority: NotificationPriority.CRITICAL,
      status: EmailStatus.PENDING,
      retryCount: 0,
      maxRetries: 5,
      subject: this.buildSubject(NotificationType.ESCALATION_ADMIN, variables)
    };

    return await this.queueEmail(payload);
  }

  // 계정 생성 완료 알림
  async sendAccountCreatedNotification(member: Member, accountInfo: any): Promise<string | null> {
    const variables = {
      companyName: getMemberName(member),
      contactName: member.contacts[0]?.name || '담당자님',
      publicKey: accountInfo.publicKey.substring(0, 20) + '...',
      dashboardUrl: 'https://dashboard.custody.com',
      supportEmail: 'support@custody.com',
      createdAt: new Date().toLocaleString('ko-KR')
    };

    const payload: Omit<EmailNotificationPayload, 'id'> = {
      to: [member.contacts[0]?.email].filter(Boolean),
      template: NotificationType.ACCOUNT_CREATED,
      variables,
      priority: NotificationPriority.HIGH,
      status: EmailStatus.PENDING,
      retryCount: 0,
      maxRetries: 3,
      subject: this.buildSubject(NotificationType.ACCOUNT_CREATED, variables)
    };

    return await this.queueEmail(payload);
  }

  // 기한 초과 알림
  async sendOverdueNotification(
    stage: ApprovalStage,
    member: Member,
    assignedAdmins: AdminUser[]
  ): Promise<string | null> {
    // 회원 타입에 따른 대시보드 URL 결정
    const dashboardPath = member.memberType === 'corporate'
      ? `members/onboarding-aml/review/corporate/${member.id}`
      : `members/onboarding-aml/review/${member.id}`;

    const variables = {
      companyName: getMemberName(member),
      stageName: this.getStageDisplayName(stage),
      applicationId: member.id,
      overdueHours: this.calculateOverdueHours(stage),
      escalationThreshold: '24시간',
      dashboardUrl: `https://admin.custody.com/${dashboardPath}`
    };

    const payload: Omit<EmailNotificationPayload, 'id'> = {
      to: assignedAdmins.map(admin => admin.email),
      cc: await this.getSuperAdminEmails(),
      template: NotificationType.STAGE_OVERDUE_ADMIN,
      variables,
      priority: NotificationPriority.CRITICAL,
      status: EmailStatus.PENDING,
      retryCount: 0,
      maxRetries: 3,
      subject: this.buildSubject(NotificationType.STAGE_OVERDUE_ADMIN, variables)
    };

    return await this.queueEmail(payload);
  }

  // 이메일 대기열 추가
  private async queueEmail(payload: Omit<EmailNotificationPayload, 'id'>): Promise<string> {
    const email: EmailNotificationPayload = {
      ...payload,
      id: this.generateEmailId()
    };

    const queue = getFromStorage<EmailNotificationPayload>('email_notification_queue') || [];
    queue.push(email);
    setToStorage('email_notification_queue', queue);

    // 비동기적으로 이메일 발송 처리
    this.processEmailQueue().catch(error => {
      console.error('이메일 큐 처리 중 오류:', error);
    });

    return email.id;
  }

  // 이메일 큐 처리
  private async processEmailQueue(): Promise<void> {
    const queue = getFromStorage<EmailNotificationPayload>('email_notification_queue') || [];
    const pendingEmails = queue.filter(email => email.status === EmailStatus.PENDING);

    for (const email of pendingEmails) {
      try {
        await this.sendEmail(email);
      } catch (error) {
        console.error(`이메일 발송 실패 (ID: ${email.id}):`, error);
        await this.handleEmailFailure(email, error);
      }
    }
  }

  // 실제 이메일 발송 (Mock)
  private async sendEmail(email: EmailNotificationPayload): Promise<void> {
    email.status = EmailStatus.SENDING;
    await this.saveEmailToQueue(email);

    // Mock 이메일 발송 지연
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock 발송 성공
    const success = Math.random() > 0.05; // 95% 성공률

    if (success) {
      email.status = EmailStatus.SENT;
      email.sentAt = new Date();

      console.log(`✅ 이메일 발송 성공 (ID: ${email.id})`);
      console.log(`   수신자: ${email.to.join(', ')}`);
      console.log(`   제목: ${email.subject}`);
      console.log(`   템플릿: ${email.template}`);
    } else {
      throw new Error('이메일 발송 서비스 오류');
    }

    await this.saveEmailToQueue(email);
  }

  // 이메일 발송 실패 처리
  private async handleEmailFailure(email: EmailNotificationPayload, error: any): Promise<void> {
    email.retryCount++;
    email.error = error instanceof Error ? error.message : '알 수 없는 오류';

    if (email.retryCount < email.maxRetries) {
      // 재시도 대기열에 추가 (지수 백오프)
      const retryDelay = Math.pow(2, email.retryCount) * 1000; // 2^n초 후 재시도
      email.scheduledAt = new Date(Date.now() + retryDelay);
      email.status = EmailStatus.PENDING;
    } else {
      email.status = EmailStatus.FAILED;
      console.error(`❌ 이메일 발송 최종 실패 (ID: ${email.id}): ${email.error}`);
    }

    await this.saveEmailToQueue(email);
  }

  // 이메일 통계 조회
  async getEmailStatistics(): Promise<EmailStatistics> {
    const queue = getFromStorage<EmailNotificationPayload>('email_notification_queue') || [];

    const totalSent = queue.filter(e => e.status === EmailStatus.SENT).length;
    const totalFailed = queue.filter(e => e.status === EmailStatus.FAILED).length;
    const totalPending = queue.filter(e => e.status === EmailStatus.PENDING).length;

    const successRate = queue.length > 0 ? (totalSent / (totalSent + totalFailed)) * 100 : 0;

    const sentEmails = queue.filter(e => e.status === EmailStatus.SENT && e.sentAt);
    const averageDeliveryTime = sentEmails.length > 0
      ? sentEmails.reduce((sum, e) => sum + (e.sentAt!.getTime() - new Date(e.scheduledAt || e.sentAt!).getTime()), 0) / sentEmails.length / 1000
      : 0;

    // 템플릿별 통계
    const templateStats = {} as Record<NotificationType, any>;
    Object.values(NotificationType).forEach(type => {
      const typeEmails = queue.filter(e => e.template === type);
      const typeSent = typeEmails.filter(e => e.status === EmailStatus.SENT).length;
      const typeFailed = typeEmails.filter(e => e.status === EmailStatus.FAILED).length;

      templateStats[type] = {
        sent: typeSent,
        failed: typeFailed,
        successRate: typeEmails.length > 0 ? (typeSent / (typeSent + typeFailed)) * 100 : 0
      };
    });

    return {
      totalSent,
      totalFailed,
      totalPending,
      successRate,
      averageDeliveryTime,
      templateStats
    };
  }

  // 템플릿 초기화
  private initializeTemplates(): void {
    // 회원사용 템플릿
    this.templates.set(NotificationType.APPLICATION_RECEIVED, {
      type: NotificationType.APPLICATION_RECEIVED,
      subject: '[커스터디] 온보딩 신청이 접수되었습니다',
      htmlTemplate: this.getApplicationReceivedTemplate(),
      textTemplate: '온보딩 신청이 성공적으로 접수되었습니다.',
      variables: ['companyName', 'contactName', 'applicationId'],
      defaultPriority: NotificationPriority.NORMAL
    });

    this.templates.set(NotificationType.DOCUMENT_VERIFICATION_STARTED, {
      type: NotificationType.DOCUMENT_VERIFICATION_STARTED,
      subject: '[커스터디] 문서 검증이 시작되었습니다',
      htmlTemplate: this.getDocumentVerificationTemplate(),
      textTemplate: '제출하신 문서의 검증이 시작되었습니다.',
      variables: ['companyName', 'contactName', 'stageName'],
      defaultPriority: NotificationPriority.NORMAL
    });

    this.templates.set(NotificationType.APPLICATION_APPROVED, {
      type: NotificationType.APPLICATION_APPROVED,
      subject: '[커스터디] 🎉 온보딩 신청이 승인되었습니다',
      htmlTemplate: this.getApplicationApprovedTemplate(),
      textTemplate: '축하합니다! 온보딩 신청이 승인되었습니다.',
      variables: ['companyName', 'contactName', 'dashboardUrl'],
      defaultPriority: NotificationPriority.HIGH
    });

    this.templates.set(NotificationType.APPLICATION_REJECTED, {
      type: NotificationType.APPLICATION_REJECTED,
      subject: '[커스터디] 온보딩 신청 검토 결과',
      htmlTemplate: this.getApplicationRejectedTemplate(),
      textTemplate: '온보딩 신청이 거부되었습니다.',
      variables: ['companyName', 'contactName', 'rejectionReason'],
      defaultPriority: NotificationPriority.HIGH
    });

    // 관리자용 템플릿
    this.templates.set(NotificationType.APPROVAL_REQUEST_ADMIN, {
      type: NotificationType.APPROVAL_REQUEST_ADMIN,
      subject: '[관리자] 승인 요청: {{companyName}} - {{stageName}}',
      htmlTemplate: this.getApprovalRequestTemplate(),
      textTemplate: '새로운 승인 요청이 있습니다.',
      variables: ['companyName', 'stageName', 'applicationId'],
      defaultPriority: NotificationPriority.HIGH
    });

    this.templates.set(NotificationType.STAGE_OVERDUE_ADMIN, {
      type: NotificationType.STAGE_OVERDUE_ADMIN,
      subject: '[긴급] 승인 기한 초과: {{companyName}} - {{stageName}}',
      htmlTemplate: this.getOverdueTemplate(),
      textTemplate: '승인 처리 기한이 초과되었습니다.',
      variables: ['companyName', 'stageName', 'overdueHours'],
      defaultPriority: NotificationPriority.CRITICAL
    });
  }

  // HTML 템플릿들 (간소화된 버전)
  private getApplicationReceivedTemplate(): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>온보딩 신청 접수 확인</h2>
        <p>안녕하세요, {{contactName}}님</p>
        <p><strong>{{companyName}}</strong>의 커스터디 서비스 온보딩 신청이 성공적으로 접수되었습니다.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>신청 ID:</strong> {{applicationId}}</p>
          <p><strong>접수일:</strong> {{submittedAt}}</p>
        </div>
        <p>검토 과정에서 추가 서류나 정보가 필요한 경우 별도로 연락드리겠습니다.</p>
        <p>문의사항이 있으시면 {{supportEmail}}로 연락주세요.</p>
      </div>
    `;
  }

  private getApplicationApprovedTemplate(): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #22c55e;">🎉 온보딩 승인 완료</h2>
        <p>축하합니다, {{contactName}}님!</p>
        <p><strong>{{companyName}}</strong>의 커스터디 서비스 이용이 승인되었습니다.</p>
        <div style="background: #ecfdf5; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
          <p>계정 설정이 완료되었으며, 곧 API 키와 입금 주소 정보를 별도로 전달드리겠습니다.</p>
        </div>
        <p>지금 바로 <a href="{{dashboardUrl}}" style="color: #3b82f6;">대시보드</a>에서 서비스를 시작해보세요.</p>
      </div>
    `;
  }

  private getApprovalRequestTemplate(): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">승인 요청</h2>
        <p><strong>{{companyName}}</strong>의 <strong>{{stageName}}</strong> 단계 승인이 요청되었습니다.</p>
        <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>신청 ID:</strong> {{applicationId}}</p>
          <p><strong>처리 기한:</strong> {{dueDate}}</p>
        </div>
        <p><a href="{{dashboardUrl}}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">지금 처리하기</a></p>
      </div>
    `;
  }

  // 추가 헬퍼 메서드들...
  private getApplicationRejectedTemplate(): string { return '<div>거부 템플릿</div>'; }
  private getDocumentVerificationTemplate(): string { return '<div>문서 검증 템플릿</div>'; }
  private getOverdueTemplate(): string { return '<div>기한 초과 템플릿</div>'; }

  // 각종 헬퍼 메서드들
  private getMemberNotificationTemplate(stage: ApprovalStage, decision: ApprovalDecision): NotificationType | null {
    if (decision === ApprovalDecision.APPROVE) {
      switch (stage) {
        case ApprovalStage.DOCUMENT_VERIFICATION: return NotificationType.DOCUMENT_VERIFICATION_COMPLETED;
        case ApprovalStage.COMPLIANCE_CHECK: return NotificationType.COMPLIANCE_REVIEW_STARTED;
        case ApprovalStage.FINAL_APPROVAL: return NotificationType.APPLICATION_APPROVED;
        default: return null;
      }
    } else if (decision === ApprovalDecision.REJECT) {
      return NotificationType.APPLICATION_REJECTED;
    }
    return null;
  }

  private getStageDisplayName(stage: ApprovalStage): string {
    const names = {
      [ApprovalStage.DOCUMENT_VERIFICATION]: '문서 검증',
      [ApprovalStage.COMPLIANCE_CHECK]: '컴플라이언스 검토',
      [ApprovalStage.RISK_ASSESSMENT]: '리스크 평가',
      [ApprovalStage.FINAL_APPROVAL]: '최종 승인'
    };
    return names[stage] || stage;
  }

  private getDecisionDisplayName(decision: ApprovalDecision): string {
    const names = {
      [ApprovalDecision.APPROVE]: '승인',
      [ApprovalDecision.REJECT]: '거부',
      [ApprovalDecision.REQUEST_MORE_INFO]: '추가 정보 요청',
      [ApprovalDecision.ESCALATE]: '에스컬레이션'
    };
    return names[decision] || decision;
  }

  private getPriorityForDecision(decision: ApprovalDecision): NotificationPriority {
    switch (decision) {
      case ApprovalDecision.APPROVE: return NotificationPriority.HIGH;
      case ApprovalDecision.REJECT: return NotificationPriority.HIGH;
      case ApprovalDecision.ESCALATE: return NotificationPriority.CRITICAL;
      default: return NotificationPriority.NORMAL;
    }
  }

  private getNextStage(currentStage: ApprovalStage): ApprovalStage | null {
    const stages = Object.values(ApprovalStage);
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }

  private buildSubject(template: NotificationType | string, variables: Record<string, any>): string {
    const templateObj = typeof template === 'string'
      ? this.templates.get(template as NotificationType)
      : this.templates.get(template);

    let subject = templateObj?.subject || '[커스터디] 알림';

    // 변수 치환
    Object.entries(variables).forEach(([key, value]) => {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });

    return subject;
  }

  // Mock 데이터 조회 메서드들
  private async getStageApprovers(stage: ApprovalStage): Promise<AdminUser[]> {
    // Mock 관리자 목록 반환
    return [];
  }

  private async getSuperAdmins(): Promise<AdminUser[]> {
    // Mock 최고관리자 목록 반환
    return [];
  }

  private async getSuperAdminEmails(): Promise<string[]> {
    return ['super-admin@custody.com'];
  }

  private calculateDueDate(stage: ApprovalStage): Date {
    const hoursMap = {
      [ApprovalStage.DOCUMENT_VERIFICATION]: 24,
      [ApprovalStage.COMPLIANCE_CHECK]: 48,
      [ApprovalStage.RISK_ASSESSMENT]: 72,
      [ApprovalStage.FINAL_APPROVAL]: 24
    };

    return new Date(Date.now() + (hoursMap[stage] || 24) * 60 * 60 * 1000);
  }

  private calculateOverdueHours(stage: ApprovalStage): number {
    return 24; // Mock
  }

  private getStageUrgency(stage: ApprovalStage): string {
    return stage === ApprovalStage.FINAL_APPROVAL ? '높음' : '보통';
  }

  private async saveEmailToQueue(email: EmailNotificationPayload): Promise<void> {
    const queue = getFromStorage<EmailNotificationPayload>('email_notification_queue') || [];
    const index = queue.findIndex(e => e.id === email.id);

    if (index !== -1) {
      queue[index] = email;
    } else {
      queue.push(email);
    }

    setToStorage('email_notification_queue', queue);
  }

  private generateEmailId(): string {
    return 'EMAIL-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const emailNotificationService = new EmailNotificationService();
export default emailNotificationService;