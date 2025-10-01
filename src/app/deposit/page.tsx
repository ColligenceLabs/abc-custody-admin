'use client'

import PageLayout from '@/components/PageLayout'
import DepositManagement from '@/components/DepositManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function DepositPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="deposit">
      <DepositManagement plan={selectedPlan} />
    </PageLayout>
  )
}