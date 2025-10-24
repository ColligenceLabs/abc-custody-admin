/**
 * IndividualRegistrationForm Component
 * 개인회원 수동 등록 폼
 *
 * 관리자가 오프라인에서 받은 서류를 기반으로 직접 등록
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualRegisterIndividualRequest, IdType, AddressProofType, RegistrationSource } from "@/types/onboardingAml";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailVerificationInput } from "@/components/ui/EmailVerificationInput";
import { PhoneVerificationInput } from "@/components/ui/PhoneVerificationInput";
import { NationalitySelectField } from "./NationalitySelectField";
import { AddressSearchField } from "./AddressSearchField";
import { InternationalAddressField } from "./InternationalAddressField";
import { UserAddress, AddressKorea, AddressInternational } from "@/types/address";

interface IndividualRegistrationFormProps {
  onSubmit: (data: ManualRegisterIndividualRequest) => Promise<void>;
  onCancel: () => void;
}

export function IndividualRegistrationForm({ onSubmit, onCancel }: IndividualRegistrationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // 폼 상태
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [idType, setIdType] = useState<IdType>("RESIDENT_CARD");
  const [idNumber, setIdNumber] = useState("");
  const [idImageUrl, setIdImageUrl] = useState("");
  const [addressProofType, setAddressProofType] = useState<AddressProofType>("UTILITY_BILL");
  const [addressProofUrl, setAddressProofUrl] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [registrationSource, setRegistrationSource] = useState<Exclude<RegistrationSource, 'ONLINE'>>("OFFLINE_BRANCH");
  const [registrationNote, setRegistrationNote] = useState("");

  // 신규 추가: 국적 및 주소
  const [nationality, setNationality] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [address, setAddress] = useState<UserAddress>(null);

  // 파일 업로드 시뮬레이션 (Mock)
  const handleFileUpload = async (fieldName: string): Promise<string> => {
    // 실제 환경에서는 서버로 파일 업로드
    // Mock 환경에서는 가상 URL 생성
    const timestamp = Date.now();
    return `/uploads/kyc/${fieldName}-${timestamp}.jpg`;
  };

  const handleIdImageUpload = async () => {
    try {
      const url = await handleFileUpload("id-image");
      setIdImageUrl(url);
      toast({ description: "신분증 이미지가 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    }
  };

  const handleAddressProofUpload = async () => {
    try {
      const url = await handleFileUpload("address-proof");
      setAddressProofUrl(url);
      toast({ description: "주소증명 이미지가 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    }
  };

  // 국적 변경 핸들러
  const handleNationalityChange = (newNationality: string, newCountryCode: string) => {
    setNationality(newNationality);
    setCountryCode(newCountryCode);
    // 국적 변경 시 주소 초기화
    setAddress(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!userName || !userEmail) {
      toast({
        variant: "destructive",
        description: "이름과 이메일은 필수 입력 항목입니다.",
      });
      return;
    }

    if (!emailVerified) {
      toast({
        variant: "destructive",
        description: "이메일 인증을 완료해주세요.",
      });
      return;
    }

    if (!phoneVerified) {
      toast({
        variant: "destructive",
        description: "전화번호 인증을 완료해주세요.",
      });
      return;
    }

    if (!idNumber || !idImageUrl) {
      toast({
        variant: "destructive",
        description: "신분증 정보와 이미지는 필수 입력 항목입니다.",
      });
      return;
    }

    if (!addressProofUrl) {
      toast({
        variant: "destructive",
        description: "주소증명 이미지는 필수 입력 항목입니다.",
      });
      return;
    }

    // 국적 및 주소 유효성 검사 (필수)
    if (!nationality || !countryCode) {
      toast({
        variant: "destructive",
        description: "국적은 필수 입력 항목입니다.",
      });
      return;
    }

    if (!address) {
      toast({
        variant: "destructive",
        description: "주소는 필수 입력 항목입니다.",
      });
      return;
    }

    // 주소 형식 검증
    if (address.type === 'korea') {
      if (!address.postalCode || !address.address) {
        toast({
          variant: "destructive",
          description: "주소를 완전히 입력해주세요.",
        });
        return;
      }
    } else if (address.type === 'international') {
      if (!address.fullAddress) {
        toast({
          variant: "destructive",
          description: "주소를 입력해주세요.",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const data: ManualRegisterIndividualRequest = {
        userName,
        userEmail,
        kyc: {
          idType,
          idNumber,
          idImageUrl,
          addressProofType,
          addressProofUrl,
          phoneVerified,
          emailVerified,
        },
        registrationSource,
        registrationNote: registrationNote || undefined,

        // 신규 필드 추가 (필수)
        nationality,
        countryCode,
        address,
      };

      await onSubmit(data);
    } catch (error) {
      toast({
        variant: "destructive",
        description: "등록에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 개인 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>개인 정보</CardTitle>
          <CardDescription>신청자의 기본 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userName">이름 *</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="홍길동"
              required
            />
          </div>

          <EmailVerificationInput
            email={userEmail}
            onEmailChange={setUserEmail}
            onVerified={setEmailVerified}
            label="이메일"
            required
          />

          <PhoneVerificationInput
            phone={userPhone}
            onPhoneChange={setUserPhone}
            onVerified={setPhoneVerified}
            label="전화번호"
            required
            method="SMS"
          />

          {/* 신규 추가: 국적 선택 (필수) */}
          <NationalitySelectField
            value={nationality}
            countryCode={countryCode}
            onChange={handleNationalityChange}
            label="국적"
            required={true}
          />

          {/* 신규 추가: 주소 입력 (조건부 렌더링, 필수) */}
          {countryCode && (
            countryCode === 'KR' ? (
              <AddressSearchField
                value={address as AddressKorea | null}
                onChange={(addr) => setAddress(addr)}
                label="주소"
                required={true}
              />
            ) : (
              <InternationalAddressField
                value={address as AddressInternational | null}
                onChange={(addr) => setAddress(addr)}
                label="주소"
                required={true}
              />
            )
          )}
        </CardContent>
      </Card>

      {/* KYC 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>KYC 신원확인</CardTitle>
          <CardDescription>신분증 및 주소증명 정보를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 신분증 타입 */}
          <div className="space-y-2">
            <Label htmlFor="idType">신분증 타입 *</Label>
            <Select value={idType} onValueChange={(value) => setIdType(value as IdType)}>
              <SelectTrigger id="idType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RESIDENT_CARD">주민등록증</SelectItem>
                <SelectItem value="DRIVER_LICENSE">운전면허증</SelectItem>
                <SelectItem value="PASSPORT">여권</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 신분증 번호 */}
          <div className="space-y-2">
            <Label htmlFor="idNumber">신분증 번호 *</Label>
            <Input
              id="idNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder="******-*******"
              required
            />
          </div>

          {/* 신분증 이미지 업로드 */}
          <div className="space-y-2">
            <Label>신분증 이미지 *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleIdImageUpload}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {idImageUrl && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {idImageUrl}
                </span>
              )}
            </div>
          </div>

          {/* 주소증명 타입 */}
          <div className="space-y-2">
            <Label htmlFor="addressProofType">주소증명 타입 *</Label>
            <Select value={addressProofType} onValueChange={(value) => setAddressProofType(value as AddressProofType)}>
              <SelectTrigger id="addressProofType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="REGISTRY">주민등록등본</SelectItem>
                <SelectItem value="UTILITY_BILL">공과금 고지서</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 주소증명 이미지 업로드 */}
          <div className="space-y-2">
            <Label>주소증명 이미지 *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddressProofUpload}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                파일 선택
              </Button>
              {addressProofUrl && (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {addressProofUrl}
                </span>
              )}
            </div>
          </div>

        </CardContent>
      </Card>

      {/* 등록 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>등록 경로</CardTitle>
          <CardDescription>오프라인 등록 사유를 입력하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="registrationSource">등록 경로 *</Label>
            <Select value={registrationSource} onValueChange={(value) => setRegistrationSource(value as Exclude<RegistrationSource, 'ONLINE'>)}>
              <SelectTrigger id="registrationSource">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OFFLINE_BRANCH">지점 방문</SelectItem>
                <SelectItem value="PHONE_INQUIRY">전화 문의</SelectItem>
                <SelectItem value="EMAIL_REQUEST">이메일 요청</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNote">등록 사유 (선택)</Label>
            <Textarea
              id="registrationNote"
              value={registrationNote}
              onChange={(e) => setRegistrationNote(e.target.value)}
              placeholder="예: 강남 지점 방문 신청. 김지점장 접수."
              rows={3}
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
