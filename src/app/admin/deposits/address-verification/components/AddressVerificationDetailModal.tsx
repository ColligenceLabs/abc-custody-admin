'use client';

/**
 * 주소 검증 상세 모달 컴포넌트
 *
 * 검증 상세 정보, 회원사 등록 주소 목록, 검증 히스토리를 표시합니다.
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Flag } from 'lucide-react';
import { AddressVerificationDetail } from '@/types/deposit';

interface AddressVerificationDetailModalProps {
  verification: AddressVerificationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onFlagAddress?: (verification: AddressVerificationDetail) => void;
}

export function AddressVerificationDetailModal({
  verification,
  isOpen,
  onClose,
  onFlagAddress,
}: AddressVerificationDetailModalProps) {
  if (!verification) return null;

  // 검증 상태 아이콘
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>주소 검증 상세</span>
            {!verification.isFlagged && verification.verificationStatus === 'failed' && onFlagAddress && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onFlagAddress(verification)}
              >
                <Flag className="h-4 w-4 mr-2" />
                플래그 처리
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="addresses">회원사 등록 주소</TabsTrigger>
            <TabsTrigger value="history">검증 히스토리</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-4">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">회원사</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {verification.memberName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">자산</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {verification.amount} {verification.asset}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">KRW 환산</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ₩{Number(verification.amountKRW).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">시간</label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(verification.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">TxHash</label>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {verification.txHash}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">송신 주소 (검증 대상)</label>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {verification.fromAddress}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">수신 주소 (입금 주소)</label>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {verification.toAddress}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 검증 결과 */}
            <Card>
              <CardHeader>
                <CardTitle>검증 결과</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">검증 상태</label>
                    <div className="mt-1">
                      {verification.verificationStatus === 'passed' && (
                        <Badge className="bg-green-100 text-green-800">통과</Badge>
                      )}
                      {verification.verificationStatus === 'failed' && (
                        <Badge className="bg-red-100 text-red-800">실패</Badge>
                      )}
                      {verification.verificationStatus === 'pending' && (
                        <Badge className="bg-yellow-100 text-yellow-800">대기</Badge>
                      )}
                      {verification.verificationStatus === 'flagged' && (
                        <Badge className="bg-orange-100 text-orange-800">플래그</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">등록 여부</label>
                    <div className="mt-1">
                      {verification.isRegistered ? (
                        <Badge className="bg-green-100 text-green-800">등록됨</Badge>
                      ) : (
                        <Badge variant="destructive">미등록</Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">입금 권한</label>
                    <div className="mt-1">
                      {verification.hasPermission ? (
                        <Badge className="bg-green-100 text-green-800">있음</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">없음</Badge>
                      )}
                    </div>
                  </div>

                  {verification.addressType && (
                    <div>
                      <label className="text-sm text-gray-500 dark:text-gray-400">주소 타입</label>
                      <div className="mt-1">
                        {verification.addressType === 'personal' ? (
                          <Badge variant="outline">개인 지갑</Badge>
                        ) : (
                          <Badge variant="outline">VASP</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {verification.failureReason && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">실패 사유</label>
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      {verification.failureReason === 'unregistered_address' && '미등록 주소'}
                      {verification.failureReason === 'no_deposit_permission' && '입금 권한 없음'}
                      {verification.failureReason === 'suspended_address' && '정지된 주소'}
                      {verification.failureReason === 'blocked_address' && '차단된 주소'}
                    </p>
                  </div>
                )}

                {verification.isFlagged && (
                  <div className="bg-orange-50 dark:bg-orange-950 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Flag className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-orange-900 dark:text-orange-100">
                          플래그됨
                        </p>
                        {verification.flagReason && (
                          <p className="text-sm text-orange-800 dark:text-orange-200 mt-1">
                            사유: {verification.flagReason}
                          </p>
                        )}
                        {verification.flaggedAt && (
                          <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                            {new Date(verification.flaggedAt).toLocaleString('ko-KR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 관련 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>관련 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      이 주소로부터의 이전 입금
                    </label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {verification.relatedInfo.previousDepositsFromAddress}건
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      총 입금액
                    </label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      ₩{Number(verification.relatedInfo.totalVolumeFromAddress).toLocaleString()}
                    </p>
                  </div>
                </div>
                {verification.relatedInfo.lastDepositFromAddress && (
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">
                      마지막 입금 시간
                    </label>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(verification.relatedInfo.lastDepositFromAddress).toLocaleString('ko-KR')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 회원사 등록 주소 탭 */}
          <TabsContent value="addresses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  회원사 등록 주소 목록 ({verification.memberRegisteredAddresses.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verification.memberRegisteredAddresses.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    등록된 주소가 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {verification.memberRegisteredAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {addr.label}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              등록일: {new Date(addr.addedAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {addr.type === 'personal' ? (
                              <Badge variant="outline">개인</Badge>
                            ) : (
                              <Badge variant="outline">VASP</Badge>
                            )}
                            {addr.status === 'active' && (
                              <Badge className="bg-green-100 text-green-800">활성</Badge>
                            )}
                            {addr.status === 'suspended' && (
                              <Badge className="bg-yellow-100 text-yellow-800">정지</Badge>
                            )}
                            {addr.status === 'blocked' && (
                              <Badge variant="destructive">차단</Badge>
                            )}
                          </div>
                        </div>

                        <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all mb-2">
                          {addr.address}
                        </p>

                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            입금: {addr.permissions.canDeposit ? '✓' : '✗'}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            출금: {addr.permissions.canWithdraw ? '✓' : '✗'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 검증 히스토리 탭 */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>검증 히스토리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {verification.verificationHistory.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="mt-1">{getStatusIcon(item.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {item.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(item.timestamp).toLocaleString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {item.description}
                        </p>
                        {item.performedBy && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            처리자: {item.performedBy}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
