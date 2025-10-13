'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface KYCStatusBannerProps {
  kycStatus: 'pending' | 'verified' | 'rejected' | 'skipped'
}

export default function KYCStatusBanner({ kycStatus }: KYCStatusBannerProps) {
  const router = useRouter()
  const [dismissed, setDismissed] = useState(false)

  // verified 상태이거나 배너가 닫힌 경우 표시하지 않음
  if (kycStatus === 'verified' || dismissed) return null

  // pending 또는 skipped 상태일 때만 배너 표시
  if (kycStatus !== 'pending' && kycStatus !== 'skipped') return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            eKYC 인증이 필요합니다
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              서비스 이용을 위해서는 본인 인증이 필요합니다.
              신분증 인증과 계좌 인증을 완료해주세요.
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={() => router.push('/kyc/verification')}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
            >
              지금 인증하기
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setDismissed(true)}
            className="inline-flex text-yellow-400 hover:text-yellow-600 transition-colors"
            aria-label="배너 닫기"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
