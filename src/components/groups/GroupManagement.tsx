import { useState, useEffect } from "react";
import {
  WalletIcon,
  PlusIcon,
  UserIcon,
  UserGroupIcon,
  PencilIcon,
  PauseIcon,
  PlayIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import {
  GroupType,
  CryptoCurrency,
  CryptoAmount,
  WalletGroup,
  BudgetSetup,
  GroupStatus,
} from "@/types/groups";
import { User, ROLE_NAMES } from "@/types/user";
import { Modal } from "@/components/common/Modal";
import { mockGroups } from "@/data/groupMockData";
import { MOCK_USERS } from "@/data/userMockData";
import BudgetSetupForm from "./BudgetSetupForm";
import BudgetDistribution from "./BudgetDistribution";
import PolicyBasedApproverSetup from "./PolicyBasedApproverSetup";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  getTypeColor,
  getTypeName,
  formatDate,
  getBudgetUsagePercentage,
  getQuarterlyBudgetUsagePercentage,
  getYearlyBudgetUsagePercentage,
} from "@/utils/groupsUtils";
import { distributeBudget } from "@/utils/budgetCalculator";

interface GroupManagementProps {
  onCreateGroup?: () => void;
  showCreateModal?: boolean;
  onCloseCreateModal?: () => void;
  onOpenCreateModal?: () => void;
  onCreateGroupRequest?: (request: any) => void;
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
  const formattedNumber = parseFloat(fixedNumber).toLocaleString("ko-KR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
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

// 현재 기간의 예산 정보를 가져오는 헬퍼 함수
const getCurrentPeriodBudget = (group: WalletGroup) => {
  if (!group.budgetSetup) {
    return {
      period: "monthly",
      budget: group.monthlyBudget.amount,
      used: group.budgetUsed.amount,
      currency: group.monthlyBudget.currency,
    };
  }

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;

  // 현재 월에 해당하는 예산 찾기
  const currentMonthBudget = group.budgetSetup.monthlyBudgets.find(
    (mb) => mb.month === currentMonth
  );

  if (currentMonthBudget) {
    return {
      period: "monthly",
      budget: currentMonthBudget.amount,
      used: group.budgetUsed.amount, // 실제로는 해당 월의 사용량이어야 함
      currency: group.budgetSetup.currency,
    };
  }

  // 현재 월 예산이 없다면 기존 방식 사용
  return {
    period: "monthly",
    budget: group.monthlyBudget.amount,
    used: group.budgetUsed.amount,
    currency: group.monthlyBudget.currency,
  };
};

// User ID로 사용자 이름 가져오기
const getUserNameById = (userId: string): string => {
  const user = MOCK_USERS.find((u) => u.id === userId);
  return user ? user.name : userId; // ID를 찾지 못하면 ID 자체를 반환
};

// budgetSetup에서 현재 월 예산 가져오기
const getCurrentMonthlyBudgetFromSetup = (setup: BudgetSetup): number => {
  const currentMonth = new Date().getMonth() + 1;
  const monthBudget = setup.monthlyBudgets.find(
    (mb) => mb.month === currentMonth
  );
  return monthBudget ? monthBudget.amount : 0;
};

// budgetSetup에서 현재 분기 예산 가져오기
const getCurrentQuarterlyBudgetFromSetup = (setup: BudgetSetup): number => {
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const quarterBudget = setup.quarterlyBudgets.find(
    (qb) => qb.quarter === currentQuarter
  );
  return quarterBudget ? quarterBudget.amount : 0;
};

// budgetSetup에서 연간 예산 가져오기
const getYearlyBudgetFromSetup = (setup: BudgetSetup): number => {
  return setup.yearlyBudget || 0;
};

// 현재 월 이름 가져오기 (예: "9월")
const getCurrentMonthName = (): string => {
  const currentMonth = new Date().getMonth() + 1;
  return `${currentMonth}월`;
};

// 현재 분기 이름 가져오기 (예: "3분기")
const getCurrentQuarterName = (): string => {
  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  return `${currentQuarter}분기`;
};

// 현재 년도 가져오기 (예: "2025년도")
const getCurrentYearName = (): string => {
  const currentYear = new Date().getFullYear();
  return `${currentYear}년도`;
};

export default function GroupManagement({
  onCreateGroup,
  showCreateModal: externalShowCreateModal,
  onCloseCreateModal,
  onOpenCreateModal,
  onCreateGroupRequest,
}: GroupManagementProps) {
  const [internalShowCreateModal, setInternalShowCreateModal] = useState(false);
  const [groups, setGroups] = useState<WalletGroup[]>(mockGroups);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedGroupForDetail, setSelectedGroupForDetail] =
    useState<WalletGroup | null>(null);

  // 중지 확인 모달 상태
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendingGroup, setSuspendingGroup] = useState<{
    id: string;
    name: string;
    status: GroupStatus | undefined;
  } | null>(null);

  const showCreateModal =
    externalShowCreateModal !== undefined
      ? externalShowCreateModal
      : internalShowCreateModal;

  // 새로운 그룹 상태
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 사용자 선택 관련 상태 (더 이상 필요하지 않음 - select 드롭다운 사용)

  // 필수 결재자 관련 상태
  const [requiredApprovers, setRequiredApprovers] = useState<string[]>([""]);

  // 관리자로 선택 가능한 사용자 필터링 (활성 상태이고 admin, manager, required_approver 역할)
  const getEligibleUsers = () => {
    return MOCK_USERS.filter(
      (user) =>
        user.status === "active" &&
        ["admin", "manager", "required_approver"].includes(user.role)
    );
  };

  // 결재자로 선택 가능한 사용자 필터링 (활성 상태이고 결재 권한이 있는 역할)
  const getEligibleApprovers = (excludeCurrentSelection: boolean = true) => {
    const selectedUserIds = excludeCurrentSelection
      ? requiredApprovers.filter((id) => id !== "")
      : [];
    const managerUserId = newGroup.manager;

    return MOCK_USERS.filter(
      (user) =>
        user.status === "active" &&
        ["required_approver", "approver", "admin"].includes(user.role) &&
        !selectedUserIds.includes(user.id) &&
        user.id !== managerUserId
    );
  };

  // 필수 결재자 관리 함수들
  const handleApproverChange = (index: number, userId: string) => {
    const updated = [...requiredApprovers];
    updated[index] = userId;
    setRequiredApprovers(updated);
  };

  const handleAddApprover = () => {
    setRequiredApprovers([...requiredApprovers, ""]);
  };

  const handleRemoveApprover = (index: number) => {
    if (requiredApprovers.length > 1) {
      const updated = requiredApprovers.filter((_, i) => i !== index);
      setRequiredApprovers(updated);
    }
  };

  const [newGroup, setNewGroup] = useState({
    name: "",
    type: "department" as GroupType,
    description: "",
    currency: "BTC" as CryptoCurrency, // 그룹 전체 자산 설정
    monthlyBudget: { amount: 0, currency: "BTC" as CryptoCurrency },
    quarterlyBudget: { amount: 0, currency: "BTC" as CryptoCurrency },
    yearlyBudget: { amount: 0, currency: "BTC" as CryptoCurrency },
    budgetSetup: null as BudgetSetup | null, // 새로운 예산 설정
    manager: "",
  });

  // 그룹 자산 변경 시 모든 예산의 자산도 함께 변경
  const handleCurrencyChange = (currency: CryptoCurrency) => {
    setNewGroup({
      ...newGroup,
      currency,
      monthlyBudget: { ...newGroup.monthlyBudget, currency },
      quarterlyBudget: { ...newGroup.quarterlyBudget, currency },
      yearlyBudget: { ...newGroup.yearlyBudget, currency },
    });
  };

  // 년도 변경 핸들러
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    // 년도 변경시 기존 예산 설정 초기화
    setNewGroup({
      ...newGroup,
      budgetSetup: null,
    });
  };

  // 예산 설정 생성
  const handleCreateBudgetSetup = (
    baseType: "yearly" | "quarterly" | "monthly",
    baseAmount: number,
    selectedQuarter?: number,
    selectedMonth?: number
  ) => {
    try {
      setErrorMessage(null); // 에러 메시지 초기화
      const budgetSetup = distributeBudget(
        baseAmount,
        newGroup.currency,
        selectedYear,
        baseType,
        selectedQuarter,
        selectedMonth
      );

      setNewGroup({
        ...newGroup,
        budgetSetup,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "예산 생성 중 오류가 발생했습니다."
      );
    }
  };

  // 예산 설정 변경
  const handleBudgetSetupChange = (updatedSetup: BudgetSetup) => {
    setNewGroup({
      ...newGroup,
      budgetSetup: updatedSetup,
    });
  };

  // 에러 메시지 핸들러 (빈 문자열을 null로 변환)
  const handleError = (message: string) => {
    setErrorMessage(message === "" ? null : message);
  };

  // 예산 검증 함수
  const isBudgetValid = (): boolean => {
    if (!newGroup.budgetSetup) return false;

    const totalDistributed = newGroup.budgetSetup.monthlyBudgets.reduce(
      (sum, budget) => sum + budget.amount,
      0
    );
    const baseAmount = newGroup.budgetSetup.baseAmount;

    return totalDistributed === baseAmount;
  };

  // 예산이 변경되었는지 확인하는 함수
  const isBudgetChanged = (originalGroup: WalletGroup): boolean => {
    if (!originalGroup) return false;

    // budgetSetup 변경 확인
    if (
      JSON.stringify(newGroup.budgetSetup) !==
      JSON.stringify(originalGroup.budgetSetup)
    ) {
      return true;
    }

    // 기존 예산 필드 변경 확인 (budgetSetup이 없는 경우)
    if (!newGroup.budgetSetup) {
      return (
        newGroup.monthlyBudget.amount !== originalGroup.monthlyBudget.amount ||
        newGroup.quarterlyBudget.amount !==
          originalGroup.quarterlyBudget.amount ||
        newGroup.yearlyBudget.amount !== originalGroup.yearlyBudget.amount
      );
    }

    return false;
  };

  // 전체 폼 유효성 검사
  const isFormValid = (): boolean => {
    const validApprovers = requiredApprovers.filter((id) => id !== "");
    const basicFieldsValid =
      newGroup.name.trim() !== "" &&
      newGroup.description.trim() !== "" &&
      isBudgetValid();

    // 수정 모드일 때는 관리자와 결재자 검증 제외
    if (isEditMode) {
      return basicFieldsValid;
    }

    // 생성 모드일 때는 관리자, 예산, 결재자 필수
    // 예산이 설정된 경우에만 결재자가 자동으로 설정됨
    const hasValidBudget = newGroup.budgetSetup && newGroup.budgetSetup.baseAmount > 0;
    const hasValidApprovers = hasValidBudget ? validApprovers.length > 0 : false;

    return (
      basicFieldsValid &&
      newGroup.manager !== "" &&
      !!hasValidBudget &&
      hasValidApprovers
    );
  };

  // 그룹 상세보기 열기
  const handleShowGroupDetail = (group: WalletGroup) => {
    setSelectedGroupForDetail(group);
    setShowDetailModal(true);
  };

  // 상세보기에서 수정 모드 진입
  const handleEditFromDetail = () => {
    if (selectedGroupForDetail) {
      setIsEditMode(true);
      setEditingGroupId(selectedGroupForDetail.id);

      // 기존 그룹 정보로 폼 채우기
      setNewGroup({
        name: selectedGroupForDetail.name,
        type: selectedGroupForDetail.type,
        description: selectedGroupForDetail.description,
        currency: selectedGroupForDetail.balance.currency,
        monthlyBudget: selectedGroupForDetail.monthlyBudget,
        quarterlyBudget: selectedGroupForDetail.quarterlyBudget,
        yearlyBudget: selectedGroupForDetail.yearlyBudget,
        budgetSetup: selectedGroupForDetail.budgetSetup || null,
        manager: selectedGroupForDetail.manager,
      });

      // 결재자 정보 설정
      setRequiredApprovers(selectedGroupForDetail.requiredApprovals || [""]);

      // 예산 설정이 있다면 해당 연도로 설정
      if (selectedGroupForDetail.budgetSetup) {
        setSelectedYear(selectedGroupForDetail.budgetSetup.year);
      }

      // 상세보기 모달 닫고 수정 모달 열기
      setShowDetailModal(false);

      if (externalShowCreateModal !== undefined && onOpenCreateModal) {
        // 외부에서 모달 상태를 관리하는 경우 외부 콜백 호출
        onOpenCreateModal();
      } else {
        setInternalShowCreateModal(true);
      }
    }
  };

  // 그룹 중지/재활성화
  const handleToggleGroupStatus = (
    groupId: string,
    currentStatus: GroupStatus | undefined
  ) => {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;

    const newStatus = currentStatus === "suspended" ? "active" : "suspended";

    if (newStatus === "suspended") {
      // 중지하는 경우 모달 표시
      setSuspendingGroup({
        id: groupId,
        name: group.name,
        status: currentStatus,
      });
      setShowSuspendModal(true);
    } else {
      // 활성화하는 경우 바로 실행
      setGroups((prevGroups) =>
        prevGroups.map((group) =>
          group.id === groupId ? { ...group, status: newStatus } : group
        )
      );
    }
  };

  // 중지 확인 처리
  const handleConfirmSuspend = () => {
    if (!suspendingGroup) return;

    setGroups((prevGroups) =>
      prevGroups.map((group) =>
        group.id === suspendingGroup.id
          ? { ...group, status: "suspended" }
          : group
      )
    );

    setShowSuspendModal(false);
    setSuspendingGroup(null);
  };

  // 중지 취소 처리
  const handleCancelSuspend = () => {
    setShowSuspendModal(false);
    setSuspendingGroup(null);
  };

  // 그룹 삭제
  const handleDeleteGroup = (groupId: string, groupName: string) => {
    if (
      confirm(
        `정말로 "${groupName}" 그룹을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupId)
      );
      alert("그룹이 삭제되었습니다.");
    }
  };

  const handleCreateGroup = () => {
    const validApprovers = requiredApprovers.filter((id) => id !== "");

    // budgetSetup에서 기존 예산 필드로 데이터 복사
    const getCurrentMonthBudget = () => {
      if (newGroup.budgetSetup) {
        const currentMonth = new Date().getMonth() + 1;
        const monthBudget = newGroup.budgetSetup.monthlyBudgets.find(
          (mb) => mb.month === currentMonth
        );
        return {
          amount: monthBudget?.amount || 0,
          currency: newGroup.budgetSetup.currency,
        };
      }
      return newGroup.monthlyBudget;
    };

    const getCurrentQuarterBudget = () => {
      if (newGroup.budgetSetup) {
        const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
        const quarterBudget = newGroup.budgetSetup.quarterlyBudgets.find(
          (qb) => qb.quarter === currentQuarter
        );
        return {
          amount: quarterBudget?.amount || 0,
          currency: newGroup.budgetSetup.currency,
        };
      }
      return newGroup.quarterlyBudget;
    };

    const getYearlyBudget = () => {
      if (newGroup.budgetSetup) {
        return {
          amount: newGroup.budgetSetup.yearlyBudget || 0,
          currency: newGroup.budgetSetup.currency,
        };
      }
      return newGroup.yearlyBudget;
    };

    if (isEditMode && editingGroupId) {
      // 수정 모드
      setGroups((prevGroups) =>
        prevGroups.map((group) => {
          if (group.id === editingGroupId) {
            const budgetHasChanged = isBudgetChanged(group);
            const newStatus = budgetHasChanged
              ? "budget_pending"
              : group.status;

            if (budgetHasChanged) {
              // 예산이 변경된 경우: 기존 예산은 유지하고 pending 필드에 새 예산 저장
              return {
                ...group,
                name: newGroup.name,
                type: newGroup.type,
                description: newGroup.description,
                // 기존 예산 필드는 유지 (운영 중인 예산)
                monthlyBudget: group.monthlyBudget,
                quarterlyBudget: group.quarterlyBudget,
                yearlyBudget: group.yearlyBudget,
                budgetSetup: group.budgetSetup,
                // pending 필드에 수정된 예산 저장 (승인 대기 중인 예산)
                pendingMonthlyBudget: getCurrentMonthBudget(),
                pendingQuarterlyBudget: getCurrentQuarterBudget(),
                pendingYearlyBudget: getYearlyBudget(),
                pendingBudgetSetup: newGroup.budgetSetup || undefined,
                manager: newGroup.manager,
                requiredApprovals: validApprovers,
                status: newStatus,
                budgetModifiedAt: new Date().toISOString(),
                budgetModifiedBy: "현재사용자", // TODO: 실제 사용자 정보
              };
            } else {
              // 예산이 변경되지 않은 경우: 일반 수정사항만 반영
              return {
                ...group,
                name: newGroup.name,
                type: newGroup.type,
                description: newGroup.description,
                manager: newGroup.manager,
                requiredApprovals: validApprovers,
                status: newStatus,
              };
            }
          }
          return group;
        })
      );

      const originalGroup = groups.find((g) => g.id === editingGroupId);
      const budgetChanged = originalGroup && isBudgetChanged(originalGroup);

      if (budgetChanged) {
        alert(
          "예산이 변경되어 재승인이 필요합니다. 승인이 완료될 때까지 기존 예산으로 운영됩니다."
        );
      } else {
        alert("그룹 정보가 수정되었습니다.");
      }
    } else {
      // 생성 모드
      const groupRequest = {
        id: `req-${Date.now()}`,
        ...newGroup,
        monthlyBudget: getCurrentMonthBudget(),
        quarterlyBudget: getCurrentQuarterBudget(),
        yearlyBudget: getYearlyBudget(),
        status: "pending",
        requestedBy: "현재사용자", // TODO: 실제 사용자 정보
        requestedAt: new Date().toISOString(),
        requiredApprovals: validApprovers,
        approvals: [],
        rejections: [],
      };

      console.log("Creating group approval request:", groupRequest);

      // 임시로 새 그룹을 groups 상태에 추가 (실제로는 승인 후 추가되어야 함)
      const newGroupForList: WalletGroup = {
        ...groupRequest,
        id: `group-${Date.now()}`,
        balance: { amount: 0, currency: newGroup.currency },
        budgetUsed: { amount: 0, currency: newGroup.currency },
        quarterlyBudgetUsed: { amount: 0, currency: newGroup.currency },
        yearlyBudgetUsed: { amount: 0, currency: newGroup.currency },
        members: [],
        createdAt: new Date().toISOString().split("T")[0],
        status: "pending",
        requiredApprovals: validApprovers,
        budgetSetup: newGroup.budgetSetup || undefined,
      };

      setGroups((prevGroups) => [...prevGroups, newGroupForList]);

      if (onCreateGroupRequest) {
        onCreateGroupRequest(groupRequest);
      }

      if (onCreateGroup) {
        onCreateGroup();
      }

      alert("그룹 생성 요청이 승인 대기 상태로 등록되었습니다.");
    }

    // 초기화
    handleCloseModal();
    setSelectedYear(currentYear);
    setNewGroup({
      name: "",
      type: "department",
      description: "",
      currency: "BTC" as CryptoCurrency,
      monthlyBudget: { amount: 0, currency: "BTC" },
      quarterlyBudget: { amount: 0, currency: "BTC" },
      yearlyBudget: { amount: 0, currency: "BTC" },
      budgetSetup: null,
      manager: "",
    });
    // 필수 결재자 상태 초기화
    setRequiredApprovers([""]);
    setIsEditMode(false);
    setEditingGroupId(null);
  };

  const handleCloseModal = () => {
    setErrorMessage(null); // 에러 메시지 초기화
    setIsEditMode(false);
    setEditingGroupId(null);

    if (onCloseCreateModal) {
      onCloseCreateModal();
    } else {
      setInternalShowCreateModal(false);
    }
  };

  // 상세보기 모달 닫기
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedGroupForDetail(null);
  };

  return (
    <>
      {/* 그룹 카드 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {groups
          .filter(
            (group) =>
              !group.status ||
              group.status === "active" ||
              group.status === "pending" ||
              group.status === "budget_pending"
          )
          .map((group) => {
            const usagePercentage = getBudgetUsagePercentage(group);
            const isOverBudget = usagePercentage > 100;
            const isNearLimit = usagePercentage > 80;
            const isModerate = usagePercentage > 60;
            const isSuspended = group.status === "suspended";
            const isBudgetPending = group.status === "budget_pending";

            return (
              <div
                key={group.id}
                className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-all ${
                  isSuspended
                    ? "border-gray-300 opacity-75"
                    : isBudgetPending
                    ? "border-yellow-200 bg-amber-25"
                    : "border-gray-200"
                }`}
                style={isBudgetPending ? { backgroundColor: "#fffffe" } : {}}
              >
                {/* 헤더 섹션 */}
                <div
                  className={`p-4 border-b border-gray-100 ${
                    isSuspended ? "bg-gray-50" : "bg-white"
                  }`}
                  style={isBudgetPending ? { backgroundColor: "#fffffe" } : {}}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3
                          className={`font-bold text-lg ${
                            isSuspended ? "text-gray-500" : "text-gray-900"
                          }`}
                        >
                          {group.name}
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(
                            group.type
                          )}`}
                        >
                          {getTypeName(group.type)}
                        </span>
                        {group.budgetSetup && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {group.budgetSetup.year}년 기준
                          </span>
                        )}
                        {isSuspended && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            중지됨
                          </span>
                        )}
                        {isBudgetPending && (
                          <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            예산 수정 승인 대기
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          isSuspended ? "text-gray-500" : "text-gray-600"
                        }`}
                      >
                        {group.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 잔액 및 예산 정보 */}
                <div className="p-4 space-y-4">
                  {/* 현재 기간 예산 잔액 - 개선된 표시 */}
                  <div className="border border-gray-200 p-3 rounded-lg">
                    <div className="flex justify-between items-center">
                      {(() => {
                        const currentBudget = getCurrentPeriodBudget(group);
                        const remaining =
                          currentBudget.budget - currentBudget.used;

                        return (
                          <>
                            <span className="text-sm font-medium text-gray-600">
                              {group.budgetSetup ? "현재 월" : "월간"} 예산 잔액
                            </span>
                            <div className="text-xl font-bold text-gray-900">
                              {formatCryptoAmountWithIcon({
                                amount: remaining,
                                currency: currentBudget.currency,
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* 월 예산 사용 현황 - 시각적 개선 */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {group.budgetSetup ? "현재 월" : "월"} 예산 사용
                      </span>
                      <div className="text-right">
                        {(() => {
                          const currentBudget = getCurrentPeriodBudget(group);
                          return (
                            <>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatCryptoAmount({
                                  amount: currentBudget.used,
                                  currency: currentBudget.currency,
                                })}{" "}
                                /{" "}
                                {formatCryptoAmount({
                                  amount: currentBudget.budget,
                                  currency: currentBudget.currency,
                                })}
                              </div>
                              <div
                                className={`text-xs ${
                                  isOverBudget
                                    ? "text-red-600 font-bold"
                                    : isNearLimit
                                    ? "text-orange-600 font-medium"
                                    : isModerate
                                    ? "text-yellow-600"
                                    : "text-green-600"
                                }`}
                              >
                                {usagePercentage}% 사용
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            isOverBudget
                              ? "bg-red-500"
                              : isNearLimit
                              ? "bg-orange-500"
                              : isModerate
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                          style={{
                            width: `${Math.min(usagePercentage, 100)}%`,
                          }}
                        />
                      </div>
                      {isOverBudget && (
                        <div className="absolute -top-1 -right-1">
                          <svg
                            className="h-5 w-5 text-red-600 animate-pulse"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    {isOverBudget && (
                      <div className="bg-red-100 border border-red-300 rounded-lg px-2 py-1">
                        <p className="text-xs text-red-700 font-medium">
                          ⚠️ 예산 초과!
                        </p>
                      </div>
                    )}
                    {isNearLimit && !isOverBudget && (
                      <div className="bg-orange-100 border border-orange-300 rounded-lg px-2 py-1">
                        <p className="text-xs text-orange-700">
                          주의: 예산 한도 근접
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 예산 정보 */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {group.budgetSetup ? (
                      <div
                        className={`grid divide-x divide-gray-200 ${
                          group.budgetSetup.baseType === "yearly"
                            ? "grid-cols-3"
                            : group.budgetSetup.baseType === "quarterly"
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        {/* 월간 예산 - 항상 표시 */}
                        <div className="p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {getCurrentMonthName()} 예산
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCryptoAmount({
                              amount: getCurrentMonthlyBudgetFromSetup(
                                group.budgetSetup
                              ),
                              currency: group.budgetSetup.currency,
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            잔여:{" "}
                            {formatCryptoAmount({
                              amount:
                                getCurrentMonthlyBudgetFromSetup(
                                  group.budgetSetup
                                ) - group.budgetUsed.amount,
                              currency: group.budgetSetup.currency,
                            })}
                          </div>
                        </div>

                        {/* 분기 예산 - quarterly와 yearly일 때만 */}
                        {(group.budgetSetup.baseType === "quarterly" ||
                          group.budgetSetup.baseType === "yearly") && (
                          <div className="p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              {getCurrentQuarterName()} 예산
                            </div>
                            <div className="text-sm font-semibold">
                              {formatCryptoAmount({
                                amount: getCurrentQuarterlyBudgetFromSetup(
                                  group.budgetSetup
                                ),
                                currency: group.budgetSetup.currency,
                              })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getQuarterlyBudgetUsagePercentage(group)}% 사용
                            </div>
                          </div>
                        )}

                        {/* 연간 예산 - yearly일 때만 */}
                        {group.budgetSetup.baseType === "yearly" && (
                          <div className="p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              {getCurrentYearName()} 예산
                            </div>
                            <div className="text-sm font-semibold">
                              {formatCryptoAmount({
                                amount: getYearlyBudgetFromSetup(
                                  group.budgetSetup
                                ),
                                currency: group.budgetSetup.currency,
                              })}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getYearlyBudgetUsagePercentage(group)}% 사용
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className={`grid divide-x divide-gray-200 ${
                          group.yearlyBudget.amount > 0
                            ? "grid-cols-3"
                            : group.quarterlyBudget.amount > 0
                            ? "grid-cols-2"
                            : "grid-cols-1"
                        }`}
                      >
                        <div className="p-3 text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            월간 예산
                          </div>
                          <div className="text-sm font-semibold">
                            {formatCryptoAmount(group.monthlyBudget)}
                          </div>
                          <div className="text-xs text-gray-400">
                            잔여:{" "}
                            {formatCryptoAmount({
                              amount:
                                group.monthlyBudget.amount -
                                group.budgetUsed.amount,
                              currency: group.monthlyBudget.currency,
                            })}
                          </div>
                        </div>

                        {group.quarterlyBudget.amount > 0 && (
                          <div className="p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              분기 예산
                            </div>
                            <div className="text-sm font-semibold">
                              {formatCryptoAmount(group.quarterlyBudget)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getQuarterlyBudgetUsagePercentage(group)}% 사용
                            </div>
                          </div>
                        )}

                        {group.yearlyBudget.amount > 0 && (
                          <div className="p-3 text-center">
                            <div className="text-xs text-gray-500 mb-1">
                              연간 예산
                            </div>
                            <div className="text-sm font-semibold">
                              {formatCryptoAmount(group.yearlyBudget)}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getYearlyBudgetUsagePercentage(group)}% 사용
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 그룹 정보 */}
                  <div className="space-y-2 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-xs text-gray-500">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {getUserNameById(group.manager)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <svg
                            className="h-4 w-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          결재자 {group.requiredApprovals?.length || 0}명
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDate(group.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* 승인 대기 중인 예산 정보 (budget_pending 상태일 때만 표시) */}
                  {isBudgetPending && group.pendingMonthlyBudget && (
                    <div
                      className="border-2 border-yellow-200 p-3 rounded-lg"
                      style={{ backgroundColor: "#fffffe" }}
                    >
                      <div className="flex items-center justify-end mb-2">
                        <span className="text-xs text-yellow-600">
                          {formatDate(group.budgetModifiedAt || "")}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-yellow-600 mb-1">
                            {new Date().getMonth() + 1}월 예산
                          </div>
                          <div className="font-semibold text-yellow-800">
                            {formatCryptoAmount(group.pendingMonthlyBudget)}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-600 mb-1">
                            {Math.floor(new Date().getMonth() / 3) + 1}분기 예산
                          </div>
                          <div className="font-semibold text-yellow-800">
                            {formatCryptoAmount(
                              group.pendingQuarterlyBudget ||
                                group.quarterlyBudget
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-600 mb-1">
                            {new Date().getFullYear()}년도 예산
                          </div>
                          <div className="font-semibold text-yellow-800">
                            {formatCryptoAmount(
                              group.pendingYearlyBudget || group.yearlyBudget
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 영역 */}
                  <div
                    className={`py-2 ${
                      isSuspended ? "bg-gray-50" : "bg-white"
                    }`}
                    style={
                      isBudgetPending ? { backgroundColor: "#fffffe" } : {}
                    }
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {/* 상세보기 버튼 */}
                      <button
                        onClick={() => handleShowGroupDetail(group)}
                        className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          isSuspended
                            ? "border-gray-200 text-gray-500 bg-transparent hover:border-gray-300 hover:bg-gray-50"
                            : "border-gray-300 text-gray-700 bg-transparent hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        상세보기
                      </button>

                      {/* 중지/재활성/승인상태 버튼 */}
                      {isBudgetPending ? (
                        <button
                          onClick={() => {
                            // 승인 탭으로 이동하는 함수가 필요
                            alert(
                              "승인 탭으로 이동하여 승인 상태를 확인하세요."
                            );
                          }}
                          className="flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border border-yellow-300 text-yellow-700 bg-transparent hover:border-yellow-400 hover:bg-yellow-50 transition-colors"
                        >
                          <ClockIcon className="h-4 w-4 mr-2" />
                          승인 상태
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleToggleGroupStatus(group.id, group.status)
                          }
                          className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                            isSuspended
                              ? "border-gray-200 text-gray-500 bg-transparent hover:border-gray-300 hover:bg-gray-50"
                              : "border-gray-300 text-gray-700 bg-transparent hover:border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          {isSuspended ? (
                            <>
                              <PlayIcon className="h-4 w-4 mr-2" />
                              재활성화
                            </>
                          ) : (
                            <>
                              <PauseIcon className="h-4 w-4 mr-2" />
                              중지
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* 삭제 버튼 - 중지된 상태에서만 표시 */}
                    {isSuspended && (
                      <div className="mt-3">
                        <button
                          onClick={() =>
                            handleDeleteGroup(group.id, group.name)
                          }
                          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-transparent border border-red-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          그룹 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 그룹 생성 모달 */}
      <Modal isOpen={showCreateModal}>
        <div className="bg-white rounded-xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
          {/* 고정 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xl font-semibold text-gray-900">
              {isEditMode ? "그룹 정보 수정" : "새 그룹 생성"}
            </h3>
            <button
              onClick={handleCloseModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-y-auto p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateGroup();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹명 *
                </label>
                <input
                  type="text"
                  required
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="그룹명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  그룹 유형 *
                </label>
                <select
                  value={newGroup.type}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      type: e.target.value as GroupType,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="department">부서</option>
                  <option value="project">프로젝트</option>
                  <option value="team">팀</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="그룹에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자산 *
                </label>
                <select
                  value={newGroup.currency}
                  onChange={(e) =>
                    handleCurrencyChange(e.target.value as CryptoCurrency)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="USDT">Tether (USDT)</option>
                  <option value="USDC">USD Coin (USDC)</option>
                  <option value="SOL">Solana (SOL)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  커스터디 지갑에 보관된 가상자산으로 예산을 관리합니다. 이
                  그룹의 모든 예산은 선택한 자산으로 설정됩니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  기준 년도 *
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  disabled={isEditMode}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    isEditMode
                      ? "bg-gray-50 text-gray-600 cursor-not-allowed"
                      : "focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                >
                  <option value={currentYear}>{currentYear}년</option>
                  <option value={currentYear + 1}>{currentYear + 1}년</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  예산 계산의 기준이 되는 년도입니다. 과거 년도는 선택할 수
                  없습니다.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  관리자 *
                </label>
                <select
                  value={newGroup.manager}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, manager: e.target.value })
                  }
                  disabled={isEditMode}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                    isEditMode
                      ? "bg-gray-50 text-gray-600 cursor-not-allowed"
                      : "focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  }`}
                >
                  <option value="">관리자 선택</option>
                  {getEligibleUsers().map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department}) - {ROLE_NAMES[user.role]}
                    </option>
                  ))}
                </select>
              </div>

              {/* 예산 설정 - 필수 결재자보다 먼저 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    예산 설정
                  </h4>
                  <p className="text-xs text-gray-500">
                    기준 예산을 설정하면 자동으로 하위 기간별 예산이 분배되고, 금액에 따른 필수 결재자가 자동으로 설정됩니다
                  </p>
                </div>

                <div className="space-y-6">
                  {!newGroup.budgetSetup ? (
                    <BudgetSetupForm
                      currency={newGroup.currency}
                      year={selectedYear}
                      onCreateBudgetSetup={handleCreateBudgetSetup}
                    />
                  ) : (
                    <div>
                      <BudgetDistribution
                        budgetSetup={newGroup.budgetSetup}
                        onChange={handleBudgetSetupChange}
                        onError={handleError}
                        className="mb-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setErrorMessage(null);
                          setNewGroup({ ...newGroup, budgetSetup: null });
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        예산 설정 다시하기
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 정책 기반 필수 결재자 설정 */}
              {newGroup.budgetSetup && newGroup.budgetSetup.baseAmount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <PolicyBasedApproverSetup
                    budgetAmount={newGroup.budgetSetup.baseAmount}
                    currency={newGroup.currency}
                    onApproversChange={(approvers) => setRequiredApprovers(approvers)}
                    managerId={newGroup.manager}
                    disabled={isEditMode}
                  />
                </div>
              )}

              {/* 에러 메시지 */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <div className="text-sm text-red-700 font-medium">
                    {errorMessage}
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* 고정 푸터 */}
          <div className="border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  if (isFormValid()) {
                    handleCreateGroup();
                  }
                }}
                disabled={!isFormValid()}
                className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                  isFormValid()
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                title={
                  !isFormValid()
                    ? !isEditMode && !newGroup.manager
                      ? "관리자를 선택해주세요"
                      : !isEditMode && (!newGroup.budgetSetup || newGroup.budgetSetup.baseAmount <= 0)
                      ? "예산을 먼저 설정해주세요"
                      : !isBudgetValid()
                      ? "예산 배분을 정확히 맞춰주세요"
                      : !isEditMode &&
                        requiredApprovers.filter((id) => id !== "").length === 0
                      ? "필수 결재자가 설정되지 않았습니다"
                      : "모든 필수 항목을 입력해주세요"
                    : ""
                }
              >
                {isEditMode ? "수정 완료" : "승인 요청"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 그룹 상세보기 모달 */}
      <Modal isOpen={showDetailModal}>
        <div className="bg-white rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
          {/* 고정 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h3 className="text-xl font-semibold text-gray-900">
              그룹 상세 정보
            </h3>
            <button
              onClick={handleCloseDetailModal}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-y-auto">
            {selectedGroupForDetail && (
              <div className="divide-y divide-gray-200">
                {/* 기본 정보 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    기본 정보
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        그룹명
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedGroupForDetail.name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        그룹 유형
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {getTypeName(selectedGroupForDetail.type)}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        설명
                      </label>
                      <p className="text-base text-gray-800 leading-relaxed">
                        {selectedGroupForDetail.description}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        관리자
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {getUserNameById(selectedGroupForDetail.manager)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        생성일
                      </label>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(selectedGroupForDetail.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 예산 정보 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    예산 정보
                  </h4>

                  {/* budget_pending 상태일 때 경고 메시지 */}
                  {selectedGroupForDetail.status === "budget_pending" && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            예산 수정 승인 대기 중
                          </p>
                          <p className="text-xs text-yellow-600 mt-1">
                            승인이 완료될 때까지 현재 예산으로 운영됩니다.
                            {selectedGroupForDetail.budgetModifiedAt &&
                              ` (수정: ${formatDate(
                                selectedGroupForDetail.budgetModifiedAt
                              )})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 현재 운영 중인 예산 */}
                  <div
                    className={
                      selectedGroupForDetail.status === "budget_pending"
                        ? "mb-6"
                        : ""
                    }
                  >
                    {selectedGroupForDetail.status === "budget_pending" && (
                      <h5 className="text-lg font-semibold text-gray-800 mb-4">
                        현재 운영 중인 예산
                      </h5>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                          월간 예산
                        </label>
                        <div className="text-lg font-bold text-gray-900">
                          {formatCryptoAmountWithIcon(
                            selectedGroupForDetail.monthlyBudget
                          )}
                        </div>
                      </div>
                      {selectedGroupForDetail.quarterlyBudget.amount > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            분기 예산
                          </label>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCryptoAmountWithIcon(
                              selectedGroupForDetail.quarterlyBudget
                            )}
                          </div>
                        </div>
                      )}
                      {selectedGroupForDetail.yearlyBudget.amount > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <label className="block text-sm font-medium text-gray-600 mb-2">
                            연간 예산
                          </label>
                          <div className="text-lg font-bold text-gray-900">
                            {formatCryptoAmountWithIcon(
                              selectedGroupForDetail.yearlyBudget
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 승인 대기 중인 예산 (budget_pending 상태일 때만 표시) */}
                  {selectedGroupForDetail.status === "budget_pending" &&
                    selectedGroupForDetail.pendingMonthlyBudget && (
                      <div>
                        <h5 className="text-lg font-semibold text-yellow-800 mb-4">
                          승인 대기 중인 예산
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                            <label className="block text-sm font-medium text-yellow-700 mb-2">
                              월간 예산
                            </label>
                            <div className="text-lg font-bold text-yellow-900">
                              {formatCryptoAmountWithIcon(
                                selectedGroupForDetail.pendingMonthlyBudget
                              )}
                            </div>
                            {selectedGroupForDetail.pendingMonthlyBudget
                              .amount !==
                              selectedGroupForDetail.monthlyBudget.amount && (
                              <div className="text-xs text-yellow-600 mt-1">
                                변경:{" "}
                                {selectedGroupForDetail.pendingMonthlyBudget
                                  .amount >
                                selectedGroupForDetail.monthlyBudget.amount
                                  ? "+"
                                  : ""}
                                {formatCryptoAmount({
                                  amount:
                                    selectedGroupForDetail.pendingMonthlyBudget
                                      .amount -
                                    selectedGroupForDetail.monthlyBudget.amount,
                                  currency:
                                    selectedGroupForDetail.pendingMonthlyBudget
                                      .currency,
                                })}
                              </div>
                            )}
                          </div>
                          {selectedGroupForDetail.pendingQuarterlyBudget && (
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                              <label className="block text-sm font-medium text-yellow-700 mb-2">
                                분기 예산
                              </label>
                              <div className="text-lg font-bold text-yellow-900">
                                {formatCryptoAmountWithIcon(
                                  selectedGroupForDetail.pendingQuarterlyBudget
                                )}
                              </div>
                              {selectedGroupForDetail.pendingQuarterlyBudget
                                .amount !==
                                selectedGroupForDetail.quarterlyBudget
                                  .amount && (
                                <div className="text-xs text-yellow-600 mt-1">
                                  변경:{" "}
                                  {selectedGroupForDetail.pendingQuarterlyBudget
                                    .amount >
                                  selectedGroupForDetail.quarterlyBudget.amount
                                    ? "+"
                                    : ""}
                                  {formatCryptoAmount({
                                    amount:
                                      selectedGroupForDetail
                                        .pendingQuarterlyBudget.amount -
                                      selectedGroupForDetail.quarterlyBudget
                                        .amount,
                                    currency:
                                      selectedGroupForDetail
                                        .pendingQuarterlyBudget.currency,
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                          {selectedGroupForDetail.pendingYearlyBudget && (
                            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
                              <label className="block text-sm font-medium text-yellow-700 mb-2">
                                연간 예산
                              </label>
                              <div className="text-lg font-bold text-yellow-900">
                                {formatCryptoAmountWithIcon(
                                  selectedGroupForDetail.pendingYearlyBudget
                                )}
                              </div>
                              {selectedGroupForDetail.pendingYearlyBudget
                                .amount !==
                                selectedGroupForDetail.yearlyBudget.amount && (
                                <div className="text-xs text-yellow-600 mt-1">
                                  변경:{" "}
                                  {selectedGroupForDetail.pendingYearlyBudget
                                    .amount >
                                  selectedGroupForDetail.yearlyBudget.amount
                                    ? "+"
                                    : ""}
                                  {formatCryptoAmount({
                                    amount:
                                      selectedGroupForDetail.pendingYearlyBudget
                                        .amount -
                                      selectedGroupForDetail.yearlyBudget
                                        .amount,
                                    currency:
                                      selectedGroupForDetail.pendingYearlyBudget
                                        .currency,
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* 결재자 정보 */}
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">
                    결재자
                  </h4>
                  <div className="space-y-3">
                    {selectedGroupForDetail.requiredApprovals?.map(
                      (approverId, index) => {
                        // 해당 결재자의 승인 기록 찾기
                        const approvalRecord =
                          selectedGroupForDetail.approvals?.find(
                            (approval) => approval.userId === approverId
                          );

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-center">
                              <span className="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mr-3">
                                {index + 1}
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {getUserNameById(approverId)}
                              </span>
                            </div>
                            <div className="text-right">
                              {approvalRecord ? (
                                <div className="flex items-center space-x-2">
                                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-sky-100 text-sky-800">
                                    승인완료
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {formatDate(approvalRecord.approvedAt)}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                                  승인대기
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* 상태 정보 */}
                {selectedGroupForDetail.status &&
                  selectedGroupForDetail.status !== "active" && (
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-6">
                        상태
                      </h4>
                      <div className="inline-flex items-center">
                        <span
                          className={`inline-block px-4 py-2 text-base font-semibold rounded-lg ${
                            selectedGroupForDetail.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : selectedGroupForDetail.status ===
                                "budget_pending"
                              ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                              : selectedGroupForDetail.status === "approved"
                              ? "bg-sky-100 text-sky-800 border border-sky-200"
                              : selectedGroupForDetail.status === "suspended"
                              ? "bg-gray-100 text-gray-800 border border-gray-200"
                              : "bg-red-100 text-red-800 border border-red-200"
                          }`}
                        >
                          {selectedGroupForDetail.status === "pending"
                            ? "승인 대기"
                            : selectedGroupForDetail.status === "budget_pending"
                            ? "예산 수정 승인 대기"
                            : selectedGroupForDetail.status === "approved"
                            ? "활성"
                            : selectedGroupForDetail.status === "suspended"
                            ? "중지됨"
                            : "반려됨"}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* 고정 푸터 - 액션 버튼들 */}
          <div className="border-t border-gray-200 p-6 flex-shrink-0">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleCloseDetailModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleEditFromDetail}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <PencilIcon className="h-4 w-4 mr-2 inline" />
                수정하기
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 그룹 중지 확인 모달 */}
      <Modal isOpen={showSuspendModal} onClose={handleCancelSuspend}>
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                그룹을 중지하시겠습니까?
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">{suspendingGroup?.name}</span>{" "}
                그룹을 중지하려고 합니다.
              </p>
              <div
                className="bg-orange-25 border border-orange-200 rounded-lg p-3 text-left"
                style={{ backgroundColor: "#fffcf5" }}
              >
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-orange-500 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-orange-700">
                    <p className="text-xs">
                      예산 사용이 중단되어 다시 활성화할 수 없습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCancelSuspend}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                취소
              </button>
              <button
                onClick={handleConfirmSuspend}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500"
              >
                중지하기
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
