'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  toggleSidebar: () => void
  collapseSidebar: () => void
  expandSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleSidebar = () => {
    setIsCollapsed(prev => !prev)
  }

  const collapseSidebar = () => {
    setIsCollapsed(true)
  }

  const expandSidebar = () => {
    setIsCollapsed(false)
  }

  if (!isClient) {
    return (
      <SidebarContext.Provider
        value={{
          isCollapsed: false,
          toggleSidebar: () => {},
          collapseSidebar: () => {},
          expandSidebar: () => {}
        }}
      >
        {children}
      </SidebarContext.Provider>
    )
  }

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        toggleSidebar,
        collapseSidebar,
        expandSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}