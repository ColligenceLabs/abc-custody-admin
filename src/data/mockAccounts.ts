export interface BankOption {
  code: string;
  name: string;
}

export interface ConnectedAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  accountType: string;
  status: 'connected' | 'pending' | 'expired' | 'error';
  connectedAt: string;
  lastUsed?: string;
  dailyLimit: number;
  monthlyLimit: number;
  isVerified: boolean;
  balance?: number;
}

export const BANK_OPTIONS: BankOption[] = [
  { code: "037", name: "전북은행" },
  { code: "004", name: "KB국민은행" },
  { code: "011", name: "NH농협은행" },
  { code: "020", name: "우리은행" },
  { code: "088", name: "신한은행" },
  { code: "081", name: "KEB하나은행" },
  { code: "002", name: "산업은행" },
  { code: "003", name: "기업은행" },
  { code: "007", name: "수협중앙회" },
  { code: "023", name: "SC제일은행" },
  { code: "027", name: "시티은행" },
  { code: "031", name: "대구은행" },
  { code: "032", name: "부산은행" },
  { code: "034", name: "광주은행" },
  { code: "035", name: "제주은행" },
  { code: "039", name: "경남은행" },
  { code: "045", name: "새마을금고" },
  { code: "048", name: "신협" },
  { code: "050", name: "저축은행" }
];

export const mockConnectedAccounts: ConnectedAccount[] = [
  {
    id: "0",
    bankName: "전북은행",
    bankCode: "037",
    accountNumber: "601-12-345678",
    accountHolder: "홍길동",
    accountType: "입출금통장",
    status: "connected",
    connectedAt: "2025-01-23T10:00:00Z",
    lastUsed: "2025-01-24T09:30:00Z",
    dailyLimit: 8000000,
    monthlyLimit: 80000000,
    isVerified: true,
    balance: 4500000
  },
  {
    id: "1",
    bankName: "신한은행",
    bankCode: "088",
    accountNumber: "110-123-456789",
    accountHolder: "홍길동",
    accountType: "입출금통장",
    status: "connected",
    connectedAt: "2025-01-15T09:00:00Z",
    lastUsed: "2025-01-20T14:30:00Z",
    dailyLimit: 10000000,
    monthlyLimit: 100000000,
    isVerified: true,
    balance: 5230000
  },
  {
    id: "2",
    bankName: "우리은행",
    bankCode: "020",
    accountNumber: "1002-123-567890",
    accountHolder: "홍길동",
    accountType: "입출금통장",
    status: "connected",
    connectedAt: "2025-01-10T11:20:00Z",
    dailyLimit: 5000000,
    monthlyLimit: 50000000,
    isVerified: true,
    balance: 2750000
  },
  {
    id: "3",
    bankName: "KB국민은행",
    bankCode: "004",
    accountNumber: "123456-78-901234",
    accountHolder: "홍길동",
    accountType: "입출금통장",
    status: "pending",
    connectedAt: "2025-01-22T15:45:00Z",
    dailyLimit: 3000000,
    monthlyLimit: 30000000,
    isVerified: false
  }
];