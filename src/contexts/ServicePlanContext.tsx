'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { ServicePlan } from '@/app/page'

interface ServicePlanContextType {
  selectedPlan: ServicePlan
  setSelectedPlan: (plan: ServicePlan) => void
}

const ServicePlanContext = createContext<ServicePlanContextType | undefined>(undefined)

export function ServicePlanProvider({ children }: { children: ReactNode }) {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan>('enterprise')

  return (
    <ServicePlanContext.Provider value={{ selectedPlan, setSelectedPlan }}>
      {children}
    </ServicePlanContext.Provider>
  )
}

export function useServicePlan() {
  const context = useContext(ServicePlanContext)
  if (context === undefined) {
    throw new Error('useServicePlan must be used within a ServicePlanProvider')
  }
  return context
}