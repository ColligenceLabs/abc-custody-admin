"use client";

// ============================================================================
// 출금 실행 테이블 컴포넌트 (Task 4.4)
// ============================================================================

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { WithdrawalExecution, WithdrawalExecutionStatus } from "@/types/withdrawal";
import { Eye, RefreshCw } from "lucide-react";
import { useRetryBroadcast } from "@/hooks/useExecution";

interface ExecutionTableProps {
  executions: WithdrawalExecution[];
  onViewDetail: (execution: WithdrawalExecution) => void;
}

// 상태별 Badge 스타일
const statusConfig: Record<
  WithdrawalExecutionStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  preparing: { label: "준비 중", variant: "secondary" },
  broadcasting: { label: "브로드캐스트 중", variant: "default" },
  broadcast_failed: { label: "브로드캐스트 실패", variant: "destructive" },
  confirming: { label: "컨펌 대기 중", variant: "outline" },
  confirmed: { label: "완료", variant: "default" },
  failed: { label: "실패", variant: "destructive" },
};

export function ExecutionTable({ executions, onViewDetail }: ExecutionTableProps) {
  const retryMutation = useRetryBroadcast();
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const handleRetry = async (executionId: string) => {
    setRetryingId(executionId);
    try {
      await retryMutation.mutateAsync({
        executionId,
        increaseFee: true,
        feeMultiplier: 1.5,
      });
    } finally {
      setRetryingId(null);
    }
  };

  const formatTxHash = (hash?: string) => {
    if (!hash) return "-";
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("ko-KR", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (executions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          출금 실행 내역이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회원사</TableHead>
            <TableHead>자산</TableHead>
            <TableHead className="text-right">금액</TableHead>
            <TableHead>TxHash</TableHead>
            <TableHead>컨펌 진행률</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>시작 시간</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {executions.map((execution) => {
            const status = statusConfig[execution.status];
            const canRetry =
              (execution.status === "broadcast_failed" ||
                execution.status === "failed") &&
              execution.retryInfo &&
              execution.retryInfo.attempt < execution.retryInfo.maxAttempts;

            return (
              <TableRow key={execution.id}>
                <TableCell className="font-medium">
                  {execution.memberName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{execution.asset}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  {parseFloat(execution.amount).toFixed(4)}
                </TableCell>
                <TableCell>
                  <code className="text-xs">{formatTxHash(execution.txHash)}</code>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {execution.confirmations.current}/
                        {execution.confirmations.required}
                      </span>
                      <span className="font-medium">
                        {execution.confirmations.progress}%
                      </span>
                    </div>
                    <Progress value={execution.confirmations.progress} />
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                  {execution.retryInfo && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      재시도: {execution.retryInfo.attempt}/
                      {execution.retryInfo.maxAttempts}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(execution.broadcastStartedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(execution)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canRetry && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetry(execution.id)}
                        disabled={retryingId === execution.id}
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${
                            retryingId === execution.id ? "animate-spin" : ""
                          }`}
                        />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
