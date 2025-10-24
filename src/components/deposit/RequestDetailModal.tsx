'use client'

import { AssetAddRequest } from '@/types/assetRequest'
import { Modal } from '@/components/common/Modal'
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline'
import { formatDateTime } from '@/utils/withdrawalHelpers'
import { useState } from 'react'

interface RequestDetailModalProps {
  request: AssetAddRequest | null
  isOpen: boolean
  onClose: () => void
  onResubmit?: (request: AssetAddRequest) => void
}

export function RequestDetailModal({
  request,
  isOpen,
  onClose,
  onResubmit
}: RequestDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string>('')

  if (!request) return null

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 2000)
  }

  const getStatusConfig = (status: AssetAddRequest['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: '검토 대기',
          color: 'text-blue-600 bg-blue-50 border-blue-200'
        }
      case 'reviewing':
        return {
          label: '검토 중',
          color: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        }
      case 'approved':
        return {
          label: '승인 완료',
          color: 'text-sky-600 bg-sky-50 border-sky-200'
        }
      case 'rejected':
        return {
          label: '승인 거절',
          color: 'text-red-600 bg-red-50 border-red-200'
        }
    }
  }

  const getFeedbackTypeColor = (type?: string) => {
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

  return (
    <Modal isOpen={isOpen}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {request.symbol} - {request.name}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">요청 ID: {request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 ml-4"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Token Logo */}
        {request.image && (
          <div className="mb-6 flex justify-center">
            <img
              src={request.image}
              alt={`${request.symbol} logo`}
              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        )}

        {/* Basic Information */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">기본 정보</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">토큰 심볼</label>
              <p className="text-sm font-medium text-gray-900">{request.symbol}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">토큰 이름</label>
              <p className="text-sm font-medium text-gray-900">{request.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">네트워크</label>
            <p className="text-sm font-medium text-gray-900 capitalize">{request.network}</p>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">컨트랙트 주소</label>
            <div className="flex items-center space-x-2">
              <code className="flex-1 text-sm font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                {request.contractAddress}
              </code>
              <button
                onClick={() => handleCopy(request.contractAddress, 'contract')}
                className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="복사"
              >
                {copiedField === 'contract' ? (
                  <CheckIcon className="w-5 h-5 text-sky-600" />
                ) : (
                  <ClipboardDocumentIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {request.priceApiUrl && (
            <div>
              <label className="block text-xs text-gray-500 mb-1">가격 API URL</label>
              <div className="flex items-center space-x-2">
                <code className="flex-1 text-xs font-mono bg-gray-50 px-3 py-2 rounded border border-gray-200 break-all">
                  {request.priceApiUrl}
                </code>
                <button
                  onClick={() => handleCopy(request.priceApiUrl!, 'api')}
                  className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="복사"
                >
                  {copiedField === 'api' ? (
                    <CheckIcon className="w-5 h-5 text-sky-600" />
                  ) : (
                    <ClipboardDocumentIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">요청자</label>
              <p className="text-sm font-medium text-gray-900">{request.requestedBy}</p>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">요청 시간</label>
              <p className="text-sm font-medium text-gray-900">{formatDateTime(request.requestedAt)}</p>
            </div>
          </div>
        </div>

        {/* Feedback Section */}
        {request.feedback && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">관리자 피드백</h4>
            <div className={`p-4 rounded-lg border ${getFeedbackTypeColor(request.feedback.type)}`}>
              <p className="text-sm mb-2">{request.feedback.message}</p>
              {request.feedback.reviewedBy && (
                <div className="text-xs opacity-75 pt-2 border-t border-current">
                  <p>검토자: {request.feedback.reviewedBy}</p>
                  {request.feedback.reviewedAt && (
                    <p>검토 시간: {formatDateTime(request.feedback.reviewedAt)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Approval Note */}
        {request.status === 'approved' && request.approvalNote && !request.feedback && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">승인 안내</h4>
            <div className="p-4 rounded-lg border border-sky-200 bg-sky-50">
              <p className="text-sm text-sky-800">{request.approvalNote}</p>
            </div>
          </div>
        )}

        {/* Rejection Reason */}
        {request.status === 'rejected' && request.rejectionReason && !request.feedback && (
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 border-b pb-2 mb-4">거절 사유</h4>
            <div className="p-4 rounded-lg border border-red-200 bg-red-50">
              <p className="text-sm text-red-800">
                <span className="font-medium">사유:</span> {request.rejectionReason}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            닫기
          </button>
          {request.status === 'rejected' && onResubmit && (
            <button
              onClick={() => {
                onResubmit(request)
                onClose()
              }}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              재요청
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
