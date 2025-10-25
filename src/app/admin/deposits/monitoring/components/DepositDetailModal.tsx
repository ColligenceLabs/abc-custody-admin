'use client';

/**
 * 입금 상세 정보 모달
 *
 * 입금 거래의 상세 정보, 검증 타임라인, 블록체인 정보 등을 표시합니다.
 */

import { DepositTransaction } from '@/types/deposit';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatCryptoAmount } from '@/lib/format';

interface DepositDetailModalProps {
  deposit: DepositTransaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DepositDetailModal({
  deposit,
  isOpen,
  onClose,
}: DepositDetailModalProps) {
  const { toast } = useToast();

  if (!deposit) return null;

  const handleCopyTxHash = () => {
    navigator.clipboard.writeText(deposit.txHash);
    toast({
      description: '트랜잭션 해시가 복사되었습니다.',
    });
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      description: '주소가 복사되었습니다.',
    });
  };

  const getBlockExplorerUrl = () => {
    const baseUrl = deposit.network === 'Ethereum'
      ? 'https://etherscan.io'
      : 'https://holesky.etherscan.io';
    return `${baseUrl}/tx/${deposit.txHash}`;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'detected': return '입금 감지';
      case 'confirming': return '검증중';
      case 'confirmed': return '검증 완료';
      case 'credited': return '반영 완료';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'detected': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'confirming': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'confirmed': return 'text-sky-600 bg-sky-50 border-sky-200';
      case 'credited': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            입금 상세 정보
          </DialogTitle>
          <DialogDescription className="flex items-center space-x-2">
            <span className="font-mono text-xs">
              {deposit.txHash.slice(0, 16)}...{deposit.txHash.slice(-8)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyTxHash}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">개요</TabsTrigger>
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
                  label="회원 유형"
                  value={
                    deposit.user?.memberType === 'individual' ? '개인' :
                    deposit.user?.memberType === 'corporate' ? '기업' : '-'
                  }
                />
                <InfoRow
                  label="회원명"
                  value={deposit.user?.name || deposit.userId || '알 수 없음'}
                />
                <InfoRow
                  label="이메일"
                  value={deposit.user?.email || '-'}
                />
                <InfoRow label="자산" value={deposit.asset} />
                <InfoRow
                  label="수량"
                  value={`${formatCryptoAmount(deposit.amount, deposit.asset)} ${deposit.asset}`}
                />
                <InfoRow
                  label="네트워크"
                  value={deposit.network}
                />
                <InfoRow
                  label="상태"
                  value={
                    <Badge className={`border ${getStatusColor(deposit.status)}`}>
                      {getStatusLabel(deposit.status)}
                    </Badge>
                  }
                />
                <InfoRow
                  label="발신자 검증"
                  value={
                    deposit.senderVerified ? (
                      <span className="text-sky-600 text-sm font-medium">검증됨</span>
                    ) : (
                      <span className="text-yellow-600 text-sm font-medium flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>미검증</span>
                      </span>
                    )
                  }
                />
                <InfoRow
                  label="입금 감지 시간"
                  value={new Date(deposit.detectedAt).toLocaleString('ko-KR')}
                />
                {deposit.confirmedAt && (
                  <InfoRow
                    label="검증 완료 시간"
                    value={new Date(deposit.confirmedAt).toLocaleString('ko-KR')}
                  />
                )}
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
                        {deposit.fromAddress.slice(0, 12)}...
                        {deposit.fromAddress.slice(-10)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyAddress(deposit.fromAddress)}
                        className="h-5 w-5 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                />
                <InfoRow
                  label="수신 주소"
                  value={
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {deposit.toAddress.slice(0, 12)}...
                        {deposit.toAddress.slice(-10)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyAddress(deposit.toAddress)}
                        className="h-5 w-5 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 블록체인 탭 */}
          <TabsContent value="blockchain" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">블록체인 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoRow
                  label="트랜잭션 해시"
                  value={
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs">
                        {deposit.txHash.slice(0, 12)}...{deposit.txHash.slice(-10)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyTxHash}
                        className="h-5 w-5 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <a
                        href={getBlockExplorerUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  }
                />
                <InfoRow
                  label="블록 번호"
                  value={deposit.blockHeight?.toLocaleString()}
                />
                <InfoRow
                  label="컨펌 수"
                  value={
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {deposit.currentConfirmations} / {deposit.requiredConfirmations}
                      </span>
                      {deposit.currentConfirmations >= deposit.requiredConfirmations ? (
                        <CheckCircle className="h-4 w-4 text-sky-500" />
                      ) : (
                        <span className="text-xs text-gray-500">
                          ({Math.round((deposit.currentConfirmations / deposit.requiredConfirmations) * 100)}%)
                        </span>
                      )}
                    </div>
                  }
                />
                <InfoRow
                  label="네트워크"
                  value={deposit.network}
                />
              </CardContent>
            </Card>

            {/* 검증 진행 상황 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">검증 진행 상황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 입금 감지 */}
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-sky-500 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        입금 감지
                      </div>
                      <div className="text-xs text-gray-500">
                        블록체인에서 트랜잭션 발견
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(deposit.detectedAt).toLocaleString('ko-KR')}
                      </div>
                    </div>
                  </div>

                  {/* 블록체인 검증 */}
                  <div className="flex items-start space-x-3">
                    {deposit.status === 'confirming' || deposit.status === 'confirmed' || deposit.status === 'credited' ? (
                      <CheckCircle className="h-5 w-5 text-sky-500 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        블록체인 검증중
                      </div>
                      <div className="text-xs text-gray-500">
                        {deposit.currentConfirmations}/{deposit.requiredConfirmations} 컨펌 진행 중
                      </div>
                    </div>
                  </div>

                  {/* 검증 완료 */}
                  <div className="flex items-start space-x-3">
                    {deposit.status === 'confirmed' || deposit.status === 'credited' ? (
                      <CheckCircle className="h-5 w-5 text-sky-500 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        검증 완료
                      </div>
                      <div className="text-xs text-gray-500">
                        필요 컨펌 수 도달
                      </div>
                      {deposit.confirmedAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(deposit.confirmedAt).toLocaleString('ko-KR')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 잔액 반영 */}
                  <div className="flex items-start space-x-3">
                    {deposit.status === 'credited' ? (
                      <CheckCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        잔액 반영 완료
                      </div>
                      <div className="text-xs text-gray-500">
                        사용자 계정에 입금 완료
                      </div>
                    </div>
                  </div>
                </div>
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