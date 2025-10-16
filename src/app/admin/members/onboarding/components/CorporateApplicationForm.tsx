/**
 * Corporate Application Form Component
 * 기업 회원 신청 폼 (3단계 스텝)
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
import { createCorporateApplication } from '@/data/mockData/onboardingApi';
import { toast } from '@/hooks/use-toast';

interface CorporateFormData {
  // Step 1: 기업 정보
  companyName: string;
  businessNumber: string;
  corporateNumber: string;
  industry: string;
  establishedDate: string;

  // Step 2: 대표자 및 담당자 정보
  representativeName: string;
  representativePosition: string;
  representativeEmail: string;
  representativePhone: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  companyStreet: string;
  companyCity: string;
  companyState: string;
  companyPostalCode: string;
  companyCountry: string;

  // Step 3: 문서
  businessRegistration: File | null;
  corporateRegistry: File | null;
  representativeId: File | null;
  amlDocuments: File | null;
}

interface CorporateApplicationFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

export function CorporateApplicationForm({ onSubmit, onCancel }: CorporateApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CorporateFormData>({
    // Step 1: 기업 정보 (테스트 데이터)
    companyName: '(주)테스트컴퍼니',
    businessNumber: '123-45-67890',
    corporateNumber: '123456-1234567',
    industry: 'IT/소프트웨어',
    establishedDate: '2020-03-15',

    // Step 2: 대표자 및 담당자 정보 (테스트 데이터)
    representativeName: '김대표',
    representativePosition: '대표이사',
    representativeEmail: 'ceo@testcompany.com',
    representativePhone: '010-1111-2222',
    contactName: '이담당',
    contactEmail: 'contact@testcompany.com',
    contactPhone: '010-3333-4444',
    companyStreet: '서울특별시 강남구 테헤란로 456',
    companyCity: '강남구',
    companyState: '서울특별시',
    companyPostalCode: '06789',
    companyCountry: '대한민국',

    // Step 3: 문서 (빈 상태)
    businessRegistration: null,
    corporateRegistry: null,
    representativeId: null,
    amlDocuments: null,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CorporateFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = <K extends keyof CorporateFormData>(
    field: K,
    value: CorporateFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validation functions
  const validateStep1 = (): boolean => {
    const newErrors: Partial<Record<keyof CorporateFormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = '회사명을 입력해주세요.';
    }
    if (!formData.businessNumber.trim()) {
      newErrors.businessNumber = '사업자등록번호를 입력해주세요.';
    } else if (!/^\d{3}-\d{2}-\d{5}$/.test(formData.businessNumber)) {
      newErrors.businessNumber = '올바른 형식이 아닙니다. (예: 123-45-67890)';
    }
    if (!formData.corporateNumber.trim()) {
      newErrors.corporateNumber = '법인등록번호를 입력해주세요.';
    } else if (!/^\d{6}-\d{7}$/.test(formData.corporateNumber)) {
      newErrors.corporateNumber = '올바른 형식이 아닙니다. (예: 123456-1234567)';
    }
    if (!formData.industry.trim()) {
      newErrors.industry = '업종을 선택해주세요.';
    }
    if (!formData.establishedDate) {
      newErrors.establishedDate = '설립일을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Partial<Record<keyof CorporateFormData, string>> = {};

    // 대표자 정보
    if (!formData.representativeName.trim()) {
      newErrors.representativeName = '대표자명을 입력해주세요.';
    }
    if (!formData.representativePosition.trim()) {
      newErrors.representativePosition = '직책을 입력해주세요.';
    }
    if (!formData.representativeEmail.trim()) {
      newErrors.representativeEmail = '대표자 이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.representativeEmail)) {
      newErrors.representativeEmail = '올바른 이메일 형식이 아닙니다.';
    }
    if (!formData.representativePhone.trim()) {
      newErrors.representativePhone = '대표자 전화번호를 입력해주세요.';
    } else if (!/^01[0-9]-\d{4}-\d{4}$/.test(formData.representativePhone)) {
      newErrors.representativePhone = '올바른 형식이 아닙니다. (예: 010-1234-5678)';
    }

    // 담당자 정보
    if (!formData.contactName.trim()) {
      newErrors.contactName = '담당자명을 입력해주세요.';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = '담당자 이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = '올바른 이메일 형식이 아닙니다.';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = '담당자 전화번호를 입력해주세요.';
    } else if (!/^01[0-9]-\d{4}-\d{4}$/.test(formData.contactPhone)) {
      newErrors.contactPhone = '올바른 형식이 아닙니다. (예: 010-1234-5678)';
    }

    // 회사 주소
    if (!formData.companyStreet.trim()) newErrors.companyStreet = '도로명 주소를 입력해주세요.';
    if (!formData.companyCity.trim()) newErrors.companyCity = '시/군/구를 입력해주세요.';
    if (!formData.companyState.trim()) newErrors.companyState = '시/도를 입력해주세요.';
    if (!formData.companyPostalCode.trim()) newErrors.companyPostalCode = '우편번호를 입력해주세요.';
    if (!formData.companyCountry.trim()) newErrors.companyCountry = '국가를 입력해주세요.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Partial<Record<keyof CorporateFormData, string>> = {};

    if (!formData.businessRegistration) {
      newErrors.businessRegistration = '사업자등록증을 업로드해주세요.';
    }
    if (!formData.corporateRegistry) {
      newErrors.corporateRegistry = '법인등기부등본을 업로드해주세요.';
    }
    if (!formData.representativeId) {
      newErrors.representativeId = '대표자 신분증을 업로드해주세요.';
    }
    if (!formData.amlDocuments) {
      newErrors.amlDocuments = 'AML 관련 서류를 업로드해주세요.';
    }

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
      await createCorporateApplication({
        companyInfo: {
          companyName: formData.companyName,
          businessNumber: formData.businessNumber,
          corporateNumber: formData.corporateNumber,
          industry: formData.industry,
          establishedDate: formData.establishedDate,
        },
        representative: {
          name: formData.representativeName,
          position: formData.representativePosition,
          email: formData.representativeEmail,
          phone: formData.representativePhone,
        },
        contact: {
          name: formData.contactName,
          email: formData.contactEmail,
          phone: formData.contactPhone,
        },
        companyAddress: {
          street: formData.companyStreet,
          city: formData.companyCity,
          state: formData.companyState,
          postalCode: formData.companyPostalCode,
          country: formData.companyCountry,
        },
        documents: {
          businessRegistration: { uploaded: !!formData.businessRegistration, verified: false },
          corporateRegistry: { uploaded: !!formData.corporateRegistry, verified: false },
          representativeId: { uploaded: !!formData.representativeId, verified: false },
          amlDocuments: { uploaded: !!formData.amlDocuments, verified: false },
        },
        status: 'submitted',
        priority: 'medium',
      });

      toast({
        title: '신청 완료',
        description: '기업 회원 온보딩 신청이 생성되었습니다.',
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

      {/* Step 1: 기업 정보 */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">기업 정보</h3>

          <div className="space-y-2">
            <Label htmlFor="companyName">
              회사명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              value={formData.companyName}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="(주)홍길동"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessNumber">
                사업자등록번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessNumber"
                value={formData.businessNumber}
                onChange={(e) => updateField('businessNumber', e.target.value)}
                placeholder="123-45-67890"
              />
              {errors.businessNumber && (
                <p className="text-sm text-red-500">{errors.businessNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="corporateNumber">
                법인등록번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="corporateNumber"
                value={formData.corporateNumber}
                onChange={(e) => updateField('corporateNumber', e.target.value)}
                placeholder="123456-1234567"
              />
              {errors.corporateNumber && (
                <p className="text-sm text-red-500">{errors.corporateNumber}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">
                업종 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => updateField('industry', value)}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="업종 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="금융">금융</SelectItem>
                  <SelectItem value="IT/소프트웨어">IT/소프트웨어</SelectItem>
                  <SelectItem value="제조">제조</SelectItem>
                  <SelectItem value="유통/도소매">유통/도소매</SelectItem>
                  <SelectItem value="서비스">서비스</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-500">{errors.industry}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="establishedDate">
                설립일 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="establishedDate"
                type="date"
                value={formData.establishedDate}
                onChange={(e) => updateField('establishedDate', e.target.value)}
              />
              {errors.establishedDate && (
                <p className="text-sm text-red-500">{errors.establishedDate}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: 대표자 및 담당자 정보 */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">대표자 및 담당자 정보</h3>

          <div className="space-y-4">
            <h4 className="font-medium">대표자 정보</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="representativeName">
                  대표자명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="representativeName"
                  value={formData.representativeName}
                  onChange={(e) => updateField('representativeName', e.target.value)}
                  placeholder="홍길동"
                />
                {errors.representativeName && (
                  <p className="text-sm text-red-500">{errors.representativeName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="representativePosition">
                  직책 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="representativePosition"
                  value={formData.representativePosition}
                  onChange={(e) => updateField('representativePosition', e.target.value)}
                  placeholder="대표이사"
                />
                {errors.representativePosition && (
                  <p className="text-sm text-red-500">{errors.representativePosition}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="representativeEmail">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="representativeEmail"
                  type="email"
                  value={formData.representativeEmail}
                  onChange={(e) => updateField('representativeEmail', e.target.value)}
                  placeholder="ceo@company.com"
                />
                {errors.representativeEmail && (
                  <p className="text-sm text-red-500">{errors.representativeEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="representativePhone">
                  전화번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="representativePhone"
                  value={formData.representativePhone}
                  onChange={(e) => updateField('representativePhone', e.target.value)}
                  placeholder="010-1234-5678"
                />
                {errors.representativePhone && (
                  <p className="text-sm text-red-500">{errors.representativePhone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">담당자 정보</h4>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">
                  담당자명 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => updateField('contactName', e.target.value)}
                  placeholder="김담당"
                />
                {errors.contactName && (
                  <p className="text-sm text-red-500">{errors.contactName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">
                  이메일 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="contact@company.com"
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">
                  전화번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="010-9876-5432"
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500">{errors.contactPhone}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">회사 주소</h4>

            <div className="space-y-2">
              <Label htmlFor="companyStreet">
                도로명 주소 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyStreet"
                value={formData.companyStreet}
                onChange={(e) => updateField('companyStreet', e.target.value)}
                placeholder="서울특별시 강남구 테헤란로 123"
              />
              {errors.companyStreet && (
                <p className="text-sm text-red-500">{errors.companyStreet}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyCity">
                  시/군/구 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyCity"
                  value={formData.companyCity}
                  onChange={(e) => updateField('companyCity', e.target.value)}
                  placeholder="강남구"
                />
                {errors.companyCity && (
                  <p className="text-sm text-red-500">{errors.companyCity}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyState">
                  시/도 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyState"
                  value={formData.companyState}
                  onChange={(e) => updateField('companyState', e.target.value)}
                  placeholder="서울특별시"
                />
                {errors.companyState && (
                  <p className="text-sm text-red-500">{errors.companyState}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyPostalCode">
                  우편번호 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyPostalCode"
                  value={formData.companyPostalCode}
                  onChange={(e) => updateField('companyPostalCode', e.target.value)}
                  placeholder="12345"
                />
                {errors.companyPostalCode && (
                  <p className="text-sm text-red-500">{errors.companyPostalCode}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyCountry">
                국가 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyCountry"
                value={formData.companyCountry}
                onChange={(e) => updateField('companyCountry', e.target.value)}
                placeholder="대한민국"
              />
              {errors.companyCountry && (
                <p className="text-sm text-red-500">{errors.companyCountry}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 문서 업로드 */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">문서 업로드</h3>

          <FileUploadField
            label="사업자등록증"
            required
            value={formData.businessRegistration}
            onChange={(file) => updateField('businessRegistration', file)}
            error={errors.businessRegistration}
          />

          <FileUploadField
            label="법인등기부등본"
            required
            value={formData.corporateRegistry}
            onChange={(file) => updateField('corporateRegistry', file)}
            error={errors.corporateRegistry}
          />

          <FileUploadField
            label="대표자 신분증"
            required
            value={formData.representativeId}
            onChange={(file) => updateField('representativeId', file)}
            error={errors.representativeId}
          />

          <FileUploadField
            label="AML 관련 서류"
            required
            value={formData.amlDocuments}
            onChange={(file) => updateField('amlDocuments', file)}
            error={errors.amlDocuments}
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
