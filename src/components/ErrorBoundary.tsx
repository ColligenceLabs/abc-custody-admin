'use client'

import React from 'react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // MetaMask 관련 에러는 콘솔에만 로깅하고 무시
    if (this.isMetaMaskError(error)) {
      console.warn('MetaMask extension error (handled):', error.message)
      this.setState({ hasError: false })
      return
    }

    // 기타 중요한 에러는 로깅
    console.error('Application error:', error, errorInfo)
  }

  private isMetaMaskError(error: Error): boolean {
    const metamaskKeywords = [
      'MetaMask',
      'chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn',
      'ethereum',
      'web3',
      'wallet'
    ]

    return metamaskKeywords.some(keyword =>
      error.message?.toLowerCase().includes(keyword.toLowerCase()) ||
      error.stack?.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError && !this.isMetaMaskError(this.state.error!)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">
                오류가 발생했습니다
              </h2>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                애플리케이션에서 예상치 못한 오류가 발생했습니다.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-gray-100 rounded text-sm">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    개발자 정보
                  </summary>
                  <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                다시 시도
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary