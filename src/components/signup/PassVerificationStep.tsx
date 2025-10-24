'use client'

import { useState } from 'react'
import { CheckCircleIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'

interface PassVerificationStepProps {
  initialData: SignupData;
  onComplete: (data: Partial<SignupData>) => void;
  onBack: () => void;
}

export default function PassVerificationStep({
  initialData,
  onComplete,
  onBack
}: PassVerificationStepProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePassVerification = async () => {
    try {
      setIsVerifying(true)
      setError(null)

      // 1. PortOne SDK 호출
      const { requestPassVerification } = await import('@/utils/portonePass')
      const sdkResult = await requestPassVerification()

      if (!sdkResult.success) {
        setError(sdkResult.message || '본인인증에 실패했습니다.')
        setIsVerifying(false)
        return
      }

      console.log('[PASS] identityVerificationId:', sdkResult.identityVerificationId)

      // 2. Backend API로 인증 정보 조회 및 중복 확인
      const { verifyPassAuth } = await import('@/lib/api/auth')
      const result = await verifyPassAuth(sdkResult.identityVerificationId!)

      if (result.isDuplicate) {
        setError('이미 가입된 계정이 있습니다. 로그인 페이지로 이동해주세요.')
        setIsVerifying(false)
        return
      }

      if (!result.success || !result.verifiedInfo) {
        setError(result.message || '본인인증 정보를 가져오는데 실패했습니다.')
        setIsVerifying(false)
        return
      }

      console.log('[PASS] 인증 성공:', result.verifiedInfo)

      // 3. 인증 정보를 다음 단계로 전달
      onComplete({
        passVerified: true,
        passName: result.verifiedInfo.name,
        passPhone: result.verifiedInfo.phoneNumber,
        passBirthDate: result.verifiedInfo.birthDate,
        passGender: result.verifiedInfo.gender,
        passCi: result.verifiedInfo.ci,
        passDi: result.verifiedInfo.di,
        passIdentityId: sdkResult.identityVerificationId
      })

    } catch (error) {
      console.error('[PASS] 인증 오류:', error)
      setError(error instanceof Error ? error.message : '본인인증 중 오류가 발생했습니다.')
      setIsVerifying(false)
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">PASS 본인인증</h2>
        <p className="mt-2 text-gray-600">
          휴대폰 본인인증을 진행합니다
        </p>
      </div>

      {/* 안내 정보 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">본인인증을 통해 다음 정보를 자동으로 입력합니다:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>이름 (수정 불가)</li>
              <li>휴대폰 번호 (수정 불가)</li>
              <li>생년월일 (주민번호 계산용)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* 버튼 */}
      <div className="space-y-3">
        <button
          onClick={handlePassVerification}
          disabled={isVerifying}
          className="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? '인증 진행 중...' : 'PASS 본인인증 시작'}
        </button>

        <button
          onClick={onBack}
          disabled={isVerifying}
          className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
        >
          이전 단계로
        </button>
      </div>

      {/* 주의사항 */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>본인인증 정보는 안전하게 암호화되어 저장됩니다.</p>
        <p>1인 1계정 확인을 위해 CI/DI 정보를 수집합니다.</p>
      </div>
    </div>
  )
}
