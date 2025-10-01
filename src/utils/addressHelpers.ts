import { WhitelistedAddress, DailyLimitStatus, TravelRuleInfo } from "@/types/address";

const PERSONAL_WALLET_DAILY_LIMIT = 1000000; // 100만원

export class AddressValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AddressValidationError";
  }
}

export const validateBlockchainAddress = (address: string, asset: string): boolean => {
  if (!address || !asset) return false;

  switch (asset.toUpperCase()) {
    case "BTC":
      return validateBitcoinAddress(address);
    case "ETH":
      return validateEthereumAddress(address);
    case "SOL":
      return validateSolanaAddress(address);
    case "USDC":
      return validateEthereumAddress(address);
    default:
      return false;
  }
};

const validateBitcoinAddress = (address: string): boolean => {
  const p2pkh = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const p2sh = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bech32 = /^bc1[02-9ac-hj-np-z]{7,87}$/;

  return p2pkh.test(address) || p2sh.test(address) || bech32.test(address);
};

const validateEthereumAddress = (address: string): boolean => {
  const ethPattern = /^0x[a-fA-F0-9]{40}$/;
  return ethPattern.test(address);
};

const validateSolanaAddress = (address: string): boolean => {
  const solPattern = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return solPattern.test(address);
};

export const checkDuplicateAddress = (
  address: string,
  existingAddresses: WhitelistedAddress[]
): boolean => {
  return existingAddresses.some(addr =>
    addr.address.toLowerCase() === address.toLowerCase()
  );
};

export interface VASPInfo {
  id: string;
  name: string;
  businessName: string;
  registrationNumber: string;
  countryCode: string;
  travelRuleConnected: boolean;
}

export const getKnownVASPs = (): VASPInfo[] => {
  return [
    {
      id: "upbit",
      name: "업비트",
      businessName: "두나무",
      registrationNumber: "220-88-59156",
      countryCode: "KR",
      travelRuleConnected: true
    },
    {
      id: "bithumb",
      name: "빗썸",
      businessName: "빗썸코리아",
      registrationNumber: "220-81-62517",
      countryCode: "KR",
      travelRuleConnected: true
    },
    {
      id: "coinone",
      name: "코인원",
      businessName: "코인원",
      registrationNumber: "229-81-00826",
      countryCode: "KR",
      travelRuleConnected: true
    },
    {
      id: "binance",
      name: "바이낸스",
      businessName: "Binance Holdings Limited",
      registrationNumber: "REG-202030",
      countryCode: "MT",
      travelRuleConnected: true
    },
    {
      id: "coinbase",
      name: "코인베이스",
      businessName: "Coinbase Global, Inc.",
      registrationNumber: "REG-COINBASE-US",
      countryCode: "US",
      travelRuleConnected: true
    }
  ];
};

export const checkVASPStatus = (vaspId: string): VASPInfo | null => {
  const knownVASPs = getKnownVASPs();
  return knownVASPs.find(vasp => vasp.id === vaspId) || null;
};

export const getVASPById = (vaspId: string): VASPInfo | null => {
  return checkVASPStatus(vaspId);
};

export const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const getDailyLimitStatus = (
  address: WhitelistedAddress
): DailyLimitStatus | null => {
  if (address.type !== "personal" || !address.dailyLimits) {
    return null;
  }

  const today = getTodayDateString();
  const currentUsage = address.dailyUsage;

  let depositUsed = 0;
  let withdrawalUsed = 0;

  if (currentUsage && currentUsage.date === today) {
    depositUsed = currentUsage.depositAmount;
    withdrawalUsed = currentUsage.withdrawalAmount;
  }

  const nextReset = new Date();
  nextReset.setDate(nextReset.getDate() + 1);
  nextReset.setHours(0, 0, 0, 0);

  return {
    address: address.address,
    coin: address.coin,
    depositUsed,
    depositLimit: address.dailyLimits.deposit,
    withdrawalUsed,
    withdrawalLimit: address.dailyLimits.withdrawal,
    lastResetAt: currentUsage?.lastResetAt || today,
    nextResetAt: nextReset.toISOString()
  };
};

export const checkDailyLimit = (
  address: WhitelistedAddress,
  amount: number,
  direction: "deposit" | "withdrawal"
): { allowed: boolean; remainingAmount: number; message?: string } => {
  if (address.type !== "personal") {
    return { allowed: true, remainingAmount: Infinity };
  }

  const limitStatus = getDailyLimitStatus(address);
  if (!limitStatus) {
    return { allowed: true, remainingAmount: Infinity };
  }

  const currentUsed = direction === "deposit" ? limitStatus.depositUsed : limitStatus.withdrawalUsed;
  const limit = direction === "deposit" ? limitStatus.depositLimit : limitStatus.withdrawalLimit;
  const remainingAmount = limit - currentUsed;

  if (currentUsed + amount >= limit) {
    return {
      allowed: false,
      remainingAmount,
      message: `개인 지갑은 일일 ${limit.toLocaleString()}원 미만만 ${direction === "deposit" ? "입금" : "출금"} 가능합니다. 오늘 ${direction === "deposit" ? "입금" : "출금"} 가능 금액: ${remainingAmount.toLocaleString()}원`
    };
  }

  return { allowed: true, remainingAmount };
};

export const updateDailyUsage = (
  address: WhitelistedAddress,
  amount: number,
  direction: "deposit" | "withdrawal"
): WhitelistedAddress => {
  if (address.type !== "personal") return address;

  const today = getTodayDateString();
  const currentUsage = address.dailyUsage;

  let depositAmount = 0;
  let withdrawalAmount = 0;

  if (currentUsage && currentUsage.date === today) {
    depositAmount = currentUsage.depositAmount;
    withdrawalAmount = currentUsage.withdrawalAmount;
  }

  if (direction === "deposit") {
    depositAmount += amount;
  } else {
    withdrawalAmount += amount;
  }

  return {
    ...address,
    dailyUsage: {
      date: today,
      depositAmount,
      withdrawalAmount,
      lastResetAt: new Date().toISOString()
    }
  };
};

export const resetDailyUsageIfNeeded = (
  address: WhitelistedAddress
): WhitelistedAddress => {
  if (!address.dailyUsage) return address;

  const today = getTodayDateString();
  if (address.dailyUsage.date !== today) {
    return {
      ...address,
      dailyUsage: {
        date: today,
        depositAmount: 0,
        withdrawalAmount: 0,
        lastResetAt: new Date().toISOString()
      }
    };
  }

  return address;
};

export const requiresTravelRule = (amount: number): boolean => {
  return amount >= 1000000; // 100만원 이상
};

export const validateTravelRuleInfo = (info: TravelRuleInfo): string[] => {
  const errors: string[] = [];

  if (!info.senderName.trim()) {
    errors.push("송신인 이름을 입력해주세요");
  }

  if (!info.senderAddress.trim()) {
    errors.push("송신인 주소를 입력해주세요");
  }

  if (!info.recipientName.trim()) {
    errors.push("수신인 이름을 입력해주세요");
  }

  if (!info.recipientVasp.trim()) {
    errors.push("수신인 VASP 정보를 입력해주세요");
  }

  if (!info.transactionPurpose.trim()) {
    errors.push("거래 목적을 입력해주세요");
  }

  if (!info.fundSource.trim()) {
    errors.push("자금 출처를 입력해주세요");
  }

  if (info.amount <= 0) {
    errors.push("올바른 거래 금액을 입력해주세요");
  }

  return errors;
};

export const createPersonalWalletDefaults = (): {
  dailyLimits: { deposit: number; withdrawal: number }
} => {
  return {
    dailyLimits: {
      deposit: PERSONAL_WALLET_DAILY_LIMIT,
      withdrawal: PERSONAL_WALLET_DAILY_LIMIT
    }
  };
};

export const formatKRW = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const getProgressPercentage = (used: number, limit: number): number => {
  if (limit === 0) return 0;
  return Math.min((used / limit) * 100, 100);
};

export const getRemainingTime = (nextResetAt: string): string => {
  const now = new Date();
  const resetTime = new Date(nextResetAt);
  const diff = resetTime.getTime() - now.getTime();

  if (diff <= 0) return "곧 리셋됩니다";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}시간 ${minutes}분 후 리셋`;
  } else {
    return `${minutes}분 후 리셋`;
  }
};