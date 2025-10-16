'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DonutChartProps {
  hotRatio: number;
  coldRatio: number;
  totalValue: string;
  hotValue: string;
  coldValue: string;
}

export function DonutChart({
  hotRatio,
  coldRatio,
  totalValue,
  hotValue,
  coldValue
}: DonutChartProps) {
  const data = [
    { name: 'Hot 지갑', value: hotRatio, fill: '#3b82f6', displayValue: hotValue },
    { name: 'Cold 지갑', value: coldRatio, fill: '#8b5cf6', displayValue: coldValue }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toFixed(1)}% (₩{parseInt(data.displayValue).toLocaleString()})
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hot/Cold 지갑 비율</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => (
                  <span className="text-sm">
                    {value}: {entry.payload.value.toFixed(1)}%
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* 중앙 텍스트 */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
            <div className="text-2xl font-bold">
              ₩{parseInt(totalValue).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">총 자산</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm font-medium">Hot 지갑</span>
            </div>
            <div className="text-xl font-bold">
              ₩{parseInt(hotValue).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{hotRatio.toFixed(1)}%</div>
          </div>

          <div className="border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium">Cold 지갑</span>
            </div>
            <div className="text-xl font-bold">
              ₩{parseInt(coldValue).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">{coldRatio.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
