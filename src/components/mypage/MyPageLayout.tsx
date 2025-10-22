'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import PageLayout from '@/components/PageLayout'

type MyPageTab = 'profile' | 'verification' | 'security' | 'addresses'

interface MyPageLayoutProps {
  children: ReactNode
  activeTab: MyPageTab
}

export default function MyPageLayout({ children, activeTab }: MyPageLayoutProps) {
  const router = useRouter()

  const tabs: { id: MyPageTab; name: string; path: string }[] = [
    { id: 'profile', name: '개인정보', path: '/mypage/profile' },
    { id: 'verification', name: '본인인증', path: '/mypage/verification' },
    { id: 'security', name: '보안 설정', path: '/mypage/security' },
    { id: 'addresses', name: '주소 관리', path: '/mypage/addresses' }
  ]

  return (
    <PageLayout activeTab="mypage">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">마이페이지</h1>
          <p className="mt-2 text-sm text-gray-600">
            개인정보 관리 및 본인인증을 진행할 수 있습니다.
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-white rounded-lg shadow">
          {children}
        </div>
      </div>
    </PageLayout>
  )
}
