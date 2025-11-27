/**
 * CorporateRegistrationForm Multi-Step Version
 * 법인회원 수동 등록 폼 (AML 규제 준수)
 *
 * 5단계 프로세스:
 * 1. 법인 기본정보 + 담당자
 * 2. 대표자 KYC 정보
 * 3. 소유자 정보 (주주/임원/실소유자)
 * 4. 사업/재무 정보
 * 5. 서류 업로드 + 최종 확인
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2RepresentativeKYC } from "./steps/Step2RepresentativeKYC";
import { Step3Owners } from "./steps/Step3Owners";
import { Step4BusinessFinance } from "./steps/Step4BusinessFinance";
import { Step5DocumentsReview } from "./steps/Step5DocumentsReview";

interface CorporateRegistrationFormMultiStepProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

export function CorporateRegistrationFormMultiStep({
  onSubmit,
  onCancel,
}: CorporateRegistrationFormMultiStepProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  // 전체 폼 데이터 (통합)
  const [formData, setFormData] = useState({
    // Step 1: 법인 기본정보 + 담당자
    companyName: "",
    businessNumber: "",
    corporateRegistryNumber: "",
    establishmentDate: "",
    corporateType: "",
    industryType: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",

    // Step 2: 대표자 KYC
    repName: "",
    repBirthDate: "",
    repGender: "",
    repNationality: "KR", // 기본값: 대한민국
    repIdType: "01",
    repIdNumber: "",
    repPhone: "",
    repAddress: "",
    repZipCode: "",
    isFiuTarget: false,
    hasOwnership: false,

    // Step 3: 소유자 정보
    owners: [] as any[],
    isRealOwnerExempt: false,
    realOwnerExemptCode: "",

    // Step 4: 사업/재무 정보
    mainBusiness: "",
    majorCustomers: "",
    majorSuppliers: "",
    mainProducts: "",
    monthlyRevenue: 0,
    totalAssets: 0,
    totalCapital: 0,
    totalLiabilities: 0,
    netIncome: 0,
    marketShare: 0,
    employeeCount: 0,
    businessLocations: 1,
    homepageUrl: "",
    mainBankName: "",
    mainBankAccountCountry: "KR", // 기본값: 대한민국
    mainBankAccount: "",
    mainBankAccountHolder: "",
    companySize: "",
    isVASP: false,
    isFinancialInstitution: false,

    // Step 5: 서류
    documents: {},
  });

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = [
    { num: 1, title: "법인 기본정보", desc: "법인 및 담당자 정보" },
    { num: 2, title: "대표자 KYC", desc: "대표자 신원 확인" },
    { num: 3, title: "소유자 정보", desc: "주주/임원/실소유자" },
    { num: 4, title: "사업/재무", desc: "사업 및 재무 정보" },
    { num: 5, title: "서류 업로드", desc: "서류 제출 및 확인" },
  ];

  const handleNext = () => {
    // 현재 Step 검증
    if (currentStep === 1) {
      // Step 1 필수 필드 검증
      if (!formData.companyName || !formData.businessNumber || !formData.corporateRegistryNumber ||
          !formData.establishmentDate || !formData.corporateType ||
          !formData.contactName || !formData.contactEmail || !formData.contactPhone) {
        toast({
          variant: "destructive",
          description: "Step 1의 모든 필수 항목을 입력해주세요.",
        });
        return;
      }
    } else if (currentStep === 2) {
      // Step 2 필수 필드 검증
      if (!formData.repName || !formData.repBirthDate || !formData.repGender ||
          !formData.repNationality || !formData.repIdType || !formData.repIdNumber) {
        toast({
          variant: "destructive",
          description: "Step 2의 모든 필수 항목을 입력해주세요.",
        });
        return;
      }
    }
    // Step 3, 4, 5는 선택 항목이므로 검증 생략

    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      // formData를 Backend API 형식으로 매핑
      const apiData = {
        // Step 1: 법인 기본정보
        companyName: formData.companyName,
        businessNumber: formData.businessNumber,
        corporateRegistryNumber: formData.corporateRegistryNumber,
        establishmentDate: formData.establishmentDate,
        corporateType: formData.corporateType,
        industryType: formData.industryType,

        // Step 1: 담당자
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,

        // Step 2: 대표자 KYC
        repName: formData.repName,
        repBirthDate: formData.repBirthDate,
        repGender: formData.repGender,
        repNationality: formData.repNationality,
        repIdType: formData.repIdType,
        repIdNumber: formData.repIdNumber,
        repPhone: formData.repPhone,
        repAddress: formData.repAddress,
        repZipCode: formData.repZipCode,
        isFiuTarget: formData.isFiuTarget,
        hasOwnership: formData.hasOwnership,

        // Step 3: 소유자
        owners: formData.owners,
        isRealOwnerExempt: formData.isRealOwnerExempt,
        realOwnerExemptCode: formData.realOwnerExemptCode,

        // Step 4: 사업/재무
        mainBusiness: formData.mainBusiness,
        mainProducts: formData.mainProducts,
        majorCustomers: formData.majorCustomers,
        majorSuppliers: formData.majorSuppliers,
        employeeCount: formData.employeeCount,
        businessLocationCount: formData.businessLocations,
        companySize: formData.companySize,
        monthlyRevenue: formData.monthlyRevenue,
        totalAssets: formData.totalAssets,
        totalCapital: formData.totalCapital,
        totalLiabilities: formData.totalLiabilities,
        netIncome: formData.netIncome,
        marketShare: formData.marketShare,
        mainBankName: formData.mainBankName,
        mainBankAccountCountry: formData.mainBankAccountCountry,
        mainBankAccount: formData.mainBankAccount,
        mainBankAccountHolder: formData.mainBankAccountHolder,
        isVASP: formData.isVASP,
        isFinancialInstitution: formData.isFinancialInstitution,
        homepageUrl: formData.homepageUrl,

        // Step 5: 서류
        documents: formData.documents
      };

      console.log('[CorporateRegistration] API 요청 데이터:', apiData);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/corporate-accounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "등록에 실패했습니다.");
      }

      const result = await response.json();
      toast({
        description: `법인 계정이 생성되었습니다. (ID: ${result.data.user.id})`,
      });

      if (onSubmit) {
        await onSubmit(result.data.user);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        description: error?.message || "등록에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-start justify-center max-w-4xl mx-auto px-8">
        {steps.map((step, index) => (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(step.num as Step)}
                disabled={loading}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all cursor-pointer hover:scale-110 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  currentStep === step.num
                    ? "bg-blue-600 text-white shadow-lg"
                    : currentStep > step.num
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {step.num}
              </button>
              <div className="text-xs mt-2 text-center">
                <div className="font-medium whitespace-nowrap">{step.title}</div>
                <div className="text-gray-500 text-[10px] whitespace-nowrap">{step.desc}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight
                className={`h-6 w-6 mt-5 mx-4 transition-all ${
                  currentStep > step.num
                    ? "text-green-600 drop-shadow-md"
                    : "text-gray-300"
                }`}
                strokeWidth={2.5}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            Step {currentStep}/{steps.length}: {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>{steps[currentStep - 1].desc}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: 법인 기본정보 + 담당자 */}
          {currentStep === 1 && (
            <Step1BasicInfo data={formData} onChange={updateFormData} />
          )}

          {/* Step 2: 대표자 KYC */}
          {currentStep === 2 && (
            <Step2RepresentativeKYC data={formData} onChange={updateFormData} />
          )}

          {/* Step 3: 소유자 정보 */}
          {currentStep === 3 && (
            <Step3Owners data={formData} onChange={updateFormData} />
          )}

          {/* Step 4: 사업/재무 정보 */}
          {currentStep === 4 && (
            <Step4BusinessFinance data={formData} onChange={updateFormData} />
          )}

          {/* Step 5: 서류 업로드 + 확인 */}
          {currentStep === 5 && (
            <Step5DocumentsReview
              data={formData}
              formData={formData}
              onChange={updateFormData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={currentStep === 1 ? onCancel : handlePrevious}
          disabled={loading}
        >
          {currentStep === 1 ? (
            "취소"
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-1" />
              이전
            </>
          )}
        </Button>

        {currentStep < 5 ? (
          <Button type="button" onClick={handleNext} disabled={loading}>
            다음
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button type="button" onClick={handleFinalSubmit} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            등록하기
          </Button>
        )}
      </div>
    </div>
  );
}
