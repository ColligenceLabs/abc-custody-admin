/**
 * API Client Configuration
 *
 * axios 기반 HTTP 클라이언트 설정
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// axios 인스턴스 생성
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 인증 토큰이 있으면 헤더에 추가 (추후 구현)
    // const token = localStorage.getItem('auth_token');
    // if (token && config.headers) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }

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
        // 로그인 페이지로 리다이렉트 (추후 구현)
        // window.location.href = '/login';
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
