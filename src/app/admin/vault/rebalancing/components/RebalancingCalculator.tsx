'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RebalancingCalculation, RebalancingType } from '@/types/vault';
import { ArrowRight, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface RebalancingCalculatorProps {
  calculation: RebalancingCalculation | undefined;
  isLoading: boolean;
}

export function RebalancingCalculatorCard({ calculation, isLoading }: RebalancingCalculatorProps) {
  if (isLoading || !calculation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>리밸런싱 계산기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const isHotToCold = calculation.direction === RebalancingType.HOT_TO_COLD;
  const fromWallet = isHotToCold ? 'Hot 지갑' : 'Cold 지갑';
  const toWallet = isHotToCold ? 'Cold 지갑' : 'Hot 지갑';

  const currentHotValue = parseInt(calculation.currentHotValue);
  const currentColdValue = parseInt(calculation.currentColdValue);
  const totalValue = parseInt(calculation.currentTotalValue);

  const currentHotRatio = (currentHotValue / totalValue) * 100;
  const currentColdRatio = (currentColdValue / totalValue) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            리밸런싱 계산기
          </CardTitle>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isHotToCold
              ? 'bg-blue-100 text-blue-700'
              : 'bg-purple-100 text-purple-700'
          }`}>
            {isHotToCold ? 'Hot → Cold' : 'Cold → Hot'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">현재 상태</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hot 지갑</span>
                <span className="text-sm font-bold">{currentHotRatio.toFixed(1)}%</span>
              </div>
              <Progress value={currentHotRatio} className="h-2" />
              <div className="text-xs text-muted-foreground">
                ₩{currentHotValue.toLocaleString()}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cold 지갑</span>
                <span className="text-sm font-bold">{currentColdRatio.toFixed(1)}%</span>
              </div>
              <Progress value={currentColdRatio} className="h-2" />
              <div className="text-xs text-muted-foreground">
                ₩{currentColdValue.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Required Transfer */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
          <h3 className="text-sm font-semibold">필요한 이체</h3>
          <div className="flex items-center justify-center gap-4">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{fromWallet}</div>
              <div className="text-2xl font-bold">
                ₩{parseInt(calculation.requiredTransferAmount).toLocaleString()}
              </div>
            </div>
            <ArrowRight className={`h-8 w-8 ${
              isHotToCold ? 'text-blue-600' : 'text-purple-600'
            }`} />
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">{toWallet}</div>
              <div className="text-2xl font-bold">
                ₩{parseInt(calculation.requiredTransferAmount).toLocaleString()}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t text-sm">
            <span className="text-muted-foreground">예상 수수료</span>
            <span className="font-medium">₩{parseInt(calculation.estimatedFee).toLocaleString()}</span>
          </div>
        </div>

        {/* After Rebalancing */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            리밸런싱 후 예상 비율
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hot 지갑</span>
                <span className={`text-sm font-bold ${
                  Math.abs(calculation.afterHotRatio - 20) < 2
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>
                  {calculation.afterHotRatio.toFixed(1)}%
                </span>
              </div>
              <Progress value={calculation.afterHotRatio} className="h-2" />
              <div className="text-xs text-muted-foreground">
                목표: 20% (편차: {Math.abs(calculation.afterHotRatio - 20).toFixed(1)}%)
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cold 지갑</span>
                <span className={`text-sm font-bold ${
                  Math.abs(calculation.afterColdRatio - 80) < 2
                    ? 'text-green-600'
                    : 'text-yellow-600'
                }`}>
                  {calculation.afterColdRatio.toFixed(1)}%
                </span>
              </div>
              <Progress value={calculation.afterColdRatio} className="h-2" />
              <div className="text-xs text-muted-foreground">
                목표: 80% (편차: {Math.abs(calculation.afterColdRatio - 80).toFixed(1)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Indicator */}
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          calculation.afterDeviation < 2
            ? 'bg-green-50 text-green-700'
            : calculation.afterDeviation < 5
            ? 'bg-yellow-50 text-yellow-700'
            : 'bg-orange-50 text-orange-700'
        }`}>
          {calculation.afterDeviation < 2 ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <TrendingDown className="h-5 w-5" />
          )}
          <div className="flex-1">
            <div className="text-sm font-medium">
              {calculation.afterDeviation < 2
                ? '최적 비율 달성'
                : calculation.afterDeviation < 5
                ? '양호한 비율'
                : '추가 조정 권장'}
            </div>
            <div className="text-xs">
              리밸런싱 후 편차: {calculation.afterDeviation.toFixed(1)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
