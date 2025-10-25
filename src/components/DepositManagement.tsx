"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { useDepositSocket } from "@/hooks/useDepositSocket";
import { useVaultTransferSocket } from "@/hooks/useVaultTransferSocket";
import NetworkAddressTable from "@/components/deposit/NetworkAddressTable";
import AssetManagementModal from "@/components/deposit/AssetManagementModal";
import AddAssetWizard from "@/components/deposit/AddAssetWizard";
import { NetworkGroup } from "@/types/networkGroup";
import { getDepositAddressesByNetwork, createDepositAddress, deleteDepositAddress } from "@/utils/depositAddressApi";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  // 진행 중인 입금 상태
  const [activeDeposits, setActiveDeposits] = useState<DepositTransaction[]>(
    []
  );
  // 입금 히스토리 상태
  const [depositHistory, setDepositHistory] = useState<DepositHistory[]>([]);
  // 입금 히스토리 페이징 상태
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLimit] = useState(10);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);

  const [assets, setAssets] = useState<Asset[]>([]);
  // 네트워크 그룹 상태 추가
  const [networkGroups, setNetworkGroups] = useState<NetworkGroup[]>([]);
  const [selectedNetworkForManagement, setSelectedNetworkForManagement] = useState<NetworkGroup | null>(null);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showRequestHistory, setShowRequestHistory] = useState(false);
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

  // 자산 추가 요청 관리
  // 상세 모달 및 탭 제어
  const [selectedRequestDetail, setSelectedRequestDetail] = useState<AssetAddRequest | null>(null)
  const [activeAssetTab, setActiveAssetTab] = useState<string>('new-request')
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

  // 새로운 자산 추가 핸들러 (여러 자산 동시 추가)
  const handleAddAssets = async (
    networkGroup: string,
    assets: string[],
    customToken?: { symbol: string; name: string; contractAddress: string; logoUrl?: string }
  ) => {
    console.log('[handleAddAssets] 호출됨:', { networkGroup, assets, customToken, userId: user?.id });
    if (!user) {
      console.log('[handleAddAssets] user 없음, 종료');
      return;
    }

    try {
      // 가격 정보 가져오기
      console.log('[handleAddAssets] 가격 정보 요청 시작:', `${API_BASE_URL}/api/crypto/prices`);
      const prices = await fetch(`${API_BASE_URL}/api/crypto/prices`)
        .then((res) => res.json())
        .catch((err) => {
          console.error('[handleAddAssets] 가격 정보 요청 실패:', err);
          return {};
        });
      console.log('[handleAddAssets] 가격 정보 응답:', prices);

      // 각 자산에 대해 입금 주소 생성
      console.log('[handleAddAssets] for 루프 시작, assets:', assets);
      for (const coin of assets) {
        const assetPrices = prices[coin] || {};
        console.log(`[handleAddAssets] ${coin} 처리 중, prices:`, assetPrices);

        const requestBody = {
          userId: user.id,
          coin,
          network: networkGroup,
          priceKRW: assetPrices.krw,
          priceUSD: assetPrices.usd,
        };
        console.log(`[handleAddAssets] ${coin} POST 요청:`, requestBody);

        const response = await fetch(`${API_BASE_URL}/api/depositAddresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        const responseData = await response.json();
        console.log(`[handleAddAssets] ${coin} 응답:`, { status: response.status, data: responseData });
      }
      console.log('[handleAddAssets] for 루프 완료');

      // Custom ERC-20 토큰 요청 생성 (관리자 승인 대기)
      if (customToken && customToken.symbol && customToken.contractAddress) {
        await fetch(`${API_BASE_URL}/api/customTokenRequests`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            symbol: customToken.symbol,
            name: customToken.name,
            contractAddress: customToken.contractAddress,
            network: networkGroup,
            logoUrl: customToken.logoUrl || undefined,
          }),
        });

        toast({
          title: "요청 제출 완료",
          description: "Custom ERC-20 토큰 요청이 제출되었습니다. 관리자 승인 후 사용 가능합니다.",
        });
      }

      // 성공 후 데이터 새로고침
      console.log('[handleAddAssets] 데이터 새로고침 시작');
      await loadNetworkGroups();
      await loadCustomTokenRequests();
      console.log('[handleAddAssets] 데이터 새로고침 완료, 모달 닫기');
      setShowAddAsset(false);
    } catch (error) {
      console.error("[handleAddAssets] 전체 에러:", error);
      console.error("[handleAddAssets] 에러 상세:", {
        message: error instanceof Error ? error.message : '알 수 없는 에러',
        stack: error instanceof Error ? error.stack : undefined,
      });
      toast({
        variant: "destructive",
        title: "자산 추가 실패",
        description: "자산 추가 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
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

  // depositAddresses 테이블에서 네트워크 그룹 로드
  const loadNetworkGroups = useCallback(async () => {
    console.log('[DepositManagement] loadNetworkGroups 호출', {
      isAuthenticated,
      userId: user?.id,
    });

    if (!isAuthenticated || !user) {
      console.log('[DepositManagement] 인증되지 않았거나 사용자 없음');
      setNetworkGroups([]);
      setAssets([]);
      return;
    }

    try {
      console.log('[DepositManagement] API 호출 시작:', user.id);
      // 네트워크별 그룹화 API 호출
      const networks = await getDepositAddressesByNetwork(user.id);
      console.log('[DepositManagement] API 응답:', networks);
      setNetworkGroups(networks);

      // 기존 Asset 형태로도 변환 (호환성 유지)
      const depositAssets: Asset[] = [];
      networks.forEach((network) => {
        network.assets.forEach((asset) => {
          depositAssets.push({
            id: asset.id,
            symbol: asset.coin,
            name: getAssetName(asset.coin),
            network: network.networkName,
            depositAddress: network.address,
            isActive: true,
            contractAddress: asset.contractAddress,
            priceKRW: asset.priceKRW,
            priceUSD: asset.priceUSD,
          });
        });
      });
      console.log('[DepositManagement] 변환된 assets:', depositAssets);
      setAssets(depositAssets);
    } catch (error) {
      console.error("네트워크 그룹 로드 실패:", error);
      setNetworkGroups([]);
      setAssets([]);
    }
  }, [user, isAuthenticated]);

  // Custom Token Request 로드
  const loadCustomTokenRequests = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setAssetAddRequests([]);
      return;
    }

    try {
      // userId 필터 제거 - 시스템 전체의 요청 목록 조회
      const response = await fetch(
        `${API_BASE_URL}/api/customTokenRequests?_sort=createdAt&_order=desc`
      );
      const data = await response.json();

      // API 응답을 AssetAddRequest 형태로 변환
      const requests: AssetAddRequest[] = data.data.map((req: any) => ({
        id: req.id,
        userId: req.userId,
        symbol: req.symbol,
        name: req.name,
        contractAddress: req.contractAddress,
        network: req.network,
        requestedBy: user.name || user.email || '사용자',
        requestedAt: req.createdAt,
        status: req.status === 'pending' ? 'pending' :
                req.status === 'approved' ? 'approved' :
                req.status === 'rejected' ? 'rejected' : 'pending',
        feedback: req.adminComment ? {
          message: req.adminComment,
          type: req.status === 'approved' ? 'success' : 'warning',
          reviewedBy: req.reviewedBy || '관리자',
          reviewedAt: req.reviewedAt,
        } : undefined,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      }));

      setAssetAddRequests(requests);
    } catch (error) {
      console.error('Custom token requests 로드 실패:', error);
      setAssetAddRequests([]);
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    loadNetworkGroups();
    loadCustomTokenRequests();
  }, [loadNetworkGroups, loadCustomTokenRequests]);

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

  // 초기 데이터 로드 (polling 제거)
  useEffect(() => {
    const fetchInitialDeposits = async () => {
      if (!isAuthenticated || !user) {
        return;
      }

      try {
        // 1. 진행 중인 입금 조회
        const activeRes = await fetch(`${API_BASE_URL}/api/deposits/active?userId=${user.id}`);
        if (activeRes.ok) {
          const activeData = await activeRes.json();
          setActiveDeposits(activeData);
        }

        // 2. 입금 히스토리 조회 (서버 사이드 페이징)
        const historyRes = await fetch(
          `${API_BASE_URL}/api/deposits/history?userId=${user.id}&page=${historyPage}&limit=${historyLimit}`
        );
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setDepositHistory(historyData.deposits || []);
          setHistoryTotal(historyData.total || 0);
          setHistoryTotalPages(historyData.totalPages || 0);
        }
      } catch (error) {
        console.error('입금 데이터 조회 실패:', error);
      }
    };

    fetchInitialDeposits();
  }, [user, isAuthenticated, historyPage, historyLimit]);

  // WebSocket 실시간 업데이트 핸들러
  const handleDepositDetected = useCallback((newDeposit: any) => {
    console.log('신규 입금 감지:', newDeposit);
    setActiveDeposits((prev) => [newDeposit, ...prev]);
  }, []);

  const handleDepositUpdate = useCallback((updatedDeposit: any) => {
    console.log('입금 업데이트:', updatedDeposit);

    setActiveDeposits((prev) => {
      const index = prev.findIndex((d) => d.id === updatedDeposit.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = updatedDeposit;
        return updated;
      }
      return prev;
    });
  }, []);

  const handleDepositCredited = useCallback((creditedDeposit: any) => {
    console.log('입금 완료:', creditedDeposit);

    // 진행 중 목록에서 제거
    setActiveDeposits((prev) => prev.filter((d) => d.id !== creditedDeposit.id));

    // 히스토리에 즉시 추가 (실시간 반영)
    setDepositHistory((prev) => {
      // 중복 체크
      const exists = prev.some((d) => d.id === creditedDeposit.id);
      if (exists) {
        // 이미 있으면 업데이트만
        return prev.map((d) =>
          d.id === creditedDeposit.id ? creditedDeposit : d
        );
      }

      // 1페이지인 경우에만 새 항목을 맨 앞에 추가
      if (historyPage === 1) {
        return [creditedDeposit, ...prev].slice(0, historyLimit);
      }

      // 다른 페이지에 있으면 추가하지 않음 (새로고침 필요)
      return prev;
    });

    // Total count 증가
    setHistoryTotal((prev) => prev + 1);
  }, [historyPage, historyLimit]);

  // WebSocket 연결
  useDepositSocket({
    userId: user?.id || null,
    onDepositDetected: handleDepositDetected,
    onDepositUpdate: handleDepositUpdate,
    onDepositCredited: handleDepositCredited,
  });

  // VaultTransfer 상태 관리 (depositId를 키로 사용)
  const [vaultTransfers, setVaultTransfers] = useState<Map<string, any>>(new Map());

  // VaultTransfer 시작 핸들러
  const handleVaultTransferInitiated = useCallback((data: any) => {
    console.log('Vault 전송 시작:', data);

    const { vaultTransfer, deposit } = data;

    // VaultTransfer 상태 저장
    setVaultTransfers((prev) => {
      const updated = new Map(prev);
      updated.set(deposit.id, vaultTransfer);
      return updated;
    });

    // Deposit 상태 업데이트 (confirmed → credited로 변경될 예정)
    setActiveDeposits((prev) => {
      const index = prev.findIndex((d) => d.id === deposit.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = { ...deposit, vaultTransferStatus: 'pending' };
        return updated;
      }
      return prev;
    });
  }, []);

  // VaultTransfer 업데이트 핸들러
  const handleVaultTransferUpdate = useCallback((data: any) => {
    console.log('Vault 전송 업데이트:', data);

    const { vaultTransfer, deposit } = data;

    // VaultTransfer 상태 업데이트
    setVaultTransfers((prev) => {
      const updated = new Map(prev);
      updated.set(deposit.id, vaultTransfer);
      return updated;
    });

    // Deposit 상태 업데이트
    if (deposit) {
      setActiveDeposits((prev) => {
        const index = prev.findIndex((d) => d.id === deposit.id);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...deposit, vaultTransferStatus: vaultTransfer.status };
          return updated;
        }
        return prev;
      });
    }
  }, []);

  // VaultTransfer 완료 핸들러
  const handleVaultTransferCompleted = useCallback((data: any) => {
    console.log('Vault 전송 완료:', data);

    const { vaultTransfer, deposit } = data;

    // VaultTransfer 상태 제거 (완료됨)
    setVaultTransfers((prev) => {
      const updated = new Map(prev);
      updated.delete(deposit.id);
      return updated;
    });

    // Deposit가 credited 상태이므로 진행 중 목록에서 제거
    setActiveDeposits((prev) => prev.filter((d) => d.id !== deposit.id));

    // 히스토리에 즉시 추가 (실시간 반영)
    setDepositHistory((prev) => {
      // 중복 체크
      const exists = prev.some((d) => d.id === deposit.id);
      if (exists) {
        // 이미 있으면 업데이트만
        return prev.map((d) =>
          d.id === deposit.id ? deposit : d
        );
      }

      // 1페이지인 경우에만 새 항목을 맨 앞에 추가
      if (historyPage === 1) {
        return [deposit, ...prev].slice(0, historyLimit);
      }

      // 다른 페이지에 있으면 추가하지 않음 (새로고침 필요)
      return prev;
    });

    // Total count 증가
    setHistoryTotal((prev) => prev + 1);
  }, [historyPage, historyLimit]);

  // VaultTransfer WebSocket 연결
  useVaultTransferSocket({
    userId: user?.id || null,
    onVaultTransferInitiated: handleVaultTransferInitiated,
    onVaultTransferUpdate: handleVaultTransferUpdate,
    onVaultTransferCompleted: handleVaultTransferCompleted,
  });

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
                  vaultTransfer={vaultTransfers.get(deposit.id)}
                  onViewDetails={(depositId) => {
                    // 상세 정보 모달 열기 로직
                    console.log("View details for:", depositId);
                  }}
                />
              ))}
          </div>
        </div>
      )}

      {/* 입금 주소 관리 섹션 - 네트워크 그룹화 뷰 */}
      <NetworkAddressTable
        networks={networkGroups}
        onManageAssets={(network) => setSelectedNetworkForManagement(network)}
        onRemoveAsset={async (networkGroup, assetId) => {
          try {
            await deleteDepositAddress(assetId);
            await loadNetworkGroups();
          } catch (error) {
            console.error("자산 제거 실패:", error);
            toast({
              variant: "destructive",
              description: "자산 제거에 실패했습니다.",
            });
          }
        }}
        onAddAsset={() => setShowAddAsset(true)}
      />

      {/* 자산 관리 모달 */}
      {selectedNetworkForManagement && (
        <AssetManagementModal
          isOpen={true}
          onClose={() => setSelectedNetworkForManagement(null)}
          network={selectedNetworkForManagement}
          onAddAsset={async (coin, contractAddress) => {
            if (!user) return;

            try {
              const prices = generateMockPrice(coin);
              await createDepositAddress({
                userId: user.id,
                coin,
                network: selectedNetworkForManagement.network,
                contractAddress,
                priceKRW: prices.krw,
                priceUSD: prices.usd,
              });

              await loadNetworkGroups();
              setSelectedNetworkForManagement(null);
            } catch (error: any) {
              console.error("자산 추가 실패:", error);
              toast({
                variant: "destructive",
                description: error.message || "자산 추가에 실패했습니다.",
              });
            }
          }}
        />
      )}

      {/* 입금 히스토리 섹션 */}
      <div>
        <DepositHistoryTable
          deposits={depositHistory}
          currentPage={historyPage}
          itemsPerPage={historyLimit}
          totalItems={historyTotal}
          onPageChange={setHistoryPage}
        />
      </div>

      {/* Add Asset Modal with Tabs */}
      <Modal isOpen={showAddAsset}>
        <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">자산 추가</h3>
            <button
              onClick={() => {
                setShowAddAsset(false);
                setActiveAssetTab('new-request');
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
                  <AddAssetWizard
                    isOpen={true}
                    onClose={() => {
                      setShowAddAsset(false);
                      setActiveAssetTab('new-request');
                    }}
                    existingNetworks={networkGroups}
                    onAddAssets={handleAddAssets}
                  />
                ),
              },
              {
                id: 'history',
                label: '요청 내역',
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
