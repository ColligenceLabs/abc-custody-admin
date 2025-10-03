"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  WithdrawalManagementProps,
  WithdrawalRequest,
} from "@/types/withdrawal";
import {
  formatAmount,
  formatDateTime,
} from "@/utils/withdrawalHelpers";
import { StatusBadge } from "./withdrawal/StatusBadge";
import { CreateWithdrawalModal } from "./withdrawal/CreateWithdrawalModal";
import {
  mockWithdrawalRequests,
  networkAssets,
  whitelistedAddresses,
} from "@/data/mockWithdrawalData";

export default function IndividualWithdrawalManagement({
  plan,
  initialTab,
}: WithdrawalManagementProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"requests" | "history">("requests");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

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

  const mockRequests = mockWithdrawalRequests;

  const handleCreateRequest = () => {
    console.log("Creating withdrawal request:", newRequest);
    setShowCreateModal(false);
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
    alert("출금 신청이 접수되었습니다.");
  };

  // 개인용: 진행 중인 요청과 완료된 요청으로 분류
  const activeRequests = mockRequests.filter(
    (r) => !["completed", "cancelled", "rejected"].includes(r.status)
  );
  const completedRequests = mockRequests.filter((r) =>
    ["completed", "cancelled", "rejected"].includes(r.status)
  );

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
                    신청 일시
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">진행 중인 출금이 없습니다</p>
                    </td>
                  </tr>
                ) : (
                  activeRequests.map((request) => (
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
                        {formatDateTime(request.initiatedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 출금 히스토리 탭 */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
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
                {completedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <CheckCircleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">출금 히스토리가 없습니다</p>
                    </td>
                  </tr>
                ) : (
                  completedRequests.map((request) => (
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
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 출금 신청 모달 */}
      <CreateWithdrawalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateRequest}
        newRequest={newRequest}
        onRequestChange={setNewRequest}
        networkAssets={networkAssets}
        whitelistedAddresses={whitelistedAddresses}
      />

      {/* 하단 여백 추가 */}
      <div className="pb-8"></div>
    </div>
  );
}
