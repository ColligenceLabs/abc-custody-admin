export type PolicyLogAction = 'CREATE' | 'UPDATE' | 'SUSPEND';

export interface PolicyLogChange {
  field: string;
  oldValue: any;
  newValue: any;
}

export interface PolicyLogMetadata {
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  reason?: string; // 변경/삭제 사유
}

export interface PolicyLog {
  id: string;
  timestamp: string;
  action: PolicyLogAction;
  policyId: string;
  policyDescription: string;
  userId: string;
  userName: string;
  changes: PolicyLogChange[];
  metadata: PolicyLogMetadata;
}

export interface PolicyLogFilter {
  startDate?: string;
  endDate?: string;
  action?: PolicyLogAction | 'ALL';
  userId?: string;
  policyId?: string;
}

export interface PolicyLogSummary {
  totalLogs: number;
  createCount: number;
  updateCount: number;
  suspendCount: number;
  uniqueUsers: number;
  lastActivity: string;
}