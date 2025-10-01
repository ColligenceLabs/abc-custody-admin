'use client'

import { useState, useEffect } from 'react'
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon, PhotoIcon, XMarkIcon, DevicePhoneMobileIcon, ComputerDesktopIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { QRCodeSVG } from 'qrcode.react'
import { SignupData } from '@/app/signup/page'

type VerificationMethod = 'mobile' | 'pc' | null
type MobileUploadStatus = 'waiting' | 'uploading' | 'completed'

interface IDVerificationStepProps {
  initialData: SignupData
  onComplete: (data: Partial<SignupData>) => void
  onBack: () => void
}

export default function IDVerificationStep({ initialData, onComplete, onBack }: IDVerificationStepProps) {
  const [method, setMethod] = useState<VerificationMethod>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mobileUploadStatus, setMobileUploadStatus] = useState<MobileUploadStatus>('waiting')
  const [idCardImage, setIdCardImage] = useState<File | null>(initialData.idCardImage || null)
  const [idCardSelfieImage, setIdCardSelfieImage] = useState<File | null>(initialData.idCardSelfieImage || null)
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 모바일 방법 선택 시 세션 ID 생성 및 폴링 시작
  useEffect(() => {
    if (method === 'mobile') {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      setSessionId(newSessionId)
      startPolling(newSessionId)
    }
  }, [method])

  const startPolling = (sessionId: string) => {
    // 시뮬레이션: 실제로는 서버에 폴링하여 모바일 업로드 상태 확인
    const interval = setInterval(() => {
      // 여기서 실제로는 API 호출하여 세션 상태 확인
      // 임시로 localStorage 사용
      const data = localStorage.getItem(`signup_session_${sessionId}`)
      if (data) {
        const parsedData = JSON.parse(data)
        if (parsedData.idCard && parsedData.selfie) {
          setIdCardPreview(parsedData.idCard)
          setSelfiePreview(parsedData.selfie)
          setMobileUploadStatus('completed')
          clearInterval(interval)
          localStorage.removeItem(`signup_session_${sessionId}`)
        }
      }
    }, 2000)

    // 5분 후 타임아웃
    setTimeout(() => clearInterval(interval), 300000)
  }

  const handleMethodSelect = (selectedMethod: VerificationMethod) => {
    setMethod(selectedMethod)
    setMessage(null)
  }

  const handleChangeMethod = () => {
    setMethod(null)
    setSessionId(null)
    setMobileUploadStatus('waiting')
    setMessage(null)
  }

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'idCard' | 'selfie'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 검증 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: '파일 크기는 10MB 이하여야 합니다.' })
      return
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: '이미지 파일만 업로드 가능합니다.' })
      return
    }

    // 미리보기 생성
    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'idCard') {
        setIdCardImage(file)
        setIdCardPreview(reader.result as string)
      } else {
        setIdCardSelfieImage(file)
        setSelfiePreview(reader.result as string)
      }
      setMessage(null)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveFile = (type: 'idCard' | 'selfie') => {
    if (type === 'idCard') {
      setIdCardImage(null)
      setIdCardPreview(null)
    } else {
      setIdCardSelfieImage(null)
      setSelfiePreview(null)
    }
  }

  const handleSubmit = async () => {
    if (!idCardImage || !idCardSelfieImage) {
      setMessage({ type: 'error', text: '모든 사진을 업로드해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    // 시뮬레이션: 실제로는 파일 업로드 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000))

    setMessage({ type: 'success', text: '신분증 인증이 완료되었습니다.' })

    setTimeout(() => {
      onComplete({
        idCardImage,
        idCardSelfieImage,
      })
    }, 1000)

    setLoading(false)
  }

  const renderUploadArea = (
    type: 'idCard' | 'selfie',
    title: string,
    description: string,
    preview: string | null,
    file: File | null
  ) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary-500 transition-colors">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, type)}
        className="hidden"
        id={`file-${type}`}
      />

      {!preview ? (
        <label
          htmlFor={`file-${type}`}
          className="cursor-pointer flex flex-col items-center"
        >
          <PhotoIcon className="w-12 h-12 text-gray-400 mb-3" />
          <span className="text-sm font-medium text-gray-900 mb-1">{title}</span>
          <span className="text-xs text-gray-500 text-center">{description}</span>
          <span className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors">
            파일 선택
          </span>
        </label>
      ) : (
        <div className="space-y-3">
          <div className="relative">
            <img
              src={preview}
              alt={title}
              className="w-full h-48 object-contain rounded-lg bg-gray-50"
            />
            <button
              onClick={() => handleRemoveFile(type)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 truncate flex-1">{file?.name}</span>
            <span className="text-gray-500 ml-2">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)}MB` : ''}
            </span>
          </div>
          <label
            htmlFor={`file-${type}`}
            className="block text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors cursor-pointer"
          >
            다시 선택
          </label>
        </div>
      )}
    </div>
  )

  // 인증 방법 선택 화면
  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <CreditCardIcon className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">신분증 인증 방법을 선택하세요</h2>
        <p className="text-gray-600 mt-1">편리한 방법으로 신분증 인증을 진행하세요</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* 모바일 촬영 (추천) */}
        <button
          onClick={() => handleMethodSelect('mobile')}
          className="relative bg-white border-2 border-primary-500 rounded-xl p-6 hover:shadow-lg transition-all text-left group"
        >
          <span className="absolute top-3 right-3 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded">
            추천
          </span>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
              <DevicePhoneMobileIcon className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">모바일로 촬영</h3>
            <p className="text-sm text-gray-600 mb-4">스마트폰으로 직접 촬영하여 업로드</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ 더 선명한 촬영 품질</li>
              <li>✓ 간편한 촬영 절차</li>
              <li>✓ 실시간 촬영 가이드</li>
            </ul>
          </div>
        </button>

        {/* PC 업로드 */}
        <button
          onClick={() => handleMethodSelect('pc')}
          className="bg-white border-2 border-gray-300 rounded-xl p-6 hover:border-gray-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
              <ComputerDesktopIcon className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">PC에서 업로드</h3>
            <p className="text-sm text-gray-600 mb-4">이미 촬영한 사진을 업로드</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>✓ 기존 사진 활용</li>
              <li>✓ PC 환경에서 처리</li>
              <li>✓ 파일 직접 선택</li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  )

  // QR 코드 화면
  const renderQRCode = () => {
    const qrUrl = `${window.location.origin}/signup/mobile-verification?session=${sessionId}`

    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
            <DevicePhoneMobileIcon className="w-6 h-6 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">모바일로 신분증을 촬영하세요</h2>
          <p className="text-gray-600 mt-1">스마트폰 카메라로 QR 코드를 스캔하세요</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="p-6 bg-white border-2 border-gray-200 rounded-xl">
            <QRCodeSVG value={qrUrl} size={200} level="H" />
          </div>

          <div className="mt-6 w-full max-w-md">
            {mobileUploadStatus === 'waiting' && (
              <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-blue-600 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-blue-700">모바일 촬영 대기 중...</p>
                <p className="text-xs text-blue-600 mt-1">QR 코드를 스캔하고 신분증을 촬영해주세요</p>
              </div>
            )}

            {mobileUploadStatus === 'completed' && (
              <div className="space-y-4">
                <div className="text-center p-4 bg-primary-50 border border-primary-200 rounded-lg">
                  <CheckCircleIcon className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                  <p className="text-sm text-primary-700 font-medium">촬영 완료!</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-2">신분증 사진</p>
                    <img src={idCardPreview || ''} alt="신분증" className="w-full h-32 object-cover rounded-lg border" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-2">신분증 들고 촬영</p>
                    <img src={selfiePreview || ''} alt="셀카" className="w-full h-32 object-cover rounded-lg border" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleChangeMethod}
            className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
          >
            다른 방법으로 인증하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 방법 선택 안 함 */}
      {!method && renderMethodSelection()}

      {/* 모바일 방법 선택 */}
      {method === 'mobile' && renderQRCode()}

      {/* PC 방법 선택 */}
      {method === 'pc' && (
        <>
          {/* 헤더 */}
          <div className="text-center mb-6">
            <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <CreditCardIcon className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">신분증 인증을 진행합니다</h2>
            <p className="text-gray-600 mt-1">신분증 사진과 신분증을 들고 촬영한 셀카를 업로드하세요</p>
            <button
              onClick={handleChangeMethod}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              다른 방법으로 인증하기
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

      {/* 안내 사항 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">신분증 촬영 안내</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 주민등록증, 운전면허증, 여권 중 하나를 선택하여 촬영하세요</li>
          <li>• 주민등록번호 뒷자리는 마스킹테이프로 가려주세요 (보안)</li>
          <li>• 신분증의 다른 정보는 선명하게 보이도록 촬영하세요</li>
          <li>• 신분증을 들고 촬영한 셀카는 얼굴과 신분증이 모두 보여야 합니다</li>
          <li>• 사진은 흔들림 없이 선명하게 촬영해주세요</li>
          <li>• 파일 형식: JPG, PNG / 최대 크기: 10MB</li>
        </ul>
      </div>

      {/* 업로드 영역 */}
      <div className="space-y-6 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">1. 신분증 사진</h3>
          {renderUploadArea(
            'idCard',
            '신분증을 촬영하세요',
            '주민등록증, 운전면허증, 여권',
            idCardPreview,
            idCardImage
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">2. 신분증 들고 촬영한 셀카</h3>
          {renderUploadArea(
            'selfie',
            '신분증을 들고 촬영하세요',
            '얼굴과 신분증이 함께 보이도록',
            selfiePreview,
            idCardSelfieImage
          )}
        </div>
      </div>

          {/* 버튼 */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              이전
            </button>
            <button
              onClick={handleSubmit}
              disabled={!idCardImage || !idCardSelfieImage || loading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? '인증 중...' : '다음'}
            </button>
          </div>
        </>
      )}

      {/* 공통 버튼 (방법 선택 화면 또는 모바일 완료 상태) */}
      {(!method || (method === 'mobile' && mobileUploadStatus === 'completed')) && (
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onBack}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            이전
          </button>
          {method === 'mobile' && mobileUploadStatus === 'completed' && (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : null}
              {loading ? '인증 중...' : '다음'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
