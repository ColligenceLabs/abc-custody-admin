'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BalanceStatus, DeviationStatus } from '@/types/vault';

interface RatioComparisonChartProps {
  balanceStatus: BalanceStatus;
}

export function RatioComparisonChart({ balanceStatus }: RatioComparisonChartProps) {
  const data = [
    {
      name: '목표',
      hot: balanceStatus.targetHotRatio,
      cold: balanceStatus.targetColdRatio,
      type: 'target'
    },
    {
      name: '실제',
      hot: balanceStatus.hotRatio,
      cold: balanceStatus.coldRatio,
      type: 'actual'
    }
  ];

  const getDeviationColor = (status: DeviationStatus) => {
    switch (status) {
      case DeviationStatus.OPTIMAL:
        return 'bg-green-500';
      case DeviationStatus.ACCEPTABLE:
        return 'bg-yellow-500';
      case DeviationStatus.WARNING:
        return 'bg-orange-500';
      case DeviationStatus.CRITICAL:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getDeviationText = (status: DeviationStatus) => {
    switch (status) {
      case DeviationStatus.OPTIMAL:
        return '최적';
      case DeviationStatus.ACCEPTABLE:
        return '양호';
      case DeviationStatus.WARNING:
        return '주의';
      case DeviationStatus.CRITICAL:
        return '위험';
      default:
        return '알 수 없음';
    }
  };

  const getDeviationVariant = (status: DeviationStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case DeviationStatus.OPTIMAL:
        return 'default';
      case DeviationStatus.ACCEPTABLE:
        return 'secondary';
      case DeviationStatus.WARNING:
      case DeviationStatus.CRITICAL:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-2">{payload[0].payload.name}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Hot: {payload[0].value}%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm">Cold: {payload[1].value}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>목표 비율 vs 실제 비율</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={getDeviationVariant(balanceStatus.deviationStatus)}>
              {getDeviationText(balanceStatus.deviationStatus)}
            </Badge>
            {balanceStatus.needsRebalancing && (
              <Badge variant="destructive">리밸런싱 필요</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="hot" name="Hot 지갑" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cold" name="Cold 지갑" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="border rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Hot 비율</div>
            <div className="text-2xl font-bold">
              {balanceStatus.hotRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              목표: {balanceStatus.targetHotRatio}%
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">Cold 비율</div>
            <div className="text-2xl font-bold">
              {balanceStatus.coldRatio.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              목표: {balanceStatus.targetColdRatio}%
            </div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="text-sm text-muted-foreground mb-1">편차</div>
            <div className="text-2xl font-bold">
              {balanceStatus.deviation > 0 ? '+' : ''}{balanceStatus.deviation.toFixed(1)}%
            </div>
            <div className={`text-sm font-medium ${
              balanceStatus.deviationStatus === DeviationStatus.OPTIMAL ? 'text-green-600' :
              balanceStatus.deviationStatus === DeviationStatus.ACCEPTABLE ? 'text-yellow-600' :
              balanceStatus.deviationStatus === DeviationStatus.WARNING ? 'text-orange-600' :
              'text-red-600'
            }`}>
              {getDeviationText(balanceStatus.deviationStatus)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
