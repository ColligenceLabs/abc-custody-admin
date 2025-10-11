import React from "react";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";

export interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  network: string;
  coin: string;
  type: "personal" | "exchange" | "vasp";
}

export interface NetworkAsset {
  value: string;
  name: string;
  symbol: string;
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
  additionalFieldsBeforeDescription,
  additionalFieldsAfterDescription,
  modalTitle = "새 출금 신청",
  submitButtonText = "신청 제출",
}: WithdrawalModalBaseProps<T>) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="grid grid-cols-2 gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 네트워크 *
                </label>
                <select
                  value={formData.network}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      network: e.target.value,
                      currency: "",
                      toAddress: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">네트워크를 선택하세요</option>
                  <option value="Bitcoin">Bitcoin Network</option>
                  <option value="Ethereum">Ethereum Network</option>
                  <option value="Solana">Solana Network</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 자산 *
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      currency: e.target.value,
                      toAddress: "",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={!formData.network}
                >
                  <option value="">
                    {formData.network
                      ? "자산을 선택하세요"
                      : "먼저 네트워크를 선택하세요"}
                  </option>
                  {formData.network &&
                    networkAssets[formData.network]?.map((asset) => (
                      <option key={asset.value} value={asset.value}>
                        {asset.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* 출금 금액 */}
            <div className="grid grid-cols-1 gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 금액 *
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      amount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* 출금 주소 */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출금 주소 *
              </label>
              <div className="space-y-2">
                {whitelistedAddresses
                  .filter(
                    (addr) =>
                      addr.network === formData.network &&
                      addr.coin === formData.currency
                  )
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

                {formData.network &&
                  formData.currency &&
                  whitelistedAddresses.filter(
                    (addr) =>
                      addr.network === formData.network &&
                      addr.coin === formData.currency
                  ).length === 0 && (
                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                      <p className="text-gray-500 text-sm">
                        {formData.network} 네트워크의 {formData.currency}{" "}
                        자산에 대한 등록된 출금 주소가 없습니다.
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
