/**
 * Unified Signing Center Page
 *
 * 통합 서명 센터
 * 출금 및 리밸런싱 Air-gap 서명 통합 관리
 */

"use client";

import { useState } from "react";
import {
  SigningTaskCard,
  SigningTask,
  SigningTaskType,
  SigningTaskStatus,
} from "./components/SigningTaskCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileSignature,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
} from "lucide-react";

export default function SigningCenterPage() {
  const [typeFilter, setTypeFilter] = useState<SigningTaskType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SigningTaskStatus | "all">(
    "all"
  );

  // Mock 데이터
  const [tasks, setTasks] = useState<SigningTask[]>([
    {
      id: "SIG-WD-001",
      type: "withdrawal",
      blockchain: "BITCOIN",
      amount: "5.0 BTC",
      amountKRW: "400,000,000",
      status: "pending",
      priority: "urgent",
      createdAt: new Date(Date.now() - 10 * 60000),
      expiresAt: new Date(Date.now() + 50 * 60000), // 50분 후
      signaturesRequired: 3,
      signaturesCompleted: 0,
    },
    {
      id: "SIG-RB-001",
      type: "rebalancing",
      blockchain: "ETHEREUM",
      amount: "500 ETH",
      amountKRW: "2,500,000,000",
      status: "in_progress",
      priority: "high",
      createdAt: new Date(Date.now() - 30 * 60000),
      expiresAt: new Date(Date.now() + 90 * 60000), // 90분 후
      signaturesRequired: 3,
      signaturesCompleted: 2,
    },
    {
      id: "SIG-WD-002",
      type: "withdrawal",
      blockchain: "ETHEREUM",
      amount: "50,000 USDT",
      amountKRW: "66,000,000",
      status: "in_progress",
      priority: "normal",
      createdAt: new Date(Date.now() - 60 * 60000),
      expiresAt: new Date(Date.now() + 60 * 60000),
      signaturesRequired: 3,
      signaturesCompleted: 3,
    },
    {
      id: "SIG-RB-002",
      type: "rebalancing",
      blockchain: "SOLANA",
      amount: "10,000 SOL",
      amountKRW: "1,500,000,000",
      status: "completed",
      priority: "normal",
      createdAt: new Date(Date.now() - 120 * 60000),
      expiresAt: new Date(Date.now() + 60 * 60000),
      signaturesRequired: 3,
      signaturesCompleted: 3,
    },
    {
      id: "SIG-WD-003",
      type: "withdrawal",
      blockchain: "BITCOIN",
      amount: "2.5 BTC",
      amountKRW: "200,000,000",
      status: "expired",
      priority: "low",
      createdAt: new Date(Date.now() - 180 * 60000),
      expiresAt: new Date(Date.now() - 10 * 60000), // 10분 전 만료
      signaturesRequired: 3,
      signaturesCompleted: 1,
    },
  ]);

  const handleDownloadQR = (task: SigningTask) => {
    alert(`QR 코드 다운로드: ${task.id}\n블록체인: ${task.blockchain}`);
  };

  const handleUploadSignature = (task: SigningTask) => {
    // Mock: 서명 추가
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              signaturesCompleted: Math.min(
                t.signaturesCompleted + 1,
                t.signaturesRequired
              ),
              status:
                t.signaturesCompleted + 1 >= t.signaturesRequired
                  ? ("in_progress" as const)
                  : t.status,
            }
          : t
      )
    );
    alert(`서명 업로드: ${task.id}\n현재 ${task.signaturesCompleted + 1}/${task.signaturesRequired}`);
  };

  const handleComplete = (task: SigningTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: "completed" as const } : t
      )
    );
    alert(`서명 완료: ${task.id}\n트랜잭션을 블록체인에 제출합니다.`);
  };

  // 필터링된 작업 목록
  const filteredTasks = tasks.filter((task) => {
    const matchesType = typeFilter === "all" || task.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    return matchesType && matchesStatus;
  });

  // 통계 계산
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    expired: tasks.filter((t) => t.status === "expired").length,
    withdrawal: tasks.filter((t) => t.type === "withdrawal").length,
    rebalancing: tasks.filter((t) => t.type === "rebalancing").length,
  };

  const urgentTasks = tasks.filter(
    (t) => t.priority === "urgent" && t.status !== "completed"
  );
  const expiringSoon = tasks.filter((t) => {
    const diffMs = t.expiresAt.getTime() - new Date().getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 2 && diffHours > 0 && t.status !== "completed";
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">통합 서명 센터</h1>
          <p className="text-muted-foreground mt-1">
            출금 및 리밸런싱 Air-gap 서명 관리
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            일괄 다운로드
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            새로고침
          </Button>
        </div>
      </div>

      {/* 긴급 알림 */}
      {urgentTasks.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>긴급 서명 대기</AlertTitle>
          <AlertDescription>
            {urgentTasks.length}건의 긴급 서명 작업이 대기 중입니다.
          </AlertDescription>
        </Alert>
      )}

      {expiringSoon.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>만료 임박</AlertTitle>
          <AlertDescription>
            {expiringSoon.length}건의 서명 작업이 2시간 내에 만료됩니다.
          </AlertDescription>
        </Alert>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-slate-100 dark:bg-slate-900/20 border border-slate-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">전체</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">대기 중</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">진행 중</p>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">완료</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">만료</p>
          <p className="text-2xl font-bold">{stats.expired}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">출금</p>
          <p className="text-2xl font-bold">{stats.withdrawal}</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">리밸런싱</p>
          <p className="text-2xl font-bold">{stats.rebalancing}</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-4">
        <Select
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as SigningTaskType | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="타입 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 타입</SelectItem>
            <SelectItem value="withdrawal">출금</SelectItem>
            <SelectItem value="rebalancing">리밸런싱</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value) =>
            setStatusFilter(value as SigningTaskStatus | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="pending">대기 중</SelectItem>
            <SelectItem value="in_progress">진행 중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="expired">만료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 서명 작업 카드 그리드 */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileSignature className="w-5 h-5" />
          서명 작업 목록
        </h2>

        {filteredTasks.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">서명 작업이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <SigningTaskCard
                key={task.id}
                task={task}
                onDownloadQR={handleDownloadQR}
                onUploadSignature={handleUploadSignature}
                onComplete={handleComplete}
              />
            ))}
          </div>
        )}
      </div>

      {/* 결과 요약 */}
      <div className="text-sm text-muted-foreground text-center">
        전체 {tasks.length}건 중 {filteredTasks.length}건 표시
      </div>
    </div>
  );
}
