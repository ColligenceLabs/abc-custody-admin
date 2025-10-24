"use client";

import { useState } from "react";
import { Transaction } from "@/types/transaction";
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/solid";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { StatusBadge } from "../withdrawal/StatusBadge";
import { WithdrawalStatus } from "@/types/withdrawal";
import { getTransactionStatusInfo } from "@/utils/withdrawalHelpers";
import { formatAmount } from "@/lib/format";
import TransactionTimeline from "./TransactionTimeline";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

interface CopyButtonProps {
  text: string;
  field: string;
  copiedField: string;
  onCopy: (text: string, field: string) => void;
}

function CopyButton({ text, field, copiedField, onCopy }: CopyButtonProps) {
  const isCopied = copiedField === field;

  return (
    <button
      onClick={() => onCopy(text, field)}
      className="flex items-center text-primary-600 hover:text-primary-800 text-xs font-medium transition-colors"
    >
      {isCopied ? (
        <>
          <CheckIcon className="h-4 w-4 mr-1" />
          복사됨
        </>
      ) : (
        <>
          <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
          복사
        </>
      )}
    </button>
  );
}

export default function TransactionDetailModal({
  transaction,
  onClose,
}: TransactionDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string>("");

  if (!transaction) return null;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const getTransactionTypeName = (type: "deposit" | "withdrawal") => {
    return type === "deposit" ? "입금" : "출금";
  };

  const mapTransactionStatusToWithdrawalStatus = (
    status: "completed" | "pending" | "failed"
  ): WithdrawalStatus => {
    const statusMap = {
      completed: "success" as WithdrawalStatus,
      pending: "withdrawal_wait" as WithdrawalStatus,
      failed: "failed" as WithdrawalStatus,
    };
    return statusMap[status];
  };

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const isDeposit = transaction.type === "deposit";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* 오버레이 */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* 모달 컨텐츠 */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* 헤더 (고정) */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* 거래 유형 아이콘 */}
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isDeposit ? "bg-sky-100" : "bg-red-100"}`}>
                  {isDeposit ? (
                    <ArrowDownIcon className="h-5 w-5 text-sky-600" />
                  ) : (
                    <ArrowUpIcon className="h-5 w-5 text-red-600" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getTransactionTypeName(transaction.type)} 상세 정보
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 컨텐츠 (스크롤 영역) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* 거래 요약 카드 */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <CryptoIcon symbol={transaction.asset} size={48} />
                  <div>
                    <div className={`text-3xl font-bold ${isDeposit ? "text-sky-700" : "text-red-700"}`}>
                      {isDeposit ? "+" : "-"}
                      {formatAmount(transaction.amount)}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{transaction.asset}</div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs text-gray-500">신청일시</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(transaction.timestamp)}
                  </div>
                  {transaction.status === "completed" && (
                    <>
                      <div className="text-xs text-gray-500 mt-2">종료일시</div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 기본 정보 */}
              <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">거래 유형</div>
                  <div className={`font-semibold ${isDeposit ? "text-sky-700" : "text-red-700"}`}>
                    {getTransactionTypeName(transaction.type)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">네트워크</div>
                  <div className="font-medium text-gray-900">{transaction.network}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">상태</div>
                  <div>
                    <StatusBadge
                      status={mapTransactionStatusToWithdrawalStatus(transaction.status)}
                      text={getTransactionStatusInfo(transaction.status).name}
                      hideIcon={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 타임라인 */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <TransactionTimeline transaction={transaction} />
            </div>

            {/* 블록체인 정보 */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="text-base font-semibold text-gray-900 mb-4">
                블록체인 정보
              </h4>

              <div className="space-y-4">
                {/* 트랜잭션 해시 */}
                {transaction.txHash && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        트랜잭션 해시
                      </span>
                      <CopyButton
                        text={transaction.txHash}
                        field="txHash"
                        copiedField={copiedField}
                        onCopy={handleCopy}
                      />
                    </div>
                    <div className="font-mono text-sm text-gray-900 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 break-all">
                      {transaction.txHash}
                    </div>
                  </div>
                )}

                {/* 주소 정보 */}
                {(transaction.from || transaction.to) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {transaction.from && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            보낸 주소
                          </span>
                          <CopyButton
                            text={transaction.from}
                            field="from"
                            copiedField={copiedField}
                            onCopy={handleCopy}
                          />
                        </div>
                        <div className="font-mono text-xs text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 break-all">
                          {transaction.from}
                        </div>
                      </div>
                    )}

                    {transaction.to && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            받는 주소
                          </span>
                          <CopyButton
                            text={transaction.to}
                            field="to"
                            copiedField={copiedField}
                            onCopy={handleCopy}
                          />
                        </div>
                        <div className="font-mono text-xs text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 break-all">
                          {transaction.to}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 데이터 없음 메시지 */}
                {!transaction.txHash && !transaction.from && !transaction.to && (
                  <div className="text-center py-12">
                    <svg
                      className="w-16 h-16 mx-auto text-gray-300 mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      블록체인 정보가 아직 생성되지 않았습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
