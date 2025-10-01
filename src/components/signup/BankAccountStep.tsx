'use client'

import { useState } from 'react'
import { BanknotesIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'
import OneWonVerification from '@/components/security/OneWonVerification'

interface BankAccountStepProps {
  initialData: SignupData
  onComplete: (data: Partial<SignupData>) => void
  onBack: () => void
}

export default function BankAccountStep({ initialData, onComplete, onBack }: BankAccountStepProps) {
  const [bankName, setBankName] = useState(initialData.bankName || '')
  const [accountNumber, setAccountNumber] = useState(initialData.accountNumber || '')
  const [accountHolder, setAccountHolder] = useState(initialData.accountHolder || initialData.name || '')
  const [showVerification, setShowVerification] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const banks = [
    'KB국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행',
    'IBK기업은행', 'SC제일은행', '카카오뱅크', '토스뱅크', '케이뱅크',
    '부산은행', '대구은행', '경남은행', '광주은행', '전북은행',
    '제주은행', '수협은행', '새마을금고', '신협', '우체국'
  ]

  const handleStartVerification = () => {
    if (!bankName || !accountNumber || !accountHolder) {
      setMessage({ type: 'error', text: '모든 정보를 입력해주세요.' })
      return
    }

    setMessage(null)
    setShowVerification(true)
  }

  const handleVerificationComplete = (isSuccess: boolean) => {
    setShowVerification(false)

    if (isSuccess) {
      setMessage({ type: 'success', text: '계좌 인증이 완료되었습니다.' })
      setTimeout(() => {
        onComplete({
          bankName,
          accountNumber,
          accountHolder,
        })
      }, 1000)
    } else {
      setMessage({ type: 'error', text: '계좌 인증에 실패했습니다. 다시 시도해주세요.' })
    }
  }

  const handleCancel = () => {
    setShowVerification(false)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
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
          <h4 className="text-sm font-medium text-blue-900 mb-2">1원 인증 안내</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 본인 명의의 은행 계좌만 등록 가능합니다</li>
            <li>• 입력하신 계좌로 1원을 입금합니다</li>
            <li>• 입금내역에서 4자리 인증번호를 확인하여 입력하세요</li>
            <li>• 인증 시간은 5분이며, 3회까지 시도 가능합니다</li>
            <li>• 인증이 완료되면 1원은 자동으로 환불됩니다</li>
          </ul>
        </div>

        {/* 입력 폼 */}
        <div className="space-y-4">
          {/* 은행 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              은행
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">은행을 선택하세요</option>
              {banks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>

          {/* 계좌번호 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              계좌번호
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="'-' 없이 숫자만 입력"
            />
          </div>

          {/* 예금주명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              예금주명
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="예금주 이름"
            />
            <p className="mt-1 text-xs text-gray-500">
              본인인증 시 입력한 이름과 동일해야 합니다
            </p>
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
            onClick={handleStartVerification}
            disabled={!bankName || !accountNumber || !accountHolder}
            className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            1원 인증 시작
          </button>
        </div>
      </div>

      {/* 1원 인증 모달 */}
      {showVerification && (
        <OneWonVerification
          bankName={bankName}
          accountNumber={accountNumber}
          accountHolder={accountHolder}
          onComplete={handleVerificationComplete}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}
