// ============================================================================
// 출금 AML 검증 페이지
// ============================================================================
// Task 4.2: 출금 AML 검증 시스템
// 용도: AML 검토 대기열 관리 및 승인/거부 처리
// ============================================================================

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWithdrawalAMLQueue,
  getWithdrawalAMLStats,
  approveWithdrawalAML,
  rejectWithdrawalAML,
  flagWithdrawalAML,
} from "@/services/withdrawalApi";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  WithdrawalAMLCheck,
  WithdrawalAMLFilter,
  AMLReviewStatus,
  RiskLevel,
  AMLRejectionReason,
} from "@/types/withdrawal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Filter, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import WithdrawalAMLStats from "./WithdrawalAMLStats";
import WithdrawalAMLTable from "./WithdrawalAMLTable";
import WithdrawalAMLModal from "./WithdrawalAMLModal";

// ============================================================================
// 메인 페이지 컴포넌트
// ============================================================================

export default function WithdrawalAMLPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: admin } = useAdminAuth();
  const queryClient = useQueryClient();

  // 상태 관리
  const [selectedCheck, setSelectedCheck] = useState<WithdrawalAMLCheck | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("all");

  // 필터 객체 생성
  const filters = useMemo((): WithdrawalAMLFilter => {
    const filter: WithdrawalAMLFilter = {};

    if (statusFilter !== "all") {
      filter.status = [statusFilter as AMLReviewStatus];
    }

    if (riskLevelFilter !== "all") {
      filter.riskLevel = [riskLevelFilter as RiskLevel];
    }

    if (searchTerm.trim()) {
      filter.searchTerm = searchTerm.trim();
    }

    return filter;
  }, [statusFilter, riskLevelFilter, searchTerm]);

  // React Query: AML 검토 대기열
  const {
    data: checks = [],
    isLoading: isLoadingChecks,
    refetch: refetchChecks,
  } = useQuery({
    queryKey: ["withdrawalAMLQueue", filters],
    queryFn: () => getWithdrawalAMLQueue(filters),
  });

  // React Query: AML 통계
  const {
    data: stats,
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["withdrawalAMLStats"],
    queryFn: getWithdrawalAMLStats,
  });

  // Mutation: AML 승인
  const approveMutation = useMutation({
    mutationFn: (data: { checkId: string; reviewNotes: string }) =>
      approveWithdrawalAML(
        { checkId: data.checkId, reviewNotes: data.reviewNotes },
        admin?.id || "",
        admin?.name || "",
        admin?.email || ""
      ),
    onSuccess: () => {
      toast({
        title: "승인 완료",
        description: "AML 검토가 승인되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAMLQueue"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAMLStats"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalQueue"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "승인 실패",
        description: `${error}`,
      });
    },
  });

  // Mutation: AML 거부
  const rejectMutation = useMutation({
    mutationFn: (data: {
      checkId: string;
      reason: AMLRejectionReason;
      details: string;
      reviewNotes: string;
    }) =>
      rejectWithdrawalAML(
        {
          checkId: data.checkId,
          reason: data.reason,
          details: data.details,
          reviewNotes: data.reviewNotes,
        },
        admin?.id || "",
        admin?.name || "",
        admin?.email || ""
      ),
    onSuccess: () => {
      toast({
        title: "거부 완료",
        description: "AML 검토가 거부되었습니다.",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAMLQueue"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAMLStats"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalQueue"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "거부 실패",
        description: `${error}`,
      });
    },
  });

  // Mutation: AML 플래그
  const flagMutation = useMutation({
    mutationFn: (data: {
      checkId: string;
      reason: string;
      reviewNotes: string;
    }) =>
      flagWithdrawalAML(
        {
          checkId: data.checkId,
          reason: data.reason,
          reviewNotes: data.reviewNotes,
        },
        admin?.id || "",
        admin?.name || "",
        admin?.email || ""
      ),
    onSuccess: () => {
      toast({
        title: "플래그 완료",
        description: "AML 검토에 플래그가 추가되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAMLQueue"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalAMLStats"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "플래그 실패",
        description: `${error}`,
      });
    },
  });

  // 검토 버튼 클릭 핸들러
  const handleReview = (check: WithdrawalAMLCheck) => {
    setSelectedCheck(check);
    setIsModalOpen(true);
  };

  // 승인 핸들러
  const handleApprove = async (checkId: string, reviewNotes: string) => {
    await approveMutation.mutateAsync({ checkId, reviewNotes });
  };

  // 거부 핸들러
  const handleReject = async (
    checkId: string,
    reason: AMLRejectionReason,
    details: string,
    reviewNotes: string
  ) => {
    await rejectMutation.mutateAsync({
      checkId,
      reason,
      details,
      reviewNotes,
    });
  };

  // 플래그 핸들러
  const handleFlag = async (
    checkId: string,
    reason: string,
    reviewNotes: string
  ) => {
    await flagMutation.mutateAsync({ checkId, reason, reviewNotes });
  };

  // 새로고침 핸들러
  const handleRefresh = () => {
    refetchChecks();
    refetchStats();
    toast({
      title: "새로고침 완료",
      description: "AML 검토 대기열이 업데이트되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/withdrawals/queue")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">출금 AML 검증</h1>
            <p className="text-sm text-muted-foreground mt-1">
              자금세탁방지 검토 대기열 및 승인/거부 처리
            </p>
          </div>
        </div>

        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드 */}
      <WithdrawalAMLStats
        stats={
          stats || {
            pending: { count: 0, totalAmount: "0" },
            approved: { count: 0, totalAmount: "0" },
            flagged: { count: 0, totalAmount: "0" },
            rejected: { count: 0, totalAmount: "0" },
            averageRiskScore: 0,
            highRiskCount: 0,
            largeAmountCount: 0,
          }
        }
        isLoading={isLoadingStats}
      />

      {/* 필터 및 검색 */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 상태 필터 */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 상태</SelectItem>
              <SelectItem value="pending">대기 중</SelectItem>
              <SelectItem value="approved">승인됨</SelectItem>
              <SelectItem value="flagged">플래그됨</SelectItem>
              <SelectItem value="rejected">거부됨</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 리스크 수준 필터 */}
        <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="리스크 수준" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 리스크</SelectItem>
            <SelectItem value="low">낮음</SelectItem>
            <SelectItem value="medium">중간</SelectItem>
            <SelectItem value="high">높음</SelectItem>
            <SelectItem value="critical">매우 높음</SelectItem>
          </SelectContent>
        </Select>

        {/* 검색 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="회원사명, 주소, TxHash 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 필터 초기화 */}
        {(statusFilter !== "all" ||
          riskLevelFilter !== "all" ||
          searchTerm) && (
          <Button
            variant="ghost"
            onClick={() => {
              setStatusFilter("all");
              setRiskLevelFilter("all");
              setSearchTerm("");
            }}
          >
            초기화
          </Button>
        )}
      </div>

      {/* 필터 적용 카운트 */}
      {(statusFilter !== "all" ||
        riskLevelFilter !== "all" ||
        searchTerm) && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {checks.length}건의 결과
          </Badge>
          {statusFilter !== "all" && (
            <Badge variant="outline">상태: {statusFilter}</Badge>
          )}
          {riskLevelFilter !== "all" && (
            <Badge variant="outline">리스크: {riskLevelFilter}</Badge>
          )}
          {searchTerm && <Badge variant="outline">검색: {searchTerm}</Badge>}
        </div>
      )}

      {/* AML 검토 테이블 */}
      <WithdrawalAMLTable
        checks={checks}
        isLoading={isLoadingChecks}
        onReview={handleReview}
      />

      {/* 상세 검토 모달 */}
      <WithdrawalAMLModal
        check={selectedCheck}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCheck(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
        onFlag={handleFlag}
      />
    </div>
  );
}
