'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Member } from '@/types/member'
import { Organization } from '@/types/organization'
import { OrganizationUser } from '@/types/organizationUser'
import { getMemberById } from '@/utils/memberUtils'
import { getOrganizationByMemberId } from '@/data/organizationMockData'
import { getOrganizationUsersByOrganizationId } from '@/data/organizationUserMockData'

interface OrganizationContextType {
  currentOrganization: Organization | null
  currentMember: Member | null
  organizationUsers: OrganizationUser[]
  setCurrentOrganization: (organization: Organization | null) => void
  setCurrentMember: (member: Member | null) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizationUsers, setOrganizationUsers] = useState<OrganizationUser[]>([])

  // currentMember 변경 시 조직 정보 자동 로드
  useEffect(() => {
    if (currentMember?.type === 'corporate') {
      const org = getOrganizationByMemberId(currentMember.memberId)
      setCurrentOrganization(org || null)
    } else {
      setCurrentOrganization(null)
    }
  }, [currentMember])

  // currentOrganization 변경 시 조직 사용자 목록 로드
  useEffect(() => {
    if (currentOrganization) {
      const users = getOrganizationUsersByOrganizationId(currentOrganization.organizationId)
      setOrganizationUsers(users)
    } else {
      setOrganizationUsers([])
    }
  }, [currentOrganization])

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        currentMember,
        organizationUsers,
        setCurrentOrganization,
        setCurrentMember
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}
