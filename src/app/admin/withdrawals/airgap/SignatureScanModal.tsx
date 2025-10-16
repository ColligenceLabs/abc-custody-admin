"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Camera } from "lucide-react";
import { AirGapSigningRequest } from "@/types/vault";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useScanSignature, useAddSignature } from "@/hooks/useAirGap";

interface SignatureScanModalProps {
  request: AirGapSigningRequest;
  onClose: () => void;
  onSuccess?: () => void;
}

interface VerificationResult {
  isValid: boolean;
  signer: {
    id: string;
    name: string;
    publicKey: string;
  };
  signature: string;
  signedAt: string;
  errors?: string[];
}

/**
 * 서명 스캔 모달
 * Air-gap 장치에서 생성된 서명을 QR 코드, 파일, 또는 텍스트로 스캔/업로드
 */
export function SignatureScanModal({
  request,
  onClose,
  onSuccess,
}: SignatureScanModalProps) {
  const { toast } = useToast();
  const [scanMode, setScanMode] = useState<"camera" | "file" | "paste">("camera");
  const [scannedData, setScannedData] = useState<string>("");
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const scanSignatureMutation = useScanSignature();
  const addSignatureMutation = useAddSignature();

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleScan = async (result: string) => {
    if (isScanning) return;
    setIsScanning(true);
    setScannedData(result);

    try {
      const verificationResult = await scanSignatureMutation.mutateAsync({
        requestId: request.id,
        qrData: result,
      });

      setVerification(verificationResult);

      if (verificationResult.isValid) {
        toast({
          title: "서명 검증 성공",
          description: `${verificationResult.signer.name}의 서명이 확인되었습니다.`,
        });
      } else {
        toast({
          title: "서명 검증 실패",
          description: verificationResult.errors?.join(", ") || "유효하지 않은 서명입니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "스캔 실패",
        description: "서명 데이터를 읽을 수 없습니다.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      await handleScan(content);
    };
    reader.readAsText(file);
  };

  const handlePasteData = async () => {
    if (!scannedData.trim()) {
      toast({
        title: "입력 필요",
        description: "서명 데이터를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    await handleScan(scannedData);
  };

  const handleSaveSignature = async () => {
    if (!verification?.isValid) return;

    try {
      await addSignatureMutation.mutateAsync({
        request: {
          requestId: request.id,
          signerId: verification.signer.id,
          signature: verification.signature,
          signedTransaction: {
            id: request.transactions[0].id,
            unsignedTransaction: request.transactions[0],
            signature: verification.signature,
            signedRawTransaction: scannedData,
            signedBy: verification.signer.id,
            signedAt: verification.signedAt,
          },
        },
        adminId: "admin_001", // TODO: 실제 인증 시스템에서 가져오기
        adminName: "관리자", // TODO: 실제 인증 시스템에서 가져오기
      });

      toast({
        title: "서명 저장 완료",
        description: `${verification.signer.name}의 서명이 추가되었습니다.`,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "서명 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const progressPercentage =
    (request.obtainedSignatures / request.requiredSignatures) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">서명된 트랜잭션 스캔</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* 스캔 모드 선택 */}
          <div className="flex gap-2">
            <Button
              variant={scanMode === "camera" ? "default" : "outline"}
              onClick={() => setScanMode("camera")}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              카메라 스캔
            </Button>
            <Button
              variant={scanMode === "file" ? "default" : "outline"}
              onClick={() => setScanMode("file")}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              파일 업로드
            </Button>
            <Button
              variant={scanMode === "paste" ? "default" : "outline"}
              onClick={() => setScanMode("paste")}
              className="flex-1"
            >
              <FileText className="h-4 w-4 mr-2" />
              텍스트 붙여넣기
            </Button>
          </div>

          {/* 스캔 영역 */}
          <div className="border rounded-lg overflow-hidden bg-muted/50">
            {scanMode === "camera" && (
              <div className="aspect-video">
                <Scanner
                  onScan={(result) => {
                    if (result && result[0]?.rawValue) {
                      handleScan(result[0].rawValue);
                    }
                  }}
                  components={{
                    onOff: false,
                    torch: true,
                    zoom: false,
                    finder: true,
                  }}
                />
              </div>
            )}

            {scanMode === "file" && (
              <div className="p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  서명된 트랜잭션 파일을 업로드하세요
                </p>
                <input
                  type="file"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" asChild>
                    <span>파일 선택</span>
                  </Button>
                </label>
              </div>
            )}

            {scanMode === "paste" && (
              <div className="p-4">
                <Textarea
                  placeholder="서명된 트랜잭션 데이터를 붙여넣으세요..."
                  value={scannedData}
                  onChange={(e) => setScannedData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <Button onClick={handlePasteData} className="w-full mt-4">
                  데이터 검증
                </Button>
              </div>
            )}
          </div>

          {/* 검증 결과 */}
          {verification && (
            <div
              className={`rounded-lg border p-4 ${
                verification.isValid
                  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20"
                  : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20"
              }`}
            >
              <div className="flex items-start gap-3">
                {verification.isValid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-2">
                  <p
                    className={`font-semibold ${
                      verification.isValid ? "text-green-900 dark:text-green-500" : "text-red-900 dark:text-red-500"
                    }`}
                  >
                    {verification.isValid ? "서명 검증 성공" : "서명 검증 실패"}
                  </p>
                  {verification.isValid && (
                    <>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">서명자:</span>{" "}
                          <span className="font-medium">{verification.signer.name}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Public Key:</span>{" "}
                          <span className="font-mono text-xs">
                            {verification.signer.publicKey}
                          </span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">서명 시간:</span>{" "}
                          <span>{new Date(verification.signedAt).toLocaleString("ko-KR")}</span>
                        </p>
                      </div>
                    </>
                  )}
                  {!verification.isValid && verification.errors && (
                    <div className="text-sm text-red-800 dark:text-red-500/80">
                      {verification.errors.map((error, i) => (
                        <p key={i}>• {error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 현재 서명 진행률 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">서명 진행률</span>
              <span className="font-semibold">
                {request.obtainedSignatures}/{request.requiredSignatures} (
                {Math.round(progressPercentage)}%)
              </span>
            </div>
            <Progress value={progressPercentage} />

            {/* 서명자 아바타 */}
            <div className="flex items-center gap-2">
              {request.signers.slice(0, request.requiredSignatures).map((signer) => {
                const hasSigned = signer.hasSignedAt !== undefined;
                return (
                  <div key={signer.id} className="flex flex-col items-center gap-1">
                    <Avatar
                      className={`h-10 w-10 ${
                        hasSigned
                          ? "ring-2 ring-green-500"
                          : "ring-2 ring-gray-300 dark:ring-gray-700"
                      }`}
                    >
                      <AvatarFallback
                        className={hasSigned ? "bg-green-100 dark:bg-green-500/20" : ""}
                      >
                        {signer.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">{signer.name}</span>
                    {hasSigned && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              취소
            </Button>
            <Button
              onClick={handleSaveSignature}
              disabled={!verification?.isValid || addSignatureMutation.isPending}
              className="flex-1"
            >
              {addSignatureMutation.isPending ? "저장 중..." : "서명 저장"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
