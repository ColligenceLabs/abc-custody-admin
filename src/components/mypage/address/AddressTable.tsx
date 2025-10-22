"use client";

import { useState, useRef, useEffect } from "react";
import { TrashIcon, WalletIcon, BuildingOfficeIcon, UserIcon } from "@heroicons/react/24/outline";
import { WhitelistedAddress } from "@/types/address";
import { getDailyLimitStatus, formatKRW, getProgressPercentage } from "@/utils/addressHelpers";
import CryptoIcon from "@/components/ui/CryptoIcon";

interface AddressTableProps {
  addresses: WhitelistedAddress[];
  onDelete: (id: string) => void;
  getAssetColor: (asset: string) => string;
}

export default function AddressTable({ addresses, onDelete, getAssetColor }: AddressTableProps) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [maxChars, setMaxChars] = useState(45);

  const calculateMaxChars = (element: HTMLElement | null) => {
    if (!element) return 45;

    const containerWidth = element.offsetWidth;
    const fontSize = 0.65;
    const basePixelSize = 16;
    const charWidth = fontSize * basePixelSize * 0.6;
    const padding = 16;
    const buttonWidth = 40;

    const availableWidth = containerWidth - padding - buttonWidth;
    const maxChars = Math.floor(availableWidth / charWidth);

    return Math.max(20, Math.min(100, maxChars));
  };

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

  useEffect(() => {
    const updateMaxChars = () => {
      setMaxChars(calculateMaxChars(fieldRef.current));
    };

    updateMaxChars();

    const observer = new ResizeObserver(() => {
      updateMaxChars();
    });

    if (fieldRef.current) {
      observer.observe(fieldRef.current);
    }

    window.addEventListener("resize", updateMaxChars);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMaxChars);
    };
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('복사 실패:', err);
    }
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

  if (addresses.length === 0) {
    return (
      <div className="text-center py-8">
        <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">
          등록된 주소가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden" ref={fieldRef}>
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              라벨/주소
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              자산
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              타입
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              권한
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              등록일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              거래수
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              일일 한도
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {addresses.map((addr) => (
            <tr key={addr.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {addr.label}
                  </div>
                  <div
                    className="font-mono text-[0.65rem] leading-tight text-gray-900 bg-white px-2 py-1.5 rounded border break-all cursor-pointer hover:bg-gray-50"
                    title={addr.address}
                    onClick={() => copyToClipboard(addr.address)}
                  >
                    {truncateDynamic(addr.address, maxChars)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <CryptoIcon
                    symbol={addr.coin}
                    size={24}
                    className="mr-2 flex-shrink-0"
                  />
                  <span className="text-gray-900 font-semibold">
                    {addr.coin}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  {addr.type === "personal" ? (
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <BuildingOfficeIcon className="h-4 w-4 text-purple-600" />
                  )}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      addr.type === "personal"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {addr.type === "personal" ? "개인" : "거래소"}
                  </span>
                  {addr.vaspInfo && (
                    <span className="text-xs text-gray-500">
                      ({addr.vaspInfo.businessName})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  {addr.permissions.canDeposit && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 mr-1">
                      입금
                    </span>
                  )}
                  {addr.permissions.canWithdraw && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      출금
                    </span>
                  )}
                  {!addr.permissions.canDeposit && !addr.permissions.canWithdraw && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      권한 없음
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {formatDate(addr.addedAt)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {addr.txCount}회
              </td>
              <td className="px-6 py-4">
                {addr.type === "personal" ? (
                  (() => {
                    const limitStatus = getDailyLimitStatus(addr);
                    if (!limitStatus) {
                      return <span className="text-xs text-gray-500">한도 없음</span>;
                    }

                    const depositProgress = getProgressPercentage(limitStatus.depositUsed, limitStatus.depositLimit);
                    const withdrawalProgress = getProgressPercentage(limitStatus.withdrawalUsed, limitStatus.withdrawalLimit);
                    const maxProgress = Math.max(depositProgress, withdrawalProgress);

                    const getStatusColor = (progress: number) => {
                      if (progress >= 90) return "text-red-600 bg-red-100";
                      if (progress >= 70) return "text-amber-600 bg-amber-100";
                      return "text-blue-600 bg-blue-100";
                    };

                    const getStatusText = (progress: number) => {
                      if (progress >= 90) return "거의 소진";
                      if (progress >= 70) return "주의";
                      return "정상";
                    };

                    return (
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(maxProgress)}`}>
                          {getStatusText(maxProgress)}
                        </span>
                        <div className="text-xs text-gray-600">
                          <div>입금: {formatKRW(limitStatus.depositUsed)} / {formatKRW(limitStatus.depositLimit)}</div>
                          <div>출금: {formatKRW(limitStatus.withdrawalUsed)} / {formatKRW(limitStatus.withdrawalLimit)}</div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="space-y-1">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      제한 없음
                    </span>
                    <div className="text-xs text-gray-600">
                      VASP 지갑
                      {addr.vaspInfo?.travelRuleConnected && (
                        <div className="text-xs text-indigo-600">트래블룰 연동</div>
                      )}
                    </div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <button
                  onClick={() => onDelete(addr.id)}
                  className="text-red-600 hover:text-red-900 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}