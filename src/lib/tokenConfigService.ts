interface SupportedToken {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  logoUrl?: string;
  isDefault: boolean;
  isActive: boolean;
  minWithdrawalAmount: string;
  withdrawalFee: string;
  withdrawalFeeType: 'fixed' | 'percentage';
  requiredConfirmations: number | null;
  customTokenRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

// 토큰 설정 캐시
let tokenConfigCache: Record<string, SupportedToken> = {};
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분

// 지원 토큰 목록 조회
export async function getSupportedTokens(): Promise<SupportedToken[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  try {
    // 모든 토큰 조회 (비활성화된 토큰도 포함하여 UI에서 출금 중단 안내)
    const response = await fetch(`${API_BASE_URL}/api/supportedTokens`);

    if (!response.ok) {
      throw new Error('Failed to fetch supported tokens');
    }

    const tokens: SupportedToken[] = await response.json();

    // 캐시 업데이트
    tokenConfigCache = tokens.reduce((acc, token) => {
      acc[token.symbol] = token;
      return acc;
    }, {} as Record<string, SupportedToken>);
    cacheTimestamp = Date.now();

    return tokens;
  } catch (error) {
    console.error('Error fetching supported tokens:', error);
    throw error;
  }
}

// 특정 토큰 설정 조회
export async function getTokenConfig(symbol: string): Promise<SupportedToken | null> {
  // 캐시가 유효한 경우 캐시에서 반환
  if (cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return tokenConfigCache[symbol] || null;
  }

  // 캐시가 없거나 만료된 경우 새로 조회
  try {
    await getSupportedTokens();
    return tokenConfigCache[symbol] || null;
  } catch (error) {
    console.error(`Error fetching config for token ${symbol}:`, error);
    return null;
  }
}

// 출금 금액 검증
export async function validateWithdrawalAmount(
  symbol: string,
  amount: number
): Promise<{ valid: boolean; error?: string; minAmount?: number; fee?: number; feeType?: string }> {
  const config = await getTokenConfig(symbol);

  if (!config) {
    return {
      valid: false,
      error: '지원하지 않는 토큰입니다.',
    };
  }

  if (!config.isActive) {
    return {
      valid: false,
      error: '현재 이 토큰은 출금이 중단되었습니다. 자세한 사항은 고객센터에 문의해주세요.',
    };
  }

  const minAmount = parseFloat(config.minWithdrawalAmount);

  if (amount < minAmount) {
    return {
      valid: false,
      error: `최소 출금 수량은 ${minAmount} ${symbol} 입니다.`,
      minAmount,
    };
  }

  const fee = parseFloat(config.withdrawalFee);

  return {
    valid: true,
    minAmount,
    fee,
    feeType: config.withdrawalFeeType,
  };
}

// 출금 수수료 계산
export function calculateWithdrawalFee(
  amount: number,
  fee: number,
  feeType: 'fixed' | 'percentage'
): number {
  if (feeType === 'fixed') {
    return fee;
  } else {
    // percentage
    return (amount * fee) / 100;
  }
}

// 실제 수령 금액 계산
export function calculateNetAmount(
  amount: number,
  fee: number,
  feeType: 'fixed' | 'percentage'
): number {
  const feeAmount = calculateWithdrawalFee(amount, fee, feeType);
  return amount - feeAmount;
}
