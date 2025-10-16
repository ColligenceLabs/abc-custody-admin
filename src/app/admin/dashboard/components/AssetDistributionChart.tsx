/**
 * AssetDistributionChart Component
 *
 * 자산 분포를 도넛 차트로 표시
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import CryptoIcon from '@/components/ui/CryptoIcon';
import { AssetDistribution } from '../hooks/useDashboardData';

interface AssetDistributionChartProps {
  data: AssetDistribution[];
}

export function AssetDistributionChart({ data }: AssetDistributionChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>자산 분포</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 도넛 차트 */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `₩${value.toLocaleString('ko-KR')}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 자산 목록 */}
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.asset} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CryptoIcon symbol={item.asset} size={24} />
                  <span className="text-sm font-medium">{item.asset}</span>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold">
                    {item.amount} {item.asset}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ₩{item.value.toLocaleString('ko-KR')} ({item.percentage}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
