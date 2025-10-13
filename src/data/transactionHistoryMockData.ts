export type TransactionType = "deposit" | "withdrawal" | "swap" | "staking";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  asset: string;
  amount: string;
  value: number;
  status: TransactionStatus;
  timestamp: string;
  txHash?: string;
  from?: string;
  to?: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "deposit",
    asset: "BTC",
    amount: "0.5",
    value: 25000000,
    status: "completed",
    timestamp: "2025-08-30T10:30:00Z",
    txHash: "0x1234...5678",
    from: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  },
  {
    id: "2",
    type: "withdrawal",
    asset: "ETH",
    amount: "2.5",
    value: 5000000,
    status: "pending",
    timestamp: "2025-08-29T09:15:00Z",
    to: "0x742d35...45454",
  },
  {
    id: "3",
    type: "swap",
    asset: "USDC → BTC",
    amount: "10000 → 0.09",
    value: 10000000,
    status: "completed",
    timestamp: "2025-08-28T16:45:00Z",
    txHash: "0xabcd5678...ef901234",
    from: "0x742d35cc6ad4cfc7cc5a0e0e68b4b55a2c7e9f3a",
    to: "0x8ba1f109551bd432803012645hac136c6ad4cfc7",
  },
  {
    id: "4",
    type: "staking",
    asset: "ETH",
    amount: "10",
    value: 20000000,
    status: "completed",
    timestamp: "2025-08-27T11:10:00Z",
    txHash: "0x9876fedc...ba098765",
    from: "0xabcdef1234567890abcdef1234567890abcdef12",
    to: "0x567890abcdef1234567890abcdef1234567890ab",
  },
];
