'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// 보안 정책 인터페이스
export interface SecurityPolicy {
  // 인증 정책
  authenticatorRequired: boolean    // OTP 필수 여부
  smsRequired: boolean             // SMS 필수 여부

  // 접근 제어
  ipWhitelistEnabled: boolean      // IP 화이트리스트 활성화

  // 세션 관리
  sessionTimeout: number           // 세션 타임아웃 (분)

  // 보안 설정
  maxAttempts: number             // 최대 시도 횟수
}

// 인증 단계 타입
export type AuthStepType = 'email' | 'otp' | 'sms'

// 기본 보안 정책
const DEFAULT_SECURITY_POLICY: SecurityPolicy = {
  authenticatorRequired: true,
  smsRequired: true,
  ipWhitelistEnabled: false,
  sessionTimeout: 30, // 30분
  maxAttempts: 5
}

interface SecurityPolicyContextType {
  policy: SecurityPolicy
  updatePolicy: (updates: Partial<SecurityPolicy>) => void
  getRequiredAuthSteps: (user?: { hasGASetup: boolean }) => AuthStepType[]
  getSessionTimeoutMs: () => number
  resetToDefaults: () => void
  isFirstTimeUser: (user: { hasGASetup: boolean; isFirstLogin: boolean }) => boolean
}

const SecurityPolicyContext = createContext<SecurityPolicyContextType | undefined>(undefined)

// localStorage 키
const STORAGE_KEY = 'security_policy'

export function SecurityPolicyProvider({ children }: { children: ReactNode }) {
  const [policy, setPolicy] = useState<SecurityPolicy>(DEFAULT_SECURITY_POLICY)

  // localStorage에서 정책 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedPolicy = JSON.parse(stored)
        // 기본값과 병합하여 누락된 필드 보완
        setPolicy({ ...DEFAULT_SECURITY_POLICY, ...parsedPolicy })
      }
    } catch (error) {
      console.warn('보안 정책 로드 실패, 기본값 사용:', error)
    }
  }, [])

  // 정책 업데이트 함수 (GA와 SMS 관련 변경은 무시)
  const updatePolicy = (updates: Partial<SecurityPolicy>) => {
    // GA와 SMS 정책은 항상 활성화 상태로 유지
    const filteredUpdates = { ...updates }
    delete filteredUpdates.authenticatorRequired
    delete filteredUpdates.smsRequired

    const newPolicy = {
      ...policy,
      ...filteredUpdates,
      // GA와 SMS는 항상 활성화
      authenticatorRequired: true,
      smsRequired: true
    }
    setPolicy(newPolicy)

    // localStorage에 저장
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPolicy))
    } catch (error) {
      console.warn('보안 정책 저장 실패:', error)
    }
  }

  // 필요한 인증 단계 결정 (신규 사용자는 GA 제외)
  const getRequiredAuthSteps = (user?: { hasGASetup: boolean }): AuthStepType[] => {
    // 신규 사용자 (GA 미설정)인 경우 이메일 + SMS만
    if (user && !user.hasGASetup) {
      return ['email', 'sms']
    }

    // 기존 사용자 (GA 설정 완료)는 모든 인증 단계
    return ['email', 'otp', 'sms']
  }

  // 신규 사용자 감지
  const isFirstTimeUser = (user: { hasGASetup: boolean; isFirstLogin: boolean }): boolean => {
    return user.isFirstLogin && !user.hasGASetup
  }

  // 세션 타임아웃을 밀리초로 변환
  const getSessionTimeoutMs = (): number => {
    return policy.sessionTimeout * 60 * 1000 // 분을 밀리초로 변환
  }

  // 기본값으로 리셋
  const resetToDefaults = () => {
    setPolicy(DEFAULT_SECURITY_POLICY)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SECURITY_POLICY))
    } catch (error) {
      console.warn('기본 정책 저장 실패:', error)
    }
  }

  return (
    <SecurityPolicyContext.Provider
      value={{
        policy,
        updatePolicy,
        getRequiredAuthSteps,
        getSessionTimeoutMs,
        resetToDefaults,
        isFirstTimeUser
      }}
    >
      {children}
    </SecurityPolicyContext.Provider>
  )
}

export function useSecurityPolicy() {
  const context = useContext(SecurityPolicyContext)
  if (context === undefined) {
    throw new Error('useSecurityPolicy는 SecurityPolicyProvider 내에서 사용되어야 합니다.')
  }
  return context
}