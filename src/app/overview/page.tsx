'use client'

import PageLayout from '@/components/PageLayout'
import AssetOverview from '@/components/AssetOverview'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function OverviewPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="overview">
      <AssetOverview plan={selectedPlan} />
    </PageLayout>
  )
}