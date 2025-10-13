"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  StakingAsset,
  StakingValidator,
  StakingFormData,
  ValidationErrors,
  StakingCalculation,
  NewStakingModalProps,
} from "./types";
import StakingProgressIndicator from "./components/StakingProgressIndicator";
import AssetSelectionStep from "./steps/AssetSelectionStep";
import AmountInputStep from "./steps/AmountInputStep";
import ValidatorSelectionStep from "./steps/ValidatorSelectionStep";
import ConfirmationStep from "./steps/ConfirmationStep";
import {
  validateAssetSelection,
  validateAmount,
  validateValidator,
  validateTermsAgreement,
} from "./utils/stakingValidation";
import { calculateStakingRewards } from "./utils/stakingCalculations";

export default function NewStakingModal({
  isOpen,
  onClose,
  onSubmit,
  availableAssets,
}: NewStakingModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<StakingFormData>({
    selectedAsset: null,
    stakingAmount: 0,
    selectedValidator: null,
    termsAgreed: false,
    riskAcknowledged: false,
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [calculation, setCalculation] = useState<StakingCalculation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock validators (실제로는 API에서 가져와야 함)
  const mockValidators: StakingValidator[] = [
    {
      id: "1",
      name: "Lido",
      apy: 4.2,
      commissionRate: 10,
      totalStaked: 9500000,
      totalStakedKrw: 30400000000000,
      uptime: 99.9,
      trustScore: 4.8,
      slashingHistory: [],
      recommended: true,
      status: "active",
      description: "세계 최대 규모의 검증인",
      website: "https://lido.fi",
    },
    {
      id: "2",
      name: "Coinbase",
      apy: 3.8,
      commissionRate: 25,
      totalStaked: 7200000,
      totalStakedKrw: 23040000000000,
      uptime: 99.5,
      trustScore: 4.5,
      slashingHistory: [],
      recommended: false,
      status: "active",
    },
    {
      id: "3",
      name: "Kraken",
      apy: 4.0,
      commissionRate: 15,
      totalStaked: 5800000,
      totalStakedKrw: 18560000000000,
      uptime: 99.7,
      trustScore: 4.6,
      slashingHistory: [],
      recommended: false,
      status: "active",
    },
  ];

  // 보상 계산 업데이트
  useEffect(() => {
    if (
      formData.selectedAsset &&
      formData.stakingAmount > 0 &&
      formData.selectedValidator
    ) {
      const calc = calculateStakingRewards(
        formData.stakingAmount,
        formData.selectedAsset,
        formData.selectedValidator
      );
      setCalculation(calc);
    } else {
      setCalculation(null);
    }
  }, [formData.selectedAsset, formData.stakingAmount, formData.selectedValidator]);

  // 모달 닫기 시 초기화
  const handleClose = () => {
    setCurrentStep(1);
    setFormData({
      selectedAsset: null,
      stakingAmount: 0,
      selectedValidator: null,
      termsAgreed: false,
      riskAcknowledged: false,
    });
    setErrors({});
    setCalculation(null);
    setIsSubmitting(false);
    onClose();
  };

  // Step 1: 자산 선택
  const handleAssetSelect = (asset: StakingAsset) => {
    setFormData({ ...formData, selectedAsset: asset });
    setErrors({ ...errors, selectedAsset: undefined });
  };

  // Step 2: 수량 입력
  const handleAmountChange = (amount: number) => {
    setFormData({ ...formData, stakingAmount: amount });
    setErrors({ ...errors, stakingAmount: undefined });
  };

  // Step 3: 검증인 선택
  const handleValidatorSelect = (validator: StakingValidator) => {
    setFormData({ ...formData, selectedValidator: validator });
    setErrors({ ...errors, selectedValidator: undefined });
  };

  // Step 4: 약관 동의
  const handleTermsAgreedChange = (agreed: boolean) => {
    setFormData({ ...formData, termsAgreed: agreed });
    setErrors({ ...errors, termsAgreed: undefined });
  };

  const handleRiskAcknowledgedChange = (agreed: boolean) => {
    setFormData({ ...formData, riskAcknowledged: agreed });
    setErrors({ ...errors, riskAcknowledged: undefined });
  };

  // 다음 단계로 이동
  const handleNext = () => {
    let hasError = false;
    const newErrors: ValidationErrors = {};

    if (currentStep === 1) {
      const assetError = validateAssetSelection(formData.selectedAsset);
      if (assetError) {
        newErrors.selectedAsset = assetError;
        hasError = true;
      }
    } else if (currentStep === 2) {
      if (!formData.selectedAsset) return;
      const amountError = validateAmount(
        formData.stakingAmount,
        formData.selectedAsset
      );
      if (amountError) {
        newErrors.stakingAmount = amountError;
        hasError = true;
      }
    } else if (currentStep === 3) {
      const validatorError = validateValidator(formData.selectedValidator);
      if (validatorError) {
        newErrors.selectedValidator = validatorError;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3 | 4);
    }
  };

  // 이전 단계로 이동
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3 | 4);
    }
  };

  // 최종 제출
  const handleSubmit = async () => {
    const termsErrors = validateTermsAgreement(
      formData.termsAgreed,
      formData.riskAcknowledged
    );

    if (Object.keys(termsErrors).length > 0) {
      setErrors(termsErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("스테이킹 신청 오류:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 다음 버튼 활성화 조건
  const isNextButtonEnabled = () => {
    if (currentStep === 1) {
      return formData.selectedAsset !== null;
    } else if (currentStep === 2) {
      return formData.stakingAmount > 0;
    } else if (currentStep === 3) {
      return formData.selectedValidator !== null;
    }
    return true;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                {/* 헤더 */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold text-gray-900"
                  >
                    새 스테이킹
                  </Dialog.Title>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* 진행 표시기 */}
                <StakingProgressIndicator currentStep={currentStep} />

                {/* 본문 */}
                <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                  {currentStep === 1 && (
                    <AssetSelectionStep
                      assets={availableAssets}
                      selectedAsset={formData.selectedAsset}
                      onSelectAsset={handleAssetSelect}
                    />
                  )}

                  {currentStep === 2 && formData.selectedAsset && (
                    <AmountInputStep
                      asset={formData.selectedAsset}
                      amount={formData.stakingAmount}
                      onAmountChange={handleAmountChange}
                      calculation={calculation}
                      error={errors.stakingAmount}
                    />
                  )}

                  {currentStep === 3 && (
                    <ValidatorSelectionStep
                      validators={mockValidators}
                      selectedValidator={formData.selectedValidator}
                      onSelectValidator={handleValidatorSelect}
                    />
                  )}

                  {currentStep === 4 &&
                    formData.selectedAsset &&
                    formData.selectedValidator &&
                    calculation && (
                      <ConfirmationStep
                        asset={formData.selectedAsset}
                        amount={formData.stakingAmount}
                        validator={formData.selectedValidator}
                        calculation={calculation}
                        termsAgreed={formData.termsAgreed}
                        riskAcknowledged={formData.riskAcknowledged}
                        onTermsAgreedChange={handleTermsAgreedChange}
                        onRiskAcknowledgedChange={handleRiskAcknowledgedChange}
                        errors={errors}
                      />
                    )}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        뒤로
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    {currentStep < 4 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!isNextButtonEnabled()}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        다음
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={
                          !formData.termsAgreed ||
                          !formData.riskAcknowledged ||
                          isSubmitting
                        }
                        className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "처리 중..." : "스테이킹 시작"}
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
