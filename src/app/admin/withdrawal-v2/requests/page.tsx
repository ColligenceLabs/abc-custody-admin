/**
 * Withdrawal Requests Management Page (V2 - Redesigned)
 *
 * 출금 요청 관리 페이지 (개선된 7-상태 모델)
 * Hot/Cold 지갑 선택 기능 통합
 */

"use client";

import { useState } from "react";
import { RequestTable } from "./components/RequestTable";
import { RequestDetailModal } from "./components/RequestDetailModal";
import {
  AssetWalletRatioSection,
  DEFAULT_ASSETS_DATA,
} from "./components/AssetWalletRatioSection";
import { PendingWithdrawalAssetsSection } from "./components/PendingWithdrawalAssetsSection";
import { WithdrawalV2Request } from "@/types/withdrawalV2";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { withdrawalV2Api } from "@/services/withdrawalV2Api";

export default function WithdrawalRequestsPage() {
  const [selectedRequest, setSelectedRequest] =
    useState<WithdrawalV2Request | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock 데이터 (개선된 7-상태 모델)
  // 요청 ID가 클수록 최신 (WD-2025-007 > WD-2025-001)
  // 최신 순으로 정렬 (내림차순)
  const [requests, setRequests] = useState<WithdrawalV2Request[]>([
    {
      id: "WD-2025-010",
      memberId: "member-010",
      memberName: "최민지",
      memberType: "individual",
      amount: "1500.0",
      asset: "SOL",
      blockchain: "SOLANA",
      network: "mainnet",
      toAddress: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
      status: "approval_waiting",
      priority: "normal",
      createdAt: new Date(Date.now() - 1 * 60000),
      updatedAt: new Date(Date.now() - 1 * 60000),
      amlReview: {
        reviewId: "AML-WD-2025-010",
        status: "passed",
        riskLevel: "low",
        riskScore: 20,
        reviewedAt: new Date(Date.now() - 1 * 60000),
        notes: "Automated AML review passed",
      },
    },
    {
      id: "WD-2025-009",
      memberId: "member-009",
      memberName: "Delta Trading",
      memberType: "corporate",
      amount: "50.0",
      asset: "ETH",
      blockchain: "ETHEREUM",
      network: "mainnet",
      toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      status: "approval_waiting",
      priority: "urgent",
      createdAt: new Date(Date.now() - 3 * 60000),
      updatedAt: new Date(Date.now() - 3 * 60000),
      amlReview: {
        reviewId: "AML-WD-2025-009",
        status: "passed",
        riskLevel: "low",
        riskScore: 28,
        reviewedAt: new Date(Date.now() - 3 * 60000),
        notes: "Automated AML review passed",
      },
    },
    {
      id: "WD-2025-008",
      memberId: "member-008",
      memberName: "박철수",
      memberType: "individual",
      amount: "25000.0",
      asset: "USDT",
      blockchain: "ETHEREUM",
      network: "mainnet",
      toAddress: "0x9876543210abcdef9876543210abcdef98765432",
      status: "approval_waiting",
      priority: "normal",
      createdAt: new Date(Date.now() - 5 * 60000),
      updatedAt: new Date(Date.now() - 5 * 60000),
      amlReview: {
        reviewId: "AML-WD-2025-008",
        status: "passed",
        riskLevel: "low",
        riskScore: 22,
        reviewedAt: new Date(Date.now() - 5 * 60000),
        notes: "Automated AML review passed",
      },
    },
    {
      id: "WD-2025-007",
      memberId: "member-006",
      memberName: "Zeta Capital",
      memberType: "corporate",
      amount: "200.0",
      asset: "ETH",
      blockchain: "ETHEREUM",
      network: "mainnet",
      toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      status: "failed",
      priority: "normal",
      createdAt: new Date(Date.now() - 5 * 60000),
      updatedAt: new Date(Date.now() - 5 * 60000),
      walletSource: "cold",
      error: {
        code: "MPC_TIMEOUT",
        message: "MPC wallet timeout - transaction not confirmed",
        occurredAt: new Date(Date.now() - 5 * 60000),
      },
    },
    {
      id: "WD-2025-006",
      memberId: "member-005",
      memberName: "Epsilon Finance",
      memberType: "corporate",
      amount: "10000.0",
      asset: "USDT",
      blockchain: "ETHEREUM",
      network: "mainnet",
      toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      status: "rejected",
      priority: "low",
      createdAt: new Date(Date.now() - 15 * 60000),
      updatedAt: new Date(Date.now() - 10 * 60000),
      rejection: {
        rejectedBy: "admin-001",
        rejectedAt: new Date(Date.now() - 10 * 60000),
        reason: "AML high risk - suspicious transaction pattern",
        relatedAMLIssue: true,
      },
    },
    {
      id: "WD-2025-005",
      memberId: "member-004",
      memberName: "김민수",
      memberType: "individual",
      amount: "5000.0",
      asset: "SOL",
      blockchain: "SOLANA",
      network: "mainnet",
      toAddress: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
      status: "completed",
      priority: "normal",
      createdAt: new Date(Date.now() - 30 * 60000),
      updatedAt: new Date(Date.now() - 20 * 60000),
      completedAt: new Date(Date.now() - 20 * 60000),
      walletSource: "hot",
      txHash:
        "3nGq2yczqCDaNKdnmJyCYMHHQqZUCdCvYLveLV4bxLgW9FJfAkLLVnBbXRGQ1JWdVqqw5fR4Cjms7eBHLKT8UZZp",
      mpcExecution: {
        mpcRequestId: "MPC-WD-2025-005",
        initiatedAt: new Date(Date.now() - 30 * 60000),
        callbackReceivedAt: new Date(Date.now() - 20 * 60000),
        status: "success",
        txHash:
          "3nGq2yczqCDaNKdnmJyCYMHHQqZUCdCvYLveLV4bxLgW9FJfAkLLVnBbXRGQ1JWdVqqw5fR4Cjms7eBHLKT8UZZp",
      },
    },
    {
      id: "WD-2025-004",
      memberId: "member-001",
      memberName: "Alpha Corporation",
      memberType: "corporate",
      amount: "3.0",
      asset: "BTC",
      blockchain: "BITCOIN",
      network: "mainnet",
      toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      status: "processing",
      priority: "urgent",
      createdAt: new Date(Date.now() - 45 * 60000),
      updatedAt: new Date(Date.now() - 30 * 60000),
      walletSource: "hot",
      mpcExecution: {
        mpcRequestId: "MPC-WD-2025-004",
        initiatedAt: new Date(Date.now() - 30 * 60000),
        status: "pending",
      },
    },
    {
      id: "WD-2025-003",
      memberId: "member-003",
      memberName: "Gamma Holdings",
      memberType: "corporate",
      amount: "100.0",
      asset: "ETH",
      blockchain: "ETHEREUM",
      network: "mainnet",
      toAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      status: "aml_flagged",
      priority: "normal",
      createdAt: new Date(Date.now() - 60 * 60000),
      updatedAt: new Date(Date.now() - 50 * 60000),
      amlReview: {
        reviewId: "AML-WD-2025-003",
        status: "flagged",
        riskLevel: "high",
        riskScore: 85,
        flaggedReasons: ["High-risk jurisdiction", "Large amount"],
        reviewedAt: new Date(Date.now() - 50 * 60000),
        notes: "Manual review required",
      },
    },
    {
      id: "WD-2025-002B",
      memberId: "member-007",
      memberName: "이영희",
      memberType: "individual",
      amount: "50.0",
      asset: "BTC",
      blockchain: "BITCOIN",
      network: "mainnet",
      toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      status: "approval_waiting",
      priority: "urgent",
      createdAt: new Date(Date.now() - 120 * 60000),
      updatedAt: new Date(Date.now() - 100 * 60000),
      amlReview: {
        reviewId: "AML-WD-2025-002B",
        status: "passed",
        riskLevel: "low",
        riskScore: 30,
        reviewedAt: new Date(Date.now() - 100 * 60000),
        notes: "Automated AML review passed",
      },
    },
    {
      id: "WD-2025-002",
      memberId: "member-002",
      memberName: "Beta Investments",
      memberType: "corporate",
      amount: "2.0",
      asset: "BTC",
      blockchain: "BITCOIN",
      network: "mainnet",
      toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      status: "approval_waiting",
      priority: "low",
      createdAt: new Date(Date.now() - 180 * 60000),
      updatedAt: new Date(Date.now() - 170 * 60000),
      amlReview: {
        reviewId: "AML-WD-2025-002",
        status: "passed",
        riskLevel: "low",
        riskScore: 25,
        reviewedAt: new Date(Date.now() - 170 * 60000),
        notes: "Automated AML review passed",
      },
    },
    {
      id: "WD-2025-001",
      memberId: "member-001",
      memberName: "Alpha Corporation",
      memberType: "corporate",
      amount: "1.5",
      asset: "BTC",
      blockchain: "BITCOIN",
      network: "mainnet",
      toAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
      status: "completed",
      priority: "normal",
      createdAt: new Date(Date.now() - 240 * 60000),
      updatedAt: new Date(Date.now() - 230 * 60000),
      completedAt: new Date(Date.now() - 230 * 60000),
      walletSource: "hot",
      txHash:
        "bc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
      mpcExecution: {
        mpcRequestId: "MPC-WD-2025-001",
        initiatedAt: new Date(Date.now() - 240 * 60000),
        callbackReceivedAt: new Date(Date.now() - 230 * 60000),
        status: "success",
        txHash:
          "bc1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
      },
    },
  ]);

  const handleView = (request: WithdrawalV2Request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleApproveWithHot = async (requestId: string, hotCheck: any) => {
    try {
      await withdrawalV2Api.approveWithHotWallet(requestId, hotCheck);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "processing" as const,
                walletSource: "hot" as const,
                updatedAt: new Date(),
                mpcExecution: {
                  mpcRequestId: `MPC-${requestId}`,
                  initiatedAt: new Date(),
                  status: "pending" as const,
                },
              }
            : r
        )
      );

      alert(`Hot 지갑 출금 승인 완료: ${requestId}`);
    } catch (err) {
      alert(
        `Hot 지갑 출금 실패: ${
          err instanceof Error ? err.message : "알 수 없는 오류"
        }`
      );
    }
  };

  const handleApproveWithCold = async (requestId: string, coldInfo: any) => {
    try {
      await withdrawalV2Api.approveWithColdWallet(requestId, coldInfo);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                status: "processing" as const,
                walletSource: "cold" as const,
                updatedAt: new Date(),
                mpcExecution: {
                  mpcRequestId: `MPC-${requestId}`,
                  initiatedAt: new Date(),
                  status: "pending" as const,
                },
              }
            : r
        )
      );

      alert(`Cold 지갑 출금 승인 완료: ${requestId}`);
    } catch (err) {
      alert(
        `Cold 지갑 출금 실패: ${
          err instanceof Error ? err.message : "알 수 없는 오류"
        }`
      );
    }
  };

  const handleRejectRequest = (requestId: string, reason: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: "rejected" as const,
              updatedAt: new Date(),
              rejection: {
                rejectedBy: "admin-current",
                rejectedAt: new Date(),
                reason,
                relatedAMLIssue: r.status === "aml_flagged",
              },
            }
          : r
      )
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">출금 요청 관리</h1>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 자산별 Hot/Cold 지갑 비율 */}
      <AssetWalletRatioSection />

      {/* 승인 대기 중인 출금 자산 */}
      <PendingWithdrawalAssetsSection requests={requests} />

      {/* 출금 요청 테이블 */}
      <RequestTable requests={requests} onView={handleView} />

      {/* 상세 정보 모달 (모든 상태 지원) */}
      <RequestDetailModal
        open={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onApproveHot={handleApproveWithHot}
        onApproveCold={handleApproveWithCold}
        onReject={handleRejectRequest}
      />
    </div>
  );
}
