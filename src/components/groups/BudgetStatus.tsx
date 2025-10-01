import { useState } from "react";
import { CheckCircleIcon, ClockIcon, XCircleIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { WalletGroup, ExpenseRequest } from "@/types/groups";
import { mockGroups, mockExpenses } from "@/data/groupMockData";
import {
  getCryptoIconUrl,
  getCurrencyDecimals,
  formatCryptoAmount,
  calculateExpenseSum,
  getExpensesForPeriod,
  getBudgetUsagePercentage,
  getQuarterlyBudgetUsagePercentage,
  getYearlyBudgetUsagePercentage,
  getTypeColor,
  getTypeName
} from "@/utils/groupsUtils";

interface BudgetStatusProps {
  // props 정의 (필요한 경우 추가)
}

// 가상자산 아이콘 컴포넌트
const getCryptoIcon = (currency: string) => {
  return (
    <img 
      src={getCryptoIconUrl(currency as any)} 
      alt={currency}
      className="w-5 h-5"
      onError={(e) => {
        // 이미지 로드 실패시 폴백
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold';
        fallback.textContent = currency[0];
        target.parentNode?.replaceChild(fallback, target);
      }}
    />
  );
};

export default function BudgetStatus({}: BudgetStatusProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  return (
    <div className="space-y-6">
      {/* 지출 요약 - 최상단 배치 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            지출 요약
          </h3>
          
          {/* 기간 선택기 */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">기간</span>
            <div className="flex border border-gray-200 rounded-lg">
              {(() => {
                const now = new Date();
                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1; // 0-based이므로 +1
                const currentQuarter = Math.floor(now.getMonth() / 3) + 1; // 1-4분기
                
                const periods = [
                  { 
                    id: 'monthly', 
                    label: `${currentYear}년 ${currentMonth}월`,
                    shortLabel: '이번 달'
                  },
                  { 
                    id: 'quarterly', 
                    label: `${currentYear}년 ${currentQuarter}분기`,
                    shortLabel: '이번 분기'
                  },
                  { 
                    id: 'yearly', 
                    label: `${currentYear}년`,
                    shortLabel: '올해'
                  }
                ];
                
                return periods.map((period, index) => (
                  <button
                    key={period.id}
                    onClick={() => setSelectedPeriod(period.id as typeof selectedPeriod)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      selectedPeriod === period.id
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    } ${
                      index === 0 ? 'rounded-l-lg' : index === 2 ? 'rounded-r-lg' : ''
                    } border-r border-gray-200 last:border-r-0`}
                    title={period.label}
                  >
                    {period.shortLabel}
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(() => {
            const filteredExpenses = getExpensesForPeriod(mockExpenses, selectedPeriod);
            const approvedSums = calculateExpenseSum(filteredExpenses, "approved");
            const pendingSums = calculateExpenseSum(filteredExpenses, "pending");
            const rejectedSums = calculateExpenseSum(filteredExpenses, "rejected");
            
            return (
              <>
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">
                        승인된 지출
                      </p>
                      <div className="space-y-1">
                        {Object.keys(approvedSums).length > 0 ? (
                          Object.entries(approvedSums).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center space-x-2">
                              {getCryptoIcon(currency as any)}
                              <span className="text-lg font-bold text-gray-900">
                                {formatCryptoAmount({ amount, currency: currency as any })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center">
                            <span className="text-2xl font-bold text-gray-300">0</span>
                            <p className="text-xs text-gray-400 mt-1">승인된 지출 없음</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <CheckCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">
                        대기 중인 지출
                      </p>
                      <div className="space-y-1">
                        {Object.keys(pendingSums).length > 0 ? (
                          Object.entries(pendingSums).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center space-x-2">
                              {getCryptoIcon(currency as any)}
                              <span className="text-lg font-bold text-gray-900">
                                {formatCryptoAmount({ amount, currency: currency as any })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center">
                            <span className="text-2xl font-bold text-gray-300">0</span>
                            <p className="text-xs text-gray-400 mt-1">대기 중인 지출 없음</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <ClockIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">
                        반려된 지출
                      </p>
                      <div className="space-y-1">
                        {Object.keys(rejectedSums).length > 0 ? (
                          Object.entries(rejectedSums).map(([currency, amount]) => (
                            <div key={currency} className="flex items-center space-x-2">
                              {getCryptoIcon(currency as any)}
                              <span className="text-lg font-bold text-gray-900">
                                {formatCryptoAmount({ amount, currency: currency as any })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center">
                            <span className="text-2xl font-bold text-gray-300">0</span>
                            <p className="text-xs text-gray-400 mt-1">반려된 지출 없음</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <XCircleIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-1">
                        총 지출 요청
                      </p>
                      <div className="space-y-1">
                        {(() => {
                          const totalSums: { [currency: string]: number } = {};
                          
                          // 모든 지출 합산
                          [approvedSums, pendingSums, rejectedSums].forEach(sums => {
                            Object.entries(sums).forEach(([currency, amount]) => {
                              totalSums[currency] = (totalSums[currency] || 0) + amount;
                            });
                          });
                          
                          return Object.keys(totalSums).length > 0 ? (
                            Object.entries(totalSums).map(([currency, amount]) => (
                              <div key={currency} className="flex items-center space-x-2">
                                {getCryptoIcon(currency as any)}
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCryptoAmount({ amount, currency: currency as any })}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="text-center">
                              <span className="text-2xl font-bold text-gray-300">0</span>
                              <p className="text-xs text-gray-400 mt-1">지출 요청 없음</p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <ChartBarIcon className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 그룹별 예산 현황 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          그룹별 예산 현황
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockGroups.map((group) => {
            const monthlyUsage = getBudgetUsagePercentage(group);
            const quarterlyUsage = getQuarterlyBudgetUsagePercentage(group);
            const yearlyUsage = getYearlyBudgetUsagePercentage(group);
            
            return (
              <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">{group.name}</h4>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getTypeColor(
                      group.type
                    )}`}
                  >
                    {getTypeName(group.type)}
                  </span>
                </div>
                
                {/* 월간 예산 */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">월간 예산</span>
                    <span className="text-sm text-gray-500">
                      {formatCryptoAmount(group.budgetUsed)} / {formatCryptoAmount(group.monthlyBudget)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        monthlyUsage > 100 ? "bg-red-500" :
                        monthlyUsage > 80 ? "bg-orange-500" :
                        monthlyUsage > 60 ? "bg-yellow-500" :
                        "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(monthlyUsage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{monthlyUsage}% 사용</span>
                    {monthlyUsage > 100 && (
                      <span className="text-xs text-red-600 font-medium">예산 초과!</span>
                    )}
                  </div>
                </div>

                {/* 분기 예산 (있는 경우만) */}
                {group.quarterlyBudget.amount > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">분기 예산</span>
                      <span className="text-sm text-gray-500">
                        {formatCryptoAmount(group.quarterlyBudgetUsed)} / {formatCryptoAmount(group.quarterlyBudget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          quarterlyUsage > 100 ? "bg-red-500" :
                          quarterlyUsage > 80 ? "bg-orange-500" :
                          quarterlyUsage > 60 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(quarterlyUsage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{quarterlyUsage}% 사용</span>
                      {quarterlyUsage > 100 && (
                        <span className="text-xs text-red-600 font-medium">예산 초과!</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 연간 예산 (있는 경우만) */}
                {group.yearlyBudget.amount > 0 && (
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">연간 예산</span>
                      <span className="text-sm text-gray-500">
                        {formatCryptoAmount(group.yearlyBudgetUsed)} / {formatCryptoAmount(group.yearlyBudget)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          yearlyUsage > 100 ? "bg-red-500" :
                          yearlyUsage > 80 ? "bg-orange-500" :
                          yearlyUsage > 60 ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(yearlyUsage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{yearlyUsage}% 사용</span>
                      {yearlyUsage > 100 && (
                        <span className="text-xs text-red-600 font-medium">예산 초과!</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}