'use client'

import { notFound } from 'next/navigation'
import MyPageLayout from '@/components/mypage/MyPageLayout'
import ProfileTab from '@/components/mypage/ProfileTab'
import VerificationTab from '@/components/mypage/VerificationTab'
import SecurityTab from '@/components/mypage/SecurityTab'
import AddressManagement from '@/components/mypage/AddressManagement'
import AccountManagement from '@/components/mypage/AccountManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

type MyPageTab = 'profile' | 'verification' | 'security' | 'addresses' | 'accounts'

interface MyPageProps {
  params: {
    tab: string
  }
}

export default function MyPageTabPage({ params }: MyPageProps) {
  const { selectedPlan } = useServicePlan()
  const { tab } = params

  // 유효한 탭인지 검증
  if (tab !== 'profile' && tab !== 'verification' && tab !== 'security' && tab !== 'addresses' && tab !== 'accounts') {
    notFound()
  }

  return (
    <MyPageLayout activeTab={tab as MyPageTab}>
      {tab === 'profile' && <ProfileTab />}
      {tab === 'verification' && <VerificationTab />}
      {tab === 'security' && <SecurityTab plan={selectedPlan} />}
      {tab === 'addresses' && <AddressManagement initialTab="personal" />}
      {tab === 'accounts' && <AccountManagement plan={selectedPlan} />}
    </MyPageLayout>
  )
}
