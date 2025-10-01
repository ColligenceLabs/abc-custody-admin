'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PoliciesPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본 서브탭으로 리다이렉트 (금액별 정책의 USD)
    router.replace('/security/policies/amount/USD')
  }, [router])

  return null
}