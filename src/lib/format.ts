/**
 * 숫자 및 가상자산 포맷팅 유틸리티
 */

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
  return numAmount.toString();
}

/**
 * 숫자를 천 단위 콤마로 포맷팅
 * @param num - 포맷팅할 숫자
 * @returns 천 단위 콤마가 추가된 문자열
 *
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 */
export function formatNumber(num: number | string): string {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  return numValue.toLocaleString('ko-KR');
}

/**
 * 가상자산 금액을 포맷팅 (콤마 + trailing zeros 제거)
 * @param amount - 금액
 * @returns 포맷팅된 문자열
 *
 * @example
 * formatCryptoAmount(1234.50000000) // "1,234.5"
 */
export function formatCryptoAmount(amount: number | string): string {
  const formatted = formatAmount(amount);
  return formatNumber(formatted);
}

/**
 * KRW 금액 포맷팅 (원화 기호 포함)
 * @param amount - 원화 금액
 * @returns 포맷팅된 원화 문자열
 *
 * @example
 * formatKRW(1234567) // "1,234,567원"
 */
export function formatKRW(amount: number | string): string {
  return `${formatNumber(amount)}원`;
}
