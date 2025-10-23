/**
 * 청산 워크플로우 모달
 * 청산 실행의 단계별 진행 상황을 표시
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import {
  LiquidationCall,
  LiquidationExecution,
  ExchangeStatus,
} from "@/types/admin-lending";
import {
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  TrendingDown,
  Building,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startLiquidation, getExchangeStatus } from "@/services/admin-lending";

interface LiquidationWorkflowModalProps {
  call: LiquidationCall | null;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function LiquidationWorkflowModal({
  call,
  open,
  onClose,
  onComplete,
}: LiquidationWorkflowModalProps) {
  const { toast } = useToast();
  const [execution, setExecution] = useState<LiquidationExecution | null>(null);
  const [exchanges, setExchanges] = useState<ExchangeStatus[]>([]);
  const [selectedExchange, setSelectedExchange] = useState<
    "upbit" | "bithumb" | null
  >(null);
  const [loading, setLoading] = useState(false);

  // 거래소 목록 로드
  const loadExchanges = async () => {
    try {
      const data = await getExchangeStatus();
      setExchanges(data);
    } catch (error) {
      console.error("거래소 정보 로드 실패:", error);
    }
  };

  // 모달 열릴 때 거래소 정보 로드
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && call) {
      loadExchanges();
    } else {
      onClose();
      setExecution(null);
      setSelectedExchange(null);
    }
  };

  // 청산 실행 시작
  const handleStartLiquidation = async () => {
    if (!call || !selectedExchange) return;

    setLoading(true);
    try {
      const newExecution = await startLiquidation(call.id, selectedExchange);
      setExecution(newExecution);
      toast({
        description: "청산 실행이 시작되었습니다.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "청산 실행 실패",
        description: "청산을 시작할 수 없습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 단계별 상태 아이콘
  const getStepIcon = (
    status: "pending" | "in_progress" | "completed" | "failed"
  ) => {
    switch (status) {
      case "pending":
        return <Circle className="h-5 w-5 text-gray-400" />;
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-sky-600" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString() + "원";
  };

  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <TrendingDown className="w-5 h-5 mr-2 text-red-600" />
            청산 실행 워크플로우
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 청산콜 정보 */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              청산 대상 정보
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">고객명</span>
                <span className="font-medium text-gray-900">
                  {call.customerName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">대출 ID</span>
                <span className="font-mono text-gray-900">{call.loanId}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">담보 자산</span>
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol={call.collateralAsset.asset} size={20} />
                  <span className="font-medium text-gray-900">
                    {call.collateralAsset.amount} {call.collateralAsset.asset}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">평가 금액</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(call.collateralAsset.value)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">대출 금액</span>
                <span className="font-medium text-gray-900">
                  {formatAmount(call.loanAmount)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Health Factor</span>
                <span className="font-bold text-red-600">
                  {call.healthFactor.toFixed(2)}
                </span>
              </div>
            </div>
          </section>

          {/* 거래소 선택 */}
          {!execution && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  거래소 선택
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadExchanges}
                  className="h-7"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {exchanges.map((exchange) => (
                  <button
                    key={exchange.exchange}
                    onClick={() => setSelectedExchange(exchange.exchange)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedExchange === exchange.exchange
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    } ${
                      !exchange.connected ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!exchange.connected}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900 capitalize">
                        {exchange.exchange}
                      </span>
                      {exchange.connected ? (
                        <Badge className="bg-sky-50 text-sky-600 border-sky-200 border text-xs">
                          연결됨
                        </Badge>
                      ) : (
                        <Badge className="bg-red-50 text-red-600 border-red-200 border text-xs">
                          연결 안됨
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      지연: {exchange.latency}ms
                    </div>
                    {call.collateralAsset.asset in exchange.currentPrice && (
                      <div className="text-xs text-gray-600 mt-1">
                        현재가:{" "}
                        {formatAmount(
                          exchange.currentPrice[call.collateralAsset.asset]
                        )}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <Button
                onClick={handleStartLiquidation}
                disabled={!selectedExchange || loading}
                className="w-full mt-4 bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    청산 시작 중...
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 mr-2" />
                    청산 실행 시작
                  </>
                )}
              </Button>
            </section>
          )}

          {/* 청산 진행 단계 */}
          {execution && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                청산 진행 단계
              </h3>
              <div className="space-y-3">
                {execution.steps.map((step) => (
                  <div
                    key={step.step}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      step.status === "completed"
                        ? "bg-sky-50"
                        : step.status === "in_progress"
                        ? "bg-indigo-50"
                        : step.status === "failed"
                        ? "bg-red-50"
                        : "bg-gray-50"
                    }`}
                  >
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">
                          {step.step}. {step.name}
                        </span>
                        {step.status === "completed" && step.completedAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(step.completedAt).toLocaleTimeString(
                              "ko-KR"
                            )}
                          </span>
                        )}
                      </div>
                      {step.error && (
                        <p className="text-xs text-red-600 mt-1">
                          {step.error}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 청산 결과 */}
              {execution.status === "completed" && (
                <div className="mt-4 p-4 bg-sky-50 rounded-lg space-y-2">
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 mr-2 text-sky-600" />
                    <h4 className="text-sm font-semibold text-gray-900">
                      청산 결과
                    </h4>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">실제 매각 금액</span>
                    <span className="font-medium text-gray-900">
                      {formatAmount(execution.actualAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">은행 상환</span>
                    <span className="font-medium text-gray-900">
                      {formatAmount(execution.bankRepayment)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">고객 환급</span>
                    <span className="font-medium text-sky-600">
                      {formatAmount(execution.customerRefund)}
                    </span>
                  </div>
                </div>
              )}

              {/* 완료 버튼 */}
              {execution.status === "completed" && (
                <Button
                  onClick={() => {
                    onComplete();
                    handleOpenChange(false);
                  }}
                  className="w-full mt-4 bg-sky-600 hover:bg-sky-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  확인
                </Button>
              )}
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
