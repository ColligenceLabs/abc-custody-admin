/**
 * InternationalAddressField Component
 * 해외 주소 입력 (자유 형식 텍스트 입력)
 */

"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddressInternational } from "@/types/address";

interface InternationalAddressFieldProps {
  value: AddressInternational | null;
  onChange: (address: AddressInternational) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
}

export function InternationalAddressField({
  value,
  onChange,
  label = "주소",
  required = false,
  placeholder = "주소를 입력하세요 (예: 1234 Main St, Suite 100, New York, NY 10001, USA)"
}: InternationalAddressFieldProps) {
  const [fullAddress, setFullAddress] = useState(value?.fullAddress || '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAddress = e.target.value;
    setFullAddress(newAddress);

    onChange({
      type: 'international',
      fullAddress: newAddress
    });
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="internationalAddress">
        {label} {required && '*'}
      </Label>
      <Textarea
        id="internationalAddress"
        value={fullAddress}
        onChange={handleChange}
        placeholder={placeholder}
        rows={3}
      />
    </div>
  );
}
