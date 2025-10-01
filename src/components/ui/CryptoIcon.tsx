import { useState } from 'react'

interface CryptoIconProps {
  symbol: string
  size?: number
  className?: string
}

export default function CryptoIcon({ symbol, size = 24, className = '' }: CryptoIconProps) {
  const [hasError, setHasError] = useState(false)

  // 심볼을 소문자로 변환하고 공백 제거
  const normalizedSymbol = symbol.toLowerCase().trim()

  // 로컬 아이콘 경로
  const iconPath = `/cryptocurrency-icons/32/color/${normalizedSymbol}.png`

  const handleError = () => {
    setHasError(true)
  }

  // 에러 발생 시 또는 지원되지 않는 심볼의 경우 fallback SVG
  if (hasError || ['krw', 'krd', 'won'].includes(normalizedSymbol)) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-100 ${className}`}
        style={{ width: size, height: size }}
      >
        <span
          className="text-gray-600 font-bold text-xs"
          style={{ fontSize: Math.max(8, size * 0.3) }}
        >
          {symbol.toUpperCase().slice(0, 3)}
        </span>
      </div>
    )
  }

  return (
    <img
      src={iconPath}
      alt={symbol}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      onError={handleError}
    />
  )
}