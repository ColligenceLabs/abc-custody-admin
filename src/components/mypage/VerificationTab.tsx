'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ShieldCheckIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { KYCStatus, AMLStatus } from '@/types/individualUser'
import { useToast } from '@/hooks/use-toast'
import IDAndAccountVerificationStep from '@/components/signup/IDAndAccountVerificationStep'

export default function VerificationTab() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null)
  const [amlStatus, setAmlStatus] = useState<AMLStatus | null>(null)
  const [isLoadingKYC, setIsLoadingKYC] = useState(true)
  const [isLoadingAML, setIsLoadingAML] = useState(true)
  const [isProcessingKYC, setIsProcessingKYC] = useState(false)
  const [isProcessingAML, setIsProcessingAML] = useState(false)
  const [ekycMode, setEkycMode] = useState<'view' | 'process'>('view')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

  // KYC 상태 조회
  useEffect(() => {
    if (!user?.id) {
      setIsLoadingKYC(false)
      return
    }

    const fetchKYCStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users/me/kyc-status?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setKycStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch KYC status:', error)
      } finally {
        setIsLoadingKYC(false)
      }
    }

    fetchKYCStatus()
  }, [apiUrl, user?.id])

  // AML 상태 조회
  useEffect(() => {
    if (!user?.id) {
      setIsLoadingAML(false)
      return
    }

    const fetchAMLStatus = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users/me/aml-status?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          setAmlStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch AML status:', error)
      } finally {
        setIsLoadingAML(false)
      }
    }

    fetchAMLStatus()
  }, [apiUrl, user?.id])

  // eKYC 인증 시작 (identityVerified === false인 경우만)
  const handleStartKYC = async () => {
    if (kycStatus?.identityVerified) {
      toast({
        variant: 'destructive',
        description: '이미 eKYC 인증이 완료되었습니다.'
      })
      return
    }

    // 디버깅: 사용자 데이터 확인
    console.log('='.repeat(60));
    console.log('마이페이지 eKYC 시작 - 사용자 데이터 확인');
    console.log('='.repeat(60));
    console.log('user:', user);
    console.log('user.name:', user?.name);
    console.log('user.birthDate:', user?.birthDate);
    console.log('user.phone:', user?.phone);
    console.log('user.email:', user?.email);
    console.log('='.repeat(60));

    // eKYC 프로세스 모드로 전환
    setEkycMode('process')
  }

  // eKYC 인증 완료 처리
  const handleEkycComplete = async (result: {
    idVerified?: boolean
    accountVerified?: boolean
    kycMethod?: 'mobile' | 'pc'
    kycStatus?: 'skipped'
  }) => {
    // skip한 경우 그냥 view 모드로 전환
    if (result.kycStatus === 'skipped') {
      setEkycMode('view')
      return
    }

    try {
      // eKYC 완료 API 호출
      const response = await fetch(`${apiUrl}/api/users/me/kyc/complete?userId=${user?.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycMethod: result.kycMethod
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'eKYC 완료 처리 실패')
      }

      const updatedUser = await response.json()

      // 전역 상태 업데이트
      updateUser(updatedUser)

      // KYC 상태 다시 조회
      const kycResponse = await fetch(`${apiUrl}/api/users/me/kyc-status?userId=${user?.id}`)
      if (kycResponse.ok) {
        const kycData = await kycResponse.json()
        setKycStatus(kycData)
      }

      // view 모드로 전환
      setEkycMode('view')

      toast({
        description: 'eKYC 인증이 완료되었습니다.'
      })
    } catch (error) {
      console.error('eKYC 완료 처리 실패:', error)
      toast({
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'eKYC 인증 완료 처리 중 오류가 발생했습니다.'
      })
    }
  }

  // AML 고객확인 재이행
  const handleVerifyAML = async () => {
    try {
      setIsProcessingAML(true)

      // TODO: 실제로는 자금출처 입력 폼을 먼저 보여주고 제출
      const fundSource = prompt('자금출처를 입력해주세요:')
      if (!fundSource) {
        setIsProcessingAML(false)
        return
      }

      const response = await fetch(`${apiUrl}/api/users/me/aml/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fundSource })
      })

      if (!response.ok) {
        throw new Error('Failed to verify AML')
      }

      const data = await response.json()
      setAmlStatus(data)
      alert('AML 고객확인이 완료되었습니다.')
    } catch (error) {
      console.error('Failed to verify AML:', error)
      alert('AML 고객확인에 실패했습니다.')
    } finally {
      setIsProcessingAML(false)
    }
  }

  // 날짜 포맷팅
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // AML 재확인 필요 여부 체크
  const needsAMLReverification = () => {
    if (!amlStatus?.amlNextVerificationDate) return false
    return new Date(amlStatus.amlNextVerificationDate) <= new Date()
  }

  // eKYC 프로세스 모드인 경우
  if (ekycMode === 'process') {
    return (
      <div className="p-6">
        <IDAndAccountVerificationStep
          initialData={{
            name: user?.name || '',
            residentNumber: '',  // 회원가입 완료 사용자는 DB에 이미 주민번호 저장됨
            phone: user?.phone || '',
            email: user?.email || ''
          } as any}
          onComplete={handleEkycComplete as any}
          onBack={() => setEkycMode('view')}
          skipMethodSelection={true}
          birthDate={user?.birthDate || ''}
        />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-3xl space-y-8">
        {/* eKYC 섹션 */}
        <div>
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">eKYC 전자 본인인증</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            {isLoadingKYC ? (
              <div className="text-center text-gray-500">로딩 중...</div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">인증 상태</span>
                        {kycStatus?.identityVerified ? (
                          <CheckCircleIcon className="h-5 w-5 text-sky-600 ml-2" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-gray-400 ml-2" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {kycStatus?.identityVerified ? (
                          <span className="text-sky-600 font-medium">인증 완료</span>
                        ) : (
                          <span className="text-gray-500">미인증</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {kycStatus?.identityVerified && (
                    <>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm font-medium text-gray-700 mb-1">인증 등급</div>
                        <div className="text-sm text-gray-900">
                          {kycStatus.kycLevel || '-'}
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="text-sm font-medium text-gray-700 mb-1">인증 완료일</div>
                        <div className="text-sm text-gray-900">
                          {formatDate(kycStatus.kycVerifiedAt)}
                        </div>
                      </div>
                    </>
                  )}

                  {!kycStatus?.identityVerified && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-indigo-800">
                          회원가입 시 본인인증을 건너뛰셨습니다. 서비스 이용을 위해 eKYC 인증을 완료해주세요.
                        </p>
                      </div>
                      <button
                        onClick={handleStartKYC}
                        disabled={isProcessingKYC}
                        className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isProcessingKYC ? '처리 중...' : 'eKYC 인증 시작'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* AML 섹션 */}
        <div>
          <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">AML 고객확인</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            {isLoadingAML ? (
              <div className="text-center text-gray-500">로딩 중...</div>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">자금출처</div>
                    <div className="text-sm text-gray-900">
                      {amlStatus?.fundSource || '미등록'}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">최근 확인일</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(amlStatus?.amlVerifiedAt || null)}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">다음 확인 예정일</div>
                    <div className="text-sm text-gray-900">
                      {formatDate(amlStatus?.amlNextVerificationDate || null)}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-medium text-gray-700 mb-1">재확인 주기</div>
                    <div className="text-sm text-gray-900">
                      {amlStatus?.amlVerificationCycle || 12}개월
                    </div>
                  </div>

                  {needsAMLReverification() && (
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800">
                          정기 AML 고객확인 기간이 도래했습니다. 재확인을 진행해주세요.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <button
                      onClick={handleVerifyAML}
                      disabled={isProcessingAML}
                      className="w-full px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessingAML ? '처리 중...' : 'AML 고객확인 재이행'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
