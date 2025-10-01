'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본적으로 회사 정보 탭으로 리다이렉트
    router.replace('/setting/company')
  }, [router])

  return null
}