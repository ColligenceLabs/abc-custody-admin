/**
 * Admin API Hooks
 *
 * Custom React Query hooks for admin operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/adminApi';
import { queryKeys, queryOptions } from '@/lib/queryClient';
import {
  LoginCredentials,
  TwoFactorVerification,
  AdminUser,
  AdminSession,
  AdminAuditLog
} from '@/types/admin';
import { AdminNotification } from '@/types/adminNotification';

// Authentication Hooks
export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginCredentials) => adminApi.login(credentials),
    onSuccess: (data) => {
      console.log('Login successful, requires 2FA:', data.requiresTwoFactor);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

export function useVerifyTwoFactor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (verification: TwoFactorVerification) => adminApi.verifyTwoFactor(verification),
    onSuccess: (data) => {
      // Invalidate session-related queries on successful login
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.session() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.notifications() });
      console.log('2FA verification successful');
    },
    onError: (error) => {
      console.error('2FA verification failed:', error);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionToken: string) => adminApi.logout(sessionToken),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      console.log('Logout successful');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });
}

export function useRefreshSession() {
  return useMutation({
    mutationFn: (sessionToken: string) => adminApi.refreshSession(sessionToken),
    onSuccess: (data) => {
      console.log('Session refreshed, new expiry:', data.expiresAt);
    },
    onError: (error) => {
      console.error('Session refresh failed:', error);
    },
  });
}

// Session Management Hooks
export function useValidateSession(sessionToken: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.admin.session(),
    queryFn: () => adminApi.validateSession(sessionToken),
    enabled: enabled && !!sessionToken,
    ...queryOptions.critical,
    retry: false, // Don't retry session validation
  });
}

export function useCurrentUser(sessionToken: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.admin.session(),
    queryFn: () => adminApi.getCurrentUser(sessionToken),
    enabled: enabled && !!sessionToken,
    ...queryOptions.static, // User data doesn't change often
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.all,
    queryFn: () => adminApi.getAdminUsers(),
    ...queryOptions.static,
  });
}

// Notification Hooks
export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.admin.notifications(),
    queryFn: () => adminApi.getNotifications(),
    ...queryOptions.realtime, // Notifications should be real-time
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: queryKeys.admin.unreadCount(),
    queryFn: () => adminApi.getUnreadNotificationCount(),
    ...queryOptions.realtime, // Real-time count for badges
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => adminApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      // Invalidate notification queries to reflect the change
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.notifications() });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.unreadCount() });
    },
    onError: (error) => {
      console.error('Failed to mark notification as read:', error);
    },
  });
}

// Audit Log Hooks
export function useAuditLogs(filters?: {
  adminId?: string;
  action?: string;
  resource?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(filters),
    queryFn: () => adminApi.getAuditLogs(filters),
    ...queryOptions.list, // List data with pagination
  });
}

// Utility Hooks for Common Patterns
export function useAdminAuth() {
  // This could be used to get the current admin session state
  // from localStorage or context
  const sessionToken = typeof window !== 'undefined'
    ? localStorage.getItem('admin_session_token')
    : null;

  const sessionQuery = useValidateSession(sessionToken || '', !!sessionToken);

  return {
    sessionToken,
    isAuthenticated: sessionQuery.data?.valid || false,
    adminUser: sessionQuery.data?.adminUser,
    session: sessionQuery.data?.session,
    isLoading: sessionQuery.isLoading,
    error: sessionQuery.error,
  };
}

// Real-time notification polling hook
export function useNotificationPolling(enabled: boolean = true) {
  const unreadCountQuery = useUnreadNotificationCount();
  const notificationsQuery = useNotifications();

  // This hook automatically polls for notifications
  return {
    unreadCount: unreadCountQuery.data?.count || 0,
    notifications: notificationsQuery.data || [],
    isLoading: unreadCountQuery.isLoading || notificationsQuery.isLoading,
    error: unreadCountQuery.error || notificationsQuery.error,
    refetch: () => {
      unreadCountQuery.refetch();
      notificationsQuery.refetch();
    },
  };
}