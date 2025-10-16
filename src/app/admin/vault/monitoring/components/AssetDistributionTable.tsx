'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WalletInfo, AssetValue } from '@/types/vault';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AssetDistributionTableProps {
  hotWallet: WalletInfo | undefined;
  coldWallet: WalletInfo | undefined;
  isLoading: boolean;
}

export function AssetDistributionTable({
  hotWallet,
  coldWallet,
  isLoading
}: AssetDistributionTableProps) {
  if (isLoading || !hotWallet || !coldWallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>자산 분포 (Hot/Cold)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  // 자산별로 Hot/Cold 데이터 매핑
  const assetDistribution = hotWallet.assets.map((hotAsset) => {
    const coldAsset = coldWallet.assets.find(a => a.symbol === hotAsset.symbol);

    const hotBalance = parseFloat(hotAsset.balance);
    const coldBalance = coldAsset ? parseFloat(coldAsset.balance) : 0;
    const totalBalance = hotBalance + coldBalance;

    const hotRatio = totalBalance > 0 ? (hotBalance / totalBalance) * 100 : 0;
    const coldRatio = totalBalance > 0 ? (coldBalance / totalBalance) * 100 : 0;

    const targetHotRatio = 20;
    const targetColdRatio = 80;
    const deviation = Math.abs(hotRatio - targetHotRatio);

    // 편차에 따른 상태 결정
    let status: 'optimal' | 'acceptable' | 'warning' | 'critical';
    if (deviation <= 2) status = 'optimal';
    else if (deviation <= 5) status = 'acceptable';
    else if (deviation <= 10) status = 'warning';
    else status = 'critical';

    const needsRebalancing = deviation > 5;

    return {
      symbol: hotAsset.symbol,
      name: hotAsset.name,
      hotBalance,
      hotValue: hotAsset.valueInKRW,
      coldBalance,
      coldValue: coldAsset?.valueInKRW || '0',
      totalBalance,
      totalValue: (parseFloat(hotAsset.valueInKRW) + (coldAsset ? parseFloat(coldAsset.valueInKRW) : 0)).toString(),
      hotRatio,
      coldRatio,
      deviation,
      status,
      needsRebalancing
    };
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimal':
        return <Badge variant="default" className="bg-green-500">최적</Badge>;
      case 'acceptable':
        return <Badge variant="secondary">양호</Badge>;
      case 'warning':
        return <Badge variant="destructive" className="bg-orange-500">주의</Badge>;
      case 'critical':
        return <Badge variant="destructive">위험</Badge>;
      default:
        return <Badge variant="outline">알 수 없음</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>자산 분포 (Hot/Cold)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>자산</TableHead>
              <TableHead className="text-right">Hot 지갑</TableHead>
              <TableHead className="text-right">Cold 지갑</TableHead>
              <TableHead className="text-right">총계</TableHead>
              <TableHead>Hot/Cold 비율</TableHead>
              <TableHead className="text-center">상태</TableHead>
              <TableHead className="text-center">리밸런싱</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assetDistribution.map((asset) => (
              <TableRow key={asset.symbol}>
                <TableCell className="font-medium">
                  <div>
                    <div className="font-bold">{asset.symbol}</div>
                    <div className="text-xs text-muted-foreground">{asset.name}</div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">{asset.hotBalance.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">
                      ₩{parseInt(asset.hotValue).toLocaleString()}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">{asset.coldBalance.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">
                      ₩{parseInt(asset.coldValue).toLocaleString()}
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  <div>
                    <div className="font-medium">{asset.totalBalance.toFixed(6)}</div>
                    <div className="text-xs text-muted-foreground">
                      ₩{parseInt(asset.totalValue).toLocaleString()}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600 font-medium">Hot: {asset.hotRatio.toFixed(1)}%</span>
                      <span className="text-purple-600 font-medium">Cold: {asset.coldRatio.toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={asset.hotRatio}
                      className="h-2"
                    />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>목표: 20%</span>
                      <span>목표: 80%</span>
                    </div>
                    <div className="text-xs text-center">
                      편차: {asset.deviation > 0 ? '+' : ''}{asset.deviation.toFixed(1)}%
                    </div>
                  </div>
                </TableCell>

                <TableCell className="text-center">
                  {getStatusBadge(asset.status)}
                </TableCell>

                <TableCell className="text-center">
                  {asset.needsRebalancing ? (
                    <div className="flex flex-col items-center gap-1">
                      <AlertCircle className="h-5 w-5 text-orange-500" />
                      <span className="text-xs text-orange-600 font-medium">필요</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">양호</span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Hot 지갑 (목표: 20%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span>Cold 지갑 (목표: 80%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
