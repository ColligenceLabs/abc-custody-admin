'use client'

import { useState, useEffect } from 'react'
import {
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { Modal } from '@/components/common/Modal'

interface OneWonVerificationProps {
  bankName: string
  accountNumber: string
  accountHolder: string
  onComplete: (isSuccess: boolean) => void
  onCancel: () => void
}

type VerificationStep = 'sending' | 'waiting' | 'input' | 'verifying' | 'success' | 'failed'

export default function OneWonVerification({
  bankName,
  accountNumber,
  accountHolder,
  onComplete,
  onCancel
}: OneWonVerificationProps) {
  const [step, setStep] = useState<VerificationStep>('sending')
  const [verificationCode, setVerificationCode] = useState('')
  const [timeLeft, setTimeLeft] = useState(300) // 5분
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3

  // 타이머 관리
  useEffect(() => {
    if (step === 'waiting' || step === 'input') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setStep('failed')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step])

  // 1원 입금 시뮬레이션
  useEffect(() => {
    if (step === 'sending') {
      const timer = setTimeout(() => {
        setStep('waiting')
        // 실제로는 여기서 실제 1원 입금 API 호출
        setTimeout(() => {
          setStep('input')
        }, 2000)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [step])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatAccountNumber = (accountNum: string) => {
    if (accountNum.length <= 4) return accountNum
    return accountNum.slice(0, -4).replace(/./g, '*') + accountNum.slice(-4)
  }

  const handleVerification = async () => {
    if (!verificationCode.trim()) return

    setStep('verifying')

    // 시뮬레이션: 실제로는 서버에서 확인
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 임시 검증 로직 (실제로는 서버에서 처리)
    const isValid = verificationCode === '1234' // 예시 코드

    if (isValid) {
      setStep('success')
      setTimeout(() => onComplete(true), 1500)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= maxAttempts) {
        setStep('failed')
        setTimeout(() => onComplete(false), 1500)
      } else {
        setStep('input')
        setVerificationCode('')
      }
    }
  }

  const handleRetry = () => {
    setStep('sending')
    setTimeLeft(300)
    setAttempts(0)
    setVerificationCode('')
  }

  return (
    <Modal isOpen={true}>
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 mb-4">
            <BanknotesIcon className="h-6 w-6 text-primary-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">1원 인증</h3>
          <p className="text-sm text-gray-600">
            {bankName} {formatAccountNumber(accountNumber)} ({accountHolder})
          </p>
        </div>

        {/* Content based on step */}
        <div className="space-y-4">
          {step === 'sending' && (
            <div className="text-center py-6">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 mx-auto mb-4 animate-spin" />
              <h4 className="text-base font-medium text-gray-900 mb-2">
                1원을 입금하고 있습니다
              </h4>
              <p className="text-sm text-gray-600">
                계좌 확인을 위해 1원을 입금하고 있습니다.<br />
                잠시만 기다려주세요.
              </p>
            </div>
          )}

          {step === 'waiting' && (
            <div className="text-center py-6">
              <ClockIcon className="h-8 w-8 text-yellow-600 mx-auto mb-4" />
              <h4 className="text-base font-medium text-gray-900 mb-2">
                입금 처리 중
              </h4>
              <p className="text-sm text-gray-600">
                은행에서 입금을 처리하고 있습니다.<br />
                곧 인증번호를 확인할 수 있습니다.
              </p>
            </div>
          )}

          {step === 'input' && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-4" />
                <h4 className="text-base font-medium text-gray-900 mb-2">
                  1원 입금 완료
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  계좌에 1원이 입금되었습니다.<br />
                  입금내역에서 4자리 인증번호를 확인해주세요.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">인증번호 확인 방법</p>
                    <ul className="text-xs space-y-1">
                      <li>• 모바일 뱅킹 앱의 거래내역 확인</li>
                      <li>• 입금자명에 표시된 4자리 숫자</li>
                      <li>• 예시: "컬리전스1234" → 인증번호: 1234</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증번호 (4자리)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-mono tracking-widest focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="1234"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  남은 시간: <span className="font-mono text-red-600">{formatTime(timeLeft)}</span>
                </span>
                <span className="text-gray-600">
                  시도: {attempts}/{maxAttempts}
                </span>
              </div>

              {attempts > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    인증번호가 올바르지 않습니다. ({maxAttempts - attempts}회 남음)
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'verifying' && (
            <div className="text-center py-6">
              <ArrowPathIcon className="h-8 w-8 text-primary-600 mx-auto mb-4 animate-spin" />
              <h4 className="text-base font-medium text-gray-900 mb-2">
                인증번호 확인 중
              </h4>
              <p className="text-sm text-gray-600">
                입력하신 인증번호를 확인하고 있습니다.
              </p>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mx-auto mb-4" />
              <h4 className="text-base font-medium text-gray-900 mb-2">
                인증 완료!
              </h4>
              <p className="text-sm text-gray-600">
                계좌 인증이 성공적으로 완료되었습니다.<br />
                이제 해당 계좌를 사용할 수 있습니다.
              </p>
            </div>
          )}

          {step === 'failed' && (
            <div className="text-center py-6">
              <ExclamationCircleIcon className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <h4 className="text-base font-medium text-gray-900 mb-2">
                인증 실패
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                {timeLeft === 0
                  ? "인증 시간이 만료되었습니다."
                  : "인증 횟수를 초과했습니다."
                }
                <br />다시 시도해주세요.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-3 mt-6">
          {(step === 'input' || step === 'failed') && (
            <>
              <button
                onClick={step === 'failed' ? handleRetry : onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {step === 'failed' ? '다시 시도' : '취소'}
              </button>
              {step === 'input' && (
                <button
                  onClick={handleVerification}
                  disabled={verificationCode.length !== 4}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  인증하기
                </button>
              )}
              {step === 'failed' && (
                <button
                  onClick={() => onComplete(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  닫기
                </button>
              )}
            </>
          )}

          {step === 'sending' || step === 'waiting' || step === 'verifying' ? (
            <button
              onClick={onCancel}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          ) : null}
        </div>
      </div>
    </Modal>
  )
}