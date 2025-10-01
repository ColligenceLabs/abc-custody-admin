/**
 * 알림 시스템
 * 결재 대기자에게 자동으로 알림을 발송하는 시스템
 */

import { WithdrawalRequest } from "@/types/withdrawal";

export type NotificationChannel = "email" | "slack" | "teams" | "webhook" | "in_app";
export type NotificationTrigger = "approval_pending" | "approval_overdue" | "approval_completed" | "approval_rejected" | "emergency";

export interface NotificationTemplate {
  id: string;
  name: string;
  trigger: NotificationTrigger;
  subject: string;
  message: string;
  channels: NotificationChannel[];
  enabled: boolean;
  variables: string[];
  updatedAt?: string;
}

export interface NotificationConfig {
  approverEmail: Record<string, string>;
  slackWebhooks: Record<string, string>;
  teamsWebhooks: Record<string, string>;
  globalWebhooks: string[];
  defaultChannels: NotificationChannel[];
  overdueThresholdHours: number;
  retryAttempts: number;
  retryDelayMinutes: number;
}

export interface NotificationLog {
  id: string;
  requestId: string;
  recipient: string;
  channel: NotificationChannel;
  template: string;
  status: "pending" | "sent" | "failed" | "retry";
  sentAt?: string;
  failureReason?: string;
  retryCount: number;
  nextRetryAt?: string;
}

export const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: "approval_pending",
    name: "결재 대기 알림",
    trigger: "approval_pending",
    subject: "[출금관리] 결재 승인이 필요합니다 - {{title}}",
    message: `
안녕하세요 {{approver}}님,

새로운 출금 신청이 귀하의 승인을 기다리고 있습니다.

📋 출금 신청 정보:
• 제목: {{title}}
• 신청자: {{initiator}}
• 금액: {{amount}} {{currency}}
• 신청일시: {{initiatedAt}}
• 우선순위: {{priority}}

🔗 승인 페이지: {{approvalUrl}}

⏰ 신속한 검토와 승인을 부탁드립니다.

감사합니다.
출금관리시스템
    `,
    channels: ["email", "slack"],
    enabled: true,
    variables: ["approver", "title", "initiator", "amount", "currency", "initiatedAt", "priority", "approvalUrl"]
  },
  {
    id: "approval_overdue",
    name: "결재 지연 알림",
    trigger: "approval_overdue",
    subject: "[긴급] 결재 승인이 지연되고 있습니다 - {{title}}",
    message: `
⚠️ 긴급 알림 ⚠️

{{approver}}님,

다음 출금 신청이 {{overdueHours}}시간째 승인을 기다리고 있습니다.

📋 출금 신청 정보:
• 제목: {{title}}
• 신청자: {{initiator}}
• 금액: {{amount}} {{currency}}
• 신청일시: {{initiatedAt}}
• 우선순위: {{priority}}
• 지연시간: {{overdueHours}}시간

🔗 승인 페이지: {{approvalUrl}}

🚨 즉시 검토와 승인을 부탁드립니다.

감사합니다.
출금관리시스템
    `,
    channels: ["email", "slack", "in_app"],
    enabled: true,
    variables: ["approver", "title", "initiator", "amount", "currency", "initiatedAt", "priority", "approvalUrl", "overdueHours"]
  },
  {
    id: "approval_completed",
    name: "결재 완료 알림",
    trigger: "approval_completed",
    subject: "[출금관리] 결재가 완료되었습니다 - {{title}}",
    message: `
안녕하세요,

출금 신청 "{{title}}"의 결재가 완료되었습니다.

📋 결재 정보:
• 신청자: {{initiator}}
• 금액: {{amount}} {{currency}}
• 완료일시: {{completedAt}}
• 최종 승인자: {{finalApprover}}

✅ 모든 필요한 승인이 완료되었으며, 출금 처리를 진행합니다.

감사합니다.
출금관리시스템
    `,
    channels: ["email"],
    enabled: true,
    variables: ["title", "initiator", "amount", "currency", "completedAt", "finalApprover"]
  },
  {
    id: "approval_rejected",
    name: "결재 반려 알림",
    trigger: "approval_rejected",
    subject: "[출금관리] 출금 신청이 반려되었습니다 - {{title}}",
    message: `
안녕하세요 {{initiator}}님,

귀하의 출금 신청이 반려되었습니다.

📋 반려 정보:
• 제목: {{title}}
• 금액: {{amount}} {{currency}}
• 반려자: {{rejector}}
• 반려일시: {{rejectedAt}}
• 반려사유: {{rejectionReason}}

📝 필요하시면 사유를 확인 후 재신청해 주시기 바랍니다.

🔗 출금관리 페이지: {{withdrawalUrl}}

감사합니다.
출금관리시스템
    `,
    channels: ["email", "in_app"],
    enabled: true,
    variables: ["initiator", "title", "amount", "currency", "rejector", "rejectedAt", "rejectionReason", "withdrawalUrl"]
  },
  {
    id: "emergency_approval",
    name: "긴급 결재 알림",
    trigger: "emergency",
    subject: "[긴급] 즉시 결재가 필요합니다 - {{title}}",
    message: `
🚨 긴급 알림 🚨

{{approver}}님,

긴급 출금 신청이 귀하의 즉시 승인을 필요로 합니다.

📋 긴급 출금 정보:
• 제목: {{title}}
• 신청자: {{initiator}}
• 금액: {{amount}} {{currency}}
• 신청일시: {{initiatedAt}}
• 긴급사유: {{emergencyReason}}

🔗 즉시 승인하기: {{approvalUrl}}

⚡ 이 요청은 긴급 처리가 필요합니다. 즉시 검토해 주시기 바랍니다.

감사합니다.
출금관리시스템
    `,
    channels: ["email", "slack", "teams", "in_app"],
    enabled: true,
    variables: ["approver", "title", "initiator", "amount", "currency", "initiatedAt", "emergencyReason", "approvalUrl"]
  }
];

export const DEFAULT_CONFIG: NotificationConfig = {
  approverEmail: {
    "박CFO": "cfo@company.com",
    "이CISO": "ciso@company.com",
    "김CTO": "cto@company.com",
    "정법무이사": "legal@company.com",
    "최CEO": "ceo@company.com",
    "한비즈데브이사": "bizdev@company.com"
  },
  slackWebhooks: {
    "finance": process.env.NEXT_PUBLIC_SLACK_WEBHOOK_FINANCE || "",
    "security": process.env.NEXT_PUBLIC_SLACK_WEBHOOK_SECURITY || "",
    "tech": process.env.NEXT_PUBLIC_SLACK_WEBHOOK_TECH || ""
  },
  teamsWebhooks: {
    "management": process.env.NEXT_PUBLIC_TEAMS_WEBHOOK_MANAGEMENT || ""
  },
  globalWebhooks: [],
  defaultChannels: ["email", "in_app"],
  overdueThresholdHours: 4,
  retryAttempts: 3,
  retryDelayMinutes: 30
};

export class NotificationSystem {
  private templates: NotificationTemplate[] = [];
  private config: NotificationConfig;
  private logs: NotificationLog[] = [];

  constructor(config: NotificationConfig = DEFAULT_CONFIG) {
    this.templates = [...DEFAULT_TEMPLATES];
    this.config = config;
  }

  /**
   * 템플릿 변수 치환
   */
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value || ''));
    }

    return result;
  }

  /**
   * 결재 대기 알림 발송
   */
  async sendApprovalPendingNotification(
    request: WithdrawalRequest,
    pendingApprover: string
  ): Promise<NotificationLog[]> {
    const template = this.templates.find(t => t.id === "approval_pending");
    if (!template || !template.enabled) {
      return [];
    }

    const variables = {
      approver: pendingApprover,
      title: request.title,
      initiator: request.initiator,
      amount: request.amount.toLocaleString(),
      currency: request.currency,
      initiatedAt: new Date(request.initiatedAt).toLocaleString('ko-KR'),
      priority: request.priority,
      approvalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal?id=${request.id}`,
      requestId: request.id
    };

    return this.sendNotification(template, pendingApprover, variables);
  }

  /**
   * 결재 지연 알림 발송
   */
  async sendOverdueNotification(
    request: WithdrawalRequest,
    pendingApprover: string,
    overdueHours: number
  ): Promise<NotificationLog[]> {
    const template = this.templates.find(t => t.id === "approval_overdue");
    if (!template || !template.enabled) {
      return [];
    }

    const variables = {
      approver: pendingApprover,
      title: request.title,
      initiator: request.initiator,
      amount: request.amount.toLocaleString(),
      currency: request.currency,
      initiatedAt: new Date(request.initiatedAt).toLocaleString('ko-KR'),
      priority: request.priority,
      approvalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal?id=${request.id}`,
      overdueHours: overdueHours.toString(),
      requestId: request.id
    };

    return this.sendNotification(template, pendingApprover, variables);
  }

  /**
   * 결재 완료 알림 발송
   */
  async sendApprovalCompletedNotification(
    request: WithdrawalRequest
  ): Promise<NotificationLog[]> {
    const template = this.templates.find(t => t.id === "approval_completed");
    if (!template || !template.enabled) {
      return [];
    }

    const finalApproval = request.approvals[request.approvals.length - 1];
    const variables = {
      title: request.title,
      initiator: request.initiator,
      amount: request.amount.toLocaleString(),
      currency: request.currency,
      completedAt: new Date().toLocaleString('ko-KR'),
      finalApprover: finalApproval?.userName || '시스템',
      requestId: request.id
    };

    // 관련자들에게 알림 (신청자 + 모든 결재자)
    const recipients = [request.initiator, ...request.approvals.map(a => a.userName)];
    const allLogs: NotificationLog[] = [];

    for (const recipient of recipients) {
      const logs = await this.sendNotification(template, recipient, variables);
      allLogs.push(...logs);
    }

    return allLogs;
  }

  /**
   * 결재 반려 알림 발송
   */
  async sendApprovalRejectedNotification(
    request: WithdrawalRequest,
    rejection: { userName: string; rejectedAt: string; reason: string }
  ): Promise<NotificationLog[]> {
    const template = this.templates.find(t => t.id === "approval_rejected");
    if (!template || !template.enabled) {
      return [];
    }

    const variables = {
      initiator: request.initiator,
      title: request.title,
      amount: request.amount.toLocaleString(),
      currency: request.currency,
      rejector: rejection.userName,
      rejectedAt: new Date(rejection.rejectedAt).toLocaleString('ko-KR'),
      rejectionReason: rejection.reason,
      withdrawalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal`,
      requestId: request.id
    };

    return this.sendNotification(template, request.initiator, variables);
  }

  /**
   * 긴급 결재 알림 발송
   */
  async sendEmergencyApprovalNotification(
    request: WithdrawalRequest,
    approver: string,
    emergencyReason: string
  ): Promise<NotificationLog[]> {
    const template = this.templates.find(t => t.id === "emergency_approval");
    if (!template || !template.enabled) {
      return [];
    }

    const variables = {
      approver: approver,
      title: request.title,
      initiator: request.initiator,
      amount: request.amount.toLocaleString(),
      currency: request.currency,
      initiatedAt: new Date(request.initiatedAt).toLocaleString('ko-KR'),
      emergencyReason: emergencyReason,
      approvalUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/withdrawal?id=${request.id}`,
      requestId: request.id
    };

    return this.sendNotification(template, approver, variables);
  }

  /**
   * 실제 알림 발송 처리
   */
  private async sendNotification(
    template: NotificationTemplate,
    recipient: string,
    variables: Record<string, any>
  ): Promise<NotificationLog[]> {
    const subject = this.replaceVariables(template.subject, variables);
    const message = this.replaceVariables(template.message, variables);
    const logs: NotificationLog[] = [];

    for (const channel of template.channels) {
      const log: NotificationLog = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        requestId: variables.requestId || '',
        recipient,
        channel,
        template: template.id,
        status: "pending",
        retryCount: 0
      };

      try {
        const sent = await this.sendToChannel(channel, recipient, subject, message);
        log.status = sent ? "sent" : "failed";
        log.sentAt = sent ? new Date().toISOString() : undefined;
        log.failureReason = sent ? undefined : "전송 실패";
      } catch (error) {
        log.status = "failed";
        log.failureReason = error instanceof Error ? error.message : "알 수 없는 오류";
      }

      logs.push(log);
      this.logs.push(log);
    }

    return logs;
  }

  /**
   * 채널별 알림 발송
   */
  private async sendToChannel(
    channel: NotificationChannel,
    recipient: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    switch (channel) {
      case "email":
        return this.sendEmail(recipient, subject, message);
      case "slack":
        return this.sendSlack(recipient, subject, message);
      case "teams":
        return this.sendTeams(recipient, subject, message);
      case "webhook":
        return this.sendWebhook(recipient, subject, message);
      case "in_app":
        return this.sendInAppNotification(recipient, subject, message);
      default:
        return false;
    }
  }

  /**
   * 이메일 발송 (모의)
   */
  private async sendEmail(recipient: string, subject: string, message: string): Promise<boolean> {
    const email = this.config.approverEmail[recipient];
    if (!email) {
      console.warn(`No email configured for ${recipient}`);
      return false;
    }

    // 실제 환경에서는 이메일 서비스 API 호출
    console.log(`📧 Email sent to ${email}:`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message.substring(0, 100)}...`);

    return true;
  }

  /**
   * Slack 알림 발송 (모의)
   */
  private async sendSlack(recipient: string, subject: string, message: string): Promise<boolean> {
    // 실제 환경에서는 Slack Webhook API 호출
    console.log(`📱 Slack message sent to ${recipient}:`);
    console.log(`${subject}\n${message.substring(0, 100)}...`);

    return true;
  }

  /**
   * Teams 알림 발송 (모의)
   */
  private async sendTeams(recipient: string, subject: string, message: string): Promise<boolean> {
    // 실제 환경에서는 Teams Webhook API 호출
    console.log(`💬 Teams message sent to ${recipient}:`);
    console.log(`${subject}\n${message.substring(0, 100)}...`);

    return true;
  }

  /**
   * Webhook 알림 발송 (모의)
   */
  private async sendWebhook(recipient: string, subject: string, message: string): Promise<boolean> {
    // 실제 환경에서는 커스텀 Webhook API 호출
    console.log(`🔗 Webhook sent for ${recipient}:`);
    console.log(`${subject}\n${message.substring(0, 100)}...`);

    return true;
  }

  /**
   * 인앱 알림 발송 (모의)
   */
  private async sendInAppNotification(recipient: string, subject: string, message: string): Promise<boolean> {
    // 실제 환경에서는 앱 내 알림 시스템에 저장
    console.log(`🔔 In-app notification for ${recipient}:`);
    console.log(`${subject}\n${message.substring(0, 100)}...`);

    return true;
  }

  /**
   * 지연된 결재 확인 및 알림
   */
  async checkOverdueApprovals(requests: WithdrawalRequest[]): Promise<NotificationLog[]> {
    const allLogs: NotificationLog[] = [];
    const now = new Date();

    for (const request of requests) {
      if (request.status !== 'submitted') continue;

      // 다음 결재자 찾기
      const nextApproverIndex = request.approvals.length;
      const nextApprover = request.requiredApprovals[nextApproverIndex];

      if (!nextApprover) continue;

      // 지연 시간 계산
      const initiatedTime = new Date(request.initiatedAt);
      const hoursOverdue = (now.getTime() - initiatedTime.getTime()) / (1000 * 60 * 60);

      if (hoursOverdue >= this.config.overdueThresholdHours) {
        const logs = await this.sendOverdueNotification(request, nextApprover, Math.floor(hoursOverdue));
        allLogs.push(...logs);
      }
    }

    return allLogs;
  }

  /**
   * 알림 로그 조회
   */
  getNotificationLogs(requestId?: string): NotificationLog[] {
    if (requestId) {
      return this.logs.filter(log => log.requestId === requestId);
    }
    return [...this.logs];
  }

  /**
   * 실패한 알림 재시도
   */
  async retryFailedNotifications(): Promise<NotificationLog[]> {
    const failedLogs = this.logs.filter(log =>
      log.status === "failed" &&
      log.retryCount < this.config.retryAttempts &&
      (!log.nextRetryAt || new Date(log.nextRetryAt) <= new Date())
    );

    const retryLogs: NotificationLog[] = [];

    for (const log of failedLogs) {
      const template = this.templates.find(t => t.id === log.template);
      if (!template) continue;

      log.retryCount++;
      log.status = "retry";

      try {
        const sent = await this.sendToChannel(log.channel, log.recipient, "", ""); // 실제로는 원래 메시지 재전송
        log.status = sent ? "sent" : "failed";
        log.sentAt = sent ? new Date().toISOString() : undefined;

        if (!sent && log.retryCount < this.config.retryAttempts) {
          log.nextRetryAt = new Date(
            Date.now() + this.config.retryDelayMinutes * 60 * 1000
          ).toISOString();
        }
      } catch (error) {
        log.status = "failed";
        log.failureReason = error instanceof Error ? error.message : "재시도 실패";
      }

      retryLogs.push(log);
    }

    return retryLogs;
  }

  /**
   * 설정 업데이트
   */
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * 템플릿 추가/수정
   */
  updateTemplate(template: NotificationTemplate): void {
    const index = this.templates.findIndex(t => t.id === template.id);
    if (index >= 0) {
      this.templates[index] = template;
    } else {
      this.templates.push(template);
    }
  }

  /**
   * 템플릿 삭제
   */
  removeTemplate(templateId: string): boolean {
    const initialLength = this.templates.length;
    this.templates = this.templates.filter(t => t.id !== templateId);
    return this.templates.length < initialLength;
  }

  /**
   * 템플릿 목록 조회
   */
  getTemplates(): NotificationTemplate[] {
    return [...this.templates];
  }
}