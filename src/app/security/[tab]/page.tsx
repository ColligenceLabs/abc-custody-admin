'use client'

import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import SecuritySettings from '@/components/SecuritySettings'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface SecurityTabPageProps {
  params: {
    tab: string
  }
}

// 유효한 탭 목록
const VALID_TABS = ['security', 'addresses', 'accounts', 'policies', 'notifications'] as const
type ValidTab = typeof VALID_TABS[number]

function isValidTab(tab: string): tab is ValidTab {
  return VALID_TABS.includes(tab as ValidTab)
}

export default function SecurityTabPage({ params }: SecurityTabPageProps) {
  const { selectedPlan } = useServicePlan()
  const { tab } = params

  // 유효하지 않은 탭인 경우 404 처리
  if (!isValidTab(tab)) {
    notFound()
  }

  return (
    <PageLayout activeTab="security">
      <SecuritySettings plan={selectedPlan} initialTab={tab} />
    </PageLayout>
  )
}