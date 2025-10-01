'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CameraIcon, CheckCircleIcon, ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

function MobileVerificationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session')

  const [step, setStep] = useState<'idCard' | 'selfie' | 'completed'>('idCard')
  const [idCardImage, setIdCardImage] = useState<string | null>(null)
  const [selfieImage, setSelfieImage] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setMessage({ type: 'error', text: '유효하지 않은 세션입니다.' })
    }
  }, [sessionId])

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 검증
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 10MB 이하여야 합니다.' })
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string

      if (step === 'idCard') {
        setIdCardImage(result)
        setMessage({ type: 'success', text: '신분증 사진이 촬영되었습니다.' })
        setTimeout(() => {
          setStep('selfie')
          setMessage(null)
        }, 1000)
      } else if (step === 'selfie') {
        setSelfieImage(result)
        setMessage({ type: 'success', text: '셀카가 촬영되었습니다.' })
        setTimeout(() => {
          handleUpload(idCardImage!, result)
        }, 1000)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async (idCard: string, selfie: string) => {
    try {
      // 시뮬레이션: 실제로는 서버로 업로드
      // 임시로 localStorage 사용
      localStorage.setItem(`signup_session_${sessionId}`, JSON.stringify({
        idCard,
        selfie
      }))

      setStep('completed')
      setMessage({ type: 'success', text: '모든 사진이 업로드되었습니다!' })
    } catch (error) {
      setMessage({ type: 'error', text: '업로드 중 오류가 발생했습니다.' })
    }
  }

  const handleRetake = (type: 'idCard' | 'selfie') => {
    if (type === 'idCard') {
      setIdCardImage(null)
      setStep('idCard')
    } else {
      setSelfieImage(null)
      setStep('selfie')
    }
    setMessage(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <CameraIcon className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">신분증 모바일 촬영</h1>
          <p className="mt-2 text-gray-600">
            {step === 'idCard' && '신분증을 촬영해주세요'}
            {step === 'selfie' && '신분증을 들고 셀카를 촬영해주세요'}
            {step === 'completed' && '촬영이 완료되었습니다'}
          </p>
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
        {step !== 'completed' && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              {step === 'idCard' ? '신분증 촬영 안내' : '셀카 촬영 안내'}
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              {step === 'idCard' ? (
                <>
                  <li>• 주민등록번호 뒷자리는 가려주세요</li>
                  <li>• 신분증 전체가 화면에 보이도록</li>
                  <li>• 흔들림 없이 선명하게 촬영</li>
                  <li>• 밝은 곳에서 촬영하세요</li>
                </>
              ) : (
                <>
                  <li>• 얼굴과 신분증이 함께 보이도록</li>
                  <li>• 신분증의 정보가 보이도록</li>
                  <li>• 얼굴이 선명하게 보이도록</li>
                  <li>• 밝은 곳에서 촬영하세요</li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* 촬영 영역 */}
        {step !== 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {!idCardImage && step === 'idCard' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCapture}
                  className="hidden"
                  id="idCardCapture"
                />
                <label
                  htmlFor="idCardCapture"
                  className="block w-full py-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <div className="text-center">
                    <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <span className="text-lg font-medium text-gray-900">신분증 촬영</span>
                    <p className="text-sm text-gray-600 mt-2">탭하여 카메라 실행</p>
                  </div>
                </label>
              </div>
            )}

            {idCardImage && step === 'idCard' && (
              <div className="space-y-4">
                <div className="relative">
                  <img src={idCardImage} alt="신분증" className="w-full rounded-lg" />
                  <button
                    onClick={() => handleRetake('idCard')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {!selfieImage && step === 'selfie' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleCapture}
                  className="hidden"
                  id="selfieCapture"
                />
                <label
                  htmlFor="selfieCapture"
                  className="block w-full py-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                >
                  <div className="text-center">
                    <CameraIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <span className="text-lg font-medium text-gray-900">셀카 촬영</span>
                    <p className="text-sm text-gray-600 mt-2">신분증을 들고 촬영</p>
                  </div>
                </label>
              </div>
            )}

            {selfieImage && step === 'selfie' && (
              <div className="space-y-4">
                <div className="relative">
                  <img src={selfieImage} alt="셀카" className="w-full rounded-lg" />
                  <button
                    onClick={() => handleRetake('selfie')}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 완료 화면 */}
        {step === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">촬영 완료!</h2>
            <p className="text-gray-600 mb-6">
              PC 화면으로 돌아가서<br />
              회원가입을 계속 진행하세요
            </p>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-xs text-gray-600 mb-2">신분증</p>
                <img src={idCardImage || ''} alt="신분증" className="w-full h-24 object-cover rounded-lg border" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-2">셀카</p>
                <img src={selfieImage || ''} alt="셀카" className="w-full h-24 object-cover rounded-lg border" />
              </div>
            </div>
            <p className="text-sm text-gray-500">이 창을 닫아도 됩니다</p>
          </div>
        )}

        {/* 진행 표시 */}
        {step !== 'completed' && (
          <div className="mt-6 flex justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${step === 'idCard' ? 'bg-primary-600' : idCardImage ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`w-3 h-3 rounded-full ${step === 'selfie' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MobileVerificationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <MobileVerificationContent />
    </Suspense>
  )
}
