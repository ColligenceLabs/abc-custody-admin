'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  UserIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline'
import MemberTypeSelection from '@/components/signup/MemberTypeSelection'
import PhoneVerificationStep from '@/components/signup/PhoneVerificationStep'
import IDVerificationStep from '@/components/signup/IDVerificationStep'
import BankAccountStep from '@/components/signup/BankAccountStep'
import FundSourceStep from '@/components/signup/FundSourceStep'

export type SignupStep = 'type' | 'phone' | 'id' | 'bank' | 'fund' | 'completed'

export interface SignupData {
  memberType?: 'individual' | 'corporate'
  name?: string
  residentNumber?: string
  carrier?: string
  phone?: string
  idCardImage?: File
  idCardSelfieImage?: File
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  fundSource?: string
  fundSourceDetail?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<SignupStep>('type')
  const [signupData, setSignupData] = useState<SignupData>({})

  const steps = [
    { key: 'type' as SignupStep, label: '회원 유형', icon: UserGroupIcon },
    { key: 'phone' as SignupStep, label: '본인인증', icon: DocumentTextIcon },
    { key: 'id' as SignupStep, label: '신분증 인증', icon: CreditCardIcon },
    { key: 'bank' as SignupStep, label: '계좌 인증', icon: BanknotesIcon },
    { key: 'fund' as SignupStep, label: '자금출처', icon: DocumentCheckIcon },
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === currentStep)
  }

  const handleStepComplete = (step: SignupStep, data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }))

    const stepOrder: SignupStep[] = ['type', 'phone', 'id', 'bank', 'fund', 'completed']
    const currentIndex = stepOrder.indexOf(step)
    const nextStep = stepOrder[currentIndex + 1]

    if (nextStep) {
      setCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    const stepOrder: SignupStep[] = ['type', 'phone', 'id', 'bank', 'fund']
    const currentIndex = stepOrder.indexOf(currentStep)

    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1])
    }
  }

  const renderStepIndicator = () => {
    if (currentStep === 'type' || currentStep === 'completed') return null

    const visibleSteps = steps.filter(s => s.key !== 'type')
    const currentIndex = getCurrentStepIndex() - 1

    return (
      <div className="flex items-center justify-center mb-8 overflow-x-auto">
        <div className="flex items-center">
          {visibleSteps.map((step, index) => {
            const isActive = currentStep === step.key
            const isCompleted = currentIndex > index
            const Icon = step.icon

            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex flex-col items-center ${index < visibleSteps.length - 1 ? 'mr-4' : ''}`}>
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : isActive
                        ? 'border-primary-600 text-primary-600 bg-primary-50'
                        : 'border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    isActive ? 'text-primary-600' : isCompleted ? 'text-primary-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {index < visibleSteps.length - 1 && (
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 mx-2 mb-6" />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 제목 */}
        {currentStep !== 'completed' && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
            <p className="mt-2 text-gray-600">
              {currentStep === 'type' ? '회원 유형을 선택해주세요' : '가상자산 커스터디 서비스 이용을 위한 본인 확인'}
            </p>
          </div>
        )}

        {/* 단계 표시기 */}
        {renderStepIndicator()}

        {/* 단계별 컴포넌트 */}
        {currentStep === 'type' && (
          <MemberTypeSelection
            onComplete={(data) => handleStepComplete('type', data)}
          />
        )}

        {currentStep === 'phone' && (
          <PhoneVerificationStep
            initialData={signupData}
            onComplete={(data) => handleStepComplete('phone', data)}
            onBack={handleBack}
          />
        )}

        {currentStep === 'id' && (
          <IDVerificationStep
            initialData={signupData}
            onComplete={(data) => handleStepComplete('id', data)}
            onBack={handleBack}
          />
        )}

        {currentStep === 'bank' && (
          <BankAccountStep
            initialData={signupData}
            onComplete={(data) => handleStepComplete('bank', data)}
            onBack={handleBack}
          />
        )}

        {currentStep === 'fund' && (
          <FundSourceStep
            initialData={signupData}
            onComplete={(data) => handleStepComplete('fund', data)}
            onBack={handleBack}
          />
        )}

        {currentStep === 'completed' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-primary-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">회원가입 완료</h2>
            <p className="text-gray-600 mb-6">
              가상자산 커스터디 서비스 회원가입이 완료되었습니다.<br />
              로그인하여 서비스를 이용해주세요.
            </p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              로그인하러 가기
            </button>
          </div>
        )}

        {/* 하단 안내 */}
        {currentStep !== 'completed' && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary-600 hover:text-primary-700"
              >
                로그인
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
