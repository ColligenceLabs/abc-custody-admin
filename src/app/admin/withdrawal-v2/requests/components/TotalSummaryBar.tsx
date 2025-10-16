/**
 * TotalSummaryBar Component
 *
 * 승인 대기 중인 출금 요청의 총 금액 및 긴급 요청 수 표시
 * - 총 이체 금액 (KRW)
 * - 긴급 요청 수
 */

import { Badge } from "@/components/ui/badge";
import { DollarSign, AlertTriangle } from "lucide-react";

export interface TotalPendingSummary {
  totalValueKRW: string;
  totalRequests: number;
  totalUrgentRequests: number;
  assetCount: number;
}

interface TotalSummaryBarProps {
  summary: TotalPendingSummary;
}

export function TotalSummaryBar({ summary }: TotalSummaryBarProps) {
  const { totalValueKRW, totalUrgentRequests } = summary;

  return (
    <div className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      {/* 총 이체 금액 */}
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-muted-foreground">
          총 이체 금액
        </span>
        <span className="text-xl font-bold">₩ {totalValueKRW}</span>
      </div>

      {/* 긴급 요청 수 (조건부 표시) */}
      {totalUrgentRequests > 0 && (
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <span className="text-sm font-medium text-muted-foreground">
            긴급 요청
          </span>
          <Badge variant="destructive">{totalUrgentRequests}건</Badge>
        </div>
      )}
    </div>
  );
}
