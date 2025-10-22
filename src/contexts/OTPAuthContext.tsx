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

const OTP_TIMEOUT = 15 * 60 * 1000; // 15분 (마이페이지 전용, 보안 강화)
const STORAGE_KEY = 'mypage_otp_verified_at'; // 로그인 OTP와 별개

// sessionStorage에서 초기 상태를 동기적으로 읽는 함수
function getInitialVerificationState(): { isVerified: boolean; verifiedAt: number | null } {
  if (typeof window === 'undefined') {
    return { isVerified: false, verifiedAt: null };
  }

  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { isVerified: false, verifiedAt: null };
  }

  const timestamp = parseInt(stored, 10);
  if (Date.now() - timestamp < OTP_TIMEOUT) {
    return { isVerified: true, verifiedAt: timestamp };
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
    return { isVerified: false, verifiedAt: null };
  }
}

export function OTPAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(() => getInitialVerificationState());

  const isExpired = useCallback(() => {
    if (!state.verifiedAt) return true;
    return Date.now() - state.verifiedAt > OTP_TIMEOUT;
  }, [state.verifiedAt]);

  const setVerified = useCallback(() => {
    const timestamp = Date.now();
    setState({ isVerified: true, verifiedAt: timestamp });
    sessionStorage.setItem(STORAGE_KEY, timestamp.toString());
  }, []);

  const clearVerification = useCallback(() => {
    setState({ isVerified: false, verifiedAt: null });
    sessionStorage.removeItem(STORAGE_KEY);
  }, []);

  // 자동 만료 체크 (1분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isVerified && isExpired()) {
        clearVerification();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [state.isVerified, isExpired, clearVerification]);

  return (
    <OTPAuthContext.Provider
      value={{
        isVerified: state.isVerified,
        verifiedAt: state.verifiedAt,
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
