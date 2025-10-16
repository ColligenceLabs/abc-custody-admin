/**
 * Air-gap Signing Custom React Query Hooks
 * Task 4.3: Air-gap 통신 시스템
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AirGapSigningRequest,
  SigningStatus,
  SigningRequestType,
} from "@/types/vault";
import * as airgapApi from "@/services/airgapApi";

// ============================================================================
// Query Keys
// ============================================================================

export const airgapKeys = {
  all: ["airgap"] as const,
  statistics: () => [...airgapKeys.all, "statistics"] as const,
  queue: (filters?: airgapApi.AirGapFilter) =>
    [...airgapKeys.all, "queue", filters] as const,
  detail: (id: string) => [...airgapKeys.all, "detail", id] as const,
  expired: () => [...airgapKeys.all, "expired"] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Air-gap 통계 조회
 */
export function useAirGapStatistics() {
  return useQuery({
    queryKey: airgapKeys.statistics(),
    queryFn: () => airgapApi.getAirGapStatistics(),
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
}

/**
 * Air-gap 서명 대기열 조회
 */
export function useAirGapQueue(filters?: airgapApi.AirGapFilter) {
  return useQuery({
    queryKey: airgapKeys.queue(filters),
    queryFn: () => airgapApi.getAirGapQueue(filters),
    refetchInterval: 10000, // 10초마다 자동 갱신
  });
}

/**
 * Air-gap 서명 요청 상세 조회
 */
export function useAirGapRequest(requestId: string) {
  return useQuery({
    queryKey: airgapKeys.detail(requestId),
    queryFn: () => airgapApi.getAirGapRequest(requestId),
    enabled: !!requestId,
  });
}

/**
 * 만료된 요청 확인
 */
export function useExpiredRequests() {
  return useQuery({
    queryKey: airgapKeys.expired(),
    queryFn: () => airgapApi.checkExpiredRequests(),
    refetchInterval: 60000, // 1분마다 확인
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * QR 코드 생성
 */
export function useGenerateQR() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: airgapApi.GenerateQRRequest) =>
      airgapApi.generateSigningQR(request),
    onSuccess: (_, variables) => {
      // 해당 요청 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: airgapKeys.detail(variables.requestId),
      });
      // 대기열 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.queue() });
    },
  });
}

/**
 * 서명 스캔 및 검증
 */
export function useScanSignature() {
  return useMutation({
    mutationFn: (request: airgapApi.ScanSignatureRequest) =>
      airgapApi.scanAndVerifySignature(request),
  });
}

/**
 * 서명 추가
 */
export function useAddSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request,
      adminId,
      adminName,
    }: {
      request: airgapApi.AddSignatureRequest;
      adminId: string;
      adminName: string;
    }) => airgapApi.addSignature(request, adminId, adminName),
    onSuccess: (_, variables) => {
      // 통계 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.statistics() });
      // 해당 요청 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: airgapKeys.detail(variables.request.requestId),
      });
      // 대기열 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.queue() });
    },
  });
}

/**
 * 서명 완료 및 브로드캐스트
 */
export function useCompleteAirGapSigning() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      request,
      adminId,
      adminName,
    }: {
      request: airgapApi.CompleteSigningRequest;
      adminId: string;
      adminName: string;
    }) => airgapApi.completeAirGapSigning(request, adminId, adminName),
    onSuccess: (_, variables) => {
      // 통계 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.statistics() });
      // 해당 요청 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: airgapKeys.detail(variables.request.requestId),
      });
      // 대기열 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.queue() });
    },
  });
}

/**
 * 서명 요청 취소
 */
export function useCancelAirGapRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      reason,
      adminId,
      adminName,
    }: {
      requestId: string;
      reason: string;
      adminId: string;
      adminName: string;
    }) => airgapApi.cancelAirGapRequest(requestId, reason, adminId, adminName),
    onSuccess: (_, variables) => {
      // 통계 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.statistics() });
      // 해당 요청 상세 정보 갱신
      queryClient.invalidateQueries({
        queryKey: airgapKeys.detail(variables.requestId),
      });
      // 대기열 갱신
      queryClient.invalidateQueries({ queryKey: airgapKeys.queue() });
    },
  });
}

// ============================================================================
// 복합 Hook: Air-gap Manager
// ============================================================================

/**
 * Air-gap 전체 관리 Hook
 * 모든 기능을 하나로 묶은 통합 Hook
 */
export function useAirGapManager() {
  const statistics = useAirGapStatistics();
  const generateQR = useGenerateQR();
  const scanSignature = useScanSignature();
  const addSignature = useAddSignature();
  const completeSignin = useCompleteAirGapSigning();
  const cancelRequest = useCancelAirGapRequest();

  return {
    // Queries
    statistics,

    // Mutations
    generateQR,
    scanSignature,
    addSignature,
    completeSignin,
    cancelRequest,

    // Helper functions
    isLoading:
      statistics.isLoading ||
      generateQR.isPending ||
      scanSignature.isPending ||
      addSignature.isPending ||
      completeSignin.isPending ||
      cancelRequest.isPending,

    hasError:
      statistics.isError ||
      generateQR.isError ||
      scanSignature.isError ||
      addSignature.isError ||
      completeSignin.isError ||
      cancelRequest.isError,
  };
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * 서명 진행률 계산
 */
export function useSignatureProgress(request: AirGapSigningRequest) {
  const percentage = Math.round(
    (request.obtainedSignatures / request.requiredSignatures) * 100
  );

  const label = `${request.obtainedSignatures}/${request.requiredSignatures}`;

  const isComplete = request.obtainedSignatures >= request.requiredSignatures;
  const isPartial =
    request.obtainedSignatures > 0 &&
    request.obtainedSignatures < request.requiredSignatures;
  const isPending = request.obtainedSignatures === 0;

  return {
    percentage,
    label,
    isComplete,
    isPartial,
    isPending,
  };
}

/**
 * 만료 시간 표시
 */
export function useExpirationDisplay(expiresAt: Date) {
  const now = new Date();
  const diff = new Date(expiresAt).getTime() - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  const isExpired = diff <= 0;
  const isExpiringSoon = hours <= 6 && !isExpired;
  const isCritical = hours <= 2 && !isExpired;

  const display = isExpired
    ? "만료됨"
    : hours > 0
    ? `${hours}시간 ${minutes}분 남음`
    : `${minutes}분 남음`;

  return {
    hours,
    minutes,
    isExpired,
    isExpiringSoon,
    isCritical,
    display,
  };
}

/**
 * 서명 상태 색상 매핑
 */
export function useSigningStatusColor(status: SigningStatus) {
  const colorMap: Record<SigningStatus, string> = {
    [SigningStatus.PENDING]: "yellow",
    [SigningStatus.PARTIAL]: "blue",
    [SigningStatus.COMPLETED]: "green",
    [SigningStatus.EXPIRED]: "gray",
    [SigningStatus.CANCELLED]: "red",
  };

  return colorMap[status] || "gray";
}

/**
 * 서명 유형 표시
 */
export function useSigningTypeDisplay(type: SigningRequestType) {
  const displayMap: Record<SigningRequestType, { label: string; color: string }> = {
    [SigningRequestType.REBALANCING]: {
      label: "리밸런싱",
      color: "blue",
    },
    [SigningRequestType.EMERGENCY_WITHDRAWAL]: {
      label: "긴급출금",
      color: "red",
    },
    [SigningRequestType.MAINTENANCE]: {
      label: "유지보수",
      color: "purple",
    },
  };

  return displayMap[type] || { label: type, color: "gray" };
}
