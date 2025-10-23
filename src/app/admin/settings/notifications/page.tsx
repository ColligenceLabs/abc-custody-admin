/**
 * 알림 설정 페이지
 * 대출 관리 알림 설정
 */

"use client";

import { useState, useEffect } from "react";
import AlertSettingCard from "@/components/admin-lending/alerts/AlertSettingCard";
import { AlertConfig } from "@/types/admin-lending";
import { getAlertConfigs } from "@/services/admin-lending";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Bell } from "lucide-react";

export default function NotificationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<AlertConfig[]>([]);

  // 데이터 로드
  const loadData = async () => {
    setLoading(true);
    try {
      const configsData = await getAlertConfigs();
      setConfigs(configsData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "데이터 로드 실패",
        description: "알림 설정을 불러오는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드
  useEffect(() => {
    loadData();
  }, []);

  // 헬스팩터 알림 설정
  const healthFactorConfigs = configs
    .filter((c) => c.type === "health_factor")
    .sort((a, b) => b.threshold - a.threshold);

  // 가격 변동 알림
  const priceChangeConfig = configs.find((c) => c.type === "price_change");

  // 청산 알림
  const liquidationConfig = configs.find((c) => c.type === "liquidation");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Bell className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">알림 설정</h1>
            <p className="text-sm text-gray-600 mt-1">
              대출 리스크 알림을 설정하고 관리합니다
            </p>
          </div>
        </div>

        {/* 헬스팩터 알림 설정 섹션 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            헬스팩터 알림 설정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {healthFactorConfigs.map((config) => (
              <AlertSettingCard
                key={config.id}
                config={config}
                onUpdate={loadData}
              />
            ))}
          </div>
        </div>

        {/* 기타 알림 설정 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            기타 알림 설정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priceChangeConfig && (
              <AlertSettingCard
                config={priceChangeConfig}
                onUpdate={loadData}
              />
            )}
            {liquidationConfig && (
              <AlertSettingCard
                config={liquidationConfig}
                onUpdate={loadData}
              />
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
          <p className="text-sm text-sky-800">
            알림은 이메일과 SMS로 발송됩니다. 각 알림의 임계값과 채널을 설정할
            수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
