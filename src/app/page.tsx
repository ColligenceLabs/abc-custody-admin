'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type ServicePlan = 'enterprise' | 'premium' | 'free' | null

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // UI/UX 기획을 위해 항상 로그인 페이지로 리다이렉트
    router.replace('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    </div>
  )
}