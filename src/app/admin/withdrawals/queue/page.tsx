"use client";

// ============================================================================
// 출금 대기열 관리 페이지
// ============================================================================
// Task 4.1: 출금 요청 처리 시스템
// 경로: /admin/withdrawals/queue
// ============================================================================

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Withdrawal,
  WithdrawalStatus,
  WithdrawalPriority,
  WithdrawalQueueFilter,
  WithdrawalStatistics,
} from "@/types/withdrawal";
import {
  getWithdrawalQueue,
  initializeMockWithdrawals,
} from "@/services/withdrawalApi";
import {
  Clock,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Shield,
  TrendingUp,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import WithdrawalDetailModal from "./WithdrawalDetailModal";
import { getStatusText } from "@/lib/withdrawalStatusUtils";

// ============================================================================
// 출금 대기열 페이지 컴포넌트
// ============================================================================

export default function WithdrawalQueuePage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [statistics, setStatistics] = useState<WithdrawalStatistics | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<WithdrawalPriority[]>(
    []
  );
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 데이터 로드
  useEffect(() => {
    initializeMockWithdrawals();
    loadWithdrawals();
  }, []);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const filters: WithdrawalQueueFilter = {
        status: statusFilter.length > 0 ? statusFilter : undefined,
        priority: priorityFilter.length > 0 ? priorityFilter : undefined,
        searchTerm: searchTerm || undefined,
      };

      const response = await getWithdrawalQueue(filters);
      setWithdrawals(response.withdrawals);
      setStatistics(response.statistics);
    } catch (error) {
      console.error("Failed to load withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  // 필터 변경 시 재로드
  useEffect(() => {
    loadWithdrawals();
  }, [statusFilter, priorityFilter, searchTerm]);

  // 자동 새로고침 (30초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      loadWithdrawals();
    }, 30000); // 30초

    return () => clearInterval(interval); // 컴포넌트 언마운트 시 정리
  }, [statusFilter, priorityFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">출금 대기열</h1>
        <p className="text-muted-foreground mt-2">
          출금 요청을 모니터링하고 승인/거부를 처리합니다
        </p>
      </div>

      {/* 통계 카드 */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">대기 중</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.pending.count}건
              </div>
              <p className="text-xs text-muted-foreground">
                ₩
                {parseFloat(statistics.pending.totalAmount).toLocaleString(
                  "ko-KR",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AML 검토</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.amlReview.count}건
              </div>
              <p className="text-xs text-muted-foreground">
                ₩
                {parseFloat(statistics.amlReview.totalAmount).toLocaleString(
                  "ko-KR",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">서명 대기</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.approved.count}건
              </div>
              <p className="text-xs text-muted-foreground">
                ₩
                {parseFloat(statistics.approved.totalAmount).toLocaleString(
                  "ko-KR",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">오늘 완료</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.completedToday.count}건
              </div>
              <p className="text-xs text-muted-foreground">
                ₩
                {parseFloat(
                  statistics.completedToday.totalAmount
                ).toLocaleString("ko-KR", {
                  maximumFractionDigits: 0,
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 필터 및 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            필터 및 검색
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 검색 */}
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="회원사명 또는 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* 상태 필터 */}
          <div>
            <p className="text-sm font-medium mb-2">상태</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "pending" as const, label: "대기", color: "yellow" },
                {
                  value: "aml_review" as const,
                  label: "AML 검토",
                  color: "blue",
                },
                { value: "processing" as const, label: "출금처리대기", color: "indigo" },
                { value: "withdrawal_pending" as const, label: "출금대기중", color: "purple" },
                { value: "approved" as const, label: "승인", color: "green" },
                { value: "signing" as const, label: "서명 중", color: "purple" },
                { value: "confirmed" as const, label: "완료", color: "gray" },
              ].map(({ value, label, color }) => (
                <Badge
                  key={value}
                  variant={
                    statusFilter.includes(value) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    setStatusFilter((prev) =>
                      prev.includes(value)
                        ? prev.filter((s) => s !== value)
                        : [...prev, value]
                    );
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 우선순위 필터 */}
          <div>
            <p className="text-sm font-medium mb-2">우선순위</p>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "urgent" as const, label: "긴급", color: "red" },
                { value: "normal" as const, label: "일반", color: "blue" },
                { value: "low" as const, label: "낮음", color: "gray" },
              ].map(({ value, label, color }) => (
                <Badge
                  key={value}
                  variant={
                    priorityFilter.includes(value) ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    setPriorityFilter((prev) =>
                      prev.includes(value)
                        ? prev.filter((p) => p !== value)
                        : [...prev, value]
                    );
                  }}
                >
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          {/* 필터 초기화 */}
          {(statusFilter.length > 0 || priorityFilter.length > 0) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter([]);
                setPriorityFilter([]);
              }}
            >
              필터 초기화
            </Button>
          )}
        </CardContent>
      </Card>

      {/* 출금 대기열 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>출금 대기열 ({withdrawals.length}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              출금 요청이 없습니다
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>우선순위</TableHead>
                    <TableHead>회원사</TableHead>
                    <TableHead>자산</TableHead>
                    <TableHead className="text-right">금액</TableHead>
                    <TableHead>수신 주소</TableHead>
                    <TableHead>주소 검증</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">대기 시간</TableHead>
                    <TableHead>액션</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      {/* 우선순위 */}
                      <TableCell>
                        <Badge
                          variant={
                            withdrawal.priority === "urgent"
                              ? "destructive"
                              : withdrawal.priority === "normal"
                              ? "default"
                              : "outline"
                          }
                        >
                          {withdrawal.priority === "urgent"
                            ? "긴급"
                            : withdrawal.priority === "normal"
                            ? "일반"
                            : "낮음"}
                        </Badge>
                      </TableCell>

                      {/* 회원사 */}
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {withdrawal.memberInfo.companyName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {withdrawal.memberInfo.businessNumber}
                          </p>
                        </div>
                      </TableCell>

                      {/* 자산 */}
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {withdrawal.assetSymbol}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {withdrawal.network}
                          </p>
                        </div>
                      </TableCell>

                      {/* 금액 */}
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">
                            ₩
                            {parseFloat(withdrawal.amount).toLocaleString(
                              "ko-KR",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            수수료: ₩
                            {parseFloat(withdrawal.networkFee).toLocaleString(
                              "ko-KR",
                              {
                                maximumFractionDigits: 0,
                              }
                            )}
                          </p>
                        </div>
                      </TableCell>

                      {/* 수신 주소 */}
                      <TableCell>
                        <p className="font-mono text-xs">
                          {withdrawal.toAddress.slice(0, 10)}...
                          {withdrawal.toAddress.slice(-8)}
                        </p>
                      </TableCell>

                      {/* 주소 검증 */}
                      <TableCell>
                        {withdrawal.addressVerification.status ===
                        "verified" ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs">검증됨</span>
                          </div>
                        ) : withdrawal.addressVerification.status ===
                          "unregistered" ? (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs">미등록</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <XCircle className="h-4 w-4" />
                            <span className="text-xs">차단</span>
                          </div>
                        )}
                      </TableCell>

                      {/* 상태 */}
                      <TableCell>
                        <Badge
                          variant={
                            withdrawal.status === "confirmed"
                              ? "default"
                              : withdrawal.status === "rejected"
                              ? "destructive"
                              : withdrawal.status === "withdrawal_stopped"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {getStatusText(withdrawal.status)}
                        </Badge>
                      </TableCell>

                      {/* 대기 시간 */}
                      <TableCell className="text-right">
                        <div>
                          <p className="font-medium">
                            {withdrawal.waitingTimeMinutes}분
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              withdrawal.requestedAt
                            ).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </TableCell>

                      {/* 액션 */}
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setIsModalOpen(true);
                          }}
                        >
                          상세
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 출금 상세 모달 */}
      <WithdrawalDetailModal
        withdrawal={selectedWithdrawal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedWithdrawal(null);
        }}
        onSuccess={() => {
          // 모달에서 AML 검증 완료 후 데이터 새로고침
          loadWithdrawals();
        }}
      />
    </div>
  );
}
