'use client'

import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import SecuritySettings from '@/components/SecuritySettings'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface NotificationSubtabPageProps {
  params: {
    subtab: string
  }
}

// 유효한 서브탭 목록
const VALID_SUBTABS = ['logs', 'templates', 'settings'] as const
type ValidSubtab = typeof VALID_SUBTABS[number]

function isValidSubtab(subtab: string): subtab is ValidSubtab {
  return VALID_SUBTABS.includes(subtab as ValidSubtab)
}

export default function NotificationSubtabPage({ params }: NotificationSubtabPageProps) {
  const { selectedPlan } = useServicePlan()
  const { subtab } = params

  // 유효하지 않은 서브탭인 경우 404 처리
  if (!isValidSubtab(subtab)) {
    notFound()
  }

  return (
    <PageLayout activeTab="security">
      <SecuritySettings plan={selectedPlan} initialTab="notifications" notificationSubtab={subtab} />
    </PageLayout>
  )
}