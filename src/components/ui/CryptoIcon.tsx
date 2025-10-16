/**
 * CryptoIcon Component
 *
 * 가상자산 아이콘을 표시하는 컴포넌트
 * 로컬 cryptocurrency-icons 패키지 활용
 */

import Image from "next/image";
import { cn } from "@/lib/utils";

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export default function CryptoIcon({
  symbol,
  size = 24,
  className,
}: CryptoIconProps) {
  const symbolLower = symbol.toLowerCase();
  const iconPath = `/cryptocurrency-icons/32/color/${symbolLower}.png`;

  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={iconPath}
        alt={`${symbol} icon`}
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          // Fallback: 이미지 로드 실패 시 텍스트 표시
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `<span class="text-xs font-bold text-muted-foreground">${symbol}</span>`;
          }
        }}
      />
    </div>
  );
}
