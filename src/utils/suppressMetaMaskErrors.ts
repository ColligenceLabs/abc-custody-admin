'use client'

/**
 * MetaMask 에러 억제 유틸리티
 * 프로덕션 환경에서 메타마스크 확장 프로그램으로 인한 React 에러를 방지
 */
export function suppressMetaMaskErrors() {
  if (typeof window === 'undefined') return

  const originalError = console.error
  const originalWarn = console.warn

  console.error = (...args: any[]) => {
    const message = args.join(' ')

    // MetaMask 관련 에러 패턴 필터링
    const isMetaMaskError =
      message.includes('Minified React error #418') ||
      message.includes('Minified React error #423') ||
      message.includes('Minified React error #425') ||
      message.includes('inpage.js') ||
      message.includes('chrome-extension') ||
      message.includes('runtime.lastError') ||
      message.includes('Receiving end does not exist')

    if (!isMetaMaskError) {
      originalError.apply(console, args)
    }
  }

  console.warn = (...args: any[]) => {
    const message = args.join(' ')

    const isMetaMaskWarning =
      message.includes('MetaMask') ||
      message.includes('ethereum') ||
      message.includes('web3') ||
      message.includes('wallet')

    if (!isMetaMaskWarning) {
      originalWarn.apply(console, args)
    }
  }

  // React 에러 이벤트 리스너
  window.addEventListener('error', (event) => {
    const isMetaMaskError =
      event.filename?.includes('inpage.js') ||
      event.filename?.includes('chrome-extension') ||
      event.message?.includes('Minified React error')

    if (isMetaMaskError) {
      event.preventDefault()
      event.stopPropagation()
    }
  })

  // Promise rejection 이벤트 리스너
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason)

    const isMetaMaskRejection =
      message.includes('runtime.lastError') ||
      message.includes('Receiving end does not exist') ||
      message.includes('Could not establish connection')

    if (isMetaMaskRejection) {
      event.preventDefault()
    }
  })
}

/**
 * 컴포넌트에서 사용할 수 있는 에러 억제 훅
 */
export function useMetaMaskErrorSuppression() {
  if (typeof window !== 'undefined') {
    suppressMetaMaskErrors()
  }
}