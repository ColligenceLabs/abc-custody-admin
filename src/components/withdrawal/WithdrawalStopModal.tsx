import React, { useState } from "react";
import { WithdrawalRequest } from "@/types/withdrawal";
import { Modal } from "@/components/common/Modal";

interface WithdrawalStopModalProps {
  request: WithdrawalRequest;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (requestId: string, reason: string) => void;
}

export function WithdrawalStopModal({
  request,
  isOpen,
  onClose,
  onConfirm,
}: WithdrawalStopModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(request.id, reason.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            출금 정지 확인
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-6 h-6"
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

        {/* Content */}
        <div className="p-6">
          {/* 출금 정보 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              출금 정보
            </h4>
            <div className="space-y-1 text-sm">
              <div>
                <span className="text-gray-500">제목:</span>{" "}
                <span className="font-medium">{request.title}</span>
              </div>
              <div>
                <span className="text-gray-500">금액:</span>{" "}
                <span className="font-medium">
                  {request.amount.toLocaleString()} {request.currency}
                </span>
              </div>
              <div>
                <span className="text-gray-500">신청자:</span>{" "}
                <span className="font-medium">{request.initiator}</span>
              </div>
            </div>
          </div>

          {/* 경고 메시지 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg
                className="w-5 h-5 text-yellow-400 mt-0.5 mr-2"
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
              <div>
                <h5 className="text-sm font-medium text-yellow-800">
                  출금 정지 안내
                </h5>
                <p className="text-sm text-yellow-700 mt-1">
                  출금을 중지하면 해당 거래는 더 이상 처리되지 않습니다. 중지
                  후에는 새로운 출금 신청이 필요합니다.
                </p>
              </div>
            </div>
          </div>

          {/* 중지 사유 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              중지 사유 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="출금 정지 사유를 상세히 입력해주세요."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none"
              rows={4}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            출금 정지
          </button>
        </div>
      </div>
    </Modal>
  );
}
