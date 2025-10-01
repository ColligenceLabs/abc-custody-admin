'use client'

import { notFound } from 'next/navigation'
import PageLayout from '@/components/PageLayout'
import SecuritySettings from '@/components/SecuritySettings'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface PolicySubtabPageProps {
  params: {
    subtab: string
  }
}

// 유효한 서브탭 목록
const VALID_SUBTABS = ['amount', 'type'] as const
type ValidSubtab = typeof VALID_SUBTABS[number]

function isValidSubtab(subtab: string): subtab is ValidSubtab {
  return VALID_SUBTABS.includes(subtab as ValidSubtab)
}

export default function PolicySubtabPage({ params }: PolicySubtabPageProps) {
  const { selectedPlan } = useServicePlan()
  const { subtab } = params

  // 유효하지 않은 서브탭인 경우 404 처리
  if (!isValidSubtab(subtab)) {
    notFound()
  }

  return (
    <PageLayout activeTab="security">
      <SecuritySettings plan={selectedPlan} initialTab="policies" policySubtab={subtab} />
    </PageLayout>
  )
}