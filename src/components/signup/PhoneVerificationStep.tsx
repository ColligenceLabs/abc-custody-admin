'use client'

import { useState, useEffect } from 'react'
import { DevicePhoneMobileIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { SignupData } from '@/app/signup/page'

interface PhoneVerificationStepProps {
  initialData: SignupData
  onComplete: (data: Partial<SignupData>) => void
  onBack: () => void
}

export default function PhoneVerificationStep({ initialData, onComplete, onBack }: PhoneVerificationStepProps) {
  const [allAgreed, setAllAgreed] = useState(false)
  const [agreements, setAgreements] = useState({
    personalInfo: false,
    serviceTerms: false,
    uniqueInfo: false,
    carrierTerms: false,
  })

  const [name, setName] = useState(initialData.name || '')
  const [residentNumber1, setResidentNumber1] = useState('')
  const [residentNumber2, setResidentNumber2] = useState('')
  const [carrier, setCarrier] = useState(initialData.carrier || '')
  const [phone, setPhone] = useState(initialData.phone || '')
  const [verificationCode, setVerificationCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const allChecked = Object.values(agreements).every(v => v)
    setAllAgreed(allChecked)
  }, [agreements])

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleAllAgreement = (checked: boolean) => {
    setAllAgreed(checked)
    setAgreements({
      personalInfo: checked,
      serviceTerms: checked,
      uniqueInfo: checked,
      carrierTerms: checked,
    })
  }

  const handleAgreementChange = (key: keyof typeof agreements, checked: boolean) => {
    setAgreements(prev => ({ ...prev, [key]: checked }))
  }

  const handleSendCode = async () => {
    if (!name || !residentNumber1 || !residentNumber2 || !carrier || !phone || !allAgreed) {
      setMessage({ type: 'error', text: '모든 정보를 입력하고 약관에 동의해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    // 시뮬레이션: 실제로는 SMS API 호출
    await new Promise(resolve => setTimeout(resolve, 1500))

    setCodeSent(true)
    setCooldown(60)
    setLoading(false)
    setMessage({ type: 'success', text: '인증번호가 발송되었습니다.' })
  }

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setMessage({ type: 'error', text: '인증번호 6자리를 입력해주세요.' })
      return
    }

    setLoading(true)
    setMessage(null)

    // 시뮬레이션: 실제로는 인증 API 호출
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 임시 검증 (실제로는 서버에서 처리)
    const isValid = verificationCode === '123456'

    if (isValid) {
      setMessage({ type: 'success', text: '본인인증이 완료되었습니다.' })
      setTimeout(() => {
        onComplete({
          name,
          residentNumber: `${residentNumber1}-${residentNumber2}******`,
          carrier,
          phone,
        })
      }, 1000)
    } else {
      setMessage({ type: 'error', text: '인증번호가 올바르지 않습니다.' })
    }

    setLoading(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* 헤더 */}
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
          <DevicePhoneMobileIcon className="w-6 h-6 text-primary-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">본인인증을 진행합니다</h2>
        <p className="text-gray-600 mt-1">휴대폰 본인인증으로 신원을 확인합니다</p>
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

      {/* 약관 동의 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center cursor-pointer mb-3 pb-3 border-b border-gray-200">
          <input
            type="checkbox"
            checked={allAgreed}
            onChange={(e) => handleAllAgreement(e.target.checked)}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-3 text-sm font-semibold text-gray-900">전체 동의</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.personalInfo}
                onChange={(e) => handleAgreementChange('personalInfo', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">개인정보 수집 및 이용 동의 (필수)</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.serviceTerms}
                onChange={(e) => handleAgreementChange('serviceTerms', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">인증사 서비스 이용약관 동의 (필수)</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.uniqueInfo}
                onChange={(e) => handleAgreementChange('uniqueInfo', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">고유식별정보 처리 동의 (필수)</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={agreements.carrierTerms}
                onChange={(e) => handleAgreementChange('carrierTerms', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="ml-3 text-sm text-gray-700">통신사 이용약관 동의 (필수)</span>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </label>
        </div>
      </div>

      {/* 입력 폼 */}
      <div className="space-y-4">
        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="홍길동"
          />
        </div>

        {/* 주민번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            주민등록번호
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              maxLength={6}
              value={residentNumber1}
              onChange={(e) => setResidentNumber1(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
              placeholder="000000"
            />
            <span className="text-gray-400">-</span>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                maxLength={1}
                value={residentNumber2}
                onChange={(e) => setResidentNumber2(e.target.value.replace(/\D/g, ''))}
                className="w-10 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center"
                placeholder="0"
              />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
              </div>
            </div>
          </div>
        </div>

        {/* 통신사 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            통신사
          </label>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">통신사를 선택하세요</option>
            <option value="SKT">SKT</option>
            <option value="KT">KT</option>
            <option value="LG U+">LG U+</option>
            <option value="SKT 알뜰폰">SKT 알뜰폰</option>
            <option value="KT 알뜰폰">KT 알뜰폰</option>
            <option value="LG U+ 알뜰폰">LG U+ 알뜰폰</option>
          </select>
        </div>

        {/* 휴대폰 번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            휴대폰 번호
          </label>
          <div className="flex space-x-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              maxLength={11}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="01012345678"
            />
            <button
              onClick={handleSendCode}
              disabled={cooldown > 0 || loading}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap transition-colors"
            >
              {cooldown > 0 ? `재발송 (${cooldown})` : codeSent ? '재발송' : '인증요청'}
            </button>
          </div>
        </div>

        {/* 인증번호 입력 */}
        {codeSent && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              인증번호
            </label>
            <input
              type="text"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-xl font-mono tracking-widest"
              placeholder="123456"
            />
          </div>
        )}
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
          onClick={handleVerify}
          disabled={!codeSent || verificationCode.length !== 6 || loading}
          className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : null}
          {loading ? '인증 중...' : '다음'}
        </button>
      </div>
    </div>
  )
}
