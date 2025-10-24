import { AssetAddRequest } from '@/types/assetRequest'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Mock 구현 - 실제 백엔드 준비 시 교체
export async function getUserRequests(userId: string): Promise<AssetAddRequest[]> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`${API_BASE_URL}/api/asset-requests?userId=${userId}`)
  // if (!response.ok) throw new Error('Failed to fetch requests')
  // return response.json()

  // Mock: localStorage에서 가져오기
  const requests = localStorage.getItem(`asset_requests_${userId}`)
  return requests ? JSON.parse(requests) : []
}

export async function getRequestById(requestId: string): Promise<AssetAddRequest | null> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`${API_BASE_URL}/api/asset-requests/${requestId}`)
  // if (!response.ok) throw new Error('Failed to fetch request')
  // return response.json()

  // Mock: 모든 요청에서 찾기
  const allUsers = Object.keys(localStorage)
    .filter(key => key.startsWith('asset_requests_'))

  for (const userKey of allUsers) {
    const requests: AssetAddRequest[] = JSON.parse(localStorage.getItem(userKey) || '[]')
    const request = requests.find(r => r.id === requestId)
    if (request) return request
  }

  return null
}

export async function createRequest(
  userId: string,
  request: Omit<AssetAddRequest, 'id' | 'createdAt' | 'updatedAt'>
): Promise<AssetAddRequest> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`${API_BASE_URL}/api/asset-requests`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request),
  // })
  // if (!response.ok) throw new Error('Failed to create request')
  // return response.json()

  // Mock: localStorage에 저장
  const newRequest: AssetAddRequest = {
    ...request,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  const existingRequests = await getUserRequests(userId)
  const updatedRequests = [newRequest, ...existingRequests]
  localStorage.setItem(`asset_requests_${userId}`, JSON.stringify(updatedRequests))

  return newRequest
}

export async function updateRequest(
  requestId: string,
  updates: Partial<AssetAddRequest>
): Promise<AssetAddRequest> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`${API_BASE_URL}/api/asset-requests/${requestId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updates),
  // })
  // if (!response.ok) throw new Error('Failed to update request')
  // return response.json()

  // Mock: localStorage에서 업데이트
  const allUsers = Object.keys(localStorage)
    .filter(key => key.startsWith('asset_requests_'))

  for (const userKey of allUsers) {
    const requests: AssetAddRequest[] = JSON.parse(localStorage.getItem(userKey) || '[]')
    const index = requests.findIndex(r => r.id === requestId)

    if (index !== -1) {
      requests[index] = {
        ...requests[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      localStorage.setItem(userKey, JSON.stringify(requests))
      return requests[index]
    }
  }

  throw new Error('Request not found')
}

export async function deleteRequest(requestId: string): Promise<void> {
  // TODO: 실제 API 호출로 교체
  // const response = await fetch(`${API_BASE_URL}/api/asset-requests/${requestId}`, {
  //   method: 'DELETE',
  // })
  // if (!response.ok) throw new Error('Failed to delete request')

  // Mock: localStorage에서 삭제
  const allUsers = Object.keys(localStorage)
    .filter(key => key.startsWith('asset_requests_'))

  for (const userKey of allUsers) {
    const requests: AssetAddRequest[] = JSON.parse(localStorage.getItem(userKey) || '[]')
    const filtered = requests.filter(r => r.id !== requestId)

    if (filtered.length !== requests.length) {
      localStorage.setItem(userKey, JSON.stringify(filtered))
      return
    }
  }

  throw new Error('Request not found')
}

// 필터링 옵션
export interface RequestFilters {
  status?: AssetAddRequest['status']
  network?: string
  fromDate?: string
  toDate?: string
}

export async function getFilteredRequests(
  userId: string,
  filters: RequestFilters
): Promise<AssetAddRequest[]> {
  let requests = await getUserRequests(userId)

  if (filters.status) {
    requests = requests.filter(r => r.status === filters.status)
  }

  if (filters.network) {
    requests = requests.filter(r => r.network === filters.network)
  }

  if (filters.fromDate) {
    requests = requests.filter(r => new Date(r.requestedAt) >= new Date(filters.fromDate!))
  }

  if (filters.toDate) {
    requests = requests.filter(r => new Date(r.requestedAt) <= new Date(filters.toDate!))
  }

  return requests
}
