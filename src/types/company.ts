// 회사 브랜딩 및 설정 관련 타입 정의

export interface CompanySettings {
  id: string;

  // 브랜딩 정보
  companyName: string;
  companySubtitle?: string;
  logoUrl?: string;
  logoText?: string; // 로고가 없을 때 표시할 텍스트

  // 도메인 관리
  allowedEmailDomains: string[];
  isEmailDomainRequired: boolean;

  // 시스템 정보
  isActive: boolean;
  updatedBy: string;
  updatedAt: Date;
}

// 이메일 도메인 검증 결과
export interface EmailValidationResult {
  valid: boolean;
  message?: string;
}

// 브랜딩 설정 폼 데이터
export interface CompanyBrandingForm {
  companyName: string;
  companySubtitle: string;
  logoText: string;
  logoFile?: File;
}

// 도메인 설정 폼 데이터
export interface DomainSettingsForm {
  allowedEmailDomains: string[];
  isEmailDomainRequired: boolean;
  newDomain: string; // 입력 중인 새 도메인
}

// 기본 회사 설정 (fallback)
export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  id: 'default',
  companyName: 'ABC Custody',
  companySubtitle: '디지털 자산 커스터디 서비스',
  logoText: '',
  allowedEmailDomains: [],
  isEmailDomainRequired: false,
  isActive: true,
  updatedBy: 'system',
  updatedAt: new Date(),
};