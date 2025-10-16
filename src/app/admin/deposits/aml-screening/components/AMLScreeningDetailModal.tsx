'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Flag, CheckCircle } from 'lucide-react';
import type { AMLScreeningDetail } from '@/types/deposit';

interface AMLScreeningDetailModalProps {
  item: AMLScreeningDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (item: AMLScreeningDetail) => void;
  onFlag?: (item: AMLScreeningDetail) => void;
}

export function AMLScreeningDetailModal({
  item,
  isOpen,
  onClose,
  onApprove,
  onFlag,
}: AMLScreeningDetailModalProps) {
  if (!item) return null;

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

  const getRiskScoreColor = (score: number) => {
    if (score < 25) return 'text-green-500';
    if (score < 50) return 'text-yellow-500';
    if (score < 75) return 'text-orange-500';
    return 'text-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>AML 검토 상세</span>
            {item.reviewStatus === 'pending' && onApprove && onFlag && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(item)}
                  className="text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  승인
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFlag(item)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Flag className="h-4 w-4 mr-2" />
                  플래그
                </Button>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="aml-checks">AML 체크</TabsTrigger>
            <TabsTrigger value="history">검토 히스토리</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">회원사</label>
                  <p className="font-medium">{item.memberName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">자산</label>
                  <p className="font-medium">
                    {item.amount} {item.asset}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">KRW 환산</label>
                  <p className="font-medium">₩{Number(item.amountKRW).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">시간</label>
                  <p className="font-medium">
                    {new Date(item.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">TxHash</label>
                  <p className="font-mono text-sm break-all">{item.txHash}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">송신 주소</label>
                  <p className="font-mono text-sm break-all">{item.fromAddress}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>리스크 평가</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center">
                  <div className={`text-6xl font-bold ${getRiskScoreColor(item.riskScore)}`}>
                    {item.riskScore}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">리스크 점수 (0-100)</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <label className="text-sm text-gray-500">리스크 레벨</label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          item.riskLevel === 'critical'
                            ? 'destructive'
                            : item.riskLevel === 'high'
                            ? 'default'
                            : item.riskLevel === 'medium'
                            ? 'outline'
                            : 'secondary'
                        }
                      >
                        {item.riskLevel === 'critical' ? '심각' : item.riskLevel === 'high' ? '높음' : item.riskLevel === 'medium' ? '보통' : '낮음'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">종합 상태</label>
                    <div className="mt-1">
                      {item.isClean ? (
                        <Badge variant="secondary">정상</Badge>
                      ) : (
                        <Badge variant="destructive">위험</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>관련 정보</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">이전 입금</label>
                  <p className="font-medium">{item.relatedInfo.previousDepositsFromAddress}건</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">총 입금액</label>
                  <p className="font-medium">
                    ₩{Number(item.relatedInfo.totalVolumeFromAddress).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">평균 리스크 점수</label>
                  <p className="font-medium">{item.relatedInfo.averageRiskScore.toFixed(1)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-500">플래그 건수</label>
                  <p className="font-medium text-red-600">{item.relatedInfo.flaggedCount}건</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AML 체크 탭 */}
          <TabsContent value="aml-checks" className="space-y-4">
            {Object.entries(item.amlCheckDetails).map(([key, check]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {check.matched ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                    <span>
                      {key === 'blacklistCheck' && '블랙리스트 체크'}
                      {key === 'sanctionsListCheck' && '제재 목록 체크'}
                      {key === 'pepCheck' && 'PEP 체크'}
                      {key === 'adverseMediaCheck' && '부정적 미디어 체크'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">결과</label>
                    <p
                      className={`font-medium ${
                        check.matched ? 'text-red-500' : 'text-green-500'
                      }`}
                    >
                      {'matchDetails' in check ? check.matchDetails : 'summary' in check ? check.summary : '정보 없음'}
                    </p>
                  </div>
                  {'lists' in check && check.lists && check.lists.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-500">일치 목록</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {check.lists.map((list) => (
                          <Badge key={list} variant="outline">
                            {list}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {'sources' in check && check.sources && check.sources.length > 0 && (
                    <div>
                      <label className="text-sm text-gray-500">출처</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {check.sources.map((source) => (
                          <Badge key={source} variant="outline">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* 검토 히스토리 탭 */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>검토 히스토리</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {item.reviewHistory.map((history, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="mt-1">{getStatusIcon(history.status)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{history.action}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(history.timestamp).toLocaleString('ko-KR')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{history.description}</p>
                        {history.performedBy && (
                          <p className="text-xs text-gray-500 mt-1">
                            처리자: {history.performedBy}
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
