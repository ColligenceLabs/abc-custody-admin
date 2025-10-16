// ============================================================================
// 출금 실행 모니터링 React Query Hooks (Task 4.4)
// ============================================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  WithdrawalExecution,
  ExecutionStatistics,
  NetworkStatus,
  ExecutionFilter,
  ExecutionSort,
  BroadcastTransactionRequest,
  BroadcastTransactionResponse,
  ConfirmationStatusResponse,
  RetryBroadcastRequest,
  ExecutionListResponse,
} from "@/types/withdrawal";
import * as executionApi from "@/services/executionApi";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// Query Keys
// ============================================================================

export const executionKeys = {
  all: ["executions"] as const,
  lists: () => [...executionKeys.all, "list"] as const,
  list: (filter?: ExecutionFilter, sort?: ExecutionSort, page?: number) =>
    [...executionKeys.lists(), { filter, sort, page }] as const,
  details: () => [...executionKeys.all, "detail"] as const,
  detail: (id: string) => [...executionKeys.details(), id] as const,
  statistics: () => [...executionKeys.all, "statistics"] as const,
  networkStatus: () => [...executionKeys.all, "networkStatus"] as const,
  confirmation: (txHash: string) =>
    [...executionKeys.all, "confirmation", txHash] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * 1. 출금 실행 목록 조회 (필터, 정렬, 페이징)
 */
export function useExecutions(
  filter?: ExecutionFilter,
  sort?: ExecutionSort,
  page = 1,
  pageSize = 20
) {
  return useQuery<ExecutionListResponse>({
    queryKey: executionKeys.list(filter, sort, page),
    queryFn: () => executionApi.getExecutions(filter, sort, page, pageSize),
    staleTime: 10000, // 10초마다 자동 갱신
  });
}

/**
 * 2. 단일 출금 실행 상세 조회
 */
export function useExecutionDetail(executionId: string) {
  return useQuery<WithdrawalExecution>({
    queryKey: executionKeys.detail(executionId),
    queryFn: () => executionApi.getExecutionById(executionId),
    enabled: !!executionId,
    staleTime: 10000, // 10초마다 자동 갱신
  });
}

/**
 * 3. 출금 실행 통계 조회
 */
export function useExecutionStatistics() {
  return useQuery<ExecutionStatistics>({
    queryKey: executionKeys.statistics(),
    queryFn: executionApi.getExecutionStatistics,
    staleTime: 10000, // 10초마다 자동 갱신
  });
}

/**
 * 4. 네트워크 상태 조회
 */
export function useNetworkStatus() {
  return useQuery<NetworkStatus[]>({
    queryKey: executionKeys.networkStatus(),
    queryFn: executionApi.getNetworkStatus,
    staleTime: 30000, // 30초마다 자동 갱신
  });
}

/**
 * 5. 컨펌 상태 조회 (실시간 추적)
 */
export function useConfirmationStatus(txHash?: string) {
  return useQuery<ConfirmationStatusResponse>({
    queryKey: executionKeys.confirmation(txHash || ""),
    queryFn: () => executionApi.getConfirmationStatus(txHash!),
    enabled: !!txHash,
    refetchInterval: 10000, // 10초마다 폴링
    staleTime: 10000,
  });
}

/**
 * 6. 트랜잭션 브로드캐스트
 */
export function useBroadcastTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    BroadcastTransactionResponse,
    Error,
    BroadcastTransactionRequest
  >({
    mutationFn: executionApi.broadcastTransaction,
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "브로드캐스트 성공",
          description: `트랜잭션이 성공적으로 브로드캐스트되었습니다. TxHash: ${data.txHash?.substring(0, 10)}...`,
        });

        // 모든 실행 목록 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: executionKeys.lists() });
        queryClient.invalidateQueries({ queryKey: executionKeys.statistics() });
      } else {
        toast({
          variant: "destructive",
          title: "브로드캐스트 실패",
          description: data.error || "트랜잭션 브로드캐스트에 실패했습니다.",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "브로드캐스트 오류",
        description: error.message,
      });
    },
  });
}

/**
 * 7. 브로드캐스트 재시도
 */
export function useRetryBroadcast() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<
    BroadcastTransactionResponse,
    Error,
    RetryBroadcastRequest
  >({
    mutationFn: executionApi.retryBroadcast,
    onSuccess: (data, variables) => {
      if (data.success) {
        toast({
          title: "재시도 성공",
          description: "트랜잭션 브로드캐스트가 성공했습니다.",
        });

        // 해당 실행 상세 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: executionKeys.detail(variables.executionId),
        });
        queryClient.invalidateQueries({ queryKey: executionKeys.lists() });
        queryClient.invalidateQueries({ queryKey: executionKeys.statistics() });
      } else {
        toast({
          variant: "destructive",
          title: "재시도 실패",
          description: data.error || "브로드캐스트 재시도에 실패했습니다.",
        });
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "재시도 오류",
        description: error.message,
      });
    },
  });
}

/**
 * 8. 컨펌 완료 처리
 */
export function useMarkAsConfirmed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<WithdrawalExecution, Error, string>({
    mutationFn: executionApi.markAsConfirmed,
    onSuccess: (data) => {
      toast({
        title: "컨펌 완료",
        description: "출금이 성공적으로 완료되었습니다.",
      });

      // 해당 실행 상세 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: executionKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: executionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: executionKeys.statistics() });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "처리 오류",
        description: error.message,
      });
    },
  });
}

/**
 * 9. 실패 처리
 */
export function useMarkAsFailed() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<WithdrawalExecution, Error, { id: string; reason: string }>(
    {
      mutationFn: ({ id, reason }) => executionApi.markAsFailed(id, reason),
      onSuccess: (data) => {
        toast({
          variant: "destructive",
          title: "실패 처리 완료",
          description: "출금 실행이 실패로 처리되었습니다.",
        });

        // 해당 실행 상세 쿼리 무효화
        queryClient.invalidateQueries({
          queryKey: executionKeys.detail(data.id),
        });
        queryClient.invalidateQueries({ queryKey: executionKeys.lists() });
        queryClient.invalidateQueries({ queryKey: executionKeys.statistics() });
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "처리 오류",
          description: error.message,
        });
      },
    }
  );
}

/**
 * 10. 출금 실행 삭제
 */
export function useDeleteExecution() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<void, Error, string>({
    mutationFn: executionApi.deleteExecution,
    onSuccess: () => {
      toast({
        title: "삭제 완료",
        description: "출금 실행 기록이 삭제되었습니다.",
      });

      // 모든 실행 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: executionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: executionKeys.statistics() });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "삭제 오류",
        description: error.message,
      });
    },
  });
}

/**
 * 11. 네트워크 상태 업데이트 (수동)
 */
export function useUpdateNetworkStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<NetworkStatus[], Error>({
    mutationFn: executionApi.updateNetworkStatus,
    onSuccess: () => {
      toast({
        title: "네트워크 상태 업데이트",
        description: "네트워크 상태가 갱신되었습니다.",
      });

      // 네트워크 상태 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: executionKeys.networkStatus() });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "업데이트 오류",
        description: error.message,
      });
    },
  });
}

/**
 * 12. 실행 목록 자동 갱신 (폴링)
 * - 10초마다 자동으로 실행 목록 갱신
 * - 브로드캐스트 중이거나 컨펌 대기 중인 항목이 있을 때 활성화
 */
export function useExecutionPolling(
  filter?: ExecutionFilter,
  sort?: ExecutionSort,
  page = 1,
  pageSize = 20
) {
  return useQuery<ExecutionListResponse>({
    queryKey: executionKeys.list(filter, sort, page),
    queryFn: () => executionApi.getExecutions(filter, sort, page, pageSize),
    refetchInterval: 10000, // 10초마다 폴링
    staleTime: 10000,
    refetchIntervalInBackground: true, // 백그라운드에서도 폴링
  });
}
