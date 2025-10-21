/**
 * RejectionDialog Component
 * 거부 다이얼로그
 *
 * 온보딩 신청을 거부할 때 사용하는 다이얼로그
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AMLScreening } from "@/types/onboardingAml";
import { XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicantName: string;
  amlIssues?: string[]; // AML 이슈 목록
  onConfirm: (reason: string) => Promise<void>;
}

export function RejectionDialog({
  open,
  onOpenChange,
  applicationId,
  applicantName,
  amlIssues = [],
  onConfirm,
}: RejectionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");

  const handleConfirm = async () => {
    if (!decisionReason.trim()) {
      toast({
        variant: "destructive",
        description: "거부 사유를 입력해주세요.",
      });
      return;
    }

    setLoading(true);

    try {
      await onConfirm(decisionReason);
      toast({
        description: "신청이 거부되었습니다.",
      });
      onOpenChange(false);
      setDecisionReason("");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "거부 처리에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDecisionReason("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            온보딩 거부
          </DialogTitle>
          <DialogDescription>
            다음 신청을 거부하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 신청자 정보 */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">신청자</span>
              <span className="font-semibold">{applicantName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">신청 ID</span>
              <span className="text-sm text-muted-foreground">{applicationId}</span>
            </div>
          </div>

          {/* AML 이슈 목록 */}
          {amlIssues.length > 0 && (
            <div className="p-4 border border-red-200 bg-red-50 rounded-lg space-y-3">
              <h4 className="font-medium text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                발견된 문제점
              </h4>
              <ul className="space-y-2">
                {amlIssues.map((issue, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 거부 사유 입력 */}
          <div className="space-y-2">
            <Label htmlFor="decisionReason">거부 사유 *</Label>
            <Textarea
              id="decisionReason"
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="거부 사유를 상세히 입력하세요. 예: PEP 매칭 및 블랙리스트 등록. 서비스 제공 불가."
              rows={4}
              required
            />
          </div>

          {/* 경고 메시지 */}
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">주의</p>
                <p className="mt-1">
                  거부 처리된 신청자는 서비스를 이용할 수 없으며,
                  신청자에게 거부 사유가 통지됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            거부하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
