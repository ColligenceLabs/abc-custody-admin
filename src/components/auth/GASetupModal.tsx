'use client';

import { useState } from 'react'
import {
  QrCodeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  KeyIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { Modal } from '@/components/common/Modal'

interface GASetupModalProps {
  isOpen: boolean
  user: {
    name: string
    email: string
  }
  onComplete: () => void
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

  // QR 코드용 시크릿 키 (실제로는 서버에서 생성)
  const secretKey = 'JBSWY3DPEHPK3PXP'
  const qrCodeUrl = `otpauth://totp/CustodyDashboard:${user.email}?secret=${secretKey}&issuer=CustodyDashboard`

  const generateBackupCodes = () => {
    const codes = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      alert('6자리 인증번호를 입력해주세요.')
      return
    }

    setIsVerifying(true)

    // 실제로는 서버에서 검증
    setTimeout(() => {
      if (verificationCode === '123456') {
        const codes = generateBackupCodes()
        setBackupCodes(codes)
        setCurrentStep('backup')
      } else {
        alert('인증번호가 올바르지 않습니다. 다시 시도해주세요.')
      }
      setIsVerifying(false)
    }, 1000)
  }

  const handleComplete = () => {
    // 실제로는 서버에 GA 설정 완료 상태 업데이트
    onComplete()
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
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <QrCodeIcon className="h-24 w-24 text-gray-400" />
                  <div className="absolute text-xs text-center text-gray-500 mt-32">
                    QR 코드<br />
                    {qrCodeUrl.substring(0, 30)}...
                  </div>
                </div>
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
                    테스트용으로 <code className="font-mono bg-slate-100 px-1 rounded text-slate-700">123456</code>을 입력하세요.
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
                  <p className="text-sm text-rose-600">
                    기기를 분실했을 때 이 코드로 계정에 접근할 수 있습니다.
                    안전한 곳에 보관하고 타인과 공유하지 마세요.
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