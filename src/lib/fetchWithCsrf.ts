/**
 * CSRF 토큰이 자동으로 포함되는 fetch wrapper
 */

let csrfTokenCache: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/csrf-token`,
      { credentials: 'include' }
    );

    if (response.ok) {
      const data = await response.json();
      const token = data.csrfToken || '';
      csrfTokenCache = token;
      return token;
    }
  } catch (error) {
    console.error('[fetchWithCsrf] CSRF 토큰 가져오기 실패:', error);
  }

  return '';
}

/**
 * CSRF 토큰이 자동으로 포함되는 fetch
 * 기존 fetch와 동일하게 사용 가능
 */
export async function fetchWithCsrf(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';

  // POST, PATCH, PUT, DELETE 요청에 CSRF 토큰 추가
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    const csrfToken = await getCsrfToken();

    const headers = new Headers(init?.headers);
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }

    // credentials: 'include'가 없으면 추가
    const credentials = init?.credentials || 'include';

    return fetch(input, {
      ...init,
      headers,
      credentials,
    });
  }

  // GET 요청은 그대로
  return fetch(input, init);
}

/**
 * CSRF 토큰 캐시 초기화
 */
export function clearCsrfCache() {
  csrfTokenCache = null;
}
