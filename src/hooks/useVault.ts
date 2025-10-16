/**
 * Vault API Hooks
 *
 * Custom React Query hooks for vault operations, rebalancing, and Air-gap signing
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { vaultApi } from '@/services/vaultApi';
import { queryKeys, queryOptions } from '@/lib/queryClient';
import {
  VaultStatus,
  RebalancingRequest,
  RebalancingFilter,
  AirGapSigningRequest,
  SignedTransaction
} from '@/types/vault';

// Vault Status Hooks
export function useVaultStatus() {
  return useQuery({
    queryKey: queryKeys.vault.status(),
    queryFn: () => vaultApi.getVaultStatus(),
    ...queryOptions.realtime, // Vault status should be real-time
  });
}

export function useHotWalletBalance() {
  return useQuery({
    queryKey: queryKeys.vault.hotWallet(),
    queryFn: () => vaultApi.getHotWalletBalance(),
    ...queryOptions.realtime,
  });
}

export function useColdWalletBalance() {
  return useQuery({
    queryKey: queryKeys.vault.coldWallet(),
    queryFn: () => vaultApi.getColdWalletBalance(),
    ...queryOptions.realtime,
  });
}

export function useHotColdRatio() {
  return useQuery({
    queryKey: queryKeys.vault.ratio(),
    queryFn: () => vaultApi.getHotColdRatio(),
    ...queryOptions.realtime,
  });
}

export function useUpdateVaultStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<VaultStatus>) => vaultApi.updateVaultStatus(updates),
    onSuccess: () => {
      // Invalidate all vault-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
    onError: (error) => {
      console.error('Failed to update vault status:', error);
    },
  });
}

// Vault Alerts Hooks
export function useVaultAlerts() {
  return useQuery({
    queryKey: queryKeys.vault.alerts(),
    queryFn: () => vaultApi.getVaultAlerts(),
    ...queryOptions.realtime, // Alerts should be real-time
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => vaultApi.resolveAlert(alertId),
    onSuccess: () => {
      // Invalidate alerts query
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.alerts() });
    },
    onError: (error) => {
      console.error('Failed to resolve alert:', error);
    },
  });
}

// Rebalancing Hooks
export function useRebalancingHistory(limit: number = 50) {
  return useQuery({
    queryKey: queryKeys.vault.rebalancingHistory(limit),
    queryFn: () => vaultApi.getRebalancingHistory(limit),
    ...queryOptions.list,
  });
}

export function useCalculateRebalancingAmount() {
  return useMutation({
    mutationFn: (targetRatio: { hot: number; cold: number }) =>
      vaultApi.calculateRebalancingAmount(targetRatio),
    onError: (error) => {
      console.error('Failed to calculate rebalancing amount:', error);
    },
  });
}

export function useInitiateRebalancing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RebalancingRequest) => vaultApi.initiateRebalancing(request),
    onSuccess: () => {
      // Invalidate vault and rebalancing queries
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.rebalancingHistory() });
    },
    onError: (error) => {
      console.error('Failed to initiate rebalancing:', error);
    },
  });
}

// Air-gap Signing Hooks
export function useGenerateUnsignedTransaction() {
  return useMutation({
    mutationFn: (request: AirGapSigningRequest) => vaultApi.generateUnsignedTransaction(request),
    onError: (error) => {
      console.error('Failed to generate unsigned transaction:', error);
    },
  });
}

export function useSubmitSignedTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (signedTx: SignedTransaction) => vaultApi.submitSignedTransaction(signedTx),
    onSuccess: () => {
      // Invalidate vault status after transaction submission
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
    },
    onError: (error) => {
      console.error('Failed to submit signed transaction:', error);
    },
  });
}

export function useTransactionStatus(transactionHash: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['transaction-status', transactionHash],
    queryFn: () => vaultApi.getTransactionStatus(transactionHash),
    enabled: enabled && !!transactionHash,
    ...queryOptions.realtime, // Transaction status should be real-time
    refetchInterval: 5000, // Poll every 5 seconds
  });
}

// Statistics Hooks
export function useVaultStatistics(period: 'day' | 'week' | 'month') {
  return useQuery({
    queryKey: queryKeys.vault.statistics(period),
    queryFn: () => vaultApi.getVaultStatistics(period),
    ...queryOptions.dashboard,
  });
}

// Real-time Simulation Hook (for development)
export function useSimulateVaultActivity(enabled: boolean = false) {
  return useQuery({
    queryKey: ['vault-simulation'],
    queryFn: () => vaultApi.simulateVaultActivity(),
    enabled,
    refetchInterval: 5000, // Simulate activity every 5 seconds
  });
}

// Utility Hooks
export function useVaultOverview() {
  const vaultStatusQuery = useVaultStatus();
  const alertsQuery = useVaultAlerts();
  const rebalancingHistoryQuery = useRebalancingHistory(10); // Last 10 records

  return {
    vaultStatus: vaultStatusQuery.data,
    alerts: alertsQuery.data || [],
    recentRebalancing: rebalancingHistoryQuery.data || [],
    isLoading: vaultStatusQuery.isLoading || alertsQuery.isLoading,
    error: vaultStatusQuery.error || alertsQuery.error,
    needsRebalancing: vaultStatusQuery.data?.balanceStatus.needsRebalancing || false,
    hotRatio: vaultStatusQuery.data?.balanceStatus.hotRatio || 0,
    coldRatio: vaultStatusQuery.data?.balanceStatus.coldRatio || 0,
    deviation: vaultStatusQuery.data?.balanceStatus.deviation || 0,
  };
}

export function useRebalancingManager() {
  const calculateAmount = useCalculateRebalancingAmount();
  const initiateRebalancing = useInitiateRebalancing();
  const vaultStatus = useVaultStatus();

  const isRebalancingNeeded = vaultStatus.data?.balanceStatus.needsRebalancing || false;
  const currentRatio = {
    hot: vaultStatus.data?.balanceStatus.hotRatio || 0,
    cold: vaultStatus.data?.balanceStatus.coldRatio || 0,
  };

  return {
    isRebalancingNeeded,
    currentRatio,
    calculateAmount: calculateAmount.mutate,
    calculationResult: calculateAmount.data,
    isCalculating: calculateAmount.isPending,
    initiateRebalancing: initiateRebalancing.mutate,
    isInitiating: initiateRebalancing.isPending,
    error: calculateAmount.error || initiateRebalancing.error,
  };
}

export function useAirGapManager() {
  const generateUnsigned = useGenerateUnsignedTransaction();
  const submitSigned = useSubmitSignedTransaction();

  return {
    generateUnsignedTransaction: generateUnsigned.mutate,
    unsignedTransaction: generateUnsigned.data,
    isGenerating: generateUnsigned.isPending,
    submitSignedTransaction: submitSigned.mutate,
    submissionResult: submitSigned.data,
    isSubmitting: submitSigned.isPending,
    error: generateUnsigned.error || submitSigned.error,
  };
}

// Rebalancing Management Hooks (Task 5.2)
export function useRebalancingStats() {
  return useQuery({
    queryKey: queryKeys.vault.rebalancingStats(),
    queryFn: () => vaultApi.getRebalancingStats(),
    ...queryOptions.dashboard,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });
}

export function useFilteredRebalancingHistory(filter?: RebalancingFilter) {
  return useQuery({
    queryKey: ['rebalancing-history-filtered', filter],
    queryFn: () => vaultApi.getFilteredRebalancingHistory(filter),
    ...queryOptions.list,
  });
}

export function useCalculateDetailedRebalancing() {
  return useQuery({
    queryKey: queryKeys.vault.rebalancingCalculation(),
    queryFn: () => vaultApi.calculateDetailedRebalancing(),
    ...queryOptions.dashboard,
  });
}

export function useInitiateRebalancingWithRefresh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RebalancingRequest) => vaultApi.initiateRebalancing(request),
    onSuccess: () => {
      // Invalidate all vault and rebalancing queries
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.vault.rebalancingStats() });
      queryClient.invalidateQueries({ queryKey: ['rebalancing-history-filtered'] });
    },
    onError: (error) => {
      console.error('Failed to initiate rebalancing:', error);
    },
  });
}

export function useRebalancingManagementPanel() {
  const stats = useRebalancingStats();
  const calculation = useCalculateDetailedRebalancing();
  const initiateRebalancing = useInitiateRebalancingWithRefresh();
  const vaultStatus = useVaultStatus();

  return {
    stats: stats.data,
    calculation: calculation.data,
    vaultStatus: vaultStatus.data,
    isLoadingStats: stats.isLoading,
    isLoadingCalculation: calculation.isLoading,
    isLoadingVault: vaultStatus.isLoading,
    initiateRebalancing: initiateRebalancing.mutate,
    isInitiating: initiateRebalancing.isPending,
    initiateSuccess: initiateRebalancing.isSuccess,
    error: stats.error || calculation.error || initiateRebalancing.error,
  };
}