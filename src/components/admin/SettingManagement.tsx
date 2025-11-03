"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BuildingOfficeIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { ServicePlan } from "@/app/page";
import { useAuth } from "@/contexts/AuthContext";
import { hasPermission } from "@/utils/permissionUtils";
import CompanySettingsTab from "./CompanySettingsTab";
import CorporateSubscriptionTab from "./CorporateSubscriptionTab";
import IndividualSubscriptionTab from "./IndividualSubscriptionTab";

interface SettingManagementProps {
  plan: ServicePlan;
  initialTab?: "company" | "subscription";
}

export default function SettingManagement({
  plan,
  initialTab,
}: SettingManagementProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"company" | "subscription">(
    initialTab || "company"
  );

  // initialTab이 변경되면 activeTab 업데이트
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // 탭 변경 함수 (URL도 함께 변경)
  const handleTabChange = (newTab: "company" | "subscription") => {
    setActiveTab(newTab);
    router.push(`/setting/${newTab}`);
  };

  return (
    <div className="space-y-6 min-h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.memberType === 'corporate' ? '설정 및 구독 관리' : '구독 관리'}
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.memberType === 'corporate'
              ? '회사 정보와 구독 서비스를 관리하세요'
              : '구독 서비스를 관리하세요'}
          </p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            {
              id: "company",
              name: "회사 정보",
              icon: BuildingOfficeIcon,
              description: "브랜딩 및 도메인 설정",
              visible: user?.memberType === 'corporate' && user && hasPermission(user, 'system.manage'),
            },
            {
              id: "subscription",
              name: "구독 관리",
              icon: CreditCardIcon,
              description: "구독 현황 및 결제 내역",
              visible: true,
            },
          ].filter(tab => tab.visible).map((tab) => (
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

      {/* 회사 정보 탭 */}
      {activeTab === "company" && user && hasPermission(user, 'system.manage') && (
        <CompanySettingsTab />
      )}

      {/* 구독 관리 탭 - 회원 유형에 따라 분기 */}
      {activeTab === "subscription" && (
        user?.memberType === 'corporate' ? (
          <CorporateSubscriptionTab plan={plan} />
        ) : (
          <IndividualSubscriptionTab plan={plan} />
        )
      )}
    </div>
  );
}