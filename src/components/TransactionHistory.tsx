"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { useLanguage } from "@/contexts/LanguageContext";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { StatusBadge } from "./withdrawal/StatusBadge";
import { WithdrawalStatus } from "@/types/withdrawal";
import { getTransactionStatusInfo } from "@/utils/withdrawalHelpers";
import { Transaction, TransactionListResponse } from "@/types/transaction";
import { useAuth } from "@/contexts/AuthContext";
import { formatAmount } from "@/lib/format";
import TransactionDetailModal from "./transactions/TransactionDetailModal";

interface TransactionHistoryProps {
  plan: ServicePlan;
}

type TransactionType = "deposit" | "withdrawal";
type TransactionStatus = "completed" | "pending" | "failed";

export default function TransactionHistory({ plan }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();
  const { user } = useAuth();

  // API에서 거래 내역 조회
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          userId: user.id,
          page: currentPage.toString(),
          limit: itemsPerPage.toString(),
          order: "desc",
        });

        if (filterType !== "all") {
          params.append("type", filterType);
        }

        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const response = await fetch(
          `http://localhost:4000/api/transactions?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("거래 내역을 불러오는데 실패했습니다.");
        }

        const data: TransactionListResponse = await response.json();

        if (data.success) {
          setTransactions(data.data.transactions);
          setTotalItems(data.data.pagination.total);
          setTotalPages(data.data.pagination.totalPages);
        } else {
          throw new Error(data.error || "거래 내역을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        console.error("거래 내역 조회 오류:", err);
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [user?.id, currentPage, itemsPerPage, filterType, searchTerm]);

  // 필터나 검색어 변경시 페이지를 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, dateFilter]);

  const getTransactionTypeName = (type: TransactionType) => {
    const typeNames = {
      deposit: "입금",
      withdrawal: "출금",
    };
    return typeNames[type] || type;
  };

  const mapTransactionStatusToWithdrawalStatus = (
    status: TransactionStatus
  ): WithdrawalStatus => {
    const statusMap: Record<TransactionStatus, WithdrawalStatus> = {
      completed: "success",
      pending: "withdrawal_wait",
      failed: "failed",
    };
    return statusMap[status];
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

  // 클라이언트 사이드 기간 필터링
  const filteredTransactions = transactions.filter((tx) => {
    // 기간 필터
    if (dateFilter !== "all") {
      const txDate = new Date(tx.timestamp);
      const now = new Date();
      const diffTime = now.getTime() - txDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      switch (dateFilter) {
        case "today":
          if (diffDays !== 0) return false;
          break;
        case "week":
          if (diffDays > 7) return false;
          break;
        case "month":
          if (diffDays > 30) return false;
          break;
        case "quarter":
          if (diffDays > 90) return false;
          break;
      }
    }
    return true;
  });

  // CSV 다운로드 함수
  const downloadCSV = () => {
    // CSV 헤더
    const headers = [
      "유형",
      "자산",
      "네트워크",
      "수량",
      "상태",
      "신청일시",
      "종료일시",
      "트랜잭션 해시",
      "보낸주소",
      "받는 주소"
    ];

    // CSV 데이터 생성
    const csvData = filteredTransactions.map((tx) => {
      const statusInfo = getTransactionStatusInfo(tx.status);
      const completedDate = tx.status === "completed" ? formatDate(tx.timestamp) : "-";

      return [
        getTransactionTypeName(tx.type),
        tx.asset,
        tx.network || "-",
        formatAmount(tx.amount),
        statusInfo.name,
        formatDate(tx.timestamp),
        completedDate,
        tx.txHash || "-",
        tx.from || "-",
        tx.to || "-"
      ];
    });

    // CSV 문자열 생성
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))
    ].join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const bom = "\uFEFF";
    const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });

    // 다운로드 링크 생성
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `거래내역_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("transactions.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("transactions.subtitle")}</p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
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
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">전체 기간</option>
              <option value="today">오늘</option>
              <option value="week">최근 7일</option>
              <option value="month">최근 30일</option>
              <option value="quarter">최근 3개월</option>
            </select>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">거래 내역을 불러오는 중...</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 거래 내역 테이블 */}
        {!isLoading && !error && (
          <>
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
                      {t("transactions.table.status")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      신청일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      종료일시
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {tx.type === "deposit" ? (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sky-100">
                              <ArrowDownIcon className="h-4 w-4 text-sky-600" />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                              <ArrowUpIcon className="h-4 w-4 text-red-600" />
                            </div>
                          )}
                          <span
                            className={`font-semibold ${
                              tx.type === "deposit"
                                ? "text-sky-700"
                                : "text-red-700"
                            }`}
                          >
                            {getTransactionTypeName(tx.type)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            tx.type === "deposit"
                              ? "text-sky-700"
                              : "text-red-700"
                          }`}
                        >
                          {tx.type === "deposit" ? "+" : "-"}
                          {formatAmount(tx.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={mapTransactionStatusToWithdrawalStatus(tx.status)}
                          text={getTransactionStatusInfo(tx.status).name}
                          hideIcon={true}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(tx.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.status === "completed" ? formatDate(tx.timestamp) : "-"}
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

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">{t("transactions.no_results")}</p>
              </div>
            )}

            {/* 페이징 네비게이션 */}
            {totalPages > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    총 {totalItems}개 중{" "}
                    {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-
                    {Math.min(currentPage * itemsPerPage, totalItems)}개 표시
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      이전
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      const isCurrentPage = pageNumber === currentPage;

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
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 상세 정보 모달 */}
      <TransactionDetailModal
        transaction={transactions.find((t) => t.id === selectedTransaction) || null}
        onClose={() => setSelectedTransaction(null)}
      />
    </div>
  );
}
