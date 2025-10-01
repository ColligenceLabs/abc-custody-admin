'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotificationsPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본 서브탭으로 리다이렉트
    router.replace('/security/notifications/logs')
  }, [router])

  return null
}