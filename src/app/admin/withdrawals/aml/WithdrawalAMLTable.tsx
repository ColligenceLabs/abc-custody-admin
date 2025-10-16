// ============================================================================
// 출금 AML 검토 테이블 컴포넌트
// ============================================================================
// Task 4.2: 출금 AML 검증 시스템
// 용도: AML 검토 대기열 테이블 및 리스크 시각화
// ============================================================================

"use client";

import React from "react";
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
import {
  AlertTriangle,
  CheckCircle,
  Shield,
  Eye,
  TrendingUp,
  Ban,
} from "lucide-react";
import { WithdrawalAMLCheck, RiskLevel } from "@/types/withdrawal";

// ============================================================================
// Props 인터페이스
// ============================================================================

interface WithdrawalAMLTableProps {
  checks: WithdrawalAMLCheck[];
  isLoading?: boolean;
  onReview: (check: WithdrawalAMLCheck) => void;
}

// ============================================================================
// 헬퍼 함수
// ============================================================================

/**
 * 금액 포맷팅 (억/천만 단위)
 */
function formatAmountKRW(amount: string): string {
  const num = parseFloat(amount);
  if (num >= 100_000_000) {
    return `${(num / 100_000_000).toFixed(1)}억`;
  }
  if (num >= 10_000_000) {
    return `${(num / 10_000_000).toFixed(0)}천만`;
  }
  return `${(num / 10_000).toFixed(0)}만`;
}

/**
 * 주소 축약
 */
function shortenAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
}

/**
 * 리스크 레벨별 색상
 */
function getRiskLevelColor(level: RiskLevel): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (level) {
    case "critical":
      return {
        bg: "bg-red-100 dark:bg-red-950",
        text: "text-red-700 dark:text-red-300",
        icon: "text-red-600",
      };
    case "high":
      return {
        bg: "bg-orange-100 dark:bg-orange-950",
        text: "text-orange-700 dark:text-orange-300",
        icon: "text-orange-600",
      };
    case "medium":
      return {
        bg: "bg-yellow-100 dark:bg-yellow-950",
        text: "text-yellow-700 dark:text-yellow-300",
        icon: "text-yellow-600",
      };
    case "low":
      return {
        bg: "bg-green-100 dark:bg-green-950",
        text: "text-green-700 dark:text-green-300",
        icon: "text-green-600",
      };
  }
}

/**
 * 상태별 배지
 */
function getStatusBadge(status: string) {
  switch (status) {
    case "pending":
      return (
        <Badge variant="secondary" className="gap-1">
          <TrendingUp className="h-3 w-3" />
          대기 중
        </Badge>
      );
    case "approved":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-green-500 text-green-700 dark:text-green-300"
        >
          <CheckCircle className="h-3 w-3" />
          승인됨
        </Badge>
      );
    case "flagged":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-orange-500 text-orange-700 dark:text-orange-300"
        >
          <AlertTriangle className="h-3 w-3" />
          플래그
        </Badge>
      );
    case "rejected":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-red-500 text-red-700 dark:text-red-300"
        >
          <Ban className="h-3 w-3" />
          거부됨
        </Badge>
      );
    default:
      return <Badge>{status}</Badge>;
  }
}

// ============================================================================
// 메인 컴포넌트
// ============================================================================

export default function WithdrawalAMLTable({
  checks,
  isLoading,
  onReview,
}: WithdrawalAMLTableProps) {
  // 로딩 상태
  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>회원사</TableHead>
              <TableHead>자산</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>수신 주소</TableHead>
              <TableHead>리스크 점수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-24 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-16 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-32 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 bg-muted rounded w-full animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 bg-muted rounded w-16 animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 bg-muted rounded w-16 ml-auto animate-pulse" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // 데이터 없음
  if (checks.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">AML 검토 대기 항목 없음</h3>
        <p className="text-sm text-muted-foreground">
          현재 AML 검토가 필요한 출금 요청이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>회원사</TableHead>
            <TableHead>자산</TableHead>
            <TableHead>금액</TableHead>
            <TableHead>수신 주소</TableHead>
            <TableHead className="min-w-[200px]">리스크 점수</TableHead>
            <TableHead>플래그</TableHead>
            <TableHead>상태</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {checks.map((check) => {
            const riskColor = getRiskLevelColor(check.checks.riskLevel);
            const riskScore = check.checks.riskScore;

            return (
              <TableRow key={check.id} className="hover:bg-muted/50">
                {/* 회원사 */}
                <TableCell>
                  <div>
                    <div className="font-medium text-sm">
                      {check.memberInfo.companyName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {check.memberInfo.businessNumber}
                    </div>
                  </div>
                </TableCell>

                {/* 자산 */}
                <TableCell>
                  <Badge variant="outline">{check.withdrawal.asset}</Badge>
                </TableCell>

                {/* 금액 */}
                <TableCell>
                  <div>
                    <div className="font-mono text-sm">
                      {check.withdrawal.amount}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ₩{formatAmountKRW(check.withdrawal.amountInKRW)}
                    </div>
                  </div>
                </TableCell>

                {/* 수신 주소 */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {shortenAddress(check.withdrawal.toAddress)}
                    </code>
                    {check.flags.registeredAddressVerified ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                </TableCell>

                {/* 리스크 점수 */}
                <TableCell>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {riskScore}/100
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${riskColor.text}`}
                      >
                        {check.checks.riskLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <Progress
                      value={riskScore}
                      className={`h-2 ${riskColor.bg}`}
                    />
                    <div className="flex gap-1 text-xs">
                      {check.checks.blacklistCheck.isListed && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] py-0 px-1"
                        >
                          블랙리스트
                        </Badge>
                      )}
                      {check.checks.sanctionsCheck.isListed && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] py-0 px-1"
                        >
                          제재
                        </Badge>
                      )}
                      {check.checks.pepCheck?.isPEP && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] py-0 px-1"
                        >
                          PEP
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* 플래그 */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {check.flags.isLargeAmount && (
                      <Badge
                        variant="outline"
                        className="text-xs border-purple-500 text-purple-700 dark:text-purple-300"
                      >
                        대량
                      </Badge>
                    )}
                    {check.flags.isNewAddress && (
                      <Badge variant="outline" className="text-xs">
                        새 주소
                      </Badge>
                    )}
                    {check.flags.unusualPattern && (
                      <Badge
                        variant="outline"
                        className="text-xs border-orange-500"
                      >
                        비정상 패턴
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* 상태 */}
                <TableCell>{getStatusBadge(check.status)}</TableCell>

                {/* 작업 */}
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReview(check)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    검토
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
