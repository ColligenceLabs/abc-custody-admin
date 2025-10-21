'use client'

import { notFound } from 'next/navigation'
import MyPageLayout from '@/components/mypage/MyPageLayout'
import ProfileTab from '@/components/mypage/ProfileTab'
import VerificationTab from '@/components/mypage/VerificationTab'

type MyPageTab = 'profile' | 'verification'

interface MyPageProps {
  params: {
    tab: string
  }
}

export default function MyPageTabPage({ params }: MyPageProps) {
  const { tab } = params

  // 유효한 탭인지 검증
  if (tab !== 'profile' && tab !== 'verification') {
    notFound()
  }

  return (
    <MyPageLayout activeTab={tab as MyPageTab}>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'verification' && <VerificationTab />}
    </MyPageLayout>
  )
}
