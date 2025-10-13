/**
 * 통합 배지 색상 시스템
 * CLAUDE.md의 배지 시스템 가이드라인을 실제 코드로 구현
 *
 * 색상 규칙:
 * - 배경: -50 레벨
 * - 텍스트: -600 레벨
 * - 테두리: -200 레벨
 */

export const badgeColors = {
  highest: "text-indigo-600 bg-indigo-50 border-indigo-200", // 관리자/긴급
  high: "text-blue-600 bg-blue-50 border-blue-200",          // 매니저/주의
  medium: "text-purple-600 bg-purple-50 border-purple-200",  // 운영자/보통
  positive: "text-sky-600 bg-sky-50 border-sky-200",         // 성공/활성 (초록색 대체)
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200", // 경고/대기
  danger: "text-red-600 bg-red-50 border-red-200",           // 오류/위험
  neutral: "text-gray-600 bg-gray-50 border-gray-200",       // 중성/기본
} as const;

export type BadgeColorLevel = keyof typeof badgeColors;
