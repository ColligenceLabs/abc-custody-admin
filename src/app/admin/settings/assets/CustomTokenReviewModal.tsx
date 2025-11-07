/**
 * CustomTokenReviewModal Component
 * 커스텀 토큰 요청 검토 모달
 */

"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Copy, Check, X } from "lucide-react";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { CustomTokenRequest } from "@/services/tokenService";
import { approveCustomTokenRequest, rejectCustomTokenRequest } from "@/services/tokenService";

interface CustomTokenReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: CustomTokenRequest;
  onSuccess: () => void;
}

export function CustomTokenReviewModal({
  open,
  onOpenChange,
  request,
  onSuccess,
}: CustomTokenReviewModalProps) {
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 승인 시 설정값
  const [approvalSettings, setApprovalSettings] = useState({
    minWithdrawalAmount: 0,
    withdrawalFee: 0,
    withdrawalFeeType: 'fixed' as 'fixed' | 'percentage',
    requiredConfirmations: 12,
    isActive: true,
  });

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('복사 실패:', error);
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      await approveCustomTokenRequest(request.id, approvalSettings);
      setShowApproveConfirm(false);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('승인 실패:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    try {
      setProcessing(true);
      await rejectCustomTokenRequest(request.id, rejectReason);
      setShowRejectDialog(false);
      setRejectReason("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('반려 실패:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 요청자 표시 이름 (법인: 회사명, 개인: 이름)
  const getRequesterDisplay = () => {
    if (request.memberType === 'corporate' && request.organizationName) {
      return `${request.organizationName} (법인)`;
    }
    return request.userName || request.userId;
  };

  if (!open) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <Card className="w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden">
          {/* 헤더 - 고정 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-xl font-semibold text-gray-900">
              커스텀 토큰 요청 검토
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 본문 - 스크롤 영역 */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* 토큰 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                심볼
              </label>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold">
                  {request.symbol.slice(0, 3)}
                </div>
                <span className="font-mono font-semibold text-lg text-gray-900">{request.symbol}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                토큰명
              </label>
              <div className="text-gray-900">{request.name}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                네트워크
              </label>
              <div className="text-gray-900">{request.network}</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                컨트랙트 주소
              </label>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-gray-100 px-3 py-2 rounded flex-1 font-mono text-gray-900">
                  {request.contractAddress}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(request.contractAddress, 'contract')}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copiedField === 'contract' ? (
                    <Check className="h-4 w-4 text-sky-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                상태
              </label>
              <div>
                <StatusBadge status={request.status} />
              </div>
            </div>

            {/* 요청 정보 */}
            <div className="pt-6 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  요청 일시
                </label>
                <div className="text-sm text-gray-900">{formatDate(request.createdAt)}</div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                요청자
              </label>
              <div className="text-sm text-gray-900">{getRequesterDisplay()}</div>
            </div>

            {request.adminComment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검토 의견
                </label>
                <div className="text-sm bg-gray-50 p-3 rounded-lg text-gray-900 border border-gray-200">
                  {request.adminComment}
                </div>
              </div>
            )}

            {request.reviewedBy && request.reviewedAt && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검토자
                  </label>
                  <div className="text-sm text-gray-900">{request.reviewedBy}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검토 일시
                  </label>
                  <div className="text-sm text-gray-900">{formatDate(request.reviewedAt)}</div>
                </div>
              </>
            )}
          </div>

          {/* 하단 버튼 - 고정 */}
          {request.status === 'pending' && (
            <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowRejectDialog(true)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4 mr-2 inline" />
                반려
              </button>
              <button
                type="button"
                onClick={() => setShowApproveConfirm(true)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-sky-600 border-2 border-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 hover:border-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2 inline" />
                승인
              </button>
            </div>
          )}
        </Card>
      </div>

      {showApproveConfirm && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* 헤더 */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-900">커스텀 토큰 승인</h3>
              <p className="text-sm text-gray-600 mt-1">
                <strong>{request.name} ({request.symbol})</strong> 토큰의 출금 설정을 입력하세요.
              </p>
            </div>

            {/* 폼 */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* 최소 출금 수량 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최소 출금 수량 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.00000001"
                  min="0"
                  required
                  value={approvalSettings.minWithdrawalAmount}
                  onChange={(e) => setApprovalSettings({
                    ...approvalSettings,
                    minWithdrawalAmount: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="0.00000000"
                />
                <p className="mt-1 text-xs text-gray-500">
                  사용자가 출금할 수 있는 최소 수량입니다.
                </p>
              </div>

              {/* 수수료 타입 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  수수료 타입 <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="fixed"
                      checked={approvalSettings.withdrawalFeeType === 'fixed'}
                      onChange={(e) => setApprovalSettings({
                        ...approvalSettings,
                        withdrawalFeeType: 'fixed'
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">고정 수수료</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="percentage"
                      checked={approvalSettings.withdrawalFeeType === 'percentage'}
                      onChange={(e) => setApprovalSettings({
                        ...approvalSettings,
                        withdrawalFeeType: 'percentage'
                      })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">퍼센트 수수료</span>
                  </label>
                </div>
              </div>

              {/* 출금 수수료 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출금 수수료 <span className="text-red-500">*</span>
                  {approvalSettings.withdrawalFeeType === 'fixed' ? ` (${request.symbol})` : ' (%)'}
                </label>
                <input
                  type="number"
                  step={approvalSettings.withdrawalFeeType === 'fixed' ? '0.00000001' : '0.01'}
                  min="0"
                  required
                  value={approvalSettings.withdrawalFee}
                  onChange={(e) => setApprovalSettings({
                    ...approvalSettings,
                    withdrawalFee: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder={approvalSettings.withdrawalFeeType === 'fixed' ? '0.00000000' : '0.00'}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {approvalSettings.withdrawalFeeType === 'fixed'
                    ? '출금 시 부과되는 고정 수수료입니다.'
                    : '출금 금액의 퍼센트로 부과되는 수수료입니다.'}
                </p>
              </div>

              {/* 필요 컨펌 수 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  입금 필요 컨펌 수 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={approvalSettings.requiredConfirmations}
                  onChange={(e) => setApprovalSettings({
                    ...approvalSettings,
                    requiredConfirmations: parseInt(e.target.value) || 1
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  placeholder="12"
                />
                <p className="mt-1 text-xs text-gray-500">
                  블록체인 네트워크에서 트랜잭션을 확정하기 위해 필요한 컨펌 수입니다. (권장: 12-30)
                </p>
              </div>

              {/* 활성화 상태 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">토큰 활성화 상태</div>
                  <p className="text-sm text-gray-500 mt-1">
                    비활성화하면 사용자가 이 토큰으로 출금할 수 없습니다.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-medium ${approvalSettings.isActive ? 'text-sky-600' : 'text-gray-500'}`}>
                    {approvalSettings.isActive ? '활성' : '비활성'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={approvalSettings.isActive}
                      onChange={(e) => setApprovalSettings({
                        ...approvalSettings,
                        isActive: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all after:shadow-sm peer-checked:bg-sky-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowApproveConfirm(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-sky-600 border-2 border-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 hover:border-sky-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {processing ? '처리 중...' : '승인'}
              </button>
            </div>
          </Card>
        </div>,
        document.body
      )}

      {showRejectDialog && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">커스텀 토큰 반려</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{request.name} ({request.symbol})</strong> 토큰 요청을 반려합니다.
              <br />
              반려 사유를 입력해주세요.
            </p>
            <div className="mb-6">
              <Textarea
                placeholder="반려 사유를 입력하세요..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setShowRejectDialog(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing || !rejectReason.trim()}
                className="flex-1 px-4 py-2.5 bg-red-600 border-2 border-red-600 text-white font-medium rounded-lg hover:bg-red-700 hover:border-red-700 transition-colors disabled:opacity-50 shadow-sm"
              >
                {processing ? '처리 중...' : '반려'}
              </button>
            </div>
          </Card>
        </div>,
        document.body
      )}
    </>,
    document.body
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: {
      label: '승인 대기',
      className: 'bg-yellow-50 text-yellow-600 border border-yellow-200'
    },
    approved: {
      label: '승인 완료',
      className: 'bg-sky-50 text-sky-600 border border-sky-200'
    },
    rejected: {
      label: '반려',
      className: 'bg-red-50 text-red-600 border border-red-200'
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
