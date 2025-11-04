"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  OnboardingStep,
  OnboardingStatus,
  OnboardingProgress,
  CorporateOnboardingData,
  CORPORATE_ONBOARDING_STEPS,
} from '@/types/onboarding';

interface OnboardingContextType {
  onboardingData: CorporateOnboardingData | null;
  progress: OnboardingProgress | null;
  currentStep: OnboardingStep;
  isLoading: boolean;

  // 진행 관리
  goToStep: (step: OnboardingStep) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  completeStep: (step: OnboardingStep, data?: Partial<CorporateOnboardingData>) => void;

  // 데이터 업데이트
  updateOnboardingData: (data: Partial<CorporateOnboardingData>) => void;
  completeOnboarding: () => Promise<void>;

  // 상태 조회
  isStepCompleted: (step: OnboardingStep) => boolean;
  canAccessStep: (step: OnboardingStep) => boolean;
  getStepIndex: (step: OnboardingStep) => number;
}

const OnboardingContext = createContext<OnboardingContextType | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [onboardingData, setOnboardingData] = useState<CorporateOnboardingData | null>(null);
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);

  // localStorage에서 진행 상황 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('corporate_onboarding');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setOnboardingData(data);
          setProgress(data.progress);
          setCurrentStep(data.progress.currentStep);
        } catch (error) {
          console.error('온보딩 데이터 로드 실패:', error);
        }
      }
    }
  }, []);

  // 진행 상황 저장
  useEffect(() => {
    if (onboardingData && typeof window !== 'undefined') {
      localStorage.setItem('corporate_onboarding', JSON.stringify(onboardingData));
    }
  }, [onboardingData]);

  const getStepIndex = (step: OnboardingStep): number => {
    return CORPORATE_ONBOARDING_STEPS.findIndex(s => s.step === step);
  };

  const isStepCompleted = (step: OnboardingStep): boolean => {
    return progress?.completedSteps.includes(step) || false;
  };

  const canAccessStep = (step: OnboardingStep): boolean => {
    const stepIndex = getStepIndex(step);
    const currentIndex = getStepIndex(currentStep);

    // 이전 단계이거나 현재 단계면 접근 가능
    if (stepIndex <= currentIndex) {
      return true;
    }

    // 다음 단계는 현재 단계가 완료되어야 접근 가능
    return isStepCompleted(currentStep);
  };

  const goToStep = (step: OnboardingStep) => {
    if (!canAccessStep(step)) {
      console.warn(`Cannot access step: ${step}`);
      return;
    }
    setCurrentStep(step);
    router.push(`/onboarding/corporate/${step}`);
  };

  const goToNextStep = () => {
    const currentIndex = getStepIndex(currentStep);
    const nextIndex = currentIndex + 1;

    if (nextIndex < CORPORATE_ONBOARDING_STEPS.length) {
      const nextStep = CORPORATE_ONBOARDING_STEPS[nextIndex].step;
      goToStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = getStepIndex(currentStep);
    const prevIndex = currentIndex - 1;

    if (prevIndex >= 0) {
      const prevStep = CORPORATE_ONBOARDING_STEPS[prevIndex].step;
      setCurrentStep(prevStep);
      router.push(`/onboarding/corporate/${prevStep}`);
    }
  };

  const completeStep = (step: OnboardingStep, data?: Partial<CorporateOnboardingData>) => {
    if (!progress) return;

    const updatedCompletedSteps = [...progress.completedSteps];
    if (!updatedCompletedSteps.includes(step)) {
      updatedCompletedSteps.push(step);
    }

    const updatedProgress: OnboardingProgress = {
      ...progress,
      completedSteps: updatedCompletedSteps,
      currentStep: step,
    };

    setProgress(updatedProgress);

    if (data && onboardingData) {
      setOnboardingData({
        ...onboardingData,
        ...data,
        progress: updatedProgress,
      });
    }

    // 자동으로 다음 단계로 이동
    goToNextStep();
  };

  const updateOnboardingData = (data: Partial<CorporateOnboardingData>) => {
    if (!onboardingData) return;

    setOnboardingData({
      ...onboardingData,
      ...data,
    });
  };

  const completeOnboarding = async () => {
    if (!onboardingData) return;

    setIsLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

      const response = await fetch(`${API_URL}/api/users/${onboardingData.userId}/complete-onboarding`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboardingData,
          completedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('온보딩 완료 처리 실패');
      }

      // localStorage 정리
      localStorage.removeItem('corporate_onboarding');

      // 대시보드로 이동
      router.push('/overview');
    } catch (error) {
      console.error('온보딩 완료 실패:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: OnboardingContextType = {
    onboardingData,
    progress,
    currentStep,
    isLoading,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    completeStep,
    updateOnboardingData,
    completeOnboarding,
    isStepCompleted,
    canAccessStep,
    getStepIndex,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
