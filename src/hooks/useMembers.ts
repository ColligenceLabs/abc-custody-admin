/**
 * Member API Hooks
 *
 * Custom React Query hooks for member and onboarding operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { memberApi } from '@/services/memberApi';
import { queryKeys, queryOptions } from '@/lib/queryClient';
import {
  Member,
  OnboardingApplication as MemberOnboarding,
  CreateMemberRequest,
  UpdateMemberRequest,
  OnboardingApprovalRequest
} from '@/types/member';

// Member Management Hooks
export function useMembers(filters?: {
  status?: Member['status'];
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.members.list(filters),
    queryFn: () => memberApi.getMembers(filters),
    ...queryOptions.list,
  });
}

export function useMember(memberId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.members.detail(memberId),
    queryFn: () => memberApi.getMemberById(memberId),
    enabled: enabled && !!memberId,
    ...queryOptions.static,
  });
}

export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberData: CreateMemberRequest) => memberApi.createMember(memberData),
    onSuccess: () => {
      // Invalidate member list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.statistics() });
    },
    onError: (error) => {
      console.error('Failed to create member:', error);
    },
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, updates }: { memberId: string; updates: UpdateMemberRequest }) =>
      memberApi.updateMember(memberId, updates),
    onSuccess: (updatedMember) => {
      // Update specific member query
      queryClient.setQueryData(
        queryKeys.members.detail(updatedMember.id),
        updatedMember
      );
      // Invalidate member list
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (error) => {
      console.error('Failed to update member:', error);
    },
  });
}

export function useSuspendMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, reason }: { memberId: string; reason: string }) =>
      memberApi.suspendMember(memberId, reason),
    onSuccess: (_, { memberId }) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(memberId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.statistics() });
    },
    onError: (error) => {
      console.error('Failed to suspend member:', error);
    },
  });
}

export function useReactivateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => memberApi.reactivateMember(memberId),
    onSuccess: (_, memberId) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(memberId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.statistics() });
    },
    onError: (error) => {
      console.error('Failed to reactivate member:', error);
    },
  });
}

// Member Asset Hooks
export function useMemberAssets(memberId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.members.assets(memberId),
    queryFn: () => memberApi.getMemberAssets(memberId),
    enabled: enabled && !!memberId,
    ...queryOptions.dashboard, // Assets data should be relatively fresh
  });
}

export function useAddMemberAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, assetSymbol }: { memberId: string; assetSymbol: string }) =>
      memberApi.addMemberAsset(memberId, assetSymbol),
    onSuccess: (_, { memberId }) => {
      // Invalidate member assets
      queryClient.invalidateQueries({ queryKey: queryKeys.members.assets(memberId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(memberId) });
    },
    onError: (error) => {
      console.error('Failed to add member asset:', error);
    },
  });
}

export function useRemoveMemberAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, assetSymbol }: { memberId: string; assetSymbol: string }) =>
      memberApi.removeMemberAsset(memberId, assetSymbol),
    onSuccess: (_, { memberId }) => {
      // Invalidate member assets
      queryClient.invalidateQueries({ queryKey: queryKeys.members.assets(memberId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.detail(memberId) });
    },
    onError: (error) => {
      console.error('Failed to remove member asset:', error);
    },
  });
}

// Member Address Hooks
export function useMemberAddresses(memberId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.members.addresses(memberId),
    queryFn: () => memberApi.getMemberAddresses(memberId),
    enabled: enabled && !!memberId,
    ...queryOptions.static,
  });
}

export function useFlagSuspiciousAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      addressId,
      reason,
      severity
    }: {
      addressId: string;
      reason: string;
      severity: 'low' | 'medium' | 'high';
    }) => memberApi.flagSuspiciousAddress(addressId, reason, severity),
    onSuccess: () => {
      // Invalidate address-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
    },
    onError: (error) => {
      console.error('Failed to flag suspicious address:', error);
    },
  });
}

// Onboarding Hooks
export function useOnboardingApplications(filters?: {
  status?: MemberOnboarding['status'];
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.onboarding.list(filters),
    queryFn: () => memberApi.getOnboardingApplications(filters),
    ...queryOptions.list,
  });
}

export function usePendingOnboarding() {
  return useQuery({
    queryKey: queryKeys.onboarding.pending(),
    queryFn: () => memberApi.getPendingOnboarding(),
    ...queryOptions.realtime, // Pending onboarding should be real-time
  });
}

export function useOnboardingApplication(onboardingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.onboarding.detail(onboardingId),
    queryFn: () => memberApi.getOnboardingById(onboardingId),
    enabled: enabled && !!onboardingId,
    ...queryOptions.static,
  });
}

export function useApproveOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      onboardingId,
      approvalData
    }: {
      onboardingId: string;
      approvalData: OnboardingApprovalRequest;
    }) => memberApi.approveOnboarding(onboardingId, approvalData),
    onSuccess: (_, { onboardingId }) => {
      // Invalidate onboarding queries
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.detail(onboardingId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.members.statistics() });
    },
    onError: (error) => {
      console.error('Failed to approve onboarding:', error);
    },
  });
}

export function useRejectOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ onboardingId, reason }: { onboardingId: string; reason: string }) =>
      memberApi.rejectOnboarding(onboardingId, reason),
    onSuccess: (_, { onboardingId }) => {
      // Invalidate onboarding queries
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.detail(onboardingId) });
    },
    onError: (error) => {
      console.error('Failed to reject onboarding:', error);
    },
  });
}

export function useRequestAdditionalDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      onboardingId,
      requiredDocuments,
      message
    }: {
      onboardingId: string;
      requiredDocuments: string[];
      message: string;
    }) => memberApi.requestAdditionalDocuments(onboardingId, requiredDocuments, message),
    onSuccess: (_, { onboardingId }) => {
      // Invalidate onboarding queries
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.detail(onboardingId) });
    },
    onError: (error) => {
      console.error('Failed to request additional documents:', error);
    },
  });
}

// Statistics Hooks
export function useMemberStatistics() {
  return useQuery({
    queryKey: queryKeys.members.statistics(),
    queryFn: () => memberApi.getMemberStatistics(),
    ...queryOptions.dashboard, // Statistics should refresh regularly
  });
}

// Utility Hooks
export function useOnboardingCounts() {
  const pendingQuery = usePendingOnboarding();
  const statisticsQuery = useMemberStatistics();

  return {
    pendingCount: pendingQuery.data?.length || 0,
    totalMembers: statisticsQuery.data?.totalMembers || 0,
    activeMembers: statisticsQuery.data?.activeMembers || 0,
    suspendedMembers: statisticsQuery.data?.suspendedMembers || 0,
    isLoading: pendingQuery.isLoading || statisticsQuery.isLoading,
    error: pendingQuery.error || statisticsQuery.error,
  };
}