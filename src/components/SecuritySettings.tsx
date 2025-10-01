"use client";

import { useState, useEffect, startTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ShieldCheckIcon,
  WalletIcon,
  BuildingLibraryIcon,
  CogIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import SecurityTab from "./security/SecurityTab";
import AddressManagement from "./security/AddressManagement";
import AccountManagement from "./security/AccountManagement";
import PolicyManagement from "./security/PolicyManagement";
import { NotificationCenter } from "./security/NotificationCenter";

interface SecuritySettingsProps {
  plan: ServicePlan;
  initialTab?: "security" | "addresses" | "accounts" | "policies" | "notifications";
  notificationSubtab?: "logs" | "templates" | "settings";
  policySubtab?: "amount" | "type";
  addressSubtab?: "personal" | "vasp";
}

export default function SecuritySettings({ plan, initialTab, notificationSubtab, policySubtab, addressSubtab }: SecuritySettingsProps) {
  const router = useRouter();
  const pathname = usePathname();
  // 탭 관리 상태
  const [activeTab, setActiveTab] = useState<"security" | "addresses" | "accounts" | "policies" | "notifications">(initialTab || "security");

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: "security" | "addresses" | "accounts" | "policies" | "notifications") => {
    // 상태 업데이트
    setActiveTab(newTab);

    // 타겟 URL 결정
    const targetUrl = (() => {
      switch (newTab) {
        case "notifications":
          return `/security/notifications/logs`;
        case "addresses":
          return `/security/addresses/personal`;
        case "policies":
          return `/security/policies/amount`;
        default:
          return `/security/${newTab}`;
      }
    })();

    // startTransition을 사용하여 비동기적으로 라우팅 처리
    startTransition(() => {
      router.push(targetUrl);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">보안 설정</h1>
        <p className="text-gray-600 mt-1">
          최고 수준의 보안으로 디지털 자산을 보호합니다
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "security", name: "보안 설정", icon: ShieldCheckIcon },
            { id: "addresses", name: "주소 관리", icon: WalletIcon },
            { id: "accounts", name: "계좌 연동", icon: BuildingLibraryIcon },
            { id: "policies", name: "정책 관리", icon: CogIcon },
            { id: "notifications", name: "알림 설정", icon: BellIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as typeof activeTab)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "security" && <SecurityTab plan={plan} />}
      {activeTab === "addresses" && <AddressManagement initialTab={addressSubtab} />}
      {activeTab === "accounts" && <AccountManagement plan={plan} />}
      {activeTab === "policies" && <PolicyManagement />}
      {activeTab === "notifications" && <NotificationCenter initialSubtab={notificationSubtab} />}
    </div>
  );
}