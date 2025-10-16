/**
 * ExecutionCard Component
 *
 * 트랜잭션 실행 모니터링 카드
 * 출금 및 리밸런싱 실행 상태 추적
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

export type ExecutionType = "withdrawal" | "rebalancing";
export type ExecutionStatus =
  | "broadcasting"
  | "pending"
  | "confirming"
  | "completed"
  | "failed";

export interface ExecutionTask {
  id: string;
  type: ExecutionType;
  blockchain: string;
  amount: string;
  amountKRW: string;
  status: ExecutionStatus;
  txHash?: string;
  confirmations: number;
  requiredConfirmations: number;
  createdAt: Date;
  broadcastedAt?: Date;
  completedAt?: Date;
  estimatedTime?: string;

  // 출금 후 비율 체크 (출금인 경우)
  postWithdrawal?: {
    hotRatio: number;
    coldRatio: number;
    deviation: number;
    needsRebalancing: boolean;
  };
}

interface ExecutionCardProps {
  task: ExecutionTask;
  onViewTx: (txHash: string) => void;
  onRetry: (task: ExecutionTask) => void;
}

export function ExecutionCard({ task, onViewTx, onRetry }: ExecutionCardProps) {
  const getTypeLabel = (type: ExecutionType) => {
    return type === "withdrawal" ? "출금" : "리밸런싱";
  };

  const getTypeBadgeColor = (type: ExecutionType) => {
    return type === "withdrawal"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200";
  };

  const getStatusBadge = (status: ExecutionStatus) => {
    const variants: Record<
      ExecutionStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        color: string;
      }
    > = {
      broadcasting: {
        variant: "outline",
        label: "브로드캐스팅",
        color: "text-blue-600"
      },
      pending: {
        variant: "secondary",
        label: "대기 중",
        color: "text-yellow-600"
      },
      confirming: {
        variant: "outline",
        label: "컨펌 중",
        color: "text-blue-600"
      },
      completed: {
        variant: "default",
        label: "완료",
        color: "text-green-600"
      },
      failed: {
        variant: "destructive",
        label: "실패",
        color: "text-red-600"
      },
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const confirmationProgress = (task.confirmations / task.requiredConfirmations) * 100;

  const getElapsedTime = () => {
    if (!task.broadcastedAt) return "대기 중";
    const now = new Date();
    const diffMs = now.getTime() - task.broadcastedAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    if (diffMins === 0) return `${diffSecs}초`;
    return `${diffMins}분 ${diffSecs}초`;
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        task.status === "failed" ? "border-red-500 border-2" : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="text-base">{task.id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getTypeBadgeColor(task.type)}>
              {getTypeLabel(task.type)}
            </Badge>
            {getStatusBadge(task.status)}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">블록체인</p>
            <p className="font-semibold">{task.blockchain}</p>
          </div>
          <div>
            <p className="text-muted-foreground">경과 시간</p>
            <p className="font-mono text-sm">{getElapsedTime()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">금액</p>
            <p className="font-mono font-semibold">{task.amount}</p>
          </div>
          <div>
            <p className="text-muted-foreground">KRW 환산</p>
            <p className="font-mono text-sm">{task.amountKRW} 원</p>
          </div>
        </div>

        {/* 트랜잭션 해시 */}
        {task.txHash && (
          <div className="pt-2 border-t">
            <p className="text-muted-foreground text-xs mb-1">트랜잭션 해시</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs truncate flex-1">{task.txHash}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewTx(task.txHash!)}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* 컨펌 진행률 */}
        {(task.status === "pending" || task.status === "confirming") && (
          <div className="space-y-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">컨펌 진행률</span>
              <span className="font-semibold">
                {task.confirmations} / {task.requiredConfirmations}
              </span>
            </div>
            <Progress value={confirmationProgress} className="h-2" />
            {task.estimatedTime && (
              <p className="text-xs text-muted-foreground">
                예상 완료: 약 {task.estimatedTime}
              </p>
            )}
          </div>
        )}

        {/* 출금 후 비율 체크 */}
        {task.type === "withdrawal" && task.postWithdrawal && (
          <div className="pt-3 border-t space-y-2">
            <h4 className="text-sm font-semibold">출금 후 볼트 상태</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground text-xs">Hot 비율</p>
                <p className="font-semibold">
                  {task.postWithdrawal.hotRatio.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Cold 비율</p>
                <p className="font-semibold">
                  {task.postWithdrawal.coldRatio.toFixed(1)}%
                </p>
              </div>
            </div>
            {task.postWithdrawal.needsRebalancing ? (
              <div className="flex items-center gap-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded">
                <AlertTriangle className="w-3 h-3" />
                <span>
                  리밸런싱 필요 (편차: {task.postWithdrawal.deviation.toFixed(1)}%)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 p-2 rounded">
                <CheckCircle className="w-3 h-3" />
                <span>정상 범위 유지</span>
              </div>
            )}
          </div>
        )}

        {/* 상태별 메시지 및 액션 */}
        <div className="pt-3 border-t">
          {task.status === "broadcasting" && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>블록체인 네트워크에 전송 중...</span>
            </div>
          )}

          {task.status === "pending" && (
            <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
              <Clock className="w-4 h-4" />
              <span>트랜잭션 풀 대기 중...</span>
            </div>
          )}

          {task.status === "confirming" && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>블록 컨펌 대기 중... ({task.confirmations}/{task.requiredConfirmations})</span>
            </div>
          )}

          {task.status === "completed" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span className="font-semibold">실행 완료</span>
              </div>
              {task.completedAt && (
                <p className="text-xs text-muted-foreground">
                  완료 시각: {task.completedAt.toLocaleString("ko-KR")}
                </p>
              )}
            </div>
          )}

          {task.status === "failed" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-semibold">실행 실패</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onRetry(task)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                재시도
              </Button>
            </div>
          )}
        </div>

        {/* 생성 시각 */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          생성: {task.createdAt.toLocaleString("ko-KR")}
        </div>
      </CardContent>
    </Card>
  );
}
