'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AdminUser, AdminAuthResponse, AdminLoginRequest, Admin2FARequest } from '@/types/admin';
import { AdminAuthManager, SessionManager, AuditLogger } from '@/lib/adminAuth';

// Auth State
interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresTwoFactor: boolean;
  tempToken: string | null;
  sessionExpiresAt: number | null;
  sessionWarning: boolean;
  error: string | null;
}

// Auth Actions
type AdminAuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: AdminUser; expiresAt: number } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_2FA_REQUIRED'; payload: { tempToken: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'SESSION_WARNING'; payload: boolean }
  | { type: 'TOKEN_REFRESH_SUCCESS'; payload: { user: AdminUser; expiresAt: number } }
  | { type: 'CLEAR_ERROR' };

// Initial State
const initialState: AdminAuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  requiresTwoFactor: false,
  tempToken: null,
  sessionExpiresAt: null,
  sessionWarning: false,
  error: null,
};

// Reducer
function adminAuthReducer(state: AdminAuthState, action: AdminAuthAction): AdminAuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        requiresTwoFactor: false,
        tempToken: null,
        sessionExpiresAt: action.payload.expiresAt,
        error: null,
      };

    case 'AUTH_2FA_REQUIRED':
      return {
        ...state,
        isLoading: false,
        requiresTwoFactor: true,
        tempToken: action.payload.tempToken,
        error: null,
      };

    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'SESSION_WARNING':
      return {
        ...state,
        sessionWarning: action.payload,
      };

    case 'TOKEN_REFRESH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        sessionExpiresAt: action.payload.expiresAt,
        sessionWarning: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

// Context
interface AdminAuthContextType extends AdminAuthState {
  login: (credentials: AdminLoginRequest) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  extendSession: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// Provider Props
interface AdminAuthProviderProps {
  children: ReactNode;
}

// Real API Service
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

class AdminAuthService {
  /**
   * CSRF 토큰 가져오기
   */
  static async getCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${API_URL}/api/csrf-token`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('CSRF 토큰을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      return data.csrfToken || '';
    } catch (error) {
      console.error('[AdminAuthService] CSRF 토큰 가져오기 실패:', error);
      return '';
    }
  }

  static async login(credentials: AdminLoginRequest): Promise<AdminAuthResponse> {
    console.log('[AdminAuthService] Fetch 호출:', `${API_URL}/api/admin/auth/login`);

    // CSRF 토큰 가져오기
    const csrfToken = await this.getCsrfToken();

    const response = await fetch(`${API_URL}/api/admin/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });

    console.log('[AdminAuthService] Response status:', response.status);
    console.log('[AdminAuthService] Response headers:', {
      setCookie: response.headers.get('set-cookie'),
      contentType: response.headers.get('content-type')
    });

    const data = await response.json();
    console.log('[AdminAuthService] Response data:', data);

    if (!response.ok || !data.success) {
      throw new Error(data.error || '로그인에 실패했습니다.');
    }

    // 2FA 설정이 필요한 경우 (enabled이지만 secret 없음)
    if (data.requires2FASetup) {
      return {
        user: data.user || {} as AdminUser,
        session: {} as any,
        requiresPasswordChange: false,
        requiresTwoFactor: false,
        requires2FASetup: true,
        tempToken: data.tempToken
      } as any;
    }

    // 2FA 코드 입력이 필요한 경우
    if (data.requiresTwoFactor) {
      return {
        user: {} as AdminUser,
        session: {} as any,
        requiresTwoFactor: true,
        tempToken: data.tempToken
      };
    }

    // 일반 로그인 성공
    return {
      user: data.user,
      session: data.session,
      requiresPasswordChange: data.requiresPasswordChange
    } as any;
  }

  static async verify2FA(tempToken: string, code: string): Promise<AdminAuthResponse> {
    // CSRF 토큰 가져오기
    const csrfToken = await this.getCsrfToken();

    const response = await fetch(`${API_URL}/api/admin/auth/verify-2fa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include',
      body: JSON.stringify({ tempToken, code }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || '2FA 검증에 실패했습니다.');
    }

    return {
      user: data.user,
      session: data.session
    };
  }

  static async refreshToken(refreshToken: string): Promise<AdminAuthResponse> {
    // CSRF 토큰 가져오기
    const csrfToken = await this.getCsrfToken();

    // refreshToken은 HttpOnly 쿠키로 자동 전송되므로 body에 포함하지 않음
    const response = await fetch(`${API_URL}/api/admin/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
      },
      credentials: 'include', // 쿠키 자동 전송
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || '토큰 갱신에 실패했습니다.');
    }

    // 기존 사용자 정보 유지 (최소 정보만 사용)
    const storedAuth = AdminAuthManager.getStoredAuth();
    if (!storedAuth) {
      throw new Error('저장된 인증 정보가 없습니다.');
    }

    // StoredAuth를 AdminUser로 변환 (최소 정보만 포함)
    const user: AdminUser = {
      id: storedAuth.userId,
      email: '', // refresh 시에는 이메일 정보 불필요
      name: storedAuth.name,
      role: storedAuth.role,
      permissions: [],
      status: 'active' as any,
      twoFactorEnabled: false,
      sessionTimeout: 30,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      user,
      session: {
        expiresAt: new Date(data.expiresAt)
      } as any
    };
  }
}

// Provider Component
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedAuth = AdminAuthManager.getStoredAuth();

      if (storedAuth && !AdminAuthManager.isTokenExpired(storedAuth.expiresAt)) {
        // StoredAuth를 AdminUser로 변환 (상세 정보는 API로 조회 가능)
        const user: AdminUser = {
          id: storedAuth.userId,
          email: '', // 초기화 시에는 이메일 정보 불필요, 필요 시 getUserInfo() 호출
          name: storedAuth.name,
          role: storedAuth.role,
          permissions: [],
          status: 'active' as any,
          twoFactorEnabled: false,
          sessionTimeout: 30,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user,
            expiresAt: storedAuth.expiresAt,
          },
        });

        // Start session monitoring
        SessionManager.startSessionMonitoring(
          () => logout(),
          (minutesLeft) => dispatch({ type: 'SESSION_WARNING', payload: true })
        );
      } else {
        AdminAuthManager.clearStoredAuth();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();

    return () => {
      SessionManager.stopSessionMonitoring();
    };
  }, []);

  // Login function
  const login = async (credentials: AdminLoginRequest): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      console.log('[Login] API 호출 시작:', `${API_URL}/api/admin/auth/login`);
      const response = await AdminAuthService.login(credentials);
      console.log('[Login] API 응답:', response);

      // 2FA 설정이 필요한 경우 (enabled이지만 secret 없음)
      if ((response as any).requires2FASetup) {
        // 2FA 설정 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          // 임시 인증 정보를 sessionStorage에 저장 (탭 닫으면 자동 삭제)
          sessionStorage.setItem('temp-2fa-setup', JSON.stringify({
            user: (response as any).user,
            sessionId: (response as any).session?.id
            // tempToken은 저장하지 않음 (XSS 방지)
          }));
          window.location.href = '/admin/auth/setup-2fa';
        }
        return;
      }

      // 2FA 코드 입력 필요
      if (response.requiresTwoFactor && response.tempToken) {
        dispatch({
          type: 'AUTH_2FA_REQUIRED',
          payload: { tempToken: response.tempToken },
        });
        return;
      }

      // Store auth info (토큰은 HttpOnly 쿠키로 관리되므로 localStorage에 저장하지 않음)
      // 보안 강화: 최소 정보만 localStorage에 저장
      const expiresAt = typeof response.session.expiresAt === 'string'
        ? new Date(response.session.expiresAt).getTime()
        : response.session.expiresAt.getTime();

      const authData = {
        userId: response.user.id,
        role: response.user.role,
        name: response.user.name,
        expiresAt,
        sessionId: response.session.id,
      };

      AdminAuthManager.storeAuth(authData);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          expiresAt,
        },
      });

      // Log successful login
      await AuditLogger.logAdminAction(response.user, 'LOGIN', 'AUTH', undefined, {
        loginMethod: '2FA_REQUIRED',
        ipAddress: credentials.ipAddress,
      });

      // Start session monitoring
      SessionManager.startSessionMonitoring(
        () => logout(),
        (minutesLeft) => dispatch({ type: 'SESSION_WARNING', payload: true })
      );

      // 비밀번호 변경 필요 시 리다이렉트
      if ((response as any).requiresPasswordChange) {
        if (typeof window !== 'undefined') {
          window.location.href = '/admin/auth/change-password';
        }
      }

    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : 'Login failed',
      });
    }
  };

  // 2FA verification
  const verify2FA = async (code: string): Promise<void> => {
    if (!state.tempToken) {
      dispatch({ type: 'AUTH_ERROR', payload: '2FA token not found' });
      return;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const response = await AdminAuthService.verify2FA(state.tempToken, code);

      // Store auth info (토큰은 HttpOnly 쿠키로 관리되므로 localStorage에 저장하지 않음)
      // 보안 강화: 최소 정보만 localStorage에 저장
      const expiresAt = typeof response.session.expiresAt === 'string'
        ? new Date(response.session.expiresAt).getTime()
        : response.session.expiresAt.getTime();

      const authData = {
        userId: response.user.id,
        role: response.user.role,
        name: response.user.name,
        expiresAt,
        sessionId: response.session.id,
      };

      AdminAuthManager.storeAuth(authData);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          expiresAt,
        },
      });

      // Log successful 2FA verification
      await AuditLogger.logAdminAction(response.user, 'LOGIN_2FA_SUCCESS', 'AUTH');

      // Start session monitoring
      SessionManager.startSessionMonitoring(
        () => logout(),
        (minutesLeft) => dispatch({ type: 'SESSION_WARNING', payload: true })
      );

    } catch (error) {
      dispatch({
        type: 'AUTH_ERROR',
        payload: error instanceof Error ? error.message : '2FA verification failed',
      });
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      if (state.user) {
        await AuditLogger.logAdminAction(state.user, 'LOGOUT', 'AUTH');
      }

      // 백엔드 logout API 호출 (HttpOnly Cookie 삭제)
      const storedAuth = AdminAuthManager.getStoredAuth();
      if (storedAuth?.sessionId) {
        // CSRF 토큰 가져오기
        const csrfToken = await AdminAuthService.getCsrfToken();

        await fetch(`${API_URL}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          credentials: 'include',
          body: JSON.stringify({
            sessionId: storedAuth.sessionId
          }),
        });
      }
    } catch (error) {
      console.error('Logout API 호출 실패:', error);
    } finally {
      AdminAuthManager.clearStoredAuth();
      SessionManager.stopSessionMonitoring();
      dispatch({ type: 'AUTH_LOGOUT' });

      // 로그인 페이지로 리다이렉트
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/auth/login';
      }
    }
  };

  // Token refresh (refreshToken은 HttpOnly 쿠키로 자동 전송됨)
  const refreshToken = async (): Promise<boolean> => {
    const storedAuth = AdminAuthManager.getStoredAuth();
    if (!storedAuth) return false;

    try {
      // refreshToken은 쿠키에서 자동으로 전송되므로 body에 포함하지 않음
      const response = await AdminAuthService.refreshToken('');

      const authData = {
        userId: response.user.id,
        role: response.user.role,
        name: response.user.name,
        expiresAt: response.session.expiresAt.getTime(),
        sessionId: storedAuth.sessionId,
      };

      AdminAuthManager.storeAuth(authData);

      dispatch({
        type: 'TOKEN_REFRESH_SUCCESS',
        payload: {
          user: response.user,
          expiresAt: response.session.expiresAt.getTime(),
        },
      });

      return true;
    } catch (error) {
      await logout();
      return false;
    }
  };

  // Extend session
  const extendSession = async (): Promise<boolean> => {
    return await SessionManager.extendSession();
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: AdminAuthContextType = {
    ...state,
    login,
    verify2FA,
    logout,
    refreshToken,
    clearError,
    extendSession,
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Hook to use admin auth context
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}