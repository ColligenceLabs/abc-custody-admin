'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PoliciesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/mypage/security')
  }, [router])

  return null
}