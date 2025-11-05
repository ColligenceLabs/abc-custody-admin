import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (인증 토큰 추가)
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰 가져오기
    if (typeof window !== 'undefined') {
      try {
        const storedAuth = localStorage.getItem('admin-auth');
        if (storedAuth) {
          const auth = JSON.parse(storedAuth);
          if (auth.accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${auth.accessToken}`;
          }
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
      }
    }
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
