"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/utils/permissionUtils";
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
  mockExpenses,
  mockGroupRequests,
} from "@/data/groupMockData";
import GroupManagement from "@/components/groups/GroupManagement";
import GroupApprovalTab from "@/components/groups/GroupApprovalTab";
import BudgetStatus from "@/components/groups/BudgetStatus";
import RejectedManagementTab from "@/components/groups/RejectedManagementTab";
import GroupAuditTab from "@/components/groups/GroupAuditTab";
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
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "groups" | "approval" | "budget" | "rejected" | "audit"
  >(initialTab || "groups");

  // 그룹 생성 요청 상태 관리 (DB에서 불러오기)
  const [groupRequests, setGroupRequests] = useState<GroupCreationRequest[]>([...mockGroupRequests]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // DB에서 그룹 요청 목록 불러오기 (pending + approved 상태)
  useEffect(() => {
    const fetchGroupRequests = async () => {
      if (!user?.organizationId) {
        console.log('[fetchGroupRequests] No organizationId, using mock data');
        return;
      }

      setIsLoadingRequests(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

        // pending 상태의 그룹만 가져오기 (승인 탭에 표시할 것들)
        const pendingUrl = `${API_URL}/api/groups?organizationId=${user.organizationId}&status=pending`;

        console.log('[fetchGroupRequests] Fetching pending groups');

        const pendingResponse = await fetch(pendingUrl);
        const pendingData = await pendingResponse.json();

        console.log('[fetchGroupRequests] Pending:', pendingData.length);

        // DB 데이터를 GroupCreationRequest 형태로 변환
        const dbRequests = pendingData.map((g: any) => {
          const budgetPeriods = g.budgetPeriods || [];
          const monthlyBudgets = budgetPeriods
            .filter((bp: any) => bp.periodType === 'monthly')
            .map((bp: any) => ({ month: bp.period, amount: parseFloat(bp.budgetAmount) }))
            .sort((a: any, b: any) => a.month - b.month);

          const quarterlyBudgets = budgetPeriods
            .filter((bp: any) => bp.periodType === 'quarterly')
            .map((bp: any) => ({ quarter: bp.period, amount: parseFloat(bp.budgetAmount) }))
            .sort((a: any, b: any) => a.quarter - b.quarter);

          const yearlyBudgetAmount = parseFloat(g.yearlyBudgetAmount || 0);

          // 승인자 정보
          const approverIds = (g.members || [])
            .filter((m: any) => m.role === 'approver')
            .map((m: any) => m.userId);

          // 승인 기록
          const approvals = (g.approvals || []).map((a: any) => ({
            userId: a.approverId,
            userName: a.approverId,
            approvedAt: a.createdAt,
          }));

          return {
            id: g.id,
            name: g.name,
            type: g.type,
            description: g.description || '',
            currency: g.currency,
            monthlyBudget: { amount: 0, currency: g.currency },
            quarterlyBudget: { amount: 0, currency: g.currency },
            yearlyBudget: { amount: yearlyBudgetAmount, currency: g.currency },
            status: g.status,
            requestedBy: g.requestedBy,
            requestedAt: g.requestedAt,
            requiredApprovals: approverIds,
            approvals: approvals,
            rejections: [],
          } as GroupCreationRequest;
        });

        // mockup 데이터와 병합
        const allRequests = [...dbRequests, ...mockGroupRequests.filter(mr =>
          !dbRequests.some(dr => dr.id === mr.id)
        )];

        setGroupRequests(allRequests);
        console.log('[fetchGroupRequests] Total requests:', allRequests.length);
      } catch (error) {
        console.error('[fetchGroupRequests] Failed:', error);
        setGroupRequests([...mockGroupRequests]);
      } finally {
        setIsLoadingRequests(false);
      }
    };

    fetchGroupRequests();
  }, [user?.organizationId]);

  // 실제 그룹 목록 상태 (DB + mockup)
  const [groups, setGroups] = useState<WalletGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  // DB에서 그룹 목록 불러오기
  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.organizationId) {
        console.log('[fetchGroups] No organizationId');
        setGroups([]);
        setIsLoadingGroups(false);
        return;
      }

      setIsLoadingGroups(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const url = `${API_URL}/api/groups?organizationId=${user.organizationId}`;
        console.log('[fetchGroups] Fetching from:', url);

        const response = await fetch(url);
        const data = await response.json();

        console.log('[fetchGroups] Response:', {
          status: response.status,
          dataType: Array.isArray(data) ? 'array' : typeof data,
          count: Array.isArray(data) ? data.length : 'N/A',
          data: data
        });

        if (Array.isArray(data)) {
          // DB 데이터를 WalletGroup 형태로 변환
          const dbGroups = data.map((g: any) => {
            // budgetPeriods에서 월별/분기별/연간 예산 추출
            const budgetPeriods = g.budgetPeriods || [];
            const monthlyBudgets = budgetPeriods
              .filter((bp: any) => bp.periodType === 'monthly')
              .map((bp: any) => ({
                month: bp.period,
                amount: parseFloat(bp.budgetAmount),
              }))
              .sort((a: any, b: any) => a.month - b.month);

            const quarterlyBudgets = budgetPeriods
              .filter((bp: any) => bp.periodType === 'quarterly')
              .map((bp: any) => ({
                quarter: bp.period,
                amount: parseFloat(bp.budgetAmount),
              }))
              .sort((a: any, b: any) => a.quarter - b.quarter);

            const yearlyBudgetPeriod = budgetPeriods.find((bp: any) => bp.periodType === 'yearly');
            const yearlyBudgetAmount = yearlyBudgetPeriod ? parseFloat(yearlyBudgetPeriod.budgetAmount) : parseFloat(g.yearlyBudgetAmount || 0);

            // 현재 월/분기 예산 가져오기
            const currentMonth = new Date().getMonth() + 1;
            const currentQuarter = Math.ceil(currentMonth / 3);

            const currentMonthBudget = monthlyBudgets.find((mb: any) => mb.month === currentMonth);
            const currentQuarterBudget = quarterlyBudgets.find((qb: any) => qb.quarter === currentQuarter);

            // budgetSetup 구성 - baseType 자동 추론
            let budgetSetup = undefined;
            if (g.budgetYear && (yearlyBudgetAmount > 0 || monthlyBudgets.length > 0)) {
              // baseType 추론: yearly > quarterly > monthly
              let baseType: 'yearly' | 'quarterly' | 'monthly' = 'monthly';
              let baseAmount = 0;

              if (yearlyBudgetAmount > 0) {
                baseType = 'yearly';
                baseAmount = yearlyBudgetAmount;
              } else if (quarterlyBudgets.length > 0) {
                baseType = 'quarterly';
                baseAmount = quarterlyBudgets.reduce((sum: number, qb: any) => sum + qb.amount, 0);
              } else if (monthlyBudgets.length > 0) {
                baseType = 'monthly';
                baseAmount = monthlyBudgets.reduce((sum: number, mb: any) => sum + mb.amount, 0);
              }

              budgetSetup = {
                year: g.budgetYear,
                currency: g.currency,
                baseType,
                baseAmount,
                startDate: `${g.budgetYear}-01-01`,
                endDate: `${g.budgetYear}-12-31`,
                monthlyBudgets,
                quarterlyBudgets,
                yearlyBudget: yearlyBudgetAmount,
              };
            }

            // 승인자 ID 목록 추출
            const approverIds = (g.members || [])
              .filter((m: any) => m.role === 'approver')
              .map((m: any) => m.userId);

            // 승인 기록 추출
            const approvals = (g.approvals || []).map((a: any) => ({
              userId: a.approverId,
              userName: a.approverId, // TODO: 실제 사용자 이름으로 변환 필요
              approvedAt: a.createdAt,
            }));

            return {
              id: g.id,
              name: g.name,
              type: g.type,
              description: g.description || '',
              balance: { amount: 0, currency: g.currency },
              monthlyBudget: {
                amount: currentMonthBudget?.amount || 0,
                currency: g.currency
              },
              quarterlyBudget: {
                amount: currentQuarterBudget?.amount || 0,
                currency: g.currency
              },
              yearlyBudget: {
                amount: yearlyBudgetAmount,
                currency: g.currency
              },
              budgetUsed: { amount: 0, currency: g.currency },
              quarterlyBudgetUsed: { amount: 0, currency: g.currency },
              yearlyBudgetUsed: {
                amount: parseFloat(g.yearlyBudgetUsed || 0),
                currency: g.currency
              },
              members: [],
              createdAt: g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
              status: g.status,
              requiredApprovals: approverIds,
              approvals: approvals,
              budgetSetup,
            };
          });

          setGroups(dbGroups);
          console.log('[fetchGroups] Groups loaded:', dbGroups.length, 'groups');
        }
      } catch (error) {
        console.error('[fetchGroups] Failed to load groups:', error);
        setGroups([]);
      } finally {
        setIsLoadingGroups(false);
      }
    };

    fetchGroups();
  }, [user?.organizationId]);

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
      console.log('[localStorage] Saved groupRequests:', groupRequests.length);
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
        {user && hasPermission(user, 'groups.create') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            그룹 생성
          </button>
        )}
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
              count: groupRequests.filter((r) => r.status === "pending").length,
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
          currentUser={user}
          initialGroups={groups}
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

              // 요청 찾기
              const request = groupRequests.find(r => r.id === requestId);
              if (!request) {
                console.error("Request not found:", requestId);
                return;
              }

              // approvals 배열에 현재 사용자 승인 추가
              const newApproval = {
                userId: user?.id || "current-user-id",
                userName: user?.name || "현재 사용자",
                approvedAt: new Date().toISOString(),
              };

              let isFullyApproved = false;

              // 상태 업데이트
              setGroupRequests(prev => prev.map(r => {
                if (r.id === requestId) {
                  const updatedApprovals = [...(r.approvals || []), newApproval];

                  // 모든 필수 결재자가 승인했는지 확인
                  const allApproved = r.requiredApprovals?.every(approverId =>
                    updatedApprovals.some(approval => approval.userId === approverId)
                  );

                  isFullyApproved = allApproved;

                  // 모든 승인이 완료되면 DB에 저장하고 그룹 목록 새로고침
                  if (allApproved) {
                    // DB에 그룹 승인 API 호출
                    const approveGroupInDB = async () => {
                      try {
                        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                        const approveUrl = `${API_URL}/api/groups/${r.id}/approve`;

                        console.log('[approveGroup] Calling:', approveUrl);

                        const approveResponse = await fetch(approveUrl, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            approverId: user?.id || 'current-user-id',
                          }),
                        });

                        if (!approveResponse.ok) {
                          throw new Error(`Approval failed: ${approveResponse.status}`);
                        }

                        const approvedGroup = await approveResponse.json();
                        console.log('[approveGroup] Success:', approvedGroup);

                        // 그룹 목록 다시 불러오기
                        const groupsUrl = `${API_URL}/api/groups?organizationId=${user?.organizationId}`;
                        const groupsResponse = await fetch(groupsUrl);
                        const groupsData = await groupsResponse.json();

                        if (Array.isArray(groupsData)) {
                          const dbGroups = groupsData.map((g: any) => {
                            // budgetPeriods에서 월별/분기별/연간 예산 추출
                            const budgetPeriods = g.budgetPeriods || [];
                            const monthlyBudgets = budgetPeriods
                              .filter((bp: any) => bp.periodType === 'monthly')
                              .map((bp: any) => ({
                                month: bp.period,
                                amount: parseFloat(bp.budgetAmount),
                              }))
                              .sort((a: any, b: any) => a.month - b.month);

                            const quarterlyBudgets = budgetPeriods
                              .filter((bp: any) => bp.periodType === 'quarterly')
                              .map((bp: any) => ({
                                quarter: bp.period,
                                amount: parseFloat(bp.budgetAmount),
                              }))
                              .sort((a: any, b: any) => a.quarter - b.quarter);

                            const yearlyBudgetPeriod = budgetPeriods.find((bp: any) => bp.periodType === 'yearly');
                            const yearlyBudgetAmount = yearlyBudgetPeriod ? parseFloat(yearlyBudgetPeriod.budgetAmount) : parseFloat(g.yearlyBudgetAmount || 0);

                            // 현재 월/분기 예산 가져오기
                            const currentMonth = new Date().getMonth() + 1;
                            const currentQuarter = Math.ceil(currentMonth / 3);

                            const currentMonthBudget = monthlyBudgets.find((mb: any) => mb.month === currentMonth);
                            const currentQuarterBudget = quarterlyBudgets.find((qb: any) => qb.quarter === currentQuarter);

                            // budgetSetup 구성 - baseType 자동 추론
                            let budgetSetup = undefined;
                            if (g.budgetYear && (yearlyBudgetAmount > 0 || monthlyBudgets.length > 0)) {
                              // baseType 추론: yearly > quarterly > monthly
                              let baseType: 'yearly' | 'quarterly' | 'monthly' = 'monthly';
                              let baseAmount = 0;

                              if (yearlyBudgetAmount > 0) {
                                baseType = 'yearly';
                                baseAmount = yearlyBudgetAmount;
                              } else if (quarterlyBudgets.length > 0) {
                                baseType = 'quarterly';
                                baseAmount = quarterlyBudgets.reduce((sum: number, qb: any) => sum + qb.amount, 0);
                              } else if (monthlyBudgets.length > 0) {
                                baseType = 'monthly';
                                baseAmount = monthlyBudgets.reduce((sum: number, mb: any) => sum + mb.amount, 0);
                              }

                              budgetSetup = {
                                year: g.budgetYear,
                                currency: g.currency,
                                baseType,
                                baseAmount,
                                startDate: `${g.budgetYear}-01-01`,
                                endDate: `${g.budgetYear}-12-31`,
                                monthlyBudgets,
                                quarterlyBudgets,
                                yearlyBudget: yearlyBudgetAmount,
                              };
                            }

                            // 승인자 ID 목록 추출
                            const approverIds = (g.members || [])
                              .filter((m: any) => m.role === 'approver')
                              .map((m: any) => m.userId);

                            // 승인 기록 추출
                            const approvals = (g.approvals || []).map((a: any) => ({
                              userId: a.approverId,
                              userName: a.approverId,
                              approvedAt: a.createdAt,
                            }));

                            return {
                              id: g.id,
                              name: g.name,
                              type: g.type,
                              description: g.description || '',
                              balance: { amount: 0, currency: g.currency },
                              monthlyBudget: {
                                amount: currentMonthBudget?.amount || 0,
                                currency: g.currency
                              },
                              quarterlyBudget: {
                                amount: currentQuarterBudget?.amount || 0,
                                currency: g.currency
                              },
                              yearlyBudget: {
                                amount: yearlyBudgetAmount,
                                currency: g.currency
                              },
                              budgetUsed: { amount: 0, currency: g.currency },
                              quarterlyBudgetUsed: { amount: 0, currency: g.currency },
                              yearlyBudgetUsed: {
                                amount: parseFloat(g.yearlyBudgetUsed || 0),
                                currency: g.currency
                              },
                              members: [],
                              createdAt: g.createdAt ? new Date(g.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                              status: g.status,
                              requiredApprovals: approverIds,
                              approvals: approvals,
                              budgetSetup,
                            };
                          });

                          setGroups(dbGroups);
                          console.log('[approveGroup] Groups refreshed:', dbGroups.length);

                          // 승인 완료 후 그룹 관리 탭으로 이동
                          setTimeout(() => {
                            handleTabChange("groups");
                          }, 2000);
                        }
                      } catch (error) {
                        console.error('[approveGroup] Failed:', error);
                        alert('그룹 승인 처리 중 오류가 발생했습니다.');
                      }
                    };

                    approveGroupInDB();
                  }

                  return {
                    ...r,
                    approvals: updatedApprovals,
                    status: allApproved ? "approved" : "pending"
                  };
                }
                return r;
              }));

              console.log("Approval processed successfully. Fully approved:", isFullyApproved);
            }}
          onRejectRequest={(requestId, reason) => {
            console.log(
              "Rejecting group request:",
              requestId,
              "Reason:",
              reason
            );

            // rejections 배열에 반려 기록 추가
            setGroupRequests(prev => prev.map(r => {
              if (r.id === requestId) {
                return {
                  ...r,
                  rejections: [
                    ...(r.rejections || []),
                    {
                      userId: user?.id || "current-user-id",
                      userName: user?.name || "현재 사용자",
                      rejectedAt: new Date().toISOString(),
                      reason: reason,
                    }
                  ],
                  status: "rejected"
                };
              }
              return r;
            }));
          }}
          onReapproveRequest={(requestId) => {
            console.log("Re-approving group request:", requestId);

            // 반려된 요청을 다시 승인 대기 상태로 변경
            setGroupRequests(prev => prev.map(r => {
              if (r.id === requestId) {
                return {
                  ...r,
                  status: "pending",
                  rejections: [], // 반려 기록 초기화
                };
              }
              return r;
            }));
          }}
        />
      )}



      {/* 예산 현황 탭 */}
      {activeTab === "budget" && <BudgetStatus groups={groups} />}

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
    </div>
  );
}
