"use client";

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { AddressFormData } from "@/types/address";
import { getKnownVASPs, getVASPById } from "@/utils/addressHelpers";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: AddressFormData) => void;
  initialType?: "personal" | "vasp";
}

export default function AddressModal({ isOpen, onClose, onSubmit, initialType }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    address: "",
    coin: "BTC",
    type: initialType || "",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    selectedVaspId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 필수 필드 검증
    if (!formData.label || !formData.address || !formData.type) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // VASP 타입일 때 VASP 선택 필수 검증
    if (formData.type === "vasp" && !formData.selectedVaspId) {
      alert("VASP/거래소를 선택해주세요.");
      return;
    }

    // 권한 검증
    if (!formData.permissions.canDeposit && !formData.permissions.canWithdraw) {
      alert("최소 하나의 권한을 선택해야 합니다.");
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      label: "",
      address: "",
      coin: "BTC",
      type: initialType || "",
      permissions: {
        canDeposit: true,
        canWithdraw: true
      },
      selectedVaspId: "",
    });
    onClose();
  };

  const updateFormData = (updates: Partial<AddressFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {initialType === "personal" ? "개인 지갑 주소 추가" :
             initialType === "vasp" ? "거래소/VASP 주소 추가" :
             "지갑 주소 추가"}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto pr-2">
          <form id="address-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자산 *
            </label>
            <select
              value={formData.coin}
              onChange={(e) => updateFormData({ coin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="KRW">Tether (KRW)</option>
              <option value="USDC">USD Coin (USDC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              라벨 *
            </label>
            <input
              type="text"
              required
              value={formData.label}
              onChange={(e) => updateFormData({ label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="예: 메인 비트코인 지갑"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              주소 *
            </label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="지갑 주소를 입력하세요"
            />
          </div>

          {!initialType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                타입 *
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="addressType"
                    value="personal"
                    checked={formData.type === "personal"}
                    onChange={(e) => updateFormData({ type: e.target.value as "personal" | "vasp" })}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm">개인 지갑</span>
                    <p className="text-xs text-gray-500">일일 입/출금 한도: 100만원 미만</p>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="addressType"
                    value="vasp"
                    checked={formData.type === "vasp"}
                    onChange={(e) => updateFormData({ type: e.target.value as "personal" | "vasp" })}
                    className="mr-2 text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm">거래소/VASP</span>
                    <p className="text-xs text-gray-500">한도 제한 없음, 트래블룰 적용</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* VASP 선택 (거래소/VASP 선택 시) */}
          {formData.type === "vasp" && (
            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">VASP 선택</h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    거래소/VASP *
                  </label>
                  <select
                    required
                    value={formData.selectedVaspId || ""}
                    onChange={(e) => updateFormData({ selectedVaspId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">VASP를 선택해주세요</option>
                    {getKnownVASPs().map((vasp) => (
                      <option key={vasp.id} value={vasp.id}>
                        {vasp.name} ({vasp.businessName})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 선택된 VASP 정보 표시 */}
                {formData.selectedVaspId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {(() => {
                      const selectedVasp = getVASPById(formData.selectedVaspId);
                      if (!selectedVasp) return null;

                      return (
                        <div className="text-sm">
                          <h5 className="font-medium text-blue-800 mb-2">선택된 VASP 정보</h5>
                          <div className="space-y-1 text-blue-700">
                            <div><span className="font-medium">사업자명:</span> {selectedVasp.businessName}</div>
                            <div><span className="font-medium">등록번호:</span> {selectedVasp.registrationNumber}</div>
                            <div><span className="font-medium">국가:</span> {selectedVasp.countryCode}</div>
                            <div className="flex items-center">
                              <span className="font-medium mr-2">트래블룰 연동:</span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                selectedVasp.travelRuleConnected
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}>
                                {selectedVasp.travelRuleConnected ? "연동 가능" : "연동 불가"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 권한 설정 */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              사용 권한 *
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.canDeposit}
                  onChange={(e) => updateFormData({
                    permissions: {
                      ...formData.permissions,
                      canDeposit: e.target.checked
                    }
                  })}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium">입금 허용</span>
                  <p className="text-xs text-gray-500">이 주소로 자산을 입금할 수 있습니다</p>
                </div>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.permissions.canWithdraw}
                  onChange={(e) => updateFormData({
                    permissions: {
                      ...formData.permissions,
                      canWithdraw: e.target.checked
                    }
                  })}
                  className="mr-3 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium">출금 허용</span>
                  <p className="text-xs text-gray-500">이 주소로 자산을 출금할 수 있습니다</p>
                </div>
              </label>
            </div>

            {/* 권한 검증 경고 */}
            {!formData.permissions.canDeposit && !formData.permissions.canWithdraw && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  최소 하나의 권한을 선택해야 합니다.
                </p>
              </div>
            )}
          </div>

          </form>
        </div>

        <div className="flex space-x-3 pt-4 border-t border-gray-200 mt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            form="address-form"
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </Modal>
  );
}