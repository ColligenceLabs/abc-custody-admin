/**
 * NationalitySelectField Component
 * 국적 선택 드롭다운 (개인회원/법인회원 공통 사용)
 */

"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Country } from "@/types/address";

interface NationalitySelectFieldProps {
  value: string;
  countryCode: string;
  onChange: (nationality: string, countryCode: string) => void;
  label?: string;
  required?: boolean;
}

export function NationalitySelectField({
  value,
  countryCode,
  onChange,
  label = "국적",
  required = false
}: NationalitySelectFieldProps) {
  // 주요 국가 목록
  const countries: Country[] = [
    { code: 'KR', name: '한국' },
    { code: 'US', name: '미국' },
    { code: 'JP', name: '일본' },
    { code: 'CN', name: '중국' },
    { code: 'GB', name: '영국' },
    { code: 'DE', name: '독일' },
    { code: 'FR', name: '프랑스' },
    { code: 'CA', name: '캐나다' },
    { code: 'AU', name: '호주' },
    { code: 'SG', name: '싱가포르' },
    { code: 'HK', name: '홍콩' },
    { code: 'TW', name: '대만' },
    { code: 'VN', name: '베트남' },
    { code: 'TH', name: '태국' },
    { code: 'IN', name: '인도' },
  ];

  return (
    <div className="space-y-2">
      <Label htmlFor="nationality">
        {label} {required && '*'}
      </Label>
      <Select
        value={countryCode}
        onValueChange={(code) => {
          const country = countries.find(c => c.code === code);
          if (country) {
            onChange(country.name, country.code);
          }
        }}
      >
        <SelectTrigger id="nationality">
          <SelectValue placeholder="국적을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
