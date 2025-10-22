'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AddressTabPageProps {
  params: {
    tab: string
  }
}

export default function AddressTabPage({ params }: AddressTabPageProps) {
  const router = useRouter()

  useEffect(() => {
    router.replace('/mypage/addresses')
  }, [router])

  return null
}
