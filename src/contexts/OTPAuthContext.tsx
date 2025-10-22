'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface OTPAuthContextType {
  isVerified: boolean;
  verifiedAt: number | null;
  isExpired: () => boolean;
  setVerified: () => void;
  clearVerification: () => void;
}

const OTPAuthContext = createContext<OTPAuthContextType | undefined>(undefined);

const OTP_TIMEOUT = 30 * 60 * 1000; // 30분
const STORAGE_KEY = 'otp_verified_at';

export function OTPAuthProvider({ children }: { children: ReactNode }) {
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<number | null>(null);

  // 초기화: sessionStorage에서 복원
  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const timestamp = parseInt(stored, 10);
      if (Date.now() - timestamp < OTP_TIMEOUT) {
        setVerifiedAt(timestamp);
        setIsVerified(true);
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const isExpired = useCallback(() => {
    if (!verifiedAt) return true;
    return Date.now() - verifiedAt > OTP_TIMEOUT;
  }, [verifiedAt]);

  const setVerified = useCallback(() => {
    const timestamp = Date.now();
    setVerifiedAt(timestamp);
    setIsVerified(true);
    sessionStorage.setItem(STORAGE_KEY, timestamp.toString());
  }, []);

  const clearVerification = useCallback(() => {
    setVerifiedAt(null);
    setIsVerified(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // 자동 만료 체크 (1분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (isVerified && isExpired()) {
        clearVerification();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [isVerified, isExpired, clearVerification]);

  return (
    <OTPAuthContext.Provider
      value={{
        isVerified,
        verifiedAt,
        isExpired,
        setVerified,
        clearVerification
      }}
    >
      {children}
    </OTPAuthContext.Provider>
  );
}

export function useOTPAuth() {
  const context = useContext(OTPAuthContext);
  if (!context) {
    throw new Error('useOTPAuth must be used within OTPAuthProvider');
  }
  return context;
}
