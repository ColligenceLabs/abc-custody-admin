import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키 자동 전송
});

// CSRF 토큰 캐시
let csrfTokenCache: string | null = null;

// CSRF 토큰 가져오기
async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/csrf-token`, {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      const token = data.csrfToken || '';
      csrfTokenCache = token;
      return token;
    }
  } catch (error) {
    console.error('CSRF 토큰 가져오기 실패:', error);
  }

  return '';
}

// 요청 인터셉터 (인증 토큰 및 CSRF 토큰 추가)
apiClient.interceptors.request.use(
  async (config) => {
    console.log('[API Client] 요청:', config.method?.toUpperCase(), config.url);

    // CSRF 토큰 추가 (POST, PATCH, DELETE 요청)
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
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 핸들링)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
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
    return Promise.reject(error);
  }
);

export default apiClient;
