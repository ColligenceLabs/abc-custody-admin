"use client";

import { useAuth } from "@/contexts/AuthContext";
import CorporateWithdrawalManagement from "./CorporateWithdrawalManagement";
import IndividualWithdrawalManagement from "./IndividualWithdrawalManagement";
import { WithdrawalManagementProps } from "@/types/withdrawal";

export default function WithdrawalManagement({
  plan,
  initialTab,
}: WithdrawalManagementProps) {
  const { user } = useAuth();

  // 회원 유형에 따라 적절한 컴포넌트 렌더링
  if (user?.memberType === "corporate") {
    return <CorporateWithdrawalManagement plan={plan} initialTab={initialTab} />;
  }

  // 개인 회원 또는 memberType이 없는 경우
  return <IndividualWithdrawalManagement plan={plan} initialTab={initialTab} />;
}
