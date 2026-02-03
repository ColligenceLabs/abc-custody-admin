import apiClient from './api-client';

export interface TermsSummaryItem {
  label: string;
  value: string;
  labelEn?: string;
  valueEn?: string;
}

export interface Terms {
  id: string;
  type: string;
  version: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  contentFormat: 'markdown' | 'html' | 'plain';
  applicableMemberTypes: ('individual' | 'corporate')[];
  isRequired: boolean;
  isActive: boolean;
  effectiveDate: string;
  showSummary: boolean;
  summaryItems: TermsSummaryItem[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface TermsListParams {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
  isRequired?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TermsListResponse {
  success: boolean;
  data: Terms[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TermsDetailResponse {
  success: boolean;
  data: {
    terms: Terms;
    stats: {
      totalAgreements: number;
    };
  };
}

export interface CreateTermsRequest {
  type: string;
  version: string;
  title: string;
  titleEn?: string;
  content: string;
  contentEn?: string;
  contentFormat?: 'markdown' | 'html' | 'plain';
  applicableMemberTypes?: ('individual' | 'corporate')[];
  isRequired?: boolean;
  isActive?: boolean;
  effectiveDate: string;
  showSummary?: boolean;
  summaryItems?: TermsSummaryItem[] | null;
}

export interface UpdateTermsRequest {
  title?: string;
  titleEn?: string;
  content?: string;
  contentEn?: string;
  contentFormat?: 'markdown' | 'html' | 'plain';
  applicableMemberTypes?: ('individual' | 'corporate')[];
  isRequired?: boolean;
  isActive?: boolean;
  effectiveDate?: string;
  showSummary?: boolean;
  summaryItems?: TermsSummaryItem[] | null;
}

/**
 * 약관 목록 조회
 */
export const getTermsList = async (params?: TermsListParams): Promise<TermsListResponse> => {
  const response = await apiClient.get('/admin/terms', { params });
  return response.data;
};

/**
 * 약관 상세 조회
 */
export const getTermsById = async (id: string): Promise<TermsDetailResponse> => {
  const response = await apiClient.get(`/admin/terms/${id}`);
  return response.data;
};

/**
 * 약관 생성
 */
export const createTerms = async (data: CreateTermsRequest): Promise<{ success: boolean; data: Terms }> => {
  const response = await apiClient.post('/admin/terms', data);
  return response.data;
};

/**
 * 약관 수정
 */
export const updateTerms = async (id: string, data: UpdateTermsRequest): Promise<{ success: boolean; data: Terms }> => {
  const response = await apiClient.put(`/admin/terms/${id}`, data);
  return response.data;
};

/**
 * 약관 삭제
 */
export const deleteTerms = async (id: string, force?: boolean): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.delete(`/admin/terms/${id}`, {
    params: { force: force ? 'true' : 'false' }
  });
  return response.data;
};

/**
 * 약관 활성화/비활성화 토글
 */
export const toggleTermsActive = async (id: string): Promise<{ success: boolean; data: Terms }> => {
  const response = await apiClient.patch(`/admin/terms/${id}/toggle-active`);
  return response.data;
};
