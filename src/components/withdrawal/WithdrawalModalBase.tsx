import React, { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { WhitelistedAddress } from "@/types/address";
import {
  validateWithdrawalAmount,
  calculateWithdrawalFee,
  calculateNetAmount,
  getTokenConfig,
} from "@/lib/tokenConfigService";
import { ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { NetworkSelector, AssetSelector, NETWORK_OPTIONS } from "./NetworkAssetSelector";
import { getUserBalances, Balance } from "@/lib/api/balance";
import { formatCryptoAmount } from "@/lib/format";

export interface NetworkAsset {
  value: string;
  name: string;
  symbol: string;
  isActive: boolean;
}

interface BaseFormData {
  title: string;
  network: string;
  currency: string;
  amount: number;
  toAddress: string;
  description: string;
}

interface WithdrawalModalBaseProps<T extends BaseFormData> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: T) => void;
  formData: T;
  onFormDataChange: (data: T) => void;
  networkAssets: Record<string, NetworkAsset[]>;
  whitelistedAddresses: WhitelistedAddress[];
  userId: string;
  additionalFieldsBeforeDescription?: React.ReactNode;
  additionalFieldsAfterDescription?: React.ReactNode;
  modalTitle?: string;
  submitButtonText?: string;
}

export function WithdrawalModalBase<T extends BaseFormData>({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onFormDataChange,
  networkAssets,
  whitelistedAddresses,
  userId,
  additionalFieldsBeforeDescription,
  additionalFieldsAfterDescription,
  modalTitle = "새 출금 신청",
  submitButtonText = "신청 제출",
}: WithdrawalModalBaseProps<T>) {
  const [validationError, setValidationError] = useState<string>("");
  const [feeInfo, setFeeInfo] = useState<{
    fee: number;
    feeType: string;
    netAmount: number;
  } | null>(null);
  const [selectedTokenActive, setSelectedTokenActive] = useState<boolean>(true);
  const [tokenConfig, setTokenConfig] = useState<{
    minWithdrawalAmount: string;
    withdrawalFee: string;
    withdrawalFeeType: 'fixed' | 'percentage';
  } | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string>("");

  // 보유 자산 조회
  useEffect(() => {
    if (!isOpen || !formData.currency || !formData.network || !userId) {
      setAvailableBalance(null);
      setBalanceError("");
      return;
    }

    // 네트워크 매핑 (테스트넷 환경)
    const networkMapping: Record<string, string> = {
      'Ethereum': 'Holesky',
      'Bitcoin': 'Bitcoin',
      'Solana': 'Solana'
    };

    const apiNetwork = networkMapping[formData.network] || formData.network;

    getUserBalances(userId, formData.currency, apiNetwork)
      .then((balances) => {
        if (balances.length > 0) {
          setAvailableBalance(parseFloat(balances[0].availableBalance));
          setBalanceError("");
        } else {
          setAvailableBalance(0);
          setBalanceError("");
        }
      })
      .catch((error) => {
        console.error("잔액 조회 실패:", error);
        setAvailableBalance(null);
        setBalanceError("잔액 정보를 불러올 수 없습니다");
      });
  }, [isOpen, formData.currency, formData.network, userId]);

  // 선택된 토큰의 활성화 상태 및 설정 정보 로드
  useEffect(() => {
    if (!isOpen || !formData.currency) {
      setTokenConfig(null);
      return;
    }

    getTokenConfig(formData.currency).then((config) => {
      if (config) {
        setSelectedTokenActive(config.isActive);
        setTokenConfig({
          minWithdrawalAmount: config.minWithdrawalAmount,
          withdrawalFee: config.withdrawalFee,
          withdrawalFeeType: config.withdrawalFeeType,
        });
      }
    });
  }, [isOpen, formData.currency]);

  // 출금 금액 변경 시 검증 및 수수료 계산
  useEffect(() => {
    if (!isOpen) return;

    if (formData.currency && formData.amount > 0) {
      // 출금 가능금액 체크
      if (availableBalance !== null && formData.amount > availableBalance) {
        setValidationError(`출금 가능 잔액을 초과했습니다 (보유: ${formatCryptoAmount(availableBalance, formData.currency)} ${formData.currency})`);
        setFeeInfo(null);
        return;
      }

      validateWithdrawalAmount(formData.currency, formData.amount).then(
        (result) => {
          if (!result.valid) {
            setValidationError(result.error || "");
            setFeeInfo(null);
          } else {
            setValidationError("");
            if (result.fee !== undefined && result.feeType) {
              const feeAmount = calculateWithdrawalFee(
                formData.amount,
                result.fee,
                result.feeType as 'fixed' | 'percentage'
              );
              const netAmount = calculateNetAmount(
                formData.amount,
                result.fee,
                result.feeType as 'fixed' | 'percentage'
              );
              setFeeInfo({
                fee: feeAmount,
                feeType: result.feeType,
                netAmount,
              });
            }
          }
        }
      );
    } else {
      setValidationError("");
      setFeeInfo(null);
    }
  }, [isOpen, formData.currency, formData.amount, availableBalance]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 출금 주소 필수 검증
    if (!formData.toAddress) {
      alert('출금 주소를 선택해주세요.');
      return;
    }

    // 출금 금액 검증
    const validation = await validateWithdrawalAmount(
      formData.currency,
      formData.amount
    );

    if (!validation.valid) {
      alert(validation.error || '출금 금액이 유효하지 않습니다.');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal isOpen={true}>
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 - 고정 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{modalTitle}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6 text-blue-600"
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

        {/* 콘텐츠 - 스크롤 */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            {/* 출금 제목 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 제목 *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  onFormDataChange({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="출금 목적을 간략히 입력하세요"
              />
            </div>

            {/* 네트워크 및 자산 선택 */}
            <div className="space-y-6">
              {/* 네트워크 선택 */}
              <NetworkSelector
                networks={NETWORK_OPTIONS}
                selected={formData.network}
                onChange={(network) => {
                  onFormDataChange({
                    ...formData,
                    network,
                    currency: "",
                    toAddress: "",
                  });
                }}
              />

              {/* 자산 선택 */}
              <AssetSelector
                assets={formData.network ? networkAssets[formData.network] : []}
                selected={formData.currency}
                onChange={(currency) => {
                  onFormDataChange({
                    ...formData,
                    currency,
                    toAddress: "",
                  });
                }}
                disabled={!formData.network}
              />
            </div>

            {/* 토큰 정보 안내 (자산 선택 시 표시) */}
            {formData.currency && tokenConfig && selectedTokenActive && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-indigo-900 mb-2">
                      {formData.currency} 출금 정책
                    </p>
                    <div className="space-y-1 text-indigo-800">
                      <div className="flex gap-2">
                        <span className="text-indigo-700 flex-shrink-0 w-24">최소 출금:</span>
                        <span className="font-medium flex-1 text-right">
                          {formatCryptoAmount(tokenConfig.minWithdrawalAmount, formData.currency)} {formData.currency}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <span className="text-indigo-700 flex-shrink-0 w-24">출금 수수료:</span>
                        <span className="font-medium flex-1 text-right">
                          {tokenConfig.withdrawalFeeType === 'fixed'
                            ? formatCryptoAmount(tokenConfig.withdrawalFee, formData.currency)
                            : parseFloat(tokenConfig.withdrawalFee).toString()}{' '}
                          {tokenConfig.withdrawalFeeType === 'fixed'
                            ? formData.currency
                            : '%'}
                          {' '}
                          ({tokenConfig.withdrawalFeeType === 'fixed' ? '고정' : '퍼센트'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 출금 중단 안내 (토큰이 비활성화된 경우) */}
            {formData.currency && !selectedTokenActive && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">출금 일시 중단</p>
                    <p className="text-yellow-700">
                      현재 {formData.currency} 토큰의 출금이 일시 중단되었습니다.
                      <br />
                      네트워크 점검 또는 보안 이슈로 인한 조치이며, 재개 시 별도 안내 드리겠습니다.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 출금 금액 */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    출금 금액 *
                  </label>
                  {availableBalance !== null && formData.currency && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        출금 가능: {formatCryptoAmount(availableBalance, formData.currency)} {formData.currency}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onFormDataChange({
                            ...formData,
                            amount: availableBalance,
                          });
                        }}
                        className="px-2 py-1 text-xs font-medium text-primary-600 border border-primary-200 rounded hover:bg-primary-50"
                      >
                        전액
                      </button>
                    </div>
                  )}
                  {balanceError && (
                    <span className="text-sm text-red-600">{balanceError}</span>
                  )}
                </div>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.amount}
                  onFocus={(e) => {
                    if (formData.amount === 0) {
                      onFormDataChange({
                        ...formData,
                        amount: '' as any,
                      });
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    onFormDataChange({
                      ...formData,
                      amount: value === '' ? ('' as any) : Number(value),
                    });
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    validationError
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />

                {/* 검증 오류 메시지 */}
                {validationError && (
                  <div className="mt-2 text-sm text-red-600">
                    {validationError}
                  </div>
                )}

                {/* 수수료 및 실수령액 정보 */}
                {feeInfo && !validationError && (
                  <div className="mt-2 p-3 bg-sky-50 border border-sky-200 rounded">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">출금 금액:</span>
                        <span className="font-medium text-gray-900">
                          {formatCryptoAmount(formData.amount, formData.currency)} {formData.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          수수료 ({feeInfo.feeType === 'fixed' ? '고정' : '퍼센트'}):
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatCryptoAmount(feeInfo.fee, formData.currency)} {formData.currency}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-sky-300 flex justify-between">
                        <span className="text-sky-700 font-medium">실수령액:</span>
                        <span className="font-semibold text-sky-700">
                          {formatCryptoAmount(feeInfo.netAmount, formData.currency)} {formData.currency}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 출금 주소 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 주소 *
              </label>
              <div className="space-y-2">
                {(() => {
                  const filtered = whitelistedAddresses.filter(
                    (addr) =>
                      addr.coin === formData.currency &&
                      addr.permissions.canWithdraw
                  );
                  console.log('[WithdrawalModalBase] 필터링 전 주소 목록:', whitelistedAddresses);
                  console.log('[WithdrawalModalBase] 선택된 자산:', formData.currency);
                  console.log('[WithdrawalModalBase] 필터링 후 주소 목록:', filtered);
                  return filtered;
                })()
                  .map((address) => (
                    <div
                      key={address.id}
                      onClick={() =>
                        onFormDataChange({
                          ...formData,
                          toAddress: address.address,
                        })
                      }
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.toAddress === address.address
                          ? "border-primary-500 bg-primary-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CryptoIcon
                            symbol={address.coin}
                            size={20}
                            className="mr-2 flex-shrink-0"
                          />
                          <div>
                            <div className="font-medium text-gray-900 text-sm">
                              {address.label}
                            </div>
                            <div className="text-xs font-mono text-gray-500">
                              {address.address.length > 30
                                ? `${address.address.slice(
                                    0,
                                    15
                                  )}...${address.address.slice(-15)}`
                                : address.address}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            address.type === "personal"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {address.type === "personal" ? "개인지갑" : "VASP"}
                        </span>
                      </div>
                    </div>
                  ))}

                {formData.currency &&
                  whitelistedAddresses.filter(
                    (addr) =>
                      addr.coin === formData.currency &&
                      addr.permissions.canWithdraw
                  ).length === 0 && (
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">
                        {formData.currency} 자산에 대한 등록된 출금 주소가 없습니다.
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        보안 설정에서 출금 주소를 먼저 등록해주세요.
                      </p>
                    </div>
                  )}

                {(!formData.network || !formData.currency) && (
                  <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      네트워크와 자산을 먼저 선택해주세요.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 추가 필드 (설명 전) */}
            {additionalFieldsBeforeDescription}

            {/* 상세 설명 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상세 설명 *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  onFormDataChange({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="출금 목적과 상세 내용을 입력하세요"
                rows={3}
              />
            </div>

            {/* 추가 필드 (설명 후) */}
            {additionalFieldsAfterDescription}
          </div>
        </form>

        {/* 하단 버튼 - 고정 */}
        <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white"
          >
            취소
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const form = e.currentTarget
                .closest(".flex.flex-col")
                ?.querySelector("form") as HTMLFormElement;
              if (form) {
                form.requestSubmit();
              }
            }}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {submitButtonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
