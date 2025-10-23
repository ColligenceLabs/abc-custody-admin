/**
 * 알림 설정 카드 컴포넌트
 * 재사용 가능한 알림 설정 UI
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertConfig } from "@/types/admin-lending";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Mail,
  Smartphone,
  Save,
  Play,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { updateAlertConfig, testAlert } from "@/services/admin-lending";

interface AlertSettingCardProps {
  config: AlertConfig;
  onUpdate: () => void;
}

export default function AlertSettingCard({
  config,
  onUpdate,
}: AlertSettingCardProps) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(config.enabled);
  const [threshold, setThreshold] = useState(config.threshold);
  const [channels, setChannels] = useState<AlertConfig["channels"]>(
    config.channels
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  // 아이콘 선택
  const getIcon = () => {
    switch (config.type) {
      case "health_factor":
        return <Activity className="h-5 w-5" />;
      case "price_change":
        return <TrendingUp className="h-5 w-5" />;
      case "liquidation":
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  // 제목 생성
  const getTitle = () => {
    switch (config.type) {
      case "health_factor":
        return `헬스팩터 ${threshold} 이하`;
      case "price_change":
        return `가격 변동 ${threshold}% 이상`;
      case "liquidation":
        return "청산 알림";
    }
  };

  // 컬러 클래스
  const getColorClass = () => {
    switch (config.type) {
      case "health_factor":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "price_change":
        return "bg-purple-50 text-purple-600 border-purple-200";
      case "liquidation":
        return "bg-red-50 text-red-600 border-red-200";
    }
  };

  // 활성화 토글
  const handleToggle = () => {
    setEnabled(!enabled);
    setHasChanges(true);
  };

  // 임계값 변경
  const handleThresholdChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setThreshold(numValue);
      setHasChanges(true);
    }
  };

  // 채널 토글
  const handleChannelToggle = (channel: "email" | "sms") => {
    if (channels.includes(channel)) {
      setChannels(channels.filter((c) => c !== channel));
    } else {
      setChannels([...channels, channel]);
    }
    setHasChanges(true);
  };

  // 저장
  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAlertConfig(config.id, {
        enabled,
        threshold,
        channels,
      });
      setHasChanges(false);
      toast({
        description: "알림 설정이 저장되었습니다.",
      });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "저장 실패",
        description: "알림 설정을 저장하는 중 오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 테스트
  const handleTest = async () => {
    setLoading(true);
    try {
      await testAlert(config.id);
      toast({
        description: "테스트 알림이 발송되었습니다.",
      });
      onUpdate();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "테스트 실패",
        description: "테스트 알림 발송에 실패했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={`${enabled ? "" : "opacity-60"}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-lg ${getColorClass()}`}>{getIcon()}</div>
            <CardTitle className="text-base">{getTitle()}</CardTitle>
          </div>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? "bg-sky-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 임계값 입력 */}
        {config.type !== "liquidation" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              임계값
            </label>
            <Input
              type="number"
              value={threshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              step={config.type === "health_factor" ? 0.1 : 1}
              min={0}
              disabled={!enabled || loading}
            />
          </div>
        )}

        {/* 알림 채널 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            알림 채널
          </label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={channels.includes("email")}
                onChange={() => handleChannelToggle("email")}
                disabled={!enabled || loading}
                className="rounded border-gray-300"
              />
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">이메일</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={channels.includes("sms")}
                onChange={() => handleChannelToggle("sms")}
                disabled={!enabled || loading}
                className="rounded border-gray-300"
              />
              <Smartphone className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">SMS</span>
            </label>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex space-x-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            저장
          </Button>
          <Button
            onClick={handleTest}
            disabled={!enabled || loading}
            variant="outline"
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            테스트
          </Button>
        </div>

        {/* 상태 표시 */}
        {hasChanges && (
          <Badge variant="outline" className="w-full justify-center bg-yellow-50 text-yellow-600 border-yellow-200">
            변경사항이 저장되지 않았습니다
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
