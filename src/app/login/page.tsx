'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useSecurityPolicy, AuthStepType } from '@/contexts/SecurityPolicyContext'
import {
  ArrowRightIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import AttemptLimitMessage from '@/components/auth/AttemptLimitMessage'
import GASetupModal from '@/components/auth/GASetupModal'

export default function LoginPage() {
  const router = useRouter()
  const { authStep, login, verifyOtp, verifySms, sendSms, resetAuth, completeGASetup } = useAuth()
  const { getRequiredAuthSteps } = useSecurityPolicy()
  const [email, setEmail] = useState('ceo@company.com')
  const [otpCode, setOtpCode] = useState('123456')
  const [smsCode, setSmsCode] = useState('987654')
  const [loading, setLoading] = useState(false)
  const [smsLoading, setSmsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [otpResendCooldown, setOtpResendCooldown] = useState(0)

  // SMS 자동 발송 (OTP 단계 완료 후)
  useEffect(() => {
    if (authStep.step === 'sms' && authStep.user) {
      handleSendSms()
    }
  }, [authStep.step])

  // OTP 재발송 쿨다운 타이머
  useEffect(() => {
    if (otpResendCooldown > 0) {
      const timer = setTimeout(() => {
        setOtpResendCooldown(otpResendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [otpResendCooldown])


  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await login(email)
    if (result.success) {
      setMessage({ type: 'success', text: result.message || '' })
    } else {
      // 차단 상태인 경우 blocked 페이지로 이동
      if (result.isBlocked && result.blockedUntil && result.blockReason) {
        console.log('차단 상태 감지:', result)
        setLoading(false)

        // localStorage에 차단 정보 임시 저장 (이메일도 포함)
        localStorage.setItem('blocked_info', JSON.stringify({
          until: result.blockedUntil,
          reason: result.blockReason,
          email: email
        }))

        // 깔끔한 URL로 이동
        router.push('/login/blocked')
        return
      }
      setMessage({ type: 'error', text: result.message || '' })
    }
    setLoading(false)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await verifyOtp(otpCode)
    if (result.success) {
      setMessage({ type: 'success', text: result.message || '' })
    } else {
      // 차단 상태인 경우 blocked 페이지로 이동
      if (result.isBlocked && result.blockedUntil && result.blockReason) {
        console.log('OTP 차단 상태 감지:', result)
        setLoading(false)

        // localStorage에 차단 정보 임시 저장 (이메일도 포함)
        localStorage.setItem('blocked_info', JSON.stringify({
          until: result.blockedUntil,
          reason: result.blockReason,
          email: authStep.email || authStep.user?.email
        }))

        // 깔끔한 URL로 이동
        router.push('/login/blocked')
        return
      }
      setMessage({ type: 'error', text: result.message || '' })
    }
    setLoading(false)
  }

  const handleSmsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const result = await verifySms(smsCode)
    if (result.success) {
      setMessage({ type: 'success', text: result.message || '' })
    } else {
      // 차단 상태인 경우 blocked 페이지로 이동
      if (result.isBlocked && result.blockedUntil && result.blockReason) {
        console.log('SMS 차단 상태 감지:', result)
        setLoading(false)

        // localStorage에 차단 정보 임시 저장 (이메일도 포함)
        localStorage.setItem('blocked_info', JSON.stringify({
          until: result.blockedUntil,
          reason: result.blockReason,
          email: authStep.email || authStep.user?.email
        }))

        // 깔끔한 URL로 이동
        router.push('/login/blocked')
        return
      }
      setMessage({ type: 'error', text: result.message || '' })
    }
    setLoading(false)
  }

  const handleSendSms = async () => {
    setSmsLoading(true)
    const result = await sendSms()
    if (result.success) {
      setMessage({ type: 'success', text: result.message || '' })
      setOtpResendCooldown(60) // 1분 쿨다운
    } else {
      setMessage({ type: 'error', text: result.message || '' })
    }
    setSmsLoading(false)
  }

  const renderStepIndicator = () => {
    const requiredSteps = authStep.requiredSteps || getRequiredAuthSteps()

    const stepConfig = {
      email: { label: '이메일', icon: EnvelopeIcon },
      otp: { label: 'OTP 인증', icon: KeyIcon },
      sms: { label: 'SMS 인증', icon: DevicePhoneMobileIcon },
    }

    const steps = requiredSteps.map(stepKey => ({
      key: stepKey,
      ...stepConfig[stepKey]
    }))

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const currentStepIndex = requiredSteps.findIndex(s => s === authStep.step)
          const isActive = authStep.step === step.key
          const isCompleted = currentStepIndex > index
          const Icon = step.icon

          return (
            <div key={step.key} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                isCompleted
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : isActive
                    ? 'border-primary-600 text-primary-600 bg-primary-50'
                    : 'border-gray-300 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircleIcon className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-primary-600' : isCompleted ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <ArrowRightIcon className="w-4 h-4 text-gray-300 mx-4" />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMessage = () => {
    if (!message) return null

    return (
      <div className={`mb-4 p-4 rounded-lg border ${
        message.type === 'success'
          ? 'bg-primary-50 border-primary-200 text-primary-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center">
          {message.type === 'success' ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">로그인</h1>
          <p className="mt-2 text-gray-600">관리자 계정으로 로그인하세요</p>
        </div>

        {/* 단계 표시기 */}
        {renderStepIndicator()}

        {/* 메시지 */}
        {renderMessage()}

        {/* 로그인 폼 */}
        {authStep.step !== 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* 이메일 단계 */}
            {authStep.step === 'email' && (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <EnvelopeIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">이메일 확인</h2>
                <p className="text-gray-600 mt-1">등록된 이메일 주소를 입력하세요</p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일 주소
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your-email@company.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {loading ? '확인 중...' : '다음 단계'}
                </button>

                <div className="text-center mt-4">
                  <AttemptLimitMessage
                    isLimitExceeded={false}
                    currentAttempts={authStep.attempts}
                    maxAttempts={authStep.maxAttempts}
                  />
                </div>
              </form>
            </>
          )}

          {/* OTP 단계 */}
          {authStep.step === 'otp' && (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <KeyIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">OTP 인증</h2>
                <p className="text-gray-600 mt-1">Google Authenticator 앱에서 6자리 코드를 입력하세요</p>
                <p className="text-sm text-gray-500 mt-2">사용자: {authStep.user?.name}</p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP 코드
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl font-mono tracking-widest"
                    placeholder="123456"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length !== 6}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {loading ? '인증 중...' : 'OTP 인증'}
                </button>

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={resetAuth}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    이메일 다시 입력
                  </button>
                </div>

                <div className="text-center mt-4">
                  <AttemptLimitMessage
                    isLimitExceeded={false}
                    currentAttempts={authStep.attempts}
                    maxAttempts={authStep.maxAttempts}
                  />
                </div>

              </form>
            </>
          )}

          {/* SMS 단계 */}
          {authStep.step === 'sms' && (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <DevicePhoneMobileIcon className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">SMS 인증</h2>
                <p className="text-gray-600 mt-1">등록된 휴대폰으로 발송된 6자리 코드를 입력하세요</p>
                <p className="text-sm text-gray-500 mt-2">
                  {authStep.user?.phone}
                </p>
              </div>

              <form onSubmit={handleSmsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SMS 인증 코드
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-2xl font-mono tracking-widest"
                    placeholder="987654"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || smsCode.length !== 6}
                  className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {loading ? '인증 중...' : '로그인 완료'}
                </button>

                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={otpResendCooldown > 0 || smsLoading}
                    className="text-sm text-primary-600 hover:text-primary-700 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {smsLoading && (
                      <div className="w-3 h-3 border border-primary-600 border-t-transparent rounded-full animate-spin mr-1" />
                    )}
                    {otpResendCooldown > 0 ? `재발송 (${otpResendCooldown}초)` : smsLoading ? '발송 중...' : 'SMS 재발송'}
                  </button>
                </div>

                <div className="text-center mt-4">
                  <AttemptLimitMessage
                    isLimitExceeded={false}
                    currentAttempts={authStep.attempts}
                    maxAttempts={authStep.maxAttempts}
                  />
                </div>

              </form>
            </>
          )}
          </div>
        )}

        {/* 로그인 완료 상태 */}
        {authStep.step === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">로그인 완료</h2>
            <p className="text-gray-600 mb-4">잠시만 기다려주세요...</p>
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}

        {/* 도움말 */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            아직 회원이 아니신가요?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-primary-600 hover:text-primary-700"
            >
              회원가입
            </button>
          </p>
        </div>

      </div>

      {/* GA 설정 모달 */}
      <GASetupModal
        isOpen={authStep.step === 'ga_setup'}
        user={{
          name: authStep.user?.name || '',
          email: authStep.user?.email || ''
        }}
        onComplete={completeGASetup}
      />
    </div>
  )
}