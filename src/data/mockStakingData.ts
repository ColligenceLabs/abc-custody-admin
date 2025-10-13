import { StakingAsset } from "@/components/staking/types";

/**
 * Mock 스테이킹 가능 자산 데이터
 */
export const MOCK_STAKING_ASSETS: StakingAsset[] = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 5.5,
    availableBalance: 5.499,
    minStakingAmount: 0.1,
    maxStakingAmount: 5.499,
    currentPrice: 4000000,
    avgApy: 4.2,
    unstakingPeriod: {
      min: 2,
      max: 7,
    },
    networkFee: 0.001,
    slashingRisk: "low",
  },
  {
    symbol: "SOL",
    name: "Solana",
    balance: 100,
    availableBalance: 99.5,
    minStakingAmount: 1,
    maxStakingAmount: 99.5,
    currentPrice: 150000,
    avgApy: 6.8,
    unstakingPeriod: {
      min: 2,
      max: 3,
    },
    networkFee: 0.5,
    slashingRisk: "medium",
  },
];
