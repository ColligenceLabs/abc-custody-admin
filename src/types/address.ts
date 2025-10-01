export interface WhitelistedAddress {
  id: string;
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp";
  permissions: {
    canDeposit: boolean;
    canWithdraw: boolean;
  };
  addedAt: string;
  lastUsed?: string;
  txCount: number;

  // 입금 주소 전용 필드
  depositSettings?: {
    autoProcess: boolean;
    minAmount?: number;
    notificationEnabled: boolean;
    trusted: boolean;
  };

  // 출금 주소 전용 필드
  withdrawalSettings?: {
    dailyLimit?: number;
    requiresApproval: boolean;
    travelRuleCompliant: boolean;
  };

  // 일일 한도 설정 (개인 지갑용)
  dailyLimits?: {
    deposit: number; // 일일 입금 한도 (개인지갑: 1,000,000원)
    withdrawal: number; // 일일 출금 한도 (개인지갑: 1,000,000원)
  };

  // VASP 정보 (거래소/VASP 지갑용)
  vaspInfo?: {
    businessName: string; // VASP 사업자명
    travelRuleConnected: boolean; // 트래블룰 연동 상태
    registrationNumber?: string; // 사업자 등록번호
    countryCode?: string; // 국가 코드
    complianceScore?: number; // 컴플라이언스 점수 (1-5)
  };

  // 일일 사용량 추적
  dailyUsage?: {
    date: string; // 날짜 (YYYY-MM-DD)
    depositAmount: number; // 당일 입금액 (KRW)
    withdrawalAmount: number; // 당일 출금액 (KRW)
    lastResetAt: string; // 마지막 리셋 시간
  };
}

export interface AddressFormData {
  label: string;
  address: string;
  coin: string;
  type: "personal" | "vasp" | "";
  permissions: {
    canDeposit: boolean;
    canWithdraw: boolean;
  };

  // VASP 정보 (type이 "vasp"일 때 필요)
  selectedVaspId?: string;
}

// 트래블룰 정보 수집용 인터페이스
export interface TravelRuleInfo {
  senderName: string; // 송신인 이름
  senderAddress: string; // 송신인 주소
  senderAccountInfo: string; // 송신인 계좌 정보
  recipientName: string; // 수신인 이름
  recipientVasp: string; // 수신인 VASP 정보
  recipientAccountInfo: string; // 수신인 계좌 정보
  transactionPurpose: string; // 거래 목적
  fundSource: string; // 자금 출처
  amount: number; // 거래 금액 (KRW)
  assetType: string; // 자산 종류
}

// 일일 한도 상태 인터페이스
export interface DailyLimitStatus {
  address: string;
  coin: string;
  depositUsed: number; // 오늘 사용한 입금액
  depositLimit: number; // 일일 입금 한도
  withdrawalUsed: number; // 오늘 사용한 출금액
  withdrawalLimit: number; // 일일 출금 한도
  lastResetAt: string; // 마지막 리셋 시간
  nextResetAt: string; // 다음 리셋 시간
}

export type AddressPermission = "deposit" | "withdrawal" | "both";