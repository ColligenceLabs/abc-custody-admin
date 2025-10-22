'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useOTPAuth } from '@/contexts/OTPAuthContext'
import { OTPVerificationContent } from '@/components/auth/OTPVerificationContent'

interface SettingLayoutProps {
  children: ReactNode
}

export default function SettingLayout({ children }: SettingLayoutProps) {
  const { isVerified, isExpired } = useOTPAuth()
  const [isOTPChecked, setIsOTPChecked] = useState(false)

  useEffect(() => {
    // OTP 인증 확인
    if (!isVerified || isExpired()) {
      setIsOTPChecked(false)
    } else {
      setIsOTPChecked(true)
    }
  }, [isVerified, isExpired])

  const handleOTPSuccess = () => {
    setIsOTPChecked(true)
  }

  // OTP 인증이 완료되지 않으면 인증 화면 표시
  if (!isOTPChecked) {
    return <OTPVerificationContent onSuccess={handleOTPSuccess} />
  }

  return <>{children}</>
}
