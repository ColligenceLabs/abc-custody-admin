/**
 * IndividualRegistrationForm Component
 * 개인회원 수동 등록 폼
 *
 * 관리자가 오프라인에서 받은 서류를 기반으로 직접 등록
 */

"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManualRegisterIndividualRequest, IdType, AddressProofType } from "@/types/onboardingAml";
import { Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailVerificationInput } from "@/components/ui/EmailVerificationInput";
import { PhoneVerificationInput } from "@/components/ui/PhoneVerificationInput";
import { NationalitySelectField } from "./NationalitySelectField";
import { AddressSearchField } from "./AddressSearchField";
import { InternationalAddressField } from "./InternationalAddressField";
import { UserAddress, AddressKorea, AddressInternational } from "@/types/address";
import { uploadToS3 } from "@/lib/uploadToS3";

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

  // 신규 추가: 국적 및 주소
  const [nationality, setNationality] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [address, setAddress] = useState<UserAddress>(null);

  // 신분증 이미지 파일 업로드 상태
  const [idImageFile, setIdImageFile] = useState<File | null>(null);
  const [idImageUploading, setIdImageUploading] = useState(false);

  // 주소증명 파일 업로드 상태
  const [addressProofFile, setAddressProofFile] = useState<File | null>(null);
  const [addressProofUploading, setAddressProofUploading] = useState(false);

  // 파일 input refs
  const idImageInputRef = useRef<HTMLInputElement>(null);
  const addressProofInputRef = useRef<HTMLInputElement>(null);

  // 신분증 이미지 업로드
  const handleIdImageUpload = async (file: File) => {
    if (!file) return;

    setIdImageUploading(true);
    try {
      const s3Key = await uploadToS3(file, 'kyc-id-image');
      setIdImageFile(file);
      setIdImageUrl(s3Key);
      toast({ description: "신분증 이미지가 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    } finally {
      setIdImageUploading(false);
    }
  };

  // 주소증명 파일 업로드
  const handleAddressProofUpload = async (file: File) => {
    if (!file) return;

    setAddressProofUploading(true);
    try {
      const s3Key = await uploadToS3(file, 'kyc-address-proof');
      setAddressProofFile(file);
      setAddressProofUrl(s3Key);
      toast({ description: "주소증명 이미지가 업로드되었습니다." });
    } catch (error) {
      toast({
        variant: "destructive",
        description: "파일 업로드에 실패했습니다.",
      });
    } finally {
      setAddressProofUploading(false);
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
              <input
                ref={idImageInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleIdImageUpload(file);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => idImageInputRef.current?.click()}
                disabled={idImageUploading}
                className="flex-1"
              >
                {idImageUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    파일 선택
                  </>
                )}
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
              <input
                ref={addressProofInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAddressProofUpload(file);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addressProofInputRef.current?.click()}
                disabled={addressProofUploading}
                className="flex-1"
              >
                {addressProofUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    파일 선택
                  </>
                )}
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
