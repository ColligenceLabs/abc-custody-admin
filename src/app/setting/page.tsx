'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useOTPAuth } from '@/contexts/OTPAuthContext'
import { OTPVerificationModal } from '@/components/auth/OTPVerificationModal'

export default function SettingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { isVerified, isExpired } = useOTPAuth()
  const [showOTPModal, setShowOTPModal] = useState(false)

  useEffect(() => {
    // OTP 인증 확인
    if (!isVerified || isExpired()) {
      setShowOTPModal(true)
      return
    }

    // 회원 유형에 따라 다른 기본 탭으로 리다이렉트
    if (user?.memberType === 'corporate') {
      router.replace('/setting/company')
    } else {
      router.replace('/setting/subscription')
    }
  }, [router, user, isVerified, isExpired])

  const handleOTPSuccess = () => {
    setShowOTPModal(false)
    // 인증 성공 후 리다이렉트
    if (user?.memberType === 'corporate') {
      router.replace('/setting/company')
    } else {
      router.replace('/setting/subscription')
    }
  }

  return (
    <>
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => {}} // 닫기 방지 (인증 필수)
        onSuccess={handleOTPSuccess}
      />
    </>
  )
}