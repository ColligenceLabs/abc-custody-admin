'use client';

/**
 * 입금 상세 정보 모달
 *
 * 입금 거래의 상세 정보, 검증 타임라인, 블록체인 정보 등을 표시합니다.
 */

import { DepositDetails } from '@/types/deposit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
} from 'lucide-react';

interface DepositDetailModalProps {
  deposit: DepositDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DepositDetailModal({
  deposit,
  isOpen,
  onClose,
}: DepositDetailModalProps) {
  if (!deposit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            입금 상세 정보
          </DialogTitle>
          <DialogDescription>
            TxHash: {deposit.txHash.slice(0, 16)}...{deposit.txHash.slice(-8)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="verification">검증</TabsTrigger>
            <TabsTrigger value="blockchain">블록체인</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-4">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="회원사"
                  value={deposit.memberInfo.companyName}
                />
                <InfoRow label="자산" value={deposit.asset} />
                <InfoRow label="수량" value={deposit.amount} />
                <InfoRow
                  label="금액 (KRW)"
                  value={`₩${parseInt(deposit.amountKRW).toLocaleString()}`}
                />
                <InfoRow
                  label="상태"
                  value={
                    <Badge>
                      {deposit.status === 'pending'
                        ? '대기중'
                        : deposit.status === 'verifying'
                        ? '검증중'
                        : deposit.status === 'completed'
                        ? '완료'
                        : deposit.status === 'returned'
                        ? '환불'
                        : '플래그'}
                    </Badge>
                  }
                />
                <InfoRow
                  label="입금 시간"
                  value={new Date(deposit.timestamp).toLocaleString('ko-KR')}
                />
              </CardContent>
            </Card>

            {/* 주소 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">주소 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="송신 주소"
                  value={
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {deposit.fromAddress.slice(0, 10)}...
                        {deposit.fromAddress.slice(-8)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-blue-500" />
                    </div>
                  }
                />
                <InfoRow
                  label="수신 주소"
                  value={
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {deposit.toAddress.slice(0, 10)}...
                        {deposit.toAddress.slice(-8)}
                      </span>
                      <ExternalLink className="h-3 w-3 text-blue-500" />
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 검증 탭 */}
          <TabsContent value="verification" className="space-y-4">
            {/* 검증 타임라인 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">검증 타임라인</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deposit.verificationTimeline.map((item, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="mt-1">
                        {item.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : item.status === 'error' ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                        ) : item.status === 'warning' ? (
                          <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        ) : (
                          <Info className="h-5 w-5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.action}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(item.timestamp).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AML 체크 결과 */}
            {deposit.amlCheck && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">AML 스크리닝</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow
                    label="리스크 점수"
                    value={
                      <div className="flex items-center space-x-2">
                        <span className="font-bold">
                          {deposit.amlCheck.riskScore}/100
                        </span>
                        <Badge
                          variant={
                            deposit.amlCheck.riskLevel === 'low'
                              ? 'secondary'
                              : deposit.amlCheck.riskLevel === 'medium'
                              ? 'outline'
                              : 'destructive'
                          }
                        >
                          {deposit.amlCheck.riskLevel === 'low'
                            ? '낮음'
                            : deposit.amlCheck.riskLevel === 'medium'
                            ? '중간'
                            : deposit.amlCheck.riskLevel === 'high'
                            ? '높음'
                            : '치명적'}
                        </Badge>
                      </div>
                    }
                  />
                  <InfoRow
                    label="블랙리스트"
                    value={deposit.amlCheck.checks.blacklistCheck ? '✅ 통과' : '❌ 차단'}
                  />
                  <InfoRow
                    label="제재 목록"
                    value={deposit.amlCheck.checks.sanctionsListCheck ? '✅ 통과' : '❌ 차단'}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 블록체인 탭 */}
          <TabsContent value="blockchain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">블록체인 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="블록 번호"
                  value={deposit.blockNumber?.toLocaleString()}
                />
                <InfoRow
                  label="컨펌"
                  value={`${deposit.confirmations}/${deposit.requiredConfirmations}`}
                />
                <InfoRow
                  label="네트워크 수수료"
                  value={`${deposit.networkFee} ${deposit.asset}`}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/**
 * 정보 행 컴포넌트
 */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}