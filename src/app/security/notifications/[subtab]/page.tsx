'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface NotificationSubtabPageProps {
  params: {
    subtab: string
  }
}

export default function NotificationSubtabPage({ params }: NotificationSubtabPageProps) {
  const router = useRouter()

  useEffect(() => {
    router.replace('/mypage/security')
  }, [router])

  return null
}
