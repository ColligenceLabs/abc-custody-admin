/**
 * ApprovalDialog Component
 * 승인 다이얼로그
 *
 * 온보딩 신청을 승인할 때 사용하는 다이얼로그
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
import { AMLScreening, RiskAssessment, RiskLevel } from "@/types/onboardingAml";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicantName: string;
  amlSummary?: AMLScreening | null;
  riskLevel?: RiskLevel;
  onConfirm: (reason: string) => Promise<void>;
}

export function ApprovalDialog({
  open,
  onOpenChange,
  applicationId,
  applicantName,
  amlSummary,
  riskLevel,
  onConfirm,
}: ApprovalDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [decisionReason, setDecisionReason] = useState("");

  const handleConfirm = async () => {
    if (!decisionReason.trim()) {
      toast({
        variant: "destructive",
        description: "승인 사유를 입력해주세요.",
      });
      return;
    }

    setLoading(true);

    try {
      await onConfirm(decisionReason);
      toast({
        description: "신청이 승인되었습니다.",
      });
      onOpenChange(false);
      setDecisionReason("");
    } catch (error) {
      toast({
        variant: "destructive",
        description: "승인 처리에 실패했습니다.",
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
            <CheckCircle className="h-5 w-5 text-sky-600" />
            온보딩 승인
          </DialogTitle>
          <DialogDescription>
            다음 신청을 승인하시겠습니까?
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

          {/* AML 결과 요약 */}
          {amlSummary && (
            <div className="p-4 border rounded-lg space-y-3">
              <h4 className="font-medium text-sm">외부 AML 검증 결과</h4>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">PEP</span>
                  <Badge
                    variant="outline"
                    className={
                      amlSummary.pepStatus === "CLEAR"
                        ? "text-sky-600 bg-sky-50 border-sky-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }
                  >
                    {amlSummary.pepStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">제재리스트</span>
                  <Badge
                    variant="outline"
                    className={
                      amlSummary.sanctionListStatus === "CLEAR"
                        ? "text-sky-600 bg-sky-50 border-sky-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }
                  >
                    {amlSummary.sanctionListStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">블랙리스트</span>
                  <Badge
                    variant="outline"
                    className={
                      amlSummary.blacklistStatus === "CLEAR"
                        ? "text-sky-600 bg-sky-50 border-sky-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }
                  >
                    {amlSummary.blacklistStatus}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">국가 위험도</span>
                  <Badge
                    variant="outline"
                    className={
                      amlSummary.countryRiskLevel === "LOW"
                        ? "text-sky-600 bg-sky-50 border-sky-200"
                        : amlSummary.countryRiskLevel === "MEDIUM"
                        ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                        : "text-red-600 bg-red-50 border-red-200"
                    }
                  >
                    {amlSummary.countryRiskLevel}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* 위험도 레벨 */}
          {riskLevel && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">종합 위험도</span>
                <Badge
                  variant="outline"
                  className={
                    riskLevel === "LOW"
                      ? "text-sky-600 bg-sky-50 border-sky-200"
                      : riskLevel === "MEDIUM"
                      ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                      : "text-red-600 bg-red-50 border-red-200"
                  }
                >
                  {riskLevel}
                </Badge>
              </div>
            </div>
          )}

          {/* 승인 사유 입력 */}
          <div className="space-y-2">
            <Label htmlFor="decisionReason">승인 사유 *</Label>
            <Textarea
              id="decisionReason"
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="승인 사유를 입력하세요. 예: 모든 검증 통과, 위험도 낮음"
              rows={4}
              required
            />
          </div>

          {/* 안내 메시지 */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded text-sm text-sky-700">
            승인 처리 시 신청자는 즉시 서비스를 이용할 수 있습니다.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            승인하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
