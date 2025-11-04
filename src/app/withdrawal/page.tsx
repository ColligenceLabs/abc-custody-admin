'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function WithdrawalPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
    if (!isAuthenticated || !user) {
      router.replace('/login')
      return
    }

    // 회원 유형에 따라 다른 기본 탭으로 리다이렉트
    if (user.memberType === 'corporate') {
      router.replace('/withdrawal/approval')
    } else {
      router.replace('/withdrawal/requests')
    }
  }, [router, user, isAuthenticated])

  return null
}
