/**
 * Corporate Inquiry API Service
 * 법인 문의 관련 API
 */

import { apiClient } from './api';

export interface CorporateInquiryStats {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  contacted: number;
  completed: number;
  rejected: number;
  onHold: number;
  urgent: number;
  high: number;
  waitingCount: number;
  processingCount: number;
  urgentCount: number;
}

/**
 * 법인 문의 통계 조회
 */
export const getCorporateInquiryStats = async (): Promise<CorporateInquiryStats> => {
  const response = await apiClient.get('/corporate-inquiry/admin/stats');
  return response.data.data;
};
