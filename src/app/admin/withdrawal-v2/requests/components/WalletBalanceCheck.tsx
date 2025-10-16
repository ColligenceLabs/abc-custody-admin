/**
 * WalletBalanceCheck Component
 *
 * Hot/Cold 지갑 잔고 확인 표시 컴포넌트
 * approval_waiting 상태에서 사용
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HotWalletBalanceCheck,
  ColdWalletBalanceInfo,
  AssetType,
} from "@/types/withdrawalV2";
import { Wallet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface WalletBalanceCheckProps {
  asset: AssetType;
  hotWalletCheck: HotWalletBalanceCheck;
  coldWalletInfo: ColdWalletBalanceInfo;
}

export function WalletBalanceCheckComponent({
  asset,
  hotWalletCheck,
  coldWalletInfo,
}: WalletBalanceCheckProps) {
  return (
    <div className="space-y-4">
      {/* Hot 지갑 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Hot 지갑 정보
            </CardTitle>
            {hotWalletCheck.isSufficient ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Hot 지갑 잔고 충분
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="w-3 h-3 mr-1" />
                Hot 지갑 잔고 부족
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">현재 Hot 잔고</p>
              <p className="font-mono font-semibold text-lg">
                {hotWalletCheck.currentBalance} {asset}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">출금 요청 금액</p>
              <p className="font-mono font-semibold text-lg">
                {hotWalletCheck.requestedAmount} {asset}
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-muted-foreground text-sm mb-1">출금 후 잔고 (예상)</p>
            <p className="font-mono font-bold text-xl">
              {hotWalletCheck.afterBalance} {asset}
            </p>
          </div>

          {!hotWalletCheck.isSufficient && hotWalletCheck.shortfall && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Hot 지갑 잔고가 부족합니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    부족 금액: <span className="font-mono font-bold text-red-600 dark:text-red-400">{hotWalletCheck.shortfall} {asset}</span>
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>다음 옵션 중 선택하세요:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Cold 지갑에서 직접 출금</li>
                      <li>리밸런싱 후 Hot 지갑 출금 (권장)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Hot/Cold 비율</p>
                <p className="font-semibold">
                  {hotWalletCheck.currentHotRatio.toFixed(1)}% / {(100 - hotWalletCheck.currentHotRatio).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">목표 범위</p>
                <p className="font-semibold text-muted-foreground">20% / 80%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cold 지갑 정보 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Cold 지갑 정보
            </CardTitle>
            {coldWalletInfo.isSufficient && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <CheckCircle className="w-3 h-3 mr-1" />
                Cold 지갑 잔고 충분
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <p className="text-muted-foreground text-sm mb-1">현재 Cold 잔고</p>
            <p className="font-mono font-semibold text-lg">
              {coldWalletInfo.currentBalance} {asset}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
