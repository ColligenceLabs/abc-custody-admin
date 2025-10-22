'use client'

import { ReactNode } from 'react'

interface SettingLayoutProps {
  children: ReactNode
}

export default function SettingLayout({ children }: SettingLayoutProps) {
  return <>{children}</>
}
