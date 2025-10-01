'use client'

import { ReactNode } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { useServicePlan } from '@/contexts/ServicePlanContext'
import { useSidebar } from '@/contexts/SidebarContext'
import { useRouter } from 'next/navigation'
import { DashboardTab } from '@/types/dashboard'

interface PageLayoutProps {
  children: ReactNode
  activeTab: DashboardTab
}

export default function PageLayout({ children, activeTab }: PageLayoutProps) {
  const { selectedPlan, setSelectedPlan } = useServicePlan()
  const { isCollapsed } = useSidebar()
  const router = useRouter()

  const handleTabChange = (tab: DashboardTab) => {
    const routes: Record<DashboardTab, string> = {
      overview: '/overview',
      transactions: '/transactions',
      users: '/users',
      groups: '/groups',
      deposit: '/deposit',
      withdrawal: '/withdrawal',
      services: '/services',
      security: '/security',
      setting: '/setting'
    }

    const path = routes[tab]
    if (path) {
      router.push(path)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Sidebar
        plan={selectedPlan}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onPlanChange={setSelectedPlan}
      />

      <div className={`pt-28 p-8 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {children}
      </div>
    </div>
  )
}