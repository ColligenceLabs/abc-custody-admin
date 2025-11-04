'use client'

import { notFound, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PageLayout from '@/components/PageLayout'
import WithdrawalManagement from '@/components/WithdrawalManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'
import { useEffect } from 'react'

interface WithdrawalTabPageProps {
  params: {
    tab: string
  }
}

// 법인 회원 유효한 탭 목록
const CORPORATE_TABS = ['approval', 'airgap', 'rejected', 'audit'] as const
type CorporateTab = typeof CORPORATE_TABS[number]

// 개인 회원 유효한 탭 목록
const INDIVIDUAL_TABS = ['requests', 'history'] as const
type IndividualTab = typeof INDIVIDUAL_TABS[number]

function isCorporateTab(tab: string): tab is CorporateTab {
  return CORPORATE_TABS.includes(tab as CorporateTab)
}

function isIndividualTab(tab: string): tab is IndividualTab {
  return INDIVIDUAL_TABS.includes(tab as IndividualTab)
}

export default function WithdrawalTabPage({ params }: WithdrawalTabPageProps) {
  const router = useRouter()
  const { selectedPlan } = useServicePlan()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { tab } = params

  // 로그인하지 않은 경우 로그인 페이지로 리디렉션
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) {
      router.push('/login')
    }
  }, [user, isAuthenticated, isLoading, router])

  // 로딩 중에는 렌더링 대기
  if (isLoading) {
    return null
  }

  // 로그인하지 않은 경우
  if (!isAuthenticated || !user) {
    return null
  }

  // 회원 유형에 따라 유효한 탭인지 확인
  const isValidTab = user.memberType === 'corporate'
    ? isCorporateTab(tab)
    : isIndividualTab(tab)

  // 유효하지 않은 탭인 경우 404 처리
  if (!isValidTab) {
    notFound()
  }

  return (
    <PageLayout activeTab="withdrawal">
      <WithdrawalManagement
        plan={selectedPlan}
        initialTab={tab as any}
      />
    </PageLayout>
  )
}
