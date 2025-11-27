/**
 * NumberInput Component
 * 숫자 입력 필드 (Focus 시 0 자동 선택)
 */

import * as React from "react";
import { Input } from "@/components/ui/input";

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  onValueChange: (value: number) => void;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ value, onValueChange, onFocus, ...props }, ref) => {
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // 값이 0이면 전체 선택하여 바로 입력 가능하게
      if (e.target.value === "0") {
        e.target.select();
      }
      // 커스텀 onFocus 핸들러 호출
      onFocus?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numValue = parseInt(e.target.value) || 0;
      onValueChange(numValue);
    };

    return (
      <Input
        ref={ref}
        type="number"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        {...props}
      />
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
