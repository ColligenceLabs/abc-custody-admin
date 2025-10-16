/**
 * Individual Application Form Component
 * 개인 회원 신청 폼 (3단계 스텝)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FileUploadField } from './FileUploadField';
import { createIndividualApplication } from '@/data/mockData/onboardingApi';
import { toast } from '@/hooks/use-toast';

interface IndividualFormData {
  // Step 1: 기본 정보
  fullName: string;
  birthDate: string;
  nationality: string;
  idNumberFront: string; // 주민번호 앞 6자리
  idNumberGender: string; // 주민번호 뒷자리 첫 번째 숫자 (성별)

  // Step 2: 연락처 및 주소
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;

  // Step 3: 문서
  personalId: File | null;
  proofOfAddress: File | null;
  incomeProof: File | null;
  selfiePhoto: File | null;
}

interface IndividualApplicationFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function IndividualApplicationForm({ onSubmit, onCancel }: IndividualApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IndividualFormData>({
    // Step 1: 기본 정보 (테스트 데이터)
    fullName: '홍길동',
    birthDate: '1990-01-15',
    nationality: '대한민국',
    idNumberFront: '900115', // 생년월일 6자리
    idNumberGender: '1', // 성별 구분 1자리

    // Step 2: 연락처 및 주소 (테스트 데이터)
    email: 'hong.gildong@email.com',
    phone: '010-1234-5678',
    street: '서울특별시 강남구 테헤란로 123',
    city: '강남구',
    state: '서울특별시',
    postalCode: '06234',

    // Step 3: 문서 (빈 상태)
    personalId: null,
    proofOfAddress: null,
    incomeProof: null,
    selfiePhoto: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof IndividualFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = <K extends keyof IndividualFormData>(
    field: K,
    value: IndividualFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof IndividualFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = '성명을 입력해주세요.';
    }
    if (!formData.birthDate) {
      newErrors.birthDate = '생년월일을 입력해주세요.';
    }
    if (!formData.nationality.trim()) {
      newErrors.nationality = '국적을 선택해주세요.';
    }
    if (!formData.idNumberFront.trim()) {
      newErrors.idNumberFront = '주민등록번호 앞자리를 입력해주세요.';
    } else if (!/^\d{6}$/.test(formData.idNumberFront)) {
      newErrors.idNumberFront = '생년월일 6자리를 입력해주세요. (예: 900115)';
    }
    if (!formData.idNumberGender.trim()) {
      newErrors.idNumberGender = '성별 구분을 선택해주세요.';
    } else if (!/^[1-4]$/.test(formData.idNumberGender)) {
      newErrors.idNumberGender = '1~4 중 하나를 선택해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof IndividualFormData, string>> = {};

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^01[0-9]-\d{4}-\d{4}$/.test(formData.phone)) {
      newErrors.phone = '올바른 형식이 아닙니다. (예: 010-1234-5678)';
    }
    if (!formData.street.trim()) newErrors.street = '도로명 주소를 입력해주세요.';
    if (!formData.city.trim()) newErrors.city = '시/군/구를 입력해주세요.';
    if (!formData.state.trim()) newErrors.state = '시/도를 입력해주세요.';
    if (!formData.postalCode.trim()) newErrors.postalCode = '우편번호를 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof IndividualFormData, string>> = {};

    if (!formData.personalId) newErrors.personalId = '신분증을 업로드해주세요.';
    if (!formData.proofOfAddress) newErrors.proofOfAddress = '주소 증명서를 업로드해주세요.';
    if (!formData.selfiePhoto) newErrors.selfiePhoto = '본인 확인 사진을 업로드해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    }

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createIndividualApplication({
        personalInfo: {
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          nationality: formData.nationality,
          idNumber: `${formData.idNumberFront}-${formData.idNumberGender}******`, // 합법적 형태로 저장
        },
        contact: {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.nationality,
        },
        documents: {
          personalId: { uploaded: !!formData.personalId, verified: false },
          proofOfAddress: { uploaded: !!formData.proofOfAddress, verified: false },
          incomeProof: { uploaded: !!formData.incomeProof, verified: false },
          selfiePhoto: { uploaded: !!formData.selfiePhoto, verified: false },
        },
        status: 'submitted',
        priority: 'medium',
      });

      toast({
        title: '신청 완료',
        description: '개인 회원 온보딩 신청이 생성되었습니다.',
      });

      onSubmit();
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '신청 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Separator />

      {/* Step 1: 기본 정보 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">기본 정보</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                성명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="홍길동"
              />
              {errors.fullName && (
                <p className="text-sm text-red-500">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">
                생년월일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField('birthDate', e.target.value)}
              />
              {errors.birthDate && (
                <p className="text-sm text-red-500">{errors.birthDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationality">
              국적 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.nationality}
              onValueChange={(value) => updateField('nationality', value)}
            >
              <SelectTrigger id="nationality">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="대한민국">대한민국</SelectItem>
                <SelectItem value="미국">미국</SelectItem>
                <SelectItem value="일본">일본</SelectItem>
                <SelectItem value="중국">중국</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
            {errors.nationality && (
              <p className="text-sm text-red-500">{errors.nationality}</p>
            )}
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">주민등록번호</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="idNumberFront">
                  주민번호 앞자리 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="idNumberFront"
                  value={formData.idNumberFront}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    updateField('idNumberFront', value);
                  }}
                  placeholder="900115"
                  maxLength={6}
                />
                {errors.idNumberFront && (
                  <p className="text-sm text-red-500">{errors.idNumberFront}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idNumberGender">
                  주민번호 뒷자리 <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="idNumberGender"
                    value={formData.idNumberGender}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 1);
                      updateField('idNumberGender', value);
                    }}
                    placeholder="1"
                    maxLength={1}
                    className="w-16 text-center"
                  />
                  <span className="text-2xl text-muted-foreground tracking-wider">******</span>
                </div>
                {errors.idNumberGender && (
                  <p className="text-sm text-red-500">{errors.idNumberGender}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 연락처 및 주소 */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">연락처 및 주소</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                전화번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="010-1234-5678"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">주소 정보</h4>

            <div className="space-y-2">
              <Label htmlFor="street">
                도로명 주소 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => updateField('street', e.target.value)}
                placeholder="서울특별시 강남구 테헤란로 123"
              />
              {errors.street && (
                <p className="text-sm text-red-500">{errors.street}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">
                  시/군/구 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="강남구"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">
                  시/도 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => updateField('state', e.target.value)}
                  placeholder="서울특별시"
                />
                {errors.state && (
                  <p className="text-sm text-red-500">{errors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">
                  우편번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => updateField('postalCode', e.target.value)}
                  placeholder="12345"
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-500">{errors.postalCode}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 문서 업로드 */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">문서 업로드</h3>

          <FileUploadField
            label="신분증 (주민등록증/운전면허증/여권)"
            required
            value={formData.personalId}
            onChange={(file) => updateField('personalId', file)}
            error={errors.personalId}
          />

          <FileUploadField
            label="주소 증명서 (공과금 고지서/주민등록등본)"
            required
            value={formData.proofOfAddress}
            onChange={(file) => updateField('proofOfAddress', file)}
            error={errors.proofOfAddress}
          />

          <FileUploadField
            label="소득 증명서 (재직증명서/소득금액증명원)"
            value={formData.incomeProof}
            onChange={(file) => updateField('incomeProof', file)}
          />

          <FileUploadField
            label="본인 확인 사진 (신분증 들고 촬영)"
            required
            value={formData.selfiePhoto}
            onChange={(file) => updateField('selfiePhoto', file)}
            error={errors.selfiePhoto}
          />
        </div>
      )}

      <Separator />

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
        >
          {currentStep === 1 ? (
            '취소'
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              이전
            </>
          )}
        </Button>

        {currentStep < totalSteps ? (
          <Button type="button" onClick={handleNext}>
            다음
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '제출'}
          </Button>
        )}
      </div>
    </div>
  );
}
