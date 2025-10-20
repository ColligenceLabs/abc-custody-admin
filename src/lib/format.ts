/**
 * 숫자 및 가상자산 포맷팅 유틸리티
 */

/**
 * 가상자산별 기본 소수점 자릿수
 */
const CRYPTO_DECIMALS: Record<string, number> = {
  BTC: 8,
  ETH: 8,
  USDT: 6,
  USDC: 6,
  SOL: 8,
  KRW: 0,
  KRD: 0,
  WON: 0,
};

/**
 * 소수점 이하 trailing zeros 제거
 * @param amount - 숫자 또는 문자열 형태의 금액
 * @returns trailing zeros가 제거된 문자열
 *
 * @example
 * formatAmount(1.00000000) // "1"
 * formatAmount("0.50000000") // "0.5"
 * formatAmount(0.00123000) // "0.00123"
 */
export function formatAmount(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  // trailing zeros 제거: parseFloat로 변환 후 문자열로
  return parseFloat(numAmount.toString()).toString();
}

/**
 * 숫자를 천 단위 콤마로 포맷팅 (소수점 유지)
 * @param num - 포맷팅할 숫자
 * @param maxDecimals - 최대 소수점 자릿수 (기본값: 8)
 * @returns 천 단위 콤마가 추가된 문자열
 *
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567.00) // "1,234,567"
 * formatNumber(0.00123456789, 8) // "0.00123457"
 */
export function formatNumber(num: number | string, maxDecimals: number = 8): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;

  if (isNaN(numValue)) return '0';

  // toLocaleString에 maximumFractionDigits 옵션 사용
  return numValue.toLocaleString('ko-KR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

/**
 * 가상자산 금액을 포맷팅 (콤마 + trailing zeros 제거)
 * @param amount - 금액
 * @param currency - 가상자산 심볼 (선택사항, 지정하면 해당 자산의 소수점 자릿수 사용)
 * @returns 포맷팅된 문자열
 *
 * @example
 * formatCryptoAmount(1234.50000000) // "1,234.5"
 * formatCryptoAmount(1234.50000000, 'BTC') // "1,234.5"
 * formatCryptoAmount(0.00123456789, 'BTC') // "0.00123457"
 * formatCryptoAmount(1234567, 'KRW') // "1,234,567"
 */
export function formatCryptoAmount(amount: number | string, currency?: string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return '0';

  // 가상자산별 소수점 자릿수 결정
  const decimals = currency ? (CRYPTO_DECIMALS[currency.toUpperCase()] ?? 8) : 8;

  return formatNumber(numAmount, decimals);
}

/**
 * KRW 금액 포맷팅 (원화 기호 포함)
 * @param amount - 원화 금액
 * @returns 포맷팅된 원화 문자열
 *
 * @example
 * formatKRW(1234567) // "1,234,567원"
 * formatKRW(1234567.89) // "1,234,568원"
 */
export function formatKRW(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  // 원화는 소수점 없이 반올림
  return `${Math.round(numAmount).toLocaleString('ko-KR')}원`;
}
