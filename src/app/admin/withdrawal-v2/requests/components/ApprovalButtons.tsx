/**
 * ApprovalButtons Component
 *
 * Hot/Cold 지갑 선택 버튼 컴포넌트
 * approval_waiting 상태에서 사용
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HotWalletBalanceCheck } from "@/types/withdrawalV2";
import { Flame, Snowflake, XCircle } from "lucide-react";

interface ApprovalButtonsProps {
  hotWalletCheck: HotWalletBalanceCheck;
  onApproveHot: () => void;
  onApproveCold: () => void;
  onReject: () => void;
  isLoading?: boolean;
  isRetry?: boolean;
}

export function ApprovalButtonsComponent({
  hotWalletCheck,
  onApproveHot,
  onApproveCold,
  onReject,
  isLoading = false,
  isRetry = false,
}: ApprovalButtonsProps) {
  const hotSufficient = hotWalletCheck.isSufficient;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">승인 옵션 선택</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Hot 지갑 출금 버튼 */}
        <Button
          variant={hotSufficient ? "default" : "outline"}
          disabled={!hotSufficient || isLoading}
          onClick={onApproveHot}
          className={
            hotSufficient
              ? "w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              : "w-full"
          }
        >
          <Flame className="w-4 h-4 mr-2" />
          {isRetry ? "Hot 지갑에서 재출금" : "Hot 지갑에서 출금"}
        </Button>

        {/* Cold 지갑 출금 버튼 */}
        <Button
          variant={!hotSufficient ? "default" : "outline"}
          disabled={isLoading}
          onClick={onApproveCold}
          className={
            !hotSufficient
              ? "w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              : "w-full"
          }
        >
          <Snowflake className="w-4 h-4 mr-2" />
          {isRetry ? "Cold 지갑에서 재출금" : "Cold 지갑에서 출금"}
        </Button>

        {/* 거부 버튼 (재처리 모드일 때는 숨김) */}
        {!isRetry && (
          <div className="border-t pt-4">
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
              onClick={onReject}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              거부
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
