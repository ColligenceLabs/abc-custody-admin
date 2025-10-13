'use client'

import { useState } from 'react'
import { DocumentCheckIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'
import { createUser } from '@/lib/api/auth'
import { DEFAULT_PERMISSIONS_BY_ROLE } from '@/types/user'

interface FundSourceStepProps {
  initialData: SignupData
  onComplete: (data: Partial<SignupData>) => void
  onBack: () => void
}

export default function FundSourceStep({ initialData, onComplete, onBack }: FundSourceStepProps) {
  const [fundSource, setFundSource] = useState(initialData.fundSource || '')
  const [fundSourceDetail, setFundSourceDetail] = useState(initialData.fundSourceDetail || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fundSources = [
    { value: 'salary', label: '급여 소득' },
    { value: 'business', label: '사업 소득' },
    { value: 'investment', label: '투자 수익' },
    { value: 'inheritance', label: '상속/증여' },
    { value: 'loan', label: '대출 자금' },
    { value: 'withdrawal', label: '예금 인출' },
    { value: 'crypto', label: '가상자산 거래' },
    { value: 'real_estate', label: '부동산 매각' },
    { value: 'other', label: '기타' },
  ]

  const handleSubmit = async () => {
    if (!fundSource) {
      setMessage({ type: 'error', text: '자금 출처를 선택해주세요.' })
      return
    }

    if (fundSource === 'other' && !fundSourceDetail.trim()) {
      setMessage({ type: 'error', text: '자금 출처 상세 내용을 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // 주민번호에서 생년월일 및 성별 추출
      // 형식: YYMMDD-G****** (예: 900515-1******)
      const residentNumber = initialData.residentNumber || ''
      const parts = residentNumber.split('-')
      const birthPart = parts[0] || ''
      const genderPart = parts[1] || ''

      const birthYear = birthPart.substring(0, 2)
      const birthMonth = birthPart.substring(2, 4)
      const birthDay = birthPart.substring(4, 6)
      const genderCode = genderPart.substring(0, 1)

      // 세기 판단 (1,2: 1900년대, 3,4: 2000년대)
      const century = ['1', '2'].includes(genderCode) ? '19' : '20'
      const birthDate = `${century}${birthYear}-${birthMonth}-${birthDay}`

      // 성별 판단 (1,3: 남성, 2,4: 여성)
      const gender = ['1', '3'].includes(genderCode) ? 'male' : 'female'

      // 회원가입 데이터 준비 (개인 회원 전용 필드 포함)
      const newUser = {
        name: initialData.name || '신규 사용자',
        email: initialData.email || `${initialData.phone?.replace(/-/g, '')}@temp.com`,
        phone: initialData.phone || '',
        role: 'viewer' as const,
        status: 'active' as const,
        lastLogin: '',
        permissions: DEFAULT_PERMISSIONS_BY_ROLE.viewer,
        department: '개인',
        position: '개인 회원',
        hasGASetup: false,
        isFirstLogin: true,
        // 개인 회원 전용 필드
        memberType: 'individual' as const,
        individualUserId: `IU${Date.now().toString().slice(-6)}`,
        memberId: `M${Date.now().toString().slice(-6)}`,
        birthDate: birthDate,
        gender: gender,
        residentNumber: initialData.residentNumber || '',
        identityVerified: true,
        kycLevel: 'level1' as const,
        kycVerifiedAt: new Date().toISOString(),
        walletLimit: {
          dailyWithdrawal: 10000000,
          monthlyWithdrawal: 50000000,
          singleTransaction: 5000000,
        },
        // 계좌 정보
        bankName: initialData.bankName || '',
        accountNumber: initialData.accountNumber || '',
        accountHolder: initialData.accountHolder || initialData.name || '',
        // 통신사 정보
        carrier: initialData.carrier || '',
        // 자금 출처
        fundSource: fundSource,
        fundSourceDetail: fundSource === 'other' ? fundSourceDetail : '',
      }

      // API로 사용자 생성
      const createdUser = await createUser(newUser)
      console.log('사용자 생성 완료:', createdUser)

      setMessage({ type: 'success', text: '회원가입이 완료되었습니다!' })

      setTimeout(() => {
        onComplete({
          fundSource,
          fundSourceDetail: fundSource === 'other' ? fundSourceDetail : '',
        })
      }, 1000)
    } catch (error) {
      console.error('회원가입 실패:', error)
      setMessage({ type: 'error', text: '회원가입에 실패했습니다. 다시 시도해주세요.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <DocumentCheckIcon className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">자금출처를 확인합니다</h2>
        <p className="text-gray-600 mt-1">금융거래 시 자금 출처 정보를 제공해야 합니다</p>
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
        <h4 className="text-sm font-medium text-blue-900 mb-2">자금출처 확인 안내</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 특정금융정보법에 따라 자금출처 확인이 필요합니다</li>
          <li>• 실제 자금의 주요 출처를 선택해주세요</li>
          <li>• 여러 출처가 있는 경우 가장 주요한 출처를 선택하세요</li>
          <li>• 기타를 선택한 경우 상세 내용을 입력해주세요</li>
        </ul>
      </div>

      {/* 자금 출처 선택 */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주요 자금 출처
          </label>
          <select
            value={fundSource}
            onChange={(e) => setFundSource(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">자금 출처를 선택하세요</option>
            {fundSources.map(source => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        {/* 기타 선택 시 상세 입력 */}
        {fundSource === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              자금 출처 상세
            </label>
            <textarea
              value={fundSourceDetail}
              onChange={(e) => setFundSourceDetail(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="자금 출처에 대해 상세히 설명해주세요"
            />
          </div>
        )}
      </div>

      {/* 추가 안내 */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong className="text-gray-700">개인정보 처리 방침:</strong> 입력하신 자금출처 정보는 금융거래법령에 따라 안전하게 보관되며,
          법률에서 정한 경우를 제외하고는 제3자에게 제공되지 않습니다.
        </p>
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
          disabled={!fundSource || (fundSource === 'other' && !fundSourceDetail.trim()) || loading}
          className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {loading ? '완료 중...' : '가입 완료'}
        </button>
      </div>
    </div>
  )
}
