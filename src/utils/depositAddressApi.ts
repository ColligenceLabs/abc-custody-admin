/**
 * 입금 주소 관련 API 유틸리티
 */

import { NetworkGroup } from '@/types/networkGroup';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * 네트워크별 그룹화된 입금 주소 조회
 */
export async function getDepositAddressesByNetwork(userId: string): Promise<NetworkGroup[]> {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}/api/depositAddresses/by-network?userId=${userId}`;
  console.log('[depositAddressApi] API 호출:', { url, API_BASE_URL, userId });

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
  console.log('[depositAddressApi] API 응답 상태:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[depositAddressApi] API 오류:', errorText);
    throw new Error('네트워크별 입금 주소 조회 실패');
  }

  const data = await response.json();
  console.log('[depositAddressApi] API 응답 데이터:', data);
  return data;
}

/**
 * 입금 주소 생성
 */
export async function createDepositAddress(data: {
  userId: string;
  coin: string;
  label?: string;
  network?: string;
  priceKRW?: number;
  priceUSD?: number;
  contractAddress?: string;
}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/depositAddresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = '입금 주소 생성 실패';
    try {
      const errorData = await response.json();
      console.error('[depositAddressApi] 서버 오류 응답:', errorData);

      // Validation error의 경우 details 배열 표시
      if (errorData.details && Array.isArray(errorData.details) && errorData.details.length > 0) {
        const detailMessages = errorData.details.map((d: any) => d.message || d).join(', ');
        errorMessage = `검증 오류: ${detailMessages}`;
        console.error('[depositAddressApi] Validation details:', errorData.details);
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = typeof errorData.error === 'string' ? errorData.error : '입금 주소 생성 실패';
      }
    } catch (parseError) {
      console.error('[depositAddressApi] 오류 응답 파싱 실패:', parseError);
      const errorText = await response.text();
      console.error('[depositAddressApi] 응답 텍스트:', errorText);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * 입금 주소 삭제
 */
export async function deleteDepositAddress(id: string) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}/api/depositAddresses/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error('입금 주소 삭제 실패');
  }

  return response.status === 204;
}
