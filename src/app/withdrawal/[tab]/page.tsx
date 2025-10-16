'use client'

import { notFound } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PageLayout from '@/components/PageLayout'
import WithdrawalManagement from '@/components/WithdrawalManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

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
  const { selectedPlan } = useServicePlan()
  const { user } = useAuth()
  const { tab } = params

  // 회원 유형에 따라 유효한 탭인지 확인
  const isValidTab = user?.memberType === 'corporate'
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
