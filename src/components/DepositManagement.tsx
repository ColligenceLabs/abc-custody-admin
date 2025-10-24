"use client";

import { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { DepositTransaction, DepositHistory } from "@/types/deposit";
import {
  generateMockDeposits,
  generateMockDepositHistory,
} from "@/utils/depositHelpers";
import DepositProgressCard from "./deposit/DepositProgressCard";
import DepositHistoryTable from "./deposit/DepositHistoryTable";
import DepositStatistics from "./deposit/DepositStatistics";
import { Modal } from "@/components/common/Modal";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { useAuth } from "@/contexts/AuthContext";
import { getAddresses } from "@/utils/addressApi";
import { WhitelistedAddress } from "@/types/address";
import { QRCodeSVG } from "qrcode.react";
import { Tabs, TabItem } from "@/components/common/Tabs";
import { RequestHistoryList } from "@/components/deposit/RequestHistoryList";
import { RequestDetailModal } from "@/components/deposit/RequestDetailModal";
import { AssetAddRequest } from "@/types/assetRequest";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface DepositManagementProps {
  plan: ServicePlan;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  icon?: string; // CryptoIcon 컴포넌트 사용으로 optional
  depositAddress: string;
  isActive: boolean;
  contractAddress?: string; // ERC-20 토큰용 컨트랙트 주소
  priceKRW?: number; // 원화 가격
  priceUSD?: number; // 달러 가격
  priceApiUrl?: string; // 환율 API URL
}

interface Transaction {
  id: string;
  txHash: string;
  amount: string;
  timestamp: string;
  status: "confirmed" | "pending" | "failed";
  confirmations: number;
  fromAddress: string;
}

export default function DepositManagement({ plan }: DepositManagementProps) {
  const { user, isAuthenticated } = useAuth();

  // 진행 중인 입금 상태
  const [activeDeposits, setActiveDeposits] = useState<DepositTransaction[]>(
    []
  );
  // 입금 히스토리 상태
  const [depositHistory, setDepositHistory] = useState<DepositHistory[]>([]);

  const [assets, setAssets] = useState<Asset[]>([]);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [copiedAddress, setCopiedAddress] = useState<string>("");
  const [selectedQR, setSelectedQR] = useState<Asset | null>(null);
  const [selectedAssetHistory, setSelectedAssetHistory] =
    useState<Asset | null>(null);
  const [showStatusHelp, setShowStatusHelp] = useState<boolean>(false);
  const [showCustomERC20, setShowCustomERC20] = useState<boolean>(false);
  const [customERC20, setCustomERC20] = useState({
    symbol: "",
    name: "",
    contractAddress: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // 동적 truncate를 위한 ref와 상태
  const depositAddressRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [depositAddressMaxChars, setDepositAddressMaxChars] = useState<{ [key: string]: number }>({});

  // 자산 추가 요청 관리 (Mock 데이터로 초기화)
  // 상세 모달 및 탭 제어
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<AssetAddRequest | null>(null)
  const [activeAssetTab, setActiveAssetTab] = useState<string>('new-request')

  const [assetAddRequests, setAssetAddRequests] = useState<AssetAddRequest[]>([
    {
      id: '1',
      userId: user?.id || 'user_1',
      symbol: 'USDT',
      name: 'Tether USD',
      contractAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      network: 'ethereum',
      requestedBy: user?.name || '홍길동',
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      userId: user?.id || 'user_1',
      symbol: 'LINK',
      name: 'Chainlink',
      contractAddress: '0x514910771af9ca656af840dff83e8264ecf986ca',
      network: 'ethereum',
      requestedBy: user?.name || '홍길동',
      requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'reviewing',
      feedback: {
        message: '컨트랙트 주소를 확인 중입니다. 곧 검토가 완료될 예정입니다.',
        type: 'info',
        reviewedBy: '관리자',
        reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      userId: user?.id || 'user_1',
      symbol: 'UNI',
      name: 'Uniswap',
      contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      network: 'ethereum',
      requestedBy: user?.name || '홍길동',
      requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'approved',
      feedback: {
        message: '토큰이 승인되었습니다. 곧 입금 가능 자산 목록에 추가됩니다.',
        type: 'success',
        reviewedBy: '관리자',
        reviewedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      approvalNote: '검토 완료되었으며, 시스템에 등록되었습니다.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      userId: user?.id || 'user_1',
      symbol: 'INVALID',
      name: 'Invalid Token',
      contractAddress: '0xinvalidaddress',
      network: 'ethereum',
      requestedBy: user?.name || '홍길동',
      requestedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'rejected',
      feedback: {
        message: '제공하신 컨트랙트 주소가 유효하지 않습니다. 공식 웹사이트에서 정확한 주소를 확인해주세요.',
        type: 'error',
        reviewedBy: '관리자',
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      rejectionReason: '컨트랙트 주소가 올바른 형식이 아닙니다.',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);
  const [isClient, setIsClient] = useState(false);

  const availableAssets = [
    { symbol: "BTC", name: "Bitcoin", network: "Bitcoin" },
    { symbol: "ETH", name: "Ethereum", network: "Ethereum" },
    { symbol: "SOL", name: "Solana", network: "Solana" },
    { symbol: "USDT", name: "Tether", network: "Ethereum (ERC-20)" },
    { symbol: "USDC", name: "USD Coin", network: "Ethereum (ERC-20)" },
    {
      symbol: "CUSTOM_ERC20",
      name: "Custom ERC-20 Token",
      network: "Ethereum (ERC-20)",
    },
  ];

  // Helper functions from the original code

  const generateMockPrice = (symbol: string): { krw: number; usd: number } => {
    const mockPrices: { [key: string]: { krw: number; usd: number } } = {
      BTC: {
        krw: Math.floor(Math.random() * 10000000 + 80000000),
        usd: Math.floor(Math.random() * 10000 + 60000),
      },
      ETH: {
        krw: Math.floor(Math.random() * 1000000 + 4000000),
        usd: Math.floor(Math.random() * 500 + 3000),
      },
      SOL: {
        krw: Math.floor(Math.random() * 50000 + 100000),
        usd: Math.floor(Math.random() * 50 + 75),
      },
      USDT: { krw: 1330, usd: 1.0 },
      USDC: { krw: 1330, usd: 1.0 },
    };

    if (mockPrices[symbol]) {
      return mockPrices[symbol];
    } else {
      return {
        krw: Math.floor(Math.random() * 10000 + 1000),
        usd: Math.floor(Math.random() * 1000 + 100) / 100,
      };
    }
  };

  const handleCopyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  // 요청 상세 보기 핸들러
  const handleViewRequestDetails = (request: AssetAddRequest) => {
    setSelectedRequestDetail(request)
  }

  // 재요청 핸들러
  const handleResubmitRequest = (request: AssetAddRequest) => {
    // 기존 요청 데이터를 폼에 채우기
    setCustomERC20({
      symbol: request.symbol,
      name: request.name,
      contractAddress: request.contractAddress,
      image: request.image || '',
    })

    // 이미지 미리보기 설정
    if (request.image) {
      setImagePreview(request.image)
    }

    // Custom ERC-20 선택 및 표시
    setSelectedAsset('CUSTOM_ERC20')
    setShowCustomERC20(true)

    // 새 요청 탭으로 전환
    setActiveAssetTab('new-request')
  }

  const handleRemoveAsset = async (assetId: string) => {
    if (!confirm('이 입금 주소를 삭제하시겠습니까?')) {
      return;
    }

    try {
      // JWT 토큰 가져오기
      const token = localStorage.getItem('token');

      const res = await fetch(`${API_BASE_URL}/api/depositAddresses/${assetId}`, {
        method: 'DELETE',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete deposit address');
      }

      // 로컬 state에서 제거
      setAssets(assets.filter((asset) => asset.id !== assetId));
    } catch (error) {
      console.error('입금 주소 삭제 실패:', error);
      alert('입금 주소 삭제에 실패했습니다.');
    }
  };

  // 심볼에서 자산 이름 가져오기
  const getAssetName = (symbol: string): string => {
    const assetNames: Record<string, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      SOL: "Solana",
      USDT: "Tether",
      USDC: "USD Coin",
      KRW: "Korean Won",
    };
    return assetNames[symbol] || symbol;
  };

  // 심볼에서 네트워크 이름 가져오기
  const getNetworkName = (symbol: string): string => {
    const networkNames: Record<string, string> = {
      BTC: "Bitcoin",
      ETH: "Ethereum",
      SOL: "Solana",
      USDT: "Ethereum (ERC-20)",
      USDC: "Ethereum (ERC-20)",
      KRW: "Fiat",
    };
    return networkNames[symbol] || "Unknown";
  };

  // depositAddresses 테이블에서 입금 주소 목록 로드
  useEffect(() => {
    const loadDepositAddresses = async () => {
      if (!isAuthenticated || !user) {
        setAssets([]);
        return;
      }

      try {
        // depositAddresses API 호출
        const res = await fetch(`${API_BASE_URL}/api/depositAddresses?userId=${user.id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch deposit addresses');
        }

        const data = await res.json();
        const depositAddresses = Array.isArray(data) ? data : (data.depositAddresses || []);

        // Asset 형태로 변환
        const depositAssets: Asset[] = depositAddresses.map((addr: any) => ({
          id: addr.id,
          symbol: addr.coin,
          name: getAssetName(addr.coin),
          network: addr.network,
          depositAddress: addr.address,
          isActive: addr.isActive,
          contractAddress: addr.contractAddress,
          priceKRW: addr.priceKRW,
          priceUSD: addr.priceUSD,
        }));

        setAssets(depositAssets);
      } catch (error) {
        console.error("입금 주소 로드 실패:", error);
        setAssets([]);
      }
    };

    loadDepositAddresses();
  }, [user, isAuthenticated]);

  // 클라이언트 측에서만 localStorage 로드
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("assetAddRequests");
      if (stored) {
        try {
          setAssetAddRequests(JSON.parse(stored));
        } catch (error) {
          console.error("Error parsing stored assetAddRequests:", error);
        }
      }
    }
  }, []);

  // assetAddRequests가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    if (isClient && typeof window !== "undefined") {
      localStorage.setItem(
        "assetAddRequests",
        JSON.stringify(assetAddRequests)
      );
    }
  }, [assetAddRequests, isClient]);


  // 동적 truncate 함수 (CLAUDE.md 규칙 적용)
  const calculateMaxChars = (element: HTMLElement | null) => {
    if (!element) return 45; // 기본값

    const containerWidth = element.offsetWidth;
    const fontSize = 0.75; // rem - text-xs
    const basePixelSize = 16; // 1rem = 16px
    const charWidth = fontSize * basePixelSize * 0.6; // monospace 문자 너비
    const padding = 16; // px-2 (8px * 2)
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

  // 입금 주소 최대 문자 수 업데이트
  const updateDepositAddressMaxChars = () => {
    const newMaxChars: { [key: string]: number } = {};
    Object.keys(depositAddressRefs.current).forEach(assetId => {
      const element = depositAddressRefs.current[assetId];
      if (element) {
        newMaxChars[assetId] = calculateMaxChars(element);
      }
    });
    setDepositAddressMaxChars(newMaxChars);
  };

  // ResizeObserver로 크기 변경 감지
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      updateDepositAddressMaxChars();
    });

    // 모든 입금 주소 요소 관찰
    Object.values(depositAddressRefs.current).forEach(element => {
      if (element) {
        observer.observe(element);
      }
    });

    // 윈도우 리사이즈도 감지
    window.addEventListener('resize', updateDepositAddressMaxChars);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDepositAddressMaxChars);
    };
  }, []); // 빈 의존성 배열로 변경

  // 초기 계산
  useEffect(() => {
    updateDepositAddressMaxChars();
  }, []);

  // Mock 실시간 업데이트 시뮬레이션 - 추후 참고용으로 보존
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setActiveDeposits((prevDeposits) =>
  //       prevDeposits.map((deposit) => {
  //         if (
  //           deposit.status === "confirming" &&
  //           deposit.currentConfirmations < deposit.requiredConfirmations
  //         ) {
  //           const newConfirmations = Math.min(
  //             deposit.currentConfirmations + Math.floor(Math.random() * 2) + 1,
  //             deposit.requiredConfirmations + 2
  //           );
  //           let newStatus = deposit.status as any;
  //           if (newConfirmations >= deposit.requiredConfirmations) {
  //             newStatus = Math.random() > 0.1 ? "confirmed" : "credited";
  //           }
  //           return {
  //             ...deposit,
  //             currentConfirmations: newConfirmations,
  //             status: newStatus as any,
  //             confirmedAt:
  //               newStatus === "confirmed" || newStatus === "credited"
  //                 ? new Date().toISOString()
  //                 : deposit.confirmedAt,
  //             creditedAt:
  //               newStatus === "credited"
  //                 ? new Date().toISOString()
  //                 : deposit.creditedAt,
  //           };
  //         }
  //         if (deposit.status === "confirmed" && Math.random() < 0.3) {
  //           return {
  //             ...deposit,
  //             status: "credited" as any,
  //             creditedAt: new Date().toISOString(),
  //           };
  //         }
  //         return deposit;
  //       })
  //     );
  //     if (Math.random() < 0.05) {
  //       const newDeposit = generateMockDeposits(1)[0];
  //       setActiveDeposits((prev) => [newDeposit, ...prev.slice(0, 9)]);
  //     }
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // 진행 중인 입금 및 히스토리 조회 (30초 주기 polling)
  useEffect(() => {
    const fetchDeposits = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        // 1. 진행 중인 입금 조회 (백엔드 크롤러가 자동으로 모니터링)
        const activeRes = await fetch(`${API_BASE_URL}/api/deposits/active?userId=${user.id}`);
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          setActiveDeposits(activeData);
        }

        // 2. 입금 히스토리 조회
        const historyRes = await fetch(`${API_BASE_URL}/api/deposits/history?userId=${user.id}&page=1&limit=20`);
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setDepositHistory(historyData.deposits || []);
        }
      } catch (error) {
        console.error('입금 데이터 조회 실패:', error);
      }
    };

    // 초기 로드
    fetchDeposits();

    // 30초마다 polling (백엔드 크롤러가 3분마다 실행되므로 30초면 충분)
    const interval = setInterval(fetchDeposits, 30000);

    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  // 중복 자산 추가도 허용 (동일 자산의 다른 주소 생성 등의 용도)
  const filteredAvailableAssets = availableAssets;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">입금 관리</h1>
          <p className="text-gray-600 mt-1">
            가상자산 입금 주소 관리 및 진행 상황 추적
          </p>
          {isClient &&
            assetAddRequests.filter((req) => req.status === "pending").length >
              0 && (
              <div className="mt-2 flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full w-fit">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                대기중인 자산 추가 요청{" "}
                {
                  assetAddRequests.filter((req) => req.status === "pending")
                    .length
                }
                건
              </div>
            )}
        </div>
        <button
          onClick={() => setShowAddAsset(true)}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          자산 추가
        </button>
      </div>

      {/* 진행 중인 입금 현황 */}
      {activeDeposits.filter((d) => d.status !== "credited").length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              진행 중인 입금
            </h2>
            <span className="text-sm text-gray-500">
              실시간 업데이트 중 •{" "}
              {activeDeposits.filter((d) => d.status !== "credited").length}건
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeDeposits
              .filter((deposit) => deposit.status !== "credited")
              .slice(0, 6)
              .map((deposit) => (
                <DepositProgressCard
                  key={deposit.id}
                  deposit={deposit}
                  onViewDetails={(depositId) => {
                    // 상세 정보 모달 열기 로직
                    console.log("View details for:", depositId);
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* 입금 주소 관리 섹션 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          입금 주소 관리
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    자산
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    네트워크
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    입금 주소
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    환율
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CryptoIcon
                          symbol={asset.symbol}
                          size={40}
                          className="mr-3"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500">
                            {asset.name}
                          </div>
                          {asset.contractAddress && (
                            <div
                              className="text-xs font-mono text-gray-400 truncate max-w-32"
                              title={asset.contractAddress}
                            >
                              {asset.contractAddress.substring(0, 8)}...
                              {asset.contractAddress.substring(
                                asset.contractAddress.length - 6
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {asset.network}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 max-w-lg">
                        <div
                          ref={(el) => {
                            depositAddressRefs.current[asset.id] = el;
                          }}
                          className="text-xs font-mono bg-gray-100 p-2 rounded flex-1 break-all"
                          title={asset.depositAddress}
                        >
                          {truncateDynamic(
                            asset.depositAddress,
                            depositAddressMaxChars[asset.id] || 45
                          )}
                        </div>
                        <button
                          onClick={() =>
                            handleCopyAddress(asset.depositAddress)
                          }
                          className="p-2 text-gray-500 hover:text-primary-600 transition-colors flex-shrink-0"
                          title="주소 복사"
                        >
                          {copiedAddress === asset.depositAddress ? (
                            <CheckIcon className="h-4 w-4 text-sky-600" />
                          ) : (
                            <ClipboardDocumentIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₩{asset.priceKRW?.toLocaleString() || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => setSelectedQR(asset)}
                          className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                          title="QR 코드 보기"
                        >
                          <QrCodeIcon className="h-4 w-4 mr-1" />
                          QR
                        </button>
                        <button
                          onClick={() => handleRemoveAsset(asset.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          title="자산 제거"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {assets.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <PlusIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              자산이 없습니다
            </h3>
            <p className="text-gray-600 mb-4">
              첫 번째 자산을 추가하여 입금을 시작하세요
            </p>
            <button
              onClick={() => setShowAddAsset(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              자산 추가
            </button>
          </div>
        )}
      </div>

      {/* 입금 히스토리 섹션 */}
      <div>
        <DepositHistoryTable deposits={depositHistory} />
      </div>

      {/* Add Asset Modal */}
      <Modal isOpen={showAddAsset}>
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">자산 추가 요청</h3>
            <button
              onClick={() => {
                setShowAddAsset(false);
                setSelectedAsset("");
                setShowCustomERC20(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <Tabs
            activeTab={activeAssetTab}
            onChange={setActiveAssetTab}
            tabs={[
              {
                id: 'new-request',
                label: '새 요청',
                content: (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                자산 선택
              </label>
              <div
                className={`grid gap-3 transition-all duration-300 ${
                  showCustomERC20 ? "grid-cols-6" : "grid-cols-3"
                }`}
              >
                {filteredAvailableAssets.map((asset) => {
                  // 이미 추가된 자산인지 확인
                  const isAlreadyAdded = assets.some(a => a.symbol === asset.symbol && a.isActive);

                  return (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      if (isAlreadyAdded) return; // 이미 추가된 자산은 클릭 방지
                      setSelectedAsset(asset.symbol);
                      setShowCustomERC20(asset.symbol === "CUSTOM_ERC20");
                      if (asset.symbol !== "CUSTOM_ERC20") {
                        setCustomERC20({
                          symbol: "",
                          name: "",
                          contractAddress: "",
                          image: "",
                        });
                        setImagePreview("");
                      }
                    }}
                    disabled={isAlreadyAdded}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 relative ${
                      isAlreadyAdded
                        ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : selectedAsset === asset.symbol
                        ? "border-primary-500 bg-primary-50 text-primary-700 hover:shadow-md"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1.5">
                      {asset.symbol === "CUSTOM_ERC20" ? (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        </div>
                      ) : (
                        <CryptoIcon symbol={asset.symbol} size={32} />
                      )}
                      <div
                        className={`text-center transition-all duration-300 ${
                          showCustomERC20 ? "hidden" : "block"
                        }`}
                      >
                        <div className="text-xs font-semibold">
                          {asset.symbol}
                          {(asset.symbol === "USDT" ||
                            asset.symbol === "USDC") && (
                            <span className="ml-1 text-xs text-blue-600 font-normal">
                              ERC20
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-full leading-tight">
                          {asset.symbol === "CUSTOM_ERC20"
                            ? "Custom"
                            : asset.name}
                        </div>
                      </div>
                      {isAlreadyAdded && (
                        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded">
                          추가됨
                        </div>
                      )}
                    </div>
                  </button>
                );
                })}
              </div>
            </div>

            {/* Custom ERC-20 입력 필드들 */}
            {showCustomERC20 && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h4 className="text-sm font-medium text-gray-900">
                  Custom ERC-20 토큰 정보
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      토큰 심볼 *
                    </label>
                    <input
                      type="text"
                      value={customERC20.symbol}
                      onChange={(e) =>
                        setCustomERC20({
                          ...customERC20,
                          symbol: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="예: KRW"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      토큰 이름 *
                    </label>
                    <input
                      type="text"
                      value={customERC20.name}
                      onChange={(e) =>
                        setCustomERC20({
                          ...customERC20,
                          name: e.target.value,
                        })
                      }
                      placeholder="예: Tether USD"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 placeholder:text-sm placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    로고
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // 파일 크기 제한 (2MB)
                          if (file.size > 2 * 1024 * 1024) {
                            alert("파일 크기는 2MB를 초과할 수 없습니다.");
                            return;
                          }

                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setCustomERC20({ ...customERC20, image: result });
                            setImagePreview(result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="flex items-center px-3 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <span className="text-sm text-gray-700">파일 선택</span>
                    </label>
                    {imagePreview && (
                      <div className="flex items-center space-x-2">
                        <img
                          src={imagePreview}
                          alt="Logo Preview"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCustomERC20({ ...customERC20, image: "" });
                            setImagePreview("");
                            // 파일 입력 초기화
                            const input = document.getElementById(
                              "logo-upload"
                            ) as HTMLInputElement;
                            if (input) input.value = "";
                          }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          제거
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF 파일 지원 (최대 2MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    컨트랙트 주소 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={customERC20.contractAddress}
                      onChange={(e) =>
                        setCustomERC20({
                          ...customERC20,
                          contractAddress: e.target.value,
                        })
                      }
                      placeholder="0x..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm placeholder:text-xs placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-yellow-50 p-2 rounded border border-yellow-200">
                  <strong>주의:</strong> 컨트랙트 주소가 정확한지 확인해주세요.
                  잘못된 주소로 인한 손실에 대해 책임지지 않습니다.
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAddAsset(false);
                  setSelectedAsset("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (selectedAsset === "CUSTOM_ERC20") {
                    // Custom ERC-20 토큰 추가 요청 생성
                    if (
                      customERC20.symbol &&
                      customERC20.name &&
                      customERC20.contractAddress &&
                      customERC20.image
                    ) {
                      const newRequest: AssetAddRequest = {
                        id: Date.now().toString(),
                        userId: user?.id || 'unknown',
                        symbol: customERC20.symbol,
                        name: customERC20.name,
                        contractAddress: customERC20.contractAddress,
                        network: 'ethereum',
                        image: customERC20.image,
                        requestedBy: user?.name || "현재사용자",
                        requestedAt: new Date().toISOString(),
                        status: "pending",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };

                      // 추가 요청 목록에 추가
                      setAssetAddRequests((prev) => [newRequest, ...prev]);
                      console.log("새로운 자산 추가 요청:", newRequest);
                      console.log(
                        "현재 저장된 요청들:",
                        JSON.parse(
                          localStorage.getItem("assetAddRequests") || "[]"
                        )
                      );

                      // 모달 닫기 및 초기화
                      setShowAddAsset(false);
                      setSelectedAsset("");
                      setShowCustomERC20(false);
                      setCustomERC20({
                        symbol: "",
                        name: "",
                        contractAddress: "",
                        image: "",
                      });
                      setImagePreview("");

                      // 성공 메시지 표시
                      alert(
                        `${customERC20.name} (${customERC20.symbol}) 추가 요청이 전송되었습니다.\n시스템 관리자의 승인 후 사용 가능합니다.`
                      );
                    }
                  } else if (selectedAsset) {
                    // 일반 자산 추가 - API 호출
                    const handleAddAsset = async () => {
                      if (!user) return;

                      const assetInfo = availableAssets.find(
                        (a) => a.symbol === selectedAsset
                      );
                      if (!assetInfo) return;

                      try {
                        const prices = generateMockPrice(assetInfo.symbol);

                        // JWT 토큰 가져오기
                        const token = localStorage.getItem('token');

                        const res = await fetch(`${API_BASE_URL}/api/depositAddresses`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            ...(token && { 'Authorization': `Bearer ${token}` }),
                          },
                          body: JSON.stringify({
                            userId: user.id,
                            label: `${assetInfo.name} 입금 주소`,
                            coin: assetInfo.symbol,
                            network: assetInfo.network,
                            type: 'personal',
                            priceKRW: prices.krw,
                            priceUSD: prices.usd,
                          }),
                        });

                        if (!res.ok) {
                          const errorData = await res.json();
                          if (res.status === 409) {
                            alert(errorData.message || `${assetInfo.symbol} 자산은 이미 추가되었습니다.`);
                          } else {
                            throw new Error(errorData.message || 'Failed to add deposit address');
                          }
                          return;
                        }

                        const newDepositAddress = await res.json();

                        // 로컬 state 업데이트
                        const newAsset: Asset = {
                          id: newDepositAddress.id,
                          symbol: newDepositAddress.coin,
                          name: assetInfo.name,
                          network: newDepositAddress.network,
                          depositAddress: newDepositAddress.address,
                          isActive: newDepositAddress.isActive,
                          contractAddress: newDepositAddress.contractAddress,
                          priceKRW: newDepositAddress.priceKRW,
                          priceUSD: newDepositAddress.priceUSD,
                        };

                        setAssets([...assets, newAsset]);
                        setShowAddAsset(false);
                        setSelectedAsset("");
                      } catch (error) {
                        console.error('자산 추가 실패:', error);
                        alert('자산 추가에 실패했습니다.');
                      }
                    };

                    handleAddAsset();
                  }
                }}
                disabled={
                  selectedAsset === "CUSTOM_ERC20"
                    ? !customERC20.symbol ||
                      !customERC20.name ||
                      !customERC20.contractAddress ||
                      !customERC20.image
                    : !selectedAsset
                }
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {selectedAsset === "CUSTOM_ERC20" ? "추가 요청" : "추가"}
              </button>
            </div>
          </div>
                ),
              },
              {
                id: 'request-history',
                label: '요청 내역',
                badge: assetAddRequests.length,
                content: (
                  <RequestHistoryList
                    requests={assetAddRequests}
                    isLoading={false}
                    onViewDetails={handleViewRequestDetails}
                    onResubmit={handleResubmitRequest}
                  />
                ),
              },
            ]}
            defaultTab="new-request"
          />
        </div>
      </Modal>

      {/* Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequestDetail}
        isOpen={!!selectedRequestDetail}
        onClose={() => setSelectedRequestDetail(null)}
        onResubmit={handleResubmitRequest}
      />

      {/* QR Code Modal */}
      <Modal isOpen={!!selectedQR}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedQR?.symbol} 입금 QR 코드
            </h3>
            <button
              onClick={() => setSelectedQR(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                {selectedQR?.depositAddress && (
                  <QRCodeSVG
                    value={selectedQR.depositAddress}
                    size={192}
                    level="H"
                    includeMargin={false}
                  />
                )}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">입금 주소</p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                {selectedQR?.depositAddress}
              </p>
            </div>

            <button
              onClick={() =>
                handleCopyAddress(selectedQR?.depositAddress || "")
              }
              className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              {copiedAddress === selectedQR?.depositAddress ? (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  복사됨
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                  주소 복사
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
