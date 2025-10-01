/**
 * 정책 기반 필수 결재자 설정 컴포넌트
 * 예산 금액에 따라 자동으로 정책을 매칭하고 필수 결재자를 설정
 */

import React, { useState, useEffect } from "react";
import { CryptoCurrency } from "@/types/groups";
import { User, ROLE_NAMES } from "@/types/user";
import { MOCK_USERS } from "@/data/userMockData";
import {
  selectApproversByPolicy,
  formatCurrencyKRW,
  getRiskLevelColor,
  convertToKRW
} from "@/utils/dynamicApproverSelector";
import { PolicyMatchResult } from "@/types/approval";

interface PolicyBasedApproverSetupProps {
  budgetAmount: number;
  currency: CryptoCurrency;
  onApproversChange: (approvers: string[]) => void;
  managerId?: string;
  disabled?: boolean;
  className?: string;
}

export default function PolicyBasedApproverSetup({
  budgetAmount,
  currency,
  onApproversChange,
  managerId,
  disabled = false,
  className = ""
}: PolicyBasedApproverSetupProps) {
  const [policyMatch, setPolicyMatch] = useState<PolicyMatchResult | null>(null);
  const [customApprovers, setCustomApprovers] = useState<string[]>([]);
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentBudgetAmount, setCurrentBudgetAmount] = useState<number>(0);

  // 결재자로 선택 가능한 사용자 필터링
  const getEligibleApprovers = (excludeCurrentSelection: boolean = true) => {
    const selectedUserIds = excludeCurrentSelection
      ? customApprovers.filter((id) => id !== "")
      : [];

    return MOCK_USERS.filter(
      (user) =>
        user.status === "active" &&
        ["required_approver", "approver", "admin"].includes(user.role) &&
        !selectedUserIds.includes(user.id) &&
        user.id !== managerId
    );
  };

  // 동적 결재자 선택 함수 (새로운 시스템 사용)
  const selectDynamicApprovers = (amount: number, curr: CryptoCurrency): string[] => {
    const result = selectApproversByPolicy(amount, curr);
    return result.selectedApprovers.map(approver => approver.userId);
  };

  // 예산이 변경될 때마다 정책 매칭
  useEffect(() => {
    if (budgetAmount > 0) {
      // 예산 변경 감지
      const needsUpdate = budgetAmount !== currentBudgetAmount || !policyMatch;

      if (needsUpdate) {
        const result = selectApproversByPolicy(budgetAmount, currency);

        // PolicyMatchResult 형태로 변환
        const krwAmount = convertToKRW(budgetAmount, currency);
        const matchResult: PolicyMatchResult = {
          policy: result.policy,
          selectedApprovers: result.selectedApprovers,
          missingRequirements: result.missingRequirements,
          warnings: result.warnings
        };

        setPolicyMatch(matchResult);
        setCurrentBudgetAmount(budgetAmount);

        // 자동 설정된 결재자로 초기화 (사용자 정의 모드가 아닌 경우에만)
        if (!showCustomization) {
          const approverIds = selectDynamicApprovers(budgetAmount, currency);
          console.log('자동 선택된 결재자 IDs:', approverIds);
          setCustomApprovers(approverIds);
          onApproversChange(approverIds);
        }
      }
    } else {
      setPolicyMatch(null);
      setCurrentBudgetAmount(0);
      setCustomApprovers([]);
      onApproversChange([]);
    }
  }, [budgetAmount, currency, onApproversChange, showCustomization, policyMatch, currentBudgetAmount]);

  // 결재자 변경 핸들러
  const handleApproverChange = (index: number, userId: string) => {
    const updated = [...customApprovers];
    updated[index] = userId;
    setCustomApprovers(updated);
    onApproversChange(updated.filter(id => id !== ""));
  };

  // 결재자 추가
  const handleAddApprover = () => {
    const updated = [...customApprovers, ""];
    setCustomApprovers(updated);
  };

  // 결재자 제거
  const handleRemoveApprover = (index: number) => {
    if (customApprovers.length > 1) {
      const updated = customApprovers.filter((_, i) => i !== index);
      setCustomApprovers(updated);
      onApproversChange(updated.filter(id => id !== ""));
    }
  };

  // 사용자 정의 모드 토글
  const handleToggleCustomization = () => {
    if (showCustomization) {
      // 기본값으로 되돌리기
      if (policyMatch) {
        const approverIds = selectDynamicApprovers(budgetAmount, currency);
        setCustomApprovers(approverIds);
        onApproversChange(approverIds);
      }
      setShowCustomization(false);
    } else {
      // 사용자 정의 모드 활성화
      setShowCustomization(true);
    }
  };

  // 정책 기반 추천 여부 확인
  const isPolicyBasedApprover = (approverId: string): boolean => {
    if (showCustomization || !policyMatch) return false;

    // 동적으로 선택된 결재자 ID 목록과 비교
    const policyApproverIds = policyMatch.selectedApprovers.map(approver => approver.userId);
    return policyApproverIds.includes(approverId);
  };

  // 정책 불일치 여부 확인
  const isPolicyMismatched = (): boolean => {
    if (!policyMatch || !showCustomization) return false;
    const validApprovers = customApprovers.filter(id => id !== "");
    return validApprovers.length !== policyMatch.selectedApprovers.length;
  };

  // 정책 매칭이 안된 경우 처리
  if (budgetAmount <= 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-sm text-gray-500 text-center py-4">
          예산을 먼저 설정해주세요.
        </div>
      </div>
    );
  }

  if (!policyMatch) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-red-800">
                정책을 찾을 수 없습니다
              </h4>
              <p className="text-sm text-red-600 mt-1">
                예산 금액에 해당하는 정책이 없습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 정책 매칭 결과 표시 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-medium text-blue-800">
              정책 기반 자동 설정
            </h4>
            <div className="mt-1 text-sm text-blue-600 space-y-1">
              <p>예산 금액: <span className="font-medium">{formatCurrencyKRW(convertToKRW(budgetAmount, currency))}</span></p>
              <p>적용 정책: <span className="font-medium">{policyMatch.policy?.description}</span></p>
              <p>
                위험도: <span className={`font-medium ${getRiskLevelColor(policyMatch.policy?.riskLevel || 'low')}`}>
                  {policyMatch.policy?.riskLevel || 'low'}
                </span>
                (필요 결재자 {policyMatch.selectedApprovers.length}명)
              </p>
              {policyMatch.warnings.length > 0 && (
                <div className="text-yellow-600 text-xs">
                  경고: {policyMatch.warnings.join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 필수 결재자 설정 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            필수 결재자
            {policyMatch && (
              <span className="text-gray-500 font-normal">
                (정책 기준 {policyMatch.selectedApprovers.length}명)
              </span>
            )}
          </label>
          {!disabled && (
            <button
              type="button"
              onClick={handleToggleCustomization}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showCustomization ? '기본값으로 되돌리기' : '사용자 정의'}
            </button>
          )}
        </div>

        {/* 결재자 목록 */}
        <div className="space-y-2">
          {customApprovers.map((approverId, index) => (
            <div key={index} className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
              <select
                value={approverId}
                onChange={(e) => handleApproverChange(index, e.target.value)}
                disabled={disabled || isPolicyBasedApprover(approverId)}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  disabled || isPolicyBasedApprover(approverId)
                    ? 'bg-gray-50 text-gray-600 cursor-not-allowed'
                    : ''
                }`}
              >
                <option value="">결재자 선택</option>
                {getEligibleApprovers(false)
                  .filter(user =>
                    !customApprovers.includes(user.id) || user.id === approverId
                  )
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.department}) - {ROLE_NAMES[user.role]}
                    </option>
                  ))}
              </select>

              {/* 정책 기반 자동 설정 표시 */}
              {isPolicyBasedApprover(approverId) && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  정책 기반
                </span>
              )}

              {/* 사용자 정의 모드에서만 제거 버튼 */}
              {showCustomization && customApprovers.length > 1 && !disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveApprover(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="결재자 제거"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {/* 사용자 정의 모드에서만 결재자 추가 버튼 */}
          {showCustomization && !disabled && (
            <button
              type="button"
              onClick={handleAddApprover}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              + 결재자 추가
            </button>
          )}
        </div>
      </div>

      {/* 정책 불일치 경고 */}
      {isPolicyMismatched() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">정책 불일치:</span> 정책 권장 결재자 수({policyMatch.selectedApprovers.length}명)와 다릅니다.
                현재: {customApprovers.filter(id => id).length}명
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                예산 금액에 따른 위험도를 고려하여 적절한 결재자 수를 설정하는 것을 권장합니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 정책 세부 정보 (접힌 상태로 제공) */}
      <details className="text-sm">
        <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
          정책 세부 정보
        </summary>
        <div className="mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">위험도 등급:</span>
              <span className={`ml-2 font-medium ${getRiskLevelColor(policyMatch.policy?.riskLevel || 'low')}`}>
                {policyMatch.policy?.riskLevel || 'low'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">환산 비율:</span>
              <span className="ml-2">{budgetAmount} {currency} → {formatCurrencyKRW(convertToKRW(budgetAmount, currency))}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-600">정책 범위:</span>
            <span className="ml-2">
              {formatCurrencyKRW(policyMatch.policy?.minAmount || 0)} ~ {formatCurrencyKRW(policyMatch.policy?.maxAmount || 0)}
            </span>
          </div>
          <div>
            <span className="text-gray-600">정책 기반 결재자:</span>
            <div className="ml-2 mt-1">
              {policyMatch.selectedApprovers.map((approver, index) => (
                <span key={approver.userId} className="inline-block mr-2 mb-1 px-2 py-1 bg-gray-200 rounded text-xs">
                  {index + 1}. {approver.userName} ({approver.department})
                </span>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}