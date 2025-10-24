import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 큰 금액을 한국식 단위로 축약
 * @param value - 숫자 값 또는 금액 문자열
 * @returns 축약된 문자열 (예: "₩24.5억")
 *
 * @example
 * formatCompactCurrency(2450000000) // "₩24.5억"
 * formatCompactCurrency(150000000000) // "₩1.5조"
 * formatCompactCurrency("5000000") // "₩500.0만"
 */
export function formatCompactCurrency(value: number | string): string {
  // 문자열인 경우 숫자로 변환
  const numValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
    : value;

  if (isNaN(numValue)) {
    return '₩0';
  }

  // 1조 이상 (1,000,000,000,000)
  if (numValue >= 1_000_000_000_000) {
    return `₩${(numValue / 1_000_000_000_000).toFixed(1)}조`;
  }

  // 1억 이상 (100,000,000)
  if (numValue >= 100_000_000) {
    return `₩${(numValue / 100_000_000).toFixed(1)}억`;
  }

  // 1만 이상 (10,000)
  if (numValue >= 10_000) {
    return `₩${(numValue / 10_000).toFixed(1)}만`;
  }

  // 1만 미만은 그대로 표시
  return `₩${numValue.toLocaleString('ko-KR')}`;
}

/**
 * 숫자를 한국식 통화 형식으로 포맷
 * @param value - 숫자 값 또는 금액 문자열
 * @returns 포맷된 문자열 (예: "₩2,450,000,000")
 *
 * @example
 * formatFullCurrency(2450000000) // "₩2,450,000,000"
 */
export function formatFullCurrency(value: number | string): string {
  const numValue = typeof value === 'string'
    ? parseFloat(value.replace(/[^0-9.-]/g, ''))
    : value;

  if (isNaN(numValue)) {
    return '₩0';
  }

  return `₩${numValue.toLocaleString('ko-KR')}`;
}