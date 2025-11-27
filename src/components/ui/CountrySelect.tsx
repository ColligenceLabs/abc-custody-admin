/**
 * CountrySelect Component
 * country_codes 테이블 기반 국가 선택
 */

"use client";

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Country {
  isoAlpha2: string;
  isoAlpha3: string;
  nameKo: string;
  nameEn: string;
}

interface CountrySelectProps {
  value: string; // isoAlpha2 (KR, US, JP 등)
  onValueChange: (isoAlpha2: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export function CountrySelect({
  value,
  onValueChange,
  label,
  required = false,
  placeholder = "국가 선택",
  disabled = false,
}: CountrySelectProps) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'ko' | 'en'>('ko');

  useEffect(() => {
    // 언어 설정 확인 (localStorage 또는 context)
    const savedLang = localStorage.getItem('language') || 'ko';
    setLanguage(savedLang as 'ko' | 'en');

    // 국가 코드 조회
    const fetchCountries = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/country-codes`, {
          credentials: 'include',
        });

        if (response.ok) {
          const result = await response.json();
          setCountries(result.data || []);
        }
      } catch (error) {
        console.error('국가 코드 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <Label>
          {label} {required && <span className="text-red-600">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled || loading}
      >
        <SelectTrigger>
          <SelectValue placeholder={loading ? "로딩 중..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.isoAlpha2} value={country.isoAlpha2}>
              {language === 'ko' ? country.nameKo : country.nameEn} ({country.isoAlpha2})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
