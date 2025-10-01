'use client'

import { useEffect } from 'react'

interface MetaMaskErrorHandlerProps {
  onError?: (error: Error) => void
}

export const MetaMaskErrorHandler: React.FC<MetaMaskErrorHandlerProps> = ({ onError }) => {
  useEffect(() => {
    // 전역 에러 핸들러
    const handleError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message)

      // MetaMask 관련 에러 감지
      if (isMetaMaskError(error) || isMetaMaskError(event)) {
        // 개발 환경에서만 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.warn('MetaMask error handled:', {
            message: event.message,
            filename: event.filename,
            error: error.message
          })
        }

        // 브라우저 콘솔에 에러 표시 방지
        event.preventDefault()

        // 커스텀 에러 핸들러 호출
        onError?.(error)
        return
      }
    }

    // 처리되지 않은 Promise rejection 핸들러
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))

      if (isMetaMaskError(error) || isMetaMaskError(event.reason)) {
        // 개발 환경에서만 로그 출력
        if (process.env.NODE_ENV === 'development') {
          console.warn('MetaMask promise rejection handled:', error.message)
        }

        // 브라우저 콘솔에 에러 표시 방지
        event.preventDefault()

        // 커스텀 에러 핸들러 호출
        onError?.(error)
        return
      }
    }

    // 이벤트 리스너 등록
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // 클린업
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [onError])

  return null
}

// MetaMask 관련 에러인지 확인하는 유틸리티 함수
function isMetaMaskError(errorOrEvent: any): boolean {
  if (!errorOrEvent) return false

  const checkContent = (content: string): boolean => {
    const metamaskKeywords = [
      'MetaMask',
      'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn',
      'ethereum',
      'web3',
      'wallet',
      'inpage.js',
      'metamask',
      'runtime.lastError',
      'Receiving end does not exist',
      'Could not establish connection',
      'Minified React error #418',
      'Minified React error #423',
      'Minified React error #425'
    ]

    return metamaskKeywords.some(keyword =>
      content.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // Error 객체인 경우
  if (errorOrEvent instanceof Error) {
    return checkContent(errorOrEvent.message) ||
           checkContent(errorOrEvent.stack || '')
  }

  // ErrorEvent인 경우
  if (errorOrEvent.filename || errorOrEvent.message) {
    return checkContent(errorOrEvent.filename || '') ||
           checkContent(errorOrEvent.message || '')
  }

  // string인 경우
  if (typeof errorOrEvent === 'string') {
    return checkContent(errorOrEvent)
  }

  // 객체인 경우 (PromiseRejectionEvent.reason 등)
  if (typeof errorOrEvent === 'object') {
    const content = JSON.stringify(errorOrEvent)
    return checkContent(content)
  }

  return false
}

export default MetaMaskErrorHandler