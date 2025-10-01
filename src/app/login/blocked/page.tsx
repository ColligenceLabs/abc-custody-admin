'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function BlockedPage() {
  const router = useRouter()
  const [cooldown, setCooldown] = useState(0)
  const [isValidating, setIsValidating] = useState(true)
  const [blockedInfo, setBlockedInfo] = useState<{until: number, reason: string, email?: string} | null>(null)

  // localStorage에서 차단 정보 가져오기 및 유효성 검사를 하나의 useEffect에서 처리
  useEffect(() => {
    try {
      const stored = localStorage.getItem('blocked_info')
      if (!stored) {
        console.log('차단 정보가 없어서 로그인 페이지로 리다이렉트')
        router.replace('/login')
        return
      }

      const info = JSON.parse(stored)
      const blockedUntil = info.until || 0

      console.log('차단 페이지 접근 - blockedUntil:', blockedUntil, 'Date.now():', Date.now())

      // 유효성 검사
      if (!blockedUntil || isNaN(blockedUntil)) {
        console.log('유효하지 않은 파라미터로 로그인 페이지로 리다이렉트')
        router.replace('/login')
        return
      }

      // 차단 시간이 이미 만료된 경우
      if (blockedUntil <= Date.now()) {
        console.log('차단 시간 만료로 로그인 페이지로 리다이렉트')
        localStorage.removeItem('blocked_info')
        router.replace('/login')
        return
      }

      // 차단 시간이 현재보다 너무 먼 미래인 경우 (24시간 이상)
      const maxBlockTime = 24 * 60 * 60 * 1000
      if (blockedUntil - Date.now() > maxBlockTime) {
        console.log('차단 시간이 너무 길어서 로그인 페이지로 리다이렉트')
        localStorage.removeItem('blocked_info')
        router.replace('/login')
        return
      }

      // 모든 검사 통과 - 차단 정보 설정
      console.log('차단 페이지 유효성 검사 통과')
      setBlockedInfo(info)
      setIsValidating(false)

    } catch (error) {
      console.log('localStorage 읽기 오류로 로그인 페이지로 리다이렉트')
      router.replace('/login')
      return
    }
  }, [router])

  const blockedUntil = blockedInfo?.until || 0
  const reason = blockedInfo?.reason || '너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다'

  // 차단 정보가 설정된 후에만 카운트다운 시작
  useEffect(() => {
    if (!blockedInfo || isValidating) return

    const updateCooldown = () => {
      const remaining = Math.max(0, blockedUntil - Date.now())
      if (remaining > 0) {
        setCooldown(Math.ceil(remaining / 1000))
      } else {
        // 차단 시간 만료 시 localStorage 정리하고 로그인 페이지로 이동
        localStorage.removeItem('blocked_info')

        // 실패 시도 횟수도 초기화
        const email = blockedInfo?.email
        if (email) {
          localStorage.removeItem(`login_attempts_${email}`)
        }

        router.replace('/login')
      }
    }

    updateCooldown() // 즉시 실행
    const timer = setInterval(updateCooldown, 1000)
    return () => clearInterval(timer)
  }, [blockedInfo, blockedUntil, router])

  const handleContactSupport = () => {
    // 관리자 문의 기능 구현 (예: 이메일, 채팅 등)
    alert('관리자에게 문의해주세요: support@company.com')
  }

  // 검증 중일 때 로딩 표시
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-2 text-sm text-gray-600">접근 권한을 확인하는 중...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 제목 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">로그인 차단</h1>
          <p className="mt-2 text-gray-600">계정 보안을 위한 임시 조치입니다</p>
        </div>

        {/* 차단 상태 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-8 h-8 text-gray-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">접근이 일시적으로 제한됨</h2>
            <p className="text-gray-600 mt-2">{reason}</p>
          </div>

          {/* 카운트다운 타이머 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-700 mb-3 tracking-wider">
                {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-sm text-gray-600">
                남은 대기 시간
              </p>
              <p className="text-xs text-gray-500 mt-1">
                위 시간이 지나면 자동으로 로그인 페이지로 이동합니다
              </p>
            </div>
          </div>

          {/* 안내 정보 */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">이런 경우에 차단됩니다:</h3>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• 연속으로 잘못된 인증 정보 입력</li>
                <li>• 짧은 시간 내 과도한 로그인 시도</li>
                <li>• 보안 정책 위반이 감지된 경우</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">차단을 방지하려면:</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• 올바른 이메일 주소와 인증 코드 확인</li>
                <li>• OTP 앱의 시간 동기화 확인</li>
                <li>• SMS 수신이 원활한지 확인</li>
              </ul>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="space-y-3">
            <button
              onClick={handleContactSupport}
              className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              관리자에게 문의
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('blocked_info')

                // 실패 시도 횟수도 초기화
                const email = blockedInfo?.email
                if (email) {
                  localStorage.removeItem(`login_attempts_${email}`)
                }

                router.push('/login')
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              로그인 페이지로 돌아가기
            </button>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            계속해서 문제가 발생한다면 네트워크 연결 상태를 확인하거나<br />
            관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  )
}