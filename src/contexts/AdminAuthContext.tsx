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

// Mock API Service (실제 구현에서는 별도 API 서비스로 분리)
class AdminAuthService {
  static async login(credentials: AdminLoginRequest): Promise<AdminAuthResponse> {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login
    if (credentials.email === 'admin@custody.com' && credentials.password === 'admin123') {
      const mockUser: AdminUser = {
        id: 'admin-1',
        email: 'admin@custody.com',
        name: '관리자',
        role: 'super_admin' as any,
        permissions: [],
        status: 'active' as any,
        twoFactorEnabled: true,
        sessionTimeout: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-1',
        userId: 'admin-1',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        lastActivity: new Date(),
        isActive: true,
        loginMethod: 'password_2fa' as any,
      };

      return {
        user: mockUser,
        session: mockSession,
        requiresTwoFactor: true,
        tempToken: 'temp-token-123'
      };
    }

    throw new Error('Invalid credentials');
  }

  static async verify2FA(tempToken: string, code: string): Promise<AdminAuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (tempToken === 'temp-token-123' && code === '123456') {
      const mockUser: AdminUser = {
        id: 'admin-1',
        email: 'admin@custody.com',
        name: '관리자',
        role: 'super_admin' as any,
        permissions: [],
        status: 'active' as any,
        twoFactorEnabled: true,
        sessionTimeout: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: 'session-1',
        userId: 'admin-1',
        accessToken: 'mock-access-token-verified',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        ipAddress: '127.0.0.1',
        userAgent: navigator.userAgent,
        lastActivity: new Date(),
        isActive: true,
        loginMethod: 'password_2fa' as any,
      };

      return {
        user: mockUser,
        session: mockSession,
      };
    }

    throw new Error('Invalid 2FA code');
  }

  static async refreshToken(refreshToken: string): Promise<AdminAuthResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock token refresh
    const mockUser: AdminUser = {
      id: 'admin-1',
      email: 'admin@custody.com',
      name: '관리자',
      role: 'super_admin' as any,
      permissions: [],
      status: 'active' as any,
      twoFactorEnabled: true,
      sessionTimeout: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockSession = {
      id: 'session-1',
      userId: 'admin-1',
      accessToken: 'mock-access-token-refreshed',
      refreshToken: 'mock-refresh-token-new',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      lastActivity: new Date(),
      isActive: true,
      loginMethod: 'password_2fa' as any,
    };

    return {
      user: mockUser,
      session: mockSession,
    };
  }
}

// Provider Component
export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [state, dispatch] = useReducer(adminAuthReducer, initialState);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      const storedAuth = AdminAuthManager.getStoredAuth();

      if (storedAuth && !AdminAuthManager.isTokenExpired(storedAuth.expiresAt)) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: storedAuth.user,
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
      const response = await AdminAuthService.login(credentials);

      if (response.requiresTwoFactor && response.tempToken) {
        dispatch({
          type: 'AUTH_2FA_REQUIRED',
          payload: { tempToken: response.tempToken },
        });
        return;
      }

      // Store auth info
      const authData = {
        user: response.user,
        accessToken: response.session.accessToken,
        refreshToken: response.session.refreshToken,
        expiresAt: response.session.expiresAt.getTime(),
      };

      AdminAuthManager.storeAuth(authData);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          expiresAt: response.session.expiresAt.getTime(),
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

      // Store auth info
      const authData = {
        user: response.user,
        accessToken: response.session.accessToken,
        refreshToken: response.session.refreshToken,
        expiresAt: response.session.expiresAt.getTime(),
      };

      AdminAuthManager.storeAuth(authData);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          expiresAt: response.session.expiresAt.getTime(),
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
    if (state.user) {
      await AuditLogger.logAdminAction(state.user, 'LOGOUT', 'AUTH');
    }

    AdminAuthManager.clearStoredAuth();
    SessionManager.stopSessionMonitoring();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  // Token refresh
  const refreshToken = async (): Promise<boolean> => {
    const storedAuth = AdminAuthManager.getStoredAuth();
    if (!storedAuth) return false;

    try {
      const response = await AdminAuthService.refreshToken(storedAuth.refreshToken);

      const authData = {
        user: response.user,
        accessToken: response.session.accessToken,
        refreshToken: response.session.refreshToken,
        expiresAt: response.session.expiresAt.getTime(),
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