/**
 * AssetDistributionChart Component
 *
 * 자산 분포를 인터랙티브 도넛 차트로 표시
 * 고객용 프론트 대시보드의 비주얼 스타일 적용 (꼬리표 형식)
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Sector,
} from 'recharts';
import CryptoIcon from '@/components/ui/CryptoIcon';
import { AssetDistribution } from '../hooks/useDashboardData';
import { formatCompactCurrency, formatFullCurrency } from '@/lib/utils';

interface AssetDistributionChartProps {
  data: AssetDistribution[];
  title?: string;
}

// 고객용 프론트와 동일한 renderActiveShape 함수
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;

  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
        strokeWidth={2}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#111827"
        style={{ fontSize: '14px', fontWeight: '600' }}
      >
        {payload.asset}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#6B7280"
        style={{ fontSize: '12px' }}
      >
        {payload.amount} {payload.asset}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={33}
        textAnchor={textAnchor}
        fill="#6B7280"
        style={{ fontSize: '12px' }}
      >
        {formatCompactCurrency(value)}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={48}
        textAnchor={textAnchor}
        fill="#6B7280"
        style={{ fontSize: '12px' }}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    </g>
  );
};

export function AssetDistributionChart({ data, title = '자산 분포' }: AssetDistributionChartProps) {
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const selectedAsset = data[selectedAssetIndex];
  const selectedPercentage = selectedAsset
    ? ((selectedAsset.value / totalValue) * 100).toFixed(1)
    : '0';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCompactCurrency(totalValue)}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatFullCurrency(totalValue)}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* 도넛 차트 - 왼쪽 */}
          <div className="flex-shrink-0">
            <div className="relative w-96 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    {...({ activeIndex: selectedAssetIndex } as any)}
                    activeShape={renderActiveShape}
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    dataKey="value"
                    onMouseEnter={(_, index) => setSelectedAssetIndex(index)}
                    className="cursor-pointer"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* 중앙 컨텐츠 - 선택된 자산 정보 */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  {selectedAsset && (
                    <>
                      <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        {selectedAsset.asset}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedPercentage}%
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
                        {formatCompactCurrency(selectedAsset.value)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 범례 - 오른쪽 */}
          <div className="flex-1 w-full">
            <div className="space-y-2">
              {data.map((entry, index) => (
                <div
                  key={entry.asset}
                  onClick={() => setSelectedAssetIndex(index)}
                  onMouseEnter={() => setSelectedAssetIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
                    selectedAssetIndex === index
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <CryptoIcon symbol={entry.asset} size={24} />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {entry.asset}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                      {entry.amount} {entry.asset}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCompactCurrency(entry.value)} ({entry.percentage}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
