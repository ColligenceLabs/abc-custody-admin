"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  WithdrawalManagementProps,
  IndividualWithdrawalRequest,
  IndividualWithdrawalFormData,
} from "@/types/withdrawal";
import { CreateIndividualWithdrawalModal } from "./withdrawal/CreateIndividualWithdrawalModal";
import WithdrawalHistoryTable from "./withdrawal/WithdrawalHistoryTable";
import WithdrawalDetailModal from "./withdrawal/WithdrawalDetailModal";
import { individualNetworkAssets } from "@/data/individualWithdrawalMockData";
import {
  getIndividualWithdrawals,
  createWithdrawal,
  cancelWithdrawal,
} from "@/lib/api/withdrawal";
import { getAddresses } from "@/lib/api/addresses";
import { WhitelistedAddress } from "@/types/address";
import { useToast } from "@/hooks/use-toast";
import { useWithdrawalSocket } from "@/hooks/useWithdrawalSocket";

export default function IndividualWithdrawalManagement({
  plan,
  initialTab,
}: WithdrawalManagementProps) {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWithdrawalForDetail, setSelectedWithdrawalForDetail] =
    useState<IndividualWithdrawalRequest | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState<IndividualWithdrawalFormData>({
    title: "",
    fromAddress: "",
    toAddress: "",
    amount: 0,
    network: "",
    currency: "",
    description: "",
  });

  const resetNewRequest = () => {
    setNewRequest({
      title: "",
      fromAddress: "",
      toAddress: "",
      amount: 0,
      network: "",
      currency: "",
      description: "",
    });
  };

  // API 상태 관리
  const [withdrawals, setWithdrawals] = useState<IndividualWithdrawalRequest[]>(
    []
  );
  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // 출금 목록 가져오기 함수 (서버 사이드 페이징)
  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await getIndividualWithdrawals({
        _page: currentPage,
        _limit: itemsPerPage,
      });
      setWithdrawals(response.data as unknown as IndividualWithdrawalRequest[]);
      setTotalItems(response.total);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "출금 목록을 불러오는데 실패했습니다."
      );
      console.error("출금 목록 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  // 초기 데이터 로딩 및 페이지 변경 시 재로딩
  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage]);

  // WebSocket 실시간 업데이트
  const handleWithdrawalUpdate = useCallback((updatedWithdrawal: any) => {
    console.log("출금 업데이트 받음:", updatedWithdrawal);

    setWithdrawals((prevWithdrawals) => {
      const index = prevWithdrawals.findIndex(
        (w) => w.id === updatedWithdrawal.id
      );

      if (index !== -1) {
        // 기존 출금 업데이트
        const newWithdrawals = [...prevWithdrawals];
        newWithdrawals[index] = updatedWithdrawal;
        return newWithdrawals;
      } else {
        // 새 출금 추가
        return [updatedWithdrawal, ...prevWithdrawals];
      }
    });

    // 상세 모달이 열려있고 같은 출금인 경우 상세 정보도 업데이트
    setSelectedWithdrawalForDetail((prevDetail) => {
      if (prevDetail && prevDetail.id === updatedWithdrawal.id) {
        return updatedWithdrawal;
      }
      return prevDetail;
    });
  }, []);

  // WebSocket 연결
  useWithdrawalSocket({
    userId: user?.id || null,
    onWithdrawalUpdate: handleWithdrawalUpdate,
  });

  // 사용자별 주소 가져오기
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) return;

      try {
        const userAddresses = await getAddresses({ userId: user.id });
        console.log("API 응답 - 주소 목록:", userAddresses);
        console.log("현재 사용자 ID:", user.id);
        setAddresses(userAddresses);
      } catch (err) {
        console.error("주소 목록 조회 실패:", err);
      }
    };

    fetchAddresses();
  }, [user?.id]);

  const handleCreateRequest = async () => {
    try {
      // fromAddress가 비어있으면 사용자의 첫 번째 입금 주소 사용
      let fromAddress = newRequest.fromAddress;
      if (!fromAddress) {
        // 임시: 개인 출금의 경우 시스템 자동 설정
        fromAddress = "개인지갑";
      }

      const withdrawalData = {
        id: `IND-${Date.now()}`,
        title: newRequest.title,
        fromAddress: fromAddress,
        toAddress: newRequest.toAddress,
        amount: newRequest.amount,
        currency: newRequest.currency as any,
        network: newRequest.network,
        userId: user?.id || "0",
        memberType: "individual" as const,
        groupId: "",
        initiator: user?.name || "사용자",
        status: "withdrawal_wait" as const,
        priority: "medium" as const,
        description: newRequest.description,
        requiredApprovals: [],
        approvals: [],
        rejections: [],
      };

      await createWithdrawal(withdrawalData);

      const response = await getIndividualWithdrawals();
      setWithdrawals(response.data as unknown as IndividualWithdrawalRequest[]);

      setShowCreateModal(false);
      resetNewRequest();

      toast({
        description: "출금 신청이 성공적으로 접수되었습니다.",
      });
    } catch (err) {
      console.error("출금 신청 실패:", err);
      toast({
        variant: "destructive",
        description:
          err instanceof Error ? err.message : "출금 신청에 실패했습니다.",
      });
    }
  };

  // 취소 확인 핸들러
  const handleCancelConfirm = async (requestId: string, reason: string) => {
    try {
      // API 호출하여 출금 중지
      await cancelWithdrawal(requestId, reason);

      // 성공 시 목록 새로고침
      await fetchWithdrawals();

      // 상세보기가 열려있으면 닫기
      if (selectedWithdrawalForDetail?.id === requestId) {
        setSelectedWithdrawalForDetail(null);
      }

      // 성공 메시지
      toast({
        description: "출금이 정지되었습니다.",
      });
    } catch (error: any) {
      console.error("출금 중지 실패:", error);
      toast({
        variant: "destructive",
        description:
          "출금 중지에 실패했습니다: " + (error.message || "알 수 없는 오류"),
      });
    }
  };

  if (plan !== "enterprise" && plan !== "individual") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            출금 관리 시스템
          </h3>
          <p className="text-gray-500 mb-4">
            출금 관리는 가입한 플랜에서만 사용 가능한 기능입니다
          </p>
        </div>
      </div>
    );
  }

  // 로딩 상태 렌더링
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">출금 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">오류: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">출금 관리</h1>
          <p className="text-gray-600 mt-1">간편하고 안전한 개인 출금 시스템</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            출금 신청
          </button>
        </div>
      </div>

      {/* 통합 출금 히스토리 테이블 */}
      <WithdrawalHistoryTable
        withdrawals={withdrawals}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onViewDetails={(withdrawal) => setSelectedWithdrawalForDetail(withdrawal)}
      />

      {/* 출금 상세 모달 */}
      <WithdrawalDetailModal
        withdrawal={selectedWithdrawalForDetail}
        isOpen={!!selectedWithdrawalForDetail}
        onClose={() => setSelectedWithdrawalForDetail(null)}
        onCancel={handleCancelConfirm}
      />

      {/* 출금 신청 모달 */}
      <CreateIndividualWithdrawalModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetNewRequest();
        }}
        onSubmit={handleCreateRequest}
        newRequest={newRequest}
        onRequestChange={setNewRequest}
        networkAssets={individualNetworkAssets}
        whitelistedAddresses={addresses}
      />

      {/* 하단 여백 추가 */}
      <div className="pb-8"></div>
    </div>
  );
}
