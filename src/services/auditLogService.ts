/**
 * 감사 로그 기록 서비스
 * Task 2.2: 승인 워크플로우 감사 추적
 */

import { ApprovalStage, ApprovalDecision } from '@/types/approvalWorkflow';
import { AdminUser } from '@/types/admin';
import { Member } from '@/types/member';
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

// 감사 로그 이벤트 타입
export enum AuditEventType {
  // 승인 관련 이벤트
  WORKFLOW_CREATED = "workflow_created",
  STAGE_STARTED = "stage_started",
  STAGE_COMPLETED = "stage_completed",
  DOCUMENT_VERIFIED = "document_verified",
  DOCUMENT_REJECTED = "document_rejected",
  INFO_REQUESTED = "info_requested",
  APPROVAL_DECISION = "approval_decision",
  REJECTION_DECISION = "rejection_decision",
  ESCALATION = "escalation",
  WORKFLOW_COMPLETED = "workflow_completed",

  // 계정 생성 이벤트
  ACCOUNT_CREATION_STARTED = "account_creation_started",
  API_KEYS_GENERATED = "api_keys_generated",
  DEPOSIT_ADDRESSES_CREATED = "deposit_addresses_created",
  ACCOUNT_CREATION_COMPLETED = "account_creation_completed",

  // 알림 이벤트
  EMAIL_SENT = "email_sent",
  EMAIL_FAILED = "email_failed",

  // 시스템 이벤트
  LOGIN = "login",
  LOGOUT = "logout",
  ACCESS_DENIED = "access_denied",
  DATA_ACCESS = "data_access",
  DATA_EXPORT = "data_export"
}

// 감사 로그 레벨
export enum AuditLevel {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical"
}

// 감사 로그 엔트리
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  level: AuditLevel;
  category: AuditCategory;
  performedBy: string; // Admin user ID or 'system'
  performedByName: string;
  performedByRole?: string;
  targetEntityType: string; // 'member', 'workflow', 'account', etc.
  targetEntityId: string;
  details: AuditLogDetails;
  clientInfo: ClientInfo;
  result: AuditResult;
  tags: string[];
  retentionPeriod: number; // days
}

export enum AuditCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  APPROVAL_WORKFLOW = "approval_workflow",
  MEMBER_MANAGEMENT = "member_management",
  ACCOUNT_CREATION = "account_creation",
  NOTIFICATION = "notification",
  DATA_ACCESS = "data_access",
  SYSTEM_OPERATION = "system_operation"
}

// 감사 로그 상세 정보
export interface AuditLogDetails {
  description: string;
  previousState?: any;
  newState?: any;
  changes?: Record<string, { from: any; to: any }>;
  metadata?: Record<string, any>;
  relatedEntities?: Array<{
    type: string;
    id: string;
    name?: string;
  }>;
}

// 클라이언트 정보
export interface ClientInfo {
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  sessionId?: string;
  requestId?: string;
}

export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// 감사 결과
export interface AuditResult {
  success: boolean;
  statusCode?: number;
  errorMessage?: string;
  duration?: number; // milliseconds
}

// 감사 로그 검색 필터
export interface AuditLogFilter {
  eventTypes?: AuditEventType[];
  levels?: AuditLevel[];
  categories?: AuditCategory[];
  performedBy?: string[];
  targetEntityId?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
  offset?: number;
}

// 감사 로그 통계
export interface AuditLogStatistics {
  totalEvents: number;
  eventsByType: Record<AuditEventType, number>;
  eventsByLevel: Record<AuditLevel, number>;
  eventsByCategory: Record<AuditCategory, number>;
  topPerformers: Array<{
    userId: string;
    userName: string;
    eventCount: number;
  }>;
  suspiciousActivities: AuditLogEntry[];
  recentErrors: AuditLogEntry[];
}

class AuditLogService {
  // 승인 워크플로우 이벤트 로그
  async logApprovalEvent(
    eventType: AuditEventType,
    memberId: string,
    workflowId: string,
    stage: ApprovalStage,
    adminUser: AdminUser,
    details: Partial<AuditLogDetails>,
    clientInfo: ClientInfo,
    result: AuditResult = { success: true }
  ): Promise<string> {

    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      eventType,
      level: this.determineLogLevel(eventType, result),
      category: AuditCategory.APPROVAL_WORKFLOW,
      performedBy: adminUser.id,
      performedByName: adminUser.name,
      performedByRole: adminUser.role,
      targetEntityType: 'workflow',
      targetEntityId: workflowId,
      details: {
        description: this.generateDescription(eventType, stage, details),
        metadata: {
          memberId,
          stage,
          workflowId,
          ...details.metadata
        },
        ...details
      },
      clientInfo,
      result,
      tags: this.generateTags(eventType, stage, adminUser.role),
      retentionPeriod: this.getRetentionPeriod(eventType)
    };

    await this.saveLogEntry(logEntry);

    // 중요 이벤트는 실시간 알림
    if (this.isCriticalEvent(eventType)) {
      await this.sendCriticalEventNotification(logEntry);
    }

    console.log(`📋 감사 로그 기록: ${eventType} - ${logEntry.details.description}`);

    return logEntry.id;
  }

  // 계정 생성 이벤트 로그
  async logAccountCreationEvent(
    eventType: AuditEventType,
    memberId: string,
    processId: string,
    details: Partial<AuditLogDetails>,
    result: AuditResult = { success: true }
  ): Promise<string> {

    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      eventType,
      level: this.determineLogLevel(eventType, result),
      category: AuditCategory.ACCOUNT_CREATION,
      performedBy: 'system',
      performedByName: '시스템',
      targetEntityType: 'account_creation_process',
      targetEntityId: processId,
      details: {
        description: this.generateAccountCreationDescription(eventType, details),
        metadata: {
          memberId,
          processId,
          ...details.metadata
        },
        ...details
      },
      clientInfo: this.getSystemClientInfo(),
      result,
      tags: ['automated', 'account-creation', 'system'],
      retentionPeriod: 2555 // 7년 보관
    };

    await this.saveLogEntry(logEntry);
    return logEntry.id;
  }

  // 인증 이벤트 로그
  async logAuthenticationEvent(
    eventType: AuditEventType,
    userId: string,
    userName: string,
    clientInfo: ClientInfo,
    result: AuditResult
  ): Promise<string> {

    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      eventType,
      level: result.success ? AuditLevel.INFO : AuditLevel.WARNING,
      category: AuditCategory.AUTHENTICATION,
      performedBy: userId,
      performedByName: userName,
      targetEntityType: 'user_session',
      targetEntityId: clientInfo.sessionId || 'unknown',
      details: {
        description: this.generateAuthDescription(eventType, result),
        metadata: {
          loginAttempt: eventType === AuditEventType.LOGIN,
          successfulLogin: result.success
        }
      },
      clientInfo,
      result,
      tags: result.success ? ['authentication', 'success'] : ['authentication', 'failure'],
      retentionPeriod: 730 // 2년 보관
    };

    await this.saveLogEntry(logEntry);
    return logEntry.id;
  }

  // 데이터 접근 이벤트 로그
  async logDataAccessEvent(
    entityType: string,
    entityId: string,
    action: string,
    adminUser: AdminUser,
    clientInfo: ClientInfo,
    details?: Partial<AuditLogDetails>
  ): Promise<string> {

    const logEntry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date(),
      eventType: AuditEventType.DATA_ACCESS,
      level: AuditLevel.INFO,
      category: AuditCategory.DATA_ACCESS,
      performedBy: adminUser.id,
      performedByName: adminUser.name,
      performedByRole: adminUser.role,
      targetEntityType: entityType,
      targetEntityId: entityId,
      details: {
        description: `${entityType} 데이터 ${action}`,
        metadata: {
          action,
          ...details?.metadata
        },
        ...details
      },
      clientInfo,
      result: { success: true },
      tags: ['data-access', action, entityType],
      retentionPeriod: 1095 // 3년 보관
    };

    await this.saveLogEntry(logEntry);
    return logEntry.id;
  }

  // 감사 로그 조회
  async getAuditLogs(filter: AuditLogFilter = {}): Promise<AuditLogEntry[]> {
    const logs = getFromStorage<AuditLogEntry>('audit_logs') || [];

    let filteredLogs = logs;

    // 필터 적용
    if (filter.eventTypes?.length) {
      filteredLogs = filteredLogs.filter(log => filter.eventTypes!.includes((log as any).eventType));
    }

    if (filter.levels?.length) {
      filteredLogs = filteredLogs.filter(log => filter.levels!.includes((log as any).level));
    }

    if (filter.categories?.length) {
      filteredLogs = filteredLogs.filter(log => filter.categories!.includes((log as any).category));
    }

    if (filter.performedBy?.length) {
      filteredLogs = filteredLogs.filter(log => filter.performedBy!.includes((log as any).performedBy));
    }

    if (filter.targetEntityId) {
      filteredLogs = filteredLogs.filter(log => (log as any).targetEntityId === filter.targetEntityId);
    }

    if (filter.startDate) {
      filteredLogs = filteredLogs.filter(log => new Date((log as any).timestamp) >= filter.startDate!);
    }

    if (filter.endDate) {
      filteredLogs = filteredLogs.filter(log => new Date((log as any).timestamp) <= filter.endDate!);
    }

    if (filter.tags?.length) {
      filteredLogs = filteredLogs.filter(log =>
        filter.tags!.some(tag => (log as any).tags.includes(tag))
      );
    }

    // 시간순 정렬 (최신순)
    filteredLogs.sort((a, b) => new Date((b as any).timestamp).getTime() - new Date((a as any).timestamp).getTime());

    // 페이지네이션
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;

    return filteredLogs.slice(offset, offset + limit);
  }

  // 특정 엔터티의 감사 로그 조회
  async getEntityAuditTrail(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
    return await this.getAuditLogs({
      targetEntityId: entityId,
      limit: 1000
    });
  }

  // 감사 로그 통계 조회
  async getAuditStatistics(
    startDate?: Date,
    endDate?: Date
  ): Promise<AuditLogStatistics> {
    const logs = await this.getAuditLogs({
      startDate,
      endDate,
      limit: 10000
    });

    const totalEvents = logs.length;

    // 이벤트 타입별 통계
    const eventsByType = {} as Record<AuditEventType, number>;
    Object.values(AuditEventType).forEach(type => {
      eventsByType[type] = logs.filter(log => log.eventType === type).length;
    });

    // 레벨별 통계
    const eventsByLevel = {} as Record<AuditLevel, number>;
    Object.values(AuditLevel).forEach(level => {
      eventsByLevel[level] = logs.filter(log => log.level === level).length;
    });

    // 카테고리별 통계
    const eventsByCategory = {} as Record<AuditCategory, number>;
    Object.values(AuditCategory).forEach(category => {
      eventsByCategory[category] = logs.filter(log => log.category === category).length;
    });

    // 상위 활동 사용자
    const userActivity = logs.reduce((acc, log) => {
      if (log.performedBy !== 'system') {
        acc[log.performedBy] = (acc[log.performedBy] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topPerformers = Object.entries(userActivity)
      .map(([userId, count]) => ({
        userId,
        userName: logs.find(l => l.performedBy === userId)?.performedByName || 'Unknown',
        eventCount: count
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, 10);

    // 의심스러운 활동 탐지
    const suspiciousActivities = this.detectSuspiciousActivities(logs);

    // 최근 오류
    const recentErrors = logs
      .filter(log => log.level === AuditLevel.ERROR || log.level === AuditLevel.CRITICAL)
      .slice(0, 20);

    return {
      totalEvents,
      eventsByType,
      eventsByLevel,
      eventsByCategory,
      topPerformers,
      suspiciousActivities,
      recentErrors
    };
  }

  // 의심스러운 활동 탐지
  private detectSuspiciousActivities(logs: AuditLogEntry[]): AuditLogEntry[] {
    const suspicious: AuditLogEntry[] = [];

    // 1. 비정상적인 시간대 활동 (새벽 2-5시)
    const nightActivityLogs = logs.filter(log => {
      const hour = new Date(log.timestamp).getHours();
      return hour >= 2 && hour <= 5 && log.performedBy !== 'system';
    });

    // 2. 단시간 내 많은 실패 시도
    const failedAttempts = logs.filter(log => !log.result.success);
    const recentFailures = this.groupByTimeWindow(failedAttempts, 300000); // 5분 윈도우

    Object.entries(recentFailures).forEach(([userId, userLogs]) => {
      if (userLogs.length >= 5) {
        suspicious.push(...userLogs);
      }
    });

    // 3. 비정상적인 IP 주소에서의 접근
    const ipActivity = this.groupByField(logs, 'clientInfo.ipAddress');
    Object.entries(ipActivity).forEach(([ip, ipLogs]) => {
      if (this.isUnusualIP(ip) && ipLogs.length > 0) {
        suspicious.push(...ipLogs);
      }
    });

    // 4. 권한 초과 시도
    const accessDeniedLogs = logs.filter(log =>
      log.eventType === AuditEventType.ACCESS_DENIED
    );

    suspicious.push(...nightActivityLogs.slice(0, 10));
    suspicious.push(...accessDeniedLogs.slice(0, 10));

    return suspicious
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }

  // 감사 로그 내보내기
  async exportAuditLogs(
    filter: AuditLogFilter,
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const logs = await this.getAuditLogs(filter);

    if (format === 'csv') {
      return this.convertToCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  // Private 헬퍼 메서드들
  private async saveLogEntry(entry: AuditLogEntry): Promise<void> {
    const logs = getFromStorage<AuditLogEntry>('audit_logs') || [];
    logs.push(entry);

    // 로그 크기 제한 (최대 10만개 유지)
    if (logs.length > 100000) {
      logs.splice(0, 10000); // 오래된 1만개 삭제
    }

    setToStorage('audit_logs', logs);
  }

  private determineLogLevel(eventType: AuditEventType, result: AuditResult): AuditLevel {
    if (!result.success) {
      return AuditLevel.ERROR;
    }

    switch (eventType) {
      case AuditEventType.ESCALATION:
      case AuditEventType.ACCESS_DENIED:
        return AuditLevel.WARNING;
      case AuditEventType.WORKFLOW_COMPLETED:
      case AuditEventType.ACCOUNT_CREATION_COMPLETED:
        return AuditLevel.INFO;
      default:
        return AuditLevel.INFO;
    }
  }

  private generateDescription(
    eventType: AuditEventType,
    stage?: ApprovalStage,
    details?: Partial<AuditLogDetails>
  ): string {
    const stageNames = {
      [ApprovalStage.DOCUMENT_VERIFICATION]: '문서 검증',
      [ApprovalStage.COMPLIANCE_CHECK]: '컴플라이언스 검토',
      [ApprovalStage.RISK_ASSESSMENT]: '리스크 평가',
      [ApprovalStage.FINAL_APPROVAL]: '최종 승인'
    };

    const descriptions = {
      [AuditEventType.WORKFLOW_CREATED]: '승인 워크플로우 생성',
      [AuditEventType.STAGE_STARTED]: `${stage ? stageNames[stage] : ''} 단계 시작`,
      [AuditEventType.STAGE_COMPLETED]: `${stage ? stageNames[stage] : ''} 단계 완료`,
      [AuditEventType.DOCUMENT_VERIFIED]: '문서 검증 완료',
      [AuditEventType.DOCUMENT_REJECTED]: '문서 검증 거부',
      [AuditEventType.APPROVAL_DECISION]: '승인 결정',
      [AuditEventType.REJECTION_DECISION]: '거부 결정',
      [AuditEventType.ESCALATION]: '에스컬레이션 처리'
    };

    return (descriptions as any)[eventType] || eventType;
  }

  private generateAccountCreationDescription(
    eventType: AuditEventType,
    details?: Partial<AuditLogDetails>
  ): string {
    const descriptions = {
      [AuditEventType.ACCOUNT_CREATION_STARTED]: '계정 생성 프로세스 시작',
      [AuditEventType.API_KEYS_GENERATED]: 'API 키 생성',
      [AuditEventType.DEPOSIT_ADDRESSES_CREATED]: '입금 주소 생성',
      [AuditEventType.ACCOUNT_CREATION_COMPLETED]: '계정 생성 완료'
    };

    return (descriptions as any)[eventType] || eventType;
  }

  private generateAuthDescription(eventType: AuditEventType, result: AuditResult): string {
    if (eventType === AuditEventType.LOGIN) {
      return result.success ? '로그인 성공' : '로그인 실패';
    }
    if (eventType === AuditEventType.LOGOUT) {
      return '로그아웃';
    }
    return eventType;
  }

  private generateTags(eventType: AuditEventType, stage?: ApprovalStage, role?: string): string[] {
    const tags = ['audit'];

    if (stage) tags.push(`stage-${stage}`);
    if (role) tags.push(`role-${role.toLowerCase()}`);

    tags.push(`event-${eventType.replace(/_/g, '-')}`);

    return tags;
  }

  private getRetentionPeriod(eventType: AuditEventType): number {
    // 승인 관련 로그는 7년, 일반 로그는 3년
    const longTermEvents = [
      AuditEventType.APPROVAL_DECISION,
      AuditEventType.REJECTION_DECISION,
      AuditEventType.WORKFLOW_COMPLETED,
      AuditEventType.ACCOUNT_CREATION_COMPLETED
    ];

    return longTermEvents.includes(eventType) ? 2555 : 1095; // days
  }

  private isCriticalEvent(eventType: AuditEventType): boolean {
    const criticalEvents = [
      AuditEventType.ESCALATION,
      AuditEventType.ACCESS_DENIED,
      AuditEventType.REJECTION_DECISION
    ];

    return criticalEvents.includes(eventType);
  }

  private async sendCriticalEventNotification(logEntry: AuditLogEntry): Promise<void> {
    console.log(`🚨 중요 감사 이벤트 발생: ${logEntry.eventType} - ${logEntry.details.description}`);
    // 실제 구현에서는 알림 서비스로 전송
  }

  private getSystemClientInfo(): ClientInfo {
    return {
      ipAddress: '127.0.0.1',
      userAgent: 'System/1.0',
      location: {
        country: 'KR',
        region: 'Seoul',
        city: 'Seoul'
      }
    };
  }

  private groupByTimeWindow(logs: AuditLogEntry[], windowMs: number): Record<string, AuditLogEntry[]> {
    const grouped: Record<string, AuditLogEntry[]> = {};

    logs.forEach(log => {
      const key = log.performedBy;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });

    return grouped;
  }

  private groupByField(logs: AuditLogEntry[], field: string): Record<string, AuditLogEntry[]> {
    const grouped: Record<string, AuditLogEntry[]> = {};

    logs.forEach(log => {
      const value = this.getNestedValue(log, field);
      const key = String(value || 'unknown');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });

    return grouped;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private isUnusualIP(ip: string): boolean {
    // 내부 IP 대역이 아닌 경우 의심스러운 것으로 간주
    return !ip.startsWith('192.168.') &&
           !ip.startsWith('10.') &&
           !ip.startsWith('172.') &&
           ip !== '127.0.0.1';
  }

  private convertToCSV(logs: AuditLogEntry[]): string {
    const headers = [
      'ID', 'Timestamp', 'Event Type', 'Level', 'Category',
      'Performed By', 'Target Entity', 'Description', 'IP Address', 'Result'
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.eventType,
      log.level,
      log.category,
      log.performedByName,
      `${log.targetEntityType}:${log.targetEntityId}`,
      log.details.description,
      log.clientInfo.ipAddress,
      log.result.success ? 'Success' : 'Failed'
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  private generateLogId(): string {
    return 'AUDIT-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const auditLogService = new AuditLogService();
export default auditLogService;