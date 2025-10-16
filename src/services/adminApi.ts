/**
 * Admin API Service
 *
 * Handles admin authentication, session management, and admin-specific operations
 */

import {
  AdminUser,
  AdminSession,
  AdminPermission,
  AdminAuditLog,
  AdminRole,
  AdminUserStatus,
  AdminResource,
  AuditAction,
  AuditResult,
  LoginCredentials,
  TwoFactorVerification
} from '@/types/admin';
import { AdminNotification } from '@/types/adminNotification';
import { mockDb } from './mockDatabase';

// Simulated API delays
const API_DELAY = {
  FAST: 200,
  MEDIUM: 500,
  SLOW: 1000
} as const;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class AdminApiService {
  private static instance: AdminApiService;
  private currentSession: AdminSession | null = null;

  private constructor() {}

  public static getInstance(): AdminApiService {
    if (!AdminApiService.instance) {
      AdminApiService.instance = new AdminApiService();
    }
    return AdminApiService.instance;
  }

  // Authentication Methods
  async login(credentials: LoginCredentials): Promise<{
    requiresTwoFactor: boolean;
    sessionToken?: string;
    adminUser?: AdminUser;
  }> {
    await delay(API_DELAY.MEDIUM);

    // Mock user database
    const mockUsers: AdminUser[] = [
      {
        id: 'admin-001',
        email: 'admin@custody.com',
        name: '관리자',
        role: AdminRole.SUPER_ADMIN,
        permissions: this.getAllPermissions(),
        status: AdminUserStatus.ACTIVE,
        lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date(),
        twoFactorEnabled: true,
        sessionTimeout: 30
      },
      {
        id: 'admin-002',
        email: 'operations@custody.com',
        name: '운영팀',
        role: AdminRole.OPERATIONS,
        permissions: this.getOperationsPermissions(),
        status: AdminUserStatus.ACTIVE,
        lastLogin: new Date(Date.now() - 7200000), // 2 hours ago
        createdAt: new Date('2024-01-15T00:00:00.000Z'),
        updatedAt: new Date(),
        twoFactorEnabled: true,
        sessionTimeout: 30
      }
    ];

    const user = mockUsers.find(u => u.email === credentials.email);

    if (!user || credentials.password !== 'admin123') {
      throw new Error('Invalid credentials');
    }

    if (user.status !== AdminUserStatus.ACTIVE) {
      throw new Error('Account is deactivated');
    }

    // Always require 2FA for admin accounts
    return {
      requiresTwoFactor: true,
      adminUser: user
    };
  }

  async verifyTwoFactor(verification: TwoFactorVerification): Promise<{
    success: boolean;
    sessionToken?: string;
    adminUser?: AdminUser;
  }> {
    await delay(API_DELAY.FAST);

    // Mock 2FA verification (accept 123456 for testing)
    if (verification.code !== '123456') {
      throw new Error('Invalid 2FA code');
    }

    const sessionToken = this.generateSessionToken();
    const adminUser = this.getMockAdminUser();

    // Create session
    this.currentSession = {
      id: `session-${Date.now()}`,
      userId: adminUser.id,
      accessToken: sessionToken,
      refreshToken: `refresh-${sessionToken}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      ipAddress: '127.0.0.1',
      userAgent: 'Mock Browser',
      lastActivity: new Date(),
      isActive: true,
      loginMethod: 'PASSWORD_2FA' as any
    };

    // Log successful login
    this.logAdminAction({
      userId: adminUser.id,
      userName: adminUser.name,
      action: AuditAction.LOGIN,
      resource: AdminResource.ADMIN_USERS,
      details: { method: '2FA', ipAddress: '127.0.0.1' },
      result: AuditResult.SUCCESS
    });

    return {
      success: true,
      sessionToken,
      adminUser
    };
  }

  async logout(sessionToken: string): Promise<{ success: boolean }> {
    await delay(API_DELAY.FAST);

    if (this.currentSession?.accessToken === sessionToken) {
      // Log logout
      const adminUser = this.getMockAdminUser();
      this.logAdminAction({
        userId: this.currentSession.userId,
        userName: adminUser.name,
        action: AuditAction.LOGOUT,
        resource: AdminResource.ADMIN_USERS,
        details: { sessionDuration: Date.now() - this.currentSession.lastActivity.getTime() },
        result: AuditResult.SUCCESS
      });

      this.currentSession = null;
    }

    return { success: true };
  }

  async refreshSession(sessionToken: string): Promise<{
    newToken: string;
    expiresAt: string;
  }> {
    await delay(API_DELAY.FAST);

    if (!this.currentSession || this.currentSession.accessToken !== sessionToken) {
      throw new Error('Invalid session token');
    }

    // Check if session is expired
    if (new Date() > new Date(this.currentSession.expiresAt)) {
      this.currentSession = null;
      throw new Error('Session expired');
    }

    // Generate new token
    const newToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    this.currentSession = {
      ...this.currentSession,
      accessToken: newToken,
      expiresAt
    };

    return { newToken, expiresAt: expiresAt.toISOString() };
  }

  // Session Management
  async validateSession(sessionToken: string): Promise<{
    valid: boolean;
    adminUser?: AdminUser;
    session?: AdminSession;
  }> {
    await delay(API_DELAY.FAST);

    if (!this.currentSession || this.currentSession.accessToken !== sessionToken) {
      return { valid: false };
    }

    // Check if session is expired
    if (new Date() > new Date(this.currentSession.expiresAt)) {
      this.currentSession = null;
      return { valid: false };
    }

    const adminUser = this.getMockAdminUser();

    return {
      valid: true,
      adminUser,
      session: this.currentSession
    };
  }

  // Admin User Management
  async getCurrentUser(sessionToken: string): Promise<AdminUser> {
    await delay(API_DELAY.FAST);

    const validation = await this.validateSession(sessionToken);
    if (!validation.valid || !validation.adminUser) {
      throw new Error('Invalid session');
    }

    return validation.adminUser;
  }

  async getAdminUsers(): Promise<AdminUser[]> {
    await delay(API_DELAY.MEDIUM);

    return [
      this.getMockAdminUser(),
      {
        id: 'admin-002',
        email: 'operations@custody.com',
        name: '운영팀',
        role: AdminRole.OPERATIONS,
        permissions: this.getOperationsPermissions(),
        status: AdminUserStatus.ACTIVE,
        lastLogin: new Date(Date.now() - 7200000),
        createdAt: new Date('2024-01-15T00:00:00.000Z'),
        updatedAt: new Date(),
        twoFactorEnabled: true,
        sessionTimeout: 30
      }
    ];
  }

  // Notifications
  async getNotifications(): Promise<AdminNotification[]> {
    await delay(API_DELAY.FAST);
    return mockDb.getNotifications();
  }

  async markNotificationAsRead(notificationId: string): Promise<{ success: boolean }> {
    await delay(API_DELAY.FAST);

    const success = mockDb.markNotificationAsRead(notificationId);

    if (success) {
      const adminUser = this.getMockAdminUser();
      this.logAdminAction({
        userId: this.currentSession?.userId || 'unknown',
        userName: adminUser.name,
        action: AuditAction.UPDATE,
        resource: AdminResource.SETTINGS,
        resourceId: notificationId,
        details: { action: 'mark_as_read' },
        result: AuditResult.SUCCESS
      });
    }

    return { success };
  }

  async getUnreadNotificationCount(): Promise<{ count: number }> {
    await delay(API_DELAY.FAST);

    const notifications = mockDb.getNotifications();
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return { count: unreadCount };
  }

  // Audit Logs
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    logs: AdminAuditLog[];
    totalCount: number;
    hasMore: boolean;
  }> {
    await delay(API_DELAY.MEDIUM);

    // Mock audit logs
    const mockLogs: AdminAuditLog[] = [
      {
        id: 'audit-001',
        userId: 'admin-001',
        userName: '관리자',
        action: AuditAction.LOGIN,
        resource: AdminResource.ADMIN_USERS,
        resourceId: undefined,
        details: { method: '2FA', ipAddress: '127.0.0.1' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 3600000),
        result: AuditResult.SUCCESS
      },
      {
        id: 'audit-002',
        userId: 'admin-001',
        userName: '관리자',
        action: AuditAction.VIEW,
        resource: AdminResource.MEMBERS,
        resourceId: 'onboard-001',
        details: { memberName: 'Future Finance Corp' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0...',
        timestamp: new Date(Date.now() - 1800000),
        result: AuditResult.SUCCESS
      }
    ];

    // Apply filters
    let filteredLogs = mockLogs;

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters?.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters?.resource) {
      filteredLogs = filteredLogs.filter(log => log.resource === filters.resource);
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    return {
      logs: filteredLogs.slice(offset, offset + limit),
      totalCount: filteredLogs.length,
      hasMore: offset + limit < filteredLogs.length
    };
  }

  // Utility Methods
  private generateSessionToken(): string {
    return `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getMockAdminUser(): AdminUser {
    return {
      id: 'admin-001',
      email: 'admin@custody.com',
      name: '관리자',
      role: AdminRole.SUPER_ADMIN,
      permissions: this.getAllPermissions(),
      status: AdminUserStatus.ACTIVE,
      lastLogin: new Date(),
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date(),
      twoFactorEnabled: true,
      sessionTimeout: 30
    };
  }

  private getAllPermissions(): AdminPermission[] {
    return [
      { resource: AdminResource.MEMBERS, actions: ['view', 'create', 'update', 'delete', 'approve'] as any[] },
      { resource: AdminResource.VAULT, actions: ['view', 'create', 'update', 'delete'] as any[] },
      { resource: AdminResource.WITHDRAWALS, actions: ['view', 'create', 'update', 'delete', 'approve'] as any[] },
      { resource: AdminResource.DEPOSITS, actions: ['view', 'create', 'update', 'delete'] as any[] },
      { resource: AdminResource.COMPLIANCE, actions: ['view', 'create', 'update', 'delete', 'approve'] as any[] },
      { resource: AdminResource.REPORTS, actions: ['view', 'create', 'update', 'delete'] as any[] },
      { resource: AdminResource.SETTINGS, actions: ['view', 'create', 'update', 'delete'] as any[] },
      { resource: AdminResource.ADMIN_USERS, actions: ['view', 'create', 'update', 'delete'] as any[] }
    ];
  }

  private getOperationsPermissions(): AdminPermission[] {
    return [
      { resource: AdminResource.MEMBERS, actions: ['view', 'update'] as any[] },
      { resource: AdminResource.VAULT, actions: ['view', 'update'] as any[] },
      { resource: AdminResource.WITHDRAWALS, actions: ['view', 'update', 'approve'] as any[] },
      { resource: AdminResource.DEPOSITS, actions: ['view', 'update'] as any[] },
      { resource: AdminResource.COMPLIANCE, actions: ['view', 'update'] as any[] },
      { resource: AdminResource.REPORTS, actions: ['view'] as any[] }
    ];
  }

  private logAdminAction(logData: Omit<AdminAuditLog, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): void {
    // In a real implementation, this would send to the audit service
    const auditLog: AdminAuditLog = {
      ...logData,
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      ipAddress: '127.0.0.1',
      userAgent: 'Mock Browser'
    };

    console.log('Audit Log:', auditLog);
  }
}

export const adminApi = AdminApiService.getInstance();