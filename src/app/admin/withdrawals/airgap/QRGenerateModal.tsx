"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Copy, Printer, CheckCircle2 } from "lucide-react";
import { AirGapSigningRequest } from "@/types/vault";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface QRGenerateModalProps {
  request: AirGapSigningRequest;
  onClose: () => void;
}

/**
 * QR 코드 생성 모달
 * Air-gap 장치로 서명 요청 데이터를 전송하기 위한 QR 코드 생성
 */
export function QRGenerateModal({ request, onClose }: QRGenerateModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // QR 코드 데이터 생성
  const qrData = JSON.stringify({
    requestId: request.id,
    type: request.type,
    transactions: request.transactions.map((tx) => ({
      id: tx.id,
      asset: tx.assetSymbol,
      amount: tx.amount,
      from: tx.fromAddress,
      to: tx.toAddress,
      rawTx: tx.rawTransaction,
      fee: tx.estimatedFee,
    })),
    requiredSignatures: request.requiredSignatures,
    expiresAt: request.expiresAt.toISOString(),
  });

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleCopyRawData = async () => {
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      toast({
        title: "복사 완료",
        description: "Raw 데이터가 클립보드에 복사되었습니다.",
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

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.download = `airgap-qr-${request.id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();

      toast({
        title: "다운로드 완료",
        description: "QR 코드 이미지가 다운로드되었습니다.",
      });
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "인쇄 준비",
      description: "인쇄 대화상자가 열렸습니다.",
    });
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

  const typeDisplay = getTypeDisplay();
  const totalAmount = request.transactions.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );
  const expiresIn = Math.floor(
    (request.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Air-gap 서명 요청 QR 코드</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* QR 코드 */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeSVG
              id="qr-code-svg"
              value={qrData}
              size={280}
              level="H"
              includeMargin
            />
          </div>

          {/* 요청 정보 */}
          <div className="space-y-4">
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
                <p className="text-sm text-muted-foreground mb-1">자산/금액</p>
                <p className="font-semibold">
                  {request.transactions[0]?.assetSymbol} {totalAmount.toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">필요 서명</p>
                <p className="font-semibold">
                  {request.requiredSignatures}/{request.signers.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">생성 시간</p>
                <p className="text-sm">
                  {request.createdAt.toLocaleString("ko-KR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">만료</p>
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
          </div>

          {/* 주의사항 */}
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-4">
            <p className="font-semibold text-sm mb-2 text-yellow-900 dark:text-yellow-500">
              ⚠️ 주의사항
            </p>
            <ul className="text-sm space-y-1 text-yellow-800 dark:text-yellow-500/80">
              <li>• Air-gap 장치로 QR 코드를 스캔하세요</li>
              <li>• 네트워크에 연결되지 않은 장치만 사용하세요</li>
              <li>• 서명 후 다시 이 페이지로 돌아와 &quot;서명 스캔&quot; 버튼을 누르세요</li>
              <li>• QR 코드는 {expiresIn}시간 후 만료됩니다</li>
            </ul>
          </div>

          {/* 액션 버튼 */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleDownloadQR} variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              QR 이미지 저장
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              인쇄
            </Button>
            <Button
              onClick={handleCopyRawData}
              variant="outline"
              className="flex-1"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  복사됨
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Raw Data 복사
                </>
              )}
            </Button>
          </div>

          {/* 닫기 버튼 */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>닫기</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
