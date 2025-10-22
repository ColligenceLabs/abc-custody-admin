'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useOTPAuth } from '@/contexts/OTPAuthContext'
import { OTPVerificationContent } from '@/components/auth/OTPVerificationContent'

interface MyPageLayoutProps {
  children: ReactNode
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const { isVerified, isExpired } = useOTPAuth()
  const [isOTPChecked, setIsOTPChecked] = useState<boolean | null>(null)

  useEffect(() => {
    // OTP 인증 확인
    const checkOTP = () => {
      if (!isVerified || isExpired()) {
        console.log('[MyPage Layout] OTP 인증 필요:', { isVerified, expired: isExpired() })
        setIsOTPChecked(false)
      } else {
        console.log('[MyPage Layout] OTP 인증 완료:', { isVerified })
        setIsOTPChecked(true)
      }
    }

    checkOTP()
  }, [isVerified, isExpired])

  const handleOTPSuccess = () => {
    console.log('[MyPage Layout] OTP 인증 성공')
    setIsOTPChecked(true)
  }

  // 초기 로딩 중
  if (isOTPChecked === null) {
    return null
  }

  // OTP 인증이 완료되지 않으면 인증 화면 표시
  if (!isOTPChecked) {
    return <OTPVerificationContent onSuccess={handleOTPSuccess} />
  }

  return <>{children}</>
}
