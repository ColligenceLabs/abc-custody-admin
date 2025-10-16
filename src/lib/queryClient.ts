/**
 * React Query Client Configuration
 *
 * Centralized configuration for data fetching, caching, and synchronization
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Cache time: Data stays in cache for 10 minutes after component unmount
      gcTime: 10 * 60 * 1000,

      // Retry failed requests up to 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry for 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },

      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for critical data
      refetchOnWindowFocus: true,

      // Don't refetch on reconnect by default (can be overridden per query)
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },

      // Show loading states for mutations
      onError: (error: any) => {
        console.error('Mutation error:', error);
        // In real app, you might want to show a toast notification here
      },
    },
  },
});

// Query Keys Factory
export const queryKeys = {
  // Admin queries
  admin: {
    all: ['admin'] as const,
    session: () => [...queryKeys.admin.all, 'session'] as const,
    notifications: () => [...queryKeys.admin.all, 'notifications'] as const,
    unreadCount: () => [...queryKeys.admin.all, 'unread-count'] as const,
    auditLogs: (filters?: any) => [...queryKeys.admin.all, 'audit-logs', filters] as const,
  },

  // Member queries
  members: {
    all: ['members'] as const,
    list: (filters?: any) => [...queryKeys.members.all, 'list', filters] as const,
    detail: (memberId: string) => [...queryKeys.members.all, 'detail', memberId] as const,
    assets: (memberId: string) => [...queryKeys.members.all, 'assets', memberId] as const,
    addresses: (memberId: string) => [...queryKeys.members.all, 'addresses', memberId] as const,
    statistics: () => [...queryKeys.members.all, 'statistics'] as const,
  },

  // Onboarding queries
  onboarding: {
    all: ['onboarding'] as const,
    list: (filters?: any) => [...queryKeys.onboarding.all, 'list', filters] as const,
    detail: (onboardingId: string) => [...queryKeys.onboarding.all, 'detail', onboardingId] as const,
    pending: () => [...queryKeys.onboarding.all, 'pending'] as const,
  },

  // Vault queries
  vault: {
    all: ['vault'] as const,
    status: () => [...queryKeys.vault.all, 'status'] as const,
    hotWallet: () => [...queryKeys.vault.all, 'hot-wallet'] as const,
    coldWallet: () => [...queryKeys.vault.all, 'cold-wallet'] as const,
    ratio: () => [...queryKeys.vault.all, 'ratio'] as const,
    alerts: () => [...queryKeys.vault.all, 'alerts'] as const,
    rebalancingHistory: (limit?: number) => [...queryKeys.vault.all, 'rebalancing-history', limit] as const,
    rebalancingStats: () => [...queryKeys.vault.all, 'rebalancing-stats'] as const,
    rebalancingCalculation: () => [...queryKeys.vault.all, 'rebalancing-calculation'] as const,
    statistics: (period: string) => [...queryKeys.vault.all, 'statistics', period] as const,
  },

  // Compliance queries
  compliance: {
    all: ['compliance'] as const,
    amlChecks: (filters?: any) => [...queryKeys.compliance.all, 'aml-checks', filters] as const,
    travelRuleChecks: (filters?: any) => [...queryKeys.compliance.all, 'travel-rule-checks', filters] as const,
    suspiciousTransactions: (filters?: any) => [...queryKeys.compliance.all, 'suspicious-transactions', filters] as const,
    blacklistedAddresses: (filters?: any) => [...queryKeys.compliance.all, 'blacklisted-addresses', filters] as const,
    reports: (type?: string) => [...queryKeys.compliance.all, 'reports', type] as const,
  },
} as const;

// Common query options for different data types
export const queryOptions = {
  // Real-time data (refresh every 15 seconds)
  realtime: {
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
    gcTime: 30 * 1000,
  },

  // Dashboard data (refresh every 30 seconds)
  dashboard: {
    refetchInterval: 30 * 1000,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
  },

  // Static data (refresh rarely)
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000,    // 1 hour
    refetchOnWindowFocus: false,
  },

  // Critical data (always fresh)
  critical: {
    staleTime: 0,
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  },

  // List data with pagination
  list: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
    keepPreviousData: true,    // Keep previous page data while loading new page
  },
} as const;