"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CompanySettings, DEFAULT_COMPANY_SETTINGS, EmailValidationResult } from "@/types/company";

interface CompanyContextType {
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  validateEmailDomain: (email: string) => EmailValidationResult;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

// 로컬 스토리지 키
const COMPANY_SETTINGS_KEY = "company_settings";

export function CompanyProvider({ children }: CompanyProviderProps) {
  const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩: localStorage에서 설정 불러오기
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(COMPANY_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Date 객체 복원
        parsed.updatedAt = new Date(parsed.updatedAt);
        setCompanySettings(parsed);
      }
    } catch (error) {
      console.error("회사 설정 로딩 실패:", error);
      // 오류 시 기본값 유지
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 회사 설정 업데이트
  const updateCompanySettings = (updates: Partial<CompanySettings>) => {
    const newSettings: CompanySettings = {
      ...companySettings,
      ...updates,
      updatedAt: new Date(),
    };

    setCompanySettings(newSettings);

    // localStorage에 저장
    try {
      localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("회사 설정 저장 실패:", error);
    }
  };

  // 이메일 도메인 검증
  const validateEmailDomain = (email: string): EmailValidationResult => {
    // 이메일 형식 기본 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        valid: false,
        message: "올바른 이메일 형식이 아닙니다.",
      };
    }

    // 도메인 검증이 필수가 아닌 경우
    if (!companySettings.isEmailDomainRequired) {
      return { valid: true };
    }

    // 허용된 도메인이 없는 경우
    if (companySettings.allowedEmailDomains.length === 0) {
      return { valid: true };
    }

    // 도메인 추출 및 검증
    const domain = email.split("@")[1].toLowerCase();
    const allowedDomains = companySettings.allowedEmailDomains.map(d => d.toLowerCase());

    if (allowedDomains.includes(domain)) {
      return { valid: true };
    }

    return {
      valid: false,
      message: `허용된 도메인만 사용 가능합니다: ${companySettings.allowedEmailDomains.join(", ")}`,
    };
  };

  return (
    <CompanyContext.Provider
      value={{
        companySettings,
        updateCompanySettings,
        validateEmailDomain,
        isLoading
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}