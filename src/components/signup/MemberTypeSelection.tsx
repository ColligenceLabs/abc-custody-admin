'use client'

import { UserIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'

interface MemberTypeSelectionProps {
  onComplete: (data: Partial<SignupData>) => void
}

export default function MemberTypeSelection({ onComplete }: MemberTypeSelectionProps) {
  const handleSelectIndividual = () => {
    onComplete({ memberType: 'individual' })
  }

  const handleSelectCorporate = () => {
    // 법인 회원은 별도 문의 페이지로 이동
    window.location.href = 'https://example.com/corporate-inquiry'
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 개인 회원 */}
      <button
        onClick={handleSelectIndividual}
        className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-primary-500 hover:shadow-md transition-all p-8 text-center group"
      >
        <div className="mx-auto w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
          <UserIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">개인 회원</h3>
        <p className="text-gray-600 mb-4">
          개인 명의로 가상자산 커스터디<br />
          서비스를 이용하시는 경우
        </p>
        <div className="inline-flex items-center text-primary-600 font-medium">
          회원가입 진행
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>

      {/* 법인 회원 */}
      <button
        onClick={handleSelectCorporate}
        className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all p-8 text-center group"
      >
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
          <BuildingOfficeIcon className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">법인 회원</h3>
        <p className="text-gray-600 mb-4">
          법인 명의로 가상자산 커스터디<br />
          서비스를 이용하시는 경우
        </p>
        <div className="inline-flex items-center text-indigo-600 font-medium">
          문의하기
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </button>
    </div>
  )
}
