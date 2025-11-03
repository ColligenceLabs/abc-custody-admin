"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { needsOnboarding } from "@/utils/onboardingHelpers";

export default function CorporateOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    if (!needsOnboarding(user)) {
      router.push('/overview');
      return;
    }

    // 온보딩이 필요하면 환영 페이지로 리다이렉트
    router.push('/onboarding/corporate/welcome');
  }, [user, isAuthenticated, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
