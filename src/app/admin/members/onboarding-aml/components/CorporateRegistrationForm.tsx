/**
 * CorporateRegistrationForm Component (Phase 6 수정)
 * 법인회원 수동 등록 폼
 *
 * 수정사항: 대표자 KYC 섹션 및 UBO 정보 입력 추가
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualRegisterCorporateRequest, IdType, AddressProofType } from "@/types/onboardingAml";
import { Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailVerificationInput } from "@/components/ui/EmailVerificationInput";
import { NationalitySelectField } from "./NationalitySelectField";
import { AddressSearchField } from "./AddressSearchField";
import { InternationalAddressField } from "./InternationalAddressField";
import { UserAddress, AddressKorea, AddressInternational } from "@/types/address";
import { generateUserId } from "@/utils/idGenerator";

interface CorporateRegistrationFormProps {
  onSubmit: (data: ManualRegisterCorporateRequest) => Promise<void>;
  onCancel: () => void;
}

/**
 * UBO 기본 정보 (CDD 단계)
 * 신분증 정보는 EDD 단계에서 수집
 */
interface UboInfo {
  name: string;
  sharePercentage: number;
  relationship: string;
  // idNumber, idImageUrl 제거 - EDD 단계에서 수집
}

export function CorporateRegistrationForm({ onSubmit, onCancel }: CorporateRegistrationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 법인 정보
  const [companyName, setCompanyName] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [corporateRegistryNumber, setCorporateRegistryNumber] = useState("");

  // 법인 국적 및 주소
  const [corporateNationality, setCorporateNationality] = useState("");
  const [corporateCountryCode, setCorporateCountryCode] = useState("");
  const [corporateAddress, setCorporateAddress] = useState<UserAddress>(null);

  // 법인 서류
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState("");
  const [corporateRegistryUrl, setCorporateRegistryUrl] = useState("");
  const [articlesOfIncorporationUrl, setArticlesOfIncorporationUrl] = useState("");
  const [shareholderListUrl, setShareholderListUrl] = useState("");
  const [representativeIdUrl, setRepresentativeIdUrl] = useState("");
  const [representativeSealCertUrl, setRepresentativeSealCertUrl] = useState("");

  // 대표자 KYC (Phase 6 추가)
  const [repIdType, setRepIdType] = useState<IdType>("RESIDENT_CARD");
  const [repIdNumber, setRepIdNumber] = useState("");
  const [repIdImageUrl, setRepIdImageUrl] = useState("");
  const [repAddressProofType, setRepAddressProofType] = useState<AddressProofType>("UTILITY_BILL");
  const [repAddressProofUrl, setRepAddressProofUrl] = useState("");

  // UBO 정보 (Phase 6 추가, CDD/EDD 분리: 기본 정보만)
  const [uboList, setUboList] = useState<UboInfo[]>([
    { name: "", sharePercentage: 0, relationship: "" }
  ]);

  // 담당자 정보
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactEmailVerified, setContactEmailVerified] = useState(false);
  const [contactPhone, setContactPhone] = useState("");

  // 파일 업로드 시뮬레이션 (Mock)
  const handleFileUpload = async (fieldName: string): Promise<string> => {
    const timestamp = Date.now();
    return `/uploads/corp/${fieldName}-${timestamp}.pdf`;
  };

  const handleUpload = async (setter: (url: string) => void, successMessage: string) => {
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

  // UBO 추가/삭제 (CDD: 기본 정보만)
  const handleAddUbo = () => {
    setUboList([...uboList, { name: "", sharePercentage: 0, relationship: "" }]);
  };

  const handleRemoveUbo = (index: number) => {
    if (uboList.length > 1) {
      setUboList(uboList.filter((_, i) => i !== index));
    }
  };

  const handleUboChange = (index: number, field: keyof UboInfo, value: string | number) => {
    const newList = [...uboList];
    newList[index] = { ...newList[index], [field]: value };
    setUboList(newList);
  };

  // 법인 국적 변경 핸들러
  const handleCorporateNationalityChange = (newNationality: string, newCountryCode: string) => {
    setCorporateNationality(newNationality);
    setCorporateCountryCode(newCountryCode);
    // 국적 변경 시 주소 초기화
    setCorporateAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 최소 필수 항목만 검증 (법인명, 담당자 정보)
    if (!companyName) {
      toast({
        variant: "destructive",
        description: "법인명은 필수 입력 항목입니다.",
      });
      return;
    }

    if (!contactName || !contactEmail || !contactPhone) {
      toast({
        variant: "destructive",
        description: "담당자 정보(이름, 이메일, 전화번호)는 필수 입력 항목입니다.",
      });
      return;
    }

    setLoading(true);

    try {
      // 간소화된 법인 계정 생성 API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/corporate-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          contactName,
          contactEmail,
          contactPhone
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '계정 생성에 실패했습니다.');
      }

      const result = await response.json();

      toast({
        description: `법인 계정이 생성되었습니다. (ID: ${result.data.user.id})`,
      });

      // 성공 시 폼 초기화 또는 모달 닫기
      if (onSubmit) {
        await onSubmit(result.data.user);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error?.message || "등록에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 법인 기본정보 */}
      <Card>
        <CardHeader>
          <CardTitle>법인 기본정보</CardTitle>
          <CardDescription>법인의 기본 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">회사명 *</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="(주)테크이노베이션"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessNumber">사업자번호</Label>
            <Input
              id="businessNumber"
              value={businessNumber}
              onChange={(e) => setBusinessNumber(e.target.value)}
              placeholder="123-45-67890"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="corporateRegistryNumber">법인 등록번호</Label>
            <Input
              id="corporateRegistryNumber"
              value={corporateRegistryNumber}
              onChange={(e) => setCorporateRegistryNumber(e.target.value)}
              placeholder="110111-0000001"
            />
          </div>

          {/* 신규 추가: 법인 국적 선택 (선택) */}
          <NationalitySelectField
            value={corporateNationality}
            countryCode={corporateCountryCode}
            onChange={handleCorporateNationalityChange}
            label="국가"
            required={false}
          />

          {/* 신규 추가: 사업장 소재지 주소 입력 (조건부 렌더링, 선택) */}
          {corporateCountryCode && (
            corporateCountryCode === 'KR' ? (
              <AddressSearchField
                value={corporateAddress as AddressKorea | null}
                onChange={(addr) => setCorporateAddress(addr)}
                label="사업장 소재지 주소"
                required={false}
              />
            ) : (
              <InternationalAddressField
                value={corporateAddress as AddressInternational | null}
                onChange={(addr) => setCorporateAddress(addr)}
                label="사업장 소재지 주소"
                required={false}
              />
            )
          )}
        </CardContent>
      </Card>

      {/* 법인 서류 */}
      <Card>
        <CardHeader>
          <CardTitle>법인 서류</CardTitle>
          <CardDescription>필수 법인 서류를 모두 업로드하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* 사업자등록증 */}
            <div className="space-y-2">
              <Label>사업자등록증</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setBusinessLicenseUrl, "사업자등록증이 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {businessLicenseUrl && (
                  <span className="text-xs text-muted-foreground truncate">{businessLicenseUrl}</span>
                )}
              </div>
            </div>

            {/* 법인등기부등본 */}
            <div className="space-y-2">
              <Label>법인등기부등본</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setCorporateRegistryUrl, "법인등기부등본이 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {corporateRegistryUrl && (
                  <span className="text-xs text-muted-foreground truncate">{corporateRegistryUrl}</span>
                )}
              </div>
            </div>

            {/* 정관 */}
            <div className="space-y-2">
              <Label>정관</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setArticlesOfIncorporationUrl, "정관이 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {articlesOfIncorporationUrl && (
                  <span className="text-xs text-muted-foreground truncate">{articlesOfIncorporationUrl}</span>
                )}
              </div>
            </div>

            {/* 주주명부 */}
            <div className="space-y-2">
              <Label>주주명부</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setShareholderListUrl, "주주명부가 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {shareholderListUrl && (
                  <span className="text-xs text-muted-foreground truncate">{shareholderListUrl}</span>
                )}
              </div>
            </div>

            {/* 대표자 신분증 */}
            <div className="space-y-2">
              <Label>대표자 신분증</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setRepresentativeIdUrl, "대표자 신분증이 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {representativeIdUrl && (
                  <span className="text-xs text-muted-foreground truncate">{representativeIdUrl}</span>
                )}
              </div>
            </div>

            {/* 대표자 인감증명서 */}
            <div className="space-y-2">
              <Label>대표자 인감증명서</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setRepresentativeSealCertUrl, "대표자 인감증명서가 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {representativeSealCertUrl && (
                  <span className="text-xs text-muted-foreground truncate">{representativeSealCertUrl}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 대표자 KYC (Phase 6 추가) */}
      <Card>
        <CardHeader>
          <CardTitle>대표자 KYC 정보</CardTitle>
          <CardDescription>대표자의 신원 확인 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repIdType">신분증 종류</Label>
              <Select value={repIdType} onValueChange={(value) => setRepIdType(value as IdType)}>
                <SelectTrigger id="repIdType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIONAL_ID">주민등록증</SelectItem>
                  <SelectItem value="DRIVER_LICENSE">운전면허증</SelectItem>
                  <SelectItem value="PASSPORT">여권</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="repIdNumber">신분증 번호</Label>
              <Input
                id="repIdNumber"
                value={repIdNumber}
                onChange={(e) => setRepIdNumber(e.target.value)}
                placeholder="123456-1234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>신분증 이미지 (앞뒤면)</Label>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleUpload(setRepIdImageUrl, "신분증 이미지가 업로드되었습니다.")}
                className="w-full"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {repIdImageUrl && (
                <span className="text-xs text-muted-foreground truncate">{repIdImageUrl}</span>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="repAddressProofType">주소증명 종류</Label>
              <Select value={repAddressProofType} onValueChange={(value) => setRepAddressProofType(value as AddressProofType)}>
                <SelectTrigger id="repAddressProofType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTILITY_BILL">공과금 고지서</SelectItem>
                  <SelectItem value="BANK_STATEMENT">은행 명세서</SelectItem>
                  <SelectItem value="RESIDENCE_CERTIFICATE">주민등록등본</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>주소증명 이미지</Label>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleUpload(setRepAddressProofUrl, "주소증명 이미지가 업로드되었습니다.")}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </Button>
                {repAddressProofUrl && (
                  <span className="text-xs text-muted-foreground truncate">{repAddressProofUrl}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* UBO 정보 (Phase 6 추가, CDD/EDD 분리) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>실질적 소유자 (UBO) 기본 정보</CardTitle>
              <CardDescription>25% 이상 지분을 가진 실질적 소유자 정보 (선택). 신분증은 HIGH 리스크인 경우 EDD 단계에서 요청됩니다.</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddUbo}>
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {uboList.map((ubo, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">UBO #{index + 1}</span>
                {uboList.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveUbo(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                )}
              </div>

              {/* CDD: 기본 정보만 수집 (이름, 지분율, 관계) */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>이름</Label>
                  <Input
                    value={ubo.name}
                    onChange={(e) => handleUboChange(index, 'name', e.target.value)}
                    placeholder="홍길동"
                  />
                </div>

                <div className="space-y-2">
                  <Label>지분율 (%)</Label>
                  <Input
                    type="number"
                    value={ubo.sharePercentage}
                    onChange={(e) => handleUboChange(index, 'sharePercentage', parseFloat(e.target.value) || 0)}
                    placeholder="25"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label>관계</Label>
                  <Input
                    value={ubo.relationship}
                    onChange={(e) => handleUboChange(index, 'relationship', e.target.value)}
                    placeholder="대표이사, 주주 등"
                  />
                </div>
              </div>

              {/* 신분증 정보는 EDD 단계에서 수집 (라인 515-546 제거) */}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 담당자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>담당자 정보</CardTitle>
          <CardDescription>법인 담당자 연락처를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactName">담당자명 *</Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>

          <EmailVerificationInput
            email={contactEmail}
            onEmailChange={setContactEmail}
            onVerified={setContactEmailVerified}
            label="담당자 이메일"
            required
          />

          <div className="space-y-2">
            <Label htmlFor="contactPhone">담당자 전화번호 *</Label>
            <Input
              id="contactPhone"
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="010-1234-5678"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* 제출 버튼 */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          취소
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          등록하기
        </Button>
      </div>
    </form>
  );
}
