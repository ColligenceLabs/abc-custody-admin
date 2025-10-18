/**
 * RequestTableRow Component
 *
 * 출금 요청 테이블의 개별 행 컴포넌트
 * withdrawal_wait 상태일 때 실시간 카운트다운 표시
 */

import { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  WithdrawalV2Request,
  WithdrawalStatus,
} from "@/types/withdrawalV2";
import { Eye } from "lucide-react";
import { formatAmount } from "@/lib/format";

interface RequestTableRowProps {
  request: WithdrawalV2Request;
  onView: (request: WithdrawalV2Request) => void;
}

export function RequestTableRow({ request, onView }: RequestTableRowProps) {
  const [remainingTime, setRemainingTime] = useState<string>("");

  // 남은 시간 계산 함수
  const calculateRemainingTime = (scheduledAt: string) => {
    const scheduledTime = new Date(scheduledAt);
    const now = new Date();
    const diffMs = scheduledTime.getTime() - now.getTime();

    if (diffMs > 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      if (diffHours >= 24) {
        return "24시간";
      } else if (diffHours > 0) {
        return `${diffHours}시간 ${diffMinutes}분 ${diffSeconds}초`;
      } else if (diffMinutes > 0) {
        return `${diffMinutes}분 ${diffSeconds}초`;
      } else {
        return `${diffSeconds}초`;
      }
    }
    return "처리 대기 중...";
  };

  // 실시간 카운트다운 업데이트
  useEffect(() => {
    // 개인 회원이고 processingScheduledAt이 있으면 카운트다운 표시
    if (
      request.memberType === "individual" &&
      request.processingScheduledAt
    ) {
      // 초기 시간 설정
      setRemainingTime(calculateRemainingTime(request.processingScheduledAt));

      // 1초마다 업데이트
      const interval = setInterval(() => {
        const newTime = calculateRemainingTime(request.processingScheduledAt!);
        setRemainingTime(newTime);

        // 시간이 다 되면 interval 정리
        if (newTime === "처리 대기 중...") {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [request]);

  const getStatusBadge = (status: WithdrawalStatus) => {
    const variants: Record<
      WithdrawalStatus,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        className?: string;
      }
    > = {
      withdrawal_wait: {
        variant: "secondary",
        label: remainingTime ? `출금 대기 (${remainingTime})` : "출금 대기",
        className:
          "bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-200",
      },
      aml_review: {
        variant: "secondary",
        label: "AML 검토 중",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200",
      },
      aml_issue: { variant: "destructive", label: "AML 문제" },
      processing: {
        variant: "outline",
        label: "출금처리대기",
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200",
      },
      withdrawal_pending: {
        variant: "outline",
        label: "출금처리중",
        className:
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-200",
      },
      transferring: {
        variant: "outline",
        label: "출금중",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
      },
      success: { variant: "default", label: "완료", className: "bg-green-600" },
      admin_rejected: { variant: "destructive", label: "관리자거부" },
      failed: { variant: "destructive", label: "실패" },
    };

    const config = variants[status] || {
      variant: "outline" as const,
      label: status,
      className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200",
    };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
        className?: string;
      }
    > = {
      urgent: {
        variant: "destructive",
        label: "긴급",
        className: "bg-red-600 text-white",
      },
      normal: {
        variant: "default",
        label: "보통",
        className: "bg-blue-600 text-white",
      },
      low: {
        variant: "secondary",
        label: "낮음",
        className: "bg-gray-400 text-white dark:bg-gray-600",
      },
    };

    const config = variants[priority] || variants.normal;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getBlockchainBadge = (blockchain: string) => {
    const colors: Record<string, string> = {
      BITCOIN:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200",
      ETHEREUM:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200",
      SOLANA:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-200",
    };

    const labels: Record<string, string> = {
      BITCOIN: "Bitcoin",
      ETHEREUM: "Ethereum",
      SOLANA: "Solana",
    };

    return (
      <Badge variant="outline" className={colors[blockchain]}>
        {labels[blockchain]}
      </Badge>
    );
  };

  const getMemberTypeBadge = (memberType: "individual" | "corporate") => {
    if (memberType === "individual") {
      return (
        <Badge
          variant="outline"
          className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
        >
          개인
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
      >
        기업
      </Badge>
    );
  };

  return (
    <TableRow className="hover:bg-muted/50">
      <TableCell className="font-mono text-xs">{request.id}</TableCell>
      <TableCell>{getMemberTypeBadge(request.memberType)}</TableCell>
      <TableCell className="font-medium">{request.memberName}</TableCell>
      <TableCell>
        <span className="font-semibold">{request.asset}</span>
      </TableCell>
      <TableCell className="font-mono">{formatAmount(request.amount)}</TableCell>
      <TableCell>{getBlockchainBadge(request.blockchain)}</TableCell>
      <TableCell>{getPriorityBadge(request.priority)}</TableCell>
      <TableCell>{getStatusBadge(request.status)}</TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {request.createdAt.toLocaleString("ko-KR")}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={() => onView(request)}>
          <Eye className="w-4 h-4 mr-1" />
          상세 보기
        </Button>
      </TableCell>
    </TableRow>
  );
}
