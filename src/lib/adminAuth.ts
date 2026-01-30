/**
 * Admin Authentication Utilities
 * JWT 토큰 관리 및 권한 검증 유틸리티
 */

import { AdminUser, AdminRole, AdminResource, AdminAction, ROLE_PERMISSIONS } from '@/types/admin';
import { fetchWithCsrf } from '@/lib/fetchWithCsrf';

// JWT 토큰 관리
export const AUTH_STORAGE_KEY = 'admin-auth';
export const TOKEN_STORAGE_KEY = 'admin-token';
export const REFRESH_TOKEN_STORAGE_KEY = 'admin-refresh-token';

// 보안 강화: localStorage에 저장되는 최소 정보만 포함 (XSS 공격 시 노출 최소화)
export interface StoredAuth {
  userId: string;           // 사용자 ID만 저장
  role: AdminRole;          // 역할 (권한 체크용)
  name: string;             // 이름 (UI 표시용)
  expiresAt: number;
  sessionId?: string;
  // accessToken과 refreshToken은 HttpOnly 쿠키로만 관리되므로 localStorage에 저장하지 않음
  // 상세 정보는 필요 시 getUserInfo() API로 조회
}

// 하위 호환성을 위한 레거시 인터페이스 (마이그레이션 기간 동안 사용)
export interface LegacyStoredAuth {
  user: AdminUser;
  expiresAt: number;
  sessionId?: string;
}

export class AdminAuthManager {
  /**
   * 로컬 스토리지에서 인증 정보 가져오기
   * 레거시 데이터 형식도 자동 변환 지원
   */
  static getStoredAuth(): StoredAuth | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);

      // 만료 확인
      if (Date.now() >= data.expiresAt) {
        this.clearStoredAuth();
        return null;
      }

      // 레거시 형식 감지 및 변환
      if (data.user && typeof data.user === 'object') {
        // 레거시 형식: { user: AdminUser, expiresAt, sessionId }
        const legacyAuth = data as LegacyStoredAuth;
        const convertedAuth: StoredAuth = {
          userId: legacyAuth.user.id,
          role: legacyAuth.user.role,
          name: legacyAuth.user.name,
          expiresAt: legacyAuth.expiresAt,
          sessionId: legacyAuth.sessionId
        };

        // 자동으로 새 형식으로 저장 (마이그레이션)
        this.storeAuth(convertedAuth);

        return convertedAuth;
      }

      // 새 형식
      return data as StoredAuth;
    } catch (error) {
      console.error('Failed to parse stored auth:', error);
      this.clearStoredAuth();
      return null;
    }
  }

  /**
   * API를 통해 전체 사용자 정보 조회
   * localStorage에는 최소 정보만 저장하고, 상세 정보는 필요 시 API로 조회
   */
  static async getUserInfo(userId: string): Promise<AdminUser | null> {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const response = await fetchWithCsrf(`${API_URL}/api/admin/users/${userId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        console.error('Failed to fetch user info:', response.statusText);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  /**
   * 인증 정보 저장
   * HttpOnly Cookie는 서버에서 설정하므로 localStorage만 사용
   */
  static storeAuth(auth: StoredAuth): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      // HttpOnly Cookie는 백엔드에서 설정하므로 클라이언트 측 Cookie 설정 제거
    } catch (error) {
      console.error('Failed to store auth:', error);
    }
  }

  /**
   * 저장된 인증 정보 제거
   * HttpOnly Cookie는 백엔드 logout API에서 삭제
   */
  static clearStoredAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);

    // 기존 쿠키들 제거
    document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    document.cookie = 'auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    // HttpOnly Cookie (admin_accessToken, admin_refreshToken)는 서버에서 삭제
  }

  /**
   * 토큰 만료 여부 확인
   */
  static isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * 토큰 갱신 필요 여부 확인 (만료 5분 전)
   */
  static needsRefresh(expiresAt: number): boolean {
    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() >= (expiresAt - fiveMinutes);
  }
}

// 권한 검증
export class PermissionChecker {
  /**
   * 사용자가 특정 리소스에 대한 액션 권한이 있는지 확인
   */
  static hasPermission(
    user: AdminUser,
    resource: AdminResource,
    action: AdminAction
  ): boolean {
    // SUPER_ADMIN은 모든 권한
    if (user.role === AdminRole.SUPER_ADMIN) {
      return true;
    }

    // 역할별 기본 권한 확인
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    const resourcePermission = rolePermissions.find(p => p.resource === resource);

    if (!resourcePermission) {
      return false;
    }

    // 기본 역할 권한에 해당 액션이 포함되어 있는지 확인
    const hasRolePermission = resourcePermission.actions.includes(action);

    // 사용자별 개별 권한 확인 (기본 권한을 오버라이드할 수 있음)
    const userPermission = user.permissions.find(p => p.resource === resource);
    if (userPermission) {
      return userPermission.actions.includes(action);
    }

    return hasRolePermission;
  }

  /**
   * 여러 권한을 모두 가지고 있는지 확인
   */
  static hasAllPermissions(
    user: AdminUser,
    permissions: Array<{ resource: AdminResource; action: AdminAction }>
  ): boolean {
    return permissions.every(({ resource, action }) =>
      this.hasPermission(user, resource, action)
    );
  }

  /**
   * 여러 권한 중 하나라도 가지고 있는지 확인
   */
  static hasAnyPermission(
    user: AdminUser,
    permissions: Array<{ resource: AdminResource; action: AdminAction }>
  ): boolean {
    return permissions.some(({ resource, action }) =>
      this.hasPermission(user, resource, action)
    );
  }

  /**
   * 특정 리소스에 대한 모든 허용된 액션 반환
   */
  static getAllowedActions(
    user: AdminUser,
    resource: AdminResource
  ): AdminAction[] {
    if (user.role === AdminRole.SUPER_ADMIN) {
      return Object.values(AdminAction);
    }

    const rolePermissions = ROLE_PERMISSIONS[user.role];
    const resourcePermission = rolePermissions.find(p => p.resource === resource);

    // 사용자별 개별 권한이 있으면 우선 적용
    const userPermission = user.permissions.find(p => p.resource === resource);
    if (userPermission) {
      return userPermission.actions;
    }

    return resourcePermission ? resourcePermission.actions : [];
  }
}

// 세션 관리
export class SessionManager {
  private static readonly SESSION_CHECK_INTERVAL = 60000; // 1분
  private static checkInterval: NodeJS.Timeout | null = null;

  /**
   * 세션 모니터링 시작
   */
  static startSessionMonitoring(
    onSessionExpired: () => void,
    onSessionWarning: (minutesLeft: number) => void
  ): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(() => {
      const auth = AdminAuthManager.getStoredAuth();
      if (!auth) {
        onSessionExpired();
        return;
      }

      const timeLeft = auth.expiresAt - Date.now();
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));

      // 5분 전 경고
      if (minutesLeft <= 5 && minutesLeft > 0) {
        onSessionWarning(minutesLeft);
      }

      // 만료 시 콜백 호출
      if (minutesLeft <= 0) {
        onSessionExpired();
      }
    }, this.SESSION_CHECK_INTERVAL);
  }

  /**
   * 세션 모니터링 중지
   */
  static stopSessionMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * 세션 연장 (사용자 활동 감지 시)
   */
  static async extendSession(): Promise<boolean> {
    const auth = AdminAuthManager.getStoredAuth();
    if (!auth || AdminAuthManager.needsRefresh(auth.expiresAt)) {
      // TODO: Implement token refresh API call
      console.log('Token refresh needed');
      return false;
    }

    // 세션 활동 업데이트 (서버에 활동 기록)
    // TODO: Implement activity tracking API call
    return true;
  }
}

// 2FA 관련 유틸리티
export class TwoFactorAuth {
  /**
   * TOTP 코드 유효성 검사 (클라이언트 사이드는 기본 검증만)
   */
  static isValidTOTPFormat(code: string): boolean {
    // 6자리 숫자인지 확인
    return /^\d{6}$/.test(code);
  }

  /**
   * 2FA 설정 QR 코드 생성용 URI
   */
  static generateQRCodeURI(
    secret: string,
    email: string,
    issuer: string = 'Custody Admin'
  ): string {
    const label = encodeURIComponent(`${issuer}:${email}`);
    const params = new URLSearchParams({
      secret,
      issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30'
    });

    return `otpauth://totp/${label}?${params.toString()}`;
  }
}

// IP 화이트리스트 검증
export class IPValidator {
  /**
   * IP 주소가 화이트리스트에 있는지 확인
   */
  static isIPAllowed(clientIP: string, whitelist: string[]): boolean {
    if (whitelist.length === 0) return true; // 화이트리스트가 없으면 허용

    return whitelist.some(allowedIP => {
      // CIDR 표기법 지원
      if (allowedIP.includes('/')) {
        return this.isIPInCIDR(clientIP, allowedIP);
      }

      // 정확한 IP 매칭
      return clientIP === allowedIP;
    });
  }

  /**
   * IP가 CIDR 범위에 있는지 확인
   */
  private static isIPInCIDR(ip: string, cidr: string): boolean {
    // 간단한 CIDR 검증 (실제 프로덕션에서는 라이브러리 사용 권장)
    const [network, prefixLength] = cidr.split('/');
    const networkParts = network.split('.').map(Number);
    const ipParts = ip.split('.').map(Number);

    const prefix = parseInt(prefixLength);
    const mask = 0xffffffff << (32 - prefix);

    const networkInt = (networkParts[0] << 24) + (networkParts[1] << 16) +
                       (networkParts[2] << 8) + networkParts[3];
    const ipInt = (ipParts[0] << 24) + (ipParts[1] << 16) +
                  (ipParts[2] << 8) + ipParts[3];

    return (networkInt & mask) === (ipInt & mask);
  }
}

// 감사 로그 헬퍼
export class AuditLogger {
  /**
   * 관리자 액션 로깅
   */
  static async logAdminAction(
    user: AdminUser,
    action: string,
    resource: string,
    resourceId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const logEntry = {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      action,
      resource,
      resourceId,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
    };

    // TODO: Implement audit log API call
    console.log('Audit Log:', logEntry);
  }

  /**
   * 클라이언트 IP 주소 가져오기
   */
  private static async getClientIP(): Promise<string> {
    try {
      // Backend API에서 IP 조회
      const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
      const response = await fetch(`${API_URL}/api/client-ip`);
      const data = await response.json();
      return data.ip || 'unknown';
    } catch {
      return 'unknown';
    }
  }
}