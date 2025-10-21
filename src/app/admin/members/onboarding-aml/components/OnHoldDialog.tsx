/**
 * OnHoldDialog Component
 * 보류 다이얼로그
 *
 * 온보딩 신청을 보류하고 추가 서류를 요청할 때 사용하는 다이얼로그
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
import { Input } from "@/components/ui/input";
import { Clock, Loader2, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnHoldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  applicantName: string;
  onConfirm: (reason: string, requiredDocuments: string[]) => Promise<void>;
}

export function OnHoldDialog({
  open,
  onOpenChange,
  applicationId,
  applicantName,
  onConfirm,
}: OnHoldDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([""]);

  const handleAddDocument = () => {
    setRequiredDocuments([...requiredDocuments, ""]);
  };

  const handleRemoveDocument = (index: number) => {
    const newDocs = requiredDocuments.filter((_, i) => i !== index);
    setRequiredDocuments(newDocs.length > 0 ? newDocs : [""]);
  };

  const handleDocumentChange = (index: number, value: string) => {
    const newDocs = [...requiredDocuments];
    newDocs[index] = value;
    setRequiredDocuments(newDocs);
  };

  const handleConfirm = async () => {
    if (!holdReason.trim()) {
      toast({
        variant: "destructive",
        description: "보류 사유를 입력해주세요.",
      });
      return;
    }

    // 빈 항목 제외
    const validDocs = requiredDocuments.filter((doc) => doc.trim() !== "");

    setLoading(true);

    try {
      await onConfirm(holdReason, validDocs);
      toast({
        description: "신청이 보류되었습니다.",
      });
      onOpenChange(false);
      setHoldReason("");
      setRequiredDocuments([""]);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "보류 처리에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setHoldReason("");
    setRequiredDocuments([""]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            온보딩 보류
          </DialogTitle>
          <DialogDescription>
            추가 서류가 필요한 경우 신청을 보류하고 서류를 요청할 수 있습니다.
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

          {/* 보류 사유 입력 */}
          <div className="space-y-2">
            <Label htmlFor="holdReason">보류 사유 *</Label>
            <Textarea
              id="holdReason"
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="보류 사유를 입력하세요. 예: PEP 매칭 의심 건. 동명이인 확인 필요."
              rows={3}
              required
            />
          </div>

          {/* 추가 요청 서류 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>추가 요청 서류 (선택)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDocument}
              >
                <Plus className="h-4 w-4 mr-1" />
                서류 추가
              </Button>
            </div>

            <div className="space-y-2">
              {requiredDocuments.map((doc, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={doc}
                    onChange={(e) => handleDocumentChange(index, e.target.value)}
                    placeholder={`서류 ${index + 1} (예: 소득 증명서, 주소 증명서 재확인)`}
                  />
                  {requiredDocuments.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDocument(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            보류 처리 시 신청자에게 추가 서류 요청 알림이 발송됩니다.
            서류가 제출되면 검토를 재개할 수 있습니다.
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            보류하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
