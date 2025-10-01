'use client'

import { useState, useEffect, useCallback } from 'react'

interface MetaMaskState {
  isInstalled: boolean
  isConnected: boolean
  account: string | null
  chainId: string | null
  error: string | null
  isLoading: boolean
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request?: (args: { method: string; params?: any[] }) => Promise<any>
      on?: (event: string, handler: (...args: any[]) => void) => void
      removeListener?: (event: string, handler: (...args: any[]) => void) => void
      selectedAddress?: string
      chainId?: string
    }
  }
}

export const useMetaMask = () => {
  const [state, setState] = useState<MetaMaskState>({
    isInstalled: false,
    isConnected: false,
    account: null,
    chainId: null,
    error: null,
    isLoading: true
  })

  // MetaMask 설치 확인
  const checkMetaMaskInstallation = useCallback(() => {
    if (typeof window === 'undefined') return false

    return !!(window.ethereum?.isMetaMask)
  }, [])

  // MetaMask 연결 상태 확인
  const checkConnection = useCallback(async () => {
    if (!checkMetaMaskInstallation()) {
      setState(prev => ({
        ...prev,
        isInstalled: false,
        isLoading: false,
        error: 'MetaMask가 설치되지 않았습니다'
      }))
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const accounts = await window.ethereum!.request!({
        method: 'eth_accounts'
      })

      const chainId = await window.ethereum!.request!({
        method: 'eth_chainId'
      })

      setState(prev => ({
        ...prev,
        isInstalled: true,
        isConnected: accounts.length > 0,
        account: accounts[0] || null,
        chainId,
        isLoading: false,
        error: null
      }))
    } catch (error: any) {
      console.warn('MetaMask connection check failed:', error)
      setState(prev => ({
        ...prev,
        isInstalled: true,
        isConnected: false,
        account: null,
        chainId: null,
        isLoading: false,
        error: null // 연결 체크 실패는 에러로 표시하지 않음
      }))
    }
  }, [checkMetaMaskInstallation])

  // MetaMask 연결 요청
  const connect = useCallback(async () => {
    if (!checkMetaMaskInstallation()) {
      setState(prev => ({
        ...prev,
        error: 'MetaMask가 설치되지 않았습니다. 브라우저 확장 프로그램을 설치해주세요.'
      }))
      return false
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      const accounts = await window.ethereum!.request!({
        method: 'eth_requestAccounts'
      })

      const chainId = await window.ethereum!.request!({
        method: 'eth_chainId'
      })

      setState(prev => ({
        ...prev,
        isConnected: true,
        account: accounts[0],
        chainId,
        isLoading: false,
        error: null
      }))

      return true
    } catch (error: any) {
      let errorMessage = 'MetaMask 연결에 실패했습니다'

      if (error.code === 4001) {
        errorMessage = '사용자가 연결을 거부했습니다'
      } else if (error.code === -32002) {
        errorMessage = '이미 연결 요청이 진행 중입니다'
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))

      return false
    }
  }, [checkMetaMaskInstallation])

  // MetaMask 연결 해제
  const disconnect = useCallback(() => {
    setState(prev => ({
      ...prev,
      isConnected: false,
      account: null,
      chainId: null,
      error: null
    }))
  }, [])

  // 에러 초기화
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  // 이벤트 리스너 설정
  useEffect(() => {
    if (!checkMetaMaskInstallation()) return

    const handleAccountsChanged = (accounts: string[]) => {
      setState(prev => ({
        ...prev,
        isConnected: accounts.length > 0,
        account: accounts[0] || null
      }))
    }

    const handleChainChanged = (chainId: string) => {
      setState(prev => ({
        ...prev,
        chainId
      }))
    }

    const handleConnect = (connectInfo: { chainId: string }) => {
      setState(prev => ({
        ...prev,
        isConnected: true,
        chainId: connectInfo.chainId
      }))
    }

    const handleDisconnect = () => {
      setState(prev => ({
        ...prev,
        isConnected: false,
        account: null,
        chainId: null
      }))
    }

    // 이벤트 리스너 등록
    try {
      window.ethereum?.on?.('accountsChanged', handleAccountsChanged)
      window.ethereum?.on?.('chainChanged', handleChainChanged)
      window.ethereum?.on?.('connect', handleConnect)
      window.ethereum?.on?.('disconnect', handleDisconnect)
    } catch (error) {
      console.warn('MetaMask event listener setup failed:', error)
    }

    // 초기 연결 상태 확인
    checkConnection()

    // 클린업
    return () => {
      try {
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
        window.ethereum?.removeListener?.('chainChanged', handleChainChanged)
        window.ethereum?.removeListener?.('connect', handleConnect)
        window.ethereum?.removeListener?.('disconnect', handleDisconnect)
      } catch (error) {
        console.warn('MetaMask event listener cleanup failed:', error)
      }
    }
  }, [checkConnection])

  return {
    ...state,
    connect,
    disconnect,
    clearError,
    checkConnection
  }
}