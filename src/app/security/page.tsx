'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SecurityPage() {
  const router = useRouter()

  useEffect(() => {
    // 보안 설정은 마이페이지로 이동
    router.replace('/mypage/security')
  }, [router])

  return null
}