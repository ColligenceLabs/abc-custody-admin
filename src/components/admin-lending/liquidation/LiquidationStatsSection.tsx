/**
 * 청산콜 통계 섹션 컴포넌트
 */

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

interface LiquidationStatsSectionProps {
  totalCalls: number;
  pendingCalls: number;
  processingCalls: number;
}

export function LiquidationStatsSection({
  totalCalls,
  pendingCalls,
  processingCalls,
}: LiquidationStatsSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* 총 청산콜 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">총 청산콜</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {totalCalls}건
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 대기 중 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">대기 중</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {pendingCalls}건
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 처리 중 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">처리 중</p>
              <p className="text-2xl font-bold text-sky-600 mt-2">
                {processingCalls}건
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-sky-50 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
