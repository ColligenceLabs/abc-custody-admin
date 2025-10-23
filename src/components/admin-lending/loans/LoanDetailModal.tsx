/**
 * 대출 상세 정보 모달
 * 대출 전체 정보를 상세하게 표시
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import CryptoIcon from "@/components/ui/CryptoIcon";
import { AdminBankLoan } from "@/types/admin-lending";
import { Calendar, DollarSign, TrendingUp, Building, User } from "lucide-react";

interface LoanDetailModalProps {
  loan: AdminBankLoan | null;
  open: boolean;
  onClose: () => void;
}

export default function LoanDetailModal({
  loan,
  open,
  onClose,
}: LoanDetailModalProps) {
  if (!loan) return null;

  // 위험도별 배지 스타일
  const getRiskBadgeClass = (riskLevel: AdminBankLoan["riskLevel"]) => {
    switch (riskLevel) {
      case "safe":
        return "bg-sky-50 text-sky-600 border-sky-200";
      case "caution":
        return "bg-yellow-50 text-yellow-600 border-yellow-200";
      case "danger":
        return "bg-red-50 text-red-600 border-red-200";
      case "liquidation":
        return "bg-purple-50 text-purple-600 border-purple-200";
    }
  };

  // Health Factor 색상
  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 1.5) return "text-sky-600";
    if (healthFactor >= 1.2) return "text-yellow-600";
    if (healthFactor >= 1.0) return "text-red-600";
    return "text-purple-600";
  };

  // 금액 포맷팅
  const formatAmount = (amount: number): string => {
    return amount.toLocaleString() + "원";
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>대출 상세 정보</span>
            <Badge className={`${getRiskBadgeClass(loan.riskLevel)} border`}>
              {loan.riskLevel === "safe" && "안전"}
              {loan.riskLevel === "caution" && "주의"}
              {loan.riskLevel === "danger" && "위험"}
              {loan.riskLevel === "liquidation" && "청산"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 기본 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-indigo-600" />
              기본 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">대출 ID</span>
                <span className="text-sm font-mono text-indigo-600">
                  {loan.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">고객명</span>
                <span className="text-sm font-medium text-gray-900">
                  {loan.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">고객 ID</span>
                <span className="text-sm font-mono text-gray-600">
                  {loan.customerId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">은행 계좌</span>
                <span className="text-sm text-gray-900">
                  {loan.customerBank} {loan.customerAccount}
                </span>
              </div>
            </div>
          </section>

          {/* 대출 상품 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Building className="w-4 h-4 mr-2 text-purple-600" />
              대출 상품 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">상품명</span>
                <span className="text-sm font-medium text-gray-900">
                  {loan.product.productName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">은행</span>
                <span className="text-sm text-gray-900">
                  {loan.product.bankName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">대출 기간</span>
                <span className="text-sm text-gray-900">
                  {loan.product.loanTerm}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">LTV</span>
                <span className="text-sm text-gray-900">{loan.product.ltv}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">조기 상환 수수료</span>
                <span className="text-sm text-gray-900">
                  {loan.product.earlyRepaymentFee}
                </span>
              </div>
            </div>
          </section>

          {/* 담보 자산 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-sky-600" />
              담보 자산 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">자산</span>
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol={loan.collateralAsset.asset} size={20} />
                  <span className="text-sm font-medium text-gray-900">
                    {loan.collateralAsset.asset}
                  </span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">수량</span>
                <span className="text-sm font-medium text-gray-900">
                  {loan.collateralAsset.amount} {loan.collateralAsset.asset}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">현재 가격</span>
                <span className="text-sm text-gray-900">
                  {formatAmount(loan.collateralAsset.currentPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">총 평가액</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(loan.collateralAsset.value)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">변동성</span>
                <span className="text-sm text-gray-900">
                  {(loan.collateralAsset.volatility * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </section>

          {/* 대출 상세 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-indigo-600" />
              대출 상세
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">대출 금액</span>
                <span className="text-sm font-bold text-gray-900">
                  {formatAmount(loan.loanAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">이자율</span>
                <span className="text-sm text-gray-900">
                  {loan.interestRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">누적 이자</span>
                <span className="text-sm text-gray-900">
                  {formatAmount(loan.accruedInterest)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Health Factor</span>
                <span
                  className={`text-lg font-bold ${getHealthFactorColor(
                    loan.healthFactor
                  )}`}
                >
                  {loan.healthFactor.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">청산 임계값</span>
                <span className="text-sm text-gray-900">
                  {(loan.liquidationThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">청산 가격</span>
                <span className="text-sm text-red-600 font-medium">
                  {formatAmount(loan.liquidationPrice)}
                </span>
              </div>
            </div>
          </section>

          {/* 일정 정보 */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-purple-600" />
              일정 정보
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">대출 실행일</span>
                <span className="text-sm text-gray-900">
                  {formatDate(loan.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">만기일</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatDate(loan.maturityDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">최종 업데이트</span>
                <span className="text-sm text-gray-900">
                  {formatDate(loan.lastUpdated)}
                </span>
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
