import { StakingAsset, StakingValidator, StakingCalculation } from "../types";

/**
 * 스테이킹 보상 계산
 */
export const calculateStakingRewards = (
  amount: number,
  asset: StakingAsset,
  validator: StakingValidator
): StakingCalculation => {
  // 검증인 수수료를 제외한 실효 APY 계산
  const effectiveApy = validator.apy * (1 - validator.commissionRate / 100);

  // 일일 보상 계산
  const dailyReward = (amount * effectiveApy) / 365 / 100;

  // 월간 보상 계산
  const monthlyReward = (amount * effectiveApy) / 12 / 100;

  // 연간 보상 계산
  const yearlyReward = (amount * effectiveApy) / 100;

  // KRW 환산
  const dailyRewardKrw = dailyReward * asset.currentPrice;
  const monthlyRewardKrw = monthlyReward * asset.currentPrice;
  const yearlyRewardKrw = yearlyReward * asset.currentPrice;

  // 검증인 수수료 계산
  const validatorFee = (yearlyReward * validator.commissionRate) / 100;

  // 순수익 계산 (네트워크 수수료 제외)
  const netReturn = yearlyReward - asset.networkFee;

  return {
    dailyReward,
    monthlyReward,
    yearlyReward,
    dailyRewardKrw,
    monthlyRewardKrw,
    yearlyRewardKrw,
    effectiveApy,
    networkFee: asset.networkFee,
    validatorFee,
    netReturn,
  };
};

/**
 * 숫자 포맷팅 (가상자산)
 */
export const formatCryptoAmount = (amount: number, decimals: number = 4): string => {
  return amount.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * 원화 포맷팅
 */
export const formatKRW = (amount: number): string => {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
};

/**
 * APY 포맷팅
 */
export const formatAPY = (apy: number): string => {
  return `${apy.toFixed(2)}%`;
};
