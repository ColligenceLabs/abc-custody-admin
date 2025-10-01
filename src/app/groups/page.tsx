'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupsPage() {
  const router = useRouter()

  useEffect(() => {
    // 기본 탭으로 리다이렉트
    router.replace('/groups/groups')
  }, [router])

  return null
}