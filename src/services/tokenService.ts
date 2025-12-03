import { apiClient } from './api';

export interface SupportedToken {
  id: string;
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  logoUrl?: string;
  isDefault: boolean;
  isActive: boolean;
  minWithdrawalAmount: string;
  withdrawalFee: string;
  withdrawalFeeType: 'fixed' | 'percentage';
  requiredConfirmations: number | null;
  returnFeeType: 'fixed' | 'percent';
  returnFeeValue: string;
  customTokenRequestId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomTokenRequest {
  id: string;
  userId: string;
  userName?: string;  // 요청자 이름
  memberType?: 'individual' | 'corporate';  // 회원 타입
  organizationName?: string;  // 조직명 (법인인 경우)
  symbol: string;
  name: string;
  contractAddress: string;
  network: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTokenSettingsRequest {
  minWithdrawalAmount?: number;
  withdrawalFee?: number;
  withdrawalFeeType?: 'fixed' | 'percentage';
  returnFeeType?: 'fixed' | 'percent';
  returnFeeValue?: number;
  requiredConfirmations?: number | null;
  isActive?: boolean;
}

// 지원 토큰 목록 조회
export const getSupportedTokens = async (params?: { network?: string; isActive?: boolean }) => {
  const response = await apiClient.get<SupportedToken[]>('/supportedTokens', { params });
  return response.data;
};

// 특정 토큰 조회
export const getSupportedTokenById = async (id: string) => {
  const response = await apiClient.get<SupportedToken>(`/supportedTokens/${id}`);
  return response.data;
};

// 토큰 설정 업데이트
export const updateTokenSettings = async (id: string, data: UpdateTokenSettingsRequest) => {
  const response = await apiClient.patch<{ success: boolean; data: SupportedToken }>(`/supportedTokens/${id}/settings`, data);
  return response.data;
};

// 토큰 활성화/비활성화 토글
export const toggleTokenStatus = async (id: string) => {
  const response = await apiClient.post<{ success: boolean; data: SupportedToken; message: string }>(`/supportedTokens/${id}/toggle`);
  return response.data;
};

// 커스텀 토큰 요청 목록 조회
export const getCustomTokenRequests = async (params?: { status?: string; userId?: string }) => {
  const response = await apiClient.get<{ data: CustomTokenRequest[]; pagination: any }>('/customTokenRequests', { params });
  return response.data.data; // 백엔드가 { data: [...], pagination: {...} } 형식으로 반환
};

// 커스텀 토큰 요청 승인/반려
export const updateCustomTokenRequestStatus = async (
  id: string,
  data: { status: 'approved' | 'rejected'; adminComment?: string; [key: string]: any }
) => {
  const response = await apiClient.patch<{ success: boolean; data: CustomTokenRequest }>(`/customTokenRequests/${id}`, data);
  return response.data;
};

// 커스텀 토큰 요청 승인
export const approveCustomTokenRequest = async (
  id: string,
  settings?: {
    minWithdrawalAmount?: number;
    withdrawalFee?: number;
    withdrawalFeeType?: 'fixed' | 'percentage';
    requiredConfirmations?: number | null;
    isActive?: boolean;
  }
) => {
  return updateCustomTokenRequestStatus(id, {
    status: 'approved',
    ...settings
  });
};

// 커스텀 토큰 요청 반려
export const rejectCustomTokenRequest = async (id: string, reason: string) => {
  return updateCustomTokenRequestStatus(id, { status: 'rejected', adminComment: reason });
};
