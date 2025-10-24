'use client'

import { useState } from 'react'
import { AssetAddRequest } from '@/types/assetRequest'
import { RequestCard } from './RequestCard'
import { InboxIcon } from '@heroicons/react/24/outline'

interface RequestHistoryListProps {
  requests: AssetAddRequest[]
  isLoading?: boolean
  onViewDetails?: (request: AssetAddRequest) => void
  onResubmit?: (request: AssetAddRequest) => void
}

export function RequestHistoryList({
  requests,
  isLoading = false,
  onViewDetails,
  onResubmit
}: RequestHistoryListProps) {
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewing' | 'approved' | 'rejected'>('all')

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(req => req.status === filter)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-3 text-sm text-gray-600">요청 내역을 불러오는 중...</span>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <InboxIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">요청 내역이 없습니다</h3>
        <p className="mt-1 text-sm text-gray-500">
          Custom ERC-20 토큰 추가 요청을 하시면 여기에 표시됩니다.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          전체 ({requests.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'pending'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          대기 중 ({requests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('reviewing')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'reviewing'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          검토 중 ({requests.filter(r => r.status === 'reviewing').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'approved'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          승인 ({requests.filter(r => r.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            filter === 'rejected'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          거절 ({requests.filter(r => r.status === 'rejected').length})
        </button>
      </div>

      {/* Request Cards */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            해당 상태의 요청이 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onViewDetails={onViewDetails}
              onResubmit={onResubmit}
            />
          ))}
        </div>
      )}
    </div>
  )
}
