/**
 * Withdrawal Monitoring Page (V2 - Redesigned)
 *
 * 출금 모니터링 페이지 (개선된 7-상태 모델)
 * Hot/Cold 지갑 선택 기능 통합
 * 백엔드 API 연결
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { RequestTable } from "./components/RequestTable";
import { RequestDetailModal } from "./components/RequestDetailModal";
import {
  AssetWalletRatioSection,
} from "./components/AssetWalletRatioSection";
import { PendingWithdrawalAssetsSection } from "./components/PendingWithdrawalAssetsSection";
import { WithdrawalV2Request } from "@/types/withdrawalV2";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { withdrawalV2Api } from "@/services/withdrawalV2Api";
import { useToast } from "@/hooks/use-toast";
import { useAdminWithdrawalSocket } from "@/hooks/useAdminWithdrawalSocket";

export default function WithdrawalRequestsPage() {
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalV2Request | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 출금 요청 목록 상태
  const [requests, setRequests] = useState<WithdrawalV2Request[]>([]);

  // 백엔드에서 출금 목록 조회
  const fetchWithdrawals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await withdrawalV2Api.getWithdrawalsFromBackend({
        _sort: 'initiatedAt',
        _order: 'desc',
        _limit: 100,
      });
      setRequests(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '출금 목록 조회 실패';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: '조회 실패',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // WebSocket 실시간 업데이트
  const handleWithdrawalUpdate = useCallback((updatedWithdrawal: any) => {
    console.log('관리자 페이지 출금 업데이트 받음:', updatedWithdrawal);

    // 백엔드 데이터를 프론트엔드 형식으로 변환
    const transformedWithdrawal = withdrawalV2Api.transformBackendData(updatedWithdrawal);

    setRequests((prevRequests) => {
      const index = prevRequests.findIndex(r => r.id === transformedWithdrawal.id);

      if (index !== -1) {
        // 기존 출금 업데이트
        const newRequests = [...prevRequests];
        newRequests[index] = transformedWithdrawal;
        return newRequests;
      } else {
        // 새 출금 추가
        return [transformedWithdrawal, ...prevRequests];
      }
    });

    // 상세 모달이 열려있고 같은 출금인 경우 상세 정보도 업데이트
    setSelectedRequest((prevSelected) => {
      if (prevSelected && prevSelected.id === transformedWithdrawal.id) {
        return transformedWithdrawal;
      }
      return prevSelected;
    });
  }, []);

  // WebSocket 연결
  useAdminWithdrawalSocket({
    onWithdrawalUpdate: handleWithdrawalUpdate,
  });

  const handleRefresh = () => {
    fetchWithdrawals();
  };

  const handleView = (request: WithdrawalV2Request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleApproveWithHot = async (requestId: string, hotCheck: any) => {
    try {
      const updated = await withdrawalV2Api.approveWithHotWalletBackend(requestId, hotCheck);

      // 로컬 상태 업데이트
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? updated : r))
      );

      toast({
        description: `Hot 지갑 출금 승인 완료: ${requestId}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      toast({
        variant: 'destructive',
        title: 'Hot 지갑 출금 실패',
        description: errorMessage,
      });
    }
  };

  const handleApproveWithCold = async (requestId: string, coldInfo: any) => {
    try {
      const updated = await withdrawalV2Api.approveWithColdWalletBackend(requestId, coldInfo);

      // 로컬 상태 업데이트
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? updated : r))
      );

      toast({
        description: `Cold 지갑 출금 승인 완료: ${requestId}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      toast({
        variant: 'destructive',
        title: 'Cold 지갑 출금 실패',
        description: errorMessage,
      });
    }
  };

  const handleRejectRequest = async (requestId: string, reason: string) => {
    try {
      const updated = await withdrawalV2Api.rejectWithdrawalBackend(requestId, reason);

      // 로컬 상태 업데이트
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? updated : r))
      );

      toast({
        description: `출금 거부 완료: ${requestId}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
      toast({
        variant: 'destructive',
        title: '출금 거부 실패',
        description: errorMessage,
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">출금 모니터링</h1>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          새로고침
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {/* 자산별 Hot/Cold 지갑 비율 */}
      <AssetWalletRatioSection />

      {/* 승인 대기 중인 출금 자산 */}
      <PendingWithdrawalAssetsSection requests={requests} />

      {/* 출금 요청 테이블 */}
      {isLoading && requests.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">출금 목록을 불러오는 중...</span>
        </div>
      ) : (
        <RequestTable requests={requests} onView={handleView} />
      )}

      {/* 상세 정보 모달 (모든 상태 지원) */}
      <RequestDetailModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApproveHot={handleApproveWithHot}
        onApproveCold={handleApproveWithCold}
        onReject={handleRejectRequest}
      />
    </div>
  );
}
