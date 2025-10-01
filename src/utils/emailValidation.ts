import { EmailValidationResult } from "@/types/company";

// 도메인 형식 검증 정규식
const DOMAIN_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// 이메일 형식 검증 정규식
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 도메인 형식이 유효한지 검증
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || domain.length === 0) return false;
  if (domain.length > 253) return false; // 최대 도메인 길이
  return DOMAIN_REGEX.test(domain);
}

/**
 * 이메일 형식이 유효한지 검증
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * 이메일에서 도메인 추출
 */
export function extractDomain(email: string): string | null {
  if (!isValidEmail(email)) return null;
  return email.split("@")[1].toLowerCase();
}

/**
 * 기본 이메일 유효성 검사 (형식만)
 */
export function validateEmailFormat(email: string): EmailValidationResult {
  if (!email) {
    return {
      valid: false,
      message: "이메일을 입력해주세요.",
    };
  }

  if (!isValidEmail(email)) {
    return {
      valid: false,
      message: "올바른 이메일 형식이 아닙니다.",
    };
  }

  return { valid: true };
}

/**
 * 이메일 도메인이 허용 목록에 포함되는지 검증
 */
export function validateEmailDomain(
  email: string,
  allowedDomains: string[],
  isRequired: boolean = false
): EmailValidationResult {
  // 기본 형식 검증
  const formatResult = validateEmailFormat(email);
  if (!formatResult.valid) {
    return formatResult;
  }

  // 도메인 검증이 필수가 아닌 경우
  if (!isRequired) {
    return { valid: true };
  }

  // 허용된 도메인이 없는 경우
  if (allowedDomains.length === 0) {
    return { valid: true };
  }

  const domain = extractDomain(email);
  if (!domain) {
    return {
      valid: false,
      message: "이메일에서 도메인을 추출할 수 없습니다.",
    };
  }

  const normalizedAllowedDomains = allowedDomains.map(d => d.toLowerCase());

  if (normalizedAllowedDomains.includes(domain)) {
    return { valid: true };
  }

  return {
    valid: false,
    message: `허용된 도메인만 사용 가능합니다: ${allowedDomains.join(", ")}`,
  };
}

/**
 * 도메인 배열에서 중복 제거 및 정리
 */
export function normalizeDomains(domains: string[]): string[] {
  const processedDomains = domains
    .map(domain => domain.trim().toLowerCase())
    .filter(domain => domain.length > 0 && isValidDomain(domain));
  return Array.from(new Set(processedDomains));
}