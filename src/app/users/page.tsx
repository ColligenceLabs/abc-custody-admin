'use client'

import PageLayout from '@/components/PageLayout'
import UserManagement from '@/components/UserManagement'
import { useServicePlan } from '@/contexts/ServicePlanContext'

export default function UsersPage() {
  const { selectedPlan } = useServicePlan()

  return (
    <PageLayout activeTab="users">
      <UserManagement plan={selectedPlan} />
    </PageLayout>
  )
}