import { WithdrawalRequest, IndividualWithdrawalRequest, Currency } from '@/types/withdrawal';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface WithdrawalFilters {
  userId?: string;
  memberType?: 'individual' | 'corporate';
  status?: string;
  currency?: Currency;
  search?: string; // ID, 제목, 자산 검색
  dateFrom?: string;
  dateTo?: string;
  _page?: number;
  _limit?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
}

export interface WithdrawalListResponse {
  data: WithdrawalRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}

/**
 * 출금 목록 조회 (검색, 필터, 페이지네이션)
 */
export async function getWithdrawals(
  filters?: WithdrawalFilters
): Promise<WithdrawalListResponse> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_URL}/api/withdrawals${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 목록 조회에 실패했습니다.');
  }

  const totalCount = response.headers.get('X-Total-Count');
  const data = await response.json();

  return {
    data,
    total: totalCount ? parseInt(totalCount, 10) : data.length,
    page: filters?._page || 1,
    limit: filters?._limit || 100,
  };
}

/**
 * 출금 상세 조회
 */
export async function getWithdrawalById(id: string): Promise<WithdrawalRequest> {
  const response = await fetch(`${API_URL}/api/withdrawals/${id}`);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 상세 조회에 실패했습니다.');
  }

  return response.json();
}

/**
 * 출금 신청 생성
 */
export async function createWithdrawal(
  data: Omit<WithdrawalRequest, 'id' | 'initiatedAt' | 'auditTrail'>
): Promise<WithdrawalRequest> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/withdrawals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 신청 생성에 실패했습니다.');
  }

  return response.json();
}

/**
 * 출금 정보 수정 (상태 업데이트, 승인/반려 등)
 */
export async function updateWithdrawal(
  id: string,
  data: Partial<WithdrawalRequest>
): Promise<WithdrawalRequest> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/withdrawals/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 정보 수정에 실패했습니다.');
  }

  return response.json();
}

/**
 * 출금 신청 삭제
 */
export async function deleteWithdrawal(id: string): Promise<void> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/withdrawals/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 신청 삭제에 실패했습니다.');
  }
}

/**
 * 출금 신청 첨부파일 업로드
 */
export async function uploadWithdrawalAttachments(
  withdrawalId: string,
  files: File[]
): Promise<{
  message: string;
  files: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    path: string;
    uploadedAt: string;
  }>;
  totalAttachments: number;
}> {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_URL}/api/withdrawals/${withdrawalId}/attachments`, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '파일 업로드에 실패했습니다.');
  }

  return response.json();
}

/**
 * 개인회원 출금 목록 조회
 */
export async function getIndividualWithdrawals(
  filters?: Omit<WithdrawalFilters, 'memberType'>
): Promise<WithdrawalListResponse> {
  return getWithdrawals({
    ...filters,
    memberType: 'individual',
  });
}

/**
 * 법인회원 출금 목록 조회
 */
export async function getCorporateWithdrawals(
  filters?: Omit<WithdrawalFilters, 'memberType'>
): Promise<WithdrawalListResponse> {
  return getWithdrawals({
    ...filters,
    memberType: 'corporate',
  });
}

/**
 * 출금 취소/정지
 */
export async function cancelWithdrawal(
  id: string,
  reason: string
): Promise<WithdrawalRequest> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/withdrawals/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '출금 중지에 실패했습니다.');
  }

  return response.json();
}

/**
 * 법인 출금 결재 승인
 */
export async function approveWithdrawal(
  id: string,
  userId: string,
  userName: string
): Promise<WithdrawalRequest> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/withdrawals/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ userId, userName }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '결재 승인에 실패했습니다.');
  }

  return response.json();
}

/**
 * 법인 출금 결재 반려
 */
export async function rejectWithdrawalCorporate(
  id: string,
  userId: string,
  userName: string,
  reason: string
): Promise<WithdrawalRequest> {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}/api/withdrawals/${id}/reject/manager`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify({ userId, userName, reason }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || '결재 반려에 실패했습니다.');
  }

  return response.json();
}

/**
 * 출금 상태별 개수 조회 (대시보드용)
 */
export async function getWithdrawalCountsByStatus(
  memberType?: 'individual' | 'corporate'
): Promise<Record<string, number>> {
  const filters: WithdrawalFilters = {};
  if (memberType) {
    filters.memberType = memberType;
  }

  const { data } = await getWithdrawals(filters);

  const counts: Record<string, number> = {
    draft: 0,
    submitted: 0,
    approved: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0,
    cancelled: 0,
    archived: 0,
    stopped: 0,
  };

  data.forEach(withdrawal => {
    if (counts[withdrawal.status] !== undefined) {
      counts[withdrawal.status]++;
    }
  });

  return counts;
}
