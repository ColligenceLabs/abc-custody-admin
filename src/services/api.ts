/**
 * API Client Configuration
 *
 * axios 기반 HTTP 클라이언트 설정
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API 기본 URL 설정 (항상 /api 프리픽스 추가)
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api`;

// CSRF 토큰 캐시
let csrfTokenCache: string | null = null;

// CSRF 토큰 가져오기
async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/csrf-token`, {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.csrfToken || '';
      csrfTokenCache = token;
      return token;
    }
  } catch (error) {
    console.error('[CSRF] 토큰 가져오기 실패:', error);
  }

  return '';
}

// axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('[API Client] 요청:', config.method?.toUpperCase(), config.url);

    // CSRF 토큰 추가 (POST, PATCH, PUT, DELETE 요청)
    if (['post', 'patch', 'put', 'delete'].includes(config.method?.toLowerCase() || '')) {
      const csrfToken = await getCsrfToken();
      console.log('[API Client] CSRF 토큰:', csrfToken?.substring(0, 20) + '...');
      if (csrfToken && config.headers) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }

    // JWT 토큰은 HttpOnly 쿠키로 자동 전송됨 (withCredentials: true 설정)
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // 에러 처리
    if (error.response) {
      // 서버 응답 에러 (4xx, 5xx)
      console.error('API Response Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // 401 Unauthorized - 인증 실패
      if (error.response.status === 401) {
        // 토큰 만료 시 로컬 스토리지 정리 후 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin-auth');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // 쿠키도 제거
          document.cookie = 'admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
          window.location.href = '/admin/auth/login';
        }
      }

      // 403 Forbidden - 권한 없음
      if (error.response.status === 403) {
        console.error('접근 권한이 없습니다.');
      }

      // 404 Not Found
      if (error.response.status === 404) {
        console.error('요청한 리소스를 찾을 수 없습니다.');
      }

      // 500 Internal Server Error
      if (error.response.status >= 500) {
        console.error('서버 오류가 발생했습니다.');
      }
    } else if (error.request) {
      // 요청은 전송되었으나 응답을 받지 못함
      console.error('API Request Error: No response received', {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // 요청 설정 중 오류 발생
      console.error('API Configuration Error:', error.message);
    }

    return Promise.reject(error);
  }
);

// API 에러 타입
export interface ApiError {
  status?: number;
  message: string;
  details?: any;
}

// API 에러 변환 헬퍼
export function transformApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    return {
      status: error.response?.status,
      message: error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.',
      details: error.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: '알 수 없는 오류가 발생했습니다.',
  };
}
