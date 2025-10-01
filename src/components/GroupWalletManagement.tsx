"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  WalletIcon,
  PlusIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  UserIcon,
  CogIcon,
  ArrowUpOnSquareIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  GroupType,
  ExpenseStatus,
  CryptoCurrency,
  CryptoAmount,
  WalletGroup,
  ExpenseRequest,
  GroupCreationRequest,
} from "@/types/groups";
import {
  mockGroups,
  mockExpenses,
  mockGroupRequests,
} from "@/data/groupMockData";
import GroupManagement from "@/components/groups/GroupManagement";
import GroupApprovalTab from "@/components/groups/GroupApprovalTab";
import BudgetStatus from "@/components/groups/BudgetStatus";
import RejectedManagementTab from "@/components/groups/RejectedManagementTab";
import GroupAuditTab from "@/components/groups/GroupAuditTab";
import { CreateGroupWithdrawalModal } from "@/components/withdrawal/CreateGroupWithdrawalModal";
import { networkAssets, whitelistedAddresses } from "@/data/mockWithdrawalData";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  calculateBudgetUsageRate,
  calculateExpenseSum,
  formatExpenseSums,
  getExpensesForPeriod,
  getTypeColor,
  getTypeName,
  getStatusColor,
  getStatusName,
  formatDate,
  getBudgetUsagePercentage,
  getQuarterlyBudgetUsagePercentage,
  getYearlyBudgetUsagePercentage,
} from "@/utils/groupsUtils";

interface GroupWalletManagementProps {
  plan: ServicePlan;
  initialTab?:
    | "groups"
    | "approval"
    | "budget"
    | "rejected"
    | "audit";
}

// 가상자산 아이콘 컴포넌트
const getCryptoIcon = (currency: CryptoCurrency) => {
  return (
    <img
      src={getCryptoIconUrl(currency)}
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        // 이미지 로드 실패시 폴백
        const target = e.target as HTMLImageElement;
        target.style.display = "none";
        const fallback = document.createElement("div");
        fallback.className =
          "w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold";
        fallback.textContent = currency[0];
        target.parentNode?.replaceChild(fallback, target);
      }}
    />
  );
};

// 아이콘과 함께 가상자산 금액 포맷팅
const formatCryptoAmountWithIcon = (
  cryptoAmount: CryptoAmount
): JSX.Element => {
  const decimals = getCurrencyDecimals(cryptoAmount.currency);
  const fixedNumber = cryptoAmount.amount
    .toFixed(decimals)
    .replace(/\.?0+$/, "");

  // 천자리 콤마 추가
  const formattedNumber = parseFloat(fixedNumber).toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });

  return (
    <div className="flex items-center space-x-2">
      {getCryptoIcon(cryptoAmount.currency)}
      <span>
        {formattedNumber} {cryptoAmount.currency}
      </span>
    </div>
  );
};

// 지출 상태 아이콘 매핑
const getStatusIcon = (status: ExpenseStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    case "rejected":
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    case "pending":
      return <ClockIcon className="h-5 w-5 text-yellow-600" />;
    default:
      return <ExclamationCircleIcon className="h-5 w-5 text-gray-600" />;
  }
};

export default function GroupWalletManagement({
  plan,
  initialTab,
}: GroupWalletManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  // 출금 신청 모달 관련 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [newWithdrawalRequest, setNewWithdrawalRequest] = useState({
    title: "",
    fromAddress: "",
    toAddress: "",
    amount: 0,
    network: "",
    currency: "",
    groupId: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
  });
  const [activeTab, setActiveTab] = useState<
    "groups" | "approval" | "budget" | "rejected" | "audit"
  >(initialTab || "groups");

  // 그룹 생성 요청 상태 관리 (localStorage와 동기화)
  const [groupRequests, setGroupRequests] = useState<GroupCreationRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('groupRequests');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (error) {
          console.error('Error parsing stored groupRequests:', error);
        }
      }
    }
    return [...mockGroupRequests];
  });

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // groupRequests가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('groupRequests', JSON.stringify(groupRequests));
      console.log('Saved to localStorage:', groupRequests);
    }
  }, [groupRequests]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (
    newTab:
      | "groups"
      | "approval"
      | "budget"
      | "rejected"
      | "audit"
  ) => {
    setActiveTab(newTab);
    router.push(`/groups/${newTab}`);
  };

  const { t, language } = useLanguage();


  // 출금 신청 처리
  const handleCreateWithdrawalRequest = (request: any) => {
    console.log("Creating withdrawal request:", request);
    // TODO: 실제 API 호출
    setShowWithdrawalModal(false);
    setNewWithdrawalRequest({
      title: "",
      fromAddress: "",
      toAddress: "",
      amount: 0,
      network: "",
      currency: "",
      groupId: "",
      description: "",
      priority: "medium" as "low" | "medium" | "high" | "critical",
    });
    alert("출금 신청이 완료되었습니다.");
  };

  // 재승인 요청 처리
  const handleReapprovalRequest = (requestId: string) => {
    console.log("Re-approving group request:", requestId);
    // TODO: 실제 재승인 처리 로직 (rejected를 pending으로 변경)
    alert("재승인 요청이 처리되어 승인 대기 상태로 변경되었습니다.");
    handleTabChange("approval");
  };

  // 처리완료 (아카이브) 처리
  const handleArchiveRequest = (requestId: string) => {
    console.log("Archiving group request:", requestId);
    // TODO: 실제 아카이브 처리 로직 (rejected를 archived로 변경)
    alert("처리완료 되었습니다.");
  };

  if (plan !== "enterprise") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">그룹 관리</h3>
          <p className="text-gray-500 mb-4">
            엔터프라이즈 플랜에서만 사용 가능한 기능입니다
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">그룹 관리</h1>
          <p className="text-gray-600 mt-1">
            목적별 그룹화로 체계적인 자산관리
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            그룹 생성
          </button>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowUpOnSquareIcon className="h-5 w-5 mr-2" />
            지출 신청
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "groups", name: "그룹 관리", icon: UserGroupIcon },
            {
              id: "approval",
              name: "그룹 승인",
              icon: BanknotesIcon,
              count:
                mockGroups.filter((g) => g.status === "pending").length || 2,
            },
            {
              id: "rejected",
              name: "반려/보류 관리",
              icon: XCircleIcon,
              count: mockGroupRequests.filter(
                (r) => r.status === "rejected" || r.status === "archived"
              ).length,
            },
            { id: "budget", name: "예산 현황", icon: ChartBarIcon },
            { id: "audit", name: "감사 추적", icon: DocumentTextIcon },
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

      {/* 그룹 관리 탭 */}
      {activeTab === "groups" && (
        <GroupManagement
          showCreateModal={showCreateModal}
          onCloseCreateModal={() => setShowCreateModal(false)}
          onOpenCreateModal={() => setShowCreateModal(true)}
          onCreateGroup={() => {
            // 그룹 생성 후 처리 로직
          }}
          onCreateGroupRequest={(request) => {
            console.log("Group creation request submitted:", request);

            // 새 요청을 상태에 추가 (최신 요청이 맨 위에 오도록)
            setGroupRequests(prev => [request, ...prev]);

            // 잠시 후 승인 탭으로 이동
            setTimeout(() => {
              handleTabChange("approval");
            }, 1000);
          }}
        />
      )}

      {/* 그룹 승인 탭 */}
      {activeTab === "approval" && (
        <GroupApprovalTab
            groupRequests={groupRequests}
            onApproveRequest={(requestId) => {
              console.log("Approving group request:", requestId);
              // TODO: 실제 승인 처리 로직
            }}
          onRejectRequest={(requestId, reason) => {
            console.log(
              "Rejecting group request:",
              requestId,
              "Reason:",
              reason
            );
            // TODO: 실제 반려 처리 로직
          }}
          onReapproveRequest={(requestId) => {
            console.log("Re-approving group request:", requestId);
            // TODO: 재승인 처리 로직
          }}
        />
      )}



      {/* 예산 현황 탭 */}
      {activeTab === "budget" && <BudgetStatus />}

      {/* 반려/보류 관리 탭 */}
      {activeTab === "rejected" && (
        <RejectedManagementTab
          groupRequests={mockGroupRequests}
          onReapprovalRequest={handleReapprovalRequest}
          onArchive={handleArchiveRequest}
        />
      )}

      {/* 감사 추적 탭 */}
      {activeTab === "audit" && <GroupAuditTab />}

      {/* 출금 신청 모달 */}
      <CreateGroupWithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSubmit={handleCreateWithdrawalRequest}
        newRequest={newWithdrawalRequest}
        onRequestChange={setNewWithdrawalRequest}
        networkAssets={networkAssets}
        whitelistedAddresses={whitelistedAddresses}
        groups={mockGroups}
      />
    </div>
  );
}
