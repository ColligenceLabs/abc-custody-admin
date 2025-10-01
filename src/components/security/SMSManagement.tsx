'use client'

import { useState } from 'react'
import {
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { Modal } from '@/components/common/Modal'

interface SMSManagementProps {
  isVisible: boolean
  onClose: () => void
  initialEnabled: boolean
  onStatusChange: (enabled: boolean) => void
  policyEnabled: boolean
}

export default function SMSManagement({
  isVisible,
  onClose,
  initialEnabled,
  onStatusChange,
  policyEnabled
}: SMSManagementProps) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('+82 010-1234-5678')
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const formatPhoneNumber = (phone: string) => {
    // 실제로는 더 정교한 포맷팅 로직 필요
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 11 && cleaned.startsWith('010')) {
      return `+82 ${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`
    }
    return phone
  }

  const sendVerificationCode = () => {
    setIsVerifying(true)
    // 실제로는 SMS 발송 API 호출
    setTimeout(() => {
      setIsVerifying(false)
      alert('인증번호가 발송되었습니다.')
    }, 2000)
  }

  const handleEnable = () => {
    if (!phoneNumber) {
      setShowSetupModal(true)
    } else {
      sendVerificationCode()
    }
  }

  const handleVerify = () => {
    if (verificationCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.')
      return
    }

    // 실제로는 서버에서 검증
    if (verificationCode === '123456') {
      setIsEnabled(true)
      onStatusChange(true)
      setShowSetupModal(false)
      setVerificationCode('')
      alert('SMS 인증이 활성화되었습니다.')
    } else {
      alert('인증번호가 올바르지 않습니다.')
    }
  }

  const handleDisable = () => {
    if (policyEnabled) {
      if (confirm('시스템 정책에 의해 SMS 인증이 필수로 설정되어 있습니다.\n\n연동을 해제하면 다음 로그인 시 SMS 인증 코드를 요구받지만 받을 수 없어 로그인이 불가능합니다.\n\n정말 연동을 해제하시겠습니까?')) {
        setIsEnabled(false)
        onStatusChange(false)
        alert('연동이 해제되었습니다. 다음 로그인 시 문제가 발생할 수 있으니 시스템 관리자에게 문의하세요.')
      }
    } else {
      if (confirm('SMS 인증 연동을 해제하시겠습니까?')) {
        setIsEnabled(false)
        onStatusChange(false)
      }
    }
  }

  const handlePhoneNumberUpdate = () => {
    if (!newPhoneNumber) {
      alert('전화번호를 입력해주세요.')
      return
    }

    setPhoneNumber(formatPhoneNumber(newPhoneNumber))
    setNewPhoneNumber('')
    setShowEditModal(false)
    alert('전화번호가 변경되었습니다.')
  }

  const testSMS = () => {
    alert(`${phoneNumber}로 테스트 SMS를 발송했습니다.`)
  }

  if (!isVisible) return null

  return (
    <div className="space-y-6">
      {/* SMS 인증 관리 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DevicePhoneMobileIcon className="h-6 w-6 mr-2 text-primary-600" />
              내 SMS 인증 설정
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              현재 로그인한 관리자 계정의 SMS 인증을 설정합니다
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isEnabled ? (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                연동됨
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                미연동
              </span>
            )}
          </div>
        </div>

        {!isEnabled ? (
          // 설정 섹션
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">SMS 인증이란?</p>
                  <p>
                    등록된 휴대폰 번호로 6자리 인증번호를 발송하여 본인 확인을 하는 방법입니다.
                    간편하게 사용할 수 있지만, 통신사 의존성이 있어 Google Authenticator 병행 사용을 권장합니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-1">주의사항</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>해외 로밍 시 SMS 수신이 제한될 수 있습니다</li>
                    <li>통신사 장애 시 인증코드를 받을 수 없습니다</li>
                    <li>SIM 스와핑 공격에 취약할 수 있습니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={handleEnable}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                내 계정에 SMS 인증 연동하기
              </button>
            </div>
          </div>
        ) : (
          // 관리 섹션
          <div className="space-y-6">
            {policyEnabled && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-gray-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium mb-1">시스템 정책 적용 중</p>
                    <p>
                      현재 시스템 정책에 의해 SMS 인증이 필수로 설정되어 있습니다.
                      연동을 해제할 수 있지만, 다음 로그인 시 인증 코드를 요구받게 됩니다.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">연동된 전화번호</h4>
                <p className="text-sm text-gray-700 font-mono">
                  {phoneNumber}
                </p>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-sm text-gray-600 hover:text-gray-800 underline mt-2 flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  번호 변경
                </button>
              </div>

              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">인증 테스트</h4>
                <p className="text-sm text-gray-700 mb-3">
                  SMS 인증이 정상 작동하는지 확인해보세요
                </p>
                <button
                  onClick={testSMS}
                  className="text-sm bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                >
                  테스트 SMS 발송
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDisable}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                SMS 인증 연동 해제
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 전화번호 설정/변경 모달 */}
      <Modal isOpen={showSetupModal || showEditModal}>
        <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {showSetupModal ? '전화번호 등록' : '전화번호 변경'}
              </h3>
              <button
                onClick={() => {
                  setShowSetupModal(false)
                  setShowEditModal(false)
                  setNewPhoneNumber('')
                  setVerificationCode('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <button
                  onClick={sendVerificationCode}
                  disabled={!newPhoneNumber || isVerifying}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isVerifying ? '발송 중...' : '인증번호 발송'}
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증번호
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="123456"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowSetupModal(false)
                    setShowEditModal(false)
                    setNewPhoneNumber('')
                    setVerificationCode('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={showSetupModal ? handleVerify : handlePhoneNumberUpdate}
                  disabled={verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {showSetupModal ? '인증하기' : '변경하기'}
                </button>
              </div>
            </div>
        </div>
      </Modal>
    </div>
  )
}