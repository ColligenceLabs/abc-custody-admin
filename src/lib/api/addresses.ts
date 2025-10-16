import { WhitelistedAddress } from '@/types/address';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function getAddressesByUserId(userId: string): Promise<WhitelistedAddress[]> {
  const response = await fetch(`${API_URL}/api/addresses?userId=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('주소 목록 조회에 실패했습니다');
  }

  const data = await response.json();
  return data;
}

export async function getAddresses(filters?: {
  userId?: string;
  type?: 'personal' | 'vasp';
  coin?: string;
}): Promise<WhitelistedAddress[]> {
  const params = new URLSearchParams();
  if (filters?.userId) params.append('userId', filters.userId);
  if (filters?.type) params.append('type', filters.type);
  if (filters?.coin) params.append('coin', filters.coin);

  const response = await fetch(`${API_URL}/api/addresses?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('주소 목록 조회에 실패했습니다');
  }

  const data = await response.json();
  return data;
}
