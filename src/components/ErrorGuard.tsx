'use client'

import { Component, ReactNode } from 'react'

interface ErrorGuardState {
  hasError: boolean
  error?: Error
}

interface ErrorGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

class ErrorGuard extends Component<ErrorGuardProps, ErrorGuardState> {
  constructor(props: ErrorGuardProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorGuardState {
    // React 에러를 필터링하여 메타마스크 관련 에러는 무시
    const isMetaMaskRelated = error.message?.includes('Minified React error') ||
                             error.stack?.includes('inpage.js') ||
                             error.stack?.includes('chrome-extension')

    if (isMetaMaskRelated) {
      // 프로덕션에서는 로그를 남기지 않음
      if (process.env.NODE_ENV === 'development') {
        console.warn('MetaMask-related error suppressed:', error.message)
      }
      return { hasError: false }
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    const isMetaMaskRelated = error.message?.includes('Minified React error') ||
                             error.stack?.includes('inpage.js') ||
                             error.stack?.includes('chrome-extension') ||
                             errorInfo.componentStack?.includes('inpage.js')

    if (isMetaMaskRelated) {
      // 프로덕션에서는 메타마스크 에러 로그를 완전히 억제
      if (process.env.NODE_ENV === 'development') {
        console.warn('MetaMask error boundary triggered:', error.message)
      }
      return
    }

    console.error('Application error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              문제가 발생했습니다
            </h2>
            <p className="text-gray-600">
              페이지를 새로고침해 주세요
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorGuard