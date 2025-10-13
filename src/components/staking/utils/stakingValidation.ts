import { StakingAsset, StakingValidator } from "../types";

/**
 * 자산 선택 유효성 검증
 */
export const validateAssetSelection = (
  asset: StakingAsset | null
): string | null => {
  if (!asset) {
    return "스테이킹할 자산을 선택해주세요";
  }

  if (asset.balance < asset.minStakingAmount) {
    return `보유 수량이 최소 스테이킹 수량(${asset.minStakingAmount} ${asset.symbol})보다 적습니다`;
  }

  return null;
};

/**
 * 스테이킹 수량 유효성 검증
 */
export const validateAmount = (
  amount: number,
  asset: StakingAsset
): string | null => {
  if (!amount || amount <= 0) {
    return "스테이킹 수량을 입력해주세요";
  }

  if (amount < asset.minStakingAmount) {
    return `최소 스테이킹 수량은 ${asset.minStakingAmount} ${asset.symbol}입니다`;
  }

  if (amount > asset.availableBalance) {
    return `사용 가능한 수량(${asset.availableBalance} ${asset.symbol})을 초과했습니다`;
  }

  // 네트워크 수수료 고려
  const totalRequired = amount + asset.networkFee;
  if (totalRequired > asset.balance) {
    return `네트워크 수수료를 포함한 총 필요 수량이 보유 수량을 초과합니다`;
  }

  return null;
};

/**
 * 검증인 선택 유효성 검증
 */
export const validateValidator = (
  validator: StakingValidator | null
): string | null => {
  if (!validator) {
    return "검증인을 선택해주세요";
  }

  if (validator.status !== "active") {
    return "선택한 검증인이 현재 활성 상태가 아닙니다";
  }

  if (validator.uptime < 70) {
    return "선택한 검증인의 가동률이 낮습니다 (70% 미만). 다른 검증인을 선택하시는 것을 권장합니다";
  }

  return null;
};

/**
 * 약관 동의 유효성 검증
 */
export const validateTermsAgreement = (
  termsAgreed: boolean,
  riskAcknowledged: boolean
): { termsAgreed?: string; riskAcknowledged?: string } => {
  const errors: { termsAgreed?: string; riskAcknowledged?: string } = {};

  if (!termsAgreed) {
    errors.termsAgreed = "스테이킹 약관에 동의해주세요";
  }

  if (!riskAcknowledged) {
    errors.riskAcknowledged = "리스크를 확인하고 동의해주세요";
  }

  return errors;
};
