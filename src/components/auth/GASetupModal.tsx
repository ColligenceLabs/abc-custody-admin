'use client';

import { useState, useEffect } from 'react'
import {
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { QRCodeSVG } from 'qrcode.react'
import * as OTPAuth from 'otpauth'
import { Modal } from '@/components/common/Modal'

interface GASetupModalProps {
  isOpen: boolean
  user: {
    name: string
    email: string
  }
  onComplete: (secretKey: string) => void
}

export default function GASetupModal({
  isOpen,
  user,
  onComplete
}: GASetupModalProps) {
  const [currentStep, setCurrentStep] = useState<'setup' | 'verify' | 'backup'>('setup')
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isVerifying, setIsVerifying] = useState(false)
  const [totp, setTotp] = useState<OTPAuth.TOTP | null>(null)
  const [secretKey, setSecretKey] = useState('')

  // 모달이 열릴 때마다 state 초기화 및 시크릿 키 생성
  useEffect(() => {
    if (isOpen) {
      // State 초기화
      setCurrentStep('setup')
      setVerificationCode('')
      setBackupCodes([])
      setIsVerifying(false)

      // 새로운 TOTP 인스턴스 생성
      const secret = new OTPAuth.Secret({ size: 20 })
      const newTotp = new OTPAuth.TOTP({
        issuer: 'CustodyDashboard',
        label: user.email,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: secret
      })
      setTotp(newTotp)
      setSecretKey(secret.base32)
    }
  }, [isOpen, user.email])

  const qrCodeUrl = totp?.toString() || ''

  const generateBackupCodes = () => {
    const codes: string[] = []
    // 10개의 백업 코드 생성 (각 8자리, 4-4 형식)
    for (let i = 0; i < 10; i++) {
      // 암호학적으로 안전한 랜덤 생성
      const array = new Uint8Array(4)
      crypto.getRandomValues(array)

      // 16진수로 변환하여 8자리 코드 생성
      const hex = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()

      // 4-4 형식으로 포맷팅 (예: ABCD-EFGH)
      const formatted = `${hex.substring(0, 4)}-${hex.substring(4, 8)}`
      codes.push(formatted)
    }
    return codes
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.')
      return
    }

    if (!totp) {
      alert('TOTP 인스턴스가 생성되지 않았습니다. 페이지를 새로고침해주세요.')
      return
    }

    setIsVerifying(true)

    try {
      // TOTP 검증 (±2 윈도우 = ±60초)
      const delta = totp.validate({
        token: verificationCode,
        window: 2
      })

      console.log('TOTP 검증 결과:', delta, '시크릿 키:', secretKey, '입력 코드:', verificationCode)
      console.log('현재 생성되는 코드:', totp.generate())

      // delta가 null이 아니면 유효한 토큰
      if (delta !== null) {
        const codes = generateBackupCodes()
        setBackupCodes(codes)
        setCurrentStep('backup')
      } else {
        alert('인증번호가 올바르지 않습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('TOTP 검증 오류:', error)
      alert('인증번호 검증 중 오류가 발생했습니다.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleComplete = () => {
    // TOTP secret만 서버에 저장, 백업 코드는 사용자가 보관 (보안상 이유)
    console.log('GASetupModal handleComplete 호출:', {
      secretKey: secretKey.substring(0, 10) + '...',
      secretKeyLength: secretKey.length,
      backupCodesCount: backupCodes.length
    })
    onComplete(secretKey)
  }

  const copySecretKey = () => {
    navigator.clipboard.writeText(secretKey)
    alert('시크릿 키가 복사되었습니다.')
  }

  const downloadBackupCodes = () => {
    const content = `Google Authenticator 백업 코드\n생성일: ${new Date().toLocaleDateString()}\n사용자: ${user.name} (${user.email})\n\n${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}\n\n⚠️ 이 코드들은 안전한 곳에 보관하세요.`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-codes-${user.email}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // 닫기 불가
    >
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Google Authenticator 설정</h2>
          </div>

          <div className="space-y-6">
        {/* 헤더 안내 */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <div className="flex items-start">
            <ShieldCheckIcon className="h-5 w-5 text-sky-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700">
                보안 강화를 위해 Google Authenticator 설정이 필요합니다
              </p>
              <p className="text-sm text-slate-600 mt-1">
                설정 완료 후 대시보드에 접근할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 단계별 컨텐츠 */}
        {currentStep === 'setup' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                1단계: QR 코드 스캔
              </h3>
              <p className="text-sm text-slate-500">
                Google Authenticator 앱으로 아래 QR 코드를 스캔하세요
              </p>
            </div>

            {/* QR 코드 영역 */}
            <div className="flex justify-center">
              <div className="bg-white p-6 rounded-lg border-2 border-gray-200 shadow-sm">
                {secretKey ? (
                  <QRCodeSVG
                    value={qrCodeUrl}
                    size={192}
                    level="M"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-sm text-gray-500">QR 코드 생성 중...</div>
                  </div>
                )}
              </div>
            </div>

            {/* 수동 입력 옵션 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">수동 입력</p>
                  <p className="text-sm text-slate-500">QR 코드를 스캔할 수 없는 경우</p>
                </div>
                <button
                  onClick={copySecretKey}
                  className="flex items-center px-3 py-2 text-sm text-sky-600 hover:text-sky-700"
                >
                  <ClipboardDocumentIcon className="h-4 w-4 mr-1" />
                  키 복사
                </button>
              </div>
              <div className="mt-2 p-2 bg-white rounded border font-mono text-sm break-all">
                {secretKey}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setCurrentStep('verify')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {currentStep === 'verify' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                2단계: 인증번호 확인
              </h3>
              <p className="text-sm text-slate-500">
                Google Authenticator 앱에 표시된 6자리 인증번호를 입력하세요
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  인증번호
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="000000"
                  autoComplete="off"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-slate-500 mr-2 flex-shrink-0" />
                  <p className="text-sm text-slate-600">
                    Google Authenticator 앱에 표시된 6자리 숫자를 입력하세요. 코드는 30초마다 변경됩니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep('setup')}
                className="px-4 py-2 text-gray-600 hover:text-gray-700"
              >
                이전 단계
              </button>
              <button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isVerifying}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isVerifying ? '확인 중...' : '확인'}
              </button>
            </div>
          </div>
        )}

        {currentStep === 'backup' && (
          <div className="space-y-6">
            <div className="text-center">
              <CheckCircleIcon className="h-12 w-12 text-sky-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                설정 완료!
              </h3>
              <p className="text-sm text-slate-500">
                백업 코드를 안전한 곳에 저장하세요
              </p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-rose-700 mb-1">
                    중요: 백업 코드 보관
                  </p>
                  <p className="text-sm text-rose-600 mb-2">
                    기기를 분실했을 때 이 코드로 계정에 접근할 수 있습니다.
                    안전한 곳에 보관하고 타인과 공유하지 마세요.
                  </p>
                  <p className="text-xs text-rose-500 font-medium">
                    ※ 백업 코드는 서버에 저장되지 않으며, 이 화면을 닫으면 다시 볼 수 없습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">백업 코드</h4>
                <button
                  onClick={downloadBackupCodes}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  다운로드
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="bg-white p-2 rounded border font-mono text-sm text-center">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                완료
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </Modal>
  )
}