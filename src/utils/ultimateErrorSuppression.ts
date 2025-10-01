'use client'

/**
 * 최종 에러 억제 시스템
 * 브라우저 확장 프로그램의 모든 에러를 차단하는 극한의 방법
 */

declare global {
  interface Window {
    chrome?: any
    browser?: any
  }
}

let suppressionActive = false

export function activateUltimateErrorSuppression() {
  if (suppressionActive || typeof window === 'undefined') return

  suppressionActive = true

  // 1. 모든 console 메서드 완전 오버라이드
  const originalConsole = {
    error: console.error,
    warn: console.warn,
    log: console.log,
    info: console.info,
    debug: console.debug,
    trace: console.trace
  }

  const metaMaskPatterns = [
    'runtime.lastError',
    'Receiving end does not exist',
    'Could not establish connection',
    'Unchecked runtime.lastError',
    'chrome-extension',
    'inpage.js',
    'MetaMask',
    'Minified React error',
    'ethereum',
    'web3'
  ]

  const isBlockedMessage = (message: string) => {
    return metaMaskPatterns.some(pattern =>
      message.toLowerCase().includes(pattern.toLowerCase())
    )
  }

  // Console 메서드 모두 오버라이드
  Object.keys(originalConsole).forEach(method => {
    (console as any)[method] = (...args: any[]) => {
      const message = args.join(' ')
      if (!isBlockedMessage(message)) {
        (originalConsole as any)[method].apply(console, args)
      }
    }
  })

  // 2. Chrome runtime 에러 억제
  if (window.chrome?.runtime) {
    const originalGetLastError = window.chrome.runtime.lastError
    Object.defineProperty(window.chrome.runtime, 'lastError', {
      get: () => null,
      configurable: true
    })
  }

  // 3. 최고 우선순위 에러 이벤트 리스너
  const ultimateErrorHandler = (event: ErrorEvent) => {
    const message = event.message || ''
    const filename = event.filename || ''

    if (isBlockedMessage(message) ||
        filename.includes('chrome-extension') ||
        filename.includes('inpage.js')) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return false
    }
  }

  const ultimateRejectionHandler = (event: PromiseRejectionEvent) => {
    const message = String(event.reason?.message || event.reason || '')
    if (isBlockedMessage(message)) {
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return false
    }
  }

  // 가장 높은 우선순위로 이벤트 리스너 등록
  window.addEventListener('error', ultimateErrorHandler, {
    capture: true,
    passive: false
  })

  window.addEventListener('unhandledrejection', ultimateRejectionHandler, {
    capture: true,
    passive: false
  })

  // 4. MutationObserver로 동적 추가되는 요소들 감시
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element

          // iframe이 추가될 때마다 에러 핸들러 적용
          if (element.tagName === 'IFRAME') {
            try {
              const iframe = element as HTMLIFrameElement
              iframe.addEventListener('load', () => {
                try {
                  iframe.contentWindow?.addEventListener('error', ultimateErrorHandler, true)
                } catch (e) {
                  // Cross-origin 에러 무시
                }
              })
            } catch (e) {
              // 접근 불가한 iframe 무시
            }
          }
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // 5. 확장 프로그램 메시지 차단
  window.addEventListener('message', (event) => {
    if (event.origin.includes('chrome-extension') ||
        event.source !== window) {
      const message = JSON.stringify(event.data || '')
      if (isBlockedMessage(message)) {
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
    }
  }, true)

  // 정리 함수 반환
  return () => {
    suppressionActive = false

    // Console 복원
    Object.keys(originalConsole).forEach(method => {
      (console as any)[method] = (originalConsole as any)[method]
    })

    // 이벤트 리스너 제거
    window.removeEventListener('error', ultimateErrorHandler, true)
    window.removeEventListener('unhandledrejection', ultimateRejectionHandler, true)

    // Observer 정리
    observer.disconnect()
  }
}

// 즉시 실행
if (typeof window !== 'undefined') {
  // 다음 틱에서 실행하여 다른 스크립트들이 로드된 후 적용
  setTimeout(activateUltimateErrorSuppression, 0)
}