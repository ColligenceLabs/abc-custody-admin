"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  WithdrawalManagementProps,
  IndividualWithdrawalRequest,
  IndividualWithdrawalFormData,
} from "@/types/withdrawal";
import {
  formatAmount,
  formatDateTime,
} from "@/utils/withdrawalHelpers";
import { convertToKRW } from "@/utils/approverAssignment";
import { StatusBadge } from "./withdrawal/StatusBadge";
import { CreateIndividualWithdrawalModal } from "./withdrawal/CreateIndividualWithdrawalModal";
import { CancelWithdrawalModal } from "./withdrawal/CancelWithdrawalModal";
import { ProcessingTableRow } from "./withdrawal/ProcessingTableRow";
import { BlockchainInfo } from "./withdrawal/BlockchainInfo";
import { individualNetworkAssets } from "@/data/individualWithdrawalMockData";
import { getIndividualWithdrawals, createWithdrawal } from "@/lib/api/withdrawal";
import { getAddresses } from "@/lib/api/addresses";
import { WhitelistedAddress } from "@/types/address";

export default function IndividualWithdrawalManagement({
  plan,
  initialTab,
}: WithdrawalManagementProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "history">("requests");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedRequestForCancel, setSelectedRequestForCancel] =
    useState<IndividualWithdrawalRequest | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const { t } = useLanguage();
  const { user } = useAuth();

  // 진행 중인 출금 탭 - 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 출금 히스토리 탭 - 검색 및 필터 상태
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");
  const [historyDateFilter, setHistoryDateFilter] = useState<string>("all");
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyItemsPerPage] = useState(10);

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab && ["history", "requests"].includes(initialTab as string)) {
      setActiveTab(initialTab as "requests" | "history");
    }
  }, [initialTab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: "requests" | "history") => {
    setActiveTab(newTab);
    router.push(`/withdrawal/${newTab}`);
  };

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
  const [withdrawals, setWithdrawals] = useState<IndividualWithdrawalRequest[]>([]);
  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API 데이터 가져오기
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        const response = await getIndividualWithdrawals();
        setWithdrawals(response.data as unknown as IndividualWithdrawalRequest[]);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '출금 목록을 불러오는데 실패했습니다.');
        console.error('출금 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  // 사용자별 주소 가져오기
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.id) return;

      try {
        const userAddresses = await getAddresses({ userId: user.id });
        console.log('API 응답 - 주소 목록:', userAddresses);
        console.log('현재 사용자 ID:', user.id);
        setAddresses(userAddresses);
      } catch (err) {
        console.error('주소 목록 조회 실패:', err);
      }
    };

    fetchAddresses();
  }, [user?.id]);

  const mockRequests = withdrawals;

  const handleCreateRequest = async () => {
    try {
      // fromAddress가 비어있으면 사용자의 첫 번째 입금 주소 사용
      let fromAddress = newRequest.fromAddress;
      if (!fromAddress) {
        // 임시: 개인 출금의 경우 시스템 자동 설정
        fromAddress = '개인지갑';
      }

      const withdrawalData = {
        id: `IND-${Date.now()}`,
        title: newRequest.title,
        fromAddress: fromAddress,
        toAddress: newRequest.toAddress,
        amount: newRequest.amount,
        currency: newRequest.currency as any,
        userId: user?.id || '0',
        memberType: 'individual' as const,
        groupId: '',
        initiator: user?.name || '사용자',
        status: 'pending' as const,
        priority: 'medium' as const,
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

      alert('출금 신청이 성공적으로 접수되었습니다.');
    } catch (err) {
      console.error('출금 신청 실패:', err);
      alert(err instanceof Error ? err.message : '출금 신청에 실패했습니다.');
    }
  };

  // 개인용: 진행 중인 요청과 완료된 요청으로 분류
  const activeRequests = mockRequests.filter(
    (r) => r.status === "pending" || r.status === "processing"
  );
  const completedRequests = mockRequests.filter((r) =>
    ["completed", "rejected", "cancelled"].includes(r.status)
  );

  // 진행 중인 출금 필터링 로직
  const getFilteredActiveRequests = () => {
    return activeRequests.filter((request) => {
      // 상태 필터
      const statusMatch =
        statusFilter === "all" ||
        request.status === statusFilter;

      // 검색어 필터
      const searchMatch =
        searchTerm === "" ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.amount.toString().includes(searchTerm.toLowerCase()) ||
        request.currency.toLowerCase().includes(searchTerm.toLowerCase());

      // 기간 필터
      let dateMatch = true;
      if (dateFilter !== "all") {
        const requestDate = new Date(request.initiatedAt);
        const now = new Date();
        const diffTime = now.getTime() - requestDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            dateMatch = diffDays === 0;
            break;
          case "week":
            dateMatch = diffDays <= 7;
            break;
          case "month":
            dateMatch = diffDays <= 30;
            break;
          case "quarter":
            dateMatch = diffDays <= 90;
            break;
          default:
            dateMatch = true;
        }
      }

      return statusMatch && searchMatch && dateMatch;
    });
  };

  // 페이지네이션 처리
  const getPaginatedActiveRequests = () => {
    const filtered = getFilteredActiveRequests();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    };
  };

  const paginatedData = getPaginatedActiveRequests();

  // 출금 히스토리 필터링 로직
  const getFilteredCompletedRequests = () => {
    return completedRequests.filter((request) => {
      // 상태 필터
      const statusMatch =
        historyStatusFilter === "all" ||
        request.status === historyStatusFilter;

      // 검색어 필터
      const searchMatch =
        historySearchTerm === "" ||
        request.id.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        request.title.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
        request.amount.toString().includes(historySearchTerm.toLowerCase()) ||
        request.currency.toLowerCase().includes(historySearchTerm.toLowerCase());

      // 기간 필터 - 완료 일시 기준
      let dateMatch = true;
      if (historyDateFilter !== "all") {
        const completedDate = request.completedAt
          ? new Date(request.completedAt)
          : request.cancelledAt
          ? new Date(request.cancelledAt)
          : request.rejectedAt
          ? new Date(request.rejectedAt)
          : null;

        if (completedDate) {
          const now = new Date();
          const diffTime = now.getTime() - completedDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          switch (historyDateFilter) {
            case "today":
              dateMatch = diffDays === 0;
              break;
            case "week":
              dateMatch = diffDays <= 7;
              break;
            case "month":
              dateMatch = diffDays <= 30;
              break;
            case "quarter":
              dateMatch = diffDays <= 90;
              break;
            default:
              dateMatch = true;
          }
        }
      }

      return statusMatch && searchMatch && dateMatch;
    });
  };

  // 히스토리 페이지네이션 처리
  const getPaginatedCompletedRequests = () => {
    const filtered = getFilteredCompletedRequests();
    const startIndex = (historyCurrentPage - 1) * historyItemsPerPage;
    const endIndex = startIndex + historyItemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / historyItemsPerPage),
      currentPage: historyCurrentPage,
      itemsPerPage: historyItemsPerPage,
    };
  };

  const paginatedHistoryData = getPaginatedCompletedRequests();

  // 취소 버튼 클릭 핸들러
  const handleCancelClick = (request: IndividualWithdrawalRequest) => {
    setSelectedRequestForCancel(request);
    setShowCancelModal(true);
  };

  // 취소 확인 핸들러
  const handleCancelConfirm = (requestId: string, reason: string) => {
    // 실제로는 API 호출
    console.log("출금 취소:", requestId, "사유:", reason);
    alert(`출금이 취소되었습니다.\n사유: ${reason}`);
    // 상태 업데이트 로직 (실제로는 서버에서 처리 후 리프레시)
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
    <div className="space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">출금 관리</h1>
          <p className="text-gray-600 mt-1">
            간편하고 안전한 개인 출금 시스템
          </p>
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

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            {
              id: "requests",
              name: "진행 중인 출금",
              icon: ClockIcon,
              count: activeRequests.length,
            },
            {
              id: "history",
              name: "출금 히스토리",
              icon: CheckCircleIcon,
              count: completedRequests.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
              {tab.count > 0 && (
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* 진행 중인 출금 탭 */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
                진행 중인 출금 목록
              </h3>
              {/* 검색 및 필터 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 검색 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="신청 ID, 제목, 자산 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* 상태 필터 */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 상태</option>
                  <option value="pending">출금 대기</option>
                  <option value="processing">출금 처리 중</option>
                </select>

                {/* 기간 필터 */}
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 기간</option>
                  <option value="today">오늘</option>
                  <option value="week">최근 7일</option>
                  <option value="month">최근 30일</option>
                  <option value="quarter">최근 3개월</option>
                </select>
              </div>
            </div>
          </div>

          {/* 데이터 표시 영역 */}
          <div className="p-6">
            {paginatedData.totalItems === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <ClockIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                      ? "검색 결과가 없습니다"
                      : "진행 중인 출금이 없습니다"}
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm || statusFilter !== "all" || dateFilter !== "all"
                      ? "다른 검색어나 필터 조건을 시도해보세요."
                      : "출금 신청을 생성하여 시작하세요."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          신청 ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          출금 내용
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          자산
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          진행률/대기순서
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          작업
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.items.map((request) => (
                        <ProcessingTableRow
                          key={request.id}
                          request={request}
                          onToggleDetails={(requestId) =>
                            setSelectedRequestId(
                              selectedRequestId === requestId ? null : requestId
                            )
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {paginatedData.totalPages > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        총 {paginatedData.totalItems}개 중{" "}
                        {Math.min(
                          (paginatedData.currentPage - 1) *
                            paginatedData.itemsPerPage +
                            1,
                          paginatedData.totalItems
                        )}
                        -
                        {Math.min(
                          paginatedData.currentPage * paginatedData.itemsPerPage,
                          paginatedData.totalItems
                        )}
                        개 표시
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.max(1, paginatedData.currentPage - 1)
                            )
                          }
                          disabled={paginatedData.currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>

                        {[...Array(paginatedData.totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          const isCurrentPage =
                            pageNumber === paginatedData.currentPage;

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setCurrentPage(pageNumber)}
                              className={`px-3 py-1 text-sm border rounded-md ${
                                isCurrentPage
                                  ? "bg-primary-600 text-white border-primary-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(
                                paginatedData.totalPages,
                                paginatedData.currentPage + 1
                              )
                            )
                          }
                          disabled={
                            paginatedData.currentPage === paginatedData.totalPages
                          }
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* 상세 정보 패널 */}
      {activeTab === "requests" && selectedRequestId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {(() => {
            const request = activeRequests.find(
              (r) => r.id === selectedRequestId
            );
            if (!request) return null;

            // 남은 시간 계산
            const calculateRemainingTime = () => {
              if (!request.processingScheduledAt) return "24시간";

              const scheduledTime = new Date(request.processingScheduledAt);
              const now = new Date();
              const diffMs = scheduledTime.getTime() - now.getTime();

              if (diffMs > 0) {
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                const diffMinutes = Math.floor(
                  (diffMs % (1000 * 60 * 60)) / (1000 * 60)
                );

                if (diffHours >= 24) {
                  return "24시간";
                } else if (diffHours > 0) {
                  return `${diffHours}시간 ${diffMinutes}분`;
                } else {
                  return `${diffMinutes}분`;
                }
              }
              return "처리 대기 중...";
            };

            return (
              <div>
                {/* 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <StatusBadge status={request.status} />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mt-2">
                          {request.title} 상세 정보
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedRequestId(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 좌측: 출금 요약 */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        출금 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {formatAmount(request.amount, request.currency)}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {request.currency}
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                              {convertToKRW(
                                request.amount,
                                request.currency
                              ).toLocaleString()}{" "}
                              KRW
                            </div>
                          </div>
                        </div>

                        {/* 상세 설명 */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <h6 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            출금 상세 설명
                          </h6>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {request.description}
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">신청 시간</span>
                            <span className="font-medium">
                              {formatDateTime(request.initiatedAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">출금 주소</span>
                            <span className="font-mono text-xs text-gray-700">
                              {request.toAddress.length > 30
                                ? `${request.toAddress.slice(
                                    0,
                                    15
                                  )}...${request.toAddress.slice(-15)}`
                                : request.toAddress}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 우측: 상태별 정보 */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        처리 상태
                      </h5>
                      <div className="space-y-4">
                        {/* 출금 대기 상태 표시 - pending 상태일 때만 표시 */}
                        {request.status === "pending" && (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <svg
                                  className="w-5 h-5 text-gray-600 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span className="text-sm font-medium text-gray-800">
                                  출금 대기 중입니다
                                </span>
                              </div>
                              {request.cancellable && (
                                <button
                                  onClick={() => handleCancelClick(request)}
                                  className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                                >
                                  출금 정지
                                </button>
                              )}
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              오출금 방지를 위한 대기 기간이 진행 중입니다.
                              <div className="mt-1 font-medium text-gray-700">
                                남은 시간: {calculateRemainingTime()}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* processing 상태일 때 진행 정보 */}
                        {request.status === "processing" && (
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-start">
                              <svg
                                className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <div>
                                <span className="text-sm font-semibold text-blue-900 block mb-1">
                                  출금 처리 중
                                </span>
                                <p className="text-sm text-blue-700">
                                  {request.processingStep === "security_check" &&
                                    "보안 검증을 진행하고 있습니다."}
                                  {request.processingStep ===
                                    "blockchain_broadcast" &&
                                    "블록체인 네트워크로 전송 중입니다."}
                                  {request.processingStep === "confirmation" &&
                                    `블록체인 컨펌을 기다리고 있습니다. (${
                                      request.blockConfirmations || 0
                                    }/12)`}
                                </p>
                                {request.txHash && (
                                  <div className="mt-2">
                                    <span className="text-xs text-blue-600 font-medium">
                                      트랜잭션 해시:
                                    </span>
                                    <p className="text-xs font-mono text-blue-800 mt-1 break-all">
                                      {request.txHash}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 블록체인 정보 */}
                  <BlockchainInfo request={request} />
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 출금 히스토리 탭 */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
                출금 히스토리 목록
              </h3>
              {/* 검색 및 필터 */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* 검색 */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="신청 ID, 제목, 자산 검색..."
                    value={historySearchTerm}
                    onChange={(e) => setHistorySearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* 상태 필터 */}
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 상태</option>
                  <option value="completed">출금 완료</option>
                  <option value="rejected">반려됨</option>
                  <option value="cancelled">취소됨</option>
                </select>

                {/* 기간 필터 */}
                <select
                  value={historyDateFilter}
                  onChange={(e) => setHistoryDateFilter(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">전체 기간</option>
                  <option value="today">오늘</option>
                  <option value="week">최근 7일</option>
                  <option value="month">최근 30일</option>
                  <option value="quarter">최근 3개월</option>
                </select>
              </div>
            </div>
          </div>

          {/* 데이터 표시 영역 */}
          <div className="p-6">
            {paginatedHistoryData.totalItems === 0 ? (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {historySearchTerm || historyStatusFilter !== "all" || historyDateFilter !== "all"
                      ? "검색 결과가 없습니다"
                      : "출금 히스토리가 없습니다"}
                  </h3>
                  <p className="text-gray-500">
                    {historySearchTerm || historyStatusFilter !== "all" || historyDateFilter !== "all"
                      ? "다른 검색어나 필터 조건을 시도해보세요."
                      : "완료된 출금 내역이 여기에 표시됩니다."}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          신청 정보
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          출금 금액
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          상태
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          완료 일시
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedHistoryData.items.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {request.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {request.id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatAmount(request.amount, request.currency)}{" "}
                              {request.currency}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.toAddress.slice(0, 10)}...
                              {request.toAddress.slice(-8)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {request.completedAt
                              ? formatDateTime(request.completedAt)
                              : request.cancelledAt
                              ? formatDateTime(request.cancelledAt)
                              : request.rejectedAt
                              ? formatDateTime(request.rejectedAt)
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                {paginatedHistoryData.totalPages > 0 && (
                  <div className="px-6 py-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center">
                      <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                        총 {paginatedHistoryData.totalItems}개 중{" "}
                        {Math.min(
                          (paginatedHistoryData.currentPage - 1) *
                            paginatedHistoryData.itemsPerPage +
                            1,
                          paginatedHistoryData.totalItems
                        )}
                        -
                        {Math.min(
                          paginatedHistoryData.currentPage * paginatedHistoryData.itemsPerPage,
                          paginatedHistoryData.totalItems
                        )}
                        개 표시
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            setHistoryCurrentPage(
                              Math.max(1, paginatedHistoryData.currentPage - 1)
                            )
                          }
                          disabled={paginatedHistoryData.currentPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          이전
                        </button>

                        {[...Array(paginatedHistoryData.totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          const isCurrentPage =
                            pageNumber === paginatedHistoryData.currentPage;

                          return (
                            <button
                              key={pageNumber}
                              onClick={() => setHistoryCurrentPage(pageNumber)}
                              className={`px-3 py-1 text-sm border rounded-md ${
                                isCurrentPage
                                  ? "bg-primary-600 text-white border-primary-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}

                        <button
                          onClick={() =>
                            setHistoryCurrentPage(
                              Math.min(
                                paginatedHistoryData.totalPages,
                                paginatedHistoryData.currentPage + 1
                              )
                            )
                          }
                          disabled={
                            paginatedHistoryData.currentPage === paginatedHistoryData.totalPages
                          }
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          다음
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

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

      {/* 출금 취소 모달 */}
      <CancelWithdrawalModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        request={selectedRequestForCancel}
      />

      {/* 하단 여백 추가 */}
      <div className="pb-8"></div>
    </div>
  );
}
