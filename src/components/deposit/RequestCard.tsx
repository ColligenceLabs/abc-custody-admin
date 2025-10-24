'use client'

import { AssetAddRequest, AssetRequestStatus, FeedbackType } from '@/types/assetRequest'
import { ClockIcon, EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '@/utils/withdrawalHelpers'

interface RequestCardProps {
  request: AssetAddRequest
  onViewDetails?: (request: AssetAddRequest) => void
  onResubmit?: (request: AssetAddRequest) => void
}

export function RequestCard({ request, onViewDetails, onResubmit }: RequestCardProps) {
  const getStatusConfig = (status: AssetRequestStatus) => {
    switch (status) {
      case 'pending':
        return {
          icon: ClockIcon,
          label: '검토 대기',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        }
      case 'reviewing':
        return {
          icon: EyeIcon,
          label: '검토 중',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        }
      case 'approved':
        return {
          icon: CheckCircleIcon,
          label: '승인 완료',
          color: 'text-sky-600 bg-sky-50 border-sky-200'
        }
      case 'rejected':
        return {
          icon: XCircleIcon,
          label: '승인 거절',
          color: 'text-red-600 bg-red-50 border-red-200'
        }
    }
  }

  const getFeedbackTypeColor = (type?: FeedbackType) => {
    switch (type) {
      case 'info':
        return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'warning':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200'
      case 'success':
        return 'text-sky-700 bg-sky-50 border-sky-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const statusConfig = getStatusConfig(request.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1">
          {/* Status Badge */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {statusConfig.label}
          </span>

          {/* Token Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {request.symbol} - {request.name}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {formatDateTime(request.requestedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Contract Address & Network */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-xs">
          <span className="text-gray-500 w-20">컨트랙트:</span>
          <code className="text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded text-xs">
            {request.contractAddress.slice(0, 10)}...{request.contractAddress.slice(-8)}
          </code>
        </div>
        <div className="flex items-center text-xs">
          <span className="text-gray-500 w-20">네트워크:</span>
          <span className="text-gray-900 capitalize">{request.network}</span>
        </div>
      </div>

      {/* Feedback Section */}
      {request.feedback && (
        <div className={`p-3 rounded-lg border mb-3 ${getFeedbackTypeColor(request.feedback.type)}`}>
          <p className="text-sm">
            {request.feedback.message}
          </p>
          {request.feedback.reviewedBy && (
            <p className="text-xs mt-1 opacity-75">
              검토자: {request.feedback.reviewedBy} · {request.feedback.reviewedAt && formatDateTime(request.feedback.reviewedAt)}
            </p>
          )}
        </div>
      )}

      {/* Rejection Reason */}
      {request.status === 'rejected' && request.rejectionReason && !request.feedback && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 mb-3">
          <p className="text-sm text-red-800">
            <span className="font-medium">거절 사유:</span> {request.rejectionReason}
          </p>
        </div>
      )}

      {/* Approval Note */}
      {request.status === 'approved' && request.approvalNote && !request.feedback && (
        <div className="p-3 rounded-lg border border-sky-200 bg-sky-50 mb-3">
          <p className="text-sm text-sky-800">
            {request.approvalNote}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(request)}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            상세보기
          </button>
        )}
        {request.status === 'rejected' && onResubmit && (
          <button
            onClick={() => onResubmit(request)}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            재요청
          </button>
        )}
      </div>
    </div>
  )
}
