'use client'

import PageLayout from '@/components/PageLayout'
import SecuritySettings from '@/components/SecuritySettings'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function PolicyAmountPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="security">
      <SecuritySettings
        plan={selectedPlan}
        initialTab="policies"
        policySubtab="amount"
      />
    </PageLayout>
  )
}