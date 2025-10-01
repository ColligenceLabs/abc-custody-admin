"use client";

import React, { useState } from "react";
import { Currency } from "@/types/withdrawal";
import { APPROVAL_POLICIES, ApprovalPolicy } from "@/utils/approverAssignment";
import { Modal } from "@/components/common/Modal";
import { MOCK_USERS, getActiveUsers } from "@/data/userMockData";
import { formatUserDisplay } from "@/utils/userHelpers";
import {
  createPolicyLog,
  savePolicyLog,
  comparePolicy,
  initializeMockData,
  getPolicyLogsByPolicyId,
} from "@/utils/policyLogUtils";
import PolicyLogViewer from "./PolicyLogViewer";

interface PolicyManagementProps {
  onPolicyChange?: (policies: ApprovalPolicy[]) => void;
}

export default function PolicyManagement({
  onPolicyChange,
}: PolicyManagementProps) {
  // 현재 사용자 정보 (실제 구현에서는 인증 컨텍스트에서 가져올 것)
  const currentUser = {
    id: "2", // 박재무
    name: "박재무",
  };

  const [isEditing] = useState(true); // 항상 편집 모드
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [selectedPolicyDescription, setSelectedPolicyDescription] = useState<string | null>(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [suspendPolicyId, setSuspendPolicyId] = useState<string | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [editingApprovers, setEditingApprovers] = useState<{
    [key: string]: string[];
  }>({});
  const [editingPolicyData, setEditingPolicyData] = useState<{
    [key: string]: {
      description: string;
      minAmount: number;
      maxAmount: number;
    };
  }>({});
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>("");
  const [modalApprovers, setModalApprovers] = useState<string[]>([""]);

  // 새 정책 생성을 위한 state
  const [newPolicyDescription, setNewPolicyDescription] = useState<string>("");
  const [newPolicyMinAmount, setNewPolicyMinAmount] = useState<number>(0);
  const [newPolicyMaxAmount, setNewPolicyMaxAmount] =
    useState<number>(Infinity);

  const filteredPolicies = APPROVAL_POLICIES.filter(
    (policy) => policy.currency === "KRW"
  );

  const formatAmount = (amount: number, currency: Currency) => {
    if (amount === 0) return "0";
    if (amount === Infinity) return "무제한";
    return new Intl.NumberFormat("ko-KR").format(amount);
  };

  const getRiskLevel = (approverCount: number) => {
    if (approverCount <= 2) return { level: "낮음", color: "text-blue-600" };
    if (approverCount === 3) return { level: "보통", color: "text-yellow-600" };
    if (approverCount === 4) return { level: "높음", color: "text-orange-600" };
    return { level: "매우 높음", color: "text-red-600" };
  };

  const handleEditPolicy = (policyId: string) => {
    const policy = APPROVAL_POLICIES.find(
      (p) => `${p.currency}-${filteredPolicies.indexOf(p)}` === policyId
    );
    if (policy) {
      // 결재자 정보 초기화
      setEditingApprovers((prev) => ({
        ...prev,
        [policyId]: [...policy.requiredApprovers],
      }));
      // 정책 데이터 초기화
      setEditingPolicyData((prev) => ({
        ...prev,
        [policyId]: {
          description: policy.description,
          minAmount: policy.minAmount,
          maxAmount: policy.maxAmount,
        },
      }));
    }
    setEditingPolicy(policyId);
  };

  const handleSavePolicy = (policyId: string) => {
    const policyIndex = parseInt(policyId.split("-")[1]);
    const policy = filteredPolicies[policyIndex];
    if (policy) {
      // 변경 전 정책 상태 저장 (로깅용)
      const oldPolicy = {
        description: policy.description,
        minAmount: policy.minAmount,
        maxAmount: policy.maxAmount,
        requiredApprovers: [...policy.requiredApprovers],
      };

      // 새로운 정책 상태 준비
      const newPolicy = { ...oldPolicy };

      // 결재자 정보 저장
      if (editingApprovers[policyId]) {
        policy.requiredApprovers = [...editingApprovers[policyId]];
        newPolicy.requiredApprovers = [...editingApprovers[policyId]];
      }
      // 정책 데이터 저장
      if (editingPolicyData[policyId]) {
        policy.description = editingPolicyData[policyId].description;
        policy.minAmount = editingPolicyData[policyId].minAmount;
        policy.maxAmount = editingPolicyData[policyId].maxAmount;

        newPolicy.description = editingPolicyData[policyId].description;
        newPolicy.minAmount = editingPolicyData[policyId].minAmount;
        newPolicy.maxAmount = editingPolicyData[policyId].maxAmount;
      }

      // 변경사항 비교 및 로그 생성
      const changes = comparePolicy(oldPolicy, newPolicy);
      if (changes.length > 0) {
        const log = createPolicyLog(
          "UPDATE",
          policyId,
          policy.description,
          currentUser.id,
          currentUser.name,
          changes
        );
        savePolicyLog(log);
        console.log("정책 수정 로그 저장:", log);
      }

      if (onPolicyChange) {
        onPolicyChange(APPROVAL_POLICIES);
      }
    }
    setEditingPolicy(null);
  };

  const handleCancelEdit = () => {
    setEditingPolicy(null);
    setEditingApprovers({});
    setEditingPolicyData({});
  };

  const handleAddPolicy = () => {
    setShowAddPolicyModal(true);
  };

  const handleSaveNewPolicy = () => {
    // 입력값 검증
    if (!newPolicyDescription.trim()) {
      alert("정책 설명을 입력해주세요.");
      return;
    }

    // 새 정책 생성 (실제 구현에서는 서버에 저장)
    const newPolicyId = `KRW-${Date.now()}`;
    const filteredApprovers = modalApprovers.filter((a) => a.length > 0);

    // 정책 생성 로그 저장 - 모든 필드 포함
    const log = createPolicyLog(
      "CREATE",
      newPolicyId,
      newPolicyDescription,
      currentUser.id,
      currentUser.name,
      [
        {
          field: "description",
          oldValue: null,
          newValue: newPolicyDescription,
        },
        {
          field: "minAmount",
          oldValue: null,
          newValue: newPolicyMinAmount,
        },
        {
          field: "maxAmount",
          oldValue: null,
          newValue: newPolicyMaxAmount,
        },
        {
          field: "requiredApprovers",
          oldValue: [],
          newValue: filteredApprovers,
        },
      ]
    );
    savePolicyLog(log);
    console.log("새 정책 생성 로그 저장:", log);

    // TODO: 실제 정책을 APPROVAL_POLICIES에 추가하는 로직 구현

    // 모달 닫기 및 입력값 초기화
    setShowAddPolicyModal(false);
    setNewPolicyDescription("");
    setNewPolicyMinAmount(0);
    setNewPolicyMaxAmount(Infinity);
    setSelectedRiskLevel("");
    setModalApprovers([""]);
  };

  const getApproversForPolicy = (
    policyId: string,
    originalApprovers: string[]
  ) => {
    return editingApprovers[policyId] || originalApprovers;
  };

  const handleApproverChange = (
    policyId: string,
    index: number,
    newValue: string
  ) => {
    const currentApprovers = getApproversForPolicy(policyId, []);
    const updatedApprovers = [...currentApprovers];
    updatedApprovers[index] = newValue;
    setEditingApprovers((prev) => ({
      ...prev,
      [policyId]: updatedApprovers,
    }));
  };

  const handleAddApprover = (policyId: string, originalApprovers: string[]) => {
    const currentApprovers = getApproversForPolicy(policyId, originalApprovers);
    setEditingApprovers((prev) => ({
      ...prev,
      [policyId]: [...currentApprovers, ""],
    }));
  };

  const handleRemoveApprover = (
    policyId: string,
    index: number,
    originalApprovers: string[]
  ) => {
    const currentApprovers = getApproversForPolicy(policyId, originalApprovers);
    const updatedApprovers = currentApprovers.filter((_, i) => i !== index);
    if (updatedApprovers.length === 0) {
      updatedApprovers.push("");
    }
    setEditingApprovers((prev) => ({
      ...prev,
      [policyId]: updatedApprovers,
    }));
  };

  const availableUsers = getActiveUsers();

  // 위험도에 따른 추천 결재자 반환
  const getRecommendedApprovers = (riskLevel: string): string[] => {
    switch (riskLevel) {
      case "low":
        return ["박재무", "윤보안"];
      case "medium":
        return ["박재무", "윤보안", "이기술"];
      case "high":
        return ["박재무", "윤보안", "이기술", "송컴플"];
      case "very_high":
        return ["박재무", "윤보안", "이기술", "송컴플", "김대표"];
      default:
        return [];
    }
  };

  // 위험도 변경 핸들러
  const handleRiskLevelChange = (riskLevel: string) => {
    setSelectedRiskLevel(riskLevel);

    // 추천 결재자를 가져와서 자동으로 설정
    const recommended = getRecommendedApprovers(riskLevel);
    if (recommended.length > 0) {
      setModalApprovers(recommended);
    } else {
      setModalApprovers([""]);
    }
  };

  // 모달 결재자 관리 함수들
  const handleModalApproverChange = (index: number, value: string) => {
    const updated = [...modalApprovers];
    updated[index] = value;
    setModalApprovers(updated);
  };

  const handleAddModalApprover = () => {
    setModalApprovers([...modalApprovers, ""]);
  };

  const handleRemoveModalApprover = (index: number) => {
    if (modalApprovers.length > 1) {
      setModalApprovers(modalApprovers.filter((_, i) => i !== index));
    }
  };

  // 정책 데이터 변경 핸들러
  const handlePolicyDataChange = (
    policyId: string,
    field: "description" | "minAmount" | "maxAmount",
    value: string | number
  ) => {
    setEditingPolicyData((prev) => ({
      ...prev,
      [policyId]: {
        ...prev[policyId],
        [field]: value,
      },
    }));
  };

  // 정책 정지 시작 (모달 열기)
  const handleSuspendPolicy = (policyId: string) => {
    setSuspendPolicyId(policyId);
    setShowSuspendConfirm(true);
    setSuspendReason("");
  };

  // 실제 정책 정지 실행
  const confirmSuspendPolicy = () => {
    if (!suspendPolicyId || !suspendReason.trim()) return;

    const policyIndex = parseInt(suspendPolicyId.split("-")[1]);
    const policy = filteredPolicies[policyIndex];
    if (policy) {
      // 정책 정지 로그 저장
      const log = createPolicyLog(
        "SUSPEND",
        suspendPolicyId,
        policy.description,
        currentUser.id,
        currentUser.name,
        [
          {
            field: "status",
            oldValue: "ACTIVE",
            newValue: "SUSPENDED",
          },
        ],
        { reason: suspendReason }
      );
      savePolicyLog(log);
      console.log("정책 정지 로그 저장:", log);

      // TODO: 실제 정책 정지 로직 구현 (현재는 모킹 데이터이므로 생략)
      alert(`정책 "${policy.description}"이 정지되었습니다.`);
    }

    // 모달 닫기
    setShowSuspendConfirm(false);
    setSuspendPolicyId(null);
    setSuspendReason("");
  };

  // 정지 취소
  const cancelSuspendPolicy = () => {
    setShowSuspendConfirm(false);
    setSuspendPolicyId(null);
    setSuspendReason("");
  };

  // 정책별 최근 이력 가져오기
  const getRecentHistoryForPolicy = (policyId: string) => {
    const logs = getPolicyLogsByPolicyId(policyId);
    return logs.slice(0, 2); // 최근 2개만
  };

  // 시간 포맷팅 (간단한 형태)
  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - logTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`;
    }
  };

  // 액션 텍스트 변환
  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE':
        return '생성';
      case 'UPDATE':
        return '수정';
      case 'SUSPEND':
        return '정지';
      default:
        return action;
    }
  };

  // 액션별 색상 클래스
  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'text-blue-600';
      case 'UPDATE':
        return 'text-yellow-600';
      case 'SUSPEND':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Outside the box */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">결재 정책 관리</h2>
          <p className="text-gray-600 mt-1">
            거래 금액에 따른 결재 정책을 관리합니다
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowLogViewer(true)}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
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
            <span>변경 이력</span>
          </button>
        </div>
      </div>

      {/* Content - Inside the box */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">정책 목록</h3>
            <button
              onClick={handleAddPolicy}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>새 정책 추가</span>
            </button>
          </div>

          <div className="space-y-4">
            {filteredPolicies.map((policy, index) => {
              const risk = getRiskLevel(policy.requiredApprovers.length);
              const policyId = `${policy.currency}-${index}`;
              const isEditingThis = editingPolicy === policyId;

              return (
                <div
                  key={policyId}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium text-gray-900">
                          {policy.description}
                        </h4>
                        <span className={`text-sm font-medium ${risk.color}`}>
                          위험도: {risk.level} (
                          {policy.requiredApprovers.length}명 승인)
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatAmount(policy.minAmount, policy.currency)}원 ~{" "}
                        {formatAmount(policy.maxAmount, policy.currency)}원
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {isEditingThis ? (
                        <>
                          <button
                            onClick={() => handleSavePolicy(policyId)}
                            className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors"
                          >
                            저장
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditPolicy(policyId)}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                          >
                            편집
                          </button>
                          <button
                            onClick={() => handleSuspendPolicy(policyId)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                          >
                            정지
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {isEditingThis ? (
                    <div className="space-y-4">
                      {/* 정책 정보 편집 */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">
                          정책 정보 편집
                        </h5>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            정책 설명
                          </label>
                          <input
                            type="text"
                            value={
                              editingPolicyData[policyId]?.description ||
                              policy.description
                            }
                            onChange={(e) =>
                              handlePolicyDataChange(
                                policyId,
                                "description",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="정책 설명을 입력하세요"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              최소 금액 (원)
                            </label>
                            <input
                              type="number"
                              value={
                                editingPolicyData[policyId]?.minAmount ??
                                policy.minAmount
                              }
                              onChange={(e) =>
                                handlePolicyDataChange(
                                  policyId,
                                  "minAmount",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              최대 금액 (원)
                            </label>
                            <input
                              type="number"
                              value={
                                editingPolicyData[policyId]?.maxAmount ===
                                Infinity
                                  ? ""
                                  : editingPolicyData[policyId]?.maxAmount ??
                                    policy.maxAmount
                              }
                              onChange={(e) =>
                                handlePolicyDataChange(
                                  policyId,
                                  "maxAmount",
                                  e.target.value === ""
                                    ? Infinity
                                    : parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="무제한"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 결재자 편집 */}
                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-900">
                          필요 결재자 편집
                        </h5>
                        <div className="space-y-2">
                          {(() => {
                            const currentApprovers = getApproversForPolicy(
                              policyId,
                              policy.requiredApprovers
                            );
                            return currentApprovers.map(
                              (approver, approverIndex) => (
                                <div
                                  key={approverIndex}
                                  className="flex items-center space-x-2"
                                >
                                  <span className="text-sm text-gray-500 w-6">
                                    {approverIndex + 1}.
                                  </span>
                                  <select
                                    value={approver}
                                    onChange={(e) =>
                                      handleApproverChange(
                                        policyId,
                                        approverIndex,
                                        e.target.value
                                      )
                                    }
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  >
                                    <option value="">결재자 선택</option>
                                    {availableUsers.map((user) => (
                                      <option key={user.id} value={user.name}>
                                        {formatUserDisplay(
                                          user,
                                          "namePosition"
                                        )}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() =>
                                      handleRemoveApprover(
                                        policyId,
                                        approverIndex,
                                        policy.requiredApprovers
                                      )
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="결재자 제거"
                                  >
                                    <svg
                                      className="w-4 h-4"
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
                              )
                            );
                          })()}
                          <div className="flex justify-center mt-2">
                            <button
                              onClick={() =>
                                handleAddApprover(
                                  policyId,
                                  policy.requiredApprovers
                                )
                              }
                              className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4v16m8-8H4"
                                />
                              </svg>
                              <span>결재자 추가</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">
                          필요 결재자
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {policy.requiredApprovers.map(
                            (approver, approverIndex) => (
                              <div
                                key={approver}
                                className="flex items-center space-x-1"
                              >
                                <span className="text-xs text-gray-500">
                                  {approverIndex + 1}.
                                </span>
                                <span className="text-xs text-gray-700">
                                  {approver}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      {/* 최근 변경 이력 섹션 */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-gray-900 text-sm">
                            최근 변경 이력
                          </h5>
                          <button
                            onClick={() => {
                              setSelectedPolicyId(policyId);
                              setSelectedPolicyDescription(policy.description);
                              setShowLogViewer(true);
                            }}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            세부 이력
                          </button>
                        </div>
                        {(() => {
                          const recentHistory = getRecentHistoryForPolicy(policyId);
                          if (recentHistory.length === 0) {
                            return (
                              <p className="text-xs text-gray-500">
                                최근 변경 이력이 없습니다.
                              </p>
                            );
                          }
                          return (
                            <div className="space-y-1">
                              {recentHistory.map((log) => (
                                <div key={log.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className={`font-medium ${getActionColor(log.action)}`}>
                                      {getActionText(log.action)}
                                    </span>
                                    <span className="text-gray-600">
                                      {log.userName}
                                    </span>
                                  </div>
                                  <span className="text-gray-500">
                                    {formatRelativeTime(log.timestamp)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Policy Modal */}
      <Modal isOpen={showAddPolicyModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              새 정책 추가
            </h3>
            <button
              onClick={() => {
                setShowAddPolicyModal(false);
                setNewPolicyDescription("");
                setNewPolicyMinAmount(0);
                setNewPolicyMaxAmount(Infinity);
                setSelectedRiskLevel("");
                setModalApprovers([""]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                통화
              </label>
              <input
                type="text"
                value="KRW"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 금액
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={newPolicyMinAmount === 0 ? "" : newPolicyMinAmount}
                  onChange={(e) =>
                    setNewPolicyMinAmount(Number(e.target.value) || 0)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 금액
                </label>
                <input
                  type="number"
                  placeholder="무제한"
                  value={
                    newPolicyMaxAmount === Infinity ? "" : newPolicyMaxAmount
                  }
                  onChange={(e) =>
                    setNewPolicyMaxAmount(
                      e.target.value === "" ? Infinity : Number(e.target.value)
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                정책 설명
              </label>
              <input
                type="text"
                placeholder="예: 소액 거래"
                value={newPolicyDescription}
                onChange={(e) => setNewPolicyDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                위험도
              </label>
              <select
                value={selectedRiskLevel}
                onChange={(e) => handleRiskLevelChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">위험도 선택</option>
                <option value="low">낮음 (2명 승인)</option>
                <option value="medium">보통 (3명 승인)</option>
                <option value="high">높음 (4명 승인)</option>
                <option value="very_high">매우 높음 (5명 이상 승인)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                위험도에 따라 권장 결재자 수가 달라집니다
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                필요 결재자
              </label>

              {/* 위험도 기반 추천 결재자 표시 */}
              {selectedRiskLevel && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg
                      className="w-4 h-4 text-blue-600 mr-1"
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
                    <span className="text-sm font-medium text-blue-800">
                      위험도 기반 추천 결재자
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {getRecommendedApprovers(selectedRiskLevel).map(
                      (approver, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                        >
                          {index + 1}. {approver}
                        </span>
                      )
                    )}
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    위험도 '
                    {
                      getRiskLevel(
                        getRecommendedApprovers(selectedRiskLevel).length
                      ).level
                    }
                    '에 따른 추천 결재자입니다
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {modalApprovers.map((approver, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 w-6">
                      {index + 1}.
                    </span>
                    <select
                      value={approver}
                      onChange={(e) =>
                        handleModalApproverChange(index, e.target.value)
                      }
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">결재자 선택</option>
                      {availableUsers.map((user) => (
                        <option key={user.id} value={user.name}>
                          {formatUserDisplay(user, "namePosition")}
                        </option>
                      ))}
                    </select>
                    {modalApprovers.length > 1 && (
                      <button
                        onClick={() => handleRemoveModalApprover(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="결재자 제거"
                      >
                        <svg
                          className="w-4 h-4"
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
                    )}
                  </div>
                ))}

                <div className="flex justify-center mt-2">
                  <button
                    onClick={handleAddModalApprover}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-1"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>결재자 추가</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddPolicyModal(false);
                  setNewPolicyDescription("");
                  setNewPolicyMinAmount(0);
                  setNewPolicyMaxAmount(Infinity);
                  setSelectedRiskLevel("");
                  setModalApprovers([""]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveNewPolicy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Suspend Confirmation Modal */}
      <Modal isOpen={showSuspendConfirm} onClose={cancelSuspendPolicy}>
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg">
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                정책 정지 확인
              </h3>
              <p className="text-gray-600">
                정말로 이 정책을 정지하시겠습니까?
                <br />
                정지된 정책은 더 이상 사용할 수 없습니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정지 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                  placeholder="정지 사유를 입력해주세요"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelSuspendPolicy}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmSuspendPolicy}
                disabled={!suspendReason.trim()}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                정지
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Policy Log Viewer */}
      <PolicyLogViewer
        isOpen={showLogViewer}
        onClose={() => {
          setShowLogViewer(false);
          setSelectedPolicyId(null);
          setSelectedPolicyDescription(null);
        }}
        policyId={selectedPolicyId || undefined}
        policyDescription={selectedPolicyDescription || undefined}
      />
    </div>
  );
}
