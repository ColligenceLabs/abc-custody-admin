'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/types/user'
import { getUserByEmail } from '@/data/userMockData'
import { getIndividualUserByEmail } from '@/data/individualUserMockData'
import { getOrganizationUserByEmail } from '@/data/organizationUserMockData'
import { verifyOTP, verifySMSCode, sendSMSCode } from '@/utils/authenticationHelpers'
import {
  verifyEmail as verifyEmailAPI,
  verifyOtpBackend,
  getCurrentUserWithToken,
  sendEmailPin,
  verifyEmailPinLogin,
  verifyEmailPinSignup
} from '@/lib/api/auth'
import { useSecurityPolicy, AuthStepType } from '@/contexts/SecurityPolicyContext'
import { useServicePlan } from '@/contexts/ServicePlanContext'

interface AuthStep {
  step: 'email' | 'otp' | 'sms' | 'ga_setup' | 'completed' | 'blocked'
  email?: string
  user?: User
  memberType?: 'individual' | 'corporate'  // 회원 유형
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
  isLoading: boolean
  authStep: AuthStep
  login: (email: string, memberType: 'individual' | 'corporate') => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  verifyOtp: (otp: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  verifySms: (code: string) => Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }>
  sendSms: () => Promise<{ success: boolean; message?: string }>
  completeGASetup: (secretKey: string) => Promise<void>
  logout: () => void
  resetAuth: () => void
  sendEmailPinCode: (email: string) => Promise<{ success: boolean; message?: string; expiresIn?: number }>
  verifyEmailPin: (email: string, pinCode: string, memberType: 'individual' | 'corporate', isSignup?: boolean) => Promise<{ success: boolean; message?: string; user?: any }>
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
  const { setSelectedPlan } = useServicePlan()

  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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

  // 세션 체크 및 복구 (JWT 토큰 기반)
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true)
      try {
        // localStorage에서 토큰 확인
        const token = localStorage.getItem('token')
        const sessionData = localStorage.getItem('auth_session')

        if (token && sessionData) {
          const { user: savedUser, timestamp, token: savedToken } = JSON.parse(sessionData)
          const sessionTimeout = getSessionTimeoutMs()

          // 세션이 유효한지 확인
          if (Date.now() - timestamp < sessionTimeout) {
            // JWT 토큰으로 사용자 정보 재확인 (선택적)
            try {
              const verifiedUser = await getCurrentUserWithToken(token)
              setUser(verifiedUser)
              setIsAuthenticated(true)
              setSelectedPlan(verifiedUser.memberType === 'individual' ? 'individual' : 'enterprise')
              setIsLoading(false)
              return
            } catch (error: any) {
              // 토큰이 만료되었거나 유효하지 않음
              if (error.message === 'UNAUTHORIZED') {
                console.log('토큰이 만료되었습니다. 다시 로그인하세요.')
                localStorage.removeItem('token')
                localStorage.removeItem('auth_session')
                localStorage.removeItem('user')
              } else {
                // 네트워크 오류 등 - 저장된 세션 사용
                setUser(savedUser)
                setIsAuthenticated(true)
                setSelectedPlan(savedUser.memberType === 'individual' ? 'individual' : 'enterprise')
                setIsLoading(false)
                return
              }
            }
          }
        }

        // 세션이 없거나 만료된 경우
        setUser(null)
        setIsAuthenticated(false)
      } catch (error) {
        console.error('세션 체크 실패:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [getSessionTimeoutMs, setSelectedPlan])

  const login = async (email: string, memberType: 'individual' | 'corporate'): Promise<{ success: boolean; message?: string; isBlocked?: boolean; blockedUntil?: number; blockReason?: string }> => {
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

    // 백엔드 API에서 사용자 조회
    let foundUser: User | undefined
    try {
      const result = await verifyEmailAPI(email, memberType)
      if (result.success && result.user) {
        foundUser = {
          ...result.user,
          role: 'viewer' as const,
          status: 'active' as any,
          lastLogin: new Date().toISOString(),
          permissions: [],
          department: memberType === 'individual' ? '개인' : '법인',
          position: memberType === 'individual' ? '개인 회원' : '법인 회원',
          hasGASetup: result.user.hasGASetup,
          isFirstLogin: result.user.isFirstLogin,
          memberType
        } as User
      }
    } catch (error) {
      console.error('사용자 조회 실패:', error)
      // API 호출 실패 시 fallback으로 mock 데이터 사용
      if (memberType === 'individual') {
        const individualUser = getIndividualUserByEmail(email)
        if (individualUser) {
          foundUser = {
            id: individualUser.id,
            name: individualUser.name,
            email: individualUser.email,
            phone: individualUser.phone,
            role: 'viewer' as const,
            status: individualUser.status as any,
            lastLogin: individualUser.lastLogin,
            permissions: individualUser.permissions || [],
            department: '개인',
            position: '개인 회원',
            hasGASetup: individualUser.hasGASetup,
            gaSetupDate: individualUser.gaSetupDate,
            isFirstLogin: individualUser.isFirstLogin,
            memberType: 'individual'
          }
        }
      } else {
        const organizationUser = getOrganizationUserByEmail(email)
        if (organizationUser) {
          foundUser = { ...organizationUser, memberType: 'corporate' } as User
        }
      }
    }

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
      const userWithMemberType = { ...foundUser, memberType }
      setUser(userWithMemberType)
      setIsAuthenticated(true)
      setAuthStep({
        step: 'completed',
        user: userWithMemberType,
        memberType,
        attempts: 0,
        maxAttempts: policy.maxAttempts,
        requiredSteps,
        currentStepIndex: requiredSteps.length
      })

      // ServicePlan 설정
      setSelectedPlan(memberType === 'individual' ? 'individual' : 'enterprise')

      // 세션 저장
      const sessionTimeout = getSessionTimeoutMs()
      const sessionData = {
        user: userWithMemberType,
        timestamp: Date.now()
      }

      localStorage.setItem('auth_session', JSON.stringify(sessionData))
      document.cookie = `auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

      router.push('/overview')
      return { success: true, message: '로그인에 성공했습니다.' }
    }

    setAuthStep({
      step: nextStep as 'otp' | 'sms',
      email,
      user: foundUser,
      memberType,
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
      // 백엔드 API로 OTP 검증
      const result = await verifyOtpBackend(
        authStep.email || authStep.user.email,
        authStep.memberType!,
        otp
      )

      if (result.success && result.token) {
        // JWT 토큰 저장
        localStorage.setItem('token', result.token)
        localStorage.setItem('user', JSON.stringify(result.user))
        // 다음 단계 결정
        const nextStep = getNextStep(authStep.currentStepIndex || 0, authStep.requiredSteps || [])

        if (nextStep === 'completed') {
          // OTP가 마지막 단계인 경우 - 로그인 완료
          const userWithMemberType = { ...result.user!, memberType: authStep.memberType }
          setUser(userWithMemberType)
          setIsAuthenticated(true)
          setAuthStep(prev => ({
            ...prev,
            step: 'completed',
            user: userWithMemberType,
            attempts: 0,
            currentStepIndex: (prev.requiredSteps?.length || 0)
          }))

          // ServicePlan 설정
          setSelectedPlan(authStep.memberType === 'individual' ? 'individual' : 'enterprise')

          // 세션 저장 (JWT 토큰 기반)
          const sessionTimeout = getSessionTimeoutMs()
          const sessionData = {
            user: userWithMemberType,
            timestamp: Date.now(),
            token: result.token
          }

          localStorage.setItem('auth_session', JSON.stringify(sessionData))
          document.cookie = `auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

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
        // 백엔드에서 OTP 검증 실패
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

        return { success: false, message: result.message || '올바르지 않은 OTP 코드입니다.' }
      }
    } catch (error: any) {
      console.error('OTP 검증 오류:', error)
      return { success: false, message: error.message || 'OTP 인증 중 오류가 발생했습니다.' }
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
            memberType: authStep.memberType,
            attempts: 0,
            maxAttempts: 5,
            isFirstTimeUser: true
          })

          return { success: true, message: 'Google Authenticator 설정이 필요합니다.' }
        }

        // 기존 사용자 - 로그인 성공
        const userWithMemberType = { ...authStep.user, memberType: authStep.memberType }
        setUser(userWithMemberType)
        setIsAuthenticated(true)
        setAuthStep({
          step: 'completed',
          user: userWithMemberType,
          attempts: 0,
          maxAttempts: 5
        })

        // ServicePlan 설정
        setSelectedPlan(authStep.memberType === 'individual' ? 'individual' : 'enterprise')

        // 세션 저장 (정책 기반 타임아웃)
        const sessionTimeout = getSessionTimeoutMs()
        const sessionData = {
          user: userWithMemberType,
          timestamp: Date.now()
        }

        localStorage.setItem('auth_session', JSON.stringify(sessionData))

        // 쿠키에도 저장 (middleware에서 사용)
        document.cookie = `auth_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

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

    // JWT 토큰 및 세션 정보 삭제
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('auth_session')

    // 쿠키도 삭제
    document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

    router.push('/login')
  }

  // 세션 timestamp 갱신 (활동 기반 세션 유지)
  const updateSessionTimestamp = useCallback(() => {
    const token = localStorage.getItem('token')
    const sessionData = localStorage.getItem('auth_session')

    if (sessionData && token && isAuthenticated) {
      try {
        const session = JSON.parse(sessionData)
        const updatedSession = {
          ...session,
          timestamp: Date.now() // 현재 시각으로 갱신
        }

        localStorage.setItem('auth_session', JSON.stringify(updatedSession))

        const sessionTimeout = getSessionTimeoutMs()
        document.cookie = `auth_session=${encodeURIComponent(JSON.stringify(updatedSession))}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`
      } catch (error) {
        console.error('세션 갱신 실패:', error)
      }
    }
  }, [getSessionTimeoutMs, isAuthenticated])

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

  const sendEmailPinCode = async (email: string): Promise<{ success: boolean; message?: string; expiresIn?: number }> => {
    try {
      const result = await sendEmailPin(email)
      return result
    } catch (error: any) {
      console.error('이메일 PIN 전송 오류:', error)
      return {
        success: false,
        message: error.message || 'PIN 코드 전송 중 오류가 발생했습니다.'
      }
    }
  }

  const verifyEmailPin = async (
    email: string,
    pinCode: string,
    memberType: 'individual' | 'corporate',
    isSignup: boolean = false
  ): Promise<{ success: boolean; message?: string; user?: any }> => {
    try {
      if (isSignup) {
        // 회원가입용 - PIN만 검증
        const result = await verifyEmailPinSignup(email, pinCode)
        return {
          success: result.success,
          message: result.message
        }
      } else {
        // 로그인용 - PIN 검증 + 계정 확인
        const result = await verifyEmailPinLogin(email, pinCode, memberType)
        return {
          success: result.success,
          message: result.message,
          user: result.user
        }
      }
    } catch (error: any) {
      console.error('이메일 PIN 검증 오류:', error)
      return {
        success: false,
        message: error.message || 'PIN 코드 검증 중 오류가 발생했습니다.'
      }
    }
  }

  const completeGASetup = async (secretKey: string) => {
    if (!authStep.user) return

    // memberType 결정 (authStep 또는 user 객체에서)
    const memberType = authStep.memberType || (authStep.user as any).memberType || 'individual'

    console.log('completeGASetup 호출됨:', {
      userId: authStep.user.id,
      email: authStep.user.email,
      memberType,
      secretKey: secretKey.substring(0, 10) + '...'
    })

    // 백엔드 API로 GA 설정 완료 및 JWT 토큰 발급
    try {
      const response = await fetch(`http://localhost:4000/api/auth/complete-ga-setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authStep.user.id,
          secretKey,
          memberType
        })
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('GA 설정 완료 실패:', response.status, data)
        throw new Error(data.message || 'GA 설정 완료에 실패했습니다.')
      }

      console.log('GA 설정 완료 성공:', data)

      // JWT 토큰 저장
      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      // 사용자 정보 업데이트
      const updatedUser = {
        ...authStep.user,
        ...data.user,
        memberType
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

      // ServicePlan 설정
      setSelectedPlan(memberType === 'individual' ? 'individual' : 'enterprise')

      // 세션 저장 (JWT 토큰 포함)
      const sessionTimeout = getSessionTimeoutMs()
      const sessionData = {
        user: updatedUser,
        timestamp: Date.now(),
        token: data.token
      }

      localStorage.setItem('auth_session', JSON.stringify(sessionData))
      document.cookie = `auth_session=${JSON.stringify(sessionData)}; path=/; max-age=${sessionTimeout / 1000}; SameSite=Lax`

      // 대시보드로 이동
      router.push('/overview')
    } catch (error: any) {
      console.error('GA 설정 완료 오류:', error)
      alert(error.message || 'GA 설정 완료 중 오류가 발생했습니다.')
    }
  }

  // 사용자 활동 감지 및 세션 갱신 (throttle 적용)
  useEffect(() => {
    if (!isAuthenticated) return

    let throttleTimer: NodeJS.Timeout | null = null
    const THROTTLE_INTERVAL = 60000 // 1분마다만 갱신 (과도한 갱신 방지)

    const handleActivity = () => {
      if (!throttleTimer) {
        updateSessionTimestamp()
        throttleTimer = setTimeout(() => {
          throttleTimer = null
        }, THROTTLE_INTERVAL)
      }
    }

    // 사용자 활동 이벤트 감지
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('click', handleActivity)
    window.addEventListener('scroll', handleActivity)

    return () => {
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('click', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      if (throttleTimer) clearTimeout(throttleTimer)
    }
  }, [isAuthenticated, updateSessionTimestamp])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        authStep,
        login,
        verifyOtp,
        verifySms,
        sendSms,
        completeGASetup,
        logout,
        resetAuth,
        sendEmailPinCode,
        verifyEmailPin
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