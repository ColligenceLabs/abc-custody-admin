"use client";

import { useState, Fragment, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ArrowUpOnSquareIcon,
  PlusIcon,
  DocumentCheckIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
  EyeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CpuChipIcon,
  FireIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/utils/permissionUtils";
import { Modal } from "@/components/common/Modal";
import {
  WithdrawalManagementProps,
  WithdrawalRequest,
  WithdrawalStatus,
  UserRole,
} from "@/types/withdrawal";
import {
  getStatusInfo,
  getPriorityInfo,
  formatCurrency,
  formatAmount,
  formatDateTime,
  formatDate,
} from "@/utils/withdrawalHelpers";
import { StatusBadge } from "./withdrawal/StatusBadge";
import { PriorityBadge } from "./withdrawal/PriorityBadge";
import { WithdrawalTableRow } from "./withdrawal/WithdrawalTableRow";
import { ProcessingTableRow } from "./withdrawal/ProcessingTableRow";
import { RejectedTableRow } from "./withdrawal/RejectedTableRow";
import { CreateWithdrawalModal } from "./withdrawal/CreateWithdrawalModal";
import AuditTab from "./withdrawal/AuditTab";
import RejectedTabComponent from "./withdrawal/RejectedTabComponent";
import AirgapTab from "./withdrawal/AirgapTab";
import ApprovalTab from "./withdrawal/ApprovalTab";
import ApprovalAuthModal from "./withdrawal/ApprovalAuthModal";
import { networkAssets } from "@/data/mockWithdrawalData";
import { getCorporateWithdrawals, getWithdrawalById, approveWithdrawal, rejectWithdrawalCorporate } from "@/lib/api/withdrawal";
import { getAddresses } from "@/lib/api/addresses";
import { WhitelistedAddress } from "@/types/address";
import { useToast } from "@/hooks/use-toast";
import { WalletGroup } from "@/types/groups";

export default function CorporateWithdrawalManagement({
  plan,
  initialTab,
}: WithdrawalManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<
    "approval" | "airgap" | "audit" | "rejected"
  >("approval");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 그룹 목록 상태 (DB + mockup)
  const [groups, setGroups] = useState<WalletGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // Manager 목록 상태 (DB)
  const [managers, setManagers] = useState<any[]>([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab && ["approval", "airgap", "audit", "rejected"].includes(initialTab as string)) {
      setActiveTab(initialTab as "approval" | "airgap" | "audit" | "rejected");
    }
  }, [initialTab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (
    newTab: "approval" | "airgap" | "audit" | "rejected"
  ) => {
    setActiveTab(newTab);
    router.push(`/withdrawal/${newTab}`);
  };
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [newRequest, setNewRequest] = useState({
    title: "",
    fromAddress: "",
    toAddress: "",
    amount: 0,
    network: "",
    currency: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
  });

  // API 상태 관리
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [addresses, setAddresses] = useState<WhitelistedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Manager 목록 가져오기
  useEffect(() => {
    const fetchManagers = async () => {
      if (!user?.organizationId) {
        console.log('[Withdrawal] No organizationId for managers');
        setManagers([]);
        setIsLoadingManagers(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const url = `${API_URL}/api/users?role=manager&organizationId=${user.organizationId}&status=active`;

        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data)) {
          setManagers(data);
          console.log('[Withdrawal] Managers loaded:', data.length);
        }
      } catch (error) {
        console.error('[Withdrawal] Failed to load managers:', error);
        setManagers([]);
      } finally {
        setIsLoadingManagers(false);
      }
    };

    fetchManagers();
  }, [user?.organizationId]);

  // 그룹 목록 가져오기
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.organizationId) {
        console.log('[Withdrawal] No organizationId');
        setGroups([]);
        setIsLoadingGroups(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const url = `${API_URL}/api/groups?organizationId=${user.organizationId}&status=active`;

        const response = await fetch(url);
        const data = await response.json();

        if (Array.isArray(data)) {
          const dbGroups = data.map((g: any) => {
            // budgetPeriods에서 월별/분기별/연간 예산 추출
            const budgetPeriods = g.budgetPeriods || [];
            const currentMonth = new Date().getMonth() + 1;
            const currentQuarter = Math.ceil(currentMonth / 3);

            console.log(`[fetchGroups] 그룹: ${g.name}, 현재 월: ${currentMonth}, budgetPeriods 개수: ${budgetPeriods.length}`);

            // 현재 월 예산
            const currentMonthBudget = budgetPeriods.find((bp: any) =>
              bp.periodType === 'monthly' && bp.period === currentMonth
            );

            console.log(`[fetchGroups] ${g.name} 현재 월(${currentMonth}) 예산:`, currentMonthBudget);

            // 현재 분기 예산
            const currentQuarterBudget = budgetPeriods.find((bp: any) =>
              bp.periodType === 'quarterly' && bp.period === currentQuarter
            );

            // 연간 예산
            const yearlyBudgetPeriod = budgetPeriods.find((bp: any) => bp.periodType === 'yearly');

            return {
              id: g.id,
              name: g.name,
              type: g.type,
              description: g.description || '',
              currency: g.currency,
              balance: { amount: 0, currency: g.currency },
              monthlyBudget: {
                amount: currentMonthBudget ? parseFloat(currentMonthBudget.budgetAmount) : 0,
                currency: g.currency
              },
              quarterlyBudget: {
                amount: currentQuarterBudget ? parseFloat(currentQuarterBudget.budgetAmount) : 0,
                currency: g.currency
              },
              yearlyBudget: {
                amount: yearlyBudgetPeriod ? parseFloat(yearlyBudgetPeriod.budgetAmount) : parseFloat(g.yearlyBudgetAmount || 0),
                currency: g.currency
              },
              budgetUsed: {
                amount: currentMonthBudget ? parseFloat(currentMonthBudget.usedAmount) : 0,
                currency: g.currency
              },
              quarterlyBudgetUsed: {
                amount: currentQuarterBudget ? parseFloat(currentQuarterBudget.usedAmount) : 0,
                currency: g.currency
              },
              yearlyBudgetUsed: {
                amount: parseFloat(g.yearlyBudgetUsed || 0),
                currency: g.currency
              },
              members: [],
              createdAt: g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: g.status,
            };
          });

          setGroups(dbGroups);
        }
      } catch (error) {
        console.error('[Withdrawal] Failed to load groups:', error);
        setGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [user?.organizationId]);

  // API 데이터 가져오기
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        setLoading(true);
        console.log('[CorporateWithdrawal] 출금 목록 조회 시작');
        const response = await getCorporateWithdrawals();
        console.log('[CorporateWithdrawal] 출금 목록 조회 성공:', response.data.length, '건');
        console.log('[CorporateWithdrawal] 데이터:', response.data);
        setWithdrawals(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '출금 목록을 불러오는데 실패했습니다.');
        console.error('[CorporateWithdrawal] 출금 목록 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawals();
  }, []);

  // 조직의 모든 출금 주소 가져오기
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user?.organizationId) return;

      try {
        // organizationId로 같은 조직의 모든 주소 조회
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const response = await fetch(`${API_URL}/api/addresses?organizationId=${user.organizationId}`);
        const data = await response.json();

        console.log('[Withdrawal] 조직 주소 목록:', data);
        console.log('[Withdrawal] organizationId:', user.organizationId);
        setAddresses(data);
      } catch (err) {
        console.error('[Withdrawal] 주소 목록 조회 실패:', err);
      }
    };

    fetchAddresses();
  }, [user?.organizationId]);

  const mockRequests = withdrawals;

  // 폼 초기화 함수
  const resetNewRequest = () => {
    setNewRequest({
      title: "",
      fromAddress: "",
      toAddress: "",
      amount: 0,
      network: "",
      currency: "",
      description: "",
      priority: "medium",
    });
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowCreateModal(false);
    resetNewRequest();
  };

  const handleCreateRequest = async () => {
    // CreateWithdrawalModal에서 이미 API 호출을 처리하므로
    // 여기서는 모달 닫기와 목록 갱신만 처리
    try {
      console.log('[handleCreateRequest] 출금 목록 갱신 시작');
      // 출금 목록 갱신
      const response = await getCorporateWithdrawals();
      console.log('[handleCreateRequest] 갱신된 목록:', response.data.length, '건');
      console.log('[handleCreateRequest] 갱신 데이터:', response.data);
      setWithdrawals(response.data);

      // 모달 닫기 및 폼 초기화
      handleCloseModal();
    } catch (err) {
      console.error('[handleCreateRequest] 출금 목록 갱신 실패:', err);
      // 목록 갱신 실패는 조용히 처리 (이미 신청은 성공했으므로)
      handleCloseModal();
    }
  };

  // 승인/반려 팝업 상태
  const [showApprovalModal, setShowApprovalModal] = useState<{
    show: boolean;
    requestId: string | null;
    action: "approve" | "reject" | "cancel-approve" | "cancel-reject" | null;
  }>({ show: false, requestId: null, action: null });
  const [rejectionReason, setRejectionReason] = useState("");

  // 인증 모달 상태
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingApprovalRequest, setPendingApprovalRequest] = useState<string | null>(null);

  // 재신청 및 아카이브 관련 상태
  const [showReapplicationModal, setShowReapplicationModal] = useState<{
    show: boolean;
    requestId: string | null;
  }>({ show: false, requestId: null });
  const [showArchiveModal, setShowArchiveModal] = useState<{
    show: boolean;
    requestId: string | null;
  }>({ show: false, requestId: null });

  // 승인/반려 처리 (팝업 열기)
  const handleApproval = (requestId: string, action: "approve" | "reject" | "cancel-approve" | "cancel-reject") => {
    setShowApprovalModal({ show: true, requestId, action: action as "approve" | "reject" | "cancel-approve" | "cancel-reject" | null });
    setRejectionReason("");
  };

  // 재신청 처리
  const handleReapplication = (requestId: string) => {
    setShowReapplicationModal({ show: true, requestId });
  };

  // 아카이브 처리
  const handleArchive = (requestId: string) => {
    setShowArchiveModal({ show: true, requestId });
  };

  // 재신청 확인
  const confirmReapplication = () => {
    if (!showReapplicationModal.requestId) return;

    const originalRequest = mockRequests.find(
      (r) => r.id === showReapplicationModal.requestId
    );
    if (!originalRequest) return;

    // 기존 정보를 복사하여 새로운 신청서 생성
    const newRequestData = {
      ...originalRequest,
      id: `REQ-${Date.now()}`, // 새로운 ID 생성
      status: "withdrawal_reapply" as WithdrawalStatus,
      originalRequestId: originalRequest.id,
      reapplicationCount: (originalRequest.reapplicationCount || 0) + 1,
      initiatedAt: new Date().toISOString(),
      approvals: [],
      rejections: [],
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          action: "재신청 생성",
          userId: "current-user",
          userName: "현재사용자",
          details: `기존 신청(${originalRequest.id})을 기반으로 재신청 생성`,
        },
      ],
    };

    // 새로운 신청서 생성 모달로 전환
    setNewRequest({
      title: originalRequest.title,
      fromAddress: originalRequest.fromAddress,
      toAddress: originalRequest.toAddress,
      amount: originalRequest.amount,
      network: "Bitcoin", // 기본값으로 설정
      currency: originalRequest.currency,
      priority: "medium" as "low" | "medium" | "high" | "critical",
      description: `재신청: ${originalRequest.description}`,
    });

    setShowReapplicationModal({ show: false, requestId: null });
    setShowCreateModal(true);

    toast({
      description: "기존 신청 정보가 복사되었습니다. 필요한 내용을 수정 후 신청해주세요.",
    });
  };

  // 아카이브 확인
  const confirmArchive = () => {
    if (!showArchiveModal.requestId) return;

    // 실제 구현에서는 API 호출로 상태 업데이트
    console.log(`Archive request ${showArchiveModal.requestId}`);
    toast({
      description: "반려된 신청이 처리 완료되었습니다.",
    });

    setShowArchiveModal({ show: false, requestId: null });
  };

  // 승인/반려 확인
  const confirmApproval = async () => {
    if (!showApprovalModal.requestId || !showApprovalModal.action || !user) return;

    if (showApprovalModal.action === "reject" && !rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        description: "반려 사유를 입력해주세요.",
      });
      return;
    }

    if (showApprovalModal.action === "approve") {
      // 승인 시 인증 모달 표시
      setPendingApprovalRequest(showApprovalModal.requestId);
      setShowApprovalModal({ show: false, requestId: null, action: null });
      setShowAuthModal(true);
    } else {
      // 반려 처리 - API 호출
      try {
        await rejectWithdrawalCorporate(
          showApprovalModal.requestId,
          user.id,
          user.name,
          rejectionReason
        );

        console.log(`Request ${showApprovalModal.requestId} rejected`, { rejectionReason });

        toast({
          description: "출금 신청이 반려되었습니다.",
        });

        // 출금 목록 갱신
        const response = await getCorporateWithdrawals();
        setWithdrawals(response.data);

      } catch (error) {
        console.error('결재 반려 실패:', error);
        toast({
          variant: 'destructive',
          description: error instanceof Error ? error.message : '결재 반려에 실패했습니다.',
        });
      } finally {
        setShowApprovalModal({ show: false, requestId: null, action: null });
        setRejectionReason("");
      }
    }
  };

  // 팝업 닫기
  const closeApprovalModal = () => {
    setShowApprovalModal({ show: false, requestId: null, action: null });
    setRejectionReason("");
  };

  // 인증 완료 처리
  const handleAuthComplete = async (sessionId: string) => {
    if (!pendingApprovalRequest || !user) return;

    try {
      // 결재 승인 API 호출
      await approveWithdrawal(
        pendingApprovalRequest,
        user.id,
        user.name
      );

      console.log(`Request ${pendingApprovalRequest} approved with auth session ${sessionId}`);

      toast({
        description: "출금 신청이 승인되었습니다.",
      });

      // 출금 목록 갱신
      const response = await getCorporateWithdrawals();
      setWithdrawals(response.data);

    } catch (error) {
      console.error('결재 승인 실패:', error);
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '결재 승인에 실패했습니다.',
      });
    } finally {
      // 상태 초기화
      setShowAuthModal(false);
      setPendingApprovalRequest(null);
    }
  };

  // 인증 실패 처리
  const handleAuthFailed = (reason: string) => {
    toast({
      variant: 'destructive',
      description: `관리자 인증에 실패했습니다: ${reason}`,
    });
    setShowAuthModal(false);
    setPendingApprovalRequest(null);
  };

  // 인증 모달 닫기
  const closeAuthModal = () => {
    setShowAuthModal(false);
    setPendingApprovalRequest(null);
  };

  // 필터 기능 제거 - 모든 요청 표시
  const filteredRequests = mockRequests;

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

  if (plan !== "enterprise") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            출금 관리 시스템
          </h3>
          <p className="text-gray-500 mb-4">
            엔터프라이즈 플랜에서만 사용 가능한 기능입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">단계별 출금 관리</h1>
          <p className="text-gray-600 mt-1">
            보안과 효율성을 모두 갖춘 기업용 출금 시스템
          </p>
        </div>
        {user && hasPermission(user, 'withdrawals.create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            출금 신청
          </button>
        )}
      </div>

      {/* 출금 프로세스 플로우 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          {/* 프로세스 단계들 */}
          <div className="flex items-center justify-between px-4 min-w-max overflow-x-auto">
            {[
              {
                step: 1,
                title: "출금 신청",
                subtitle: "기안자 작성",
                description: "출금 내용, 금액, 주소 입력",
              },
              {
                step: 2,
                title: "결재 승인",
                subtitle: "결재자 승인",
                description: "필수 결재자 순차 승인",
              },
              {
                step: 3,
                title: "출금 대기",
                subtitle: "오출금 방지",
                description: "변심 취소 대응 기간",
              },
              {
                step: 4,
                title: "보안 검증",
                subtitle: "AML/트래블룰",
                description: "이상거래 탐지 및 규제 검사",
              },
              {
                step: 5,
                title: "ABC 서명",
                subtitle: "물리적 격리",
                description: "MPC 분산키 디지털 서명",
              },
              {
                step: 6,
                title: "블록체인 전송",
                subtitle: "네트워크 확인",
                description: "트랜잭션 브로드캐스팅",
              },
            ].map((item, index) => (
              <Fragment key={item.step}>
                {/* 단계 */}
                <div className="flex flex-col items-center group flex-shrink-0">
                  {/* 단계 제목 */}
                  <div className="px-3 py-2 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 transition-all hover:from-primary-50 hover:to-primary-100 hover:border-primary-200 hover:shadow-md whitespace-nowrap">
                    <span className="text-xs font-medium text-gray-700 hover:text-primary-700 transition-colors">
                      {item.title}
                    </span>
                  </div>

                  {/* 단계 정보 */}
                  <div className="text-center mt-2">
                    <p className="text-xs text-gray-500 whitespace-nowrap">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* 호버 툴팁 */}
                  <div
                    className={`absolute top-16 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap ${
                      index === 0
                        ? "left-0"
                        : index === 5
                        ? "right-0"
                        : "left-1/2 transform -translate-x-1/2"
                    }`}
                  >
                    {item.description}
                    <div
                      className={`absolute -top-1 w-2 h-2 bg-gray-800 rotate-45 ${
                        index === 0
                          ? "left-4"
                          : index === 5
                          ? "right-4"
                          : "left-1/2 transform -translate-x-1/2"
                      }`}
                    ></div>
                  </div>
                </div>

                {/* 화살표 */}
                {index < 5 && (
                  <div className="mx-6 flex items-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            {
              id: "approval",
              name: "결재 승인 대기",
              icon: CheckCircleIcon,
              count: mockRequests.filter((r) => r.status === "withdrawal_request")
                .length,
            },
            {
              id: "airgap",
              name: "출금 처리",
              icon: LockClosedIcon,
              count: mockRequests.filter((r) =>
                ["withdrawal_pending", "processing"].includes(r.status)
              ).length,
            },
            {
              id: "rejected",
              name: "반려/보류 관리",
              icon: XCircleIcon,
              count: mockRequests.filter(
                (r) => r.status === "withdrawal_rejected" || r.status === "archived"
              ).length,
            },
            {
              id: "audit",
              name: "감사 추적",
              icon: EyeIcon,
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
              {tab.count !== undefined && tab.count > 0 && (
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

      {/* 결재 승인 탭 */}
      {activeTab === "approval" && (
        <ApprovalTab
          withdrawalRequests={mockRequests}
          onApproval={handleApproval}
          managers={managers}
        />
      )}

      {/* 출금 처리 탭 */}
      {activeTab === "airgap" && (
        <AirgapTab withdrawalRequests={mockRequests} />
      )}

      {/* 반려/보류 관리 탭 */}
      {activeTab === "rejected" && (
        <RejectedTabComponent
          withdrawalRequests={mockRequests}
          onReapplication={handleReapplication}
          onArchive={handleArchive}
        />
      )}

      {/* 감사 추적 탭 */}
      {activeTab === "audit" && <AuditTab withdrawalRequests={mockRequests} />}

      {/* 출금 신청 모달 */}
      <CreateWithdrawalModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSubmit={handleCreateRequest}
        newRequest={newRequest}
        onRequestChange={setNewRequest}
        networkAssets={networkAssets}
        whitelistedAddresses={addresses}
        groups={groups}
        managers={managers}
      />

      {/* 승인/반려 확인 팝업 */}
      <Modal isOpen={showApprovalModal.show}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {showApprovalModal.action === "approve"
                  ? "승인 확인"
                  : "반려 확인"}
              </h3>
              <button
                onClick={closeApprovalModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
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

            {(() => {
              const request = mockRequests.find(
                (r) => r.id === showApprovalModal.requestId
              );
              if (!request) return null;

              return (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {request.title}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500">신청 ID:</span>
                        <span className="ml-1 font-medium">#{request.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">출금 금액:</span>
                        <span className="ml-1 font-medium">
                          {formatAmount(request.amount, request.currency)}{" "}
                          {request.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">기안자:</span>
                        <span className="ml-1 font-medium">
                          {request.initiator}
                        </span>
                      </div>
                    </div>
                  </div>

                  {showApprovalModal.action === "approve" ? (
                    <div>
                      <p className="text-gray-700 mb-4">
                        위 출금 신청을{" "}
                        <span className="font-semibold text-sky-600">
                          승인
                        </span>
                        하시겠습니까?
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-start">
                          <svg
                            className="w-5 h-5 text-blue-600 mr-2 mt-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">
                              승인 후 처리 과정
                            </p>
                            <p>
                              모든 승인 완료 시 자동으로 출금 처리(출금대기,
                              보안검증, 전송완료)가 진행됩니다.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-700 mb-4">
                        위 출금 신청을{" "}
                        <span className="font-semibold text-red-600">반려</span>
                        하시겠습니까?
                      </p>
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          반려 사유 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="반려 사유를 상세히 입력해주세요."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          rows={4}
                        />
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="flex items-start">
                            <svg
                              className="w-5 h-5 text-yellow-600 mr-2 mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                              />
                            </svg>
                            <div className="text-sm text-yellow-800">
                              <p className="font-medium mb-1">반려 처리 안내</p>
                              <p>
                                반려된 출금 신청은 기안자에게 알림이 전송되며,
                                수정 후 재신청이 가능합니다.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={closeApprovalModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={confirmApproval}
                      className={`px-4 py-2 text-white rounded-lg transition-colors ${
                        showApprovalModal.action === "approve"
                          ? "bg-sky-600 hover:bg-sky-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {showApprovalModal.action === "approve"
                        ? "승인하기"
                        : "반려하기"}
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </Modal>

      {/* 재신청 확인 팝업 */}
      <Modal isOpen={showReapplicationModal.show}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                재신청 확인
              </h3>
              <button
                onClick={() =>
                  setShowReapplicationModal({ show: false, requestId: null })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
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

            <div className="mb-6">
              <div className="flex items-center p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <svg
                  className="w-5 h-5 text-blue-600 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">재신청 안내</p>
                  <p>
                    기존 신청 정보가 복사되어 새로운 신청서가 생성됩니다. 반려
                    사유를 참고하여 필요한 내용을 수정 후 다시 신청해주세요.
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                이 출금 신청을{" "}
                <span className="font-semibold text-blue-600">재신청</span>
                하시겠습니까?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setShowReapplicationModal({ show: false, requestId: null })
                }
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmReapplication}
                className="px-6 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                재신청하기
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 아카이브 확인 팝업 */}
      <Modal isOpen={showArchiveModal.show}>
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                처리 완료 확인
              </h3>
              <button
                onClick={() =>
                  setShowArchiveModal({ show: false, requestId: null })
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
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

            <div className="mb-6">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <svg
                  className="w-5 h-5 text-gray-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 8l4 4L19 2"
                  />
                </svg>
                <div className="text-sm text-gray-800">
                  <p className="font-medium mb-1">처리 완료 안내</p>
                  <p>
                    반려된 출금 신청을 처리 완료로 변경합니다. 이후 별도 필터를
                    통해 조회할 수 있습니다.
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">
                이 반려된 출금 신청을{" "}
                <span className="font-semibold text-gray-600">처리 완료</span>로
                변경하시겠습니까?
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() =>
                  setShowArchiveModal({ show: false, requestId: null })
                }
                className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmArchive}
                className="px-6 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
              >
                처리 완료
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 관리자 인증 모달 */}
      <ApprovalAuthModal
        isOpen={showAuthModal}
        request={pendingApprovalRequest ? mockRequests.find(r => r.id === pendingApprovalRequest) || null : null}
        onClose={closeAuthModal}
        onAuthComplete={handleAuthComplete}
        onAuthFailed={handleAuthFailed}
      />

      {/* 하단 여백 추가 */}
      <div className="pb-8"></div>
    </div>
  );
}
