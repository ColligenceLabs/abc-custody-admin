import { WhitelistedAddress } from "@/types/address";

export const mockAddresses: WhitelistedAddress[] = [
  // 개인 지갑들
  {
    id: "addr_personal_1",
    label: "메인 비트코인 지갑",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0eshre9jqsh4k5drjqqq4u8x",
    coin: "BTC",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-15T09:30:00Z",
    lastUsed: "2024-01-20T14:22:00Z",
    txCount: 12,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 350000,
      withdrawalAmount: 250000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_2",
    label: "이더리움 DeFi 지갑",
    address: "0x742d35Cc6634C0532925a3b844Bc454Bb54dEF0bEb0",
    coin: "ETH",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: false
    },
    addedAt: "2024-01-10T11:45:00Z",
    lastUsed: "2024-01-19T16:30:00Z",
    txCount: 8,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 750000,
      withdrawalAmount: 0,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_3",
    label: "USDT 스테이블코인 지갑",
    address: "0xa1b2c3d4e5f6789012345678901234567890abcd",
    coin: "USDT",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-12T13:20:00Z",
    lastUsed: "2024-01-18T09:15:00Z",
    txCount: 15,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 920000,
      withdrawalAmount: 650000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_4",
    label: "하드웨어 월렛 (Ledger)",
    address: "bc1q9x8y7z6w5v4u3t2s1r0p9o8n7m6l5k4j3h2g1f0",
    coin: "BTC",
    type: "personal",
    permissions: {
      canDeposit: false,
      canWithdraw: true
    },
    addedAt: "2024-01-08T10:30:00Z",
    lastUsed: "2024-01-20T15:45:00Z",
    txCount: 6,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 250000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_5",
    label: "메타마스크 지갑",
    address: "0x9876543210fedcba0987654321fedcba09876543",
    coin: "ETH",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-14T16:45:00Z",
    lastUsed: "2025-09-18T08:20:00Z",
    txCount: 9,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 450000,
      withdrawalAmount: 780000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_6",
    label: "솔라나 팬텀 지갑",
    address: "DGh7fJ9kLmN4pQrStUvWxYz3AbCdEfGhIjKlMnOpQrSt",
    coin: "SOL",
    type: "personal",
    permissions: {
      canDeposit: false,
      canWithdraw: true
    },
    addedAt: "2024-01-11T09:40:00Z",
    lastUsed: "2024-01-16T13:25:00Z",
    txCount: 4,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 120000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_7",
    label: "트레저 하드웨어 월렛",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    coin: "ETH",
    type: "personal",
    permissions: {
      canDeposit: false,
      canWithdraw: true
    },
    addedAt: "2024-01-09T15:30:00Z",
    lastUsed: "2024-01-20T12:45:00Z",
    txCount: 7,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 950000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_8",
    label: "개인 냉동 지갑",
    address: "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy",
    coin: "BTC",
    type: "personal",
    permissions: {
      canDeposit: false,
      canWithdraw: true
    },
    addedAt: "2024-01-13T07:15:00Z",
    lastUsed: "2024-01-15T19:30:00Z",
    txCount: 2,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 0,
      withdrawalAmount: 0,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_9",
    label: "DeFi 유동성 풀",
    address: "0xdef1c0de5555555666666777777888888999999a",
    coin: "ETH",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-16T14:25:00Z",
    lastUsed: "2024-01-19T10:15:00Z",
    txCount: 11,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 300000,
      withdrawalAmount: 650000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_10",
    label: "모바일 지갑 (Trust Wallet)",
    address: "0xabcdef0123456789abcdef0123456789abcdef01",
    coin: "ETH",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-04T18:50:00Z",
    lastUsed: "2024-01-17T15:40:00Z",
    txCount: 19,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 200000,
      withdrawalAmount: 980000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },
  {
    id: "addr_personal_11",
    label: "솔라나 스테이킹 지갑",
    address: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
    coin: "SOL",
    type: "personal",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-17T20:10:00Z",
    lastUsed: "2024-01-20T09:35:00Z",
    txCount: 5,
    dailyLimits: {
      deposit: 1000000,
      withdrawal: 1000000
    },
    dailyUsage: {
      date: "2025-09-18",
      depositAmount: 150000,
      withdrawalAmount: 720000,
      lastResetAt: "2025-09-18T00:00:00Z"
    }
  },

  // VASP 지갑들 (거래소/기관)
  {
    id: "addr_vasp_1",
    label: "업비트",
    address: "3FKjZPmL8Jk9QqW8eRtYu7Vn2Xs4Hm1cBp6Nd5Av9r",
    coin: "BTC",
    type: "vasp",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-05T08:15:00Z",
    lastUsed: "2025-09-18T10:45:00Z",
    txCount: 25,
    vaspInfo: {
      businessName: "두나무",
      travelRuleConnected: true,
      registrationNumber: "220-88-59156",
      countryCode: "KR",
      complianceScore: 5
    }
  },
  {
    id: "addr_vasp_2",
    label: "바이낸스",
    address: "1A9B8C7D6E5F4G3H2I1J0K9L8M7N6O5P4Q3R2S1T",
    coin: "BTC",
    type: "vasp",
    permissions: {
      canDeposit: false,
      canWithdraw: true
    },
    addedAt: "2024-01-03T14:00:00Z",
    lastUsed: "2024-01-19T11:30:00Z",
    txCount: 18,
    vaspInfo: {
      businessName: "Binance Holdings Limited",
      travelRuleConnected: true,
      registrationNumber: "REG-202030",
      countryCode: "MT",
      complianceScore: 5
    }
  },
  {
    id: "addr_vasp_3",
    label: "코인베이스 Pro",
    address: "0xabcdef1234567890abcdef1234567890abcdef12",
    coin: "ETH",
    type: "vasp",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-07T12:15:00Z",
    lastUsed: "2024-01-17T14:50:00Z",
    txCount: 22,
    vaspInfo: {
      businessName: "Coinbase Global, Inc.",
      travelRuleConnected: true,
      registrationNumber: "REG-COINBASE-US",
      countryCode: "US",
      complianceScore: 5
    }
  },
  {
    id: "addr_vasp_4",
    label: "빗썸",
    address: "bc1qabcdef1234567890abcdef1234567890abcdef",
    coin: "BTC",
    type: "vasp",
    permissions: {
      canDeposit: true,
      canWithdraw: true
    },
    addedAt: "2024-01-02T11:20:00Z",
    lastUsed: "2024-01-18T17:10:00Z",
    txCount: 31,
    vaspInfo: {
      businessName: "빗썸코리아",
      travelRuleConnected: true,
      registrationNumber: "220-81-62517",
      countryCode: "KR",
      complianceScore: 5
    }
  },
  {
    id: "addr_vasp_5",
    label: "코인원",
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    coin: "BTC",
    type: "vasp",
    permissions: {
      canDeposit: false,
      canWithdraw: true
    },
    addedAt: "2024-01-06T09:45:00Z",
    lastUsed: "2025-09-18T16:20:00Z",
    txCount: 14,
    vaspInfo: {
      businessName: "코인원",
      travelRuleConnected: true,
      registrationNumber: "229-81-00826",
      countryCode: "KR",
      complianceScore: 5
    }
  },
  {
    id: "addr_vasp_6",
    label: "크라켄",
    address: "0x1a2b3c4d5e6f789012345678901234567890abcd",
    coin: "ETH",
    type: "vasp",
    permissions: {
      canDeposit: true,
      canWithdraw: false
    },
    addedAt: "2024-01-08T16:30:00Z",
    lastUsed: "2024-01-20T11:15:00Z",
    txCount: 12,
    vaspInfo: {
      businessName: "Payward, Inc.",
      travelRuleConnected: true,
      registrationNumber: "REG-KRAKEN-US",
      countryCode: "US",
      complianceScore: 5
    }
  }
];

// 필터링을 위한 헬퍼 함수들
export const getPersonalAddresses = (): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.type === "personal");
};

export const getVASPAddresses = (): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.type === "vasp");
};

export const getAddressesByPermission = (permission: "deposit" | "withdrawal" | "both"): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => {
    switch (permission) {
      case "deposit":
        return addr.permissions.canDeposit;
      case "withdrawal":
        return addr.permissions.canWithdraw;
      case "both":
        return addr.permissions.canDeposit && addr.permissions.canWithdraw;
      default:
        return false;
    }
  });
};

export const getAddressesByAsset = (asset: string): WhitelistedAddress[] => {
  return mockAddresses.filter(addr => addr.coin === asset);
};