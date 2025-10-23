/**
 * 알림 내역 리스트 컴포넌트
 * 필터링 가능한 알림 내역 표시
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertHistoryFilters } from "@/types/admin-lending";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Circle,
} from "lucide-react";

interface AlertHistoryListProps {
  alerts: Alert[];
  onMarkAsRead: (id: string) => void;
}

export default function AlertHistoryList({
  alerts,
  onMarkAsRead,
}: AlertHistoryListProps) {
  const [typeFilter, setTypeFilter] = useState<Alert["type"] | "all">("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");

  // 필터링된 알림
  const filteredAlerts = alerts.filter((alert) => {
    if (typeFilter !== "all" && alert.type !== typeFilter) return false;
    if (readFilter === "unread" && alert.read) return false;
    if (readFilter === "read" && !alert.read) return false;
    return true;
  });

  // 아이콘 선택
  const getIcon = (type: Alert["type"], severity: Alert["severity"]) => {
    const sizeClass = "h-4 w-4";

    if (severity === "critical") {
      return <AlertTriangle className={`${sizeClass} text-red-600`} />;
    }

    switch (type) {
      case "health_factor":
        return <Activity className={`${sizeClass} text-indigo-600`} />;
      case "price_change":
        return <TrendingUp className={`${sizeClass} text-purple-600`} />;
      case "liquidation":
        return <AlertTriangle className={`${sizeClass} text-red-600`} />;
    }
  };

  // 심각도 배지
  const getSeverityBadge = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
            긴급
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
            주의
          </Badge>
        );
      case "info":
        return (
          <Badge variant="outline" className="bg-sky-50 text-sky-600 border-sky-200">
            정보
          </Badge>
        );
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}초 전`;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;

    return date.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">알림 내역</CardTitle>
          <Badge variant="outline" className="bg-gray-50 text-gray-600">
            {filteredAlerts.length}건
          </Badge>
        </div>

        {/* 필터 */}
        <div className="flex space-x-2 mt-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="all">전체 타입</option>
            <option value="health_factor">헬스팩터</option>
            <option value="price_change">가격 변동</option>
            <option value="liquidation">청산</option>
          </select>

          <select
            value={readFilter}
            onChange={(e) => setReadFilter(e.target.value as any)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md"
          >
            <option value="all">전체</option>
            <option value="unread">읽지 않음</option>
            <option value="read">읽음</option>
          </select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>알림 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => !alert.read && onMarkAsRead(alert.id)}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  alert.read
                    ? "bg-white border-gray-200"
                    : "bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* 아이콘 */}
                    <div className="mt-0.5">
                      {getIcon(alert.type, alert.severity)}
                    </div>

                    {/* 내용 */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSeverityBadge(alert.severity)}
                        {alert.customerName && (
                          <span className="text-sm font-medium text-gray-900">
                            {alert.customerName}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(alert.sentAt)}
                        </span>
                        <span>
                          {alert.channels.map((ch) => {
                            switch (ch) {
                              case "email":
                                return "이메일";
                              case "sms":
                                return "SMS";
                            }
                          }).join(", ")}
                        </span>
                      </div>
                    </div>

                    {/* 읽음 상태 */}
                    <div className="mt-1">
                      {alert.read ? (
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-indigo-600 fill-indigo-600" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
