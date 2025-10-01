'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ServicePlan } from '@/app/page'
import { DashboardTab } from '@/types/dashboard'
import Sidebar from './Sidebar'
import AssetOverview from './AssetOverview'
import TransactionHistory from './TransactionHistory'
import UserManagement from './UserManagement'
import AdditionalServices from './AdditionalServices'
import SecuritySettings from './SecuritySettings'
import GroupWalletManagement from './GroupWalletManagement'
import DepositManagement from './DepositManagement'
import WithdrawalManagement from './WithdrawalManagement'
import { useSidebar } from '@/contexts/SidebarContext'

interface DashboardProps {
  plan: ServicePlan
  onPlanChange: (plan: ServicePlan) => void
}

export default function Dashboard({ plan, onPlanChange }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const { isCollapsed } = useSidebar()
  const pathname = usePathname()

  // URL 변경에 따라 activeTab 업데이트
  useEffect(() => {
    const getTabFromPathname = (): DashboardTab => {
      if (pathname.startsWith('/withdrawal')) return 'withdrawal'
      if (pathname.startsWith('/groups')) return 'groups'
      if (pathname.startsWith('/services')) return 'services'
      if (pathname.startsWith('/security')) return 'security'

      switch (pathname) {
        case '/overview': return 'overview'
        case '/transactions': return 'transactions'
        case '/users': return 'users'
        case '/deposit': return 'deposit'
        case '/': return 'overview'
        default: return 'overview'
      }
    }

    setActiveTab(getTabFromPathname())
  }, [pathname])

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AssetOverview plan={plan} />
      case 'transactions':
        return <TransactionHistory plan={plan} />
      case 'users':
        return <UserManagement plan={plan} />
      case 'groups':
        return <GroupWalletManagement plan={plan} />
      case 'deposit':
        return <DepositManagement plan={plan} />
      case 'withdrawal':
        return <WithdrawalManagement plan={plan} />
      case 'services':
        return <AdditionalServices plan={plan} />
      case 'security':
        return <SecuritySettings plan={plan} />
      default:
        return <AssetOverview plan={plan} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        plan={plan}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPlanChange={onPlanChange}
      />

      <div className={`pt-24 transition-all duration-300 ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}