/**
 * Execution & Post-Withdrawal Management Page
 *
 * 실행 및 사후 관리 페이지
 * 트랜잭션 실행 모니터링 및 출금 후 비율 체크
 */

"use client";

import { useState } from "react";
import {
  ExecutionCard,
  ExecutionTask,
  ExecutionType,
  ExecutionStatus,
} from "./components/ExecutionCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Filter,
  TrendingUp,
} from "lucide-react";

export default function ExecutionPage() {
  const [typeFilter, setTypeFilter] = useState<ExecutionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ExecutionStatus | "all">(
    "all"
  );

  // Mock 데이터
  const [tasks, setTasks] = useState<ExecutionTask[]>([
    {
      id: "EXE-WD-001",
      type: "withdrawal",
      blockchain: "BITCOIN",
      amount: "5.0 BTC",
      amountKRW: "400,000,000",
      status: "confirming",
      txHash: "bc1q9a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t",
      confirmations: 2,
      requiredConfirmations: 6,
      createdAt: new Date(Date.now() - 20 * 60000),
      broadcastedAt: new Date(Date.now() - 15 * 60000),
      estimatedTime: "30분",
      postWithdrawal: {
        hotRatio: 18.5,
        coldRatio: 81.5,
        deviation: 1.5,
        needsRebalancing: false,
      },
    },
    {
      id: "EXE-RB-001",
      type: "rebalancing",
      blockchain: "ETHEREUM",
      amount: "500 ETH",
      amountKRW: "2,500,000,000",
      status: "pending",
      txHash: "0x742d35cc6634c0532925a3b844bc9e7595f0beb",
      confirmations: 5,
      requiredConfirmations: 12,
      createdAt: new Date(Date.now() - 40 * 60000),
      broadcastedAt: new Date(Date.now() - 35 * 60000),
      estimatedTime: "15분",
    },
    {
      id: "EXE-WD-002",
      type: "withdrawal",
      blockchain: "ETHEREUM",
      amount: "50,000 USDT",
      amountKRW: "66,000,000",
      status: "completed",
      txHash: "0x9f3b7cc6634c0532925a3b844bc9e7595f0bec",
      confirmations: 12,
      requiredConfirmations: 12,
      createdAt: new Date(Date.now() - 90 * 60000),
      broadcastedAt: new Date(Date.now() - 85 * 60000),
      completedAt: new Date(Date.now() - 60 * 60000),
      postWithdrawal: {
        hotRatio: 19.2,
        coldRatio: 80.8,
        deviation: 0.8,
        needsRebalancing: false,
      },
    },
    {
      id: "EXE-WD-003",
      type: "withdrawal",
      blockchain: "SOLANA",
      amount: "10,000 SOL",
      amountKRW: "1,500,000,000",
      status: "completed",
      txHash: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
      confirmations: 32,
      requiredConfirmations: 32,
      createdAt: new Date(Date.now() - 120 * 60000),
      broadcastedAt: new Date(Date.now() - 115 * 60000),
      completedAt: new Date(Date.now() - 90 * 60000),
      postWithdrawal: {
        hotRatio: 14.5,
        coldRatio: 85.5,
        deviation: 5.5,
        needsRebalancing: true,
      },
    },
    {
      id: "EXE-RB-002",
      type: "rebalancing",
      blockchain: "BITCOIN",
      amount: "10 BTC",
      amountKRW: "800,000,000",
      status: "failed",
      confirmations: 0,
      requiredConfirmations: 6,
      createdAt: new Date(Date.now() - 150 * 60000),
    },
  ]);

  const handleViewTx = (txHash: string) => {
    // 블록체인 익스플로러로 이동
    alert(`트랜잭션 조회: ${txHash}\n블록체인 익스플로러로 이동합니다.`);
  };

  const handleRetry = (task: ExecutionTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: "broadcasting" as const, confirmations: 0 }
          : t
      )
    );
    alert(`재시도: ${task.id}\n트랜잭션을 다시 전송합니다.`);
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
    broadcasting: tasks.filter((t) => t.status === "broadcasting").length,
    pending: tasks.filter((t) => t.status === "pending").length,
    confirming: tasks.filter((t) => t.status === "confirming").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    failed: tasks.filter((t) => t.status === "failed").length,
  };

  const needsRebalancing = tasks.filter(
    (t) =>
      t.type === "withdrawal" &&
      t.status === "completed" &&
      t.postWithdrawal?.needsRebalancing
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">실행 및 사후 관리</h1>
          <p className="text-muted-foreground mt-1">
            트랜잭션 실행 모니터링 및 출금 후 비율 체크
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 리밸런싱 필요 알림 */}
      {needsRebalancing.length > 0 && (
        <Alert>
          <TrendingUp className="h-4 w-4 text-yellow-600" />
          <AlertTitle>출금 후 리밸런싱 필요</AlertTitle>
          <AlertDescription>
            {needsRebalancing.length}건의 출금 완료 후 리밸런싱이 필요합니다.
            <br />
            볼트 체크 페이지에서 리밸런싱을 시작해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-100 dark:bg-slate-900/20 border border-slate-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">전체</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">브로드캐스팅</p>
          <p className="text-2xl font-bold">{stats.broadcasting}</p>
        </div>
        <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">대기 중</p>
          <p className="text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">컨펌 중</p>
          <p className="text-2xl font-bold">{stats.confirming}</p>
        </div>
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">완료</p>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-1">실패</p>
          <p className="text-2xl font-bold">{stats.failed}</p>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-4">
        <Select
          value={typeFilter}
          onValueChange={(value) =>
            setTypeFilter(value as ExecutionType | "all")
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
            setStatusFilter(value as ExecutionStatus | "all")
          }
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="broadcasting">브로드캐스팅</SelectItem>
            <SelectItem value="pending">대기 중</SelectItem>
            <SelectItem value="confirming">컨펌 중</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="failed">실패</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 실행 작업 카드 그리드 */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5" />
          실행 작업 목록
        </h2>

        {filteredTasks.length === 0 ? (
          <div className="border rounded-lg p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">실행 작업이 없습니다</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <ExecutionCard
                key={task.id}
                task={task}
                onViewTx={handleViewTx}
                onRetry={handleRetry}
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
