/**
 * 청산콜 카드 컴포넌트
 * 개별 청산콜 정보를 카드 형태로 표시
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { LiquidationCall } from "@/types/admin-lending";
import { AlertTriangle, Play, Clock } from "lucide-react";

interface LiquidationCallCardProps {
  call: LiquidationCall;
  onExecute: (call: LiquidationCall) => void;
}

export default function LiquidationCallCard({
  call,
  onExecute,
}: LiquidationCallCardProps) {
  // 우선순위별 배지 스타일
  const getPriorityBadgeClass = (priority: LiquidationCall["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-50 text-red-600 border-red-200";
      case "high":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "normal":
        return "bg-sky-50 text-sky-600 border-sky-200";
    }
  };

  // 상태별 배지 스타일
  const getStatusBadgeClass = (status: LiquidationCall["status"]) => {
    switch (status) {
      case "pending":
        return "bg-gray-50 text-gray-600 border-gray-200";
      case "processing":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "completed":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "failed":
        return "bg-red-50 text-red-600 border-red-200";
    }
  };

  // Health Factor 색상
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.2) return "text-yellow-600";
    if (healthFactor >= 1.0) return "text-red-600";
    return "text-purple-600";
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`;
    }
    return amount.toLocaleString();
  };

  // 상대 시간 계산
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return "방금 전";
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    return date.toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        call.priority === "urgent"
          ? "border-red-200 border-2"
          : ""
      }`}
    >
      <CardContent className="p-4">
        {/* 헤더 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle
              className={`h-5 w-5 ${
                call.priority === "urgent"
                  ? "text-red-600"
                  : call.priority === "high"
                  ? "text-gray-600"
                  : "text-sky-600"
              }`}
            />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {call.customerName}
              </h3>
              <p className="text-xs text-gray-500 font-mono">{call.loanId}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge
              className={`${getPriorityBadgeClass(call.priority)} border text-xs`}
            >
              {call.priority === "urgent" && "긴급"}
              {call.priority === "high" && "높음"}
              {call.priority === "normal" && "보통"}
            </Badge>
            <Badge
              className={`${getStatusBadgeClass(call.status)} border text-xs`}
            >
              {call.status === "pending" && "대기"}
              {call.status === "processing" && "처리 중"}
              {call.status === "completed" && "완료"}
              {call.status === "failed" && "실패"}
            </Badge>
          </div>
        </div>

        {/* 담보 자산 정보 */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CryptoIcon symbol={call.collateralAsset.asset} size={24} />
              <span className="text-sm font-medium text-gray-900">
                {call.collateralAsset.amount} {call.collateralAsset.asset}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {formatAmount(call.collateralAsset.value)}원
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>대출 금액: {formatAmount(call.loanAmount)}원</span>
            <span
              className={`font-bold ${getHealthFactorColor(
                call.healthFactor
              )}`}
            >
              HF: {call.healthFactor.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 수신 시간 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{getRelativeTime(call.receivedAt)}</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        {call.status === "pending" && (
          <Button
            onClick={() => onExecute(call)}
            size="sm"
            className="w-full"
          >
            <Play className="h-4 w-4 mr-1" />
            청산 실행
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
