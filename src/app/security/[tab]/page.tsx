'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SecurityTabPageProps {
  params: {
    tab: string
  }
}

// 탭별 마이페이지 경로 매핑
const TAB_REDIRECT_MAP: Record<string, string> = {
  'security': '/mypage/security',
  'addresses': '/mypage/addresses',
  'accounts': '/mypage/accounts',
  'policies': '/mypage/security',
  'notifications': '/mypage/security'
}

export default function SecurityTabPage({ params }: SecurityTabPageProps) {
  const router = useRouter()
  const { tab } = params

  useEffect(() => {
    // 해당 탭을 마이페이지로 리다이렉트
    const redirectPath = TAB_REDIRECT_MAP[tab] || '/mypage/security'
    router.replace(redirectPath)
  }, [router, tab])

  return null
}