'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyPage() {
  const router = useRouter()

  useEffect(() => {
    // 마이페이지 기본 탭인 profile로 리다이렉트
    router.replace('/mypage/profile')
  }, [router])

  return null
}
