/**
 * Compliance API Hooks
 *
 * Custom React Query hooks for AML, Travel Rule, and compliance operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { complianceApi } from '@/services/complianceApi';
import { queryKeys, queryOptions } from '@/lib/queryClient';
import {
  AMLCheck,
  TravelRuleCheckAPI as TravelRuleCheck,
  ComplianceReport,
  SuspiciousTransaction,
  BlacklistAddress,
  RiskAssessment
} from '@/types/compliance';

// AML Screening Hooks
export function usePerformAMLScreening() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData: {
      fromAddress: string;
      toAddress: string;
      amount: string;
      currency: string;
      transactionHash?: string;
    }) => complianceApi.performAMLScreening(transactionData),
    onSuccess: () => {
      // Invalidate AML checks to include the new screening
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.amlChecks() });
    },
    onError: (error) => {
      console.error('Failed to perform AML screening:', error);
    },
  });
}

export function useAMLChecks(filters?: {
  status?: AMLCheck['status'];
  riskLevel?: AMLCheck['riskLevel'];
  manualReview?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.compliance.amlChecks(filters),
    queryFn: () => complianceApi.getAMLChecks(filters),
    ...queryOptions.list,
  });
}

export function useUpdateAMLCheckStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkId,
      status,
      reviewNotes,
      reviewedBy
    }: {
      checkId: string;
      status: AMLCheck['status'];
      reviewNotes?: string;
      reviewedBy?: string;
    }) => complianceApi.updateAMLCheckStatus(checkId, status, reviewNotes, reviewedBy),
    onSuccess: () => {
      // Invalidate AML checks
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.amlChecks() });
    },
    onError: (error) => {
      console.error('Failed to update AML check status:', error);
    },
  });
}

// Travel Rule Hooks
export function useCheckTravelRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData: {
      amount: string;
      amountInKRW: string;
      fromAddress: string;
      toAddress: string;
      originatorInfo?: any;
    }) => complianceApi.checkTravelRule(transactionData),
    onSuccess: () => {
      // Invalidate Travel Rule checks
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.travelRuleChecks() });
    },
    onError: (error) => {
      console.error('Failed to check Travel Rule:', error);
    },
  });
}

export function useTravelRuleChecks(filters?: {
  complianceStatus?: string;
  requiresReturn?: boolean;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.compliance.travelRuleChecks(filters),
    queryFn: () => complianceApi.getTravelRuleChecks(filters),
    ...queryOptions.list,
  });
}

// Suspicious Transaction Hooks
export function useSuspiciousTransactions(filters?: {
  status?: SuspiciousTransaction['status'];
  reportStatus?: SuspiciousTransaction['reportStatus'];
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.compliance.suspiciousTransactions(filters),
    queryFn: () => complianceApi.getSuspiciousTransactions(filters),
    ...queryOptions.list,
  });
}

export function useCreateSTRReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      reason,
      description
    }: {
      transactionId: string;
      reason: string;
      description: string;
    }) => complianceApi.createSTRReport(transactionId, reason, description),
    onSuccess: () => {
      // Invalidate suspicious transactions and compliance reports
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.suspiciousTransactions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.reports() });
    },
    onError: (error) => {
      console.error('Failed to create STR report:', error);
    },
  });
}

export function useSubmitSTRReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => complianceApi.submitSTRReport(reportId),
    onSuccess: () => {
      // Invalidate compliance reports
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.reports() });
    },
    onError: (error) => {
      console.error('Failed to submit STR report:', error);
    },
  });
}

// Blacklist Management Hooks
export function useBlacklistedAddresses(filters?: {
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  source?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.compliance.blacklistedAddresses(filters),
    queryFn: () => complianceApi.getBlacklistedAddresses(filters),
    ...queryOptions.list,
  });
}

export function useAddBlacklistAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (addressData: {
      address: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      reason: string;
      source: string;
    }) => complianceApi.addBlacklistAddress(addressData),
    onSuccess: () => {
      // Invalidate blacklisted addresses
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.blacklistedAddresses() });
    },
    onError: (error) => {
      console.error('Failed to add blacklist address:', error);
    },
  });
}

// Compliance Reports Hooks
export function useComplianceReports(type?: ComplianceReport['type']) {
  return useQuery({
    queryKey: queryKeys.compliance.reports(type),
    queryFn: () => complianceApi.getComplianceReports(type),
    ...queryOptions.list,
  });
}

export function useGenerateComplianceReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reportType,
      period
    }: {
      reportType: ComplianceReport['type'];
      period: { startDate: string; endDate: string };
    }) => complianceApi.generateComplianceReport(reportType, period),
    onSuccess: () => {
      // Invalidate compliance reports
      queryClient.invalidateQueries({ queryKey: queryKeys.compliance.reports() });
    },
    onError: (error) => {
      console.error('Failed to generate compliance report:', error);
    },
  });
}

// Risk Assessment Hooks
export function usePerformRiskAssessment() {
  return useMutation({
    mutationFn: (entityData: {
      type: 'member' | 'transaction' | 'address';
      entityId: string;
      data: any;
    }) => complianceApi.performRiskAssessment(entityData),
    onError: (error) => {
      console.error('Failed to perform risk assessment:', error);
    },
  });
}

// Utility Hooks
export function useComplianceOverview() {
  const amlChecksQuery = useAMLChecks({ limit: 100 });
  const travelRuleChecksQuery = useTravelRuleChecks({ limit: 100 });
  const suspiciousTransactionsQuery = useSuspiciousTransactions({ limit: 50 });
  const complianceReportsQuery = useComplianceReports();

  const amlChecks = amlChecksQuery.data?.checks || [];
  const travelRuleChecks = travelRuleChecksQuery.data?.checks || [];
  const suspiciousTransactions = suspiciousTransactionsQuery.data?.transactions || [];

  // Calculate statistics
  const amlStats = {
    total: amlChecks.length,
    approved: amlChecks.filter(check => check.status === 'approved').length,
    flagged: amlChecks.filter(check => check.status === 'flagged').length,
    underReview: amlChecks.filter(check => check.status === 'under_review').length,
    rejected: amlChecks.filter(check => check.status === 'rejected').length,
  };

  const travelRuleStats = {
    total: travelRuleChecks.length,
    violations: travelRuleChecks.filter(check => check.complianceStatus === 'violation').length,
    compliant: travelRuleChecks.filter(check => check.complianceStatus === 'compliant').length,
    requiresReturn: travelRuleChecks.filter(check => check.requiresReturn).length,
  };

  return {
    amlStats,
    travelRuleStats,
    suspiciousCount: suspiciousTransactions.length,
    reportsCount: complianceReportsQuery.data?.length || 0,
    isLoading: amlChecksQuery.isLoading || travelRuleChecksQuery.isLoading,
    error: amlChecksQuery.error || travelRuleChecksQuery.error,
  };
}

export function useComplianceCounts() {
  const amlChecksQuery = useAMLChecks({ manualReview: true, limit: 1000 });
  const travelRuleChecksQuery = useTravelRuleChecks({ requiresReturn: true, limit: 1000 });
  const suspiciousTransactionsQuery = useSuspiciousTransactions({
    reportStatus: 'pending',
    limit: 1000
  });

  return {
    pendingAMLReviews: amlChecksQuery.data?.totalCount || 0,
    travelRuleViolations: travelRuleChecksQuery.data?.totalCount || 0,
    pendingSTRReports: suspiciousTransactionsQuery.data?.totalCount || 0,
    isLoading: amlChecksQuery.isLoading || travelRuleChecksQuery.isLoading,
    error: amlChecksQuery.error || travelRuleChecksQuery.error,
  };
}

// Real-time compliance monitoring hook
export function useComplianceMonitoring(enabled: boolean = true) {
  const complianceOverview = useComplianceOverview();
  const complianceCounts = useComplianceCounts();

  return {
    ...complianceOverview,
    ...complianceCounts,
    totalPendingItems: (complianceCounts.pendingAMLReviews || 0) +
                      (complianceCounts.travelRuleViolations || 0) +
                      (complianceCounts.pendingSTRReports || 0),
    refetch: () => {
      // Note: Individual query refetch would be implemented in specific hooks
      console.log('Compliance data refetch requested');
    },
  };
}