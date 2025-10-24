/**
 * Onboarding AML Main Page - Redirect to Individual
 * 메인 페이지를 개인회원 온보딩으로 리다이렉트
 */

import { redirect } from 'next/navigation';

export default function OnboardingAmlPage() {
  redirect('/admin/members/onboarding-aml/individual');
}
