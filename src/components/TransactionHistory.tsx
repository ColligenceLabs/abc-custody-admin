"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { useLanguage } from "@/contexts/LanguageContext";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface TransactionHistoryProps {
  plan: ServicePlan;
}

type TransactionType = "deposit" | "withdrawal" | "swap" | "borrow" | "staking";
type TransactionStatus = "completed" | "pending" | "failed";

interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: string;
  value: number;
  status: TransactionStatus;
  timestamp: string;
  txHash?: string;
  from?: string;
  to?: string;
}

export default function TransactionHistory({ plan }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<TransactionStatus | "all">(
    "all"
  );
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { t, language } = useLanguage();

  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "deposit",
      asset: "BTC",
      amount: "0.5",
      value: 25000000,
      status: "completed",
      timestamp: "2025-08-30T10:30:00Z",
      txHash: "0x1234...5678",
      from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    },
    {
      id: "2",
      type: "withdrawal",
      asset: "ETH",
      amount: "2.5",
      value: 5000000,
      status: "pending",
      timestamp: "2025-08-29T09:15:00Z",
      to: "0x742d35...45454",
    },
    {
      id: "3",
      type: "swap",
      asset: "USDC → BTC",
      amount: "10000 → 0.09",
      value: 10000000,
      status: "completed",
      timestamp: "2025-08-28T16:45:00Z",
      txHash: "0xabcd5678...ef901234",
      from: "0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a",
      to: "0x8ba1f109551bd432803012645hac136c6ad4cfc7",
    },
    {
      id: "4",
      type: "borrow",
      asset: "KRW",
      amount: "5000",
      value: 5000000,
      status: "completed",
      timestamp: "2025-08-28T14:20:00Z",
      txHash: "0xdef9abcd...12345678",
      from: "0x1234567890abcdef1234567890abcdef12345678",
      to: "0x9876543210fedcba9876543210fedcba98765432",
    },
    {
      id: "5",
      type: "staking",
      asset: "ETH",
      amount: "10",
      value: 20000000,
      status: "completed",
      timestamp: "2025-08-27T11:10:00Z",
      txHash: "0x9876fedc...ba098765",
      from: "0xabcdef1234567890abcdef1234567890abcdef12",
      to: "0x567890abcdef1234567890abcdef1234567890ab",
    },
  ];

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return <ArrowDownIcon className="h-5 w-5 text-green-600" />;
      case "withdrawal":
        return <ArrowUpIcon className="h-5 w-5 text-red-600" />;
      case "swap":
        return <div className="h-5 w-5 bg-blue-600 rounded-full" />;
      case "borrow":
        return <div className="h-5 w-5 bg-purple-600 rounded-full" />;
      case "staking":
        return <div className="h-5 w-5 bg-yellow-600 rounded-full" />;
    }
  };

  const getTransactionTypeName = (type: TransactionType) => {
    const typeNames = {
      deposit: "입금",
      withdrawal: "출금",
      swap: "교환",
      borrow: "차입",
      staking: "스테이킹",
    };
    return typeNames[type] || type;
  };

  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return "bg-sky-50 text-sky-600";
      case "pending":
        return "bg-yellow-50 text-yellow-600";
      case "failed":
        return "bg-red-50 text-red-600";
    }
  };

  const getStatusName = (status: TransactionStatus) => {
    const statusNames = {
      completed: "완료",
      pending: "대기중",
      failed: "실패",
    };
    return statusNames[status] || status;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === "ko" ? "ko-KR" : "en-US", {
      style: "currency",
      currency: "KRW",
    }).format(value);
  };

  const formatDate = (timestamp: string) => {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesSearch =
      tx.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    const matchesStatus = filterStatus === "all" || tx.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getPaginatedTransactions = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filteredTransactions.slice(startIndex, endIndex),
      totalItems: filteredTransactions.length,
      totalPages: Math.ceil(filteredTransactions.length / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    };
  };

  const paginatedData = getPaginatedTransactions();

  // 필터나 검색어 변경시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("transactions.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("transactions.subtitle")}</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          {t("transactions.download")}
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder={t("transactions.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as TransactionType | "all")
              }
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체 유형</option>
              <option value="deposit">입금</option>
              <option value="withdrawal">출금</option>
              <option value="swap">교환</option>
              <option value="borrow">차입</option>
              <option value="staking">스테이킹</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as TransactionStatus | "all")
              }
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체 상태</option>
              <option value="completed">완료</option>
              <option value="pending">대기중</option>
              <option value="failed">실패</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("transactions.table.type")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("transactions.table.asset")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("transactions.table.amount")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("transactions.table.value")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("transactions.table.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  일시
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.items.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      {getTransactionTypeName(tx.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {tx.asset.includes("→") ? (
                        <div className="flex items-center">
                          <div className="flex items-center">
                            <CryptoIcon
                              symbol={tx.asset.split(" ")[0]}
                              size={24}
                              className="mr-2 flex-shrink-0"
                            />
                            <span className="text-gray-900 font-semibold mr-2">
                              {tx.asset.split(" ")[0]}
                            </span>
                          </div>
                          <span className="mx-2 text-gray-400">→</span>
                          <div className="flex items-center">
                            <CryptoIcon
                              symbol={tx.asset.split(" ")[2]}
                              size={24}
                              className="mr-2 flex-shrink-0"
                            />
                            <span className="text-gray-900 font-semibold">
                              {tx.asset.split(" ")[2]}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <CryptoIcon
                            symbol={tx.asset}
                            size={24}
                            className="mr-2 flex-shrink-0"
                          />
                          <span className="text-gray-900 font-semibold">
                            {tx.asset}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      {tx.amount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(tx.value)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {getStatusName(tx.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(tx.timestamp)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() =>
                        setSelectedTransaction(
                          selectedTransaction === tx.id ? null : tx.id
                        )
                      }
                      className="text-primary-600 hover:text-primary-900 font-medium"
                    >
                      상세보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paginatedData.totalItems === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("transactions.no_results")}</p>
          </div>
        )}

        {/* 페이징 네비게이션 */}
        {paginatedData.totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                총 {paginatedData.totalItems}개 중{" "}
                {Math.min(
                  (paginatedData.currentPage - 1) * paginatedData.itemsPerPage + 1,
                  paginatedData.totalItems
                )}
                -
                {Math.min(
                  paginatedData.currentPage * paginatedData.itemsPerPage,
                  paginatedData.totalItems
                )}
                개 표시
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    setCurrentPage(Math.max(1, paginatedData.currentPage - 1))
                  }
                  disabled={paginatedData.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  이전
                </button>

                {[...Array(paginatedData.totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === paginatedData.currentPage;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        isCurrentPage
                          ? "bg-primary-600 text-white border-primary-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        paginatedData.totalPages,
                        paginatedData.currentPage + 1
                      )
                    )
                  }
                  disabled={paginatedData.currentPage === paginatedData.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  다음
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 상세 정보 패널 */}
      {selectedTransaction && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {(() => {
            const transaction = mockTransactions.find(
              (t) => t.id === selectedTransaction
            );
            if (!transaction) return null;

            return (
              <div>
                {/* 헤더 */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                        {getTransactionIcon(transaction.type)}
                      </div> */}
                      <div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              transaction.status
                            )}`}
                          >
                            {getStatusName(transaction.status)}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {getTransactionTypeName(transaction.type)} 상세 정보
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedTransaction(null)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                      <svg
                        className="h-5 w-5"
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
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 거래 요약 */}
                    <div className="lg:col-span-1">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        거래 요약
                      </h5>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900 mb-1">
                              {transaction.amount}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {transaction.asset}
                            </div>
                            <div className="text-lg font-semibold text-primary-600">
                              {formatCurrency(transaction.value)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">거래 유형</span>
                            <span className="font-medium">
                              {getTransactionTypeName(transaction.type)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">거래 시간</span>
                            <span className="font-medium">
                              {formatDate(transaction.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 블록체인 정보 */}
                    <div className="lg:col-span-2">
                      <h5 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        블록체인 정보
                      </h5>
                      <div className="space-y-4">
                        {transaction.txHash && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                트랜잭션 해시
                              </span>
                              <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                복사
                              </button>
                            </div>
                            <div className="font-mono text-sm text-gray-900 bg-white px-3 py-2 rounded border break-all">
                              {transaction.txHash}
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {transaction.from && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 text-gray-600 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    보낸 주소
                                  </span>
                                </div>
                                <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                  복사
                                </button>
                              </div>
                              <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                                {transaction.from}
                              </div>
                            </div>
                          )}

                          {transaction.to && (
                            <div className="bg-gray-50 p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <svg
                                    className="w-4 h-4 text-gray-600 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-gray-700">
                                    받는 주소
                                  </span>
                                </div>
                                <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                                  복사
                                </button>
                              </div>
                              <div className="font-mono text-xs text-gray-900 bg-white px-3 py-2 rounded border break-all">
                                {transaction.to}
                              </div>
                            </div>
                          )}
                        </div>

                        {transaction.status === "completed" && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center">
                              <svg
                                className="w-5 h-5 text-gray-600 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-800">
                                거래가 성공적으로 완료되었습니다
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              블록체인에 영구적으로 기록되었습니다.
                            </div>
                          </div>
                        )}

                        {transaction.status === "pending" && (
                          <div className="bg-gray-50 p-4 rounded-lg border">
                            <div className="flex items-center">
                              <svg
                                className="w-5 h-5 text-gray-600 mr-2 animate-spin"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                              <span className="text-sm font-medium text-gray-800">
                                거래 처리 중입니다
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-gray-600">
                              블록체인 네트워크에서 확인 중입니다. 잠시만 기다려
                              주세요.
                            </div>
                          </div>
                        )}

                        {!transaction.txHash &&
                          !transaction.from &&
                          !transaction.to && (
                            <div className="text-center py-8">
                              <div className="text-gray-400 mb-2">
                                <svg
                                  className="w-12 h-12 mx-auto"
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
                              </div>
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
            );
          })()}
        </div>
      )}
    </div>
  );
}
