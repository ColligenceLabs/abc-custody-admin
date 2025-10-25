/**
 * 지원 토큰 관련 API 유틸리티
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface SupportedToken {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  logoUrl: string | null;
  isDefault: boolean;
  isActive: boolean;
}

/**
 * 지원 토큰 목록 조회
 */
export async function getSupportedTokens(params?: {
  network?: string;
  isActive?: boolean;
}): Promise<SupportedToken[]> {
  const queryParams = new URLSearchParams();

  if (params?.network) {
    queryParams.append('network', params.network);
  }

  if (params?.isActive !== undefined) {
    queryParams.append('isActive', String(params.isActive));
  }

  const url = `${API_BASE_URL}/api/supportedTokens${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  console.log('[supportedTokenApi] API 호출:', { url, params });

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  console.log('[supportedTokenApi] API 응답 상태:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[supportedTokenApi] API 오류:', errorText);
    throw new Error('지원 토큰 목록 조회 실패');
  }

  const data = await response.json();
  console.log('[supportedTokenApi] API 응답 데이터:', data);
  return data;
}

/**
 * 특정 토큰 조회
 */
export async function getSupportedTokenById(id: string): Promise<SupportedToken> {
  const url = `${API_BASE_URL}/api/supportedTokens/${id}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[supportedTokenApi] API 오류:', errorText);
    throw new Error('토큰 조회 실패');
  }

  return response.json();
}
