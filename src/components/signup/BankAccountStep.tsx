'use client'

import { useState, useEffect, useRef } from 'react'
import { BanknotesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'

interface BankAccountStepProps {
  initialData: SignupData
  onComplete: (data: Partial<SignupData>) => void
  onBack: () => void
}

// 1원 계좌 인증 응답 타입
interface AccountVerificationResponse {
  result: 'success' | 'failed' | 'complete' | 'close'
  review_result?: {
    id: number
    transaction_id: string
    result_type: 1 | 2 | 5  // 1: 자동승인, 2: 자동거부, 5: 심사필요
    name: string
    phone_number: string
    birthday: string
    module: {
      id_card_ocr: boolean
      id_card_verification: boolean
      face_authentication: boolean
      account_verification: boolean
      liveness: boolean
    }
    account?: {
      verified: boolean
      finance_code: string
      finance_company: string
      account_number: string
      account_holder: string
      mod_account_holder: string | null
      business_number: string | null
    }
  }
  api_response?: {
    result_code: string
    result_message: string
  }
}

export default function BankAccountStep({ initialData, onComplete, onBack }: BankAccountStepProps) {
  const [accountStarted, setAccountStarted] = useState(false)
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
    if (!accountStarted) return

    const handleMessage = (e: MessageEvent) => {
      // 보안: origin 확인
      if (e.origin !== KYC_TARGET_ORIGIN) return

      console.log('1원 계좌 인증 response', e.data)
      console.log('origin :', e.origin)

      try {
        const decodedData = decodeURIComponent(atob(e.data))
        const json: AccountVerificationResponse = JSON.parse(decodedData)
        console.log('decoded json', json)

        // 1차 postMessage: 인증 결과 데이터 (success/failed + review_result)
        if (json.result === 'success' && json.review_result) {
          const { result_type, transaction_id, account } = json.review_result

          if (result_type === 1 && account?.verified) {
            // 자동 승인
            setMessage({ type: 'success', text: '계좌 인증이 자동 승인되었습니다.' })
            console.log('자동승인 - transaction_id:', transaction_id)
            console.log('계좌 정보:', account)
          } else if (result_type === 5) {
            // 심사 필요 (예금주명 수정 등)
            setMessage({ type: 'success', text: '계좌 인증이 완료되었습니다. 심사 후 이메일로 안내드립니다.' })
            console.log('심사필요 - transaction_id:', transaction_id)
          }

          // review_result 데이터 저장 (서버 전송용)
          console.log('계좌 인증 결과:', json.review_result)

        } else if (json.result === 'failed' && json.review_result) {
          // 자동 거부 (result_type === 2)
          setMessage({ type: 'error', text: '계좌 인증에 실패했습니다. 다시 시도해주세요.' })
          console.log('자동거부 - transaction_id:', json.review_result.transaction_id)

        // 2차 postMessage: UI 처리 (complete/close)
        } else if (json.result === 'complete') {
          // 인증 성공 후 서비스 종료
          setMessage({ type: 'success', text: '계좌 인증이 완료되었습니다!' })
          setLoading(false)

          // 인증 완료 후 다음 단계로 이동
          setTimeout(() => {
            onComplete({
              accountVerified: true,
            })
          }, 1000)

        } else if (json.result === 'close') {
          // 인증 실패 후 서비스 종료 또는 중도 이탈
          setMessage({ type: 'error', text: '계좌 인증이 중단되었습니다.' })
          setAccountStarted(false)
          setLoading(false)
        }
      } catch (error) {
        console.error('1원 계좌 인증 응답 처리 오류:', error)
        setMessage({ type: 'error', text: '응답 처리 중 오류가 발생했습니다.' })
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [accountStarted, onComplete])

  const handleStartAccount = () => {
    setAccountStarted(true)
    setLoading(true)
    setMessage(null)
  }

  // iframe이 로드되면 파라미터 전송
  useEffect(() => {
    if (!accountStarted || !iframeRef.current) return

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

        // 세기 판단
        const century = ['1', '2', '5', '6', '9', '0'].includes(genderCode) ? '19' : '20'
        const birthday = `${century}${yy}-${mm}-${dd}`

        // 전화번호에서 하이픈 제거
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

        console.log('1원 계좌 인증 params (Credential):', {
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
        setMessage({ type: 'success', text: '1원 계좌 인증을 시작합니다. 안내에 따라 진행해주세요.' })
      } catch (error) {
        console.error('1원 계좌 인증 초기화 오류:', error)
        setMessage({ type: 'error', text: '초기화 중 오류가 발생했습니다.' })
        setLoading(false)
      }
    }

    iframe.addEventListener('load', handleLoad)
    return () => iframe.removeEventListener('load', handleLoad)
  }, [accountStarted, initialData])

  const handleCancel = () => {
    setAccountStarted(false)
    setMessage(null)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {!accountStarted ? (
        <>
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <BanknotesIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">본인명의 계좌 인증</h2>
            <p className="text-gray-600 mt-1">1원 입금으로 본인 계좌를 인증합니다</p>
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
            <h4 className="text-sm font-medium text-blue-900 mb-2">1원 계좌 인증 안내</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 본인 명의의 은행 계좌만 등록 가능합니다</li>
              <li>• 입력하신 계좌로 1원을 입금합니다</li>
              <li>• 입금내역에서 4자리 인증번호를 확인하여 입력하세요</li>
              <li>• 인증 시간은 5분이며, 3회까지 시도 가능합니다</li>
              <li>• 인증이 완료되면 1원은 자동으로 환불됩니다</li>
            </ul>
          </div>

          {/* 1원 계좌 인증 시작 정보 */}
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <BanknotesIcon className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">1원 계좌 인증</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  useB 1원 계좌 인증 서비스를 통해 본인 명의 계좌를 인증합니다.
                  은행을 선택하고 계좌번호를 입력한 후, 입금된 1원의 인증번호를 확인하여 입력하세요.
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
              onClick={handleStartAccount}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? '준비 중...' : '1원 계좌 인증 시작'}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 1원 계좌 인증 iframe 화면 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">계좌 인증 진행 중</h2>
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
                  <span className="text-sm text-blue-700">1원 계좌 인증 시스템을 준비하고 있습니다...</span>
                </div>
              </div>
            )}
          </div>

          {/* 1원 계좌 인증 iframe */}
          <div className="relative w-full" style={{ height: '600px' }}>
            <iframe
              ref={iframeRef}
              id="account_iframe"
              className="w-full h-full rounded-lg border-2 border-gray-300 bg-white"
              allow="camera; microphone; fullscreen"
              src={KYC_URL}
              title="1원 계좌 인증"
            />
          </div>

          {/* 안내 정보 */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              은행을 선택하고 계좌번호를 입력한 후, 입금된 1원의 인증번호를 확인하여 입력해주세요.
              인증이 완료되면 자동으로 다음 단계로 이동합니다.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
