'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  UserIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  CreditCardIcon,
  BanknotesIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import MemberTypeSelection from '@/components/signup/MemberTypeSelection'
import EmailVerificationStep from '@/components/signup/EmailVerificationStep'
import PassVerificationStep from '@/components/signup/PassVerificationStep'
import IDAndAccountVerificationStep from '@/components/signup/IDAndAccountVerificationStep'
import FundSourceStep from '@/components/signup/FundSourceStep'

export type SignupStep = 'type' | 'email' | 'phone' | 'kyc' | 'fund' | 'completed'

export interface SignupData {
  memberType?: 'individual' | 'corporate'
  email?: string
  name?: string
  residentNumber?: string
  carrier?: string
  phone?: string
  kycStatus?: 'pending' | 'verified' | 'skipped'
  kycMethod?: 'mobile' | 'pc'
  idVerified?: boolean
  idCardImage?: File
  idCardSelfieImage?: File
  accountVerified?: boolean
  bankName?: string
  accountNumber?: string
  accountHolder?: string
  financeCode?: string
  idCardImageBase64?: string
  selfieImageBase64?: string
  kycResultType?: 1 | 2 | 5
  kycReviewData?: any
  fundSource?: string
  fundSourceDetail?: string
  // PASS 본인인증 관련 (신규)
  passVerified?: boolean
  passName?: string
  passPhone?: string
  passBirthDate?: string
  passGender?: string
  passCi?: string
  passDi?: string
  passIdentityId?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<SignupStep>('type')
  const [signupData, setSignupData] = useState<SignupData>({})

  // eKYC iframe postMessage 이벤트 리스너
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      try {
        // postMessage 데이터 디코딩
        const decodedData = decodeURIComponent(atob(event.data))
        const json = JSON.parse(decodedData)

        console.log('[Signup] eKYC postMessage 수신:', json)

        // review_result가 있는지 확인
        if (json.review_result) {
          const reviewResult = json.review_result
          const kycData: Partial<SignupData> = {}

          // DEBUG: 전체 review_result 구조 출력
          console.log('[Signup] review_result 구조:', {
            hasIdCard: !!reviewResult.id_card,
            hasFaceCheck: !!reviewResult.face_check,
            hasAccount: !!reviewResult.account,
            resultType: reviewResult.result_type,
            module: reviewResult.module,
            faceCheckKeys: reviewResult.face_check ? Object.keys(reviewResult.face_check) : []
          })

          // result_type 저장 (1: 자동승인, 2: 자동거부, 5: 수동심사)
          if (reviewResult.result_type) {
            kycData.kycResultType = reviewResult.result_type
            kycData.kycReviewData = reviewResult
            console.log('[Signup] eKYC result_type:', reviewResult.result_type)
          }

          // result_type이 2(자동거부)인 경우 차단
          if (reviewResult.result_type === 2) {
            alert('eKYC 인증이 거부되었습니다. 고객센터로 문의해주세요.')
            console.error('[Signup] eKYC 자동거부 (result_type: 2)')
            return
          }

          // result_type이 1(자동승인) 또는 5(수동심사)인 경우에만 이미지 저장
          if (reviewResult.result_type === 1 || reviewResult.result_type === 5) {
            // 신분증 이미지 (마스킹된 이미지)
            if (reviewResult.id_card?.id_card_image) {
              kycData.idCardImageBase64 = reviewResult.id_card.id_card_image
              console.log('[Signup] 신분증 이미지 데이터 추출 완료')
            }

            // 셀피 이미지 추가
            console.log('[Signup] face_check 확인:', {
              hasFaceCheck: !!reviewResult.face_check,
              hasSelfie: !!reviewResult.face_check?.selfie_image,
              selfieLength: reviewResult.face_check?.selfie_image?.length
            })
            if (reviewResult.face_check?.selfie_image) {
              kycData.selfieImageBase64 = reviewResult.face_check.selfie_image
              console.log('[Signup] 셀피 이미지 데이터 추출 완료')
            } else {
              console.error('[Signup] 셀피 이미지 없음!')
            }

            // 계좌 정보
            if (reviewResult.account) {
              const account = reviewResult.account

              if (account.finance_company) {
                kycData.bankName = account.finance_company
              }
              if (account.account_number) {
                kycData.accountNumber = account.account_number
              }
              if (account.account_holder) {
                kycData.accountHolder = account.account_holder
              }
              if (account.finance_code) {
                kycData.financeCode = account.finance_code
              }

              console.log('[Signup] 계좌 정보 추출 완료:', {
                bankName: kycData.bankName,
                accountNumber: kycData.accountNumber,
                accountHolder: kycData.accountHolder,
                financeCode: kycData.financeCode
              })
            }
          }

          // signupData 업데이트
          if (Object.keys(kycData).length > 0) {
            setSignupData(prev => ({
              ...prev,
              ...kycData
            }))
            console.log('[Signup] KYC 데이터 저장 완료')
          }
        }
      } catch (error) {
        // base64 디코딩 실패 또는 JSON 파싱 실패는 무시
        // (일반 postMessage 이벤트일 수 있음)
        console.debug('[Signup] postMessage 처리 실패 (무시):', error)
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('message', handlePostMessage)

    // 클린업
    return () => {
      window.removeEventListener('message', handlePostMessage)
    }
  }, [])

  const steps = [
    { key: 'type' as SignupStep, label: '회원 유형', icon: UserGroupIcon },
    { key: 'email' as SignupStep, label: '이메일 인증', icon: EnvelopeIcon },
    { key: 'phone' as SignupStep, label: '본인인증', icon: DocumentTextIcon },
    { key: 'kyc' as SignupStep, label: 'eKYC 인증', icon: CreditCardIcon },
    { key: 'fund' as SignupStep, label: '자금출처', icon: DocumentCheckIcon },
  ]

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.key === currentStep)
  }

  const handleStepComplete = (step: SignupStep, data: Partial<SignupData>) => {
    setSignupData(prev => ({ ...prev, ...data }))

    const stepOrder: SignupStep[] = ['type', 'email', 'phone', 'kyc', 'fund', 'completed']
    const currentIndex = stepOrder.indexOf(step)
    const nextStep = stepOrder[currentIndex + 1]

    if (nextStep) {
      setCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    const stepOrder: SignupStep[] = ['type', 'email', 'phone', 'kyc', 'fund']
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

        {currentStep === 'email' && (
          <EmailVerificationStep
            initialData={signupData}
            onComplete={(data) => handleStepComplete('email', data)}
            onBack={handleBack}
          />
        )}

        {currentStep === 'phone' && (
          <PassVerificationStep
            initialData={signupData}
            onComplete={(data) => {
              console.log('[Signup] PASS 정보 저장:', data);
              // PASS 정보를 signupData에 저장
              setSignupData(prev => ({
                ...prev,
                ...data,
                name: data.passName,
                phone: data.passPhone,
                residentNumber: data.passBirthDate ?
                  `${data.passBirthDate.replace(/-/g, '').substring(2)}-${data.passGender === 'MALE' ? '1' : '2'}******` :
                  prev.residentNumber
              }));
              handleStepComplete('phone', data);
            }}
            onBack={handleBack}
          />
        )}

        {currentStep === 'kyc' && (
          <IDAndAccountVerificationStep
            initialData={signupData}
            onComplete={(data) => handleStepComplete('kyc', data)}
            onBack={handleBack}
            skipMethodSelection={true}
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
              {signupData.kycStatus === 'skipped' ? (
                <ExclamationTriangleIcon className="w-10 h-10 text-yellow-600" />
              ) : (
                <CheckCircleIcon className="w-10 h-10 text-primary-600" />
              )}
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              회원가입 완료
            </h2>

            {signupData.kycStatus === 'skipped' ? (
              <div className="mb-6">
                <p className="text-gray-600 mb-4">
                  가상자산 커스터디 서비스 회원가입이 완료되었습니다.
                </p>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    eKYC 인증이 완료되지 않았습니다.<br />
                    로그인 후 인증을 완료하시면 모든 서비스를 이용하실 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                가상자산 커스터디 서비스 회원가입이 완료되었습니다.<br />
                로그인하여 서비스를 이용해주세요.
              </p>
            )}

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
