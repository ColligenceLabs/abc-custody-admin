'use client'

import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import SettingManagement from '@/components/admin/SettingManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface SettingTabPageProps {
  params: {
    tab: string
  }
}

// 유효한 탭 목록
const VALID_TABS = ['company', 'subscription'] as const
type ValidTab = typeof VALID_TABS[number]

function isValidTab(tab: string): tab is ValidTab {
  return VALID_TABS.includes(tab as ValidTab)
}

export default function SettingTabPage({ params }: SettingTabPageProps) {
  const { selectedPlan } = useServicePlan()
  const { tab } = params

  // 유효하지 않은 탭인 경우 404 처리
  if (!isValidTab(tab)) {
    notFound()
  }

  return (
    <PageLayout activeTab="setting">
      <SettingManagement plan={selectedPlan} initialTab={tab} />
    </PageLayout>
  )
}