'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IDAndAccountVerificationStep from '@/components/signup/IDAndAccountVerificationStep'
import { SignupData } from '@/app/signup/page'

export default function KYCVerificationPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<SignupData>({
    // TODO: API에서 로그인한 사용자 정보를 가져와야 함
    name: '',
    email: '',
    phone: '',
    residentNumber: ''
  })

  useEffect(() => {
    // TODO: 로그인한 사용자 정보를 API에서 가져오기
    // const fetchUserData = async () => {
    //   try {
    //     const response = await fetch('/api/user/info')
    //     const data = await response.json()
    //     setUserData({
    //       name: data.name,
    //       email: data.email,
    //       phone: data.phone,
    //       residentNumber: data.residentNumber
    //     })
    //   } catch (error) {
    //     console.error('사용자 정보 로드 오류:', error)
    //   }
    // }
    // fetchUserData()
  }, [])

  const handleComplete = async (data: Partial<SignupData>) => {
    // eKYC 인증 완료 API 호출
    try {
      // TODO: 실제 API 구현 필요
      // const response = await fetch('/api/user/kyc/complete', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     idVerified: data.idVerified,
      //     accountVerified: data.accountVerified,
      //     kycStatus: 'verified'
      //   })
      // })

      // if (response.ok) {
      //   alert('eKYC 인증이 완료되었습니다!')
      //   router.push('/dashboard')
      // } else {
      //   throw new Error('인증 완료 처리 실패')
      // }

      // 임시 처리: 성공 메시지 표시 후 대시보드로 이동
      console.log('eKYC 인증 완료:', data)
      alert('eKYC 인증이 완료되었습니다!')
      router.push('/dashboard')
    } catch (error) {
      console.error('eKYC 인증 완료 오류:', error)
      alert('eKYC 인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  const handleBack = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">eKYC 인증</h1>
          <p className="mt-2 text-gray-600">
            서비스 이용을 위해 본인 인증을 완료해주세요
          </p>
        </div>

        <IDAndAccountVerificationStep
          initialData={userData}
          onComplete={handleComplete}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}
