"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { IndividualWithdrawalRequest } from "@/types/withdrawal";
import { formatDateTime } from "@/utils/withdrawalHelpers";
import { formatAmount } from "@/lib/format";
import { convertToKRW } from "@/utils/approverAssignment";
import CryptoIcon from "@/components/ui/CryptoIcon";
import WithdrawalTimeline from "./WithdrawalTimeline";
import { StatusBadge } from "./StatusBadge";
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useToast } from "@/hooks/use-toast";

interface WithdrawalDetailModalProps {
  withdrawal: IndividualWithdrawalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (requestId: string, reason: string) => void;
}

export default function WithdrawalDetailModal({
  withdrawal,
  isOpen,
  onClose,
  onCancel,
}: WithdrawalDetailModalProps) {
  const { toast } = useToast();
  const [showCancelInput, setShowCancelInput] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // 모달이 닫힐 때 취소 입력 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setShowCancelInput(false);
      setCancelReason("");
    }
  }, [isOpen]);

  if (!withdrawal) return null;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(withdrawal.toAddress);
    toast({
      description: "주소가 복사되었습니다.",
    });
  };

  const handleCopyTxHash = () => {
    if (withdrawal.txHash) {
      navigator.clipboard.writeText(withdrawal.txHash);
      toast({
        description: "트랜잭션 해시가 복사되었습니다.",
      });
    }
  };

  const handleCancelClick = () => {
    if (!cancelReason.trim()) {
      toast({
        variant: "destructive",
        description: "중지 사유를 입력해주세요.",
      });
      return;
    }

    if (onCancel) {
      onCancel(withdrawal.id, cancelReason);
      setShowCancelInput(false);
      setCancelReason("");
    }
  };

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col m-4">
        {/* 헤더 (고정) */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900">
            출금 상세 정보
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* 본문 (스크롤 가능) */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* 기본 정보 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              기본 정보
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 출금 수량 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  출금 수량
                </label>
                <div className="flex items-center space-x-2">
                  <CryptoIcon
                    symbol={withdrawal.currency}
                    size={24}
                    className="flex-shrink-0"
                  />
                  <div className="flex items-baseline space-x-1">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatAmount(withdrawal.amount)}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {withdrawal.currency}
                    </p>
                  </div>
                </div>
              </div>

              {/* 출금 제목 */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  출금 제목
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {withdrawal.title || "제목 없음"}
                </p>
              </div>

              {/* 목적지 주소 */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  목적지 주소
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 text-sm font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all text-gray-900">
                    {withdrawal.toAddress}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="flex-shrink-0 text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded transition-colors"
                    title="주소 복사"
                  >
                    <ClipboardDocumentIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 출금 신청 시간 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  신청 시간
                </label>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(withdrawal.initiatedAt)}
                </p>
              </div>

              {/* 상태 */}
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  상태
                </label>
                <StatusBadge status={withdrawal.status} />
              </div>
            </div>

            {/* 출금 설명 */}
            {withdrawal.description && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <label className="block text-xs text-gray-500 mb-1">
                  상세 설명
                </label>
                <p className="text-sm text-gray-700">{withdrawal.description}</p>
              </div>
            )}
          </div>

          {/* 처리 진행 상황 (타임라인) */}
          <WithdrawalTimeline withdrawal={withdrawal} />

          {/* 트랜잭션 정보 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              트랜잭션 정보
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 네트워크 */}
              <div>
                <span className="text-gray-500">네트워크:</span>
                <div className="text-gray-700 mt-1">Ethereum</div>
              </div>

              {/* 출금 출처 주소 */}
              <div className="md:col-span-2">
                <span className="text-gray-500">출금 출처:</span>
                <div className="font-mono text-gray-700 break-all mt-1 bg-gray-50 px-2 py-1 rounded">
                  {withdrawal.fromAddress}
                </div>
              </div>

              {/* 트랜잭션 해시 */}
              {withdrawal.txHash && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">트랜잭션 해시:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="flex-1 font-mono text-gray-700 break-all bg-gray-50 px-2 py-1 rounded">
                      {withdrawal.txHash}
                    </code>
                    <button
                      onClick={handleCopyTxHash}
                      className="flex-shrink-0 text-primary-600 hover:text-primary-700 p-1 hover:bg-primary-50 rounded transition-colors"
                      title="해시 복사"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                    <a
                      href={`https://etherscan.io/tx/${withdrawal.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 text-primary-600 hover:text-primary-700 p-1 hover:bg-primary-50 rounded transition-colors"
                      title="블록체인 익스플로러에서 보기"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 출금 중지 안내 */}
          {withdrawal.status === "withdrawal_wait" &&
            withdrawal.cancellable &&
            onCancel && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="text-sm font-semibold text-yellow-800 mb-1">
                      출금 중지 안내
                    </h5>
                    <p className="text-xs text-yellow-700 mb-3">
                      24시간 대기 중에만 출금을 중지할 수 있습니다. 보안 검증
                      이후에는 중지가 불가능합니다.
                    </p>

                    {!showCancelInput ? (
                      <button
                        onClick={() => setShowCancelInput(true)}
                        className="text-xs px-3 py-1.5 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                      >
                        출금 중지
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="중지 사유를 입력하세요"
                          className="w-full text-xs px-3 py-2 border border-yellow-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCancelClick}
                            className="flex-1 text-xs px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            확인
                          </button>
                          <button
                            onClick={() => {
                              setShowCancelInput(false);
                              setCancelReason("");
                            }}
                            className="flex-1 text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* 푸터 (고정) */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </Modal>
  );
}
