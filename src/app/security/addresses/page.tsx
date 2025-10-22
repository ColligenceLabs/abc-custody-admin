'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AddressesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/mypage/addresses')
  }, [router])

  return null
}