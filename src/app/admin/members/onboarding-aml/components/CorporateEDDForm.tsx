/**
 * CorporateEDDForm Component
 * 법인회원 EDD (Enhanced Due Diligence) 제출 폼
 *
 * HIGH 리스크 법인에 대한 추가 정보 수집
 * UBO 상세 정보 (신분증 포함) 수집
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CorporateEDDSubmission } from "@/types/onboardingAml";
import { Upload, Loader2, FileText, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CorporateEDDFormProps {
  applicationId: string;
  existingUbos?: { name: string; sharePercentage: number; relationship: string }[];
  onSubmit: (data: CorporateEDDSubmission) => Promise<void>;
  onCancel: () => void;
}

interface UBODetailedInfo {
  uboId: string;
  idNumber: string;
  idImageUrl: string;
  fundSourceUrl?: string;
}

export function CorporateEDDForm({
  applicationId,
  existingUbos = [],
  onSubmit,
  onCancel
}: CorporateEDDFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // EDD 문서 URL
  const [businessPlanUrl, setBusinessPlanUrl] = useState("");
  const [financialStatementsUrl, setFinancialStatementsUrl] = useState("");
  const [clientListUrl, setClientListUrl] = useState("");
  const [backgroundCheckUrl, setBackgroundCheckUrl] = useState("");
  const [onSiteInspectionUrl, setOnSiteInspectionUrl] = useState("");
  const [executiveInterviewUrl, setExecutiveInterviewUrl] = useState("");
  const [additionalDocumentUrls, setAdditionalDocumentUrls] = useState<string[]>([]);

  // UBO 상세 정보 (신분증 포함)
  const [detailedUboInfo, setDetailedUboInfo] = useState<UBODetailedInfo[]>(
    existingUbos.map(ubo => ({
      uboId: ubo.name, // 기존 UBO의 name을 ID로 사용
      idNumber: "",
      idImageUrl: "",
      fundSourceUrl: "",
    }))
  );

  // 파일 업로드 시뮬레이션 (Mock)
  const handleFileUpload = async (fieldName: string): Promise<string> => {
    const timestamp = Date.now();
    return `/uploads/edd/corporate/${applicationId}/${fieldName}-${timestamp}.pdf`;
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

  const handleUboIdImageUpload = async (index: number) => {
    try {
      const url = await handleFileUpload(`ubo-${index}-id`);
      const newList = [...detailedUboInfo];
      newList[index].idImageUrl = url;
      setDetailedUboInfo(newList);
      toast({ description: "UBO 신분증이 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    }
  };

  const handleUboFundSourceUpload = async (index: number) => {
    try {
      const url = await handleFileUpload(`ubo-${index}-fund`);
      const newList = [...detailedUboInfo];
      newList[index].fundSourceUrl = url;
      setDetailedUboInfo(newList);
      toast({ description: "UBO 자금 출처 서류가 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    }
  };

  const handleUboChange = (index: number, field: keyof UBODetailedInfo, value: string) => {
    const newList = [...detailedUboInfo];
    newList[index] = { ...newList[index], [field]: value };
    setDetailedUboInfo(newList);
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

    // UBO 신분증 정보 유효성 검사
    const hasUboInfo = detailedUboInfo.some(ubo => ubo.idNumber && ubo.idImageUrl);

    // 최소 1개 이상의 문서 또는 UBO 정보 제출 필요
    if (!businessPlanUrl &&
        !financialStatementsUrl &&
        !clientListUrl &&
        !backgroundCheckUrl &&
        !onSiteInspectionUrl &&
        !executiveInterviewUrl &&
        !hasUboInfo &&
        additionalDocumentUrls.length === 0) {
      toast({
        variant: "destructive",
        description: "최소 1개 이상의 EDD 문서 또는 UBO 상세 정보를 제출해야 합니다.",
      });
      return;
    }

    setLoading(true);

    try {
      const data: CorporateEDDSubmission = {
        applicationId,
        businessPlanUrl: businessPlanUrl || undefined,
        financialStatementsUrl: financialStatementsUrl || undefined,
        clientListUrl: clientListUrl || undefined,
        detailedUboInfo: detailedUboInfo
          .filter(ubo => ubo.idNumber && ubo.idImageUrl)
          .map(ubo => ({
            uboId: ubo.uboId,
            idNumber: ubo.idNumber,
            idImageUrl: ubo.idImageUrl,
            fundSourceUrl: ubo.fundSourceUrl || undefined,
          })),
        backgroundCheckUrl: backgroundCheckUrl || undefined,
        onSiteInspectionUrl: onSiteInspectionUrl || undefined,
        executiveInterviewUrl: executiveInterviewUrl || undefined,
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
                HIGH 위험도 법인으로 분류되어 추가 정보가 필요합니다
              </p>
              <p className="text-sm text-yellow-700">
                아래 요청된 서류 및 UBO 상세 정보를 제출해주시면 검토 후 승인 여부를 결정합니다.
                특히 실질적 소유자(UBO)의 신분증 정보는 필수로 제출해주셔야 합니다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UBO 상세 정보 (신분증 포함) */}
      {existingUbos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>실질적 소유자 (UBO) 상세 정보</CardTitle>
            <CardDescription>
              CDD 단계에서 등록된 UBO의 신분증 정보를 제출해주세요 (필수)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedUboInfo.map((ubo, index) => {
              const existingUbo = existingUbos[index];
              return (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">UBO: {existingUbo?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        지분율: {existingUbo?.sharePercentage}% | {existingUbo?.relationship}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>신분증 번호 *</Label>
                      <Input
                        value={ubo.idNumber}
                        onChange={(e) => handleUboChange(index, 'idNumber', e.target.value)}
                        placeholder="123456-1234567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>신분증 이미지 *</Label>
                      <div className="flex flex-col gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleUboIdImageUpload(index)}
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          파일 선택
                        </Button>
                        {ubo.idImageUrl && (
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-muted-foreground truncate flex-1">
                              {ubo.idImageUrl}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>자금 출처 증빙 (선택)</Label>
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleUboFundSourceUpload(index)}
                        className="w-full"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        파일 선택
                      </Button>
                      {ubo.fundSourceUrl && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-muted-foreground truncate flex-1">
                            {ubo.fundSourceUrl}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* 사업 계획서 */}
      <Card>
        <CardHeader>
          <CardTitle>사업 계획서</CardTitle>
          <CardDescription>향후 사업 계획 및 전략 문서</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>사업 계획서</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setBusinessPlanUrl, "사업 계획서가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {businessPlanUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {businessPlanUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 재무제표 */}
      <Card>
        <CardHeader>
          <CardTitle>재무제표</CardTitle>
          <CardDescription>최근 2-3년간의 재무제표</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>재무제표</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setFinancialStatementsUrl, "재무제표가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {financialStatementsUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {financialStatementsUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주요 거래처 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>주요 거래처 목록</CardTitle>
          <CardDescription>주요 고객사 및 협력사 정보</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>거래처 목록</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setClientListUrl, "거래처 목록이 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {clientListUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {clientListUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 배경 조사 */}
      <Card>
        <CardHeader>
          <CardTitle>배경 조사 결과</CardTitle>
          <CardDescription>법인 및 경영진 배경 조사 보고서 (선택)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>배경 조사 보고서</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setBackgroundCheckUrl, "배경 조사 보고서가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {backgroundCheckUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {backgroundCheckUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 현장 실사 */}
      <Card>
        <CardHeader>
          <CardTitle>현장 실사 보고서</CardTitle>
          <CardDescription>사업장 현장 실사 결과 (선택)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>현장 실사 보고서</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setOnSiteInspectionUrl, "현장 실사 보고서가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {onSiteInspectionUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {onSiteInspectionUrl}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 경영진 인터뷰 */}
      <Card>
        <CardHeader>
          <CardTitle>경영진 인터뷰</CardTitle>
          <CardDescription>대표이사/주요 임원 인터뷰 영상 (선택)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>인터뷰 영상</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setExecutiveInterviewUrl, "경영진 인터뷰 영상이 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {executiveInterviewUrl && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {executiveInterviewUrl}
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
