'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  RebalancingCalculation,
  RebalancingType,
  RebalancingPriority,
  RebalancingRequest
} from '@/types/vault';
import { Send, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface RebalancingFormProps {
  calculation: RebalancingCalculation | undefined;
  onSubmit: (request: RebalancingRequest) => void;
  isSubmitting: boolean;
}

export function RebalancingFormCard({ calculation, onSubmit, isSubmitting }: RebalancingFormProps) {
  const [reason, setReason] = useState<string>('');
  const [detailNotes, setDetailNotes] = useState<string>('');
  const [priority, setPriority] = useState<RebalancingPriority>(RebalancingPriority.NORMAL);
  const [showConfirm, setShowConfirm] = useState(false);

  const reasons = [
    '정기 리밸런싱',
    '긴급 유동성 확보',
    '보안 강화',
    '유지보수',
    '대량 출금 대응',
    '기타'
  ];

  const handleSubmit = () => {
    if (!calculation || !reason) return;

    const request: RebalancingRequest = {
      type: calculation.direction,
      assets: [
        {
          symbol: 'BTC',
          amount: (parseInt(calculation.requiredTransferAmount) / 80000000).toFixed(8), // Convert KRW to BTC
          fromWallet: calculation.direction === RebalancingType.HOT_TO_COLD ? 'hot' as any : 'cold' as any,
          toWallet: calculation.direction === RebalancingType.HOT_TO_COLD ? 'cold' as any : 'hot' as any,
        }
      ],
      reason,
      priority,
      notes: detailNotes || undefined,
    };

    onSubmit(request);
    setShowConfirm(false);

    // Reset form
    setReason('');
    setDetailNotes('');
    setPriority(RebalancingPriority.NORMAL);
  };

  const isFormValid = reason !== '' && calculation !== undefined;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            리밸런싱 실행
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reason Selection */}
          <div className="space-y-2">
            <Label htmlFor="reason">리밸런싱 사유 *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="사유를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Detail Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">상세 설명</Label>
            <Textarea
              id="notes"
              placeholder="리밸런싱에 대한 상세 설명을 입력하세요 (선택사항)"
              value={detailNotes}
              onChange={(e) => setDetailNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Priority Selection */}
          <div className="space-y-2">
            <Label htmlFor="priority">우선순위</Label>
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as RebalancingPriority)}
            >
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RebalancingPriority.LOW}>낮음</SelectItem>
                <SelectItem value={RebalancingPriority.NORMAL}>일반</SelectItem>
                <SelectItem value={RebalancingPriority.HIGH}>높음</SelectItem>
                <SelectItem value={RebalancingPriority.EMERGENCY}>긴급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Summary */}
          {calculation && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold">요약</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이체 방향</span>
                  <span className="font-medium">
                    {calculation.direction === RebalancingType.HOT_TO_COLD
                      ? 'Hot → Cold'
                      : 'Cold → Hot'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">이체 금액</span>
                  <span className="font-medium">
                    ₩{parseInt(calculation.requiredTransferAmount).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예상 수수료</span>
                  <span className="font-medium">
                    ₩{parseInt(calculation.estimatedFee).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">예상 소요 시간</span>
                  <span className="font-medium">
                    {calculation.direction === RebalancingType.COLD_TO_HOT ? '30분' : '5분'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          {priority === RebalancingPriority.EMERGENCY && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium">긴급 리밸런싱 주의</div>
                <div className="text-xs mt-1">
                  긴급 우선순위는 즉시 처리되며 다른 작업을 중단시킬 수 있습니다.
                  반드시 필요한 경우에만 사용하세요.
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={!isFormValid || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? '처리 중...' : '리밸런싱 요청'}
          </Button>

          {!isFormValid && (
            <p className="text-xs text-muted-foreground text-center">
              * 사유를 선택해주세요
            </p>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리밸런싱 확인</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>다음 내용으로 리밸런싱을 시작하시겠습니까?</p>

              {calculation && (
                <div className="bg-muted rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">이체 방향:</span>
                    <span>
                      {calculation.direction === RebalancingType.HOT_TO_COLD
                        ? 'Hot → Cold'
                        : 'Cold → Hot'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">이체 금액:</span>
                    <span>₩{parseInt(calculation.requiredTransferAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">사유:</span>
                    <span>{reason}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">우선순위:</span>
                    <span>
                      {priority === RebalancingPriority.LOW && '낮음'}
                      {priority === RebalancingPriority.NORMAL && '일반'}
                      {priority === RebalancingPriority.HIGH && '높음'}
                      {priority === RebalancingPriority.EMERGENCY && '긴급'}
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                리밸런싱은 블록체인 트랜잭션을 생성하며 취소할 수 없습니다.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              확인 및 시작
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
