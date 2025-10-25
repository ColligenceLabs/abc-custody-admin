'use client';

/**
 * 환불 처리 요청 생성 모달
 *
 * 미검증 입금에 대한 환불 요청을 생성합니다.
 */

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DepositTransaction, ReturnType } from '@/types/deposit';
import { createReturn } from '@/services/depositReturnApiService';
import { formatCryptoAmount } from '@/lib/format';

interface CreateReturnModalProps {
  deposit: DepositTransaction;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const RETURN_TYPE_OPTIONS: { value: ReturnType; label: string; description: string }[] = [
  {
    value: 'refund',
    label: '환불',
    description: '원 발신자에게 반환',
  },
  {
    value: 'seizure',
    label: '압류',
    description: '법적 압류 처리',
  },
  {
    value: 'transfer',
    label: '이전',
    description: '다른 주소로 이전',
  },
];

const REASON_OPTIONS = [
  '미검증 발신자 주소',
  'AML 검토 실패',
  'Travel Rule 위반',
  '중복 거래',
  '컴플라이언스 검토 필요',
  '기타',
];

export function CreateReturnModal({
  deposit,
  isOpen,
  onClose,
  onSuccess,
}: CreateReturnModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    returnType: 'refund' as ReturnType,
    returnAddress: deposit.fromAddress,
    reason: '',
    customReason: '',
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createReturn(deposit.id, {
        returnType: formData.returnType,
        returnAddress: formData.returnAddress,
        reason: formData.reason === '기타' ? formData.customReason : formData.reason,
        requestedBy: 'admin_1', // TODO: 실제 관리자 ID로 교체
      }),
    onSuccess: () => {
      toast({
        description: '환불 처리 요청이 생성되었습니다.',
      });
      queryClient.invalidateQueries({ queryKey: ['deposits'] });
      queryClient.invalidateQueries({ queryKey: ['depositReturns'] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '오류 발생',
        description: error.message || '환불 처리 요청 생성에 실패했습니다.',
      });
    },
  });

  const handleClose = () => {
    setFormData({
      returnType: 'refund',
      returnAddress: deposit.fromAddress,
      reason: '',
      customReason: '',
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.reason) {
      toast({
        variant: 'destructive',
        description: '환불 사유를 선택해주세요.',
      });
      return;
    }

    if (formData.reason === '기타' && !formData.customReason.trim()) {
      toast({
        variant: 'destructive',
        description: '기타 사유를 입력해주세요.',
      });
      return;
    }

    if (!formData.returnAddress.trim()) {
      toast({
        variant: 'destructive',
        description: '반환 주소를 입력해주세요.',
      });
      return;
    }

    createMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">환불 처리 요청</DialogTitle>
          <DialogDescription>
            미검증 입금에 대한 환불 요청을 생성합니다
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 입금 정보 요약 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-400">
                  미검증 입금
                </p>
                <div className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">거래 해시:</span>
                    <span className="font-mono">
                      {deposit.txHash.slice(0, 10)}...{deposit.txHash.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">금액:</span>
                    <span className="font-semibold">
                      {formatCryptoAmount(deposit.amount)} {deposit.asset}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">발신자:</span>
                    <span className="font-mono text-xs">
                      {deposit.fromAddress.slice(0, 10)}...{deposit.fromAddress.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 환불 유형 */}
          <div className="space-y-2">
            <Label htmlFor="returnType">환불 유형</Label>
            <Select
              value={formData.returnType}
              onValueChange={(value: ReturnType) =>
                setFormData({ ...formData, returnType: value })
              }
            >
              <SelectTrigger id="returnType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RETURN_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 반환 주소 */}
          <div className="space-y-2">
            <Label htmlFor="returnAddress">반환 주소</Label>
            <Input
              id="returnAddress"
              value={formData.returnAddress}
              onChange={(e) =>
                setFormData({ ...formData, returnAddress: e.target.value })
              }
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              기본값: 원 발신자 주소 ({deposit.fromAddress.slice(0, 10)}...
              {deposit.fromAddress.slice(-8)})
            </p>
          </div>

          {/* 환불 사유 */}
          <div className="space-y-2">
            <Label htmlFor="reason">환불 사유</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) => setFormData({ ...formData, reason: value })}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="사유를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {REASON_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 기타 사유 입력 */}
          {formData.reason === '기타' && (
            <div className="space-y-2">
              <Label htmlFor="customReason">기타 사유 상세</Label>
              <Textarea
                id="customReason"
                value={formData.customReason}
                onChange={(e) =>
                  setFormData({ ...formData, customReason: e.target.value })
                }
                placeholder="환불 사유를 상세히 입력해주세요"
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createMutation.isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              환불 처리 요청
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
