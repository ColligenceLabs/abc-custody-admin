/**
 * AddressSearchField Component
 * 한국 주소 검색 (다음 주소검색 API 사용)
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddressKorea } from "@/types/address";

interface AddressSearchFieldProps {
  value: AddressKorea | null;
  onChange: (address: AddressKorea) => void;
  label?: string;
  required?: boolean;
}

export function AddressSearchField({
  value,
  onChange,
  label = "주소",
  required = false
}: AddressSearchFieldProps) {
  const { toast } = useToast();
  const [postalCode, setPostalCode] = useState(value?.postalCode || '');
  const [address, setAddress] = useState(value?.address || '');
  const [detailAddress, setDetailAddress] = useState(value?.detailAddress || '');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // 다음 주소검색 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // 주소 검색 팝업 오픈
  const handleAddressSearch = () => {
    if (!scriptLoaded || !window.daum) {
      toast({
        variant: "destructive",
        description: "주소검색 서비스를 로드하는 중입니다. 잠시 후 다시 시도해주세요.",
      });
      return;
    }

    new window.daum.Postcode({
      oncomplete: (data: DaumPostcodeData) => {
        const newPostalCode = data.zonecode;
        const newAddress = data.roadAddress || data.jibunAddress;

        setPostalCode(newPostalCode);
        setAddress(newAddress);

        // 부모 컴포넌트에 변경사항 전달
        onChange({
          type: 'korea',
          postalCode: newPostalCode,
          address: newAddress,
          detailAddress: detailAddress
        });

        // 상세주소 입력 필드에 포커스
        setTimeout(() => {
          document.getElementById('detailAddress')?.focus();
        }, 100);
      }
    }).open();
  };

  // 상세주소 변경 핸들러
  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDetailAddress = e.target.value;
    setDetailAddress(newDetailAddress);

    // 부모 컴포넌트에 변경사항 전달
    if (postalCode && address) {
      onChange({
        type: 'korea',
        postalCode,
        address,
        detailAddress: newDetailAddress
      });
    }
  };

  return (
    <div className="space-y-4">
      <Label>
        {label} {required && '*'}
      </Label>

      {/* 우편번호 및 주소검색 버튼 */}
      <div className="flex gap-2">
        <Input
          type="text"
          value={postalCode}
          placeholder="우편번호"
          readOnly
          className="w-32"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddressSearch}
          disabled={!scriptLoaded}
        >
          <Search className="mr-2 h-4 w-4" />
          주소 검색
        </Button>
      </div>

      {/* 기본주소 */}
      <Input
        type="text"
        value={address}
        placeholder="기본주소"
        readOnly
      />

      {/* 상세주소 */}
      <Input
        id="detailAddress"
        type="text"
        value={detailAddress}
        onChange={handleDetailAddressChange}
        placeholder="상세주소를 입력하세요 (예: 101동 1001호)"
      />
    </div>
  );
}
