'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    console.log('not-found.tsx: Page not found, current URL:', window.location.href)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <div className="space-y-3">
              <Link
                href="/overview"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                대시보드로 이동
              </Link>
              <button
                onClick={() => router.back()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                이전 페이지로
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}