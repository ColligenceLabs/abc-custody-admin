"use client";

import { useState } from "react";
import { XMarkIcon, ExclamationTriangleIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";
import { TravelRuleInfo } from "@/types/address";
import { validateTravelRuleInfo } from "@/utils/addressHelpers";

interface TravelRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (travelRuleInfo: TravelRuleInfo) => void;
  amount: number;
  assetType: string;
}

export default function TravelRuleModal({ isOpen, onClose, onSubmit, amount, assetType }: TravelRuleModalProps) {
  const [formData, setFormData] = useState<TravelRuleInfo>({
    senderName: "",
    senderAddress: "",
    senderAccountInfo: "",
    recipientName: "",
    recipientVasp: "",
    recipientAccountInfo: "",
    transactionPurpose: "",
    fundSource: "",
    amount,
    assetType
  });

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateTravelRuleInfo(formData);
    setErrors(validationErrors);

    if (validationErrors.length > 0) {
      return;
    }

    if (!isConfirmed) {
      alert("주의사항을 확인하고 동의해주세요.");
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      senderName: "",
      senderAddress: "",
      senderAccountInfo: "",
      recipientName: "",
      recipientVasp: "",
      recipientAccountInfo: "",
      transactionPurpose: "",
      fundSource: "",
      amount,
      assetType
    });
    setIsConfirmed(false);
    setErrors([]);
    onClose();
  };

  const updateFormData = (updates: Partial<TravelRuleInfo>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                트래블룰 정보 수집
              </h3>
              <p className="text-sm text-gray-600">
                {amount.toLocaleString()}원 상당의 {assetType} 출금
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 에러 메시지 */}
        {errors.length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-sm font-medium text-red-800 mb-2">다음 오류를 수정해주세요:</h4>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 송신인 정보 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">송신인 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => updateFormData({ senderName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="송신인 실명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderAddress}
                  onChange={(e) => updateFormData({ senderAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="송신인 거주지 주소"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계좌 정보 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderAccountInfo}
                  onChange={(e) => updateFormData({ senderAccountInfo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="송신인 계좌번호 또는 식별 정보"
                />
              </div>
            </div>
          </div>

          {/* 수신인 정보 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">수신인 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientName}
                  onChange={(e) => updateFormData({ recipientName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="수신인 실명"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  VASP 정보 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientVasp}
                  onChange={(e) => updateFormData({ recipientVasp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="수신인의 거래소/VASP 정보"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  계좌 정보 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.recipientAccountInfo}
                  onChange={(e) => updateFormData({ recipientAccountInfo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="수신인 계좌번호 또는 식별 정보"
                />
              </div>
            </div>
          </div>

          {/* 거래 정보 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">거래 정보</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  거래 목적 *
                </label>
                <select
                  required
                  value={formData.transactionPurpose}
                  onChange={(e) => updateFormData({ transactionPurpose: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="투자">투자</option>
                  <option value="결제">결제</option>
                  <option value="송금">송금</option>
                  <option value="거래">거래</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  자금 출처 *
                </label>
                <select
                  required
                  value={formData.fundSource}
                  onChange={(e) => updateFormData({ fundSource: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">선택해주세요</option>
                  <option value="급여소득">급여소득</option>
                  <option value="사업소득">사업소득</option>
                  <option value="투자수익">투자수익</option>
                  <option value="상속/증여">상속/증여</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          </div>

          {/* 주의사항 */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <InformationCircleIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <h4 className="font-medium text-amber-800 mb-2">트래블룰 안내</h4>
                <div className="text-amber-700 space-y-2">
                  <p>해외 거래소에서 입금 시, 위험평가 통과 VASP로부터의 입금만 가능합니다.</p>
                  <p>100만원 이상의 입금 건의 경우 연동된 거래소에서만 입금 가능합니다.</p>
                  <p>내국인 대상 불법 영업행위 미신고 외국 가상자산사업자로부터의 입금 확인 시, 이용약관에 따라 이용제한 등 조치가 이뤄질 수 있습니다.</p>
                  <p>해당 디지털 자산은 {assetType} 네트워크를 통한 입금만 지원합니다.</p>
                  <p>{assetType} 네트워크가 아닌 {assetType}을(를) 착오전송 시, 입금 반영이 불가하오니 주의해 주시기 바랍니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 동의 체크박스 */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="mr-3 mt-1 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">
                위 주의사항을 충분히 읽고 확인하였으며, 제공한 모든 정보가 정확함을 확인합니다.
                트래블룰 관련 법규를 준수하며, 허위 정보 제공 시 발생할 수 있는 모든 책임을
                인지하고 있습니다.
              </span>
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!isConfirmed}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                isConfirmed
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              확인
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}