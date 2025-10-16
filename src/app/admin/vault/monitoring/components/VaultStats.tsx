'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VaultStatus, WalletStatus, SecurityLevel } from '@/types/vault';
import { Wallet, Shield, Activity, TrendingUp } from 'lucide-react';

interface VaultStatsProps {
  vaultStatus: VaultStatus | undefined;
  isLoading: boolean;
}

export function VaultStats({ vaultStatus, isLoading }: VaultStatsProps) {
  if (isLoading || !vaultStatus) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-20 animate-pulse bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getWalletStatusBadge = (status: WalletStatus) => {
    switch (status) {
      case WalletStatus.NORMAL:
        return <Badge variant="default">정상</Badge>;
      case WalletStatus.LOW:
        return <Badge variant="destructive">부족</Badge>;
      case WalletStatus.HIGH:
        return <Badge variant="destructive">과다</Badge>;
      case WalletStatus.CRITICAL:
        return <Badge variant="destructive">긴급</Badge>;
      case WalletStatus.MAINTENANCE:
        return <Badge variant="secondary">유지보수</Badge>;
    }
  };

  const getSecurityLevelBadge = (level: SecurityLevel) => {
    switch (level) {
      case SecurityLevel.BASIC:
        return <Badge variant="secondary">기본</Badge>;
      case SecurityLevel.STANDARD:
        return <Badge variant="secondary">표준</Badge>;
      case SecurityLevel.HIGH:
        return <Badge variant="default">높음</Badge>;
      case SecurityLevel.MAXIMUM:
        return <Badge>최고</Badge>;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Value Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">총 자산 가치</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₩{parseInt(vaultStatus.totalValue.totalInKRW).toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            ${parseInt(vaultStatus.totalValue.totalInUSD).toLocaleString()}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {vaultStatus.totalValue.assetBreakdown.length}개 자산
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Hot Wallet Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Hot 지갑</CardTitle>
          <Wallet className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₩{parseInt(vaultStatus.hotWallet.totalValue.totalInKRW).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {vaultStatus.balanceStatus.hotRatio.toFixed(1)}% / 목표: {vaultStatus.balanceStatus.targetHotRatio}%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              활용률: {vaultStatus.hotWallet.utilizationRate}%
            </span>
            {getWalletStatusBadge(vaultStatus.hotWallet.status)}
          </div>
        </CardContent>
      </Card>

      {/* Cold Wallet Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cold 지갑</CardTitle>
          <Wallet className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₩{parseInt(vaultStatus.coldWallet.totalValue.totalInKRW).toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {vaultStatus.balanceStatus.coldRatio.toFixed(1)}% / 목표: {vaultStatus.balanceStatus.targetColdRatio}%
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              보안: {getSecurityLevelBadge(vaultStatus.coldWallet.securityLevel)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Security Score Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">보안 및 성능</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {vaultStatus.coldWallet.healthScore}/100
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            헬스 스코어
          </p>
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">가동률:</span>
              <span className="font-medium">{vaultStatus.performance.uptime.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">성공률:</span>
              <span className="font-medium">{vaultStatus.performance.successRate.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
