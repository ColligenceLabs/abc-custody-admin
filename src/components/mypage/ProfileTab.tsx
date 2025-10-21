'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export default function ProfileTab() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [emailValidation, setEmailValidation] = useState<{
    isChecking: boolean
    isValid: boolean | null
    message: string
  }>({
    isChecking: false,
    isValid: null,
    message: ''
  })

  const [emailVerification, setEmailVerification] = useState<{
    sent: boolean
    verified: boolean
    code: string
    expiresAt: string | null
    timeLeft: number
    isSending: boolean
    isVerifying: boolean
    verifiedEmail: string | null
  }>({
    sent: false,
    verified: false,
    code: '',
    expiresAt: null,
    timeLeft: 0,
    isSending: false,
    isVerifying: false,
    verifiedEmail: null
  })

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  // 타이머 효과
  useEffect(() => {
    if (emailVerification.sent && emailVerification.expiresAt) {
      const timer = setInterval(() => {
        const now = new Date().getTime()
        const expireTime = new Date(emailVerification.expiresAt!).getTime()
        const diff = expireTime - now

        if (diff <= 0) {
          setEmailVerification(prev => ({ ...prev, timeLeft: 0, sent: false }))
          clearInterval(timer)
        } else {
          setEmailVerification(prev => ({ ...prev, timeLeft: Math.floor(diff / 1000) }))
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [emailVerification.sent, emailVerification.expiresAt])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // 이메일 변경 시 검증 상태 초기화
    if (field === 'email') {
      setEmailValidation({
        isChecking: false,
        isValid: null,
        message: ''
      })
      setEmailVerification({
        sent: false,
        verified: false,
        code: '',
        expiresAt: null,
        timeLeft: 0,
        isSending: false,
        isVerifying: false,
        verifiedEmail: null
      })
    }
  }

  // 인증 코드 발송
  const handleSendVerificationCode = async () => {
    try {
      setEmailVerification(prev => ({ ...prev, isSending: true }))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/users/me/email/send-verification?userId=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || '인증 코드 발송에 실패했습니다.')
      }

      const result = await response.json()

      setEmailVerification(prev => ({
        ...prev,
        sent: true,
        expiresAt: result.expiresAt,
        isSending: false
      }))

      toast({
        description: '인증 코드가 이메일로 발송되었습니다.',
      })
    } catch (error) {
      console.error('인증 코드 발송 실패:', error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '인증 코드 발송에 실패했습니다.',
      })
      setEmailVerification(prev => ({ ...prev, isSending: false }))
    }
  }

  // 인증 코드 확인
  const handleVerifyCode = async () => {
    try {
      setEmailVerification(prev => ({ ...prev, isVerifying: true }))

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/users/me/email/verify-code?userId=${user?.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          code: emailVerification.code
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || '인증 코드 확인에 실패했습니다.')
      }

      setEmailVerification(prev => ({
        ...prev,
        verified: true,
        isVerifying: false,
        verifiedEmail: formData.email
      }))

      toast({
        description: '이메일 인증이 완료되었습니다.',
      })
    } catch (error) {
      console.error('인증 코드 확인 실패:', error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '인증 코드 확인에 실패했습니다.',
      })
      setEmailVerification(prev => ({ ...prev, isVerifying: false }))
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // 이메일 변경 여부 확인
      const emailChanged = user?.email !== formData.email

      // 이메일이 변경된 경우 인증 완료 여부 확인
      if (emailChanged && !emailVerification.verified) {
        toast({
          variant: 'destructive',
          description: '이메일 변경을 위해서는 먼저 인증을 완료해주세요.',
        })
        setIsSaving(false)
        return
      }

      // 인증된 이메일과 현재 입력된 이메일이 다른 경우 (인증 후 이메일을 다시 변경한 경우)
      if (emailChanged && emailVerification.verified && emailVerification.verifiedEmail !== formData.email) {
        toast({
          variant: 'destructive',
          description: '인증한 이메일 주소와 현재 입력된 이메일이 다릅니다. 다시 인증해주세요.',
        })
        setIsSaving(false)
        return
      }

      // TODO: 인증 연동
      // 1. 이메일 변경된 경우: 이메일 인증 필요
      //    - 변경할 이메일로 인증 코드 발송
      //    - 인증 코드 확인 후 이메일 업데이트
      // 2. 휴대폰 번호 변경된 경우: PASS 인증 필요
      //    - PASS 인증 프로세스 진행
      //    - 인증 성공 후 휴대폰 번호 업데이트

      console.log('개인정보 수정 API 호출 시작...')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
      const response = await fetch(`${apiUrl}/api/users/me?userId=${user?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      console.log('개인정보 수정 응답 상태:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('개인정보 수정 실패:', errorData)
        throw new Error(errorData.message || '개인정보 수정에 실패했습니다.')
      }

      const result = await response.json()
      console.log('개인정보 수정 성공:', result)

      // AuthContext 업데이트 (글로벌 헤더 유저 프로필도 업데이트됨)
      updateUser(result)

      setIsEditing(false)
      toast({
        description: '개인정보가 성공적으로 수정되었습니다.',
      })
    } catch (error) {
      console.error('에러 발생:', error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : '개인정보 수정에 실패했습니다.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        email: user.email || '',
        phone: user.phone || ''
      })
    }
    setIsEditing(false)
  }

  return (
    <div className="p-6">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">개인정보</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              수정하기
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* 이름 (수정 불가) */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
              {user?.name || '-'}
            </div>
            <p className="mt-1 text-xs text-gray-500">이름은 수정할 수 없습니다.</p>
          </div>

          {/* 이메일 */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            {isEditing ? (
              <>
                <div className="space-y-3">
                  {/* 이메일 입력 */}
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      disabled={emailVerification.sent}
                      className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                        emailValidation.isValid === false
                          ? 'border-red-300 bg-red-50'
                          : emailValidation.isValid === true
                          ? 'border-sky-300 bg-sky-50'
                          : 'border-gray-300'
                      }`}
                    />

                    {/* 인증 코드 발송 버튼 */}
                    {user?.email !== formData.email && !emailVerification.verified && (
                      <button
                        type="button"
                        onClick={handleSendVerificationCode}
                        disabled={emailVerification.isSending || emailVerification.sent || emailValidation.isValid === false}
                        className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {emailVerification.isSending ? '발송 중...' : emailVerification.sent ? '발송됨' : '인증 코드 발송'}
                      </button>
                    )}

                    {/* 인증 완료 표시 */}
                    {emailVerification.verified && (
                      <div className="px-4 py-2 bg-sky-50 text-sky-600 text-sm font-medium rounded-lg border border-sky-200 whitespace-nowrap">
                        인증 완료
                      </div>
                    )}
                  </div>

                  {/* 중복 확인 메시지 */}
                  {emailValidation.isChecking && (
                    <p className="text-xs text-gray-600">이메일 중복 확인 중...</p>
                  )}
                  {emailValidation.isValid === false && (
                    <p className="text-xs text-red-600">{emailValidation.message}</p>
                  )}
                  {emailValidation.isValid === true && (
                    <p className="text-xs text-sky-600">{emailValidation.message}</p>
                  )}

                  {/* 인증 코드 입력 */}
                  {emailVerification.sent && !emailVerification.verified && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">인증 코드 입력</span>
                        {emailVerification.timeLeft > 0 && (
                          <span className="text-sm text-gray-600">
                            남은 시간: {Math.floor(emailVerification.timeLeft / 60)}:{String(emailVerification.timeLeft % 60).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={emailVerification.code}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                            setEmailVerification(prev => ({ ...prev, code: value }))
                          }}
                          placeholder="6자리 숫자"
                          maxLength={6}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={emailVerification.code.length !== 6 || emailVerification.isVerifying}
                          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                          {emailVerification.isVerifying ? '확인 중...' : '확인'}
                        </button>
                      </div>

                      <p className="text-xs text-gray-500">
                        이메일로 발송된 6자리 인증 코드를 입력해주세요.
                      </p>
                    </div>
                  )}

                  {/* 안내 메시지 */}
                  {!emailValidation.isChecking && emailValidation.isValid === null && user?.email === formData.email && (
                    <p className="text-xs text-gray-500">이메일 변경 시 이메일 인증이 필요합니다.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {formData.email || '-'}
              </div>
            )}
          </div>

          {/* 휴대폰 번호 */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              휴대폰 번호
            </label>
            {isEditing ? (
              <>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="010-1234-5678"
                />
                <p className="mt-1 text-xs text-gray-500">휴대폰 번호 변경 시 PASS 인증이 필요합니다.</p>
              </>
            ) : (
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                {formData.phone || '-'}
              </div>
            )}
          </div>

          {/* 수정 모드 버튼 */}
          {isEditing && (
            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
