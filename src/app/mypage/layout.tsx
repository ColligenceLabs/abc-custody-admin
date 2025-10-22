'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useOTPAuth } from '@/contexts/OTPAuthContext'
import { OTPVerificationContent } from '@/components/auth/OTPVerificationContent'
import PageLayout from '@/components/PageLayout'

interface MyPageLayoutProps {
  children: ReactNode
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const { isVerified, isExpired } = useOTPAuth()
  const [isOTPChecked, setIsOTPChecked] = useState<boolean | null>(null)

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

  // 초기 로딩 중
  if (isOTPChecked === null) {
    return null
  }

  // OTP 인증이 완료되지 않으면 인증 화면 표시 (PageLayout 안쪽에)
  if (!isOTPChecked) {
    return (
      <PageLayout activeTab="mypage">
        <OTPVerificationContent onSuccess={handleOTPSuccess} />
      </PageLayout>
    )
  }

  return <>{children}</>
}
