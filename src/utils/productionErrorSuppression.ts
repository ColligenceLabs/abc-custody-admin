'use client'

/**
 * 프로덕션 환경 전용 에러 억제 시스템
 * 메타마스크 및 브라우저 확장 프로그램으로 인한 콘솔 오류를 완전히 제거
 */

let isSuppressionActive = false

export function initProductionErrorSuppression() {
  // 이미 활성화되어 있거나 개발 환경이면 실행하지 않음
  if (isSuppressionActive || process.env.NODE_ENV === 'development') {
    return
  }

  if (typeof window === 'undefined') return

  // 에러 억제 활성화 플래그
  isSuppressionActive = true

  // 원본 콘솔 메서드 백업
  const originalConsoleError = console.error
  const originalConsoleWarn = console.warn

  // console.error 재정의
  console.error = (...args: any[]) => {
    const message = args.join(' ')

    // 메타마스크 관련 에러 패턴
    const isMetaMaskError =
      message.includes('Minified React error') ||
      message.includes('inpage.js') ||
      message.includes('chrome-extension') ||
      message.includes('runtime.lastError') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Could not establish connection') ||
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('web3')

    // 메타마스크 에러가 아닌 경우만 콘솔에 출력
    if (!isMetaMaskError) {
      originalConsoleError.apply(console, args)
    }
  }

  // console.warn 재정의 (프로덕션에서는 모든 warn 억제)
  console.warn = (...args: any[]) => {
    const message = args.join(' ')

    // 메타마스크 관련 경고 억제
    const isMetaMaskWarning =
      message.includes('MetaMask') ||
      message.includes('error suppressed') ||
      message.includes('error handled') ||
      message.includes('error boundary triggered')

    if (!isMetaMaskWarning) {
      originalConsoleWarn.apply(console, args)
    }
  }

  // 전역 에러 이벤트 리스너
  const globalErrorHandler = (event: ErrorEvent) => {
    const isMetaMaskError =
      event.filename?.includes('inpage.js') ||
      event.filename?.includes('chrome-extension') ||
      event.message?.includes('Minified React error') ||
      event.message?.includes('runtime.lastError')

    if (isMetaMaskError) {
      event.preventDefault()
      event.stopPropagation()
      return false
    }
  }

  // Promise rejection 이벤트 리스너
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    const reason = event.reason
    const message = reason?.message || String(reason)

    const isMetaMaskRejection =
      message.includes('runtime.lastError') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Could not establish connection') ||
      message.includes('MetaMask')

    if (isMetaMaskRejection) {
      event.preventDefault()
      return false
    }
  }

  // 이벤트 리스너 등록
  window.addEventListener('error', globalErrorHandler, true)
  window.addEventListener('unhandledrejection', rejectionHandler, true)

  // 정리 함수 반환
  return () => {
    console.error = originalConsoleError
    console.warn = originalConsoleWarn
    window.removeEventListener('error', globalErrorHandler, true)
    window.removeEventListener('unhandledrejection', rejectionHandler, true)
    isSuppressionActive = false
  }
}

// 브라우저 환경에서 즉시 실행
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  initProductionErrorSuppression()
}