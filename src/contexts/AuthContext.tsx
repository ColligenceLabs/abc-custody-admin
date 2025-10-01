'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { getUserByEmail } from '@/data/userMockData'
import { verifyOTP, verifySMSCode, sendSMSCode } from '@/utils/authenticationHelpers'
import { useSecurityPolicy, AuthStepType } from '@/contexts/SecurityPolicyContext'

interface AuthStep {
  step: 'email' | 'otp' | 'sms' | 'ga_setup' | 'completed' | 'blocked'
  email?: string
  user?: User
  attempts: number
  maxAttempts: number
  blockedUntil?: number
  blockReason?: string
  requiredSteps?: AuthStepType[]  // 현재 정책에 따른 필요한 단계들
  currentStepIndex?: number       // 현재 진행 중인 단계의 인덱스
  isFirstTimeUser?: boolean       // 신규 사용자 여부
  skipOTP?: boolean              // OTP 단계 스킵 여부
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  authStep: AuthStep
  login: (email: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  verifySms: (code: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  sendSms: () => Promise<{ success: boolean; message?: string }>
  completeGASetup: () => void
  logout: () => void
  resetAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 쿨다운 기간 계산 (점진적 증가: 30초, 1분, 5분, 15분, 1시간)
const getCooldownDuration = (attemptCount: number): number => {
  const durations = [30, 60, 300, 900, 3600] // 초 단위
  const index = Math.min(attemptCount - 5, durations.length - 1)
  return durations[index] * 1000 // 밀리초로 변환
}

// localStorage에서 시도 기록 가져오기
const getStoredAttempts = (email: string) => {
  try {
    const stored = localStorage.getItem(`login_attempts_${email}`)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    // localStorage 에러 시 무시
  }
  return { count: 0, lastAttempt: 0, blockedUntil: 0 }
}

// localStorage에 시도 기록 저장
const setStoredAttempts = (email: string, count: number, blockedUntil: number = 0) => {
  try {
    const data = {
      count,
      lastAttempt: Date.now(),
      blockedUntil
    }
    localStorage.setItem(`login_attempts_${email}`, JSON.stringify(data))
  } catch (error) {
    // localStorage 에러 시 무시
  }
}

// 차단 상태 확인
const checkBlockStatus = (email: string) => {
  const stored = getStoredAttempts(email)
  const now = Date.now()

  if (stored.blockedUntil > now) {
    return {
      isBlocked: true,
      remainingTime: stored.blockedUntil - now,
      totalAttempts: stored.count
    }
  }

  return { isBlocked: false, remainingTime: 0, totalAttempts: stored.count }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { policy, getRequiredAuthSteps, getSessionTimeoutMs, isFirstTimeUser } = useSecurityPolicy()

  // UI/UX 기획을 위해 더미 사용자 데이터 설정
  const dummyUser: User = {
    id: 'dummy-user-1',
    name: '관리자',
    email: 'admin@company.com',
    department: 'IT 보안팀',
    position: '관리자',
    phone: '010-1234-5678',
    role: 'admin',
    status: 'active',
    permissions: ['permission.all'],
    lastLogin: new Date().toISOString(),
    hasGASetup: true,
    gaSetupDate: '2025-09-10T14:20:00Z',
    isFirstLogin: false
  }

  const [user, setUser] = useState<User | null>(dummyUser)
  const [isAuthenticated, setIsAuthenticated] = useState(true) // 항상 인증된 상태
  const [authStep, setAuthStep] = useState<AuthStep>({
    step: 'email', // UI/UX 확인을 위해 이메일 단계부터 시작
    attempts: 0,
    maxAttempts: policy.maxAttempts,
    requiredSteps: getRequiredAuthSteps(),
    currentStepIndex: 0
  })

  // 다음 단계 결정 함수
  const getNextStep = (currentIndex: number, requiredSteps: AuthStepType[]): AuthStepType | 'completed' => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= requiredSteps.length) {
      return 'completed'
    }
    return requiredSteps[nextIndex]
  }

  // 현재 단계가 필요한지 확인
  const isStepRequired = (step: AuthStepType): boolean => {
    return authStep.requiredSteps?.includes(step) || false
  }

  // 정책 변경 시 authStep 업데이트
  useEffect(() => {
    const requiredSteps = getRequiredAuthSteps()
    setAuthStep(prev => ({
      ...prev,
      maxAttempts: policy.maxAttempts,
      requiredSteps,
      // 현재 단계가 더 이상 필요하지 않으면 다음 단계로 이동
      step: requiredSteps.includes(prev.step as AuthStepType) ? prev.step : requiredSteps[0] || 'email',
      currentStepIndex: requiredSteps.findIndex(step => step === prev.step) !== -1
        ? requiredSteps.findIndex(step => step === prev.step)
        : 0
    }))
  }, [policy, getRequiredAuthSteps])

  // UI/UX 기획을 위해 세션 체크 비활성화
  useEffect(() => {
    // 세션 체크 로직 제거 - 항상 인증된 상태 유지
  }, [])

  const login = async (email: string): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
    // 차단 상태 확인
    const blockStatus = checkBlockStatus(email)

    if (blockStatus.isBlocked) {
      const blockedUntil = Date.now() + blockStatus.remainingTime
      const reason = '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
    }

    // 기존 시도 횟수 확인
    if (authStep.attempts >= authStep.maxAttempts) {
      const totalAttempts = blockStatus.totalAttempts + 1
      const cooldownDuration = getCooldownDuration(totalAttempts)
      const blockedUntil = Date.now() + cooldownDuration

      // localStorage에 차단 정보 저장
      setStoredAttempts(email, totalAttempts, blockedUntil)

      const reason = '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
    }

    const foundUser = getUserByEmail(email)
    if (!foundUser) {
      const newAttempts = authStep.attempts + 1
      const newTotalAttempts = blockStatus.totalAttempts + 1

      setAuthStep(prev => ({ ...prev, attempts: newAttempts }))

      // 실패 시 localStorage에도 기록
      setStoredAttempts(email, newTotalAttempts)

      // 5회 실패 시 즉시 차단 처리
      if (newAttempts >= authStep.maxAttempts) {
        const cooldownDuration = getCooldownDuration(newTotalAttempts)
        const blockedUntil = Date.now() + cooldownDuration

        // localStorage에 차단 정보 저장
        setStoredAttempts(email, newTotalAttempts, blockedUntil)

        const reason = '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

        return {
          success: false,
          message: '차단 페이지로 이동합니다.',
          isBlocked: true,
          blockedUntil,
          blockReason: reason
        }
      }

      return { success: false, message: '등록되지 않은 이메일입니다.' }
    }

    if (foundUser.status !== 'active') {
      return { success: false, message: '비활성화된 계정입니다.' }
    }

    // 성공 시 저장된 실패 기록 초기화
    setStoredAttempts(email, 0)

    // 신규 사용자인지 확인하고 적절한 인증 단계 결정
    const isNewUser = isFirstTimeUser(foundUser)
    const requiredSteps = getRequiredAuthSteps(foundUser)
    const nextStep = getNextStep(0, requiredSteps)

    if (nextStep === 'completed') {
      // 이메일만 필요한 경우 바로 완료
      setUser(foundUser)
      setIsAuthenticated(true)
      setAuthStep({
        step: 'completed',
        user: foundUser,
        attempts: 0,
        maxAttempts: policy.maxAttempts,
        requiredSteps,
        currentStepIndex: requiredSteps.length
      })

      // 세션 저장
      const sessionTimeout = getSessionTimeoutMs()
      const sessionData = {
        user: foundUser,
        timestamp: Date.now()
      }

      localStorage.setItem('auth_session', JSON.stringify(sessionData))
      document.cookie = `auth_session=${JSON.stringify(sessionData)}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

      router.push('/overview')
      return { success: true, message: '로그인에 성공했습니다.' }
    }

    setAuthStep({
      step: nextStep as 'otp' | 'sms',
      email,
      user: foundUser,
      attempts: 0,
      maxAttempts: policy.maxAttempts,
      requiredSteps,
      currentStepIndex: 1,
      isFirstTimeUser: isNewUser,
      skipOTP: isNewUser
    })

    const stepMessage = nextStep === 'otp' ? 'OTP 코드를 입력해주세요.' : 'SMS 인증 코드를 입력해주세요.'
    return { success: true, message: stepMessage }
  }

  const verifyOtp = async (otp: string): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
    if (!authStep.user || authStep.step !== 'otp') {
      return { success: false, message: '잘못된 접근입니다.' }
    }

    if (authStep.attempts >= authStep.maxAttempts) {
      const email = authStep.email || authStep.user.email
      const totalAttempts = getStoredAttempts(email).count + 1
      const cooldownDuration = getCooldownDuration(totalAttempts)
      const blockedUntil = Date.now() + cooldownDuration

      // localStorage에 차단 정보 저장
      setStoredAttempts(email, totalAttempts, blockedUntil)

      const reason = 'OTP 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
    }

    try {
      const isValid = await verifyOTP(otp, 'login-session')

      if (isValid) {
        // 다음 단계 결정
        const nextStep = getNextStep(authStep.currentStepIndex || 0, authStep.requiredSteps || [])

        if (nextStep === 'completed') {
          // OTP가 마지막 단계인 경우
          setUser(authStep.user)
          setIsAuthenticated(true)
          setAuthStep(prev => ({
            ...prev,
            step: 'completed',
            attempts: 0,
            currentStepIndex: (prev.requiredSteps?.length || 0)
          }))

          // 세션 저장
          const sessionTimeout = getSessionTimeoutMs()
          const sessionData = {
            user: authStep.user,
            timestamp: Date.now()
          }

          localStorage.setItem('auth_session', JSON.stringify(sessionData))
          document.cookie = `auth_session=${JSON.stringify(sessionData)}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

          router.push('/overview')
          return { success: true, message: '로그인에 성공했습니다.' }
        }

        setAuthStep(prev => ({
          ...prev,
          step: nextStep as 'sms',
          attempts: 0,
          currentStepIndex: (prev.currentStepIndex || 0) + 1
        }))

        const stepMessage = nextStep === 'sms' ? 'SMS 인증 코드를 발송했습니다.' : '다음 단계로 진행합니다.'
        return { success: true, message: stepMessage }
      } else {
        const newAttempts = authStep.attempts + 1
        setAuthStep(prev => ({ ...prev, attempts: newAttempts }))

        // 5회 실패 시 즉시 차단 처리
        if (newAttempts >= authStep.maxAttempts) {
          const email = authStep.email || authStep.user.email
          const totalAttempts = getStoredAttempts(email).count + 1
          const cooldownDuration = getCooldownDuration(totalAttempts)
          const blockedUntil = Date.now() + cooldownDuration

          // localStorage에 차단 정보 저장
          setStoredAttempts(email, totalAttempts, blockedUntil)

          const reason = 'OTP 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

          return {
            success: false,
            message: '차단 페이지로 이동합니다.',
            isBlocked: true,
            blockedUntil,
            blockReason: reason
          }
        }

        return { success: false, message: '올바르지 않은 OTP 코드입니다.' }
      }
    } catch (error) {
      return { success: false, message: 'OTP 인증 중 오류가 발생했습니다.' }
    }
  }

  const sendSms = async (): Promise<{ success: boolean; message?: string }> => {
    if (!authStep.user?.phone) {
      return { success: false, message: '전화번호가 등록되지 않았습니다.' }
    }

    try {
      const result = await sendSMSCode(authStep.user.phone, 'login-session')
      if (result.success) {
        return { success: true, message: `${authStep.user.phone}로 인증 코드를 발송했습니다.` }
      } else {
        return { success: false, message: 'SMS 발송에 실패했습니다.' }
      }
    } catch (error) {
      return { success: false, message: 'SMS 발송 중 오류가 발생했습니다.' }
    }
  }

  const verifySms = async (code: string): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
    if (!authStep.user || authStep.step !== 'sms') {
      return { success: false, message: '잘못된 접근입니다.' }
    }

    if (authStep.attempts >= authStep.maxAttempts) {
      const email = authStep.email || authStep.user.email
      const totalAttempts = getStoredAttempts(email).count + 1
      const cooldownDuration = getCooldownDuration(totalAttempts)
      const blockedUntil = Date.now() + cooldownDuration

      // localStorage에 차단 정보 저장
      setStoredAttempts(email, totalAttempts, blockedUntil)

      const reason = 'SMS 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

      return {
        success: false,
        message: '차단 페이지로 이동합니다.',
        isBlocked: true,
        blockedUntil,
        blockReason: reason
      }
    }

    try {
      const isValid = await verifySMSCode(code, 'login-session')

      if (isValid) {
        // 신규 사용자인 경우 GA 설정 단계로 이동
        if (authStep.isFirstTimeUser && !authStep.user.hasGASetup) {
          setAuthStep({
            step: 'ga_setup',
            user: authStep.user,
            attempts: 0,
            maxAttempts: 5,
            isFirstTimeUser: true
          })

          return { success: true, message: 'Google Authenticator 설정이 필요합니다.' }
        }

        // 기존 사용자 - 로그인 성공
        setUser(authStep.user)
        setIsAuthenticated(true)
        setAuthStep({
          step: 'completed',
          user: authStep.user,
          attempts: 0,
          maxAttempts: 5
        })

        // 세션 저장 (정책 기반 타임아웃)
        const sessionTimeout = getSessionTimeoutMs()
        const sessionData = {
          user: authStep.user,
          timestamp: Date.now()
        }

        localStorage.setItem('auth_session', JSON.stringify(sessionData))

        // 쿠키에도 저장 (middleware에서 사용)
        document.cookie = `auth_session=${JSON.stringify(sessionData)}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

        // 로그인 성공 후 overview로 이동
        router.push('/overview')

        return { success: true, message: '로그인에 성공했습니다.' }
      } else {
        const newAttempts = authStep.attempts + 1
        setAuthStep(prev => ({ ...prev, attempts: newAttempts }))

        // 5회 실패 시 즉시 차단 처리
        if (newAttempts >= authStep.maxAttempts) {
          const email = authStep.email || authStep.user.email
          const totalAttempts = getStoredAttempts(email).count + 1
          const cooldownDuration = getCooldownDuration(totalAttempts)
          const blockedUntil = Date.now() + cooldownDuration

          // localStorage에 차단 정보 저장
          setStoredAttempts(email, totalAttempts, blockedUntil)

          const reason = 'SMS 시도 횟수 초과로 인해 일시적으로 차단되었습니다'

          return {
            success: false,
            message: '차단 페이지로 이동합니다.',
            isBlocked: true,
            blockedUntil,
            blockReason: reason
          }
        }

        return { success: false, message: '올바르지 않은 인증 코드입니다.' }
      }
    } catch (error) {
      return { success: false, message: 'SMS 인증 중 오류가 발생했습니다.' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setAuthStep({
      step: 'email',
      attempts: 0,
      maxAttempts: 5
    })
    localStorage.removeItem('auth_session')

    // 쿠키도 삭제
    document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    router.push('/login')
  }

  const resetAuth = () => {
    const requiredSteps = getRequiredAuthSteps()
    setAuthStep({
      step: 'email',
      attempts: 0,
      maxAttempts: policy.maxAttempts,
      requiredSteps,
      currentStepIndex: 0
    })
  }

  const completeGASetup = () => {
    if (!authStep.user) return

    // 사용자 GA 설정 상태 업데이트 (실제로는 서버 API 호출)
    const updatedUser = {
      ...authStep.user,
      hasGASetup: true,
      gaSetupDate: new Date().toISOString(),
      isFirstLogin: false
    }

    // 로그인 완료 처리
    setUser(updatedUser)
    setIsAuthenticated(true)
    setAuthStep({
      step: 'completed',
      user: updatedUser,
      attempts: 0,
      maxAttempts: 5
    })

    // 세션 저장
    const sessionTimeout = getSessionTimeoutMs()
    const sessionData = {
      user: updatedUser,
      timestamp: Date.now()
    }

    localStorage.setItem('auth_session', JSON.stringify(sessionData))
    document.cookie = `auth_session=${JSON.stringify(sessionData)}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

    // 대시보드로 이동
    router.push('/overview')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        authStep,
        login,
        verifyOtp,
        verifySms,
        sendSms,
        completeGASetup,
        logout,
        resetAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth는 AuthProvider 내에서 사용되어야 합니다.')
  }
  return context
}