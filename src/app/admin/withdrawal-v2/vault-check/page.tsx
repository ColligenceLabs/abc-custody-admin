/**
 * Vault Check & Rebalancing Page
 *
 * 볼트 잔고 확인 및 리밸런싱 관리 페이지
 * 블록체인별 Hot/Cold 비율 모니터링 및 자동 리밸런싱
 */

"use client";

import { useState, useEffect } from "react";
import { RebalancingCard } from "./components/RebalancingCard";
import { RebalancingModal } from "./components/RebalancingModal";
import {
  BlockchainVaultStatus,
  RebalancingRequest,
} from "@/types/withdrawalV2";
import { withdrawalV2Api } from "@/services/withdrawalV2Api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function VaultCheckPage() {
  const [vaults, setVaults] = useState<{
    bitcoin: BlockchainVaultStatus | null;
    ethereum: BlockchainVaultStatus | null;
    solana: BlockchainVaultStatus | null;
  }>({
    bitcoin: null,
    ethereum: null,
    solana: null,
  });

  const [selectedVault, setSelectedVault] =
    useState<BlockchainVaultStatus | null>(null);
  const [isRebalancingModalOpen, setIsRebalancingModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rebalancingRequests, setRebalancingRequests] = useState<
    RebalancingRequest[]
  >([]);

  // 데이터 로드
  useEffect(() => {
    loadVaultStatus();
  }, []);

  const loadVaultStatus = async () => {
    setIsLoading(true);
    try {
      const stats = await withdrawalV2Api.getWithdrawalV2Stats();
      setVaults({
        bitcoin: stats.vaults.bitcoin,
        ethereum: stats.vaults.ethereum,
        solana: stats.vaults.solana,
      });
    } catch (error) {
      console.error("Failed to load vault status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRebalancing = (vault: BlockchainVaultStatus) => {
    setSelectedVault(vault);
    setIsRebalancingModalOpen(true);
  };

  const handleConfirmRebalancing = (request: RebalancingRequest) => {
    // 리밸런싱 요청 추가
    setRebalancingRequests((prev) => [...prev, request]);

    // 실제로는 API 호출하여 리밸런싱 프로세스 시작
    alert(
      `리밸런싱이 시작되었습니다!\n블록체인: ${request.blockchain}\n방향: ${request.direction === "COLD_TO_HOT" ? "Cold → Hot" : "Hot → Cold"}\n자산: ${request.amount} ${request.asset}`
    );
  };

  const needsRebalancing = [
    vaults.bitcoin,
    vaults.ethereum,
    vaults.solana,
  ].filter((v) => v?.needsRebalancing);

  const allNormal = needsRebalancing.length === 0 && !isLoading;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">볼트 잔고 확인 & 리밸런싱</h1>
          <p className="text-muted-foreground mt-1">
            블록체인별 Hot/Cold 비율 모니터링
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadVaultStatus}
          disabled={isLoading}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          새로고침
        </Button>
      </div>

      {/* 전체 상태 요약 */}
      {allNormal && (
        <Alert className="bg-green-100 dark:bg-green-900/20 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800 dark:text-green-200">
            모든 블록체인 정상
          </AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            모든 블록체인의 Hot/Cold 비율이 목표 범위(20±5%)  내에 있습니다.
          </AlertDescription>
        </Alert>
      )}

      {needsRebalancing.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>리밸런싱 필요</AlertTitle>
          <AlertDescription>
            {needsRebalancing.length}개 블록체인에서 Hot/Cold 비율이 목표 범위를
            벗어났습니다. 리밸런싱을 시작해주세요.
          </AlertDescription>
        </Alert>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-500/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">전체 블록체인</p>
          <p className="text-3xl font-bold">3</p>
          <p className="text-xs text-muted-foreground mt-1">
            Bitcoin, Ethereum, Solana
          </p>
        </div>
        <div
          className={`${
            needsRebalancing.length > 0
              ? "bg-yellow-100 dark:bg-yellow-900/20 border-yellow-500"
              : "bg-green-100 dark:bg-green-900/20 border-green-500"
          } border rounded-lg p-4`}
        >
          <p className="text-sm text-muted-foreground mb-1">리밸런싱 필요</p>
          <p className="text-3xl font-bold">{needsRebalancing.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {needsRebalancing.length > 0
              ? "조치 필요"
              : "모두 정상 범위"}
          </p>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900/20 border border-purple-500/50 rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">
            진행 중인 리밸런싱
          </p>
          <p className="text-3xl font-bold">
            {
              rebalancingRequests.filter((r) => r.status === "executing" || r.status === "cold_signing")
                .length
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            대기: {rebalancingRequests.filter((r) => r.status === "pending").length}건
          </p>
        </div>
      </div>

      {/* 블록체인별 볼트 카드 */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          블록체인별 볼트 상태
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border rounded-lg p-6 animate-pulse bg-muted/50"
              >
                <div className="h-6 bg-muted rounded w-32 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vaults.bitcoin && (
              <RebalancingCard
                vault={vaults.bitcoin}
                onStartRebalancing={handleStartRebalancing}
              />
            )}
            {vaults.ethereum && (
              <RebalancingCard
                vault={vaults.ethereum}
                onStartRebalancing={handleStartRebalancing}
              />
            )}
            {vaults.solana && (
              <RebalancingCard
                vault={vaults.solana}
                onStartRebalancing={handleStartRebalancing}
              />
            )}
          </div>
        )}
      </div>

      {/* 리밸런싱 요청 히스토리 */}
      {rebalancingRequests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">리밸런싱 히스토리</h2>
          <div className="border rounded-lg divide-y">
            {rebalancingRequests.map((request) => (
              <div key={request.id} className="p-4 hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{request.blockchain}</Badge>
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "executing" || request.status === "cold_signing"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {request.status === "pending" && "대기 중"}
                        {request.status === "executing" && "실행 중"}
                        {request.status === "cold_signing" && "서명 대기"}
                        {request.status === "completed" && "완료"}
                        {request.status === "failed" && "실패"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">
                      {request.direction === "COLD_TO_HOT"
                        ? "Cold → Hot"
                        : "Hot → Cold"}{" "}
                      리밸런싱
                    </p>
                    <p className="text-xs text-muted-foreground">
                      금액: {request.amount} {request.asset} |{" "}
                      {request.createdAt.toLocaleString("ko-KR")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">현재 Hot 비율</p>
                    <p className="text-sm font-mono">
                      {request.currentHotRatio.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 리밸런싱 모달 */}
      <RebalancingModal
        open={isRebalancingModalOpen}
        onClose={() => {
          setIsRebalancingModalOpen(false);
          setSelectedVault(null);
        }}
        vault={selectedVault}
        onConfirm={handleConfirmRebalancing}
      />
    </div>
  );
}
