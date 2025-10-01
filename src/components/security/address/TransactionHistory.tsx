"use client";

import { useState, useRef, useEffect } from "react";
import { Transaction, TransactionFilters } from "@/types/transaction";
import { formatKRW } from "@/utils/addressHelpers";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";
import PaginationNav from "./PaginationNav";

interface TransactionHistoryProps {
  transactions: Transaction[];
  getAssetColor: (asset: string) => string;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (tabKey: "personal" | "vasp", page: number) => void;
  showHeader?: boolean; // 헤더 표시 여부 (기본 false)
  // 외부에서 필터 상태 제어
  filters?: TransactionFilters;
  onFiltersChange?: (filters: TransactionFilters) => void;
  searchTerm?: string;
  onSearchTermChange?: (term: string) => void;
}

export default function TransactionHistory({
  transactions,
  getAssetColor,
  currentPage,
  itemsPerPage,
  onPageChange,
  showHeader = false,
  filters: externalFilters,
  onFiltersChange,
  searchTerm: externalSearchTerm,
  onSearchTermChange
}: TransactionHistoryProps) {
  // 내부 상태 (외부에서 제어하지 않을 때 사용)
  const [internalFilters, setInternalFilters] = useState<TransactionFilters>({
    direction: "all",
    assetType: "all",
    status: "all"
  });
  const [internalSearchTerm, setInternalSearchTerm] = useState("");

  // 실제 사용할 값들 (외부 props가 있으면 외부 값, 없으면 내부 값)
  const filters = externalFilters || internalFilters;
  const searchTerm = externalSearchTerm || internalSearchTerm;
  const setFilters = onFiltersChange || setInternalFilters;
  const setSearchTerm = onSearchTermChange || setInternalSearchTerm;
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 동적 truncate를 위한 상태 및 ref
  const txHashRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [maxChars, setMaxChars] = useState<Map<string, number>>(new Map());

  // 너비 계산 함수
  const calculateMaxChars = (element: HTMLElement | null) => {
    if (!element) return 45;

    const containerWidth = element.offsetWidth;
    const fontSize = 0.65; // text-[0.65rem]
    const basePixelSize = 16;
    const charWidth = fontSize * basePixelSize * 0.6;
    const padding = 16; // px-2
    const buttonWidth = 40;

    const availableWidth = containerWidth - padding - buttonWidth;
    const maxChars = Math.floor(availableWidth / charWidth);

    return Math.max(20, Math.min(100, maxChars));
  };

  // 동적 truncate 함수
  const truncateDynamic = (text: string, maxChars: number) => {
    if (!text || text.length <= maxChars) {
      return text;
    }

    const dotsLength = 3;
    const availableChars = maxChars - dotsLength;
    const frontChars = Math.ceil(availableChars * 0.65);
    const backChars = availableChars - frontChars;

    return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
  };

  // ResizeObserver 설정
  useEffect(() => {
    const updateMaxChars = () => {
      const newMaxChars = new Map();
      txHashRefs.current.forEach((ref, id) => {
        newMaxChars.set(id, calculateMaxChars(ref));
      });
      setMaxChars(newMaxChars);
    };

    updateMaxChars();

    const observer = new ResizeObserver(() => {
      updateMaxChars();
    });

    txHashRefs.current.forEach(ref => {
      if (ref) observer.observe(ref);
    });

    window.addEventListener("resize", updateMaxChars);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMaxChars);
    };
  }, [transactions]);

  // 클립보드 복사
  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  // 필터링된 거래 내역
  const filteredTransactions = transactions.filter(tx => {
    const matchesDirection = filters.direction === "all" || tx.direction === filters.direction;
    const matchesAsset = filters.assetType === "all" || tx.assetType === filters.assetType;
    const matchesStatus = filters.status === "all" || tx.status === filters.status;
    const matchesSearch = searchTerm === "" ||
      tx.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.addressLabel && tx.addressLabel.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesDirection && matchesAsset && matchesStatus && matchesSearch;
  });

  // 페이징 데이터
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const paginatedData = {
    items: paginatedTransactions,
    totalItems: filteredTransactions.length,
    totalPages: totalPages,
    currentPage: currentPage,
    itemsPerPage: itemsPerPage,
  };


  // 고유 자산 목록
  const uniqueAssets = Array.from(new Set(transactions.map(tx => tx.assetType))).sort();

  // 거래 방향 배지 색상
  const getDirectionBadgeColor = (direction: "deposit" | "withdrawal") => {
    return direction === "deposit"
      ? "bg-blue-50 border-blue-200 text-blue-800"
      : "bg-amber-50 border-amber-200 text-amber-800";
  };

  // 거래 상태 배지 색상
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "pending":
        return "bg-amber-50 border-amber-200 text-amber-800";
      case "failed":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  // 날짜 포맷팅
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString("ko-KR"),
      time: date.toLocaleTimeString("ko-KR", { hour12: false })
    };
  };

  // 필터 컴포넌트 (외부에서 사용할 수 있도록)
  const renderFilters = () => (
    <>
      <input
        type="text"
        placeholder="해시, 자산, 라벨 검색..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 relative"
      />
      <select
        value={filters.direction}
        onChange={(e) => setFilters({ ...filters, direction: e.target.value as any })}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="all">모든 방향</option>
        <option value="deposit">입금</option>
        <option value="withdrawal">출금</option>
      </select>
      <select
        value={filters.assetType}
        onChange={(e) => setFilters({ ...filters, assetType: e.target.value })}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="all">모든 자산</option>
        {uniqueAssets.map(asset => (
          <option key={asset} value={asset}>{asset}</option>
        ))}
      </select>
      <select
        value={filters.status}
        onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
        className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="all">모든 상태</option>
        <option value="completed">완료</option>
        <option value="pending">대기</option>
        <option value="failed">실패</option>
      </select>
    </>
  );

  return (
    <div className="space-y-6">
      {/* 조건부 필터 및 검색 (독립적으로 사용할 때만) */}
      {showHeader && (
        <>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {renderFilters()}
            </div>
          </div>

          {/* 요약 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">총 거래</div>
              <div className="text-xl font-semibold text-gray-900">{filteredTransactions.length}건</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">입금 건수</div>
              <div className="text-xl font-semibold text-blue-600">
                {filteredTransactions.filter(tx => tx.direction === "deposit").length}건
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">출금 건수</div>
              <div className="text-xl font-semibold text-amber-600">
                {filteredTransactions.filter(tx => tx.direction === "withdrawal").length}건
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-600">대기 중</div>
              <div className="text-xl font-semibold text-gray-600">
                {filteredTransactions.filter(tx => tx.status === "pending").length}건
              </div>
            </div>
          </div>
        </>
      )}

      {/* 거래 내역 테이블 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    거래 정보
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자산/수량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    원화 가치
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    트랜잭션 해시
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map(tx => {
                  const { date, time } = formatDateTime(tx.timestamp);
                  const maxCharsForTx = maxChars.get(tx.id) || 45;

                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getDirectionBadgeColor(tx.direction)}`}>
                              {tx.direction === "deposit" ? "입금" : "출금"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900">{date}</div>
                          <div className="text-xs text-gray-500">{time}</div>
                          {tx.addressLabel && (
                            <div className="text-xs text-gray-600 truncate max-w-xs" title={tx.addressLabel}>
                              {tx.addressLabel}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAssetColor(tx.assetType)}`}>
                              {tx.assetType}
                            </span>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {tx.amount.toLocaleString()} {tx.assetType}
                          </div>
                          {tx.fee && (
                            <div className="text-xs text-gray-500">
                              수수료: {tx.fee} {tx.assetType}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatKRW(tx.krwValue)}
                        </div>
                        {tx.exchangeRate && (
                          <div className="text-xs text-gray-500">
                            {formatKRW(tx.exchangeRate)}/{tx.assetType}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeColor(tx.status)}`}>
                            {tx.status === "completed" ? "완료" : tx.status === "pending" ? "대기" : "실패"}
                          </span>
                          {tx.confirmations !== undefined && (
                            <div className="text-xs text-gray-500">
                              확인: {tx.confirmations}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="space-y-2"
                          ref={(el) => {
                            if (el) {
                              txHashRefs.current.set(tx.id, el);
                            } else {
                              txHashRefs.current.delete(tx.id);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => copyToClipboard(tx.txHash, `hash-${tx.id}`)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              {copiedField === `hash-${tx.id}` ? "복사됨" : "복사"}
                            </button>
                          </div>
                          <div
                            className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all"
                            title={tx.txHash}
                          >
                            {truncateDynamic(tx.txHash, maxCharsForTx)}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                거래 내역이 없습니다
              </h3>
              <p className="text-gray-500">
                조건에 맞는 거래 내역을 찾을 수 없습니다.
              </p>
            </div>
          </div>
        )}

        {/* 페이징 네비게이션 */}
        <PaginationNav
          paginatedData={paginatedData}
          tabKey="personal"
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}