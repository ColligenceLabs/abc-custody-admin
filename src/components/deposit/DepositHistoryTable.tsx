import { useState, useRef, useEffect } from "react";
import { DepositHistory } from "@/types/deposit";
import { Modal } from "@/components/common/Modal";
import { formatAmount, formatDateTime } from "@/utils/depositHelpers";
import DepositStatusBadge from "./DepositStatusBadge";
import DepositTimeline from "./DepositTimeline";
import { FunnelIcon, EyeIcon, XMarkIcon, ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";

interface DepositHistoryTableProps {
  deposits: DepositHistory[];
  itemsPerPage?: number;
}

export default function DepositHistoryTable({
  deposits,
  itemsPerPage = 10
}: DepositHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assetFilter, setAssetFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeposit, setSelectedDeposit] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string>("");

  // 동적 truncate를 위한 ref와 상태
  const txHashRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const [txHashMaxChars, setTxHashMaxChars] = useState<{ [key: string]: number }>({});

  // 필터링 로직
  const getFilteredDeposits = () => {
    return deposits.filter((deposit) => {
      // 검색어 필터
      const searchMatch = 
        searchTerm === "" ||
        deposit.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.asset.toLowerCase().includes(searchTerm.toLowerCase()) ||
        deposit.amount.includes(searchTerm) ||
        deposit.fromAddress.toLowerCase().includes(searchTerm.toLowerCase());

      // 상태 필터
      const statusMatch = statusFilter === "all" || deposit.status === statusFilter;

      // 자산 필터
      const assetMatch = assetFilter === "all" || deposit.asset === assetFilter;

      // 기간 필터
      let dateMatch = true;
      if (dateFilter !== "all") {
        const depositDate = new Date(deposit.detectedAt);
        const now = new Date();
        const diffTime = now.getTime() - depositDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case "today":
            dateMatch = diffDays === 0;
            break;
          case "week":
            dateMatch = diffDays <= 7;
            break;
          case "month":
            dateMatch = diffDays <= 30;
            break;
          case "quarter":
            dateMatch = diffDays <= 90;
            break;
          default:
            dateMatch = true;
        }
      }

      return searchMatch && statusMatch && assetMatch && dateMatch;
    });
  };

  // 페이지네이션 로직
  const getPaginatedDeposits = () => {
    const filtered = getFilteredDeposits();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
      currentPage: currentPage,
      itemsPerPage: itemsPerPage,
    };
  };

  const paginatedData = getPaginatedDeposits();

  // 고유 자산 목록 생성
  const uniqueAssets = Array.from(new Set(deposits.map(d => d.asset)));

  // 동적 truncate 함수 (CLAUDE.md 규칙 적용)
  const calculateMaxChars = (element: HTMLElement | null) => {
    if (!element) return 45; // 기본값

    const containerWidth = element.offsetWidth;
    const fontSize = 0.75; // rem - text-xs
    const basePixelSize = 16; // 1rem = 16px
    const charWidth = fontSize * basePixelSize * 0.6; // monospace 문자 너비
    const padding = 8; // 여백
    const buttonWidth = 40; // 복사 버튼 너비

    const availableWidth = containerWidth - padding - buttonWidth;
    const maxChars = Math.floor(availableWidth / charWidth);

    // 최소 20자, 최대 100자로 제한
    return Math.max(20, Math.min(100, maxChars));
  };

  const truncateDynamic = (text: string, maxChars: number) => {
    if (!text || text.length <= maxChars) {
      return text;
    }

    const dotsLength = 3;
    const availableChars = maxChars - dotsLength;

    // 앞 65%, 뒤 35% 비율로 분배
    const frontChars = Math.ceil(availableChars * 0.65);
    const backChars = availableChars - frontChars;

    return `${text.slice(0, frontChars)}...${text.slice(-backChars)}`;
  };

  // 트랜잭션 해시 최대 문자 수 업데이트
  const updateTxHashMaxChars = () => {
    const newMaxChars: { [key: string]: number } = {};
    Object.keys(txHashRefs.current).forEach(depositId => {
      const element = txHashRefs.current[depositId];
      if (element) {
        newMaxChars[depositId] = calculateMaxChars(element);
      }
    });
    setTxHashMaxChars(newMaxChars);
  };

  // ResizeObserver로 크기 변경 감지
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateTxHashMaxChars();
    });

    // 모든 트랜잭션 해시 요소 관찰
    Object.values(txHashRefs.current).forEach(element => {
      if (element) {
        observer.observe(element);
      }
    });

    // 윈도우 리사이즈도 감지
    window.addEventListener('resize', updateTxHashMaxChars);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateTxHashMaxChars);
    };
  }, [currentPage, searchTerm, statusFilter, assetFilter, dateFilter]); // 의존성을 안정적인 값들로 변경

  // 초기 계산
  useEffect(() => {
    updateTxHashMaxChars();
  }, [currentPage, searchTerm, statusFilter, assetFilter, dateFilter]);

  const truncateAddress = (address: string, length: number = 16) => {
    if (address.length <= length) return address;
    return `${address.substring(0, length/2)}...${address.substring(address.length - length/2)}`;
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(""), 2000);
    } catch (err) {
      console.error("Failed to copy hash:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* 통합된 테이블 섹션 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-0">
              입금 히스토리
            </h3>
            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* 검색 */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ID, 트랜잭션 해시, 자산 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* 상태 필터 */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 상태</option>
                <option value="detected">감지됨</option>
                <option value="confirming">컨펌 진행중</option>
                <option value="confirmed">컨펌 완료</option>
                <option value="credited">입금 완료</option>
                <option value="failed">실패</option>
              </select>

              {/* 자산 필터 */}
              <select
                value={assetFilter}
                onChange={(e) => setAssetFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">모든 자산</option>
                {uniqueAssets.map(asset => (
                  <option key={asset} value={asset}>{asset}</option>
                ))}
              </select>

              {/* 기간 필터 */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">전체 기간</option>
                <option value="today">오늘</option>
                <option value="week">최근 7일</option>
                <option value="month">최근 30일</option>
                <option value="quarter">최근 3개월</option>
              </select>
            </div>
          </div>
        </div>

        {/* 데이터 표시 영역 */}
        <div className="p-6">
        {paginatedData.totalItems === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FunnelIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-500">
              다른 검색어나 필터 조건을 시도해보세요.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-36">
                      일시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-28">
                      자산
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-36">
                      금액
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-56">
                      트랜잭션 해시
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-20">
                      상태
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase w-20">
                      확인수
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase w-24">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.items.map((deposit) => (
                    <tr key={deposit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="whitespace-nowrap">
                          {formatDateTime(deposit.detectedAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <img
                            src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${deposit.asset.toLowerCase()}.png`}
                            alt={deposit.asset}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                  <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                                  <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                    ${deposit.asset}
                                  </text>
                                </svg>
                              `)}`;
                            }}
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {deposit.asset}
                            </div>
                            <div className="text-xs text-gray-500">
                              {deposit.network}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {formatAmount(deposit.amount, deposit.asset)}
                        </div>
                        {deposit.valueInKRW && (
                          <div className="text-xs text-gray-500">
                            ₩{deposit.valueInKRW.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <code
                            ref={(el) => {
                              txHashRefs.current[deposit.id] = el;
                            }}
                            className="text-xs font-mono text-gray-700 break-all flex-1"
                            title={deposit.txHash}
                          >
                            {truncateDynamic(
                              deposit.txHash,
                              txHashMaxChars[deposit.id] || 45
                            )}
                          </code>
                          <button
                            onClick={() => handleCopyHash(deposit.txHash)}
                            className="ml-1 p-1 text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0"
                            title="트랜잭션 해시 복사"
                          >
                            {copiedHash === deposit.txHash ? (
                              <CheckIcon className="h-4 w-4 text-sky-600" />
                            ) : (
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DepositStatusBadge status={deposit.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {deposit.currentConfirmations}/{deposit.requiredConfirmations}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedDeposit(deposit.id)}
                          className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          상세보기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {paginatedData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-700 mb-4 sm:mb-0">
                    총 {paginatedData.totalItems}개 중{" "}
                    {Math.min(
                      (paginatedData.currentPage - 1) * paginatedData.itemsPerPage + 1,
                      paginatedData.totalItems
                    )}
                    -{Math.min(paginatedData.currentPage * paginatedData.itemsPerPage, paginatedData.totalItems)}개 표시
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, paginatedData.currentPage - 1))}
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
                      onClick={() => setCurrentPage(Math.min(paginatedData.totalPages, paginatedData.currentPage + 1))}
                      disabled={paginatedData.currentPage === paginatedData.totalPages}
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
      </div>

      {/* 상세 정보 모달 */}
      <Modal isOpen={!!selectedDeposit}>
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                입금 상세 정보
              </h3>
              <button
                onClick={() => setSelectedDeposit(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              {(() => {
                const deposit = deposits.find(d => d.id === selectedDeposit);
                if (!deposit) return null;
                return <DepositTimeline deposit={deposit} />;
              })()}
            </div>
        </div>
      </Modal>
    </div>
  );
}