/**
 * IndividualEDDForm Component
 * 개인회원 EDD (Enhanced Due Diligence) 제출 폼
 *
 * HIGH 리스크 고객에 대한 추가 정보 수집
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IndividualEDDSubmission } from "@/types/onboardingAml";
import { Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IndividualEDDFormProps {
  applicationId: string;
  onSubmit: (data: IndividualEDDSubmission) => Promise<void>;
  onCancel: () => void;
}

export function IndividualEDDForm({ applicationId, onSubmit, onCancel }: IndividualEDDFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // EDD 문서 URL
  const [incomeProofUrl, setIncomeProofUrl] = useState("");
  const [residenceProofUrl, setResidenceProofUrl] = useState("");
  const [fundSourceUrl, setFundSourceUrl] = useState("");
  const [videoInterviewUrl, setVideoInterviewUrl] = useState("");
  const [additionalDocumentUrls, setAdditionalDocumentUrls] = useState<string[]>([]);

  // 파일 업로드 시뮬레이션 (Mock)
  const handleFileUpload = async (fieldName: string): Promise<string> => {
    const timestamp = Date.now();
    return `/uploads/edd/individual/${applicationId}/${fieldName}-${timestamp}.pdf`;
  };

  const handleUpload = async (
    setter: (url: string) => void,
    successMessage: string
  ) => {
    try {
      const url = await handleFileUpload("document");
      setter(url);
      toast({ description: successMessage });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    }
  };

  const handleAddAdditionalDocument = async () => {
    try {
      const url = await handleFileUpload("additional");
      setAdditionalDocumentUrls([...additionalDocumentUrls, url]);
      toast({ description: "추가 서류가 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    }
  };

  const handleRemoveAdditionalDocument = (index: number) => {
    setAdditionalDocumentUrls(additionalDocumentUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최소 1개 이상의 문서 제출 필요
    if (!incomeProofUrl && !residenceProofUrl && !fundSourceUrl && !videoInterviewUrl && additionalDocumentUrls.length === 0) {
      toast({
        variant: "destructive",
        description: "최소 1개 이상의 EDD 문서를 제출해야 합니다.",
      });
      return;
    }

    setLoading(true);

    try {
      const data: IndividualEDDSubmission = {
        applicationId,
        incomeProofUrl: incomeProofUrl || undefined,
        residenceProofUrl: residenceProofUrl || undefined,
        fundSourceUrl: fundSourceUrl || undefined,
        videoInterviewUrl: videoInterviewUrl || undefined,
        additionalDocumentUrls: additionalDocumentUrls.length > 0 ? additionalDocumentUrls : undefined,
        submittedAt: new Date().toISOString(),
      };

      await onSubmit(data);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "EDD 제출에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 안내 메시지 */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-yellow-900">
                HIGH 위험도 고객으로 분류되어 추가 정보가 필요합니다
              </p>
              <p className="text-sm text-yellow-700">
                아래 요청된 서류를 제출해주시면 검토 후 승인 여부를 결정합니다.
                모든 서류를 제출하실 필요는 없으며, 관련 서류만 선택적으로 제출하시면 됩니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 소득 증빙 */}
      <Card>
        <CardHeader>
          <CardTitle>소득 증빙</CardTitle>
          <CardDescription>급여명세서, 사업소득 증빙, 소득금액 증명원 등</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>소득 증빙 서류</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setIncomeProofUrl, "소득 증빙 서류가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {incomeProofUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {incomeProofUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 거주 증빙 */}
      <Card>
        <CardHeader>
          <CardTitle>거주 증빙</CardTitle>
          <CardDescription>등기부등본, 임대차계약서, 전입신고 확인서 등</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>거주 증빙 서류</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setResidenceProofUrl, "거주 증빙 서류가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {residenceProofUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {residenceProofUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 자금 출처 증빙 */}
      <Card>
        <CardHeader>
          <CardTitle>자금 출처 증빙</CardTitle>
          <CardDescription>거래 자금의 출처를 증명하는 서류 (선택)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>자금 출처 서류</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setFundSourceUrl, "자금 출처 서류가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {fundSourceUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {fundSourceUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 화상 인터뷰 */}
      <Card>
        <CardHeader>
          <CardTitle>화상 인터뷰</CardTitle>
          <CardDescription>본인 확인을 위한 화상 인터뷰 영상 (선택)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>인터뷰 영상</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setVideoInterviewUrl, "화상 인터뷰 영상이 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {videoInterviewUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {videoInterviewUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 기타 추가 서류 */}
      <Card>
        <CardHeader>
          <CardTitle>기타 추가 서류</CardTitle>
          <CardDescription>요청된 기타 서류가 있다면 업로드해주세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddAdditionalDocument}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            추가 서류 업로드
          </Button>

          {additionalDocumentUrls.length > 0 && (
            <div className="space-y-2">
              {additionalDocumentUrls.map((url, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {url}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAdditionalDocument(index)}
                  >
                    삭제
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          EDD 제출하기
        </Button>
      </div>
    </form>
  );
}
