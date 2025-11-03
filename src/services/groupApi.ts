/**
 * Group API Service
 * 그룹 관리 API 서비스
 */

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateGroupRequest {
  name: string;
  type: 'department' | 'project' | 'purpose' | 'custom';
  description: string;
  currency: string;
  budgetYear: number;
  yearlyBudgetAmount: number;
  monthlyBudgets: { month: number; amount: number }[];
  quarterlyBudgets: { quarter: number; amount: number }[];
  approverIds: string[];
  organizationId: string;
  requestedBy: string;
}

export interface ApproveGroupRequest {
  approverId: string;
  reason?: string;
}

export interface RejectGroupRequest {
  approverId: string;
  reason: string;
}

/**
 * 그룹 생성 요청
 */
export async function createGroup(request: CreateGroupRequest) {
  const response = await axios.post(`${API_URL}/api/groups`, request);
  return response.data;
}

/**
 * 그룹 목록 조회
 */
export async function getGroups(organizationId?: string, status?: string) {
  const params = new URLSearchParams();
  if (organizationId) params.append('organizationId', organizationId);
  if (status) params.append('status', status);

  const response = await axios.get(`${API_URL}/api/groups?${params.toString()}`);
  return response.data;
}

/**
 * 그룹 상세 조회
 */
export async function getGroupById(id: string) {
  const response = await axios.get(`${API_URL}/api/groups/${id}`);
  return response.data;
}

/**
 * 그룹 승인
 */
export async function approveGroup(id: string, request: ApproveGroupRequest) {
  const response = await axios.post(`${API_URL}/api/groups/${id}/approve`, request);
  return response.data;
}

/**
 * 그룹 거절
 */
export async function rejectGroup(id: string, request: RejectGroupRequest) {
  const response = await axios.post(`${API_URL}/api/groups/${id}/reject`, request);
  return response.data;
}

/**
 * 예산 사용 (출금 시 호출)
 */
export async function useBudget(id: string, amount: number, year: number, month: number) {
  const response = await axios.post(`${API_URL}/api/groups/${id}/use-budget`, {
    amount,
    year,
    month
  });
  return response.data;
}
