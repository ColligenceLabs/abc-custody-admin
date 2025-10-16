/**
 * SigningTaskCard Component
 *
 * Air-gap 서명 작업 카드
 * 출금 및 리밸런싱 서명 작업을 통합 표시
 */

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileSignature,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";

export type SigningTaskType = "withdrawal" | "rebalancing";
export type SigningTaskStatus = "pending" | "in_progress" | "completed" | "expired";

export interface SigningTask {
  id: string;
  type: SigningTaskType;
  blockchain: string;
  amount: string;
  amountKRW: string;
  status: SigningTaskStatus;
  priority: "urgent" | "high" | "normal" | "low";
  createdAt: Date;
  expiresAt: Date;
  signaturesRequired: number;
  signaturesCompleted: number;
  qrCodeData?: string;
  rawTransaction?: string;
}

interface SigningTaskCardProps {
  task: SigningTask;
  onDownloadQR: (task: SigningTask) => void;
  onUploadSignature: (task: SigningTask) => void;
  onComplete: (task: SigningTask) => void;
}

export function SigningTaskCard({
  task,
  onDownloadQR,
  onUploadSignature,
  onComplete,
}: SigningTaskCardProps) {
  const getTypeLabel = (type: SigningTaskType) => {
    return type === "withdrawal" ? "출금" : "리밸런싱";
  };

  const getTypeBadgeColor = (type: SigningTaskType) => {
    return type === "withdrawal"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200";
  };

  const getStatusBadge = (status: SigningTaskStatus) => {
    const variants: Record<
      SigningTaskStatus,
      { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
    > = {
      pending: { variant: "secondary", label: "대기 중" },
      in_progress: { variant: "outline", label: "진행 중" },
      completed: { variant: "default", label: "완료" },
      expired: { variant: "destructive", label: "만료" },
    };

    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
      normal: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-200",
      low: "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-200",
    };

    const labels: Record<string, string> = {
      urgent: "긴급",
      high: "높음",
      normal: "보통",
      low: "낮음",
    };

    return (
      <Badge variant="outline" className={colors[priority]}>
        {labels[priority]}
      </Badge>
    );
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const diffMs = task.expiresAt.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMs < 0) return "만료됨";
    if (diffHours < 1) return `${diffMins}분 남음`;
    if (diffHours < 24) return `${diffHours}시간 남음`;
    return `${Math.floor(diffHours / 24)}일 남음`;
  };

  const signatureProgress =
    (task.signaturesCompleted / task.signaturesRequired) * 100;

  const isExpiringSoon = () => {
    const now = new Date();
    const diffMs = task.expiresAt.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 2 && diffHours > 0;
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        task.status === "expired"
          ? "opacity-60 border-red-500"
          : isExpiringSoon()
          ? "border-yellow-500 border-2"
          : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
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
            <p className="text-muted-foreground">우선순위</p>
            {getPriorityBadge(task.priority)}
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

        {/* 서명 진행률 */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">서명 진행률</span>
            <span className="font-semibold">
              {task.signaturesCompleted} / {task.signaturesRequired}
            </span>
          </div>
          <Progress value={signatureProgress} className="h-2" />
        </div>

        {/* 만료 시간 */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>만료까지</span>
            </div>
            <span
              className={`font-semibold ${
                isExpiringSoon()
                  ? "text-yellow-600 dark:text-yellow-400"
                  : task.status === "expired"
                  ? "text-red-600 dark:text-red-400"
                  : ""
              }`}
            >
              {getTimeRemaining()}
            </span>
          </div>
          {isExpiringSoon() && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              <AlertTriangle className="w-3 h-3" />
              <span>곧 만료됩니다</span>
            </div>
          )}
        </div>

        {/* 작업 버튼 */}
        <div className="pt-3 border-t space-y-2">
          {task.status === "pending" && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onDownloadQR(task)}
              >
                <Download className="w-4 h-4 mr-2" />
                QR 코드 다운로드
              </Button>
              <Button
                variant="default"
                className="w-full"
                onClick={() => onUploadSignature(task)}
              >
                <Upload className="w-4 h-4 mr-2" />
                서명 업로드
              </Button>
            </>
          )}

          {task.status === "in_progress" && (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => onUploadSignature(task)}
              >
                <Upload className="w-4 h-4 mr-2" />
                추가 서명 업로드 ({task.signaturesCompleted}/
                {task.signaturesRequired})
              </Button>
              {task.signaturesCompleted === task.signaturesRequired && (
                <Button
                  variant="default"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onComplete(task)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  서명 완료 처리
                </Button>
              )}
            </>
          )}

          {task.status === "completed" && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 py-2">
              <CheckCircle className="w-4 h-4" />
              <span className="font-semibold">서명 완료</span>
            </div>
          )}

          {task.status === "expired" && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400 py-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">만료됨 - 재생성 필요</span>
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
