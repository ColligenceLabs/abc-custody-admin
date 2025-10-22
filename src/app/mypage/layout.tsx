'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useOTPAuth } from '@/contexts/OTPAuthContext'
import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal'

interface MyPageLayoutProps {
  children: ReactNode
}

export default function MyPageLayout({ children }: MyPageLayoutProps) {
  const { isVerified, isExpired } = useOTPAuth()
  const [showOTPModal, setShowOTPModal] = useState(false)
  const [isOTPChecked, setIsOTPChecked] = useState(false)

  useEffect(() => {
    // OTP 인증 확인
    if (!isVerified || isExpired()) {
      setShowOTPModal(true)
      setIsOTPChecked(false)
    } else {
      setShowOTPModal(false)
      setIsOTPChecked(true)
    }
  }, [isVerified, isExpired])

  const handleOTPSuccess = () => {
    setShowOTPModal(false)
    setIsOTPChecked(true)
  }

  // OTP 인증이 완료되지 않으면 모달만 표시
  if (!isOTPChecked) {
    return (
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {}} // 닫기 방지 (인증 필수)
        onSuccess={handleOTPSuccess}
      />
    )
  }

  return <>{children}</>
}
