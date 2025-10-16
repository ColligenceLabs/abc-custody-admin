// ============================================================================
// 출금 AML 상세 검토 모달 컴포넌트
// ============================================================================
// Task 4.2: 출금 AML 검증 시스템
// 용도: AML 검토 상세 정보 및 승인/거부 처리
// ============================================================================

"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
  Clock,
  Info,
  FileText,
} from "lucide-react";
import { WithdrawalAMLCheck, AMLRejectionReason } from "@/types/withdrawal";

// ============================================================================
// Props 인터페이스
// ============================================================================

interface WithdrawalAMLModalProps {
  check: WithdrawalAMLCheck | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (checkId: string, reviewNotes: string) => Promise<void>;
  onReject: (
    checkId: string,
    reason: AMLRejectionReason,
    details: string,
    reviewNotes: string
  ) => Promise<void>;
  onFlag: (checkId: string, reason: string, reviewNotes: string) => Promise<void>;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 금액 포맷팅 (원화)
 */
function formatAmountKRW(amount: string): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(num);
}

/**
 * 리스크 레벨 색상
 */
function getRiskColor(score: number): string {
  if (score >= 80) return "text-red-600 dark:text-red-400";
  if (score >= 60) return "text-orange-600 dark:text-orange-400";
  if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export default function WithdrawalAMLModal({
  check,
  isOpen,
  onClose,
  onApprove,
  onReject,
  onFlag,
}: WithdrawalAMLModalProps) {
  const [activeTab, setActiveTab] = useState("verification");
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState<AMLRejectionReason>("high_risk");
  const [rejectionDetails, setRejectionDetails] = useState("");
  const [flagReason, setFlagReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 체크 데이터 없으면 렌더링 안 함
  if (!check) return null;

  const riskScore = check.checks.riskScore;
  const riskColor = getRiskColor(riskScore);

  // 승인 처리
  const handleApprove = async () => {
    if (!reviewNotes.trim()) {
      alert("검토 노트를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onApprove(check.id, reviewNotes);
      setReviewNotes("");
      onClose();
    } catch (error) {
      alert(`승인 실패: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 거부 처리
  const handleReject = async () => {
    if (!reviewNotes.trim() || !rejectionDetails.trim()) {
      alert("거부 사유 및 검토 노트를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onReject(check.id, rejectionReason, rejectionDetails, reviewNotes);
      setReviewNotes("");
      setRejectionDetails("");
      onClose();
    } catch (error) {
      alert(`거부 실패: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 플래그 처리
  const handleFlag = async () => {
    if (!flagReason.trim() || !reviewNotes.trim()) {
      alert("플래그 사유 및 검토 노트를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onFlag(check.id, flagReason, reviewNotes);
      setReviewNotes("");
      setFlagReason("");
      onClose();
    } catch (error) {
      alert(`플래그 실패: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AML 검토 상세</DialogTitle>
          <DialogDescription>
            {check.memberInfo.companyName} - {check.withdrawal.asset}{" "}
            {check.withdrawal.amount}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verification">검증 결과</TabsTrigger>
            <TabsTrigger value="address">주소 정보</TabsTrigger>
            <TabsTrigger value="review">검토 처리</TabsTrigger>
          </TabsList>

          {/* ========== 검증 결과 탭 ========== */}
          <TabsContent value="verification" className="space-y-4 mt-4">
            {/* 리스크 평가 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">리스크 평가</h3>
              </div>

              {/* 리스크 점수 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    종합 리스크 점수
                  </span>
                  <span className={`text-2xl font-bold ${riskColor}`}>
                    {riskScore} / 100
                  </span>
                </div>
                <Progress value={riskScore} className="h-3" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>낮음</span>
                  <span>중간</span>
                  <span>높음</span>
                  <span>매우 높음</span>
                </div>
              </div>

              {/* 검증 항목 */}
              <div className="grid grid-cols-2 gap-3 pt-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">블랙리스트</span>
                  {check.checks.blacklistCheck.isListed ? (
                    <Badge variant="destructive">감지됨</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      정상
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">제재 목록</span>
                  {check.checks.sanctionsCheck.isListed ? (
                    <Badge variant="destructive">감지됨</Badge>
                  ) : (
                    <Badge variant="outline" className="border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      정상
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">PEP 체크</span>
                  {check.checks.pepCheck?.isPEP ? (
                    <Badge variant="secondary">감지됨</Badge>
                  ) : (
                    <Badge variant="outline">정상</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">부정적 미디어</span>
                  {check.checks.adverseMediaCheck?.hasNegativeNews ? (
                    <Badge variant="secondary">
                      {check.checks.adverseMediaCheck.newsCount}건
                    </Badge>
                  ) : (
                    <Badge variant="outline">정상</Badge>
                  )}
                </div>
              </div>

              {/* 블랙리스트 상세 */}
              {check.checks.blacklistCheck.isListed && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-red-900 dark:text-red-100">
                        블랙리스트 주소 감지
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                        출처: {check.checks.blacklistCheck.source}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        상세: {check.checks.blacklistCheck.details}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 제재 목록 상세 */}
              {check.checks.sanctionsCheck.isListed && (
                <div className="p-3 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm text-red-900 dark:text-red-100">
                        제재 목록 감지
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300 mt-1">
                        제재 유형: {check.checks.sanctionsCheck.sanctionType}
                      </div>
                      <div className="text-xs text-red-700 dark:text-red-300">
                        목록: {check.checks.sanctionsCheck.listName}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 거래 정보 */}
            <div className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-lg">거래 정보</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    회원사
                  </div>
                  <div className="text-sm font-medium">
                    {check.memberInfo.companyName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {check.memberInfo.businessNumber}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    자산 및 금액
                  </div>
                  <div className="text-sm font-medium">
                    {check.withdrawal.asset} {check.withdrawal.amount}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatAmountKRW(check.withdrawal.amountInKRW)}
                  </div>
                </div>

                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-1">
                    수신 주소
                  </div>
                  <code className="text-xs bg-muted px-2 py-1 rounded block break-all">
                    {check.withdrawal.toAddress}
                  </code>
                </div>
              </div>

              {/* 플래그 */}
              <div className="flex flex-wrap gap-2 pt-2">
                {check.flags.isLargeAmount && (
                  <Badge
                    variant="outline"
                    className="border-purple-500 text-purple-700 dark:text-purple-300"
                  >
                    대량 출금 (1억원 이상)
                  </Badge>
                )}
                {check.flags.isNewAddress && (
                  <Badge variant="outline">새로운 주소 (첫 출금)</Badge>
                )}
                {check.flags.unusualPattern && (
                  <Badge
                    variant="outline"
                    className="border-orange-500 text-orange-700 dark:text-orange-300"
                  >
                    비정상 패턴 감지
                  </Badge>
                )}
                {!check.flags.registeredAddressVerified && (
                  <Badge variant="destructive">미등록 주소</Badge>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ========== 주소 정보 탭 ========== */}
          <TabsContent value="address" className="space-y-4 mt-4">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold text-lg">주소 분석</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">주소 타입</span>
                  <Badge>
                    {check.checks.addressType === "personal"
                      ? "개인 지갑"
                      : check.checks.addressType === "vasp"
                      ? "VASP 주소"
                      : check.checks.addressType === "exchange"
                      ? "거래소"
                      : "알 수 없음"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">등록 여부</span>
                  {check.flags.registeredAddressVerified ? (
                    <Badge variant="outline" className="border-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      등록됨
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      미등록
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                  <span className="text-sm">Travel Rule 준수</span>
                  {check.checks.travelRuleCompliant ? (
                    <Badge variant="outline" className="border-green-500">
                      준수
                    </Badge>
                  ) : (
                    <Badge variant="destructive">위반</Badge>
                  )}
                </div>

                {check.flags.isNewAddress && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-yellow-900 dark:text-yellow-100">
                          새로운 주소
                        </div>
                        <div className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          이 주소로의 첫 번째 출금입니다. 추가 검토를
                          권장합니다.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ========== 검토 처리 탭 ========== */}
          <TabsContent value="review" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* 검토 노트 (공통) */}
              <div className="space-y-2">
                <Label>검토 노트 (필수)</Label>
                <Textarea
                  placeholder="AML 검토 내용을 입력하세요..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* 거부 사유 입력 */}
              <div className="space-y-2">
                <Label>거부 사유 (거부 시 필수)</Label>
                <Select
                  value={rejectionReason}
                  onValueChange={(value) =>
                    setRejectionReason(value as AMLRejectionReason)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blacklist">블랙리스트 주소</SelectItem>
                    <SelectItem value="sanctions">제재 목록</SelectItem>
                    <SelectItem value="high_risk">높은 리스크 점수</SelectItem>
                    <SelectItem value="compliance_violation">
                      컴플라이언스 위반
                    </SelectItem>
                    <SelectItem value="manual_decision">
                      수동 검토 결정
                    </SelectItem>
                    <SelectItem value="other">기타</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>거부 상세 설명 (거부 시 필수)</Label>
                <Textarea
                  placeholder="거부 사유를 상세히 입력하세요..."
                  value={rejectionDetails}
                  onChange={(e) => setRejectionDetails(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {/* 플래그 사유 */}
              <div className="space-y-2">
                <Label>플래그 사유 (플래그 시 필수)</Label>
                <Textarea
                  placeholder="추가 검토가 필요한 이유를 입력하세요..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button
            variant="secondary"
            onClick={handleFlag}
            disabled={isSubmitting}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4" />
            플래그
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isSubmitting}
            className="gap-2"
          >
            <XCircle className="h-4 w-4" />
            거부
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            승인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
