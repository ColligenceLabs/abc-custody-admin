"use client";

import { ExclamationTriangleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Modal } from "@/components/common/Modal";

interface TravelRuleWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function TravelRuleWarning({ isOpen, onClose, onAccept }: TravelRuleWarningProps) {
  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <div className="flex items-start mb-4">
          <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Travel Rule 준수 안내
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                FATF Travel Rule에 따라 KRW 100만원 상당 이상의 가상자산
                이체 시 다음 정보가 필요합니다:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>수취인(받는 사람)의 실명</li>
                <li>수취인의 가상자산사업자(VASP) 정보</li>
                <li>수취인의 계좌 정보</li>
                <li>거래 목적 및 자금 출처</li>
              </ul>
              <p className="font-medium text-amber-700">
                개인 간 거래나 자체 지갑으로의 이체도 위 규정을 준수해야
                합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <ClockIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 mb-1">
                사전 주소 등록 권장
              </p>
              <p className="text-amber-700">
                자주 사용하는 주소는 미리 등록해 두시면 더 빠른 출금이
                가능합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onAccept}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            이해했습니다
          </button>
        </div>
      </div>
    </Modal>
  );
}