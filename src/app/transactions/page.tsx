'use client'

import PageLayout from '@/components/PageLayout'
import TransactionHistory from '@/components/TransactionHistory'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function TransactionsPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="transactions">
      <TransactionHistory plan={selectedPlan} />
    </PageLayout>
  )
}