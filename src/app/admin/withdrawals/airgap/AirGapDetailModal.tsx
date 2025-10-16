"use client";

import { useState, useEffect } from "react";
import { X, Copy, CheckCircle2, Clock, AlertCircle, Bell } from "lucide-react";
import { AirGapSigningRequest } from "@/types/vault";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCancelAirGapRequest } from "@/hooks/useAirGap";

interface AirGapDetailModalProps {
  request: AirGapSigningRequest;
  onClose: () => void;
  onCancel?: () => void;
}

/**
 * Air-gap 서명 요청 상세 정보 모달
 * 3개 탭: 트랜잭션 정보, 서명 현황, 감사 로그
 */
export function AirGapDetailModal({
  request,
  onClose,
  onCancel,
}: AirGapDetailModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const cancelMutation = useCancelAirGapRequest();

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showCancelForm) {
          setShowCancelForm(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, showCancelForm]);

  const handleCopyRawTx = async (rawTx: string) => {
    try {
      await navigator.clipboard.writeText(rawTx);
      setCopied(true);
      toast({
        title: "복사 완료",
        description: "Raw 트랜잭션이 클립보드에 복사되었습니다.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancelRequest = async () => {
    if (!cancelReason.trim()) {
      toast({
        title: "취소 사유 필요",
        description: "취소 사유를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      await cancelMutation.mutateAsync({
        requestId: request.id,
        reason: cancelReason,
        adminId: "admin_001", // TODO: 실제 인증 시스템에서 가져오기
        adminName: "관리자", // TODO: 실제 인증 시스템에서 가져오기
      });

      toast({
        title: "취소 완료",
        description: "서명 요청이 취소되었습니다.",
      });

      onCancel?.();
      onClose();
    } catch (error) {
      toast({
        title: "취소 실패",
        description: "요청 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getTypeDisplay = () => {
    switch (request.type) {
      case "rebalancing":
        return { label: "리밸런싱", color: "bg-blue-500/10 text-blue-500" };
      case "emergency_withdrawal":
        return { label: "긴급 출금", color: "bg-red-500/10 text-red-500" };
      case "maintenance":
        return { label: "유지보수", color: "bg-purple-500/10 text-purple-500" };
      default:
        return { label: request.type, color: "bg-gray-500/10 text-gray-500" };
    }
  };

  const getStatusDisplay = () => {
    switch (request.status) {
      case "pending":
        return { label: "서명 대기", color: "bg-yellow-500/10 text-yellow-500" };
      case "partial":
        return { label: "부분 서명", color: "bg-blue-500/10 text-blue-500" };
      case "completed":
        return { label: "완료", color: "bg-green-500/10 text-green-500" };
      case "expired":
        return { label: "만료", color: "bg-red-500/10 text-red-500" };
      case "cancelled":
        return { label: "취소", color: "bg-gray-500/10 text-gray-500" };
      default:
        return { label: request.status, color: "bg-gray-500/10 text-gray-500" };
    }
  };

  const typeDisplay = getTypeDisplay();
  const statusDisplay = getStatusDisplay();
  const totalAmount = request.transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );
  const totalFee = request.transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.estimatedFee),
    0
  );
  const netAmount = totalAmount - totalFee;
  const expiresIn = Math.floor(
    (request.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  // Mock 감사 로그 데이터
  const auditLogs = [
    {
      timestamp: new Date(request.createdAt.getTime() + 90 * 60 * 1000),
      action: "서명 추가",
      actor: request.signers[0]?.name || "김철수",
      actorId: "admin_003",
      details: `${request.signers[0]?.name || "김철수"}(admin_003)가 서명을 완료했습니다`,
      signature: "0x5678...ef01",
      progress: `2/${request.requiredSignatures}`,
    },
    {
      timestamp: new Date(request.createdAt.getTime() + 65 * 60 * 1000),
      action: "서명 추가",
      actor: request.signers[1]?.name || "이영희",
      actorId: "admin_005",
      details: `${request.signers[1]?.name || "이영희"}(admin_005)가 서명을 완료했습니다`,
      signature: "0x6789...f012",
      progress: `1/${request.requiredSignatures}`,
    },
    {
      timestamp: new Date(request.createdAt.getTime() + 15 * 60 * 1000),
      action: "QR 코드 생성",
      actor: "관리자",
      actorId: "admin_001",
      details: "관리자(admin_001)가 서명 요청 QR 코드를 생성했습니다",
      expiresAt: request.expiresAt.toLocaleString("ko-KR"),
    },
    {
      timestamp: request.createdAt,
      action: "서명 요청 생성",
      actor: "시스템",
      actorId: "system",
      details: `시스템이 ${typeDisplay.label} 요청에 대한 Air-gap 서명을 요청했습니다`,
      requestId: request.rebalancingId || request.id,
      requester: "admin_001 (관리자)",
      reason: request.metadata?.reason || "Hot Wallet 잔액 부족",
    },
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl mb-2">서명 요청 상세 정보</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={typeDisplay.color}>{typeDisplay.label}</Badge>
                <Badge className={statusDisplay.color}>{statusDisplay.label}</Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="transaction" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transaction">트랜잭션 정보</TabsTrigger>
              <TabsTrigger value="signatures">서명 현황</TabsTrigger>
              <TabsTrigger value="audit">감사 로그</TabsTrigger>
            </TabsList>

            {/* 탭 1: 트랜잭션 정보 */}
            <TabsContent value="transaction" className="space-y-6 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">요청 ID</p>
                  <p className="font-mono text-sm">{request.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">유형</p>
                  <Badge className={typeDisplay.color}>{typeDisplay.label}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">생성 시간</p>
                  <p className="text-sm">{request.createdAt.toLocaleString("ko-KR")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">만료 시간</p>
                  <p
                    className={`text-sm font-medium ${
                      expiresIn < 2
                        ? "text-red-500"
                        : expiresIn < 6
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {request.expiresAt.toLocaleString("ko-KR")} ({expiresIn}시간 남음)
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">우선순위</p>
                <Badge
                  className={
                    request.metadata?.priority === "emergency"
                      ? "bg-red-500/10 text-red-500"
                      : "bg-blue-500/10 text-blue-500"
                  }
                >
                  {request.metadata?.priority === "emergency" ? "긴급" : "일반"}
                </Badge>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">트랜잭션 상세</h3>
                {request.transactions.map((tx, index) => (
                  <div key={tx.id} className="space-y-4">
                    {index > 0 && <div className="border-t pt-4" />}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">자산</p>
                        <p className="font-semibold">
                          {tx.assetSymbol} ({tx.assetSymbol === "BTC" ? "Bitcoin" : "Unknown"})
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">금액</p>
                        <p className="font-semibold">
                          {parseFloat(tx.amount).toFixed(8)} {tx.assetSymbol}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">From (Cold Wallet)</p>
                      <p className="font-mono text-sm break-all">{tx.fromAddress}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-1">To (Hot Wallet)</p>
                      <p className="font-mono text-sm break-all">{tx.toAddress}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">수수료</p>
                        <p className="text-sm">
                          {parseFloat(tx.estimatedFee).toFixed(8)} {tx.assetSymbol}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">순 금액</p>
                        <p className="text-sm font-semibold">
                          {(parseFloat(tx.amount) - parseFloat(tx.estimatedFee)).toFixed(8)}{" "}
                          {tx.assetSymbol}
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">
                          Raw Transaction (Unsigned)
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyRawTx(tx.rawTransaction)}
                        >
                          {copied ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                              복사됨
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-2" />
                              복사
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded-md overflow-x-auto">
                        <code className="text-xs font-mono break-all">
                          {tx.rawTransaction}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* 탭 2: 서명 현황 */}
            <TabsContent value="signatures" className="space-y-6 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">
                    {request.requiredSignatures}/{request.signers.length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">필요 서명</p>
                  <p className="text-xs text-muted-foreground">
                    (
                    {Math.round(
                      (request.requiredSignatures / request.signers.length) * 100
                    )}
                    % 정족수)
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-500">
                    {request.obtainedSignatures}/{request.requiredSignatures}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">현재 서명</p>
                  <p className="text-xs text-muted-foreground">
                    (
                    {Math.round(
                      (request.obtainedSignatures / request.requiredSignatures) * 100
                    )}
                    %)
                  </p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">
                    <Badge className={statusDisplay.color}>{statusDisplay.label}</Badge>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">상태</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">서명자 목록</h3>
                <div className="space-y-4">
                  {request.signers.map((signer, index) => {
                    const hasSigned = signer.hasSignedAt !== undefined;
                    const isRequired = index < request.requiredSignatures;
                    return (
                      <div
                        key={signer.id}
                        className={`p-4 rounded-lg border ${
                          hasSigned
                            ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
                            : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar
                            className={`h-12 w-12 ${
                              hasSigned
                                ? "ring-2 ring-green-500"
                                : "ring-2 ring-gray-300 dark:ring-gray-700"
                            }`}
                          >
                            <AvatarFallback
                              className={
                                hasSigned ? "bg-green-100 dark:bg-green-500/20" : ""
                              }
                            >
                              {signer.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold">
                                {signer.name} (Signer {index + 1})
                              </p>
                              {isRequired && (
                                <Badge variant="outline" className="text-xs">
                                  필수
                                </Badge>
                              )}
                              {hasSigned && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              Public Key:{" "}
                              <span className="font-mono text-xs">{signer.publicKey}</span>
                            </p>
                            {hasSigned ? (
                              <>
                                <p className="text-sm">
                                  <span className="text-muted-foreground">서명 시간:</span>{" "}
                                  {signer.hasSignedAt?.toLocaleString("ko-KR")}
                                </p>
                                {signer.signature && (
                                  <p className="text-sm mt-1">
                                    <span className="text-muted-foreground">Signature:</span>{" "}
                                    <span className="font-mono text-xs">
                                      {signer.signature}
                                    </span>
                                  </p>
                                )}
                                <Badge className="mt-2 bg-green-500/10 text-green-500">
                                  검증 완료
                                </Badge>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  서명 시간: -
                                </p>
                                {isRequired && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <p className="text-sm text-muted-foreground">
                                      마지막 알림:{" "}
                                      {new Date(
                                        Date.now() - Math.random() * 3600000
                                      ).toLocaleString("ko-KR")}
                                    </p>
                                    <Button variant="outline" size="sm">
                                      <Bell className="h-3 w-3 mr-1" />
                                      알림 재발송
                                    </Button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* 탭 3: 감사 로그 */}
            <TabsContent value="audit" className="space-y-6 mt-6">
              <h3 className="font-semibold">타임라인</h3>
              <div className="space-y-4">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0
                            ? "bg-blue-500"
                            : "bg-muted-foreground/30"
                        }`}
                      />
                      {index < auditLogs.length - 1 && (
                        <div className="w-0.5 h-full bg-muted-foreground/20 mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {log.timestamp.toLocaleString("ko-KR")}
                        </span>
                      </div>
                      <p className="font-semibold mb-1">{log.action}</p>
                      <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                      {log.signature && (
                        <p className="text-xs font-mono text-muted-foreground">
                          Signature: {log.signature}
                        </p>
                      )}
                      {log.progress && (
                        <p className="text-xs text-muted-foreground">
                          서명 진행률: {log.progress}
                        </p>
                      )}
                      {log.expiresAt && (
                        <p className="text-xs text-muted-foreground">
                          만료 시간: {log.expiresAt}
                        </p>
                      )}
                      {log.requestId && (
                        <p className="text-xs text-muted-foreground">
                          Rebalancing ID: {log.requestId}
                        </p>
                      )}
                      {log.requester && (
                        <p className="text-xs text-muted-foreground">
                          요청자: {log.requester}
                        </p>
                      )}
                      {log.reason && (
                        <p className="text-xs text-muted-foreground">
                          사유: {log.reason}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* 취소 버튼 및 폼 */}
          {request.status === "pending" || request.status === "partial" ? (
            showCancelForm ? (
              <div className="mt-6 pt-6 border-t space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">취소 사유</label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="취소 사유를 입력하세요..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCancelForm(false)}
                    className="flex-1"
                  >
                    취소 안함
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelRequest}
                    disabled={cancelMutation.isPending}
                    className="flex-1"
                  >
                    {cancelMutation.isPending ? "취소 중..." : "요청 취소 확정"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t flex justify-between">
                <Button variant="outline" onClick={onClose}>
                  닫기
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowCancelForm(true)}
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  요청 취소
                </Button>
              </div>
            )
          ) : (
            <div className="mt-6 pt-6 border-t flex justify-end">
              <Button onClick={onClose}>닫기</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
