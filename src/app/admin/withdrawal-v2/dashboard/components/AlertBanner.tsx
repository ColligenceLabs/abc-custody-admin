/**
 * AlertBanner Component
 *
 * 긴급 알림 배너
 * Hot 잔고 부족, 긴급 출금, 만료 서명 등 알림 표시
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, TrendingDown, Clock } from "lucide-react";
import { AlertV2Stats } from "@/types/withdrawalV2";
import { Button } from "@/components/ui/button";

interface AlertBannerProps {
  alerts?: AlertV2Stats;
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts) return null;

  const hasAlerts =
    alerts.urgentWithdrawals > 0 ||
    alerts.hotBalanceLow.bitcoin ||
    alerts.hotBalanceLow.ethereum ||
    alerts.hotBalanceLow.solana ||
    alerts.expiringSignatures > 0;

  if (!hasAlerts) return null;

  return (
    <div className="space-y-3">
      {/* 긴급 출금 알림 */}
      {alerts.urgentWithdrawals > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>긴급 출금 대기</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {alerts.urgentWithdrawals}건의 긴급 출금 요청이 대기 중입니다.
            </span>
            <Button variant="outline" size="sm">
              확인하기
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Hot 잔고 부족 알림 */}
      {(alerts.hotBalanceLow.bitcoin ||
        alerts.hotBalanceLow.ethereum ||
        alerts.hotBalanceLow.solana) && (
        <Alert>
          <TrendingDown className="h-4 w-4" />
          <AlertTitle>Hot Wallet 잔고 부족</AlertTitle>
          <AlertDescription>
            <div className="space-y-1">
              {alerts.hotBalanceLow.bitcoin && (
                <p className="text-sm">
                  - Bitcoin 블록체인: Hot 잔고 15% 미만
                </p>
              )}
              {alerts.hotBalanceLow.ethereum && (
                <p className="text-sm">
                  - Ethereum 블록체인: Hot 잔고 15% 미만
                </p>
              )}
              {alerts.hotBalanceLow.solana && (
                <p className="text-sm">
                  - Solana 블록체인: Hot 잔고 15% 미만
                </p>
              )}
              <Button variant="outline" size="sm" className="mt-2">
                리밸런싱 시작
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* 만료 예정 서명 알림 */}
      {alerts.expiringSignatures > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertTitle>만료 예정 서명</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {alerts.expiringSignatures}개의 Air-gap 서명이 곧 만료됩니다.
            </span>
            <Button variant="outline" size="sm">
              서명 센터
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
