'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // OTP 인증은 layout에서 처리
    // 회원 유형에 따라 다른 기본 탭으로 리다이렉트
    if (user?.memberType === 'corporate') {
      router.replace('/setting/company')
    } else {
      router.replace('/setting/subscription')
    }
  }, [router, user])

  return null
}