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

interface DepositManagementProps {
  plan: ServicePlan;
}

interface Asset {
  id: string;
  symbol: string;
  name: string;
  network: string;
  icon: string;
  depositAddress: string;
  qrCode: string;
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

interface AssetAddRequest {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  image?: string;
  priceApiUrl?: string;
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  rejectedReason?: string;
}

export default function DepositManagement({ plan }: DepositManagementProps) {
  // 진행 중인 입금 상태
  const [activeDeposits, setActiveDeposits] = useState<DepositTransaction[]>(
    []
  );
  // 입금 히스토리 상태
  const [depositHistory, setDepositHistory] = useState<DepositHistory[]>([]);

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "1",
      symbol: "BTC",
      name: "Bitcoin",
      network: "Bitcoin",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png",
      depositAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      qrCode: "",
      isActive: true,
    },
    {
      id: "2",
      symbol: "ETH",
      name: "Ethereum",
      network: "Ethereum",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png",
      depositAddress: "0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a",
      qrCode: "",
      isActive: true,
    },
    {
      id: "3",
      symbol: "SOL",
      name: "Solana",
      network: "Solana",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png",
      depositAddress: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
      qrCode: "",
      isActive: true,
    },
    {
      id: "4",
      symbol: "USDT",
      name: "Tether",
      network: "Ethereum (ERC-20)",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdt.png",
      depositAddress: "0x8ba1f109551bd432803012645hac136c6ad4cfc7",
      qrCode: "",
      isActive: true,
    },
    {
      id: "5",
      symbol: "USDC",
      name: "USD Coin",
      network: "Ethereum (ERC-20)",
      icon: "https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdc.png",
      depositAddress: "0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a",
      qrCode: "",
      isActive: true,
    },
  ]);

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
    priceApiUrl: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  // 가격 피드 조회 관련 상태
  const [isCheckingPriceFeed, setIsCheckingPriceFeed] =
    useState<boolean>(false);
  const [priceFeedStatus, setPriceFeedStatus] = useState<
    "idle" | "checking" | "found" | "not_found"
  >("idle");
  const [showPriceApiInput, setShowPriceApiInput] = useState<boolean>(false);

  // 동적 truncate를 위한 ref와 상태
  const depositAddressRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [depositAddressMaxChars, setDepositAddressMaxChars] = useState<{ [key: string]: number }>({});

  // 자산 추가 요청 관리 (localStorage와 동기화)
  const [assetAddRequests, setAssetAddRequests] = useState<AssetAddRequest[]>([]);
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
  const generateDepositAddress = (symbol: string): string => {
    return generateFromAddress(symbol);
  };

  const generateQRCode = (address: string): string => {
    const svgContent = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#fff"/>
        <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="14" fill="#666">QR Code</text>
        <text x="100" y="125" text-anchor="middle" font-family="Arial" font-size="8" fill="#666">${address.substring(
          0,
          10
        )}...</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  const generateFromAddress = (symbol: string): string => {
    const generateRandomHex = (length: number) => {
      return Array.from({ length }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
    };

    const generateRandomBase58 = (length: number) => {
      const chars =
        "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
      return Array.from(
        { length },
        () => chars[Math.floor(Math.random() * chars.length)]
      ).join("");
    };

    switch (symbol) {
      case "BTC":
        return "bc1" + generateRandomBase58(39);
      case "ETH":
      case "USDT":
      case "USDC":
        return "0x" + generateRandomHex(40);
      case "SOL":
        return generateRandomBase58(44);
      default:
        return "0x" + generateRandomHex(40);
    }
  };

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

  const handleRemoveAsset = (assetId: string) => {
    setAssets(assets.filter((asset) => asset.id !== assetId));
  };

  // Initialize QR codes, prices, and mock deposit data after component mount
  useEffect(() => {
    setAssets((prevAssets) =>
      prevAssets.map((asset) => {
        const prices = generateMockPrice(asset.symbol);
        return {
          ...asset,
          qrCode: asset.qrCode || generateQRCode(asset.depositAddress),
          priceKRW: prices.krw,
          priceUSD: prices.usd,
        };
      })
    );

    // 초기 Mock 데이터 생성
    setActiveDeposits(generateMockDeposits(5));
    setDepositHistory(generateMockDepositHistory(20));
  }, []);

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

  // 가격 피드 조회 시뮬레이션 함수
  const checkPriceFeed = async (contractAddress: string) => {
    if (
      !contractAddress ||
      contractAddress.length !== 42 ||
      !contractAddress.startsWith("0x")
    ) {
      return;
    }

    setIsCheckingPriceFeed(true);
    setPriceFeedStatus("checking");

    // 2초 딜레이로 시스템 조회 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 30% 확률로 가격 피드 있음 (대부분 새로운 토큰은 가격 피드가 없음)
    const hasPriceFeed = Math.random() > 0.7;

    if (hasPriceFeed) {
      setPriceFeedStatus("found");
      setShowPriceApiInput(false);
      // 가격 피드가 있으면 priceApiUrl 자동 설정 (시스템 내부 API)
      setCustomERC20((prev) => ({
        ...prev,
        priceApiUrl: `https://api.internal.system/price/${contractAddress}`,
      }));
      console.log("가격 피드 발견:", contractAddress);
    } else {
      setPriceFeedStatus("not_found");
      setShowPriceApiInput(true);
      // 가격 피드가 없으면 기존 priceApiUrl 초기화
      setCustomERC20((prev) => ({
        ...prev,
        priceApiUrl: "",
      }));
      console.log("가격 피드 없음:", contractAddress);
    }

    setIsCheckingPriceFeed(false);
  };

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

  // 실시간 업데이트 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDeposits((prevDeposits) =>
        prevDeposits.map((deposit) => {
          // 진행 중인 상태만 업데이트
          if (
            deposit.status === "confirming" &&
            deposit.currentConfirmations < deposit.requiredConfirmations
          ) {
            const newConfirmations = Math.min(
              deposit.currentConfirmations + Math.floor(Math.random() * 2) + 1,
              deposit.requiredConfirmations + 2
            );

            let newStatus = deposit.status as any;
            if (newConfirmations >= deposit.requiredConfirmations) {
              newStatus = Math.random() > 0.1 ? "confirmed" : "credited";
            }

            return {
              ...deposit,
              currentConfirmations: newConfirmations,
              status: newStatus as any,
              confirmedAt:
                newStatus === "confirmed" || newStatus === "credited"
                  ? new Date().toISOString()
                  : deposit.confirmedAt,
              creditedAt:
                newStatus === "credited"
                  ? new Date().toISOString()
                  : deposit.creditedAt,
            };
          }

          // confirmed 상태를 credited로 전환
          if (deposit.status === "confirmed" && Math.random() < 0.3) {
            return {
              ...deposit,
              status: "credited" as any,
              creditedAt: new Date().toISOString(),
            };
          }

          return deposit;
        })
      );

      // 새로운 입금 감지 시뮬레이션 (5% 확률)
      if (Math.random() < 0.05) {
        const newDeposit = generateMockDeposits(1)[0];
        setActiveDeposits((prev) => [newDeposit, ...prev.slice(0, 9)]); // 최대 10개 유지
      }
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }, []);

  // 컨트랙트 주소 변경 감지 및 가격 피드 조회
  useEffect(() => {
    if (
      customERC20.contractAddress?.length === 42 &&
      customERC20.contractAddress.startsWith("0x")
    ) {
      checkPriceFeed(customERC20.contractAddress);
    } else {
      setPriceFeedStatus("idle");
      setShowPriceApiInput(false);
    }
  }, [customERC20.contractAddress]);

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
                        <img
                          src={asset.icon}
                          alt={asset.symbol}
                          className="w-10 h-10 rounded-full mr-3"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `data:image/svg+xml;base64,${btoa(`
                              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                                <circle cx="20" cy="20" r="20" fill="#f3f4f6"/>
                                <text x="20" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#6b7280">
                                  ${asset.symbol}
                                </text>
                              </svg>
                            `)}`;
                          }}
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
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">자산 추가</h3>
            <button
              onClick={() => setShowAddAsset(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

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
                {filteredAvailableAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    type="button"
                    onClick={() => {
                      setSelectedAsset(asset.symbol);
                      setShowCustomERC20(asset.symbol === "CUSTOM_ERC20");
                      if (asset.symbol !== "CUSTOM_ERC20") {
                        setCustomERC20({
                          symbol: "",
                          name: "",
                          contractAddress: "",
                          image: "",
                          priceApiUrl: "",
                        });
                        setImagePreview("");
                        // 가격 피드 상태 초기화
                        setPriceFeedStatus("idle");
                        setShowPriceApiInput(false);
                        setIsCheckingPriceFeed(false);
                      }
                    }}
                    className={`p-3 border-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                      selectedAsset === asset.symbol
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
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
                        <img
                          src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${asset.symbol.toLowerCase()}.png`}
                          alt={asset.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `data:image/svg+xml;base64,${btoa(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
                                  <circle cx="16" cy="16" r="16" fill="#f3f4f6"/>
                                  <text x="16" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#6b7280">
                                    ${asset.symbol}
                                  </text>
                                </svg>
                              `)}`;
                          }}
                        />
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
                    </div>
                  </button>
                ))}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    />
                    {/* 상태 아이콘 */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {isCheckingPriceFeed && (
                        <svg
                          className="animate-spin h-5 w-5 text-blue-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      )}
                      {priceFeedStatus === "found" && (
                        <svg
                          className="h-5 w-5 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                      {priceFeedStatus === "not_found" && (
                        <svg
                          className="h-5 w-5 text-orange-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* 가격 피드 조회 상태 표시 */}
                {priceFeedStatus === "checking" && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="text-sm text-blue-700">
                        가격 피드 정보를 확인하고 있습니다...
                      </span>
                    </div>
                  </div>
                )}

                {priceFeedStatus === "found" && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-blue-700">
                        가격 피드가 시스템에 등록되어 있습니다. 자동으로 실시간
                        가격이 연동됩니다.
                      </span>
                    </div>
                  </div>
                )}

                {priceFeedStatus === "not_found" && showPriceApiInput && (
                  <div className="space-y-3">
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800">
                        이 토큰의 가격 정보가 시스템에 없습니다. 실시간 가격
                        표시를 위해 공신력있는 API URL을 입력해주세요.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        가격 API URL *
                      </label>
                      <input
                        type="url"
                        value={customERC20.priceApiUrl}
                        onChange={(e) =>
                          setCustomERC20({
                            ...customERC20,
                            priceApiUrl: e.target.value,
                          })
                        }
                        placeholder="https://api.example.com/price/{symbol}"
                        className="w-full px-3 py-2 border border-orange-300 rounded-lg
                                   focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <p className="text-xs text-gray-600 mt-1">
                        JSON 형식으로 가격 데이터를 반환하는 REST API
                        엔드포인트를 입력하세요.
                        <br />
                        예: {`{ "price": 1.23, "currency": "USD" }`}
                      </p>
                    </div>
                  </div>
                )}

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
                        symbol: customERC20.symbol,
                        name: customERC20.name,
                        contractAddress: customERC20.contractAddress,
                        image: customERC20.image,
                        priceApiUrl: customERC20.priceApiUrl,
                        requestedBy: "현재사용자", // TODO: 실제 사용자 정보
                        requestedAt: new Date().toISOString(),
                        status: "pending",
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
                        priceApiUrl: "",
                      });
                      setImagePreview("");

                      // 성공 메시지 표시
                      alert(
                        `${customERC20.name} (${customERC20.symbol}) 추가 요청이 전송되었습니다.\n시스템 관리자의 승인 후 사용 가능합니다.`
                      );
                    }
                  } else if (selectedAsset) {
                    // 일반 자산 추가
                    const assetInfo = availableAssets.find(
                      (a) => a.symbol === selectedAsset
                    );
                    if (assetInfo) {
                      const newAsset: Asset = {
                        id: Date.now().toString(),
                        symbol: assetInfo.symbol,
                        name: assetInfo.name,
                        network: assetInfo.network,
                        icon: `https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/${assetInfo.symbol.toLowerCase()}.png`,
                        depositAddress: generateDepositAddress(
                          assetInfo.symbol
                        ),
                        qrCode: "",
                        isActive: true,
                      };
                      setAssets([...assets, newAsset]);
                      setShowAddAsset(false);
                      setSelectedAsset("");
                    }
                  }
                }}
                disabled={
                  selectedAsset === "CUSTOM_ERC20"
                    ? !customERC20.symbol ||
                      !customERC20.name ||
                      !customERC20.contractAddress ||
                      !customERC20.image ||
                      isCheckingPriceFeed ||
                      (priceFeedStatus === "not_found" &&
                        !customERC20.priceApiUrl)
                    : !selectedAsset
                }
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {selectedAsset === "CUSTOM_ERC20" ? "추가 요청" : "추가"}
              </button>
            </div>
          </div>
        </div>
      </Modal>

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
              <img
                src={selectedQR?.qrCode}
                alt="QR Code"
                className="w-48 h-48 border border-gray-200 rounded-lg"
              />
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
