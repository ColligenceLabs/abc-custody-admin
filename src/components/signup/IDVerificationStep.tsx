'use client'

import { useState, useEffect, useRef } from 'react'
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'

interface IDVerificationStepProps {
  initialData: SignupData
  onComplete: (data: Partial<SignupData>) => void
  onBack: () => void
}

// eKYC 응답 타입
interface EKYCResponse {
  result: 'success' | 'failed' | 'complete' | 'close'
  message?: string
  review_result?: {
    id: number
    transaction_id: string
    result_type: 1 | 2 | 5  // 1: 자동승인, 2: 자동거부, 5: 심사필요
    name: string
    phone_number: string
    birthday: string
    id_card?: any
    face_check?: any
    account?: any
  }
  api_response?: {
    result_code: string
    result_message: string
  }
}

export default function IDVerificationStep({ initialData, onComplete, onBack }: IDVerificationStepProps) {
  const [kycStarted, setKycStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const KYC_TARGET_ORIGIN = "https://kyc.useb.co.kr"
  const KYC_URL = "https://kyc.useb.co.kr/auth"

  // Access Token 발급 함수 (Next.js API Route를 통한 프록시)
  const getAccessToken = async (): Promise<string> => {
    try {
      const response = await fetch('/api/ekyc/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Access Token 발급 실패: ${response.status}`)
      }

      const data = await response.json()
      console.log('Access Token 발급 성공:', {
        expire: data.expire,
        role: data.role,
      })
      return data.token
    } catch (error) {
      console.error('Access Token 발급 오류:', error)
      throw error
    }
  }

  useEffect(() => {
    if (!kycStarted) return

    const handleMessage = (e: MessageEvent) => {
      // 보안: origin 확인
      if (e.origin !== KYC_TARGET_ORIGIN) return

      console.log('alcherakyc response', e.data)
      console.log('origin :', e.origin)

      try {
        const decodedData = decodeURIComponent(atob(e.data))
        const json: EKYCResponse = JSON.parse(decodedData)
        console.log('decoded json', json)

        // 1차 postMessage: 인증 결과 데이터 (success/failed + review_result)
        if (json.result === 'success' && json.review_result) {
          const { result_type, transaction_id } = json.review_result

          if (result_type === 1) {
            // 자동 승인
            setMessage({ type: 'success', text: 'eKYC 인증이 자동 승인되었습니다.' })
            console.log('자동승인 - transaction_id:', transaction_id)
          } else if (result_type === 5) {
            // 심사 필요
            setMessage({ type: 'success', text: 'eKYC 인증이 완료되었습니다. 심사 후 이메일로 안내드립니다.' })
            console.log('심사필요 - transaction_id:', transaction_id)
          }

          // review_result 데이터 저장 (서버 전송용)
          console.log('eKYC 인증 결과:', json.review_result)

        } else if (json.result === 'failed' && json.review_result) {
          // 자동 거부 (result_type === 2)
          setMessage({ type: 'error', text: 'eKYC 인증이 실패했습니다. 다시 시도해주세요.' })
          console.log('자동거부 - transaction_id:', json.review_result.transaction_id)

        // 2차 postMessage: UI 처리 (complete/close)
        } else if (json.result === 'complete') {
          // 인증 성공 후 서비스 종료
          setMessage({ type: 'success', text: '신분증 인증이 완료되었습니다!' })
          setLoading(false)

          // 인증 완료 후 다음 단계로 이동
          setTimeout(() => {
            onComplete({
              idVerified: true,
            })
          }, 1000)

        } else if (json.result === 'close') {
          // 인증 실패 후 서비스 종료 또는 중도 이탈
          setMessage({ type: 'error', text: 'eKYC 인증이 중단되었습니다.' })
          setKycStarted(false)
          setLoading(false)
        }
      } catch (error) {
        console.error('eKYC 응답 처리 오류:', error)
        setMessage({ type: 'error', text: 'eKYC 응답 처리 중 오류가 발생했습니다.' })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [kycStarted, onComplete])

  const handleStartKYC = () => {
    setKycStarted(true)
    setLoading(true)
    setMessage(null)
  }

  // iframe이 로드되면 파라미터 전송
  useEffect(() => {
    if (!kycStarted || !iframeRef.current) return

    const iframe = iframeRef.current

    const handleLoad = async () => {
      try {
        // 주민번호에서 생년월일 추출 (YYYY-MM-DD 형식)
        const residentNumber = initialData.residentNumber || ''
        const parts = residentNumber.split('-')
        const birthPart = parts[0] || ''
        const genderPart = parts[1] || ''

        const yy = birthPart.substring(0, 2)
        const mm = birthPart.substring(2, 4)
        const dd = birthPart.substring(4, 6)
        const genderCode = genderPart.substring(0, 1)

        // 세기 판단 (1,2,9,0: 1900년대 / 3,4,7,8: 2000년대 / 5,6: 1900년대 외국인)
        const century = ['1', '2', '5', '6', '9', '0'].includes(genderCode) ? '19' : '20'
        const birthday = `${century}${yy}-${mm}-${dd}`

        // 전화번호에서 하이픈 제거 (01012345678 형식)
        const phoneNumber = (initialData.phone || '').replace(/-/g, '')

        // Credential 방식 사용 (iframe에 직접 전달)
        const params = {
          customer_id: 224,
          id: '8pTkDgU2B9',
          key: 'Z2DrjFtSu81v9$B',
          name: initialData.name || '',
          birthday: birthday,
          phone_number: phoneNumber,
          email: initialData.email || '',
        }

        console.log('eKYC params (Credential):', {
          customer_id: params.customer_id,
          id: params.id,
          key: '***' + params.key.slice(-3),
          name: params.name,
          birthday: params.birthday,
          phone_number: params.phone_number,
          email: params.email,
        })

        const encodedParams = btoa(encodeURIComponent(JSON.stringify(params)))
        iframe.contentWindow?.postMessage(encodedParams, KYC_TARGET_ORIGIN)
        console.log('postMessage sent to:', KYC_TARGET_ORIGIN)

        setLoading(false)
        setMessage({ type: 'success', text: 'eKYC 인증을 시작합니다. 카메라 권한을 허용해주세요.' })
      } catch (error) {
        console.error('eKYC 초기화 오류:', error)
        setMessage({ type: 'error', text: 'eKYC 초기화 중 오류가 발생했습니다.' })
        setLoading(false)
      }
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [kycStarted])

  const handleCancel = () => {
    setKycStarted(false)
    setMessage(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {!kycStarted ? (
        <>
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <CreditCardIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">신분증 인증을 진행합니다</h2>
            <p className="text-gray-600 mt-1">eKYC 시스템을 통한 빠르고 안전한 신분증 인증</p>
          </div>

          {/* 메시지 */}
          {message && (
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
          )}

          {/* 안내 사항 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">eKYC 인증 안내</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 카메라를 사용하여 신분증을 촬영합니다</li>
              <li>• 주민등록증, 운전면허증, 여권을 사용할 수 있습니다</li>
              <li>• 카메라 권한 요청 시 반드시 허용해주세요</li>
              <li>• 신분증의 모든 정보가 선명하게 보이도록 촬영하세요</li>
              <li>• 조명이 밝고 흔들림이 없는 환경에서 촬영하세요</li>
              <li>• 인증 과정은 약 2-3분 소요됩니다</li>
            </ul>
          </div>

          {/* eKYC 시작 정보 */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <CreditCardIcon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">eKYC 전자 신원인증</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  전자식 신원확인(eKYC)은 Alchera KYC 서비스를 통해 진행됩니다.
                  실시간 카메라 촬영으로 빠르고 안전하게 신분증을 인증할 수 있습니다.
                  인증 과정에서 수집된 정보는 금융거래법령에 따라 안전하게 보관됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
            <button
              onClick={handleStartKYC}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? '준비 중...' : 'eKYC 인증 시작'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* eKYC iframe 화면 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">신분증 인증 진행 중</h2>
              <button
                onClick={handleCancel}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                취소
              </button>
            </div>

            {/* 메시지 */}
            {message && (
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
            )}

            {/* 로딩 상태 */}
            {loading && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <span className="text-sm text-blue-700">eKYC 시스템을 준비하고 있습니다...</span>
                </div>
              </div>
            )}
          </div>

          {/* eKYC iframe */}
          <div className="relative w-full" style={{ height: '600px' }}>
            <iframe
              ref={iframeRef}
              id="kyc_iframe"
              className="w-full h-full rounded-lg border-2 border-gray-300 bg-white"
              allow="camera; microphone; fullscreen"
              src={KYC_URL}
              title="eKYC 인증"
            />
          </div>

          {/* 안내 정보 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              카메라 권한을 허용하고 안내에 따라 신분증을 촬영해주세요.
              인증이 완료되면 자동으로 다음 단계로 이동합니다.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
