"use client";

import { useEffect } from "react";
import AddressManagement from "../AddressManagement";

export default function WithdrawalAddresses() {
  // 페이지 로드 시 출금 탭으로 설정
  useEffect(() => {
    // AddressManagement에서 출금 탭을 기본으로 설정하도록 쿼리 파라미터 전달
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', 'withdrawal');
    window.history.replaceState({}, '', currentUrl);
  }, []);

  return <AddressManagement />;
}